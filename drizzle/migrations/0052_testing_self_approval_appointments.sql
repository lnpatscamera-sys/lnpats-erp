create or replace function public.decide_appointment(_id uuid, _approve boolean, _note text)
returns void language plpgsql security definer set search_path=public as $$
declare r appointment_requests; o officers; p establishment_posts; filled int;
begin
  if not public.has_any_role(auth.uid(), array['commandant']::app_role[]) then raise exception 'Only the Commandant can decide appointments'; end if;
  select * into r from appointment_requests where id=_id for update;
  if r.id is null or r.status<>'pending' then raise exception 'Appointment is not pending'; end if;
  -- TESTING EXCEPTION (pre-launch): System Administrators may decide appointments they staged. Remove at launch.
  if r.requested_by = auth.uid() and not public.has_role(auth.uid(),'system_admin') then raise exception 'You cannot approve an appointment you staged'; end if;
  if _approve then
    select * into o from officers where id=r.officer_id for update;
    select * into p from establishment_posts where id=r.post_id;
    select count(*) into filled from officers where establishment_post_id=p.id and id<>o.id;
    if filled >= p.authorized then raise exception 'Post % is already fully filled', p.title; end if;
    if array_length(r.roles,1) > 0 and o.user_id is null then raise exception 'Link this officer to a staff account before granting system roles'; end if;
    update officers set establishment_post_id=p.id, position=p.title where id=o.id;
    if o.user_id is not null then insert into user_roles(user_id,role) select o.user_id, x from unnest(r.roles) x on conflict do nothing; end if;
  end if;
  update appointment_requests set status=case when _approve then 'approved' else 'rejected' end, decided_by=auth.uid(), decided_at=now(), decision_note=nullif(trim(_note),'') where id=_id;
end $$;