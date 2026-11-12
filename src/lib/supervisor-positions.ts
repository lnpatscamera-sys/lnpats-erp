import { POLICE_RANKS } from './police-ranks';

/** Strips numbering prefixes like "1.2.1.2 UNIT:" from Microstructure unit names. */
export function cleanUnitName(name: string) {
  return name.replace(/^[\d.\s]+/, '').replace(/^(UNIT|DEPARTMENT|SECTION)\s*:\s*/i, '').replace(/:\s*$/, '').trim();
}

export type PostHolder = { id: string; establishment_post_id: string | null; rank?: string | null; position?: string | null };
export type StructurePost = { id: string; unit_id: string; title: string; sort_order: number };
export type StructureUnit = { id: string; name: string; sort_order: number };
export type SupervisorOption = { value: string; label: string; disabled?: boolean };

const rankShort = (rank?: string | null) => POLICE_RANKS.find(r => r.name === rank)?.abbreviation ?? rank ?? '';

/**
 * Immediate-supervisor choices labelled by establishment position, never by name.
 * Each option still stores the holder's officer id. The Commandant appointment is listed first;
 * only holders of a Microstructure post are offered, plus the current value so it is never dropped.
 */
export function supervisorPositionOptions(input: {
  holders: PostHolder[];
  posts: StructurePost[];
  units: StructureUnit[];
  commandantId?: string | null | undefined;
  excludeId?: string | null | undefined;
  currentId?: string | null | undefined;
  allow?: ((id: string) => boolean) | undefined;
}): SupervisorOption[] {
  const { holders, posts, units, commandantId, excludeId, currentId, allow = () => true } = input;
  const unitById = new Map(units.map(u => [u.id, u]));
  const postById = new Map(posts.map(p => [p.id, p]));
  const out: SupervisorOption[] = [];
  const commandant = commandantId ? holders.find(h => h.id === commandantId) : undefined;
  if (!commandantId) out.push({ value: '__no_commandant', label: 'Commandant — not yet appointed in Command & Reports', disabled: true });
  else if (commandantId !== excludeId && (commandant ? allow(commandantId) : true)) out.push({ value: commandantId, label: 'Commandant' });

  const rows = holders
    .filter(h => h.id !== excludeId && h.id !== commandantId && allow(h.id) && h.establishment_post_id && postById.has(h.establishment_post_id))
    .map(h => { const p = postById.get(h.establishment_post_id!)!; const u = unitById.get(p.unit_id); return { h, base: u ? `${p.title} — ${cleanUnitName(u.name)}` : p.title, order: [u?.sort_order ?? 0, p.sort_order] as const }; })
    .sort((a, b) => a.order[0] - b.order[0] || a.order[1] - b.order[1] || a.base.localeCompare(b.base));
  const count = new Map<string, number>();
  for (const r of rows) count.set(r.base, (count.get(r.base) ?? 0) + 1);
  const seen = new Map<string, number>();
  for (const r of rows) {
    let label = r.base;
    if ((count.get(r.base) ?? 0) > 1) { const n = (seen.get(r.base) ?? 0) + 1; seen.set(r.base, n); label = `${r.base} (${rankShort(r.h.rank) || 'post'} ${n})`; }
    out.push({ value: r.h.id, label });
  }

  if (currentId && !out.some(o => o.value === currentId)) {
    const cur = holders.find(h => h.id === currentId);
    out.push({ value: currentId, label: `${cur?.position?.trim() || 'Unlisted position'} (not in structure)` });
  }
  return out;
}
