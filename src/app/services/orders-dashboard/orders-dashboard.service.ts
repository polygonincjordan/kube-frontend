import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReplaySubject, catchError, lastValueFrom, map, throwError ,BehaviorSubject} from 'rxjs';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class OrdersDashboardService {
  constructor(private http: HttpClient) { }

  private ordersListDataSubject$ = new ReplaySubject<any>(1);
  public ordersListData$ = this.ordersListDataSubject$.asObservable();
  public diagnosis : BehaviorSubject<any> = new BehaviorSubject('');

  public isActiveRadiology: boolean = false;
  public isActiveProcedures: boolean = false;
  public isActiveLaboratory: boolean = true;

  public isActiveMedication: boolean = true;
  public isActiveDispensing: boolean = false;

  async getOrdersSetDataSet(statusid: string, admdatefrom: string, admdateto: string, deptou: string) {
    await lastValueFrom(this.getOrdersSet(statusid, admdatefrom, admdateto, deptou));
  }

  getOrdersSet(statusid: string, admdatefrom: string, admdateto: string, deptou: string) {    
    const url = `${environment.eKardexApiUrl}/orderdashboard/getOrderSetHeaderSet?statusid=${statusid}&admdatefrom=${admdatefrom}&admdateto=${admdateto}&deptou=${deptou}`;

    return this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => this.processOrdersSetData(data?.d.results)),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  processOrdersSetData(results: any) {
    this.ordersListDataSubject$.next(results);
    return results;
  }

  getDeptSet() {
    const url = `${environment.eKardexApiUrl}/orderdashboard/getDeptSet`;
    return this.http.get(url,{
      withCredentials: true,
    });
  }

  getPatientAgeData() {
    const url = `${environment.eKardexApiUrl}/orderdashboard/getAgeRangeSet`;
    return this.http.get(url,{
      withCredentials: true,
    });
  }

  getAssignUsersData() {
    const url = `${environment.eKardexApiUrl}/orderdashboard/getEmployeeResponsibleSet`;
    return this.http.get(url,{
      withCredentials: true,
    });
  }
  
postCountLabExtraction(startDate: any, endDate: any) {
    const url = `${environment.eKardexApiUrl}/getCountField?fromDate=${startDate}&toDate=${endDate}`;
    return this.http.get(url,{
      withCredentials: true,
    });
  }
  getMedicationAdministrationCount() {
    const url = `${environment.eKardexApiUrl}/MedicationAdministrationCount`;
    return this.http.get(url,{
      withCredentials: true,
    });
  }
  getNoConsumablesSetCount(startDate: any, endDate: any) {
    const url = `${environment.eKardexApiUrl}/NoConsumablesSetCount?fromDate=${startDate}&toDate=${endDate}`;
    return this.http.get(url,{
      withCredentials: true,
    });
  }

  saveOrderConfigurationData(orderValue: any) {
    const url = `${environment.eKardexApiUrl}/orderdashboard/saveOrderSetHeaderSet`;
    return this.http.post(url, orderValue ,{
      withCredentials: true,
    });
  }

  saveSubTitleData(orderValue: any) {
    const url = `${environment.eKardexApiUrl}/orderdashboard/saveOrdersetSubtitle`;
    return this.http.post(url, orderValue ,{
      withCredentials: true,
    });
  }

  getOrderSetByOrderId(orderValue: any) {
    const url = `${environment.eKardexApiUrl}/orderdashboard/getOrderSetByOrderId?Id=${orderValue}`;
    return this.http.get(url, {
      withCredentials: true,
    });
  }

  sendForStatusChange(id) {
    const url = `${environment.eKardexApiUrl}/orderdashboard/sendForStatusChange?Id=${id}`;
    return this.http.get(url,{
      withCredentials: true,
    });
  }

  getServiceTextList(category: string, text: string) {
    const url = `${environment.eKardexApiUrl}/orderdashboard/getOrderServicesSet?einri=1000&tarif=BS&category=${category}&searchtext=${text}`;
    return this.http.get(url,{
      withCredentials: true,
    });
  }

  
  getServiceTextWithDistinctList(category: string, text: string) {
    const url = `${environment.eKardexApiUrl}/orderdashboard/getOrderServicesSetWithDistinct?einri=1000&tarif=BS&category=${category}&searchtext=${text}`;
    return this.http.get(url,{
      withCredentials: true,
    });
  }

  getTreatmentOUList(category: string, text: string) {
    const url = `${environment.eKardexApiUrl}/orderdashboard/getOrderTreatmentOUSet?einri=1000&searchtext=${text}`;
    return this.http.get(url,{
      withCredentials: true,
    });
  }

  getTreatmentDOUList(category: string, text: string) {
    const url = `${environment.eKardexApiUrl}/orderdashboard/getOrderTreatmentDOUSet?einri=1000&searchtext=${text}`;
    return this.http.get(url,{
      withCredentials: true,
    });
  }

  getDepartmentOUList(category: string, text: string) {
    const url = `${environment.eKardexApiUrl}/orderdashboard/getOrderDeptOUSet?einri=1000&tarif=BS&category=${category}&searchtext=${text}`;
    return this.http.get(url,{
      withCredentials: true,
    });
  }

  removeOrderTemplate(key: any) {
    const url = `${environment.eKardexApiUrl}/orderdashboard/deleteOrderSetHeaderSet/${key}`;
    return this.http.delete(url, { withCredentials: true });
  }

  saveSurgeryEOrderDetails(orderValue: any) {
    const url = `${environment.eKardexApiUrl}/e-prescription/VisitSet`;
    return this.http.post(url, orderValue ,{
      withCredentials: true,
    });
  }

  saveConsultationOrder(orderValue: any) {
    const url = `${environment.eKardexApiUrl}/e-prescription/SaveConsultationVisitSet`;
    return this.http.post(url, orderValue ,{
      withCredentials: true,
    });
  }

  saveAdmissionOrder(orderValue: any) {
    const url = `${environment.eKardexApiUrl}/e-prescription/SaveAdmissionSet`;
    return this.http.post(url, orderValue ,{
      withCredentials: true,
    });
  }
  updateFavoriteSurgery(json){
    const url = `${environment.eKardexApiUrl}/e-prescription/updateFavoriteSurgery`;
    return this.http.post(url, json ,{
      withCredentials: true,
    });
  }
  getFavoriteListSurgery(json){
    const url = `${environment.eKardexApiUrl}/e-prescription/getFavoriteListSurgery`;
    return this.http.post(url, json ,{
      withCredentials: true,
    });
  }

  getFavoriteListeOrder(json?){
    const url = `${environment.eKardexApiUrl}/e-prescription/eOrderFavoriteSet`;
    return this.http.get(url,{
      withCredentials: true,
    });
  }

  
  getFavoriteListeOrderSave(json){
    const url = `${environment.eKardexApiUrl}/e-prescription/eOrderFavoriteSetSave`;
    return this.http.post(url, json ,{
      withCredentials: true,
    });
  }

  createClinicConfig(payload) {
    const url = `${environment.eKardexApiUrl}/e-prescription/CreateClinicConfigSet`;
    return this.http.post(url,payload,{
      withCredentials: true,
    });
  }

  updateClinicConfig(payload) {
    const url = `${environment.eKardexApiUrl}/e-prescription/updateClinicConfigSet`;
    return this.http.post(url,payload,{
      withCredentials: true,
    });
  }

  showErrorPopup(title: any, text: any, messageType) {
    return Swal.fire({
      title: title ? title : '',
      text: text ? text : '',
      showCancelButton: messageType === 'Conform' ? true : false,
      confirmButtonColor: '#0890c5',
      cancelButtonColor: '#84898c',
      confirmButtonText: messageType === 'Error' ? 'Close' : 'Yes',
      cancelButtonText: 'No',
      customClass: 'myalertpopup',
      icon: 'error',
      timer: 3000
    });
  }

  showSuccessPopup(title: any, text: any, messageType) {
    return Swal.fire({
      title: title ? title : '',
      text: text ? text : '',
      showCancelButton: messageType === 'Conform' ? true : false,
      confirmButtonColor: '#0890c5',
      cancelButtonColor: '#84898c',
      confirmButtonText: messageType === 'Error' ? 'Close' : 'Yes',
      cancelButtonText: 'No',
      customClass: 'myalertpopup',
      icon: 'success',
      timer: 3000
    });
  }
}
