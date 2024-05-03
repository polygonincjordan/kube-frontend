import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import {
  catchError,
  map,
  Observable,
  tap,
  retry,
  ReplaySubject,
  lastValueFrom,
  throwError,
} from 'rxjs';
import { get as _get, isArray as _isArray } from 'lodash';
import { DatePipe } from '@angular/common';

import { environment } from 'src/environments/environment';
import {
  PatientVisitData,
  PatientVisitDataResult,
} from './interfaces/patient-visit-data';
import { StorageService } from '../storage.service';

@Injectable({
  providedIn: 'root',
})
export class SearchModalConfigurationService {
  private searchModalSearchDataSubject$ = new ReplaySubject<PatientVisitData>(
    1
  );
  public searchModalSearchData$ =
    this.searchModalSearchDataSubject$.asObservable();

  constructor(
    @Inject(DatePipe) private datePipe: DatePipe,
    private http: HttpClient,
    private storageService: StorageService
  ) {}

  getSearchData(searchText: string): Observable<PatientVisitDataResult[]> {
    const url = `${environment.eKardexApiUrl}/diagnosis/DIAMASTERSET?searchString=${searchText}`;
    return this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => this.processAllsPatientData(data?.d.results)),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  processAllsPatientData(results: any): PatientVisitDataResult[] {
    // this.processPatientData(results);
    this.searchModalSearchDataSubject$.next(results);
    return results;
  }

  // private processPatientData(results: any) {
  //   results.forEach((obj: any) => {

  //   });
  // }
}
