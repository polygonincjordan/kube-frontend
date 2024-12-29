import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { environment } from 'src/environments/environment';
import swal from 'sweetalert2';


@Injectable({
  providedIn: 'root'
})
export class MissedMedicationDosesService {
  public missedMedicationList: MissedMedicationList = { medicationData: [], eventData: [] };
  private BaseUrl = environment.eOrderAPIUrl;
  public parameters: any;
  formgroupData: any;
  RequestStatus: any;
  constructor(private httpClient: HttpClient, private DatePipe: DatePipe) {
  }

  loadParameters(isEinri: boolean, isFalnr: boolean): object {
    let filter: any = {};
    if (isEinri) { filter['Einri'] = this.parameters.Einri }
    if (isFalnr) { filter['Falnr'] = this.parameters.Falnr }
    return filter;
  }


  onTodayEMAREventData(data: any) {
    this.parameters = data;
    this.loadMARData()
    this.loadMAREventData([new Date().setHours(new Date().getHours() - 48), new Date().setHours(new Date().getHours() + 48)]);
  }

  loadMARData() {
    let filters = this.loadParameters(true, true);
    this.loadData('EmarSet', filters, false, false, false).subscribe({
      next: (resp: any) => {
        this.missedMedicationList.medicationData = [];
        if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length && resp.body.d.results.filter(y => y.Userst === 'ACT').length) {
          this.missedMedicationList.medicationData = resp.body.d.results.filter(y => y.Userst === 'ACT');
        } else {
          this.parameters = {}
          swal.fire({
            text: 'There is no Missed/Not Administered Doses to show',
            confirmButtonColor: '#0890c5',
            cancelButtonColor: '#84898c',
            confirmButtonText: 'OK',
            customClass: 'myalertpopup',
            icon: 'error',
          });
        }
      },
      error: (error: any) => {
        this.parameters = {}
        swal.fire({
          title: error.statusText,
          text: 'There is no Missed/Not Administered Doses to show',
          confirmButtonColor: '#0890c5',
          cancelButtonColor: '#84898c',
          confirmButtonText: 'OK',
          customClass: 'myalertpopup',
          icon: 'error',
        });
      }
    });
  }

  loadMAREventData(data: any) {
    const filters = this.loadParameters(true, true);
    // data[0] = new Date(data[0]).getDate() - 200;
    if (data && data[0] && data[1]) {
      const Pbdad = `${this.DatePipe.transform(data[0], 'yyyy-MM-dd')}T${this.DatePipe.transform(data[0], 'HH:mm:ss')}`;
      const Pbdad1 = `${this.DatePipe.transform(data[1], 'yyyy-MM-dd')}T${this.DatePipe.transform(data[1], 'HH:mm:ss')}`;
      const additionalData = `and Pbdad eq datetime'${Pbdad}' and Pbdad1 eq datetime'${Pbdad1}'`;
      this.missedMedicationList.medicationData = null;
      this.loadData('EmarEventSet', filters, false, false, false, additionalData).subscribe({
        next: (resp: any) => {
          this.missedMedicationList.eventData = [];
          if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
            this.missedMedicationList = { ...this.missedMedicationList, eventData: resp.body.d.results };
          }
        },
        error: (error: any) => {
          swal.fire({
            title: error.statusText,
            text: 'No data found',
            confirmButtonColor: '#0890c5',
            cancelButtonColor: '#84898c',
            confirmButtonText: 'OK',
            customClass: 'myalertpopup',
            icon: 'error',
          });
        }
      })
    }
  }

  keyValuePairs(object: any) {
    var array = [];
    for (var key in object) {
      if (['toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'constructor'].indexOf(key) < 0) {
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

  loadData(entitySetName: any, filters: any, expandEntities: any, isExpand: any, spnego: any, additionalString?: string) {
    let url = this.BaseUrl + this.generateURL(entitySetName, filters, expandEntities, isExpand)
    if (url.indexOf('$value') === -1) {
      if (filters === null) {
        url += '?spnego=disabled';
      } else if (spnego === true) {
        url += '&spnego=disabled';
      }
    }
    if (additionalString) {
      url = `${url} ${additionalString}`;
    }

    return this.httpClient.get(url, { withCredentials: true, observe: 'response' })
  }

  generateURL(entitySetName: any, filters: any, expandEntities: any, isExpand: any) {
    let url = entitySetName;
    if (filters) filters = this.keyValuePairs(filters);

    if (filters) {
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
          url += filter.key + encodeURIComponent(" eq '" + filter.value) + "'";
        }
      });
    }
    if (isExpand) {
      url += '&$expand=';

      let expandedEntities = expandEntities.toString();
      url += expandedEntities;
    }
    return url;
  }

  // ngOnDestroy(): void {
  //   if (this.timerSubscription) { this.timerSubscription.unsubscribe(); }
  // }
}

export class MedicationdFilterData {
  Active: boolean;
  Suspended: boolean;
  Ended: boolean;
  Cancelled: boolean;
  MedicationSorting: string;
  Sorting: string;

}
// export class MedicationdeventFilterData {
//   Sorting: string;
// }

export class MissedMedicationList {
  medicationData: MedicationData[];
  eventData: MedicationEventData[];
}

export class MedicationData {
  Aprou: string;
  Comments: string;
  Descr: string;
  Descrlt: string;
  Drugid: string;
  Einri: string;
  Falnr: string;
  Formatdescr: string;
  Meordid: string;
  Mesid: string;
  Movdf: string;
  Movtf: string;
  N1ztxt: string;
  Patnr: string;
  Phform: string;
  Quan: string;
  Routedescr: string;
  TherapeCls: string;
  Unit: string;
  Userst: string;
  Prn:boolean;
  groupData: [];
  ViewOrderDate?: any;
  TimeData?: HistoryTime;
  Schedule?: DrugSchedule[];
  ScheduleVisible: DrugSchedule[];
  // ScheduleCount?: number;
  SeeMoreListNumber?: number;
  currentStartingIndex: number = 0;
  ScheduleLength: number = 0;
  Dosdef:number;
}

export class MedicationEventFilter {
  NotAdministered: boolean;
  Cancelled: boolean;
  Administered: boolean;
}

export class MedicationEventData {
  Cycdat: string;
  Cyctim: string;
  Einri: string;
  Falnr: string;
  Mesid: string;
  Descr: string;
  Pbdad: string;
  Pbtad: string;
  Rbdad: string;
  Rbtad: string;
  Erusr: string;
  Drugid: string;
  Pbdad1: string;
  Userst: string;
  Meordid: string;
  Rtimdif: string;
  Notgiven: boolean;
  Passtm: boolean;

  ParsedDate?: any;
  TimeData?: HistoryTime;
  Schedule?: DrugSchedule;
  EmpRespNm: string;
}

export class HistoryTime {
  Extension: string;
  Hour: number;
  Minute: number;
  Second: number;
  Formate: {
    H: string,
    M: string,
    S: string
  }
}

export class DrugSchedule {
  Hour: number;
  Minute: number;
  Second: number;
  Label?: string;
  SubLabel?: string;
  Color: string;
  MultipleEvent?: DrugScheduleExtend[];
  CreatedDate?: string;
  CreatedTime?: string;
  CreatedBy?: string;
  ViewOrderDate?: Date;
  Administered:string;
}

export class DrugScheduleExtend {
  Hour?: number;
  Minute?: number;
  Second?: number;
  Label?: string;
  SubLabel?: string;
  Color?: string;
}

export class PatientMedicationData {
  Agentid: string;
  Aprou: string;
  Aprouteid: string;
  Comments: string;
  Descr: string;
  Descrlt: string;
  Drugid: string;
  Durunittxt: string;
  Einri: string;
  Falnr: string;
  Formatdescr: string;
  Meordid: string;
  Mesid: string;
  Movdf: string;
  Movtf: string;
  N1id: string;
  N1znr: string;
  N1ztxt: string;
  Patnr: string;
  Pdur: string;
  Pduru: string;
  Phform: string;
  Phformid: string;
  Quan: string;
  Quantunittxt: string;
  Routedescr: string;
  TherapeCls: string;
  Unit: string;
  Userst: string;

  isSelected?: boolean = false;
  ViewOrderDate?: any;
  TimeData?: HistoryTime;
}

export class TemplateMedicationData {
  Admin: string;
  Descr: string;
  Einri: string;
  Favourite: string;
  Prscrid: string;
  Tmpaccesslevel: string;
  isSelected: boolean = false;
}

export class AdministrationTemplateData {
  Admin: boolean;
  Descr: string;
  Einri: string;
  Favourite: boolean;
  Prscrid: string;
  Tmpaccesslevel: string;
  Tmptype: string;
  isSelected: boolean = false;
}

export class TemplateMedDataList {
  AGENTID: string;
  APROUTEID: string;
  BLOCKCHANGES: string;
  CANCELDBY_NAME: string;
  DESCR: string;
  DRUG: string;
  DRUGID: string;
  DURUNITTXT: string;
  FORMATDESCR: string;
  LFDNR: string;
  MORESP1: string;
  N1ZNR: string;
  N1ZTXT: string;
  PDUR: string;
  PDURU: string;
  PHFORMID: string;
  PRN: string;
  PRNCOND: string;
  PRSCRID: string;
  QUAN: string;
  QUANTUNITTXT: string;
  QUANUNIT: string;
  RESPPERSNAME: string;
  RESULT_DRUG_NAME: string;
  ROUTEDESCR: string;
  STATUSTEXT: string;
  STOID: string;
  STORN: string;
  STORNTXT: string;
  UPDMODE: string;
  STOCKTEXT?: string;

  isSelected: boolean = false;
}
