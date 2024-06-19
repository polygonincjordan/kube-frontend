import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class DayCaseDashboardService {
  url = environment.url;

  constructor(private http: HttpClient) { }

    getDayCaseErCheckList(data) {
      return this.http.post(this.url + 'dayCaseListCheckInSet', data, {
        withCredentials: true,
      });
    }
  
    getActualDeparturesList(data){
      return this.http.post(this.url + 'getActualDepartures', data, {
        withCredentials: true,
      });
    }
  
    getPatientAdministration(fromDate?:any, toDate?:any){
      const urlWithParams = `${this.url}getPatientAdministration?fromDate=${fromDate}&toDate=${toDate}`;
      return this.http.get(urlWithParams,{
        withCredentials: true,
      });
    }
}
