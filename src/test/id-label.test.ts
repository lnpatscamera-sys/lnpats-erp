import { describe, it, expect } from 'vitest';
import { idLabel } from '@/lib/hr-enrollment';
describe('idLabel', () => {
  it('maps categories', () => {
    expect(idLabel('Newly Recruited Officer')).toBe('LNP ID Number');
    expect(idLabel('In-Service Officer')).toBe('LNP ID Number');
    expect(idLabel('Volunteer')).toBe('LNP ID Number');
    expect(idLabel('Civilian Staff')).toBe('CIV ID Number');
    expect(idLabel('Contract Staff')).toBe('Contractor ID Number');
    expect(idLabel('Other')).toBe('ID Number');
    expect(idLabel(null)).toBe('ID Number');
  });
});
