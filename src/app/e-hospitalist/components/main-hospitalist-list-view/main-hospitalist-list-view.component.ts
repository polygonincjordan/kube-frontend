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
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { EEmrService } from '@services/e-emr.service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { catchError, of } from 'rxjs';
import Swal from 'sweetalert2';
import { PhysicianOrderKardexComponent } from './physician-order-kardex/physician-order-kardex.component';
import { ProgressNotesKardexComponent } from './progress-notes-kardex/progress-notes-kardex.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DocumentingDeliveryComponent } from './documenting-delivery/documenting-delivery.component';
import { AdminAttechmentComponent } from 'src/app/shared-module/admin-attechment/admin-attechment.component';

@UntilDestroy()
@Component({
  selector: 'app-main-hospitalist-list-view',
  templateUrl: './main-hospitalist-list-view.component.html',
  styleUrls: ['./main-hospitalist-list-view.component.scss'],
})
export class MainHospitalistListViewComponent implements OnInit, OnChanges {
  @ViewChild('scroll', { read: ElementRef }) public scroll: ElementRef<any>;
  @ViewChild('nurErAttechment') nurErAttechment: AdminAttechmentComponent;

  @ViewChild('physicianOrderKardexId')
  physicianOrderKardex: PhysicianOrderKardexComponent;
  @ViewChild('progressNotesKardexId')
  progressNotesKardex: ProgressNotesKardexComponent;
  @Input() listItem: Array<HospitalistType> = [];
  @Input() listType: string;
  @Input() LDRBirthUnit: any;
  @Input() searchString: string;
  @Input() showColumnsListView: any;
  @Output() onClickBox = new EventEmitter();
  progressEntryForm: FormGroup;
  phyOrderform1: FormGroup;
  items: FormArray;
  changeStatusForm: FormGroup;
  ipListData: any;
  copyProgressEntry: boolean = false;
  copyProgressEntryData: any;
  modalRef: BsModalRef;
  phyOrderAction: any;
  @ViewChild('deliveryModal') deliveryModal: DocumentingDeliveryComponent;

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
  statusList = [
    {
      label: 'Planned',
      value: '20',
    },
    {
      label: 'Checked In',
      value: '30',
    },
    {
      label: 'Called',
      value: '55',
    },
    {
      label: 'Nurse Completed',
      value: '58',
    },
    {
      label: 'Physician Start',
      value: '60',
    },
    {
      label: 'Physician End',
      value: '65',
    },
    {
      label: 'Checked Out',
      value: '70',
    },
  ];
  public copyMsg: string | null = null;
  constructor(
    private _dataServices: EEmrService,
    private storageService: StorageService,
    private emergencyService: EmergencyService,
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private modalServiceComp: NgbModal
  ) {}

  ngOnInit(): void {
    this.profileRes = this.storageService.getUserProfile();
    this.progressEntryForm = this.formBuilder.group({
      progressDate: [''],
      progressTime: [''],
      assignment: [''],
      occupationalGroup: [''],
      text: [''],
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
    });
  }

  // openDocumentingDeliveryModel(data){
  //   console.log(data,"data")
  //   const modalRef  = this.modalServiceComp.open(DocumentingDeliveryComponent, { size: 'xl', backdrop: 'static', centered: true });
  //   // modalRef.componentInstance.someInput = data;
  // }

  SortLDRData(col: string): void {
    console.log('col--------', col);
    if (this.sortColumn == col) {
      if (this.sortOrder == 'asc') this.sortOrder = 'desc';
      else this.sortOrder = 'asc';
    } else {
      this.sortColumn = col;
      this.sortOrder = 'asc';
    }
    this.LDRBirthUnit = this.LDRBirthUnit.sort((a, b) => {
      if (a[col] < b[col]) return this.sortOrder == 'asc' ? -1 : 1;
      if (a[col] > b[col]) return this.sortOrder == 'asc' ? 1 : -1;
      return 0;
    });
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

    if (this.listType == '07') this.SortLDRData(col);
    else this.SortData(col);
  }

  SortData(col: string): void {
    if (this.sortColumn == col) {
      if (this.sortOrder == 'asc') this.sortOrder = 'desc';
      else this.sortOrder = 'asc';
    } else {
      this.sortColumn = col;
      this.sortOrder = 'asc';
    }
    this.listItem = this.listItem.sort((a, b) => {
      if (a[col] < b[col]) return this.sortOrder == 'asc' ? -1 : 1;
      if (a[col] > b[col]) return this.sortOrder == 'asc' ? 1 : -1;
      return 0;
    });
  }

  redirectToeKardex(data) {
    localStorage.setItem('checkindata', JSON.stringify(data));
    this.openModuleKardex.emit(data);
  }
  redirectLDRToeKardex(data) {
    const newJson = {
      Mrn: data.Patnr,
      Institute: data.Einri,
      CaseNumber: data.Falnr,
      Lfdnr: data.Lfdbw,
    };
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

  openModalForAttechment(data) {
    data.Pnamec = data.Patname;
    data.Patnr = data.Mrn;
    data.Falnr = data.CaseNumber;
    data.Bwidt = data.AdmissionDate;
    this.nurErAttechment.openModalForAttechment(data);
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
  redirectToeKardexDialysis(data) {
    window.open(
      'e-kardex?patnr=' +
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

copyToClipboard(text: string) {
  if (!text) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        this.copyMsg = 'Copied to clipboard!';
        setTimeout(() => (this.copyMsg = null), 2000);
      })
      .catch(() => {
        this.copyMsg = 'Failed to copy!';
        setTimeout(() => (this.copyMsg = null), 2000);
      });
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      const successful = document.execCommand('copy');
      this.copyMsg = successful ? 'Copied to clipboard!' : 'Failed to copy!';
    } catch (err) {
      this.copyMsg = 'Copy not supported!';
    }
    document.body.removeChild(textarea);
    setTimeout(() => (this.copyMsg = null), 2000);
  }
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
      const config: ModalOptions = {
        class: 'modal-dialog-centered execute-delete-modal',
      };
      this.modalRef = this.modalService.show(template, config);
    }
    if (action == 'delete') {
      const config: ModalOptions = {
        class: 'modal-dialog-centered execute-delete-modal',
      };
      this.modalRef = this.modalService.show(template, config);
    }
    if (action == 'create') {
      this.showPhyOrderError = false;
      this.phyOrderform1.controls['physicianNumber'].disable();
      this.phyOrderform1.controls['physicianName'].disable();
      const config: ModalOptions = {
        class: 'modal-dialog-centered modal-xl create-modal',
      };
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
    this.phyOrderform1.controls.physicianName.setValue(
      this.profileRes.GpartName
    );
    // this.phyOrderform1.controls.orderDate.setValue(new Date());
    this.occupationalGroupList();
    this.phyOrderTableList(data);
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

  public openModalForProgressEntry(template: TemplateRef<any>, data: any) {
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-xl progress-modal',
    };
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
        this.addItem();
        this.addItem();
        this.addItem();
        this.addItem();
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
        console.log(this.ProgressNotesList, 'this.ProgressNotesList');
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
      text: event.Text,
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

  selectedDetails: any;
  openDocumentingDeliveryModel(data) {
    console.log(data, 'data');
    this.selectedDetails = data;
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-xl pdfmodal-size',
    };
    // this.selectedIconPdf = this.modalService.show(this.deliveryModal, config);
    this.deliveryModal.openModalForDelivery('', data);
    this.modalRefForRisk.onHide.subscribe((reason: string | any) => {
      if (reason === 'backdrop-click') {
        this.closeRiskModal();
      }
    });
  }

  reload(event: any) {}

  createPhysicianOrder() {
    if (
      this.items.controls[0].value.physicianOrder == '' &&
      this.items.controls[1].value.physicianOrder == '' &&
      this.items.controls[2].value.physicianOrder == '' &&
      this.items.controls[3].value.physicianOrder == ''
    ) {
      this.showPhyOrderError = true;
    } else {
      console.log(this.phyOrderData, 'phyOrderData');
      this.items.controls.forEach((element) => {
        if (element.value.physicianOrder != '') {
          var createTime = 'PT11H29M30S';
          if (element.value.orderTime.value) {
            createTime = this.phyOrderControls.orderTime.value.split(':');
            createTime =
              'PT' + createTime[0] + 'H' + createTime[1] + 'M' + '00S';
          }
          let json = {};

          if (this.phyOrderData.Einri) {
            json = {
              InstitutionId: this.phyOrderData.Einri,
              CaseId: this.phyOrderData.Falnr,
              CreationDate: element.value.orderDate.toISOString().split('.')[0],
              CreationTime: createTime,
              ZphysOrder: element.value.physicianOrder,
              EmployeeResp: this.phyOrderControls.physicianNumber.value,
              ProfessionalGroup: element.value.occupationalGroup,
            };
          }

          this._dataServices.createPhysicianOrder(json).subscribe(
            (_success: any) => {
              this.modalRef.hide();
              this.phyOrderform1.reset();
              // this.refreshModules();
            },
            (_error: any) => {}
          );
        }
      });
    }
  }

  get phyOrderControls() {
    return this.phyOrderform1.controls;
  }
  actionPhysicianSet(data) {
    const json = {
      Einri: data.Einri,
      Falnr: data.Falnr,
      Lfdnr: data.Lfdbw,
      Pernr: this.storageService.getGpart(),
    };
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
      Mrn: data.Patnr,
      Institute: data.Einri,
      CaseNumber: data.Falnr,
      Lfdnr: data.Lfdbw,
      Deptou: 'OBYMDAMC',
    };
    this.openModuleAdmissionProcessEvent.emit(newJson);
    localStorage.removeItem('tabName');
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

  changeStatus(event: any) {
    const json = {
            "Einri": event.Einri,
            "Falnr": event.Falnr,
            "Patnr": event.Patnr,
            "Lfdnr": '00001',
            "VisitStat": this.changeStatusForm.value.AdmStatusCode,
            "Sdate": new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0') + '-' + String(new Date().getDate()).padStart(2, '0') + 'T00:00:00',
            "Stime": 'PT' + new Date().getHours() + 'H' + new Date().getMinutes() + 'M' + '00S'
    };
    this._dataServices.changeStatus(json).subscribe({
      next: (_success: any) => {
        Swal.fire({
          text: 'Change Status Successfully',
          icon: 'success',
          confirmButtonText: 'Ok',
          customClass: 'myalertpopup',
        });

        this.modalRefForRisk?.hide();
        this.onClickBox.emit();
      },
      error: (err: any) => {
        Swal.fire({
          text: `Error :${err.error.error.message.value}`,
          icon: 'error',
          confirmButtonText: 'Ok',
          customClass: 'myalertpopup',
        });
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
}
