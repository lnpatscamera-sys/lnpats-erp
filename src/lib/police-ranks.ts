/** Police seniority is descriptive; authorization remains role-based. Listed highest to lowest. */
export const POLICE_RANKS = [
  { name: 'Inspector General of Police', abbreviation: 'IGP' },
  { name: 'Deputy Inspector General of Police', abbreviation: 'DIGP' },
  { name: 'Commissioner of Police', abbreviation: 'Comm.' },
  { name: 'Deputy Commissioner of Police', abbreviation: 'DCP' },
  { name: 'Assistant Commissioner of Police', abbreviation: 'ACP' },
  { name: 'Chief Superintendent of Police', abbreviation: 'CSP' },
  { name: 'Superintendent of Police', abbreviation: 'SUPT.' },
  { name: 'Chief Inspector of Police', abbreviation: 'CIP' },
  { name: 'Inspector of Police', abbreviation: 'Insp.' },
  { name: 'Sergeant', abbreviation: 'SGT.' },
  { name: 'Corporal', abbreviation: 'Cpl.' },
  { name: 'Patrolman', abbreviation: 'Ptl.' },
] as const;

export function policeRankOptions(current?: string) {
  const options = POLICE_RANKS.map(rank => ({ value: String(rank.name), label: `${rank.name} (${rank.abbreviation})` }));
  // Preserve historical values rather than silently translating or clearing them.
  if (current && !options.some(option => option.value === current)) {
    options.push({ value: current, label: current });
  }
  return options;
}
