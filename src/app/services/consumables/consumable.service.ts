import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StorageService } from '@services/storage.service';
import { ReplaySubject, catchError, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ConsumableList } from './interfaces/consumables.interface';
import { UserConfig } from '@services/e-kardex/interfaces/user-config';

@Injectable({
  providedIn: 'root'
})
export class ConsumableService {
  private ConsumablesDataSubject$ = new ReplaySubject<ConsumableList>(1);
  public ConsumablesData$ = this.ConsumablesDataSubject$.asObservable();

  constructor(
    private http: HttpClient
  ) { }

  getMaterialDetails(data: any) {
    return this.http.get(`${environment.eKardexApiUrl}/getMaterialSet?searchstring=${data}`, { withCredentials: true })
  }

  getMaterialStockDetails(data: any) {
    return this.http.get(`${environment.eKardexApiUrl}/getMaterialStockSet?searchstring=${data}`, { withCredentials: true })
  }

  saveConsumableDataSet(data: any) {
    const payload = { ...data };
    const url = `${environment.eKardexApiUrl}/saveConsumableDataSet`;
    return this.http.post(url, payload, { withCredentials: true });
  }

  getConsumablesHistory(data: any) {
    return this.http.get(`${environment.eKardexApiUrl}/getConsumablesHistory?searchstring=${data}`, { withCredentials: true })
  }

  getNoConsumablesSet() {
    return this.http.get(`${environment.eKardexApiUrl}/getNoConsumablesSet?Deptcode=${'2'}`, { withCredentials: true })
  }

  getMissedDocsSet(json?: any){
    return this.http.get(`${environment.eKardexApiUrl}/getMissedDocsSet`, {
      params: json,
      withCredentials: true
    });
  }

  getMissedDocsCount() {
    return this.http.get(`${environment.eKardexApiUrl}/getMissedDocsCount`, { withCredentials: true })
  }

  getNoConsumablesCount() {
    return this.http.get(`${environment.eKardexApiUrl}/getNoConsumablesCount`, { withCredentials: true })
  }

}
