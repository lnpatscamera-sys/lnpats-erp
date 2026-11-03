import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export const phase2Options = queryOptions({
  queryKey: ["phase2"],
  queryFn: async () => {
    const results = await Promise.all([
      supabase.from("correspondence").select("*").order("created_at", { ascending: false }),
      supabase.from("erp_documents").select("*").order("created_at", { ascending: false }),
      supabase.from("document_versions").select("*").order("version", { ascending: false }),
      supabase.from("officers").select("id,full_name,rank,service_number,personnel_category,user_id,office_id,section_id").order("full_name"),
      supabase.from("offices").select("id,name").order("rank_order"),
      supabase.from("sections").select("id,name"),
      supabase.from("leave_requests").select("*,officers!officer_id(full_name,rank,service_number)").order("created_at", { ascending: false }),
      supabase.from("leave_balances").select("*"),
    ]);
    for (const result of results) if (result.error) throw result.error;
    const [registry, documents, versions, officers, offices, sections, leave, balances] = results;
    return { registry: registry.data ?? [], documents: documents.data ?? [], versions: versions.data ?? [], officers: officers.data ?? [], offices: offices.data ?? [], sections: sections.data ?? [], leave: leave.data ?? [], balances: balances.data ?? [] };
  },
});

export type FileRecord = { path: string; name: string };
export function fileRecords(value: Json): FileRecord[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap(v => v && typeof v === "object" && !Array.isArray(v) && typeof v['path'] === "string" && typeof v['name'] === "string" ? [{ path: v['path'], name: v['name'] }] : []);
}
export function historyRecords(value: Json): { action: string; by: string; at: string; note: string }[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap(v => v && typeof v === "object" && !Array.isArray(v) ? [{ action: String(v['action'] ?? ""), by: String(v['by'] ?? ""), at: String(v['at'] ?? ""), note: String(v['note'] ?? "") }] : []);
}
export async function uploadPhaseFile(file: File, userId: string): Promise<FileRecord> {
  const path = `${userId}/${crypto.randomUUID()}/${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const { error } = await supabase.storage.from("phase2-files").upload(path, file);
  if (error) throw error;
  return { path, name: file.name };
}
export async function openPhaseFile(file: FileRecord, module: string, id: string, download = false) {
  const activity = await supabase.rpc("record_activity", { _module: module, _id: id, _action: download ? "DOWNLOAD" : "VIEW" });
  if (activity.error) throw activity.error;
  const { data, error } = await supabase.storage.from("phase2-files").createSignedUrl(file.path, 300, download ? { download: file.name } : undefined);
  if (error) throw error;
  window.open(data.signedUrl, "_blank", "noopener,noreferrer");
}