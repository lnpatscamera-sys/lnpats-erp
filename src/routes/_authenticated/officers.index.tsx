import { formValues } from "@/lib/export";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader, StatusBadge } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { exportCsv } from "@/lib/export";
import { policeRankOptions } from "@/lib/police-ranks";
import { FileText } from "lucide-react";
import { PersonnelReportModal } from "@/components/PersonnelReportModal";

export const Route = createFileRoute("/_authenticated/officers/")({
  head: () => ({ meta: [{ title: "Officers — LNPATS ERP" }, { name: "description", content: "Manage LNPATS officer profiles, service numbers, and assignments." }, { property: "og:title", content: "Officers — LNPATS ERP" }, { property: "og:description", content: "Manage LNPATS officer profiles, service numbers, and assignments." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Officers,
});

function Officers() {
  const { hasAny } = useAuth();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [reportOfficerId, setReportOfficerId] = useState<string | null>(null);

  const canGenerateReport = hasAny(["hr_admin", "hr_officer", "ict_admin", "system_admin"]);

  const { data } = useQuery({
    queryKey: ["officers"],
    queryFn: async () => {
      const [o, s, of] = await Promise.all([
        supabase.from("officers").select("*, sections!officers_section_id_fkey(name), offices!officers_office_id_fkey(name)").order("service_number"),
        supabase.from("sections").select("id,name").order("name"),
        supabase.from("offices").select("id,name").order("rank_order"),
      ]);
      return { officers: o.data ?? [], sections: s.data ?? [], offices: of.data ?? [] };
    },
  });
  const rows = (data?.officers ?? []).filter((o) => `${o.full_name} ${o.service_number} ${o.rank} ${o.sections?.name}`.toLowerCase().includes(q.toLowerCase()));
  const canEdit = hasAny(["hr_officer", "commandant"]);

  const create = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = formValues(e.currentTarget);
    const { error } = await supabase.from("officers").insert({
      service_number: f.service_number, full_name: f.full_name, rank: f.rank, gender: f.gender || null,
      phone: f.phone || null, email: f.email || null, county: f.county || null, position: f.position || null,
      date_joined: f.date_joined || null, date_of_birth: f.date_of_birth || null,
      section_id: f.section_id || null, office_id: f.office_id || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Officer added");
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["officers"] });
  };

  return (
    <div>
      <PageHeader
        title="Officer Management"
        subtitle={`${data?.officers.length ?? 0} officers on record`}
        actions={
          <>
            <Button variant="outline" onClick={() => exportCsv("officers.csv", rows.map((o) => ({ service_number: o.service_number, rank: o.rank, name: o.full_name, section: o.sections?.name, position: o.position, status: o.employment_status, phone: o.phone })))}>Export CSV</Button>
            {canEdit && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild><Button>Add officer</Button></DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader><DialogTitle>New officer profile</DialogTitle></DialogHeader>
                  <form onSubmit={create} className="grid sm:grid-cols-2 gap-3">
                    <F name="service_number" label="Service number" required />
                    <F name="full_name" label="Full name" required />
                    <div className="space-y-1"><Label>Rank</Label>
                      <select name="rank" aria-label="Rank" required className="w-full h-9 rounded-md border bg-background px-2 text-sm"><option value="">Select rank</option>{policeRankOptions().map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}</select>
                    </div>
                    <div className="space-y-1"><Label>Gender</Label>
                      <select name="gender" className="w-full h-9 rounded-md border bg-background px-2 text-sm"><option>Male</option><option>Female</option></select>
                    </div>
                    <F name="date_of_birth" label="Date of birth" type="date" />
                    <F name="date_joined" label="Date joined LNP" type="date" />
                    <F name="phone" label="Phone" />
                    <F name="email" label="Email" type="email" />
                    <F name="county" label="County" />
                    <F name="position" label="Position" />
                    <div className="space-y-1"><Label>Office</Label>
                      <select name="office_id" className="w-full h-9 rounded-md border bg-background px-2 text-sm"><option value="">—</option>{data?.offices.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select>
                    </div>
                    <div className="space-y-1"><Label>Section</Label>
                      <select name="section_id" className="w-full h-9 rounded-md border bg-background px-2 text-sm"><option value="">—</option>{data?.sections.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select>
                    </div>
                    <Button className="sm:col-span-2">Save officer</Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </>
        }
      />
      <Input placeholder="Search by name, service number, rank or section…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-md mb-4" />
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service #</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Rank</TableHead>
              <TableHead className="hidden md:table-cell">Section</TableHead>
              <TableHead className="hidden md:table-cell">Position</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-mono text-xs">{o.service_number}</TableCell>
                <TableCell><Link to="/officers/$id" params={{ id: o.id }} className="font-medium text-primary hover:underline">{o.full_name}</Link></TableCell>
                <TableCell>{o.rank}</TableCell>
                <TableCell className="hidden md:table-cell">{o.sections?.name}</TableCell>
                <TableCell className="hidden md:table-cell">{o.position}</TableCell>
                <TableCell><StatusBadge value={o.employment_status} /></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end items-center gap-1">
                    {canGenerateReport && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 text-xs"
                        onClick={() => setReportOfficerId(o.id)}
                      >
                        <FileText className="h-3.5 w-3.5 text-primary" /> Report
                      </Button>
                    )}
                    <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                      <Link to="/officers/$id" params={{ id: o.id }}>View</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {reportOfficerId && (
        <PersonnelReportModal officerId={reportOfficerId} onClose={() => setReportOfficerId(null)} />
      )}
    </div>
  );
}

function F({ name, label, type = "text", required }: { name: string; label: string; type?: string; required?: boolean }) {
  return <div className="space-y-1"><Label>{label}</Label><Input name={name} type={type} required={required} /></div>;
}
