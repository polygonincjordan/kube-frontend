import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WebService } from './web.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private webService: WebService) {}

  login(username: string, password: string): Observable<any> {
    let headers = {};
    let custHeaders = {
      Authorization: 'Basic ' + btoa(username + ':' + password),
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'sap-client': '210',
    };
    return this.webService.get('loginUser', custHeaders, headers, false);
  }

  emrLogin(username: string, password: string): Observable<any> {
    let custHeaders = {
      Authorization: 'Basic ' + btoa(username + ':' + password),
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'sap-client': '210',
    };
  
    return this.webService.get(
      `emrLoginUser?Uname=${encodeURIComponent(username)}&Password=${encodeURIComponent(password)}`,
      custHeaders
    );
  }
  



  // logout(): Observable<any> {
  //   //  return this.http.post(AUTH_API + 'signout', {}, httpOptions);
  // }
}
