import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, retry, throwError } from 'rxjs';
import { get as _get, isArray as _isArray } from 'lodash';

import { environment } from 'src/environments/environment';
import { Consultations } from './interfaces/consultations';
import { StorageService } from '../storage.service';

@Injectable({
  providedIn: 'root',
})
export class ConsultationsService {
  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {}

  getUrlConsultations() {
    return `${
      environment.eKardexApiUrl
    }/patient/getDataConsultations/${this.storageService.getEncounterId()}`;
  }

  getDataConsultations(): Observable<Consultations[]> {
    const url = this.getUrlConsultations();
    return this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => this.processData(data)),
      retry(2),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  processData(data: any): Consultations[] {
    const { visitNote = [] } = data;
    return visitNote.map((_visitNote: any) => {
      return {
        date: _get(_visitNote, 'visitdate', ''),
        attending_doctor: _get(_visitNote, 'mitarbname', ''),
        notes: _get(_visitNote, 'assessment', ''),
        diagnosis: this.getDiagnosis(_get(_visitNote, 'diagnosis', [])),
      };
    });
  }

  getDiagnosis(diagnoses: { diaCodeTxt: string }[]): string {
    let diagnosis = '';
    if (_isArray(diagnoses)) {
      diagnosis = diagnoses
        .map((diagnosis) => diagnosis.diaCodeTxt)
        .filter((diagnosis) => diagnosis !== undefined)
        .join(', ');
    }
    return diagnosis ? diagnosis : '';
  }
}
