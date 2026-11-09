import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth';
import { refreshHR, uploadHR, openHR, details, type HRData, type Employee } from '@/lib/hr';
import { policeRankOptions } from '@/lib/police-ranks';
import { exportExcel, exportPdf } from '@/lib/export';
import { enrollStaff } from '@/lib/enrollment.functions';
import {
  PERSONNEL_CATEGORIES,
  OFFICER_CATEGORIES,
  EMPLOYMENT_TYPES,
  EMPLOYMENT_STATUSES,
  ENROLLMENT_DOCUMENTS,
  categorySections,
  emailSubject,
  emailBody,
  nearingRetirement,
  yearsBetween,
  retirementSummary,
  idLabel,
} from '@/lib/hr-enrollment';
import type { Json } from '@/integrations/supabase/types';
import { liberiaDate } from '@/lib/time';
import { PassportPhotoPicker, OfficerPhoto, uploadOfficerPhoto } from '@/components/PassportPhoto';
import { StaffIdCardDialog } from '@/components/StaffIdCard';
import { EstablishmentPicker } from '@/components/EstablishmentPicker';
import { ReportingSupervisors } from '@/components/ReportingSupervisors';
import { FileText } from 'lucide-react';
import { PersonnelReportModal } from './PersonnelReportModal';

type F = { placeholder?: string; required?: boolean; name: string; label: string; type?: string; options?: string[] | { value: string; label: string; disabled?: boolean }[]; col?: boolean; wide?: boolean };
const COLUMN_FIELDS = new Set(['service_number', 'first_name', 'middle_name', 'last_name', 'gender', 'date_of_birth', 'nationality', 'marital_status', 'blood_group', 'phone', 'email', 'address', 'county', 'employment_status', 'employment_type', 'office_id', 'section_id', 'rank', 'position', 'date_joined', 'supervisor_id', 'establishment_post_id', 'lnp_class_number', 'education', 'promotion_history', 'training_history']);

function Section({ title, fields, rec }: { title: string; fields: F[]; rec: Record<string, string> }) {
  return (
    <fieldset className="border-t pt-4 space-y-3">
      <legend className="text-sm font-semibold pr-2">{title}</legend>
      <div className="grid sm:grid-cols-3 gap-3">
        {fields.map(f => (
          <div key={f.name} className={`space-y-1 ${f.wide ? 'sm:col-span-3' : ''}`}>
            <Label htmlFor={`he-${f.name}`}>{f.label}</Label>
            {f.options ? (
              <select id={`he-${f.name}`} name={f.name} defaultValue={rec[f.name] ?? ''} className="w-full h-9 rounded-md border bg-background px-2 text-sm">
                <option value="">—</option>
                {f.options.map(o => typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>)}
              </select>
            ) : f.type === 'area' ? (
              <Textarea id={`he-${f.name}`} name={f.name} defaultValue={rec[f.name] ?? ''} rows={2} />
            ) : (
              <Input id={`he-${f.name}`} name={f.name} type={f.type ?? 'text'} defaultValue={rec[f.name] ?? ''} placeholder={f.placeholder} required={f.required} />
            )}
          </div>
        ))}
      </div>
    </fieldset>
  );
}

export function HREnrollment({ d }: { d: HRData }) {
  const { roles, session } = useAuth();
  const qc = useQueryClient();
  const enroll = useServerFn(enrollStaff);
  const isAdmin = roles.includes('hr_admin') || roles.includes('system_admin');
  const canWrite = isAdmin || roles.includes('hr_officer');
  const [editing, setEditing] = useState<Employee | 'new' | null>(null);
  const [category, setCategory] = useState('');
  const [mail, setMail] = useState<Employee | null>(null);
  const [docsFor, setDocsFor] = useState<Employee | null>(null);
  const [reportOfficerId, setReportOfficerId] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [fDept, setFDept] = useState('');
  const [fRank, setFRank] = useState('');
  const [fCat, setFCat] = useState('');
  const [fStatus, setFStatus] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [busy, setBusy] = useState(false);
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [dob, setDob] = useState('');
  const [card, setCard] = useState<Employee | null>(null);

  const officeName = (id: string | null) => d.offices.find(o => o.id === id)?.name ?? '';
  const emps = d.employees;
  const onLeaveIds = new Set(d.leave.filter(l => l.status === 'approved' && l.start_date <= today() && l.end_date >= today()).map(l => l.officer_id));
  const stats = [
    ['Total personnel', emps.filter(e => !e.archived_at).length],
    ['Officers', emps.filter(e => !e.archived_at && OFFICER_CATEGORIES.includes(e.personnel_category ?? '')).length],
    ['Civilian staff', emps.filter(e => !e.archived_at && e.personnel_category === 'Civilian Staff').length],
    ['Active employees', emps.filter(e => !e.archived_at && e.employment_status === 'Active').length],
    ['Added (30 days)', emps.filter(e => Date.now() - new Date(e.created_at).getTime() < 30 * 86400000).length],
    ['Pending enrollment', emps.filter(e => !e.archived_at && e.enrollment_status === 'pending').length],
    ['Nearing retirement', emps.filter(e => !e.archived_at && nearingRetirement(e.retirement_date)).length],
    ['On leave', emps.filter(e => onLeaveIds.has(e.id)).length],
  ] as const;
  const groupBy = (key: (e: Employee) => string) => Object.entries(emps.filter(e => !e.archived_at).reduce<Record<string, number>>((a, e) => { const k = key(e) || 'Unassigned'; a[k] = (a[k] ?? 0) + 1; return a; }, {})).sort((a, b) => b[1] - a[1]);

  const list = useMemo(() => emps.filter(e => (showArchived ? !!e.archived_at : !e.archived_at)
    && (!q || `${e.full_name} ${e.service_number} ${e.employee_number ?? ''} ${e.form_number ?? ''} ${e.official_email ?? ''} ${e.email ?? ''} ${e.phone ?? ''}`.toLowerCase().includes(q.toLowerCase()))
    && (!fDept || e.office_id === fDept) && (!fRank || e.rank === fRank) && (!fCat || e.personnel_category === fCat) && (!fStatus || e.employment_status === fStatus)), [emps, q, fDept, fRank, fCat, fStatus, showArchived]);

  const rows = () => list.map(e => ({ 'Staff File Number': e.form_number, 'Employee No.': e.employee_number, 'ID type': idLabel(e.personnel_category), 'ID Number': e.service_number, Name: e.full_name, Category: e.personnel_category, Rank: e.rank, Department: officeName(e.office_id), Position: e.position, 'Official email': e.official_email, 'Personal email': e.email, Phone: e.phone, 'Date joined LNP': e.date_joined, 'Retirement eligibility': e.retirement_date, Status: e.employment_status, Enrollment: e.enrollment_status, Email: e.email_status === 'sent' ? 'Sent' : 'Not sent' }));

  const { data: commandantId } = useQuery({
    queryKey: ['commandant-appointment'],
    queryFn: async () => {
      const r = await supabase.from('reporting_lines').select('officer_id').eq('kind', 'Commandant').maybeSingle();
      if (r.error) throw r.error;
      return r.data?.officer_id ?? null;
    },
  });
  // The Commandant (from Command & Reports appointments) is listed first; other staff follow.
  const supervisorOptions = (selfId?: string) => {
    const commandant = emps.find(x => x.id === commandantId && !x.archived_at);
    const head = commandant
      ? (commandant.id === selfId ? [] : [{ value: commandant.id, label: `Commandant — ${commandant.rank} ${commandant.full_name}` }])
      : [{ value: '__no_commandant', label: 'Commandant — not yet appointed in Command & Reports', disabled: true }];
    return [...head, ...emps.filter(x => !x.archived_at && x.id !== selfId && x.id !== commandant?.id).map(x => ({ value: x.id, label: `${x.rank} ${x.full_name}` }))];
  };

  const open = (e: Employee | 'new') => { setEditing(e); setCategory(e === 'new' ? '' : e.personnel_category ?? ''); setPhoto(null); setDob(e === 'new' ? '' : e.date_of_birth ?? ''); };
  const rec: Record<string, string> = editing && editing !== 'new' ? { ...details(editing.enrollment_profile), ...Object.fromEntries(Object.entries(editing).map(([k, v]) => [k, v == null ? '' : String(v)])) } : {};
  const s = categorySections(category);
  const sections = d.sections.filter(x => !rec['office_id'] || x.office_id === rec['office_id']);

  const save = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const v = Object.fromEntries(new FormData(ev.currentTarget)) as Record<string, string>;
    if (!category) { toast.error('Select a personnel category'); return; }
    if (!v['first_name'] || !v['last_name'] || !v['service_number']) { toast.error('First name, last name and service number are required'); return; }
    if (!photo && (editing === 'new' || (editing && !editing.photo_url))) { toast.error('A passport-size photograph is required'); return; }
    const openAccount = v['open_account'] === 'on'; delete v['open_account'];
    const cols: Record<string, string | null> = {}; const profile: Record<string, string> = {};
    for (const [k, val] of Object.entries(v)) { if (COLUMN_FIELDS.has(k)) cols[k] = val.trim() || null; else if (val.trim()) profile[k] = val.trim(); }
    const full_name = [v['first_name'], v['middle_name'], v['last_name']].filter(Boolean).join(' ');
    const payload: Record<string, string | null | Json> & { service_number: string } = { ...cols, full_name, service_number: v['service_number'].trim(), rank: cols['rank'] ?? (OFFICER_CATEGORIES.includes(category) ? 'Officer' : 'Civilian'), employment_status: cols['employment_status'] ?? 'Active', employment_type: cols['employment_type'] ?? 'Permanent', personnel_category: category, enrollment_profile: profile as Json };
    setBusy(true);
    try {
      if (editing === 'new') {
        const r = await supabase.from('officers').insert({ ...payload, enrollment_status: 'pending' } as never).select('id').single();
        if (r.error) throw r.error;
        if (photo) await uploadOfficerPhoto(r.data.id, photo);
      } else if (editing) {
        const r = await supabase.from('officers').update(payload as never).eq('id', editing.id);
        if (r.error) throw r.error;
        if (photo) await uploadOfficerPhoto(editing.id, photo);
      }
      if (openAccount) {
        const em = cols['email']; if (!em) throw new Error('Record saved. An email address is needed to open a login account.');
        const r = await enroll({ data: { fullName: full_name, lnpId: payload.service_number, phone: cols['phone'] ?? '-----', classNumber: cols['lnp_class_number'] ?? '', email: em } });
        toast.success(r.emailed ? 'Record saved; login account opened and username/password emailed.' : `Record saved; login opened but email failed. Give the officer this password privately: ${r.password}`, { duration: r.emailed ? 4000 : 60000 });
      } else toast.success('Personnel record saved');
      setEditing(null); await refreshHR(qc);
    } catch (err) { toast.error((err as Error).message); }
    setBusy(false);
  };

  const setArchived = async (e: Employee, archive: boolean) => {
    const r = await supabase.from('officers').update({ archived_at: archive ? new Date().toISOString() : null } as never).eq('id', e.id);
    if (r.error) { toast.error(r.error.message); return; }
    toast.success(archive ? 'Record archived' : 'Record restored'); await refreshHR(qc);
  };

  if (!canWrite && !roles.some(r => ['assistant_commissioner', 'section_head'].includes(r))) return <p className="text-sm text-muted-foreground">Only Human Resources can manage enrollment records.</p>;

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(([l, n]) => (
          <div key={l} className="border rounded-md p-3">
            <p className="text-xs text-muted-foreground">{l}</p>
            <p className="text-2xl font-semibold">{n}</p>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {[['Personnel by department', groupBy(e => officeName(e.office_id))], ['Personnel by rank', groupBy(e => e.rank)]].map(([t, g]) => (
          <div key={t as string} className="border rounded-md p-3">
            <p className="text-sm font-semibold mb-2">{t as string}</p>
            <ul className="text-sm space-y-1 max-h-40 overflow-auto">
              {(g as [string, number][]).map(([k, n]) => (
                <li key={k} className="flex justify-between">
                  <span className="truncate">{k}</span>
                  <span className="font-medium">{n}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-end">
        <Input placeholder="Search name or number" value={q} onChange={e => setQ(e.target.value)} className="w-56" aria-label="Search personnel" />
        {[
          [fDept, setFDept, 'Department', d.offices.map(o => ({ value: o.id, label: o.name }))],
          [fRank, setFRank, 'Rank', [...policeRankOptions(), { value: 'Civilian', label: 'Civilian' }]],
          [fCat, setFCat, 'Category', PERSONNEL_CATEGORIES.map(c => ({ value: c, label: c }))],
          [fStatus, setFStatus, 'Status', EMPLOYMENT_STATUSES.map(c => ({ value: c, label: c }))]
        ].map(([v, set, label, opts]) => (
          <select key={label as string} aria-label={label as string} value={v as string} onChange={e => (set as (x: string) => void)(e.target.value)} className="h-9 rounded-md border bg-background px-2 text-sm">
            <option value="">All {(label as string).toLowerCase()}s</option>
            {(opts as { value: string; label: string }[]).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ))}
        <label className="text-sm flex items-center gap-1">
          <input type="checkbox" checked={showArchived} onChange={e => setShowArchived(e.target.checked)} /> Archived
        </label>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportPdf('Personnel registry', rows())}>PDF</Button>
          <Button variant="outline" size="sm" onClick={() => exportExcel('personnel-registry', rows())}>Excel</Button>
          {canWrite && <ReportingSupervisors employees={emps} />}
          {canWrite && <Button size="sm" onClick={() => open('new')}>Enroll personnel</Button>}
        </div>
      </div>

      <div className="overflow-x-auto border rounded-md">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              {['Photo', 'Name', 'Numbers', 'Category', 'Rank / Dept', 'Enrollment', 'Email', ''].map(h => (
                <th key={h} className="p-2 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td colSpan={8} className="p-4 text-muted-foreground">No personnel match.</td>
              </tr>
            )}
            {list.map(e => (
              <tr key={e.id} className="border-t align-top">
                <td className="p-2">
                  <OfficerPhoto path={e.photo_url} name={e.full_name} />
                </td>
                <td className="p-2 font-medium">
                  {e.full_name}
                  <div className="text-xs text-muted-foreground font-normal break-all">{e.official_email}</div>
                </td>
                <td className="p-2 text-xs">
                  {e.form_number}
                  <br />
                  {e.employee_number}
                  <br />
                  <span className="text-muted-foreground">{idLabel(e.personnel_category)}:</span> {e.service_number}
                </td>
                <td className="p-2">{e.personnel_category ?? '—'}</td>
                <td className="p-2">
                  {e.rank}
                  <br />
                  <span className="text-xs text-muted-foreground">{officeName(e.office_id)}</span>
                </td>
                <td className="p-2 capitalize">{e.enrollment_status}</td>
                <td className="p-2">{e.email_status === 'sent' ? `Sent ${e.email_sent_at?.slice(0, 10) ?? ''}` : 'Not sent'}</td>
                <td className="p-2">
                  <div className="flex flex-wrap gap-1 justify-end">
                    {/* Requirement 1: Report button on personnel row */}
                    <Button size="sm" variant="outline" onClick={() => setReportOfficerId(e.id)} title="Generate official personnel report">
                      <FileText className="h-3.5 w-3.5 mr-1" />
                      Report
                    </Button>
                    {canWrite && !e.archived_at && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => open(e)}>Edit</Button>
                        <Button size="sm" variant="outline" onClick={() => setDocsFor(e)}>Documents</Button>
                        <Button size="sm" variant="outline" onClick={() => setMail(e)}>Email</Button>
                      </>
                    )}
                    <Button size="sm" variant="outline" onClick={() => setCard(e)}>ID card</Button>
                    {isAdmin && (
                      <Button size="sm" variant="ghost" onClick={() => setArchived(e, !e.archived_at)}>
                        {e.archived_at ? 'Restore' : 'Archive'}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit / New Employee Dialog */}
      <Dialog open={!!editing} onOpenChange={o => !o && setEditing(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between pr-8">
            <DialogTitle>{editing === 'new' ? 'Enroll personnel' : `Edit ${rec['full_name'] ?? ''}`}</DialogTitle>
            {editing && editing !== 'new' && (
              <Button size="sm" variant="outline" type="button" onClick={() => setReportOfficerId(editing.id)} className="gap-1">
                <FileText className="h-4 w-4" />
                Generate Report
              </Button>
            )}
          </DialogHeader>
          <form key={editing === 'new' ? 'new' : editing?.id} onSubmit={save} onChange={ev => { const t = ev.target as unknown as HTMLInputElement; if (t.name === 'date_of_birth') setDob(t.value); }} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="he-cat">Personnel category *</Label>
              <select id="he-cat" value={category} onChange={e => setCategory(e.target.value)} required className="w-full h-9 rounded-md border bg-background px-2 text-sm">
                <option value="">Select…</option>
                {PERSONNEL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="space-y-1"><Label htmlFor="he-staff-file-no">Staff File Number</Label><Input id="he-staff-file-no" readOnly value={rec['form_number'] || 'Assigned automatically on save'} className="bg-muted" /></div>
              <div className="space-y-1"><Label htmlFor="he-off-email">Official email</Label><Input id="he-off-email" readOnly value={rec['official_email'] || 'Generated from name on save'} className="bg-muted" /></div>
              {editing !== 'new' && <div className="space-y-1"><Label>Personnel ID</Label><Input readOnly value={rec['employee_number'] || ''} className="bg-muted" /></div>}
            </div>
            <PassportPhotoPicker required currentPath={rec['photo_url'] || null} onChange={setPhoto} officerId={editing !== 'new' ? editing?.id : undefined} onUploaded={() => refreshHR(qc)} />
            <Section rec={rec} title="Personal information" fields={[{ name: 'service_number', label: `${idLabel(category)} *`, placeholder: `Enter ${idLabel(category)}`, required: true }, { name: 'first_name', label: 'First name *' }, { name: 'middle_name', label: 'Middle name' }, { name: 'last_name', label: 'Last name *' }, { name: 'gender', label: 'Gender', options: ['Male', 'Female'] }, { name: 'date_of_birth', label: 'Date of birth', type: 'date' }, { name: 'nationality', label: 'Nationality' }, { name: 'marital_status', label: 'Marital status', options: ['Single', 'Married', 'Divorced', 'Widowed'] }, { name: 'national_id', label: 'National ID number' }, { name: 'passport_number', label: 'Passport number' }, { name: 'blood_group', label: 'Blood group', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] }, { name: 'lnp_class_number', label: 'LNP Class number' }]} />
            <Section rec={rec} title="Contact information" fields={[{ name: 'phone', label: 'Mobile number', type: 'tel' }, { name: 'work_phone', label: 'Work phone', type: 'tel' }, { name: 'alt_phone', label: 'Alternative phone', type: 'tel' }, { name: 'email', label: 'Personal email', type: 'email' }, { name: 'official_email', label: 'Official email', type: 'email' }, { name: 'county', label: 'County' }, { name: 'district', label: 'District' }, { name: 'city', label: 'City / town' }, { name: 'address', label: 'Address' }, { name: 'emergency_name', label: 'Emergency contact name' }, { name: 'emergency_relationship', label: 'Relationship' }, { name: 'emergency_phone', label: 'Emergency contact number', type: 'tel' }]} />
            <Section rec={rec} title="Employment information" fields={[{ name: 'employment_status', label: 'Employment status', options: EMPLOYMENT_STATUSES }, { name: 'employment_type', label: 'Employment type', options: EMPLOYMENT_TYPES }, { name: 'office_id', label: 'Department', options: d.offices.map(o => ({ value: o.id, label: o.name })) }, { name: 'section_id', label: 'Unit / section', options: sections.map(o => ({ value: o.id, label: o.name })) }, { name: 'rank', label: 'Rank', options: [...policeRankOptions(rec['rank'] === 'Civilian' ? undefined : rec['rank']), { value: 'Civilian', label: 'Civilian' }] }, { name: 'date_joined', label: 'Date joined LNP', type: 'date' }, { name: 'appointment_date', label: 'Current appointment date', type: 'date' }, { name: 'duty_station', label: 'Duty station' }, { name: 'supervisor_id', label: 'Reporting supervisor', options: supervisorOptions(rec['id']) }, { name: 'salary_grade', label: 'Salary grade' }, { name: 'salary_amount', label: 'Salary amount (USD)', type: 'number' }]} />
            <EstablishmentPicker officerId={rec['id']} postId={rec['establishment_post_id']} position={rec['position']} />
            {(() => { const r = retirementSummary(dob, liberiaDate()); return <div className="grid sm:grid-cols-3 gap-3"><div className="space-y-1"><Label htmlFor="he-retire">Retirement eligibility date (age 65)</Label><Input id="he-retire" readOnly value={r?.date || 'Enter date of birth'} className="bg-muted" /></div>{r && <p className="text-sm self-end pb-2">Age {r.age} · {r.remaining} years to retirement</p>}</div>; })()}
            {s.probation && <Section rec={rec} title="Probation" fields={[{ name: 'probation_start', label: 'Probation start', type: 'date' }, { name: 'probation_end', label: 'Probation end', type: 'date' }, { name: 'probation_notes', label: 'Probation notes', type: 'area', wide: true }]} />}
            {s.initialAssignment && <Section rec={rec} title="Initial assignment" fields={[{ name: 'initial_assignment', label: 'Initial assignment' }, { name: 'initial_assignment_date', label: 'Assignment date', type: 'date' }]} />}
            {s.inService && <Section rec={rec} title={`In-service information${rec['original_appointment'] ? ` (${yearsBetween(rec['original_appointment']) ?? 0} service years)` : ''}`} fields={[{ name: 'original_appointment', label: 'Date of original appointment', type: 'date' }, { name: 'previous_department', label: 'Previous department' }, { name: 'previous_position', label: 'Previous position' }, { name: 'previous_rank', label: 'Previous rank' }, { name: 'transfer_date', label: 'Transfer date', type: 'date' }, { name: 'disciplinary_status', label: 'Current disciplinary status', options: ['Clear', 'Under investigation', 'Sanctioned'] }, { name: 'department_history', label: 'Previous department history', type: 'area', wide: true }, { name: 'promotion_history', label: 'Promotion history', type: 'area', wide: true }, { name: 'training_history', label: 'Training history', type: 'area', wide: true }]} />}
            <Section rec={rec} title="Education & qualifications" fields={[{ name: 'education', label: 'Highest education level', options: ['Primary', 'High School', 'Diploma', 'Associate', 'Bachelor', 'Master', 'Doctorate'] }, { name: 'institution', label: 'Institution' }, { name: 'degree', label: 'Degree / certificate' }, { name: 'professional_qualifications', label: 'Professional qualifications' }, { name: 'specialized_training', label: 'Specialized training' }, { name: 'computer_skills', label: 'Computer skills' }, { name: 'languages', label: 'Languages spoken' }]} />
            {editing && editing !== 'new' && <p className="text-xs text-muted-foreground">Created {editing.created_at.slice(0, 16).replace('T', ' ')} · Last updated {editing.updated_at.slice(0, 16).replace('T', ' ')}. Full change history is in the Audit Log.</p>}
            {(editing === 'new' || (editing && !editing.user_id)) && <label className="flex items-start gap-2 text-sm"><input type="checkbox" name="open_account" className="mt-1" /> <span>Also open an ERP login account. The system emails the username (LNP ID Number), a default password and the official email address to the personal email.</span></label>}
            <div className="flex gap-2">
              <Button disabled={busy}>{busy ? 'Saving…' : 'Save record'}</Button>
              {editing && editing !== 'new' && (
                <Button type="button" variant="outline" onClick={() => setReportOfficerId(editing.id)} className="gap-1">
                  <FileText className="h-4 w-4" />
                  Generate Report
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {card && <StaffIdCardDialog e={{ ...card, department: officeName(card.office_id) }} onClose={() => setCard(null)} />}
      {mail && <EmailDialog e={mail} dept={officeName(mail.office_id)} onClose={() => setMail(null)} onSent={() => refreshHR(qc)} />}

      {/* Documents Dialog with Generate Report option */}
      <Dialog open={!!docsFor} onOpenChange={o => !o && setDocsFor(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader className="flex flex-row items-center justify-between pr-8">
            <DialogTitle>Documents — {docsFor?.full_name}</DialogTitle>
            {docsFor && (
              <Button size="sm" variant="outline" type="button" onClick={() => setReportOfficerId(docsFor.id)} className="gap-1">
                <FileText className="h-3.5 w-3.5" />
                Report
              </Button>
            )}
          </DialogHeader>
          {docsFor && (
            <div className="space-y-3">
              <form className="flex flex-wrap gap-2 items-end" onSubmit={async ev => { ev.preventDefault(); const fd = new FormData(ev.currentTarget); const file = fd.get('file') as File; if (!session || !file?.size) { toast.error('Choose a file'); return; } try { const up = await uploadHR(file, session.user.id); const r = await supabase.from('officer_documents').insert({ officer_id: docsFor.id, document_name: file.name, document_type: String(fd.get('type')), file_url: up.path, bucket_id: 'hr-files', uploaded_by: session.user.id }); if (r.error) throw r.error; toast.success('Document uploaded'); (ev.target as HTMLFormElement).reset(); await refreshHR(qc); } catch (err) { toast.error((err as Error).message); } }}>
                <select name="type" aria-label="Document type" className="h-9 rounded-md border bg-background px-2 text-sm">
                  {ENROLLMENT_DOCUMENTS.map(t => <option key={t}>{t}</option>)}
                </select>
                <Input type="file" name="file" className="w-56" aria-label="File" />
                <Button size="sm">Upload</Button>
              </form>
              <ul className="text-sm divide-y">
                {d.documents.filter(x => x.officer_id === docsFor.id).map(x => (
                  <li key={x.id} className="py-2 flex justify-between gap-2">
                    <span>{x.document_type} — {x.document_name}</span>
                    <Button size="sm" variant="ghost" onClick={() => openHR({ path: x.file_url ?? '', name: x.document_name ?? '' }, x.bucket_id ?? 'hr-files').catch(err => toast.error(err.message))}>
                      Open
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Full Personnel Report Modal */}
      {reportOfficerId && (
        <PersonnelReportModal
          officerId={reportOfficerId}
          onClose={() => setReportOfficerId(null)}
        />
      )}
    </section>
  );
}

function today() { return liberiaDate(); }

function EmailDialog({ e, dept, onClose, onSent }: { e: Employee; dept: string; onClose: () => void; onSent: () => void }) {
  const category = e.personnel_category ?? 'Newly Recruited Officer';
  const [to, setTo] = useState(e.email ?? '');
  const [subject, setSubject] = useState(emailSubject(category));
  const [body, setBody] = useState(emailBody({ ...e, category, department: dept }));
  const [notes, setNotes] = useState(e.email_notes ?? '');
  const sent = e.email_status === 'sent';
  const pdf = async () => { const { jsPDF } = await import('jspdf'); const doc = new jsPDF(); doc.setFontSize(14); doc.text(subject, 14, 20); doc.setFontSize(11); doc.text(doc.splitTextToSize(body, 180), 14, 32); doc.save(`${subject} - ${e.full_name}.pdf`); };
  const markSent = async () => { const r = await supabase.from('officers').update({ email_status: 'sent', email_notes: notes || null } as never).eq('id', e.id); if (r.error) { toast.error(r.error.message); return; } toast.success('Marked as sent; record is now active'); onSent(); onClose(); };
  return (
    <Dialog open onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Enrollment email — {e.full_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">This letter is never sent by the system. Review it, send it yourself, then mark it as sent.</p>
          <div className="space-y-1"><Label htmlFor="em-to">To</Label><Input id="em-to" value={to} onChange={x => setTo(x.target.value)} /></div>
          <div className="space-y-1"><Label htmlFor="em-sub">Subject</Label><Input id="em-sub" value={subject} onChange={x => setSubject(x.target.value)} /></div>
          <div className="space-y-1"><Label htmlFor="em-body">Message</Label><Textarea id="em-body" rows={12} value={body} onChange={x => setBody(x.target.value)} /></div>
          <div className="space-y-1"><Label htmlFor="em-notes">Email notes</Label><Input id="em-notes" value={notes} onChange={x => setNotes(x.target.value)} /></div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`).then(() => toast.success('Copied'))}>Copy email</Button>
            <Button variant="outline" size="sm" onClick={pdf}>Download PDF</Button>
            <Button variant="outline" size="sm" asChild><a href={`mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}>Open in email app</a></Button>
            {sent ? <span className="text-sm self-center">Sent on {e.email_sent_at?.slice(0, 10)}</span> : <Button size="sm" onClick={markSent}>Mark as sent</Button>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
