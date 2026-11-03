import { useState } from 'react';
import { policeRankOptions } from '@/lib/police-ranks';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { hrAction, type Employee, type HRData } from '@/lib/hr';
import { HRForm, HRTable, HRFiles, type FormField } from './HRShared';
import { StatusBadge } from './AppShell';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { FileText } from 'lucide-react';
import { PersonnelReportModal } from './PersonnelReportModal';

export function HREmployees({ d }: { d: HRData }) {
  const { hasAny, session } = useAuth();
  const staff = hasAny(['hr_admin', 'hr_officer']);
  const canReport = hasAny(['hr_admin', 'hr_officer', 'ict_admin', 'system_admin']);
  const [edit, setEdit] = useState<Employee | null | undefined>();
  const [view, setView] = useState<Employee | null>(null);
  const [q, setQ] = useState('');
  const [doc, setDoc] = useState(false);
  const [decision, setDecision] = useState<{ employee: Employee; action: string } | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);

  const fields: FormField[] = [
    { name: 'service_number', label: 'LNP ID / service number', required: true },
    { name: 'full_name', label: 'Full name', required: true },
    { name: 'rank', label: 'Rank', required: true },
    { name: 'date_of_birth', label: 'Date of birth', type: 'date' },
    { name: 'date_joined', label: 'Date joined LNP', type: 'date' },
    ...['gender', 'nationality', 'marital_status', 'address', 'phone', 'email', 'position'].map(name => ({
      name,
      label: name.replaceAll('_', ' '),
      type: name === 'email' ? 'email' : 'text',
    })),
    { name: 'employment_type', label: 'Employment type', required: true, options: ['Police', 'Civilian', 'Instructor'].map(value => ({ value, label: value })) },
    { name: 'office_id', label: 'Department', options: d.offices.map(s => ({ value: s.id, label: s.name })) },
    { name: 'section_id', label: 'Unit', options: d.sections.map(s => ({ value: s.id, label: s.name })) },
    { name: 'supervisor_id', label: 'Supervisor', options: d.employees.map(s => ({ value: s.id, label: s.full_name })) },
  ];

  const rows = d.employees.filter(e => `${e.full_name} ${e.employee_number} ${e.service_number} ${e.rank}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-4">
      <Input placeholder="Search employees…" aria-label="Search employees" value={q} onChange={e => setQ(e.target.value)} className="max-w-sm" />
      <HRTable
        title="Employees"
        rows={rows}
        columns={[
          { label: 'Employee ID', render: e => <span className="font-mono text-xs">{e.employee_number}</span> },
          { label: 'Name', render: e => e.full_name },
          { label: 'Rank / type', render: e => `${e.rank} · ${e.employment_type}` },
          { label: 'Department', render: e => d.offices.find(o => o.id === e.office_id)?.name ?? '—' },
          { label: 'Status', render: e => <StatusBadge value={e.employment_status} /> },
        ]}
        report={e => ({
          ID: e.employee_number,
          LNP: e.service_number,
          Name: e.full_name,
          Rank: e.rank,
          Department: d.offices.find(o => o.id === e.office_id)?.name,
          Unit: d.sections.find(o => o.id === e.section_id)?.name,
          Type: e.employment_type,
          Status: e.employment_status,
          'Staff File Number': e.form_number,
          'Official email': e.official_email,
          'Date joined LNP': e.date_joined,
          Retirement: e.retirement_date,
        })}
        onNew={staff ? () => setEdit(null) : undefined}
        onEdit={staff ? setEdit : undefined}
        onView={setView}
        actions={e => (
          <div className="flex items-center gap-1">
            {canReport && (
              <Button variant="outline" size="sm" className="gap-1" onClick={() => setReportId(e.id)}>
                <FileText className="h-3.5 w-3.5" /> Report
              </Button>
            )}
            {staff && e.employment_status === 'Active' && (
              <Button variant="outline" size="sm" onClick={() => setDecision({ employee: e, action: 'suspend' })}>
                Suspend
              </Button>
            )}
          </div>
        )}
      />

      {edit !== undefined && (
        <HRForm
          title={edit ? 'Edit employee' : 'New employee'}
          fields={fields.map(f => ({
            ...f,
            ...(f.name === 'rank' ? { options: policeRankOptions(edit?.rank) } : {}),
            value: edit ? String(edit[f.name as keyof Employee] ?? '') : f.name === 'nationality' ? 'Liberian' : undefined,
          }))}
          onClose={() => setEdit(undefined)}
          onSave={async v => {
            const payload = {
              service_number: v['service_number'] ?? '',
              full_name: v['full_name'] ?? '',
              rank: v['rank'] ?? '',
              gender: v['gender'] || null,
              nationality: v['nationality'] || null,
              marital_status: v['marital_status'] || null,
              address: v['address'] || null,
              phone: v['phone'] || null,
              email: v['email'] || null,
              position: v['position'] || null,
              date_of_birth: v['date_of_birth'] || null,
              date_joined: v['date_joined'] || null,
              employment_type: v['employment_type'] ?? 'Police',
              office_id: v['office_id'] || null,
              section_id: v['section_id'] || null,
              supervisor_id: v['supervisor_id'] || null,
            };
            const r = edit ? await supabase.from('officers').update(payload).eq('id', edit.id) : await supabase.from('officers').insert(payload);
            if (r.error) throw r.error;
          }}
        />
      )}

      {view && (
        <Dialog open onOpenChange={o => !o && setView(null)}>
          <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex flex-wrap items-center justify-between gap-3 pr-6">
                <DialogTitle>{view.full_name}</DialogTitle>
                {canReport && (
                  <Button
                    size="sm"
                    className="gap-1.5 font-semibold shadow-sm"
                    onClick={() => setReportId(view.id)}
                  >
                    <FileText className="h-4 w-4" /> Generate Report
                  </Button>
                )}
              </div>
            </DialogHeader>
            <dl className="grid sm:grid-cols-2 gap-3 text-sm">
              {fields.map(f => (
                <div key={f.name}>
                  <dt className="text-xs text-muted-foreground">{f.label}</dt>
                  <dd className="break-words">{String(view[f.name as keyof Employee] ?? '—')}</dd>
                </div>
              ))}
            </dl>
            <div className="flex gap-2 flex-wrap">
              {canReport && (
                <Button className="gap-1.5" onClick={() => setReportId(view.id)}>
                  <FileText className="h-4 w-4" /> Generate Report
                </Button>
              )}
              {staff && (
                <>
                  <Button variant="outline" onClick={() => setDoc(true)}>
                    Add personnel document
                  </Button>
                  {['retire', 'terminate'].map(action => (
                    <Button variant="outline" key={action} className="capitalize" onClick={() => setDecision({ employee: view, action })}>
                      {action}
                    </Button>
                  ))}
                </>
              )}
            </div>
            <h3 className="font-medium border-t pt-3">Personnel file</h3>
            {d.documents.filter(f => f.officer_id === view.id).map(f => (
              <div key={f.id}>
                <div className="text-xs text-muted-foreground">{f.document_type}</div>
                <HRFiles files={[{ path: f.file_url ?? '', name: f.document_name ?? 'Document' }]} bucket={f.bucket_id} />
              </div>
            ))}
          </DialogContent>
        </Dialog>
      )}

      {view && doc && (
        <HRForm
          title="Personnel document"
          fields={[
            {
              name: 'document_type',
              label: 'Document type',
              required: true,
              options: [
                'Appointment Letter',
                'Academic Certificate',
                'Professional Certificate',
                'National ID',
                'Passport Photo',
                'Training Certificate',
                'Promotion Letter',
                'Transfer Letter',
                'Leave Record',
                'Disciplinary Record',
              ].map(value => ({ value, label: value })),
            },
          ]}
          attachments
          onClose={() => setDoc(false)}
          onSave={async (v, files) => {
            if (!session || !files.length) throw new Error('Select a document');
            for (const file of files) {
              const r = await supabase.from('officer_documents').insert({
                officer_id: view.id,
                document_name: file.name,
                document_type: v['document_type'] ?? null,
                file_url: file.path,
                bucket_id: 'hr-files',
                uploaded_by: session.user.id,
              });
              if (r.error) throw r.error;
            }
          }}
        />
      )}

      {decision && (
        <HRForm
          title={`${decision.action} employee`}
          fields={[{ name: 'note', label: 'Reason', type: 'textarea', required: true }]}
          onClose={() => setDecision(null)}
          onSave={async v => {
            await hrAction('employees', decision.employee.id, decision.action, v);
            setView(null);
          }}
        />
      )}

      {reportId && (
        <PersonnelReportModal officerId={reportId} onClose={() => setReportId(null)} />
      )}
    </div>
  );
}
