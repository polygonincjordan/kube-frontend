import { Component, EventEmitter, Inject, Input, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdmissionService } from '@services/admission/admission.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { catchError, of } from 'rxjs';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import {
  ProgressNotesCategoryModel,
  ProgressNotesListModel,
  ProgressNotesTemplateModel,
} from '@services/admission/interfaces/template-model';
import { EEmrService } from '@services/e-emr.service';
import { DatePipe } from '@angular/common';
import { StorageService } from '@services/storage.service';
import Swal from 'sweetalert2';

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
  progressNoteForm: FormGroup;
  paramsObj: any = {};
  reloadPhyOrderList: boolean = false;
  categoryList: ProgressNotesCategoryModel[];
  templateList: ProgressNotesTemplateModel[];
  templteContent: any;
  userProfileDetail: any;
  modalRefForTemp: BsModalRef;
  saveTemplateForm1: FormGroup;
  notAuthUpdateTemp: boolean = true;
  modalRefUpdateName: BsModalRef;
  templateRefName: TemplateRef<any>;
  constructor(
    private formBuider: FormBuilder,
    private _admissionservice: AdmissionService,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private _dataServices: EEmrService,
    private _storageService: StorageService
  ) {
    this.route.queryParams.subscribe((params) => {
      this.paramsObj.patientId = params.patnr;
      this.paramsObj.caseid = params.falnr;
    });
  }

  ngOnInit(): void {
    this.userProfileDetail = this._storageService.getUserProfile();
    this.initForm();
    this.saveTemplateForm();
    // this.getProgressNotesData();
    this.getCategoryList();
    this.getProgressNotesTemplateList();
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
    const res = this._admissionservice.getProgressNotesSetData(
      this.paramsObj.patientId,
      this.paramsObj.caseid
    );

    this._admissionservice.progressNotesSetData$
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
    const res = this._admissionservice.getCategorySetData(
      this.paramsObj.patientId,
      this.paramsObj.caseid
    );

    this._admissionservice.categorySetData$
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
    const res = this._admissionservice.getNotesTemplateSetData(
      this.paramsObj.patientId,
      this.paramsObj.caseid
    );

    this._admissionservice.progressNoteTempSetData$
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

        this.progressNoteForm.value.ActionDate =
          this.progressNoteForm.value.ActionDate.toISOString().split('.')[0];
        this._dataServices
          .createProgressEntry(this.progressNoteForm.value)
          .subscribe(
            (_success: any) => {
              if (_success) {
                this.initForm();
                this.getProgressNotesData();
                this.templteContent = null;
                this._admissionservice.successSwalModel(
                  'Progress Note got created'
                );
              }
            },
            (_error: any) => {}
          );
      } else {
        this._admissionservice.errorSwalModel('Please add note text');
      }
    } else {
      this._admissionservice.errorSwalModel('Please select occupational group');
    }
  }

  reloadPhyOrderListEvent(event) {
    if (event) {
      this.getProgressNotesData();
    }
  }

  cancelProgressNote() {
    this.initForm();
    this.templteContent = null;
  }

  copyProgressNotesEvent(event: any) {
    this.progressNoteForm.patchValue({
      Text: event.Text,
      Category: event.Category
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
   // template
   showOrderTemplateModal(template: TemplateRef<any>, typeModal: any) {
    if(this.progressNoteForm.controls.Text.value == ''){
      Swal.fire({
        title: 'Please enter Text',
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: 'swal-class'
      });
    }else{
        const config: ModalOptions = {
          class: 'modal-dialog-centered execute-delete-modal-kardex update-template-name',
        };
        this.modalRefForTemp = this.modalService.show(template, config);
      }
  }
   saveTemplateForm() {
    this.saveTemplateForm1 = this.formBuider.group({
      Templatetxt: ['', [Validators.required]],
      Templatelevel: ['User Level', [Validators.required]],
    });
  }
  saveProgressTemplateData(template: TemplateRef<any>,updateTempName?) {
    this.templateRefName = template;
    if (!this.saveTemplateForm1.valid) {
      this._admissionservice.errorSwalModel('Please add template name');
      return;
    }

    let TemplateData = this.saveTemplateForm1.value;

    let saveTemplateData: any = {
      "Keyword" : TemplateData.Templatetxt,
       "Category" : "",
        "Description" : TemplateData.Templatetxt,
        "N2Content" : this.progressNoteForm.controls.Text.value,
        "Statuscode" : "000",
        "Action" : ""
    };
    if (updateTempName == 'updateTempName') {
      saveTemplateData.Action = 'M';
    }
    this._admissionservice.saveProgressNotesTemplate(saveTemplateData).subscribe(
      (data: any) => {
        this.notAuthUpdateTemp = true;
       this.saveTemplateResponse(data,template);
      },
      (_error: any) => {}
    );

  }
  updateExsitingTempName() {
    this.saveProgressTemplateData(this.templateRefName,'updateTempName');
  }
  saveTemplateResponse(data: any, template: any) {
    if (data?.d.Statuscode == '403') {
      this.updatePopupShow(template);
    } else if (data?.d.Statuscode === '000') {
     // this.modalService.hide();
     this.modalRefForTemp.hide();
      this.saveTemplateForm();
      this.templteContent = '';
      this.userProfileDetail = this._storageService.getUserProfile();
    this.initForm();
    this.saveTemplateForm();
    // this.getProgressNotesData();
    this.getCategoryList();
    this.getProgressNotesTemplateList();
      this._admissionservice.successSwalModel('Template save successfully');
      this.modalRefUpdateName.hide();
    } else if (data?.d.Statuscode === '200') {
      //this.modalService.hide();
      this.modalRefForTemp.hide();
      this.saveTemplateForm();
      this._admissionservice.successSwalModel('Template is updated successfully');
    } else if (data?.d.Statuscode === '404') {
      this.notAuthUpdateTemp = false;
      this.updatePopupShow(template);
     
    } else if (data?.d.Statuscode === '404') {
      this.notAuthUpdateTemp = false;
      this.updatePopupShow(template);
    } else {
    }
  }
  updatePopupShow(template: TemplateRef<any>) {
    const config: ModalOptions = {
      class: 'modal-dialog-centered update-save-temp',
    };
    this.modalRefUpdateName = this.modalService.show(template, config);

  }
}
