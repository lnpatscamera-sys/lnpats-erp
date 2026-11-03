import { queryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
export type RosterStudent = { id: string; name: string; cadet_number: string; course_id: string; status: string };
export const instructorOptions = queryOptions({ queryKey: ['instructor-training'], queryFn: async () => {
  const responses = await Promise.all([
    supabase.from('courses').select('*').order('course_name'),
    supabase.rpc('instructor_roster'),
    supabase.from('course_lesson_plans').select('*').order('lesson_date'),
    supabase.from('course_materials').select('*').order('created_at', { ascending: false }),
    supabase.from('course_sessions').select('*').order('starts_at'),
    supabase.from('attendance_records').select('*').order('attendance_date', { ascending: false }),
    supabase.from('assessments').select('*').order('exam_date'),
    supabase.from('assessment_results').select('*'),
  ]);
  for (const r of responses) if (r.error) throw r.error;
  const [courses, roster, plans, materials, sessions, attendance, exams, results] = responses;
  return { courses: courses.data ?? [], roster: (roster.data ?? []) as unknown as RosterStudent[], plans: plans.data ?? [], materials: materials.data ?? [], sessions: sessions.data ?? [], attendance: attendance.data ?? [], exams: exams.data ?? [], results: results.data ?? [] };
} });
export function studentPerformance(score: number, maximum: number) { return maximum > 0 ? Math.round(score / maximum * 100) : 0; }