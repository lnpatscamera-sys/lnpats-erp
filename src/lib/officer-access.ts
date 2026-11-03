import type { AppRole } from './auth';
export const OFFICER_PATHS = ['/dashboard', '/ict', '/command', '/equipment-request', '/supplies', '/manual', '/classroom', '/mail', '/my-activities'] as const;
/** ICT Officer with no other privileged role: focused technician workspace. */
export function isIctOfficerWorkspace(roles: readonly AppRole[]) {
  return roles.includes('ict_officer') && roles.every(role => role === 'officer' || role === 'ict_officer');
}
/** Officer-only or ICT-Officer-only accounts see only their own records. */
export function isPersonalAccount(roles: readonly AppRole[]) {
  return !roles.some(role => role !== 'officer') || isIctOfficerWorkspace(roles);
}
export function canOpenOfficerPath(roles: readonly AppRole[], path: string) {
  return !isPersonalAccount(roles) || OFFICER_PATHS.some(allowed => allowed === path.replace(/\/$/, ''));
}
