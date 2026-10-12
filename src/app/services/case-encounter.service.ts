import { Injectable } from '@angular/core';
import { map, Observable, throwError } from 'rxjs';
import { DataService } from './data.service';

export interface CaseEncounter {
  Patnr: string;
  Einri: string;
  Falnr: string;
  Lfdnr: string;
}

function sapId(value: unknown, length: number): string {
  const text = String(value ?? '').trim();
  return /^\d+$/.test(text) && text.length <= length
    ? text.padStart(length, '0') : '';
}

@Injectable({ providedIn: 'root' })
export class CaseEncounterService {
  constructor(private dataService: DataService) {}

  resolve(patnr: unknown, einri: unknown, falnr: unknown): Observable<CaseEncounter> {
    const Patnr = sapId(patnr, 10);
    const Einri = sapId(einri, 4);
    const Falnr = sapId(falnr, 10);
    if (!Patnr || !Einri || !Falnr) {
      return throwError(() => new Error('Invalid case identifiers'));
    }

    return this.dataService.loadData(
      'CASESET', [Falnr], 'falnr', false,
      ['CASTOPATSET', 'CASTOMOVEMENTSET'], true, true, true, false, true
    ).pipe(map((response: any) => {
      const body = response?._body ? JSON.parse(response._body) : response;
      const cases = body?.d?.results;
      const selected = Array.isArray(cases) && cases.length === 1 ? cases[0] : null;
      if (!selected || sapId(selected.falnr, 10) !== Falnr ||
          sapId(selected.CASTOPATSET?.patnr, 10) !== Patnr ||
          (selected.einri && sapId(selected.einri, 4) !== Einri)) {
        throw new Error('Case does not match the selected patient');
      }

      const movements = (selected.CASTOMOVEMENTSET?.results ?? [])
        .map((movement: any) => sapId(movement.movmntSeq, 5))
        .filter((movement: string) => !!movement);
      const caseMovement = sapId(selected.lfdnr, 5);
      // Match the existing topnav policy: case movement, otherwise latest
      // movement returned for this case. Never reuse another case's widget key.
      const Lfdnr = caseMovement || movements.sort().slice(-1)[0];
      if (!Lfdnr || (caseMovement && movements.length && !movements.includes(caseMovement))) {
        throw new Error('No valid movement for the selected case');
      }
      return { Patnr, Einri, Falnr, Lfdnr };
    }));
  }
}
