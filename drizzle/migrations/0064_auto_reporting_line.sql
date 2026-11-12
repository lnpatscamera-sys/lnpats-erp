CREATE OR REPLACE FUNCTION public.sync_officer_reporting_line() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE s sections; head uuid;
BEGIN
  IF NEW.section_id IS NULL THEN RETURN NEW; END IF;
  IF TG_OP='UPDATE' AND NEW.section_id IS NOT DISTINCT FROM OLD.section_id THEN RETURN NEW; END IF;
  SELECT * INTO s FROM sections WHERE id=NEW.section_id;
  IF s.office_id IS NOT NULL THEN NEW.office_id:=s.office_id; END IF;
  head:=s.section_head;
  IF head IS NULL OR head=NEW.id THEN
    head:=(SELECT officer_id FROM reporting_lines WHERE kind='Department Head' AND office_id=NEW.office_id);
  END IF;
  IF head IS NOT NULL AND head<>NEW.id THEN NEW.supervisor_id:=head; END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS sync_officer_reporting_line ON public.officers;
CREATE TRIGGER sync_officer_reporting_line BEFORE INSERT OR UPDATE OF section_id ON public.officers FOR EACH ROW EXECUTE FUNCTION public.sync_officer_reporting_line();

CREATE OR REPLACE FUNCTION public.sync_section_head_supervisors() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NEW.section_head IS DISTINCT FROM OLD.section_head AND NEW.section_head IS NOT NULL THEN
    UPDATE officers SET supervisor_id=NEW.section_head
     WHERE section_id=NEW.id AND id<>NEW.section_head
       AND (supervisor_id IS NULL OR supervisor_id IS NOT DISTINCT FROM OLD.section_head);
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS sync_section_head_supervisors ON public.sections;
CREATE TRIGGER sync_section_head_supervisors AFTER UPDATE OF section_head ON public.sections FOR EACH ROW EXECUTE FUNCTION public.sync_section_head_supervisors();
REVOKE ALL ON FUNCTION public.sync_officer_reporting_line() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.sync_section_head_supervisors() FROM PUBLIC,anon,authenticated;