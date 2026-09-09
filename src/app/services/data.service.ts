import { Injectable } from '@angular/core';
import { Subject, Subscription, map } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { WebeOrderService } from './e-Order/web-e-orders.service';
import { ApiResponse, StatusFlags, eMessageIcon, eMessageType } from '../chemotherapy/data.service.model';
import { DatePipe } from '@angular/common';
@Injectable({ providedIn: 'root' })
export class DataService {
  notify: Subject<any> = new Subject();

  post<T>(url: string, data: any): Promise<ApiResponse<T>> {
    return new Promise<ApiResponse<T>>((resolve) => {
      var postSubscription: Subscription = this.http
        .post<ApiResponse<T>>(url, data)
        .subscribe(
          (resp) => resolve(this.completeResponse(resp)),
          (error) => { this.notify.next({ key: eMessageType.Error, value: error, icon: eMessageIcon.Error }) },
          () => postSubscription.unsubscribe()
        );
    });
  }
  postFile<T>(url: string, data: any): Promise<ApiResponse<T>> {
    return new Promise<ApiResponse<T>>((resolve) => {
      const formData: FormData = new FormData();
      if (data && data.files && data.files.length) { data.files.forEach((file) => formData.append('files', file)); }
      formData.append('data', JSON.stringify(data));

      var postFileSubscription: Subscription = this.http
        .post<ApiResponse<T>>(url, formData)
        .subscribe(
          (resp) => resolve(this.completeResponse<T>(resp)),
          (error) => this.notify.next({ key: eMessageType.Error, value: error, icon: eMessageIcon.Error }),
          () => postFileSubscription.unsubscribe()
        );
    });
  }

  delete<T>(url: string, data: any): Promise<ApiResponse<T>> {
    return new Promise<ApiResponse<T>>((resolve) => {
      var deleteSubscription: Subscription = this.http
        .post<ApiResponse<T>>(`${url}/delete`, data)
        .subscribe(
          (resp) => resolve(this.completeResponse<T>(resp)),
          (error) => this.notify.next({ key: eMessageType.Error, value: error, icon: eMessageIcon.Error }),
          () => deleteSubscription.unsubscribe()
        );
    });
  }

  downloadFile(url: string, data: any, fileName = ''): void {
    var downloadSubscription: Subscription = this.http
      .post(url, data, { responseType: 'blob', observe: 'response' })
      .subscribe(
        (resp: HttpResponse<any>) => {
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(resp.body);
          link.download = fileName ? fileName : new DatePipe('en-US').transform(new Date(), 'ddMMyyyyHHmmss');
          link.click();
        },
        (error) => this.notify.next({ key: eMessageType.Error, value: error, icon: eMessageIcon.Error }),
        () => downloadSubscription.unsubscribe()
      );
  }
  completeResponse<T>(apiResponse: any): ApiResponse<T> {
    if (apiResponse && apiResponse.message) {
      switch (apiResponse.status) {
        // Success
        case StatusFlags.Success: {
          this.notify.next({ key: eMessageType.Success, value: apiResponse.message, icon: eMessageIcon.Success });
          break;
        }
        // Exceptions
        case StatusFlags.Failed: {
          this.notify.next({ key: eMessageType.Error, value: apiResponse.message, icon: eMessageIcon.Error });
          break;
        }
        // Warnings
        case StatusFlags.AlreadyExists:
        case StatusFlags.DependencyExists: {
          this.notify.next({ key: eMessageType.Warning, value: apiResponse.message, icon: eMessageIcon.Warning });
          break;
        }
        // Information
        default: {
          this.notify.next({ key: eMessageType.Info, value: apiResponse.message, icon: eMessageIcon.Info });
          break;
        }
      }
    }
    return apiResponse;
  }

  constructor(public webService: WebeOrderService, public http: HttpClient) { }

  ignoreKeys() {
    return [
      'toString',
      'toLocaleString',
      'valueOf',
      'hasOwnProperty',
      'isPrototypeOf',
      'propertyIsEnumerable',
      'constructor',
    ];
  }

  keyValuePairs(object: any) {
    var array = [];
    for (var key in object) {
      if (this.ignoreKeys().indexOf(key) < 0) {
        var value = object[key],
          float = parseFloat(value);
        array.push({
          key: key,
          value: value || '',
        });
      }
    }
    return array;
  }

  postData(entitySetName: any, _data: any, isEPresc: any) {
    let headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
      'sap-client': environment.client,
    };

    return this.webService.post(entitySetName, _data, headers, isEPresc, false);
  }

  deleteTemplateData(url: any, isePresc: any) {
    let headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
      'sap-client': environment.client,
    };

    return this.webService.delete(url, headers, null, null, isePresc);
  }
  deleteData(url: any, isePresc: any) {
    let headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
      'sap-client': environment.client,
    };

    return this.webService.delete(url, headers, null, null, isePresc).toPromise();
  }
  updateData(url: any, data: any) {
    let headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
      'sap-client': environment.client,
    };

    return this.webService.update(url, data, headers);
  }

  // updateData(entitySetName: any, _data: any, params: any, filters: any, isPost: any, expandEntities: any, isExpand: any) {
  //   let headers = {
  //     'X-Requested-With': 'XMLHttpRequest',
  //     'Content-Type': 'application/json',
  //     'sap-client': environment.client
  //   }

  //   let _url = this.generateURL(entitySetName, params, filters, isPost, expandEntities, isExpand);

  //   return this.webService.update(_url, _data, headers)
  // }

  loadData(
    entitySetName: any,
    params: any,
    filters: any,
    isPost: any,
    expandEntities: any,
    isExpand: any,
    isGeneric: any,
    isMultiSearch: any,
    isEPrescription: any,
    spnego: any
  ) {
    let headers = {
      // 'Accept':'application/json'
      //'spnego':'disabled'
    };
    let custHeaders = {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': '*/*',
      'sap-client': environment.client,
      spnego: 'disabled',
    };
    let _url = !isMultiSearch
      ? this.generateURL(
        entitySetName,
        params,
        filters,
        isPost,
        expandEntities,
        isExpand
      )
      : this.generateURLMultiSearch(
        entitySetName,
        params,
        filters,
        expandEntities,
        isExpand
      );
    if (_url.indexOf('$value') === -1) {
      if (!isEPrescription && spnego === true) {
        _url += '&spnego=disabled';
      } else if (params === null && filters === null) {
        _url += '?spnego=disabled';
      } else if (spnego === true) {
        _url += '&spnego=disabled';
      }
    }

    return this.webService
      .get(_url, custHeaders, headers, isGeneric, isEPrescription)
      .pipe(
        map((response: Response) => {
          return response;
        })
      );
  }

  getOrderConfigset(url: any) {
    let headers = {};
    let custHeaders = {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': '*/*',
      'sap-client': environment.client,
    };
    return this.webService.get(url, custHeaders, headers, true, false).pipe(
      map((response: Response) => {
        return response;
      })
    );
  }

  generateURLMultiSearch(
    collection: any,
    array: any,
    paramKey: any,
    expandEntities: any,
    isExpand: any
  ) {
    let url = collection;
    if (array.length > 0) {
      url += '?$filter=';
      array.forEach(function (filter: any, index: any) {
        if (index > 0) {
          url += encodeURIComponent(' or ');
        }
        url += paramKey + encodeURIComponent(" eq '" + array[index]) + "'";
      });
    }
    if (isExpand) {
      url += '&$expand=';
      let _expandedEntities = expandEntities.toString();
      url += _expandedEntities;
    }
    return url;
  }

  generateURL(
    entitySetName: any,
    params: any,
    filters: any,
    isPost: any,
    expandEntities: any,
    isExpand: any
  ) {
    let url = entitySetName;
    if (!isPost && params) params = this.keyValuePairs(params);
    if (!isPost && filters) filters = this.keyValuePairs(filters);
    if (!isPost && params) {
      url += '(';
      params.forEach(function (param: any, index: any) {
        if (index > 0) {
          url += ',';
        }
        if (param.key.indexOf('TIME') != -1) {
          url +=
            param.key + "=datetime'" + encodeURIComponent(param.value) + "'";
        } else {
          url += param.key + "='" + encodeURIComponent(param.value) + "'";
        }
      });
      url += ')';
    }
    if (!isPost && filters) {
      url += '?$filter=';
      filters.forEach((filter: any, index: any) => {
        if (index > 0) {
          url += encodeURIComponent(' and ');
        }
        if (filter.key.indexOf('TIME') != -1) {
          url +=
            filter.key +
            " eq datetime'" +
            encodeURIComponent(filter.value) +
            "'";
        } else {
          if (filter.key == 'Nursing') {
            url += filter.key + encodeURIComponent(" eq " + filter.value) + "";
          } else {
            url += filter.key + encodeURIComponent(" eq '" + filter.value) + "'";
          }
        }
      });
    }
    if (isExpand) {
      if (params) {
        url += '?$expand=';
      } else {
        url += '&$expand=';
      }

      let _expandedEntities = expandEntities.toString();
      url += _expandedEntities;
    }
    return url;
  }
  authenticateUser(username: any, _password: any) {
    let headers = {};
    let custHeaders = {
      Authorization: 'Basic ' + btoa(username + ':' + _password),
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'sap-client': environment.client,
    };
    let _url = 'loginUser';
    return this.webService.get(_url, custHeaders, headers);
  }
}
