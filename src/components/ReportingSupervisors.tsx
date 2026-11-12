import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { refreshHR, type Employee } from '@/lib/hr';
import { supervisorPositionOptions } from '@/lib/supervisor-positions';
import { loadEstablishment } from './EstablishmentPicker';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

type Dir = { sections: { id: string; name: string; section_head: string | null }[]; appointments: { kind: string; office_id: string | null; officer_id: string }[] };
const LEVELS = ['Supervisor', 'Section Head', 'Department Head', 'Deputy Commandant', 'Commandant'] as const;

export function ReportingSupervisors({ employees }: { employees: Employee[] }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [saving, setSaving] = useState<string | null>(null);
  const dir = useQuery({ queryKey: ['command-directory-hr'], enabled: open, queryFn: async () => { const r = await supabase.rpc('command_directory'); if (r.error) throw r.error; return r.data as unknown as Dir; } });
  const est = useQuery({ queryKey: ['establishment'], enabled: open, queryFn: loadEstablishment });
  const active = useMemo(() => employees.filter(e => !e.archived_at), [employees]);
  const list = active.filter(e => `${e.full_name} ${e.service_number} ${e.rank}`.toLowerCase().includes(q.toLowerCase()));
  const name = (id: string | null | undefined) => { const o = active.find(x => x.id === id); return o ? `${o.rank ?? ''} ${o.full_name}`.trim() : null; };
  const sections = dir.data?.sections ?? [];
  const appt = (kind: string, office: string | null) => dir.data?.appointments.find(a => a.kind === kind && (a.office_id ?? null) === office)?.officer_id ?? null;
  const chain = (e: Employee) => [e.supervisor_id, sections.find(s => s.id === e.section_id)?.section_head ?? null, appt('Department Head', e.office_id ?? null), appt('Deputy Commandant', null), appt('Commandant', null)];
  const refresh = async () => { await refreshHR(qc); await dir.refetch(); await qc.invalidateQueries({ queryKey: ['command'] }); };

  const save = async (id: string, label: string, fn: () => PromiseLike<{ error: { message: string } | null }>) => {
    setSaving(id); const r = await fn(); setSaving(null);
    if (r.error) { toast.error(r.error.message); return; }
    toast.success(label); await refresh();
  };
  const sel = 'w-full h-9 rounded-md border bg-background px-2 text-sm';

  return <>
    <Button size="sm" variant="outline" onClick={() => setOpen(true)}>Reporting Supervisors</Button>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
      <DialogHeader><DialogTitle>Reporting Supervisors & Section Heads</DialogTitle></DialogHeader>
      <p className="text-sm text-muted-foreground">Set each officer's supervisor and section. The Section Head is set per section, so every officer in that section inherits it automatically. Section Heads must have an ERP login and a Section Head, Chief Instructor, Department Head, Deputy Commandant or Commandant role.</p>
      <Input placeholder="Search officer" aria-label="Search officer" value={q} onChange={e => setQ(e.target.value)} className="max-w-sm" />
      <div className="border rounded-md overflow-x-auto"><table className="w-full text-sm"><thead className="bg-muted/50 text-left"><tr><th className="p-2 font-medium">Officer</th><th className="p-2 font-medium">Supervisor</th><th className="p-2 font-medium">Section</th><th className="p-2 font-medium">Section Head</th><th className="p-2 font-medium">Reporting chain</th></tr></thead><tbody>
        {list.length === 0 && <tr><td colSpan={5} className="p-3 text-muted-foreground">No officers match.</td></tr>}
        {list.map(e => { const c = chain(e); const missing = LEVELS.filter((_, i) => !c[i]); const sec = sections.find(s => s.id === e.section_id); return <tr key={e.id} className="border-t align-top">
          <td className="p-2"><div className="font-medium">{e.rank} {e.full_name}</div><div className="text-xs text-muted-foreground">{e.service_number}</div></td>
          <td className="p-2 min-w-44"><select aria-label={`Reporting supervisor for ${e.full_name}`} disabled={saving === e.id} value={e.supervisor_id ?? ''} onChange={ev => void save(e.id, `Supervisor updated for ${e.full_name}`, () => supabase.from('officers').update({ supervisor_id: ev.target.value || null } as never).eq('id', e.id))} className={sel}><option value="">Not assigned</option>{supervisorPositionOptions({ holders: active, posts: est.data?.posts ?? [], units: est.data?.units ?? [], commandantId: appt('Commandant', null), excludeId: e.id, currentId: e.supervisor_id }).map(o => <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}{o.value && !active.find(x => x.id === o.value)?.user_id && !o.disabled ? ' (no login)' : ''}</option>)}</select></td>
          <td className="p-2 min-w-44"><select aria-label={`Section for ${e.full_name}`} disabled={saving === e.id} value={e.section_id ?? ''} onChange={ev => void save(e.id, `Section updated for ${e.full_name}`, () => supabase.from('officers').update({ section_id: ev.target.value || null } as never).eq('id', e.id))} className={sel}><option value="">Not assigned</option>{sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></td>
          <td className="p-2 min-w-44">{sec ? <select aria-label={`Section Head for ${sec.name}`} disabled={saving === sec.id} value={sec.section_head ?? ''} onChange={ev => void save(sec.id, `Section Head set for ${sec.name}`, () => supabase.rpc('hr_assign_section_head', { _section: sec.id, _head: (ev.target.value || null) as string }))} className={sel}><option value="">Not assigned</option>{active.filter(s => s.user_id).map(s => <option key={s.id} value={s.id}>{s.rank} {s.full_name}</option>)}</select> : <span className="text-xs text-muted-foreground">Choose a section first</span>}</td>
          <td className="p-2 min-w-56 text-xs">{c.map((id, i) => <div key={LEVELS[i]}><span className="text-muted-foreground">{LEVELS[i]}:</span> {name(id) ?? <span className="text-destructive">Missing</span>}</div>)}{missing.length > 0 && <div className="mt-1 text-destructive font-medium">Reporting chain incomplete. Please assign all required supervisory positions.</div>}</td>
        </tr>; })}
      </tbody></table></div>
    </DialogContent></Dialog>
  </>;
}
