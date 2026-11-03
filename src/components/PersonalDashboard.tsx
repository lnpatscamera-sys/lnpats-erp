import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { personalOptions } from '@/lib/personal-data';
import { PageHeader, StatusBadge } from './AppShell';
import { Button } from './ui/button';
export function PersonalDashboard() {
 const {session}=useAuth(); const q=useQuery({...personalOptions(session?.user.id??''),enabled:!!session});
 if(q.error) return <p role="alert">Your dashboard could not be loaded.</p>;
 if(!q.data) return <p>Loading dashboard…</p>; const d=q.data;
 return <div><PageHeader title="My Dashboard" subtitle={d.profile?.full_name??""} actions={<><Button asChild><Link to="/command">Daily Report</Link></Button><Button asChild variant="outline"><Link to="/supplies">Request for Supply</Link></Button></>}/><div className="grid grid-cols-2 lg:grid-cols-4 gap-4 border-y py-5">{[['My reports',d.reports.length],['My supply requests',d.supplies.length],['My helpdesk tickets',d.tickets.length],['Unread notifications',d.notifications.filter(n=>!n.read).length]].map(([label,count])=><div key={label} className="min-w-0"><p className="text-sm text-muted-foreground">{label}</p><strong className="text-2xl">{count}</strong></div>)}</div><section className="py-6"><h2 className="font-semibold mb-3">Recent reports</h2>{!d.reports.length&&<p className="text-muted-foreground">No daily reports.</p>}{d.reports.slice(0,5).map(r=><div key={r.id} className="flex justify-between gap-3 border-b py-3"><span>{r.report_date} · {r.duty_assignment}</span><StatusBadge value={r.status}/></div>)}</section><div className="flex flex-wrap gap-2">{([["/ict","Helpdesk"],["/command","Daily Report"],["/equipment-request","Equipment Request"],["/supplies","Supply Request"],["/manual","User Manual"],["/classroom","Class Room"],["/mail","Official Mail"]] as const).map(([to,l])=><Button key={to} asChild variant="outline"><Link to={to}>{l}</Link></Button>)}</div></div>;
}
