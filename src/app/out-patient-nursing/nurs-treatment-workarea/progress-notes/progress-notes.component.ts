import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  ProgressNotesCategoryModel,
  ProgressNotesListModel,
  ProgressNotesTemplateModel
} from '@services/admission/interfaces/template-model';
import { EEmrService } from '@services/e-emr.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { StorageService } from '@services/storage.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { catchError, of } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-progress-notes',
  templateUrl: './progress-notes.component.html',
  styleUrls: ['./progress-notes.component.scss'],
})
export class ProgressNotesComponent implements OnInit {
  @Input() occupationalGroupData: any = new EventEmitter();
  @Input() ProgressNotesList: ProgressNotesListModel[];
  @Input() searchString: any;
  @Output() dataToParents = new EventEmitter<any>();
  progressNoteForm: FormGroup;
  paramsObj: any = {};
  reloadPhyOrderList: boolean = false;
  categoryList: ProgressNotesCategoryModel[];
  templateList: ProgressNotesTemplateModel[];
  templteContent: any;
  userProfileDetail: any;
  selectedProgressNote: any;
  actionType: any;
  constructor(
    private formBuider: FormBuilder,
    public emergencyService: EmergencyService,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private _dataServices: EEmrService,
    private _storageService: StorageService
  ) {
    this.route.queryParams.subscribe((params) => {
      this.paramsObj.patientId = params.patnr;
      this.paramsObj.caseid = params.falnr;
      this.paramsObj.tretmentOU = params.tretmentOU;
    });
  }
  unsavedProgressNote: boolean = false;

  ngOnChange() {
    console.log(this.ProgressNotesList, "ProgressNotesList");
  }
  ngOnInit(): void {
    this.userProfileDetail = this._storageService.getUserProfile();
    this.initForm();
    // this.getProgressNotesData();
    this.getCategoryList();
    this.getProgressNotesTemplateList();
    this.progressNoteForm.get('Text')?.valueChanges.subscribe(value => {
      this.unsavedProgressNote = !!value; // true if there's any text
      this.dataToParents.emit(this.unsavedProgressNote)
    });
  }

  initForm() {
    this.progressNoteForm = this.formBuider.group({
      PatientId: [this.paramsObj.patientId],
      CaseId: [this.paramsObj.caseid],
      MovementId: ['00000'],
      ProfGroup: [this.userProfileDetail.ProfGroup],
      ActionDate: [new Date()],
      ActionTime: [new Date().getHours() + ':' + new Date().getMinutes()],
      DocumentOu: [this._storageService?.patientData?.deptOrgUnit],
      // DocumentOu: [this.paramsObj.tretmentOU],
      Text: ['', [Validators.required]],
      Category: [],
      EmployeeResp: ['9000000000'],
    });
  }

  getProgressNotesData() {
    const res = this.emergencyService.getProgressNotesSetData(
      this.paramsObj.patientId,
      this.paramsObj.caseid
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

  getCategoryList() {
    const res = this.emergencyService.getCategorySetData(
      this.paramsObj.patientId,
      this.paramsObj.caseid
    );

    this.emergencyService.categorySetData$
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((data: any[]) => {
        this.categoryList = data;
      });
  }

  getProgressNotesTemplateList() {
    const res = this.emergencyService.getNotesTemplateSetData(
      this.paramsObj.patientId,
      this.paramsObj.caseid
    );

    this.emergencyService.progressNoteTempSetData$
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((data: any[]) => {
        this.templateList = data;
      });
  }

  onDateChange() { }

  onTempleteSelect() {
    this.progressNoteForm.controls.Text.setValue(this.templteContent.N2Content);
  }

  createProgressNote() {

    if (this.actionType == 'replace') {
      let formGroup = {...this.progressNoteForm.value};
      let createTime = formGroup.ActionTime.split(':');
      formGroup.ActionTime =
        'PT' + createTime[0] + 'H' + createTime[1] + 'M' + '00S';
      const actionDate = new Date(formGroup.ActionDate);
      formGroup.ActionDate = this.dateConvertToSecond(actionDate);
      console.log(formGroup);

      let payload = {
        Notekey: this.selectedProgressNote.Notekey,
        PatientId: this.selectedProgressNote.PatientId,
        CaseId: this.selectedProgressNote.CaseId,
        MovementId: this.selectedProgressNote.MovementId,
        ActionDate: formGroup.ActionDate,
        ActionTime: formGroup.ActionTime,
        DocumentOu: this.progressNoteForm.value.DocumentOu,
        DocumentOuName: this.selectedProgressNote.DocumentOuName,
        EmployeeResp: this.userProfileDetail?.Gpart,
        EmployeeRespName: this.userProfileDetail?.EmployeeName,
        ProfGroup: this.progressNoteForm.value.ProfGroup,
        ProfGroupName: this.selectedProgressNote.ProfGroupName,
        Text: this.progressNoteForm.value.Text,
        Category: this.progressNoteForm.value.Category,
        CategoryText: this.selectedProgressNote.CategoryText,
        Cancelled: this.selectedProgressNote.Cancelled,
        CancelCause: this.selectedProgressNote.CancelCause,
        CancelCauseText: this.selectedProgressNote.CancelCauseText,
        CancelDate: this.selectedProgressNote.CancelDate,
        CancelUser: this.selectedProgressNote.CancelUser,
        CancelUserName: this.selectedProgressNote.CancelUserName,
        CreationDate: this.selectedProgressNote.CreationDate,
        CreationTime: this.selectedProgressNote.CreationTime,
        CreationUser: this.selectedProgressNote.CreationUser,
        CreationUserName: this.selectedProgressNote.CreationUserName,
        DeleteAuth: true
      }

      console.log(payload);
       this._dataServices.replaceProgressEntry(payload)
          .subscribe(
            (_success: any) => {
              // if (_success) {
                this.initForm();
                this.getProgressNotesData();
                this.templteContent = '';
                this.unsavedProgressNote = false;
                this.dataToParents.emit(this.unsavedProgressNote);
                this.emergencyService.successSwalModel(
                  'Progress note is replace successfully'
                );
              // }
            },
            (_error: any) => { }
          );
      
      return;
    }

    if (this.progressNoteForm.value.ProfGroup) {
      if (this.progressNoteForm.value.Text) {
        let formGroup = {...this.progressNoteForm.value};
        let createTime = formGroup.ActionTime.split(':');
        formGroup.ActionTime =
          'PT' + createTime[0] + 'H' + createTime[1] + 'M' + '00S';
        const actionDate = new Date(formGroup.ActionDate);
        actionDate.setHours(parseInt(createTime[0]), parseInt(createTime[1]), 0, 0);
        formGroup.ActionDate = actionDate.toISOString().split('.')[0];
        formGroup.EmployeeResp = this.userProfileDetail?.Gpart;
        this._dataServices.createProgressEntry(formGroup)
          .subscribe(
            (_success: any) => {
              if (_success) {
                this.initForm();
                this.getProgressNotesData();
                this.templteContent = '';
                this.unsavedProgressNote = false;
                this.dataToParents.emit(this.unsavedProgressNote);
                this.emergencyService.successSwalModel(
                  'Progress note is created successfully'
                );
              }
            },
            (_error: any) => { }
          );
      } else {
        this.emergencyService.errorSwalModel('Please add note text');
      }
    } else {
      this.emergencyService.errorSwalModel('Please select occupational group');
    }
  }

  reloadPhyOrderListEvent(event) {
    if (event) {
      this.getProgressNotesData();
    }
  }

  copyProgressNotesEvent(event: any) {
    this.selectedProgressNote = event.value;
    this.actionType = event.type;
    this.progressNoteForm.patchValue({
      PatientId: event.value.PatientId,
      CaseId: event.value.CaseId,
      MovementId: event.value.MovementId,
      DocumentOu: event.value.DocumentOu,
      Text: event.value.Text,
      Category: event.value.Category,
      EmployeeResp: event.value.EmployeeResp,
    });
  }

  parsePayloadFormateTime(data: string) {
    if (data && data.length) {
      let hours = data.substring(2, 4);
      let minute = data.substring(5, 7);
      // const strArr: string[] = data.split('H');
      // const hoursArr: string[] = strArr[0].split('PT');
      // const minutesArr: string[] = strArr[1].split('M00S');
      // if (data) {
      //   return `${hoursArr[1]}:${minutesArr[0]}`;
      // }
      return `${hours}:${minute}`;
    }
  }

  sanitizeSAPDateFormat(date: string) {
    if (date) {
      return new DatePipe('en-US').transform(
        date.replace('/Date(', '').replace(')/', ''),
        'yyyy-MM-dd'
      );
    }
  }
  cancelProgressNote() {
    this.initForm();
    this.actionType = null;
    this.templteContent = null;
  }

  dateConvertToSecond(current) {
    return `/Date(${current.getTime()})/`;
  }
}
