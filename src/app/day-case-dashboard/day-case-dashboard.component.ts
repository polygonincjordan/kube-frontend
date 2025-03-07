import { Component, HostListener, OnDestroy, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OrdersDashboardService } from '@services/orders-dashboard/orders-dashboard.service';
import { CheckInComponent } from './check-in/check-in.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Patient } from '@services/e-kardex/interfaces/patient';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subscription, catchError, of } from 'rxjs';
import { PatientService } from '@services/e-kardex/patient.service';
import { StorageService } from '@services/storage.service';
import { Title } from '@angular/platform-browser';
import { ErHistoryComponent } from './er-history/er-history.component';
import { LabResultsComponent } from './lab-results/lab-results.component';
import { PhysicianOrdersListComponent } from './physician-orders-list/physician-orders-list.component';
import { EEmrService } from '@services/e-emr.service';
import { AdministeredDosesComponent } from './administered-doses/administered-doses.component';
import { HospitalistService } from '@services/e-hospitalist/hospitalist.service';
import { AttendingPhysician, WardList } from '@services/e-hospitalist/interfaces/hospitalist';
import { DatePipe } from '@angular/common';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { PatientAssignmentComponent } from './patient-assignment/patient-assignment.component';
import { DataShareService } from '@services/data-share.service';
import { FilterType } from '@services/interfaces/common.enum';
import { PatientWithoutConsumableComponent } from './patient-without-consumable/patient-without-consumable.component';
import { ConsumableService } from '@services/consumables/consumable.service';
import { PatientWithoutDocumentsComponent } from './patient-without-documents/patient-without-documents.component';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { NursTreatmentWorkareaComponent } from './nurs-treatment-workarea/nurs-treatment-workarea.component';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';

@UntilDestroy()
@Component({
  selector: 'app-day-case-dashboard',
  templateUrl: './day-case-dashboard.component.html',
  styleUrls: ['./day-case-dashboard.component.scss'],
})
export class DayCaseDashboardComponent implements OnInit, OnDestroy {
  @ViewChild(CheckInComponent) CheckInComponent;
  @ViewChild(ErHistoryComponent) ErHistoryComponent;
  @ViewChild(LabResultsComponent) LabResultsComponent;
  @ViewChild(PhysicianOrdersListComponent) PhysicianOrdersListComponent;
  @ViewChild(AdministeredDosesComponent) AdministeredDosesComponent;
  @ViewChild(PatientAssignmentComponent) PatientAssignmentComponent;
  @ViewChild(PatientWithoutConsumableComponent) PatientWithoutConsumableComponent;
  @ViewChild(PatientWithoutDocumentsComponent) PatientWithoutDocumentsComponent;
  @ViewChild(NursTreatmentWorkareaComponent) nursTreatmentWorkareaComponent;
  getCheckInData: any;
  getCheckInStatusFilterData: any;
  singleformgroupData: any;
  administeredDosesData: any;
  administeredDosesRoomsList: any;
  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.showfilter = false;
  }


  checkin: any = true;
  treatmentarea: boolean = false;
  analysis = false;
  erhistory = false;
  PhysicianOrder: boolean = false;
  AdministeredDoses: boolean = false;
  dischargeorder: boolean = false;
  erSetting: boolean = false;
  noConsumables: boolean = false;
  LabResults: boolean = false;
  noReleaseDoc: boolean = false;
  rxEmr: boolean = false;
  showfilter = false;
  selectedModule: any;
  currentDate: Date;
  defaultSelectedDateRange: any[] = [];
  assignUsersList: any;
  allStatus = [];
  allFinancialCategory = [];
  phyOrder = 0;
  Medicationcount = 0;
  NoConsumablesSetCount = 0;
  NoReleaseDocCount = 0;
  Ordercount = 0;
  filterForm: FormGroup;
  filterFormLab: FormGroup
  filterFormPatientWithNoConsumable: FormGroup
  missedMedPatientList: any[] = [];
  formDetailGroup: any;
  singleData:any
  dateFrom: Date;
  dateTo: Date;
  getWards: WardList[];
  public formgroupData: any = {};
  form: FormGroup;
  formSubscription: any;
  ErPatientCount: any;
  inLDRAttendPhyList: any;
  day: string;
  encounterId: any;
  navTabBoxActiveValue = "";
  isLoading = false;
  isError = false;
  patient: Patient = {} as Patient;
  queryNav: any;
  AdministeredDosesform: FormGroup;
  einri: any;
  falnr: any;
  admittedFrom = "";
  lfdnr: any;
  ErHistoryPatientCount: any;
  labReceivedData: any;
  filterStatusList: any[];
  dropdownSettings = {}
  filterBehpersonList: any;
  filterBehraumList: any;
  headerLabel: string;
  inHospitalist: any[] = [];
  inAttendPhyList: AttendingPhysician[];
  admittedTo = "";
  dropdownSettingsForLDRAttendPhy = {}
  physician = "";
  getSpecialtyData: any[];
  dropdownSettingsForSpecialty = {};
  wardNo = "";
  navModulesList = [
    'Not_Executed_Physician_Order',
  ];
  speciality = "";
  type = "";
  searchString!: string;
  dropdownSettingsForAttendPhy = {}
  actionTypeSubscription$: Subscription;
  phyOrderRoomsList: any;
  updatedDate: any;
  modalRef: BsModalRef;
  reservation: boolean = false;

  constructor(
    private orderDashboardService: OrdersDashboardService,
    private formBuilder: FormBuilder,
    private _router: Router,
    private patientService: PatientService,
    private storageService: StorageService,
    private hospitalistService: HospitalistService,
    private _route: ActivatedRoute,
    public ePrescriptionService: EPrescriptionService,
    private _dataServices: EEmrService,
    private titleService: Title,
    private dataShareService: DataShareService,
    private consumableService: ConsumableService,
    private modalService: BsModalService,
    private emergencyService: EmergencyService
  ) {
    this.formDetailGroup = this.formBuilder.group({
      SearchData: [''],
      DateRange: [[new Date(), new Date()]],
      SelectDropdown: [''],
    });
    this.singleData = this.formBuilder.group({
      fromDate:[new Date()]
    })
    this.form = this.formBuilder.group({
      admittedFrom: [''],
      admittedTo: [''],
      wardNo: [''],
      patientStatus: [''],
      Physician: [''],
    });
    this.AdministeredDosesform = this.formBuilder.group({
      Physician: [''],
      wardNo: [''],
      patientStatus: [''],

    });
    this.dropdownSettingsForSpecialty = {
      singleSelection: false,
      enableCheckAll: true,
      idField: 'Deptou',
      textField: 'DeptouDesc',
      itemsShowLimit: 2,
      allowSearchFilter: true,
      defaultOpen: false,
      selectAllText: 'All',
    };
    this.formSubscription = this.formDetailGroup.valueChanges.subscribe(
      (data: any) => {
        if (data.DateRange !== '') {
          this.formgroupData.DateRange = data.DateRange;
        }
        if (data.SelectDropdown === null && data.SelectDropdown === '') {
          this.formgroupData.SelectDropdown = data.SelectDropdown;
        }
        if (
          data.DateRange &&
          data.DateRange[0] &&
          data.DateRange[1] &&
          data.DateRange !== null
        ) {
          //this.loadMAREventData(this.formgroupData.DateRange);
          this.LabResultsComponent?.getSelectedDates(this.formgroupData.DateRange);
          this.PhysicianOrdersListComponent?.getErList(this.formgroupData.DateRange)
          this.AdministeredDosesComponent?.getMedicationAdministrationlist(this.formgroupData.DateRange)
          this.PatientWithoutConsumableComponent?.getPatientWithoutConsumable(this.formgroupData.DateRange)
        }
      }
    );
    this.formSubscription = this.singleData.valueChanges.subscribe((data)=>{
      this.singleformgroupData = data;
      if(data.fromDate){
        this.ErHistoryComponent?.getErList(this.singleformgroupData.fromDate);
         this.PatientWithoutDocumentsComponent?.getPatientWithoutDocuments(this.singleformgroupData.fromDate)

      }
    })
    this.filterForm = this.formBuilder.group({
      Physician: [''],
      Status: [''],
      FCategory: [''],
    });
    this.filterFormLab = this.formBuilder.group({
      Rooms: [''],
      Physician: [''],
      ItemStatus: [''],
    });
    this.filterFormPatientWithNoConsumable = this.formBuilder.group({
      Status: [''],
      FCategory: [''],
      Rooms:[''],
      Physician:['']
    });

    this.actionTypeSubscription$ = this.dataShareService.filterType$.subscribe((data) => {
      if (data != null) {
        if (data.type == FilterType.PatientWithNoConsumable$ && data.isAllow == true && data.value) {
          if (data.value?.filterCategoryList) {
            this.allFinancialCategory = [];
            this.allFinancialCategory = data.value.filterCategoryList.map(status => ({ Category: status }));
          }
          if (data.value?.filterStatusList) {
            this.allStatus = [];
            this.allStatus = data.value.filterStatusList.map(status => ({ Status: status }));
          }
        }
        if (data.type == FilterType.PatientWithNoDocuments$ && data.isAllow == true && data.value) {
          if (data.value?.filterStatusList) {
            this.allStatus = [];
            this.allStatus = data.value.filterStatusList.map(status => ({ Status: status }));
          }
        }
      }
    });

  }

  ngOnDestroy(): void {
    if (this.actionTypeSubscription$) {
      this.actionTypeSubscription$.unsubscribe();
    }
  }


  ngOnInit(): void {
    this.getWardList();
    this.countOfNavModules();
    this.getLabExtraction();
    this.receiveDataFromChild();
    this.receiveDatatoCheckIn();
    this.getMedicationcount();
    this.countForPhysicianOrder();
    // this.getNoConsumablesSetCount();
    this.receiveDataFromPhysicianOrdersChild();
    this.getMissedDocsCount();
    this.getNoConsumablesCount();

    this.selectModule('checkin');
    this.getAssignSurgeonList();
    this.dropdownSettingsForLDRAttendPhy = {
      singleSelection: false,
      enableCheckAll: true,
      idField: 'Behperson',
      textField: 'Behpersname',
      itemsShowLimit: 2,
      allowSearchFilter: true,
      defaultOpen: false,
      selectAllText: 'All',
    };
    this.dropdownSettings = {
      singleSelection: false,
      enableCheckAll: true,
      idField: 'Ward',
      textField: 'Name',
      itemsShowLimit: 2,
      allowSearchFilter: true,
      defaultOpen: false,
      selectAllText: 'All',
      clearSearchFilter: true
    };
    this.dropdownSettingsForAttendPhy = {
      singleSelection: false,
      enableCheckAll: true,
      idField: 'Gpart',
      textField: 'Name',
      itemsShowLimit: 2,
      allowSearchFilter: true,
      defaultOpen: false,
      selectAllText: 'All',
    };
    
    this.dataForStatus();
    this._route.queryParams.subscribe((params) => {
      this.queryNav = params.nav;
      this.einri = params.einri;
      this.falnr = params.falnr;
      this.lfdnr = params.lfdnr;
    });
    if (this.queryNav == 'Treatmentarea') {
      this.selectModule('treatmentarea');
      this.encounterId = this.einri + this.falnr + this.lfdnr;
      this.getDataPatient();
    } else {
      this.selectModule('checkin');
    }
  }

  showFilterFn($event) {
    $event.stopPropagation();
    if (this.showfilter) {
      this.showfilter = false;
    } else {
      this.showfilter = true;
    }
  }
  inPatientListByFilter(ward?, specialtyData?) {
    if (this.AdministeredDoses) {
      return;
    }
  }
  LDRListSet(fromdate?, todate?, physician?) {
    let fromdatevalue = '';
    let todatevalue = '';
    let physicianvalue = '';
    if (fromdate) {
      fromdatevalue = `${new DatePipe('en-US').transform(
        fromdate,
        'yyyy-MM-dd'
      )}T00:00:00`
    }
    if (todate) {
      todatevalue = `${new DatePipe('en-US').transform(
        todate,
        'yyyy-MM-dd'
      )}T00:00:00`
    }
    if (physician) {
      physicianvalue = JSON.stringify(physician);
    }
    this.ePrescriptionService.loadData(`eHospitalist/LDRListSet?Behperson=${physicianvalue}&FromDate=${fromdatevalue}&ToDate=${todatevalue}`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        this.inHospitalist = resp.body.d.results[0]?.ToLDRBu?.results;
        this.inLDRAttendPhyList = resp.body.d.results[0]?.ToPhysician?.results;
        //this.form.reset();
      }
    });
  }
  getWardList() {
    this._dataServices.getWardList().subscribe(
      (_success: any) => {
        if (_success) {
          // _success = JSON.parse(_success._body);

          this.getWards = _success.d.results;
        }
      },
      (_error: any) => { }
    );
  }
  
  getAssignSurgeonList() {
    this.orderDashboardService.getAssignUsersData().subscribe((data: any) => {
      this.assignUsersList = data?.d?.results;
    });
  }

  getLabExtraction() {
    let obj = {
      fromDate: `${new DatePipe('en-US').transform(
        new Date().setDate(new Date().getDate()),
        'yyyy-MM-dd'
      )}T00:00:00`,
      toDate: `${new DatePipe('en-US').transform(
        new Date().setDate(new Date().getDate()),
        'yyyy-MM-dd'
      )}T00:00:00`,
    }
    this.orderDashboardService.postCountLabExtraction(obj.fromDate, obj.toDate).subscribe((data: any) => {
      this.phyOrder = data.count;
    });
  }
  getMedicationcount() {
    this.orderDashboardService.getMedicationAdministrationCount().subscribe((data: any) => {
      this.Medicationcount = data.count;
    });
  }
  getMissedDocsCount() {
    this.consumableService.getMissedDocsCount().subscribe((data: any) => {
      this.NoReleaseDocCount = data;
    })
  }
  getNoConsumablesCount() {
    this.consumableService.getNoConsumablesCount().subscribe((data: any) => {
      this.NoConsumablesSetCount = data;
    })
  }
  getNoConsumablesSetCount() {
    const currentDate = `${new DatePipe('en-US').transform(
      new Date().setDate(new Date().getDate()),
      'yyyy-MM-dd'
    )}T00:00:00`
    const yesterdayDate = `${new DatePipe('en-US').transform(
      new Date().setDate(new Date().getDate() - 1),
      'yyyy-MM-dd'
    )}T00:00:00`
    this.orderDashboardService.getNoConsumablesSetCount(yesterdayDate, currentDate).subscribe((data: any) => {
      this.NoConsumablesSetCount = data.count;
    });
  }

  countOfNavModules() {
    this.navModulesList.forEach((element) => {
      let jsonObj = {
        module: element,
      };
      this._dataServices.postCountForNavModules(jsonObj).subscribe(
        (_success: any) => {
          _success = JSON.parse(_success._body);
          if (_success.module == 'Not_Executed_Physician_Order') {
            // this.Ordercount = _success.count;
          }
        },
        (_error: any) => { }
      );
    });
  }

  countForPhysicianOrder() {
    let jsonObj = {
      fromDate: `${new DatePipe('en-US').transform(
        this.filterFormLab.value.admittedFrom ? this.filterFormLab.value.admittedFrom : new Date().setDate(new Date().getDate()),
        'yyyy-MM-dd'
      )}T00:00:00`,
      toDate: `${new DatePipe('en-US').transform(
        this.filterFormLab.value.admittedTo ? this.filterFormLab.value.admittedTo : new Date().setDate(new Date().getDate()),
        'yyyy-MM-dd'
      )}T00:00:00`,
      Deptou: '',
    }
    this._dataServices.phCountForNavModules(jsonObj).subscribe((_success) => {
      if (_success) {
        _success = JSON.parse(_success._body);
        this.Ordercount = _success.count;
      }
    }, (_error: any) => { })
  }

  receiveDataFromChild(data?: string) {
    if (data && data.length) {
      this.labReceivedData = data;
      this.filterStatusList = this.labReceivedData.reduce((accumulator: string[], currentValue) => {
        if (!accumulator.includes(currentValue.Posstatus)) {
          accumulator.push(currentValue.Posstatus);
        }
        return accumulator;
      }, []);

      this.filterBehraumList = this.labReceivedData.reduce((accumulator: string[], currentValue) => {
        if (!accumulator.includes(currentValue.Behraum)) {
          accumulator.push(currentValue.Behraum);
        }
        return accumulator;
      }, []);

      this.filterBehpersonList = this.labReceivedData.reduce((accumulator: string[], currentValue) => {
        if (!accumulator.includes(currentValue.Erusr)) {
          accumulator.push(currentValue.Erusr);
        }
        return accumulator;
      }, []);

    }
  }

  receiveDatatoCheckIn(data?: string){
    if(data && data.length){
      this.getCheckInData = data;
      this.getCheckInStatusFilterData = this.getCheckInData.reduce((accumulator: string[], currentValue) => {
        if (!accumulator.includes(currentValue?.AdmissionStatus)) {
          accumulator.push(currentValue?.AdmissionStatus);
        }
        return accumulator;
      }, []);
    }
  }

  receiveDataFromPhysicianOrdersChild(data?: string) {
        if (data && data.length) {
      this.labReceivedData = data;
      this.phyOrderRoomsList = this.labReceivedData.reduce((accumulator: string[], currentValue) => {
        if (!accumulator.includes(currentValue.RoomidText)) {
          accumulator.push(currentValue.RoomidText);
        }
        return accumulator;
      }, []);

      this.assignUsersList = this.labReceivedData.reduce((accumulator: string[], currentValue) => {
        if (!accumulator.includes(currentValue.Erusr)) {
          accumulator.push(currentValue.Erusr);
        }
        return accumulator;
      }, []);
    }
  }


  receiveDataFromPatientWithoutDocumentChild(data?: string){
    if (data && data.length) {
      this.labReceivedData = data;
      this.phyOrderRoomsList = this.labReceivedData.reduce((accumulator: string[], currentValue) => {
        if (!accumulator.includes(currentValue.RoomidText)) {
          accumulator.push(currentValue.RoomidText);
        }
        return accumulator;
      }, []);

      this.allStatus = this.labReceivedData.reduce((accumulator: string[], currentValue) => {
        if (!accumulator.includes(currentValue.StatusText)) {
          accumulator.push(currentValue.StatusText);
        }
        return accumulator;
      }, []);
    }
  }

  receiveDataFromPatientWithoutConsumableChild(data?: string){
    if (data && data.length) {
      this.labReceivedData = data;
    this.filterBehpersonList = this.labReceivedData.reduce((accumulator: string[], currentValue) => {
      if (!accumulator.includes(currentValue.PhysicianName)) {
        accumulator.push(currentValue.PhysicianName);
      }
      return accumulator;
    }, []);

    this.phyOrderRoomsList = this.labReceivedData.reduce((accumulator: string[], currentValue) => {
      if (!accumulator.includes(currentValue.RoomidText)) {
        accumulator.push(currentValue.RoomidText);
      }
      return accumulator;
    }, []);

    
  }
  }


  receiveDataFromAdministeredDoses(data?: string){
    if (data && data.length) {
      this.administeredDosesData = data;
      this.administeredDosesRoomsList = this.administeredDosesData.reduce((accumulator: string[], currentValue) => {
        if (!accumulator.includes(currentValue.RoomidText)) {
          accumulator.push(currentValue.RoomidText);
        }
        return accumulator;
      }, []);

      this.filterBehpersonList = this.administeredDosesData.reduce((accumulator: string[], currentValue) => {
        if (!accumulator.includes(currentValue.AttendingDoctorName)) {
          accumulator.push(currentValue.AttendingDoctorName);
        }
        return accumulator;
      }, []);
    }
  }
  dataForStatus() {
    this.allStatus = [
      {
        Status: 'Checked In',
      },
      {
        Status: 'Called',
      },
      {
        Status: 'Physician Start',
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
    ];
  }

  filterList() {
    if (this.selectedModule == 'checkin') {
      this.CheckInComponent.filterListData(this.filterForm.value);
    } else if (this.selectedModule == 'erhistory') {
      this.ErHistoryComponent.filterListData(this.filterForm.value);
    } else if (this.selectedModule == 'LabResults') {
      this.LabResultsComponent?.filterListDataLab(this.filterFormLab.value);
    } else if (this.selectedModule == 'noConsumables') {
      this.PatientWithoutConsumableComponent?.filterListData(this.filterFormPatientWithNoConsumable.value);
    } else if (this.selectedModule == 'noReleaseDoc') {
      this.PatientWithoutDocumentsComponent?.filterListData(this.filterFormPatientWithNoConsumable.value);
    }else if(this.selectedModule == 'AdministeredDoses'){
      this.AdministeredDosesComponent?.filterAdministeredDosesList(this.AdministeredDosesform.value)
    } else if(this.selectedModule == 'PhysicianOrder'){
      this.PhysicianOrdersListComponent?.filterPhysicianOrders(this.form.value);
    }
    this.showfilter = false;
  }

  closeAndRefresh() {
    this.showfilter = false;
    if (this.selectedModule === 'LabResults') {
      this.LabResultsComponent?.getErList("", this.formDetailGroup.get("DateRange").patchValue([new Date(), new Date()]));
    }
  }

  refreshCheckIn() {
    this.singleData?.patchValue({fromDate: new Date()});
    if (this.selectedModule === 'checkin') {
      this.CheckInComponent.getErList(new Date());
    } else if (this.selectedModule === 'erhistory') {
      this.ErHistoryComponent.getErList(this.singleData.get("fromDate").patchValue(new Date()));
    } else if (this.selectedModule === 'LabResults') {
      this.LabResultsComponent?.getErList("", this.formDetailGroup.get("DateRange").patchValue([new Date(), new Date()]));
    } else if (this.selectedModule === 'AdministeredDoses') {
      this.AdministeredDosesComponent?.getErList("", this.formDetailGroup.get("DateRange").patchValue([new Date(), new Date()]));
    } else if (this.selectedModule === 'noConsumables') {
      this.PatientWithoutConsumableComponent?.getPatientWithoutConsumable(this.formDetailGroup.get("DateRange").patchValue([new Date(), new Date()]));
    } else if (this.selectedModule === 'PhysicianOrder') {
      this.PhysicianOrdersListComponent?.getErList("", this.formDetailGroup.get("DateRange").patchValue([new Date(), new Date()]));
    }
    else if (this.selectedModule === 'analysis') {
      // this.PhysicianOrdersListComponent?.getErList("", this.formDetailGroup.get("DateRange").patchValue([new Date(), new Date()]));
      this.formDetailGroup.get("DateRange").patchValue([new Date(), new Date()])
      this.updatedDate = [new Date(), new Date()]
    }else if(this.selectedModule === 'reservation'){
      this.emergencyService?.callHistoryList()
    }else if(this.selectedModule === "noReleaseDoc"){
      this.PatientWithoutDocumentsComponent?.getPatientWithoutDocuments(new Date())

    }
    // Resetting filter form values
    this.filterForm.patchValue({
      Physician: '',
      Status: '',
      FCategory: '',
    });
    this.filterFormLab.patchValue({
      Rooms: '',
      Physician: '',
      ItemStatus: '',
    });
    this.form.patchValue({
      admittedFrom: '',
      admittedTo: '',
      wardNo: '',
      patientStatus: '',
      Physician: '',
    });
    this.AdministeredDosesform.patchValue({
      admittedFrom: '',
      admittedTo: '',
      wardNo: '',
      patientStatus: '',
      specialty: '',
      patient: '',
      Physician: ''
    });
    this.filterFormPatientWithNoConsumable.patchValue({
      Status: '',
      FCategory: '',
      Rooms:'',
      Physician:''
    });
    this.closeAndRefresh();
  }


  collectErPatientCount(event) {
    this.ErPatientCount = event;
  }

  getCurrentDate() {
    this.day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  }

  selectModule(module) {
    this.selectedModule = module;
    // this.emergencyService.tabPanelNavigation('OrderSet');
    this.defaultSelectedDateRange.push(new Date().setDate(new Date().getDate() - 1));
    this.defaultSelectedDateRange.push(new Date())
    this.getCurrentDate();
    if (module == 'checkin') {
      this.headerLabel = ""
      this.currentDate = new Date();
      this.checkin = true;
      this.treatmentarea = false;
      this.erhistory = false;
      this.PhysicianOrder = false;
      this.AdministeredDoses = false;
      this.dischargeorder = false;
      this.erSetting = false;
      this.rxEmr = false;
      this.analysis = false;
      this.noConsumables = false;
      this.LabResults = false;
      this.noReleaseDoc = false;
      this.reservation= false;
    } else if (module == 'treatmentarea') {
      this.treatmentarea = true;
      this.checkin = false;
      this.erhistory = false;
      this.PhysicianOrder = false;
      this.AdministeredDoses = false;
      this.dischargeorder = false;
      this.erSetting = false;
      this.analysis = false;
      this.rxEmr = false;
      this.noConsumables = false;
      this.LabResults = false;
      this.noReleaseDoc = false;
      this.reservation= false;
    } else if (module == 'erhistory') {
      this.headerLabel = 'Day Case Discharged Patients'
      this.formDetailGroup.get("DateRange").patchValue([new Date(), new Date()]);
      this.treatmentarea = false;
      this.checkin = false;
      this.erhistory = true;
      this.AdministeredDoses = false;
      this.PhysicianOrder = false;
      this.dischargeorder = false;
      this.erSetting = false;
      this.analysis = false;
      this.rxEmr = false;
      this.noConsumables = false;
      this.LabResults = false;
      this.noReleaseDoc = false;
      this.reservation= false;
    } else if (module == 'erSetting') {
      this.treatmentarea = false;
      this.checkin = false;
      this.erhistory = false;
      this.PhysicianOrder = false;
      this.AdministeredDoses = false;
      this.dischargeorder = false;
      this.erSetting = true;
      this.rxEmr = false;
      this.analysis = false;
      this.noConsumables = false;
      this.LabResults = false;
      this.noReleaseDoc = false;
      this.reservation= false;
    } else if (module == 'dischargeorder') {
      this.treatmentarea = false;
      this.checkin = false;
      this.erhistory = false;
      this.PhysicianOrder = false;
      this.AdministeredDoses = false;
      this.erSetting = false;
      this.dischargeorder = true;
      this.rxEmr = false;
      this.noConsumables = false;
      this.LabResults = false;
      this.noReleaseDoc = false;
      this.reservation= false;
    } else if (module == 'analysis') {
      this.treatmentarea = false;
      this.checkin = false;
      this.erhistory = false;
      this.PhysicianOrder = false;
      this.AdministeredDoses = false;
      this.dischargeorder = false;
      this.erSetting = false;
      this.analysis = true;
      this.rxEmr = false;
      this.noConsumables = false;
      this.LabResults = false;
      this.noReleaseDoc = false;
      this.reservation= false;
    } else if (module == 'rxEmr') {
      this.treatmentarea = false;
      this.checkin = false;
      this.erhistory = false;
      this.PhysicianOrder = false;
      this.AdministeredDoses = false;
      this.dischargeorder = false;
      this.erSetting = false;
      this.analysis = false;
      this.rxEmr = true;
      this.noConsumables = false;
      this.LabResults = false;
      this.noReleaseDoc = false;
      this.reservation= false;
    } else if (module == 'noConsumables') {
      this.formDetailGroup.get("DateRange").patchValue([new Date(), new Date()]);
      this.headerLabel = 'Patients Without Consumables';
      this.treatmentarea = false;
      this.checkin = false;
      this.erhistory = false;
      this.PhysicianOrder = false;
      this.AdministeredDoses = false;
      this.dischargeorder = false;
      this.erSetting = false;
      this.analysis = false;
      this.rxEmr = true;
      this.noConsumables = true;
      this.LabResults = false;
      this.noReleaseDoc = false;
      this.reservation= false;
    } else if (module == 'LabResults') {
      this.formDetailGroup.get("DateRange").patchValue([new Date(), new Date()]);
      this.headerLabel = 'Lab Extraction';
      this.treatmentarea = false;
      this.checkin = false;
      this.erhistory = false;
      this.PhysicianOrder = false;
      this.AdministeredDoses = false;
      this.dischargeorder = false;
      this.erSetting = false;
      this.analysis = false;
      this.rxEmr = false;
      this.noConsumables = false;
      this.LabResults = true;
      this.noReleaseDoc = false;
      this.reservation= false;
    } else if (module == 'PhysicianOrder') {
      this.formDetailGroup.get("DateRange").patchValue([new Date(), new Date()]);
      this.headerLabel = 'Not Executed Physician Order'
      this.treatmentarea = false;
      this.checkin = false;
      this.erhistory = false;
      this.dischargeorder = false;
      this.erSetting = false;
      this.analysis = false;
      this.LabResults = false;
      this.rxEmr = false;
      this.noConsumables = false;
      this.PhysicianOrder = true;
      this.AdministeredDoses = false;
      this.noReleaseDoc = false;
      this.form.controls['admittedFrom'].disable();
      this.form.controls['admittedTo'].disable();
      this.reservation= false;
    } else if (module == 'AdministeredDoses') {
      this.formDetailGroup.get("DateRange").patchValue([new Date(), new Date()]);
      this.headerLabel = 'Medications Administration'
      this.treatmentarea = false;
      this.checkin = false;
      this.erhistory = false;
      this.dischargeorder = false;
      this.erSetting = false;
      this.analysis = false;
      this.LabResults = false;
      this.rxEmr = false;
      this.noConsumables = false;
      this.PhysicianOrder = false;
      this.AdministeredDoses = true;
      this.noReleaseDoc = false;
      this.reservation= false;
    } else if (module == 'noReleaseDoc') {
      this.singleData.get("fromDate").patchValue(new Date());
      this.headerLabel = 'Not Released/Missed Documents '
      this.treatmentarea = false;
      this.checkin = false;
      this.erhistory = false;
      this.dischargeorder = false;
      this.erSetting = false;
      this.analysis = false;
      this.LabResults = false;
      this.rxEmr = false;
      this.noConsumables = false;
      this.PhysicianOrder = false;
      this.AdministeredDoses = false;
      this.noReleaseDoc = true;
      this.reservation= false;
    }else if (module == 'reservation') {
      this.headerLabel = 'Reservation'
      this.treatmentarea = false;
      this.checkin = false;
      this.erhistory = false;
      this.PhysicianOrder = false;
      this.AdministeredDoses = false;
      this.dischargeorder = false;
      this.erSetting = false;
      this.rxEmr = false;
      this.analysis = false;
      this.noConsumables = false;
      this.LabResults = false;
      this.noReleaseDoc = false;
      this.reservation= true;
    }
    this.refreshFormGroup();
    this.closeAndRefresh();
    // if (module != 'noConsumables') {
    //   if (this.actionTypeSubscription$) {
    //     this.actionTypeSubscription$.unsubscribe();
    //   }
    // }
    //  this.filterForm.reset();
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
  collectCheckInData(checkindata) {
   console.log(checkindata,"checkindata");
   
    this.navigateToTreatmentArea(checkindata);
  }

  get f() {
    return this.AdministeredDosesform.controls;
  }
  commaSeparat(value: any) {
    return Array.prototype.map.call(value, function (item) { return item.Ward; }).join(",");
  }
  commaSeparatForAttendPhy(value: any) {
    return Array.prototype.map.call(value, function (item) { return item.Gpart; }).join(",");
  }
  commaSeparatForSpecialty(value: any) {
    return Array.prototype.map.call(value, function (item) { return item.Deptou; }).join(",");
  }
  getMedicationAdministrationlist() {
    this.hospitalistService?.getMedicationAdministrationSet(null,new Date(), new Date()).subscribe((res: any) => {
      this.missedMedPatientList = res.d.results;
    })
  }

  collectTreatmentPatientData(checkindata) {
    this.navigateToTreatmentArea(checkindata);
  }
  navigateToTreatmentArea(checkindata) {
    // changes the route without moving from the current view or
    // triggering a navigation event,
    if (checkindata.Lfdbw) {
      this._router.navigate([], {
        relativeTo: this._route,
        queryParams: {
          patnr: checkindata.Patnr,
          falnr: checkindata.Falnr,
          einri: checkindata.Einri,
          lfdnr: checkindata.Lfdbw
        },
        queryParamsHandling: 'merge',
        // preserve the existing query params in the route
        skipLocationChange: false
        // do not trigger navigation
      });
      window.open(
        'day-case-dashboard?' + 'patnr=' +
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

    } else {
      this._router.navigate([], {
        relativeTo: this._route,
        // queryParams: {
        //   patnr: checkindata.Patnr,
        //   falnr: checkindata.Falnr,
        //   einri: checkindata.Einri,
        //   lfdnr: checkindata.Lfdnr,
        //   redirectFor: checkindata.redirectFor
        // },
        queryParamsHandling: 'merge',
        // preserve the existing query params in the route
        skipLocationChange: false
        // do not trigger navigation
      });
      window.open(
        'day-case-dashboard?' + 'patnr=' +
        checkindata.Patnr +
        '&falnr=' +
        checkindata.Falnr +
        '&einri=' +
        checkindata.Einri +
        '&lfdnr=' +
        checkindata.Lfdnr +
        '&redirectFor=' +
        checkindata.redirectFor +
        '&action=' +
        checkindata.action +
        '&doctype=' +
        checkindata.doctype +
        '&tretmentOU=' +
        checkindata.Treatmentou +
        '&nav=Treatmentarea',
        '_blank'
      );
    }
    if (this.selectedModule == 'checkin' || this.selectedModule == 'erhistory' || this.selectedModule == 'LabResults' || this.selectedModule == 'AdministeredDoses') {
      // this.selectModule('treatmentarea');
    } else if (this.selectedModule == 'dischargeorder') {
      this.selectModule('dischargeorder');
    }

    if(this.selectedModule == 'noConsumables'){
     this.nursTreatmentWorkareaComponent?.tabChange("Consumables")
    }

    //this.emergencyService.tabPanelNavigation('OrderSet');
    if (checkindata.Lfdbw) {
      this.encounterId = checkindata.Einri + checkindata.Falnr + checkindata.Lfdbw;
    } else {
      this.encounterId = checkindata.Einri + checkindata.Falnr + checkindata.Lfdnr;
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
        localStorage.setItem('initOrg', patientData.deptOrgUnit)
        this.titleService.setTitle(`${patientData?.name} | ${this._route.snapshot.parent.routeConfig.path}`);
        this.storageService.setPatientData(patientData);

      });
  }

  refreshFormGroup() {
    this.filterForm = this.formBuilder.group({
      Physician: [''],
      Status: [''],
      FCategory: [''],
    });

  }

  // ER-History

  collectErPatientSearchData(event) {
    this.navigateToTreatmentArea(event);
  }

  collectErHistPatientCount(event) {
    this.ErHistoryPatientCount = event;
  }

  previousDate() {
    if (+this.formDetailGroup.get("DateRange").value[0] == +this.formDetailGroup.get("DateRange").value[1]) {
      var date1 = this.formDetailGroup.get("DateRange").value[0];
      var date2 = this.formDetailGroup.get("DateRange").value[1];
      this.formDetailGroup.get("DateRange").patchValue([new Date(date1.setDate((date1.getDate() - 1))), new Date(date2.setDate((date2.getDate() - 1)))]);
      // this.ErHistoryComponent?.getErList(this.formgroupData.DateRange);
      this.LabResultsComponent?.getErList("", this.formgroupData.DateRange);
      this.PhysicianOrdersListComponent?.getErList(this.formgroupData.DateRange)
      this.AdministeredDosesComponent?.getMedicationAdministrationlist(this.formgroupData.DateRange)
      this.PatientWithoutConsumableComponent?.getPatientWithoutConsumable(this.formgroupData.DateRange)
      
    } else {
      var date1 = this.formDetailGroup.get("DateRange").value[0];
      var date2 = this.formDetailGroup.get("DateRange").value[1];
      const diffTime = Math.abs(date2 - date1);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      date1 = new Date(date1.setDate(date1.getDate() - diffDays));
      date2 = new Date(date2.setDate(date2.getDate() - diffDays));
      this.formDetailGroup.get("DateRange").patchValue([date1, date2]);
      // this.ErHistoryComponent?.getSelectedDates(this.formgroupData.DateRange);
      this.LabResultsComponent?.getSelectedDates(this.formgroupData.DateRange)
      this.PhysicianOrdersListComponent?.getErList(this.formgroupData.DateRange)
      this.AdministeredDosesComponent?.getMedicationAdministrationlist(this.formgroupData.DateRange)
      this.PatientWithoutConsumableComponent?.getPatientWithoutConsumable(this.formgroupData.DateRange)
      
    }

    //this.currentDate = new Date(new Date().setDate(this.currentDate.getDate()-1));
    //this.ErHistoryComponent.getErList(this.currentDate);
  }

  onTodayEventData() {
    console.log("Upcomming");
    this.formDetailGroup.get("DateRange").patchValue([new Date(), new Date()]);
    // this.ErHistoryComponent?.getSelectedDates(this.formgroupData.DateRange);
    this.LabResultsComponent?.getSelectedDates(this.formgroupData.DateRange)
    this.PhysicianOrdersListComponent?.getErList(this.formgroupData.DateRange)
    this.AdministeredDosesComponent?.getMedicationAdministrationlist(this.formgroupData.DateRange)
    this.PatientWithoutConsumableComponent?.getPatientWithoutConsumable(this.formgroupData.DateRange)
  }
  changeDate(event) {
    this.updatedDate = event
  }


  upcomingDate() {
    console.log("Upcomming");
    this.formDetailGroup.get("DateRange").patchValue([new Date(), new Date()]);
    if (+this.formDetailGroup.get("DateRange").value[0] == +this.formDetailGroup.get("DateRange").value[1]) {
      var date1 = this.formDetailGroup.get("DateRange").value[0];
      var date2 = this.formDetailGroup.get("DateRange").value[1];
      this.formDetailGroup.get("DateRange").patchValue([new Date(date1.setDate((date1.getDate() + 1))), new Date(date2.setDate((date2.getDate() + 1)))]);
      // this.ErHistoryComponent?.getErList(this.formgroupData.DateRange);
      this.LabResultsComponent?.getErList("", this.formgroupData.DateRange);
      this.PhysicianOrdersListComponent?.getErList(this.formgroupData.DateRange)
      this.AdministeredDosesComponent?.getMedicationAdministrationlist(this.formgroupData.DateRange)
      this.PatientWithoutConsumableComponent?.getPatientWithoutConsumable(this.formgroupData.DateRange)
    } else {
      var date1 = this.formDetailGroup.get("DateRange").value[0];
      var date2 = this.formDetailGroup.get("DateRange").value[1];
      const diffTime = Math.abs(date2 - date1);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      date1 = new Date(date1.setDate(date1.getDate() + diffDays));
      date2 = new Date(date2.setDate(date2.getDate() + diffDays));
      this.formDetailGroup.get("DateRange").patchValue([date1, date2]);
      // this.ErHistoryComponent?.getSelectedDates(this.formgroupData.DateRange);
      this.LabResultsComponent?.getSelectedDates(this.formgroupData.DateRange)
      this.PhysicianOrdersListComponent?.getErList(this.formgroupData.DateRange)
      this.AdministeredDosesComponent?.getMedicationAdministrationlist(this.formgroupData.DateRange)
      this.PatientWithoutConsumableComponent?.getPatientWithoutConsumable(this.formgroupData.DateRange)
     
    }
    //this.currentDate = new Date(new Date().setDate(this.currentDate.getDate()+1));
    //this.ErHistoryComponent.getErList(this.currentDate);
  }

  previoussingleData(): void {
    if(this.singleData.get('fromDate').value){
      const currentDate = this.singleData.get('fromDate').value;
      const previousDate = new Date(currentDate);
      previousDate.setDate(previousDate.getDate() - 1);
      this.singleData.patchValue({ fromDate: previousDate });
      // this.ErHistoryComponent?.getErList(this.singleformgroupData.fromDate);
    }
  }

  upcomingsingleData(): void {
    if(this.singleData.get('fromDate').value){
      const currentDate = this.singleData.get('fromDate').value;
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 1);
      this.singleData.patchValue({ fromDate: nextDate });
      // this.ErHistoryComponent?.getErList(this.singleformgroupData.fromDate);
    }
  }

  openPatientSearch() {
    this.ErHistoryComponent.openModalForPatientSearch();
  }
  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }

  openPatientInfo(template: TemplateRef<any>,) {
    const config: ModalOptions = { class: 'modal-dialog-centered patient-info-modal-size' };
    this.modalRef = this.modalService.show(template, config);
  }

  caseNumberReturn(caseNumber: any) {
    return parseInt(caseNumber, 10).toString()
  }
}
