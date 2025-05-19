import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PointofsaleService } from '@services/pointofsale.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { ErBedComponent } from '../check-in/er-bed/er-bed.component';
import { ErVitalsComponent } from '../check-in/er-vitals/er-vitals.component';
import { NurErAllergyComponent } from '../check-in/nur-er-allergy/nur-er-allergy.component';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { StorageService } from '@services/storage.service';
import { DatePipe } from '@angular/common';
import { HospitalistService } from '@services/e-hospitalist/hospitalist.service';
import { MissedMedicationDosesService } from '@services/e-hospitalist/missed-medication-doses.service';
import { HospitalistType } from '@services/e-hospitalist/interfaces/hospitalist';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { DayCaseDashboardService } from '@services/day-case.dashboard/day-case-dashboard.service';

@Component({
  selector: 'app-administered-doses',
  templateUrl: './administered-doses.component.html',
  styleUrls: ['./administered-doses.component.scss']
})
export class AdministeredDosesComponent implements OnInit{
  @ViewChild('erBed') erBed: ErBedComponent;
  @ViewChild('erVitalsModal') erVitalsModal: ErVitalsComponent;
  @ViewChild('nurErAllergy') nurErAllergy: NurErAllergyComponent;
  @Output() sendErPatientCount = new EventEmitter<any>();
  @Output() redirectCheckInData = new EventEmitter<any>();
  isFormValidError: boolean = false;
  searchString: string = '';
  ERlistData:any;
  // @Output() ERlistData = new EventEmitter<string>();
  @Output() dataToParent = new EventEmitter<any>();
  receviceCartForm:FormGroup
  currentDateObj: any = [];
  navTabBoxActiveValue: any;
  phyOrderData:any;
  admittedFrom:any;
  admittedTo:any;
  ERlistDataClone: any = [];
  asc: boolean;
  triageValueArr: any = [];
  physicianValueArr: any = [];
  statusValueArr: any = [];
  lastIndex: number;
  modalRefForRisk: BsModalRef;
  modalRefForLab:BsModalRef;
  modalRefForLabCollcetion:BsModalRef;
  selectedERList: any;
  isRiskUpdate: boolean;
  riskList: any[];
  riskform: FormGroup;
  riskFormitems: FormArray;
  updateRiskForm: FormGroup;
  modalRef: BsModalRef;
  cartmodalRef: BsModalRef;
  colName: any;
  modalCommonDataArr: any;
  allergenValues: any;
  dataOnTableForPhyOrder:any;
  updateAllergyForm: FormGroup;
  allergenGroupValues: any;
  allergyCertaintyValues: any;
  allergyEvaluationValues: any;
  allergyReactionValues: any;
  severityValues: any;
  allergyTypeValues: any;
  riskValues: any;
  riskItemsArr: any[];
  riskJson: any[];
  selectedDataForUpdate: any;
  activelabLabelData: any;
  oldDate: any;
  printUrl: any;
  missedMedPatientList:any[] = [];
  selectedmissedMedPatientList: any;
  wardNo:any;
  physician:any;
  tablelist: any[] = [];
  speciality:any;
  type:any;
  tablelistshow = true;
  tablelistshow1 = false;
  sampleOrderDescription: any;
  rightside:boolean = false;
  @Output() reloadTableData = new EventEmitter();
  @Output() openModuleKardex = new EventEmitter();
  @Output() openModuleAdmissionProcessEvent = new EventEmitter();
  @Output() openModuleDischargeProcessEvent = new EventEmitter();
  isExpanded: boolean;
  value: any;
  selectedColData: any;
  isSelected=false;
  cardSection: boolean;
  isCollapsed: boolean = false;
  cartList: any;
  childCartDetails: any;
  cartPopUpDetail: any;
  drugArray:any;
  checkValue:boolean = true;
  missedMedPatientListClone: any;
  private indexOfReceive:number;
  private itemOfReceive:any;
   nurseUnitList = [
    '4THFL-C',
    '4THFLVIP',
    '6FL-NURS',
    '6FL-OROU',
    'CATTUAMC',
    'F9GOTAMC',
    'LDRASMTU',
    'LDRINTOU',
    'F21IUAMC',
    'F31IUAMC',
    'F3CIUAMC',
    'F51IUAMC',
    'F6CIUAMC',
    'F7IIUAMC',
    'F9DIUAMC',
    'F9IIUAMC',
  ]
  constructor(
    private emergencyService: EmergencyService,
    private modalService: BsModalService,
    private hospitalistService: HospitalistService,
    private formBuilder: FormBuilder,
    private storageService:StorageService,
    public ePrescriptionService: EPrescriptionService,
    public missedMedicationService: MissedMedicationDosesService,
    private dayCaseDashboardService:DayCaseDashboardService
  ) {
    this.riskform = this.formBuilder.group({
      riskFormitems: new FormArray([]),
    });

    this.updateAllergyForm = this.formBuilder.group({
      AllergySeqno: ['0000'],
      Allrgycatlog: [''],
      Allrgyid: [''],
      Allergen: [''],
      AllrgycatlogAgr: [''],
      AllrgyidAgr: [''],
      AllergenGrp: [''],
      Cert: [''],
      CerText: [''],
      Eval: [''],
      EvalTxt: [''],
      Rea: [''],
      ReaText: [''],
      Soa: [''],
      SoaText: [''],
      Typ: [''],
      TypText: [''],
      Adcomment: [''],
      AdcommentLt: [''],
    });
    this.updateRiskForm = this.formBuilder.group({
      Rsfnr: [''],
      Rsfna: ['', [Validators.required]],
      Rsfkb: [''],
      Rsfsn: [''],
      Repdt: [''],
    });

    this.receviceCartForm = this.formBuilder.group({
      dateFrom: [new Date()],
      dateTo: [new Date()],
      timeFrom: ['00:00'],
      timeTo: ['23:59'],
      nurseUnit: ['']
    })
  }
  ngOnInit(): void {
    this.getMedicationAdministrationlist();
    this.filterData();
    // this.getReceviceCartList();

  }
  redirectToeKardex(data) {
    this.openModuleKardex.emit(data);
  }

  openModuleAdmissionProcess(data) {
    this.openModuleAdmissionProcessEvent.emit(data);
    localStorage.removeItem('tabName');
  }

  getMedicationAdministrationlist(date?){
    const fromDate = `${new DatePipe('en-US').transform(
      date ?  date[0] : new Date().setDate(new Date().getDate()),
      'yyyy-MM-dd'
    )}T00:00:00`
  const toDate = `${new DatePipe('en-US').transform(
    date ?  date[1] : new Date().setDate(new Date().getDate()),
    'yyyy-MM-dd'
  )}T00:00:00`
  const deptcode = '3'
    this.dayCaseDashboardService.getPatientAdministration(fromDate,toDate,deptcode).subscribe((res:any)=>{
      this.missedMedPatientList = res.d.results;
      this.missedMedPatientListClone = res.d.results;
      this.dataToParent.emit(this.missedMedPatientList);
      this.sendErPatientCount.emit(this.missedMedPatientList.length)
   })
  }

  filterAdministeredDosesList(event:any){
    const { Physician, wardNo, patientStatus } = event;
    this.missedMedPatientList = this.missedMedPatientListClone.filter((item) => {
      const matchesPhysician = Physician ? item.AttendingDoctorName.toLowerCase().includes(Physician.toLowerCase()) : true;
      const matchesWardNo = wardNo ? item.RoomidText.toLowerCase().includes(wardNo.toLowerCase()) : true;
      const matchesPatientStatus = patientStatus ? item.VisitStatus.toLowerCase().includes(patientStatus.toLowerCase()) : true;

      return matchesPhysician && matchesWardNo && matchesPatientStatus;
    });
    this.sendErPatientCount.emit(this.missedMedPatientList.length)
  }


  getReceviceCartList(){
    let data = this.receviceCartForm.value
    const timeFrom = this.formatTimeToISO8601(data.timeFrom);
    const timeTo = this.formatTimeToISO8601(data.timeTo);
    const fromDate = `${new DatePipe('en-US').transform(
      data.dateFrom ? data.dateFrom : new Date().setDate(new Date().getDate()),
      'yyyy-MM-dd'
    )}T00:00:00`
     const toDate = `${new DatePipe('en-US').transform(
    data.dateTo ?  data.dateTo : new Date().setDate(new Date().getDate()),
    'yyyy-MM-dd'
    )}T00:00:00`
    this.emergencyService.getReceviceCart(fromDate,toDate,timeFrom,timeTo,data.nurseUnit).subscribe((res:any)=>{
     if(res){
      this.cartList = res.d?.results
      if(this.itemOfReceive && this.indexOfReceive.toString()){
        let data = this.cartList.find((item)=>{
          return item.Cartid==this.itemOfReceive.Cartid;
        });
        this.selectedColData = undefined;
        this.selectDateColumn(this.indexOfReceive,data)
      }
     }
    },(_error: any) => {})
  }

  refreshList(){
    this.receviceCartForm.get('dateFrom').setValue(new Date());
    this.receviceCartForm.get('dateTo').setValue(new Date());
    this.receviceCartForm.get('timeFrom').setValue('00:00');
    this.receviceCartForm.get('timeTo').setValue('23:59');
    this.cardSection = false
    this.getReceviceCartList()
  }


  formatTimeToISO8601(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const duration = `PT${hours}H${minutes}M00S`;
    return duration;
}

  handleEvent(value){
    this.rightside  = false;
    this.tablelistshow1 = false;
    this.tablelistshow = true;
  }

  openRightside(item) {
    this.checkValue = false;
    this.selectedmissedMedPatientList=item;
    this.tablelist = [];
    this.ePrescriptionService.loadData(`e-prescription/EmarEventSet?Einri=${item?.Einri}&Falnr=${item?.Falnr}`, false, false, false, false).subscribe(((resp: any) => {
      if (resp.status === 200) {

         this.hospitalistService.getMedicationAdministration(item?.Einri, item?.Falnr)
            .subscribe((res: any) => {
              for (var i = 0; i < res.d.results.length; i++) {
                let item=res.d.results[i];
                item.isChecked = false;
                if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
                  let EventSet = resp.body.d.results.filter(record => item.Meordid==record.Meordid && record.Mesid === "200");
                  if (EventSet && EventSet.length > 0) {
                    item.EventSet = [EventSet[0]];
                  }
                }

                if(i === res.d.results.length-1){
                  this.rightside = true;
                  this.tablelistshow1 = true;
                  this.tablelistshow = false;
                }

                this.tablelist.push(item);
              }
            }, (error: any) => {
              this.tablelist.push(item);
            });


      }
      // this.loadMedicationHistoryData(this.tablelist[0].Einri);
    }))
  }


  checkboxChangedMedication(event: any, item: any) {
    this.cartList.find(x => x.CartExtId == item.CartExtId).isChecked = event.target.checked;
  }

  addReceviceCard(){
   this.cartList.forEach((e)=>{
     if(e.isChecked){
      delete e.isChecked;
      this.emergencyService.addReceviceCart(e).subscribe((res:any)=>{
        if(res){
          this.getReceviceCartList();
        }
      },( error: any)=>{})
     }

   })

  }

  addReceviceMissedCard(){
    this.cartList.forEach((e)=>{
      if(e.isChecked){
       delete e.isChecked;
       e.Missed = "X";
       this.emergencyService.addReceviceCart(e).subscribe((res:any)=>{
        if(res){
          this.getReceviceCartList();
        }
       },( error: any)=>{})
      }
    })
  }
  handleSidebarToggle() {
    this.isExpanded = !this.isExpanded;
  }


  openModuleDischargeProcess(data) {
    this.openModuleDischargeProcessEvent.emit(data);
    localStorage.removeItem('tabName');
  }

  filterData(){
    // this.listItem.filter((data) => data.Us)
  }

  selectDateColumn(index: number,data:any) {
    if (this.selectedColData === index) {
      this.selectedColData = undefined;
      this.cardSection= false;
      this.indexOfReceive =  null;
      this.itemOfReceive =  null;
    } else {
      this.selectedColData = index;
      this.cardSection= true
      this.childCartDetails = data;
      this.indexOfReceive =  index;
      this.itemOfReceive =  data;
    }
  }
  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }

  getTime(value) {
    if (value) {
      var str = value;
      var str = str.replace(/[PT]/g, '');
      var str = str.replace(/[H]/g, ':');
      var str = str.replace(/[M]/g, ':');
      var str = str.replace(/[S]/g, '');
      var str = str.split(':');
      var finalstr = str[0] + ':' + str[1];
      return finalstr;
    }
  }

  public openModalForPhyOrder(template: TemplateRef<any>, data: any) {
    const config: ModalOptions = {
      class: 'modal-dialog-centered execute-delete-modal',
    };
    this.modalRef = this.modalService.show(template, config);

    this.phyOrderData = data;
  }

  removePhysicianOrder(phyOrderDetails: any) {
    let jsonObj: any = {
      PorderId: phyOrderDetails.PorderId
    };
    this.hospitalistService.getCheckPDF(jsonObj).subscribe(
      (_success: any) => {
        if (_success) {
          this.reloadTableData.next('physicianOrder');
        }
      },
      (_error: any) => {}
    );
  }
  openReceiveModal(template: TemplateRef<any>){
    const config: ModalOptions = { class: 'modal-dialog-centered er-vital-modal' };
  this.modalRef = this.modalService.show(template,config);
  this.modalRef.onHide.subscribe((reason: string | any) => {
  });
   }

   openCartDetailModal(event: Event,template: TemplateRef<any>,data){
    const config: ModalOptions = { class: 'modal-dialog-centered lab-modal-size' };
    this.cartmodalRef = this.modalService.show(template,config);
    this.cardSection = false;
    event.stopPropagation();
    this.cartPopUpDetail = data;
    this.cartmodalRef.onHide.subscribe((reason: string | any) => {
    });
   }
}
