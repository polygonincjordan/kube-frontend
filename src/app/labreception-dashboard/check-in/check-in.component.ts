import { DatePipe } from '@angular/common';
import {
  Component,
  OnInit,
  EventEmitter,
  Output,
  ViewChild,
  TemplateRef,
  OnDestroy,
} from '@angular/core';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { ErBedComponent } from './er-bed/er-bed.component';
import { ErVitalsComponent } from './er-vitals/er-vitals.component';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NurErAllergyComponent } from './nur-er-allergy/nur-er-allergy.component';
import { StorageService } from '@services/storage.service';
import { ProgressNotesNursingComponent } from '../progress-notes-nursing/progress-notes-nursing.component';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { OutpatientNursingService } from '@services/outpatient-nursing.service';
import { formatDate } from 'ngx-bootstrap/chronos';
import { EEmrService } from '@services/e-emr.service';
import { SharedService } from '@services/shared.service';
import { DataShareService } from '@services/data-share.service';
import { FilterType } from '@services/interfaces/common.enum';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';
import { HelperService } from '@services/helper.service';

@Component({
  selector: 'app-check-in',
  templateUrl: './check-in.component.html',
  styleUrls: ['./check-in.component.scss'],
})
export class CheckInComponent implements OnInit, OnDestroy {
  @ViewChild('progressNotesKardexId') progressNotesKardex: ProgressNotesNursingComponent;
  @ViewChild('erBed') erBed: ErBedComponent;
  @ViewChild('erVitalsModal') erVitalsModal: ErVitalsComponent;
  @ViewChild('nurErAllergy') nurErAllergy: NurErAllergyComponent;
  @Output() sendErPatientCount = new EventEmitter<any>();
  @Output() redirectCheckInData = new EventEmitter<any>();

  @ViewChild('selectIconPdf', { static: true }) selectIconPdf: TemplateRef<any>;

  isFormValidError: boolean = false;
  searchString: string = '';
  ERlistData: any[];
  currentDateObj: any = [];
  ERlistDataClone: any = [];
  public financialCategory: Array<any> = [];
  public statusList: Array<any> = [];
  public doctorList: Array<any> = [];
  asc: boolean;
  triageValueArr: any = [];
  physicianValueArr: any = [];
  statusValueArr: any = [];
  lastIndex: number;
  modalRefForRisk: BsModalRef;
  selectedIconPdf: BsModalRef;
  OpenPdfModal: BsModalRef;
  selectedERList: any;
  isRiskUpdate: boolean;
  riskList: any[];
  riskform: FormGroup;
  riskFormitems: FormArray;
  updateRiskForm: FormGroup;
  modalRef: BsModalRef;
  colName: any;
  modalCommonDataArr: any;
  allergenValues: any;
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
  visitComments: any;
  todayDate = [new Date(), new Date()];
  private refreshSubscription: Subscription;
  refreshInterval: any;
  constructor(
    private emergencyService: EmergencyService,
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private storageService: StorageService,
    private ePrescriptionService: EPrescriptionService,
    public outpatientNursingService: OutpatientNursingService,
    private datePipe: DatePipe,
    private dataShareService: DataShareService,
    private _dataServices: EEmrService,
    private sharedService: SharedService,
    public helperService: HelperService
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
  }

  ngOnDestroy(): void {
    this.dataShareService.sendFilterType(null);
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.getErList(this.todayDate).then((formValue: any) => {
      if (formValue) {
        formValue.forEach((ele: any) => {
          this.financialCategory.push(ele?.ZzfinCat);
          this.statusList.push(ele?.StatusTxt);
          this.doctorList.push(ele?.Behpersname);
        });
        this.financialCategory = Array.from(new Set(this.financialCategory.filter(category => category.trim() !== '')));
        this.statusList = Array.from(new Set(this.statusList.filter(category => category.trim() !== '')));
        this.doctorList = Array.from(new Set(this.doctorList.filter(category => category.trim() !== '')));
        const value = {
          filterFinCategtoryList: this.financialCategory,
          filterStatusList: this.statusList,
          filterDoctorList: this.doctorList,
        };
        this.dataShareService.sendFilterType(FilterType.OpCheckIn$, true, value);
      }
    }).catch((error: any) => {
      console.error('Error scale:', error);
    });

    // this.refreshInterval = setInterval(() => {
    //   this.getErList(this.todayDate);
    // },environment.refreshTime);
  }
  getAssignedTime(triagetime, triagedate, index) {
    let {
      charArr,
      hr,
      min,
      dateObj,
      totalMinutes,
      assignedHr,
      assignedMin,
      assignedTime,
    }: any = '';
    charArr = triagetime.split('');
    hr = parseInt(charArr[0] + charArr[1]);
    min = parseInt(charArr[3] + charArr[4]);
    dateObj = triagedate;
    this.currentDateObj = new Date();
    dateObj.setHours(hr, min);
    totalMinutes = (this.currentDateObj.getTime() - dateObj.getTime()) / 1000;
    totalMinutes = totalMinutes / 60;
    totalMinutes = Math.abs(Math.round(totalMinutes));
    assignedHr = Math.floor(totalMinutes / 60);
    assignedMin = totalMinutes % 60;
    assignedTime =
      String(assignedHr).padStart(2, '0') +
      'h' +
      String(assignedMin).padStart(2, '0');
    this.ERlistData[index]['assignedTime'] = assignedTime;
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

  addItemForRisk(element?): void {
    this.riskFormitems = this.riskform.get('riskFormitems') as FormArray;
    this.riskFormitems.push(this.showRiskDetailsOnList(element));
    this.disableInputs();
  }

  disableInputs() {
    (<FormArray>this.riskform.get('riskFormitems')).controls.forEach(
      (control) => {
        control['controls']['Rsfna'].disable();
        control['controls']['Rsfkb'].disable();
      }
    );
  }

  showRiskDetailsOnList(element?): FormGroup {
    if (element) {
      return this.formBuilder.group({
        Rsfnr: [element.Rsfnr],
        Rsfna: [element.Rsfna],
        Rsfkb: [element.Rsfkb],
        Rsfsn: [element.Rsfsn],
        Repdt: [element.Repdt],
        Einri: [this.selectedERList.Einri],
        Patnr: [this.selectedERList.Patnr],
        Lfdnr: [this.selectedERList.Lfdbw],
        Mode: [''],
        isChecked: [false],
      });
    } else {
      return this.formBuilder.group({
        Rsfnr: [''],
        Rsfna: [''],
        Rsfkb: [''],
        Rsfsn: [''],
        Repdt: [''],
        Einri: [this.selectedERList.Einri],
        Patnr: [this.selectedERList.Patnr],
        Lfdnr: [this.selectedERList.Lfdbw],
        Mode: [''],
        isChecked: [true],
      });
    }
  }

  saveRiskJsonFormat() {
    this.isFormValidError = true;
    this.riskJson = [];
    let mode = '';
    if (this.isRiskUpdate) {
      mode = 'U';
    } else {
      mode = 'I';
    }
    let finallfdnrValue;
    if (mode == 'I') {
      finallfdnrValue = '000';
    } else {
      finallfdnrValue = this.selectedDataForUpdate.Lfdnr;
    }
    let reportedon = '';
    if (this.updateRiskForm.controls.Repdt.value !== '') {
      reportedon =
        this.updateRiskForm.controls.Repdt.value.getDate() +
        '.' +
        this.updateRiskForm.controls.Repdt.value.getMonth(
          this.updateRiskForm.controls.Repdt.value.setMonth(
            this.updateRiskForm.controls.Repdt.value.getMonth() + 1
          )
        ) +
        '.' +
        this.updateRiskForm.controls.Repdt.value.getFullYear();
    }
    this.riskJson = [
      {
        Patnr: this.selectedERList.Patnr,
        Lfdnr: finallfdnrValue,
        Rsfnr: this.updateRiskForm.controls.Rsfnr.value,
        Rsfna: this.updateRiskForm.controls.Rsfna.value,
        Rsfkb: this.updateRiskForm.controls.Rsfkb.value,
        Rsfsn: this.updateRiskForm.controls.Rsfsn.value,
        Mode: mode,
      },
    ];
    if (this.updateRiskForm.controls.Repdt.value !== '') {
      (reportedon =
        this.updateRiskForm.controls.Repdt.value.getFullYear() +
        '-' +
        String(
          this.updateRiskForm.controls.Repdt.value.getMonth() + 1
        ).padStart(2, '0') +
        '-' +
        String(this.updateRiskForm.controls.Repdt.value.getDate()).padStart(
          2,
          '0'
        ) +
        'T00:00:00'),
        (this.riskJson[0]['Repdt'] = reportedon);
    }
    this.saveRiskList();
  }
  saveRiskList() {
    if (this.riskJson[0]['Mode'] !== 'D') {
      if (this.updateRiskForm.controls.Rsfna.value == '') {
        Swal.fire({
          text: 'Risk Code is Mandatory',
          icon: 'error',
          confirmButtonText: 'Ok',
          customClass: { popup: 'myalertpopup' },
        });
      } else {
        const json = {
          Patnr: this.selectedERList.Patnr,
          PatRiskHdrToItmNav: {
            results: this.riskJson,
          },
        };
        this.emergencyService.saveRiskList(json).subscribe(
          (_success: any) => {
            this.resetRiskForm();
            this.resetUpdateRiskForm();
            this.getRiskList(this.selectedERList);
            Swal.fire({
              text: 'Saved successfully',
              icon: 'success',
              confirmButtonText: 'Ok',
              customClass: { popup: 'myalertpopup' },
            });
            this.isFormValidError = false;
          },
          (_error: any) => { }
        );
      }
    } else if (this.riskJson[0]['Mode'] == 'D') {
      const json = {
        Patnr: this.selectedERList.Patnr,
        PatRiskHdrToItmNav: {
          results: this.riskJson,
        },
      };
      this.emergencyService.saveRiskList(json).subscribe(
        (_success: any) => {
          this.resetRiskForm();
          this.resetUpdateRiskForm();
          this.getRiskList(this.selectedERList);
          Swal.fire({
            text: 'Deleted successfully',
            icon: 'success',
            confirmButtonText: 'Ok',
            customClass: { popup: 'myalertpopup' },
          });
        },
        (_error: any) => { }
      );
    } else {
      const json = {
        Patnr: this.selectedERList.Patnr,
        PatRiskHdrToItmNav: {
          results: this.riskJson,
        },
      };
      this.emergencyService.saveRiskList(json).subscribe(
        (_success: any) => {
          this.resetRiskForm();
          this.resetUpdateRiskForm();
          this.getRiskList(this.selectedERList);
          Swal.fire({
            text: 'Saved successfully',
            icon: 'success',
            confirmButtonText: 'Ok',
            customClass: { popup: 'myalertpopup' },
          });
        },
        (_error: any) => { }
      );
    }
  }

  openModalForProgressNotes(item) {
    item['admissionDate'] = this.getDate(item.Datum);
    this.progressNotesKardex.openProgressNotesModal(item);
  }

  openVisitComments(template: TemplateRef<any>, data) {
    const config: ModalOptions = { class: 'modal-dialog-centered modal-lg' };
    this.modalRef = this.modalService.show(template, config);
    this.visitComments = data.VisitComments;
    this.modalRef.onHide.subscribe((reason: string | any) => {
      if (reason === 'backdrop-click') {

      }
    });
  }

  openCommonModal(template: TemplateRef<any>, column) {
    const config: ModalOptions = { class: 'modal-dialog-centered' };
    this.modalRef = this.modalService.show(template, config);
    this.colName = column;
    if (column == 'Allergen') {
      this.modalCommonDataArr = this.allergenValues;
      this.searchString = this.updateAllergyForm.controls.Allergen.value;
      this.someMethod(this.searchString);
    }
    if (column == 'Allergen group') {
      this.modalCommonDataArr = this.allergenGroupValues;
    }
    if (column == 'Certainty') {
      this.modalCommonDataArr = this.allergyCertaintyValues;
    }
    if (column == 'Evaluation') {
      this.modalCommonDataArr = this.allergyEvaluationValues;
    }
    if (column == 'Allergic reaction') {
      this.modalCommonDataArr = this.allergyReactionValues;
    }
    if (column == 'Severity') {
      this.modalCommonDataArr = this.severityValues;
    }
    if (column == 'Allergy type') {
      this.modalCommonDataArr = this.allergyTypeValues;
    }
    if (column == 'Comments') {
      this.modalCommonDataArr = this.allergenValues;
    }
    if (column == 'RiskCode') {
      this.modalCommonDataArr = this.riskValues;
      this.searchString = this.updateRiskForm.controls.Rsfna.value;
      this.someMethod(this.searchString);
    }
  }

  someMethod(event: string) {
    if (this.modalCommonDataArr.length == 0) {
      if (this.colName == 'Allergen') {
        this.modalCommonDataArr = this.allergenValues;
      } else {
        this.modalCommonDataArr = this.riskValues;
      }
    } else {
      if (event == '') {
        if (this.colName == 'Allergen') {
          this.modalCommonDataArr = this.allergenValues;
        } else {
          this.modalCommonDataArr = this.riskValues;
        }
      } else {
        this.modalCommonDataArr = this.modalCommonDataArr.filter(
          (item: any) => {
            if (item.hasOwnProperty('Bcpname')) {
              return item.Bcpname.toLowerCase().includes(event.toLowerCase());
            } else {
              return item.Rsfna.toLowerCase().includes(event.toLowerCase());
            }
          }
        );
      }
    }
  }

  confirmationForRiskDelete(status, item) {
    Swal.fire({
      text: 'Are you sure you want to delete?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: { popup: 'myalertpopup' },
    }).then((result) => {
      if (result.value) {
        this.deleteRiskJson(item);
      }
    });
  }

  deleteRiskJson(item) {
    this.riskJson = [];
    this.riskJson = [
      {
        Patnr: this.selectedERList.Patnr,
        Lfdnr: item.Lfdnr,
        Rsfnr: item.Rsfnr,
        Rsfna: item.Rsfna,
        Rsfkb: item.Rsfkb,
        Rsfsn: item.Rsfsn,
        Mode: 'D',
      },
    ];
    this.saveRiskList();
  }

  selectValueFromList(item) {
    if (this.colName == 'Allergen') {
      this.updateAllergyForm.controls.Allergen.setValue(item.Bcpname);
      this.updateAllergyForm.controls.Allrgyid.setValue(item.Bcpid);
      this.updateAllergyForm.controls.Allrgycatlog.setValue(item.Bchid);
      this.updateAllergyForm.controls.AllergenGrp.setValue(item.BcpnameGroup);
      this.updateAllergyForm.controls.AllrgyidAgr.setValue(item.BcpidGroup);
      this.updateAllergyForm.controls.AllrgycatlogAgr.setValue(item.Bchid);
    }
    if (this.colName == 'Allergen group') {
      this.updateAllergyForm.controls.AllergenGrp.setValue(item.Bcpname);
      this.updateAllergyForm.controls.AllrgyidAgr.setValue(item.Bcpid);
      this.updateAllergyForm.controls.AllrgycatlogAgr.setValue(item.Bchid);
    }
    if (this.colName == 'Certainty') {
      this.updateAllergyForm.controls.CerText.setValue(item.CerText);
      this.updateAllergyForm.controls.Cert.setValue(item.Cer);
    }
    if (this.colName == 'Evaluation') {
      this.updateAllergyForm.controls.EvalTxt.setValue(item.EvalTxt);
      this.updateAllergyForm.controls.Eval.setValue(item.Eval);
    }
    if (this.colName == 'Allergic reaction') {
      this.updateAllergyForm.controls.ReaText.setValue(item.ReaText);
      this.updateAllergyForm.controls.Rea.setValue(item.Rea);
    }
    if (this.colName == 'Severity') {
      this.updateAllergyForm.controls.SoaText.setValue(item.SoaText);
      this.updateAllergyForm.controls.Soa.setValue(item.Soa);
    }
    if (this.colName == 'Allergy type') {
      this.updateAllergyForm.controls.TypText.setValue(item.TypText);
      this.updateAllergyForm.controls.Typ.setValue(item.Typ);
    }
    if (this.colName == 'Comments') {
      this.updateAllergyForm.controls.Adcomment.setValue(item.Adcomment);
      this.updateAllergyForm.controls.AdcommentLt.setValue(item.Adcomment);
    }
    if (this.colName == 'RiskCode') {
      this.updateRiskForm.controls.Rsfnr.setValue(item.Rsfnr);
      this.updateRiskForm.controls.Rsfna.setValue(item.Rsfna);
      this.updateRiskForm.controls.Rsfkb.setValue(item.Rsfkb);
    }
    this.modalRef.hide();
  }

  selectValueFromRiskTable(item) {
    this.isRiskUpdate = true;
    this.selectedDataForUpdate = item;
    this.updateRiskForm.controls.Rsfnr.setValue(item.Rsfnr);
    this.updateRiskForm.controls.Rsfna.setValue(item.Rsfna);
    this.updateRiskForm.controls.Rsfkb.setValue(item.Rsfkb);
    this.updateRiskForm.controls.Rsfsn.setValue(item.Rsfsn);
    this.updateRiskForm.controls.Repdt.setValue(item.Repdt);
  }

  public openModalForRisk(template: TemplateRef<any>, data: any) {
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-xl risk-modal-size',
    };
    this.modalRefForRisk = this.modalService.show(template, config);
    this.selectedERList = data;
    this.getRiskList(data);
    this.getRiskValues();
    this.isRiskUpdate = false;
    this.modalRefForRisk.onHide.subscribe((reason: string | any) => {
      if (reason === 'backdrop-click') {
        this.closeRiskModal();
      }
    });
  }

  closeRiskModal() {
    this.modalRefForRisk.hide();
    this.resetRiskForm();
    this.resetUpdateRiskForm();
    this.searchString = '';
  }

  resetUpdateRiskForm() {
    this.updateRiskForm.patchValue({
      Rsfnr: '',
      Rsfna: '',
      Rsfkb: '',
      Rsfsn: '',
      Repdt: '',
    });
    this.isRiskUpdate = false;
    this.isFormValidError = false;
  }

  resetRiskForm() {
    this.riskFormitems = this.riskform.get('riskFormitems') as FormArray;
    this.riskform.reset();
    this.riskFormitems.clear();
    this.riskItemsArr = [];
  }

  getRiskList(data) {
    const json = {
      einri: data.Einri,
      patnr: data.Patnr,
    };
    this.emergencyService.getRiskList(json).subscribe(
      (_success: any) => {
        this.riskList = [];
        this.riskList = _success.d.results;

        this.riskList.forEach((element) => {
          element['Repdt'] = new Date(element.Repdt);
          this.addItemForRisk(element);
        });
      },
      (_error: any) => { }
    );
  }
  getRiskValues() {

    this.emergencyService.getRiskValues().subscribe(
      (_success: any) => {
        this.riskValues = _success.d.results;
      },
      (_error: any) => { }
    );
  }

  getSpecialityCodes(storedUser): string[] {
    return storedUser
      .filter(item => item.SpecialityCode && item.SpecialityCode.trim() !== '') // Filter out items with blank or null SpecialityCode
      .map(item => item.SpecialityCode.trim()); // Map to an array of trimmed SpecialityCodes
  }
  getAttendPhy(storedUser: any[]): string[] {
    return storedUser
      .filter(item => item.AttendPhy && item.AttendPhy.trim() !== '') // Filter out items with blank or null SpecialityCode
      .map(item => item.AttendPhy.trim()) // Extract AttendPhy values
  }

  getErList(date?: any, formControlData?: any) {
    this.helperService.isNotAllowedSpinnerInAPI = true;
    return new Promise((resolve, reject) => {
      const storedUser = JSON.parse(localStorage.getItem('UserConfiguration')).results;
      let link = ``;
      if (storedUser.length > 1) {
        link = `e-prescription/ExceptCheckedOut?einri=${1000}&Erdat=${this.parseDate(date[0])}&datetime=${this.parseDate(date[1])}&Clinic=${this.getSpecialityCodes(storedUser) ? this.getSpecialityCodes(storedUser) : null}&AttendPhy=${this.getAttendPhy(storedUser) ? this.getAttendPhy(storedUser) : null}`
      } else {
        link = `e-prescription/ExceptCheckedOut?einri=${1000}&Erdat=${this.parseDate(date[0])}&datetime=${this.parseDate(date[1])}&Clinic=${this.getSpecialityCodes(storedUser)[0] ? this.getSpecialityCodes(storedUser)[0] : null}&AttendPhy=${this.getAttendPhy(storedUser)[0] ? this.getAttendPhy(storedUser)[0] : null}`
      }
      if (date != undefined) {
        this.ePrescriptionService.loadData(link, false, false, false, false).subscribe({
          next: (_success: any) => {
            // Handle successful data retrieval
            this.ERlistData = this.ERlistDataClone = [];
            if (_success.body.d.results.length > 0) {
              this.sendErPatientCount.emit(this.ERlistData.length);
              _success.body.d.results.forEach((element) => {
                if (element.StatusTxt != 'Checked Out') {
                  this.ERlistData.push(element);
                  this.sendErPatientCount.emit(this.ERlistData.length);
                }
              });
              this.ERlistData.forEach((element, index) => {
                if (element.TriageDate != null && element.TriageDate != '') {
                  this.getAssignedTime(this.getTime(element.TriageTime), this.getDate(element.TriageDate), index);
                } else {
                  this.ERlistData[index]['assignedTime'] = '';
                }
              });
              this.ERlistDataClone = this.ERlistData;
              this.lastIndex = this.ERlistData.length - 1;
              resolve(this.ERlistData);
            }
            this.filterListData(formControlData)
          },
          error: (err: any) => {
            // Handle errors if the request fails
            console.error('Error fetching ExceptCheckedOut Data:', err);
          },
          complete: () => {
            // Handle completion (optional), invoked when the observable completes
            // console.info('API Finish..');
          }
        });
        // this.ePrescriptionService.loadData(link, false, false, false, false).subscribe({
        //   next: (_success: any) => {
        //     // Handle successful data retrieval
        //     this.ERlistData = this.ERlistDataClone = [];
        //     if (_success.body.d.results.length > 0) {
        //       this.sendErPatientCount.emit(this.ERlistData.length);
        //       _success.body.d.results.forEach((element) => {
        //         if (element.StatusTxt != 'Checked Out') {
        //           this.ERlistData.push(element);
        //           this.sendErPatientCount.emit(this.ERlistData.length);
        //         }
        //       });
        //       this.ERlistData.forEach((element, index) => {
        //         if (element.TriageDate != null && element.TriageDate != '') {
        //           this.getAssignedTime(this.getTime(element.TriageTime), this.getDate(element.TriageDate), index);
        //         } else {
        //           this.ERlistData[index]['assignedTime'] = '';
        //         }
        //       });
        //       this.ERlistDataClone = this.ERlistData;
        //       this.lastIndex = this.ERlistData.length - 1;
        //       resolve(this.ERlistData);
        //     }
        //   },
        //   error: (err: any) => {
        //     // Handle errors if the request fails
        //     console.error('Error fetching ExceptCheckedOut Data:', err);
        //   },
        //   complete: () => {
        //     // Handle completion (optional), invoked when the observable completes
        //     // console.info('API Finish..');
        //   }
        // });
      }
    });
  }

  parseDate(date: any) {
    if (date !== null) {
      return `${new DatePipe('en-US').transform(date, "yyyy-MM-dd")}T${formatDate(date, "HH:mm:ss")}`;
    }
    return null;
  }

  getSelectedDates(dates) {
    this.todayDate = dates;
    this.getErList(dates).then((formValue: any) => {
      if (formValue) {
        formValue.forEach((ele: any) => {
          this.financialCategory.push(ele?.ZzfinCat);
          this.statusList.push(ele?.StatusTxt);
          this.doctorList.push(ele?.Behpersname);
        });
        this.financialCategory = Array.from(new Set(this.financialCategory.filter(category => category.trim() !== '')));
        this.statusList = Array.from(new Set(this.statusList.filter(category => category.trim() !== '')));
        this.doctorList = Array.from(new Set(this.doctorList.filter(category => category.trim() !== '')));
        const value = {
          filterFinCategtoryList: this.financialCategory,
          filterStatusList: this.statusList,
          filterDoctorList: this.doctorList,
        };
        this.filterListData(this.filterEvent);
        this.dataShareService.sendFilterType(FilterType.OpCheckIn$, true, value);
      }
    }).catch((error: any) => {
      console.error('Error scale:', error);
    });
  }


  filterEvent: any;
  filterListData(event) {
    console.log(event);
    if(!event) return
    this.filterEvent = event;
    // Check if Physician array exists and is not empty
    const selectedPhysicians = event.Physician && Array.isArray(event.Physician)
      ? event.Physician.map(item => item.$ngOptionLabel.trim())
      : [];

    // Check if FCategory array exists and is not empty
    const selectedFCategory = event.FCategory && Array.isArray(event.FCategory)
      ? event.FCategory.map(item => item.$ngOptionLabel.trim())
      : [];

    // Check if Status array exists and is not empty
    const selectedStatus = event.Status && Array.isArray(event.Status) && event.Status.length > 0
      ? event.Status.map(item => item.trim())
      : [];

    this.ERlistData = this.ERlistDataClone.filter(item => {
      const physicianMatches = selectedPhysicians.length === 0 || selectedPhysicians.includes(item.Behpersname.trim());
      const fCategoryMatches = selectedFCategory.length === 0 || selectedFCategory.includes(item.ZzfinCat.trim());
      const statusMatches = selectedStatus.length === 0 || selectedStatus.includes(item.StatusTxt.trim());
      return physicianMatches && fCategoryMatches && statusMatches;
    });
  }

  sortTime() {
    if (!this.asc) {
      this.asc = true;
      this.ERlistData.sort((a, b) => {
        const nameA = a.ZeitIntern.toUpperCase(); // ignore upper and lowercase
        const nameB = b.ZeitIntern.toUpperCase(); // ignore upper and lowercase
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
      this.ERlistData.sort((a, b) => {
        const nameA = a.ZeitIntern.toUpperCase(); // ignore upper and lowercase
        const nameB = b.ZeitIntern.toUpperCase(); // ignore upper and lowercase
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
      this.ERlistData.sort((a, b) => {
        const nameA = a.Patient.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Patient.toUpperCase(); // ignore upper and lowercase
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
      this.ERlistData.sort((a, b) => {
        const nameA = a.Patient.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Patient.toUpperCase(); // ignore upper and lowercase
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
  sortPhysician() {
    if (!this.asc) {
      this.asc = true;
      this.ERlistData.sort((a, b) => {
        const nameA = a.Behpersname.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Behpersname.toUpperCase(); // ignore upper and lowercase
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
      this.ERlistData.sort((a, b) => {
        const nameA = a.Behpersname.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Behpersname.toUpperCase(); // ignore upper and lowercase
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
      this.ERlistData.sort((a, b) => {
        const nameA = a.Patnr.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Patnr.toUpperCase(); // ignore upper and lowercase
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
      this.ERlistData.sort((a, b) => {
        const nameA = a.Patnr.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Patnr.toUpperCase(); // ignore upper and lowercase
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
  sortCaseNumber() {
    if (!this.asc) {
      this.asc = true;
      this.ERlistData.sort((a, b) => {
        const nameA = a.Falnr.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Falnr.toUpperCase(); // ignore upper and lowercase
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
      this.ERlistData.sort((a, b) => {
        const nameA = a.Falnr.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Falnr.toUpperCase(); // ignore upper and lowercase
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
  sortRoom() {
    if (!this.asc) {
      this.asc = true;
      this.ERlistData.sort((a, b) => {
        const nameA = a.BehraumKb.toUpperCase(); // ignore upper and lowercase
        const nameB = b.BehraumKb.toUpperCase(); // ignore upper and lowercase
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
      this.ERlistData.sort((a, b) => {
        const nameA = a.BehraumKb.toUpperCase(); // ignore upper and lowercase
        const nameB = b.BehraumKb.toUpperCase(); // ignore upper and lowercase
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
  sortCategory() {
    if (!this.asc) {
      this.asc = true;
      this.ERlistData.sort((a, b) => {
        const nameA = a.ZzfinCat.toUpperCase(); // ignore upper and lowercase
        const nameB = b.ZzfinCat.toUpperCase(); // ignore upper and lowercase
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
      this.ERlistData.sort((a, b) => {
        const nameA = a.ZzfinCat.toUpperCase(); // ignore upper and lowercase
        const nameB = b.ZzfinCat.toUpperCase(); // ignore upper and lowercase
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
  sortWaitTime() {
    if (!this.asc) {
      this.asc = true;
      this.ERlistData.sort((a, b) => {
        const nameA = a.assignedTime.toUpperCase(); // ignore upper and lowercase
        const nameB = b.assignedTime.toUpperCase(); // ignore upper and lowercase
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
      this.ERlistData.sort((a, b) => {
        const nameA = a.assignedTime.toUpperCase(); // ignore upper and lowercase
        const nameB = b.assignedTime.toUpperCase(); // ignore upper and lowercase
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
  sortTriage() {
    if (!this.asc) {
      this.asc = true;
      this.ERlistData.sort((a, b) => {
        const nameA = a.TriagePriorityCode.toUpperCase(); // ignore upper and lowercase
        const nameB = b.TriagePriorityCode.toUpperCase(); // ignore upper and lowercase
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
      this.ERlistData.sort((a, b) => {
        const nameA = a.TriagePriorityCode.toUpperCase(); // ignore upper and lowercase
        const nameB = b.TriagePriorityCode.toUpperCase(); // ignore upper and lowercase
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
  sortState = { column: '', direction: '' };
  sort(column: string) {
    if (this.sortState.column === column) {
      this.sortState.direction = this.sortState.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortState.column = column;
      this.sortState.direction = 'asc';
    }

    this.ERlistData.sort((a, b) => {
      if (a[column] < b[column]) {
        return this.sortState.direction === 'asc' ? -1 : 1;
      } else if (a[column] > b[column]) {
        return this.sortState.direction === 'asc' ? 1 : -1;
      } else {
        return 0;
      }
    });
  }
  // er bed code
  openModalForErBed(data) {
    this.erBed.openModalForErBed(data);
  }

  openModalForAllergy(template, data) {
    this.nurErAllergy.openModalForAllergy(template, data);
  }
  reload(event) {
    this.getErList();
  }
  // er-vitals
  openModalVital(item) {
    item['admissionDate'] = this.getDate(item.Datum);
    this.erVitalsModal.openModalForErVital(item);
  }
  redirectToTreatByName(data) {
    console.log('data', data);

    const json = {
      Patnr: data.Patnr,
      Einri: data.Einri,
      Falnr: data.Falnr,
      Lfdnr: data.Lfdbw,
    };
    this.storageService.setCheckinData(data);
    localStorage.setItem('checkindata', JSON.stringify(data));
    this.redirectToTreatment(json);
  }
  redirectToTreatment(data) {
    this.redirectCheckInData.emit(data);
  }

  changeStatus(event: any) {
    const json = {
      "Einri": event.Einri,
      "Falnr": event.Falnr,
      "Patnr": event.Patnr,
      "Lfdnr": '00001',
      "VisitStat": "58",
      "Sdate": new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0') + '-' + String(new Date().getDate()).padStart(2, '0') + 'T00:00:00',
      "Stime": 'PT' + new Date().getHours() + 'H' + new Date().getMinutes() + 'M' + '00S'
    };
    this._dataServices.changeStatus(json).subscribe({
      next: (_success: any) => {
        // Handle successful data retrieval
        this.getSelectedDates(this.todayDate);
      },
      error: (err: any) => {
        // Handle errors if the request fails
        this.sharedService.errorSwallModel(`Error :${err.error.error.message.value}`).then((result) => {
          if (result.value) {
            this.getSelectedDates(this.todayDate);
            this.modalService.hide();
          }
        })
      }
    });

  }

  pdfData: any;
  modalRefForLab: BsModalRef;
  printUrl: any;
  pdfUrl: any;
  activelabLabelData: any;

  public labPrintLabelModal(template: TemplateRef<any>, data: any) {
    this.getPrintUrl();
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-md lab-modal-size',
    };
    this.modalRefForLab = this.modalService.show(template, config);
    this.activelabLabelData = data
    this.modalRefForLab.onHide.subscribe((reason: string | any) => {
      if (reason === 'backdrop-click') {
        this.closeLabModal();
      }
    });
  }

  getPrintUrl() {
    this.emergencyService.getPrintLabel().subscribe((res: any) => {
      this.printUrl = res.d.results[0].Url
    })
  }

  closeLabModal() {
    this.modalRefForLab?.hide();
  }

  printLabel(template: TemplateRef<any>) {
    console.log(this.activelabLabelData, "activelabLabelData")
    if (this.activelabLabelData) {
      this.emergencyService
        .patientPrintLabel(this.activelabLabelData.Einri, this.activelabLabelData.Patnr)
        .subscribe(
          (res: any) => {
            if (res?.d?.DataRaw) {
              this.pdfData = res.d.DataRaw;
              this.opendocumentPdf(template);
              this.closeLabModal()
            } else {
              this.showError('No PDF data available.');
            }
          },
          (_error: any) => {
            this.showError('Something went wrong while fetching the label.');
          }
        );
    }
  }

  opendocumentPdf(template: TemplateRef<any>) {
    try {
      const byteArray = new Uint8Array(
        atob(this.pdfData).split('').map((char) => char.charCodeAt(0))
      );
      const file = new Blob([byteArray], { type: 'application/pdf' });
      this.pdfUrl = URL.createObjectURL(file);
      this.pdfFormOpen(); // Open the modal
    } catch (error) {
      this.showError('Error processing the PDF data.');
    }
  }

  pdfFormOpen() {
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-xl pdfmodal-size',
    };
    this.selectedIconPdf = this.modalService.show(this.selectIconPdf, config);
  }

  showError(message: string) {
    Swal.fire({
      text: message,
      icon: 'error',
      confirmButtonText: 'Ok',
      customClass: { popup: 'myalertpopup' },
    });
    this.closeLabModal(); // Ensure modal cleanup
  }

  closePdfModal() {
    this.OpenPdfModal.hide();
    this.closeLabModal()
  }

}
