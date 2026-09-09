import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { untilDestroyed } from '@ngneat/until-destroy';
import { EEmrService } from '@services/e-emr.service';
import { HospitalistService } from '@services/e-hospitalist/hospitalist.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { eOrderService } from '@services/eorder.service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { catchError, of } from 'rxjs';
import Swal from 'sweetalert2';
// import { ProgressNotesKardexComponent } from './progress-notes-kardex/progress-notes-kardex.component';

@Component({
  selector: 'app-consultations-orders',
  templateUrl: './consultations-orders.component.html',
  styleUrls: ['./consultations-orders.component.scss'],
})
export class ConsultationsOrdersComponent implements OnInit {
  @Output() reloadTableData = new EventEmitter();
  @Output() deleteItem = new EventEmitter<any>();
  // @ViewChild('progressNotesKardexId') progressNotesKardex: ProgressNotesKardexComponent;

  @Input() consultationsOrdersList: any;
  @Input() searchString: any;
  modalRef: BsModalRef;
  profileRes: any;
  columnList: string[] = [
    'Service Description',
    'Referral Physician',
    'Referral Specialty',
    'Status',
    'Remarks',
    'Requested by',
    'Request Date',
    'Request Time',
    'Action',
    'Delete',
  ];
  progressEntryForm: FormGroup;
  phyOrderform1: FormGroup;
  isCollpseOpen: boolean;
  record: any;
  items: FormArray;
  imageUrl: any;
  pdfUrl: any;
  checkedFlag: any;
  text: string;
  consultationData: any;
  ipListData: any;
  copyProgressEntry: boolean;
  showTextError: boolean;
  currentTime: string;
  ProgressNotesList: any[];
  occupationalGroupData: any;
  copyProgressEntryData: any;
  constructor(
    public emergencyService: EmergencyService,
    private _dataServices: EEmrService,
    private modalService: BsModalService,
    private storageService: StorageService,
    private sanitizer: DomSanitizer,
    public formBuilder: FormBuilder,
    public eorderService: eOrderService
  ) {
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
      text: [''],
    });
  }

  ngOnInit() {
    this.profileRes = this.storageService.getUserProfile();
  }
  get progressEntryControls() {
    return this.progressEntryForm.controls;
  }
  get phyOrderControls() {
    return this.phyOrderform1.controls;
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.consultationsOrdersList?.currentValue?.length) {
      this.isCollpseOpen = true;
    } else {
      this.isCollpseOpen = false;
    }
  }

  public openModalForConsultationCompletion(
    template: TemplateRef<any>,
    data: any
  ) {
    this.consultationData = data;
    if (this.consultationData.VkgidStatusText == 'Confirmed') {
      const config: ModalOptions = {
        class: 'modal-dialog-centered modal-lg completion-modal',
      };
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
  consultationCompletion() {
    const json = {
      Vkgid: this.consultationData.Vkgid,
      ActionComplete: 'X',
    };
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
        this.reloadTableData.emit();
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

   openModalForProgressNotes() {
    // this.progressNotesKardex.openProgressNotesModal('consultation');
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
  removeItems(i: number) {
    this.items.removeAt(i);
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
          PatientId: this.ipListData.Mrn,
          CaseId: this.ipListData.CaseNumber,
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
        },
        (_error: any) => {}
      );
    }
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
