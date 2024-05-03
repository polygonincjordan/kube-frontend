import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';
import { forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class WebeOrderService {
  Authorization: string;
  token: string;
  baseUrl: string;
  widgetUrl: string;

  constructor(private http: Http) {
    this.baseUrl = environment.eOrderAPIUrl;
    this.widgetUrl = environment.widgetUrl;
  }

  createAuthorizationHeader(
    headers: Headers,
    customeHeaders?: any,
    type?: any
  ) {
    Object.keys(customeHeaders).forEach((key) =>
      headers.set(key.toString(), customeHeaders[key])
    );
    headers.append('Access-Control-Allow-Origin', '*');
    headers.append('Access-Control-Allow-Credentials', 'true');
  }

  get(url: string, custHeaders?: any, params?: any, search?: any, ePres?: any);
  get(url: string, custHeaders?: any, params?: any, search?: any);
  get(url: string, custHeaders?: any, params?: any);
  get(url: string, custHeaders?: any);
  get(url: string);
  get() {
    let _url = arguments[0];
    let url = arguments[3] ? this.baseUrl + _url : this.widgetUrl + _url;
    let custHeaders = arguments[1];
    let params = arguments[2];
    let search = arguments[3];

    let headers = new Headers();
    this.createAuthorizationHeader(headers, custHeaders, 'get');

    //headers.append('Cookie','MYSAPSSO2=AjQxMDMBABhSAEEASwBTAEgASQBUAEQAIAAgACAAIAACAAYxADEAMAADABBEAEUAVgAgACAAIAAgACAABAAYMgAwADIAMQAwADEAMAAzADAANgA0ADUABQAEAAAACAYAAlgACQACRQD%2fAPswgfgGCSqGSIb3DQEHAqCB6jCB5wIBATELMAkGBSsOAwIaBQAwCwYJKoZIhvcNAQcBMYHHMIHEAgEBMBowDjEMMAoGA1UEAxMDREVWAggKIBgHAQkVATAJBgUrDgMCGgUAoF0wGAYJKoZIhvcNAQkDMQsGCSqGSIb3DQEHATAcBgkqhkiG9w0BCQUxDxcNMjEwMTAzMDY0NTQ2WjAjBgkqhkiG9w0BCQQxFgQUszlBkz265OYQeV3w0FW0C0VaaaIwCQYHKoZIzjgEAwQuMCwCFBS2TdEkOmJs25J8U9E19nHyIVI5AhQkYNyw25Uk%215prvvHD3Te%2f943Bug%3d%3d;');
    let options: RequestOptions = new RequestOptions({
      url: url,
      headers: headers,
      params: params,
      search: search,
      withCredentials: true,
    });
    options.withCredentials = true;
    return this.http.get(url, options);
  }

  post(url);
  post(url, data);
  post(url, data, custHeaders);
  post(url, data, custHeaders, params);
  post(url, data, custHeaders, params, ePres?: any);
  post() {
    let login = false;
    let _url = arguments[0];
    let url = arguments[3] ? this.widgetUrl + _url : this.baseUrl + _url;
    //let url = this.baseUrl + _url;
    let data = !arguments[1] ? {} : arguments[1];

    let custHeaders = !arguments[2] ? {} : arguments[2];
    let params = !arguments[3] ? {} : arguments[3];

    let headers = new Headers();
    this.createAuthorizationHeader(headers, custHeaders, 'post');

    let options: RequestOptions = new RequestOptions({
      url: url,
      headers: headers,
      params: params,
      withCredentials: true,
    });
    options.withCredentials = true;
    //   return this.http.post(url, data, options).timeout(60000)
    return this.http.post(url, data, options);
  }

  update(url);
  update(url, data);
  update(url, data, custHeaders);
  update(url, data, custHeaders, params);
  update() {
    let login = false;
    let _url = arguments[0];

    let url = this.baseUrl + _url;
    let data = !arguments[1] ? {} : arguments[1];

    let custHeaders = !arguments[2] ? {} : arguments[2];
    let params = !arguments[3] ? {} : arguments[3];

    let headers = new Headers();
    this.createAuthorizationHeader(headers, custHeaders, 'put');

    let options: RequestOptions = new RequestOptions({
      url: url,
      headers: headers,
      params: params,
      withCredentials: true,
    });
    options.withCredentials = true;
    //   return this.http.post(url, data, options).timeout(60000)
    return this.http.put(url, data, options);

    //return this._http.post(url,data);
  }

  delete(
    url: string,
    custHeaders?: any,
    params?: any,
    search?: any,
    ePres?: any
  );
  delete(url: string, custHeaders?: any, params?: any);
  delete(url: string, custHeaders?: any);
  delete(url: string);
  delete() {
    let _url = arguments[0];
    let url = arguments[4] ? this.widgetUrl + _url : this.baseUrl + _url;
    let custHeaders = arguments[1];
    let params = arguments[2];
    let search = arguments[3];

    let headers = new Headers();
    this.createAuthorizationHeader(headers, custHeaders, 'get');

    let options: RequestOptions = new RequestOptions({
      url: url,
      headers: headers,
      params: params,
      search: search,
      withCredentials: true,
    });
    options.withCredentials = true;
    return this.http.delete(url, options);
  }

  postFork(__url, data) {
    let that = this;
    let _url = arguments[0];
    let url = this.baseUrl + _url;

    let _data = !arguments[1] ? {} : arguments[1];
    let fork = [];

    let custHeaders = !arguments[2] ? {} : arguments[2];
    let params = !arguments[3] ? {} : arguments[3];

    let headers = new Headers();
    this.createAuthorizationHeader(headers, custHeaders, 'post');

    let options: RequestOptions = new RequestOptions({
      url: url,
      headers: headers,
      params: params,
      withCredentials: true,
    });
    options.withCredentials = true;

    return forkJoin(_data.map((e) => fetch(e).then((e) => e.json())));
  }
}
