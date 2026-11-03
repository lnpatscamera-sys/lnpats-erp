import {isIctOfficerWorkspace, isPersonalAccount} from '@/lib/officer-access';
import {PersonalDashboard} from '@/components/PersonalDashboard';
import {ICTOfficerDashboard} from '@/components/ICTOfficerDashboard';
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Users, CalendarDays, PackageSearch, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, StatusBadge } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { LEAVE_STAGE_ROLES, SUPPLY_STAGE_ROLES } from "@/lib/workflow";
import { phase2Options } from "@/lib/phase2-data";
import { DOCUMENT_ROLES, REGISTRY_ROLES } from "@/lib/phase2";
import { Button } from '@/components/ui/button';
import { commandOptions } from '@/lib/command';
import { reportAlertHour } from '@/lib/command-rules';
import { liberiaDateOnly } from '@/lib/time';
import { OfficialMailButton } from '@/components/OfficialMail';
import { POLICE_RANKS } from '@/lib/police-ranks';

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — LNPATS ERP" }, { name: "description", content: "Command overview of LNPATS officers, leave, supply requests, and inventory." }, { property: "og:title", content: "Dashboard — LNPATS ERP" }, { property: "og:description", content: "Command overview of LNPATS officers, leave, supply requests, and inventory." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Dashboard,
});

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
const LEGEND_COLORS = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4', 'bg-chart-5'];

function Dashboard() {
 const {roles,loading}=useAuth(); if(loading)return <p>Loading dashboard…</p>;
 if(isIctOfficerWorkspace(roles)) return <ICTOfficerDashboard/>;
 return isPersonalAccount(roles)?<PersonalDashboard/>:<CommandDashboard/>;
}
function CommandDashboard() {
  const { hasAny } = useAuth();
  const qc = useQueryClient();
  const phase = useQuery(phase2Options);
  const command = useQuery(commandOptions);
  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const [o, l, s, i, a] = await Promise.all([
        supabase.from("officers").select("id, rank, employment_status"),
        supabase.from("leave_requests").select("id, leave_type, status, stage, created_at, officers!officer_id(full_name)").order("created_at", { ascending: false }),
        supabase.from("supply_requests").select("id, request_number, item_name, stage, approval_status, collection_status, priority, created_at").order("created_at", { ascending: false }),
        supabase.from("inventory_items").select("id, name, quantity, reorder_level, is_asset"),
        supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(8),
      ]);
      return { officers: o.data ?? [], leave: l.data ?? [], supply: s.data ?? [], inv: i.data ?? [], audit: a.data ?? [] };
    },
  });

  useEffect(() => {
    const ch = supabase
      .channel("dash")
      .on("postgres_changes", { event: "*", schema: "public", table: "supply_requests" }, () => qc.invalidateQueries({ queryKey: ["dashboard"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "leave_requests" }, () => qc.invalidateQueries({ queryKey: ["dashboard"] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  if (!data) return <p className="text-muted-foreground">Loading dashboard…</p>;
  const pendingLeave = data.leave.filter((l) => l.status === "Pending");
  const openSupply = data.supply.filter((s) => s.approval_status !== "Rejected" && s.stage < 8);
  const lowStock = data.inv.filter((i) => !i.is_asset && i.quantity <= i.reorder_level);
  const myLeave = pendingLeave.filter((l) => hasAny(LEAVE_STAGE_ROLES[l.stage] ?? []));
  const mySupply = openSupply.filter((s) => hasAny(SUPPLY_STAGE_ROLES[s.stage] ?? []));

  const byRank = Object.entries(data.officers.reduce<Record<string, number>>((m, o) => ((m[o.rank] = (m[o.rank] ?? 0) + 1), m), {})).map(([name, value]) => ({ name, value }));
  const byLeaveType = Object.entries(data.leave.reduce<Record<string, number>>((m, l) => ((m[l.leave_type] = (m[l.leave_type] ?? 0) + 1), m), {})).map(([name, value]) => ({ name, value }));
  const stockChart = data.inv.filter((i) => !i.is_asset).map((i) => ({ name: i.name.split(" ").slice(0, 2).join(" "), qty: i.quantity, reorder: i.reorder_level }));

  const kpis = [
    { label: "Officers", value: data.officers.length, sub: `${data.officers.filter((o) => o.employment_status === "Active").length} active`, icon: Users },
    { label: "Pending leave", value: pendingLeave.length, sub: `${myLeave.length} awaiting you`, icon: CalendarDays },
    { label: "Open supply requests", value: openSupply.length, sub: `${mySupply.length} awaiting you`, icon: PackageSearch },
    { label: "Low stock alerts", value: lowStock.length, sub: "at or below reorder level", icon: AlertTriangle },
  ];

  return (
    <div>
      <PageHeader title="Command Dashboard" subtitle="Live overview of the Academy — updates automatically" actions={<><Button asChild><Link to="/command">Daily Report</Link></Button><Button asChild variant="outline"><Link to="/supplies">Request Supply</Link></Button><OfficialMailButton /></>} />
      {command.data && <section className="border-y py-4 mb-5"><div className="flex flex-wrap gap-8 text-sm"><div>Reports submitted<strong className="block text-2xl">{command.data.summary.submitted}</strong></div><div>Outstanding reports<strong className="block text-2xl">{command.data.summary.expected-command.data.summary.submitted}</strong></div><Button variant="link" asChild><Link to="/command">Command reporting</Link></Button>{hasAny(['commandant','dc_admin','storekeeper'])&&<Button variant="link" asChild><Link to="/command-inventory">Command Inventory Overview</Link></Button>}</div>{reportAlertHour(new Date()) !== null && Number(reportAlertHour(new Date()))>=17&&command.data.summary.missing.length>0&&<div className="mt-3"><h2 className="text-sm font-semibold">OFFICERS WHO FAILED TO REPORT TODAY</h2><ul className="text-sm mt-2">{command.data.summary.missing.map(o=><li key={o.id}>{o.name} · {o.employee_number}</li>)}</ul></div>}</section>}
      <div className="flex flex-wrap gap-4 border-y py-4 mb-5 text-sm"><Link to="/registry" className="flex-1 min-w-40"><span className="text-muted-foreground">Registry pending</span><strong className="block text-2xl">{phase.data?.registry.filter(r=>r.stage<6).length ?? 0}</strong><span className="text-xs text-muted-foreground">{phase.data?.registry.filter(r=>r.stage<7&&hasAny([...(REGISTRY_ROLES[r.stage]??[]),"commandant","ict_admin"])).length ?? 0} awaiting you</span></Link><Link to="/documents" className="flex-1 min-w-40"><span className="text-muted-foreground">Document approvals</span><strong className="block text-2xl">{phase.data?.documents.filter(d=>d.status==='Pending'&&hasAny([...(DOCUMENT_ROLES[d.stage]??[]),"commandant","ict_admin"])).length ?? 0}</strong><span className="text-xs text-muted-foreground">Awaiting your review</span></Link><Link to="/leave" className="flex-1 min-w-40"><span className="text-muted-foreground">HR processing</span><strong className="block text-2xl">{phase.data?.leave.filter(l=>l.stage===5&&l.status==='Pending').length ?? 0}</strong><span className="text-xs text-muted-foreground">Leave awaiting final processing</span></Link><Link to="/search" className="self-center text-primary font-medium">Search records →</Link></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-5 flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{k.label}</div>
                <div className="text-3xl font-display font-bold mt-1">{k.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{k.sub}</div>
              </div>
              <k.icon className="h-5 w-5 text-gold" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Inventory levels vs reorder point</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer>
              <BarChart data={stockChart}>
                <XAxis dataKey="name" fontSize={11} interval={0} angle={-20} textAnchor="end" height={50} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Bar dataKey="qty" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="reorder" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardHeader><CardTitle className="text-base">Leave by type</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byLeaveType} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70}>
                  {byLeaveType.map((_, i) => <Cell key={i} fill={COLORS[i % 5]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            </div>
            {byLeaveType.length === 0 ? <p className="text-sm text-muted-foreground">No leave records.</p> : <ul className="space-y-2 text-sm">
              {byLeaveType.map((entry, i) => <li key={entry.name} className="flex items-start gap-2"><span className={`mt-1 h-3 w-3 shrink-0 rounded-sm ${LEGEND_COLORS[i % LEGEND_COLORS.length]}`} /><span className="min-w-0 flex-1 break-words">{entry.name}</span><span className="shrink-0 tabular-nums">{entry.value}</span></li>)}
            </ul>}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Awaiting your action</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {myLeave.length + mySupply.length === 0 && <p className="text-muted-foreground">Nothing pending for your role.</p>}
            {myLeave.map((l) => (
              <Link key={l.id} to="/leave" className="flex justify-between rounded-md border p-2 hover:bg-muted">
                <span>{l.leave_type} leave · {l.officers?.full_name}</span><StatusBadge value="Pending" />
              </Link>
            ))}
            {mySupply.map((s) => (
              <Link key={s.id} to="/supplies" className="flex justify-between rounded-md border p-2 hover:bg-muted">
                <span>{s.request_number} · {s.item_name}</span><StatusBadge value={s.priority} />
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardHeader><CardTitle className="text-base">Officers by rank</CardTitle></CardHeader>
          <CardContent>
            {byRank.length === 0 ? <p className="text-sm text-muted-foreground">No officer records available.</p> : <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byRank} layout="vertical" margin={{ left: 8, right: 16 }}>
                <XAxis type="number" fontSize={11} allowDecimals={false} />
                <YAxis type="category" dataKey="name" fontSize={11} width={85} interval={0} tickFormatter={(name: string) => POLICE_RANKS.find(rank => rank.name === name)?.abbreviation ?? name} />
                <Tooltip />
                <Bar dataKey="value" fill="var(--chart-3)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
            </div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Recent activity</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {data.audit.length === 0 && <p className="text-muted-foreground">Activity is visible to the Commandant and Deputy Commissioners.</p>}
            {data.audit.map((a) => (
              <div key={a.id} className="flex justify-between gap-2 border-b pb-1">
                <span className="truncate">{a.user_email ?? "system"} · {a.action.toLowerCase()} {a.table_name.replace("_", " ")}</span>
                <span className="text-xs text-muted-foreground shrink-0">{liberiaDateOnly(a.created_at)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
