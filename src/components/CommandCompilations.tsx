import { useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database, Json } from '@/integrations/supabase/types';
import { liberiaDate } from '@/lib/command-rules';
import { compilationAction, type ReportSummary } from '@/lib/command';
import { summarizeDailyReports } from '@/lib/compilation.functions';
import { exportPdf } from '@/lib/export';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { CommandExports, CommandFiles, CommandHistory, useCommandMutation } from './CommandShared';
type Tables = Database['public']['Tables'];
type Report = Tables['daily_reports']['Row'];
type Compilation = Tables['compiled_reports']['Row'];

function statusTone(status: string) { if (status === 'Approved') return 'default'; if (status === 'Returned' || status === 'Rejected') return 'destructive'; return 'secondary'; }
function dotTone(r: Report, selected: boolean) { if (selected) return 'bg-primary'; if (r.status === 'Approved') return 'bg-green-600'; if (r.status === 'Pending') return 'bg-yellow-500'; return 'bg-red-600'; }

export function CommandCompilations({ reports, compilations, summary }: { reports: Report[]; compilations: Compilation[]; summary: ReportSummary }) {
  const { session } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);
  const [start, setStart] = useState(liberiaDate());
  const [end, setEnd] = useState(liberiaDate());
  const [preview, setPreview] = useState(false);
  const [title, setTitle] = useState('');
  const [period, setPeriod] = useState('Sectional Report');
  const [signature, setSignature] = useState('');
  const [summaryText, setSummaryText] = useState('');
  const [remarks, setRemarks] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const { busy, run } = useCommandMutation();
  const today = liberiaDate();

  const sources = useMemo(() => reports.filter(r => ['Approved', 'Pending'].includes(r.status) && r.report_date >= start && r.report_date <= end), [reports, start, end]);
  const chosen = useMemo(() => sources.filter(r => selected.includes(r.id)), [sources, selected]);
  const widgets: [string, number][] = [
    ['Reports submitted today', reports.filter(r => r.report_date === today && r.status !== 'Draft').length],
    ['Pending submission', Math.max(summary.expected - summary.submitted, 0)],
    ['Ready for compilation', sources.length],
    ['Compiled reports', compilations.length],
    ['Forwarded upward', compilations.filter(c => ['Submitted', 'Forwarded'].includes(c.status)).length],
    ['Returned for correction', compilations.filter(c => c.status === 'Returned').length],
  ];
  const statistics = { reports: chosen.length, officers: new Set(chosen.map(r => r.officer_id)).size, approved: chosen.filter(r => r.status === 'Approved').length, pending: chosen.filter(r => r.status === 'Pending').length, period: `${start} — ${end}` };

  function toggle(id: string, checked: boolean) { setSelected(s => checked ? [...s, id] : s.filter(x => x !== id)); }
  function openPreview() { if (!chosen.length) { toast.error('Unable to compile. No reports available or reporting chain not configured.'); return; } setPreview(true); }
  async function generateSummary() {
    setAiBusy(true);
    try {
      const r = await summarizeDailyReports({ data: { sourceIds: selected } });
      if (r.error) { toast.error(r.error); return; }
      setSummaryText(r.text);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Summary failed'); } finally { setAiBusy(false); }
  }
  function submit() {
    void run(async () => {
      const payload = { title, period, start_date: start, end_date: end, source_ids: selected, comments: remarks, remarks, signature, summary: summaryText, statistics } as unknown as Json;
      const r = await supabase.rpc('compile_daily_reports', { _payload: payload });
      if (r.error) throw r.error;
    }, () => { setSelected([]); setPreview(false); setTitle(''); setSignature(''); setSummaryText(''); setRemarks(''); });
  }
  function act(id: string, action: string) {
    void run(async () => { await compilationAction(id, action, { note: notes[id] ?? '' }); }, () => setNotes(n => ({ ...n, [id]: '' })));
  }
  function exportPackage(c: Compilation) {
    const snapshots = Array.isArray(c.source_snapshots) ? c.source_snapshots : [];
    const rows = snapshots.flatMap(r => r && typeof r === 'object' && !Array.isArray(r) ? [{ Officer: r['employee_name'], 'Service No.': r['employee_number'], Date: r['report_date'], Duty: r['duty_assignment'], Activities: r['activities'], Completed: r['tasks_completed'], Challenges: r['challenges'], Recommendations: r['recommendations'], Signature: r['signature'] }] : []);
    exportPdf(`${c.report_number} — ${c.title}`, [{ 'Executive Summary': c.summary ?? '', 'Supervisor Remarks': c.remarks ?? c.comments ?? '', Signature: c.signature, Reports: c.source_ids.length }, ...rows]);
  }

  return <section className="space-y-6">
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border-y divide-x py-4">{widgets.map(([k, v]) => <div key={k} className="px-3"><p className="text-xs text-muted-foreground">{k}</p><p className="text-xl font-semibold">{v}</p></div>)}</div>

    <div className="space-y-4 border-b pb-6">
      <h2 className="text-xl font-semibold">Compilation Center</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
        <div><Label htmlFor="compile-start">From</Label><Input id="compile-start" type="date" value={start} onChange={e => setStart(e.target.value)} /></div>
        <div><Label htmlFor="compile-end">To</Label><Input id="compile-end" type="date" value={end} min={start} onChange={e => setEnd(e.target.value)} /></div>
        <Button type="button" variant="outline" onClick={() => setSelected(sources.map(r => r.id))}>Select all</Button>
        <Button type="button" variant="outline" onClick={() => setSelected([])}>Clear selection</Button>
      </div>
      <div className="space-y-1">
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-3 text-xs text-muted-foreground px-1"><span /><span>Officer</span><span>Service No.</span><span>Date</span><span>Status</span></div>
        {sources.map(r => <label key={r.id} className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-3 border-b py-2 text-sm">
          <span className="flex items-center gap-2"><Checkbox checked={selected.includes(r.id)} onCheckedChange={c => toggle(r.id, c === true)} /><span className={`h-2.5 w-2.5 rounded-full ${dotTone(r, selected.includes(r.id))}`} /></span>
          <span>{r.employee_name}</span><span>{r.employee_number ?? '—'}</span><span>{r.report_date}</span><Badge variant={statusTone(r.status)}>{r.status}</Badge>
        </label>)}
        {!sources.length && <p className="text-sm text-muted-foreground">No submitted reports in this period.</p>}
      </div>
      <Button onClick={openPreview} disabled={busy || !selected.length}>Compile reports</Button>
    </div>

    <Dialog open={preview} onOpenChange={setPreview}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Compiled report package preview</DialogTitle></DialogHeader>
        <div className="grid sm:grid-cols-3 gap-3">
          <div><Label htmlFor="compile-title">Title</Label><Input id="compile-title" value={title} onChange={e => setTitle(e.target.value)} required /></div>
          <div><Label htmlFor="compile-period">Report type</Label><select id="compile-period" value={period} onChange={e => setPeriod(e.target.value)} className="h-9 w-full border rounded-md bg-background px-2 text-sm">{['Sectional Report', 'Departmental Report', 'Daily Headquarters Report', 'Weekly Summary', 'Monthly Summary'].map(t => <option key={t}>{t}</option>)}</select></div>
          <div><Label htmlFor="compile-sign">Electronic signature — full name</Label><Input id="compile-sign" value={signature} onChange={e => setSignature(e.target.value)} required /></div>
        </div>
        <Tabs defaultValue="summary">
          <TabsList className="flex-wrap h-auto"><TabsTrigger value="summary">Executive Summary</TabsTrigger><TabsTrigger value="stats">Statistics</TabsTrigger><TabsTrigger value="reports">Officer Reports</TabsTrigger><TabsTrigger value="remarks">Supervisor Remarks</TabsTrigger><TabsTrigger value="files">Attachments</TabsTrigger></TabsList>
          <TabsContent value="summary" className="space-y-2">
            <Button type="button" variant="outline" disabled={aiBusy} onClick={() => void generateSummary()}>{aiBusy ? 'Generating…' : 'Generate AI summary'}</Button>
            <Textarea aria-label="Executive summary" rows={12} value={summaryText} onChange={e => setSummaryText(e.target.value)} placeholder="Operational, administrative, logistics, ICT and welfare highlights…" />
          </TabsContent>
          <TabsContent value="stats"><dl className="grid grid-cols-2 gap-3 text-sm">{[['Reports included', statistics.reports], ['Officers reporting', statistics.officers], ['Approved reports', statistics.approved], ['Pending reports', statistics.pending], ['Reporting period', statistics.period]].map(([k, v]) => <div key={k} className="border rounded-md p-3"><dt className="text-xs text-muted-foreground">{k}</dt><dd className="text-lg font-semibold">{v}</dd></div>)}</dl></TabsContent>
          <TabsContent value="reports"><ol className="space-y-2 text-sm">{chosen.map(r => <li key={r.id} className="border-l-2 pl-3"><strong>{r.employee_name}</strong> · {r.employee_number ?? '—'} · {r.report_date}<p>{r.activities}</p></li>)}</ol></TabsContent>
          <TabsContent value="remarks"><Textarea aria-label="Supervisor remarks" rows={8} value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Supervisor assessment and remarks…" /></TabsContent>
          <TabsContent value="files" className="space-y-4">{chosen.map(r => <div key={r.id}><p className="text-sm font-medium">{r.employee_name} · {r.report_number}</p><CommandFiles files={r.attachments} /></div>)}</TabsContent>
        </Tabs>
        <div className="flex flex-wrap gap-2 justify-end">
          <Button variant="outline" onClick={() => setPreview(false)}>Cancel</Button>
          <Button variant="outline" onClick={() => exportPdf(title || 'Compiled daily report', [{ 'Executive Summary': summaryText, 'Supervisor Remarks': remarks, Signature: signature, ...statistics }, ...chosen.map(r => ({ Officer: r.employee_name, 'Service No.': r.employee_number, Date: r.report_date, Activities: r.activities, Signature: r.signature }))])}>Export PDF</Button>
          <Button disabled={busy || !title.trim() || !signature.trim()} onClick={submit}>Submit upward</Button>
        </div>
      </DialogContent>
    </Dialog>

    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Submission history</h2>
      {compilations.map(c => {
        const snapshots = Array.isArray(c.source_snapshots) ? c.source_snapshots : [];
        const rows = snapshots.flatMap(r => r && typeof r === 'object' && !Array.isArray(r) ? [{ officer: String(r['employee_name'] ?? ''), number: String(r['employee_number'] ?? ''), date: String(r['report_date'] ?? ''), activities: String(r['activities'] ?? '') }] : []);
        const canAct = session?.user.id === c.recipient_id && !['Approved'].includes(c.status);
        return <article key={c.id} className="border rounded-md p-4 space-y-3">
          <div className="flex justify-between gap-3 flex-wrap">
            <div><h3 className="font-semibold">{c.title}</h3><p className="text-xs text-muted-foreground">{c.report_number} · {c.period} · {c.start_date} — {c.end_date}</p></div>
            <div className="flex items-start gap-2"><Badge variant={statusTone(c.status)}>{c.status}</Badge><CommandExports title={c.title} rows={[{ Summary: c.summary, Remarks: c.remarks ?? c.comments, Signature: c.signature, Sources: c.source_ids.length }, ...rows]} /><Button variant="outline" onClick={() => exportPackage(c)}>PDF package</Button></div>
          </div>
          {c.summary && <div><p className="text-xs text-muted-foreground">Executive summary</p><p className="whitespace-pre-wrap text-sm">{c.summary}</p></div>}
          {(c.remarks ?? c.comments) && <div><p className="text-xs text-muted-foreground">Supervisor remarks</p><p className="whitespace-pre-wrap text-sm">{c.remarks ?? c.comments}</p></div>}
          <div className="space-y-2">{rows.map((r, i) => <div key={i} className="border-l-2 pl-3 text-sm"><strong>{r.officer}</strong> · {r.number} · {r.date}<p>{r.activities}</p></div>)}</div>
          {canAct && <div className="space-y-2 border-t pt-3">
            <Textarea aria-label="Reviewer note" rows={2} placeholder="Note (required for return or clarification)" value={notes[c.id] ?? ''} onChange={e => setNotes(n => ({ ...n, [c.id]: e.target.value }))} />
            <div className="flex flex-wrap gap-2">
              <Button disabled={busy} onClick={() => act(c.id, 'approve')}>Approve</Button>
              <Button variant="outline" disabled={busy} onClick={() => act(c.id, 'forward')}>Forward to next level</Button>
              <Button variant="outline" disabled={busy} onClick={() => act(c.id, 'clarify')}>Request clarification</Button>
              <Button variant="destructive" disabled={busy} onClick={() => act(c.id, 'return')}>Return for correction</Button>
            </div>
          </div>}
          <CommandHistory value={c.history} />
        </article>;
      })}
      {!compilations.length && <p className="text-sm text-muted-foreground">No compiled reports yet.</p>}
    </div>
  </section>;
}
