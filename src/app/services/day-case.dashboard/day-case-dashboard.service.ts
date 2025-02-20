import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class DayCaseDashboardService {
  url = environment.url;

  public isRedirectToSelectedDoc = true;

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

  getPatientAdministration(fromDate?: any, toDate?: any,deptcode?:any) {
    const urlWithParams = `${this.url}getPatientAdministration?Deptcode=${deptcode}&fromDate=${fromDate}&toDate=${toDate}`;
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
    return this.http.delete(this.url + `deleteNursingCarePlan?Dockey=${json}`, {
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
    return this.http.delete(this.url + `deleteNursingDischargeDoc?Dockey=${json}`, {
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

  getNoConsumablesSet(json) {
    return this.http.get(this.url + 'getDayCaseNoConsumablesSet', {params: json, withCredentials: true })
  }

  getNotPhysicionOrderList(obj: any) {
    return this.http.post(this.url + 'getDayCaseNotPhysicionOrder', obj,{
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
    return this.http.delete(this.url + `deleteNursingAdmissionDoc?Dockey=${json}`, {
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

  
  nursingAssessmentLatestDoc(json: any) {
    const url = `${this.url}nursingAssessmentLatestDoc`;
    return this.http.post(url, json, {
      withCredentials: true,
    });
  }

  getNursingAssessmentDocData(dockey: string): Observable<any> {
    return this.http.get(this.url + `fetchNursingDocumentDocDetails?Dockey=${dockey}`, {
      withCredentials: true,
    });
  }

  deleteNursingAssessmentDoc(dockey: any) {
    const url = `${this.url}deleteNursingAssessmentDoc?Dockey=${dockey}`;
    return this.http.delete(url, {
      withCredentials: true,
    });
  }

  saveNursingAssessmentDoc(payload: any): Observable<any> {
    return this.http.post(this.url + `saveNursingAssessment`, payload, {
      withCredentials: true,
    });
  }
}
