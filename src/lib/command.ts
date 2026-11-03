import { queryOptions, type QueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { liberiaDate } from './command-rules';
export type Person = { id: string; full_name: string; employee_number: string | null; user_id: string | null; office_id: string | null; section_id: string | null; supervisor_id: string | null; employment_status: string };
export type Directory = { officers: Person[]; sections: { id: string; name: string; office_id: string; section_head: string | null }[]; offices: { id: string; name: string }[]; appointments: { id: string; kind: string; office_id: string | null; officer_id: string }[] };
export type ReportSummary = { date: string; workday: boolean; expected: number; submitted: number; missing: { id: string; name: string; employee_number: string | null }[] };
export type ChainStep = { level: string; user_id: string; name: string };
export function chainSteps(value: Json): ChainStep[] { return Array.isArray(value) ? value.flatMap(v => v && typeof v === 'object' && !Array.isArray(v) ? [{ level: String(v['level']), user_id: String(v['user_id']), name: String(v['name']) }] : []) : []; }
export const commandOptions = queryOptions({ queryKey: ['command'], queryFn: async () => {
  const [directory, summary] = await Promise.all([supabase.rpc('command_directory'), supabase.rpc('command_report_summary', { _date: liberiaDate() })]);
  if (directory.error) throw directory.error; if (summary.error) throw summary.error;
  const reports = []; const compilations = [];
  for (let offset = 0; ; offset += 1000) { const r = await supabase.from('daily_reports').select('*').order('report_date', { ascending: false }).order('id').range(offset, offset + 999); if (r.error) throw r.error; reports.push(...r.data); if (r.data.length < 1000) break; }
  for (let offset = 0; ; offset += 1000) { const r = await supabase.from('compiled_reports').select('*').order('created_at', { ascending: false }).order('id').range(offset, offset + 999); if (r.error) throw r.error; compilations.push(...r.data); if (r.data.length < 1000) break; }
  return { directory: directory.data as unknown as Directory, summary: summary.data as unknown as ReportSummary, reports, compilations };
} });
export async function refreshCommand(qc: QueryClient) { await Promise.all(['command', 'notifications', 'supplies', 'dashboard', 'command-inventory', 'inventory', 'procurement', 'notification-center', 'supply-evidence', 'command-accounts'].map(k => qc.invalidateQueries({ queryKey: [k] }))); }
// The generated RPC types omit PostgreSQL's nullable UUID arguments; send explicit null for creation, not undefined.
export async function reportAction(id: string | null, action: string, payload: Json = {}) { const r = await supabase.rpc('daily_report_action', { _id: id as string, _action: action, _payload: payload }); if (r.error) throw r.error; return r.data; }
export async function supplyCommandAction(id: string | null, action: string, payload: Json = {}) { const r = await supabase.rpc('command_supply_action', { _id: id as string, _action: action, _payload: payload }); if (r.error) throw r.error; return r.data; }
export async function compilationAction(id: string, action: string, payload: Json = {}) { const r = await supabase.rpc('compilation_action', { _id: id, _action: action, _payload: payload }); if (r.error) throw r.error; return r.data; }
export async function uploadCommandFile(file: File, userId: string) { const path = `${userId}/${crypto.randomUUID()}/${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`; const r = await supabase.storage.from('command-files').upload(path, file); if (r.error) throw r.error; return { path, name: file.name }; }
export async function openCommandFile(path: string) { const r = await supabase.storage.from('command-files').createSignedUrl(path, 300); if (r.error) throw r.error; window.open(r.data.signedUrl, '_blank', 'noopener,noreferrer'); }
export async function exportCommandWord(title: string, rows: Record<string, unknown>[]) {
  const { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType, Header, BorderStyle, TextWrappingType } = await import('docx');
  const { LETTERHEAD_LINES, crestUrls, imageBytes, currentWriter, writerLines } = await import('./letterhead');
  const [left, right, writer] = await Promise.all([imageBytes(crestUrls.left).catch(() => null), imageBytes(crestUrls.right).catch(() => null), currentWriter().catch(() => null)]);
  const crest = (data: Uint8Array, x: number) => new ImageRun({ type: 'jpg', data, transformation: { width: 80, height: 78 }, floating: { horizontalPosition: { offset: x }, verticalPosition: { offset: 300000 }, wrap: { type: TextWrappingType.NONE }, behindDocument: true } });
  const sizes = [34, 28, 26, 22];
  const header = new Header({ children: LETTERHEAD_LINES.map((t, i) => new Paragraph({ alignment: AlignmentType.CENTER, ...(i === 3 ? { border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: '000000', space: 4 } } } : {}), children: [...(i === 0 && left ? [crest(left, 600000)] : []), ...(i === 0 && right ? [crest(right, 5900000)] : []), new TextRun({ text: t, bold: i === 0, size: sizes[i] ?? 22 })] })) });
  const writerParas = writer ? writerLines(writer).map((l, i) => new Paragraph({ children: [new TextRun({ text: l, bold: i === 0 })] })) : [];
  const doc = new Document({ sections: [{ headers: { default: header }, children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: title, bold: true, size: 28 })] }), ...writerParas, new Paragraph({ text: '' }), ...rows.flatMap(r => Object.entries(r).map(([k, v]) => new Paragraph({ children: [new TextRun({ text: `${k}: `, bold: true }), new TextRun(String(v ?? ''))] }))) ] }] });
  const blob = await Packer.toBlob(doc); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${title}.docx`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}