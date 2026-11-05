import { PrintLetterhead } from "@/components/PrintLetterhead";
import { ForcePasswordChange } from "@/components/ForcePasswordChange";
import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  LayoutDashboard, Users, CalendarDays, PackageSearch, Boxes, GraduationCap, Wallet, ShoppingCart,
    Truck, Briefcase, LifeBuoy, FileText, ShieldCheck, ScrollText, Bell, Moon, Sun, LogOut, Menu, Building2, Search,
  Inbox as InboxIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, ROLE_LABELS } from "@/lib/auth";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { OfficialMailNavLink } from "./OfficialMail";
import { canOpenOfficerPath, isIctOfficerWorkspace, isPersonalAccount, isInstructorWorkspace } from "@/lib/officer-access";

type NavItem = { to: string; label: string; icon: typeof Users; params?: Record<string, string> };
const NAV: { group: string; items: NavItem[] }[] = [
  { group: "Overview", items: [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }, { to: "/organization", label: "Organization", icon: Building2 }] },
  {
    group: "Operations",
    items: [
      { to: "/officers", label: "Officers", icon: Users },
      { to: "/training", label: "Training", icon: GraduationCap },
      { to: "/finance", label: "Finance", icon: Wallet },
      { to: "/procurement", label: "Procurement", icon: ShoppingCart },
      { to: "/hr", label: "Human Resources", icon: Briefcase },
      { to: "/ict", label: "ICT Helpdesk", icon: LifeBuoy },
      { to: "/command", label: "Command & Daily Reports", icon: FileText },
      { to: "/facilities", label: "Facility Management", icon: Building2 },
      { to: "/security", label: "Internal Security (ISS)", icon: ShieldCheck },
      { to: "/notifications", label: "Notification Center", icon: Bell },
      { to: "/leave", label: "Leave", icon: CalendarDays },
      { to: "/supplies", label: "Supply Requests", icon: PackageSearch },
      { to: "/inventory", label: "Inventory Items", icon: Boxes },
      { to: "/registry", label: "Registry", icon: FileText },
      { to: "/documents", label: "Documents", icon: FileText },
      { to: "/search", label: "Global Search", icon: Search },
    ],
  },
  {
    group: "Logistics",
    items: [
      { to: "/stock-movements", label: "Stock Movements", icon: ScrollText },
      { to: "/command-inventory", label: "Command Inventory", icon: Boxes },
      { to: "/equipment-requests", label: "Equipment Requests", icon: PackageSearch },
      { to: "/receipts", label: "Store Receipts", icon: Boxes },
      { to: "/issues", label: "Store Issues", icon: Boxes },
      { to: "/suppliers", label: "Suppliers", icon: Building2 },
      { to: "/assets", label: "Assets", icon: Boxes },
      { to: "/vehicle-bookings", label: "Vehicle Bookings", icon: Truck },
    ],
  },
  {
    group: "Coming next",
    items: [
      { to: "/modules/$module", params: { module: "transport" }, label: "Transport", icon: Truck },
    ],
  },
  { group: "Administration", items: [{ to: "/audit", label: "Audit Log", icon: ScrollText }, { to: "/admin/users", label: "Users & Roles", icon: ShieldCheck }, { to: "/admin/letterhead", label: "Report Letterhead", icon: FileText }, { to: "/manual", label: "User Manual", icon: FileText }] },
];

function SideNav({ onNav }: { onNav?: () => void }) {
  const { hasAny, roles } = useAuth();
  const ictWorkspace=isIctOfficerWorkspace(roles);
  const instructorWorkspace=isInstructorWorkspace(roles);
  const personal=isPersonalAccount(roles)||ictWorkspace;
  const groups: typeof NAV = instructorWorkspace ? [{group:'Instructor workspace',items:[
    {to:'/dashboard',label:'Dashboard',icon:LayoutDashboard}, {to:'/command',label:'Daily Report',icon:FileText},
    {to:'/training',label:'Training Management',icon:GraduationCap}, {to:'/course-materials',label:'Course Materials',icon:FileText},
    {to:'/lesson-plans',label:'Lesson Plans',icon:FileText}, {to:'/training-schedule',label:'Training Schedule',icon:CalendarDays},
    {to:'/class-attendance',label:'Class Attendance',icon:Users}, {to:'/examinations',label:'Examination & Assessment',icon:GraduationCap},
    {to:'/student-performance',label:'Student Performance Records',icon:ScrollText}, {to:'/manual',label:'User Manual',icon:FileText},
    {to:'/mail',label:'Official Mail',icon:InboxIcon}, {to:'/notifications',label:'Notifications',icon:Bell},
    {to:'/ict',label:'ICT Helpdesk',icon:LifeBuoy}, {to:'/equipment-request',label:'Equipment Request',icon:Boxes},
    {to:'/supplies',label:'Supply Request',icon:PackageSearch},
  ]}] : personal ? [{group:ictWorkspace?'ICT workspace':'My workspace',items:[
    {to:'/dashboard',label:'Dashboard',icon:LayoutDashboard}, {to:'/ict',label:ictWorkspace?'ICT Helpdesk':'Helpdesk',icon:LifeBuoy},
    {to:'/command',label:'Daily Report',icon:FileText}, {to:'/equipment-request',label:'Equipment Request',icon:Boxes},
    {to:'/supplies',label:'Supply Request',icon:PackageSearch}, {to:'/classroom',label:'Class Room',icon:GraduationCap},
    {to:'/mail',label:'Official Mail',icon:InboxIcon}, {to:'/manual',label:'User Manual',icon:FileText},
  ]}] : NAV;
  return (
    <nav className="flex flex-col gap-6 p-4 text-sm">
      <div className="flex items-center gap-3 px-2">
        <Logo className="h-11 w-11 ring-2 ring-sidebar-primary" />
        <div className="leading-tight">
          <div className="font-display font-bold text-sidebar-accent-foreground">LNPATS ERP</div>
          <div className="text-[11px] text-sidebar-foreground/60">Police Academy & Training</div>
        </div>
      </div>
      {groups.map((g) => (
        <div key={g.group}>
          <div className="px-2 mb-1 text-[10px] uppercase tracking-widest text-sidebar-foreground/50">{g.group}</div>
          {g.items.filter(i => i.to !== '/command-inventory' || hasAny(['commandant','dc_admin','storekeeper'])).map((i) => (
            <Link
              key={i.label}
              to={i.to as "/dashboard"}
              params={i.params as never}
              onClick={onNav}
              className="flex items-center gap-3 rounded-md px-2 py-2 text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{ className: "bg-sidebar-accent text-sidebar-primary font-medium" }}
            >
              <i.icon className="h-4 w-4" /> {i.label}
            </Link>
          ))}
        </div>
      ))}
      {!personal && <div><div className="px-2 mb-1 text-[10px] uppercase tracking-widest text-sidebar-foreground/50">Email</div><Link to="/mail" onClick={onNav} className="flex items-center gap-3 rounded-md px-2 py-2 text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" activeProps={{ className: "bg-sidebar-accent text-sidebar-primary font-medium" }}><InboxIcon className="h-4 w-4" /> Inbox (in ERP)</Link><OfficialMailNavLink /></div>}
    </nav>
  );
}

function Notifications() {
  const {session,roles}=useAuth();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["notifications",session?.user.id],
    queryFn: async () => (await supabase.from("notifications").select("*").eq("user_id",session?.user.id??"").order("created_at", { ascending: false }).limit(20)).data ?? [],
    refetchInterval: 30000,
    enabled:!!session,
  });
  const unread = (data ?? []).filter((n) => !n.read);
  const markAll = async () => {
    if (!unread.length) return;
    await supabase.from("notifications").update({ read: true }).in("id", unread.map((n) => n.id));
    qc.invalidateQueries({ queryKey: ["notifications"] });
  };
  return (
    <Popover onOpenChange={(o) => !o && markAll()}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unread.length > 0 && <span className="absolute -top-0.5 -right-0.5 rounded-full bg-destructive text-destructive-foreground text-[10px] px-1.5">{unread.length}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="px-4 py-2 border-b font-medium text-sm"><Link to={isPersonalAccount(roles)?"/my-activities":"/notifications"}>Notifications</Link></div>
        <div className="max-h-80 overflow-auto">
          {(data ?? []).length === 0 && <p className="p-4 text-sm text-muted-foreground">No notifications yet.</p>}
          {(data ?? []).map((n) => (
            <div key={n.id} className={`px-4 py-2 border-b text-sm ${n.read ? "" : "bg-accent/40"}`}>
              <div className="font-medium">{n.title}</div>
              <div className="text-muted-foreground text-xs">{n.body}</div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function AppShell() {
  const { session, roles, loading } = useAuth();
  const pathname=useRouterState({select:s=>s.location.pathname});
  const nav = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(() => typeof document !== "undefined" && document.documentElement.classList.contains("dark"));
  const toggle = () => {
    const d = !dark;
    setDark(d);
    document.documentElement.classList.toggle("dark", d);
    localStorage.setItem("theme", d ? "dark" : "light");
  };
  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    nav({ to: "/auth", replace: true });
  };
  const topRole = roles.find((r) => r !== "officer") ?? "officer";
  if (session?.user.user_metadata?.['must_change_password'] === true) return <ForcePasswordChange />;

  return (
    <div className="min-h-screen flex">
      <aside className="no-print hidden lg:block w-64 shrink-0 bg-sidebar border-r border-sidebar-border sticky top-0 h-screen overflow-y-auto">
        <SideNav />
      </aside>
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="stripe-band no-print" />
        <header className="no-print h-14 border-b bg-card flex items-center gap-2 px-4 sticky top-0 z-20">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 bg-sidebar border-sidebar-border overflow-y-auto">
              <SideNav onNav={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="flex-1" />
          <div className="hidden sm:block text-right text-xs leading-tight mr-2">
            <div className="font-medium">{session?.user.email}</div>
            <div className="text-muted-foreground">{ROLE_LABELS[topRole]}</div>
          </div>
          <Notifications />
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">{dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</Button>
          <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out"><LogOut className="h-5 w-5" /></Button>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          <PrintLetterhead />
          {loading ? <p>Loading account…</p> : canOpenOfficerPath(roles,pathname) ? <Outlet /> : <div role="alert"><PageHeader title="Access Denied"/><p className="text-muted-foreground">Your account is not authorized to access this page.</p></div>}
        </main>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
        {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap gap-2 no-print">{actions}</div>
    </div>
  );
}

export function StatusBadge({ value }: { value: string }) {
  const tone =
    value === "Approved" || value === "Collected" || value === "Active"
      ? "bg-success/15 text-success"
      : value === "Rejected"
        ? "bg-destructive/15 text-destructive"
        : value === "Ready for Collection" || value === "Urgent" || value === "High"
          ? "bg-gold/20 text-accent-foreground"
          : "bg-secondary text-secondary-foreground";
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>{value}</span>;
}
