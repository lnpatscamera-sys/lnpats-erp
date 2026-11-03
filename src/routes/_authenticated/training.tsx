import { createFileRoute } from "@tanstack/react-router";
import { InstructorTraining } from '@/components/InstructorTraining';
import { isInstructorWorkspace } from '@/lib/officer-access';
import { instructorOptions } from '@/lib/instructor';
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { GraduationCap, Pencil, Plus, Award, UserPlus, BookOpen, ClipboardCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, StatusBadge } from "@/components/AppShell";
import { Field, MetricBand, ReportActions, SelectField } from "@/components/Phase2Shared";
import { formValues } from "@/lib/export";
import { useAuth } from "@/lib/auth";
import { liberiaDate } from '@/lib/time';
import {
  ASSESSMENT_TYPES, ATTENDANCE_STATUSES, CADET_STATUSES, GRADUATION_ROLES, INSTRUCTOR_ROLES, PROGRAM_NAMES, TRAINING_ADMIN_ROLES,
  attendanceRate, cadetAverage, cadetName, excessiveAbsences, graduationEligible, refreshTraining, trainingOptions,
  type Assessment, type Cadet, type Course, type Instructor, type TrainingProgram,
} from "@/lib/training";

export const Route = createFileRoute("/_authenticated/training")({
  head: () => ({ meta: [{ title: "Training Management — LNPATS ERP" }, { name: "description", content: "LNPATS training management: cadets, programs, courses, attendance, assessments, graduation and certificates." }, { property: "og:title", content: "Training Management — LNPATS ERP" }, { property: "og:description", content: "LNPATS training management: cadets, programs, courses, attendance, assessments, graduation and certificates." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  loader: async ({ context }) => { const r = await supabase.auth.getUser(); const roles = await supabase.from('user_roles').select('role').eq('user_id', r.data.user?.id ?? ''); if (isInstructorWorkspace((roles.data ?? []).map(x => x.role))) await context.queryClient.ensureQueryData(instructorOptions); else await context.queryClient.ensureQueryData(trainingOptions); },
  component: Training,
});

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
const today = () => liberiaDate();

function Training() {
  const { roles } = useAuth();
  return isInstructorWorkspace(roles) ? <InstructorTraining view="courses" /> : <TrainingAdministration />;
}
function TrainingAdministration() {
  const { hasAny } = useAuth();
  const { data } = useSuspenseQuery(trainingOptions);
  const [tab, setTab] = useState("dashboard");
  const canAdmin = hasAny(TRAINING_ADMIN_ROLES);
  const canInstruct = hasAny(INSTRUCTOR_ROLES);
  const canGraduate = hasAny(GRADUATION_ROLES);
  return (
    <div>
      <PageHeader title="Training Management" subtitle="Cadets, programs, attendance, assessments, graduation and certification" />
      <Tabs value={tab} onValueChange={setTab} className="mb-6 max-w-full overflow-x-auto">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="cadets">Cadets</TabsTrigger>
          <TabsTrigger value="programs">Programs & Courses</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="graduation">Graduation</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="instructors">Instructors</TabsTrigger>
        </TabsList>
      </Tabs>
      {tab === "dashboard" && <DashboardTab />}
      {tab === "cadets" && <CadetsTab canAdmin={canAdmin} canGraduate={canGraduate} />}
      {tab === "programs" && <ProgramsTab canAdmin={canAdmin} />}
      {tab === "attendance" && <AttendanceTab canInstruct={canInstruct} />}
      {tab === "assessments" && <AssessmentsTab canAdmin={canAdmin} canInstruct={canInstruct} />}
      {tab === "graduation" && <GraduationTab canGraduate={canGraduate} />}
      {tab === "certificates" && <CertificatesTab />}
      {tab === "instructors" && <InstructorsTab canAdmin={canAdmin} />}
      <span className="hidden">{data.cadets.length}</span>
    </div>
  );
}

function DashboardTab() {
  const { data } = useSuspenseQuery(trainingOptions);
  const active = data.programs.filter((p) => p.status === "Active");
  const graduated = data.cadets.filter((c) => c.status === "Graduated");
  const upcoming = data.assessments.filter((a) => a.exam_date >= today() && !a.results_published);
  const attended = data.attendance.filter((a) => a.status === "Present" || a.status === "Late").length;
  const attendanceChart = [
    { name: "Attended", value: attended },
    { name: "Absent / Excused", value: data.attendance.length - attended },
  ].filter((x) => x.value > 0);
  const enrollmentChart = data.programs.map((p) => ({ name: (p.title ?? "").split(" ").slice(0, 2).join(" "), cadets: data.enrollments.filter((e) => e.program_id === p.id && e.status === "Active").length }));
  const graduationChart = ["Approved", "Deferred", "Re-assessment"].map((d) => ({ name: d, value: data.graduations.filter((g) => g.decision === d).length }));
  const performanceChart = ASSESSMENT_TYPES.map((t) => {
    const ids = data.assessments.filter((a) => a.assessment_type === t).map((a) => a.id);
    const rs = data.results.filter((r) => ids.includes(r.assessment_id));
    const avg = rs.length ? Math.round(rs.reduce((s, r) => s + (Number(r.score) / Number(data.assessments.find((a) => a.id === r.assessment_id)?.max_score || 100)) * 100, 0) / rs.length) : 0;
    return { name: t.split(" ")[0], avg };
  }).filter((x) => x.avg > 0);
  return (
    <div>
      <MetricBand items={[
        { label: "Total cadets", value: data.cadets.length },
        { label: "Active programs", value: active.length },
        { label: "Instructors", value: data.instructors.length },
        { label: "Ongoing courses", value: data.courses.length },
        { label: "Graduated cadets", value: graduated.length },
        { label: "Upcoming examinations", value: upcoming.length },
        { label: "Certificates issued", value: data.certificates.length },
      ]} />
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-semibold mb-2">Cadet attendance rate</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={attendanceChart.length ? attendanceChart : [{ name: "No records", value: 1 }]} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} label={({ name }) => name} fontSize={11}>
                  {(attendanceChart.length ? attendanceChart : [{}]).map((_, i) => <Cell key={i} fill={COLORS[i % 5]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground text-center">Overall rate: {attendanceRate(data.attendance)}%</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-semibold mb-2">Program enrollment</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={enrollmentChart}>
                <XAxis dataKey="name" fontSize={11} interval={0} angle={-20} textAnchor="end" height={50} />
                <YAxis fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="cadets" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-semibold mb-2">Graduation statistics</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={graduationChart} layout="vertical">
                <XAxis type="number" fontSize={11} allowDecimals={false} />
                <YAxis type="category" dataKey="name" fontSize={11} width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="var(--chart-3)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-semibold mb-2">Training performance (average %)</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={performanceChart.length ? performanceChart : [{ name: "No results", avg: 0 }]}>
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="avg" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function CadetsTab({ canAdmin, canGraduate }: { canAdmin: boolean; canGraduate: boolean }) {
  const qc = useQueryClient();
  const { data } = useSuspenseQuery(trainingOptions);
  const [editing, setEditing] = useState<Partial<Cadet> | null>(null);
  const [transfer, setTransfer] = useState<Cadet | null>(null);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const rows = data.cadets.filter((c) => `${c.cadet_number} ${cadetName(c)} ${c.intake_number ?? ""} ${c.status ?? ""}`.toLowerCase().includes(q.toLowerCase()));
  const programName = (id: string | null) => data.programs.find((p) => p.id === id)?.title ?? "—";
  const report = rows.map((c) => ({ "Cadet ID": c.cadet_number, Name: cadetName(c), Gender: c.gender ?? "", Intake: c.intake_number ?? "", Program: programName(c.program_id), Status: c.status ?? "", Phone: c.phone ?? "", Email: c.email ?? "" }));
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy || !editing) return;
    const v = formValues(e.currentTarget);
    const record = {
      first_name: v.first_name, last_name: v.last_name, date_of_birth: v.date_of_birth || null, gender: v.gender || null,
      nationality: v.nationality || null, address: v.address || null, phone: v.phone || null, email: v.email || null,
      emergency_contact: v.emergency_contact || null, intake_number: v.intake_number || null, recruitment_date: v.recruitment_date || null,
      sponsoring_unit: v.sponsoring_unit || null, rank_before_admission: v.rank_before_admission || null,
      program_id: v.program_id || null, status: v.status || "Active", date_enrolled: v.date_enrolled || today(),
    };
    setBusy(true);
    try {
      const result = editing.id
        ? await supabase.from("cadets").update(record).eq("id", editing.id)
        : await supabase.from("cadets").insert(record);
      if (result.error) throw result.error;
      if (!editing.id && record.program_id) {
        const created = await supabase.from("cadets").select("id").eq("email", record.email ?? "").order("cadet_number", { ascending: false }).limit(1).maybeSingle();
        if (created.data) await supabase.from("program_enrollments").insert({ cadet_id: created.data.id, program_id: record.program_id });
      }
      await refreshTraining(qc);
      setEditing(null);
      toast.success("Cadet saved");
    } catch (err) { toast.error((err as { message?: string }).message || "Cadet could not be saved"); } finally { setBusy(false); }
  }
  async function setStatus(c: Cadet, status: string) {
    const result = await supabase.from("cadets").update({ status }).eq("id", c.id);
    if (result.error) { toast.error(result.error.message); return; }
    await refreshTraining(qc);
    toast.success(`${cadetName(c)} is now ${status}`);
  }
  async function graduate(c: Cadet) {
    if (!window.confirm(`Approve graduation for ${cadetName(c)}? A certificate will be issued.`)) return;
    const result = await supabase.rpc("graduate_cadet", { _cadet_id: c.id, _decision: "Approved" });
    if (result.error) { toast.error(result.error.message); return; }
    await refreshTraining(qc);
    toast.success(`${cadetName(c)} graduated — certificate issued`);
  }
  async function saveTransfer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!transfer) return;
    const v = formValues(e.currentTarget);
    setBusy(true);
    try {
      const update = await supabase.from("cadets").update({ program_id: v.program_id || null }).eq("id", transfer.id);
      if (update.error) throw update.error;
      if (v.program_id) await supabase.from("program_enrollments").upsert({ cadet_id: transfer.id, program_id: v.program_id, status: "Active" }, { onConflict: "cadet_id,program_id" });
      await refreshTraining(qc);
      setTransfer(null);
      toast.success("Cadet transferred");
    } catch (err) { toast.error((err as { message?: string }).message || "Transfer failed"); } finally { setBusy(false); }
  }
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <Input aria-label="Search cadets" placeholder="Search cadets…" value={q} onChange={(e) => setQ(e.target.value)} className="sm:max-w-xs" />
        <div className="flex flex-wrap gap-2">
          <ReportActions title="Cadet enrollment" rows={report} />
          {canAdmin && <Button onClick={() => setEditing({})}><Plus className="h-4 w-4" />Register cadet</Button>}
        </div>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>Cadet</TableHead><TableHead>Intake</TableHead><TableHead>Program</TableHead><TableHead>Contact</TableHead><TableHead>Status</TableHead>{(canAdmin || canGraduate) && <TableHead>Actions</TableHead>}</TableRow></TableHeader>
        <TableBody>
          {rows.map((c) => (
            <TableRow key={c.id}>
              <TableCell><div className="font-mono text-xs text-muted-foreground">{c.cadet_number}</div><div className="font-medium">{cadetName(c)}</div><div className="text-xs text-muted-foreground">{c.gender ?? ""}{c.nationality ? ` · ${c.nationality}` : ""}</div></TableCell>
              <TableCell>{c.intake_number ?? "—"}<div className="text-xs text-muted-foreground">{c.recruitment_date ?? ""}</div></TableCell>
              <TableCell>{programName(c.program_id)}</TableCell>
              <TableCell><div className="text-sm">{c.phone ?? "—"}</div><div className="text-xs text-muted-foreground">{c.email ?? ""}</div></TableCell>
              <TableCell><StatusBadge value={c.status ?? "Active"} /></TableCell>
              {(canAdmin || canGraduate) && (
                <TableCell className="whitespace-nowrap">
                  {canAdmin && <Button variant="ghost" size="icon" title={`Edit ${cadetName(c)}`} aria-label={`Edit ${cadetName(c)}`} onClick={() => setEditing(c)}><Pencil className="h-4 w-4" /></Button>}
                  {canAdmin && <Button variant="outline" size="sm" onClick={() => setTransfer(c)}>Transfer</Button>}
                  {canAdmin && c.status === "Active" && <Button variant="outline" size="sm" onClick={() => setStatus(c, "Suspended")}>Suspend</Button>}
                  {canAdmin && c.status === "Suspended" && <Button variant="outline" size="sm" onClick={() => setStatus(c, "Active")}>Reinstate</Button>}
                  {canGraduate && (c.status === "Active" || c.status === "Deferred") && <Button variant="outline" size="sm" onClick={() => graduate(c)}><GraduationCap className="h-4 w-4" />Graduate</Button>}
                </TableCell>
              )}
            </TableRow>
          ))}
          {!rows.length && <TableRow><TableCell colSpan={6} className="text-muted-foreground">No cadets found.</TableCell></TableRow>}
        </TableBody>
      </Table>
      <Dialog open={!!editing} onOpenChange={(o) => { if (!o && !busy) setEditing(null); }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit cadet" : "Register cadet"}</DialogTitle></DialogHeader>
          <form onSubmit={save} className="grid grid-cols-2 gap-3" key={editing?.id || "new"}>
            <div className="col-span-2"><Label>Cadet ID</Label><Input disabled value={editing?.cadet_number || "Generated when saved"} /></div>
            <Field label="First name" name="first_name" required defaultValue={editing?.first_name ?? ""} />
            <Field label="Last name" name="last_name" required defaultValue={editing?.last_name ?? ""} />
            <Field label="Date of birth" name="date_of_birth" type="date" defaultValue={editing?.date_of_birth ?? ""} />
            <SelectField label="Gender" name="gender" defaultValue={editing?.gender ?? ""} options={[{ value: "Male", label: "Male" }, { value: "Female", label: "Female" }]} />
            <Field label="Nationality" name="nationality" defaultValue={editing?.nationality ?? "Liberian"} />
            <Field label="Phone number" name="phone" defaultValue={editing?.phone ?? ""} />
            <Field label="Email" name="email" type="email" defaultValue={editing?.email ?? ""} />
            <Field label="Emergency contact" name="emergency_contact" defaultValue={editing?.emergency_contact ?? ""} />
            <div className="col-span-2"><Field label="Address" name="address" defaultValue={editing?.address ?? ""} /></div>
            <Field label="Intake number" name="intake_number" defaultValue={editing?.intake_number ?? ""} />
            <Field label="Recruitment date" name="recruitment_date" type="date" defaultValue={editing?.recruitment_date ?? ""} />
            <Field label="Date enrolled" name="date_enrolled" type="date" defaultValue={editing?.date_enrolled ?? today()} />
            <Field label="Sponsoring unit" name="sponsoring_unit" defaultValue={editing?.sponsoring_unit ?? ""} />
            <Field label="Rank before admission" name="rank_before_admission" defaultValue={editing?.rank_before_admission ?? ""} />
            <SelectField label="Training program" name="program_id" defaultValue={editing?.program_id ?? ""} options={data.programs.map((p) => ({ value: p.id, label: p.title ?? "" }))} />
            <SelectField label="Status" name="status" defaultValue={editing?.status ?? "Active"} options={CADET_STATUSES.map((s) => ({ value: s, label: s }))} />
            <Button disabled={busy} className="col-span-2">{busy ? "Saving…" : "Save cadet"}</Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={!!transfer} onOpenChange={(o) => { if (!o && !busy) setTransfer(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Transfer {transfer ? cadetName(transfer) : ""}</DialogTitle></DialogHeader>
          <form onSubmit={saveTransfer} className="space-y-3">
            <SelectField label="New training program" name="program_id" required defaultValue={transfer?.program_id ?? ""} options={data.programs.map((p) => ({ value: p.id, label: p.title ?? "" }))} />
            <Button disabled={busy} className="w-full">{busy ? "Transferring…" : "Transfer cadet"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProgramsTab({ canAdmin }: { canAdmin: boolean }) {
  const qc = useQueryClient();
  const { data } = useSuspenseQuery(trainingOptions);
  const [editingProgram, setEditingProgram] = useState<Partial<TrainingProgram> | null>(null);
  const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);
  const [enrolling, setEnrolling] = useState<TrainingProgram | null>(null);
  const [busy, setBusy] = useState(false);
  const instructorName = (id: string | null) => data.instructors.find((i) => i.id === id)?.name ?? "—";
  const programName = (id: string | null) => data.programs.find((p) => p.id === id)?.title ?? "—";
  async function saveProgram(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy || !editingProgram) return;
    const v = formValues(e.currentTarget);
    const record = { title: v.title, description: v.description || null, objectives: v.objectives || null, start_date: v.start_date || null, end_date: v.end_date || null, max_enrollment: v.max_enrollment ? Number(v.max_enrollment) : null, status: v.status || "Active" };
    setBusy(true);
    try {
      const result = editingProgram.id ? await supabase.from("training_programs").update(record).eq("id", editingProgram.id) : await supabase.from("training_programs").insert(record);
      if (result.error) throw result.error;
      await refreshTraining(qc);
      setEditingProgram(null);
      toast.success("Program saved");
    } catch (err) { toast.error((err as { message?: string }).message || "Program could not be saved"); } finally { setBusy(false); }
  }
  async function saveCourse(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy || !editingCourse) return;
    const v = formValues(e.currentTarget);
    const record = { course_name: v.course_name, course_code: v.course_code || null, training_program_id: v.training_program_id || null, instructor_id: v.instructor_id || null, duration: v.duration ? Number(v.duration) : null, description: v.description || null };
    setBusy(true);
    try {
      const result = editingCourse.id ? await supabase.from("courses").update(record).eq("id", editingCourse.id) : await supabase.from("courses").insert(record);
      if (result.error) throw result.error;
      await refreshTraining(qc);
      setEditingCourse(null);
      toast.success("Course saved");
    } catch (err) { toast.error((err as { message?: string }).message || "Course could not be saved"); } finally { setBusy(false); }
  }
  async function archive(p: TrainingProgram) {
    const result = await supabase.from("training_programs").update({ status: p.status === "Archived" ? "Active" : "Archived" }).eq("id", p.id);
    if (result.error) { toast.error(result.error.message); return; }
    await refreshTraining(qc);
    toast.success(p.status === "Archived" ? "Program reactivated" : "Program archived");
  }
  async function saveEnrollment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!enrolling) return;
    const v = formValues(e.currentTarget);
    setBusy(true);
    try {
      const result = await supabase.from("program_enrollments").upsert({ cadet_id: v.cadet_id, program_id: enrolling.id, status: "Active" }, { onConflict: "cadet_id,program_id" });
      if (result.error) throw result.error;
      if (v.assign_program === "on") await supabase.from("cadets").update({ program_id: enrolling.id }).eq("id", v.cadet_id);
      await refreshTraining(qc);
      setEnrolling(null);
      toast.success("Cadet assigned to program");
    } catch (err) { toast.error((err as { message?: string }).message || "Enrollment failed"); } finally { setBusy(false); }
  }
  const programReport = data.programs.map((p) => ({ Code: p.program_code, Program: p.title, Status: p.status, Start: p.start_date ?? "", End: p.end_date ?? "", "Max enrollment": p.max_enrollment ?? "", Enrolled: data.enrollments.filter((x) => x.program_id === p.id && x.status === "Active").length }));
  const courseReport = data.courses.map((c) => ({ Code: c.course_code ?? "", Course: c.course_name, Program: programName(c.training_program_id), Instructor: instructorName(c.instructor_id), "Duration (weeks)": c.duration ?? "" }));
  return (
    <div className="space-y-8">
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 className="text-lg font-semibold">Training programs</h2>
          <div className="flex flex-wrap gap-2">
            <ReportActions title="Training programs" rows={programReport} />
            {canAdmin && <Button onClick={() => setEditingProgram({})}><Plus className="h-4 w-4" />New program</Button>}
          </div>
        </div>
        <Table>
          <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Program</TableHead><TableHead>Dates</TableHead><TableHead>Enrollment</TableHead><TableHead>Status</TableHead>{canAdmin && <TableHead>Actions</TableHead>}</TableRow></TableHeader>
          <TableBody>
            {data.programs.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs">{p.program_code}</TableCell>
                <TableCell><div className="font-medium">{p.title}</div><div className="text-xs text-muted-foreground line-clamp-1">{p.objectives ?? p.description ?? ""}</div></TableCell>
                <TableCell className="text-sm">{p.start_date ?? "—"} → {p.end_date ?? "—"}</TableCell>
                <TableCell>{data.enrollments.filter((x) => x.program_id === p.id && x.status === "Active").length}{p.max_enrollment ? ` / ${p.max_enrollment}` : ""}</TableCell>
                <TableCell><StatusBadge value={p.status} /></TableCell>
                {canAdmin && (
                  <TableCell className="whitespace-nowrap">
                    <Button variant="ghost" size="icon" title={`Edit ${p.title}`} aria-label={`Edit ${p.title}`} onClick={() => setEditingProgram(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="outline" size="sm" onClick={() => setEnrolling(p)}><UserPlus className="h-4 w-4" />Assign cadet</Button>
                    <Button variant="outline" size="sm" onClick={() => archive(p)}>{p.status === "Archived" ? "Reactivate" : "Archive"}</Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {!data.programs.length && <TableRow><TableCell colSpan={6} className="text-muted-foreground">No training programs yet.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </section>
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 className="text-lg font-semibold">Courses</h2>
          <div className="flex flex-wrap gap-2">
            <ReportActions title="Training courses" rows={courseReport} />
            {canAdmin && <Button onClick={() => setEditingCourse({})}><Plus className="h-4 w-4" />New course</Button>}
          </div>
        </div>
        <Table>
          <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Course</TableHead><TableHead>Program</TableHead><TableHead>Instructor</TableHead><TableHead>Duration</TableHead>{canAdmin && <TableHead>Actions</TableHead>}</TableRow></TableHeader>
          <TableBody>
            {data.courses.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono text-xs">{c.course_code ?? "—"}</TableCell>
                <TableCell className="font-medium">{c.course_name}</TableCell>
                <TableCell>{programName(c.training_program_id)}</TableCell>
                <TableCell>{instructorName(c.instructor_id)}</TableCell>
                <TableCell>{c.duration ? `${c.duration} weeks` : "—"}</TableCell>
                {canAdmin && <TableCell><Button variant="ghost" size="icon" title={`Edit ${c.course_name}`} aria-label={`Edit ${c.course_name}`} onClick={() => setEditingCourse(c)}><Pencil className="h-4 w-4" /></Button></TableCell>}
              </TableRow>
            ))}
            {!data.courses.length && <TableRow><TableCell colSpan={6} className="text-muted-foreground">No courses yet.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </section>
      <Dialog open={!!editingProgram} onOpenChange={(o) => { if (!o && !busy) setEditingProgram(null); }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>{editingProgram?.id ? "Edit program" : "New training program"}</DialogTitle></DialogHeader>
          <form onSubmit={saveProgram} className="grid grid-cols-2 gap-3" key={editingProgram?.id || "new"}>
            <div className="col-span-2"><Label>Program code</Label><Input disabled value={editingProgram?.program_code || "Generated when saved"} /></div>
            <SelectField label="Program name" name="title" required defaultValue={editingProgram?.title ?? ""} options={PROGRAM_NAMES.map((n) => ({ value: n, label: n }))} />
            <Field label="Maximum enrollment" name="max_enrollment" type="number" defaultValue={editingProgram?.max_enrollment?.toString() ?? ""} />
            <Field label="Start date" name="start_date" type="date" defaultValue={editingProgram?.start_date ?? ""} />
            <Field label="End date" name="end_date" type="date" defaultValue={editingProgram?.end_date ?? ""} />
            <div className="col-span-2"><Field label="Description" name="description" defaultValue={editingProgram?.description ?? ""} /></div>
            <div className="col-span-2"><Field label="Objectives" name="objectives" defaultValue={editingProgram?.objectives ?? ""} /></div>
            <SelectField label="Status" name="status" defaultValue={editingProgram?.status ?? "Active"} options={[{ value: "Active", label: "Active" }, { value: "Archived", label: "Archived" }]} />
            <Button disabled={busy} className="col-span-2">{busy ? "Saving…" : "Save program"}</Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={!!editingCourse} onOpenChange={(o) => { if (!o && !busy) setEditingCourse(null); }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingCourse?.id ? "Edit course" : "New course"}</DialogTitle></DialogHeader>
          <form onSubmit={saveCourse} className="grid grid-cols-2 gap-3" key={editingCourse?.id || "new"}>
            <Field label="Course name" name="course_name" required defaultValue={editingCourse?.course_name ?? ""} />
            <Field label="Course code" name="course_code" defaultValue={editingCourse?.course_code ?? ""} />
            <SelectField label="Program" name="training_program_id" required defaultValue={editingCourse?.training_program_id ?? ""} options={data.programs.map((p) => ({ value: p.id, label: p.title ?? "" }))} />
            <SelectField label="Instructor" name="instructor_id" defaultValue={editingCourse?.instructor_id ?? ""} options={data.instructors.map((i) => ({ value: i.id, label: i.name }))} />
            <Field label="Duration (weeks)" name="duration" type="number" defaultValue={editingCourse?.duration?.toString() ?? ""} />
            <Field label="Description" name="description" defaultValue={editingCourse?.description ?? ""} />
            <Button disabled={busy} className="col-span-2">{busy ? "Saving…" : "Save course"}</Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={!!enrolling} onOpenChange={(o) => { if (!o && !busy) setEnrolling(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign cadet to {enrolling?.title}</DialogTitle></DialogHeader>
          <form onSubmit={saveEnrollment} className="space-y-3">
            <SelectField label="Cadet" name="cadet_id" required options={data.cadets.filter((c) => c.status === "Active").map((c) => ({ value: c.id, label: `${c.cadet_number} — ${cadetName(c)}` }))} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="assign_program" defaultChecked />Make this the cadet's primary program</label>
            <Button disabled={busy} className="w-full">{busy ? "Assigning…" : "Assign cadet"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AttendanceTab({ canInstruct }: { canInstruct: boolean }) {
  const qc = useQueryClient();
  const { data } = useSuspenseQuery(trainingOptions);
  const [date, setDate] = useState(today());
  const [courseId, setCourseId] = useState("");
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const course = data.courses.find((c) => c.id === courseId);
  const programCadets = course ? data.cadets.filter((c) => c.status === "Active" && (c.program_id === course.training_program_id || data.enrollments.some((e) => e.cadet_id === c.id && e.program_id === course.training_program_id && e.status === "Active"))) : [];
  const existing = data.attendance.filter((a) => a.course_id === courseId && a.attendance_date === date);
  const markFor = (cadetId: string) => marks[cadetId] ?? existing.find((a) => a.cadet_id === cadetId)?.status ?? "Present";
  async function saveRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!courseId || busy) return;
    setBusy(true);
    try {
      const rows = programCadets.map((c) => ({ cadet_id: c.id, course_id: courseId, attendance_date: date, status: markFor(c.id) }));
      if (rows.length) {
        const result = await supabase.from("attendance_records").upsert(rows, { onConflict: "cadet_id,course_id,attendance_date" });
        if (result.error) throw result.error;
      }
      await refreshTraining(qc);
      setMarks({});
      toast.success("Attendance register saved");
    } catch (err) { toast.error((err as { message?: string }).message || "Attendance could not be saved"); } finally { setBusy(false); }
  }
  const flagged = data.cadets.filter((c) => excessiveAbsences(data.attendance.filter((a) => a.cadet_id === c.id)));
  const history = data.attendance.slice(0, 100).map((a) => {
    const c = data.cadets.find((x) => x.id === a.cadet_id);
    const co = data.courses.find((x) => x.id === a.course_id);
    return { Date: a.attendance_date, Cadet: c ? cadetName(c) : "", Course: co?.course_name ?? "", Status: a.status, Remarks: a.remarks ?? "" };
  });
  return (
    <div className="space-y-8">
      <section className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><ClipboardCheck className="h-5 w-5" />Daily attendance register</h2>
        <form onSubmit={saveRegister} className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <div><Label htmlFor="att-date">Date</Label><Input id="att-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div className="min-w-60">
              <Label htmlFor="att-course">Course</Label>
              <select id="att-course" value={courseId} onChange={(e) => { setCourseId(e.target.value); setMarks({}); }} className="w-full h-9 rounded-md border bg-background px-2 text-sm">
                <option value="">Select course…</option>
                {data.courses.map((c) => <option key={c.id} value={c.id}>{c.course_name}</option>)}
              </select>
            </div>
          </div>
          {courseId && (
            <Table>
              <TableHeader><TableRow><TableHead>Cadet</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {programCadets.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell><span className="font-mono text-xs text-muted-foreground">{c.cadet_number}</span> {cadetName(c)}</TableCell>
                    <TableCell>
                      <select aria-label={`Attendance for ${cadetName(c)}`} value={markFor(c.id)} onChange={(e) => setMarks((m) => ({ ...m, [c.id]: e.target.value }))} disabled={!canInstruct} className="h-9 rounded-md border bg-background px-2 text-sm">
                        {ATTENDANCE_STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </TableCell>
                  </TableRow>
                ))}
                {!programCadets.length && <TableRow><TableCell colSpan={2} className="text-muted-foreground">No active cadets enrolled in this course's program.</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
          {canInstruct && courseId && programCadets.length > 0 && <Button disabled={busy}>{busy ? "Saving…" : "Save register"}</Button>}
        </form>
      </section>
      {flagged.length > 0 && (
        <section className="rounded-lg border border-destructive/40 p-4">
          <h2 className="text-lg font-semibold mb-2">Attendance flags</h2>
          <p className="text-sm text-muted-foreground mb-3">Cadets with excessive absences (5+ absences or above 20% of sessions).</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {flagged.map((c) => {
              const mine = data.attendance.filter((a) => a.cadet_id === c.id);
              return <div key={c.id} className="rounded-md border p-3 text-sm"><div className="font-medium">{cadetName(c)}</div><div className="text-xs text-muted-foreground">{c.cadet_number} · attendance {attendanceRate(mine)}% · {mine.filter((a) => a.status === "Absent").length} absences</div></div>;
            })}
          </div>
        </section>
      )}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 className="text-lg font-semibold">Attendance history</h2>
          <ReportActions title="Attendance report" rows={history} />
        </div>
        <Table>
          <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Cadet</TableHead><TableHead>Course</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.attendance.slice(0, 50).map((a) => {
              const c = data.cadets.find((x) => x.id === a.cadet_id);
              const co = data.courses.find((x) => x.id === a.course_id);
              return <TableRow key={a.id}><TableCell>{a.attendance_date}</TableCell><TableCell>{c ? cadetName(c) : "—"}</TableCell><TableCell>{co?.course_name ?? "—"}</TableCell><TableCell><StatusBadge value={a.status} /></TableCell></TableRow>;
            })}
            {!data.attendance.length && <TableRow><TableCell colSpan={4} className="text-muted-foreground">No attendance recorded yet.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}

function AssessmentsTab({ canAdmin, canInstruct }: { canAdmin: boolean; canInstruct: boolean }) {
  const qc = useQueryClient();
  const { data } = useSuspenseQuery(trainingOptions);
  const [scheduling, setScheduling] = useState(false);
  const [entering, setEntering] = useState<Assessment | null>(null);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const courseName = (id: string) => data.courses.find((c) => c.id === id)?.course_name ?? "—";
  async function saveAssessment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const v = formValues(e.currentTarget);
    setBusy(true);
    try {
      const result = await supabase.from("assessments").insert({ course_id: v.course_id, assessment_type: v.assessment_type, subject: v.subject, exam_date: v.exam_date, max_score: Number(v.max_score || 100), passing_score: Number(v.passing_score || 50) });
      if (result.error) throw result.error;
      await refreshTraining(qc);
      setScheduling(false);
      toast.success("Assessment scheduled");
    } catch (err) { toast.error((err as { message?: string }).message || "Assessment could not be scheduled"); } finally { setBusy(false); }
  }
  async function saveResults(e: React.FormEvent) {
    e.preventDefault();
    if (!entering || busy) return;
    setBusy(true);
    try {
      const rows = Object.entries(scores).filter(([, s]) => s !== "").map(([cadetId, s]) => ({ assessment_id: entering.id, cadet_id: cadetId, score: Number(s) }));
      if (rows.length) {
        const result = await supabase.from("assessment_results").upsert(rows, { onConflict: "assessment_id,cadet_id" });
        if (result.error) throw result.error;
      }
      await refreshTraining(qc);
      setEntering(null);
      setScores({});
      toast.success("Results saved");
    } catch (err) { toast.error((err as { message?: string }).message || "Results could not be saved"); } finally { setBusy(false); }
  }
  async function publish(a: Assessment) {
    const result = await supabase.from("assessments").update({ results_published: true }).eq("id", a.id);
    if (result.error) { toast.error(result.error.message); return; }
    await refreshTraining(qc);
    toast.success("Results published");
  }
  const resultRows = (a: Assessment) => data.results.filter((r) => r.assessment_id === a.id);
  const examReport = data.assessments.map((a) => ({ Code: a.exam_code, Type: a.assessment_type, Subject: a.subject, Course: courseName(a.course_id), Date: a.exam_date, Max: a.max_score, Pass: a.passing_score, Published: a.results_published ? "Yes" : "No", Results: resultRows(a).length }));
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold">Assessments & examinations</h2>
        <div className="flex flex-wrap gap-2">
          <ReportActions title="Examination report" rows={examReport} />
          {canAdmin && <Button onClick={() => setScheduling(true)}><Plus className="h-4 w-4" />Schedule assessment</Button>}
        </div>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>Exam</TableHead><TableHead>Course</TableHead><TableHead>Date</TableHead><TableHead>Scores</TableHead><TableHead>Status</TableHead>{(canAdmin || canInstruct) && <TableHead>Actions</TableHead>}</TableRow></TableHeader>
        <TableBody>
          {data.assessments.map((a) => (
            <TableRow key={a.id}>
              <TableCell><div className="font-mono text-xs text-muted-foreground">{a.exam_code}</div><div className="font-medium">{a.subject}</div><div className="text-xs text-muted-foreground">{a.assessment_type}</div></TableCell>
              <TableCell>{courseName(a.course_id)}</TableCell>
              <TableCell>{a.exam_date}</TableCell>
              <TableCell>{resultRows(a).length} entered · max {Number(a.max_score)} · pass {Number(a.passing_score)}</TableCell>
              <TableCell><StatusBadge value={a.results_published ? "Published" : a.exam_date >= today() ? "Scheduled" : "Awaiting results"} /></TableCell>
              {(canAdmin || canInstruct) && (
                <TableCell className="whitespace-nowrap">
                  {canInstruct && <Button variant="outline" size="sm" onClick={() => { setEntering(a); setScores({}); }}>Enter results</Button>}
                  {canAdmin && !a.results_published && <Button variant="outline" size="sm" onClick={() => publish(a)}>Publish</Button>}
                </TableCell>
              )}
            </TableRow>
          ))}
          {!data.assessments.length && <TableRow><TableCell colSpan={6} className="text-muted-foreground">No assessments scheduled yet.</TableCell></TableRow>}
        </TableBody>
      </Table>
      <Dialog open={scheduling} onOpenChange={(o) => { if (!o && !busy) setScheduling(false); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Schedule assessment</DialogTitle></DialogHeader>
          <form onSubmit={saveAssessment} className="grid grid-cols-2 gap-3">
            <SelectField label="Course" name="course_id" required options={data.courses.map((c) => ({ value: c.id, label: c.course_name ?? "" }))} />
            <SelectField label="Assessment type" name="assessment_type" required options={ASSESSMENT_TYPES.map((t) => ({ value: t, label: t }))} />
            <Field label="Subject" name="subject" required />
            <Field label="Date" name="exam_date" type="date" required defaultValue={today()} />
            <Field label="Maximum score" name="max_score" type="number" required defaultValue="100" />
            <Field label="Passing score" name="passing_score" type="number" required defaultValue="50" />
            <Button disabled={busy} className="col-span-2">{busy ? "Saving…" : "Schedule"}</Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={!!entering} onOpenChange={(o) => { if (!o && !busy) { setEntering(null); setScores({}); } }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>Enter results — {entering?.subject} (max {entering ? Number(entering.max_score) : 0})</DialogTitle></DialogHeader>
          <form onSubmit={saveResults} className="space-y-3">
            <Table>
              <TableHeader><TableRow><TableHead>Cadet</TableHead><TableHead>Score</TableHead><TableHead>Grade</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.cadets.filter((c) => c.status === "Active").map((c) => {
                  const existing = data.results.find((r) => r.assessment_id === entering?.id && r.cadet_id === c.id);
                  const value = scores[c.id] ?? existing?.score?.toString() ?? "";
                  return (
                    <TableRow key={c.id}>
                      <TableCell><span className="font-mono text-xs text-muted-foreground">{c.cadet_number}</span> {cadetName(c)}</TableCell>
                      <TableCell><Input aria-label={`Score for ${cadetName(c)}`} type="number" step="0.5" min="0" max={Number(entering?.max_score)} value={value} onChange={(e) => setScores((s) => ({ ...s, [c.id]: e.target.value }))} className="w-24" /></TableCell>
                      <TableCell>{value !== "" ? <StatusBadge value={Number(value) >= Number(entering?.passing_score) ? "Pass" : "Fail"} /> : "—"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <Button disabled={busy} className="w-full">{busy ? "Saving…" : "Save results"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GraduationTab({ canGraduate }: { canGraduate: boolean }) {
  const qc = useQueryClient();
  const { data } = useSuspenseQuery(trainingOptions);
  const [busy, setBusy] = useState(false);
  const candidates = data.cadets.filter((c) => c.status === "Active" || c.status === "Deferred");
  const decided = data.graduations.filter((g) => g.decision === "Approved");
  const ranking = decided
    .map((g) => ({ g, cadet: data.cadets.find((c) => c.id === g.cadet_id), avg: cadetAverage(g.cadet_id, data.results, data.assessments) ?? 0 }))
    .sort((a, b) => b.avg - a.avg);
  async function decide(c: Cadet, decision: string) {
    const note = decision === "Approved" ? `Approve graduation for ${cadetName(c)}? A certificate will be issued.` : `${decision} graduation for ${cadetName(c)}?`;
    if (!window.confirm(note) || busy) return;
    setBusy(true);
    try {
      const result = await supabase.rpc("graduate_cadet", { _cadet_id: c.id, _decision: decision });
      if (result.error) throw result.error;
      await refreshTraining(qc);
      toast.success(`Graduation ${decision.toLowerCase()} for ${cadetName(c)}`);
    } catch (err) { toast.error((err as { message?: string }).message || "Decision failed"); } finally { setBusy(false); }
  }
  const gradList = ranking.map((r, i) => ({ Rank: i + 1, Cadet: r.cadet ? cadetName(r.cadet) : "", "Cadet ID": r.cadet?.cadet_number ?? "", Program: data.programs.find((p) => p.id === r.g.program_id)?.title ?? "", "Overall average": `${r.avg}%`, Decided: r.g.decided_at?.slice(0, 10) ?? "" }));
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold mb-3">Graduation eligibility</h2>
        <Table>
          <TableHeader><TableRow><TableHead>Cadet</TableHead><TableHead>Program</TableHead><TableHead>Attendance</TableHead><TableHead>Overall average</TableHead><TableHead>Eligibility</TableHead>{canGraduate && <TableHead>Decision</TableHead>}</TableRow></TableHeader>
          <TableBody>
            {candidates.map((c) => {
              const rate = attendanceRate(data.attendance.filter((a) => a.cadet_id === c.id));
              const avg = cadetAverage(c.id, data.results, data.assessments);
              const eligible = graduationEligible(c.id, data.attendance, data.results, data.assessments);
              return (
                <TableRow key={c.id}>
                  <TableCell><span className="font-mono text-xs text-muted-foreground">{c.cadet_number}</span> {cadetName(c)}</TableCell>
                  <TableCell>{data.programs.find((p) => p.id === c.program_id)?.title ?? "—"}</TableCell>
                  <TableCell className={rate < 80 ? "text-destructive" : ""}>{rate}%</TableCell>
                  <TableCell>{avg === null ? "No results" : `${avg}%`}</TableCell>
                  <TableCell><StatusBadge value={eligible ? "Eligible" : "Not eligible"} /></TableCell>
                  {canGraduate && (
                    <TableCell className="whitespace-nowrap">
                      <Button variant="outline" size="sm" disabled={busy} onClick={() => decide(c, "Approved")}>Approve</Button>
                      <Button variant="outline" size="sm" disabled={busy} onClick={() => decide(c, "Deferred")}>Defer</Button>
                      <Button variant="outline" size="sm" disabled={busy} onClick={() => decide(c, "Re-assessment")}>Re-assessment</Button>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
            {!candidates.length && <TableRow><TableCell colSpan={6} className="text-muted-foreground">No cadets awaiting graduation.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </section>
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 className="text-lg font-semibold">Graduation list & class ranking</h2>
          <ReportActions title="Graduation report" rows={gradList} />
        </div>
        <Table>
          <TableHeader><TableRow><TableHead>Rank</TableHead><TableHead>Cadet</TableHead><TableHead>Program</TableHead><TableHead>Average</TableHead><TableHead>Decided</TableHead></TableRow></TableHeader>
          <TableBody>
            {ranking.map((r, i) => (
              <TableRow key={r.g.id}>
                <TableCell className="font-bold">{i + 1}</TableCell>
                <TableCell>{r.cadet ? cadetName(r.cadet) : "—"}<div className="font-mono text-xs text-muted-foreground">{r.cadet?.cadet_number}</div></TableCell>
                <TableCell>{data.programs.find((p) => p.id === r.g.program_id)?.title ?? "—"}</TableCell>
                <TableCell>{r.avg}%</TableCell>
                <TableCell>{r.g.decided_at?.slice(0, 10) ?? ""}</TableCell>
              </TableRow>
            ))}
            {!ranking.length && <TableRow><TableCell colSpan={5} className="text-muted-foreground">No approved graduations yet.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}

function CertificatesTab() {
  const { data } = useSuspenseQuery(trainingOptions);
  const [verify, setVerify] = useState("");
  const [verified, setVerified] = useState<{ certificate_number: string; cadet_name: string; program_name: string | null; completion_date: string; cadet_status: string }[] | null>(null);
  const [busy, setBusy] = useState(false);
  async function runVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!verify.trim() || busy) return;
    setBusy(true);
    try {
      const result = await supabase.rpc("verify_certificate", { _number: verify.trim() });
      if (result.error) throw result.error;
      setVerified(result.data ?? []);
      if (!result.data?.length) toast.error("No certificate matches that number");
    } catch (err) { toast.error((err as { message?: string }).message || "Verification failed"); } finally { setBusy(false); }
  }
  const certReport = data.certificates.map((c) => {
    const cadet = data.cadets.find((x) => x.id === c.cadet_id);
    return { "Certificate No": c.certificate_number, Cadet: cadet ? cadetName(cadet) : "", Program: data.programs.find((p) => p.id === c.program_id)?.title ?? "", "Completion date": c.completion_date, "Signed by": c.signed_by ?? "" };
  });
  return (
    <div className="space-y-8">
      <section className="rounded-lg border p-4 no-print">
        <h2 className="text-lg font-semibold mb-3">Verify a certificate</h2>
        <form onSubmit={runVerify} className="flex flex-wrap gap-2">
          <Input aria-label="Certificate number" placeholder="e.g. LNPATS-CERT-2026-0001" value={verify} onChange={(e) => setVerify(e.target.value)} className="sm:max-w-xs" />
          <Button disabled={busy}>{busy ? "Checking…" : "Verify"}</Button>
        </form>
        {verified && verified.length > 0 && (
          <div className="mt-3 rounded-md border border-success/40 p-3 text-sm">
            {verified.map((v) => (
              <div key={v.certificate_number}>
                <div className="font-medium text-success">Valid certificate</div>
                <div>{v.cadet_name} — {v.program_name ?? "Training program"}</div>
                <div className="text-xs text-muted-foreground">Completed {v.completion_date} · Cadet status: {v.cadet_status}</div>
              </div>
            ))}
          </div>
        )}
      </section>
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 className="text-lg font-semibold">Issued certificates</h2>
          <ReportActions title="Certificate issuance" rows={certReport} />
        </div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.certificates.map((c) => {
            const cadet = data.cadets.find((x) => x.id === c.cadet_id);
            const program = data.programs.find((p) => p.id === c.program_id);
            return (
              <div key={c.id} className="rounded-lg border p-5 text-center space-y-2">
                <Award className="h-8 w-8 mx-auto text-gold" />
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Liberia National Police Academy & Training School</div>
                <div className="font-display text-lg font-bold">Certificate of Completion</div>
                <div className="text-sm">Awarded to</div>
                <div className="text-xl font-semibold">{cadet ? cadetName(cadet) : "—"}</div>
                <div className="text-sm text-muted-foreground">for successfully completing {program?.title ?? "a training program"}</div>
                <div className="text-xs text-muted-foreground">Completed {c.completion_date} · Signed: {c.signed_by ?? "Commandant"}</div>
                <div className="flex justify-center pt-2"><QRCodeSVG value={`LNPATS-CERT:${c.certificate_number}`} size={72} /></div>
                <div className="font-mono text-xs">{c.certificate_number}</div>
              </div>
            );
          })}
          {!data.certificates.length && <p className="text-sm text-muted-foreground">No certificates issued yet. Approve a graduation to issue one.</p>}
        </div>
      </section>
    </div>
  );
}

function InstructorsTab({ canAdmin }: { canAdmin: boolean }) {
  const qc = useQueryClient();
  const { data } = useSuspenseQuery(trainingOptions);
  const [editing, setEditing] = useState<Partial<Instructor> | null>(null);
  const [busy, setBusy] = useState(false);
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy || !editing) return;
    const v = formValues(e.currentTarget);
    const record = { name: v.name, rank: v.rank || null, department: v.department || null, qualification: v.qualification || null, contact: v.contact || null, officer_id: v.officer_id || null };
    setBusy(true);
    try {
      const result = editing.id ? await supabase.from("instructors").update(record).eq("id", editing.id) : await supabase.from("instructors").insert(record);
      if (result.error) throw result.error;
      await refreshTraining(qc);
      setEditing(null);
      toast.success("Instructor saved");
    } catch (err) { toast.error((err as { message?: string }).message || "Instructor could not be saved"); } finally { setBusy(false); }
  }
  const report = data.instructors.map((i) => ({ "Instructor ID": i.instructor_code, Name: i.name, Rank: i.rank ?? "", Department: i.department ?? "", Qualification: i.qualification ?? "", Contact: i.contact ?? "", "Courses assigned": data.courses.filter((c) => c.instructor_id === i.id).length }));
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold">Instructor registry</h2>
        <div className="flex flex-wrap gap-2">
          <ReportActions title="Instructor report" rows={report} />
          {canAdmin && <Button onClick={() => setEditing({})}><Plus className="h-4 w-4" />Add instructor</Button>}
        </div>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Instructor</TableHead><TableHead>Department</TableHead><TableHead>Qualification</TableHead><TableHead>Courses assigned</TableHead><TableHead>Contact</TableHead>{canAdmin && <TableHead>Actions</TableHead>}</TableRow></TableHeader>
        <TableBody>
          {data.instructors.map((i) => (
            <TableRow key={i.id}>
              <TableCell className="font-mono text-xs">{i.instructor_code}</TableCell>
              <TableCell><div className="font-medium">{i.name}</div><div className="text-xs text-muted-foreground">{i.rank ?? ""}</div></TableCell>
              <TableCell>{i.department ?? "—"}</TableCell>
              <TableCell>{i.qualification ?? "—"}</TableCell>
              <TableCell>{data.courses.filter((c) => c.instructor_id === i.id).map((c) => c.course_name).join(", ") || "—"}</TableCell>
              <TableCell>{i.contact ?? "—"}</TableCell>
              {canAdmin && <TableCell><Button variant="ghost" size="icon" title={`Edit ${i.name}`} aria-label={`Edit ${i.name}`} onClick={() => setEditing(i)}><Pencil className="h-4 w-4" /></Button></TableCell>}
            </TableRow>
          ))}
          {!data.instructors.length && <TableRow><TableCell colSpan={7} className="text-muted-foreground">No instructors registered yet.</TableCell></TableRow>}
        </TableBody>
      </Table>
      <Dialog open={!!editing} onOpenChange={(o) => { if (!o && !busy) setEditing(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? "Edit instructor" : "Add instructor"}</DialogTitle></DialogHeader>
          <form onSubmit={save} className="grid grid-cols-2 gap-3" key={editing?.id || "new"}>
            <div className="col-span-2"><Label>Instructor ID</Label><Input disabled value={editing?.instructor_code || "Generated when saved"} /></div>
            <Field label="Name" name="name" required defaultValue={editing?.name ?? ""} />
            <Field label="Rank" name="rank" defaultValue={editing?.rank ?? ""} />
            <Field label="Department" name="department" defaultValue={editing?.department ?? ""} />
            <Field label="Qualification" name="qualification" defaultValue={editing?.qualification ?? ""} />
            <Field label="Contact information" name="contact" defaultValue={editing?.contact ?? ""} />
            <SelectField label="Linked officer (optional)" name="officer_id" defaultValue={editing?.officer_id ?? ""} options={data.officers.map((o) => ({ value: o.id, label: `${o.rank} ${o.full_name}` }))} />
            <Button disabled={busy} className="col-span-2">{busy ? "Saving…" : "Save instructor"}</Button>
          </form>
        </DialogContent>
      </Dialog>
      <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground"><BookOpen className="h-4 w-4" />Assign instructors to courses from the Programs & Courses tab.</div>
    </div>
  );
}
