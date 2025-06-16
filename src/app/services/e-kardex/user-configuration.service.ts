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
import { UserConfig } from './interfaces/user-config';
import {
  PatientVisitData,
  PatientVisitDataResult,
} from './interfaces/patient-visit-data';
import { StorageService } from '../storage.service';

@Injectable({
  providedIn: 'root',
})
export class UserConfigurationService {
  private userConfigSubject$ = new ReplaySubject<UserConfig>(1);
  public userConfig$ = this.userConfigSubject$.asObservable();

  private patientDataSubject$ = new ReplaySubject<PatientVisitData>(1);
  public patientData$ = this.patientDataSubject$.asObservable();

  private patientAllDataSubject$ = new ReplaySubject<PatientVisitData>(1);
  public patientAllData$ = this.patientAllDataSubject$.asObservable();

  constructor(
    @Inject(DatePipe) private datePipe: DatePipe,
    private http: HttpClient,
    private storageService: StorageService
  ) {}

  getUserConfigUrl() {
    return `${environment.eKardexApiUrl}/patientData/UserConfigSet`;
  }

  getUserConfigData(): Observable<UserConfig> {
    const url = this.getUserConfigUrl();
    return this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => this.processData(data)),
      retry(2),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  processData(data: any): UserConfig {
    const { d } = data;

    const _userConfig = {
      __metadata: _get(d, '__metadata', ''),
      UserId: _get(d, 'UserId', ''),
      VMA: _get(d, 'VMA', ''),
      ComponentName: _get(d, 'ComponentName', ''),
      DefaultNewDocumentVisitNote: this.getFormattedBoolean(
        d,
        'DefaultNewDocumentVisitNote'
      ),
      DefaultNewDocumentSOAP: this.getFormattedBoolean(
        d,
        'DefaultNewDocumentSOAP'
      ),
      DocumentTypeVisitNote: this.getFormattedBoolean(
        d,
        'DocumentTypeVisitNote'
      ),
      DocumentTypeSOAP: this.getFormattedBoolean(d, 'DocumentTypeSOAP'),
      DocumentTypeMedicalReport: this.getFormattedBoolean(
        d,
        'DocumentTypeMedicalReport'
      ),
      DocumentStatusReleased: this.getFormattedBoolean(
        d,
        'DocumentStatusReleased'
      ),
      DocumentStatusDraft: this.getFormattedBoolean(d, 'DocumentStatusDraft'),
      PeriodParameterMonth: _get(d, 'PeriodParameterMonth', ''),
      PeriodParameterFromDate: this.sanitizeSAPDateFormat(
        _get(d, 'PeriodParameterFromDate', '')
      ),
      PeriodParameterToDate: this.sanitizeSAPDateFormat(
        _get(d, 'PeriodParameterToDate', '')
      ),
      ShowAllDocument: this.getFormattedBoolean(d, 'ShowAllDocument'),
    };

    this.userConfigSubject$.next(_userConfig);
    return _userConfig;
  }

  getFormattedBoolean(data: any, key: string): boolean {
    if (_get(data, key, '') == 'x' || _get(data, key, '') == 'X') {
      return true;
    } else {
      return false;
    }
  }

  async updateUserConfig(userConfig: UserConfig) {
    const payload = {
      d: {
        __metadata: userConfig.__metadata,
        UserId: userConfig.UserId,
        VMA: userConfig.VMA,
        ComponentName: userConfig.ComponentName,
        DefaultNewDocumentVisitNote: this.getFormattedString(
          userConfig.DefaultNewDocumentVisitNote
        ),
        DefaultNewDocumentSOAP: this.getFormattedString(
          userConfig.DefaultNewDocumentSOAP
        ),
        DocumentTypeVisitNote: this.getFormattedString(
          userConfig.DocumentTypeVisitNote
        ),
        DocumentTypeSOAP: this.getFormattedString(userConfig.DocumentTypeSOAP),
        DocumentTypeMedicalReport: this.getFormattedString(
          userConfig.DocumentTypeMedicalReport
        ),
        DocumentStatusReleased: this.getFormattedString(
          userConfig.DocumentStatusReleased
        ),
        DocumentStatusDraft: this.getFormattedString(
          userConfig.DocumentStatusDraft
        ),
        PeriodParameterMonth: userConfig.PeriodParameterMonth,
        PeriodParameterFromDate: this.getTimeinSAPMiliSecond(
          userConfig.PeriodParameterFromDate
        ),
        PeriodParameterToDate: this.getTimeinSAPMiliSecond(
          userConfig.PeriodParameterToDate
        ),
        ShowAllDocument: this.getFormattedString(userConfig.ShowAllDocument),
      },
    };

    const url = `${environment.eKardexApiUrl}/patientData/updateUserConfigSet/${userConfig.VMA}`;

    const updateUserCongif$ = this.http
      .put(url, payload, { withCredentials: true })
      .pipe(
        tap((data) => {
          this.getListOfPatientVisitDataSet();
        }),
        catchError((error: HttpErrorResponse) => throwError(() => error))
      );

    await lastValueFrom(updateUserCongif$);
  }

  getTimeinSAPMiliSecond(date: string) {
    if (date) {
      return `\/Date(${new Date(`${date} 23:59:59`).getTime()})\/`;
    }
  }
  getFormattedString(val: boolean): string {
    if (val) {
      return 'X';
    } else {
      return '';
    }
  }

  async getListOfPatientVisitDataSet() {
    await lastValueFrom(this.getPatientVisitDataSet());
  }

  async getListOfAllPatientVisitDataSet(
    showall: string,
    fromdate: string,
    todate: string
  ) {
    await lastValueFrom(
      this.getAllPatientVisitDataSet(showall, fromdate, todate)
    );
  }

  getUrlPatientVisitDataSet(einri: string, patnr: string, falnr:string) {
    const data = JSON.parse(localStorage.getItem('data'));
    if(data){
      return `${environment.eKardexApiUrl}/patientData/PatientVisitfalnrSet?einri=${einri}&patnr=${patnr}&falnr=${falnr}`;
    }else{
      return `${environment.eKardexApiUrl}/patientData/PatientVisitDataSet?einri=${einri}&patnr=${patnr}`;
    }
  }

  ngOnDestroy(): void {
    localStorage.removeItem("data");
  }

  getPatientVisitDataSet(): Observable<PatientVisitDataResult[]> {
    const url = this.getUrlPatientVisitDataSet(
      this.storageService.einri,
      this.storageService.patnr.toString().padStart(10, '0'),
      this.storageService.falnr.toString().padStart(10, '0'),
    );
    return this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => this.processOnlyPatientData(data?.d.results)),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  processOnlyPatientData(results: any): PatientVisitDataResult[] {
    this.processPatientData(results);
    this.patientDataSubject$.next(results);
    return results;
  }

  getUrlAllPatientVisitDataSet(
    einri: string,
    patnr: string,
    showall: string,
    fromdate: string,
    todate: string
  ) {
    return `${environment.eKardexApiUrl}/patientData/PatientVisitDataSet?einri=${einri}&patnr=${patnr}&showall=${showall}&fromdate=${fromdate}&todate=${todate}`;
  }

  getAllPatientVisitDataSet(
    showall: string,
    fromdate: string,
    todate: string
  ): Observable<PatientVisitDataResult[]> {
    const url = this.getUrlAllPatientVisitDataSet(
      this.storageService.einri,
      this.storageService.patnr,
      showall,
      fromdate,
      todate
    );
    return this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => this.procesAllsPatientData(data?.d.results)),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  getUrlPatientVisitData(einri: string, patnr: string, docKey: string) {
    return `${environment.eKardexApiUrl}/patientData/getPatientVisitData?einri=${einri}&patnr=${patnr}&docKey=${docKey}`;
  }
  getSoapUrlPatientVisitData(einri: string, falnr: string, docKey: string) {
    return `${environment.eKardexApiUrl}/patientData/getSoapPatientVisitData?einri=${einri}&falnr=${falnr}&docKey=${docKey}`;
  }
  getPatientVisitData(docKey: string,param?:any): Observable<PatientVisitDataResult> {
    const url = this.getUrlPatientVisitData(
      this.storageService.einri ? this.storageService.einri:param?.einri,
      this.storageService.patnr ? this.storageService.patnr:param?.patnr,
      docKey
    );
    return this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => this.procesAllsPatientData(data?.d.results)[0]),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  getPatientVisitDataDoc(docKey: string, einri: string, patnr: string, ): Observable<PatientVisitDataResult> {
    const url = this.getUrlPatientVisitData(
      einri,
      patnr,
      docKey
    );
    return this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => this.procesAllsPatientData(data?.d.results)[0]),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }
  getSoapPatientVisitData(dockey){
    const url = this.getSoapUrlPatientVisitData(
      this.storageService.einri,
      this.storageService.falnr,
      dockey
    );
    return this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => this.procesAllsPatientData(data?.d.results)[0]),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }
  getSoapPatientdata(docKey, einri, falnr) {
    const url = this.getSoapUrlPatientVisitData(einri, falnr, docKey);
    return this.http.get(url,{
      withCredentials: true,
    });
  }

  getAttachmentVisitData(data: any){
    const url = `${environment.eKardexApiUrl}/patientData/getAttachmentData?DocKey=${data}`;
    return this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => data?.d),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }
  getReleaseHistoryData(data: any){
    const url = `${environment.eKardexApiUrl}/patientData/getHistoryOfPatientData?Einri=${this.storageService.einri}&DocKey=${data}`;
    return this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => data?.d.results),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  procesAllsPatientData(results: any): PatientVisitDataResult[] {
    if (results[0]?.Dtid == 'ZMED_SOAP') {
      this.processSoapPatientData(results);
    }else{
      this.processPatientData(results);
    }

    this.patientAllDataSubject$.next(results);
    return results;
  }

  private processPatientData(results: any) {
    results.forEach((obj: any) => {
      console.log('obj',obj);

      if (obj.Erdattim != null) {
        obj.Erdattim = obj.Erdattim.replace('/Date(', '').replace(')/', '');
      }
      if (obj.VisitDate != null) {
        obj.VisitDate = this.sanitizeSAPDateFormat(obj.VisitDate);
      }
      obj.Dokvr = Math.round(obj.Dokvr);
      if(!obj.Assessment){
        obj.Assessment = obj.Assessmenttext;
      }
    });
  }
  private processSoapPatientData(results: any) {
    results.forEach((obj: any) => {
      if (obj.Erdattim != null) {
        obj.Erdattim = obj.Erdattim.replace('/Date(', '').replace(')/', '');
      }
      if (obj.Visitdate != null) {
        obj.Visitdate = this.sanitizeSAPDateFormat(obj.Visitdate);
      }
      obj.Dokvr = Math.round(obj.Dokvr);

      if(!obj.Assessment){
        obj.Assessment = obj.Assessmenttext;
      }
    });
  }

  sanitizeSAPDateFormat(date: string) {
    if (date) {
      return new DatePipe('en-US').transform(
        date.replace('/Date(', '').replace(')/', ''),
        'yyyy-MM-dd'
      );
    }
  }
  getPhysicianAssessDocPDF(json): Observable<any>{
    const url = `${environment.eKardexApiUrl}/eHospitalist/getPhysicianAssessDocPDF`;
    return this.http.post(url , json, {
      withCredentials: true,
    });
  }
  getVisitDocData(json) {
    const url = `${environment.eKardexApiUrl}/patientData/getPatientVisitData?einri=${json.einri}&patnr=${json.patnr}&docKey=${json.Dockey}`;
    return this.http.get(url, {
      withCredentials: true,
    });;
  }

  getVisitNoteDocData(json) {
    const url = `${environment.eKardexApiUrl}/admission/getVisitNoteDocument?docKey=${json.Dockey}`;
    return this.http.get(url, {
      withCredentials: true,
    });;
  }

}
