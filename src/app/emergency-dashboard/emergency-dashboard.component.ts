import { StorageService } from '@services/storage.service';
import { ErHistoryComponent } from './er-history/er-history.component';
import { Component, ElementRef, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Patient } from '@services/e-kardex/interfaces/patient';
import { PatientService } from '@services/e-kardex/patient.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { Subscription, catchError, of } from 'rxjs';
import { CheckinListComponent } from './checkin-list/checkin-list.component';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { ErDischargeordersService } from '@services/emergency-dashboard/er-dischargeorders.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { OrdersDashboardService } from '@services/orders-dashboard/orders-dashboard.service';
import { environment } from 'src/environments/environment';
import { Title } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
import * as XLSX from 'xlsx';
import { HospitalistType } from '@services/e-hospitalist/interfaces/hospitalist';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
@UntilDestroy()
@Component({
  selector: 'app-emergency-dashboard',
  templateUrl: './emergency-dashboard.component.html',
  styleUrls: ['./emergency-dashboard.component.css']
})
export class EmergencyDashboardComponent implements OnInit {
  @ViewChild(CheckinListComponent) CheckinListComponent;
  @ViewChild(ErHistoryComponent) ErHistoryComponent;
  allTriageData=[];
  assignUsersList: any;
  allStatus=[];
  filterData: any;
  queryNav: any;
  analysis=false;
  ErPatientCount:any;
  ErHistoryPatientCount: any;
  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    if (this.showfilter) {
      this.revertUnappliedFilters();
    }
    this.showfilter = false;
  }
  erhistoryList: Array<HospitalistType> = [];
  getExcelData = false;
  checkin=true;
  treatmentarea=false;
  day: any;
  currentDate: Date;
  callRefresh=false;
  isLoading = false;
  isError = false;
  patient: Patient = {} as Patient;
  encounterId: any;
  erhistory=false;
  dischargeorder: boolean;
  ordersprofiledada:boolean;
  patnr: any;
  einri: any;
  lfdnr: any;
  falnr: any;
  selectedModule: any;
  formSubscription: Subscription;
  public formDetailGroup: any;
  public formgroupData: any = {};
  showfilter=false;
  appliedFilterValue: any;
  filterForm:FormGroup;
  modalRef:BsModalRef;
  
  constructor(private _route: ActivatedRoute, private datePipe: DatePipe, private modalService: BsModalService,
    private _router: Router,private emergencyService:EmergencyService,private patientService: PatientService,public ePrescriptionService:ErDischargeordersService,private elementRef: ElementRef,private storageService:StorageService,private orderDashboardService: OrdersDashboardService,private formBuilder: FormBuilder,private titleService: Title,) {
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
          //this.loadMAREventData(this.formgroupData.DateRange);
          this.ErHistoryComponent.getSelectedDates(this.formgroupData.DateRange);
        }
      });
      this.filterForm = this.formBuilder.group({
        Triage: [''],
        Physician: [''],
        Status: [''],
        FCategory: [''],
        PatientAgeFrom: [''],
        PatientAgeTo: [''],
        DateFrom: [''],
        DateTo: [''],
        AdmissionTimeFrom: [''],
        AdmissionTimeTo: [''],
      });
      this.appliedFilterValue = this.filterForm.value;
     }

  ngOnInit() {
    this._route.queryParams.subscribe((params) => {
      this.queryNav = params.nav;
      this.einri = params.einri;
      this.falnr = params.falnr;
      this.lfdnr = params.lfdnr;
    });
    if (this.queryNav == 'Treatmentarea') {
      this.selectModule('treatmentarea');
      this.encounterId = this.einri+ this.falnr + this.lfdnr;
      this.getDataPatient();
    }else{
    this.selectModule('checkin');
    }
    this.currentDate = new Date();
    this.getCurrentDate();
    this.elementRef.nativeElement.ownerDocument
            .body.style.setProperty("background", "#f2f4f6", "important");
    this.getAssignSurgeonList();
    this.dataForTriage();
    this.dataForStatus();
  }
  openPatientInfo( template: TemplateRef<any>,){
    const config: ModalOptions = { class: 'modal-dialog-centered patient-info-modal-size' };
    this.modalRef = this.modalService.show(template,config);
  }
  selectModule(module){
    this.selectedModule = module;
    this.emergencyService.tabPanelNavigation('OrderSet');
    // if (localStorage.getItem('tabName') == 'OrderSet') {
    //   this.emergencyService.tabPanelNavigation('OrderSet');
    // }else if(localStorage.getItem('tabName') == 'CPOE'){
    //   this.emergencyService.tabPanelNavigation('CPOE');
    // }else if(localStorage.getItem('tabName') == 'orderdetails'){
    //   this.emergencyService.tabPanelNavigation('orderdetails');
    // }else if(localStorage.getItem('tabName') == 'PhysicianOrders'){
    //   this.emergencyService.tabPanelNavigation('PhysicianOrders');
    // }else if(localStorage.getItem('tabName') == 'ProgressNotes'){
    //   this.emergencyService.tabPanelNavigation('ProgressNotes');
    // }
   if (module=='checkin') {
    this.currentDate = new Date();
    this.checkin = true;
    this.treatmentarea=false;
    this.erhistory=false;
    this.dischargeorder = false;
    this.ordersprofiledada=false;
    this.analysis = false;
   }
   else if(module=='treatmentarea'){
    this.treatmentarea=true;
    this.checkin = false;
    this.erhistory=false;
    this.dischargeorder = false;
    this.ordersprofiledada=false;
    this.analysis = false;
   }
   else if(module=='erhistory'){
    this.treatmentarea=false;
    this.checkin = false;
    this.erhistory=true;
    this.dischargeorder = false;
    this.ordersprofiledada=false;
    this.analysis = false;
   }
   else if(module=='ordersprofiledada'){
    this.treatmentarea=false;
    this.checkin = false;
    this.erhistory=false;
    this.dischargeorder = false;
    this.ordersprofiledada=true;
    this.analysis = false;
   }
   else if(module=='dischargeorder'){
    this.treatmentarea=false;
    this.checkin = false;
    this.erhistory=false;
    this.ordersprofiledada=false
    this.dischargeorder = true;
    if (this._route.snapshot.queryParams['einri']) {
    this._route.queryParams.subscribe((params) => {
      this.patnr = params.patnr;
      this.einri = params.einri;
      this.lfdnr = params.lfdnr;
      this.falnr = params.falnr;
    });
    this.encounterId = this.einri+ this.falnr + this.lfdnr;
    //this.getDataPatient();
  }
   }
   else if(module=='analysis'){
    this.treatmentarea=false;
    this.checkin = false;
    this.erhistory=false;
    this.dischargeorder = false;
    this.ordersprofiledada=false;
    this.analysis = true;
   }
   this.filterForm.reset();
  //  else if(module=='emergkpi'){
  //   this.emergkpi=true;
  //   this.emergkardex=false;
  //   this.datefilter = false;
  //   this.emerg24=false;
  //  }
  //  else if(module=='emerg24'){
  //   this.emerg24=true;
  //   this.emergkardex=false;
  //   this.datefilter = false;
  //   this.emergkpi=false;
  //  }
  }
  getCurrentDate(){
    this.day = new Date().toLocaleDateString('en-US',{weekday: 'long'});
  }
  refreshCheckIn(){
    this.CheckinListComponent.getErList(new Date());
    this.filterForm.patchValue({
      Triage: '',
      Physician: '',
      Status: '',
      FCategory: '',
      PatientAgeFrom: '',
      PatientAgeTo: '',
      DateFrom: '',
      DateTo: '',
      AdmissionTimeFrom: '',
      AdmissionTimeTo: '',
  })
    this.appliedFilterValue = this.filterForm.value;
  }
  refreshERhistory(){
    //this.ErHistoryComponent.getErList(new Date());
    //this.currentDate = new Date();
    if (this.formgroupData.DateRange == undefined) {
      this.onTodayEventData();
    }else{
    this.ErHistoryComponent.getSelectedDates(this.formgroupData.DateRange);
    }
    this.filterForm.patchValue({
        Triage: '',
        Physician: '',
        Status: '',
        FCategory: '',
        PatientAgeFrom: '',
        PatientAgeTo: '',
        DateFrom: '',
        DateTo: '',
        AdmissionTimeFrom: '',
        AdmissionTimeTo: '',
    })
    this.appliedFilterValue = this.filterForm.value;
  }
  collectCheckInData(checkindata){
   this.navigateToTreatmentArea(checkindata);
  }
  collectTreatmentPatientData(checkindata){
    this.navigateToTreatmentArea(checkindata);
   }
  navigateToTreatmentArea(checkindata){
    // changes the route without moving from the current view or
    // triggering a navigation event,
    if (checkindata.Lfdbw) {
      this._router.navigate([], {
        relativeTo: this._route,
        queryParams: {
         patnr: checkindata.Patnr,
         falnr:checkindata.Falnr,
         einri:checkindata.Einri,
         lfdnr:checkindata.Lfdbw
        },
        queryParamsHandling: 'merge',
        // preserve the existing query params in the route
        skipLocationChange: false
        // do not trigger navigation
      });
      window.open(
        'emergencydashboard?' + 'patnr=' +
        checkindata.Patnr +
        '&falnr=' +
        checkindata.Falnr +
        '&einri=' +
        checkindata.Einri +
        '&lfdnr=' +
        checkindata.Lfdbw +
        '&nav=Treatmentarea',
        '_blank'
      );
    }else{
      this._router.navigate([], {
        relativeTo: this._route,
        queryParams: {
         patnr: checkindata.Patnr,
         falnr:checkindata.Falnr,
         einri:checkindata.Einri,
         lfdnr:checkindata.Lfdnr
        },
        queryParamsHandling: 'merge',
        // preserve the existing query params in the route
        skipLocationChange: false
        // do not trigger navigation
      });
      window.open(
        'emergencydashboard?' + 'patnr=' +
        checkindata.Patnr +
        '&falnr=' +
        checkindata.Falnr +
        '&einri=' +
        checkindata.Einri +
        '&lfdnr=' +
        checkindata.Lfdnr +
        '&nav=Treatmentarea',
        '_blank'
      );
    }
    if (this.selectedModule == 'checkin' || this.selectedModule == 'erhistory') {
      //this.selectModule('treatmentarea');
    }else if(this.selectedModule == 'dischargeorder' ){
      this.selectModule('dischargeorder');
    }

   //this.emergencyService.tabPanelNavigation('OrderSet');
   if (checkindata.Lfdbw) {
    this.encounterId = checkindata.Einri+checkindata.Falnr+checkindata.Lfdbw;
   }else{
    this.encounterId = checkindata.Einri+checkindata.Falnr+checkindata.Lfdnr;
   }

   //this.getDataPatient();
  }
  getDataPatient() {
    this.patientService
      .getDataPatient(this.encounterId)
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          this.isError = true;
          this.isLoading = false;
          return of({} as Patient);
        })
      )
      .subscribe((patientData: Patient) => {
        this.isLoading = false;
        this.patient = patientData;
        this.titleService.setTitle(`${patientData?.name} | ${this._route.snapshot.parent.routeConfig.path}`);
       this.storageService.setPatientData(patientData);
        console.log('storageService',this.storageService.patientData);

      });
  }
  onERDateChange(){
    if (this.ErHistoryComponent!=undefined) {
      this.ErHistoryComponent.getErList(this.currentDate);
    }

  }
  previousDate(){
    if(+this.formDetailGroup.get("DateRange").value[0] == +this.formDetailGroup.get("DateRange").value[1]){
      var date1 = this.formDetailGroup.get("DateRange").value[0];
      var date2 = this.formDetailGroup.get("DateRange").value[1];
      this.formDetailGroup.get("DateRange").patchValue([new Date(date1.setDate((date1.getDate()-1))), new Date(date2.setDate((date2.getDate()-1)))]);
      this.ErHistoryComponent.getErList(this.formgroupData.DateRange);
    }else{
      var date1 = this.formDetailGroup.get("DateRange").value[0];
      var date2 = this.formDetailGroup.get("DateRange").value[1];
      const diffTime = Math.abs(date2 - date1);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      date1 = new Date(date1.setDate(date1.getDate()-diffDays));
      date2 = new Date(date2.setDate(date2.getDate()-diffDays));
      this.formDetailGroup.get("DateRange").patchValue([date1, date2]);
      this.ErHistoryComponent.getSelectedDates(this.formgroupData.DateRange);
    }

    //this.currentDate = new Date(new Date().setDate(this.currentDate.getDate()-1));
    //this.ErHistoryComponent.getErList(this.currentDate);
  }
  upcomingDate(){
    if(+this.formDetailGroup.get("DateRange").value[0] == +this.formDetailGroup.get("DateRange").value[1]){
      var date1 = this.formDetailGroup.get("DateRange").value[0];
      var date2 = this.formDetailGroup.get("DateRange").value[1];
      this.formDetailGroup.get("DateRange").patchValue([new Date(date1.setDate((date1.getDate()+1))), new Date(date2.setDate((date2.getDate()+1)))]);
      this.ErHistoryComponent.getErList(this.formgroupData.DateRange);
    }else{
      var date1 = this.formDetailGroup.get("DateRange").value[0];
      var date2 = this.formDetailGroup.get("DateRange").value[1];
      const diffTime = Math.abs(date2 - date1);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      date1 = new Date(date1.setDate(date1.getDate()+diffDays));
      date2 = new Date(date2.setDate(date2.getDate()+diffDays));
      this.formDetailGroup.get("DateRange").patchValue([date1, date2]);
      this.ErHistoryComponent.getSelectedDates(this.formgroupData.DateRange);
    }
    //this.currentDate = new Date(new Date().setDate(this.currentDate.getDate()+1));
    //this.ErHistoryComponent.getErList(this.currentDate);
  }
  onTodayEventData(){
    this.formDetailGroup.get("DateRange").patchValue([new Date(), new Date()]);
    this.ErHistoryComponent.getSelectedDates(this.formgroupData.DateRange);
  }
  openPatientSearch(){
    this.ErHistoryComponent.openModalForPatientSearch();
  }
  collectErPatientSearchData(event){
    this.navigateToTreatmentArea(event);
  }
  showFilterFn($event) {
    $event.stopPropagation();
    if (this.showfilter) {
      this.revertUnappliedFilters();
      this.showfilter = false;
    } else {
      this.showfilter = true;
    }
  }

  revertUnappliedFilters() {
    if (this.appliedFilterValue) {
      this.filterForm.patchValue(this.appliedFilterValue);
    }
  }

  clearFilterControls(controls: string[]) {
    const patch = {};
    controls.forEach((control) => (patch[control] = ''));
    this.filterForm.patchValue(patch);
  }

  clearFilter() {
    this.filterForm.patchValue({
      Triage: '',
      Physician: '',
      Status: '',
      FCategory: '',
      PatientAgeFrom: '',
      PatientAgeTo: '',
      DateFrom: '',
      DateTo: '',
      AdmissionTimeFrom: '',
      AdmissionTimeTo: '',
    });
    this.appliedFilterValue = this.filterForm.value;
    if (this.selectedModule == 'checkin') {
      this.CheckinListComponent.filterListData(this.filterForm.value);
    } else {
      this.ErHistoryComponent.filterListData(this.filterForm.value);
    }
  }
  dataForTriage(){
    this.allTriageData = [{
      Allergen:'Level I - Resuscitation',
      Triage:'01',
      color:'blue',
      isActive:false
    },
    {
      Allergen:'Level II - Emergency',
      Triage:'02',
      color:'red',
      isActive:false
    },
    {
      Allergen:'Level III - Urgency',
      Triage:'03',
      color:'yellow',
      isActive:false
    },
    {
      Allergen:'Level IV - Less Urgency',
      Triage:'04',
      color:'green',
      isActive:false
    },
    {
      Allergen:'Level V - Non Urgency',
      Triage:'05',
      color:'white',
      isActive:false
    },
  ]
  }
  getAssignSurgeonList() {
    this.orderDashboardService
      .getAssignUsersData()
      .subscribe((data: any) => {
        this.assignUsersList = data?.d?.results;
      });
  }
  dataForStatus(){
    this.allStatus = [{
      Status:'Checked In',
    },
    {
      Status:'Called',
    },
    {
      Status:'Physician Start',
    },
    // {
    //   Status:'Nurse Completed',
    // },

    // {
    //   Status:'Physician End',
    // },
    // {
    //   Status:'Checked Out',
    // },
  ]
  }
  filterList(){
    if (this.selectedModule == 'checkin') {
      this.CheckinListComponent.filterListData(this.filterForm.value);
    }else{
      this.ErHistoryComponent.filterListData(this.filterForm.value);
    }
  this.appliedFilterValue = this.filterForm.value;
  this.showfilter =false;
  }
  collectErPatientCount(event){
  this.ErPatientCount = event;
  }
  collectErHistPatientCount(event){
    this.ErHistoryPatientCount = event;
    }

    getExcelDataForExport(event) {
      this.erhistoryList = event;
    }
    exportToExcel(nameofFile: string = 'Emergency', fileExtention: string = 'xlsx'): void {
      this.getExcelData = true;
      const eventArray = this.erhistoryList;
      console.log('event :',eventArray);

      const mappedEvents = eventArray.map((event:any) => ({
        Patient: event.Patient,
        Patnr: event.Patnr,
        Datum: this.datePipe.transform(event.Datum, 'dd.MM.y'),
        ZeitIntern: this.datePipe.transform(event.ZeitIntern, 'HH:mm:ss'),
        TriagePriorityCode: event.TriagePriorityCode,
        BehraumKb: event.BehraumKb,
        StatusTxt: event.StatusTxt,
        ZzfinCat: event.ZzfinCat,
        Behpersname: event.Behpersname,
        Diagnosis: event.Diagnosis,
        assignedTime: event.assignedTime,
      }));
      let Heading = [['MRN', 'Date' , 'Time','Risk','Allergy','Triage','Vitals','Room','Status','Financial Cat.','Assigned physician','Diagnosis','Waiting Time']];
      const workbook = XLSX.utils.book_new();
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
      XLSX.utils.sheet_add_aoa(ws, Heading);
      XLSX.utils.sheet_add_json(ws, mappedEvents, { origin: 'A2', skipHeader: true });
      XLSX.utils.book_append_sheet(workbook, ws, "test");
      XLSX.writeFile(workbook, `${nameofFile}.${fileExtention}`);
    }

    caseNumberReturn(caseNumber: any) {
      return parseInt(caseNumber, 10).toString()
    }
}
