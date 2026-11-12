import { describe, expect, it } from 'vitest';
import { supervisorPositionOptions } from '@/lib/supervisor-positions';

const units = [{ id: 'u1', name: '1.2.1.2 UNIT:   Facility Management', sort_order: 1 }, { id: 'u2', name: '1.2.1.2 Communications Unit', sort_order: 2 }];
const posts = [{ id: 'p1', unit_id: 'u1', title: 'Head of Facility Management', sort_order: 1 }, { id: 'p2', unit_id: 'u2', title: 'Radio Operators', sort_order: 1 }];
const holders = [
  { id: 'cmd', establishment_post_id: null, rank: 'Deputy Inspector General of Police', position: 'Deputy Inspector General' },
  { id: 'a', establishment_post_id: 'p1', rank: 'Sergeant' },
  { id: 'b', establishment_post_id: 'p2', rank: 'Corporal' },
  { id: 'c', establishment_post_id: 'p2', rank: 'Corporal' },
  { id: 'free', establishment_post_id: null, rank: 'Sergeant', position: 'Storekeeper' },
];

describe('immediate supervisor position labels', () => {
  it('labels choices by structure position, never by name, with the Commandant first', () => {
    const o = supervisorPositionOptions({ holders, posts, units, commandantId: 'cmd' });
    expect(o.map(x => x.label)).toEqual(['Commandant', 'Head of Facility Management — Facility Management', 'Radio Operators — Communications Unit (Cpl. 1)', 'Radio Operators — Communications Unit (Cpl. 2)']);
  });
  it('leaves out staff with no structure post but keeps an existing supervisor', () => {
    expect(supervisorPositionOptions({ holders, posts, units, commandantId: 'cmd' }).some(x => x.value === 'free')).toBe(false);
    expect(supervisorPositionOptions({ holders, posts, units, commandantId: 'cmd', currentId: 'free' }).at(-1)).toEqual({ value: 'free', label: 'Storekeeper (not in structure)' });
  });
  it('never offers an officer as their own supervisor', () => {
    expect(supervisorPositionOptions({ holders, posts, units, commandantId: 'cmd', excludeId: 'a' }).some(x => x.value === 'a')).toBe(false);
  });
});
