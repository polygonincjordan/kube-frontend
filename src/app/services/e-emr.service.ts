import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Injectable } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { environment } from 'src/environments/environment';
import { WebService } from './web.service';
@Injectable()
export class EEmrService {
  constructor(
    private _http: WebService,
    private http: HttpClient,
    private cookies: CookieService
  ) { }
  url = environment.url;
  loadData(
    entitySetName,
    params,
    filters,
    isPost,
    expandEntities,
    isExpand,
    isGeneric,
    isMultiSearch,
    isEPrescription
  ) {
    let headers = {
      // 'Accept':'application/json'
      //'spnego':'disabled'
    };
    let custHeaders = {
      //'Authorization': 'Basic cmFqZXNoYTpBbWNAMTIz',
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
      'sap-client': environment.client,
      spnego: 'disabled',

      //'Referrer':'https://achdevemr01.ach.jo:5200/sap/bc/ui5_ui5/ui2/ushell/shells/abap/FioriLaunchpad.html',
      //'MYSAPSSO2':this.getToken('MYSAPSSO2')!=""?this.getToken('MYSAPSSO2'):this._api.getLocal("MYSAPSSO2")
    };
    let _url = this.generateURL(
      entitySetName,
      params,
      filters,
      isPost,
      expandEntities,
      isExpand
    );

    if (params === null && filters === null && !isExpand) {
      _url += '?spnego=disabled';
    } else if (params && filters === null) {
      _url += '?spnego=disabled';
    } else if (params === null && filters === null && !isExpand) {
      _url += '&spnego=disabled';
    }

    return this._http.get(
      _url,
      custHeaders,
      headers,
      isGeneric,
      isEPrescription
    );
  }
  generateURL(
    entitySetName,
    params,
    filters,
    isPost,
    expandEntities,
    isExpand
  ) {
    let url = entitySetName;
    if (!isPost && params) params = this.keyValuePairs(params);
    if (!isPost && filters) filters = this.keyValuePairs(filters);
    if (!isPost && params) {
      url += '(';
      params.forEach(function (param, index) {
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
      filters.forEach(function (filter, index) {
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
          url += filter.key + encodeURIComponent(" eq '" + filter.value) + "'";
        }
      });
    }
    if (isExpand) {
      if (params) {
        url += '?$expand=';
      } else {
        url += '?$expand=';
      }

      let _expandedEntities = expandEntities.toString();
      url += _expandedEntities;
    }
    return url;
  }

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
  keyValuePairs(object) {
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

  // widget info set
  getMyClinicInfoSet() {
    let headers = {
      // 'Accept':'application/json'
      //'spnego':'disabled'
    };
    let custHeaders = {
      //'Authorization': 'Basic cmFqZXNoYTpBbWNAMTIz',
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
      'sap-client': environment.client,
      spnego: 'disabled',
      //'Referrer':'https://achdevemr01.ach.jo:5200/sap/bc/ui5_ui5/ui2/ushell/shells/abap/FioriLaunchpad.html',
      //'MYSAPSSO2':this.getToken('MYSAPSSO2')!=""?this.getToken('MYSAPSSO2'):this._api.getLocal("MYSAPSSO2")
    };
    return this._http.get(
      "WidgetInfoSet('MYCLINIC01')" +
      '?$expand=TODATA,TOMETADATA,TOALLOWEDACTIONS',
      custHeaders,
      headers
    );
  }
  getMyWidgetConfigSet() {
    let headers = {
      // 'Accept':'application/json'
      //'spnego':'disabled'
    };
    let custHeaders = {
      //'Authorization': 'Basic cmFqZXNoYTpBbWNAMTIz',
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
      'sap-client': environment.client,
      spnego: 'disabled',
      //'Referrer':'https://achdevemr01.ach.jo:5200/sap/bc/ui5_ui5/ui2/ushell/shells/abap/FioriLaunchpad.html',
      //'MYSAPSSO2':this.getToken('MYSAPSSO2')!=""?this.getToken('MYSAPSSO2'):this._api.getLocal("MYSAPSSO2")
    };
    return this._http.get('EMRWidgetConfigSet', custHeaders, headers);
  }
  postWidgetConfigSet(obj) {
    let headers = {
      // 'Accept':'application/json'
      //'spnego':'disabled'
    };
    let custHeaders = {
      //'Authorization': 'Basic cmFqZXNoYTpBbWNAMTIz',
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
      'sap-client': environment.client,
      spnego: 'disabled',
      //'Referrer':'https://achdevemr01.ach.jo:5200/sap/bc/ui5_ui5/ui2/ushell/shells/abap/FioriLaunchpad.html',
      //'MYSAPSSO2':this.getToken('MYSAPSSO2')!=""?this.getToken('MYSAPSSO2'):this._api.getLocal("MYSAPSSO2")
    };
    return this._http.post('EMRWidgetConfigSet', obj, custHeaders, headers);
  }
  deleteMyWidgetConfigSet(id) {
    let headers = {};
    let custHeaders = {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
      'sap-client': environment.client,
      spnego: 'disabled',
    };
    return this._http.delete(
      'EMRWidgetConfigSet' + `(Widgetid='${id}')`,
      custHeaders,
      headers
    );
  }
  widgetResponseSet(_data) {
    return this.http.post(this.url + 'WidgetActionRespSet', _data, {
      withCredentials: true,
    });
  }
  //filter widget data
  widgetDataFilter(_data) {
    let headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
      'sap-client': environment.client,
    };

    return this.http.post(this.url + 'WidgetDataSet', _data, {
      withCredentials: true,
    });
  }

  //filter fields
  getfilterMovementType() {
    let headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
      'sap-client': environment.client,
    };

    return this._http.get(
      "WidgetFltFldPropSet(Widgetid='MYCLINIC01',Fieldname='SE_BEWAR')?$expand=FLDPROPTOVHELP",
      headers
    );
  }
  getfilterFieldsStatus() {
    let headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
      'sap-client': environment.client,
    };

    return this._http.get(
      "WidgetFltFldPropSet(Widgetid='MYCLINIC01',Fieldname='SE_BSSTA')?$expand=FLDPROPTOVHELP",
      headers
    );
  }
  getfilterFieldsStatusForLab() {
    let headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
      'sap-client': environment.client,
    };

    return this._http.get(
      "WidgetFltFldPropSet(Widgetid='MYLAB01',Fieldname='P_RSTTXT')?$expand=FLDPROPTOVHELP",
      headers
    );
  }
  getfilterFieldsStatusForRad() {
    let headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
      'sap-client': environment.client,
    };

    return this._http.get(
      "WidgetFltFldPropSet(Widgetid='MYRAD01',Fieldname='P_RSTTXT')?$expand=FLDPROPTOVHELP",
      headers
    );
  }

  // Checked Lab results (documents that already have a PR/checked status).
  // dateFrom / dateTo are 'YYYY-MM-DDT00:00:00' strings, patnr a 10-digit MRN.
  getCheckedLabResults(patnr, dateFrom, dateTo) {
    let headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
      'sap-client': environment.client,
    };
    // Patnr is optional: when empty, omit it so SAP returns all of the logged-in
    // user's checked results for the date range.
    const dateFilter = `Datefrom eq datetime'${dateFrom}' and Dateto eq datetime'${dateTo}'`;
    const filter = patnr ? `Patnr eq '${patnr}' and ${dateFilter}` : dateFilter;
    return this._http.get(
      'LabPrSetSet?$filter=' + filter + '&$format=json',
      headers
    );
  }
  // Checked Radiology reports (documents that already have a PR/checked status).
  getCheckedRadResults(patnr, dateFrom, dateTo) {
    let headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
      'sap-client': environment.client,
    };
    // Patnr is optional: when empty, omit it so SAP returns all of the logged-in
    // user's checked results for the date range.
    const dateFilter = `Datefrom eq datetime'${dateFrom}' and Dateto eq datetime'${dateTo}'`;
    const filter = patnr ? `Patnr eq '${patnr}' and ${dateFilter}` : dateFilter;
    return this._http.get(
      'RadPrSet?$filter=' + filter + '&$format=json',
      headers
    );
  }

  //In patient
  getInPatientList(obj) {
    let headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
      'sap-client': environment.client,
    };

    // return this._http.get(`InPatientList?filter=((AdmDateFrom=${obj.AdmDateFrom})and(AdmDateTo=${obj.AdmDateTo})and(Floor=${obj.Floor}))"`, headers)
    return this.http.post(this.url + 'InPatientList', obj, {
      withCredentials: true,
    });
  }
  getWardList() {
    // let headers = {
    //   'X-Requested-With': 'XMLHttpRequest',
    //   'Content-Type': 'application/json',
    //   'sap-client': environment.client,

    // };
    return this.http.get(this.url + 'getWardList', { withCredentials: true });
  }

  getHighDependencyOfPatientList(obj) {
    let headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
      'sap-client': environment.client,
    };
    return this._http.post('getHighDependencyOfPatientList', obj, headers);
  }
  postHighDependencyOfPatientList(obj) {
    let headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
      'sap-client': environment.client,
    };
    return this._http.post('HighDependencyOfPatientList', obj, headers);
  }
  //config tools
  getConfigTools(obj) {
    // let headers = {
    //   'X-Requested-With': 'XMLHttpRequest',
    //   'Content-Type': 'application/json',
    //   'sap-client': environment.client,
    // };
    return this.http.post(this.url + 'getConfigTools', obj, {
      withCredentials: true,
    });
  }
  postConfigTools(obj) {
    // let headers = {
    //   'X-Requested-With': 'XMLHttpRequest',
    //   'Content-Type': 'application/json',
    //   'sap-client': environment.client,
    // };
    return this.http.post(this.url + 'postConfigTools', obj, {
      withCredentials: true,
    });
  }
  postCountForNavModules(obj) {
    {
      let headers = {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        'sap-client': environment.client,
      };
      return this._http.post('getCountForModules', obj, headers);
    }
  }

  phCountForNavModules(obj) {
    {
      let headers = {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        'sap-client': environment.client,
      };
      return this._http.post('getCountForPhOrderModules', obj, headers);
    }
  }




  physicianOrderSet(obj) {
    {
      let headers = {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        'sap-client': environment.client,
      };
      return this.http.put(this.url + 'physicianOrderSet', obj, {
        withCredentials: true,
      });
    }
  }
  cancelReasonList() {
    return this.http.get(this.url + 'CancelReasonSet', {
      withCredentials: true,
    });
  }
  createPhysicianOrder(json) {
    return this.http.post(this.url + 'createPhysicianOrder', json, {
      withCredentials: true,
    });
  }

  createMultiplePhysicianOrder(json) {
    return this.http.post(this.url + 'createMultiplePhysicianOrder', json, {
      withCredentials: true,
    });
  }
  createProgressEntry(json) {
    return this.http.post(this.url + 'createProgressEntry', json, {
      withCredentials: true,
    });
  }
  // replaceProgressEntry(json) {
  //   return this.http.post(this.url + 'replaceProgressNote', json, {
  //     withCredentials: true,
  //   });
  // }

  replaceProgressEntry(obj) {
    const url = `${environment.eKardexApiUrl}/admission/replaceProgressNote?notekey=${obj.Notekey}&patientId=${obj.PatientId}`;
    return this.http.post(url, obj, { withCredentials: true });
  }
  occupationalGroupList() {
    return this.http.get(this.url + 'occupationalGroupList', {
      withCredentials: true,
    });
  }
  consultationCompletion(json) {
    return this.http.post(this.url + 'consultationCompletion', json, {
      withCredentials: true,
    });
  }
  changeStatus(json){
    return this.http.post(this.url + 'changeStatus', json, {
      withCredentials: true,
    });
  }
  changePassword(json){
    return this.http.post(this.url + 'changePassword', json, {
      withCredentials: true,
    });
  }
  physicianOrderText() {
    return this.http.get(this.url + 'physicianOrderText', {
      withCredentials: true,
    });
  }
}
