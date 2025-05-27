import { DatePipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EEmrService } from '@services/e-emr.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { NurErAllergyComponent } from '../check-in/nur-er-allergy/nur-er-allergy.component';
import { ErVitalsComponent } from '../check-in/er-vitals/er-vitals.component';
import { DocumentingDeliveryComponent } from '../check-in/documenting-delivery/documenting-delivery.component';

@Component({
  selector: 'app-ldr-view',
  templateUrl: './ldr-view.component.html',
  styleUrls: ['./ldr-view.component.scss'],
})
export class LdrViewComponent implements OnInit {
  @Output() dataToParent = new EventEmitter<any>();
  @Output() sendErPatientCount = new EventEmitter<any>();
  @Output() onClickBox = new EventEmitter();
  @Output() redirectCheckInData = new EventEmitter<any>();
  @ViewChild('erVitalsModal') erVitalsModal: ErVitalsComponent;
  @ViewChild('nurErAllergy') nurErAllergy: NurErAllergyComponent;
  @ViewChild('deliveryModal') deliveryModal: DocumentingDeliveryComponent;
   @ViewChild('selectIconPdf', { static: true }) selectIconPdf: TemplateRef<any>;
  lastIndex: number;
  changeStatusForm: FormGroup;
  inHospitalist: any[] = [];
  sortColumn: string = 'Descr';
  sortOrder: string = 'asc';
  isFormValidError: boolean = false;
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
   specialtyValueArr: any = [];

  activelabLabelData: any;
    userConfiguration: any;
    pdfData: any;
    modalRefForLab: BsModalRef;
    printUrl: any;
    selectedDate: any;
    OpenPdfModal: BsModalRef;


     physicianValueArr: any = [];
  financialValueArr: any = [];
  roomidTextValueArr: any = [];
  statusValueArr: any = [];
  wardValueArr: any = [];
  dischargeTypeList = [
    {
      label: 'AMA',
      value: 'AM',
    },
    {
      label: 'Deceased',
      value: 'EX',
    },
    {
      label: 'Dis.to Ext.Hosp',
      value: 'DE',
    },
    {
      label: 'Left w/o treat',
      value: 'LW',
    },
    {
      label: 'Reg. Discharge',
      value: 'RD',
    },
  ];
  selectedERList: any;
  searchString: any;
  inHospitalistClone: any;
  constructor(
    private _dataServices: EEmrService,
    private storageService: StorageService,
    private emergencyService: EmergencyService,
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private modalServiceComp: NgbModal,
    public ePrescriptionService: EPrescriptionService
  ) {
    this.riskform = this.formBuilder.group({
      riskFormitems: new FormArray([]),
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
    this.LDRListSet();
  }

  LDRListSet(date?, physician?) {
    let fromdatevalue = '';
    let todatevalue = '';
    let physicianvalue = '';
    if (date) {
      fromdatevalue = date?.length
        ? `${new DatePipe('en-US').transform(date[0], 'yyyy-MM-dd')}T00:00:00`
        : '2020-01-01T00:00:00';
    }
    if (date) {
      todatevalue = date?.length
        ? `${new DatePipe('en-US').transform(date[1], 'yyyy-MM-dd')}T00:00:00`
        : '2025-08-27T00:00:00';
    }
    if (physician) {
      physicianvalue = JSON.stringify(physician);
    }
    this.ePrescriptionService
      .loadData(
        `eHospitalist/LDRListSet?Behperson=${physicianvalue}&FromDate=${'2020-01-01T00:00:00'}&ToDate=${'2025-08-27T00:00:00'}`,
        false,
        false,
        false,
        false
      )
      .subscribe((resp: any) => {
        if (
          resp.body &&
          resp.body.d &&
          resp.body.d.results &&
          resp.body.d.results.length
        ) {
          this.inHospitalistClone = resp.body.d.results[0]?.ToLDRBu?.results;
          this.inHospitalist = resp.body.d.results[0]?.ToLDRBu?.results;
          this.lastIndex = this.inHospitalist.length - 1;
           this.dataToParent.emit(this.inHospitalistClone);
          this.sendErPatientCount.emit(this.inHospitalist.length);
        }
      });
  }

  onSortClick(event, col: string) {
    this.SortLDRData(col);
  }

  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }

  SortLDRData(col: string): void {
    console.log('col--------', col);
    if (this.sortColumn == col) {
      if (this.sortOrder == 'asc') this.sortOrder = 'desc';
      else this.sortOrder = 'asc';
    } else {
      this.sortColumn = col;
      this.sortOrder = 'asc';
    }
    this.inHospitalist = this.inHospitalist.sort((a, b) => {
      if (a[col] < b[col]) return this.sortOrder == 'asc' ? -1 : 1;
      if (a[col] > b[col]) return this.sortOrder == 'asc' ? 1 : -1;
      return 0;
    });
  }
  admissionStatusModel: any;
  modalRefForRisk: BsModalRef;
  public openChangeAdmissionStatusModel(template: TemplateRef<any>, data: any) {
    this.admissionStatusModel = data;
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        admissionStatusModel: this.admissionStatusModel, // Pass data into the modal
      },
    };
    this.modalRefForRisk = this.modalService.show(template, config);
    this.changeStatusForm = this.formBuilder.group({
      Einri: [this.admissionStatusModel?.Einri],
      Falnr: [this.admissionStatusModel?.Falnr],
      Lfdnr: [this.admissionStatusModel?.Lfdbw],
      AdmStatusCode: [''],
      Bwidt: [new Date()],
      Bwizt: [''],
      Kztxt: [''],
      Bwart: [''],
      Pernr: [this.admissionStatusModel?.Behpersname],
    });

    this.modalRefForRisk.onHide.subscribe((reason: string | any) => {
      if (reason === 'backdrop-click') {
        this.closeRiskModal();
        this.admissionStatusModel = [];
      }
    });
  }

  closeRiskModal() {
    this.modalRefForRisk.hide();
  }

  getStatusValue() {
    let currentStatus = this.admissionStatusModel?.Besstattext;
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
    createTime = 'PT' + createTime[0] + 'H' + createTime[1] + 'M' + '00S';
    const json = {
      Einri: this.changeStatusForm.value.Einri,
      Falnr: this.changeStatusForm.value.Falnr,
      Lfdnr: this.changeStatusForm.value.Lfdnr,
      AdmStatusCode: visitStatCode.toString(),
      Bwidt: this.sanitizeSAPDateFormat(this.changeStatusForm.value.Bwidt),
      Bwizt: createTime,
      Kztxt: this.changeStatusForm.value.Kztxt,
      Bwart: this.changeStatusForm.value.Bwart,
      Pernr: this.admissionStatusModel?.Behpersname,
    };

    if (!json?.Bwart) {
      delete json.Bwart;
    }

    this.emergencyService.changeAdmissionStatus(json).subscribe({
      next: (_success: any) => {
        Swal.fire({
          text: 'Change Status Successfully',
          icon: 'success',
          confirmButtonText: 'Ok',
          customClass: 'myalertpopup',
        });
        this.LDRListSet();
        this.modalService.hide();
      },
      error: (err: any) => {
        // this.sharedService.errorSwallModel(`Error :${err.error.error.message.value}`).then((result) => { })
      },
    });
  }

  sanitizeSAPDateFormat(date: any) {
    if (typeof date === 'string') {
      return date;
    } else {
      return `\/Date(${date.getTime()})\/`;
    }
  }

  redirectToTreatByName(data) {
    const json = {
      Patnr: data.Patnr,
      Einri: data.Einri,
      Falnr: data.Falnr,
      Lfdnr: data.Lfdbw,
      Treatmentou: data?.Orgpf,
      redirectFor: '',
      doctype: '',
      action: '',
    };
    this.storageService.setCheckinData(data);
    localStorage.setItem('checkindata', JSON.stringify(data));
    localStorage.setItem('tabName', 'patientProfile');
    this.redirectToTreatment(json);
  }
  redirectToTreatment(data) {
    this.redirectCheckInData.emit(data);
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
          if (element.Repdt == '0000-00-00') {
            element['Repdt'] = '';
          } else {
            element['Repdt'] = new Date(element.Repdt);
          }
          this.addItemForRisk(element);
        });
      },
      (_error: any) => {}
    );
  }
  getRiskValues() {
    this.emergencyService.getRiskValues().subscribe(
      (_success: any) => {
        this.riskValues = _success.d.results;
      },
      (_error: any) => {}
    );
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
        Lfdnr: this.selectedERList.Lfdbw,
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
            this.LDRListSet();
            Swal.fire({
              text: 'Saved successfully',
              icon: 'success',
              confirmButtonText: 'Ok',
              customClass: 'myalertpopup',
            });
            this.isFormValidError = false;
          },
          (_error: any) => {}
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
          this.LDRListSet();
          this.getRiskList(this.selectedERList);
          Swal.fire({
            text: 'Deleted successfully',
            icon: 'success',
            confirmButtonText: 'Ok',
            customClass: 'myalertpopup',
          });
        },
        (_error: any) => {}
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
          this.LDRListSet();
          Swal.fire({
            text: 'Saved successfully',
            icon: 'success',
            confirmButtonText: 'Ok',
            customClass: 'myalertpopup',
          });
        },
        (_error: any) => {}
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

  resetRiskForm() {
    this.riskFormitems = this.riskform.get('riskFormitems') as FormArray;
    this.riskform.reset();
    this.riskFormitems.clear();
    this.riskItemsArr = [];
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

  openModalForAllergy(template, data) {
    let obj = {
      Institute: data.Einri,
      CaseNumber: data.Falnr,
      Mrn: data.Patnr,
      Lfdnr: data.Lfdbw,
      AdmissionDate:data?.Datum,
      Patname:data?.Patient
    };
    this.nurErAllergy.openModalForAllergy(template, obj);
  }

  openModalVital(item) {
    item['admissionDate'] = this.getDate(item.Datum);
     let obj = {
      Institute: item?.Einri,
      CaseNumber: item?.Falnr,
      Mrn: item?.Patnr,
      Lfdnr: item?.Lfdbw,
      AdmissionDate:item?.Datum,
      Patname:item?.Patient
    };
    this.erVitalsModal.openModalForErVital(obj);
  }

  reload(event) {
    this.LDRListSet();
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
    pdfFormOpen() {
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-xl pdfmodal-size',
    };
    this.selectedIconPdf = this.modalService.show(this.selectIconPdf, config);
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
  closePdfModal() {
    this.OpenPdfModal.hide();
    this.closeLabModal()
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

      selectedDetails : any;
  openDocumentingDeliveryModel(data){
     const config: ModalOptions = {
      class: 'modal-dialog-centered modal-xl pdfmodal-size',
    };
  
      this.selectedDetails = {
      Institute: data.Einri,
      CaseNumber: data.Falnr,
      Mrn: data.Patnr,
      Lfdnr: data.Lfdbw,
    };
    this.deliveryModal.openModalForDelivery('', this.selectedDetails);
   this.modalRefForRisk.onHide.subscribe((reason: string | any) => {
      if (reason === 'backdrop-click') {
        this.closeRiskModal();
      }
    });
  }

  filterListData(event) {
    this.physicianValueArr = [];
    this.statusValueArr = [];
    this.financialValueArr = [];
    this.roomidTextValueArr = [];
    if (event.Physician || event.Status || event.FCategory || event.FWard || event.FSpecialty || event.RoomidText) {
      let filterValue = this.inHospitalistClone;
      if (event.Physician && event.Physician?.length) {
        event.Physician.forEach((physicianValue) => {
          this.physicianValueArr.push(
            filterValue.filter((element) => {
              if (element.Behpersname === physicianValue.trimStart()) {
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
              if (element.BehraumKb === physicianValue.trimStart()) {
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
              if (element.BehraumKb == wardValue) {
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
              if (element.ZzfinCat == statusValue) {
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
      this.inHospitalist = filterValue;
      this.sendErPatientCount.emit(this.inHospitalist.length);
    } else {
      this.inHospitalist = this.inHospitalistClone;
      this.sendErPatientCount.emit(this.inHospitalist.length);
    }
  }
}
