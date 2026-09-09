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
import { HospitalistType } from '../../../services/e-hospitalist/interfaces/hospitalist';
import { environment } from 'src/environments/environment';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EEmrService } from '@services/e-emr.service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { catchError, of } from 'rxjs';
import Swal from 'sweetalert2';
import { PhysicianOrderKardexComponent } from './physician-order-kardex/physician-order-kardex.component';
import { ProgressNotesKardexComponent } from './progress-notes-kardex/progress-notes-kardex.component';
import { NurErAllergyComponent } from './nur-er-allergy/nur-er-allergy.component';
import { ErVitalsComponent } from './er-vitals/er-vitals.component';

@UntilDestroy()
@Component({
  selector: 'app-main-hospitalist-list-view',
  templateUrl: './main-hospitalist-list-view.component.html',
  styleUrls: ['./main-hospitalist-list-view.component.scss'],
})
export class MainHospitalistListViewComponent implements OnInit, OnChanges {
  @ViewChild('scroll', { read: ElementRef }) public scroll: ElementRef<any>;
  @ViewChild('physicianOrderKardexId') physicianOrderKardex: PhysicianOrderKardexComponent;
  @ViewChild('progressNotesKardexId') progressNotesKardex: ProgressNotesKardexComponent;
  @ViewChild('nurErAllergy') nurErAllergy: NurErAllergyComponent;
  @ViewChild('erVitalsModal') erVitalsModal: ErVitalsComponent;

  @Input() listItem: Array<HospitalistType> = [];
  @Input() listType: string;
  @Input() LDRBirthUnit: any;
  @Input() searchString: string;
  @Input() showColumnsListView: any;
  @Output() onClickBox = new EventEmitter();
  progressEntryForm: FormGroup;
  phyOrderform1: FormGroup;
  items: FormArray;

  ipListData: any;
  copyProgressEntry: boolean = false;
  copyProgressEntryData: any;
  modalRef: BsModalRef;
  phyOrderAction: any;

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
  cancelReasonValue: any;
  errmsg: string;
  sortColumn: string = 'Descr';
  sortOrder: string = 'asc';
  sortDir = 1;
  sortable = true;
  updateRiskForm: FormGroup;
  riskform: FormGroup;
  riskFormitems: FormArray;

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
  colName: any;
  isRiskUpdate: boolean;
  selectedDataForUpdate: any;
  riskJson: any[];
  riskList: any[];
  modalRefForRisk: BsModalRef;
  selectedERList: any;
  riskItemsArr: any[];
  isFormValidError: boolean;
  constructor(
    private _dataServices: EEmrService,
    private storageService: StorageService,
    public emergencyService: EmergencyService,
    private modalService: BsModalService,
    private formBuilder: FormBuilder
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

    this.updateRiskForm = this.formBuilder.group({
      Rsfnr: [''],
      Rsfna: ['', [Validators.required]],
      Rsfkb: [''],
      Rsfsn: [''],
      Repdt: [''],
    });
  }

  ngOnInit(): void {
    this.profileRes = this.storageService.getUserProfile();
    this.progressEntryForm = this.formBuilder.group({
      progressDate: [''],
      progressTime: [''],
      assignment: [''],
      occupationalGroup: [''],
      text: ['']
    });

    this.phyOrderform1 = this.formBuilder.group({
      items: new FormArray([]),
      physicianNumber: [''],
      physicianName: [''],
    });
  }
  ngOnChanges() {
    if (this.scroll) this.scroll.nativeElement.scroll(0, 0);
  }

  addItem(): void {
    this.items = this.phyOrderform1.get('items') as FormArray;
    this.items.push(this.createNewOrder());
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

  SortLDRData(col: string): void {
    console.log('col--------', col);
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
    this.LDRBirthUnit = this.LDRBirthUnit.sort((a, b) => {

      if (a[col] < b[col])
        return this.sortOrder == 'asc' ? -1 : 1;
      if (a[col] > b[col])
        return this.sortOrder == 'asc' ? 1 : -1;
      return 0;
    })
  }

  onSortClick(event,col: string) {
    let target = event.currentTarget,
      classList = target.classList;
    if (classList.contains('fa-chevron-up') && this.sortable) {
      classList.remove('fa-chevron-up');
      classList.add('fa-chevron-down');
      this.sortDir=-1;
    } else if (classList.contains('fa-chevron-down') && this.sortable) {
      classList.add('fa-chevron-up');
      classList.remove('fa-chevron-down');
      this.sortDir=1;
    } else {
            classList.remove('fa-chevron-down');
      classList.remove('fa-chevron-up');
    }

    if(this.listType == '07')
      this.SortLDRData(col);
    else  
      this.SortData(col);
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


  redirectToeKardex(data) {
    this.openModuleKardex.emit(data);
  }
  redirectLDRToeKardex(data){
    const newJson = {
      Mrn:data.Patnr,
      Institute:data.Einri,
      CaseNumber:data.Falnr,
      Lfdnr:data.Lfdbw
    }
    this.openModuleKardex.emit(newJson);
  }
  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }

  openModuleAdmissionProcess(data) {
    this.openModuleAdmissionProcessEvent.emit(data);
    localStorage.removeItem('tabName');
  }

  openModuleDischargeProcess(data) {
    this.openModuleDischargeProcessEvent.emit(data);
    localStorage.removeItem('tabName');
  }

  parsePayloadFormateTime(data: string) {
    if (data && data.length) {
      let hours = data.substring(2, 4);
      let minute = data.substring(5, 7);

      return `${hours}:${minute}`;
    }
  }

  redirectToeKardexDialysis(data) {
    window.open(
      'e-kardex?patnr=' +
      data.Patnr +
      '&falnr=' +
      data.Falnr
      +
      '&einri=' +
      data.Einri +
      '&lfdnr=' + data.Lfdnr,
      '_blank'
    );
  }

  openModulePrescription(data) {
    window.open(
      'e-prescription?patnr=' +
        data.Patnr +
        '&falnr=' +
        data.Falnr +
        '&einri=' +
        data.Einri +
        '&lfdnr=' +
        data.Lfdnr,
      '_blank'
    );
  }

  openModuleLabChart(data) {
    window.open(
      environment.labChartUrl +
        'patnr=' +
        data.Patnr +
        '&falnr=' +
        data.Falnr +
        '&einri=' +
        data.Einri +
        '&lfdnr=' +
        data.Lfdnr +
        '&appl=LABCHART',
      '_blank'
    );
  }
  openModuleRad(data) {
    window.open(
      environment.radiologyUrl + 'patient_id=' + data.Patnr,
      '_blank'
    );
  }
  openModuleEOrder(data) {
    window.open(
      'e-order?patnr=' +
        data.Patnr +
        '&falnr=' +
        data.Falnr +
        '&einri=' +
        data.Einri +
        '&lfdnr=' +
        data.Lfdnr,
      '_blank'
    );
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
      const config: ModalOptions = { class: 'modal-dialog-centered modal-xl create-modal' };
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
    this.occupationalGroupList();
    this.phyOrderTableList(data)
  }

  phyOrderTableList(data) {
    const res = this.emergencyService.getPhyOrderSetDataSet(
      data.Einri,
      data.Falnr
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
      });
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

  occupationalGroupList() {
    this._dataServices.occupationalGroupList().subscribe(
      (_success: any) => {
        //_success = JSON.parse(_success._body);
        this.occupationalGroupData = _success.d.results;
        // this.phyOrderform1.controls.occupationalGroup.setValue(this.occupationalGroupData[2].Group);
        this.occupationalGroupData.forEach((element) => {
          if (element.Group == 'DOCT') {
            this.progressEntryForm.controls.occupationalGroup.setValue(
              element.Group
            );
          }
        });

        this.currentTime =
          new Date().getHours() + ':' + new Date().getMinutes();
        this.addItem()
        this.addItem()
        this.addItem()
        this.addItem()
      },
      (_error: any) => {}
    );
  }

  get progressEntryControls() {
    return this.progressEntryForm.controls;
  }

  createProgressEntry() {
    if (this.progressEntryControls.text.value == '') {
      this.showTextError = true;
    } else {
      var createTime = 'PT11H29M30S';
      if (this.progressEntryControls.progressTime.value) {
        createTime = this.progressEntryControls.progressTime.value.split(':');
        createTime = 'PT' + createTime[0] + 'H' + createTime[1] + 'M' + '00S';
      }
      let json;
      if (this.copyProgressEntry) {
        json = {
          PatientId: this.copyProgressEntryData.PatientId,
          CaseId: this.copyProgressEntryData.CaseId,
          ActionDate: this.progressEntryControls.progressDate.value
            .toISOString()
            .split('.')[0],
          ActionTime: createTime,
          ProfGroup: this.progressEntryControls.occupationalGroup.value,
          Text: this.progressEntryControls.text.value,
          EmployeeResp: this.copyProgressEntryData.EmployeeResp,
        };
      } else {
        json = {
          PatientId: this.ipListData.Patnr,
          CaseId: this.ipListData.Falnr,
          ActionDate: this.progressEntryControls.progressDate.value
            .toISOString()
            .split('.')[0],
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
          this.copyProgressEntry = false;
          this.copyProgressEntryData = '';
        },
        (_error: any) => {}
      );
    }
  }

  getProgressNotesData(data) {
    const res = this.emergencyService.getProgressNotesSetData(
      data.Patnr,
      data.Falnr
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
        console.log(this.ProgressNotesList, 'this.ProgressNotesList')
      });
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
      text: event.Text
    });
  }

  physicianOrderSet(phyOrderData, action) {
    let json;

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

  createPhysicianOrder() {
    if (this.items.controls[0].value.physicianOrder == '' && this.items.controls[1].value.physicianOrder == '' && this.items.controls[2].value.physicianOrder == '' && this.items.controls[3].value.physicianOrder == '') {
      this.showPhyOrderError = true;
    }
    else {
      console.log(this.phyOrderData, "phyOrderData");
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
          }

          this._dataServices.createPhysicianOrder(json).subscribe(
            (_success: any) => {
              this.modalRef.hide();
              this.phyOrderform1.reset();
              // this.refreshModules();
            },
            (_error: any) => { }
          );
        }
      })
    }

  }

  get phyOrderControls() {
    return this.phyOrderform1.controls;
  }
  actionPhysicianSet(data) {
    const json = {
      Einri:data.Einri,
      Falnr:data.Falnr,
      Lfdnr:data.Lfdbw,
      Pernr:this.storageService.getGpart()
    }
    this.emergencyService.actionPhysicianSet(json).subscribe(
      (_success: any) => {
        this.onClickBox.emit();
      // this.ERlistData = _success.d.results;
      //this.redirectToTreatment(data);
      },
      (_error: any) => {}
    );
  }
  openModuleLDRPrescription(data) {
    window.open(
      'e-prescription?patnr=' +
        data.Patnr +
        '&falnr=' +
        data.Falnr +
        '&einri=' +
        data.Einri +
        '&lfdnr=' +
        data.Lfdbw,
      '_blank'
    );
  }

  openModuleLDRLabChart(data) {
    window.open(
      environment.labChartUrl +
        'patnr=' +
        data.Patnr +
        '&falnr=' +
        data.Falnr +
        '&einri=' +
        data.Einri +
        '&lfdnr=' +
        data.Lfdbw +
        '&appl=LABCHART',
      '_blank'
    );
  }
  openModuleLDREOrder(data) {
    window.open(
      'e-order?patnr=' +
        data.Patnr +
        '&falnr=' +
        data.Falnr +
        '&einri=' +
        data.Einri +
        '&lfdnr=' +
        data.Lfdbw,
      '_blank'
    );
  }
  // phy order
openModalForPhysicianOrder(item) {
  this.physicianOrderKardex.openModalForPhyOrder(item);
  }
    // progress notes
    openModalForProgressNotes(item) {
      this.progressNotesKardex.openProgressNotesModal(item);
    }
    // 
    openModuleAdmissionProcessFromLDR(data) {
      const newJson = {
        Mrn:data.Patnr,
        Institute:data.Einri,
        CaseNumber:data.Falnr,
        Lfdnr:data.Lfdbw,
        Deptou:'OBYMDAMC'
      }
      this.openModuleAdmissionProcessEvent.emit(newJson);
      localStorage.removeItem('tabName');
    }

    openModalForAllergy(template, data) {
      this.nurErAllergy.openModalForAllergy(template, data);
    }


    openModalVital(item) {
      item['admissionDate'] = this.getDate(item.Datum);
      this.erVitalsModal.openModalForErVital(item);
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
          Patnr: this.selectedERList.Mrn,
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
            customClass: { popup: 'myalertpopup' },
          });
        } else {
          const json = {
            Patnr: this.selectedERList.Mrn,
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
          Patnr: this.selectedERList.Mrn,
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
          Patnr: this.selectedERList.Mrn,
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
          Patnr: this.selectedERList.Mrn,
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
    
    getRiskList(data) {
      console.log(data,'=========');
      
      const json = {
        einri: data.Institute,
        patnr: data.Mrn,
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
    showRiskDetailsOnList (element?): FormGroup {
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
}
