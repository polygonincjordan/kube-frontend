import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export type CustomHeaders = { [name: string]: string | string[] }

@Injectable()
export class WebService {
  Authorization: string;
  token: string;
  baseUrl: string;
  widgetUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.url;
    this.widgetUrl = environment.widgetUrl;
  }

  createAuthorizationHeader(customHeaders?: CustomHeaders): HttpHeaders {
    let headers = new HttpHeaders(customHeaders);

    headers = headers.set('Access-Control-Allow-Origin', '*');
    headers = headers.set('Access-Control-Allow-Credentials', 'true');

    return headers;
  }

  get(url: string, customHeaders?: CustomHeaders, params?: any, isSearch?: boolean, isEPrescription?: boolean) {
    const _url = isSearch ? this.baseUrl + url : this.widgetUrl + url;
    const _headers = this.createAuthorizationHeader(customHeaders);

    return this.http.get<any>(_url, {
      headers: _headers,
      params: params,
      withCredentials: true,
    });
  }

  post(url: string, data?: any, customHeaders?: CustomHeaders, params?: any, isEPrescription?: boolean) {
    // const _url = isEPrescription ? this.widgetUrl + url : this.baseUrl + url;
    const _url = params ? this.widgetUrl + url : this.baseUrl + url;
    const _data = data ?? {};
    const _params = params ?? {};
    const _headers = this.createAuthorizationHeader(customHeaders);

    return this.http.post<any>(_url, _data, {
      headers: _headers,
      params: _params,
      withCredentials: true,
    });
  }

  update(url: string, data?: any, customHeaders?: CustomHeaders, params?: any) {
    const _url = this.baseUrl + url;
    const _data = data ?? {};
    const _params = params ?? {};
    const _headers = this.createAuthorizationHeader(customHeaders);

    return this.http.put<any>(_url, _data, {
      headers: _headers,
      params: _params,
      withCredentials: true,
    });
  }

  delete(url: string, customHeaders?: CustomHeaders, params?: any, isSearch?: boolean, isEPrescription?: boolean) {
    const _url = isEPrescription ? this.widgetUrl + url : this.baseUrl + url;
    const _headers = this.createAuthorizationHeader(customHeaders);

    return this.http.delete<any>(_url, {
      headers: _headers,
      params: params,
      withCredentials: true,
    });
  }
}
