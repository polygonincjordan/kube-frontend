import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PointofsaleService {
  url = environment.url;
constructor(private http: HttpClient,) { }
getPatientInfoByCase(json) {
  return this.http.post(this.url + 'pointOfSale/getPatientInfoByCase', json, {
    withCredentials: true,
  });
}
getStorageLocations() {
  return this.http.get(this.url + 'pointOfSale/getStorageLocations',  {
    withCredentials: true,
  });
 }
 getMaterialDetailsSet(json) {
  return this.http.post(this.url + 'pointOfSale/getMaterialDetailsSet', json, {
    withCredentials: true,
  });
}
}  
