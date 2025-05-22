import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { get as _get, isArray as _isArray } from 'lodash';
import { DatePipe } from '@angular/common';
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
import { HospitalistType } from './interfaces/hospitalist';
import { environment } from 'src/environments/environment';
import { StorageService } from '../storage.service';

@Injectable({
  providedIn: 'root',
})
export class HospitalistService {
  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) { }

  url = environment.url
  private inHospitalistDataSubject$ = new ReplaySubject<any>(1);
  public inHospitalistData$ = this.inHospitalistDataSubject$.asObservable();


  private inHospitalistDataCountSubject$ = new ReplaySubject<any>(1);
  public inHospitalistDataCount$ = this.inHospitalistDataCountSubject$.asObservable();

  async getIpListSetDataSet(typ_eq: string, ward: string) {
    await lastValueFrom(this.getIpListSet(typ_eq,ward));
  }

  async getIpListSetDataSetWithFilter(typ_eq: string, admDateFrom: string, admDateTo: string, floor: string, physician: string) {
    await lastValueFrom(this.getIpListSetWithFilter(typ_eq, admDateFrom, admDateTo, floor, physician));
  }

  getIpListSetWithFilter(typ_eq: string, admDateFrom: string, admDateTo: string, floor: string, physician: string) {
    const url = `${environment.eKardexApiUrl}/eHospitalist/getIpListSet?typ_eq=${typ_eq}&admdatefrom=${admDateFrom}&admdateto=${admDateTo}&floor=${floor}&physician=${physician}`;

    return this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => this.processHospitalistData(data?.d.results)),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );

  }

  getIpListSet(typ_eq: string,ward:string) {
    const url = `${environment.eKardexApiUrl}/eHospitalist/getIpListSet?typ_eq=${typ_eq}&floor=${ward}`;

    return this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => this.processHospitalistData(data?.d.results)),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  getMedicationAdministration(einri:any,falnr:any){
    const urlWithParams = `${this.url}getLevelOrderHistory?einri=${einri}&falnr=${falnr}`;
    return this.http.get(urlWithParams, {
      withCredentials: true,
    });
  }

  async getIplistDataCountSet(typ_eq: string) {
    await lastValueFrom(this.getIplistCountSet(typ_eq));
  }


  getIplistCountSet(typ_eq: string) {
    const url = `${environment.eKardexApiUrl}/eHospitalist/getIplistCountSet?typ_eq=${typ_eq}`;

    return this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => this.processHospitalistDataCount(data?.d.results)),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );

  }

  processHospitalistData(results: any) {
    this.inHospitalistDataSubject$.next(results);
    return results;
  }

  processHospitalistDataCount(results: any) {
    this.inHospitalistDataCountSubject$.next(results);
    return results;
  }

  private attendingPhysician$ = new ReplaySubject<any>(1);
  public attendingPhylistData$ = this.attendingPhysician$.asObservable();

  async getAttendingPhySetDataSet(typ_eq: string, admdatefrom: string, admdateto: string, floor: string) {
    await lastValueFrom(this.getAttendPhySet(typ_eq, admdatefrom, admdateto, floor));
  }

  getAttendPhySet(typ_eq: string, admdatefrom: string, admdateto: string, floor: string) {
    const url = `${environment.eKardexApiUrl}/eHospitalist/getPhysicianList?typ_eq=${typ_eq}&admdatefrom=${admdatefrom}&admdateto=${admdateto}&floor=${floor}`;

    return this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => this.processAttendPhySetData(data?.d.results)),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  processAttendPhySetData(results: any) {
    this.attendingPhysician$.next(results);
    return results;
  }

  // New HospitalList Service
  private getInHospitalistDataSubject$ = new ReplaySubject<any>(1);
  public getInHospitalistData$ = this.getInHospitalistDataSubject$.asObservable();

  async getIpListDataSet(typ_eq: string, admDateFrom: string, admDateTo: string, floor: string, physician: string, speciality: string, reportType: string) {
    await lastValueFrom(this.getIpListSetData(typ_eq, admDateFrom, admDateTo, floor, physician, speciality, reportType));
  }

  getIpListSetData(typ_eq: string, admDateFrom: string, admDateTo: string, floor: string, physician: string, speciality: string, reportType: string) {
    const url = `${environment.eKardexApiUrl}/eHospitalist/getHospitalSet?typ_eq=${typ_eq}&admdatefrom=${admDateFrom}&admdateto=${admDateTo}&floor=${floor}&physician=${physician}&deptou=${speciality}&reporttype=${reportType}`;

    return this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => this.processHospitalist(data?.d.results)),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  processHospitalist(results: any) {
    this.getInHospitalistDataSubject$.next(results);
    return results;
  }

  postCountForNavModules(obj: any) {
    const url = `${environment.eKardexApiUrl}/eHospitalist/getCountInPatientList`;
    return this.http.post(url, obj,{
      withCredentials: true,
    });
  }

  getInPatientAdmittedList(typ_eq: string, admDateFrom: string, admDateTo: string, floor: string, physician: string, speciality: string, reportType: string) {
    const url = `${environment.eKardexApiUrl}/eHospitalist/getHospitalSet?typ_eq=${typ_eq}&admdatefrom=${admDateFrom}&admdateto=${admDateTo}&floor=${floor}&physician=${physician}&deptou=${speciality}&reporttype=${reportType}`;
    return this.http.get(url,{
      withCredentials: true,
    });
  }

  getHospitalCount(type: string, floor: string) {
    const url = `${environment.eKardexApiUrl}/eHospitalist/getHospitalCountSet?type=${type}&floor=${floor}`;
    return this.http.get(url,{
      withCredentials: true,
    });
  }

  getInPatientList(obj: any) {
    const url = `${environment.eKardexApiUrl}/eHospitalist/getInPatientList`;
    return this.http.post(url, obj,{
      withCredentials: true,
    });
  }

  getNotPhysicionOrderList(obj: any) {
    const url = `${environment.eKardexApiUrl}/eHospitalist/getNotPhysicionOrder`;
    return this.http.post(url, obj,{
      withCredentials: true,
    });
  }

  private phyOrderlistDataSubject$ = new ReplaySubject<any>(1);
  public phyOrderlistData$ = this.phyOrderlistDataSubject$.asObservable();

  async getPhyOrderSetDataSet(institutionid: string, caseid: string) {
    await lastValueFrom(this.getPhyOrderSet(institutionid, caseid));
  }

  getPhyOrderSet(institutionid: string, caseid: string) {
    const url = `${environment.eKardexApiUrl}/admission/getPhyOrderSet?institutionid=${institutionid}&caseid=${caseid}`;

    return this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => this.processPhyOrderSetData(data?.d.results)),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  processPhyOrderSetData(results: any) {
    this.phyOrderlistDataSubject$.next(results);
    return results;
  }

  cancelReasonList() {
    const url = `${environment.url}CancelReasonSet`
    return this.http.get(url, {
      withCredentials: true,
    });
  }

  createPhysicianOrder(json){
    const url = `${environment.url}createPhysicianOrder`

    return this.http.post(url, json, {
      withCredentials: true,
    });
  }

  occupationalGroupList(){
    const url = `${environment.url}occupationalGroupList`

    return this.http.get(url, {
      withCredentials: true,
    });
  }

  physicianOrderSet(obj) {
    const url = `${environment.url}physicianOrderSet`

    return this.http.put(url, obj, {
      withCredentials: true,
    });
  }

  getCheckPDF(_data){
    const url = `${environment.url}eHospitalist/getLabDocCheckinSet`
    return this.http.post(url, _data, {
      withCredentials: true,
    });
  }

  createLabPatientData(_data){
    const url = `${environment.url}eHospitalist/createLabServicesSet`
    return this.http.post(url, _data, {
      withCredentials: true,
    });
  }

  getLabService(_data){
    const url = `${environment.url}eHospitalist/getLabServicesSet?vkgid=${_data}`
    return this.http.get(url, {
      withCredentials: true,
    });
  }

  getIpListSetAPI(typ_eq: string, admDateFrom: string, admDateTo: string, floor: string, physician: string, speciality: string, reportType: string) {
    const url = `${environment.eKardexApiUrl}/eHospitalist/getHospitalSet?typ_eq=${typ_eq}&admdatefrom=${admDateFrom}&admdateto=${admDateTo}&floor=${floor}&physician=${physician}&deptou=${speciality}&reporttype=${reportType}`;

    return this.http.get(url, {
      withCredentials: true,
    });
  }

  getArrivalListSetAPI(casetype: string, orgpf: string, date: string) {
    const url = `${environment.eKardexApiUrl}/eHospitalist/getArrivalList?casetype=${casetype}&orgpf=${orgpf}&date=${date}`;

    return this.http.get(url, {
      withCredentials: true,
    });
  }
  getSurgeryWorkListSetAPI() {
    const url = `${environment.eKardexApiUrl}/eHospitalist/getSurgeryWorkList`;

    return this.http.get(url, {
      withCredentials: true,
    });
  }
  getMedicationAdministrationSet(Deptcode?:any,fromDate?:any, toDate?:any){
    let urlWithParams = ''

    if(Deptcode === null || Deptcode === ""){
      urlWithParams = `${this.url}MedicationAdministrationSet?fromDate=${fromDate}&toDate=${toDate}`;
    }else{
      urlWithParams = `${this.url}MedicationAdministrationSet?Deptcode=${Deptcode}&fromDate=${fromDate}&toDate=${toDate}`;
    }
    return this.http.get(urlWithParams, {
      withCredentials: true,
    })
  }
  getDialysisMedicationAdministrationSet(Deptcode?:any,fromDate?:any, toDate?:any){
    return this.http.get(`${this.url}DialysisMedicationAdministrationSet?Deptcode=${Deptcode}&fromDate=${fromDate}&toDate=${toDate}`,{
      withCredentials: true
    })
  }
  getAdministerEvent(orderValue: any) {
    const url = `${environment.eKardexApiUrl}/e-prescription/getAdministerEvent`;
    return this.http.post(url, orderValue ,{
      withCredentials: true,
    });
  }
  getEmarEventSet(Einri: string, Falnr: string): Observable<any> {
    return this.http.get(`${environment.eKardexApiUrl}/e-prescription/EmarEventSet?Einri=${Einri}&Falnr=${Falnr}`);
  }
  getSpecialtyList(){
    const url = `${environment.url}eHospitalist/getDeptOUSet`
    return this.http.get(url, {
      withCredentials: true,
    });
  }
    getDischargeApproval(json) {
    return this.http.get(this.url + `getDischargeApproveSet?Einri=${json.Einri}&Falnr=${json.Falnr}&PA=${json.PA}&PP=${json.PP}&PB=${json.PB}`, { withCredentials: true });
  }

  pregnantIndSet(payload: any) {
    const url = `${environment.eKardexApiUrl}/eHospitalist/postPregnantIndSet`;
    return this.http.post(url, payload, {
      withCredentials: true,
    });
  }

  patientListSet(payload: any) {
    const url = `${environment.eKardexApiUrl}/eHospitalist/postMyPatientSet`;
    return this.http.post(url, payload, {
      withCredentials: true,
    });
  }

  removePatientListSet(payload: any) {
    const url = `${environment.eKardexApiUrl}/eHospitalist/postRemoveMyPatientSet?PatientNo=${payload.PatientNo}&Physician=${payload.Physician}&CaseNo=${payload.CaseNo}`;
    return this.http.delete(url, {
      withCredentials: true,
    });
  }

  
}
