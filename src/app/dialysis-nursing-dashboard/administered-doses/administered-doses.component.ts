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
  isCollapsed: boolean[] = [];
  cartForm: FormGroup;
  receiveCartData:any[]=[];
  toContentData:any[]=[];
  cartData:any;

  constructor(
    private emergencyService: EmergencyService,
    private modalService: BsModalService,
    private hospitalistService: HospitalistService,
    private formBuilder: FormBuilder,
    public ePrescriptionService: EPrescriptionService,
    public missedMedicationService: MissedMedicationDosesService
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

    this.cartForm = this.formBuilder.group({
      FromDt: [new Date()],
      ToDt: [new Date()],
      FromTm: [''],
      ToTm: [''],
      Nursingou: ['F2DTUAMC']
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
    this.hospitalistService.getMedicationAdministrationSet(Deptcode,fromDate,toDate).subscribe((res:any)=>{
      this.missedMedPatientList = res.d.results;
   })
  }

  getReceviceCartList(){
    const dateFrom = this.formatDate(this.cartForm.get('FromDt').value);
    const dateTo = this.formatDate(this.cartForm.get('ToDt').value);
    const timeFrom = this.formatTime(this.cartForm.get('FromTm').value);
    const timeTo = this.formatTime(this.cartForm.get('ToTm').value);
    const nurseUnit = this.cartForm.get('Nursingou').value ? this.cartForm.get('Nursingou').value : null;

    this.emergencyService.getReceviceCart(dateFrom,dateTo,timeFrom,timeTo,nurseUnit).subscribe({
      next : (res:any) => {
        this.receiveCartData=res.d.results;
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
    // this.getReceviceCartList();
    this.receiveCartData=null;
    this.toContentData = null;
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

  selectDateColumn(index: number, item:any) {
    if (this.selectedColData === index) {
      this.selectedColData = undefined;
      this.cardSection= false
    } else {
      this.selectedColData = index;
      this.cardSection= true
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
  
}
