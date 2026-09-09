import { EmergencyService } from './../../services/emergency-dashboard/emergency-service';
import { element } from 'protractor';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { catchError, of, retry, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { EEmrService } from '../../services/e-emr.service';
import { timeStamp } from 'console';
import { environment } from '../../../environments/environment';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { HospitalistService } from '@services/e-hospitalist/hospitalist.service';
import { HospitalistType } from '@services/e-hospitalist/interfaces/hospitalist';
import { MissedMedicationDosesService } from '@services/e-hospitalist/missed-medication-doses.service';
import { SharedService } from '@services/shared.service';
import { ProgressNotesKardexComponent } from './progress-notes-kardex/progress-notes-kardex.component';
import { DatePipe } from '@angular/common';
import * as XLSX from 'xlsx';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DocumentingDeliveryComponent } from './documenting-delivery/documenting-delivery.component';
@UntilDestroy()
@Component({
  selector: 'app-In-Patients',
  templateUrl: './In-Patients.component.html',
  styleUrls: ['./In-Patients.component.scss'],
})
export class InPatientsComponent implements OnInit {
  @Output() public dataCount = new EventEmitter<any>();
  @ViewChild('progressNotesKardexId') progressNotesKardex: ProgressNotesKardexComponent;
  showModuleName: any;
  phyOrderData: any;
  dataOnTableForPhyOrder = [];
  phyOrderAction: any;
  cancelReasonListData: any;
  cancelReasonValue = '';
  errmsg = '';
  dataOnTableForMissedDoses = [];
  asc = false;
  phyOrderform1: FormGroup;
  phyOrderform2: FormGroup;
  progressEntryForm: FormGroup
  profileRes: any;
  occupationalGroupData: any;
  currentTime: any;
  ipListData: any;
  showCommentError = '';
  consultationData: any;
  showTextError = false;
  showPhyOrderError = false;
  checkEmptyField = false;
  ProgressNotesList: any[];
  copyProgressEntry: boolean = false;
  copyProgressEntryData: any;
  physicianOrderList: any[];
  modalRefForDelete: BsModalRef;
  selectProgressNote: any;
  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.showconfig = false;
  }
  @ViewChild('td') myDiv: ElementRef;
  showTable = false;
  showfilter = false;
  showconfig = false;
  isSelected = false;
  myDateValue: Date;
  dateFrom: Date;
  dateTo: Date;
  dataOnTable = [];
  form: FormGroup;
  modalRef: BsModalRef;
  dependencyData: any;
  dependencyFlag = '';
  dependencyFlagOnlyMe: any;
  dependencyFlagForAll: any;
  comment = '';
  logs: any;
  selectedCol = [];
  obj = {};
  postSelectedCol = [];
  Variantid: any;
  selectedView: any;
  columnsList = [];
  //ngmodel for checkbox
  bedview_modal = false;
  listview_modal = false;
  VIP_model = false;
  Treatment_diagnosis_model = false;
  Study_name_model = false;
  Speciality_model = false;
  Special_indicator_model = false;
  Isolation_model = false;
  LOS_model = false;
  Risk_Factor_model = false;
  Planned_discharge_model = false;
  Last_surgery_date_model = false;
  Financial_Category_model = false;
  Emergency_Admission_model = false;
  Doctor_model = false;
  Days_since_surgery_model = false;
  Days_for_isolation_model = false;
  Case_model = false;
  Allergy_model = false;
  Admitted_At_model = false;
  Admission_diagnosis_model = false;

  //
  VIP = false;
  Treatment_diagnosis = false;
  Study_name = false;
  Speciality = false;
  Special_indicator = false;
  Isolation = false;
  LOS = false;
  Risk_Factor = false;
  Planned_discharge = false;
  Last_surgery_date = false;
  Financial_Category = false;
  Emergency_Admission = false;
  Doctor = false;
  Days_since_surgery = false;
  Days_for_isolation = false;
  Case = false;
  Allergy = false;
  Admitted_At = false;
  Admission_diagnosis = false;
  home = false;
  ipConsultation = false;
  abnormalLabResult = false;
  abnormalRadFindings = false;
  missedMediDoses = false;
  notReleasedDoc = false;
  notExecutedPhysicianOrder = false;
  navModulesList = [
    'home',
    'My_IP_consultations',
    'Abnormal_Lab_Results',
    'Abnormal_Rad_Findings',
    'Missed_Medications_Doses',
    'Not_Released_Documents',
    'Not_Executed_Physician_Order',
  ];
  homeCount = 0;
  ipConsultCount = 0;
  labCount = 0;
  radCount = 0;
  missedDosesCount = 0;
  notReleaseDocCount = 0;
  phyOrder = 0;
  physOrderCol = [
    { Fieldname: 'Room' },
    { Fieldname: 'Created On' },
    { Fieldname: 'Status' },
    { Fieldname: 'Occupational group' },
    { Fieldname: 'Physician Order Text' },
  ];
  missedMedicDosesCol = [
    { Fieldname: 'Description of order ' },
    { Fieldname: 'Order date ' },
    { Fieldname: 'Order Time' },
  ];
  inHospitalistList: Array<HospitalistType> = [];
  setModule: any;
  getWards: any;
  searchString!: string;
  //searchString:any;
  IPData: any;
  order = 'asc';
  mytime: Date;
  items: FormArray;
  radPatientList: any[] = [];
  dataOnTableForLabPatients = [];
  constructor(
    private modalService: BsModalService,
    private _dataServices: EEmrService,
    private formBuilder: FormBuilder,
    private storageService: StorageService,
    public emergencyService: EmergencyService,
    private hospitalistService: HospitalistService,
    public missedMedicationService: MissedMedicationDosesService,
    public sharedService: SharedService,
    private datePipe: DatePipe,
     private modalServiceComp: NgbModal,
  ) {
    this.initForm();
    this.phyOrderform1 = this.formBuilder.group({
      items: new FormArray([]),
      physicianNumber: [''],
      physicianName: [''],
    });
    this.progressEntryForm = this.formBuilder.group({
      progressDate: [''],
      progressTime: [''],
      assignment: [''],
      occupationalGroup: [''],
      text: ['']

    });
  }

  initForm() {
    this.form = this.formBuilder.group({
      admittedFrom: [this.getOneMonthBackDate()],
      admittedTo: [new Date()],
      wardNo: [''],
      patientStatus: [''],
    });
  }
  getOneMonthBackDate(): Date {
    let date = new Date();
    date.setMonth(date.getMonth() - 1); // Subtract 1 month
    return date;
  }
  ngOnInit() {
    //this.getConfigTools();
    //this.initialPatientList('home');
    this.navModule('home');
    this.countOfNavModules();
    this.getWardList();
    this.profileRes = this.storageService.getUserProfile();
  }

  createNewOrder(): FormGroup {
    this.currentTime = new Date().getHours() + ':' + new Date().getMinutes();
    return this.formBuilder.group({
      orderDate: [new Date()],
      orderTime: [this.currentTime],
      occupationalGroup: ['NURS'],
      physicianOrder: [''],
    }
    );
  }

  openDocumentingDeliveryModel(data){
     console.log(data,"data")
     const modalRef  = this.modalServiceComp.open(DocumentingDeliveryComponent, { size: 'xl', backdrop: 'static', centered: true });
     modalRef.componentInstance.someInput = data;
   }

  addItem(): void {
    this.items = this.phyOrderform1.get('items') as FormArray;
    this.items.push(this.createNewOrder());
  }
  removeItems(i: number) {
    this.items.removeAt(i);
  }
  // convenience getter for easy access to form fields
  get f() {
    return this.form.controls;
  }
  get phyOrderControls() {
    return this.phyOrderform1.controls;
  }
  get progressEntryControls() {
    return this.progressEntryForm.controls;
  }
  public openModalForPhyOrder(
    template: TemplateRef<any>,
    data: any,
    action: any
  ) {
    if (action == 'execute') {
      const config: ModalOptions = { class: 'modal-dialog-centered execute-delete-modal' };
      this.modalRef = this.modalService.show(template, config);
    }
    if (action == 'delete') {
      const config: ModalOptions = { class: 'modal-dialog-centered execute-delete-modal' };
      this.modalRef = this.modalService.show(template, config);
    }
    if (action == 'create') {
      this.showPhyOrderError = false;
      this.phyOrderform1.controls['physicianNumber'].disable();
      this.phyOrderform1.controls['physicianName'].disable();
      const config: ModalOptions = { class: 'modal-dialog-centered modal-xl create-modal-phyorder' };
      this.modalRef = this.modalService.show(template, config);
      this.items = this.phyOrderform1.get('items') as FormArray;
      this.items.clear();
      this.modalRef.onHide.subscribe((reason: string | any) => {
        if (reason === 'backdrop-click') {
          this.phyOrderform1.reset();
          this.items = this.phyOrderform1.get('items') as FormArray;
          this.items.clear();
        }
      });
    }


    this.phyOrderData = data;
    this.phyOrderAction = action;
    this.currentTime = new Date().getHours() + ':' + new Date().getMinutes();
    // this.phyOrderform1.controls.orderTime.setValue(this.currentTime);
    this.phyOrderform1.controls.physicianNumber.setValue(this.profileRes.Gpart);
    this.phyOrderform1.controls.physicianName.setValue(this.profileRes.GpartName);
    // this.phyOrderform1.controls.orderDate.setValue(new Date());
    this.cancelReasonList();
    this.occupationalGroupList();
    this.phyOrderTableList(data)
  }
  public openModalForProgressEntry(
    template: TemplateRef<any>,
    data: any
  ) {
    const config: ModalOptions = { class: 'modal-dialog-centered modal-xl progress-modal' };
    this.modalRef = this.modalService.show(template, config);
    this.ipListData = data;
    this.copyProgressEntry = false;
    this.showTextError = false;
    this.currentTime = new Date().getHours() + ':' + new Date().getMinutes();
    this.progressEntryForm.controls.progressTime.setValue(this.currentTime);
    this.progressEntryForm.controls.progressDate.setValue(new Date());
    this.occupationalGroupList();
    this.getProgressNotesData(data);
    this.modalRef.onHide.subscribe((reason: string | any) => {
      if (reason === 'backdrop-click') {
        this.progressEntryForm.reset();
        this.copyProgressEntry = false;
      }
    });
  }
  public openModalForConsultationCompletion(
    template: TemplateRef<any>,
    data: any
  ) {
    this.consultationData = data;
    if(this.consultationData.VkgidStatus == 'Confirmed') {
    const config: ModalOptions = { class: 'modal-dialog-centered modal-lg completion-modal' };
    this.modalRef = this.modalService.show(template, config);
    } else {
      Swal.fire({
        title: 'Consultation is Already Completed',
        icon: 'warning',
        confirmButtonText: 'OK',
        //preConfirm: () => {},
      });
    }

  }
  navModule(value) {
    this.clearFilter();
    if (value == 'home') {
      this.home = true;
      this.ipConsultation = false;
      this.abnormalLabResult = false;
      this.abnormalRadFindings = false;
      this.missedMediDoses = false;
      this.notExecutedPhysicianOrder = false;
      this.notReleasedDoc = false;
      this.initialPatientList(value);
      this.getConfigTools();
      this.form.controls['admittedFrom'].enable();
      this.form.controls['admittedTo'].enable();
      this.showModuleName = this.convertModuleName(value);
    }
    if (value == 'My_IP_consultations') {
      this.ipConsultation = true;
      this.home = false;
      this.abnormalLabResult = false;
      this.abnormalRadFindings = false;
      this.missedMediDoses = false;
      this.notExecutedPhysicianOrder = false;
      this.notReleasedDoc = false;
      this.initialPatientList(value);
      this.getConfigTools();
      this.form.controls['admittedFrom'].enable();
      this.form.controls['admittedTo'].enable();
      this.showModuleName = this.convertModuleName(value);
    }
    if (value == 'Abnormal_Lab_Results') {
      this.setModule = 'Abnormal_Lab_Results';
      this.abnormalLabResult = true;
      this.home = false;
      this.ipConsultation = false;
      this.abnormalRadFindings = false;
      this.missedMediDoses = false;
      this.notExecutedPhysicianOrder = false;
      this.notReleasedDoc = false;
      this.initialfilterDataForLabRad('', '02');
      this.getConfigTools();
      this.form.controls['admittedFrom'].enable();
      this.form.controls['admittedTo'].enable();
      this.showModuleName = this.convertModuleName(value);
    }
    if (value == 'Abnormal_Rad_Findings') {
      this.setModule = 'Abnormal_Rad_Findings';
      this.abnormalRadFindings = true;
      this.home = false;
      this.ipConsultation = false;
      this.abnormalLabResult = false;
      this.missedMediDoses = false;
      this.notExecutedPhysicianOrder = false;
      this.notReleasedDoc = false;
      this.initialfilterDataForLabRad('', '03');
      this.getConfigTools();
      this.form.controls['admittedFrom'].enable();
      this.form.controls['admittedTo'].enable();
      this.showModuleName = this.convertModuleName(value);
    }
    if (value == 'Missed_Medications_Doses') {
      this.missedMedicationService.missedMedicationList.medicationData = [];
      this.setModule = 'Missed_Medications_Doses';
      this.missedMediDoses = true;
      this.home = false;
      this.ipConsultation = false;
      this.abnormalLabResult = false;
      this.abnormalRadFindings = false;
      this.notExecutedPhysicianOrder = false;
      this.notReleasedDoc = false;
      // this.initialPatientList(value);
      this.initialfilterDataForLabRad('', '04');
      this.getConfigTools();
      this.form.controls['admittedFrom'].enable();
      this.form.controls['admittedTo'].enable();
      this.showModuleName = this.convertModuleName(value);
    }
    if (value == 'Not_Released_Documents') {
      this.notReleasedDoc = true;
      this.notExecutedPhysicianOrder = false;
      this.home = false;
      this.ipConsultation = false;
      this.abnormalLabResult = false;
      this.abnormalRadFindings = false;
      this.missedMediDoses = false;
      this.initialPatientList(value);
      this.getConfigTools();
      this.form.controls['admittedFrom'].disable();
      this.form.controls['admittedTo'].disable();
      this.showModuleName = this.convertModuleName(value);

    }
    if (value == 'Not_Executed_Physician_Order') {
      this.notExecutedPhysicianOrder = true;
      this.home = false;
      this.ipConsultation = false;
      this.abnormalLabResult = false;
      this.abnormalRadFindings = false;
      this.missedMediDoses = false;
      this.notReleasedDoc = false;
      this.initialPatientList(value);
      this.getConfigTools('Not_Executed_Physician_Order');
      this.form.controls['admittedFrom'].disable();
      this.form.controls['admittedTo'].disable();
      this.showModuleName = this.convertModuleName(value);

    }
  }
  resetColFlags() {
    this.VIP = false;
    this.Treatment_diagnosis = false;
    this.Study_name = false;
    this.Speciality = false;
    this.Special_indicator = false;
    this.Isolation = false;
    this.LOS = false;
    this.Risk_Factor = false;
    this.Planned_discharge = false;
    this.Last_surgery_date = false;
    this.Financial_Category = false;
    this.Emergency_Admission = false;
    this.Doctor = false;
    this.Days_since_surgery = false;
    this.Days_for_isolation = false;
    this.Case = false;
    this.Allergy = false;
    this.Admitted_At = false;
    this.Admission_diagnosis = false;
  }
  public openModal(template: TemplateRef<any>, data: any) {
    this.modalRef = this.modalService.show(template);
    this.showCommentError = '';
    this.dependencyData = data;
    this.getHighDependencyOfPatientList(this.dependencyData);
  }

  showList(data) {
    if (data == 'tiles') {
      this.showTable = false;
    } else {
      this.showTable = true;
    }
  }
  showFilterFn() {
    if (this.showfilter) {
      this.showfilter = false;
    } else {
      this.showfilter = true;
    }
  }
  showConfigFn($event) {
    $event.stopPropagation();
    if (this.showconfig) {
      this.showconfig = false;
    } else {
      this.showconfig = true;
    }
  }
  initialPatientList(module) {
    var d = new Date();
    d.setDate(d.getDate() - 1);
    this.setModule = module;
    let jsonObj = {};
    if (
      this.setModule == 'Missed_Medications_Doses' ||
      this.setModule == 'Not_Released_Documents' ||
      this.setModule == 'Not_Executed_Physician_Order'
    ) {
      jsonObj = {
        // AdmDateFrom: '0000-00-00T00:00:00',
        // AdmDateTo: '0000-00-00T00:00:00',
        Floor: '',
        Patientstatus: '',
        module: this.setModule,
      };
    } else {
      jsonObj = {
        Floor: '',
        Patientstatus: '',
        module: this.setModule,
      };
    }

    this._dataServices.getInPatientList(jsonObj).subscribe(
      (_success: any) => {
        if (_success) {
          //_success = JSON.parse(_success._body);
          this.dataOnTable = [];
          if (_success.module == 'home' || _success.module == 'My_IP_consultations') {
            this.dataOnTable = _success.result.d.results;
            console.log(this.dataOnTable, "this.dataOnTable");
            
          } else if (_success.module == 'Not_Executed_Physician_Order') {
            this.dataOnTableForPhyOrder = _success.result.d.results;
            this.asc = true;
            this.sortOnCreatedOnPhyOrder();
          } else if ((_success.module = 'Missed_Medications_Doses')) {
            this.dataOnTableForMissedDoses = _success.result.d.results;
            let admittedFrom = '';
            let admittedTo = '';
            let wardNo = '';
            let physician = '';
            let speciality = '';
            const resp = this.hospitalistService.getIpListDataSet('02', admittedFrom, admittedTo, wardNo, physician, speciality, '04');

            this.hospitalistService.getInHospitalistData$
              .pipe(
                untilDestroyed(this),
                catchError((err) => {
                  return of([]);
                })
              )
              .subscribe((data: any[]) => {
                this.inHospitalistList = data[0].ToIPList.results;
              });
          } else {
            this.dataOnTable = _success.result.d.results;
          }

          this.IPData = of(this.dataOnTable);
          if (this.setModule == 'home') {
            this.dataCount.emit(this.dataOnTable.length);
          }

          if (this.notExecutedPhysicianOrder) {
            this.columnsList = this.physOrderCol;
          } else if (this.missedMediDoses) {
            //this.columnsList = this.missedMedicDosesCol;

          }
        }
      },
      (_error: any) => { }
    );
  }

  loginUserDetails = this.storageService.getUserProfile();
  public openModuleForMyList(
    data: any) {
    let payload = {
      "PatientNo": data.Mrn,
      "Physician": this.loginUserDetails.UserName,
      "CaseNo": data.CaseNumber
    }
    this.hospitalistService.patientListSet(payload).subscribe((data: any) => {
      Swal.fire({
        title: 'Success',
        text: "Patient is added to Your List successfully",
        showCancelButton: false,
        confirmButtonColor: '#2B7D2B',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Okay',
        willOpen: () => {
          // This sets the title color directly using inline styles
          const title = Swal.getTitle();
          if (title) {
            title.style.color = '#2B7D2B'; // Set the title color
          }
        },
        customClass: {
          title: 'swal-title-custom-success'  // Apply a custom class to the title
        }
      })
    })
  }
  inPatientListByFilter() {
    if (this.setModule == 'Abnormal_Rad_Findings') {
      this.initialfilterDataForLabRad('', '03');
    } else if (this.setModule == 'Abnormal_Lab_Results') {
      this.initialfilterDataForLabRad('', '02');
    } else if (this.setModule == 'Missed_Medications_Doses') {
      this.initialfilterDataForLabRad('', '04');
    } else {
      let jsonObj = {};
      var dateValue = '';
      if (
        this.setModule == 'Missed_Medications_Doses' ||
        this.setModule == 'Not_Released_Documents' ||
        this.setModule == 'Not_Executed_Physician_Order'
      ) {
        jsonObj = {
          Floor: this.f.wardNo.value,
          Patientstatus: this.f.patientStatus.value,
          module: this.setModule,
        };
      } else {
        if (this.f.admittedFrom.value || this.f.admittedTo.value) {
          jsonObj = {
            AdmDateFrom: this.sharedService.getDateRangeFormat(this.f.admittedFrom.value),
            AdmDateTo: this.sharedService.getDateRangeFormat(this.f.admittedTo.value),
            Floor: this.f.wardNo.value,
            Patientstatus: this.f.patientStatus.value,
            module: this.setModule,
          };
        } else {
          jsonObj = {
            Floor: this.f.wardNo.value,
            Patientstatus: this.f.patientStatus.value,
            module: this.setModule,
          };
        }
      }

      this._dataServices.getInPatientList(jsonObj).subscribe(
        (_success: any) => {
          if (_success) {
            //_success = JSON.parse(_success._body);
            //this.showFilterFn();
            this.showfilter = false;
            if (_success.module == 'home' || _success.module == 'My_IP_consultations') {
              this.dataOnTable = _success.result.d.results;
            } else if (_success.module == 'Not_Executed_Physician_Order') {
              this.dataOnTableForPhyOrder = _success.result.d.results;
            } else if ((_success.module = 'Missed_Medications_Doses')) {
              this.dataOnTableForMissedDoses = _success.result.d.results;
            } else {
              alert('else')
              this.dataOnTable = _success.result.d.results;
            }
            //this.dataOnTable = _success.d.results;
            //this.dataCount.emit(this.dataOnTable.length);
          }
        },
        (_error: any) => { }
      );
    }
  }

  resetFilter() {
    this.clearFilter();
    let jsonObj = {
      Floor: this.f.wardNo.value,
      Patientstatus: this.f.patientStatus.value,
      module: this.setModule,
    };
    this._dataServices.getInPatientList(jsonObj).subscribe(
      (_success: any) => {
        if (_success) {
          //_success = JSON.parse(_success._body);

          //this.showFilterFn();
          this.showfilter = false;
          if (_success.module == 'home') {
            this.dataOnTable = _success.result.d.results;
          } else if (_success.module == 'Not_Executed_Physician_Order') {
            this.dataOnTableForPhyOrder = _success.result.d.results;
          } else if ((_success.module = 'Missed_Medications_Doses')) {
            this.dataOnTableForMissedDoses = _success.result.d.results;
          } else {
            alert('else')
            this.dataOnTable = _success.result.d.results;
          }
          //this.dataOnTable = _success.d.results;
          //this.dataCount.emit(this.dataOnTable.length);
        }
      },
      (_error: any) => { }
    );
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
  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }

  // high dependency of patient
  getHighDependencyOfPatientList(dependencyFlag) {

    let jsonObj = {
      Einri: this.dependencyData.Institute,
      Falnr: this.dependencyData.CaseNumber,
    };

    this._dataServices.getHighDependencyOfPatientList(jsonObj).subscribe(
      (_success: any) => {
        _success = JSON.parse(_success._body);

        if (_success.d.results.length > 0) {
          this.logs = _success.d.results;
          if (
            _success.d.results[_success.d.results.length - 1].Hdflag == '01'
          ) {
            this.dependencyFlagOnlyMe = true;
            this.dependencyFlagForAll = false;
          } else if (
            _success.d.results[_success.d.results.length - 1].Hdflag == '02'
          ) {
            this.dependencyFlagForAll = true;
            this.dependencyFlagOnlyMe = false;
          } else {
            this.dependencyFlagOnlyMe = false;
            this.dependencyFlagForAll = false;
          }
          this.comment =
            _success.d.results[_success.d.results.length - 1].Comments;
        } else {
          this.comment = '';
          this.dependencyFlagOnlyMe = false;
          this.dependencyFlagForAll = false;
          this.logs = [];
        }
      },
      (_error: any) => { }
    );
  }
  checkForComment(comment) {
    if (this.dependencyFlag == '02') {
      if (comment == '') {
        this.showCommentError = 'Comment is required'
      } else {
        this.highDependencyOfPatientList();
      }
    }
    else if (this.dependencyFlag == '') {
      this.highDependencyOfPatientList();
    }
    else {
      this.highDependencyOfPatientList();
    }
  }
  highDependencyOfPatientList() {
    let jsonObj = {
      Einri: this.dependencyData.Institute,
      Falnr: this.dependencyData.CaseNumber,
      Patnr: this.dependencyData.Mrn,
      Hdflag: this.dependencyFlag,
      Comments: this.comment,
    };

    this._dataServices.postHighDependencyOfPatientList(jsonObj).subscribe(
      (_success: any) => {
        _success = JSON.parse(_success._body);

        this.modalService.hide();
        //this.initialPatientList('home');
        this.inPatientListByFilter()
      },
      (_error: any) => { }
    );
  }
  updateDependencyFlag(model, value) {

    if (model && value == '01') {
      this.dependencyFlagForAll = false;
      this.dependencyFlag = '01';
    } else if (model && value == '02') {
      this.dependencyFlagOnlyMe = false;
      this.dependencyFlag = '02';
    } else {
      this.dependencyFlag = '';
    }
  }
  // config tools
  updateView(value, event) {
    if (event.target.checked) {
      this.selectedView = value;
      if (this.selectedView == 'Bed view') {
        this.selectedView = '1';
        this.listview_modal = false;
      } else {
        this.selectedView = '2';
        this.bedview_modal = false;
      }
    } else {
      this.selectedView = '';
    }
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
  getConfigTools(module?: string) {
    let jsonObj = {
      Compid: 'MYIPLIST',
    };

    this._dataServices.getConfigTools(jsonObj).subscribe(
      (_success: any) => {
        //_success = JSON.parse(_success._body);

        if (module === undefined) {
          this.Variantid = _success.d.results[0].Variantid;
          this.columnsList = _success.d.results[0].ConfigHeaderItem.results;

          if (_success.d.results[0].Bedlist == '1') {
            this.showList('tiles');
            this.bedview_modal = true;
          } else {
            this.showList('table');
            this.listview_modal = true;
          }
          this.columnsList.sort(function (a, b) {
            var textA = a.Fieldname.toUpperCase();
            var textB = b.Fieldname.toUpperCase();
            return textA < textB ? -1 : textA > textB ? 1 : 0;
          });

          this.postSelectedCol = [];
          this.columnsList.forEach((value) => {
            this.postSelectedCol.push({
              Variantid: '',
              Fieldname: value.Fieldname,
            });
          });


          this.columnsList.find((value) => {
            if (value.Fieldname == 'Admission diagnosis') {
              this.Admission_diagnosis = true;
              this.Admission_diagnosis_model = true;
            }
            if (value.Fieldname == 'Admitted At') {
              this.Admitted_At = true;
              this.Admitted_At_model = true;
            }
            if (value.Fieldname == 'Allergy') {
              this.Allergy = true;
              this.Allergy_model = true;
            }
            if (value.Fieldname == 'Case') {
              this.Case = true;
              this.Case_model = true;
              value.Fieldname = 'Case #'
            }
            if (value.Fieldname == 'Days for isolation') {
              this.Days_for_isolation = true;
              this.Days_for_isolation_model = true;
            }
            if (value.Fieldname == 'Days since surgery') {
              this.Days_since_surgery = true;
              this.Days_since_surgery_model = true;
            }
            if (value.Fieldname == 'Doctor') {
              this.Doctor = true;
              this.Doctor_model = true;
            }
            if (value.Fieldname == 'Emergency Admission') {
              this.Emergency_Admission = true;
              this.Emergency_Admission_model = true;
            }
            if (value.Fieldname == 'Financial Category') {
              this.Financial_Category = true;
              this.Financial_Category_model = true;
            }
            if (value.Fieldname == 'Isolation') {
              this.Isolation = true;
              this.Isolation_model = true;
            }
            if (value.Fieldname == 'Last surgery date') {
              this.Last_surgery_date = true;
              this.Last_surgery_date_model = true;
            }
            if (value.Fieldname == 'LOS') {
              this.LOS = true;
              this.LOS_model = true;
            }
            if (value.Fieldname == 'Planned discharge') {
              this.Planned_discharge = true;
              this.Planned_discharge_model = true;
            }
            if (value.Fieldname == 'Risk Factor') {
              this.Risk_Factor = true;
              this.Risk_Factor_model = true;
            }
            if (value.Fieldname == 'Isolation') {
              this.Isolation = true;
              this.Isolation_model = true;
            }
            if (value.Fieldname == 'Special indicator') {
              this.Special_indicator = true;
              this.Special_indicator_model = true;
            }
            if (value.Fieldname == 'Speciality') {
              this.Speciality = true;
              this.Speciality_model = true;
            }
            if (value.Fieldname == 'Study Flag') {
              this.Study_name = true;
              this.Study_name_model = true;
            }
            if (value.Fieldname == 'Treatment diagnosis') {
              this.Treatment_diagnosis = true;
              this.Treatment_diagnosis_model = true;
            }
            if (value.Fieldname == 'VIP') {
              this.VIP = true;
              this.VIP_model = true;
            }
          });
        } else {
          this.VIP = false;
          this.Treatment_diagnosis = false;
          this.Study_name = false;
          this.Speciality = false;
          this.Special_indicator = false;
          this.Isolation = false;
          this.LOS = false;
          this.Risk_Factor = false;
          this.Planned_discharge = false;
          this.Last_surgery_date = false;
          this.Financial_Category = false;
          this.Emergency_Admission = false;
          this.Doctor = false;
          this.Days_since_surgery = false;
          this.Days_for_isolation = false;
          this.Case = false;
          this.Allergy = false;
          this.Admitted_At = false;
          this.Admission_diagnosis = false;
        }
      },
      (_error: any) => { }
    );
  }
  saveConfigTools() {
    let jsonObj = {
      Variantid: this.Variantid,
      Varianrname: '',
      Compid: 'MYIPLIST',
      Bedlist: this.selectedView,
      Usname: '',
      DefaultVariant: '',
      ConfigHeaderItem: this.postSelectedCol,
    };

    this._dataServices.postConfigTools(jsonObj).subscribe(
      (_success: any) => {
        //_success = JSON.parse(_success._body);

        this.showconfig = false;
        //this.modalService.hide();
        this.getConfigTools();
        this.resetColFlags();
      },
      (_error: any) => { }
    );
  }
  resetConfigToolsFields() {
    this.postSelectedCol = [];
    this.selectedView = '2';
    this.bedview_modal = false;
    this.listview_modal = true;
    this.VIP_model = false;
    this.Treatment_diagnosis_model = false;
    this.Study_name_model = false;
    this.Speciality_model = false;
    this.Special_indicator_model = false;
    this.Isolation_model = false;
    this.LOS_model = false;
    this.Risk_Factor_model = false;
    this.Planned_discharge_model = false;
    this.Last_surgery_date_model = false;
    this.Financial_Category_model = false;
    this.Emergency_Admission_model = false;
    this.Doctor_model = false;
    this.Days_since_surgery_model = false;
    this.Days_for_isolation_model = false;
    this.Case_model = false;
    this.Allergy_model = false;
    this.Admitted_At_model = false;
    this.Admission_diagnosis_model = false;
    this.saveConfigTools();
  }
  countOfNavModules() {
    this.navModulesList.forEach((element) => {
      let jsonObj = {
        module: element,
      };
      this._dataServices.postCountForNavModules(jsonObj).subscribe(
        (_success: any) => {
          _success = JSON.parse(_success._body);

          if (_success.module == 'home') {
            this.homeCount = _success.count;
          }
          if (_success.module == 'My_IP_consultations') {
            this.ipConsultCount = _success.count;
          }
          if (_success.module == 'Abnormal_Lab_Results') {
            this.labCount = _success.count;
          }
          if (_success.module == 'Abnormal_Rad_Findings') {
            this.radCount = _success.count;
          }
          if (_success.module == 'Missed_Medications_Doses') {
            this.missedDosesCount = _success.count;
          }
          if (_success.module == 'Not_Released_Documents') {
            this.notReleaseDocCount = _success.count;
          }
          if (_success.module == 'Not_Executed_Physician_Order') {
            this.phyOrder = _success.count;
          }
        },
        (_error: any) => { }
      );
    });
  }

  refreshModules() {
    //this.getConfigTools();
    //this.initialPatientList('home');
    this.navModule(this.setModule);
    this.countOfNavModules();
  }

  redirectToeKardex(data) {
    window.open(
      'radiologist-ekardex?patnr=' +
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


  clearFilter() {
    this.initForm();
  }
  convertModuleName(str) {
    var i,
      frags = str.split('_');
    for (i = 0; i < frags.length; i++) {
      frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
    }
    return frags.join(' ');
  }
  changeOder() {
    if (this.order == 'asc') {
      this.order = 'desc';
    } else {
      this.order = 'asc';
    }
  }

  physicianOrderSet(phyOrderData, action) {
    let json;
    if (action == 'execute') {
      this.modalRef.hide();
      json = {
        PorderId: phyOrderData.PorderId,
        CancelIndicator: false,
        ActionExecute: 'X',
      };
      this._dataServices.physicianOrderSet(json).subscribe(
        (_success: any) => {
          //_success = JSON.parse(_success._body);

          //this.navModule('Not_Executed_Physician_Order');
          this.refreshModules();
          Swal.fire({
            title: 'Physician Order has been Executed',
            icon: 'success',
            confirmButtonText: 'OK',
            //preConfirm: () => {},
          });
        },
        (_error: any) => {
          Swal.fire({
            title: 'Something went wrong',
            icon: 'error',
            confirmButtonText: 'OK',
            //preConfirm: () => {},
          });
        }
      );
    } else {
      json = {
        PorderId: phyOrderData.PorderId,
        CancelIndicator: true,
        ActionExecute: '',
        CancelReason: this.cancelReasonValue,
      };
      if (this.cancelReasonValue == '') {
        this.errmsg = 'Select a Reason for Deletion';
      } else {
        this.modalRef.hide();
        this._dataServices.physicianOrderSet(json).subscribe(
          (_success: any) => {
            //_success = JSON.parse(_success._body);

            //this.navModule('Not_Executed_Physician_Order');
            this.refreshModules();
            Swal.fire({
              title: 'Physician Order has been Deleted',
              icon: 'success',
              confirmButtonText: 'OK',
              //preConfirm: () => {},
            });
          },
          (_error: any) => {
            Swal.fire({
              title: 'Something went wrong',
              icon: 'error',
              confirmButtonText: 'OK',
              //preConfirm: () => {},
            });
          }
        );
      }
    }
  }
  cancelReasonList() {
    this._dataServices.cancelReasonList().subscribe(
      (_success: any) => {
        //_success = JSON.parse(_success._body);
        this.cancelReasonListData = _success.d.results;
      },
      (_error: any) => { }
    );
  }
  openModulePrescription(data) {


    window.open(
      'e-prescription?patnr=' +
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

  openModuleLabChart(data) {
    window.open(
      environment.labChartUrl + 'patnr=' +
      data.Mrn +
      '&falnr=' +
      data.CaseNumber +
      '&einri=' +
      data.Institute +
      '&lfdnr=' +
      data.Lfdnr +
      '&appl=LABCHART',
      '_blank'
    );
  }
  openModuleRad(data) {
    window.open(
      environment.radiologyUrl + 'patient_id=' + data.Mrn,
      '_blank'
    );
  }
  openModuleEOrder(data) {
    window.open(
      'e-order?patnr=' +
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
  openModuleKardex(data) {
    localStorage.setItem('admit_process', JSON.stringify(true));
    window.open(
      'radiologist-ekardex?patnr=' +
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
  // sorting
  sort() {
    this.dataOnTable.sort((a, b) => 0 - (a > b ? -1 : 1));
  }

  sortingTable(fieldName) {
    if (!this.asc) {
      this.asc = true;
      this.dataOnTable.sort((a, b) => {
        const nameA = a[fieldName].toUpperCase(); // ignore upper and lowercase
        const nameB = b[fieldName].toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // names must be equal
        return 0;
      });
    } else {
      this.asc = false;
      this.dataOnTable.sort((a, b) => {
        const nameA = a[fieldName].toUpperCase(); // ignore upper and lowercase
        const nameB = b[fieldName].toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return 1;
        }
        if (nameA > nameB) {
          return -1;
        }

        // names must be equal
        return 0;
      });
    }

  }

  sortMrn() {
    if (!this.asc) {
      this.asc = true;
      this.dataOnTable.sort((a, b) => {
        const nameA = a.Mrn.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Mrn.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // names must be equal
        return 0;
      });
    } else {
      this.asc = false;
      this.dataOnTable.sort((a, b) => {
        const nameA = a.Mrn.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Mrn.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return 1;
        }
        if (nameA > nameB) {
          return -1;
        }

        // names must be equal
        return 0;
      });
    }

  }
  sortPatient() {
    if (!this.asc) {
      this.asc = true;
      this.dataOnTable.sort((a, b) => {
        const nameA = a.Patname.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Patname.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // names must be equal
        return 0;
      });
    } else {
      this.asc = false;
      this.dataOnTable.sort((a, b) => {
        const nameA = a.Patname.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Patname.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return 1;
        }
        if (nameA > nameB) {
          return -1;
        }

        // names must be equal
        return 0;
      });
    }
  }
  sortWard() {
    if (!this.asc) {
      this.asc = true;
      this.dataOnTable.sort((a, b) => {
        const nameA = a.Floor.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Floor.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // names must be equal
        return 0;
      });
    } else {
      this.asc = false;
      this.dataOnTable.sort((a, b) => {
        const nameA = a.Floor.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Floor.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return 1;
        }
        if (nameA > nameB) {
          return -1;
        }

        // names must be equal
        return 0;
      });
    }
  }
  sortOnCreatedOnPhyOrder() {
    if (!this.asc) {
      this.asc = true;
      this.dataOnTableForPhyOrder.sort((a, b) => {
        const nameA = a.Erdat.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Erdat.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // names must be equal
        return 0;
      });
    } else {
      this.asc = false;
      this.dataOnTableForPhyOrder.sort((a, b) => {
        const nameA = a.Erdat.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Erdat.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return 1;
        }
        if (nameA > nameB) {
          return -1;
        }

        // names must be equal
        return 0;
      });
    }
  }
  occupationalGroupList() {
    this._dataServices.occupationalGroupList().subscribe(
      (_success: any) => {
        //_success = JSON.parse(_success._body);
        this.occupationalGroupData = _success.d.results;
        // this.phyOrderform1.controls.occupationalGroup.setValue(this.occupationalGroupData[2].Group);
        this.occupationalGroupData.forEach(element => {
          if (element.Group == 'DOCT') {
            this.progressEntryForm.controls.occupationalGroup.setValue(element.Group)
          }

        });

        this.currentTime = new Date().getHours() + ':' + new Date().getMinutes();
        this.addItem()
        this.addItem()
        this.addItem()
        this.addItem()
      },
      (_error: any) => { }
    );
  }
  createPhysicianOrder() {
    if (this.items.controls[0].value.physicianOrder == '' && this.items.controls[1].value.physicianOrder == '' && this.items.controls[2].value.physicianOrder == '' && this.items.controls[3].value.physicianOrder == '') {
      this.showPhyOrderError = true;
    }
    else {
      this.items.controls.forEach(element => {
        if (element.value.physicianOrder != '') {
          var createTime = 'PT11H29M30S';
          if (element.value.orderTime.value) {
            createTime = this.phyOrderControls.orderTime.value.split(':')
            createTime = 'PT' + createTime[0] + 'H' + createTime[1] + 'M' + '00S'
          }
          let json = {};

          if (this.phyOrderData.Einri) {
            json = {
              "InstitutionId": this.phyOrderData.Einri,
              "CaseId": this.phyOrderData.Falnr,
              "CreationDate": element.value.orderDate.toISOString().split('.')[0],
              "CreationTime": createTime,
              "ZphysOrder": element.value.physicianOrder,
              "EmployeeResp": this.phyOrderControls.physicianNumber.value,
              "ProfessionalGroup": element.value.occupationalGroup,
            }
          } else {
            json = {
              "InstitutionId": this.phyOrderData.Institute,
              "CaseId": this.phyOrderData.CaseNumber,
              "CreationDate": element.value.orderDate.toISOString().split('.')[0],
              "CreationTime": createTime,
              "ZphysOrder": element.value.physicianOrder,
              "EmployeeResp": this.phyOrderControls.physicianNumber.value,
              "ProfessionalGroup": element.value.occupationalGroup,
            }
          }
          this._dataServices.createPhysicianOrder(json).subscribe(
            (_success: any) => {
              //_success = JSON.parse(_success._body);
              this.modalRef.hide();
              this.phyOrderform1.reset();
              //this.navModule(this.setModule)
              this.refreshModules();
            },
            (_error: any) => { }
          );
        }
      })
    }

  }
  createProgressEntry() {
    if (this.progressEntryControls.text.value == '') {
      this.showTextError = true;
    } else {
      var createTime = 'PT11H29M30S';
      if (this.progressEntryControls.progressTime.value) {
        createTime = this.progressEntryControls.progressTime.value.split(':')
        createTime = 'PT' + createTime[0] + 'H' + createTime[1] + 'M' + '00S'
      }
      let json;
      if (this.copyProgressEntry) {
        json = {
          PatientId: this.copyProgressEntryData.PatientId,
          CaseId: this.copyProgressEntryData.CaseId,
          ActionDate: this.progressEntryControls.progressDate.value.toISOString().split('.')[0],
          ActionTime: createTime,
          ProfGroup: this.progressEntryControls.occupationalGroup.value,
          Text: this.progressEntryControls.text.value,
          EmployeeResp: this.copyProgressEntryData.EmployeeResp,
        };
      } else {
        json = {
          PatientId: this.ipListData.Mrn,
          CaseId: this.ipListData.CaseNumber,
          ActionDate: this.progressEntryControls.progressDate.value.toISOString().split('.')[0],
          ActionTime: createTime,
          ProfGroup: this.progressEntryControls.occupationalGroup.value,
          Text: this.progressEntryControls.text.value,
          EmployeeResp: this.profileRes.Gpart,
        };
      }




      this._dataServices.createProgressEntry(json).subscribe(
        (_success: any) => {
          //_success = JSON.parse(_success._body);
          this.modalRef.hide();
          this.progressEntryForm.reset();
          this.navModule(this.setModule)
        },
        (_error: any) => { }
      );
    }
  }

  consultationCompletion() {
      const json = {
        Vkgid: this.consultationData.Vkgid,
        ActionComplete: "X"
      }
      this._dataServices.consultationCompletion(json).subscribe(
        (_success: any) => {
          //_success = JSON.parse(_success._body);
          this.modalRef.hide();
          //this.navModule(this.setModule)
          Swal.fire({
            title: 'Completed the Consultation Order Successfully',
            icon: 'success',
            confirmButtonText: 'OK',
          });
          this.inPatientListByFilter();
        },
        (_error: any) => {
          this.modalRef.hide();
          if (_error == 'Bad Request') {
            Swal.fire({
              title: 'Case number does not exist for Service',
              icon: 'error',
              confirmButtonText: 'OK',
              //preConfirm: () => {},
            });
          }
        }
      );
  }

  getProgressNotesData(data) {
    const res = this.emergencyService.getProgressNotesSetData(
      data.Mrn,
      data.CaseNumber
    );

    this.emergencyService.progressNotesSetData$
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((data: any[]) => {
        this.ProgressNotesList = data;
      });
  }
  parsePayloadFormateTime(data: string) {
    if (data && data.length) {
      let hours = data.substring(2, 4);
      let minute = data.substring(5, 7);

      return `${hours}:${minute}`;
    }
  }
  public getImageBorderLogic(item) {
    return (
      (item.ProfGroup === 'ANES' && {
        'background-color': '#D6ECAE', //Surgery
      }) ||
      (item.ProfGroup === 'AUDI' && {
        'background-color': '#9B9BFF', //Surgery
      }) ||
      (item.ProfGroup === 'CPHA' && {
        'background-color': '#CFBB8B', //Surgery
      }) ||
      (item.ProfGroup === 'DIET' && {
        'background-color': '#00FFFF', //Surgery
      }) ||
      (item.ProfGroup === 'DOCT' && {
        'background-color': '#BBDDDD', //Surgery
      }) ||
      (item.ProfGroup === 'HOSP' && {
        'background-color': '#B0E0E6', //Surgery
      }) ||
      (item.ProfGroup === 'INFC' && {
        'background-color': '#FFB2FF', //Surgery
      }) ||
      (item.ProfGroup === 'NURS' && {
        'background-color': '#FFB200', //Surgery
      }) ||
      (item.ProfGroup === 'OCTH' && {
        'background-color': '#E9DBF0', //Surgery
      }) ||
      (item.ProfGroup === 'PHYS' && {
        'background-color': '#EFEFB0', //Surgery
      }) ||
      (item.ProfGroup === 'PMGT' && {
        'background-color': '#FFFF00', //Surgery
      }) ||
      (item.ProfGroup === 'RESP' && {
        'background-color': '#9B9BFF', //Surgery
      }) ||
      (item.ProfGroup === 'SPTH' && {
        'background-color': '#B2B2B2', //Surgery
      }) ||
      (item.ProfGroup === 'ZPHA' && {
        'background-color': '#7AB200', //Surgery
      })
    );
  }
  showParagraph(text: any) {
    return text.replace(/\n/g, ' <br /> ');
  }
  copyProgressEntryEvent(event: any) {
    this.copyProgressEntry = true;
    this.copyProgressEntryData = event;
    this.progressEntryForm.patchValue({
      // PatientId: event.PatientId,
      // CaseId: event.CaseId,
      // MovementId: event.MovementId,
      // DocumentOu: event.DocumentOu,
      text: event.Text,
      // Category: event.Category,
      // EmployeeResp: event.EmployeeResp,
    });
  }
  phyOrderTableList(data) {
    const res = this.emergencyService.getPhyOrderSetDataSet(
      data.Institute,
      data.CaseNumber
    );

    this.emergencyService.phyOrderlistData$
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((data: any[]) => {
        this.physicianOrderList = data;
        //this.physicianOrderListFilterValue = data;
      });
  }
   warningSwalModel(message: string) {
    Swal.fire({
      icon: 'warning',
      title: 'Not Allowed',
      text: message
    });
  }

  deleteProgressNotePopup(template: TemplateRef<any>, note: any) {
    this.selectProgressNote = note;
    let gpart =  this.storageService.getGpart()
    if (note.EmployeeResp !== gpart)  {
      this.warningSwalModel("You are not allowed to delete others' notes");
      return; 
    }
    const config: ModalOptions = {
      class: 'modal-dialog-centered',
    };
    this.cancelReasonList();
    this.modalRefForDelete = this.modalService.show(template, config);
    // this.progressNoteForm();
    // this.isFormSubmitted = false;
  }
  deleteProgressNoteAPI() {
    // this.isFormSubmitted = true;
    //  if (this.deleteProgressNoteForm.invalid) {
    //   return;
    // }
    if (this.cancelReasonValue == '') {
      this.errmsg = 'Select a Reason for Deletion';
    } else {
      this.emergencyService
        .deleteProgressNoteForAdmit(this.selectProgressNote, this.cancelReasonValue)
        .subscribe(
          (_success: any) => {
            //this.reloadPhyOrderList.next(true);
            this.cancelReasonValue = '';
            this.errmsg = '';
            this.emergencyService.successSwalModel('Progress note is deleted successfully')
            this.modalRefForDelete.hide();
            this.getProgressNotesData(this.ipListData);
          },
          (_error: any) => { }
        );
    }
  }

  // code of RAD
  initialfilterDataForLabRad(ward?, type?) {
    this.searchString = '';
    let admittedFrom = '';
    let admittedTo = '';
    let wardNo = '';
    let physician = this.storageService.getUserProfile().Gpart;
    let speciality = '';

    // if (ward) {
    //   wardNo = ward;
    // }

    if (this.f.admittedFrom.value) {
      admittedFrom = this.f.admittedFrom.value.toISOString().split('.')[0];
    }

    if (this.f.admittedTo.value) {
      admittedTo = this.f.admittedTo.value.toISOString().split('.')[0];
    }

    if (this.f.wardNo.value) {
      wardNo = this.f.wardNo.value;
    }

    // if (this.f.patientStatus.value) {
    //   physician = this.commaSeparatForAttendPhy(this.f.patientStatus.value);
    // }

    // if (this.f.specialty.value) {
    //   speciality = this.commaSeparatForSpecialty(this.f.specialty.value);
    // }

    const res = this.hospitalistService.getIpListDataSet('01', admittedFrom, admittedTo, wardNo, physician, speciality, type);

    this.hospitalistService.getInHospitalistData$
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((data: any[]) => {
        //this.showFilter = false;
        this.dataOnTableForLabPatients = data[0]?.ToLabList?.results;
        this.radPatientList = data[0]?.ToRadList?.results;
        this.inHospitalistList = data[0].ToMedList.results;
        //this.getSpecialtyData = data[0].ToDept.results;
        //this.inAttendPhyList = data[0].ToPhysician.results;
      });
  }
  reloadTable(event) {
    if (event == 'radTable') {
      this.initialfilterDataForLabRad('', '03');
    }
  }
   // progress notes
   openModalForProgressNotes(item) {
    let values = {
      Einri:item.Institute,
      Falnr:item.CaseNumber,
      Patnr:item.Mrn,
      Patient:item.PatientName,
      Datum:item.AdmissionDate
    }
    this.progressNotesKardex.openProgressNotesModal(values);
  }
  
  exportToExcel(nameofFile?: string, fileExtention?: string): void {
    if(this.home) {
      this.homeExcel(nameofFile, fileExtention);
    } else if(this.ipConsultation) {
      this.myIPConsult(nameofFile, fileExtention);
    } else if(this.abnormalLabResult) {
      this.abnormalLabExcel(nameofFile, fileExtention);
    } else if(this.notExecutedPhysicianOrder){
      this.executedPhysicianOrder(nameofFile, fileExtention);
    } else if(this.missedMediDoses){
      this.mediDoses(nameofFile, fileExtention);
    }else if(this.abnormalRadFindings){
      this.abNormalRadFindings(nameofFile, fileExtention);
    }else if(this.notReleasedDoc){
      this.releasedDoc(nameofFile, fileExtention);
    }
  }
  releasedDoc(nameofFile: string = 'Missing/Not Released Documents', fileExtention: string = 'xlsx'){
    const eventArray = this.dataOnTable;
    const mappedEvents = eventArray.map(event => {
      return {
        Datetdate: event.Datetime,
        Datetime: this.datePipe.transform(event.Datetime, 'HH:mm'),
        Erusr:event.Erusr,
        Patnr: event.Patnr,
        Patname: event.Patname,
        Leitxt: event.Leitxt,
        Status: event.Status,
   }
   })
   let Heading = [['Created On',
   'Created At',
   'Created By',
   'MRN',
   'Patient',
   'Ward',
   'Room/Bad',
   'Order Description',
   'Result Status',
   'Image',
   'Report',
   'Abnormal',]]
   const workbook = XLSX.utils.book_new();
   const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
   XLSX.utils.sheet_add_aoa(ws, Heading);
   XLSX.utils.sheet_add_json(ws, mappedEvents, { origin: 'A2', skipHeader: true });
   XLSX.utils.book_append_sheet(workbook, ws, "test");
   XLSX.writeFile(workbook, `${nameofFile}.${fileExtention}`);
  }
  abNormalRadFindings(nameofFile: string = 'Abnormal Rad Findings', fileExtention: string = 'xlsx'){
    const eventArray = this.dataOnTable;
    const mappedEvents = eventArray.map(event => {
      return {
        Datetdate: event.Datetime,
        Datetime: this.datePipe.transform(event.Datetime, 'HH:mm'),
        Erusr:event.Erusr,
        Patnr: event.Patnr,
        Patname: event.Patname,
        Floor:event.Floor,
        RoomidText:event.RoomidText,
        Leitxt: event.Leitxt,
        Status: event.Status,
   }
   })
   let Heading = [['Created On',
   'Created At',
   'Created By',
   'MRN',
   'Patient',
   'Ward',
   'Room/Bad',
   'Order Description',
   'Result Status',
   'Image',
   'Report',
   'Abnormal',]]
   const workbook = XLSX.utils.book_new();
   const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
   XLSX.utils.sheet_add_aoa(ws, Heading);
   XLSX.utils.sheet_add_json(ws, mappedEvents, { origin: 'A2', skipHeader: true });
   XLSX.utils.book_append_sheet(workbook, ws, "test");
   XLSX.writeFile(workbook, `${nameofFile}.${fileExtention}`);
  }
  mediDoses(nameofFile: string = 'Missed/Not Administered Doses', fileExtention: string = 'xlsx'){
    const eventArray = this.inHospitalistList;
    const mappedEvents = eventArray.map(event => {
      return {
        Mrn: event.Mrn,
        PatientName: event.PatientName,
        Floor: event.Floor,
        RoomidText: event.RoomidText,
        AttendingDoctorName: event.AttendingDoctorName,
        DeptouDesc: event.DeptouDesc
   }
   })
   let Heading = [['MRN', 'Patname' , 'Ward', 'Room/Bad','Attending Physician', 'Specialty']]
   const workbook = XLSX.utils.book_new();
   const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
   XLSX.utils.sheet_add_aoa(ws, Heading);
   XLSX.utils.sheet_add_json(ws, mappedEvents, { origin: 'A2', skipHeader: true });
   XLSX.utils.book_append_sheet(workbook, ws, "test");
   XLSX.writeFile(workbook, `${nameofFile}.${fileExtention}`);
  }
  executedPhysicianOrder(nameofFile: string = 'Not Executed Physician Order', fileExtention: string = 'xlsx'){
    const eventArray = this.dataOnTableForPhyOrder;
      const mappedEvents = eventArray.map(event => {
        return {
          Patnr: event.Patnr,
          Patname: event.Patname,
          Floor: event.Floor,
          RoomidText: event.RoomidText,
          Erdat: this.convertTimestampToDate(event.Erdat),
          Status: event.Status,
          Occupationalgrp: event.Occupationalgrp,
          OrderShortText: event.OrderShortText,
     }
     })
     let Heading = [['MRN', 'Patname' , 'Ward', 'Room','Created On','Status', 'Occupational group' ,'Physician Order Text']]
     const workbook = XLSX.utils.book_new();
     const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
     XLSX.utils.sheet_add_aoa(ws, Heading);
     XLSX.utils.sheet_add_json(ws, mappedEvents, { origin: 'A2', skipHeader: true });
     XLSX.utils.book_append_sheet(workbook, ws, "test");
     XLSX.writeFile(workbook, `${nameofFile}.${fileExtention}`);
  }

  myIPConsult(nameofFile: string = 'My IP Consultations', fileExtention: string = 'xlsx') {
    const eventArray = this.dataOnTable;
      const mappedEvents = eventArray.map(event => {
        return {
          Mrn: event.Mrn,
          Patname: event.Patname,
          Floor: event.Floor,
          RoomidText: event.RoomidText,
          Admdatetime: this.convertTimestampToDate(event.Admdatetime),
          Diagnosis: event.Diagnosis,
          AdmissionDate: this.convertTimestampToDate(event.AdmissionDate),
          Allergies: event.Allergies,
          CaseNumber: event.CaseNumber,
          DaysIc: event.DaysIc,
          SurgeryLastDays: event.SurgeryLastDays,
          AttendingDoctorName: event.AttendingDoctorName,
          EmergencyAdmInd: event.EmergencyAdmInd,
          FinancialCategory: event.FinancialCategory,
          IsolationInd: event.IsolationInd,
          SurgeryLastDate: this.convertTimestampToDate(event.SurgeryLastDate),
          AdmissionDays: event.AdmissionDays,
          PatientstatusPlandischarg: event.PatientstatusPlandischarg,
          RiskInformation: event.RiskInformation,
          SpecialInd: event.SpecialInd,
          speciality: event.speciality,
          StudyFlag: event.StudyFlag,
          DiagnosisTreatment: event.DiagnosisTreatment,
          VipIcon: event.VipIcon,
     }
     })
     let Heading = [['MRN', 'Patname' , 'Ward', 'Room','Admitted On', 'Admission diagnosis' ,'Admitted At','Allergy','Case','Days for isolation','Days since surgery','Doctor','Emergency Admission','Financial Category','Isolation','Last surgery date','LOS','Planned discharge','Risk Factor','Special indicator','Speciality','Study Flag','Treatment diagnosis','VIP']]
     const workbook = XLSX.utils.book_new();
     const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
     XLSX.utils.sheet_add_aoa(ws, Heading);
     XLSX.utils.sheet_add_json(ws, mappedEvents, { origin: 'A2', skipHeader: true });
     XLSX.utils.book_append_sheet(workbook, ws, "test");
     XLSX.writeFile(workbook, `${nameofFile}.${fileExtention}`);
  }

  homeExcel(nameofFile: string = 'My InPatients', fileExtention: string = 'xlsx') {
    const eventArray = this.dataOnTable;
    const timestamp = 1685103808000;
    const date = new Date(timestamp);
    const mappedEvents = eventArray.map(event => {
      return {
          Mrn: event.Mrn,
          Patname: event.Patname,
          Floor: event.Floor,
          RoomidText: event.RoomidText,
          // Admdatetime: this.convertTimestampToDate(event.Admdatetime),
          // Admdatetime: this.datePipe.transform(event.Admdatetime, 'HH:mm'),
          AdmissionDate: this.convertTimestampToDate(event.AdmissionDate),
          Diagnosis: event.Diagnosis,
          Admdatetime: this.parsePayloadFormateTime(event.AdmissionTime),
          Allergies: event.Allergies,
          CaseNumber: event.CaseNumber,
          DaysIc: event.DaysIc,
          SurgeryLastDays: event.SurgeryLastDays,
          AttendingDoctorName: event.AttendingDoctorName,
          EmergencyAdmInd: event.EmergencyAdmInd,
          FinancialCategory: event.FinancialCategory,
          IsolationInd: event.IsolationInd,
          SurgeryLastDate: this.convertTimestampToDate(event.SurgeryLastDate),
          AdmissionDays: event.AdmissionDays,
          PatientstatusPlandischarg: event.PatientstatusPlandischarg,
          RiskInformation: event.RiskInformation,
          SpecialInd: event.SpecialInd,
          speciality: event.speciality,
          StudyFlag: event.StudyFlag,
          DiagnosisTreatment: event.DiagnosisTreatment,
          VipIcon: event.VipIcon,
         
      };
  });
    let Heading = [['MRN', 'Patname' , 'Ward', 'Room','Admitted On','Admission diagnosis','Admitted At','Allergy','Case','Days for isolation','Days since surgery','Doctor','Emergency Admission','Financial Category','Isolation','Last surgery date','LOS','Planned discharge','Risk Factor','Special indicator','Speciality','Study Flag','Treatment diagnosis','VIP']];

    const workbook = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws, Heading);
    XLSX.utils.sheet_add_json(ws, mappedEvents, { origin: 'A2', skipHeader: true });
    XLSX.utils.book_append_sheet(workbook, ws, "test");
    XLSX.writeFile(workbook, `${nameofFile}.${fileExtention}`);
  }

  abnormalLabExcel(nameofFile: string = 'Abnormal Lab Results', fileExtention: string = 'xlsx') {
    const eventArray = this.dataOnTableForLabPatients;
      const mappedEvents = eventArray.map(event => {
        return {
          Datetdate: event.Datetime,
          Datetime: this.datePipe.transform(event.Datetime, 'HH:mm'),
          Erusr: event.Erusr,
          Patnr: event.Patnr,
          Patname: event.Patname,
          Floor:event.Floor,
          RoomidText:event.RoomidText,
          Leitxt: event.Leitxt,
          Status: event.Status,
     }
     })
     let Heading = [['Created On',
     'Created At',
     'Created By',
     'MRN',
     'Patient',
     'Ward',
     'Room/Bad',
     'Order Description',
     'Details',
     'Result Status',
     'Report',
     'Abnormal',]]
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
}
