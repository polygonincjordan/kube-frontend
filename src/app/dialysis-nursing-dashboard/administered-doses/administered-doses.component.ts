import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { ErBedComponent } from '../check-in/er-bed/er-bed.component';
import { ErVitalsComponent } from '../check-in/er-vitals/er-vitals.component';
import { NurErAllergyComponent } from '../check-in/nur-er-allergy/nur-er-allergy.component';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { DatePipe } from '@angular/common';
import { HospitalistService } from '@services/e-hospitalist/hospitalist.service';
import { MissedMedicationDosesService } from '@services/e-hospitalist/missed-medication-doses.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';

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
  currentDateObj: any = [];
  navTabBoxActiveValue: any;
  phyOrderData:any;
  admittedFrom:any;
  admittedTo:any;
  ERlistDataClone: any = [];
  asc: boolean=true;
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
  filteredPatients:any=[];
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
  isAllSelected: boolean = false;
  @Output() reloadTableData = new EventEmitter();
  @Output() openModuleKardex = new EventEmitter();
  @Output() openModuleAdmissionProcessEvent = new EventEmitter();
  @Output() openModuleDischargeProcessEvent = new EventEmitter();
  isExpanded: boolean;
  value: any;
  selectedColData: any;
  isSelected=false;
  cardSection: boolean;
  isCollapsed: boolean[] = [];
  isCollapseded: boolean = false;
  cartForm: FormGroup;
  receiveCartData:any[]=[];
  toContentData:any[]=[];
  cartData:any;
  private indexOfReceive:number;
  private itemOfReceive:any;
  public receviceCartForm:FormGroup
  childCartDetails: any;
    nurseUnitList = [
      '4THFL-C',
      '4THFLVIP',
      '6FL-NURS',
      '6FL-OROU',
      '6FL-NICU',
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
      'F2DTUAMC',
    ]
  
  constructor(
    private emergencyService: EmergencyService,
    private modalService: BsModalService,
    private hospitalistService: HospitalistService,
    private formBuilder: FormBuilder,
    public ePrescriptionService: EPrescriptionService,
    public missedMedicationService: MissedMedicationDosesService,
    private datePipe:DatePipe
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

    let currentTime = this.datePipe.transform(new Date(), "hh:mm");
    this.cartForm = this.formBuilder.group({
      FromDt: [new Date()],
      ToDt: [new Date()],
      FromTm: ['00:00'],
      ToTm: ['23:59'],
      Nursingou: ['F2DTUAMC']
    })

    this.receviceCartForm = this.formBuilder.group({
      dateFrom: [new Date()],
      dateTo: [new Date()],
      timeFrom: ['00:00'],
      timeTo: ['23:59'],
      nurseUnit: ['F2DTUAMC']
    })
  }
  ngOnInit(): void {
    this.getMedicationAdministrationlist();
    this.filterData();

  }
  redirectToeKardex(data) {
    this.openModuleKardex.emit(data);
  }

  openModuleAdmissionProcess(data) {
    this.openModuleAdmissionProcessEvent.emit(data);
    localStorage.removeItem('tabName');
  }

  getMedicationAdministrationlist(date?){
    const Deptcode = '2'
    const fromDate = `${new DatePipe('en-US').transform(
      date ?  date[0] : new Date().setDate(new Date().getDate()),
      'yyyy-MM-dd'
    )}T00:00:00`
  const toDate = `${new DatePipe('en-US').transform(
    date ?  date[1] : new Date().setDate(new Date().getDate()),
    'yyyy-MM-dd'
  )}T00:00:00`
  this.hospitalistService.getDialysisMedicationAdministrationSet(Deptcode,fromDate,toDate).subscribe((res:any)=>{
      this.missedMedPatientList = res.d.results;
      this.filteredPatients=res.d.results;
      this.dataToParent.emit(this.missedMedPatientList);
      this.sendErPatientCount.emit(this.missedMedPatientList?.length)
   })
  }

  getReceviceCartList() {
    let data = this.receviceCartForm.value
    const timeFrom = this.formatTimeToISO8601(data.timeFrom);
    const timeTo = this.formatTimeToISO8601(data.timeTo);
    const fromDate = `${new DatePipe('en-US').transform(
      data.dateFrom ? data.dateFrom : new Date().setDate(new Date().getDate()),
      'yyyy-MM-dd'
    )}T00:00:00`
    const toDate = `${new DatePipe('en-US').transform(
      data.dateTo ? data.dateTo : new Date().setDate(new Date().getDate()),
      'yyyy-MM-dd'
    )}T00:00:00`

    this.emergencyService.getReceviceCart(fromDate, toDate, timeFrom, timeTo, data.nurseUnit).subscribe({
      next: (res: any) => {
        this.receiveCartData = res.d.results;
        this.commanSorting('ShipDt');
        if (this.itemOfReceive && this.indexOfReceive.toString()) {
          let data = this.receiveCartData.find((item) => {
            return item.Cartid == this.itemOfReceive.Cartid;
          });
          this.selectedColData = undefined;
          this.selectDateColumn(this.indexOfReceive, data)
        }
      },
      error: (error) => {
        console.log(error);
      }
    })
  }

  refresh(){
    this.cartForm.patchValue({
      FromDt:new Date(),
      ToDt:new Date(),
      FromTm:'',
      ToTm:''
    })
    this.receviceCartForm.get('dateFrom').setValue(new Date());
    this.receviceCartForm.get('dateTo').setValue(new Date());
    this.receviceCartForm.get('timeFrom').setValue('00:00');
    this.receviceCartForm.get('timeTo').setValue('23:59');
    // this.getReceviceCartList();
    this.receiveCartData=null;
    this.toContentData = null;

    this.modalRef.hide();
  }

  formatDateFromTimestamp(timestamp: string): string {
    const regex = /\/Date\((\d+)\)\//;
    const match = regex.exec(timestamp);

    if (match && match[1]) {
      const milliseconds = parseInt(match[1], 10);
      const date = new Date(milliseconds);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const formattedDay = day < 10 ? '0' + day : day.toString();
      const formattedMonth = month < 10 ? '0' + month : month.toString();

      return formattedDay + '-' + formattedMonth + '-' + year;

    }
    return '';
  }


  formatDate(dateTimeString){
    if(dateTimeString){
      const date = new Date(dateTimeString).toISOString()
      const dateDataArr = date.split('T')
      return `${dateDataArr[0]}T${dateDataArr[1].substring(0,8)}`
    }
  }
  formatTime(dateTimeString){
    if(dateTimeString){
      const dateDataArr = dateTimeString.split(':')
      return `PT${dateDataArr[0]}H${dateDataArr[1]}M${dateDataArr[2] ? dateDataArr[2] : '00'}S`
    }
  }
  handleEvent(value){
    this.rightside  = false;
    this.tablelistshow1 = false;
    this.tablelistshow = true;
  }
  drugArray:any;
  checkValue:boolean = true;
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

                console.log(item,"item");
                this.tablelist.push(item);
              }
            }, (error: any) => {
              this.tablelist.push(item);
            });


      }
    }))
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

  filterListData(event) {
    let filterValue = this.filteredPatients;
    if(event.wardNo || event.patientStatus || event.Physician)

      if(event.wardNo && event.wardNo?.length){
        filterValue = filterValue.filter((item: any) => {
          // return event.wardNo.includes(item.RoomidText);
          return event.wardNo ==item.RoomidText;
        });
      }

      if(event.patientStatus && event.patientStatus?.length){
        filterValue = filterValue.filter((item: any) => {
          // return event.patientStatus.includes(item.VisitStatus);
          return event.patientStatus ==item.VisitStatus;
        });
      }

      if(event.Physician && event.Physician?.length){
        filterValue = filterValue.filter((item: any) => {
          // return event.Physician.includes(item.AttendingDoctorName);
          return event.Physician ==item.AttendingDoctorName;
        });
      }


      this.missedMedPatientList = filterValue;
      console.log(this.missedMedPatientList);
  }


  selectDateColumn(index: number, item:any) {
    if (this.selectedColData === index) {
      this.selectedColData = undefined;
      this.cardSection= false;
      this.indexOfReceive =  null;
      this.itemOfReceive =  null;
    } else {
      this.selectedColData = index;
      this.cardSection= true
      this.indexOfReceive =  index;
      this.itemOfReceive =  item;
      this.childCartDetails = item;
    }
    this.toContentData = item;
  }

  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
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

   openCartDetailModal(event:Event,template: TemplateRef<any>,item){
    event.stopPropagation();

    const config: ModalOptions = { class: 'modal-dialog-centered lab-modal-size' };
    this.cartmodalRef = this.modalService.show(template,config);
    this.cartData=item;
    this.cartmodalRef.onHide.subscribe((reason: string | any) => {
    });
   }

   toggleAccordion(index: number): void {
    this.isCollapsed[index] = !this.isCollapsed[index];
  }


  addReceviceCard() {
    this.receiveCartData.forEach((e) => {
      if (e.isChecked) {
        delete e.isChecked;
        e.TOCONTENT?.results?.forEach((element)=>{
          delete element.isChecked;
        })
        this.isAllSelected = false;
        this.emergencyService.addReceviceCart(e).subscribe((res: any) => {
          if (res) {
            this.getReceviceCartList();
          }
        }, (error: any) => { })
      }
    })
  }

  addReceviceMissedCard() {
    this.receiveCartData.forEach((e) => {
      if (e.isChecked) {
        delete e.isChecked;
        e.Missed = "X";
        this.emergencyService.addReceviceCart(e).subscribe((res: any) => {
          if (res) {
            this.getReceviceCartList();
          }
        }, (error: any) => { })
      }
    })
  }

  formatTimeToISO8601(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const duration = `PT${hours}H${minutes}M00S`;
    return duration;
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

  checkboxChangedMedication(event: any, item: any, selectedRow: any) {
    this.receiveCartData.find(x => x.CartExtId == item.CartExtId).isChecked = event.target.checked;
    selectedRow.isChecked = event.target.checked;
    this.isAllSelected = item.TOCONTENT.results.every(x => x.isChecked);
    if(this.isAllSelected){
      const event = { target: { checked: this.isAllSelected }};
      this.selectAllMedication(event);
    }
  }

  selectAllMedication(event: any) {
    this.isAllSelected = event.target.checked;
    const item = this.childCartDetails;
    this.receiveCartData.find(x => x.CartExtId==item?.CartExtId).isChecked = event.target.checked;
    this.childCartDetails?.TOCONTENT?.results.forEach(x => x.isChecked = event.target.checked);
  }

  commanSorting(keyName: string) {
    if (!this.asc) {
      this.asc = true;
      this.receiveCartData.sort((a, b) => {
        const nameA = a[keyName].toUpperCase(); 
        const nameB = b[keyName].toUpperCase(); 
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        return 0;
      });
    } else {
      this.asc = false;
      this.receiveCartData.sort((a, b) => {
        const nameA = a[keyName].toUpperCase(); 
        const nameB = b[keyName].toUpperCase();
        if (nameA < nameB) {
          return 1;
        }
        if (nameA > nameB) {
          return -1;
        }

        return 0;
      });
    }
  }
}
