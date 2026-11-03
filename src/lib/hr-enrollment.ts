import type { Employee } from './hr';

export const PERSONNEL_CATEGORIES = ['Newly Recruited Officer', 'In-Service Officer', 'Civilian Staff', 'Contract Staff', 'Volunteer', 'Consultant', 'Other'] as const;
export type PersonnelCategory = (typeof PERSONNEL_CATEGORIES)[number];
export const OFFICER_CATEGORIES: readonly string[] = ['Newly Recruited Officer', 'In-Service Officer'];

export const EMPLOYMENT_TYPES = ['Permanent', 'Contract', 'Temporary', 'Volunteer', 'Consultant'];
export const EMPLOYMENT_STATUSES = ['Active', 'On Leave', 'Suspended', 'Retired', 'Terminated', 'Deceased'];
export const ENROLLMENT_DOCUMENTS = ['Passport Photo', 'Appointment Letter', 'Promotion Letter', 'Transfer Letter', 'Academic Certificate', 'Professional Certificate', 'National ID', 'Birth Certificate', 'Medical Report', 'Police Clearance', 'Training Certificate', 'Service Record', 'Performance Evaluation', 'Other Document'];

/** Which extra form sections each category shows. */
export function categorySections(category: string) {
  return {
    probation: category === 'Newly Recruited Officer',
    initialAssignment: category === 'Newly Recruited Officer',
    inService: category === 'In-Service Officer',
  };
}

export function emailSubject(category: string) {
  return category === 'In-Service Officer' ? 'Personnel Record Enrollment Confirmation' : 'Welcome to LNPATS';
}

export function emailBody(e: Pick<Employee, 'full_name' | 'service_number' | 'rank' | 'employee_number'> & { category: string; department?: string; position?: string | null }) {
  const lines = e.category === 'In-Service Officer'
    ? [`Dear ${e.rank} ${e.full_name},`, '', 'This is to confirm that your personnel record has been enrolled in the LNPATS ERP master personnel registry.', '',
      `Service Number: ${e.service_number}`, `Employee Number: ${e.employee_number ?? '—'}`, `Department: ${e.department ?? '—'}`, `Position: ${e.position ?? '—'}`, '',
      'Please review your details and report any corrections to the Human Resource Section.']
    : [`Dear ${e.full_name},`, '', 'Welcome to the Liberia National Police Academy and Training School (LNPATS).', '',
      'Your personnel record has been created with the following details:', `Service Number: ${e.service_number}`, `Employee Number: ${e.employee_number ?? '—'}`, `Department: ${e.department ?? '—'}`, `Position: ${e.position ?? '—'}`, '',
      'Please report to the Human Resource Section with your original documents to complete your enrollment.'];
  return [...lines, '', 'Regards,', 'Human Resource Section', 'LNPATS'].join('\n');
}

export function yearsBetween(from: string | null | undefined, to = new Date()) {
  if (!from) return null;
  const d = new Date(from);
  if (Number.isNaN(d.getTime())) return null;
  let y = to.getFullYear() - d.getFullYear();
  if (to.getMonth() < d.getMonth() || (to.getMonth() === d.getMonth() && to.getDate() < d.getDate())) y--;
  return y;
}

/** Retiring within the next 12 months. */
export function nearingRetirement(retirement: string | null | undefined, now = new Date()) {
  if (!retirement) return false;
  const r = new Date(retirement).getTime();
  return r >= now.getTime() && r - now.getTime() <= 365 * 86400000;
}

export const RETIREMENT_AGE = 65;

/** Retirement eligibility = date of birth + 65 years (mirrors the database trigger). */
export function retirementDateFor(dob: string | null | undefined) {
  if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) return '';
  const [y, m, d] = dob.split('-').map(Number) as [number, number, number];
  const r = new Date(Date.UTC(y + RETIREMENT_AGE, m - 1, d));
  return r.toISOString().slice(0, 10);
}

/** Current age and whole years left until retirement eligibility. */
export function retirementSummary(dob: string | null | undefined, today: string) {
  const age = yearsBetween(dob, new Date(`${today}T12:00:00Z`));
  if (age == null) return null;
  return { age, remaining: Math.max(0, RETIREMENT_AGE - age), date: retirementDateFor(dob) };
}

export const PHOTO_TYPES = ['image/jpeg', 'image/png'];
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export function photoError(file: { type: string; size: number; name?: string }) {
  // Some computers report no type (or image/pjpeg) for JPG files, so fall back to the file extension.
  const okType = PHOTO_TYPES.includes(file.type) || file.type === 'image/pjpeg' || (!file.type && /\.(jpe?g|jfif|png)$/i.test(file.name ?? ''));
  if (!okType) return 'Photo must be JPG, JPEG or PNG.';
  if (file.size > PHOTO_MAX_BYTES) return 'Photo must be 5 MB or smaller.';
  return null;
}

/** ID label shown for the stored service_number, based on personnel category. */
export function idLabel(category?: string | null): string {
  switch (category) {
    case 'Newly Recruited Officer': case 'Recruit Officer':
    case 'In-Service Officer': case 'Volunteer': case 'Volunteer Officer': return 'LNP ID Number';
    case 'Civilian Staff': return 'CIV ID Number';
    case 'Contract Staff': case 'Contractor': return 'Contractor ID Number';
    default: return 'ID Number';
  }
}
