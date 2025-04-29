import { DatePipe } from '@angular/common';
import {
  Component,
  OnInit,
  EventEmitter,
  Output,
  ViewChild,
  TemplateRef,
  Input,
} from '@angular/core';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { ErBedComponent } from './er-bed/er-bed.component';
import { ErVitalsComponent } from './er-vitals/er-vitals.component';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NurErAllergyComponent } from './nur-er-allergy/nur-er-allergy.component';
import { StorageService } from '@services/storage.service';
import { ErTriageComponent } from './er-triage/er-triage.component';
import { PatientService } from '@services/e-kardex/patient.service';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { commonKeyValuePariExt1 } from '@services/e-kardex/interfaces/documents.interface';
import { Subscription, catchError, forkJoin, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HelperService } from '@services/helper.service';
import { DayCaseDashboardService } from '@services/day-case.dashboard/day-case-dashboard.service';
import { SharedService } from '@services/shared.service';
import { HospitalistService } from '@services/e-hospitalist/hospitalist.service';
import { EEmrService } from '@services/e-emr.service';
import { WardList } from '@services/e-hospitalist/interfaces/hospitalist';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DocumentingDeliveryComponent } from './documenting-delivery/documenting-delivery.component';
// import { dashboard } from 'src/environments/environment';
@UntilDestroy()
@Component({
  selector: 'app-check-in',
  templateUrl: './check-in.component.html',
  styleUrls: ['./check-in.component.scss'],
})
export class CheckInComponent implements OnInit {
  public triageList: commonKeyValuePariExt1[] = [
    { value: '0', label: 'Level I Resuscritation', TriagePriorityCode: '01', TriageColor: 'blue', isActive: false },
    { value: '1', label: 'Level II Emergency', TriagePriorityCode: '02', TriageColor: 'red', isActive: false },
    { value: '2', label: 'Level III Urgency', TriagePriorityCode: '03', TriageColor: 'yellow', isActive: false },
    { value: '3', label: 'Level IV Less Urgency', TriagePriorityCode: '04', TriageColor: 'green', isActive: false },
    { value: '4', label: 'Level V Non Urgency', TriagePriorityCode: '05', TriageColor: 'white', isActive: false }
  ];
  @ViewChild('selectIconPdf', { static: true }) selectIconPdf: TemplateRef<any>;

  @ViewChild('erBed') erBed: ErBedComponent;
  @ViewChild('erVitalsModal') erVitalsModal: ErVitalsComponent;
  @ViewChild('nurErAllergy') nurErAllergy: NurErAllergyComponent;
  @ViewChild('triageModal') triageModal: ErTriageComponent;
  @Output() sendErPatientCount = new EventEmitter<any>();
  @Output() redirectCheckInData = new EventEmitter<any>();
  @Output() dataToParent = new EventEmitter<any>();
  @Input() getConfigToolSpecialtyList
  @Input() getConfigToolWardList

  isFormValidError: boolean = false;
  searchString: string = '';
  ERlistData: any[];
  currentDateObj: any = [];
  ERlistDataClone: any = [];
  asc: boolean;
  triageValueArr: any = [];
  physicianValueArr: any = [];
  financialValueArr: any = [];
  roomidTextValueArr: any = [];
  statusValueArr: any = [];
  wardValueArr: any = [];
  specialtyValueArr: any = [];
  lastIndex: number;
  modalRefForRisk: BsModalRef;
  selectedERList: any;

  isRiskUpdate: boolean;
  riskList: any[];
  riskform: FormGroup;
  riskFormitems: FormArray;
  updateRiskForm: FormGroup;
  changeStatusForm: FormGroup;
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
  patnr: any;
  einri: any;
  lfdnr: any;
  falnr: any;
  queryNav: any;
  encounterId: any;
  pdfUrl: any;
  selectedIconPdf: BsModalRef;
  modalRefForTriage: BsModalRef;
  selectedPatientDetails: any;
  selectedRowOfAllTriage: any;
  selectedDocumentDetails: any;
  private refreshSubscription: Subscription;
  refreshInterval: any;
  admissionStatusModel: any;
  selectedStatus: any;

  dischargeTypeList = [
    {
      label: 'AMA',
      value: 'AM'
    },
    {
      label: 'Deceased',
      value: 'EX'
    },
    {
      label: 'Dis.to Ext.Hosp',
      value: 'DE'
    },
    {
      label: 'Left w/o treat',
      value: 'LW'
    },
    {
      label: 'Reg. Discharge',
      value: 'RD'
    },
  ]
  activelabLabelData: any;
  userConfiguration: any;
  pdfData: any;
  modalRefForLab: BsModalRef;
  printUrl: any;
  OpenPdfModal: BsModalRef;
  inHospitalistList: any = [];
  inHospitalistListClone: any = [];

  constructor(
    private emergencyService: EmergencyService,
    private modalService: BsModalService,
    private modalServicecom: NgbModal,
    private formBuilder: FormBuilder,
    private storageService: StorageService,
    private patientService: PatientService,
    private _route: ActivatedRoute,
    private helperService: HelperService,
    private dayCaseDashboardService: DayCaseDashboardService,
    public sharedService: SharedService,
    private hospitalistService: HospitalistService,
    private _EMRServices: EEmrService,
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

  ngOnInit(): void {
    if(this.emergencyService.callAgainAPI) {
      this.getHospitalList();
    }
    this.refreshInterval = setInterval(() => {
      this.getHospitalList();
    }, (30 * 60 * 1000));
    this._route.queryParams.subscribe((params) => {
      this.queryNav = params.nav;
      this.einri = params.einri;
      this.falnr = params.falnr;
      this.lfdnr = params.lfdnr;
    });
    // this.modalService.onHidden.subscribe((reason: string | undefined) => {
    //   this.getErList();
    // });
  }


  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  assignMe(data: any) {
    let obj = {
      Einri: data?.Einri,
      Falnr: data?.Falnr,
      Zznurse: data?.Zznurse
    }
    this.emergencyService.assignToMe(obj).subscribe((res: any) => {
      if (res) {
        this.getErList();
      }
    })
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
      const repdt = this.updateRiskForm.controls.Repdt.value;
      (reportedon =
        repdt.getFullYear() +
        '-' +
        String(repdt.getMonth()).padStart(2, '0') +
        '-' +
        String(repdt.getDate()).padStart(2, '0') +
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
          customClass: 'myalertpopup',
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
              customClass: 'myalertpopup',
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
            customClass: 'myalertpopup',
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
            customClass: 'myalertpopup',
          });
        },
        (_error: any) => { }
      );
    }
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
      customClass: 'myalertpopup',
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

  closeLabModal() {
    this.modalRefForLab?.hide();
  }

  getPrintUrl() {
    this.emergencyService.getPrintLabel().subscribe((res: any) => {
      this.printUrl = res.d.results[0].Url
    })
  }

  printLabel(template: TemplateRef<any>) {
    if (this.activelabLabelData) {
      this.emergencyService
        .patientPrintLabel(this.activelabLabelData.Institute, this.activelabLabelData.Mrn)
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


  closePdfModal() {
    this.OpenPdfModal.hide();
    this.closeLabModal()
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

  showError(message: string) {
    Swal.fire({
      text: message,
      icon: 'error',
      confirmButtonText: 'Ok',
      customClass: 'myalertpopup',
    });
    this.closeLabModal(); // Ensure modal cleanup
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

  admissionStatusCheck(item: any) {
    if(item?.PatientstatusPlandischarg == 'X') {
      return 'Planned Discharge';
    } else if(item?.PatientstatusAdmitted == 'X') {
      return 'Actual Admission';
    }
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
          if (element.Repdt == "0000-00-00") {
            element['Repdt'] = '';

          } else {
            element['Repdt'] = new Date(element.Repdt);

          }
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

  // getHospitalList() {
  //   // this.dataOnTableForMissedDoses = _success.result.d.results;
  //   let admittedFrom = '';
  //   let admittedTo = '';
  //   let wardNo = '';
  //   let physician = '';
  //   let speciality = '';
  //   const resp = this.hospitalistService.getIpListDataSet('02', admittedFrom, admittedTo, wardNo, physician, speciality, '');

  //   this.hospitalistService.getInHospitalistData$
  //     .pipe(
  //       untilDestroyed(this),
  //       catchError((err) => {
  //         return of([]);
  //       })
  //     )
  //     .subscribe((data: any[]) => {
  //       data[0].ToIPList.results = data[0].ToIPList.results.filter(item => item.Floor != '9th Floor Day Surgery');

  //       let IPList: any[] = data[0].ToIPList.results;
  //       this.inHospitalistList = IPList.filter(item => item.PatientstatusDischarged !== 'X');
  //       let IPListClone: any[] = data[0].ToIPList.results;
  //       this.inHospitalistListClone = IPListClone.filter(item => item.PatientstatusDischarged !== 'X');
  //       console.log(this.inHospitalistList, "inHospitaDischargelistList");

  //       this.dataToParent.emit(this.inHospitalistListClone);
  //       this.lastIndex = this.inHospitalistList.length - 1;
  //     });
  // }

  getHospitalList( getConfigToolWardList?, getConfigToolSpecialtyList?, dates?) {
    console.log(this.emergencyService.getConfigToolWardList,this.emergencyService.getConfigToolSpecialtyList, dates,"---");
    
    // this.getConfigToolSpecialtyList = this.getConfigToolSpecialtyList ? this.getConfigToolSpecialtyList : getConfigToolSpecialtyList
    // this.getConfigToolWardList = this.getConfigToolWardList ? this.getConfigToolWardList : getConfigToolWardList
    this.userConfiguration = JSON.parse(localStorage.getItem('UserConfiguration'));
    // this.dataOnTableForMissedDoses = _success.result.d.results;
    let admittedFrom = dates?.length ? `${new DatePipe('en-US').transform(dates[0], 'yyyy-MM-dd')}T00:00:00` : '';
    let admittedTo = dates?.length ? `${new DatePipe('en-US').transform(dates[1], 'yyyy-MM-dd')}T00:00:00` : '';
    let wardNo = this.emergencyService.getConfigToolWardList ? this.emergencyService.getConfigToolWardList : '';
    let physician = '';
    let speciality = this.emergencyService.getConfigToolSpecialtyList ? this.emergencyService.getConfigToolSpecialtyList : '';
    // const resp = this.hospitalistService.getIpListDataSet('02', admittedFrom, admittedTo, wardNo, physician, speciality, '');

    this.hospitalistService.getInPatientAdmittedList('02', admittedFrom, admittedTo, wardNo, physician, speciality, '')
      .subscribe((data: any) => {
        console.log(data, "----");
        this.inHospitalistList = [];
        this.inHospitalistListClone = [];
        let patientList: any[] = data?.d?.results[0]?.ToIPList.results;
        patientList = patientList.map(item => ({ ...item, patientStatus: this.admissionStatusCheck(item) }));

        patientList = patientList.filter(item => item.Floor != '9th Floor Day Surgery');

        let IPList: any[] = patientList;
        this.inHospitalistList = IPList.filter(item => item.PatientstatusDischarged !== 'X');
        this.inHospitalistList = IPList.filter(item => item.Roomid);
        let IPListClone: any[] = patientList;
        this.inHospitalistListClone = IPListClone.filter(item => item.PatientstatusDischarged !== 'X');
        this.sendErPatientCount.emit(this.inHospitalistList.length);
        this.dataToParent.emit(this.inHospitalistListClone);
        this.lastIndex = this.inHospitalistList.length - 1;
        this.emergencyService.callAgainAPI = true;
      });
  }

  showAllRooms(isShowRooms?: any) {
    if(isShowRooms) {
      this.inHospitalistList = this.inHospitalistListClone;
    } else {
      this.inHospitalistList = this.inHospitalistListClone.filter(item => item.Roomid);
    }
  }

  getErList(date?: any) {
    const json = {
      fromDate: `${new DatePipe('en-US').transform(
        new Date(),
        'yyyy-MM-dd'
      )}T00:00:00`,
    }
    this.helperService.isNotAllowedSpinnerInAPI = true;
    this.dayCaseDashboardService.getDayCaseErCheckList(json).subscribe(
      (_success: any) => {
        // this.ERlistData = _success.d.results;
        this.ERlistData = [];
        if (_success.d.results.length > 0) {
          // if (_success.d.results.length == 0) {
          this.sendErPatientCount.emit(this.ERlistData.length);
          // }
          _success.d.results.forEach((element) => {
            if (element.AdmissionStatus != 'Actual Discharge') {
              this.ERlistData.push(element);
              this.sendErPatientCount.emit(this.ERlistData.length);
              //   //this.triagePriorityList(element);
            }
          });
          this.ERlistData.forEach((element, index) => {
            if (element.TriageDate != null && element.TriageDate != '') {
              this.getAssignedTime(
                this.getTime(element.TriageTime),
                this.getDate(element.TriageDate),
                index
              );
            } else {
              this.ERlistData[index]['assignedTime'] = '';
            }
          });
          this.ERlistDataClone = this.ERlistData;
          this.dataToParent.emit(this.ERlistDataClone);
          this.lastIndex = this.ERlistData.length - 1;
        }
      },
      (_error: any) => { }
    );
  }

  getSelectedDates(dates, getConfigToolWardList?, getConfigToolSpecialtyList?) {
    this.getHospitalList(getConfigToolWardList, getConfigToolSpecialtyList, dates);
  }

  commanSorting(keyName: string) {
    if (!this.asc) {
      this.asc = true;
      this.inHospitalistList.sort((a, b) => {
        const nameA = a[keyName].toUpperCase(); // ignore upper and lowercase
        const nameB = b[keyName].toUpperCase(); // ignore upper and lowercase
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
      this.inHospitalistList.sort((a, b) => {
        const nameA = a[keyName].toUpperCase(); // ignore upper and lowercase
        const nameB = b[keyName].toUpperCase(); // ignore upper and lowercase
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

  filterListData(event) {
    this.triageValueArr = [];
    this.physicianValueArr = [];
    this.statusValueArr = [];
    this.financialValueArr = [];
    this.roomidTextValueArr = [];
    if (event.Physician || event.Status || event.FCategory || event.FWard || event.FSpecialty || event.RoomidText) {
      let filterValue = this.inHospitalistListClone;
      if (event.Physician && event.Physician?.length) {
        event.Physician.forEach((physicianValue) => {
          this.physicianValueArr.push(
            filterValue.filter((element) => {
              if (element.AttendingDoctorName === physicianValue.trimStart()) {
                return element;
              }
            })
          );
        });
        filterValue = this.physicianValueArr.flat();
      }
      if (event.RoomidText && event.RoomidText?.length) {
        event.RoomidText.forEach((physicianValue) => {
          this.roomidTextValueArr.push(
            filterValue.filter((element) => {
              if (element.RoomidText === physicianValue.trimStart()) {
                return element;
              }
            })
          );
        });
        filterValue = this.roomidTextValueArr.flat();
      }
      if (event.Status && event.Status?.length) {
        event.Status.forEach((statusValue) => {
          this.statusValueArr.push(
            filterValue.filter((element) => {
              if (element.patientStatus == statusValue) {
                return element;
              }
            })
          );
        });
        filterValue = this.statusValueArr.flat();
      }
      if (event.FWard && event.FWard?.length) {
        event.FWard.forEach((wardValue) => {
          this.wardValueArr.push(
            filterValue.filter((element) => {
              if (element.Floor == wardValue) {
                return element;
              }
            })
          );
        });
        filterValue = this.wardValueArr.flat();
      }
      if (event.FSpecialty && event.FSpecialty?.length) {
        event.FSpecialty.forEach((wardValue) => {
          this.specialtyValueArr.push(
            filterValue.filter((element) => {
              if (element.DeptouDesc == wardValue) {
                return element;
              }
            })
          );
        });
        filterValue = this.specialtyValueArr.flat();
      }
      if (event.FCategory && event.FCategory?.length) {
        event.FCategory.forEach((statusValue) => {
          this.financialValueArr.push(
            filterValue.filter((element) => {
              if (element.FinancialCategory == statusValue) {
                return element;
              }
            })
          );
        });
        filterValue = this.financialValueArr.flat();

        // if (event.FCategory == 'Self-Pay') {
        //   filterValue = filterValue.filter((element: any) => {
        //     if (element.FinancialCategory === 'Self-Pay') {
        //       return element;
        //     }
        //   });
        // } else {
        //   filterValue = filterValue.filter((element: any) => {
        //     if (element.FinancialCategory !== 'Self-Pay') {
        //       return element;
        //     }
        //   });
        // }
      }
      this.inHospitalistList = filterValue;
      this.sendErPatientCount.emit(this.inHospitalistList.length);
    } else {
      this.inHospitalistList = this.inHospitalistListClone;
      this.sendErPatientCount.emit(this.inHospitalistList.length);
    }
  }

  sortTime() {
    if (!this.asc) {
      this.asc = true;
      this.ERlistData.sort((a, b) => {
        const nameA = a.Bwizt.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Bwizt.toUpperCase(); // ignore upper and lowercase
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
        const nameA = a.Bwizt.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Bwizt.toUpperCase(); // ignore upper and lowercase
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
        const nameA = a.Pnamec.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Pnamec.toUpperCase(); // ignore upper and lowercase
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
        const nameA = a.Pnamec.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Pnamec.toUpperCase(); // ignore upper and lowercase
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
        const nameA = a.BehArztName.toUpperCase(); // ignore upper and lowercase
        const nameB = b.BehArztName.toUpperCase(); // ignore upper and lowercase
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
        const nameA = a.BehArztName.toUpperCase(); // ignore upper and lowercase
        const nameB = b.BehArztName.toUpperCase(); // ignore upper and lowercase
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
  sortCase() {
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
  sortAdmission() {
    if (!this.asc) {
      this.asc = true;
      this.ERlistData.sort((a, b) => {
        const nameA = a.Allergies.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Allergies.toUpperCase(); // ignore upper and lowercase
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
        const nameA = a.Allergies.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Allergies.toUpperCase(); // ignore upper and lowercase
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
  sortDate() {
    if (!this.asc) {
      this.asc = true;
      this.ERlistData.sort((a, b) => {
        const nameA = a.Bwidt.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Bwidt.toUpperCase(); // ignore upper and lowercase
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
        const nameA = a.Bwidt.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Bwidt.toUpperCase(); // ignore upper and lowercase
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
  sortDept() {
    if (!this.asc) {
      this.asc = true;
      this.ERlistData.sort((a, b) => {
        const nameA = a.Orgfakb.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Orgfakb.toUpperCase(); // ignore upper and lowercase
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
        const nameA = a.Orgfakb.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Orgfakb.toUpperCase(); // ignore upper and lowercase
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
  sortDiagnosis() {
    if (!this.asc) {
      this.asc = true;
      this.ERlistData.sort((a, b) => {
        const nameA = a.Diagnose.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Diagnose.toUpperCase(); // ignore upper and lowercase
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
        const nameA = a.Diagnose.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Diagnose.toUpperCase(); // ignore upper and lowercase
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
  sortDiet() {
    if (!this.asc) {
      this.asc = true;
      this.ERlistData.sort((a, b) => {
        const nameA = a.Zznmealstat.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Zznmealstat.toUpperCase(); // ignore upper and lowercase
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
        const nameA = a.Zznmealstat.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Zznmealstat.toUpperCase(); // ignore upper and lowercase
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
  sortAttachment() {
    if (!this.asc) {
      this.asc = true;
      this.ERlistData.sort((a, b) => {
        const nameA = a.DokIcon.toUpperCase(); // ignore upper and lowercase
        const nameB = b.DokIcon.toUpperCase(); // ignore upper and lowercase
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
        const nameA = a.DokIcon.toUpperCase(); // ignore upper and lowercase
        const nameB = b.DokIcon.toUpperCase(); // ignore upper and lowercase
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
  sortIsolation() {
    if (!this.asc) {
      this.asc = true;
      this.ERlistData.sort((a, b) => {
        const nameA = a.Zzisoindi.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Zzisoindi.toUpperCase(); // ignore upper and lowercase
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
        const nameA = a.Zzisoindi.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Zzisoindi.toUpperCase(); // ignore upper and lowercase
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
  sortIFinClearance() {
    if (!this.asc) {
      this.asc = true;
      this.ERlistData.sort((a, b) => {
        const nameA = a.ZzfinClear.toUpperCase(); // ignore upper and lowercase
        const nameB = b.ZzfinClear.toUpperCase(); // ignore upper and lowercase
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
        const nameA = a.ZzfinClear.toUpperCase(); // ignore upper and lowercase
        const nameB = b.ZzfinClear.toUpperCase(); // ignore upper and lowercase
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
  sortRoom() {
    if (!this.asc) {
      this.asc = true;
      this.ERlistData.sort((a, b) => {
        const nameA = a.Zimmkub.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Zimmkub.toUpperCase(); // ignore upper and lowercase
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
        const nameA = a.Zimmkub.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Zimmkub.toUpperCase(); // ignore upper and lowercase
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
        const nameA = a.KostrName.toUpperCase(); // ignore upper and lowercase
        const nameB = b.KostrName.toUpperCase(); // ignore upper and lowercase
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
        const nameA = a.KostrName.toUpperCase(); // ignore upper and lowercase
        const nameB = b.KostrName.toUpperCase(); // ignore upper and lowercase
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
  // er bed code
  openModalForErBed(data) {
    this.erBed.openModalForErBed(data);
  }

  openModalForAllergy(template, data) {
    this.nurErAllergy.openModalForAllergy(template, data);
  }

  openModalForTriage(template, data) {
    // Assuming this is within a method of your component or service
    const json = { "patnr": data.Patnr, "falnr": data.Falnr };
    console.log(data);
    // Combine both API calls using forkJoin
    forkJoin([
      this.emergencyService.triagePriorityList(json),
      this.emergencyService.getTriageLatestDocumentSet(data)
    ]).subscribe({
      next: ([triageListResponse, latestDocumentResponse]: [any, any]) => {
        // Handle successful responses from both API calls

        // Handle triagePriorityList response
        const triageListData = triageListResponse.d.results[0];

        // Handle getTriageLatestDocumentSet response
        const latestDocumentData = latestDocumentResponse.d.results[0];
        // Handle triage popup open based on condition
        // Do whatever processing you need with the responses here
        if (latestDocumentData === undefined) {
          this.triageModal.openModalForMain(data, '', triageListData);
        }
        else {
          if (latestDocumentResponse.d.results.length) {
            this.triageModal.openModalForMain(data, latestDocumentData, triageListData);
          }
        }
      },
      error: (error: any) => {
        // Handle errors from either API call
        console.error('Error:', error);
      },
      complete: () => {
        // Handle completion (optional), invoked when both observables complete
        // This block will be executed once both observables complete
      }
    });
  }

  openReleasedDocPdf(traigeDetails: any) {
    this.emergencyService.getTriageReleasedPdfUrl(traigeDetails).subscribe((res: any) => {
      let byteArray = new Uint8Array(atob(res?.d?.AttachmentData).split("").map(char => char.charCodeAt(0)));
      let file = new Blob([byteArray], { type: "application/pdf" });
      this.pdfUrl = file;
      this.pdfFormOpen();
    })
  }

  pdfFormOpen() {
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-xl pdfmodal-size',
    };
    this.selectedIconPdf = this.modalService.show(this.selectIconPdf, config);
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

    data.Patnr = data.Mrn;
    data.Einri = data.Institute;
    data.Falnr = data.CaseNumber;
    data.Lfdnr = data.Lfdnr;

    const json = {
      Patnr: data.Patnr,
      Einri: data.Einri,
      Falnr: data.Falnr,
      Lfdnr: data.Lfdnr,
      Treatmentou: data.Orgpf,
      redirectFor: '',
      doctype: '',
      action: ''
    };
    this.storageService.setCheckinData(data);
    localStorage.setItem('checkindata', JSON.stringify(data));
    localStorage.setItem('tabName', 'patientProfile');
    this.redirectToTreatment(json);
  }
  redirectToTreatment(data) {
    this.redirectCheckInData.emit(data);
  }

  openVisitComments(template: TemplateRef<any>, data) {
    const config: ModalOptions = { class: 'modal-dialog-centered modal-lg' };
    this.modalRef = this.modalService.show(template, config);
    this.visitComments = data.VisitComments;
    this.modalRef.onHide.subscribe((reason: string | any) => {
    });
  }

  openStatusChange($event, item, template: TemplateRef<any>) {
    if (item.TriagePriorityCode != '') {
      $event.preventDefault();
      this.selectedPatientDetails = item;
      this.triageList.find((result) => {
        if (item.TriagePriorityCode === result.TriagePriorityCode) {
          result.isActive = true;
        }
      });
      let json = { "patnr": this.selectedPatientDetails.Patnr, "falnr": this.selectedPatientDetails.Falnr }
      this.emergencyService.triagePriorityList(json).subscribe({
        next: (data: any) => {
          // Handle successful data retrieval
          this.selectedDocumentDetails = data.d.results[0];
          const config: ModalOptions = { class: 'modal-dialog-centered modal-lg', ignoreBackdropClick: true };
          this.modalRefForTriage = this.modalService.show(template, config);
        },
        error: (err: any) => {
          // Handle errors if the request fails
          console.error('Error Data:', err);
        },
        complete: () => {
          // Handle completion (optional), invoked when the observable completes
          // console.log('Complete');
        }
      });
    }
  }

  closeTriageModal() {
    this.modalRefForTriage.hide();
    this.triageList.find((result) => {
      result.isActive = false;
    });
  }


  selectedNewTriageRow(data, index) {
    this.selectedRowOfAllTriage = data;
    this.triageList.forEach((element, i) => {
      if (index == i) {
        this.triageList[i].isActive = true;
      } else {
        this.triageList[i].isActive = false;
      }
    });

  }

  saveTriageStatus() {
    let payload = {
      Dockey: this.selectedDocumentDetails.Dockey,
      Dokst: this.selectedDocumentDetails.DocStatus,
      Dokvr: "",
      Dtid: "ZMED_TRPRI",
      DtidText: "",
      Einri: this.selectedPatientDetails.Einri,
      Etag: "",
      Falnr: this.selectedPatientDetails.Falnr,
      Lfdnr: this.selectedPatientDetails.Lfdbw,
      Mitarb: "",
      Mitarbname: "",
      Orgdo: "",
      Orgfa: "",
      Orgpf: "",
      Patnr: this.selectedPatientDetails.Patnr,
      Referredby: "",
      Released: false,
      TriageColor: this.selectedRowOfAllTriage.TriageColor,
      TriagePriorityCode: this.selectedRowOfAllTriage.TriagePriorityCode,
      TriagePriorityText: this.selectedRowOfAllTriage.label,
      Zimmr: "",
      Mode: true,
    }
    this.emergencyService.saveTriage(payload).subscribe({
      next: (data: any) => {
        // Handle successful data retrieval
        this.triageList.find((result) => {
          result.isActive = false;
        });
        this.modalRefForTriage.hide();
      },
      error: (error: any) => {
        // Handle errors if the request fails
        this.triageList.find((result) => {
          result.isActive = false;
        });
        this.modalRefForTriage.hide();
      },
    });
  }


  getShapeClass(status: string): string {
    switch (status) {
      case 'Green':
        return 'square';
      case 'Red':
        return 'circle';
      case 'Yellow':
        return 'triangle';
      default:
        return '';
    }
  }

  getTooltipText(status: string): string {
    switch (status) {
      case 'Red':
        return 'No Active Diet';
      case 'Green':
        return 'Active Diet Exist';
      default:
        return '';
    }
  }

  getAttachmentTooltip(status: string): string {
    switch (status) {
      case 'Red':
        return 'No Attached Documents';
      case 'Green':
        return 'Attached Documents Exist';
      default:
        return '';
    }
  }

  getFinTooltip(status: string): string {
    switch (status) {
      case 'Red':
        return 'Pending';
      case 'Green':
        return 'Completed';
      default:
        return '';
    }
  }


  public openChangeAdmissionStatusModel(template: TemplateRef<any>, data: any) {
    this.admissionStatusModel = data;
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        admissionStatusModel: this.admissionStatusModel // Pass data into the modal
      }
    };
    this.modalRefForRisk = this.modalService.show(template, config);
    this.changeStatusForm = this.formBuilder.group({
      Einri: [this.admissionStatusModel?.Institute],
      Falnr: [this.admissionStatusModel?.CaseNumber],
      Lfdnr: [this.admissionStatusModel?.Lfdnr],
      AdmStatusCode: [''],
      Bwidt: [new Date()],
      Bwizt: [''],
      Kztxt: [''],
      Bwart: [''],
      Pernr: [this.admissionStatusModel?.AttendingDoctorName],
    });

    this.modalRefForRisk.onHide.subscribe((reason: string | any) => {
      if (reason === 'backdrop-click') {
        this.closeRiskModal();
        this.admissionStatusModel = [];
      }
    });
  }


  openDocumentingDeliveryModel(data){
    console.log(data,"data")
    const modalRef  = this.modalServicecom.open(DocumentingDeliveryComponent, { size: 'xl', backdrop: 'static', centered: true });
    // modalRef.componentInstance.someInput = data;
  }


  getStatusValue() {
    let currentStatus = this.admissionStatusModel.AdmissionStatus;
    if (currentStatus === 'Planned Arrival') {
      return 'Actual Arrival';
    } else if (currentStatus === 'Actual Arrival') {
      return 'Planned Discharge';
    } else if (currentStatus === 'Planned Discharge') {
      return 'Actual Discharge';
    } else {
      return '';
    }
  }

  selectStatus(value) {
    if (value) {
      this.selectedStatus = value
    }
  }

  changeStatus(visitStat: string) {
    let visitStatCode: number;

    switch (visitStat.toLowerCase()) {
      case 'planned arrival':
        visitStatCode = 97;
        break;
      case 'actual arrival':
        visitStatCode = 98;
        break;
      case 'planned discharge':
        visitStatCode = 99;
        break;
      case 'actual discharge':
        visitStatCode = 96;
        break;
      default:
        visitStatCode = null; // Handle undefined cases
    }
    let createTime = this.changeStatusForm.controls.Bwizt.value.split(':');
    createTime = 'PT' + createTime[0] + 'H' + createTime[1] + 'M' + '00S'
    const json = {
      Einri: this.changeStatusForm.value.Einri,
      Falnr: this.changeStatusForm.value.Falnr,
      Lfdnr: this.changeStatusForm.value.Lfdnr,
      AdmStatusCode: visitStatCode.toString(),
      Bwidt: this.sanitizeSAPDateFormat(this.changeStatusForm.value.Bwidt),
      Bwizt: createTime,
      Kztxt: this.changeStatusForm.value.Kztxt,
      Bwart: this.changeStatusForm.value.Bwart,
      Pernr: this.admissionStatusModel.AttendingDoctor,
    };

    if (!json?.Bwart) {
      delete json.Bwart
    }

    this.emergencyService.changeAdmissionStatus(json).subscribe({
      next: (_success: any) => {
        Swal.fire({
          text: 'Change Status Successfully',
          icon: 'success',
          confirmButtonText: 'Ok',
          customClass: 'myalertpopup',
        });
        this.getHospitalList();
        this.modalService.hide();
      },
      error: (err: any) => {
        this.sharedService.errorSwallModel(`Error :${err.error.error.message.value}`).then((result) => { })
      }
    });

  }

  sanitizeSAPDateFormat(date: any) {
    if (typeof date === 'string') {
      return date;
    } else {
      return `\/Date(${date.getTime()})\/`;
    }
  }
}
