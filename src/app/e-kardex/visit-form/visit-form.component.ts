import { Component, EventEmitter, HostListener, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AdmissionService } from '@services/admission/admission.service';
import { InPatientConfigurationService } from '@services/e-kardex/inPatient.service';
import { formatDate } from 'ngx-bootstrap/chronos';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { catchError, debounceTime, Observable, of, ReplaySubject, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { PatientVisitDataResult } from '../../services/e-kardex/interfaces/patient-visit-data';
import { PatientVisitService } from '../../services/e-kardex/patient-visit.service';
import { SearchModalConfigurationService } from '../../services/e-kardex/search-modal.service';
import { ActivatedRoute } from '@angular/router';

@UntilDestroy()
@Component({
  selector: 'app-visit-form',
  templateUrl: './visit-form.component.html',
  styleUrls: ['./visit-form.component.scss'],
})
export class VisitFormComponent implements OnInit {
  patientVisitFormData: PatientVisitDataResult
  paramsObject: any;
  planetmap: boolean = false;
  @Input() set patientVisitData(data: PatientVisitDataResult) {
    data.DocKey !== '' ? data.VisitDate = formatDate(new Date(), 'YYYY-MM-DD') : data.VisitDate;
    this.patientVisitFormData = data;
  }
  @Input() isCreateRequest: boolean;
  @Input() isCopyRequest: boolean;
  @Output() updateEvent = new EventEmitter<boolean>();

  diagnosisSearchText: string = '';
  diagnosisModalListData: any = [];
  closeResult = '';
  searchTerm = new Subject<string>();
  diagnosisSearchList: any = [];
  diagnosisImportList: any[];
  seachImportDiagnosis: string;
  selectDiagnosisList: any[] = [];
  modalRefForSaveDiagnosis: BsModalRef;
  searchDiagnosis: string = "";

  diagnosisFormList: FormArray;
  diagnosisForm: FormGroup;
  currentTime: string;
  diagnosisDataList: any[] = [];
  modalRef: BsModalRef;
  modalForDiagInfo: BsModalRef;
  // modalRefForSaveDiagnosis: BsModalRef;
  modalRefForDuplicateCode: BsModalRef;
  modalRefForDeleteDiagnosis: BsModalRef;
  isMyfavorite: boolean = true;
  isDptfavorite: boolean = false;
  dptFavrDiagnosisList: any[] = [];
  myFavrDiagnosisList: any[] = [];
  searchFavrDiagnosis: any;
  demoArrayForm: any[];
  showDiagnosisInfo: any;
  diagnosis: any;
  dataSave: boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    private patientVisitService: PatientVisitService,
    private modalService: NgbModal,
    private searchModalConfigurationService: SearchModalConfigurationService,
    private InpatientDataService: InPatientConfigurationService,
    public modalDiagnosisService: BsModalService,
    private _admissionService: AdmissionService,
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe((params) => {
      this.paramsObject = params;
    });
  }


  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (!this.dataSave) {
      $event.returnValue = "Do you want to close the browser without saving document";
    } else {
      $event.returnValue = true;
    }

  }
  ngOnInit(): void {
    this.searchTerm.pipe(debounceTime(250)).subscribe((term) => {
      if (term !== "" && term !== null && term.length >= 3) {
        this.InpatientDataService.getDischargeSearchData(term).subscribe({
          next: (resp: any) => {
            if (resp.d && resp.d.results) {
              this.diagnosisSearchList = resp.d.results;
            }
          }
        });
      } else {
        this.diagnosisSearchList = [];
      }
    });
  }

  loadDiagnosisImportData() {
    this.InpatientDataService.getInpatientData().subscribe((data) => {
      if (data && data['d'] && data['d'].results && data['d'].results.length) {
        data['d'].results.forEach(element => {
          element.isSelected = false;
        });
        this.diagnosisImportList = data['d'].results;
      }
    })
  }
  openModalForSaveDiagnosis(template: TemplateRef<any>) {
    this.loadDiagnosisImportData();
    this.selectDiagnosisList = [];
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-diagnosis',
    };
    this.modalRefForSaveDiagnosis = this.modalDiagnosisService.show(template, config);
  }

  onSearchChange(event) {
    this.seachImportDiagnosis = event.target.value;
  }

  selectDiagnosisData() {
    const isSelectedData = this.diagnosisImportList.filter(d => d.isSelected);
    if (isSelectedData && isSelectedData.length) {
      isSelectedData.forEach((element) => {
        this.diagnosisChange(element);
      });
      this.modalDiagnosisService.hide();
    }
  }

  selectFaviouriteData() {
    const isSelectedData = this.myFavrDiagnosisList.filter(d => d.isSelected);
    if (isSelectedData && isSelectedData.length) {
      isSelectedData.forEach((element) => {
        this.diagnosisChange(element);
      });
      this.modalDiagnosisService.hide();
    }
  }

  updateForm(isUpdate: boolean) {
    Swal.fire({
      text: "Are you sure you want to close without saving?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: { popup: 'myalertpopup' }
    } as any).then((result) => {
      if (result.value) {
        this.updateEvent.emit(isUpdate);
      }
    })
  }

  async saveForm() {
    this.dataSave = true;
    if (this.patientVisitFormData.VISITTODIAGNOSIS && this.patientVisitFormData.VISITTODIAGNOSIS.results && this.patientVisitFormData.VISITTODIAGNOSIS.results.length) {
      this.patientVisitFormData.VISITTODIAGNOSIS.results.forEach((element: any) => {
        delete element.freeText;
      });
    }
    if (!!this.patientVisitFormData.ReasonForVisit) {
      await this.patientVisitService.saveVisitNotePatientVisitData(
        this.patientVisitFormData)
      this.updateEvent.emit(true);
      this.dataSave = false;
      Swal.fire({
        title: 'Your Update has been Saved!',
        confirmButtonColor: '#0890c5',
        cancelButtonColor: '#84898c',
        confirmButtonText: 'OK',
        customClass: { popup: 'myalertpopup' },
        icon: 'success'
      } as any), (error) => {
        alert('The document dose not saved in Red color and caution');
      }
    } else {
      alert('Reason for visit cannot be empty');
    }

  }

  showErrorPopup(title: any, text: any, messageType) {
    return Swal.fire({
      title: title ? title : '',
      text: text ? text : '',
      showCancelButton: messageType === 'Conform' ? true : false,
      confirmButtonColor: '#0890c5',
      cancelButtonColor: '#84898c',
      confirmButtonText: messageType === 'Error' ? 'Close' : 'Yes',
      cancelButtonText: 'No',
      customClass: { popup: 'myalertpopup' },
      icon: 'error'
    } as any);
  }
  async releaseForm() {
    if (this.patientVisitFormData.VISITTODIAGNOSIS && this.patientVisitFormData.VISITTODIAGNOSIS.results && this.patientVisitFormData.VISITTODIAGNOSIS.results.length) {
      this.patientVisitFormData.VISITTODIAGNOSIS.results.forEach((element: any) => {
        delete element.freeText;
      });
    }
    if (!!this.patientVisitFormData.ReasonForVisit) {
      this.patientVisitFormData.Released = 'X';
      await this.patientVisitService.saveVisitNotePatientVisitData(this.patientVisitFormData);
      this.updateEvent.emit(true);
      Swal.fire({
        title: 'Your Update has been release!',
        confirmButtonColor: '#0890c5',
        cancelButtonColor: '#84898c',
        confirmButtonText: 'OK',
        customClass: { popup: 'myalertpopup' },
        icon: 'success'
      } as any), (error) => {
        alert('The document dose not saved in Red color and caution');
      }
    } else {
      alert('Reason for visit cannot be empty');
    }
  }

  async deleteForm() {
    Swal.fire({
      text: "Are you sure you want to delete the document with confimation?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: { popup: 'myalertpopup' }
    } as any).then((result) => {
      if (result.value) {
        this.patientVisitService.deleteVisitNotePatientVisitData(
          this.patientVisitFormData
        ).then((result) => {
          this.updateEvent.emit(true);
        });
      }
    })

  }

  private imageSrc: string = '';

  handleInputChange(e) {
    var file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    var pattern = /image-*/;
    var reader = new FileReader();
    if (!file.type.match(pattern) && !file.type.match('application/pdf')) {
      alert('invalid format');
      return;
    }

    this.convertFile(e.target.files[0]).subscribe((base64) => {
      let attachment = {
        DocKey: this.patientVisitFormData.DocKey,
        FileID: '',
        ApplicationID: '',
        Description: '',
        AttachmentData: base64,
        AttMimeType: file.type,
        FileName: file.name,
      };
      if (this.patientVisitFormData.VISITTOATTACHMENTS == undefined)
        this.patientVisitFormData.VISITTOATTACHMENTS = { results: [] };
      this.patientVisitFormData.VISITTOATTACHMENTS.results.push(attachment);
    });
  }

  convertFile(file: File): Observable<string> {
    const result = new ReplaySubject<string>(1);
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event) =>
      result.next(btoa(event.target.result.toString()));
    return result;
  }

  viewFile(attachment: any) {
    if (attachment.AttMimeType.match(/image-*/)) {
      var w = window.open('about:blank');
      var image = new Image();
      image.src = `data:${attachment.AttMimeType};base64,${attachment.AttachmentData}`;

      w.document.write(image.outerHTML);
      w.document.close();
    } else {
      let pdfWindow = window.open('');
      pdfWindow.document.write(
        "<iframe width='100%' height='100%' src='data:application/pdf;base64, " +
        encodeURI(attachment.AttachmentData) +
        "'></iframe>"
      );
    }
  }

  deleteFile(attachment: any) {
    const index: number =
      this.patientVisitFormData.VISITTOATTACHMENTS.results.indexOf(attachment);
    if (index !== -1) {
      this.patientVisitFormData.VISITTOATTACHMENTS.results.splice(index, 1);
    }
  }
  async onChangeSearchInput(event: any, content) {
    this.diagnosisSearchText = event;
    if (this.diagnosisSearchText.length >= 4) {
      this.modalService
        .open(content, { ariaLabelledBy: 'myCustomModalClass' })
        .result.then(
          (result) => {
            this.closeResult = `Closed with: ${result}`;
          },
          (reason) => {
            this.closeResult = `Dismissed `;
          }
        );

      this.searchModalConfigurationService
        .getSearchData(this.diagnosisSearchText)
        .pipe(
          untilDestroyed(this),
          catchError((err) => {
            return of([]);
          })
        )
        .subscribe((searchResult: any) => {
          this.diagnosisModalListData = searchResult;
        });
    }
  }

  openSettings(content) {
    this.modalService
      .open(content, { windowClass: 'myCustomModalClass' })
      .result.then(
        (result) => { },
        (reason) => { }
      );
  }

  diagnosisChange(event: any) {
    if (event && event !== undefined && event !== null) {
      if (this.patientVisitFormData.VISITTODIAGNOSIS && this.patientVisitFormData.VISITTODIAGNOSIS.results && this.patientVisitFormData.VISITTODIAGNOSIS.results.length) {
        this.updateDiagnosis(event);
      } else {
        this.patientVisitFormData.VISITTODIAGNOSIS = { results: [] }
        this.updateDiagnosis(event);
      }
    }
    this.diagnosis = [];
  }

  updateDiagnosis(data: any) {
    this.patientVisitFormData.VISITTODIAGNOSIS.results.push({
      DiagMvmntSeq: "",
      DocKey: this.patientVisitFormData.DocKey,
      code: data.Dkey ? data.Dkey : data.DiagKey1 ? data.DiagKey1 : "",
      einri: this.patientVisitFormData.Einri,
      falnr: this.patientVisitFormData.Falnr,
      movmntSeq: "",
      secndDia: "",
      text: data.label ? data.label : data.Dtext1 ? data.Dtext1 : data.DiagText ? data.DiagText : data.DiagShorttext ? data.DiagShorttext : data,
      freeText: data.label ? true : false,
    });
  }

  importAndFavrDataImport() {
    this.diagnosisDataList = [];
    this.selectDiagnosisList.forEach((element) => { element.DiagSeqno = '000', element.DiagCreatTime = this.currentTime, element.DiagCreatDate = new Date() });
    this.importDiagnosisDataInForm()
  }
  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }

  get diagnosisFormArray(): FormArray {
    return this.diagnosisForm.get('diagnosisFormList') as FormArray;
  }

  editDiagnosisImport(diagnosis) {
    this.selectDiagnosisList = _.cloneDeep([diagnosis])
    this.diagnosisDataList = [];
    this.selectDiagnosisList.forEach((element) => { element.DiagCreatTime = this.parsePayloadFormateTime(element.DiagCreatTime), element.DiagCreatDate = this.getDate(element.DiagCreatDate) });
    this.importDiagnosisDataInForm();
  }

  diagnosisFormDetails() {
    this.addItem();
    this.addItem();
  }

  addItem(): void {
    this.diagnosisFormList = this.diagnosisForm.get('diagnosisFormList') as FormArray;
    this.diagnosisFormList.push(this.creatDiagnosisFormData());
    this.demoArrayForm = this.diagnosisFormList.value;
  }

  addRow() {
    (this.diagnosisForm.get("diagnosisFormList") as FormArray).insert(0, this.creatDiagnosisFormData())
  }

  creatDiagnosisFormData(): FormGroup {
    this.currentTime = new Date().getHours() + ':' + new Date().getMinutes();
    return this.formBuilder.group({
      Institution: [this.paramsObject.einri],
      Patcaseid: [this.paramsObject.falnr],
      DiagSeqno: ['000'],
      ExtDiagno: [''],
      MovemntSeqno: [this.paramsObject.lfdnr],
      IverDocno: [''],
      DiagCatalog1: ['10'],
      DiagKey1: [null],
      DiagCatalog2: [''],
      DiagKey2: [''],
      DiagRefCat: [''],
      DiagRefKey: [''],
      DiagText: [''],
      DiagLongtext: [false],
      DiagCreatDate: [new Date()],
      DiagCreatTime: [this.currentTime],
      DiagPerson: [''],
      NoSurgeries: ['00'],
      ReferralDia: [false],
      TreatmentDia: [true],
      AdmissionDia: [true],
      DischargeDia: [false],
      DeptMainDia: [false],
      HospMainDia: [false],
      SurgeryDia: [false],
      BlockingInd: [false],
      ShortText: [''],
      LongText: [false],
      CertLevel: [''],
      CreationDate: [null],
      CreationTime: [null],
      CreationUser: [''],
      UpdateDate: [null],
      UpdateUser: [''],
      CancelInd: [false],
      CancelUser: [''],
      CancelDate: [null],
      CauseOfDeath: [false],
      ExtDiagRefkey: [''],
      DrgDiaSeqno: ['000000'],
      DrgCategory: [''],
      DrgCc: [''],
      DrgRelvant: [''],
      DiagTyp1: [''],
      DiagTyp2: [''],
      DiagRefTyp: [''],
      AlternDiatxt: [''],
      DiaLink: ['000'],
      WorkDiagInd: [false],
      PreopDiagInd: [false],
      DiagReference: [false],
      DiagPriority: [''],
      DiagCertainty: [''],
      DiagAddition: [''],
      DiagLocation: [''],
      DiagCcl: ['000'],
      DiagShorttext: [''],
      DiagExcf: [''],
      AssDepMainDia: [''],
      DiagQualf: [''],
      DrgImpact: [''],
      InttransDiag: [false],
      CotreatmentDiag: [false],
      DiagValidy: [null],
      SomaticDiag: [false],
      DiagAlphaId: [''],
      DiagOrphaCode: [null],
      Patnr: [this.paramsObject.patnr],
      Favorite: [false]
    });
  }

  parsePayloadFormateTime(data: string) {
    if (data && data.length) {
      let hours = data.substring(2, 4);
      let minute = data.substring(5, 7);

      return `${hours}:${minute}`;
    }
  }

  clearFormArray = (formArray: FormArray) => {
    if (formArray) {
      while (formArray.length !== 0) {
        formArray.removeAt(0)
      }
    }
  }

  importDiagnosisDataInForm() {
    let controlArray = <FormArray>(this.diagnosisForm.controls['diagnosisFormList']);
    if (this.diagnosisDataList.length == 0) this.diagnosisDataList = this.selectDiagnosisList.concat(this.diagnosisDataList)
    var diagnosisFilterArray = _.filter(this.diagnosisFormArray.value, (elem) => { return elem.DiagShorttext || elem.DiagText });
    this.diagnosisDataList = this.diagnosisDataList.concat(diagnosisFilterArray);
    var filterArray = _.filter(this.diagnosisFormArray.value, (elem) => { return elem.DiagShorttext === '' && elem.DiagText === '' });
    if (filterArray.length < this.selectDiagnosisList.length) this.clearFormArray(this.diagnosisFormList);
    this.diagnosisDataList.forEach((element: any, index) => {
      if (filterArray.length < this.selectDiagnosisList.length) this.addItem();
      controlArray.controls[index].patchValue({
        CancelInd: element.CancelInd,
        DiagKey1: element.Dkey ? element.Dkey : element.DiagKey1,
        DiagShorttext: element.Dtext1 ? element.Dtext1 : element.DiagShorttext,
        DiagText: element.DiagText,
        ShortText: element.ShortText,
        TreatmentDia: element.TreatmentDia ? element.TreatmentDia : true,
        AdmissionDia: element.AdmissionDia,
        SurgeryDia: element.SurgeryDia,
        PreopDiagInd: element.PreopDiagInd,
        DischargeDia: element.DischargeDia,
        DiagSeqno: element.DiagSeqno,
        DiagCreatDate: element.DiagCreatDate,
        DiagCreatTime: element.DiagCreatTime,
        Favorite: element.Favorite
      });
    });
  }
  openModalForFavrDiagnosis(template: TemplateRef<any>) {
    this.selectDiagnosisList = [];
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-diagnosis',
    };
    this.myFavrDiagnosisData();
    this.dptFavrDiagnosisData();
    this.favDiagnosisTab('my');
    this.modalRef = this.modalDiagnosisService.show(template, config);
  }

  favDiagnosisTab(tab: string) {
    this.searchFavrDiagnosis = '';
    if (tab === 'my') {
      this.isMyfavorite = true;
      this.isDptfavorite = false;
    } else {
      this.isMyfavorite = false;
      this.isDptfavorite = true;
    }
  }

  myFavrDiagnosisData() {
    this._admissionService
      .getFavrDiagnosisList('', this.paramsObject.einri, '1')
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((data: any) => {
        this.myFavrDiagnosisList = data?.d.results;
      });
  }

  onFavrDiagnosisSearch(event) {
    this.searchFavrDiagnosis = event.target.value;
  }

  dptFavrDiagnosisData() {
    this._admissionService
      .getFavrDiagnosisList(
        this.paramsObject.Deptou,
        this.paramsObject.einri,
        '2'
      )
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((data: any) => {
        this.dptFavrDiagnosisList = data?.d.results;
      });
  }
  selectFavrDiagnosis(diagnosis: any) {
    if (this.selectDiagnosisList.length) {
      let obj = this.selectDiagnosisList.find((o) => o.Dkey === diagnosis.Dkey);
      if (obj) {
        this.selectDiagnosisList.splice(this.selectDiagnosisList.findIndex((item) => item.Dkey === diagnosis.Dkey), 1);
      } else {
        this.selectDiagnosisList.push(diagnosis);
      }
    } else {
      this.selectDiagnosisList.push(diagnosis);
    }
  }

  diagnosisFavDeleteAction(diagnosis: any) {
    let payload = {
      Typ: '1',
      Einri: this.paramsObject.einri,
      Dkat: '10',
      ToFavrDiagnosis: {
        results: [
          {
            Dkey: diagnosis.Dkey,
            Action: 'D',
          },
        ],
      },
    };
    this._admissionService.favDiagnosisAction(payload).subscribe(
      (result: any) => {
        if (this.isDptfavorite) this.dptFavrDiagnosisData();
        if (this.isMyfavorite) this.myFavrDiagnosisData();
      },
      (error: any) => { }
    );
  }

  close(index: number) { this.patientVisitFormData.VISITTODIAGNOSIS.results.splice(index, 1) }

}
