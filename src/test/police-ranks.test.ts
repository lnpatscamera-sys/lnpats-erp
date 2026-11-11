import { describe, expect, it } from 'vitest';
import { POLICE_RANKS, policeRankOptions } from '../lib/police-ranks';

describe('LNPATS police ranks', () => {
  it('uses the twelve supplied ranks in descending seniority with their abbreviations', () => {
    expect(POLICE_RANKS.map(rank => [rank.name, rank.abbreviation])).toEqual([
      ['Inspector General of Police', 'IGP'],
      ['Deputy Inspector General of Police', 'DIGP'],
      ['Commissioner of Police', 'Comm.'],
      ['Deputy Commissioner of Police', 'DCP'],
      ['Assistant Commissioner of Police', 'ACP'],
      ['Chief Superintendent of Police', 'CSP'],
      ['Superintendent of Police', 'SUPT.'],
      ['Chief Inspector of Police', 'CIP'],
      ['Inspector of Police', 'Insp.'],
      ['Sergeant', 'SGT.'],
      ['Corporal', 'Cpl.'],
      ['Patrolman', 'Ptl.'],
    ]);
  });
  it('retains a historical value without mapping it to a different rank', () => {
    expect(policeRankOptions('Colonel').map(option => option.value)).toEqual([
      ...POLICE_RANKS.map(rank => rank.name), 'Colonel',
    ]);
    expect(policeRankOptions('Sergeant')).toHaveLength(12);
  });
});