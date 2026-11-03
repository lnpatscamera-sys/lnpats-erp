import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { personalOptions } from "@/lib/personal-data";
import { PageHeader, StatusBadge } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/classroom")({
  head: () => ({ meta: [{ title: "My Class Room — LNPATS ERP" }, { name: "description", content: "Your own training courses, records and progress." }, { property: "og:title", content: "My Class Room — LNPATS ERP" }, { property: "og:description", content: "Your own training courses, records and progress." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Classroom,
});

function label(details: unknown) {
  const d = (details && typeof details === "object" ? details : {}) as Record<string, unknown>;
  return String(d['course'] ?? d['title'] ?? d['program'] ?? d['name'] ?? d['type'] ?? "Training record");
}

function Classroom() {
  const { session } = useAuth();
  const q = useQuery({ ...personalOptions(session?.user.id ?? ""), enabled: !!session });
  if (q.error) return <p role="alert">Your class room could not be loaded.</p>;
  if (!q.data) return <p>Loading class room…</p>;
  const rows = q.data.training;
  return <div>
    <PageHeader title="My Class Room" subtitle="Your own training courses and records" />
    {!rows.length && <p className="text-muted-foreground py-6">You have no training records yet.</p>}
    {rows.map(r => <div key={r.id} className="flex justify-between gap-3 border-b py-3">
      <span className="min-w-0 truncate">{label(r.details)} · {r.created_at.slice(0, 10)}</span>
      <StatusBadge value={r.status} />
    </div>)}
  </div>;
}
