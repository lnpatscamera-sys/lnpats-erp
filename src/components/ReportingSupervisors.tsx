import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { refreshHR, type Employee } from '@/lib/hr';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

export function ReportingSupervisors({ employees }: { employees: Employee[] }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [saving, setSaving] = useState<string | null>(null);
  const active = useMemo(() => employees.filter(e => !e.archived_at), [employees]);
  const list = active.filter(e => `${e.full_name} ${e.service_number} ${e.rank}`.toLowerCase().includes(q.toLowerCase()));

  const assign = async (e: Employee, supervisorId: string) => {
    setSaving(e.id);
    const r = await supabase.from('officers').update({ supervisor_id: supervisorId || null } as never).eq('id', e.id);
    setSaving(null);
    if (r.error) { toast.error(r.error.message); return; }
    toast.success(`Reporting supervisor updated for ${e.full_name}`);
    await refreshHR(qc);
  };

  return <>
    <Button size="sm" variant="outline" onClick={() => setOpen(true)}>Reporting Supervisors</Button>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader><DialogTitle>Reporting Supervisors</DialogTitle></DialogHeader>
      <p className="text-sm text-muted-foreground">Choose the reporting supervisor for each officer. Changes save immediately. Supervisors marked “no login” cannot review daily reports until they have an ERP account.</p>
      <Input placeholder="Search officer" aria-label="Search officer" value={q} onChange={e => setQ(e.target.value)} className="max-w-sm" />
      <div className="border rounded-md overflow-x-auto"><table className="w-full text-sm"><thead className="bg-muted/50 text-left"><tr><th className="p-2 font-medium">Officer</th><th className="p-2 font-medium">Reporting supervisor</th></tr></thead><tbody>
        {list.length === 0 && <tr><td colSpan={2} className="p-3 text-muted-foreground">No officers match.</td></tr>}
        {list.map(e => <tr key={e.id} className="border-t"><td className="p-2"><div className="font-medium">{e.rank} {e.full_name}</div><div className="text-xs text-muted-foreground">{e.service_number}</div></td>
          <td className="p-2"><select aria-label={`Reporting supervisor for ${e.full_name}`} disabled={saving === e.id} value={e.supervisor_id ?? ''} onChange={ev => void assign(e, ev.target.value)} className="w-full h-9 rounded-md border bg-background px-2 text-sm"><option value="">Not assigned</option>{active.filter(s => s.id !== e.id).map(s => <option key={s.id} value={s.id}>{s.rank} {s.full_name}{s.user_id ? '' : ' (no login)'}</option>)}</select></td></tr>)}
      </tbody></table></div>
    </DialogContent></Dialog>
  </>;
}
