import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import swal from 'sweetalert2';

@Injectable()
export class ErDischargeordersService implements OnDestroy {
  public prescriptionList: PrescriptionList = { medicationData: [], eventData: [] };
  public patientMadication: PatientMedicationData[];
  public formDetailGroup: any;
  public formgroupData: any = {};
  public runRefresh: boolean = false;
  formSubscription: Subscription;
  timerSubscription: Subscription;
  public timerInterval = interval(1000 * 60);
  private BaseUrl = environment.eOrderAPIUrl;
  public checkedFilterData: MedicationEventFilter = { Administered: false, Cancelled: false, NotAdministered: false };
  public medicationPopupSaveData: PatientMedicationData[];
  public templatePopupSaveData: TemplateMedDataList[] = [];
  public templateMedicationData: TemplateMedicationData[];
  public parameters: any;
  public administrationTemplateData: AdministrationTemplateData[];

  public PriorToAdmission: boolean = false;
  public Administration: boolean = true;
  public DischargeOrder: boolean = false;
  public eEmar: boolean = false;

  constructor(private route: ActivatedRoute, private httpClient: HttpClient, private DatePipe: DatePipe) {
    this.formDetailGroup = new FormGroup({
      'SearchData': new FormControl(''),
      'DateRange': new FormControl([new Date(), new Date()]),
      'SelectDropdown': new FormControl(),
    });
    
    this.formSubscription = this.formDetailGroup.valueChanges.subscribe((data: any) => {
      this.formgroupData.SearchData = data.SearchData
      if (data.DateRange !== '') { this.formgroupData.DateRange = data.DateRange };
      if (data.SelectDropdown === null && data.SelectDropdown === '') { this.formgroupData.SelectDropdown = data.SelectDropdown };
      if (data.DateRange && data.DateRange[0] && data.DateRange[1] && data.DateRange !== null) {
        this.loadMAREventData(this.formgroupData.DateRange);
      }
    });
    this.timerSubscription = this.timerInterval.subscribe((i) => { if (this.runRefresh && this.eEmar) { this.loadMAREventData(this.formDetailGroup.value.DateRange); } });
  }

  tabPanelNavigation(tabName: any) {
    if (tabName && tabName === 'PriorToAdmission') {
      this.PriorToAdmission = true; this.Administration = false; this.DischargeOrder = false; this.eEmar = false;
    } else if (tabName && tabName === 'Administration') {
      this.PriorToAdmission = false; this.Administration = true; this.DischargeOrder = false; this.eEmar = false;
      this.loadAddministrationPanel()
    } else if (tabName && tabName === 'DischargeOrder') {
      this.PriorToAdmission = false; this.Administration = false; this.DischargeOrder = true; this.eEmar = false;
      this.loadDischargePanelData();
    } else if (tabName && tabName === 'eEmar') {
      this.PriorToAdmission = false; this.Administration = false; this.DischargeOrder = false; this.eEmar = true;
      this.loadEmarPanelData();
    }
  }

  loadParameters(isEinri: boolean, isFalnr: boolean, islfdnr: boolean, isPatnr: boolean, isInst?: boolean): object {
    let filter: any = {};
    if (isEinri) { filter['Einri'] = this.parameters.einri }
    if (isFalnr) { filter['Falnr'] = this.parameters.falnr }
    if (islfdnr) { filter['Lfdnr'] = this.parameters.lfdnr }
    if (isPatnr) { filter['Patnr'] = this.parameters.patnr }
    if (isInst) { filter['Inst'] = this.parameters.einri }
    return filter;
  }

  onTodayEMAREventData() {
    this.formDetailGroup.get("DateRange").patchValue([new Date(), new Date()]);
    this.loadMAREventData(this.formgroupData.DateRange);
  }

  loadEmarPanelData() {
    this.prescriptionList = { medicationData: [], eventData: [] };
    this.loadMARData();
    if (this.formgroupData.DateRange && this.formgroupData.DateRange[0]) {
      this.loadMAREventData(this.formgroupData.DateRange);
    } else {
      this.loadMAREventData([new Date(), new Date()])
    }
  }

  loadMARData() {
    let filters = this.loadParameters(true, true, false, false);
    this.loadData('EmarSet', filters, false, false, false).subscribe({
      next: (resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results) {
          this.prescriptionList.medicationData = resp.body.d.results;
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
    });
  }

  loadMAREventData(data: any) {
    const filters = this.loadParameters(true, true, false, false);
    if (data && data[0] && data[1]) {
      const Pbdad = `${this.DatePipe.transform(data[0], 'yyyy-MM-dd')}T${this.DatePipe.transform(data[0], 'HH:mm:ss')}`;
      const Pbdad1 = `${this.DatePipe.transform(data[1], 'yyyy-MM-dd')}T${this.DatePipe.transform(data[1], 'HH:mm:ss')}`;
      const additionalData = `and Pbdad eq datetime'${Pbdad}' and Pbdad1 eq datetime'${Pbdad1}'`;
      this.loadData('EmarEventSet', filters, false, false, false, additionalData).subscribe({
        next: (resp: any) => {
          this.runRefresh = true;
          if (resp.body && resp.body.d && resp.body.d.results) {
            this.prescriptionList = { ...this.prescriptionList, eventData: resp.body.d.results };
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

  EMAREventDataFilter(key: string, target: any) {
    const checked = target.currentTarget.checked;
    if (key === 'NotAdministered') {
      this.checkedFilterData = { ...this.checkedFilterData, NotAdministered: checked };
    }
    else if (key === 'Administered') {
      this.checkedFilterData = { ...this.checkedFilterData, Administered: checked };
    }
    else if (key === 'Cancelled') {
      this.checkedFilterData = { ...this.checkedFilterData, Cancelled: checked };
    }
  }

  loadDischargePanelData() {
    this.route.queryParams.subscribe((params) => {
    this.parameters = {
      einri: params.einri,
      falnr: params.falnr,
      lfdnr: params.lfdnr,
      patnr: params.patnr
    }
  });
    this.loadDischargeOrderSetData();
    this.loadPatientMedicationData();
    this.loadTemplateMedicationData();
  }

  loadDischargeOrderSetData() {
    const filters = this.loadParameters(true, true, false, false);
    let expandEntities = ['TODISCH']
    this.loadData('EorderSet', filters, expandEntities, true, false).subscribe({
      next: (resp: any) => {
        this.runRefresh = true;
        if (resp.body && resp.body.d && resp.body.d.results) {
          this.prescriptionList = { ...this.prescriptionList, eventData: resp.body.d.results };
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

  loadPatientMedicationData() {
    const filters = this.loadParameters(true, true, false, false);
    this.loadData('PatientMedicationsSet', filters, null, false, false).subscribe({
      next: (resp: any) => {
        this.runRefresh = true;
        if (resp.body && resp.body.d && resp.body.d.results) {
          this.patientMadication = resp.body.d.results;
        }
      }
    })
  }

  loadTemplateMedicationData() {
    const filters = this.loadParameters(true, true, false, false);
    filters['Searchtype'] = '';
    const expandEntities = ['TODURG', 'TOTEMPLATE']
    this.loadData('SearchMSet', filters, expandEntities, true, false).subscribe({
      next: (resp: any) => {
        this.runRefresh = true;
        if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results[0].TOTEMPLATE.results) {
          this.templateMedicationData = resp.body.d.results[0].TOTEMPLATE.results;
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
  loadAddministrationPanel() {
    this.loadAdministrationTemplateData();
  }

  loadAdministrationTemplateData() {
    this.loadData(`e-prescription/medicationDetails?Einri=${this.parameters.einri}&Falnr=${this.parameters.falnr}&Searchtype=${'B'}&SearchString=${''}`, false, false, false, false).subscribe({
      next: (resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results[0].TOTEMPLATE.results) {
          this.administrationTemplateData = resp.body.d.results[0].TOTEMPLATE.results;
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

  postData(entitySetName: any, data: any) {
    let url = this.BaseUrl + entitySetName
    return this.httpClient.post(url, data, { withCredentials: true, observe: 'response' });
  }

  updateData(entitySetName: any, data: any) {
    let url = this.BaseUrl + entitySetName
    return this.httpClient.put(url, data);
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

  ngOnDestroy(): void {
    if (this.formSubscription) { this.formSubscription.unsubscribe(); }
    if (this.timerSubscription) { this.timerSubscription.unsubscribe(); }
  }
}

export class PrescriptionList {
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

  groupData: [];
  ViewOrderDate?: any;
  TimeData?: HistoryTime;
  Schedule?: DrugSchedule[];
}

export class MedicationEventFilter {
  NotAdministered: boolean;
  Cancelled: boolean;
  Administered: boolean;
}

export class MedicationEventData {
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
  Label?: string;
  SubLabel?: string;
  Color: string;
  MultipleEvent?: DrugScheduleExtend[]
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

  isSelected: boolean = false;
}
