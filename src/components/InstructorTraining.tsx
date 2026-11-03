import { useState } from 'react';
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Upload, Pencil } from 'lucide-react';
import { instructorOptions, studentPerformance } from '@/lib/instructor';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { liberiaDate, liberiaDateTime } from '@/lib/time';
import { PageHeader, StatusBadge } from './AppShell';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Field, ReportActions, SelectField } from './Phase2Shared';
import { ATTENDANCE_STATUSES } from '@/lib/training';

export type InstructorView = 'courses' | 'materials' | 'plans' | 'schedule' | 'attendance' | 'exams' | 'performance';
const TITLES: Record<InstructorView, string> = { courses: 'Training Management', materials: 'Course Materials', plans: 'Lesson Plans', schedule: 'Training Schedule', attendance: 'Class Attendance', exams: 'Examination & Assessment', performance: 'Student Performance Records' };

export function InstructorTraining({ view }: { view: InstructorView }) {
  const { data: d } = useSuspenseQuery(instructorOptions);
  const { session, hasAny } = useAuth();
  const qc = useQueryClient();
  const [courseId, setCourseId] = useState('');
  const [date, setDate] = useState(liberiaDate());
  const [examId, setExamId] = useState('');
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<string | null | undefined>();
  const [busy, setBusy] = useState(false);
  const courses = d.courses.filter(c => !courseId || c.id === courseId);
  const roster = d.roster.filter(c => c.course_id === courseId && c.status === 'Active');
  const exams = d.exams.filter(e => !courseId || e.course_id === courseId);
  const exam = exams.find(e => e.id === examId);
  const courseName = (id: string) => d.courses.find(c => c.id === id)?.course_name ?? 'Course';
  const plan = d.plans.find(p => p.id === editing);
  const refresh = () => qc.invalidateQueries({ queryKey: ['instructor-training'] });
  async function run(action: () => PromiseLike<{ error: { message: string } | null }>) {
    if (busy) return;
    setBusy(true);
    try { const r = await action(); if (r.error) throw r.error; await refresh(); setEditing(undefined); setMarks({}); toast.success('Saved'); }
    catch (e) { toast.error((e as Error).message || 'Unable to save'); }
    finally { setBusy(false); }
  }
  function savePlan(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    const row = { course_id: String(f.get('course')), title: String(f.get('title')), objectives: String(f.get('objectives')), content: String(f.get('content')), lesson_date: String(f.get('date')) };
    void run(() => editing ? supabase.from('course_lesson_plans').update(row).eq('id', editing) : supabase.from('course_lesson_plans').insert(row));
  }
  async function upload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!session || busy) return;
    const f = new FormData(e.currentTarget); const file = f.get('file'); if (!(file instanceof File) || !file.size) return;
    if (file.size > 20 * 1024 * 1024) { toast.error('File must be 20 MB or smaller'); return; }
    const course = String(f.get('course')); const path = `${course}/${session.user.id}/${crypto.randomUUID()}/${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    void run(async () => { const r = await supabase.storage.from('training-materials').upload(path, file); if (r.error) return r; return supabase.from('course_materials').insert({ course_id: course, title: String(f.get('title')), file_path: path }); });
  }
  async function openFile(path: string) {
    const r = await supabase.storage.from('training-materials').createSignedUrl(path, 300);
    if (r.error) toast.error(r.error.message); else window.open(r.data.signedUrl, '_blank', 'noopener,noreferrer');
  }
  const performance = d.roster.filter(s => !courseId || s.course_id === courseId).map(s => {
    const attendance = d.attendance.filter(a => a.course_id === s.course_id && a.cadet_id === s.id);
    const ownExams = d.exams.filter(e => e.course_id === s.course_id);
    const results = d.results.filter(r => r.cadet_id === s.id && ownExams.some(e => e.id === r.assessment_id));
    const average = results.length ? Math.round(results.reduce((total, r) => total + studentPerformance(Number(r.score), Number(ownExams.find(e => e.id === r.assessment_id)?.max_score)), 0) / results.length) : null;
    return { Student: s.name, 'Cadet ID': s.cadet_number, Course: courseName(s.course_id), Attendance: attendance.length ? `${Math.round(attendance.filter(a => ['Present', 'Late'].includes(a.status)).length / attendance.length * 100)}%` : 'Not recorded', 'Average score': average === null ? 'Not recorded' : `${average}%`, Assessments: results.length };
  });
  const report = view === 'performance' ? performance : view === 'courses' ? courses.map(c => ({ Course: c.course_name, Code: c.course_code, Description: c.description })) : view === 'plans' ? d.plans.filter(p => !courseId || p.course_id === courseId).map(p => ({ Course: courseName(p.course_id), Title: p.title, Date: p.lesson_date, Objectives: p.objectives, Content: p.content })) : view === 'schedule' ? d.sessions.filter(s => !courseId || s.course_id === courseId).map(s => ({ Course: courseName(s.course_id), Title: s.title, Start: liberiaDateTime(s.starts_at), End: liberiaDateTime(s.ends_at), Location: s.location })) : view === 'attendance' ? d.attendance.filter(a => !courseId || a.course_id === courseId).map(a => ({ Course: courseName(a.course_id), Student: d.roster.find(s => s.id === a.cadet_id)?.name, Date: a.attendance_date, Status: a.status })) : exams.map(e => ({ Course: courseName(e.course_id), Subject: e.subject, Date: e.exam_date, Maximum: e.max_score }));
  const courseSelect = <SelectField label="Course" name="course" required defaultValue={plan?.course_id ?? courseId} options={d.courses.map(c => ({ value: c.id, label: c.course_name ?? 'Course' }))} />;
  return <div className="space-y-5">
    <PageHeader title={TITLES[view]} actions={<><ReportActions title={TITLES[view]} rows={report} />{(view === 'plans' || view === 'materials' || (view === 'schedule' && hasAny(['dc_academy']))) && <Button disabled={!d.courses.length} onClick={() => setEditing(null)}>{view === 'materials' ? <Upload className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{view === 'plans' ? 'New lesson plan' : view === 'materials' ? 'Upload material' : 'Schedule session'}</Button>}</>} />
    <div className="max-w-sm"><Label htmlFor="instructor-course">Course</Label><select id="instructor-course" className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={courseId} onChange={e => { setCourseId(e.target.value); setMarks({}); setExamId(''); }}><option value="">All assigned courses</option>{d.courses.map(c => <option key={c.id} value={c.id}>{c.course_name}</option>)}</select></div>
    {!d.courses.length && <p className="text-muted-foreground">No courses assigned.</p>}
    {view === 'courses' && <div className="divide-y">{courses.map(c => <article key={c.id} className="py-4"><h2 className="font-semibold">{c.course_name}</h2><p className="text-sm text-muted-foreground">{c.course_code} · {c.duration ? `${c.duration} weeks` : 'Duration not set'}</p><p className="text-sm mt-2">{c.description}</p></article>)}</div>}
    {view === 'plans' && <div className="divide-y">{d.plans.filter(p => !courseId || p.course_id === courseId).map(p => <article key={p.id} className="py-4 space-y-2"><div className="flex justify-between gap-3"><div><h2 className="font-semibold">{p.title}</h2><p className="text-xs text-muted-foreground">{courseName(p.course_id)} · {p.lesson_date}</p></div>{p.created_by === session?.user.id && <Button variant="outline" size="icon" aria-label={`Edit ${p.title}`} onClick={() => setEditing(p.id)}><Pencil className="h-4 w-4" /></Button>}</div><p className="text-sm whitespace-pre-wrap">{p.objectives}</p><p className="text-sm whitespace-pre-wrap">{p.content}</p></article>)}{!d.plans.length && <p>No lesson plans.</p>}</div>}
    {view === 'materials' && <div className="divide-y">{d.materials.filter(m => !courseId || m.course_id === courseId).map(m => <article key={m.id} className="py-4 flex justify-between gap-3"><div><h2 className="font-semibold">{m.title}</h2><p className="text-xs text-muted-foreground">{courseName(m.course_id)}</p></div><Button variant="outline" onClick={() => openFile(m.file_path)}>Open material</Button></article>)}{!d.materials.length && <p>No course materials.</p>}</div>}
    {view === 'schedule' && <div className="divide-y">{d.sessions.filter(s => !courseId || s.course_id === courseId).map(s => <article key={s.id} className="py-4"><h2 className="font-semibold">{s.title} · {courseName(s.course_id)}</h2><p className="text-sm">{liberiaDateTime(s.starts_at)} – {liberiaDateTime(s.ends_at)}</p><p className="text-sm text-muted-foreground">{s.location}</p></article>)}{!d.sessions.length && <p>No training sessions scheduled.</p>}</div>}
    {view === 'attendance' && <form onSubmit={e => { e.preventDefault(); void run(() => supabase.from('attendance_records').upsert(roster.map(s => ({ cadet_id: s.id, course_id: courseId, attendance_date: date, status: marks[s.id] ?? d.attendance.find(a => a.cadet_id === s.id && a.course_id === courseId && a.attendance_date === date)?.status ?? 'Present' })), { onConflict: 'cadet_id,course_id,attendance_date' })); }} className="space-y-4"><div className="max-w-xs"><Label htmlFor="register-date">Date</Label><Input id="register-date" type="date" value={date} onChange={e => { setDate(e.target.value); setMarks({}); }} required /></div><Table><TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{roster.map(s => <TableRow key={s.id}><TableCell>{s.name}<div className="text-xs text-muted-foreground">{s.cadet_number}</div></TableCell><TableCell><select aria-label={`Attendance for ${s.name}`} className="border rounded-md bg-background h-9 px-2" value={marks[s.id] ?? d.attendance.find(a => a.cadet_id === s.id && a.course_id === courseId && a.attendance_date === date)?.status ?? 'Present'} onChange={e => setMarks(m => ({ ...m, [s.id]: e.target.value }))}>{ATTENDANCE_STATUSES.map(v => <option key={v}>{v}</option>)}</select></TableCell></TableRow>)}</TableBody></Table><Button disabled={busy || !courseId || !roster.length}>Save attendance</Button></form>}
    {view === 'exams' && <div className="space-y-4"><div className="divide-y">{exams.map(e => <article key={e.id} className="py-3 flex justify-between gap-3"><div><h2 className="font-semibold">{e.subject}</h2><p className="text-sm text-muted-foreground">{courseName(e.course_id)} · {e.exam_date} · maximum {e.max_score}</p></div><StatusBadge value={e.results_published ? 'Published' : 'Pending'} /></article>)}</div><Label htmlFor="instructor-exam">Examination</Label><select id="instructor-exam" className="w-full h-9 border rounded-md bg-background px-2" value={examId} onChange={e => { setExamId(e.target.value); setMarks({}); }}><option value="">Select examination</option>{exams.map(e => <option key={e.id} value={e.id}>{e.subject} · {e.exam_date}</option>)}</select>{exam && <form onSubmit={e => { e.preventDefault(); void run(() => supabase.from('assessment_results').upsert(d.roster.filter(s => s.course_id === exam.course_id && s.status === 'Active').filter(s => (marks[s.id] ?? d.results.find(r => r.cadet_id === s.id && r.assessment_id === examId)?.score?.toString() ?? '') !== '').map(s => ({ cadet_id: s.id, assessment_id: examId, score: Number(marks[s.id] ?? d.results.find(r => r.cadet_id === s.id && r.assessment_id === examId)?.score) })), { onConflict: 'assessment_id,cadet_id' })); }} className="space-y-3">{d.roster.filter(s => s.course_id === exam.course_id && s.status === 'Active').map(s => <div key={s.id} className="grid grid-cols-2 items-center gap-3"><Label htmlFor={`score-${s.id}`}>{s.name}</Label><Input id={`score-${s.id}`} type="number" min="0" max={Number(exam.max_score)} step="0.01" disabled={exam.results_published} value={marks[s.id] ?? d.results.find(r => r.cadet_id === s.id && r.assessment_id === examId)?.score?.toString() ?? ''} onChange={e => setMarks(m => ({ ...m, [s.id]: e.target.value }))} /></div>)}<Button disabled={busy || exam.results_published}>Save scores</Button></form>}</div>}
    {view === 'performance' && <Table><TableHeader><TableRow>{['Student', 'Course', 'Attendance', 'Average score', 'Assessments'].map(h => <TableHead key={h}>{h}</TableHead>)}</TableRow></TableHeader><TableBody>{performance.map((r, i) => <TableRow key={i}><TableCell>{r.Student}</TableCell><TableCell>{r.Course}</TableCell><TableCell>{r.Attendance}</TableCell><TableCell>{r['Average score']}</TableCell><TableCell>{r.Assessments}</TableCell></TableRow>)}</TableBody></Table>}
    <Dialog open={editing !== undefined} onOpenChange={o => { if (!o && !busy) setEditing(undefined); }}><DialogContent className="max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>{view === 'plans' ? 'Lesson plan' : view === 'materials' ? 'Upload course material' : 'Schedule session'}</DialogTitle></DialogHeader>{view === 'plans' ? <form onSubmit={savePlan} className="space-y-3">{courseSelect}<Field label="Title" name="title" required defaultValue={plan?.title} /><Field label="Lesson date" name="date" type="date" required defaultValue={plan?.lesson_date ?? liberiaDate()} /><div><Label htmlFor="objectives">Objectives</Label><Textarea id="objectives" name="objectives" required defaultValue={plan?.objectives} /></div><div><Label htmlFor="content">Lesson content</Label><Textarea id="content" name="content" required defaultValue={plan?.content} rows={6} /></div><Button disabled={busy}>Save lesson plan</Button></form> : view === 'materials' ? <form onSubmit={upload} className="space-y-3">{courseSelect}<Field label="Title" name="title" required /><div><Label htmlFor="training-file">File</Label><Input id="training-file" name="file" type="file" required /></div><Button disabled={busy}>Upload material</Button></form> : <form onSubmit={e => { e.preventDefault(); const f = new FormData(e.currentTarget); void run(() => supabase.from('course_sessions').insert({ course_id: String(f.get('course')), title: String(f.get('title')), location: String(f.get('location')), starts_at: `${f.get('start')}:00+00:00`, ends_at: `${f.get('end')}:00+00:00` })); }} className="space-y-3">{courseSelect}<Field label="Title" name="title" required /><Field label="Start (Liberia time)" name="start" type="datetime-local" required /><Field label="End (Liberia time)" name="end" type="datetime-local" required /><Field label="Location" name="location" required /><Button disabled={busy}>Save session</Button></form>}</DialogContent></Dialog>
  </div>;
}