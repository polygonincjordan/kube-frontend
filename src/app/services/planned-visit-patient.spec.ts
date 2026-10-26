import { plannedVisitBanner, plannedVisitPatientName, rememberPlannedVisitPatient } from './planned-visit-patient';

describe('Planned visit patient handoff', () => {
  beforeEach(() => localStorage.removeItem('plannedVisitPatient'));
  afterEach(() => localStorage.removeItem('plannedVisitPatient'));

  it('returns the name for the same patient, padded or not', () => {
    rememberPlannedVisitPatient('0000016895', 'Test Patient');
    expect(plannedVisitPatientName('0000016895')).toBe('Test Patient');
    expect(plannedVisitPatientName('16895')).toBe('Test Patient');
  });

  it('never returns the name for another patient', () => {
    rememberPlannedVisitPatient('16895', 'Test Patient');
    expect(plannedVisitPatientName('16896')).toBe('');
  });

  it('returns nothing without a handoff or with unreadable data', () => {
    expect(plannedVisitPatientName('16895')).toBe('');
    localStorage.setItem('plannedVisitPatient', '{not json');
    expect(plannedVisitPatientName('16895')).toBe('');
  });

  describe('banner', () => {
    it('shows the handed-over name and the MRN when there is no case', () => {
      rememberPlannedVisitPatient('0000016895', 'Test Patient');
      expect(plannedVisitBanner('0000016895', '')).toEqual({ id: 16895, name: 'Test Patient' });
    });

    it('shows only the MRN for another patient\'s handoff or none', () => {
      rememberPlannedVisitPatient('0000016896', 'Other Patient');
      expect(plannedVisitBanner('0000016895', '')).toEqual({ id: 16895, name: '' });
      localStorage.removeItem('plannedVisitPatient');
      expect(plannedVisitBanner('0000016895', '')).toEqual({ id: 16895, name: '' });
    });

    it('leaves pages with a case, or with no patient, to the normal lookup', () => {
      rememberPlannedVisitPatient('0000016895', 'Test Patient');
      expect(plannedVisitBanner('0000016895', '0000007258')).toBeNull();
      expect(plannedVisitBanner('', '')).toBeNull();
    });
  });

  it('ignores and deletes a handoff older than 12 hours, or without a time', () => {
    rememberPlannedVisitPatient('16895', 'Test Patient');
    const stored = JSON.parse(localStorage.getItem('plannedVisitPatient')!);
    localStorage.setItem('plannedVisitPatient', JSON.stringify({ ...stored, savedAt: Date.now() - 12 * 60 * 60 * 1000 - 1 }));
    expect(plannedVisitPatientName('16895')).toBe('');
    expect(localStorage.getItem('plannedVisitPatient')).toBeNull();
    localStorage.setItem('plannedVisitPatient', JSON.stringify({ patnr: '0000016895', name: 'Test Patient' }));
    expect(plannedVisitPatientName('16895')).toBe('');
  });

  it('is removed by the logout storage clear', () => {
    rememberPlannedVisitPatient('16895', 'Test Patient');
    localStorage.clear();
    expect(plannedVisitPatientName('16895')).toBe('');
  });

  it('does not store a handoff without a valid patient number', () => {
    rememberPlannedVisitPatient('', 'Test Patient');
    rememberPlannedVisitPatient('abc', 'Test Patient');
    expect(localStorage.getItem('plannedVisitPatient')).toBeNull();
  });
});
