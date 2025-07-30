import {
  Component,
  OnInit,
  OnChanges,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { environment } from 'src/environments/environment';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EEmrService } from '@services/e-emr.service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { catchError, of } from 'rxjs';
import Swal from 'sweetalert2';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HospitalistService } from '@services/e-hospitalist/hospitalist.service';
import { DatePipe } from '@angular/common';
import { AdminAttechmentComponent } from 'src/app/shared-module/admin-attechment/admin-attechment.component';
import { SharedService } from '@services/shared.service';

@Component({
  selector: 'app-arrival-main-list',
  templateUrl: './arrival-main-list.component.html',
  styleUrls: ['./arrival-main-list.component.scss']
})
export class ArrivalMainListComponent implements OnInit {

  @ViewChild('scroll', { read: ElementRef }) public scroll: ElementRef<any>;
  @Output() sendErPatientCount = new EventEmitter<any>();
  @Output() dataToParent = new EventEmitter<any>();
  @Output() redirectCheckInData = new EventEmitter<any>();
  @ViewChild('nurErAttechment') nurErAttechment: AdminAttechmentComponent;

  @Input() listItem: any = [];
  @Input() listType: string;
  @Input() LDRBirthUnit: any;
  @Input() searchString: string;
  @Input() showColumnsListView: any;
  @Output() onClickBox = new EventEmitter();
  progressEntryForm: FormGroup;
  phyOrderform1: FormGroup;
  items: FormArray;
  riskform: FormGroup;
  updateRiskForm: FormGroup;
  riskFormitems: FormArray;
  ipListData: any;
  copyProgressEntry: boolean = false;
  copyProgressEntryData: any;
  modalRef: BsModalRef;
  phyOrderAction: any;
  modalRefForRisk: BsModalRef;
  dischargeDisposition = [
    {
      value : 'T',
      label: 'Death'
    },
    {
      value : 'AF',
      label: 'Fit for Work'
    },
    {
      value : 'N',
      label: 'Normal'
    },
    {
      value : 'AU',
      label: 'Unable for Work'
    },
  ]
  @Output() openModuleKardex = new EventEmitter();
  @Output() openModuleAdmissionProcessEvent = new EventEmitter();
  @Output() openModuleDischargeProcessEvent = new EventEmitter();
  occupationalGroupData: any;
  currentTime: string;
  showTextError: boolean;
  profileRes: any;
  ProgressNotesList: any[];
  showPhyOrderError: boolean;
  phyOrderData: any;
  cancelReasonListData: any;
  physicianOrderList: any[];
  riskJson: any[];
  cancelReasonValue: any;
  errmsg: string;
  sortColumn: string = 'Descr';
  sortOrder: string = 'asc';
  sortDir = 1;

  isFormValidError: boolean = false;
  isRiskUpdate: boolean;
  selectedDataForUpdate: any;
  selectedERList: any;
  riskValues: any;

  sortable = true;
  riskItemsArr: any[];
  inArrivalslistList: any[];
  inArrivalslistListClone: any[];
  riskList: any[];
  constructor(private formBuilder: FormBuilder, private emergencyService: EmergencyService, private modalService: BsModalService, private hospitalistService: HospitalistService,
    private storageService: StorageService, private sharedService: SharedService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.arrivalList(new Date());
  }

  initForm() {
    this.updateRiskForm = this.formBuilder.group({
      Rsfnr: [''],
      Rsfna: ['', [Validators.required]],
      Rsfkb: [''],
      Rsfsn: [''],
      Repdt: [''],
    });

    this.riskform = this.formBuilder.group({
      riskFormitems: new FormArray([]),
    });
  }
  selectedDate: any;
  // 2025-05-10T00:00:00
  arrivalList(date?: any) {
    this.selectedDate = date;
    let dateFormate = `${new DatePipe('en-US').transform(this.selectedDate, 'yyyy-MM-dd')}T00:00:00`;
    console.log(dateFormate, date, "dateFormate")
    this.hospitalistService.getArrivalListSetAPI('1', '', dateFormate)
      .subscribe((data: any) => {
        this.inArrivalslistListClone = data?.d?.results;
        this.inArrivalslistList = data?.d?.results;
        this.dataToParent.emit(this.inArrivalslistListClone);
        this.sendErPatientCount.emit(this.inArrivalslistList.length);
      })
  }

  triageValueArr: any = [];
  physicianValueArr: any = [];
  statusValueArr: any = [];
  financialValueArr: any = [];
  roomidTextValueArr: any = [];
  wardValueArr: any = [];
  specialtyValueArr: any = [];
  filterListData(event) {
    if (
      event.Physician || event.Status || event.FCategory ||
      event.FWard || event.FSpecialty || event.RoomidText || event.CaseType
    ) {
      let filterValue = this.inArrivalslistListClone;

      if (event.Physician?.length) {
        filterValue = filterValue.filter(item =>
          event.Physician.includes(item.BehArztName?.trimStart())
        );
      }

      if (event.RoomidText?.length) {
        filterValue = filterValue.filter(item =>
          event.RoomidText.includes(item.Zimmkub?.trimStart())
        );
      }

      if (event.CaseType?.length) {
        filterValue = filterValue.filter(item =>
          event.CaseType.includes(item.Fatyptxt)
        );
      }

      if (event.FWard?.length) {
        filterValue = filterValue.filter(item =>
          event.FWard.includes(item.Orgpfkb)
        );
      }

      if (event.FSpecialty?.length) {
        filterValue = filterValue.filter(item =>
          event.FSpecialty.includes(item.Orgfakb)
        );
      }

      if (event.FCategory?.length) {
        filterValue = filterValue.filter(item =>
          event.FCategory.includes(item.ZzfinCat)
        );
      }

      this.inArrivalslistList = filterValue;
    } else {
      this.inArrivalslistList = this.inArrivalslistListClone;
    }

    this.sendErPatientCount.emit(this.inArrivalslistList.length);
  }

  asc: boolean;
  commanSorting(keyName: string) {
    if (!this.asc) {
      this.asc = true;
      this.inArrivalslistList.sort((a, b) => {
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
      this.inArrivalslistList.sort((a, b) => {
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
            this.arrivalList(this.selectedDate);
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
          this.arrivalList(this.selectedDate);
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
          this.arrivalList(this.selectedDate);
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

  selectValueFromRiskTable(item) {
    this.isRiskUpdate = true;
    this.selectedDataForUpdate = item;
    this.updateRiskForm.controls.Rsfnr.setValue(item.Rsfnr);
    this.updateRiskForm.controls.Rsfna.setValue(item.Rsfna);
    this.updateRiskForm.controls.Rsfkb.setValue(item.Rsfkb);
    this.updateRiskForm.controls.Rsfsn.setValue(item.Rsfsn);
    this.updateRiskForm.controls.Repdt.setValue(item.Repdt);
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

  redirectToTreatByName(data) {
    data.Patnr = data.Patnr.padStart(10, '0');;
    data.Einri = data.Einri ? data.Einri : '1000';
    data.Falnr = data.Falnr.padStart(10, '0');;
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

  openModalForAttechment(data) {
    data.Pnamec = data.Pnamec1;
    data.Patnr = data.Patnr;
    data.Falnr = data.Falnr;
    data.Bwidt = data.Bwidt;
    this.nurErAttechment.openModalForAttechment(data);
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

  admissionStatusModel: any;
  changeStatusForm: FormGroup;
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
      Einri: [this.admissionStatusModel?.Einri],
      Falnr: [this.admissionStatusModel?.Falnr],
      Lfdnr: [this.admissionStatusModel?.Lfdnr],
      AdmStatusCode: [''],
      Bwidt: [new Date()],
      Bwizt: [''],
      Kztxt: [''],
      Ezust: [''],
      Bwart: [''],
      Pernr: [this.admissionStatusModel?.BehArztName],
    });

    this.modalRefForRisk.onHide.subscribe((reason: string | any) => {
      if (reason === 'backdrop-click') {
        this.closeRiskModal();
        this.admissionStatusModel = [];
      }
    });
  }

  getStatusValue() {
    let currentStatus = this.admissionStatusModel.AdmissionStatus;
    if (currentStatus.toLowerCase() == 'planned arrival') {
      return 'Actual Arrival';
    } else if (currentStatus.toLowerCase() === 'actual arrival') {
      return 'Actual Admission';
    } else if (currentStatus.toLowerCase() === 'planned discharge') {
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
     if(!this.changeStatusForm.get('Bwizt')?.value){
          this.sharedService.waringSwallModel('Please Enter the Time')
          return
      }
    let createTime = this.changeStatusForm.controls.Bwizt.value.split(':');
    createTime = 'PT' + createTime[0] + 'H' + createTime[1] + 'M' + '00S'
    
    const json = {
      Einri: this.admissionStatusModel?.Einri,
      Falnr: this.admissionStatusModel?.Falnr,
      Lfdnr: this.admissionStatusModel?.Lfdnr,
      AdmStatusCode: visitStatCode.toString(),
      Bwidt: this.sanitizeSAPDateFormat(this.changeStatusForm.value.Bwidt),
      Bwizt: createTime,
      Kztxt: this.changeStatusForm.value.Kztxt,
      Ezust: this.changeStatusForm.value.Ezust,
      Bwart: this.changeStatusForm.value.Bwart,
      Pernr: this.admissionStatusModel.BehArztName,
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
        this.modalService.hide();
        this.arrivalList(this.selectedDate);
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

  onSortClick(event, col: string) {
    let target = event.currentTarget,
      classList = target.classList;
    if (classList.contains('fa-chevron-up') && this.sortable) {
      classList.remove('fa-chevron-up');
      classList.add('fa-chevron-down');
      this.sortDir = -1;
    } else if (classList.contains('fa-chevron-down') && this.sortable) {
      classList.add('fa-chevron-up');
      classList.remove('fa-chevron-down');
      this.sortDir = 1;
    } else {
      classList.remove('fa-chevron-down');
      classList.remove('fa-chevron-up');
    }

    this.SortData(col);
  }

  riskInformation(text: any) {
    return text?.replace(/[@\\"']/g, '').replace(/^.*?Q/, '');
  }

  SortData(col: string): void {
    if (this.sortColumn == col) {
      if (this.sortOrder == 'asc')
        this.sortOrder = 'desc';
      else
        this.sortOrder = 'asc';
    }
    else {
      this.sortColumn = col;
      this.sortOrder = 'asc';
    }
    this.listItem = this.listItem.sort((a, b) => {
      if (a[col] < b[col])
        return this.sortOrder == 'asc' ? -1 : 1;
      if (a[col] > b[col])
        return this.sortOrder == 'asc' ? 1 : -1;
      return 0;
    })
  }


  parsePayloadFormateTime(data: string) {
    if (data && data.length) {
      let hours = data.substring(2, 4);
      let minute = data.substring(5, 7);

      return `${hours}:${minute}`;
    }
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
