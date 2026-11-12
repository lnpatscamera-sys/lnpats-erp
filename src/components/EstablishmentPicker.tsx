import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';

import { cleanUnitName } from '@/lib/supervisor-positions';

export { cleanUnitName };

/** Shared Microstructure read: units, posts and the officers holding each post. */
export async function loadEstablishment() {
  const [u, p, o] = await Promise.all([
    supabase.from('establishment_units').select('id,name,sort_order').order('sort_order'),
    supabase.from('establishment_posts').select('id,unit_id,title,authorized,sort_order').order('sort_order'),
    supabase.from('officers').select('id,establishment_post_id,rank,position,archived_at').not('establishment_post_id', 'is', null),
  ]);
  for (const x of [u, p, o]) if (x.error) throw x.error;
  return { units: u.data!, posts: p.data!, officers: o.data! };
}

/** Unit/Section and establishment position selector; submits establishment_post_id and position. */
export function EstablishmentPicker({ officerId, postId, position }: { officerId?: string | undefined; postId?: string | undefined; position?: string | undefined }) {
  const { data } = useQuery({ queryKey: ['establishment'], queryFn: loadEstablishment });
  const [unit, setUnit] = useState('');
  const [post, setPost] = useState(postId ?? '');
  useEffect(() => { if (data && postId) setUnit(data.posts.find(p => p.id === postId)?.unit_id ?? ''); }, [data, postId]);
  const posts = data?.posts.filter(p => p.unit_id === unit) ?? [];
  const filled = (id: string) => data?.officers.filter(o => o.establishment_post_id === id && o.id !== officerId).length ?? 0;
  const title = data?.posts.find(p => p.id === post)?.title ?? position ?? '';
  return <fieldset className="border-t pt-4 space-y-3"><legend className="text-sm font-semibold pr-2">Establishment unit & position</legend>
    <div className="grid sm:grid-cols-2 gap-3">
      <div className="space-y-1"><Label htmlFor="he-est-unit">Unit / Section (Microstructure)</Label>
        <select id="he-est-unit" value={unit} onChange={e => { setUnit(e.target.value); setPost(''); }} className="w-full h-9 rounded-md border bg-background px-2 text-sm"><option value="">—</option>{data?.units.map(u => <option key={u.id} value={u.id}>{cleanUnitName(u.name)}</option>)}</select></div>
      <div className="space-y-1"><Label htmlFor="he-est-post">Position</Label>
        <select id="he-est-post" value={post} disabled={!unit} onChange={e => setPost(e.target.value)} className="w-full h-9 rounded-md border bg-background px-2 text-sm"><option value="">—</option>{posts.map(p => { const f = filled(p.id); const full = p.authorized > 0 && f >= p.authorized && p.id !== postId; return <option key={p.id} value={p.id} disabled={full}>{p.title} ({f}/{p.authorized || '—'}){full ? ' · full' : ''}</option>; })}</select></div>
    </div>
    <input type="hidden" name="establishment_post_id" value={post} />
    <input type="hidden" name="position" value={title} />
  </fieldset>;
}
