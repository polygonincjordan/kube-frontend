import { Component, EventEmitter, HostListener, Input, OnInit, Output, SimpleChanges, TemplateRef } from '@angular/core';
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
import { PatientVisitDataResult } from '../../../../services/e-kardex/interfaces/patient-visit-data';
import { PatientVisitService } from '../../../../services/e-kardex/patient-visit.service';
import { SearchModalConfigurationService } from '../../../../services/e-kardex/search-modal.service';
import { ActivatedRoute } from '@angular/router';
import { StorageService } from '@services/storage.service';
import { UserConfigurationService } from '@services/e-kardex/user-configuration.service';

@UntilDestroy()
@Component({
  selector: 'app-doc-visit-note',
  templateUrl: './doc-visit-note.component.html',
  styleUrls: ['./doc-visit-note.component.scss']
})
export class DocVisitNoteComponent implements OnInit {

  @Input() soapFormEvent: string;
  userProfile = this.storageService.getUserProfile();

  //#region 
  patientVisitFormData: any = {
    Dockey: '',
    Dokst: '',
    Dokvr: '',
    Dodat: formatDate(new Date(), 'YYYY-MM-DD'),
    Einri: '',
    Patnr: '',
    Falnr: '',
    Orgdo: localStorage.getItem('initOrg'),
    Lfdnr: '',
    Visitdate: formatDate(new Date(), 'YYYY-MM-DD'),
    Referredby: '',
    Reasonforvisit: '',
    Assessmenttext: '',
    Transcribertext: '',
    Subjective: '',
    Objective: '',
    SoapPlan: '',
    Mitarbname: this.userProfile.UserName,
    Mitarb: this.userProfile.Gpart,
    Dtid: 'ZMED_VISIT',
    DtidText: '',
    Released: false,
    Etag: '',
    Erdattim: null,
    Srcapp: '',
    Showall: '',
    Fromdate: null,
    Todate: null,
    ToDiagnosis: undefined,
    ToAttachment: undefined,
  };
  paramsObject: any;
  planetmap: boolean = false;
  @Input() isCreateRequest: boolean;
  @Input() isCopyRequest: boolean;
  @Output() updateEvent = new EventEmitter<boolean>();
  @Output() reloadTableList = new EventEmitter<boolean>();


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
  isCheckAPICall: any = false;
  //#endregion

  constructor(
    private formBuilder: FormBuilder,
    private patientVisitService: PatientVisitService,
    private modalService: NgbModal,
    private searchModalConfigurationService: SearchModalConfigurationService,
    private InpatientDataService: InPatientConfigurationService,
    public modalDiagnosisService: BsModalService,
    private _admissionService: AdmissionService,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private userConfigurationService:UserConfigurationService
  ) {
    this.route.queryParams.subscribe((params) => {
      this.paramsObject = params;
      this.storageService.setEinri(params['einri']);
      this.storageService.setFalnr(params['falnr']);
      this.storageService.setLfdnr(params['lfdnr']);
      this.storageService.setPatnr(params['patnr']);
    });
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes.soapFormEvent.currentValue == 'add') {
      this.saveForm(false);
      return;
   }

    if (changes.soapFormEvent.currentValue == 'edit') {
      this.saveForm(false);
      return;
    }
    if (changes.soapFormEvent.currentValue == 'saveClose') {
      this.saveForm(false);
      return;
    }

   if (changes.soapFormEvent.currentValue == 'release') {
      if (this._admissionService.isEditVisitForm) {
        this.saveForm(true);
      return;
      } else {
        this.releaseForm();
      return;
      }
   }

    if (
      this._admissionService.isEditVisitForm ||
      this._admissionService.isCloneVisitForm
    ) {
      // this.getVisitNoteData();
      if(!this.isCheckAPICall) {
        this.getVisitNoteDocData();
        return;
      }
    }
  }

  //#region 
  // @HostListener('window:beforeunload', ['$event'])
  // unloadNotification($event: any) {
  //   if (!this.dataSave) {
  //     $event.returnValue = "Do you want to close the browser without saving document";
  //   } else {
  //     $event.returnValue = true;
  //   }

  // }

  getVisitNoteDocData() {
    const json = {
      Dockey:this._admissionService.selectedCurrentDocDetails.Dockey,
    }
    this.userConfigurationService
    .getVisitNoteDocData(json)
    .subscribe((patientResult: any) => {
      this.patientVisitFormData = patientResult?.d?.results[0];
      this.patientVisitFormData.Dodat = formatDate(this.getDate(patientResult?.d?.results[0].Dodat), 'YYYY-MM-DD');
      this.patientVisitFormData.Visitdate = formatDate(this.getDate(patientResult?.d?.results[0].Visitdate), 'YYYY-MM-DD');
      this.isCheckAPICall = true;
    })
  }

  getVisitNoteData(){
    const json = {
      Dockey:this._admissionService.selectedCurrentDocDetails.Dockey,
      einri:this.storageService.einri,
      patnr:this.storageService.patnr
    }
    this.userConfigurationService
    .getVisitDocData(json)
    .subscribe((patientResult: PatientVisitDataResult) => {
      this.patientVisitFormData = patientResult;
    })
  }
  loadDiagnosisImportData() {
    const json = {
      einri : this.storageService.einri,
      falnr : this.storageService.falnr
    }
    this.InpatientDataService.getDiagnosisVisitDocData(json).subscribe((data) => {
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
      customClass: 'myalertpopup'
    }).then((result) => {
      if (result.value) {
        this.reloadTableList.next(true);
      }
    })
  }

  async saveForm(releaseType:any) {
    
    this.patientVisitFormData.Einri = this.paramsObject.einri;
    this.patientVisitFormData.Falnr = this.paramsObject.falnr;
    this.patientVisitFormData.Lfdnr = this.paramsObject.lfdnr;
    this.patientVisitFormData.Patnr = this.paramsObject.patnr;
    this.dataSave = true;
    if (this.patientVisitFormData.ToDiagnosis && this.patientVisitFormData.ToDiagnosis.results && this.patientVisitFormData.ToDiagnosis.results.length) {
      this.patientVisitFormData.ToDiagnosis.results.forEach((element: any) => {
        delete element.freeText;
      });
    }
    if (!!this.patientVisitFormData.Reasonforvisit) {
      this.patientVisitFormData.Released = releaseType;

      if (this.patientVisitFormData.Visitdate != null) {
        var date = new Date(`${this.patientVisitFormData.Visitdate} 23:59:59`);
        this.patientVisitFormData.Visitdate = `\/Date(${date.getTime()})\/`;
      }

      if (this.patientVisitFormData.Dodat != null) {
        var date = new Date(`${this.patientVisitFormData.Dodat} 23:59:59`);
        this.patientVisitFormData.Dodat = `\/Date(${date.getTime()})\/`;
      }

      this.patientVisitFormData.ToAttachment = this.patientVisitFormData.ToAttachment == undefined
        ? { results: [] } : this.patientVisitFormData.ToAttachment;
        this.patientVisitFormData.ToDiagnosis = this.patientVisitFormData.ToDiagnosis == undefined
        ? { results: [] } : this.patientVisitFormData.ToDiagnosis;

      let message = 'Your visit note has been created';
      if(this.patientVisitFormData.Dockey && this.patientVisitFormData.Released) {
        message = "Your visit note has been released";
      }
      if(this.patientVisitFormData.Dockey && !this.patientVisitFormData.Released){
        message = "Your visit note has been updated";
      }
      if(!this.patientVisitFormData.Dockey && this.patientVisitFormData.Released){
        message = "Your visit note has been created and released";
      }

      this._admissionService.saveVisitNoteDoc(this.patientVisitFormData).subscribe(
        (result: any) => {
            if(this.soapFormEvent == 'saveClose') {   
              this._admissionService.clearSoapEvent.next(true);
              this.reloadTableList.next(true);
              this._admissionService.cancelAllForm();
            }
              Swal.fire({
                title: message,
                confirmButtonColor: '#0890c5',
                cancelButtonColor: '#84898c',
                confirmButtonText: 'OK',
                customClass: 'myalertpopup',
                icon: 'success'
              }), (error) => {
                alert('The document dose not saved in Red color and caution');
              }
        },
        (err) => {
          this._admissionService.clearSoapEvent.next(true);
          this._admissionService.isSaveEducationData.next(false);
        }
      );
     
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
      customClass: 'myalertpopup',
      icon: 'error'
    });
  }
  async releaseForm() {
    this.patientVisitFormData.Einri = this.paramsObject.einri;
    this.patientVisitFormData.Falnr = this.paramsObject.falnr;
    this.patientVisitFormData.Lfdnr = this.paramsObject.lfdnr;
    this.patientVisitFormData.Patnr = this.paramsObject.patnr;
    if (this.patientVisitFormData.ToDiagnosis && this.patientVisitFormData.ToDiagnosis.results && this.patientVisitFormData.ToDiagnosis.results.length) {
      this.patientVisitFormData.ToDiagnosis.results.forEach((element: any) => {
        delete element.freeText;
      });
    }
    if (!!this.patientVisitFormData.Reasonforvisit) {
      this.patientVisitFormData.Released = true;
      // this.patientVisitFormData.Release='X'
      if (this.patientVisitFormData.Visitdate != null) {
        var date = new Date(`${this.patientVisitFormData.Visitdate} 23:59:59`);
        this.patientVisitFormData.Visitdate = `\/Date(${date.getTime()})\/`;
      }

      if (this.patientVisitFormData.Dodat != null) {
        var date = new Date(`${this.patientVisitFormData.Dodat} 23:59:59`);
        this.patientVisitFormData.Dodat = `\/Date(${date.getTime()})\/`;
      }

      this.patientVisitFormData.ToAttachment = this.patientVisitFormData.ToAttachment == undefined
      ? { results: [] } : this.patientVisitFormData.ToAttachment;
      this.patientVisitFormData.ToDiagnosis = this.patientVisitFormData.ToDiagnosis == undefined
      ? { results: [] } : this.patientVisitFormData.ToDiagnosis;

     
      this._admissionService.saveVisitNoteDoc(this.patientVisitFormData).subscribe(
        (result: any) => {
              this.reloadTableList.next(true);
              this._admissionService.cancelAllForm();
              this._admissionService.clearSoapEvent.next(true);
              Swal.fire({
                title: 'Your visit note has been released!',
                confirmButtonColor: '#0890c5',
                cancelButtonColor: '#84898c',
                confirmButtonText: 'OK',
                customClass: 'myalertpopup',
                icon: 'success'
              }), (error) => {
                alert('The document dose not saved in Red color and caution');
              }
        },
        (err) => {
          this._admissionService.clearSoapEvent.next(true);
          this._admissionService.isSaveEducationData.next(false);
        }
      );
     
    } else {
      this._admissionService.clearSoapEvent.next(true);
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
      customClass: 'myalertpopup'
    }).then((result) => {
      if (result.value) {
        this.patientVisitService.deleteVisitNotePatientVisitData(
          this.patientVisitFormData
        ).then((result) => {
        this.reloadTableList.next(true);
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
        Dockey: this.patientVisitFormData.Dockey,
        ApplicationId: '',
        FileId: '',
        Description: '',
        AttachmentData: base64,
        Mimetype: file.type,
        CreatedAt: '',
        ChangedAt: '',
        CreatedBy: '',
        ChangedBy: '',
        FileName: file.name,
        AttachmentDataStr: '',
      };
      if (this.patientVisitFormData.ToAttachment == undefined)
        this.patientVisitFormData.ToAttachment = { results: [] };
      this.patientVisitFormData.ToAttachment.results.push(attachment);
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
    if (attachment.Mimetype.match(/image-*/)) {
      var w = window.open('about:blank');
      var image = new Image();
      image.src = `data:${attachment.Mimetype};base64,${attachment.AttachmentData}`;

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
      this.patientVisitFormData.ToAttachment.results.indexOf(attachment);
    if (index !== -1) {
      this.patientVisitFormData.ToAttachment.results.splice(index, 1);
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
      if (this.patientVisitFormData.ToDiagnosis && this.patientVisitFormData.ToDiagnosis.results && this.patientVisitFormData.ToDiagnosis.results.length) {
        this.updateDiagnosis(event);
      } else {
        this.patientVisitFormData.ToDiagnosis = { results: [] }
        this.updateDiagnosis(event);
      }
    }
    this.diagnosis = [];
  }

  updateDiagnosis(data: any) {
    this.patientVisitFormData.ToDiagnosis.results.push({
      Dockey: this.patientVisitFormData.Dockey,
      Einri: this.patientVisitFormData.Einri,
      Falnr: this.patientVisitFormData.Falnr,
      Lfdnr: this.patientVisitFormData.Lfdnr,
      Dkat1: data.Dkat,
      Dkey1: data.Dkey ? data.Dkey : data.DiagKey1 ? data.DiagKey1 : "",
      Diapr: "",
      Stdtext: "",
      Lfddia: "",
      Museq:"",
      freeText: data.label ? true : false,
      Fulldiatxt: data.label ? data.label : data.Dtext1 ? data.Dtext1 : data.DiagText ? data.DiagText : data.DiagShorttext ? data.DiagShorttext : data
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
    this.modalRef = this.modalDiagnosisService.show(template, config);
    this.myFavrDiagnosisData();
    this.dptFavrDiagnosisData();
    this.favDiagnosisTab('my');
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

  close(index: number) { this.patientVisitFormData.ToDiagnosis.results.splice(index, 1) }

  //#endregion

}
