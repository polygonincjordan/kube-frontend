import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class DayCaseDashboardService {
  url = environment.url;

  constructor(private http: HttpClient) {}

  getDayCaseErCheckList(data) {
    return this.http.post(this.url + 'dayCaseListCheckInSet', data, {
      withCredentials: true,
    });
  }

  getActualDeparturesList(data) {
    return this.http.post(this.url + 'getActualDepartures', data, {
      withCredentials: true,
    });
  }

  getPatientAdministration(fromDate?: any, toDate?: any) {
    const urlWithParams = `${this.url}getPatientAdministration?fromDate=${fromDate}&toDate=${toDate}`;
    return this.http.get(urlWithParams, {
      withCredentials: true,
    });
  }

  getSurgicalPDF(dockey: string) {
    const url = `${this.url}getSurgicalPassportPdf?dockey=${dockey}`;
    return this.http.get(url, {
      withCredentials: true,
    });
  }

  // Nursing Care Plan Document
  createNursingCarePlan(json): Observable<any> {
    return this.http.post(this.url + 'createNursingCarePlan', json, {
      withCredentials: true,
    });
  }

  deleteNursingCarePlan(json): Observable<any> {
    return this.http.post(this.url + `deleteNursingCarePlan?Dockey=${json}`, {
      withCredentials: true,
    });
  }

  getNursingCarePlanLatestDoc(json: any) {
    const url = `${this.url}nursingCarePlanLatestDoc`;
    return this.http.post(url, json, {
      withCredentials: true,
    });
  }

  getNursingCarePlanDetail(dockey: string): Observable<any> {
    return this.http.get(this.url + `getNursingCarePlanDocData?Dockey=${dockey}`, {
      withCredentials: true,
    });
  }

   // Nursing Discharge Assessment Document
   createNursingDischargeDoc(json): Observable<any> {
    return this.http.post(this.url + 'createNursingDischargeDoc', json, {
      withCredentials: true,
    });
  }

  deleteNursingDischargeDoc(json): Observable<any> {
    return this.http.post(this.url + `deleteNursingDischargeDoc?Dockey=${json}`, {
      withCredentials: true,
    });
  }

  nursingDischargeLatestDoc(json: any) {
    const url = `${this.url}nursingDischargeLatestDoc`;
    return this.http.post(url, json, {
      withCredentials: true,
    });
  }

  getNursingDischargeDocData(dockey: string): Observable<any> {
    return this.http.get(this.url + `getNursingDischargeDocData?Dockey=${dockey}`, {
      withCredentials: true,
    });
  }

   // Nursing Discharge Assessment Document
   createNursingAdmissionDoc(json): Observable<any> {
    return this.http.post(this.url + 'createNursingAdmission', json, {
      withCredentials: true,
    });
  }

  deleteNursingAdmissionDoc(json): Observable<any> {
    return this.http.post(this.url + `deleteNursingAdmissionDoc?Dockey=${json}`, {
      withCredentials: true,
    });
  }

  nursingAdmissionLatestDoc(json: any) {
    const url = `${this.url}getNursingAdmissionLatestDoc`;
    return this.http.post(url, json, {
      withCredentials: true,
    });
  }

  getNursingAdmissionDocData(dockey: string): Observable<any> {
    return this.http.get(this.url + `getNursingAdmissionDocData?Dockey=${dockey}`, {
      withCredentials: true,
    });
  }
}
