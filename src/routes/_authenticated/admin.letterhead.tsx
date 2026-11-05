import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { getBranding, clearBrandingCache, DEFAULT_FOOTER } from "@/lib/letterhead";
import { exportPdf } from "@/lib/export";

const meta = "Replace the official letterhead and footer used on every LNPATS report.";
export const Route = createFileRoute("/_authenticated/admin/letterhead")({
  head: () => ({ meta: [{ title: "Report Letterhead — LNPATS ERP" }, { name: "description", content: meta }, { property: "og:title", content: "Report Letterhead — LNPATS ERP" }, { property: "og:description", content: meta }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: LetterheadAdmin,
});

function LetterheadAdmin() {
  const { roles, session } = useAuth(); const user = session?.user;
  const [url, setUrl] = useState("");
  const [footer, setFooter] = useState(DEFAULT_FOOTER);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const load = () => getBranding().then(b => { setUrl(b.url); setFooter(b.footer); });
  useEffect(() => { load(); }, []);
  if (!roles.includes("system_admin")) return <p className="text-muted-foreground">Only System Administrators can change the report letterhead.</p>;

  const save = async (reset = false) => {
    setBusy(true);
    try {
      let path: string | null | undefined = reset ? null : undefined;
      if (file && !reset) {
        if (!/^image\/(png|jpeg)$/.test(file.type) || file.size > 5e6) throw new Error("Use a PNG or JPG under 5 MB.");
        path = `letterhead/${crypto.randomUUID()}.${file.type === "image/png" ? "png" : "jpg"}`;
        const up = await supabase.storage.from("branding").upload(path, file, { contentType: file.type });
        if (up.error) throw up.error;
      }
      const patch: { footer_text: string; updated_by: string | null; letterhead_path?: string | null } = { footer_text: reset ? DEFAULT_FOOTER : footer.trim() || DEFAULT_FOOTER, updated_by: user?.id ?? null };
      if (path !== undefined) patch.letterhead_path = path;
      const { error } = await supabase.from("report_branding").update(patch).eq("id", 1);
      if (error) throw error;
      clearBrandingCache(); setFile(null); await load();
      toast.success(reset ? "Original letterhead restored" : "Letterhead updated for all reports");
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };

  return <div className="space-y-4">
    <PageHeader title="Report Letterhead" subtitle="Used on every PDF, Word, Excel and printed report" />
    <Card className="p-4 space-y-4">
      <div><p className="text-sm font-medium mb-2">Current letterhead</p>{url && <img src={url} alt="Current report letterhead" className="max-h-40 border rounded" />}</div>
      <label className="block text-sm font-medium">Replace with new image (PNG/JPG, wide banner)
        <Input type="file" accept="image/png,image/jpeg" onChange={e => setFile(e.target.files?.[0] ?? null)} className="mt-1" /></label>
      <label className="block text-sm font-medium">Footer text<Textarea value={footer} onChange={e => setFooter(e.target.value)} className="mt-1" /></label>
      <div className="flex flex-wrap gap-2">
        <Button disabled={busy} onClick={() => save()}>Save</Button>
        <Button variant="outline" disabled={busy} onClick={() => save(true)}>Restore original</Button>
        <Button variant="outline" onClick={() => exportPdf("Letterhead sample report", [{ Item: "Sample", Detail: "Preview of the letterhead, report number, signature and footer" }])}>Download sample PDF</Button>
      </div>
    </Card>
  </div>;
}
