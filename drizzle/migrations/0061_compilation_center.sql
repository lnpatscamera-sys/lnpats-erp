ALTER TABLE public.compiled_reports ADD COLUMN IF NOT EXISTS remarks text, ADD COLUMN IF NOT EXISTS summary text, ADD COLUMN IF NOT EXISTS statistics jsonb, ADD COLUMN IF NOT EXISTS signed_at timestamptz;
CREATE SEQUENCE public.compilation_daily_seq;
CREATE FUNCTION public.next_compilation_reference() RETURNS text LANGUAGE sql VOLATILE SET search_path=public AS $$ SELECT 'LNPATS-DR-'||to_char(now() AT TIME ZONE 'Africa/Monrovia','YYYYMMDD')||'-'||lpad(nextval('public.compilation_daily_seq')::text,3,'0') $$;
ALTER TABLE public.compiled_reports ALTER COLUMN report_number SET DEFAULT public.next_compilation_reference();
CREATE OR REPLACE FUNCTION public.compile_daily_reports(_payload jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE ids uuid[]; snaps jsonb; r daily_reports; recipient uuid; count_ids integer; rid uuid; ev jsonb;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
 IF public.officer_personal_only() THEN RAISE EXCEPTION 'Access Denied'; END IF;
 SELECT array_agg(value::uuid) INTO ids FROM jsonb_array_elements_text(_payload->'source_ids');
 IF coalesce(cardinality(ids),0)=0 THEN RAISE EXCEPTION 'Unable to compile. No reports available or reporting chain not configured.'; END IF;
 SELECT count(DISTINCT x) INTO count_ids FROM unnest(ids) x;
 IF count_ids<>cardinality(ids) THEN RAISE EXCEPTION 'Duplicate sources'; END IF;
 IF nullif(trim(_payload->>'title'),'') IS NULL OR nullif(trim(_payload->>'signature'),'') IS NULL THEN RAISE EXCEPTION 'Title and signature required'; END IF;
 SELECT count(*) INTO count_ids FROM daily_reports WHERE id=ANY(ids);
 IF count_ids<>cardinality(ids) THEN RAISE EXCEPTION 'Unable to compile. No reports available or reporting chain not configured.'; END IF;
 SELECT * INTO r FROM daily_reports WHERE id=ids[1];
 IF coalesce(jsonb_array_length(r.chain),0)=0 THEN RAISE EXCEPTION 'Unable to compile. No reports available or reporting chain not configured.'; END IF;
 IF public.has_any_role(auth.uid(),ARRAY['commandant']::app_role[]) THEN recipient:=auth.uid();
 ELSIF public.has_any_role(auth.uid(),ARRAY['deputy_commandant']::app_role[]) THEN recipient:=(r.chain->(jsonb_array_length(r.chain)-1)->>'user_id')::uuid;
 ELSE SELECT (a->>'user_id')::uuid INTO recipient FROM jsonb_array_elements(r.chain) WITH ORDINALITY c(a,n) WHERE n>(SELECT min(n2) FROM jsonb_array_elements(r.chain) WITH ORDINALITY c2(a2,n2) WHERE a2->>'user_id'=auth.uid()::text) ORDER BY n LIMIT 1; END IF;
 IF recipient IS NULL THEN RAISE EXCEPTION 'Upward recipient not assigned'; END IF;
 SELECT jsonb_agg(to_jsonb(d)) INTO snaps FROM daily_reports d WHERE id=ANY(ids);
 ev:=jsonb_build_array(jsonb_build_object('action','compiled','actor_id',auth.uid(),'at',now()));
 INSERT INTO compiled_reports(created_by,title,period,start_date,end_date,source_ids,source_snapshots,comments,signature,recipient_id,history,remarks,summary,statistics,signed_at)
 VALUES(auth.uid(),_payload->>'title',_payload->>'period',(_payload->>'start_date')::date,(_payload->>'end_date')::date,ids,snaps,_payload->>'comments',_payload->>'signature',recipient,ev,nullif(trim(_payload->>'remarks'),''),nullif(trim(_payload->>'summary'),''),_payload->'statistics',now()) RETURNING id INTO rid;
 PERFORM command_notify(recipient,'A compiled daily report package has been submitted for your review.',_payload->>'title',rid::text||':submitted');
 INSERT INTO notifications(user_id,title,body,event_key) SELECT d.created_by,'Report included in compiled package','Your report has been included in the compiled submission package.',rid::text||':included:'||d.id::text FROM daily_reports d WHERE d.id=ANY(ids) AND d.created_by<>auth.uid() ON CONFLICT(user_id,event_key) WHERE event_key IS NOT NULL AND user_id IS NOT NULL DO NOTHING;
 RETURN rid;
END $$;
REVOKE ALL ON FUNCTION public.compile_daily_reports(jsonb) FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.compile_daily_reports(jsonb) TO authenticated;
CREATE FUNCTION public.compilation_action(_id uuid,_action text,_payload jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE c compiled_reports; recipient uuid; note text; stamp text;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
 IF public.officer_personal_only() THEN RAISE EXCEPTION 'Access Denied'; END IF;
 SELECT * INTO c FROM compiled_reports WHERE id=_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'Compilation not found'; END IF;
 IF _action NOT IN ('approve','return','clarify','forward') THEN RAISE EXCEPTION 'Unknown action'; END IF;
 IF c.recipient_id<>auth.uid() AND NOT public.has_any_role(auth.uid(),ARRAY['commandant','deputy_commandant']::app_role[]) THEN RAISE EXCEPTION 'Only the assigned reviewer can act on this package'; END IF;
 note:=nullif(trim(_payload->>'note'),'');
 IF _action IN ('return','clarify') AND note IS NULL THEN RAISE EXCEPTION 'Reason required'; END IF;
 stamp:=_id::text||':'||_action||':'||extract(epoch from now())::bigint;
 IF _action='approve' THEN
   UPDATE compiled_reports SET status='Approved',history=history||jsonb_build_object('action','approved','actor_id',auth.uid(),'at',now(),'note',note) WHERE id=_id;
   PERFORM command_notify(c.created_by,'Compiled report approved',c.report_number,stamp);
 ELSIF _action='return' THEN
   UPDATE compiled_reports SET status='Returned',history=history||jsonb_build_object('action','returned','actor_id',auth.uid(),'at',now(),'note',note) WHERE id=_id;
   PERFORM command_notify(c.created_by,'Compiled report returned for correction',c.report_number||' — '||note,stamp);
 ELSIF _action='clarify' THEN
   UPDATE compiled_reports SET status='Clarification Requested',history=history||jsonb_build_object('action','clarification requested','actor_id',auth.uid(),'at',now(),'note',note) WHERE id=_id;
   PERFORM command_notify(c.created_by,'Clarification requested on compiled report',c.report_number||' — '||note,stamp);
 ELSE
   SELECT (a->>'user_id')::uuid INTO recipient FROM jsonb_array_elements(c.source_snapshots->0->'chain') WITH ORDINALITY x(a,n)
   WHERE n>(SELECT min(n2) FROM jsonb_array_elements(c.source_snapshots->0->'chain') WITH ORDINALITY x2(a2,n2) WHERE a2->>'user_id'=auth.uid()::text) ORDER BY n LIMIT 1;
   IF recipient IS NULL AND public.has_role(auth.uid(),'deputy_commandant') THEN recipient:=(c.source_snapshots->0->'chain'->(jsonb_array_length(c.source_snapshots->0->'chain')-1)->>'user_id')::uuid; END IF;
   IF recipient IS NULL OR recipient=auth.uid() THEN RAISE EXCEPTION 'Already at the top of the reporting chain'; END IF;
   UPDATE compiled_reports SET status='Forwarded',recipient_id=recipient,history=history||jsonb_build_object('action','forwarded','actor_id',auth.uid(),'at',now(),'note',note) WHERE id=_id;
   PERFORM command_notify(recipient,'A compiled daily report package has been submitted for your review.',c.report_number,stamp);
 END IF;
END $$;
REVOKE ALL ON FUNCTION public.compilation_action(uuid,text,jsonb) FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.compilation_action(uuid,text,jsonb) TO authenticated;