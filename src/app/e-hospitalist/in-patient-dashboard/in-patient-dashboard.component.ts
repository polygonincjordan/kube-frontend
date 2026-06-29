import { StorageService } from './../../services/storage.service';
import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { HospitalistService } from '../../services/e-hospitalist/hospitalist.service';
import { AttendingPhysician, HospitalistDataCount, HospitalistType, WardList } from '../../services/e-hospitalist/interfaces/hospitalist';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { catchError, of } from 'rxjs';
import { EEmrService } from '../../services/e-emr.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AdmissionService } from '@services/admission/admission.service';
import * as converter from 'xml-js';
import * as _ from 'lodash'
import { MissedMedicationDosesService } from '@services/e-hospitalist/missed-medication-doses.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { DatePipe } from '@angular/common';
import * as XLSX from 'xlsx';
import { PatientService } from '@services/e-kardex/patient.service';
import { ArrivalMainListComponent } from '../components/arrival-main-list/arrival-main-list.component';
import { SharedService } from '@services/shared.service';
@UntilDestroy()
@Component({
  selector: 'in-patient-dashboard',
  templateUrl: './in-patient-dashboard.component.html',
  styleUrls: ['./in-patient-dashboard.component.scss'],
})
export class InPatientDashboardComponent implements OnInit {
  @ViewChild(ArrivalMainListComponent) arrivalMainListComponent;

  showGraphicalAnalysis: boolean = false;
  showFilter: boolean = false;
  showConfiguration: boolean = false;
  showList: boolean = true;
  inHospitalistList: Array<HospitalistType> = [];
  inArrivalslistList: any = [];
  inArrivalslistListClone: any = [];
  inSurgeryWorklist: any = [];
  navTabBoxActiveValue: string = '02';
  graphChartCountType: string = '1';
  form: FormGroup;
  filterForm: FormGroup;

  hospitalCountData: HospitalistDataCount;
  wardSelectForConfig: any[] = [];

  searchString!: string;
  dropdownSettings = {};
  dropdownSettingsForAttendPhy = {};
  dropdownSettingsForLDRAttendPhy = {};
  dropdownSettingsForSpecialty = {};
  dropdownSettingsForSpecialtyConfig = {};

  columnsList = [];
  showColumnsListView = {
    VIP: false,
    Treatment_diagnosis: false,
    Study_name: false,
    Speciality: false,
    Isolation: false,
    LOS: false,
    Risk_Factor: false,
    Planned_discharge: false,
    Last_surgery_date: false,
    Financial_Category: false,
    Emergency_Admission: false,
    Doctor: false,
    Days_since_surgery: false,
    Days_for_isolation: false,
    Case: false,
    Allergy: false,
    Admitted_At: false,
    Admission_diagnosis: false,
    VIP_model: false,
    Treatment_diagnosis_model: false,
    Study_name_model: false,
    Speciality_model: false,
    Isolation_model: false,
    LOS_model: false,
    Risk_Factor_model: false,
    Planned_discharge_model: false,
    Last_surgery_date_model: false,
    Financial_Category_model: false,
    Emergency_Admission_model: false,
    Doctor_model: false,
    Days_since_surgery_model: false,
    Days_for_isolation_model: false,
    Case_model: false,
    Allergy_model: false,
    Admitted_At_model: false,
    Admission_diagnosis_model: false,
    DefaultView: '',
    Listview_modal: false,
    Bedview_modal: false,
    Attending_Doctor: false,
    Attending_Doctor_modal: false,
    Case_Diagnosis: false,
    Case_Diagnosis_modal: false,
    Risk_factory: false,
    Risk_factory_modal: false,
  };
  Variantid: any;
  postSelectedCol = [];
  getWards: WardList[];
  getSpecialtyData: any[];
  arraySplit: any[] = [];
  getWardDataFromApi: any = '';
  inAttendPhyList: AttendingPhysician[];
  dataOnTableForPhyOrder = [];
  getConfigToolWardList: any;
  getConfigToolSpecialtyList: any;
  getConfigToolPhysicianList: any;
  specialtySelectForConfig = [];
  attendingSelectForConfig = [];
  Admissions = false;
  Newadmissions = false;
  Planneddischarges = false;
  Discharges = false;
  Dialysis = false;
  home = true;
  ipConsultation = false;
  abnormalLabResult = false;
  abnormalRadFindings = false;
  missedMediDoses = false;
  notReleasedDoc = false;
  notExecutedPhysicianOrder = false;
  consultationsOrders = false;
  navModulesList = [
    // 'home',
    // 'My_IP_consultations',
    // 'Abnormal_Lab_Results',
    // 'Abnormal_Rad_Findings',
    // 'Missed_Medications_Doses',
    // 'Not_Released_Documents',
    'Not_Executed_Physician_Order',
  ];

  homeCount = 0;
  ipConsultCount = 0;
  labCount = 0;
  radCount = 0;
  missedDosesCount = 0;
  notReleaseDocCount = 0;
  phyOrderCount = 0;
  LDRBirthUniCount = 0;
  selectTab: string;

  dateFrom: Date;
  dateTo: Date;
  arrivalDate: Date = new Date();
  dataOnTableForLabPatients = [];
  patientMrn: string;
  showfilter: boolean = false;
  notDoneArr = [];
  completedArr = [];
  completedAbnormalArr = [];
  modalForselectedItemsForStatus = [];
  PartiallyAbnormalArr = [];
  pieChartData = {};
  radPatientList: any[] = [];
  missedMedPatientList: any[] = [];
  physicianOrderPatientList: any[] = [];
  specialtyArraySplit: any;
  specialtyListConfig: any;
  physicianArraySplit: any;
  inHospitalist: any[] = [];
  inLDRAttendPhyList: any;
  attendingPhysicianList: any;
  inSurgeryWorklistClone: any[];
  consultationsOrdersList: any;

  // Frontend-only filters for the main in-patient tabs (Admitted, New Admissions,
  // Planned Discharges, Discharges). Applied client-side over the complete loaded list.
  inHospitalistListClone: Array<HospitalistType> = [];
  genderFilterOptions: string[] = [];
  roomFilterOptions: string[] = [];
  ageRangeError: string = '';
  constructor(
    private _EMRServices: EEmrService,
    private hospitalistService: HospitalistService,
    private formBuilder: FormBuilder,
    public missedMedicationService: MissedMedicationDosesService,
    public ePrescriptionService: EPrescriptionService,
    public patientService: PatientService,
    private datePipe: DatePipe,
    public sharedService: SharedService,

  ) {
  }
  ngOnInit() {
    this.getSpecialtyConfigList();
    //this.LDRBirthUnitgetList();
    this.LDRListSet();
    // this.countOfNavModules();
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

    this.dropdownSettingsForSpecialtyConfig = {
      singleSelection: false,
      enableCheckAll: true,
      idField: 'Orgid',
      textField: 'Orgna',
      itemsShowLimit: 2,
      allowSearchFilter: true,
      defaultOpen: false,
      selectAllText: 'All',
    };

    this.filterForm = this.formBuilder.group({
      Physician: [''],
      Status: [''],
      FCategory: [''],
      FWard: [''],
      FSpecialty: [''],
      RoomidText: [''],
      CaseType: [''],
      PerformaceUnit: [''],
      FinCate: [''],
      // Frontend-only filters for the main in-patient tabs.
      PatientAgeFrom: [''],
      PatientAgeTo: [''],
      PatientGender: [''],
      AdmissionTimeFrom: [''],
      AdmissionTimeTo: [''],
    });

    this.getSurgeryList();
    this.getArrivalAPI();
  }

  @HostListener('document:click', ['$event'])
  documentClick(event: any) {
    if (event.target.id != "graphAnalysisButton") {
      this.showGraphicalAnalysis = false;
    }

    // if(event.target.id != "configurationButton") {
    //   this.showConfiguration = false;
    // }

    // if(event.target.id != "filterButton") {
    //   this.showFilter = false;
    // }
  }

  countOfNavModules(wardNo?) {
    if (!wardNo) wardNo = '';
    this.hospitalistService.getHospitalCount(this.navTabBoxActiveValue, wardNo).subscribe(
      (_success: any) => {
        this.labCount = _success?.d?.results[0].LabCount;
        this.radCount = _success?.d?.results[0].RadCount;
        this.missedDosesCount = _success?.d?.results[0].MedCount;
        this.phyOrderCount = _success?.d?.results[0].PordCount;
      },
      (_error: any) => { }
    );
  }

  getWardList() {
    this._EMRServices.getWardList().subscribe(
      (_success: any) => {
        if (_success) {
          // _success = JSON.parse(_success._body);
          this.getWards = _success.d.results;
          this.getConfigTools();
        }
      },
      (_error: any) => { }
    );
  }

  onItemSelect(event: any) {

  }

  onItemSelect1(event: any) {
    // console.log(this.form,event, "1234567");
  }

  onSelectAll(event: any) {

  }

  hideShowConfiguration() {
    this.showConfiguration = false;
    this.showFilter = false;
  }

  clickShowGraphicalAnalysis() {
    this.showGraphicalAnalysis = !this.showGraphicalAnalysis;
    this.showFilter = false;
    this.showConfiguration = false;
  }
  clickShowFilter() {
    this.showFilter = !this.showFilter;
    this.showGraphicalAnalysis = false;
    this.showConfiguration = false;
  }
  clickShowConfiguration() {
    this.showConfiguration = !this.showConfiguration;
    this.showGraphicalAnalysis = false;
    this.showFilter = false;
  }
  clickShowListAndBed() {
    this.showList = !this.showList;
    this.showGraphicalAnalysis = false;
    this.showFilter = false;
    this.showConfiguration = false;
  }
  onClickNavTabBox(key) {

    this.f.wardNo.setValue('');
    this.f.specialty.setValue('');
    this.f.patientStatus.setValue('');
    // this.f.patient.setValue('');
    this.clearInPatientFilterFields();
    this.navTabBoxActiveValue = key;
    this.navModule('home');
    this.countOfNavModules();
    this.form = this.formBuilder.group({
      admittedFrom: [''],
      admittedTo: [''],
      wardNo: [''],
      patientStatus: [''],
      patientStatusCon: [''],
      specialty: [''],
      patient: ['']
    });
    if (this.wardSelectForConfig.length) this.form.patchValue({
      wardNo: this.wardSelectForConfig,
    })
    if (this.inHospitalist.length) {
      for (let i = 0; i <= this.inHospitalist.length; i++) {

        this.form.patchValue({
          wardNo: this.wardSelectForConfig,
          //patient: this.inHospitalist[i].Patient
        })
      }
    }
    // this.inPatientListByFilter(this.getConfigToolWardList);
  }
  getHospitalistTableTitle() {
    switch (this.navTabBoxActiveValue) {
      case '02':
        return `Admitted Patients`;
      case '03':
        return 'New Admission Patients';
      case '04':
        return 'Planned Discharge Patients';
      case '05':
        return 'Discharge Patients';
      case '06':
        return 'Dialysis Patients';
      case '07':
        return 'LDR Patients';
      case '08':
        return 'Arrivals';
      case '09':
        return 'Surgery Worklist';
      default:
        break;
    }
  }

  getSpecialtyList(columnList) {
    let specialty = '';
    columnList.forEach((element: any) => {
      let specialtyConfigSplit = element.Fieldname.split("-");
      if (specialtyConfigSplit[0] == "SpecialtyConfig") {
        specialty = specialtyConfigSplit[1];
      }
    })
    return specialty;
  }

  getPhysicianList(columnList) {
    let physician = '';
    columnList.forEach((element: any) => {
      let specialtyConfigSplit = element.Fieldname.split("-");
      if (specialtyConfigSplit[0] == "PhysicianConfig") {
        physician = specialtyConfigSplit[1];
      }
    })
    return physician;
  }

  getConfigTools() {
    let jsonObj = {
      Compid: 'IPHOSP',
    };

    this._EMRServices.getConfigTools(jsonObj).subscribe(
      (_success: any) => {
        //_success = JSON.parse(_success._body);
        if (_success.d?.results.length) {
          this.getConfigToolWardList = _success.d?.results[0]?.Ward;
          let specialtyData = this.getSpecialtyList(_success.d?.results[0]?.ConfigHeaderItem.results);
          let physicianData = this.getPhysicianList(_success.d?.results[0]?.ConfigHeaderItem.results);
          this.getConfigToolSpecialtyList = specialtyData;
          this.getConfigToolPhysicianList = physicianData;
          this.loadData(_success.d?.results[0]?.Ward, specialtyData);
          // this.loadDataWithAttendPhyList();
          this.getWardDataFromApi = _success.d?.results[0]?.Ward;
          if (_success.d.results != null && _success.d.results.length > 0) {
            this.arraySplit = _success.d?.results[0]?.Ward.split(',');
            this.wardSelectForConfig = [];
            this.getWards.filter((element) => {
              if (this.arraySplit.includes(element.Ward)) {
                this.wardSelectForConfig.push(element);
              }
            });
            if (this.wardSelectForConfig.length) this.form.patchValue({
              wardNo: this.wardSelectForConfig
            })



            this.Variantid = _success.d?.results[0]?.Variantid || [];
            this.columnsList = _success.d?.results[0]?.ConfigHeaderItem.results || [];

            if (_success.d.results[0].Bedlist == '1') {
              this.showColumnsListView.Listview_modal = this.showList = false;
              this.showColumnsListView.Bedview_modal = true;
            } else {
              this.showColumnsListView.Listview_modal = this.showList = true;
              this.showColumnsListView.Bedview_modal = false;
            }

            this.postSelectedCol = [];
            this.columnsList.forEach((value) => {
              this.postSelectedCol.push({
                Variantid: '',
                Fieldname: value.Fieldname,
              });
            });

            this.columnsList.find((value) => {
              if (value.Fieldname == 'Admission diagnosis') {
                this.showColumnsListView.Admission_diagnosis = true;
                this.showColumnsListView.Admission_diagnosis_model = true;
              }
              if (value.Fieldname == 'Admitted At') {
                this.showColumnsListView.Admitted_At = true;
                this.showColumnsListView.Admitted_At_model = true;
              }
              if (value.Fieldname == 'Allergy') {
                this.showColumnsListView.Allergy = true;
                this.showColumnsListView.Allergy_model = true;
              }
              if (value.Fieldname == 'Case') {
                this.showColumnsListView.Case = true;
                this.showColumnsListView.Case_model = true;
              }
              if (value.Fieldname == 'Days for isolation') {
                this.showColumnsListView.Days_for_isolation = true;
                this.showColumnsListView.Days_for_isolation_model = true;
              }
              if (value.Fieldname == 'Days since surgery') {
                this.showColumnsListView.Days_since_surgery = true;
                this.showColumnsListView.Days_since_surgery_model = true;
              }
              if (value.Fieldname == 'Doctor') {
                this.showColumnsListView.Doctor = true;
                this.showColumnsListView.Doctor_model = true;
              }
              if (value.Fieldname == 'Emergency Admission') {
                this.showColumnsListView.Emergency_Admission = true;
                this.showColumnsListView.Emergency_Admission_model = true;
              }
              if (value.Fieldname == 'Financial Category') {
                this.showColumnsListView.Financial_Category = true;
                this.showColumnsListView.Financial_Category_model = true;
              }
              if (value.Fieldname == 'Isolation') {
                this.showColumnsListView.Isolation = true;
                this.showColumnsListView.Isolation_model = true;
              }
              if (value.Fieldname == 'Last surgery date') {
                this.showColumnsListView.Last_surgery_date = true;
                this.showColumnsListView.Last_surgery_date_model = true;
              }
              if (value.Fieldname == 'LOS') {
                this.showColumnsListView.LOS = true;
                this.showColumnsListView.LOS_model = true;
              }
              if (value.Fieldname == 'Planned discharge') {
                this.showColumnsListView.Planned_discharge = true;
                this.showColumnsListView.Planned_discharge_model = true;
              }
              if (value.Fieldname == 'Risk Factor') {
                this.showColumnsListView.Risk_Factor = true;
                this.showColumnsListView.Risk_Factor_model = true;
              }
              if (value.Fieldname == 'Isolation') {
                this.showColumnsListView.Isolation = true;
                this.showColumnsListView.Isolation_model = true;
              }

              if (value.Fieldname == 'Speciality') {
                this.showColumnsListView.Speciality = true;
                this.showColumnsListView.Speciality_model = true;
              }
              if (value.Fieldname == 'Study Flag') {
                this.showColumnsListView.Study_name = true;
                this.showColumnsListView.Study_name_model = true;
              }
              if (value.Fieldname == 'Treatment diagnosis') {
                this.showColumnsListView.Treatment_diagnosis = true;
                this.showColumnsListView.Treatment_diagnosis_model = true;
              }
              if (value.Fieldname == 'VIP') {
                this.showColumnsListView.VIP = true;
                this.showColumnsListView.VIP_model = true;
              }
              if (value.Fieldname == 'Attending Doctor') {
                this.showColumnsListView.Attending_Doctor = true;
                this.showColumnsListView.Attending_Doctor_modal = true;
              }
              if (value.Fieldname == 'Case Diagnosis') {
                this.showColumnsListView.Case_Diagnosis = true;
                this.showColumnsListView.Case_Diagnosis_modal = true;
              }
            });
          }
        } else {
          this.loadData('', '');
        }
      },
      (_error: any) => { }
    );
  }

  updateColums(value, event) {
    if (event.target.checked) {
      this.postSelectedCol.push({ Variantid: '', Fieldname: value });
    } else {
      let el = this.postSelectedCol.find((itm) => {
        if (itm.Fieldname === value) {
          return value;
        }
      });

      if (el) this.postSelectedCol.splice(this.postSelectedCol.indexOf(el), 1);
    }

  }

  // config tools
  updateView(value, event) {
    if (event.target.checked) {
      if (value == 'Bed view') {
        this.showColumnsListView.DefaultView = '1';
        this.showColumnsListView.Listview_modal = false;
        this.showColumnsListView.Bedview_modal = true;
      } else {
        this.showColumnsListView.DefaultView = '2';
        this.showColumnsListView.Bedview_modal = false;
        this.showColumnsListView.Listview_modal = true;
      }
    } else {
      this.showColumnsListView.DefaultView = '';
      this.showColumnsListView.Bedview_modal = false;
      this.showColumnsListView.Listview_modal = false;
    }
  }

  commaSeparat(value: any) {
    return Array.prototype.map.call(value, function (item) { return item.Ward; }).join(",");
  }

  commaSeparatForAttendPhy(value: any) {
    return Array.prototype.map.call(value, function (item) { return item.Gpart; }).join(",");
  }

  commaSeparatForSpecialtyConf(value: any) {
    return Array.prototype.map.call(value, function (item) { return item.Orgid; }).join(",");
  }

  commaSeparatForSpecialty(value: any) {
    return Array.prototype.map.call(value, function (item) { return item.Deptou; }).join(",");
  }

  saveConfigTools() {
    let wardDetails: any = this.commaSeparat(this.wardSelectForConfig);
    let el = this.postSelectedCol.find((itm) => {
      if (itm.Fieldname.includes('SpecialtyConfig')) {
        return itm;
      }
    });
    let elPhysician = this.postSelectedCol.find((itm) => {
      if (itm.Fieldname.includes('PhysicianConfig')) {
        return itm;
      }
    });

    if (el) this.postSelectedCol.splice(this.postSelectedCol.indexOf(el), 1);
    if (elPhysician) this.postSelectedCol.splice(this.postSelectedCol.indexOf(elPhysician), 1);
    let specialtyDetails: any = this.commaSeparatForSpecialtyConf(this.specialtySelectForConfig);
    this.postSelectedCol.push({ Variantid: '', Fieldname: `SpecialtyConfig-${specialtyDetails}` });

    let attendingDetails: any = this.commaSeparatForAttendPhy(this.attendingSelectForConfig);
    this.postSelectedCol.push({ Variantid: '', Fieldname: `PhysicianConfig-${attendingDetails}` });

    let jsonObj = {
      Variantid: this.Variantid,
      Varianrname: '',
      Compid: 'IPHOSP',
      Bedlist: this.showColumnsListView.DefaultView,
      Usname: '',
      DefaultVariant: '',
      ConfigHeaderItem: this.postSelectedCol,
      Ward: wardDetails
    };

    this._EMRServices.postConfigTools(jsonObj).subscribe(
      (_success: any) => {
        //_success = JSON.parse(_success._body);

        this.showConfiguration = false;
        //this.modalService.hide();
        this.resetColFlags();
        this.getConfigTools();
      },
      (_error: any) => { }
    );
  }
  resetColFlags() {
    this.showColumnsListView.VIP = false;
    this.showColumnsListView.Treatment_diagnosis = false;
    this.showColumnsListView.Study_name = false;
    this.showColumnsListView.Speciality = false;
    this.showColumnsListView.Isolation = false;
    this.showColumnsListView.LOS = false;
    this.showColumnsListView.Risk_Factor = false;
    this.showColumnsListView.Planned_discharge = false;
    this.showColumnsListView.Last_surgery_date = false;
    this.showColumnsListView.Financial_Category = false;
    this.showColumnsListView.Emergency_Admission = false;
    this.showColumnsListView.Doctor = false;
    this.showColumnsListView.Days_since_surgery = false;
    this.showColumnsListView.Days_for_isolation = false;
    this.showColumnsListView.Case = false;
    this.showColumnsListView.Allergy = false;
    this.showColumnsListView.Admitted_At = false;
    this.showColumnsListView.Admission_diagnosis = false;
  }


  resetConfigToolsFields() {
    this.postSelectedCol = [];
    this.showColumnsListView.DefaultView = '2';
    this.showColumnsListView.Bedview_modal = false;
    this.showColumnsListView.Listview_modal = true;
    this.showColumnsListView.VIP_model = false;
    this.showColumnsListView.Treatment_diagnosis_model = false;
    this.showColumnsListView.Study_name_model = false;
    this.showColumnsListView.Speciality_model = true;
    this.postSelectedCol.push({ Variantid: '', Fieldname: "Speciality" });
    this.postSelectedCol.push({ Variantid: '', Fieldname: "PhysicianConfig" });
    this.showColumnsListView.Isolation_model = true;
    this.postSelectedCol.push({ Variantid: '', Fieldname: "Isolation" });
    this.showColumnsListView.LOS_model = false;
    this.showColumnsListView.Risk_Factor_model = true;
    this.postSelectedCol.push({ Variantid: '', Fieldname: "Risk Factor" });
    this.showColumnsListView.Planned_discharge_model = true;
    this.postSelectedCol.push({ Variantid: '', Fieldname: "Planned discharge" });
    this.showColumnsListView.Last_surgery_date_model = false;
    this.showColumnsListView.Financial_Category_model = true;
    this.postSelectedCol.push({ Variantid: '', Fieldname: "Financial Category" });
    this.showColumnsListView.Emergency_Admission_model = false;
    this.showColumnsListView.Doctor_model = false;
    this.showColumnsListView.Days_since_surgery_model = false;
    this.showColumnsListView.Days_for_isolation_model = false;
    this.showColumnsListView.Case_model = false;
    this.showColumnsListView.Allergy_model = false;
    this.showColumnsListView.Admitted_At_model = false;
    this.showColumnsListView.Admission_diagnosis_model = true;
    this.showColumnsListView.Attending_Doctor_modal = false;
    this.showColumnsListView.Attending_Doctor = false;
    this.showColumnsListView.Case_Diagnosis = false;
    this.showColumnsListView.Case_Diagnosis_modal = false;
    this.wardSelectForConfig = [];
    this.specialtySelectForConfig = [];
    this.attendingSelectForConfig = [];
    this.postSelectedCol.push({ Variantid: '', Fieldname: "Admission diagnosis" });
    // this.postSelectedCol.push({ Variantid: '5003', Fieldname: "Ward" });
    this.saveConfigTools();
  }


  get f() {
    return this.form.controls;
  }

  loadData(ward: string, specialtyData: string) {
    this.form = this.formBuilder.group({
      admittedFrom: [''],
      admittedTo: [''],
      wardNo: [''],
      patientStatus: [''],
      patientStatusCon: [''],
      specialty: [''],
      patient: ['']
    });

    this.inPatientListByFilter(ward, specialtyData, this.getConfigToolPhysicianList);
    this.getCountsByType(this.graphChartCountType);
  }

  loadDataWithAttendPhyList() {
    let admittedFrom = '';
    let admittedTo = '';
    let wardNo = '';

    if (this.f.admittedFrom.value) {
      admittedFrom = this.f.admittedFrom.value.toISOString().split('.')[0];
    }

    if (this.f.admittedTo.value) {
      admittedTo = this.f.admittedTo.value.toISOString().split('.')[0];
    }

    if (this.f.wardNo.value) {
      wardNo = this.commaSeparat(this.f.wardNo.value);
    }

    const res = this.hospitalistService.getAttendingPhySetDataSet(
      this.navTabBoxActiveValue,
      admittedFrom,
      admittedTo,
      wardNo
    );

    this.hospitalistService.attendingPhylistData$
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((data: any[]) => {
        this.inAttendPhyList = data;
        console.log(this.inAttendPhyList, "inAttendPhyList")
        this.checkFormValueOnAttendPhyList();
      });
    // this.getCountsByType(this.graphChartCountType);
  }

  getSpecialtyConfigList() {
    this.hospitalistService.getSpecialtyList().subscribe((res: any) => {
      this.specialtyListConfig = res?.d?.results;
      this.getWardList();
    })
  }

  checkFormValueOnAttendPhyList() {
    let physician: any;
    if (this.f.patientStatus.value) {
      physician = this.commaSeparatForAttendPhy(this.f.patientStatus.value);
      let attendPhy: any = physician.split(",");
      if (this.f.patientStatus) {
        const results = this.inAttendPhyList.filter(({ Gpart: id1 }) => attendPhy.some((value) => value === id1));
        let resultsCheck = this.commaSeparatForAttendPhy(results);
        if (resultsCheck) {
          this.f.patientStatus.setValue(results);
        }
      }
    }
  }

  inPatientListByFilter(ward?, specialtyData?, getConfigToolPhysicianList?) {
    if (this.notExecutedPhysicianOrder) {
      this.initialfilterData(ward, '05', specialtyData, this.getConfigToolPhysicianList);
      return
    }

    if (this.abnormalLabResult) {
      this.initialfilterData(ward, '02', specialtyData, this.getConfigToolPhysicianList);
      return;
    }

    if (this.abnormalRadFindings) {
      this.initialfilterData(ward, '03', specialtyData, this.getConfigToolPhysicianList);
      return;
    }

    if (this.missedMediDoses) {
      this.initialfilterData(ward, '04', specialtyData, this.getConfigToolPhysicianList);
      return;
    }

    if (this.home) {
      if (this.navTabBoxActiveValue != '08' && this.navTabBoxActiveValue != '09') {
        this.LDRListSet();
      }
      // this.form.patchValue({
      //   admittedFrom: '',
      // admittedTo: '',
      // patient:''
      // })
      // this.form.reset();
      this.initialfilterData(ward, '', specialtyData, this.getConfigToolPhysicianList);
      return;
    }
  }

  changeDate(event: any) {
    console.log(event)
    this.arrivalDate = event;
    this.initialfilterData('', '', '', this.getConfigToolPhysicianList);
  }

  filterData() {
    if (this.navTabBoxActiveValue == '08') {
      if (
        this.filterForm.value.Physician || this.filterForm.value.Status || this.filterForm.value.FCategory ||
        this.filterForm.value.FWard || this.filterForm.value.FSpecialty || this.filterForm.value.RoomidText || this.filterForm.value.CaseType
      ) {
        let filterValue = this.inArrivalslistListClone;
        if (this.filterForm.value.Physician?.length) {
          filterValue = filterValue.filter(item =>
            this.filterForm.value.Physician.includes(item.BehArztName?.trimStart())
          );
        }

        if (this.filterForm.value.RoomidText?.length) {
          filterValue = filterValue.filter(item =>
            this.filterForm.value.RoomidText.includes(item.Zimmkub?.trimStart())
          );
        }

        if (this.filterForm.value.CaseType?.length) {
          filterValue = filterValue.filter(item =>
            this.filterForm.value.CaseType.includes(item.Fatyptxt)
          );
        }

        if (this.filterForm.value.FWard?.length) {
          filterValue = filterValue.filter(item =>
            this.filterForm.value.FWard.includes(item.Orgpfkb)
          );
        }

        if (this.filterForm.value.FSpecialty?.length) {
          filterValue = filterValue.filter(item =>
            this.filterForm.value.FSpecialty.includes(item.Orgfakb)
          );
        }

        if (this.filterForm.value.FCategory?.length) {
          filterValue = filterValue.filter(item =>
            this.filterForm.value.FCategory.includes(item.ZzfinCat)
          );
        }

        this.inArrivalslistList = filterValue;
      } else {
        this.inArrivalslistList = this.inArrivalslistListClone;
      }
    } else {
      if (
        this.filterForm.value.Physician || this.filterForm.value.Status || this.filterForm.value.FCategory || this.filterForm.value.FinCate || this.filterForm.value.PerformaceUnit ||
        this.filterForm.value.FWard || this.filterForm.value.FSpecialty || this.filterForm.value.RoomidText || this.filterForm.value.CaseType
      ) {
        let filterValue = this.inSurgeryWorklistClone;
        if (this.filterForm.value.Physician?.length) {
          filterValue = filterValue.filter(item =>
            this.filterForm.value.Physician.includes(item?.BehArztName?.trimStart())
          );
        }

        if (this.filterForm.value.FWard?.length) {
          filterValue = filterValue.filter(item =>
            this.filterForm.value.FWard.includes(item.Anpoe?.trimStart())
          );
        }

        if (this.filterForm.value.FSpecialty?.length) {
          filterValue = filterValue.filter(item =>
            this.filterForm.value.FSpecialty.includes(item.Anfoe)
          );
        }

        if (this.filterForm.value.PerformaceUnit?.length) {
          filterValue = filterValue.filter(item =>
            this.filterForm.value.PerformaceUnit.includes(item.Planoe)
          );
        }

        if (this.filterForm.value.FCategory?.length) {
          filterValue = filterValue.filter(item =>
            this.filterForm.value.FCategory.includes(item.ZzfinCat)
          );
        }

        this.inSurgeryWorklist = filterValue;
      } else {
        this.inSurgeryWorklist = this.inSurgeryWorklistClone;
      }

    }

  }

  // Build the Gender and Room/Bed dropdown options from the complete loaded list.
  buildInPatientFilterOptions() {
    const pushIfValid = (acc: string[], val: any) => {
      const value = val?.toString().trim();
      if (value && !acc.includes(value)) {
        acc.push(value);
      }
      return acc;
    };
    this.genderFilterOptions = (this.inHospitalistListClone || []).reduce(
      (acc: string[], cur) => pushIfValid(acc, cur?.PatientGender), []
    );
    this.roomFilterOptions = (this.inHospitalistListClone || []).reduce(
      (acc: string[], cur) => pushIfValid(acc, cur?.RoomidText), []
    );
  }

  // Extract the leading integer from an age value (e.g. "45", "45 Y").
  parsePatientAge(value: any): number | null {
    if (value === null || value === undefined) {
      return null;
    }
    const match = /\d+/.exec(value.toString());
    return match ? parseInt(match[0], 10) : null;
  }

  // Convert a time value to minutes-of-day. Accepts the SAP duration format
  // returned by the API (e.g. "PT11H29M30S") and the HH:MM format from the inputs.
  parseTimeToMinutes(value: any): number | null {
    if (!value) {
      return null;
    }
    const str = value.toString().trim();
    const sap = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/i.exec(str);
    if (sap && (sap[1] || sap[2] || sap[3])) {
      const hours = parseInt(sap[1] || '0', 10);
      const minutes = parseInt(sap[2] || '0', 10);
      return hours * 60 + minutes;
    }
    const hm = /^(\d{1,2}):(\d{2})/.exec(str);
    if (hm) {
      return parseInt(hm[1], 10) * 60 + parseInt(hm[2], 10);
    }
    return null;
  }

  // Apply the frontend-only filters (age, gender, room, admission time) to the
  // complete loaded list. Fields are combined with AND; multi-selects use OR.
  applyInPatientFilters() {
    if (!this.inHospitalistListClone) {
      return;
    }
    const value = this.filterForm.value;
    this.ageRangeError = '';

    const hasValue = (v: any) => v !== '' && v !== null && v !== undefined;
    const ageFrom = hasValue(value.PatientAgeFrom) ? Number(value.PatientAgeFrom) : null;
    const ageTo = hasValue(value.PatientAgeTo) ? Number(value.PatientAgeTo) : null;

    if (ageFrom !== null && (isNaN(ageFrom) || ageFrom < 0)) {
      this.ageRangeError = 'Enter a valid minimum age';
      return;
    }
    if (ageTo !== null && (isNaN(ageTo) || ageTo < 0)) {
      this.ageRangeError = 'Enter a valid maximum age';
      return;
    }
    if (ageFrom !== null && ageTo !== null && ageFrom > ageTo) {
      this.ageRangeError = 'Minimum age cannot be greater than maximum age';
      return;
    }

    const genders: string[] = value.PatientGender || [];
    const rooms: string[] = value.RoomidText || [];
    const timeFrom = this.parseTimeToMinutes(value.AdmissionTimeFrom);
    const timeTo = this.parseTimeToMinutes(value.AdmissionTimeTo);

    let result = [...this.inHospitalistListClone];

    if (ageFrom !== null) {
      result = result.filter(item => {
        const age = this.parsePatientAge(item?.PatientAge);
        return age !== null && age >= ageFrom;
      });
    }
    if (ageTo !== null) {
      result = result.filter(item => {
        const age = this.parsePatientAge(item?.PatientAge);
        return age !== null && age <= ageTo;
      });
    }
    if (genders.length) {
      result = result.filter(item =>
        genders.includes(item?.PatientGender?.toString().trim())
      );
    }
    if (rooms.length) {
      result = result.filter(item =>
        rooms.includes(item?.RoomidText?.toString().trim())
      );
    }
    if (timeFrom !== null) {
      result = result.filter(item => {
        const time = this.parseTimeToMinutes(item?.AdmissionTime);
        return time !== null && time >= timeFrom;
      });
    }
    if (timeTo !== null) {
      result = result.filter(item => {
        const time = this.parseTimeToMinutes(item?.AdmissionTime);
        return time !== null && time <= timeTo;
      });
    }

    this.inHospitalistList = result;
  }

  // Clear only the new filter fields without touching the loaded list. Used when
  // switching the main patient tab.
  clearInPatientFilterFields() {
    if (!this.filterForm) {
      return;
    }
    this.ageRangeError = '';
    this.filterForm.patchValue({
      PatientAgeFrom: '',
      PatientAgeTo: '',
      PatientGender: '',
      RoomidText: '',
      AdmissionTimeFrom: '',
      AdmissionTimeTo: '',
    });
  }

  // Reset behavior: clear the new fields and restore the original loaded list.
  resetInPatientFilters() {
    this.clearInPatientFilterFields();
    this.inHospitalistList = [...(this.inHospitalistListClone || [])];
  }

  getCheckInStatusFilterData: any;
  getCaseTypeFilterData: any;
  getCheckInRoomidTextFilterData: any;
  getCheckInFinancialFilterData: any;
  getCheckInWardFilterData: any;
  getCheckInSpecialtyFilterData: any;
  getPerformanceUnitFilterData: any;
  getFinancialCateFilterData: any;
  initialfilterData(ward?, type?, specialtyData?, getConfigToolPhysicianList?) {
    this.searchString = '';
    let admittedFrom = '';
    let admittedTo = '';
    let wardNo = '';
    let physician = '';
    let speciality = '';

    if (ward) {
      wardNo = ward;
    }
    if (getConfigToolPhysicianList) {
      physician = getConfigToolPhysicianList;
    }

    if (this.f.admittedFrom.value) {
      admittedFrom = this.f.admittedFrom.value.toISOString().split('.')[0];
    }

    if (this.f.admittedTo.value) {
      admittedTo = this.f.admittedTo.value.toISOString().split('.')[0];
    }

    if (this.f.wardNo.value) {
      wardNo = this.commaSeparat(this.f.wardNo.value);
    }

    if (this.f.patientStatus.value) {
      physician = this.commaSeparatForAttendPhy(this.f.patientStatus.value);
    }

    if (this.f.specialty.value) {
      speciality = this.commaSeparatForSpecialty(this.f.specialty.value);
    }
    if (specialtyData) {
      speciality = specialtyData;
    }

    if (this.navTabBoxActiveValue == '08') {
      let dateFormate = `${new DatePipe('en-US').transform(this.arrivalDate, 'yyyy-MM-dd')}T00:00:00`;
      this.hospitalistService.getArrivalListSetAPI('1', '', dateFormate)
        .subscribe((data: any) => {
          console.log(data, "data")
          this.inArrivalslistListClone = [...data?.d?.results];
          this.inArrivalslistList = data?.d?.results;
          const pushIfValid = (acc: string[], val: any) => {
            const value = val?.toString().trim();
            if (value && !acc.includes(value)) {
              acc.push(value);
            }
            return acc;
          };

          this.getCaseTypeFilterData = this.inArrivalslistList.reduce(
            (acc: string[], cur) => pushIfValid(acc, cur?.Fatyptxt), []
          );

          this.getCheckInRoomidTextFilterData = this.inArrivalslistList.reduce(
            (acc: string[], cur) => pushIfValid(acc, cur?.Zimmkub), []
          );

          this.getCheckInFinancialFilterData = this.inArrivalslistList.reduce(
            (acc: string[], cur) => pushIfValid(acc, cur?.ZzfinCat), []
          );

          this.getCheckInWardFilterData = this.inArrivalslistList.reduce(
            (acc: string[], cur) => pushIfValid(acc, cur?.Orgpfkb), []
          );

          this.attendingPhysicianList = this.inArrivalslistList.reduce(
            (acc: string[], cur) => pushIfValid(acc, cur?.BehArztName), []
          );

          this.getCheckInSpecialtyFilterData = this.inArrivalslistList.reduce(
            (acc: string[], cur) => pushIfValid(acc, cur?.Orgfakb), []
          );

        })
    } else if (this.navTabBoxActiveValue == '09') {
      let speciality = 'CATTUAMC,6FL-OROU,ENDTUAMC,F9GOTAMC';
      this.hospitalistService.getSurgeryWorkListSetAPI(speciality)
        .subscribe((data: any) => {
          this.inSurgeryWorklistClone = [...data?.d?.results];
          this.inSurgeryWorklist = data?.d?.results;

          const pushIfValid = (acc: string[], val: any) => {
            const value = val?.toString().trim();
            if (value && !acc.includes(value)) {
              acc.push(value);
            }
            return acc;
          };

          this.getCheckInWardFilterData = this.inSurgeryWorklist.reduce(
            (acc: string[], cur) => pushIfValid(acc, cur?.Anpoe), []
          );

          this.attendingPhysicianList = this.inSurgeryWorklist.reduce(
            (acc: string[], cur) => pushIfValid(acc, cur?.Nnams), []
          );

          this.getCheckInSpecialtyFilterData = this.inSurgeryWorklist.reduce(
            (acc: string[], cur) => pushIfValid(acc, cur?.Anfoe), []
          );

          this.getPerformanceUnitFilterData = this.inSurgeryWorklist.reduce(
            (acc: string[], cur) => pushIfValid(acc, cur?.Planoe), []
          );

          this.getFinancialCateFilterData = this.inSurgeryWorklist.reduce(
            (acc: string[], cur) => pushIfValid(acc, cur?.ZzfinCat), []
          );
        })
    } else {
      this.hospitalistService.getIpListSetAPI(this.navTabBoxActiveValue, admittedFrom, admittedTo, wardNo, physician, speciality, type)
        .subscribe((data: any) => {
          this.showFilter = false;
          if (this.navTabBoxActiveValue == '06') {
            this.inHospitalistList = data?.d.results;
          } else {
            this.dataOnTableForLabPatients = data?.d.results[0].ToLabList.results;
            this.radPatientList = data?.d.results[0]?.ToRadList?.results;
            this.inHospitalistList = data?.d.results[0].ToIPList.results;
            this.getSpecialtyData = data?.d.results[0].ToDept.results;
            this.inAttendPhyList = data?.d.results[0].ToPhysician.results;
            this.missedMedPatientList = data?.d.results[0]?.ToMedList?.results;
            this.physicianOrderPatientList = data?.d.results[0]?.ToPordList?.results;

            if (specialtyData) {
              this.specialtyArraySplit = speciality;
              this.specialtySelectForConfig = [];

              this.specialtyListConfig.filter((element) => {
                if (this.specialtyArraySplit.includes(element.Orgid)) {
                  this.specialtySelectForConfig.push(element);
                }
              });
              if (this.specialtySelectForConfig.length) {
                let arraySpec = [];
                this.specialtySelectForConfig.forEach((value) => {
                  if (this.getSpecialtyData.some(f => f.Deptou == value.Orgid))
                    arraySpec.push({
                      Deptou: value.Orgid,
                      DeptouDesc: value.Orgna
                    });
                });

                this.form.patchValue({
                  specialty: arraySpec
                })

              }
            }

            if (getConfigToolPhysicianList) {
              this.physicianArraySplit = physician;
              this.attendingSelectForConfig = [];

              this.inAttendPhyList.filter((element) => {
                if (this.physicianArraySplit.includes(element.Gpart)) {
                  this.attendingSelectForConfig.push(element);
                }
              });
              if (this.attendingSelectForConfig.length) {
                let arraySpec = [];
                this.attendingSelectForConfig.forEach((value) => {
                  if (this.inAttendPhyList.some(f => f.Gpart == value.Gpart))
                    arraySpec.push({
                      Gpart: value.Gpart,
                      Name: value.Name
                    });
                });
                this.form.patchValue({
                  patientStatus: arraySpec
                })
              }
            }
          }
          // Keep the complete loaded list as the source for client-side filters,
          // refresh the gender/room option lists, and re-apply any active filters.
          this.inHospitalistListClone = [...(this.inHospitalistList || [])];
          this.buildInPatientFilterOptions();
          this.applyInPatientFilters();
        });
    }


    // this.hospitalistService.getInHospitalistData$
    //   .pipe(
    //     untilDestroyed(this),
    //     catchError((err) => {
    //       return of([]);
    //     })
    //   )
    //   .subscribe((data: any[]) => {
    //     this.showFilter = false;
    //     if(this.navTabBoxActiveValue == '06') {
    //       this.inHospitalistList = data;
    //     } else {
    //       this.dataOnTableForLabPatients = data[0].ToLabList.results;
    //       this.radPatientList = data[0]?.ToRadList?.results;
    //       this.inHospitalistList = data[0].ToIPList.results;
    //       this.getSpecialtyData = data[0].ToDept.results;
    //       this.inAttendPhyList = data[0].ToPhysician.results;
    //       this.missedMedPatientList = data[0]?.ToMedList?.results;
    //       this.physicianOrderPatientList = data[0]?.ToPordList?.results;

    //       if(specialtyData) {
    //         this.specialtyArraySplit = speciality;
    //         this.specialtySelectForConfig = [];
    //         this.getSpecialtyData.filter((element) => {
    //           if (this.specialtyArraySplit.includes(element.Deptou)) {
    //             this.specialtySelectForConfig.push(element);
    //           }
    //         });
    //         if (this.specialtySelectForConfig.length) this.form.patchValue({
    //           specialty: this.specialtySelectForConfig
    //         })
    //       }
    //     }
    //   });
    this.countOfNavModules(wardNo);
  }

  getArrivalAPI() {
    let dateFormate = `${new DatePipe('en-US').transform(this.arrivalDate, 'yyyy-MM-dd')}T00:00:00`;
    this.hospitalistService.getArrivalListSetAPI('1', '', dateFormate)
      .subscribe((data: any) => {
        console.log(data, "data")
        this.inArrivalslistListClone = [...data?.d?.results];
        this.inArrivalslistList = data?.d?.results;
    })
  }

  getSurgeryList() {
      let speciality = 'CATTUAMC,6FL-OROU,ENDTUAMC,F9GOTAMC'
      this.hospitalistService.getSurgeryWorkListSetAPI(speciality)
      .subscribe((data: any) => {
        this.inSurgeryWorklistClone = [...data?.d?.results];
        this.inSurgeryWorklist = data?.d?.results;
      })
  }
  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }
  phyOrderFilter(ward) {
    let wardNo = ''

    if (ward) {
      wardNo = ward;
    }

    if (this.f.wardNo.value) {
      wardNo = this.commaSeparat(this.f.wardNo.value);
    }
    this.initialPatientList('Not_Executed_Physician_Order', wardNo);
  }

  redirectToeKardex(data) {
    localStorage.setItem('admit_process', JSON.stringify(false));
    if (!this.consultationsOrders && (this.navTabBoxActiveValue == '02' || this.navTabBoxActiveValue == '03' || this.navTabBoxActiveValue == '08' || this.navTabBoxActiveValue == '09')) {
      this.openModuleAdmissionProcess(data, 'admit-process')
      this.patientService.isAdmitProcessSection = true;
      localStorage.setItem('admit_process', JSON.stringify(true));
    } else if (this.navTabBoxActiveValue == '04' || this.navTabBoxActiveValue == '05') {
      this.openModuleAdmissionProcess(data, 'discharge-process')
    } else {
      window.open(
        'e-kardex?patnr=' +
        data.Mrn +
        '&falnr=' +
        data.CaseNumber
        +
        '&einri=' +
        data.Institute +
        '&lfdnr=' + data.Lfdnr,
        '_blank'
      );
    }
  }

  LDRBirthUnitgetList() {
    this.ePrescriptionService.loadData(`eHospitalist/LDRBirthUnitget?Einri=${this.ePrescriptionService.parameters.einri}&Falnr=${this.ePrescriptionService.parameters.falnr}&Lfdbw=${this.ePrescriptionService.parameters.lfdnr}`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        this.inHospitalist = resp.body.d.results;
      }
    });
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
        this.showFilter = false;
        //this.form.reset();
      }
    });
  }

  openModuleAdmissionProcess(data, tabName) {
    let admittedFrom = '';
    let admittedTo = '';
    let wardNo = '';
    let physician = '';
    let speciality = '';

    if (this.f.admittedFrom.value) {
      admittedFrom = this.f.admittedFrom.value.toISOString().split('.')[0];
    }

    if (this.f.admittedTo.value) {
      admittedTo = this.f.admittedTo.value.toISOString().split('.')[0];
    }

    if (this.f.wardNo.value) {
      wardNo = this.commaSeparat(this.f.wardNo.value);
    } else {
      wardNo = this.getWardDataFromApi;
    }

    if (this.f.patientStatus.value) {
      physician = this.commaSeparatForAttendPhy(this.f.patientStatus.value);
    }

    if (this.f.specialty.value) {
      speciality = this.commaSeparatForSpecialty(this.f.specialty.value);
    }

    if (this.home) {
      if (this.navTabBoxActiveValue == '08' || this.navTabBoxActiveValue == '09') this.windowRedirect(tabName, data.Patnr, data.Falnr, data.Einri, data.Lfdnr, admittedFrom, admittedTo, wardNo, physician, speciality, data.Deptou)
      this.windowRedirect(tabName, data.Mrn, data.CaseNumber, data.Institute, data.Lfdnr, admittedFrom, admittedTo, wardNo, physician, speciality, data.Deptou)
    } else if (this.abnormalLabResult) {
      this.windowRedirect(tabName, data.Patnr, data.Falnr, data.Einri, data.Lfdnr, admittedFrom, admittedTo, wardNo, physician, speciality, data.Deptou)
    } else if (this.abnormalRadFindings) {
      this.windowRedirect(tabName, data.Patnr, data.Falnr, data.Einri, data.Lfdnr, admittedFrom, admittedTo, wardNo, physician, speciality, data.Deptou)
    } else if (this.notExecutedPhysicianOrder) {
      this.windowRedirect(tabName, data.Patnr, data.Falnr, data.Einri, data.Lfdnr, admittedFrom, admittedTo, wardNo, physician, speciality, data.Deptou)
    } else if (this.missedMediDoses) {
      this.windowRedirect(tabName, data.Patnr, data.Falnr, data.Einri, data.Lfdnr, admittedFrom, admittedTo, wardNo, physician, speciality, data.Deptou)
    }

  }

  windowRedirect(tabName, patnr, falnr, einri, ifdnr, admittedFrom, admittedTo, wardNo, physician, speciality, Deptou) {
    const queryParams = new URLSearchParams();
    queryParams.set('patnr', this.normalizeId(patnr, 10));
    queryParams.set('falnr', this.normalizeId(falnr, 10));
    queryParams.set('einri', this.normalizeId(einri));
    queryParams.set('lfdnr', this.normalizeId(ifdnr));
    queryParams.set('admittedFrom', admittedFrom ?? '');
    queryParams.set('admittedTo', admittedTo ?? '');
    queryParams.set('wardNo', wardNo ?? '');
    queryParams.set('physician', physician ?? '');
    queryParams.set('speciality', speciality ?? '');
    queryParams.set('Deptou', Deptou ?? '');
    queryParams.set('activeValue', this.navTabBoxActiveValue ?? '');

    window.open(
      tabName + '?' + queryParams.toString(),
      '_blank'
    );
  }

  private normalizeId(value: any, length?: number): string {
    const normalized = (value ?? '').toString().trim();
    return normalized && length ? normalized.padStart(length, '0') : normalized;
  }

  getCountsByType(type: any) {
    this.graphChartCountType = type;
    const res = this.hospitalistService.getIplistDataCountSet(type);
    this.hospitalistService.inHospitalistDataCount$.pipe(untilDestroyed(this), catchError((err) => { return of([]); })).subscribe((data: any[]) => {
      this.hospitalCountData = data[0];
    });

  }

  clearFilter() {
    this.form.reset();
    this.searchString = '';
    if (this.getConfigToolWardList) {
      this.arraySplit = this.getConfigToolWardList.split(',');
      this.wardSelectForConfig = [];
      this.getWards.filter((element) => {
        if (this.arraySplit.includes(element.Ward)) {
          this.wardSelectForConfig.push(element);
        }
      });
      if (this.wardSelectForConfig.length) this.form.patchValue({
        wardNo: this.wardSelectForConfig
      })
    }
  }

  navModule(value) {
    this.clearFilter();
    if (value == 'home') {
      this.selectTab = '';
      this.home = true;
      this.ipConsultation = false;
      this.abnormalLabResult = false;
      this.abnormalRadFindings = false;
      this.missedMediDoses = false;
      this.notExecutedPhysicianOrder = false;
      this.consultationsOrders = false;
      this.notReleasedDoc = false;
      this.inPatientListByFilter(this.getConfigToolWardList, this.getConfigToolSpecialtyList, this.getConfigToolPhysicianList);
      // this.initialPatientList(value);
      // this.getConfigTools();
      this.form.controls['admittedFrom'].enable();
      this.form.controls['admittedTo'].enable();
      // this.showModuleName = this.convertModuleName(value);
    }
    if (value == 'Abnormal_Lab_Results') {
      this.selectTab = '- Abnormal/Pending Lab Results';
      this.abnormalLabResult = true;
      this.ipConsultation = false;
      this.home = false;
      this.abnormalRadFindings = false;
      this.missedMediDoses = false;
      this.notExecutedPhysicianOrder = false;
      this.consultationsOrders = false;
      this.notReleasedDoc = false;
      this.initialfilterData(this.getConfigToolWardList, '02', this.getConfigToolSpecialtyList, this.getConfigToolPhysicianList);
      // this.initialPatientList(value);
      // this.getConfigTools();
      this.form.controls['admittedFrom'].enable();
      this.form.controls['admittedTo'].enable();
      // this.showModuleName = this.convertModuleName(value);
    }
    if (value == 'Abnormal_Rad_Findings') {
      this.selectTab = '- Abnormal/Pending Rad Findings';
      this.abnormalRadFindings = true;
      this.home = false;
      this.ipConsultation = false;
      this.abnormalLabResult = false;
      this.missedMediDoses = false;
      this.notExecutedPhysicianOrder = false;
      this.consultationsOrders = false;
      this.notReleasedDoc = false;
      // this.initialPatientList(value);
      this.initialfilterData(this.getConfigToolWardList, '03', this.getConfigToolSpecialtyList, this.getConfigToolPhysicianList);
      // this.getConfigTools();
      this.form.controls['admittedFrom'].enable();
      this.form.controls['admittedTo'].enable();
      // this.showModuleName = this.convertModuleName(value);
    }
    if (value == 'Missed_Medications_Doses') {
      this.missedMedicationService.missedMedicationList.medicationData = [];
      this.selectTab = '- Missed/Not Administered Doses';
      this.missedMediDoses = true;
      this.home = false;
      this.ipConsultation = false;
      this.abnormalLabResult = false;
      this.abnormalRadFindings = false;
      this.missedMediDoses = true;
      this.notExecutedPhysicianOrder = false;
      this.consultationsOrders = false;
      this.notReleasedDoc = false;
      // this.initialPatientList(value);
      this.initialfilterData(this.getConfigToolWardList, '04', this.getConfigToolSpecialtyList, this.getConfigToolPhysicianList);
      // this.getConfigTools('Missed_Medications_Doses');
      this.form.controls['admittedFrom'].enable();
      this.form.controls['admittedTo'].enable();
      // this.showModuleName = "Missed/Not Administered Doses";
    }
    if (value == 'Not_Released_Documents') {
      this.selectTab = '';
      this.notReleasedDoc = true;
      this.notExecutedPhysicianOrder = false;
      this.consultationsOrders = false;
      this.home = false;
      this.ipConsultation = false;
      this.abnormalLabResult = false;
      this.abnormalRadFindings = false;
      this.missedMediDoses = false;
      // this.initialPatientList(value);
      // this.getConfigTools();
      this.form.controls['admittedFrom'].disable();
      this.form.controls['admittedTo'].disable();
      // this.showModuleName = this.convertModuleName(value);

    }
    if (value == 'Not_Executed_Physician_Order') {
      this.selectTab = '- Not Executed Physician Order';
      this.notExecutedPhysicianOrder = true;
       this.consultationsOrders = false;
      this.home = false;
      this.ipConsultation = false;
      this.abnormalLabResult = false;
      this.abnormalRadFindings = false;
      this.missedMediDoses = false;
      this.notReleasedDoc = false;
      this.initialfilterData(this.getConfigToolWardList, '05', this.getConfigToolSpecialtyList, this.getConfigToolPhysicianList);
      //this.initialPatientList(value, this.getConfigToolWardList);
      // this.getConfigTools('Not_Executed_Physician_Order');
      // this.form.controls['admittedFrom'].disable();
      // this.form.controls['admittedTo'].disable();
      // this.showModuleName = this.convertModuleName(value);

    }
    if (value == 'Consultations_Orders') {
      this.selectTab = '- Consultations Orders';
      this.notExecutedPhysicianOrder = false;
      this.consultationsOrders = true;
      this.home = false;
      this.ipConsultation = false;
      this.abnormalLabResult = false;
      this.abnormalRadFindings = false;
      this.missedMediDoses = false;
      this.notReleasedDoc = false;
      this.initialPatientConList();
    }
  }

  initialPatientConList() {
    let jsonObj = {};
         if (this.f.admittedFrom.value || this.f.admittedTo.value) {
          jsonObj = {
            AdmDateFrom: this.sharedService.getDateRangeFormat(this.f.admittedFrom.value),
            AdmDateTo: this.sharedService.getDateRangeFormat(this.f.admittedTo.value),
            Floor: this.f.wardNo.value,
            Patientstatus: this.f.patientStatus.value,
            module: 'My_IP_consultations',
          };
        } else {
          jsonObj = {
            Floor: this.f.wardNo.value,
            Patientstatus: this.f.patientStatus.value,
            module: 'My_IP_consultations',
          };
        }
       this._EMRServices.getInPatientList(jsonObj).subscribe(
         (_success: any) => {
           if(_success){
            this.consultationsOrdersList =  _success.result.d.results
           }
         },
         (_error: any) => { }
       );
     }

  initialPatientList(selectedModule, floor) {
    let jsonObj = {
      Floor: floor,
      Patientstatus: '',
      module: selectedModule,
      Typ: this.navTabBoxActiveValue
    };

    this.hospitalistService.getInPatientList(jsonObj).subscribe(
      (_success: any) => {
        if (_success.module == "Not_Executed_Physician_Order") {
          this.showFilter = false;
          this.dataOnTableForPhyOrder = _success.result?.d?.results
        }
      })
  }

  realoadTable(event) {
    if (event == 'Not_Executed_Physician_Order') {
      this.countOfNavModules();
      this.initialfilterData(this.getConfigToolWardList, '05', this.getConfigToolPhysicianList);
    }

    if (event === 'physicianOrder') {
      this.initialfilterData(this.getConfigToolWardList, '05', this.getConfigToolPhysicianList);
    }

    if (event === 'pdfTable') {
      this.initialfilterData(this.getConfigToolWardList, '02', this.getConfigToolPhysicianList);
    }

    if (event === 'radTable') {
      this.initialfilterData(this.getConfigToolWardList, '03', this.getConfigToolPhysicianList);
    }

    this.initialPatientConList()
  }

  reloadTable(event) {
    if (event == 'pdfTable') {
      this.initialfilterData(this.getConfigToolWardList, '02', this.getConfigToolPhysicianList);
    }

    if (event == 'radTable') {
      this.initialfilterData(this.getConfigToolWardList, '03', this.getConfigToolPhysicianList);
    }

    if (event == 'radTable') {
      this.initialfilterData(this.getConfigToolWardList, '04', this.getConfigToolPhysicianList);
    }
  }
  inPatientLDRListByFilter() {
    this.LDRListSet(this.form.controls.admittedFrom.value, this.form.controls.admittedTo.value, this.form.controls.patient.value);
  }
  consultationsOrdersListByFilter(){
    this.initialPatientConList();
  }
  parsePayloadFormateTime(data: string) {
    if (data && data.length) {
      let hours = data.substring(2, 4);
      let minute = data.substring(5, 7);

      return `${hours}:${minute}`;
    }
  }
  exportToExcel(nameofFile: string = 'e-hospitalist', fileExtention: string = 'xlsx'): void {
    if (this.navTabBoxActiveValue != "05" && this.navTabBoxActiveValue != "07" && this.navTabBoxActiveValue != "06") {
      this.homeExcel(nameofFile, fileExtention);
    } else if (this.navTabBoxActiveValue == '05') {
      this.discharges(nameofFile, fileExtention);
    } else if (this.navTabBoxActiveValue == '06') {
      this.releasedDoc(nameofFile, fileExtention);
    } else if (this.navTabBoxActiveValue == '07') {
      this.LDR(nameofFile, fileExtention);
    }
  }

  discharges(nameofFile, fileExtention) {
    const eventArray = this.inHospitalistList;
    const mappedEvents = eventArray.map(event => ({
      AdmissionDate: this.convertTimestampToDate(event.AdmissionDate),
      AdmissionTime: this.parsePayloadFormateTime(event.AdmissionTime),
      DischargeDate: this.convertTimestampToDate(event.DischargeDate),
      Mrn: event.Mrn,
      Patname: event.Patname,
      Floor: event.Floor,
      RoomidText: event.RoomidText,
      AttendingDoctorName: event.AttendingDoctorName,
      DeptouDesc: event.DeptouDesc,
      FinancialCategory: event.FinancialCategory,
      IsolationType: event.IsolationType,
      AdmissionDays: event.AdmissionDays,
      DaysIc: event.DaysIc,
      CaseNumber: event.CaseNumber,
      VipIcon: event.VipIcon,
      EmergencyAdmInd: event.EmergencyAdmInd,
      SurgeryLastDate: this.convertTimestampToDate(event.SurgeryLastDate),
      SurgeryLastDays: event.SurgeryLastDays,
      StudyFlag: event.StudyFlag,
      DiagnosisTreatment: event.DiagnosisTreatment
      // Admdatetime: this.convertTimestampToDateTime(event.Admdatetime),
      // DischargeDate: this.convertTimestampToDateTime(event.DischargeDate),
    }));
    let Heading = [['Admitted on', 'Admitted at', 'Discharged On', 'MRN', 'Patient', 'Ward', 'Room/Bed', 'Attending Doctor', 'Speciality', 'Financial Category', 'Isolation', 'LOS', 'Days for Isolation', 'Case', 'VIP', 'Emergency admission', 'Last surgery Date', 'Days since surgery', 'Study name', 'Treatment Diagnosis']];
    const workbook = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws, Heading);
    XLSX.utils.sheet_add_json(ws, mappedEvents, { origin: 'A2', skipHeader: true });
    XLSX.utils.book_append_sheet(workbook, ws, "test");
    XLSX.writeFile(workbook, `${nameofFile}.${fileExtention}`);
  }
  releasedDoc(nameofFile, fileExtention) {
    const eventArray = this.inHospitalistList;
    const mappedEvents = eventArray.map((event: any) => ({
      Bwidt: this.convertTimestampToDate(event.Bwidt),
      Bwizt: this.convertTimestampToDate(event.Bwizt),
      StatusName: event.StatusName,
      Patnr: event.Patnr,
      PatnrName: event.PatnrName,
      RoomidName: event.RoomidName,
      PernrName: event.PernrName,
      DeptouName: event.DeptouName,
      KostrName: event.KostrName,
      Falnr: event.Falnr,
      Diagnosis: event.Diagnosis,
      RiskInformation: event.RiskInformation,
      Allergies: event.Allergies,
      IsolationType: event.IsolationType,
    }));
    let Heading = [['Date', 'Time', 'Visit status', 'MRN', 'Patient', 'Room', 'Attending Doctor', 'Financial Category', 'Case', 'Case Diagnosis', 'Risk Factory', 'Allergy', 'Isolation']];
    const workbook = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws, Heading);
    XLSX.utils.sheet_add_json(ws, mappedEvents, { origin: 'A2', skipHeader: true });
    XLSX.utils.book_append_sheet(workbook, ws, "test");
    XLSX.writeFile(workbook, `${nameofFile}.${fileExtention}`);
  }
  LDR(nameofFile, fileExtention) {
    const eventArray = this.inHospitalist;
    const mappedEvents = eventArray.map(event => ({
      Datum: this.convertTimestampToDate(event.Datum),
      Zeit: event.Zeit,
      Besstattext: event.Besstattext,
      Patnr: event.Patnr,
      Patient: event.Patient,
      BehraumKb: event.BehraumKb,
      Behpersname: event.Behpersname,
      ZzfinCat: event.ZzfinCat,
      RiskInformation: event.RiskInformation,
      Allergies: event.Allergies,
      IsolationInd: event.IsolationInd,
    }));
    let Heading = [['Date', 'Time', 'Visit status', 'MRN', 'Patient Name', 'Room', 'Attending Doctor', 'Financial Category', 'Risk Factory', 'Allergy', 'Isolation']];
    const workbook = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws, Heading);
    XLSX.utils.sheet_add_json(ws, mappedEvents, { origin: 'A2', skipHeader: true });
    XLSX.utils.book_append_sheet(workbook, ws, "test");
    XLSX.writeFile(workbook, `${nameofFile}.${fileExtention}`);
  }

  homeExcel(nameofFile, fileExtention) {
    const eventArray = this.inHospitalistList;
    const mappedEvents = eventArray.map(event => ({
      AdmissionDate: this.convertTimestampToDate(event.AdmissionDate),
      AdmissionTime: this.parsePayloadFormateTime(event.AdmissionTime),
      Mrn: event.Mrn,
      Patname: event.Patname,
      Floor: event.Floor,
      RoomidText: event.RoomidText,
      AttendingDoctorName: event.AttendingDoctorName,
      DeptouDesc: event.DeptouDesc,
      IsolationInd: event.IsolationInd,
      Allergies: event.Allergies,
      RiskInformation: event.RiskInformation,
      Diagnosis: event.Diagnosis,
      FinancialCategory: event.FinancialCategory,
      PatientstatusPlandischarg: event.PatientstatusPlandischarg,
      AdmissionDays: event.AdmissionDays,
      DaysIc: event.DaysIc,
      CaseNumber: event.CaseNumber,
      VipIcon: event.VipIcon,
      EmergencyAdmInd: event.EmergencyAdmInd,
      SurgeryLastDate: this.convertTimestampToDate(event.SurgeryLastDate),
      SurgeryLastDays: event.SurgeryLastDays,
      StudyFlag: event.StudyFlag,
      DiagnosisTreatment: event.DiagnosisTreatment,
      // Admdatetime: this.convertTimestampToDateTime(event.Admdatetime),
      // DischargeDate: this.convertTimestampToDateTime(event.DischargeDate),
    }));
    let Heading = [['Admitted on', 'Admitted at', 'MRN', 'Patient', 'Ward', 'Room/Bed', 'Attending Doctor', 'Speciality', 'Allergy', 'Risk Factor', 'Admission Diagnosis', 'Financial Category', 'Planned Discharge', 'Isolation', 'LOS', 'Days for Isolation', 'Case', 'VIP', 'Emergency admission', 'Last surgery Date', 'Days since surgery', 'Study name', 'Treatment Diagnosis']];
    const workbook = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws, Heading);
    XLSX.utils.sheet_add_json(ws, mappedEvents, { origin: 'A2', skipHeader: true });
    XLSX.utils.book_append_sheet(workbook, ws, "test");
    XLSX.writeFile(workbook, `${nameofFile}.${fileExtention}`);
  }
  convertTimestampToDate(timestamp: any): string {
    if (typeof timestamp === 'string' && timestamp.startsWith('/Date(') && timestamp.endsWith(')/')) {
      const milliseconds = parseInt(timestamp.substring(6, timestamp.length - 2), 10);
      const date = new Date(milliseconds);
      return this.datePipe.transform(date, 'dd.MM.y');
    } else {
      return timestamp; // Return the original value if it's not in the expected format
    }
  }
  convertTimestampToDateTime(timestamp: any): { date: string, time: string } {
    if (typeof timestamp === 'string') {
      // Check if the timestamp is in ISO 8601 duration format
      if (timestamp.startsWith('PT') && timestamp.endsWith('S')) {
        const duration = timestamp.substring(2, timestamp.length - 1); // Remove 'PT' and 'S'
        const durationParts = duration.split(/[HMS]/); // Split by 'H', 'M', 'S'
        const hours = parseInt(durationParts[0], 10) || 0;
        const minutes = parseInt(durationParts[1], 10) || 0;
        const seconds = parseInt(durationParts[2], 10) || 0;

        const milliseconds = (hours * 3600 + minutes * 60 + seconds) * 1000;
        const date = new Date(milliseconds);
        const formattedDate = this.datePipe.transform(date, 'dd.MM.yyyy');
        const formattedTime = this.datePipe.transform(date, 'HH:mm:ss');
        return { date: formattedDate, time: formattedTime };
      }
      // Check if the timestamp is in the '/Date(milliseconds)/' format
      else if (timestamp.startsWith('/Date(') && timestamp.endsWith(')/')) {
        const milliseconds = parseInt(timestamp.substring(6, timestamp.length - 2), 10);
        const date = new Date(milliseconds);
        const formattedDate = this.datePipe.transform(date, 'dd.MM.yyyy');
        const formattedTime = this.datePipe.transform(date, 'HH:mm:ss');
        return { date: formattedDate, time: formattedTime };
      }
    }
    // Return the original value if it's not in the expec
  }

}
