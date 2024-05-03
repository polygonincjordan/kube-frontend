import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { get as _get, isArray as _isArray } from 'lodash';
import Swal from 'sweetalert2';
import {
  catchError,
  map,
  Observable,
  ReplaySubject,
  retry,
  throwError,
  tap,
  lastValueFrom,
} from 'rxjs';
import { environment } from '../../../environments/environment';
import { StorageService } from '../storage.service';
@Injectable({
  providedIn: 'root',
})
export class ErDiagnosisService {

  formDetailGroup: any;

  public PhysicianOrders: boolean = true;
  public ProgressNotes: boolean = false;
  public Diagnosis: boolean = false;
  public Documentation: boolean = false;

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) { 
  }

  successSwalModel(successMsg: string) {
    Swal.fire({
      title: successMsg,
      icon: 'success',
      confirmButtonText: 'OK',
      customClass:'swal-class'
    });
  }

  errorSwalModel(successMsg: string) {
    Swal.fire({
      title: successMsg,
      icon: 'error',
      confirmButtonText: 'OK',
      customClass:'swal-class'
    });
  }
 // Diagnosis Code Search API
 searchDiagnosis(search: string) {
  const url = `${environment.eKardexApiUrl}/admission/getDiagnosisCodeSet?searchstring=${search}`;
  return this.http.get(url, {
    withCredentials: true,
  });
}

saveDiagnosis(diagnosis: any) {
  const url = `${environment.eKardexApiUrl}/admission/saveDiagnosisSet`;
  return this.http.post(url, diagnosis,{
    withCredentials: true,
  });
}

// For Get Diagnosis List
private diagnosislistDataSubject$ = new ReplaySubject<any>(1);
public diagnosislistData$ = this.diagnosislistDataSubject$.asObservable();

async getDiagnosisSetDataSet(institutionid: string, caseid: string) {
  await lastValueFrom(this.getDiagnosisSet(institutionid, caseid));
}

getDiagnosisSet(institutionid: string, caseid: string) {    
  const url = `${environment.eKardexApiUrl}/admission/getDiagnosisSet?institutionid=${institutionid}&caseid=${caseid}`;

  return this.http.get(url, { withCredentials: true }).pipe(
    map((data: any) => this.processDiagnosisSetData(data?.d.results)),
    catchError((error: HttpErrorResponse) => {
      console.error(error);
      return throwError(error);
    })
  );
}

processDiagnosisSetData(results: any) {
  this.diagnosislistDataSubject$.next(results);
  return results;
}

getDiagnosisList(institutionid: string, caseid: string, patientId: string) {
  const url = `${environment.eKardexApiUrl}/admission/getDiagnosisSet?institutionid=${institutionid}&caseid=${caseid}&patnr=${patientId}`;
  return this.http.get(url, {
    withCredentials: true,
  });
}

// Diagnosis favorite Modal
private diagnosisFavoriteDataSubject$ = new ReplaySubject<any>(1);
public diagnosisFavoriteData$ = this.diagnosisFavoriteDataSubject$.asObservable();

async getDiagnosisFavoriteSetDataSet(patientId: string) {
  await lastValueFrom(this.getDiagnosisFavSet(patientId));
}

getDiagnosisFavSet(patientId: string) {    
  const url = `${environment.eKardexApiUrl}/admission/getDiagnosisImport?patientId=${patientId}`;

  return this.http.get(url, { withCredentials: true }).pipe(
    map((data: any) => this.processDiagnosisFavSetData(data?.d.results)),
    catchError((error: HttpErrorResponse) => {
      console.error(error);
      return throwError(error);
    })
  );
}

processDiagnosisFavSetData(results: any) {
  this.diagnosisFavoriteDataSubject$.next(results);
  return results;
}

getFavrDiagnosisList(orgId: string, einri: string, type: string) {
  const url = `${environment.eKardexApiUrl}/admission/getFavrDiagnosisSet?orgid=${orgId}&einri=${einri}&type=${type}`;

  return this.http.get(url, {
    withCredentials: true,
  });
}

favDiagnosisAction(diagnosis: any) {
  const url = `${environment.eKardexApiUrl}/admission/updateDiagnosisFavrOUSet`;
  return this.http.post(url, diagnosis,{
    withCredentials: true,
  });
}
}

