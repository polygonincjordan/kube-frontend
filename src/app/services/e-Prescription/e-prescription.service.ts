import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, interval, Subject, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import swal from 'sweetalert2';

@Injectable()
export class EPrescriptionService implements OnDestroy {
  public templateDrugList: any;
  TemplateMedDataList: TemplateMedDataList;
  public emardata: any;
  public emarevents: any;
  receiveCart: boolean;
  static tabPanelNavigation(arg0: string): import("@angular/router").ResolveData {
    throw new Error('Method not implemented.');
  }
  clinicalOrders: boolean = true;
  feesAndServices: boolean = false;
  consulationOrder: boolean = false;
  admissionOrder: boolean = false;
  surgeryOrder: boolean = false;
  valueStory: any;
  isAscending = false;
  public prescriptionList: PrescriptionList = { medicationData: [], eventData: [] };
  readonly emarPanelRefreshed$ = new Subject<PrescriptionList>();
  public patientMadication: PatientMedicationData[];
  public formDetailGroup: any;
  public drugArrayActions$: BehaviorSubject<{ isSubmitted: boolean, value: any[] }> = new BehaviorSubject({ isSubmitted: false, value: null });
  public formgroupData: any = {};
  public runRefresh: boolean = false;
  formSubscription: Subscription;
  timerSubscription: Subscription;
  public timerInterval = interval(1000 * 60);
  private BaseUrl = environment.eOrderAPIUrl;
  public checkedFilterData: MedicationEventFilter = {
    Administered: false, Cancelled: false, NotAdministered: false
  };
  public multiselectdropdown: multiselectdropdown = { Active: false, Suspended: false, Ended: false, Cancelled: false, }
  public MedicationdFilterData: MedicationdFilterData = { Active: false, Suspended: false, Ended: false, Cancelled: false, Status: "", MedicationSorting: "", Sorting: "" };
  public Sortingevent: string;
  public medicationPopupSaveData: PatientMedicationData[];
  public templatePopupSaveData: TemplateMedDataList[] = [];
  public templatePopupSaveDatagat: TemplateMedDataListget[] = [];
  public templateMedicationData: TemplateMedicationData[];
  public parameters: any = {
    einri: this.route.snapshot.queryParamMap.get('einri'),
    falnr: this.route.snapshot.queryParamMap.get('falnr'),
    lfdnr: this.route.snapshot.queryParamMap.get('lfdnr'),
    patnr: this.route.snapshot.queryParamMap.get('patnr')
  }
  public administrationTemplateData: AdministrationTemplateData[];

  public OrderDetails: boolean = true;
  public Administration: boolean = false;
  public DischargeOrder: boolean = false;
  public eEmar: boolean = false;
  public toadmission: boolean = false;
  public selectedItems: any = [{ item_id: 1, item_text: 'Active' }];

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
    this.receiveCart = false;
    if (tabName && tabName === 'OrderDetails') {
      this.OrderDetails = true; this.toadmission = false; this.Administration = false; this.DischargeOrder = false; this.eEmar = false;
    } else if (tabName && tabName === 'Administration') {
      this.OrderDetails = false; this.toadmission = false; this.Administration = true; this.DischargeOrder = false; this.eEmar = false;
      this.loadAddministrationPanel()
    } else if (tabName && tabName === 'DischargeOrder') {
      this.OrderDetails = false; this.toadmission = false; this.Administration = false; this.DischargeOrder = true; this.eEmar = false;
      this.loadDischargePanelData();
    } else if (tabName && tabName === 'eEmar') {
      this.OrderDetails = false; this.toadmission = false; this.Administration = false; this.DischargeOrder = false; this.eEmar = true;
      this.loadEmarPanelData();
    } else if (tabName && tabName === "toadmission") {
      this.OrderDetails = false; this.toadmission = true; this.Administration = false; this.DischargeOrder = false; this.eEmar = false;
      // this.loadEmarPanelData();
    } else if (tabName && tabName === "receiveCart") {
      this.OrderDetails = false; this.toadmission = true; this.Administration = false; this.DischargeOrder = false; this.eEmar = false; this.receiveCart = true;
      // this.loadEmarPanelData();
    }
  }

  eOrderTabNavigation(tabName: any) {
    if (tabName && tabName === 'clinicalOrders') {
      this.clinicalOrders = true; this.feesAndServices = false; this.consulationOrder = false; this.admissionOrder = false; this.surgeryOrder = false;
    } else if (tabName && tabName === 'feesAndServices') {
      this.clinicalOrders = false; this.feesAndServices = true; this.consulationOrder = false; this.admissionOrder = false; this.surgeryOrder = false;
      // this.loadAddministrationPanel()
    } else if (tabName && tabName === 'consultationOrder') {
      this.clinicalOrders = false; this.feesAndServices = false; this.consulationOrder = true; this.admissionOrder = false; this.surgeryOrder = false;
      // this.loadDischargePanelData();
    } else if (tabName && tabName === 'admissionOrder') {
      this.clinicalOrders = false; this.feesAndServices = false; this.consulationOrder = false; this.admissionOrder = true; this.surgeryOrder = false;
      // this.loadEmarPanelData();
    } else if (tabName && tabName === 'surgeryOrder') {
      this.clinicalOrders = false; this.feesAndServices = false; this.consulationOrder = false; this.admissionOrder = false; this.surgeryOrder = true;
      // this.loadEmarPanelData();
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

  resetFilter(selectedItems){
    this.selectedItems=selectedItems;
    this.checkedFilterData ={
      Administered:false,
      Cancelled:false,
      NotAdministered:false
    }
    this.formDetailGroup.get('SearchData').patchValue(null);
    this.formDetailGroup.get("DateRange").patchValue([new Date(), new Date()]);

    this.prescriptionList = { medicationData: [], eventData: [] };
    this.loadMARData();
    if (this.formgroupData.DateRange && this.formgroupData.DateRange[0]) {
      this.loadMAREventData(this.formgroupData.DateRange);
    } else {
      this.loadMAREventData([new Date(), new Date()])
    }
  }
  loadEmarPanelData(selectedItems?) {
    this.selectedItems = selectedItems;
    this.prescriptionList = { medicationData: [], eventData: [] };
    this.reloadEmarPanelData(() => this.emitEmarPanelRefreshed());
  }

  private getEmarDateRange(): [Date, Date] {
    if (this.formgroupData?.DateRange?.[0] && this.formgroupData?.DateRange?.[1]) {
      return this.formgroupData.DateRange;
    }
    const today = new Date();
    return [today, today];
  }

  private emitEmarPanelRefreshed(): void {
    this.prescriptionList = {
      medicationData: [...(this.prescriptionList.medicationData ?? [])],
      eventData: [...(this.prescriptionList.eventData ?? [])],
    };
    this.emarPanelRefreshed$.next(this.prescriptionList);
  }

  private reloadEmarPanelData(onComplete: () => void): void {
    let pending = 2;
    const done = () => {
      pending--;
      if (pending === 0) {
        onComplete();
      }
    };
    this.loadMARData(done);
    this.loadMAREventData(this.getEmarDateRange(), done);
  }

  loadMARData(onComplete?: () => void) {
    let filters = this.loadParameters(true, true, false, false);
    this.loadData('EmarSet', filters, false, false, false).subscribe({
      next: (resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results) {
          this.prescriptionList.medicationData = resp.body.d.results;
          this.emardata = resp.body.d.results
          console.log(this.emardata,"emardata");
          
        }
        onComplete?.();
      },
      error: (error: any) => {
        swal.fire({
          title: error.statusText,
          text: 'No data found',
          confirmButtonColor: '#0890c5',
          cancelButtonColor: '#84898c',
          confirmButtonText: 'OK',
          customClass: { popup: 'myalertpopup' },
          icon: 'error',
        });
        onComplete?.();
      }
    });
  }

  refreshEmarPanelData(): void {
    this.reloadEmarPanelData(() => this.emitEmarPanelRefreshed());
  }

  loadMAREventData(data: any, onComplete?: () => void) {
    const filters = this.loadParameters(true, true, false, false);
    if (data && data[0] && data[1]) {
      const Pbdad = `${this.DatePipe.transform(data[0], 'yyyy-MM-dd')}T${this.DatePipe.transform(data[0], 'HH:mm:ss')}`;
      const Pbdad1 = `${this.DatePipe.transform(data[1], 'yyyy-MM-dd')}T${this.DatePipe.transform(data[1], 'HH:mm:ss')}`;
      const additionalData = `and Pbdad eq datetime'${Pbdad}' and Pbdad1 eq datetime'${Pbdad1}'`;
      this.loadData('EmarEventSet', filters, false, false, false, additionalData).subscribe({
        next: (resp: any) => {
          this.runRefresh = true;
          console.log(resp,"eventData");
          
          if (resp.body && resp.body.d && resp.body.d.results) {
            this.emarevents=resp.body.d.results;
            this.prescriptionList = { ...this.prescriptionList, eventData: resp.body.d.results };
            console.log(' this.prescriptionList', this.prescriptionList);
            
          }
          onComplete?.();
        },
        error: (error: any) => {
          swal.fire({
            title: error.statusText,
            text: 'No data found',
            confirmButtonColor: '#0890c5',
            cancelButtonColor: '#84898c',
            confirmButtonText: 'OK',
            customClass: { popup: 'myalertpopup' },
            icon: 'error',
          });
          onComplete?.();
        }
      })
    } else {
      onComplete?.();
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

  prioradmissiondata(target: any,key?:any) {
    const checked = target.item_text
    if (checked === 'Active') {
      this.MedicationdFilterData = { ...this.MedicationdFilterData, Active: checked };
    }
    else if (checked === 'Suspended') {
      this.MedicationdFilterData = { ...this.MedicationdFilterData, Suspended: checked };
    }
    else if (checked === 'Ended') {
      this.MedicationdFilterData = { ...this.MedicationdFilterData, Ended: checked };
    }
    else if (checked === 'Cancelled') {
      this.MedicationdFilterData = { ...this.MedicationdFilterData, Cancelled: checked };
    }else if(target === 'Sorting'){
       this.MedicationdFilterData = { ...this.MedicationdFilterData, Sorting: key };
    }
  }


  prioradmission(key: string, target: any) {
    const checked = target.currentTarget.checked;
    if (key === 'Active') {
      this.MedicationdFilterData = { ...this.MedicationdFilterData, Active: checked };
    }
    else if (key === 'Suspended') {
      this.MedicationdFilterData = { ...this.MedicationdFilterData, Suspended: checked };
    }
    else if (key === 'Ended') {
      this.MedicationdFilterData = { ...this.MedicationdFilterData, Ended: checked };
    }
    else if (key === 'Cancelled') {
      this.MedicationdFilterData = { ...this.MedicationdFilterData, Cancelled: checked };
    }
    if (key === 'Status') {
      this.MedicationdFilterData = { ...this.MedicationdFilterData, Status: target.currentTarget.id };
    }
    if (key === 'MedicationSorting') {
      this.MedicationdFilterData = { ...this.MedicationdFilterData, MedicationSorting: target.target.id };
    }
    if (key === 'Sorting') {
      this.MedicationdFilterData = { ...this.MedicationdFilterData, Sorting: target.target.id };
    }
    if (key === 'Sortingevent') {
      this.Sortingevent = target.target.parentNode.id;
    }

  }

  loadDischargePanelData() {
    this.loadPatientMedicationData();
    this.loadTemplateMedicationData();
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
    this.loadData(`e-prescription/templatesearchtype?Einri=${this.parameters.einri}&Falnr=${this.parameters.falnr}&Searchtype=${'B'}&SearchString=&Ordtype=${'2'}`, false, false, false, false).subscribe({
      next: (resp: any) => {
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
          customClass: { popup: 'myalertpopup' },
          icon: 'error',
        });
      }
    })
  }
  loadAddministrationPanel() {
    this.loadAdministrationTemplateData();
  }

  loadAdministrationTemplateData(
    onLoaded?: (templates: AdministrationTemplateData[]) => void,
    onError?: (error: any) => void
  ) {
    this.loadData(`e-prescription/templatesearchtype?Einri=${this.parameters.einri}&Falnr=${this.parameters.falnr}&Searchtype=${'B'}&SearchString=&Ordtype=${'1'}`, false, false, false, false).subscribe({
      next: (resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results[0].TOTEMPLATE.results) {
          this.administrationTemplateData = resp.body.d.results[0].TOTEMPLATE.results;
          if (onLoaded) { onLoaded(this.administrationTemplateData); }
        } else {
          this.administrationTemplateData = [];
          if (onLoaded) { onLoaded(this.administrationTemplateData); }
        }
      },
      error: (error: any) => {
        if (onError) {
          onError(error);
          return;
        }
        swal.fire({
          title: error.statusText,
          text: 'No data found',
          confirmButtonColor: '#0890c5',
          cancelButtonColor: '#84898c',
          confirmButtonText: 'OK',
          customClass: { popup: 'myalertpopup' },
          icon: 'error',
        });
      }
    })
  }


  searchMedication(term: any) {
    this.loadData(`e-prescription/templatesearchtype?Einri=${this.parameters.einri}&Falnr=${this.parameters.falnr}&Searchtype=${'B'}&SearchString=${term}&Ordtype=${'1'}`, false, false, false, false).subscribe({
      next: (resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results) {
          this.templateDrugList = resp.body.d.results[0].TOTEMPLATE.results;
        }
      }
    });
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
    let header = {repeat: 'true'}
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
    return this.httpClient.get(url, { withCredentials: true, observe: 'response',headers:header })
  }
  getData(entitySetName: any) {
    let url = this.BaseUrl + entitySetName
    return this.httpClient.get(url, { withCredentials: true, observe: 'response' });
  }
  postData(entitySetName: any, data: any) {
    let url = this.BaseUrl + entitySetName
    return this.httpClient.post(url, data, { withCredentials: true, observe: 'response' });
  }

  updateData(entitySetName: any, data: any) {
    let url = this.BaseUrl + entitySetName
    return this.httpClient.put(url, data, { withCredentials: true });
  }

  deleteData(entitySetName: any) {
    let url = this.BaseUrl + entitySetName
    return this.httpClient.delete(url, { withCredentials: true, observe: 'response' });
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

export class MedicationdFilterData {
  Active: boolean;
  Suspended: boolean;
  Ended: boolean;
  Cancelled: boolean;
  Status: string;
  MedicationSorting: string;
  Sorting: string;

}
export class multiselectdropdown {
  Active: boolean;
  Suspended: boolean;
  Ended: boolean;
  Cancelled: boolean;
}

// export class MedicationdeventFilterData {
//   Sorting: string;
// }

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
  Userst?: string;
  MultipleEvent?: DrugScheduleExtend[];
  Events?: MedicationEventData;
}

export class DrugScheduleExtend {
  Hour?: number;
  Minute?: number;
  Second?: number;
  Label?: string;
  SubLabel?: string;
  Color?: string;
  Userst?:string
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
  Dosdef: string;
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
  DOSDEF: string;
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

export class TemplateMedDataListget {
  Eorderid: string;
  Agentid: string;
  Drugid: string;
  Drug: string;
  Prscrid: string;
  Phformid: string;
  Aprouteid: string;
  Pdur: string;
  Pduru: string;
  Quan: string;
  Quanunit: string;
  N1znr: string;
  StartD: string;
  StartT: string;
  EndD: string;
  EndT: string;
  Eorderitemid: string;
  Prn: string;
  Prncond: string;
  Moresp1: string;
  Orgfa: string;
  Orgpf: string;
  Lfdnr: string;
  Storn: string;
  Stoid: string;
  Descr: string;
  Updmode: string;
  Routedescr: string;
  Formatdescr: string;
  Quantunittxt: string;
  N1ztxt: string;
  Durunittxt: string;
  Result_Drug_Name: string;
  Storntxt: string;
  Resppersname: string;
  Statustext: string;
  BlockChanges: string;
  Canceldby_Name: string;
  Favourite: string;
  Reconcile: string;
  Vma: string;
  AddDose: string;
  Complex: string;
  Pom: string;
  PomTxt: string;
  Priority: string;
  PriorityTxt: string;
  Dosdef: string;
  Stocktext: string;
  TOCOMPLEX: TOCOMPLEX[]
  TOCYCDEF?: { results: any[] }

  isSelected: boolean = false;
}


export class TOCOMPLEX {
  Eorderid: string;
  Eorderitemid: string;
  Drugid: string;
  Seqno: string;
  Quan: string;
  Quanunit: string;
  Quantunittxt: string;
  N1znr: string;
  N1ztxt: string;
  Pdur: string;
  Pduru: string;
  Durunittxt: string;
  StartD: string;
  StartT: string;
  EndD: string;
  EndT: string;
}
