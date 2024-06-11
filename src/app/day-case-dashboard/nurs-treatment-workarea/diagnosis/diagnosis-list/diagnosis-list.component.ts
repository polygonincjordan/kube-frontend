import { Component, Input, OnChanges, OnInit, SimpleChanges, TemplateRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdmissionService } from '@services/admission/admission.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { catchError, debounceTime, of, Subject } from 'rxjs';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { cloneDeep as _cloneDeep } from 'lodash';
  import * as _ from 'lodash';
import Swal from 'sweetalert2';

@UntilDestroy()
@Component({
  selector: 'app-diagnosis-list',
  templateUrl: './diagnosis-list.component.html',
  styleUrls: ['./diagnosis-list.component.scss']
})
export class DiagnosisListComponent implements OnInit {
  diagnosisForm: FormGroup;
  diagnosisFormList: FormArray;
  @Input() searchString: any;
  @Input() checkCounterPatient: any;
  seachImportDiagnosis: string;

  currentTime: string;
  paramsObject: any;
  diagnosisDataList: any[] = [];
  selectDiagnosisList: any[] = [];
  diagnosisStaticData: any [] = [];
  diagnosisSearchList: any[];
  modalRef: BsModalRef;
  modalForDiagInfo: BsModalRef;
  modalRefForSaveDiagnosis: BsModalRef;
  modalRefForDuplicateCode: BsModalRef;
  modalRefForDeleteDiagnosis: BsModalRef;
  isDisabled: boolean = true;
  public searchCodeTypeHead = new Subject<string>();
  diagnosisDuplicateList: any[];
  diagnosisImportList: any[];
  isCheckSerach: boolean = false;
  treatmentValue: any = [
    {
      label: 'Treatment',
      value: true,
    },
    {
      label: 'Referral',
      value: false,
    },
  ];
  getItemsValueMin: any[];
  diagnosisDataListFilter: any[];
  demoArrayForm: any[];
  finalDiagnosisArray: any[] = [];
  filterArray: any;

  isMyfavorite: boolean = true;
  isDptfavorite: boolean = false;
  dptFavrDiagnosisList: any[] = [];
  myFavrDiagnosisList: any[] = [];
  searchFavrDiagnosis: any;
  showDiagnosisInfo: any;
  deleteDiagnosisData: any;

  constructor(
    private formBuilder: FormBuilder,
    private _admissionService: AdmissionService,
    private route: ActivatedRoute,
    public modalService: BsModalService
  ) {
    this.route.queryParams.subscribe((params) => {
      this.paramsObject = params;
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.diagnosisCodeList();
    this.diagnosisFavoriteDetails();
    this.diagnosisFormDetails();
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes?.searchString?.currentValue || changes?.searchString?.previousValue) {
      return;
    }
    if (this.checkCounterPatient.isEnCounterCheck) {
      this.clearFormArray(this.diagnosisFormList);
      this.getDiagnosisList(this.paramsObject.einri,this.paramsObject.falnr, "");
      this.diagnosisFormDetails();
    } else {
      this.clearFormArray(this.diagnosisFormList);
      this.getDiagnosisList(this.paramsObject.einri,this.paramsObject.falnr, this.paramsObject.patnr);
    }
  }

  openModalForFavrDiagnosis(template: TemplateRef<any>) {
    this.selectDiagnosisList = [];
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-diagnosis',
    };
    this.myFavrDiagnosisData();
    this.dptFavrDiagnosisData();
    this.favDiagnosisTab('my')
    this.modalRef = this.modalService.show(template, config);
  }

  openDiagnosisInfoModal(template: TemplateRef<any>, diagnosis: any) {
    this.showDiagnosisInfo = diagnosis
    const config: ModalOptions = {
      class: 'modal-dialog-centered info-diagnosis-modal',
    };
    this.modalForDiagInfo = this.modalService.show(template, config);
  }

  openModalForSaveDiagnosis(template: TemplateRef<any>) {
    this.selectDiagnosisList = [];
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-diagnosis',
    };
    this.modalRefForSaveDiagnosis = this.modalService.show(template, config);
  }

  initForm() {
    this.diagnosisForm = this.formBuilder.group({
      diagnosisFormList: new FormArray([]),
    });
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

  onSelectMedicine(event: any, index: any) {
    if (event) {
      this.diagnosisFormArray.controls[index].patchValue({
        DiagShorttext: event.Dtext1,
        DiagKey1: event.Dkey,
        Favorite: event.Favorite
      });
    } else {
      this.diagnosisFormArray.controls[index].patchValue({
        DiagShorttext: ''
      });
    }
    this.diagnosisSearchList = [];
  }

  removeItems(diagnosis: any, index: number) {
    this.diagnosisFormList.removeAt(index);
  }

  clearFormArray = (formArray: FormArray) => {
    if(formArray) {
      while (formArray.length !== 0) {
        formArray.removeAt(0)
      }
    }
  }

  get diagnosisFormArray(): FormArray {
    return this.diagnosisForm.get('diagnosisFormList') as FormArray;
  }

  getDiagnosisList(einri: string, falnr: string, patnr: string) {
    this._admissionService.getDiagnosisList(einri, falnr, patnr).subscribe((result: any) => {
      // this.diagnosisDataList = result?.d.results;
      const diag = _.cloneDeep(result?.d.results)
      this.diagnosisStaticData = [...diag]
      })
  }

  onSearchChange(event) {
    this.seachImportDiagnosis = event.target.value;
  }

  onFavrDiagnosisSearch(event) {
    this.searchFavrDiagnosis = event.target.value;
  }

  parsePayloadFormateTime(data: string) {
    if (data && data.length) {
      let hours = data.substring(2, 4);
      let minute = data.substring(5, 7);

      return `${hours}:${minute}`;
    }
  }

  selectDiagnosisData(diagnosis: any) {
    if (this.selectDiagnosisList.length) {
      let obj = this.selectDiagnosisList.find((o) => o.DiagSeqno === diagnosis.DiagSeqno);
      if (obj) {
        this.selectDiagnosisList.splice(this.selectDiagnosisList.findIndex((item) => item.DiagSeqno === diagnosis.DiagSeqno), 1);
      } else {
        this.selectDiagnosisList.push(diagnosis);
      }
    } else {
      this.selectDiagnosisList.push(diagnosis);
    }
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

  importAndFavrDataImport() {
    this.diagnosisDataList = [];
    this.selectDiagnosisList.forEach((element)=>{element.DiagSeqno = '000', element.DiagCreatTime = this.currentTime, element.DiagCreatDate = new Date()});
    this.importDiagnosisDataInForm()
  }

  editDiagnosisImport(diagnosis) {
    this.selectDiagnosisList = _.cloneDeep([diagnosis])
    this.diagnosisDataList = [];
    this.selectDiagnosisList.forEach((element)=>{element.DiagCreatTime = this.parsePayloadFormateTime(element.DiagCreatTime), element.DiagCreatDate = this.getDate(element.DiagCreatDate)});
    this.importDiagnosisDataInForm();
  }

  importDiagnosisDataInForm() {
    let controlArray = <FormArray>(this.diagnosisForm.controls['diagnosisFormList']);
    if(this.diagnosisDataList.length == 0) this.diagnosisDataList = this.selectDiagnosisList.concat(this.diagnosisDataList)
    var diagnosisFilterArray = _.filter(this.diagnosisFormArray.value, (elem)=> { return elem.DiagShorttext || elem.DiagText });
    this.diagnosisDataList = this.diagnosisDataList.concat(diagnosisFilterArray);
    var filterArray = _.filter(this.diagnosisFormArray.value, (elem)=> { return elem.DiagShorttext === '' && elem.DiagText === ''});
    if(filterArray.length < this.selectDiagnosisList.length )  this.clearFormArray(this.diagnosisFormList);
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

    this.diagnosisDataList = this.diagnosisDataList.concat(this.selectDiagnosisList);
    this.modalRefForSaveDiagnosis?.hide();
    this.modalRef?.hide()
  }

  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }

  diagnosisCodeList() {
    this.searchCodeTypeHead.pipe(debounceTime(1000)).subscribe((term) => {
      if (term) {
        this._admissionService
          .searchDiagnosis(term)
          .subscribe((result: any) => {
            if (result.d.results) {
              this.diagnosisSearchList = result.d.results;
            }
          });
      }
    });
  }

  selectTreatMent(event, index) {
    if (event) {
      this.diagnosisFormArray.controls[index].patchValue({
        TreatmentDia: true,
        ReferralDia: false,
      });
    } else {
      this.diagnosisFormArray.controls[index].patchValue({
        TreatmentDia: false,
        ReferralDia: true,
      });
    }
  }

  saveDiagnosis(conformationModal: any) {
     this.filterArray = _.filter(this.diagnosisFormList.value, (elem)=> { return elem.DiagShorttext || elem.DiagText});

    if(this.filterArray.length == 0){
      this._admissionService.errorSwalModel('Please enter at least one Diagnosis');
      return;
    }

    this.filterArray.forEach((element: any) => {
      if (typeof element.DiagCreatDate === 'object' && element.DiagCreatDate !== null && 'toISOString' in element.DiagCreatDate) {
        element.DiagCreatDate = element?.DiagCreatDate.toISOString().split('.')[0];
      }

      let createTime = element.DiagCreatTime.split(':');
      const checkCreatTime = element.DiagCreatTime.slice(0, 2);
      if (checkCreatTime != 'PT') {
        element.DiagCreatTime = 'PT' + createTime[0] + 'H' + createTime[1] + 'M' + '00S';
      }
    });

    var valueArr = this.filterArray.map((item)=>{ if(!item.CancelInd) {return item.DiagKey1} });
    valueArr = valueArr.filter(( element )=> { return element !== undefined});

    var isDuplicate = valueArr.some((item, idx)=>{
        return valueArr.indexOf(item) != idx
    });

    if(isDuplicate) this.openConformationModel(conformationModal);
    else this.saveDiagnosisApi();
  }

  saveDiagnosisApi() {
    let payload = {
      Patnr: '',
      ToDiagnosis: {
        results: this.filterArray,
      },
    };

    this._admissionService.saveDiagnosis(payload).subscribe(
      (result: any) => {
        this._admissionService.successSwalModel('Diagnosis successfully created');
        this.clearFormArray(this.diagnosisFormList);
        this.diagnosisFormDetails();
        this.getDiagnosisList(this.paramsObject.einri,this.paramsObject.falnr, "");
        this.modalRefForDuplicateCode?.hide();
      },
      (error:any) => {
        let messageError = error.error.error.innererror.errordetails
        let message: any = '';
        messageError.forEach((e, index) => {
          if(e.code != '/IWBEP/CX_MGW_BUSI_EXCEPTION') {
            if(message) {
              message = `${message} <br> ${index + 1}) ${e.message}`;
            } else {
              message = `${index + 1}) ${e.message}`
            }
          }
        });

        this.modalRefForDuplicateCode?.hide();
          Swal.fire({
            title: message,
            icon: 'error',
            confirmButtonText: 'OK',
            customClass:'diagnosis-error'
          });
      }
    );
  }

  openDeleteDiagnosis(template: TemplateRef<any>, diagnosisDetails) {
    this.deleteDiagnosisData = diagnosisDetails
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-diagnosis',
    };
    this.modalRefForDeleteDiagnosis = this.modalService.show(template, config);
  }

  removeApiDiagnosis() {
    if(this.deleteDiagnosisData) {
      this.deleteDiagnosisData.CancelInd = true;
      this.filterArray = [this.deleteDiagnosisData];
    }
    let payload = {
      Patnr: '',
      ToDiagnosis: {
        results: this.filterArray,
      },
    };

    this._admissionService.saveDiagnosis(payload).subscribe(
      (result: any) => {
        this._admissionService.successSwalModel('History of diagnosis is deleted successfully');
        this.modalRefForDeleteDiagnosis.hide();
        this.getDiagnosisList(this.paramsObject.einri,this.paramsObject.falnr, "");
      }
    )
  }

  diagnosisFavoriteDetails() {
    const diagnosisFav = this._admissionService.getDiagnosisFavoriteSetDataSet(
      this.paramsObject.patnr
    );
    this._admissionService.diagnosisFavoriteData$
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((data: any[]) => {
        this.diagnosisImportList = data;
      });
  }

  openConformationModel(template: TemplateRef<any>) {
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-diagnosis',
    };
    this.modalRefForDuplicateCode = this.modalService.show(template, config);
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

  diagnosisFavCreateAction(diagnosis: any, action: string, index: any) {
    if(!diagnosis.value.DiagKey1) {
      this._admissionService.errorSwalModel('Please select code');
      return;
    }
    let payload = {
      Typ: '1',
      Einri: this.paramsObject.einri,
      Dkat: '10',
      ToFavrDiagnosis: {
        results: [
          {
            Dkey: diagnosis.value.DiagKey1,
            Action: action,
          },
        ],
      },
    };
    this._admissionService.favDiagnosisAction(payload).subscribe(
      (result: any) => {
        this.diagnosisFormArray.controls[index].patchValue({
          Favorite: action == 'I' ? true : false
        });
      },
      (error: any) => {}
    );
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
      (error: any) => {}
    );
  }
}
