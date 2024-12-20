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
import { HospitalistService } from '@services/e-hospitalist/hospitalist.service';

@UntilDestroy()
@Component({
  selector: 'app-main-hospitalist-list-view',
  templateUrl: './main-hospitalist-list-view.component.html',
  styleUrls: ['./main-hospitalist-list-view.component.scss'],
})
export class MainHospitalistListViewComponent implements OnInit, OnChanges {
  @ViewChild('scroll', { read: ElementRef }) public scroll: ElementRef<any>;
  @Input() listItem: Array<HospitalistType> = [];
  @Input() listType: string;
  @Input() LDRBirthUnit: any;
  @Input() searchString: string;
  @Input() showColumnsListView: any;
  @Input() physicianList: any;
  @Output() onClickBox = new EventEmitter();
  @Output() reloadTableData = new EventEmitter();

  tableSortColumn: number = -1;
  tableSortDirection: 'asc' | 'desc' = 'asc';
  progressEntryForm: FormGroup;
  phyOrderform1: FormGroup;
  items: FormArray;
  modalData = {
    BreastFeed: '',
    Pregnant: '',
    billing: '',
    cashier: '',
    medical_nursing: '',
    pharmacy: '',
  };

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
  // sortColumn: string = 'Descr';
  sortOrder: string = 'asc';
  sortDir = 1;
  sortable = true;
  loginUserDetails = this.storageService.getUserProfile();
  sortColumn: string = 'AdmissionDate'; // Default sort column
  sortDirection: string = 'asc'; // Default sort direction
  sortState = { column: '', direction: '' };

  constructor(
    private _dataServices: EEmrService,
    private storageService: StorageService,
    private emergencyService: EmergencyService,
    private hospitalistService: HospitalistService,
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
  ) {
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
  PBData: any;
  openBreastfeedPopup(template: TemplateRef<any>, data: any
  ) {
    const config: ModalOptions = { class: 'modal-dialog-centered execute-delete-modal' };
    this.modalRef = this.modalService.show(template, config);
    this.PBData = data;
    this.modalData.Pregnant = this.PBData.Pregnant;
    this.modalData.BreastFeed = this.PBData.BreastFeed;
  }

  opendischargeStatus(template: TemplateRef<any>, data: any) {
    const config: ModalOptions = { class: 'modal-dialog-centered execute-delete-modal' };
    this.modalRef = this.modalService.show(template, config);
    const json = {
      Einri: '1000',
      PA: '',
      PP: 'X',
      PB: 'X',
      Falnr: data.CaseNumber,
    }
    this.hospitalistService.getDischargeApproval(json).subscribe({
      next: (resp: any) => {
        this.modalData.billing = resp.d.results[0].Billing;
        this.modalData.cashier = resp.d.results[0].Cashier;
        this.modalData.medical_nursing = resp.d.results[0].MedicalNursing;
        this.modalData.pharmacy = resp.d.results[0].Pharmacy;
      }
    })
  }

  saveBreastFeedData(item: any) {
    let payload = {
      "Einri": "1000",
      "Falnr": this.PBData.CaseNumber,
      "Zzpregnant": this.modalData.Pregnant,
      "ZzbreastFeed": this.modalData.BreastFeed
    }
    this.hospitalistService.pregnantIndSet(payload).subscribe((data: any) => {
      Swal.fire({
        title: 'Success',
        text: "BreastFeed / Pregnant Data Saved Successfully",
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
      }).then((result) => {
        if (result.value) {
          this.modalRef.hide();
          this.reloadTableData.emit('Home');
        }
      })
    })
  }

  SortLDRData(col: string): void {
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

  onSortClick(event, col: string) {
    let target = event.currentTarget;
    let classList = target.classList;
    if (classList.contains(' fa-arrow-up') && this.sortable) {
      classList.remove(' fa-arrow-up');
      classList.add('fa-arrow-down');
      this.sortDir = -1;
    } else if (classList.contains('fa-arrow-down') && this.sortable) {
      classList.add(' fa-arrow-up');
      classList.remove('fa-arrow-down');
      this.sortDir = 1;
    } else {
      classList.remove('fa-arrow-down');
      classList.remove(' fa-arrow-up');
    }

    if (this.listType == '07') {
      this.SortLDRData(col);
    } else {
      this.SortData(col);
    }
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


  // sortBy(column: string): void {
  //   if (this.sortColumn === column) {
  //     // If same column is clicked, reverse sort direction
  //     this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  //   } else {
  //     // If new column is clicked, set as the sort column with default direction
  //     this.sortColumn = column;
  //     this.sortDirection = 'asc';
  //   }

  //   // Perform sorting based on sortColumn and sortDirection
  //   this.listItem.sort((a, b) => {
  //     const modifier = this.sortDirection === 'desc' ? -1 : 1;
  //     if (a[this.sortColumn] < b[this.sortColumn]) {
  //       return -1 * modifier;
  //     }
  //     if (a[this.sortColumn] > b[this.sortColumn]) {
  //       return 1 * modifier;
  //     }
  //     return 0;
  //   });
  // }

  // sortBy(column: string): void {
  //   if (this.sortColumn === column) {
  //     // If same column is clicked, reverse sort direction
  //     this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  //   } else {
  //     // If new column is clicked, set as the sort column with default direction
  //     this.sortColumn = column;
  //     this.sortDirection = 'asc';
  //   }

  //   // Perform sorting based on sortColumn and sortDirection
  //   this.listItem.sort((a, b) => {
  //     const modifier = this.sortDirection === 'desc' ? -1 : 1;
  //     if (a[this.sortColumn] < b[this.sortColumn]) {
  //       return -1 * modifier;
  //     }
  //     if (a[this.sortColumn] > b[this.sortColumn]) {
  //       return 1 * modifier;
  //     }
  //     return 0;
  //   });
  // }

  sort(column: string) {
    if (this.sortState.column === column) {
      this.sortState.direction = this.sortState.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortState.column = column;
      this.sortState.direction = 'asc';
    }

    this.listItem.sort((a, b) => {
      if (a[column] < b[column]) {
        return this.sortState.direction === 'asc' ? -1 : 1;
      } else if (a[column] > b[column]) {
        return this.sortState.direction === 'asc' ? 1 : -1;
      } else {
        return 0;
      }
    });
  }

  getSortIcon(column: string) {
    if (this.sortState.column === column) {
      return this.sortState.direction === 'asc' ? './assets/img/sort-arrow-top.svg' : './assets/img/sort-arrow-down.svg';
    }
    return './assets/img/sort-arrow.svg';
  }

  redirectToeKardex(data) {
    this.openModuleKardex.emit(data);
  }

  redirectLDRToeKardex(data) {
    const newJson = {
      Mrn: data.Patnr,
      Institute: data.Einri,
      CaseNumber: data.Falnr,
      Lfdnr: data.Lfdbw
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


  public openModuleForRemoveMyList(
    data: any) {
    let payload = {
      "PatientNo": data.Mrn,
      "Physician": this.loginUserDetails.UserName,
      "CaseNo": data.CaseNumber
    }
    Swal.fire({
      text: `Are you sure you want to remove ${data.Patname} from your list?`,
      showCancelButton: true,
      icon: 'warning',
      confirmButtonText: 'Remove',
    }).then((result) => {
      if (result.value) {
        this.hospitalistService.removePatientListSet(payload).subscribe((data: any) => {
          Swal.fire({
            title: 'Success',
            text: "Patient removed from the list successfully",
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
          }).then((result) => {
            if (result.value) {
              this.reloadTableData.emit('Home');
            }
          })
        })
      }
    })

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
      (_error: any) => { }
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
        (_error: any) => { }
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
      Einri: data.Einri,
      Falnr: data.Falnr,
      Lfdnr: data.Lfdbw,
      Pernr: this.storageService.getGpart()
    }
    this.emergencyService.actionPhysicianSet(json).subscribe(
      (_success: any) => {
        this.onClickBox.emit();
        // this.ERlistData = _success.d.results;
        //this.redirectToTreatment(data);
      },
      (_error: any) => { }
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

  openModuleAdmissionProcessFromLDR(data) {
    const newJson = {
      Mrn: data.Patnr,
      Institute: data.Einri,
      CaseNumber: data.Falnr,
      Lfdnr: data.Lfdbw,
      Deptou: 'OBYMDAMC'
    }
    this.openModuleAdmissionProcessEvent.emit(newJson);
    localStorage.removeItem('tabName');
  }

  dischargeReloadData(event: any) {
    this.reloadTableData.emit('Home');
  }
}
