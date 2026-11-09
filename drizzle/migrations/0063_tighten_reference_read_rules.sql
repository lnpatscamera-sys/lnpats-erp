-- Replace "everyone signed in" read rules with real membership/role checks.
CREATE OR REPLACE FUNCTION public.erp_member()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid())
$$;

CREATE OR REPLACE FUNCTION public.training_reader()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_any_role(auth.uid(), ARRAY['dc_academy','chief_instructor','section_head','commandant','deputy_commandant','dc_admin','hr_officer','hr_admin']::public.app_role[])
$$;

CREATE OR REPLACE FUNCTION public.branding_file_reader(_name text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'system_admin')
      OR (public.erp_member() AND EXISTS (SELECT 1 FROM public.report_branding WHERE letterhead_path = _name))
$$;

REVOKE ALL ON FUNCTION public.erp_member() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.training_reader() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.branding_file_reader(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.erp_member() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.training_reader() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.branding_file_reader(text) TO authenticated, service_role;

-- Shared organisation and logistics reference data: enrolled ERP staff only.
DROP POLICY IF EXISTS "read offices" ON public.offices;
CREATE POLICY "read offices" ON public.offices FOR SELECT TO authenticated USING (public.erp_member());
DROP POLICY IF EXISTS "read sections" ON public.sections;
CREATE POLICY "read sections" ON public.sections FOR SELECT TO authenticated USING (public.erp_member());
DROP POLICY IF EXISTS "staff read units" ON public.establishment_units;
CREATE POLICY "staff read units" ON public.establishment_units FOR SELECT TO authenticated USING (public.erp_member());
DROP POLICY IF EXISTS "staff read posts" ON public.establishment_posts;
CREATE POLICY "staff read posts" ON public.establishment_posts FOR SELECT TO authenticated USING (public.erp_member());
DROP POLICY IF EXISTS "appointment_read" ON public.reporting_lines;
CREATE POLICY "appointment_read" ON public.reporting_lines FOR SELECT TO authenticated USING (public.erp_member());
DROP POLICY IF EXISTS "report_branding_read" ON public.report_branding;
CREATE POLICY "report_branding_read" ON public.report_branding FOR SELECT TO authenticated USING (public.erp_member());
DROP POLICY IF EXISTS "warehouse_read" ON public.warehouses;
CREATE POLICY "warehouse_read" ON public.warehouses FOR SELECT TO authenticated USING (public.erp_member());
DROP POLICY IF EXISTS "warehouse_stock_read" ON public.warehouse_stock;
CREATE POLICY "warehouse_stock_read" ON public.warehouse_stock FOR SELECT TO authenticated USING (public.erp_member());
DROP POLICY IF EXISTS "read inv" ON public.inventory_items;
CREATE POLICY "read inv" ON public.inventory_items FOR SELECT TO authenticated USING (public.erp_member());
DROP POLICY IF EXISTS "signed-in users view programs" ON public.training_programs;
CREATE POLICY "signed-in users view programs" ON public.training_programs FOR SELECT TO authenticated USING (public.erp_member());
DROP POLICY IF EXISTS "signed-in users view courses" ON public.courses;
CREATE POLICY "signed-in users view courses" ON public.courses FOR SELECT TO authenticated USING (public.erp_member());

-- Profiles hold account emails: own row, or HR / ICT administrators.
DROP POLICY IF EXISTS "read profiles" ON public.profiles;
CREATE POLICY "read profiles" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_any_role(auth.uid(), ARRAY['hr_officer','hr_admin','ict_admin']::public.app_role[]));

-- Cadet and academic records: training leadership and HR only (instructors keep their assigned-course rules).
DROP POLICY IF EXISTS "signed-in users view cadets" ON public.cadets;
CREATE POLICY "signed-in users view cadets" ON public.cadets FOR SELECT TO authenticated USING (public.training_reader() OR user_id = auth.uid());
DROP POLICY IF EXISTS "signed-in users view enrollments" ON public.program_enrollments;
CREATE POLICY "signed-in users view enrollments" ON public.program_enrollments FOR SELECT TO authenticated
  USING (public.training_reader() OR EXISTS (SELECT 1 FROM public.cadets c WHERE c.id = program_enrollments.cadet_id AND c.user_id = auth.uid()));
DROP POLICY IF EXISTS "signed-in users view attendance" ON public.attendance_records;
CREATE POLICY "signed-in users view attendance" ON public.attendance_records FOR SELECT TO authenticated
  USING (public.training_reader() OR EXISTS (SELECT 1 FROM public.cadets c WHERE c.id = attendance_records.cadet_id AND c.user_id = auth.uid()));
DROP POLICY IF EXISTS "signed-in users view results" ON public.assessment_results;
CREATE POLICY "signed-in users view results" ON public.assessment_results FOR SELECT TO authenticated
  USING (public.training_reader() OR EXISTS (SELECT 1 FROM public.cadets c WHERE c.id = assessment_results.cadet_id AND c.user_id = auth.uid()));
DROP POLICY IF EXISTS "signed-in users view graduations" ON public.graduations;
CREATE POLICY "signed-in users view graduations" ON public.graduations FOR SELECT TO authenticated
  USING (public.training_reader() OR EXISTS (SELECT 1 FROM public.cadets c WHERE c.id = graduations.cadet_id AND c.user_id = auth.uid()));
DROP POLICY IF EXISTS "signed-in users view certificates" ON public.certificates;
CREATE POLICY "signed-in users view certificates" ON public.certificates FOR SELECT TO authenticated
  USING (public.training_reader() OR EXISTS (SELECT 1 FROM public.cadets c WHERE c.id = certificates.cadet_id AND c.user_id = auth.uid()));
DROP POLICY IF EXISTS "signed-in users view assessments" ON public.assessments;
CREATE POLICY "signed-in users view assessments" ON public.assessments FOR SELECT TO authenticated USING (public.training_reader());
DROP POLICY IF EXISTS "signed-in users view instructors" ON public.instructors;
CREATE POLICY "signed-in users view instructors" ON public.instructors FOR SELECT TO authenticated USING (public.training_reader());

-- Letterhead files: only the active letterhead, for enrolled staff; admins see all branding uploads.
DROP POLICY IF EXISTS "branding_files_read" ON storage.objects;
CREATE POLICY "branding_files_read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'branding' AND public.branding_file_reader(name));