// A Planned visit has no SAP case, so the banner can't load the patient's name
// from the encounter or CASESET. My Clinic hands the name over here before it
// opens the patient; patient data never goes into the URL.
// Cleared by every logout and session expiry (localStorage.clear()). Login
// doesn't clear storage, so a handoff left by a closed browser expires too.
const STORAGE_KEY = 'plannedVisitPatient';
const MAX_AGE_MS = 12 * 60 * 60 * 1000;

function patientNumber(value: unknown): string {
  const text = String(value ?? '').trim();
  return /^\d{1,10}$/.test(text) ? text.padStart(10, '0') : '';
}

export function rememberPlannedVisitPatient(patnr: unknown, name: unknown): void {
  const Patnr = patientNumber(patnr);
  if (!Patnr) { return; }
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    patnr: Patnr, name: String(name ?? '').trim(), savedAt: Date.now()
  }));
}

// Banner values for a page with a patient but no case (a Planned visit), or
// null when the page has a case and the normal encounter lookup applies.
export function plannedVisitBanner(patnr: string, falnr: string): { id: number; name: string } | null {
  if (!patnr || falnr) { return null; }
  return { id: Number(patnr), name: plannedVisitPatientName(patnr) };
}

// The name is returned only for the same patient, so the banner never shows
// another patient's name.
export function plannedVisitPatientName(patnr: unknown): string {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (stored && !(Date.now() - stored.savedAt < MAX_AGE_MS)) {
      localStorage.removeItem(STORAGE_KEY);
      return '';
    }
    const Patnr = patientNumber(patnr);
    return Patnr && stored?.patnr === Patnr && typeof stored.name === 'string' ? stored.name : '';
  } catch {
    return '';
  }
}
