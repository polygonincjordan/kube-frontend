import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  catchError, lastValueFrom, tap, throwError
} from 'rxjs';
import { environment } from 'src/environments/environment';
import { StorageService } from '../storage.service';
import {
  PatientVisitDataResult
} from './interfaces/patient-visit-data';
import { DatePipe, formatDate } from '@angular/common';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class PatientVisitService {
  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private datePipe: DatePipe,
  ) {}

  async savePatientVisitData(patientSaveData) {
    console.log(patientSaveData);
    const payload = {
      Dockey: patientSaveData.Dockey,
      Dtid: patientSaveData.Dtid == undefined ? '' : patientSaveData.Dtid,
      Einri: patientSaveData.Einri == undefined ? '' : patientSaveData.Einri,
      Patnr: patientSaveData.Patnr == undefined ? '' : patientSaveData.Patnr,
      Falnr: patientSaveData.Falnr == undefined ? '' : patientSaveData.Falnr,
      Lfdnr: patientSaveData.Lfdnr == undefined ? '' : patientSaveData.Lfdnr,
      Orgdo:'',
      Visitdate:
        patientSaveData.VisitDate == undefined ? '' : patientSaveData.VisitDate,
      Assessment:
        patientSaveData.Assessment == undefined
          ? ''
          : patientSaveData.Assessment,
      Subjective: patientSaveData.Subjective,
      Objective: patientSaveData.Objective,
      Plann: patientSaveData.Plann,
      AttendPhy: this.storageService.getGpart(),
      DocStatus: "1"
    };

    if(patientSaveData.Released === "X"){
      payload.DocStatus= "2";
    }


    if (payload.Visitdate != null) {
      console.log(payload.Visitdate);
      payload.Visitdate = this.datePipe.transform(patientSaveData.VisitDate, "yyyy-MM-dd");

      var date = new Date(`${payload.Visitdate} 23:59:59`);
      payload.Visitdate = `\/Date(${date.getTime()})\/`;
    }
    const url = `${environment.eKardexApiUrl}/patientVisit/savePatientVisitDataSet`;

    const savePatientConfig$ = this.http
      .post(url, payload, { withCredentials: true })
      .pipe(
        tap((data) => {
        }),
        catchError((error: HttpErrorResponse) => {
          if(error.status == 0){
            return throwError(()=> Swal.fire({
              text: "Something went wrong; please try again later. ",
              icon: 'error',
              showCancelButton: true,
              confirmButtonText: 'Yes',
              cancelButtonText: 'No',
              customClass: { popup: 'myalertpopup' }
            })
          )}
          return throwError(() => 
            Swal.fire({
              text: error.message,
              icon: 'error',
              showCancelButton: true,
              confirmButtonText: 'Yes',
              cancelButtonText: 'No',
              customClass: { popup: 'myalertpopup' }
            })
        );
        })
      );

    await lastValueFrom(savePatientConfig$);
  }
  async updatePatientVisitData(patientSaveData) {
    const payload = {
      Dockey: patientSaveData.Dockey,
      Dtid: patientSaveData.Dtid == undefined ? '' : patientSaveData.Dtid,
      Einri: patientSaveData.Einri == undefined ? '' : patientSaveData.Einri,
      Patnr: patientSaveData.Patnr == undefined ? '' : patientSaveData.Patnr,
      Falnr: patientSaveData.Falnr == undefined ? '' : patientSaveData.Falnr,
      Lfdnr: patientSaveData.Lfdnr == undefined ? '' : patientSaveData.Lfdnr,
      Orgdo:'',
      Visitdate:
        patientSaveData.VisitDate == undefined ? '' : patientSaveData.VisitDate,
      Assessment:
        patientSaveData.Assessment == undefined
          ? ''
          : patientSaveData.Assessment,
      Subjective: patientSaveData.Subjective,
      Objective: patientSaveData.Objective,
      Plann: patientSaveData.Plann,
      AttendPhy: this.storageService.getGpart(),
      DocStatus: "1"
    };
    if (payload.Visitdate != null) {
      payload.Visitdate = this.datePipe.transform(patientSaveData.VisitDate, "yyyy-MM-dd");
      console.log(payload.Visitdate);
      var date = new Date(`${payload.Visitdate} 23:59:59`);
      payload.Visitdate = `\/Date(${date.getTime()})\/`;
    }
    const url = `${environment.eKardexApiUrl}/patientVisit/updatePatientVisitDataSet`;

    const savePatientConfig$ = this.http
      .put(url, payload, { withCredentials: true })
      .pipe(
        tap((data) => {
        }),
        catchError((error: HttpErrorResponse) => {
          if(error.status == 0){
            return throwError(()=> Swal.fire({
              text: "Something went wrong; please try again later. ",
              icon: 'error',
              showCancelButton: true,
              confirmButtonText: 'Yes',
              cancelButtonText: 'No',
              customClass: { popup: 'myalertpopup' }
            })
          )}
          return throwError(() => 
            Swal.fire({
              text: error.statusText,
              icon: 'error',
              showCancelButton: true,
              confirmButtonText: 'Yes',
              cancelButtonText: 'No',
              customClass: { popup: 'myalertpopup' }
            })
        );
        })
      );

    await lastValueFrom(savePatientConfig$);
  }
  async deletePatientVisitData(patientdata) {
    const url = `${environment.eKardexApiUrl}/patientVisit/deletePatientVisitDataSet/${patientdata.Dockey}`;

    const createPatientConfig$ = this.http
      .delete(url, { withCredentials: true })
      .pipe(
        tap((data) => {
        }),
        catchError((error: HttpErrorResponse) => {
          if(error.status == 0){
            return throwError(()=> Swal.fire({
              text: "Something went wrong; please try again later. ",
              icon: 'error',
              showCancelButton: true,
              confirmButtonText: 'Yes',
              cancelButtonText: 'No',
              customClass: { popup: 'myalertpopup' }
            })
          )}
          return throwError(() => 
            Swal.fire({
              text: error.statusText,
              icon: 'error',
              showCancelButton: true,
              confirmButtonText: 'Yes',
              cancelButtonText: 'No',
              customClass: { popup: 'myalertpopup' }
            })
        );
        })
      );

    await lastValueFrom(createPatientConfig$);
  }
  async toReleaseSoapPatientVisitData(patientSaveData) {
    const payload = {
      Dockey: patientSaveData.Dockey,
      Dtid: patientSaveData.Dtid == undefined ? '' : patientSaveData.Dtid,
      Einri: patientSaveData.Einri == undefined ? '' : patientSaveData.Einri,
      Patnr: patientSaveData.Patnr == undefined ? '' : patientSaveData.Patnr,
      Falnr: patientSaveData.Falnr == undefined ? '' : patientSaveData.Falnr,
      Lfdnr: patientSaveData.Lfdnr == undefined ? '' : patientSaveData.Lfdnr,
      Orgdo:'',
      Visitdate:
        patientSaveData.VisitDate == undefined ? '' : patientSaveData.VisitDate,
      Assessment:
        patientSaveData.Assessment == undefined
          ? ''
          : patientSaveData.Assessment,
      Subjective: patientSaveData.Subjective,
      Objective: patientSaveData.Objective,
      Plann: patientSaveData.Plann,
      AttendPhy: this.storageService.getGpart(),
      DocStatus: "2"
    };

    if (payload.Visitdate != null) {
     payload.Visitdate = this.datePipe.transform(patientSaveData.VisitDate, "yyyy-MM-dd");
      console.log(payload.Visitdate);
      var date = new Date(`${payload.Visitdate} 23:59:59`);
      payload.Visitdate = `\/Date(${date.getTime()})\/`;
    }
    if(payload.Dockey) {
      const url = `${environment.eKardexApiUrl}/patientVisit/toReleaseSoapPatientVisitData`;
      const createPatientConfig$ = this.http
        .put(url,payload, { withCredentials: true })
        .pipe(
          tap((data) => {
          }),
          catchError((error: HttpErrorResponse) => {

            if(error.status == 0){
              return throwError(()=> Swal.fire({
                text: "Something went wrong; please try again later. ",
                icon: 'error',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No',
                customClass: { popup: 'myalertpopup' }
              })
            )}
            return throwError(() => 
              Swal.fire({
                text: error.statusText,
                icon: 'error',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No',
                customClass: { popup: 'myalertpopup' }
              })
          );
          })
        );
  
      await lastValueFrom(createPatientConfig$);
    } else {
      const url = `${environment.eKardexApiUrl}/patientVisit/savePatientVisitDataSet`;

      const savePatientConfig$ = this.http
        .post(url, payload, { withCredentials: true })
        .pipe(
          tap((data) => {
          }),
          catchError((error: HttpErrorResponse) => {

            if(error.status == 0){
              return throwError(()=> Swal.fire({
                text: "Something went wrong; please try again later. ",
                icon: 'error',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No',
                customClass: { popup: 'myalertpopup' }
              })
            )}
            return throwError(() => 
              Swal.fire({
                text: error.statusText,
                icon: 'error',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No',
                customClass: { popup: 'myalertpopup' }
              })
          );
          })
        );
  
      await lastValueFrom(savePatientConfig$);
    }
  }
  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num)
      return date;
    }
  }
  async saveVisitNotePatientVisitDocument(patientSaveData) {
    
    const payload = {
      Dockey: patientSaveData.Dockey,
      Dtid: patientSaveData.Dtid == undefined ? '' : patientSaveData.Dtid,
      Srcapp: patientSaveData.Srcapp == undefined ? '' : patientSaveData.Srcapp,
      Subjective:
        patientSaveData.Subjective == undefined
          ? ''
          : patientSaveData.Subjective,
      Objective:
        patientSaveData.Objective == undefined ? '' : patientSaveData.Objective,
      Etag: patientSaveData.Etag == undefined ? '' : patientSaveData.Etag,
      Einri: patientSaveData.Einri == undefined ? '' : patientSaveData.Einri,
      Patnr: patientSaveData.Patnr == undefined ? '' : patientSaveData.Patnr,
      Falnr: patientSaveData.Falnr == undefined ? '' : patientSaveData.Falnr,
      Lfdnr: patientSaveData.Lfdnr == undefined ? '' : patientSaveData.Lfdnr,
      Dokst: patientSaveData.Dokst == undefined ? '' : patientSaveData.Dokst,
      Dokvr: patientSaveData.Dokvr == undefined ? '' : patientSaveData.Dokvr,
      Dodat: patientSaveData.Dodat == undefined ? '' : patientSaveData.Dodat,
      Orgdo: patientSaveData.Orgdo == undefined ? '' : patientSaveData.Orgdo,
      SoapPlan: patientSaveData.SoapPlan == undefined ? '' : patientSaveData.SoapPlan,
      Mitarbname: patientSaveData.Mitarbname == undefined ? '' : patientSaveData.Mitarbname,
      Mitarb: patientSaveData.Mitarb == undefined ? '' : patientSaveData.Mitarb,
      DtidText: patientSaveData.DtidText == undefined ? '' : patientSaveData.DtidText,
      Erdattim: patientSaveData.Erdattim == null ? null : patientSaveData.Erdattim,
      Showall: patientSaveData.Showall == undefined ? '' : patientSaveData.Showall,
      Fromdate: patientSaveData.Fromdate == null ? null : patientSaveData.Fromdate,
      Todate: patientSaveData.Todate == null ? null : patientSaveData.Todate,

      Visitdate:
        patientSaveData.Visitdate == null ? null : patientSaveData.Visitdate,
      Referredby:
        patientSaveData.Referredby == undefined
          ? ''
          : patientSaveData.Referredby,
      Reasonforvisit:
        patientSaveData.Reasonforvisit == undefined
          ? ''
          : patientSaveData.Reasonforvisit,
      Assessmenttext:
        patientSaveData.Assessmenttext == undefined
          ? ''
          : patientSaveData.Assessmenttext,
      Transcribertext:
        patientSaveData.Transcribertext == undefined
          ? ''
          : patientSaveData.Transcribertext,
      Released:
        patientSaveData.Released == undefined ? '' : patientSaveData.Released,
      ToAttachment:
        patientSaveData.ToAttachment == undefined
          ? { results: [] }
          : patientSaveData.ToAttachment,
      ToDiagnosis:
        patientSaveData.ToDiagnosis == undefined
          ? { results: [] }
          : patientSaveData.ToDiagnosis,
    };

    if (payload.Visitdate != null) {
      console.log(payload);
      var date = new Date(`${payload.Visitdate} 23:59:59`);
      payload.Visitdate = `\/Date(${date.getTime()})\/`;
    }
    if (payload.Dodat) {
      if (typeof (payload.Dodat) === 'string') {
        return;
      } else {
        var date = new Date(`${payload.Dodat} 23:59:59`);
        payload.Dodat = `\/Date(${date.getTime()})\/`;
      }
    }
    if (payload.Erdattim) {
      if (typeof (payload.Dodat) === 'string') {
        return;
      } else {
      var date = new Date(`${payload.Erdattim} 23:59:59`);
      payload.Erdattim = `\/Date(${date.getTime()})\/`;
      }
    }
    if (payload.Fromdate) {
      if (typeof (payload.Dodat) === 'string') {
        return;
      } else {
      var date = new Date(`${payload.Fromdate} 23:59:59`);
      payload.Fromdate = `\/Date(${date.getTime()})\/`;
      }
    }
    if (payload.Todate) {
      if (typeof (payload.Dodat) === 'string') {
        return;
      } else {
      var date = new Date(`${payload.Todate} 23:59:59`);
      payload.Todate = `\/Date(${date.getTime()})\/`;
      }
    }
    const url = `${environment.eKardexApiUrl}/admission/saveVisitNoteDocument`;

    const savePatientConfig$ = this.http
      .post(url, payload, { withCredentials: true })
      .pipe(
        tap((data) => {
        }),
        catchError((error: HttpErrorResponse) => {
          if(error.status == 0){
            return throwError(()=> Swal.fire({
              text: "Something went wrong; please try again later. ",
              icon: 'error',
              showCancelButton: true,
              confirmButtonText: 'Yes',
              cancelButtonText: 'No',
              customClass: { popup: 'myalertpopup' }
            })
          )}
          return throwError(() => 
            Swal.fire({
              text: error.statusText,
              icon: 'error',
              showCancelButton: true,
              confirmButtonText: 'Yes',
              cancelButtonText: 'No',
              customClass: { popup: 'myalertpopup' }
            })
        );
        })
      );

    await lastValueFrom(savePatientConfig$);
  }

  async saveVisitNotePatientVisitData(patientSaveData) {
    const payload = {
      DocKey: patientSaveData.DocKey,
      Dtid: patientSaveData.Dtid == undefined ? '' : patientSaveData.Dtid,
      Srcapp: patientSaveData.Srcapp == undefined ? '' : patientSaveData.Srcapp,
      Subjective:
        patientSaveData.Subjective == undefined
          ? ''
          : patientSaveData.Subjective,
      Objective:
        patientSaveData.Objective == undefined ? '' : patientSaveData.Objective,
      Etag: patientSaveData.Etag == undefined ? '' : patientSaveData.Etag,
      Einri: patientSaveData.Einri == undefined ? '' : patientSaveData.Einri,
      Patnr: patientSaveData.Patnr == undefined ? '' : patientSaveData.Patnr,
      Falnr: patientSaveData.Falnr == undefined ? '' : patientSaveData.Falnr,
      Lfdnr: patientSaveData.Lfdnr == undefined ? '' : patientSaveData.Lfdnr,
      VisitDate:
        patientSaveData.VisitDate == undefined ? '' : patientSaveData.VisitDate,
      ReferredBy:
        patientSaveData.ReferredBy == undefined
          ? ''
          : patientSaveData.ReferredBy,
      ReasonForVisit:
        patientSaveData.ReasonForVisit == undefined
          ? ''
          : patientSaveData.ReasonForVisit,
      Assessmenttext:
        patientSaveData.Assessmenttext == undefined
          ? ''
          : patientSaveData.Assessmenttext,
      TranscriberText:
        patientSaveData.TranscriberText == undefined
          ? ''
          : patientSaveData.TranscriberText,
      Released:
        patientSaveData.Released == undefined ? '' : patientSaveData.Released,
      VISITTOATTACHMENTS:
        patientSaveData.VISITTOATTACHMENTS == undefined
          ? { results: [] }
          : patientSaveData.VISITTOATTACHMENTS,
      VISITTODIAGNOSIS:
        patientSaveData.VISITTODIAGNOSIS == undefined
          ? { results: [] }
          : patientSaveData.VISITTODIAGNOSIS,
    };

    if (payload.VisitDate != null) {
      console.log(payload.VisitDate);
      var date = new Date(`${payload.VisitDate} 23:59:59`);
      payload.VisitDate = `\/Date(${date.getTime()})\/`;
    }
    const url = `${environment.eKardexApiUrl}/patientVisit/saveVisitNotePatientVisitDataSet`;
    const savePatientConfig$ = this.http
      .post(url, payload, { withCredentials: true })
      .pipe(
        tap((data) => {
        }),
        catchError((error: HttpErrorResponse) => {
          if(error.status == 0){
            return throwError(()=> Swal.fire({
              text: "Something went wrong; please try again later. ",
              icon: 'error',
              showCancelButton: true,
              confirmButtonText: 'Yes',
              cancelButtonText: 'No',
              customClass: { popup: 'myalertpopup' }
            })
          )}
          const bodyMessage =
            error?.error?.error?.innererror?.errordetails?.[0]?.message ||
            error?.error?.error?.message?.value ||
            error?.error?.message ||
            error?.message ||
            '';
          const statusPart = error?.statusText || (error?.status ? `${error.status}` : '');
          const serverMessage =
            [statusPart, bodyMessage].filter(Boolean).join(': ') ||
            'Something went wrong; please try again later.';
          return throwError(() =>
            Swal.fire({
              text: serverMessage,
              icon: 'error',
              showCancelButton: true,
              confirmButtonText: 'Yes',
              cancelButtonText: 'No',
              customClass: { popup: 'myalertpopup' }
            })
        );
        })
      );

    await lastValueFrom(savePatientConfig$);
  }
  async deleteVisitNotePatientVisitData(patientVisitData) {
    const url = `${environment.eKardexApiUrl}/patientVisit/deleteVisitnotePatientVisitDataSet/${patientVisitData.DocKey}/${patientVisitData.Etag}`;

    const createPatientConfig$ = this.http
      .delete(url, { withCredentials: true })
      .pipe(
        tap((data) => {
        }),
        catchError((error: HttpErrorResponse) => {
          if(error.status == 0){
            return throwError(()=> Swal.fire({
              text: "Something went wrong; please try again later. ",
              icon: 'error',
              showCancelButton: true,
              confirmButtonText: 'Yes',
              cancelButtonText: 'No',
              customClass: { popup: 'myalertpopup' }
            })
          )}
          const bodyMessage =
            error?.error?.error?.innererror?.errordetails?.[0]?.message ||
            error?.error?.error?.message?.value ||
            error?.error?.message ||
            error?.message ||
            '';
          const statusPart = error?.statusText || (error?.status ? `${error.status}` : '');
          const serverMessage =
            [statusPart, bodyMessage].filter(Boolean).join(': ') ||
            'Something went wrong; please try again later.';
          return throwError(() =>
            Swal.fire({
              text: serverMessage,
              icon: 'error',
              showCancelButton: true,
              confirmButtonText: 'Yes',
              cancelButtonText: 'No',
              customClass: { popup: 'myalertpopup' }
            })
        );
        })
      );

    await lastValueFrom(createPatientConfig$);
  }
}
