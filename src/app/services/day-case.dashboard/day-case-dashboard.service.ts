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
  getNewBornPDF(dockey: string) {
    const url = `${this.url}getNewBornPdf?dockey=${dockey}`;
    return this.http.get(url, {
      withCredentials: true,
    });
  }
  getBundlesPdf(dockey: string) {
    const url = `${this.url}getBundlesPdf?dockey=${dockey}`;
    return this.http.get(url, {
      withCredentials: true,
    });
  }
  getCvcMainPdf(dockey: string) {
    const url = `${this.url}getCvcMainPdf?dockey=${dockey}`;
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

  // Pre-Cardiac Cath Checklist
  savePreCardiacCathDoc(payload: any): Observable<any> {
    return this.http.post(this.url + `savePreCardiacCathDoc`, payload, {
      withCredentials: true,
    });
  }

  preCardiacCathLatestDoc(json: any) {
    const url = `${this.url}preCardiacCathLatestDoc`;
    return this.http.post(url, json, {
      withCredentials: true,
    });
  }

  fetcPreCardiacCathDocDetails(dockey: string): Observable<any> {
    return this.http.get(this.url + `fetcPreCardiacCathDocDetails?Dockey=${dockey}`, {
      withCredentials: true,
    });
  }

  preCardiacCathDocPDF(dockey: string): Observable<any> {
    return this.http.get(this.url + `preCardiacCathDocPDF?Dockey=${dockey}`, {
      withCredentials: true,
    });
  }

  deletePreCardiacCathDoc(dockey: any) {
    const url = `${this.url}deletePreCardiacCathDoc?Dockey=${dockey}`;
    return this.http.delete(url, {
      withCredentials: true,
    });
  }

  saveNursingAssessmentDoc(payload: any): Observable<any> {
    return this.http.post(this.url + `saveNursingAssessment`, payload, {
      withCredentials: true,
    });
  }

  // CPR document
  saveCprDocument(payload: any): Observable<any> {
    return this.http.post(this.url + `saveCprDocument`, payload, {
      withCredentials: true,
    });
  }

  cprDocumentLatestDoc(json: any) {
    const url = `${this.url}cprDocumentLatestDoc`;
    return this.http.post(url, json, {
      withCredentials: true,
    });
  }

  fetcCprDocDetails(dockey: string): Observable<any> {
    return this.http.get(this.url + `fetcCprDocDetails?Dockey=${dockey}`, {
      withCredentials: true,
    });
  }

  cprDocPDF(dockey: string): Observable<any> {
    return this.http.get(this.url + `cprDocPDF?Dockey=${dockey}`, {
      withCredentials: true,
    });
  }

  deleteCprDocument(dockey: any) {
    const url = `${this.url}deleteCprDocument?Dockey=${dockey}`;
    return this.http.delete(url, {
      withCredentials: true,
    });
  }

  // Modified Aldrete document
  saveModifiedAldreteDocument(payload: any): Observable<any> {
    return this.http.post(this.url + `saveModifiedAldreteDocument`, payload, {
      withCredentials: true,
    });
  }

  ModifiedAldretSetDocumentLatestDoc(json: any) {
    const url = `${this.url}ModifiedAldretSetDocumentLatestDoc`;
    return this.http.post(url, json, {
      withCredentials: true,
    });
  }

  fetcModifiedAldreteSetDocDetails(dockey: string): Observable<any> {
    return this.http.get(this.url + `fetcModifiedAldreteSetDocDetails?Dockey=${dockey}`, {
      withCredentials: true,
    });
  }

  // Correspondence Document
  saveCorrespondenceDocument(payload: any): Observable<any> {
    return this.http.post(this.url + `saveCorrespondenceDocument`, payload, {
      withCredentials: true,
    });
  }

  correspondenceSetDocumentLatestDoc(json: any) {
    const url = `${this.url}correspondenceSetDocumentLatestDoc`;
    return this.http.post(url, json, {
      withCredentials: true,
    });
  }

  fetcCorrespondenceSetDocDetails(dockey: string): Observable<any> {
    return this.http.get(this.url + `fetcCorrespondenceSetDocDetails?Dockey=${dockey}`, {
      withCredentials: true,
    });
  }

  correspondenceDocPDF(dockey: string): Observable<any> {
    return this.http.get(this.url + `correspondenceDocPDF?Dockey=${dockey}`, {
      withCredentials: true,
    });
  }

  deleteCorrespondenceDocument(dockey: any) {
    const url = `${this.url}deleteCorrespondenceDocument?Dockey=${dockey}`;
    return this.http.delete(url, {
      withCredentials: true,
    });
  }

  // Time Out CHecklist Document
  saveTimeoutCheckDocument(payload: any): Observable<any> {
    return this.http.post(this.url + `saveTimeoutCheckDocument`, payload, {
      withCredentials: true,
    });
  }

  TimeoutCheckDocumentLatestDoc(json: any) {
    const url = `${this.url}TimeoutCheckDocumentLatestDoc`;
    return this.http.post(url, json, {
      withCredentials: true,
    });
  }

  fetcTimeoutCheckDocDetails(dockey: string): Observable<any> {
    return this.http.get(this.url + `fetcTimeoutCheckDocDetails?Dockey=${dockey}`, {
      withCredentials: true,
    });
  }

  // Neonatal Discharge Document
  saveNeonatalDischargeDocument(payload: any): Observable<any> {
    return this.http.post(this.url + `saveNeonatalDischargeDocument`, payload, {
      withCredentials: true,
    });
  }

  NeonatalDischargeDocumentLatestDoc(json: any) {
    const url = `${this.url}NeonatalDischargeDocumentLatestDoc`;
    return this.http.post(url, json, {
      withCredentials: true,
    });
  }

  fetcNeonatalDischargeDocDetails(dockey: string): Observable<any> {
    return this.http.get(this.url + `fetcNeonatalDischargeDocDetails?Dockey=${dockey}`, {
      withCredentials: true,
    });
  }

  NeonatalDischargeDocPDF(dockey: string): Observable<any> {
    return this.http.get(this.url + `NeonatalDischargeDocPDF?Dockey=${dockey}`, {
      withCredentials: true,
    });
  }

  deleteNeonatalDischargeDocument(dockey: any) {
    const url = `${this.url}deleteNeonatalDischargeDocument?Dockey=${dockey}`;
    return this.http.delete(url, {
      withCredentials: true,
    });
  }

}
