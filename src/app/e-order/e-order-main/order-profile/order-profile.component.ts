import { DatePipe } from '@angular/common';
import { Component,Input, OnInit, TemplateRef, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EEmrService } from '@services/e-emr.service';
import { AddministrationService } from '@services/e-Prescription/Administration.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { eOrderService } from '@services/eorder.service';
import { cloneDeep as _cloneDeep } from 'lodash';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { patientHeaderCheckbox } from 'src/app/core/constants';
@Component({
  selector: 'app-order-profile',
  templateUrl: './order-profile.component.html',
  styleUrls: ['./order-profile.component.scss']
})
export class OrderProfileComponent implements OnInit ,OnChanges{
  @Input() showPatients;
  @Output() assignPatient = new EventEmitter<any>();

  checkBoxLabelList: any = patientHeaderCheckbox;
  isExpanded: boolean = true;
  laboratoryList: any[] = [];
  radiologyList: any[] = [];
  madicationList: any[] = [];
  surgeryList: any[]=[];
  consultationsOrdersList: any;
  searchString: any;
  patientCaseList: any;
  public modalRef: BsModalRef;
  public isDefaultComment: string;
  orderEventMedication: any;
  patientCaseDetails: any;
  datRange: any;
  tabmodetail: string = 'Eventdata';

  public medicationForm: FormGroup = new FormGroup({
    EmpResp: new FormControl(""),
    OrderDepartment: new FormControl(""),
    OrderingTo: new FormControl(""),
    OrderingDept: new FormControl("")
  });
  durationUnit: any;
  isLaboratory: boolean = false;
  isRadiology: boolean = false;
  isMedication: boolean = false;
  isSurgery: boolean = false;
  isConsultations: boolean = false;
  selectedTable: string;
  isCollpseOpen: boolean = false;
  

  constructor(
    private route: ActivatedRoute,
    public storageService: StorageService,
    private emergencyService: EmergencyService,
    public ePrescriptionService: EPrescriptionService,
    private modalService: BsModalService,
    public administrationService: AddministrationService,
    private datePipe: DatePipe,
    public sharedService: SharedService,
    public _dataServices:EEmrService,
    public eorderService: eOrderService
  ) {
    this.route.queryParams.subscribe((params) => {
      this.storageService.setEinri(params['einri']);
      this.storageService.setFalnr(params['falnr']);
      this.storageService.setLfdnr(params['lfdnr']);
      this.storageService.setPatnr(params['patnr']);
    });
    
  }

  selectTable(tableName: string) {
    this.isLaboratory = tableName === 'Laboratory';
    this.isRadiology = tableName === 'Radiology';
    this.isMedication = tableName === 'Medication';
    this.isSurgery = tableName === 'Surgery';
    this.isConsultations = tableName === 'Consultations Orders';
  }

  selectedTableFun() {
    if(!this.isLaboratory && !this.isMedication && !this.isRadiology && !this.isSurgery && !this.isConsultations) {
      this.isLaboratory = true;
      this.isMedication = true;
      this.isRadiology = true;
      this.isSurgery = true;
      this.isConsultations = true;
    }
  }
  
  parseTime(date) {
    const newDate = `${this.datePipe.transform(date, "hh:mm:ss")}`
    if (newDate) {
      return newDate
    }
    return null;
  }

  ngOnInit(): void {
    this.getPatientCaseStepperData();
    this.getPatientTableList('', '', this.storageService.falnr);
    this.initialPatientList();
    if(this.administrationService.durationUnitList) {
      this.durationUnit = this.patientCaseDetails?.Pduru !== null && this.patientCaseDetails?.Pduru !== "" ? this.administrationService?.durationUnitList.find(d => d.Unit == this.patientCaseDetails?.Pduru)?.Text : "";
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.showPatients.currentValue) {
      this.isExpanded = true;
    }
  }

  handleSidebarToggle() {
    this.isExpanded = !this.isExpanded;
    this.assignPatient.next(this.isExpanded);
  }

  resetAllFilter() {
    this.datRange ='';
    this.searchString = '';
    this.getPatientTableList('', '', this.storageService.falnr);
    this.initialPatientList();
    this.isMedication = false;
    this.isLaboratory = false;
    this.isRadiology = false;
    this.isSurgery = false;
    this.isConsultations = false;
  }

  parsePayloadFormateTime(data: string) {
    if (data && data.length) {
      let hours = data.substring(2, 4);
      let minute = data.substring(5, 7);
      return `${hours}:${minute}`;
    }
  }

  onSearchChange(event: any): void {
    this.searchString = event.target.value;
  }

  getPatientCaseStepperData() {
    this.emergencyService.getPatientCaseData().subscribe((result: any) => {
      this.patientCaseList = result?.d?.results;
    });
  }

  getPatientTableList(dateFrom, dateTo, falnr) {
    this.emergencyService
      .getPatientTableList(dateFrom, dateTo, falnr)
      .subscribe((result: any) => {
        console.log(result);
        this.laboratoryList = result?.d?.results[0]?.ToLab?.results;
        this.radiologyList = result?.d?.results[0]?.ToRad?.results;
        this.madicationList = result?.d?.results[0]?.ToMed?.results;
        this.surgeryList = result?.d?.results[0]?.ToSurg?.results;
        this.consultationsOrdersList = result?.d?.results[0]?.ToConsult?.results;

        if(this.madicationList.length) {
          this.isCollpseOpen = true;
        } else {
          this.isCollpseOpen = false;
        }
      });
   }

   initialPatientList() {
         let jsonObj = {
           Floor: '',
           Patientstatus: '',
           module: 'My_IP_consultations',
         }
       this._dataServices.getInPatientList(jsonObj).subscribe(
         (_success: any) => {
           if(_success){
            this.consultationsOrdersList =  _success.result.d.results
           }
         },
         (_error: any) => { }
       );
   }

  durationConvert(data: any) {
    if (data === 0) {
      return '';
    }
    return data;
  }

  openRealsePDFModal(data, template: TemplateRef<any>) {
    this.isDefaultComment = `${data.Descr !== '' ? `Comment: ${data.Descr}\n` : ''}${data.Prncond !== '' ? `PRN Condition: ${data.Prncond}` : ''}`;
    this.modalRef = this.modalService.show(template, { backdrop: true, ignoreBackdropClick: false, class: 'additional-info-temp' });
  }

  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }

  openMoDetailPanel(index?: any, validData?: any, template?: TemplateRef<any>) {
    if (validData) {
      this.patientCaseDetails = validData;
      const OrderEventMedication: Subscription = this.ePrescriptionService.loadData(`e-prescription/OrderEventMedicationStatus?Einri=1000&Falnr=0000011620&Meordid=0000007375`, false, false, false, false).subscribe((resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results) {
            this.orderEventMedication = resp.body.d.results;
            this.modalRef = this.modalService.show(template, { backdrop: true, ignoreBackdropClick: false, class: ' ordermedication ' });;
            this.administrationService.loadDropdownList();
            this.medicationForm.patchValue(this.administrationService.medicationAdministrative)
        }
      }, () => { OrderEventMedication.unsubscribe(); });
    }
  }

  dateFilter(event: any) {    
    if(event) {
      this.getPatientTableList(this.sharedService.getDateRangeFormat(event[0]), this.sharedService.getDateRangeFormat(event[1]), this.storageService.falnr);
    } else {
      this.getPatientTableList('', '', this.storageService.falnr);
    }
  }

  public getImageBorderLogic(item) {
    return (
      ((item.MovementType === 'OS' || item.MovementType === 'MI') && {
        'border-color': '#F9777D', //Surgery
      }) ||
      (item.CaseType === '2' && {
        'border-color': '#7b9fdf', //OutPateint
      }) ||
      ((item.CaseType === '1' || item.CaseType === '3') &&
        (item.MovementType === 'RD' ||
          item.MovementType === 'LW' ||
          item.MovementType === 'EX' ||
          item.MovementType === 'DE' ||
          item.MovementType === 'AM') && {
          'border-color': '#39D7AA', //Discharge
        }) ||
      ((item.CaseType === '1' || item.CaseType === '3') &&
        (item.MovementType === 'ER' ||
          item.MovementType === 'EL' ||
          item.MovementType === 'NB' ||
          item.MovementType === 'DV' ||
          item.MovementType === 'CS') && {
          'border-color': '#49C5F3', //Admission
        })
    );
  }

  getImageLogic(item) {
    return (
      (item.CaseType === '2' && 'assets/img/stepperIcon_op.jpg') ||
      ((item.CaseType === '1' || item.CaseType === '3') &&
        (item.MovementType === 'RD' ||
          item.MovementType === 'LW' ||
          item.MovementType === 'EX' ||
          item.MovementType === 'DE' ||
          item.MovementType === 'AM') &&
        'assets/img/stepperIcon_ipd.jpg') ||
      ((item.CaseType === '1' || item.CaseType === '3') &&
        'assets/img/stepperIcon_ip.jpg')
    );
  }

  showItem(item) {
    if (item.MovementType === 'OS' || item.MovementType === 'MI') {
      return false;
    } else {
      return true;
    }
  }

  onClickTabChange(tabdetail) {
    if (tabdetail === "Medicationdata") { this.tabmodetail = tabdetail }
    else if (tabdetail === "Eventdata") { this.tabmodetail = tabdetail }
  }
  closeModetail() {
    this.modalService.hide()
  }
  getPatientByMrn(){
    this.getPatientTableList('','','');
  }
  getQuanValue(value){
   return parseFloat(value).toFixed(3);
  }

  onDeleteOrderItem(item: any, itemType: string) {
    if (!item) return;

    let postObject: any = {
      einri: this.storageService.getLocal('einri') || '1000',
      falnr: this.storageService.getLocal('falnr') || '0000',
      lfdnr: this.storageService.getLocal('lfdnr') || '0000',
      Eorderid: item.Eorderid || item.EorderId || '',
      TOLABSET: [],
      TORADSET: [],
      TOSURG: [],
      TOMEDICSET: [],
      TOCONS: []
    };

    switch (itemType) {
      case 'LAB':
        postObject.TOLABSET = [{
          Cordtypid: item.Cordtypid || '',
          Eorderid: item.Eorderid || '',
          Eorderitemid: item.Eorderitemid ||  '',
          Talst: item.Leistung || '',
          Trtoe: item.Trtoe || '',
          Storn: 'X'
        }];
        break;

      case 'RAD':
        postObject.TORADSET = [{
          Cordtypid: item.Cordtypid || '',
          Eorderid: item.Eorderid || '',
          Eorderitemid: item.Eorderitemid ||  '',
          Talst: item.Leistung || '',
          Trtoe: item.Trtoe || '',
          Storn: 'X'
        }];
        break;

      case 'MED':
        postObject.TOMEDICSET = [{
          DRUGID: item.Drugid || item.DRUGID || '',
          FORMATDESCR: item.Formatdescr || item.FORMATDESCR || '',
          PHFORMID: item.Phformid || item.PHFORMID || '',
          QUAN: (item.Quan || item.QUAN || '0').toString(),
          APROUTEID: item.Aprouteid || item.APROUTEID || '',
          N1ZNR: item.N1znr || item.N1ZNR || '',
          PDUR: (item.Pdur || item.PDUR || '0').toString(),
          PDURU: item.Pduru || item.PDURU || '',
          AGENTID: item.Agentid || item.AGENTID || '',
          PRSCRID: item.Prscrid || item.PRSCRID || '',
          STORN: 'X',
          STOID: item.Stoid || item.STOID || '',
          UPDMODE: 'X',
          LFDNR: item.Lfdnr || item.LFDNR || '',
          PRN: item.Prn === 'X' || item.PRN === 'X' ? 'X' : '',
          PRNCOND: item.Prncond || item.PRNCOND || '',
          DRUG: item.Drug || item.DRUG || '',
          Eorderid: item.Eorderid || item.EorderId || '',
          Eorderitemid: item.Eorderitemid || item.EorderItemId || ''
        }];
        break;

      case 'SURG':
        postObject.TOSURG = [{
          Cordtypid: item.Cordtypid || '',
          Eorderid: item.Eorderid || '',
          Eorderitemid: item.Eorderitemid ||  '',
          Talst: item.Leistung || '',
          Trtoe: item.Trtoe || '',
          Storn: 'X'
        }];
        break;

      case 'CONSULT':
        postObject.TOCONS = [{
          Cordtypid: item.Cordtypid || '',
          Eorderid: item.Eorderid || '',
          Eorderitemid: item.Eorderitemid ||  '',
          Talst: item.Leistung || '',
          Trtoe: item.Trtoe || '',
          Storn: 'X'
        }];
        break;
    }

    this.eorderService.deleteOrderItemFromProfile(postObject, () => {
      this.getPatientTableList('', '', this.storageService.falnr);
    });
  }
}
