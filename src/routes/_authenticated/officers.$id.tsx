import { idLabel } from '@/lib/hr-enrollment';
import { formValues } from "@/lib/export";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader, StatusBadge } from "@/components/AppShell";
import { StaffIdCard } from "@/components/StaffIdCard";
import { PassportPhotoPicker, uploadOfficerPhoto } from "@/components/PassportPhoto";
import { retirementSummary } from "@/lib/hr-enrollment";
import { liberiaDate } from "@/lib/time";
import { useAuth } from "@/lib/auth";
import { policeRankOptions } from "@/lib/police-ranks";
import { openOutlookApp } from "@/lib/official-mail";
import { FileText } from "lucide-react";
import { PersonnelReportModal } from "@/components/PersonnelReportModal";

export const Route = createFileRoute("/_authenticated/officers/$id")({
  head: () => ({ meta: [{ title: "Officer Profile — LNPATS ERP" }, { name: "description", content: "View an LNPATS officer profile, service details, and identification card." }, { property: "og:title", content: "Officer Profile — LNPATS ERP" }, { property: "og:description", content: "View an LNPATS officer profile, service details, and identification card." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: OfficerPage,
});

const LONG_FIELDS = [
  ["education", "Educational background"], ["training_history", "Training history"], ["promotion_history", "Promotion history"],
  ["commendations", "Commendations"], ["disciplinary_actions", "Disciplinary actions"], ["medical_info", "Medical information"],
  ["next_of_kin", "Next of kin"], ["emergency_contact", "Emergency contact"], ["address", "Address"],
] as const;

function OfficerPage() {
  const { id } = Route.useParams();
  const { hasAny } = useAuth();
  const qc = useQueryClient();
  const [edit, setEdit] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const { data: o, error } = useQuery({
    queryKey: ["officer", id],
    // sections also points back at officers (section head), so both embeds must name their relation.
    queryFn: async () => {
      const r = await supabase
        .from("officers")
        .select("*, sections!officers_section_id_fkey(name), offices!officers_office_id_fkey(name)")
        .eq("id", id)
        .single();
      if (r.error) throw r.error;
      return r.data;
    },
  });
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  if (error) return <p className="text-muted-foreground">This officer profile could not be loaded. Please try again, or contact ICT if it keeps happening.</p>;
  if (!o) return <p className="text-muted-foreground">Loading…</p>;
  const canEdit = hasAny(["hr_officer", "commandant"]);
  const canPhoto = hasAny(["hr_admin", "hr_officer"]);
  const canGenerateReport = hasAny(["hr_admin", "hr_officer", "ict_admin", "system_admin"]);

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = formValues(e.currentTarget);
    const { error } = await supabase.from("officers").update({ ...f, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Profile updated");
    setEdit(false);
    qc.invalidateQueries({ queryKey: ["officer", id] });
  };

  return (
    <div>
      <div className="no-print mb-2"><Link to="/officers" className="text-sm text-muted-foreground hover:underline">← All officers</Link></div>
      <PageHeader
        title={`${o.rank} ${o.full_name}`}
        subtitle={`${idLabel((o as {personnel_category?:string|null}).personnel_category)}: ${o.service_number} · ${o.position ?? ""}`}
        actions={
          <>
            {canGenerateReport && (
              <Button
                variant="default"
                className="gap-2 bg-primary text-primary-foreground font-semibold shadow-sm"
                onClick={() => setReportOpen(true)}
              >
                <FileText className="h-4 w-4" /> Generate Report
              </Button>
            )}
            <Button variant="outline" onClick={() => window.print()}>Print ID card</Button>
            {canEdit && <Button onClick={() => setEdit(!edit)}>{edit ? "Cancel" : "Edit profile"}</Button>}
          </>
        }
      />
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <StaffIdCard e={{ ...o, department: o.offices?.name ?? null }} />
          {(() => { const r = retirementSummary(o.date_of_birth, liberiaDate()); return r && <div className="no-print text-sm text-center"><div>Age <strong>{r.age}</strong> · <strong>{r.remaining}</strong> years to retirement</div><div className="text-xs text-muted-foreground">Retirement eligibility: {r.date}</div></div>; })()}
          {canPhoto && (
            <div className="no-print">
              <PassportPhotoPicker currentPath={o.photo_url} onChange={setPhotoBlob} />
              {photoBlob && <Button size="sm" className="mt-2" onClick={() => uploadOfficerPhoto(id, photoBlob).then(() => { setPhotoBlob(null); toast.success('Photo saved'); qc.invalidateQueries({ queryKey: ['officer', id] }); }).catch(err => toast.error(err.message))}>Save photo</Button>}
            </div>
          )}
        </div>

        <Card className="lg:col-span-2 no-print">
          <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
          <CardContent>
            {edit ? (
              <form onSubmit={save} className="grid sm:grid-cols-2 gap-3">
                {(["full_name", "rank", "phone", "email", "county", "nationality", "marital_status", "position", "current_assignment", "employment_status"] as const).map((k) => (
                  <div key={k} className="space-y-1"><Label className="capitalize">{k.replace("_", " ")}</Label>{k === "rank" ? <select name="rank" aria-label="Rank" defaultValue={o.rank} required className="w-full h-9 rounded-md border bg-background px-2 text-sm">{policeRankOptions(o.rank).map(r => <option key={r.value} value={r.value}>{r.label}</option>)}</select> : <Input name={k} defaultValue={o[k] ?? ""} />}</div>
                ))}
                {LONG_FIELDS.map(([k, l]) => (
                  <div key={k} className="space-y-1 sm:col-span-2"><Label>{l}</Label><Textarea name={k} defaultValue={o[k] ?? ""} rows={2} /></div>
                ))}
                <Button className="sm:col-span-2">Save changes</Button>
              </form>
            ) : (
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <Row l="Status" v={<StatusBadge value={o.employment_status} />} />
                <Row l="Date of birth" v={o.date_of_birth} />
                <Row l="Gender" v={o.gender} />
                <Row l="Marital status" v={o.marital_status} />
                <Row l="Nationality" v={o.nationality} />
                <Row l="County" v={o.county} />
                <Row l="Phone" v={o.phone} />
                <Row l="Email" v={o.email} />
                {o.official_email && <div className="flex items-center justify-between gap-2 text-sm"><span className="text-muted-foreground">Official email</span><span className="flex items-center gap-2 break-all">{o.official_email}<button type="button" className="text-primary underline text-xs whitespace-nowrap" onClick={() => openOutlookApp(o.official_email)} title="Open Outlook on this computer">Open in Outlook app</button></span></div>}
                <Row l="Date joined LNP" v={o.date_joined} />
                <Row l="Office" v={o.offices?.name} />
                <Row l="Section" v={o.sections?.name} />
                <Row l="Current assignment" v={o.current_assignment} />
                {LONG_FIELDS.map(([k, l]) => <Row key={k} l={l} v={o[k]} />)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {reportOpen && (
        <PersonnelReportModal officerId={id} onClose={() => setReportOpen(false)} />
      )}
    </div>
  );
}

function Row({ l, v }: { l: string; v: React.ReactNode }) {
  return <div><div className="text-xs text-muted-foreground">{l}</div><div>{v || "—"}</div></div>;
}
