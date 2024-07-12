import { Component, ElementRef, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { OrdersDashboardService } from '@services/orders-dashboard/orders-dashboard.service';
import { CheckInComponent } from './check-in/check-in.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Patient } from '@services/e-kardex/interfaces/patient';
import { Subscription, catchError, of, tap } from 'rxjs';
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
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { DataShareService } from '@services/data-share.service';
import { FilterType } from '@services/interfaces/common.enum';
import { OutpatientNursingService } from '@services/outpatient-nursing.service';

@Component({
  selector: 'app-out-patient-nursing',
  templateUrl: './out-patient-nursing.component.html',
  styleUrls: ['./out-patient-nursing.component.scss']
})
export class OutPatientNursingComponent implements OnInit {
  @ViewChild(CheckInComponent) CheckInComponent;
  @ViewChild(ErHistoryComponent) ErHistoryComponent;
  @ViewChild(LabResultsComponent) LabResultsComponent;
  @ViewChild(PhysicianOrdersListComponent) PhysicianOrdersListComponent;
  @ViewChild(AdministeredDosesComponent) AdministeredDosesComponent;
  userConfiguration: any;
  clinicConfigDetail: any;
  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const configurationCard = document.getElementById('configurationCard');
    if (configurationCard && !configurationCard.contains(event.target as Node)) {
      this.showConfiguration = false;
    }
  }
  checkin: any = true;
  treatmentarea: boolean = false;
  appointments = false;
  erhistory = false;
  PhysicianOrder: boolean = false;
  reservation: boolean = false;
  AdministeredDoses: boolean = false;
  dischargeorder: boolean = false;
  erSetting: boolean = false;
  erFile: boolean = false;
  LabResults: boolean = false;
  rxEmr: boolean = false;
  showfilter = false;
  selectedModule: any;
  currentDate: Date;
  allTriageData = [];
  assignUsersList: any = [];
  allStatus = [];
  allDoctorList = [];
  allFinCategoryList = [];
  phyOrder = 0;
  filterForm: FormGroup;
  filterFormLab: FormGroup
  missedMedPatientList: any[] = [];
  formDetailGroup: any;
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
  speciality = "";
  type = "";
  searchString!: string;
  dropdownSettingsForAttendPhy = {}
  modalRef: BsModalRef;
  showConfiguration: boolean = false;
  wardSelectForConfig: any[] = [];
  specialtySelectForConfig: any[] = []

  selectedPhysicianConf: any[] = [];
  selectedSpecialityConf: any[] = []
  specialityList: any = [];
  dropdownSettingsForSpeciality: any = {};
  dropdownSettingsForPhysician: any = {};
  actionTypeSubscription$: Subscription;
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
    private modalService: BsModalService,
    private dataShareService: DataShareService,
    private outpatientNursingService: OutpatientNursingService,
  ) {
    this.formDetailGroup = this.formBuilder.group({
      SearchData: [''],
      DateRange: [[new Date(), new Date()]],
      SelectDropdown: [''],
    });
    this.form = this.formBuilder.group({
      admittedFrom: [''],
      admittedTo: [''],
      wardNo: [''],
      patientStatus: [''],
    });
    this.AdministeredDosesform = this.formBuilder.group({
      admittedFrom: [''],
      admittedTo: [''],
      wardNo: [''],
      patientStatus: [''],
      specialty: [''],
      patient: ['']
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
        this.formgroupData.SearchData = data.SearchData;
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
          /**
           * TODO : Nikhil - Comment this code to stop dual call of API - may in future will need to enable if need...
           */
          this.ErHistoryComponent?.getSelectedDates(this.formgroupData.DateRange);
          this.LabResultsComponent?.getSelectedDates(this.formgroupData.DateRange);
          this.CheckInComponent?.getSelectedDates(this.formgroupData.DateRange);
        }
      }
    );
    this.filterForm = this.formBuilder.group({
      Triage: [''],
      Physician: [''],
      Status: [''],
      FCategory: [''],
    });
    this.filterFormLab = this.formBuilder.group({
      Rooms: [''],
      Physician: [''],
      ItemStatus: [''],
    });

    this.actionTypeSubscription$ = this.dataShareService.filterType$.subscribe((data) => {
      if (data != null) {
        if (data.type == FilterType.OpCheckIn$ && data.isAllow == true && data.value) {
          if (data.value?.filterFinCategtoryList) {
            this.allFinCategoryList = [];
            this.allFinCategoryList = data.value.filterFinCategtoryList.map(status => ({ Category: status }));
          }
          if (data.value?.filterStatusList) {
            this.allStatus = [];
            this.allStatus = data.value.filterStatusList.map(status => ({ Status: status }));
          }
          if (data.value?.filterDoctorList) {
            this.allDoctorList = [];
            this.allDoctorList = data.value.filterDoctorList.map(status => ({ Doctor: status }));
          }
        }
        if (data.type == FilterType.OpErHistory$ && data.isAllow == true && data.value) {
          if (data.value?.filterFinCategtoryList) {
            this.allFinCategoryList = [];
            this.allFinCategoryList = data.value.filterFinCategtoryList.map(status => ({ Category: status }));
            console.log(this.allFinCategoryList);
          }
          if (data.value?.filterStatusList) {
            this.allStatus = [];
            this.allStatus = data.value.filterStatusList.map(status => ({ Status: status }));
            console.log(this.allStatus);
          }
          if (data.value?.filterDoctorList) {
            this.assignUsersList = [];
            this.assignUsersList = data.value.filterDoctorList.map(status => ({ Doctor: status }));
            console.log(this.assignUsersList);
          }
        }

      }
    });
  }

  ngOnInit(): void {
    // this.getMedicationAdministrationlist()
    this.getWardList();
    this.getLabExtraction()
    this.receiveDataFromChild()
    //this.selectModule('checkin');
    this.getAssignSurgeonList(); //comment due to dual call
    // this.outpatientNursingService.getAssignSurgeonList();
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
    this.dropdownSettingsForSpeciality = {
      singleSelection: false,
      enableCheckAll: true,
      idField: 'Orgid',
      textField: 'Orgna',
      itemsShowLimit: 2,
      allowSearchFilter: true,
      defaultOpen: false,
      selectAllText: 'All',
      clearSearchFilter: true,
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
    this.dropdownSettingsForPhysician = {
      singleSelection: false,
      enableCheckAll: true,
      idField: 'Gpart',
      textField: 'NamString',
      itemsShowLimit: 2,
      allowSearchFilter: true,
      defaultOpen: false,
      selectAllText: 'All',
    };
    this.dataForTriage();
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
      this.getDataPatient(this.encounterId);
    } else {
      this.selectModule('checkin');
    }
    this.userConfiguration = JSON.parse(localStorage.getItem('UserConfiguration'));

  }

  getSpecialityDrodownList() {
    this.hospitalistService.getSpecialtyList().subscribe((res: any) => {
      this.specialityList = res?.d?.results;
      this.clinicConfigGet()
    })
  }

  clinicConfigGet() {
    this.ePrescriptionService.loadData(`e-prescription/clinicConfigSet?Username=${this.storageService.getUserProfile().UserName}`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d) {
        this.clinicConfigDetail = resp.body.d.results
        localStorage.setItem('UserConfiguration', JSON.stringify(resp.body.d));
        const attendPhy = this.clinicConfigDetail[0].AttendPhy.split(',')
        this.selectedPhysicianConf =  this.assignUsersList.filter(item => attendPhy.includes(item.Gpart))

        
      const specialityCode =this.clinicConfigDetail[0].SpecialityCode.split(',');
      this.selectedSpecialityConf = this.specialityList.filter(item => specialityCode.includes(item.Orgid))
      }
    });
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
  dataForTriage() {
    this.allTriageData = [
      {
        Allergen: 'Level I - Resuscitation',
        Triage: '01',
        color: 'blue',
        isActive: false,
      },
      {
        Allergen: 'Level II - Emergency',
        Triage: '02',
        color: 'red',
        isActive: false,
      },
      {
        Allergen: 'Level III - Urgency',
        Triage: '03',
        color: 'yellow',
        isActive: false,
      },
      {
        Allergen: 'Level IV - Less Urgency',
        Triage: '04',
        color: 'green',
        isActive: false,
      },
      {
        Allergen: 'Level V - Non Urgency',
        Triage: '05',
        color: 'white',
        isActive: false,
      },
    ];
  }
  getAssignSurgeonList() {
    this.orderDashboardService.getAssignUsersData().subscribe((data: any) => {
      this.assignUsersList = data?.d?.results;
      this.getSpecialityDrodownList()
    });
  }
  refreshConfig() {
    this.clinicConfigGet();
  }

  createConfig() {
    const physicianArray = this.selectedPhysicianConf.map(item => item.Gpart);
    const specialityArray = this.selectedSpecialityConf.map(item => item.Orgid);
    const userName = this.storageService.getUserProfile().UserName
    const usrevma = this.storageService.getUserProfile().Gpart
    let arrayAsString = physicianArray.join(',');
    let arraysAsString = specialityArray.join(',');
     let Payload = {
      d: {
        Username: userName,
        Usrevma: usrevma,
        AttendPhy: arrayAsString ,
        SpecialityCode: arraysAsString,
      },
    };
    if (!this.clinicConfigDetail) {
      this.orderDashboardService.updateClinicConfig(Payload).subscribe((res) => {
        this.showConfiguration = false;
        this.clinicConfigGet();
      })
    } else {
      this.orderDashboardService.createClinicConfig(Payload).subscribe((res) => {
        this.showConfiguration = false;
        this.clinicConfigGet();
      })
    }
  }

  getLabExtraction() {
    this.orderDashboardService.postCountLabExtraction('', '').subscribe((data: any) => {
      this.phyOrder = data.count;
    });
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
        if (!accumulator.includes(currentValue.Behperson)) {
          accumulator.push(currentValue.Behperson);
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
    } else {
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

  clickShowConfiguration() {
    this.showConfiguration = !this.showConfiguration;
  }

  showFilterFn($event) {
    $event.stopPropagation();
    if (this.showfilter) {
      this.showfilter = false;
    } else {
      this.showfilter = true;
    }
  }

  refreshCheckIn() {
    this.formDetailGroup.get("DateRange").patchValue([new Date(), new Date()])
    if (this.selectedModule === 'checkin') {
      this.CheckInComponent.getErList([new Date(), new Date()]);
    } else if (this.selectedModule === 'erhistory') {
      this.ErHistoryComponent.getErHistoryList([new Date(), new Date()]);
    } else if (this.selectedModule === 'LabResults') {
      this.LabResultsComponent?.getErList("", this.formDetailGroup.get("DateRange").patchValue([new Date(), new Date()]));
    } else if (this.selectedModule === 'AdministeredDoses') {
      this.AdministeredDosesComponent?.getErList("", this.formDetailGroup.get("DateRange").patchValue([new Date(), new Date()]));
    }
    // Resetting filter form values
    this.filterForm.patchValue({
      Triage: '',
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
    });
    this.AdministeredDosesform.patchValue({
      admittedFrom: '',
      admittedTo: '',
      wardNo: '',
      patientStatus: '',
      specialty: '',
      patient: ''
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
    // this.onTodayEventData();
    this.formDetailGroup.get("DateRange").patchValue([new Date(), new Date()]);
    // this.emergencyService.tabPanelNavigation('OrderSet');
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
      this.appointments = false;
      this.erFile = false;
      this.LabResults = false;
      this.reservation= false;
    } else if (module == 'treatmentarea') {
      this.treatmentarea = true;
      this.checkin = false;
      this.erhistory = false;
      this.PhysicianOrder = false;
      this.AdministeredDoses = false;
      this.dischargeorder = false;
      this.erSetting = false;
      this.appointments = false;
      this.rxEmr = false;
      this.erFile = false;
      this.LabResults = false;
      this.reservation= false;
    } else if (module == 'erhistory') {
      this.headerLabel = ""
      this.treatmentarea = false;
      this.checkin = false;
      this.erhistory = true;
      this.AdministeredDoses = false;
      this.PhysicianOrder = false;
      this.dischargeorder = false;
      this.erSetting = false;
      this.appointments = false;
      this.rxEmr = false;
      this.erFile = false;
      this.LabResults = false;
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
      this.appointments = false;
      this.erFile = false;
      this.LabResults = false;
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
      this.erFile = false;
      this.LabResults = false;
      this.reservation= false;

    } else if (module == 'appointments') {
      this.treatmentarea = false;
      this.checkin = false;
      this.erhistory = false;
      this.PhysicianOrder = false;
      this.AdministeredDoses = false;
      this.dischargeorder = false;
      this.erSetting = false;
      this.appointments = true;
      this.rxEmr = false;
      this.erFile = false;
      this.LabResults = false;
      this.reservation= false;

    } else if (module == 'rxEmr') {
      this.treatmentarea = false;
      this.checkin = false;
      this.erhistory = false;
      this.PhysicianOrder = false;
      this.AdministeredDoses = false;
      this.dischargeorder = false;
      this.erSetting = false;
      this.appointments = false;
      this.rxEmr = true;
      this.erFile = false;
      this.LabResults = false;
      this.reservation= false;

    } else if (module == 'erFile') {
      this.treatmentarea = false;
      this.checkin = false;
      this.erhistory = false;
      this.PhysicianOrder = false;
      this.AdministeredDoses = false;
      this.dischargeorder = false;
      this.erSetting = false;
      this.appointments = false;
      this.rxEmr = true;
      this.erFile = true;
      this.LabResults = false;
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
      this.appointments = false;
      this.rxEmr = false;
      this.erFile = false;
      this.LabResults = true;
      this.reservation= false;

    } else if (module == 'PhysicianOrder') {
      this.headerLabel = 'Not Executed Physician Order'
      this.treatmentarea = false;
      this.checkin = false;
      this.erhistory = false;
      this.dischargeorder = false;
      this.erSetting = false;
      this.appointments = false;
      this.LabResults = false;
      this.rxEmr = false;
      this.erFile = false;
      this.PhysicianOrder = true;
      this.AdministeredDoses = false;
      this.form.controls['admittedFrom'].disable();
      this.form.controls['admittedTo'].disable();
      this.reservation= false;

    } else if (module == 'AdministeredDoses') {
      this.headerLabel = 'Medication Administration'
      this.treatmentarea = false;
      this.checkin = false;
      this.erhistory = false;
      this.dischargeorder = false;
      this.erSetting = false;
      this.appointments = false;
      this.LabResults = false;
      this.rxEmr = false;
      this.erFile = false;
      this.PhysicianOrder = false;
      this.AdministeredDoses = true;
      this.reservation= false;

    }else if (module == 'reservation') {
      this.headerLabel = 'Reservation'
      this.treatmentarea = false;
      this.checkin = false;
      this.erhistory = false;
      this.dischargeorder = false;
      this.erSetting = false;
      this.appointments = false;
      this.LabResults = false;
      this.rxEmr = false;
      this.erFile = false;
      this.PhysicianOrder = false;
      this.AdministeredDoses = false;
      this.reservation= true;

    }
    this.refreshFormGroup();
    this.closeAndRefresh();
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
    this.hospitalistService.getMedicationAdministrationSet(new Date(), new Date()).subscribe((res: any) => {
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
        'out-patient-nursing?' + 'patnr=' +
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
        queryParams: {
          patnr: checkindata.Patnr,
          falnr: checkindata.Falnr,
          einri: checkindata.Einri,
          lfdnr: checkindata.Lfdnr
        },
        queryParamsHandling: 'merge',
        // preserve the existing query params in the route
        skipLocationChange: false
        // do not trigger navigation
      });
      window.open(
        'out-patient-nursing?' + 'patnr=' +
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
    if (this.selectedModule == 'checkin' || this.selectedModule == 'erhistory' || this.selectedModule == 'LabResults' || this.selectedModule == 'AdministeredDoses') {
      //this.selectModule('treatmentarea');
    } else if (this.selectedModule == 'dischargeorder') {
      this.selectModule('dischargeorder');
    }

    //this.emergencyService.tabPanelNavigation('OrderSet');
    if (checkindata.Lfdbw) {
      this.encounterId = checkindata.Einri + checkindata.Falnr + checkindata.Lfdbw;
    } else {
      this.encounterId = checkindata.Einri + checkindata.Falnr + checkindata.Lfdnr;
    }

    //  this.getDataPatient();
  }
  openPatientInfo(template: TemplateRef<any>,) {
    const config: ModalOptions = { class: 'modal-dialog-centered patient-info-modal-size' };
    this.modalRef = this.modalService.show(template, config);
  }

  getDataPatient(encounterId) {
    this.patientService
      .getDataPatient(encounterId)
      .pipe(
        tap(() => (this.isLoading = false)),
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
      Triage: [''],
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
      // this.LabResultsComponent?.getErList("", this.formgroupData.DateRange);
      // this.CheckInComponent?.getErList(this.formgroupData.DateRange);
    } else {
      var date1 = this.formDetailGroup.get("DateRange").value[0];
      var date2 = this.formDetailGroup.get("DateRange").value[1];
      const diffTime = Math.abs(date2 - date1);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      date1 = new Date(date1.setDate(date1.getDate() - diffDays));
      date2 = new Date(date2.setDate(date2.getDate() - diffDays));
      this.formDetailGroup.get("DateRange").patchValue([date1, date2]);
      // this.ErHistoryComponent?.getSelectedDates(this.formgroupData.DateRange);
      // this.LabResultsComponent?.getSelectedDates(this.formgroupData.DateRange);
      // this.CheckInComponent?.getSelectedDates(this.formgroupData.DateRange);
    }

    //this.currentDate = new Date(new Date().setDate(this.currentDate.getDate()-1));
    //this.ErHistoryComponent.getErList(this.currentDate);
  }

  onTodayEventData() {
    this.formDetailGroup.get("DateRange").patchValue([new Date(), new Date()]);
    // this.ErHistoryComponent?.getSelectedDates(this.formgroupData.DateRange);
    // this.LabResultsComponent?.getSelectedDates(this.formgroupData.DateRange);
    // this.CheckInComponent?.getSelectedDates(this.formgroupData.DateRange);
  }

  upcomingDate() {
    // this.formDetailGroup.get("DateRange").patchValue([new Date(), new Date()]);
    if (+this.formDetailGroup.get("DateRange").value[0] == +this.formDetailGroup.get("DateRange").value[1]) {
      var date1 = this.formDetailGroup.get("DateRange").value[0];
      var date2 = this.formDetailGroup.get("DateRange").value[1];
      this.formDetailGroup.get("DateRange").patchValue([new Date(date1.setDate((date1.getDate() + 1))), new Date(date2.setDate((date2.getDate() + 1)))]);
      // this.ErHistoryComponent?.getErList(this.formgroupData.DateRange);
      // this.LabResultsComponent?.getErList("", this.formgroupData.DateRange);
      // this.CheckInComponent?.getErList(this.formgroupData.DateRange);
    } else {
      var date1 = this.formDetailGroup.get("DateRange").value[0];
      var date2 = this.formDetailGroup.get("DateRange").value[1];
      const diffTime = Math.abs(date2 - date1);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      date1 = new Date(date1.setDate(date1.getDate() + diffDays));
      date2 = new Date(date2.setDate(date2.getDate() + diffDays));
      this.formDetailGroup.get("DateRange").patchValue([date1, date2]);
      // this.ErHistoryComponent?.getSelectedDates(this.formgroupData.DateRange);
      // this.LabResultsComponent?.getSelectedDates(this.formgroupData.DateRange);
      // this.CheckInComponent?.getSelectedDates(this.formgroupData.DateRange);
    }
    //this.currentDate = new Date(new Date().setDate(this.currentDate.getDate()+1));
    // this.ErHistoryComponent.getErList(this.currentDate);
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
}
