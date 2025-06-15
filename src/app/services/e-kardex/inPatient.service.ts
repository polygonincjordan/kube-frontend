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
  Subscription,
} from 'rxjs';
import { get as _get, isArray as _isArray } from 'lodash';
import { DatePipe } from '@angular/common';

import { environment } from 'src/environments/environment';
import {
  PatientVisitData,
  PatientVisitDataResult,
  PatientCaseSetDataType,
} from './interfaces/patient-visit-data';
import { StorageService } from '../storage.service';
import { UserConfig } from './interfaces/user-config';
import { InPatientDataResult } from './interfaces/inpatient-data';
import { ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class InPatientConfigurationService {
  private inPatientDataSubject$ = new ReplaySubject<PatientVisitData>(1);
  public inPatientData$ = this.inPatientDataSubject$.asObservable();

  private inPatientAllDataSubject$ = new ReplaySubject<PatientVisitData>(1);
  public inPatientAllData$ = this.inPatientAllDataSubject$.asObservable();

  private patientCaseSetDataSubject$ =
    new ReplaySubject<PatientCaseSetDataType>(1);
  public patientCaseSetData$ = this.patientCaseSetDataSubject$.asObservable();
  constructor(
    @Inject(DatePipe) private datePipe: DatePipe,
    private http: HttpClient,
    private storageService: StorageService,
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe((params) => {
      this.getListOfAllPatientVisitDataSet()
    })
  }


  async getListOfAllPatientVisitDataSet(
    showall?: string,
    fromdate?: string,
    todate?: string,
  ) {
    await lastValueFrom(this.getAllPatientVisitDataSet(showall, fromdate, todate));
  }

  getAllPatientVisitDataSet(showall: string, fromdate: string, todate: string): Observable<PatientVisitDataResult[]> {
    const url = this.getUrlAllInPatientVisitDataSet(
      this.storageService.einri,
      this.storageService.patnr !== undefined ? this.storageService.patnr.toString().padStart(10, '0') : this.storageService.patnr,
      this.storageService.falnr !== undefined ? this.storageService.falnr.toString().padStart(10, '0') : this.storageService.falnr,
      showall, fromdate, todate
    );
    return this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => this.processAllsPatientData(data?.d.results)),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  processAllsPatientData(results: any): PatientVisitDataResult[] {
    this.processPatientData(results);
    this.inPatientAllDataSubject$.next(results);
    return results;
  }

  getUrlAllInPatientVisitDataSet(einri: string, patnr: string, falnr: string, showall, fromdate, todate) {
    const data = JSON.parse(localStorage.getItem('data'));
    if (data) {
      return `${environment.eKardexApiUrl}/inPatientData/getInPatientAllDocumentFalnrSet?einri=${einri}&patnr=${patnr}&falnr=${falnr}&showall=${showall}&fromdate=${fromdate}&todate=${todate}`;
    } else {
      return `${environment.eKardexApiUrl}/inPatientData/getInPatientAllDocumentSet?einri=${einri}&patnr=${patnr}&showall=${showall}&fromdate=${fromdate}&todate=${todate}`;
    }
  }
  ngOnDestroy(): void {
    localStorage.removeItem("data");
  }

  async saveInPatientDocumentData(data: any, userConfiguration: UserConfig, documentType: boolean,status?:any) {
    const payloadData = {
      DocKey: data.patientFormData.DocKey !== undefined ? data.patientFormData.DocKey : "",
      Dtid: data.patientDtId,
      DtidText: "",
      Dodat: `\/Date(${new Date().getTime()})\/`,
      Dokst: "",
      Dokvr: status ? status : "",
      Einri: this.storageService.einri,
      Patnr: this.storageService.patnr,
      Falnr: this.storageService.falnr,
      Orgdo: localStorage.getItem('initOrg'),
      Lfdnr: this.storageService.lfdnr,
      Visitdate: null,
      Referredby: "",
      Mitarbname: userConfiguration.UserId,
      Mitarb: userConfiguration.VMA,
      Released: documentType,
      Etag: "",
      Erdattim: `\/Date(${new Date().getTime()})\/`,
    }
    const payload = { ...payloadData, PATDOCTOOPERRPTDOCDETAIL: { results: [data.patientFormData] }, DOCCATTOATTACHMENTS: { results: [] }, PATDOCTOPOSTOPERATIVEDX: { results: data.postDiagnosisData }, PATDOCTOPREOPERATIVEDX: { results: data.preDiganosisData }, PATDOCTOSURGICALTEAM: { results: data.surgeryData } };
    const url = `${environment.eKardexApiUrl}/inpatientData/saveInPatientDataSet`;
    const savePatientConfig$ = this.http.post(url, payload, { withCredentials: true })
      .pipe(
        tap((data) => {
          this.getListOfAllPatientVisitDataSet();
        }),
        catchError((error: HttpErrorResponse) => {
          console.error(error);
          return throwError(() => error);
        })
      );
    await lastValueFrom(savePatientConfig$)
  }

  getDischargeSummarySet() {
    return this.http.get(`${environment.eKardexApiUrl}/inpatientData/getDischargeSummarySet?Einri=${this.storageService.einri}&Falnr=${this.storageService.falnr}`, { withCredentials: true })
  }

  getDischargeSearchData(data: any) {
    return this.http.get(`${environment.eKardexApiUrl}/inpatientData/getDiagnosisCodeSet?searchstring=${data}`, { withCredentials: true })
  }

  postReleasePhdisForm(data: any) {
    return this.http.post(`${environment.eKardexApiUrl}/inpatientData/releaseDischargeSummarySet?DocKey=${data.d.Dockey}`, null, { withCredentials: true })
  }

  getInpatientData() {
    return this.http.get(`${environment.eKardexApiUrl}/inpatientData/getDiagnosisSet?institutionid=${this.storageService.einri}&caseid=${this.storageService.falnr}&patnr=${''}`, { withCredentials: true })
  }

  saveInPatientPhdisData(data: any, dischargeConfiguration: any, userConfiguration: any) {
    const payloadData = {
      Dockey: data.patientFormData.Dockey !== undefined ? data.patientFormData.Dockey : "",
      Einri: this.storageService.einri,
      Patnr: this.storageService.patnr,
      Falnr: this.storageService.falnr,
      Orgdo: "",
      Mitarb: "",
      Dtid: "",
      Dtvers: "",
      Dodat: `\/Date(${new Date().getTime()})\/`,
      Dotim: "PT17H55M55S",
      Erusr: userConfiguration.UserId,
      Erdat: `\/Date(${new Date().getTime()})\/`,
      Dokst: "",
      Lfdbew: this.storageService.lfdnr,
      Orgfa: "",
      Orgpf: "",
      Released: data.releaseForm
    }
    const payload = { ...payloadData, ToFormData: { results: [data.patientFormData] }, ToDiagnosis: { results: [] }, ToHospitalMed: { results: [] }, ToDischargeMed: { results: [] } };
    const url = `${environment.eKardexApiUrl}/inpatientData/saveReleaseDischargeSummarySet`;
    return this.http.post(url, payload, { withCredentials: true });
    // const savePatientConfig$ = this.http.post(url, payload, { withCredentials: true })
    //   .pipe(
    //     // tap((data) => {
    //     //   console.log('test',data);
    //     //   //this.getListOfAllPatientVisitDataSet();
    //     // }),
    //     map((data: any) => {
    //       console.log(data)
    //        return data }),
    //     catchError((error: HttpErrorResponse) => {
    //       console.error(error);
    //       return throwError(() => error);
    //     })
    //   );
    // await lastValueFrom(savePatientConfig$)
  }
  async deleteInPatientPhdisData(DocKey: any) {
    const url = `${environment.eKardexApiUrl}/inpatientData/deleteDischargeSummarySet?DocKey=${DocKey}`;

    const createPatientConfig$ = this.http
      .delete(url, { withCredentials: true })
      .pipe(
        tap((data) => {
          this.getListOfAllPatientVisitDataSet();
        }),
        catchError((error: HttpErrorResponse) => throwError(() => error))
      );

    await lastValueFrom(createPatientConfig$);
  }


  async deleteInPatientData(deleteDockey: string) {
    const url = `${environment.eKardexApiUrl}/inpatientData/deleteInPatientData/${deleteDockey}`;

    const createPatientConfig$ = this.http
      .delete(url, { withCredentials: true })
      .pipe(
        tap((data) => {
          this.getListOfAllPatientVisitDataSet();
        }),
        catchError((error: HttpErrorResponse) => throwError(() => error))
      );

    await lastValueFrom(createPatientConfig$);
  }

  getSurgeryPopupData() {
    const url = `${environment.eKardexApiUrl}/inPatientData/getSurgeryTeamData?SequenceNumberMovem=${this.storageService.lfdnr}&CaseNumber=${this.storageService.falnr}`
    return this.http.get(url, { withCredentials: true })
  }

  getDiagnosisPopupData() {
    const url = `${environment.eKardexApiUrl}/inPatientData/getDiagnosisData?Institution=${this.storageService.einri}&PatientNumber=${this.storageService.patnr}&CaseNumber=${this.storageService.falnr}`
    return this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => { return data.d.results }),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  async getPatientVisitDataSetByDocKey(docKey: string) {
    await lastValueFrom(this.getPatientVisitDataByDocKey(docKey));
  }

  getPatientVisitDataByDocKey(docKey: string): Observable<InPatientDataResult> {
    const url = this.getUrlInPatientVisitDataByDocKey(
      this.storageService.einri,
      this.storageService.patnr,
      docKey
    );
    return this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => { return data.d }),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  getPatientSummaryDataByDocKey(docKey: string): Observable<any> {
    return this.http.get(`${environment.eKardexApiUrl}/inPatientData/savedDocumentGetData?DocKey=${docKey}`, { withCredentials: true }).pipe(
      map((data: any) => { return data.d }),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  getUrlInPatientVisitDataByDocKey(
    einri: string,
    patnr: string,
    docKey: string
  ) {
    return `${environment.eKardexApiUrl}/inPatientData/getInPatientDocumentSet?einri=${einri}&patnr=${patnr}&docKey=${docKey}`;
  }

  processOnlyPatientData(results: any): InPatientDataResult[] {
    this.processPatientData(results);
    this.inPatientDataSubject$.next(results);
    return results;
  }

  private processPatientData(results: any) {
    results.forEach((obj: any) => {
      if (obj.Erdattim != null) {
        obj.Erdattim = obj.Erdattim.replace('/Date(', '').replace(')/', '');
      }
      if (obj.VisitDate != null) {
        obj.VisitDate = this.sanitizeSAPDateFormat(obj.VisitDate);
      }
      obj.Dokvr = Math.round(obj.Dokvr);
    });
  }

  async getPatientCaseSet() {
    await lastValueFrom(this.getPatientCaseSetApiCall());
  }

  getPatientCaseSetApiCall(): Observable<PatientCaseSetDataType[]> {
    const url = `${environment.eKardexApiUrl}/inPatientData/getPatientCaseSet?einri=${this.storageService.einri}&patnr=${this.storageService.patnr}`;
    return this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => this.processPatientCaseSetData(data?.d.results)),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  processPatientCaseSetData(results: any): Array<PatientCaseSetDataType> {
    this.processPatientCaseData(results);
    this.patientCaseSetDataSubject$.next(results);
    return results;
  }

  private processPatientCaseData(results: any) {
    results.forEach((obj: any) => {
      if (obj.StartDate != null) {
        obj.StartDate = this.sanitizeSAPDateFormatDDMMYYYY(obj.StartDate);
      }
      if (obj.EndDate != null) {
        obj.EndDate = this.sanitizeSAPDateFormatDDMMYYYY(obj.EndDate);
      }
    });
  }

  sanitizeSAPDateFormatDDMMYYYY(date: string) {
    if (date) {
      return new DatePipe('en-US').transform(
        date.replace('/Date(', '').replace(')/', ''),
        'dd-MM-yyyy'
      );
    }
  }

  sanitizeSAPDateFormat(date: string) {
    if (date) {
      return new DatePipe('en-US').transform(
        date.replace('/Date(', '').replace(')/', ''),
        'yyyy-MM-dd'
      );
    }
  }
  getDiagnosisVisitDocData(json) {
    return this.http.get(`${environment.eKardexApiUrl}/inpatientData/getDiagnosisSet?institutionid=${json.einri}&caseid=${json.falnr}&patnr=${''}`, { withCredentials: true })
  }
}
