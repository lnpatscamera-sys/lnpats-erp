CREATE OR REPLACE FUNCTION public.hr_assign_section_head(_section uuid, _head uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NOT (public.hr_staff() OR public.has_role(auth.uid(),'system_admin')) THEN RAISE EXCEPTION 'HR permission required'; END IF;
  IF NOT EXISTS(SELECT 1 FROM sections WHERE id=_section) THEN RAISE EXCEPTION 'Section not found'; END IF;
  IF _head IS NOT NULL AND NOT EXISTS(
    SELECT 1 FROM officers e JOIN user_roles r ON r.user_id=e.user_id
    WHERE e.id=_head AND e.employment_status='Active' AND e.user_id IS NOT NULL
      AND r.role IN ('section_head','chief_instructor','assistant_commissioner','deputy_commandant','dc_admin','dc_academy','commandant','system_admin')) THEN
    RAISE EXCEPTION 'Section Head must be active, have an ERP login, and hold a Section Head, Chief Instructor, Department Head, Deputy Commandant or Commandant role';
  END IF;
  UPDATE sections SET section_head=_head WHERE id=_section;
END $$;
REVOKE ALL ON FUNCTION public.hr_assign_section_head(uuid,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.hr_assign_section_head(uuid,uuid) TO authenticated;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid='public.sections'::regclass AND tgname LIKE '%audit%') THEN
  CREATE TRIGGER audit_sections AFTER INSERT OR UPDATE OR DELETE ON public.sections FOR EACH ROW EXECUTE FUNCTION public.audit_trigger(); END IF; END $$;