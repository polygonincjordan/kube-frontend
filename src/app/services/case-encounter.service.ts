import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { DataService } from './data.service';

export interface CaseEncounter {
  Patnr: string;
  Einri: string;
  Falnr: string;
  Lfdnr: string;
}

export type CaseEncounterFailure =
  'invalid-identifiers' | 'patient-case-mismatch' | 'no-movement' | 'case-lookup-failed';

export class CaseEncounterError extends Error {
  constructor(readonly reason: CaseEncounterFailure) { super(reason); }
}

function sapId(value: unknown, length: number): string {
  const text = String(value ?? '').trim();
  return /^\d+$/.test(text) && text.length <= length
    ? text.padStart(length, '0') : '';
}

@Injectable({ providedIn: 'root' })
export class CaseEncounterService {
  constructor(private dataService: DataService) {}

  resolve(patnr: unknown, einri: unknown, falnr: unknown, movement?: unknown): Observable<CaseEncounter> {
    const Patnr = sapId(patnr, 10);
    const Einri = sapId(einri, 4);
    const Falnr = sapId(falnr, 10);
    if (!Patnr || !Einri || !Falnr) {
      return throwError(() => new CaseEncounterError('invalid-identifiers'));
    }
    const requested = sapId(movement, 5);

    return this.dataService.loadData(
      'CASESET', [Falnr], 'falnr', false,
      ['CASTOPATSET', 'CASTOMOVEMENTSET'], true, true, true, false, true
    ).pipe(
      catchError(() => throwError(() => new CaseEncounterError('case-lookup-failed'))),
      map((response: any) => {
        const body = response?._body ? JSON.parse(response._body) : response;
        const cases = body?.d?.results;
        const selected = Array.isArray(cases) && cases.length === 1 ? cases[0] : null;
        if (!selected || sapId(selected.falnr, 10) !== Falnr) {
          throw new CaseEncounterError('invalid-identifiers');
        }
        // Checked before the movement, so 'no-movement' always means the case
        // belongs to this patient.
        if (sapId(selected.CASTOPATSET?.patnr, 10) !== Patnr ||
            (selected.einri && sapId(selected.einri, 4) !== Einri)) {
          throw new CaseEncounterError('patient-case-mismatch');
        }

        const movements = (selected.CASTOMOVEMENTSET?.results ?? [])
          .map((movement: any) => sapId(movement.movmntSeq, 5))
          .filter((movement: string) => !!movement);
        // A movement chosen in the link, including a historical one, is kept
        // when it belongs to this case.
        if (requested && movements.includes(requested)) {
          return { Patnr, Einri, Falnr, Lfdnr: requested };
        }
        const caseMovement = sapId(selected.lfdnr, 5);
        // Match the existing topnav policy: case movement, otherwise latest
        // movement returned for this case. Never reuse another case's widget key.
        const Lfdnr = caseMovement || movements.sort().slice(-1)[0];
        if (!Lfdnr || (caseMovement && movements.length && !movements.includes(caseMovement))) {
          throw new CaseEncounterError('no-movement');
        }
        return { Patnr, Einri, Falnr, Lfdnr };
      })
    );
  }
}
