import { StorageService } from '@services/storage.service';
//import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environments/environment';
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
//import { StorageService } from '../../services/storage.service';
import { TemplateModel } from '@services/admission/interfaces/template-model';

@Injectable()
export class EmergencyService {
  formDetailGroup: any;

  public PhysicianOrders: boolean = false;
  public ProgressNotes: boolean = false;
  public Diagnosis: boolean = false;
  public Documentation: boolean = false;
  public patientProfile: boolean = false;
  public OrderSet: boolean = false;
  public cpoe: boolean = true;
  public ePrescription: boolean = true;
  public orderdetails: boolean = false;
  public lab = false;
  public rad = false;
  public Consumables = false;
  public Services = false;

  constructor(
    private http: HttpClient,
    private cookies: CookieService,
    private storageService: StorageService
  ) {
    this.phyOrderForm();

    if (localStorage.getItem('tabName')) {
      this.tabPanelNavigation(localStorage.getItem('tabName'));
    }
  }
  url = environment.url;

  //Emergency dashboard
  getOrderSet(json) {
    let headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
      'sap-client': environment.client,
    };

    return this.http.post(this.url + 'getOrderSet', json, {
      withCredentials: true,
    });
  }
  getOrderSetBySubtitles(json) {
    let headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
      'sap-client': environment.client,
    };

    return this.http.post(this.url + 'getOrderSetBySubtitles', json, {
      withCredentials: true,
    });
  }
  createOrderSet(json) {
    return this.http.post(this.url + 'createOrderSet', json, {
      withCredentials: true,
    });
  }

  DailysisSet(json) {
    return this.http.post(this.url + 'DailysisSet', json, {
      withCredentials: true,
    });
  }

  getFavSet() {
    let headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
      'sap-client': environment.client,
    };

    return this.http.get(this.url + 'getFavSet', {
      withCredentials: true,
    });
  }
  getOrderSetByFavId(data) {
    let headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
      'sap-client': environment.client,
    };

    return this.http.post(this.url + 'getOrderSetByFavId', data, {
      withCredentials: true,
    });
  }

  getErList(data) {
    return this.http.post(this.url + 'emergencyListSet', data, {
      withCredentials: true,
    });
  }

  getErCheckList(data) {
    return this.http.post(this.url + 'emergencyListCheckInSet', data, {
      withCredentials: true,
    });
  }
  getLabResults(data) {
    return this.http.post(this.url + 'nursingLabListSet', data, {
      withCredentials: true,
    });
  }

  triagePriorityList(json) {
    return this.http.post(this.url + 'triagePriorityList', json, {
      withCredentials: true,
    });
  }
  saveTriage(json) {
    return this.http.post(this.url + 'saveTriage', json, {
      withCredentials: true,
    });
  }
  getVitalList(json) {
    return this.http.post(this.url + 'getVitalList', json, {
      withCredentials: true,
    });
  }
  getVitalDefaultList(json) {
    return this.http.post(this.url + 'getVitalDefaultList', json, {
      withCredentials: true,
    });
  }
  getAllVitalList(json) {
    return this.http.post(this.url + 'getAllVitalList', json, {
      withCredentials: true,
    });
  }
  deleteVitalList(json) {
    return this.http.post(this.url + 'deleteVitalList', json, {
      withCredentials: true,
    });
  }
  updateVitalSigns(json) {
    return this.http.post(this.url + 'updateVitalSigns', json, {
      withCredentials: true,
    });
  }
  createVitalSigns(json) {
    return this.http.post(this.url + 'createVitalSigns', json, {
      withCredentials: true,
    });
  }
  deleteReasonsList() {
    return this.http.get(this.url + 'deleteReasonsList', {
      withCredentials: true,
    });
  }
  getPatientData() {
    return this.http.get(this.url + 'patientsListSet', {
      withCredentials: true,
    });
  }
  getPrintLabel() {
    return this.http.get(this.url + 'nursingLabListPrintSet', {
      withCredentials: true,
    })
  }

  getReceviceCart(dateFrom?:any,dateTo?:any,timeFrom?:any,timeTo?:any,nurseUnit?:any) {
    return this.http.get(this.url + `getSentCartRecesive?FromDt=${dateFrom}&ToDt=${dateTo}&FromTm=${timeFrom}&ToTm=${timeTo}&Nursingou=${nurseUnit}`, {
      withCredentials: true,
    })
  }

  addReceviceCart(json) {
    return this.http.post(this.url + 'addReceiveCart', json, {
      withCredentials: true,
    })
  }

  getLabSampleCollectedPrint(Vkgid: any) {
    const urlWithParams = `${this.url}nursingLabSampleCollectedSet`;
    return this.http.post(urlWithParams, Vkgid, {
      withCredentials: true,
    });
  }

  assignToMe(json) {
    const urlWithParams = `${this.url}assignToMe`;
    return this.http.post(urlWithParams, json, {
      withCredentials: true,
    });
  }
  PrintLabel(url: any) {
    return this.http.get(url);
  }

  actionPhysicianSet(json) {
    return this.http.post(this.url + 'actionPhysicianSet', json, {
      withCredentials: true,
    });
  }

  getRiskList(json) {
    return this.http.post(this.url + 'getRiskList', json, {
      withCredentials: true,
    });
  }
  getRiskValues() {
    return this.http.get(this.url + 'getRiskValues', {
      withCredentials: true,
    });
  }
  saveRiskList(json) {
    return this.http.post(this.url + 'saveRiskList', json, {
      withCredentials: true,
    });
  }

  //allergy api
  getCancelReasons() {
    return this.http.get(this.url + 'getCancelReasons', {
      withCredentials: true,
    });
  }
  getAllergenValues() {
    return this.http.get(this.url + 'getAllergenValues', {
      withCredentials: true,
    });
  }
  getAllergenGroupValues() {
    return this.http.get(this.url + 'getAllergenGroupValues', {
      withCredentials: true,
    });
  }
  getAllergyCertaintyValues() {
    return this.http.get(this.url + 'getAllergyCertaintyValues', {
      withCredentials: true,
    });
  }
  getAllergyEvaluationValues() {
    return this.http.get(this.url + 'getAllergyEvaluationValues', {
      withCredentials: true,
    });
  }

  dialysisTAget(Bwidtge: any, Bwidtle: any) {
    return this.http.get(this.url + `dialysisTAget?Bwidtge=${Bwidtge}&Bwidtle=${Bwidtle}`, {
      withCredentials: true,
    });
  }

  Dialysisget(Bwidtge: any, Bwidtle: any) {
    return this.http.get(this.url + `Dialysisget?Bwidtge=${Bwidtge}&Bwidtle=${Bwidtle}`, {
      withCredentials: true,
    });
  }

  getAllergyReactionValues() {
    return this.http.get(this.url + 'getAllergyReactionValues', {
      withCredentials: true,
    });
  }
  getSeverityValues() {
    return this.http.get(this.url + 'getSeverityValues', {
      withCredentials: true,
    });
  }
  getPetientRoom(roomType: any) {
    return this.http.get(this.url + `getRoomDetails?treatmentou=${roomType}`, {
      withCredentials: true,
    });
  }
  getAssignedRoom(fData: any, tDate: any) {
    return this.http.get(this.url + `getAssignedRoom?Fdate=${fData}&Tdate=${tDate}`, {
      withCredentials: true,
    });
  }
  getEmployeeId(empid: any) {
    return this.http.get(this.url + `getEmployeeId?empid=${empid}`, {
      withCredentials: true,
    });
  }
  saveAssignedRoom(json) {
    return this.http.post(this.url + 'saveAssignedRoom', json, {
      withCredentials: true,
    });
  }
  getAllergyTypeValues() {
    return this.http.get(this.url + 'getAllergyTypeValues', {
      withCredentials: true,
    });
  }

  getAllergyHistory(json) {
    return this.http.post(this.url + 'getAllergyHistory', json, {
      withCredentials: true,
    });
  }
  SaveAllergyHistory(json) {
    return this.http.post(this.url + 'SaveAllergyHistory', json, {
      withCredentials: true,
    });
  }
  getPatientLabHistory(json) {
    return this.http.post(this.url + 'getPatientLabHistory', json, {
      withCredentials: true,
    });
  }
  getPatientRadHistory(json) {
    return this.http.post(this.url + 'getPatientRadHistory', json, {
      withCredentials: true,
    });
  }
  getErRadPdf(key) {
    return this.http.post(this.url + 'getErRadPdf', key, {
      withCredentials: true,
    });
  }
  getMedCompletedHistory(json) {
    return this.http.post(this.url + 'getMedCompletedHistory', json, {
      withCredentials: true,
    });
  }
  getMedNotCompletedHistory(json) {
    return this.http.post(this.url + 'getMedNotCompletedHistory', json, {
      withCredentials: true,
    });
  }
  // documentation
  getLatestAssessment(json): Observable<any> {
    return this.http.post(this.url + 'getLatestAssessment', json, {
      withCredentials: true,
    });
  }

  getEduAssesLatestDocSet(json): Observable<any> {
    return this.http.post(this.url + 'admission/getEduAssesLatestDocSet', json, {
      withCredentials: true,
    });
  }
  getPhyAssessment(json): Observable<any> {
    return this.http.post(this.url + 'getPhyAssessment', json, {
      withCredentials: true,
    });
  }
  createPhyDoc(json): Observable<any> {
    return this.http.post(this.url + 'createPhyDoc', json, {
      withCredentials: true,
    });
  }
  updatePhyDoc(json): Observable<any> {
    return this.http.post(this.url + 'updatePhyDoc', json, {
      withCredentials: true,
    });
  }
  releasePhyDoc(json): Observable<any> {
    return this.http.post(this.url + 'releasePhyDoc', json, {
      withCredentials: true,
    });
  }
  getReleasedPdf(json): Observable<any> {
    return this.http.post(this.url + 'getReleasedPdf', json, {
      withCredentials: true,
    });
  }
  deletePhyAssessment(json): Observable<any> {
    return this.http.post(this.url + 'deletePhyAssessment', json, {
      withCredentials: true,
    });
  }
  //medical report -documentation
  getMedLatestAssessment(json): Observable<any> {
    return this.http.post(this.url + 'getMedLatestAssessment', json, {
      withCredentials: true,
    });
  }
  getMedReportData(json): Observable<any> {
    return this.http.post(this.url + 'getMedReportData', json, {
      withCredentials: true,
    });
  }
  createMedDoc(json): Observable<any> {
    return this.http.post(this.url + 'createMedDoc', json, {
      withCredentials: true,
    });
  }
  deleteMedReport(json): Observable<any> {
    return this.http.post(this.url + 'deleteMedReport', json, {
      withCredentials: true,
    });
  }
  updateMedDoc(json): Observable<any> {
    return this.http.post(this.url + 'updateMedDoc', json, {
      withCredentials: true,
    });
  }
  releaseMedDoc(json): Observable<any> {
    return this.http.post(this.url + 'releaseMedDoc', json, {
      withCredentials: true,
    });
  }
  getMedReleasedPdf(json): Observable<any> {
    return this.http.post(this.url + 'getMedReleasedPdf', json, {
      withCredentials: true,
    });
  }
  //patient search
  PatientSearchSet(json) {
    return this.http.post(this.url + 'PatientSearchSet', json, {
      withCredentials: true,
    });
  }
  // analysis
  getAnalysisDetails(json) {
    return this.http.post(this.url + 'getAnalysisDetails', json, {
      withCredentials: true,
    });
  }
  // analysis (getTraigeColorPatientNo)
  getTriagePatientNo(json) {
    return this.http.get(this.url + `getTriagePatientNo?fromDate=${json.fromDate}&toDate=${json.toDate}`, {
      withCredentials: true,
    });
  }
  getElepsedTime(json) {
    return this.http.get(this.url + `getElepsedTime?fromDate=${json.fromDate}&toDate=${json.toDate}`, {
      withCredentials: true,
    });
  }

  //phy order
  successSwalModel(successMsg: string) {
    Swal.fire({
      title: successMsg,
      icon: 'success',
      confirmButtonText: 'OK',
      customClass: 'swal-class'
    });
  }

  errorSwalModel(successMsg: string) {
    Swal.fire({
      title: successMsg,
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: 'swal-class'
    });
  }

  phyOrderForm() {
    this.formDetailGroup = new FormGroup({
      'SearchData': new FormControl(''),
      'DateRange': new FormControl([new Date(), new Date()]),
      'SelectDropdown': new FormControl(),
    });
  }

  private phyOrderSetDataSubject$ = new ReplaySubject<any>(1);
  public phyOrderSetData$ = this.phyOrderSetDataSubject$.asObservable();



  tabPanelNavigation(tabName: any) {
    // localStorage.setItem('tabName', tabName); // comment which issue in redirection of of tab consulable and documentation
    if (tabName && tabName === 'OrderSet') {
      this.OrderSet = true; this.cpoe = false; this.ePrescription = false; this.orderdetails = false; this.PhysicianOrders = false; this.ProgressNotes = false; this.Diagnosis = false; this.Documentation = false; this.lab = false; this.rad = false; this.patientProfile = false; this.Consumables = false; this.Services = false;
    } else if (tabName && tabName === 'CPOE') {
      this.OrderSet = false; this.cpoe = true; this.ePrescription = false; this.orderdetails = false; this.PhysicianOrders = false; this.ProgressNotes = false; this.Diagnosis = false; this.Documentation = false; this.lab = false; this.rad = false; this.patientProfile = false; this.Consumables = false; this.Services = false;
    } else if (tabName && tabName === 'ePrescription') {
      this.OrderSet = false; this.cpoe = false; this.ePrescription = true; this.orderdetails = false; this.PhysicianOrders = false; this.ProgressNotes = false; this.Diagnosis = false; this.Documentation = false; this.lab = false; this.rad = false; this.patientProfile = false; this.Consumables = false; this.Services = false;
    } else if (tabName && tabName === 'orderdetails') {
      this.OrderSet = false; this.cpoe = false; this.ePrescription = false; this.orderdetails = true; this.PhysicianOrders = false; this.ProgressNotes = false; this.Diagnosis = false; this.Documentation = false; this.lab = false; this.rad = false; this.patientProfile = false; this.Consumables = false; this.Services = false;
    } else if (tabName && tabName === 'PhysicianOrders') {
      this.OrderSet = false; this.cpoe = false; this.ePrescription = false; this.orderdetails = false; this.PhysicianOrders = true; this.ProgressNotes = false; this.Diagnosis = false; this.Documentation = false; this.lab = false; this.rad = false; this.patientProfile = false; this.Consumables = false; this.Services = false;
    } else if (tabName && tabName === 'ProgressNotes') {
      this.OrderSet = false; this.cpoe = false; this.ePrescription = false; this.orderdetails = false; this.PhysicianOrders = false; this.ProgressNotes = true; this.Diagnosis = false; this.Documentation = false; this.lab = false; this.rad = false; this.patientProfile = false; this.Consumables = false; this.Services = false;
    } else if (tabName && tabName === 'Diagnosis') {
      this.OrderSet = false; this.cpoe = false; this.ePrescription = false; this.orderdetails = false; this.PhysicianOrders = false; this.ProgressNotes = false; this.Diagnosis = true; this.Documentation = false; this.lab = false; this.rad = false; this.patientProfile = false; this.Consumables = false; this.Services = false;
      // this.loadDischargePanelData();
    } else if (tabName && tabName === 'Documentation') {
      this.OrderSet = false; this.cpoe = false; this.ePrescription = false; this.orderdetails = false; this.PhysicianOrders = false; this.ProgressNotes = false; this.Diagnosis = false; this.Documentation = true; this.lab = false; this.rad = false; this.patientProfile = false; this.Consumables = false; this.Services = false;
      // this.loadEmarPanelData();
    } else if (tabName && tabName === 'Lab') {
      this.OrderSet = false; this.cpoe = false; this.ePrescription = false; this.orderdetails = false; this.PhysicianOrders = false; this.ProgressNotes = false; this.Diagnosis = false; this.Documentation = false; this.lab = true; this.rad = false; this.patientProfile = false; this.Consumables = false; this.Services = false;
      // this.loadEmarPanelData();
    } else if (tabName && tabName === 'Rad') {
      this.OrderSet = false; this.cpoe = false; this.ePrescription = false; this.orderdetails = false; this.PhysicianOrders = false; this.ProgressNotes = false; this.Diagnosis = false; this.Documentation = false; this.lab = false; this.rad = true; this.patientProfile = false; this.Consumables = false; this.Services = false;
      // this.loadEmarPanelData();
    } else if (tabName && tabName === 'patientProfile') {
      this.OrderSet = false; this.cpoe = false; this.ePrescription = false; this.orderdetails = false; this.PhysicianOrders = false; this.ProgressNotes = false; this.Diagnosis = false; this.Documentation = false; this.lab = false; this.rad = false; this.patientProfile = true; this.Consumables = false; this.Services = false;
      // this.loadEmarPanelData();
    } else if (tabName && tabName === 'Consumables') {
      this.OrderSet = false; this.cpoe = false; this.ePrescription = false; this.orderdetails = false; this.PhysicianOrders = false; this.ProgressNotes = false; this.Diagnosis = false; this.Documentation = false; this.lab = false; this.rad = false; this.patientProfile = false; this.Consumables = true; this.Services = false;
      // this.loadEmarPanelData();
    } else if (tabName && tabName === 'Services') {
      this.OrderSet = false; this.cpoe = false; this.ePrescription = false; this.orderdetails = false; this.PhysicianOrders = false; this.ProgressNotes = false; this.Diagnosis = false; this.Documentation = false; this.lab = false; this.rad = false; this.patientProfile = false; this.Consumables = false; this.Services = true;
      // this.loadEmarPanelData();
    }

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


  private progressNotesSetDataSubject$ = new ReplaySubject<any>(1);
  public progressNotesSetData$ = this.progressNotesSetDataSubject$.asObservable();

  async getProgressNotesSetData(patientId: string, caseid: string) {
    await lastValueFrom(this.getProgressNotes(patientId, caseid));
  }

  getProgressNotes(patientId: string, caseid: string) {
    const url = `${environment.eKardexApiUrl}/admission/getProgressNote?patientId=${patientId}&caseid=${caseid}`;

    return this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => this.processProgressNotesSetData(data?.d.results)),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  processProgressNotesSetData(results: any) {
    this.progressNotesSetDataSubject$.next(results);
    return results;
  }

  private categorySetDataSubject$ = new ReplaySubject<any>(1);
  public categorySetData$ = this.categorySetDataSubject$.asObservable();

  async getCategorySetData(patientId: string, caseid: string) {
    await lastValueFrom(this.getCategoryList(patientId, caseid));
  }

  getCategoryList(patientId: string, caseid: string) {
    const url = `${environment.eKardexApiUrl}/admission/getCategorySet?patientId=${patientId}&caseid=${caseid}`;

    return this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => this.processCategorySetData(data?.d.results)),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  processCategorySetData(results: any) {
    this.categorySetDataSubject$.next(results);
    return results;
  }


  private progressNotesTempSetDataSubject$ = new ReplaySubject<any>(1);
  public progressNoteTempSetData$ = this.progressNotesTempSetDataSubject$.asObservable();

  async getNotesTemplateSetData(patientId: string, caseid: string) {
    await lastValueFrom(this.getNotesTemplateList(patientId, caseid));
  }

  getNotesTemplateList(patientId: string, caseid: string) {
    const url = `${environment.eKardexApiUrl}/admission/getTextModulesSet`;

    return this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => this.processNotesTemplateSetData(data?.d.results)),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  processNotesTemplateSetData(results: any) {
    this.progressNotesTempSetDataSubject$.next(results);
    return results;
  }

  private progressNotesSetDataSubjectWithFilter$ = new ReplaySubject<any>(1);
  public progressNoteSetDataWithFilter$ = this.progressNotesSetDataSubjectWithFilter$.asObservable();

  async getProgressNotesDataSetWithFilter(patientId: string, caseid: string, dateFrom: any, dateTo: any, progroup: string) {
    await lastValueFrom(this.getProgressNotesListWithFilter(patientId, caseid, dateFrom, dateTo, progroup));
  }

  getProgressNotesListWithFilter(patientId: string, caseid: string, dateFrom: any, dateTo: any, progroup: string) {
    const url = `${environment.eKardexApiUrl}/admission/getProgressNote?patientId=${patientId}&caseid=${caseid}&admdatefrom=${dateFrom}&admdateto=${dateTo}&progroup=${progroup}`;

    return this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => this.processProgressNotesData(data?.d.results)),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  processProgressNotesData(results: any) {
    this.progressNotesSetDataSubjectWithFilter$.next(results);
    return results;
  }

  deleteProgressNote(obj) {
    const url = `${environment.eKardexApiUrl}/admission/deleteProgressNote?notekey=${obj.Notekey}&patientId=${obj.PatientId}`;
    return this.http.delete(url, { withCredentials: true });
  }

  private phyOrderlistDataSubjectWithFilter$ = new ReplaySubject<any>(1);
  public phyOrderlistDataWithFilter$ = this.phyOrderlistDataSubjectWithFilter$.asObservable();

  async getPhyOrderSetDataSetWithFilter(institutionid: string, caseid: string, dateFrom: any, dateTo: any, progroup: string) {
    await lastValueFrom(this.getPhyOrderListWithFilter(institutionid, caseid, dateFrom, dateTo, progroup));
  }

  getPhyOrderListWithFilter(institutionid: string, caseid: string, dateFrom: any, dateTo: any, progroup: string) {
    const url = `${environment.eKardexApiUrl}/admission/getPhyOrderSet?institutionid=${institutionid}&caseid=${caseid}&admdatefrom=${dateFrom}&admdateto=${dateTo}&progroup=${progroup}`;

    return this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => this.processPhyOrderSetDataWithFilter(data?.d.results)),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  processPhyOrderSetDataWithFilter(results: any) {
    this.phyOrderlistDataSubjectWithFilter$.next(results);
    return results;
  }

  private templateSetDataSubject$ = new ReplaySubject<any>(1);
  public templateSetData$ = this.templateSetDataSubject$.asObservable();


  async getTemplateSetDataSet() {
    await lastValueFrom(this.getTemplateSet());
  }


  getTemplateSet() {
    const url = `${environment.eKardexApiUrl}/admission/getTemplateSet`;

    return this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => this.processgetTemplateSetData(data?.d.results)),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  processgetTemplateSetData(results: any) {
    this.templateSetDataSubject$.next(results);
    return results;
  }

  private savetemplateSetDataSubject$ = new ReplaySubject<any>(1);
  public savetemplateSetData$ = this.savetemplateSetDataSubject$.asObservable();

  async saveTemplateData(templateData: TemplateModel) {

    const url = `${environment.eKardexApiUrl}/admission/saveTemplateSet`;

    const saveTemplateData$ = this.http.post(url, templateData, { withCredentials: true })
      .pipe(
        tap((data: any) => {
          this.processSaveTemplateSetData(data?.d.results)
        }),
        catchError((error: HttpErrorResponse) => {
          console.error(error);
          return throwError(() => error);
        })
      );

    await lastValueFrom(saveTemplateData$);
  }

  processSaveTemplateSetData(results: any) {
    this.savetemplateSetDataSubject$.next(results);
    return results;
  }
  deleteProgressNoteForAdmit(obj, cancelReason) {
    const url = `${environment.eKardexApiUrl}/admission/deleteProgressNote?notekey=${obj.Notekey}&patientId=${obj.PatientId}&cancelcause=${cancelReason}`;
    return this.http.delete(url, { withCredentials: true });
  }

  getPatientCaseData() {
    const url = `${environment.eKardexApiUrl}/inPatientData/getPatientCaseSet?einri=${this.storageService.einri}&patnr=${this.storageService.patnr}`;
    return this.http.get(url, {
      withCredentials: true,
    });
  }

  getPatientTableList(datefrom: any, dateto: any, falnr: string) {
    const url = `${environment.eKardexApiUrl}/eHospitalist/getPatientSet?patnr=${this.storageService.patnr}&falnr=${falnr}&datefrom=${datefrom}&dateto=${dateto}`;
    return this.http.get(url, {
      withCredentials: true,
    });
  }


  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }
  // er bed
  getErBedList() {
    return this.http.get(this.url + 'getErBedList', {
      withCredentials: true,
    });
  }
  SaveBedForPatient(json) {
    return this.http.post(this.url + 'SaveBedForPatient', json, {
      withCredentials: true,
    });
  }

  // nursing emergancy face pain post API
  createFacePainData(json) {
    return this.http.post(this.url + 'nurEmrFaceScaleSetPost', json, {
      withCredentials: true,
    });
  }

  getFacepainScaleData(dockey) {
    return this.http.get(this.url + `getFacePainScaleDetail?dockey=${dockey}`, {
      withCredentials: true,
    });
  }

  // nursing emergancy face pain post API
  createGlosgowData(json) {
    return this.http.post(this.url + 'nurEmrGlasgowScaleSetPost', json, {
      withCredentials: true,
    });
  }

  getGlosgowScaleData(dockey: string) {
    return this.http.get(this.url + `getGlowgosScaleDetail?dockey=${dockey}`, {
      withCredentials: true,
    });
  }

  // Nursing Emergancy Numeric Rating Scale Create
  saveNumericRatingDetail(payload) {
    return this.http.post(this.url + `nurEmrNumericScaleSetPost`, payload, {
      withCredentials: true,
    });
  }

  // Nursing Emergancy Numeric Rating Scale Get
  getNumericRatingDetail(dockey) {
    return this.http.get(this.url + `getNumericScaleDetail?dockey=${dockey}`, {
      withCredentials: true,
    });
  }

  // Nursing Emergancy Triage Save Data
  saveNurEmrTriage(payload) {
    return this.http.post(this.url + `saveNurEmrTriage`, payload, {
      withCredentials: true,
    });
  }

  // When click on traige icon first this API call
  getTriageLatestDocumentSet(json) {
    return this.http.get(this.url + `getTriageLatestDocumentSet?patnr=${json.Patnr}&einri=${json.Einri}&falnr=${json.Falnr}&lfdnr=${json.Lfdbw}`, {
      withCredentials: true,
    });
  }

  // When click on traige icon first this API call
  getTriageReleasedPdfUrl(json) {
    return this.http.get(this.url + `getTriagePdfUrl?Dockey=${json.Dockey}`, {
      withCredentials: true,
    });
  }

  // When click on traige icon first this API call
  getTriageDataIfStatusDraft(json) {
    return this.http.get(this.url + `getTriageDataStatusDraft?Dockey=${json.Dockey}`, {
      withCredentials: true,
    });
  }

  getTriageDataIfStatusDraftForDetails(json) {
    return this.http.get(this.url + `getTriageDataStatusDraft?Dockey=${json}`, {
      withCredentials: true,
    });
  }

  // Nursing Emergancy GET Social Habits List
  getSocialHabitList(patnr: string) {
    return this.http.get(this.url + `getSocialHabitList?Patnr=${patnr}`, {
      withCredentials: true,
    });
  }

  // Nursing Emergancy Triage Save Data
  calculateAlcoholConsumption(payload) {
    return this.http.post(this.url + `calculateAlcoholConsumption`, payload, {
      withCredentials: true,
    });
  }

  // Nursing Emergancy Triage Save Data
  saveAlcoholWithDrink(payload) {
    return this.http.post(this.url + `postAlcoholHabitDrinkYes`, payload, {
      withCredentials: true,
    });
  }

  // Nursing Emergancy save traige tabacco
  saveTabaccoHabit(payload) {
    return this.http.post(this.url + `postTabaccoHabitSmokeYes`, payload, {
      withCredentials: true,
    });
  }

  // Nursing Emergancy save traige drugs
  saveDrugsHabit(payload) {
    return this.http.post(this.url + `postDrugsHabit`, payload, {
      withCredentials: true,
    });
  }

  // Nursing Emergancy save traige other
  saveOtherHabit(payload) {
    return this.http.post(this.url + `postOtherHabit`, payload, {
      withCredentials: true,
    });
  }

  getLatestAssesmentResult(json): Observable<any> {
    return this.http.post(this.url + 'getLatestAssesmentResult', json, {
      withCredentials: true,
    });
  }
  getNurseEndorsementDetail(json): Observable<any> {
    return this.http.post(this.url + 'getNurseEndsorment', json, {
      withCredentials: true,
    });
  }
  createNurseEndorsementDetail(json): Observable<any> {
    return this.http.post(this.url + 'postOfNurseEndsorment', json, {
      withCredentials: true,
    });
  }
  createPediatricWarninfScaletDetail(json): Observable<any> {
    return this.http.post(this.url + 'postOfPrdiatricWarningScale', json, {
      withCredentials: true,
    });
  }
  updateNurseEndDetail(json): Observable<any> {
    return this.http.post(this.url + 'updateNurseEndDetail', json, {
      withCredentials: true,
    });
  }
  deleteNurseEndDoc(json): Observable<any> {
    return this.http.delete(this.url + `deleteNurseEndDoc?Dockey=${json}`, {
      withCredentials: true,
    });
  }
  deleteNurEmrTriage(json): Observable<any> {
    return this.http.delete(this.url + `deleteNurEmrTriage?Dockey=${json}`, {
      withCredentials: true,
    });
  }
  deleteSurgicalPassPDoc(json): Observable<any> {    
    return this.http.delete(this.url + `deleteSurgicalPassDoc?Dockey=${json}`, {
      withCredentials: true,
    });
  }
  getNurseEndDetail(json): Observable<any> {
    return this.http.get(this.url + `getNurseEndsormentDetail?Dockey=${json}`, {
      withCredentials: true,
    });
  }
  getPediatricWarningScoreDetail(json): Observable<any> {
    return this.http.get(this.url + `getPediatricEarlyWarningScore?Dockey=${json}`, {
      withCredentials: true,
    });
  }
  getSurgicalPassPortDetail(json): Observable<any> {
    return this.http.get(this.url + `getSurgicalPassPortDetail?Dockey=${json}`, {
      withCredentials: true,
    });
  }
  getSurgicalPasportDoc(json): Observable<any> {
    return this.http.post(this.url + 'getSurgicalPassportDoc', json, {
      withCredentials: true,
    });
  }
  createSurgicalPassDetail(json): Observable<any> {
    return this.http.post(this.url + 'postOfSurgicalPassp', json, {
      withCredentials: true,
    });
  }

  copySurgicalPassP(json) {
    return this.http.put(this.url + 'updateSurgicalPassPortDetail', json, {
      withCredentials: true,
    });
  }
  copyPediatricWarningScore(json) {
    return this.http.put(this.url + 'copyPediatricWarningScore', json, {
      withCredentials: true,
    });
  }

  copyGlosgowData(json) {
    return this.http.put(this.url + 'putGlasgowScaleSet', json, {
      withCredentials: true,
    });
  }

  copyFaceScaleSet(json) {
    return this.http.put(this.url + 'putFaceScaleSet', json, {
      withCredentials: true,
    });
  }

  copyNRSScaleSet(json) {
    return this.http.put(this.url + 'putNRSScaleSet', json, {
      withCredentials: true,
    });
  }


  // nursing emergancy face pain post API
  createBradenData(json) {
    return this.http.post(this.url + 'postBradenScaleSet', json, {
      withCredentials: true,
    });
  }

  getBradenScaleData(dockey: string) {
    return this.http.get(this.url + `getBradenScaleDetail?dockey=${dockey}`, {
      withCredentials: true,
    });
  }

  copyBradenScaleSet(json) {
    return this.http.put(this.url + 'putBradenScaleSet', json, {
      withCredentials: true,
    });
  }


  getStoragelocationList(data: any) {
    return this.http.get(`${environment.eKardexApiUrl}/getStoragelocationList?searchstring=${data}`, { withCredentials: true })
  }

  getLatestDocSet(json) {
    return this.http.get(this.url + `LatestDocSet?einri=${json.Einri}&patnr=${json.Patnr}&falnr=${json.Falnr}&lfdnr=${json.Lfdbw}`, {
      withCredentials: true,
    });
  }
  getDailysisSet(json){
    return this.http.get(this.url + `DailysisSet?Dockey${json.Dockey}`, {
      withCredentials:true
    });
  }

}
