import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit } from '@angular/core';
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
  @Input() selectedPatient: any;
  progressNoteForm: FormGroup;
  paramsObj: any = {};
  reloadPhyOrderList: boolean = false;
  categoryList: ProgressNotesCategoryModel[];
  templateList: ProgressNotesTemplateModel[];
  templteContent: any;
  userProfileDetail: any;
  constructor(
    private formBuider: FormBuilder,
    public emergencyService: EmergencyService,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private _dataServices: EEmrService,
    private _storageService: StorageService
  ) {
    // this.route.queryParams.subscribe((params) => {
    //   this.paramsObj.patientId = params.patnr;
    //   this.paramsObj.caseid = params.falnr;
    // });
  }

  ngOnInit(): void {
    this.userProfileDetail = this._storageService.getUserProfile();
    this.initForm();
    // this.getProgressNotesData();
    this.getCategoryList();
    this.getProgressNotesTemplateList();
    this.paramsObj.patientId = this.selectedPatient.Patnr;
    this.paramsObj.caseid = this.selectedPatient.Falnr;
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

  onDateChange() {}

  onTempleteSelect() {
    this.progressNoteForm.controls.Text.setValue(this.templteContent.N2Content);
  }

  createProgressNote() {
    if (this.progressNoteForm.value.ProfGroup) {
      if (this.progressNoteForm.value.Text) {
        let createTime = this.progressNoteForm.value.ActionTime.split(':');
        this.progressNoteForm.value.ActionTime =
          'PT' + createTime[0] + 'H' + createTime[1] + 'M' + '00S';
        const actionDate = new Date(this.progressNoteForm.value.ActionDate);
        actionDate.setHours(parseInt(createTime[0]), parseInt(createTime[1]), 0, 0);
        this.progressNoteForm.value.ActionDate = actionDate.toISOString().split('.')[0];
        this.progressNoteForm.value.EmployeeResp = this.userProfileDetail?.Gpart;
        this._dataServices.createProgressEntry(this.progressNoteForm.value)
          .subscribe(
            (_success: any) => {
              if (_success) {
                this.initForm();
                this.getProgressNotesData();
                this.templteContent = '';
                this.emergencyService.successSwalModel(
                  'Progress note is created successfully'
                );
              }
            },
            (_error: any) => {}
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
    this.progressNoteForm.patchValue({
      PatientId: event.PatientId,
      CaseId: event.CaseId,
      MovementId: event.MovementId,
      DocumentOu: event.DocumentOu,
      Text: event.Text,
      Category: event.Category,
      EmployeeResp: event.EmployeeResp,
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
    this.templteContent = null;
  }
}
