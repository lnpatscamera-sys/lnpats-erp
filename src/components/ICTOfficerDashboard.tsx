import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { ictOptions } from '@/lib/ict';
import { PageHeader, StatusBadge } from './AppShell';
import { Button } from './ui/button';

const OPEN = (s: string | null) => !['Resolved', 'Closed'].includes(s ?? 'Open');

export function ICTOfficerDashboard() {
  const { session } = useAuth();
  const q = useQuery(ictOptions);
  if (q.error) return <p role="alert">Your ICT workspace could not be loaded.</p>;
  if (!q.data) return <p>Loading ICT workspace…</p>;
  const d = q.data;
  const me = d.directory.find(o => o.user_id === session?.user.id);
  const mine = d.tickets.filter(t => me && t.assigned_to === me.id);
  const open = mine.filter(t => OPEN(t.status));
  const pending = mine.filter(t => t.status === 'Pending');
  const resolved = mine.filter(t => !OPEN(t.status));
  const unassigned = d.tickets.filter(t => !t.assigned_to && OPEN(t.status));
  const network = d.records.filter(r => r.kind === 'network');
  const person = (id: string | null) => d.directory.find(o => o.id === id)?.full_name ?? '—';
  return (
    <div>
      <PageHeader title="ICT Technician Workspace" subtitle={me?.full_name ?? ''} actions={<><Button asChild><Link to="/ict">Open Helpdesk</Link></Button><Button asChild variant="outline"><Link to="/command">Daily Report</Link></Button></>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 border-y py-5">
        {([['My open tickets', open.length], ['Pending', pending.length], ['Resolved by me', resolved.length], ['Unassigned tickets', unassigned.length]] as const).map(([label, count]) => (
          <div key={label} className="min-w-0"><p className="text-sm text-muted-foreground">{label}</p><strong className="text-2xl">{count}</strong></div>
        ))}
      </div>
      <section className="py-6">
        <h2 className="font-semibold mb-3">My assigned tickets</h2>
        {!me && <p className="text-muted-foreground">Your account is not linked to a staff record yet. Ask HR to link it.</p>}
        {me && !open.length && <p className="text-muted-foreground">No open tickets assigned to you.</p>}
        {open.slice(0, 10).map(t => (
          <Link key={t.id} to="/ict" className="flex flex-wrap justify-between gap-3 border-b py-3 hover:bg-muted/40">
            <span className="min-w-0"><strong>{t.ticket_number}</strong> · {t.subject}<span className="block text-xs text-muted-foreground">{t.requester_name ?? person(t.reported_by)} · Priority: {t.priority ?? '—'}</span></span>
            <StatusBadge value={t.status ?? 'Open'} />
          </Link>
        ))}
      </section>
      <section className="pb-6">
        <h2 className="font-semibold mb-3">Network & equipment</h2>
        <p className="text-sm text-muted-foreground">{network.length} network records (routers, switches, Starlink) · {d.assets.length} ICT assets registered</p>
      </section>
      <div className="flex flex-wrap gap-2">
        {([['/ict', 'ICT Helpdesk'], ['/command', 'Daily Report'], ['/equipment-request', 'Equipment Request'], ['/supplies', 'Supply Request'], ['/classroom', 'Class Room'], ['/mail', 'Official Mail'], ['/manual', 'User Manual']] as const).map(([to, l]) => (
          <Button key={to} asChild variant="outline"><Link to={to}>{l}</Link></Button>
        ))}
      </div>
    </div>
  );
}
