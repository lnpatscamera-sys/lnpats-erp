import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { instructorOptions, studentPerformance } from '@/lib/instructor';
import { personalOptions } from '@/lib/personal-data';
import { useAuth } from '@/lib/auth';
import { liberiaDate, liberiaDateTime } from '@/lib/time';
import { PageHeader, StatusBadge } from './AppShell';
import { Button } from './ui/button';
export function InstructorDashboard() {
  const { session } = useAuth();
  const training = useQuery(instructorOptions);
  const personal = useQuery(personalOptions(session?.user.id ?? ''));
  const mail = useQuery({ queryKey: ['instructor-mail', session?.user.id], queryFn: async () => { const { supabase } = await import('@/integrations/supabase/client'); const r = await supabase.from('mail_accounts').select('email').eq('user_id', session?.user.id ?? '').maybeSingle(); if (r.error) throw r.error; return r.data; } });
  if (training.error || personal.error) return <p role="alert">Your Instructor workspace could not be loaded.</p>;
  if (!training.data || !personal.data) return <p>Loading Instructor workspace…</p>;
  const d = training.data; const p = personal.data;
  const upcoming = d.sessions.filter(s => s.starts_at.slice(0, 10) >= liberiaDate());
  const scores = d.results.map(r => studentPerformance(Number(r.score), Number(d.exams.find(e => e.id === r.assessment_id)?.max_score)));
  const equipment = p.supplies.filter(s => /equipment|asset/i.test(s.item_name));
  const supply = p.supplies.filter(s => !equipment.includes(s));
  const metrics = [['Assigned courses', d.courses.length], ['Upcoming training sessions', upcoming.length], ['Class attendance recorded', d.attendance.length], ['Upcoming examinations', d.exams.filter(e => e.exam_date >= liberiaDate()).length], ['Student performance average', scores.length ? `${Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)}%` : 'Not recorded'], ['Equipment requests', equipment.length], ['Supply requests', supply.length], ['Unread notifications', p.notifications.filter(n => !n.read).length]] as const;
  return <div className="space-y-6"><PageHeader title="Instructor Dashboard" subtitle={p.profile?.full_name ?? ''} actions={<Button asChild><Link to="/training">Assigned courses</Link></Button>} /><div className="grid grid-cols-2 lg:grid-cols-4 gap-5 border-y py-5">{metrics.map(([label, value]) => <div key={label}><p className="text-xs text-muted-foreground">{label}</p><strong className="block text-xl mt-1">{value}</strong></div>)}</div><section><h2 className="font-semibold mb-3">Upcoming training sessions</h2>{!upcoming.length && <p className="text-sm text-muted-foreground">No upcoming sessions.</p>}{upcoming.slice(0, 5).map(s => <div key={s.id} className="border-b py-3"><h3 className="font-medium">{s.title}</h3><p className="text-sm text-muted-foreground">{liberiaDateTime(s.starts_at)} · {s.location}</p></div>)}</section><section className="border-y py-4 grid sm:grid-cols-2 gap-4"><div><h2 className="font-semibold">Daily Report Status</h2>{p.reports[0] ? <p className="text-sm mt-2">{p.reports[0].report_date} · <StatusBadge value={p.reports[0].status} /></p> : <p className="text-sm text-muted-foreground">No report submitted.</p>}</div><div><h2 className="font-semibold">Official Mail Summary</h2><p className="text-sm text-muted-foreground">{mail.error ? 'Mail connection unavailable' : mail.data?.email ?? 'Mailbox not connected'}</p><Button asChild variant="link"><Link to="/mail">Open inbox</Link></Button></div></section><div className="flex flex-wrap gap-2">{([['/course-materials', 'Course Materials'], ['/lesson-plans', 'Lesson Plans'], ['/training-schedule', 'Training Schedule'], ['/class-attendance', 'Class Attendance'], ['/examinations', 'Examination & Assessment'], ['/student-performance', 'Student Performance'], ['/command', 'Daily Report'], ['/notifications', 'Notifications'], ['/equipment-request', 'Equipment Request'], ['/supplies', 'Supply Request']] as const).map(([to, label]) => <Button key={to} asChild variant="outline"><Link to={to}>{label}</Link></Button>)}</div><section><h2 className="font-semibold">Notifications</h2>{p.notifications.slice(0, 5).map(n => <div key={n.id} className="border-b py-3 text-sm"><strong>{n.title}</strong><p className="text-muted-foreground">{n.body}</p></div>)}</section></div>;
}