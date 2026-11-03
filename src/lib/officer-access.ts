import type { AppRole } from './auth';
export const OFFICER_PATHS = ['/dashboard', '/ict', '/command', '/equipment-request', '/supplies', '/manual', '/classroom', '/mail', '/my-activities'] as const;
export const INSTRUCTOR_PATHS = ['/dashboard', '/command', '/training', '/course-materials', '/lesson-plans', '/training-schedule', '/class-attendance', '/examinations', '/student-performance', '/manual', '/mail', '/notifications', '/ict', '/equipment-request', '/supplies', '/my-activities'] as const;
export function isInstructorWorkspace(roles: readonly AppRole[]) {
  return roles.includes('instructor') && roles.every(role => role === 'officer' || role === 'instructor');
}
/** ICT Officer with no other privileged role: focused technician workspace. */
export function isIctOfficerWorkspace(roles: readonly AppRole[]) {
  return roles.includes('ict_officer') && roles.every(role => role === 'officer' || role === 'ict_officer');
}
/** Officer-only or ICT-Officer-only accounts see only their own records. */
export function isPersonalAccount(roles: readonly AppRole[]) {
  return !roles.some(role => role !== 'officer') || isIctOfficerWorkspace(roles) || isInstructorWorkspace(roles);
}
export function canOpenOfficerPath(roles: readonly AppRole[], path: string) {
  const allowedPaths = isInstructorWorkspace(roles) ? INSTRUCTOR_PATHS : OFFICER_PATHS;
  return !isPersonalAccount(roles) || allowedPaths.some(allowed => allowed === path.replace(/\/$/, ''));
}
