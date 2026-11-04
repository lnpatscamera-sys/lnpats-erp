import leftCrest from '@/assets/letterhead-left.jpg.asset.json';
import rightCrest from '@/assets/letterhead-right.jpg.asset.json';
import { supabase } from '@/integrations/supabase/client';
import { POLICE_RANKS } from '@/lib/police-ranks';

export const LETTERHEAD_LINES = [
  'Republic of Liberia',
  'Ministry of Justice',
  'Liberia National Police Academy & Training School',
  'Paynesville, Montserrado County, Liberia',
] as const;

export type ReportWriter = { name: string; position: string; section: string; email: string; contact: string };

/** "Superintendent of Police" + "Prince F. Cole" → "SUPT. Prince F. Cole". Unknown ranks are kept as written. */
export function rankInitialName(rank: string | null | undefined, fullName: string) {
  if (!rank) return fullName;
  const abbr = POLICE_RANKS.find(r => r.name === rank || r.abbreviation === rank)?.abbreviation ?? rank;
  return `${abbr} ${fullName}`;
}

export function writerLines(w: ReportWriter) {
  return [w.name, w.position, w.section, [w.email, w.contact].filter(Boolean).join(' · ')].filter(Boolean);
}

/** The signed-in officer is the writer of every exported report. */
export async function currentWriter(): Promise<ReportWriter | null> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return null;
  const { data } = await supabase.from('officers')
    .select('full_name, rank, position, official_email, phone, sections!officers_section_id_fkey(name)')
    .eq('user_id', u.user.id).maybeSingle();
  if (!data) return null;
  const section = (data.sections as { name?: string } | null)?.name ?? '';
  return { name: rankInitialName(data.rank, data.full_name), position: data.position ?? '', section, email: data.official_email ?? '', contact: data.phone ?? '' };
}

export async function imageBytes(url: string) {
  const res = await fetch(url);
  return new Uint8Array(await res.arrayBuffer());
}
export async function imageDataUrl(url: string) {
  const blob = await (await fetch(url)).blob();
  return await new Promise<string>((ok, fail) => { const r = new FileReader(); r.onload = () => ok(String(r.result)); r.onerror = fail; r.readAsDataURL(blob); });
}
export const crestUrls = { left: leftCrest.url, right: rightCrest.url };

import letterheadBanner from '@/assets/lnpats-letterhead.png.asset.json';
/** Official full-width letterhead banner (crests, titles, tricolour rule). Width:height ≈ 4.35:1. */
export const letterheadUrl = letterheadBanner.url;
export const LETTERHEAD_RATIO = 270 / 1175;
/** Draws the official letterhead across the top of a jsPDF page; returns the y (mm) below it. */
export async function drawPdfLetterhead(doc: { internal: { pageSize: { getWidth(): number } }; addImage: (...a: never[]) => unknown }, top = 4) {
  const w = doc.internal.pageSize.getWidth();
  const data = await imageDataUrl(letterheadUrl).catch(() => null);
  const imgW = w - 16, imgH = imgW * LETTERHEAD_RATIO;
  if (data) (doc.addImage as unknown as (d: string, f: string, x: number, y: number, w: number, h: number) => void)(data, 'PNG', 8, top, imgW, imgH);
  return top + imgH + 2;
}
