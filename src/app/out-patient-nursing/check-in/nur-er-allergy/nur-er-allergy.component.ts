import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-nur-er-allergy',
  templateUrl: './nur-er-allergy.component.html',
  styleUrls: ['./nur-er-allergy.component.scss'],
})
export class NurErAllergyComponent implements OnInit {
  @ViewChild('allergyModal', { static: true }) allergyModal: TemplateRef<any>;

  modalRefForAllergy: BsModalRef;
  modalRef: BsModalRef;
  selectedERList: any;
  userProfile: any;
  updateAllergyForm: FormGroup;
  isCheckboxesDisabled: boolean;
  searchString: string;
  allergyFormitems: FormArray;
  allergyform: FormGroup;
  allergyItemsArr: any[];
  allergyFinalApiArr: any[];
  noAllergies: boolean;
  noCollection: boolean;
  StateComment: string;
  cancelReasonListData: any;
  allergyList: any[];
  noCollectionValue: string;
  noAllergiesValue: string;
  allergenValues: any;
  allergenGroupValues: any;
  allergyCertaintyValues: any;
  allergyEvaluationValues: any;
  allergyReactionValues: any;
  severityValues: any;
  allergyTypeValues: any;
  allergyJson = {};
  modalCommonDataArr: any;
  colName: any;
  riskValues: any;
  cancelReasonValue: string;
  modalRefForDelete: BsModalRef;
  allergyActionStatus: any;
  rowData: any;
  errmsg: string;

  constructor(
    private modalService: BsModalService,
    private emergencyService: EmergencyService,
    private formBuilder: FormBuilder,
    private storageService: StorageService
  ) {
    this.allergyform = this.formBuilder.group({
      allergyFormitems: new FormArray([]),
    });
    this.updateAllergyForm = this.formBuilder.group({
      AllergySeqno : ['0000'],
      Allrgycatlog : [''],
      Allrgyid :  [''],
      Allergen :  [''],
      AllrgycatlogAgr :  [''],
      AllrgyidAgr :  [''],
      AllergenGrp :  [''],
      Cert :  [''],
      CerText :  [''],
      Eval :  [''],
      EvalTxt :  [''],
      Rea :  [''],
      ReaText :   [''],
      Soa :  [''],
      SoaText :  [''],
      Typ :  [''],
      TypText :  [''],
      Adcomment :  [''],
      AdcommentLt :  [''],
      });
  }

  ngOnInit(): void {}

  public openModalForAllergy(template: TemplateRef<any>, data: any) {
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-xl allergy-modal-size',
    };
    this.modalRefForAllergy = this.modalService.show(this.allergyModal, config);
    this.selectedERList = data;
    this.userProfile = JSON.parse(
      localStorage.getItem('amc_dev_loggedInUserProfile')
    );
    this.updateAllergyForm.enable();
    this.isCheckboxesDisabled = false;
    this.modalRefForAllergy.onHide.subscribe((reason: string | any) => {
      if (reason === 'backdrop-click') {
        this.closeAllergyModal();
      }
    });
    this.getCancelReasons();
    this.getAllergyHistoryList(this.selectedERList);
    this.getAllergenValues();
    this.getAllergenGroupValues();
    this.getAllergyCertaintyValues();
    this.getAllergyEvaluationValues();
    this.getAllergyReactionValues();
    this.getSeverityValues();
    this.getAllergyTypeValues();
  }

  confirmationForAllergyDelete(template: TemplateRef<any>, status, item) {
    const config: ModalOptions = {
      class: 'modal-dialog-centered allergy-delete-modal',
    };
    this.modalRefForDelete = this.modalService.show(template, config);
    this.allergyActionStatus = status;
    this.rowData = item;
  }
  getAllergenValues() {
    this.emergencyService.getAllergenValues().subscribe(
      (_success: any) => {
        this.allergenValues = _success.d.results;
      },
      (_error: any) => {}
    );
  }
  getAllergenGroupValues() {
    this.emergencyService.getAllergenGroupValues().subscribe(
      (_success: any) => {
        this.allergenGroupValues = _success.d.results;
      },
      (_error: any) => {}
    );
  }
  getAllergyCertaintyValues() {
    this.emergencyService.getAllergyCertaintyValues().subscribe(
      (_success: any) => {
        this.allergyCertaintyValues = _success.d.results;
      },
      (_error: any) => {}
    );
  }
  getAllergyEvaluationValues() {
    this.emergencyService.getAllergyEvaluationValues().subscribe(
      (_success: any) => {
        this.allergyEvaluationValues = _success.d.results;
      },
      (_error: any) => {}
    );
  }
  getAllergyReactionValues() {
    this.emergencyService.getAllergyReactionValues().subscribe(
      (_success: any) => {
        this.allergyReactionValues = _success.d.results;
      },
      (_error: any) => {}
    );
  }
  getSeverityValues() {
    this.emergencyService.getSeverityValues().subscribe(
      (_success: any) => {
        this.severityValues = _success.d.results;
      },
      (_error: any) => {}
    );
  }
  getAllergyTypeValues() {
    this.emergencyService.getAllergyTypeValues().subscribe(
      (_success: any) => {
        this.allergyTypeValues = _success.d.results;
      },
      (_error: any) => {}
    );
  }
  closeAllergyModal() {
    this.modalRefForAllergy.hide();
    this.resetAllergyForm();
    this.searchString = '';
  }
  getCancelReasons() {
    const json = {
      einri: this.selectedERList.Einri,
      patnr: this.selectedERList.Patnr,
    };
    this.emergencyService.getCancelReasons().subscribe(
      (_success: any) => {
        this.cancelReasonListData = _success.d.results;
      },
      (_error: any) => {}
    );
  }

  checkForDeleteValue() {
    if (this.cancelReasonValue == '') {
      this.errmsg = 'Select a Reason for Deletion';
    } else {
      this.modalRefForDelete.hide();
      this.deleteAllergyJson(this.allergyActionStatus, this.rowData);
    }
  }

  deleteAllergyJson(mode, item) {
    this.allergyJson = {};
    this.allergyJson = {
      Patnr: this.selectedERList.Patnr,
      NoAllergy: this.noAllergiesValue,
      NoCollection: this.noCollectionValue,
      StateComment: this.StateComment,
      StateCommentLt: this.StateComment,
      PatAllergyHdrToItmNav: {
        results: [
          {
            Patnr: item.Patnr,
            AllergySeqno: item.AllergySeqno,
            Responsible: item.Responsible,
            ResponsibleNm: item.ResponsibleNm,
            Allrgycatlog: item.Allrgycatlog,
            Allrgyid: item.Allrgyid,
            Allergen: item.Allergen,
            AllrgycatlogAgr: item.AllrgycatlogAgr,
            AllrgyidAgr: item.AllrgyidAgr,
            AllergenGrp: item.AllergenGrp,
            Cert: item.Cert,
            CerText: item.CerText,
            Eval: item.Eval,
            EvalTxt: item.EvalTxt,
            Rea: item.Rea,
            ReaText: item.ReaText,
            Soa: item.Soa,
            SoaText: item.SoaText,
            Typ: item.Typ,
            TypText: item.TypText,
            Adcomment: item.Adcomment,
            AdcommentLt: item.AdcommentLt,
            CancelReason: this.cancelReasonValue,
            Mode: 'D',
          },
        ],
      },
    };
    this.saveAllergyList();
  }
  getAllergyHistoryList(data) {
    const json = {
      einri: data.Einri,
      patnr: data.Patnr,
    };
    this.emergencyService.getAllergyHistory(json).subscribe(
      (_success: any) => {
        this.allergyList = [];
        this.isCheckboxesDisabled = false;
        this.allergyList = _success.d.results;
        if(this.allergyList.length) {
          if (this.allergyList[0].PatAllergyHdrToItmNav.results.length == 0) {
            this.isCheckboxesDisabled = false;
          } else {
            this.isCheckboxesDisabled = true;
          }
          this.allergyList = _success.d.results[0].PatAllergyHdrToItmNav.results;
          this.StateComment = _success.d.results[0].StateComment;
          if (
            _success.d.results[0].NoCollection == 'X' ||
            _success.d.results[0].NoAllergy == 'X'
          ) {
            if (_success.d.results[0].NoAllergy == 'X') {
              this.noAllergies = true;
              this.updateAllergyCheckboxes(this.noAllergies, 'noallergy');
            } else if (_success.d.results[0].NoCollection == 'X') {
              this.noCollection = true;
              this.updateAllergyCheckboxes(this.noCollection, 'nocollection');
            }
          }
  
          this.allergyList.forEach((element) => {
            this.addItemForAllergy(element);
          });
        }
      },
      (_error: any) => {}
    );
  }

  addItemForAllergy(element?): void {
    this.allergyFormitems = this.allergyform.get(
      'allergyFormitems'
    ) as FormArray;
    this.allergyFormitems.push(this.showAllergyDetailsOnList(element));
    //this.disableInputs()
  }
  addNewItemForAllergy(): void {
    const control = <FormArray>this.allergyform.controls['allergyFormitems'];
    this.allergyFormitems = this.allergyform.get(
      'allergyFormitems'
    ) as FormArray;
    //this.allergyFormitems.push(this.showAllergyDetailsOnList());
    //this.disableInputs()
    control.insert(0, this.showAllergyDetailsOnList());
  }
  showAllergyDetailsOnList(element?): FormGroup {
    if (element) {
      return this.formBuilder.group({
        AllergySeqno: [element.AllergySeqno],
        Allergen: [element.Allergen],
        AllergenGrp: [element.AllergenGrp],
        CerText: [element.CerText],
        EvalTxt: [element.EvalTxt],
        ReaText: [element.ReaText],
        SoaText: [element.SoaText],
        TypText: [element.TypText],
        AdCommentLt: [element.Adcomment],
        // Einri: [this.selectedERList.Einri],
        // Patnr: [this.selectedERList.Patnr],
        // Lfdnr: [this.selectedERList.Lfdbw],
        Mode: [''],
        isChecked: [false],
        isNew: [false],
      });
    } else {
      return this.formBuilder.group({
        AllergySeqno: ['0000'],
        Allergen: [''],
        AllergenGrp: [''],
        CerText: [''],
        EvalTxt: [''],
        ReaText: [''],
        SoaText: [''],
        TypText: [''],
        AdCommentLt: [''],
        StateCommentLt: [''],
        // Einri: [this.selectedERList.Einri],
        // Patnr: [this.selectedERList.Patnr],
        // Lfdnr: [this.selectedERList.Lfdbw],
        Mode: [''],
        isChecked: [true],
        isNew: [true],
      });
    }
  }

  updateAllergyCheckboxes(model, element) {
    if (element == 'noallergy') {
      this.noCollectionValue = '';
      if (model) {
        this.noCollection = false;
        //this.disableInputsOfAllergy();
        this.updateAllergyForm.disable();
        this.noAllergiesValue = 'X';
        this.setAllValuesChecked();
      } else {
        this.noCollection = false;
        this.noAllergies = false;
        this.setAllValuesUnChecked();
        this.updateAllergyForm.enable();
        this.noAllergiesValue = '';
        //this.enableInputsOfAllergy();
      }
    } else if (element == 'nocollection') {
      this.noAllergiesValue = '';
      if (model) {
        this.noAllergies = false;
        //this.disableInputsOfAllergy();
        this.updateAllergyForm.disable();
        this.noCollectionValue = 'X';
        this.setAllValuesChecked();
      } else {
        this.noCollection = false;
        this.noAllergies = false;
        this.setAllValuesUnChecked();
        this.updateAllergyForm.enable();
        this.noCollectionValue = '';
        //this.enableInputsOfAllergy();
      }
    }
  }

  setAllValuesChecked() {
    (<FormArray>this.allergyform.get('allergyFormitems')).controls.forEach(
      (control) => {
        control['controls']['isChecked'].setValue(true);
        //control['Rsfkb'].disable();
      }
    );
  }
  setAllValuesUnChecked() {
    (<FormArray>this.allergyform.get('allergyFormitems')).controls.forEach(
      (control) => {
        control['controls']['isChecked'].setValue(false);
        //control['Rsfkb'].disable();
      }
    );
  }
  resetAllergyForm() {
    this.allergyFormitems = this.allergyform.get(
      'allergyFormitems'
    ) as FormArray;
    this.allergyform.reset();
    this.allergyFormitems.clear();
    this.allergyItemsArr = [];
    this.allergyFinalApiArr = [];
    this.noAllergies = false;
    this.noCollection = false;
    this.StateComment = '';
    this.updateAllergyForm.patchValue({
      AllergySeqno: '0000',
      Allrgycatlog: '',
      Allrgyid: '',
      Allergen: '',
      AllrgycatlogAgr: '',
      AllrgyidAgr: '',
      AllergenGrp: '',
      Cert: '',
      CerText: '',
      Eval: '',
      EvalTxt: '',
      Rea: '',
      ReaText: '',
      Soa: '',
      SoaText: '',
      Typ: '',
      TypText: '',
      Adcomment: '',
      AdcommentLt: '',
    });
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
    // if (column == 'Comments') {
    //   this.modalCommonDataArr = this.allergenValues;
    // }
    // if (column == 'RiskCode') {
    //   this.modalCommonDataArr = this.riskValues;
    //   this.searchString = this.updateRiskForm.controls.Rsfna.value;
    // this.someMethod(this.searchString);
    // }
  }

  selectValueFromTable(item) {
    this.updateAllergyForm.controls.AllergySeqno.setValue(item.AllergySeqno);
    this.updateAllergyForm.controls.Allergen.setValue(item.Allergen);
    this.updateAllergyForm.controls.Allrgyid.setValue(item.Allrgyid);
    this.updateAllergyForm.controls.Allrgycatlog.setValue(item.Allrgycatlog);
    this.updateAllergyForm.controls.AllergenGrp.setValue(item.AllergenGrp);
    this.updateAllergyForm.controls.AllrgyidAgr.setValue(item.Allrgyid);
    this.updateAllergyForm.controls.AllrgycatlogAgr.setValue(
      item.AllrgycatlogAgr
    );
    this.updateAllergyForm.controls.CerText.setValue(item.CerText);
    this.updateAllergyForm.controls.Cert.setValue(item.Cert);
    this.updateAllergyForm.controls.EvalTxt.setValue(item.EvalTxt);
    this.updateAllergyForm.controls.Eval.setValue(item.Eval);
    this.updateAllergyForm.controls.ReaText.setValue(item.ReaText);
    this.updateAllergyForm.controls.Rea.setValue(item.Rea);
    this.updateAllergyForm.controls.SoaText.setValue(item.SoaText);
    this.updateAllergyForm.controls.Soa.setValue(item.Soa);
    this.updateAllergyForm.controls.TypText.setValue(item.TypText);
    this.updateAllergyForm.controls.Typ.setValue(item.Typ);
    this.updateAllergyForm.controls.Adcomment.setValue(item.Adcomment);
    this.updateAllergyForm.controls.AdcommentLt.setValue(item.Adcomment);
  }

  saveAllergyJsonFormat() {
    this.allergyJson = {};
    if (this.allergyList.length === 0) {
      if (
        (this.noAllergies || this.noCollection || this.StateComment != '') &&
        this.updateAllergyForm.controls.Allergen.value == ''
      ) {
        this.allergyJson = {
          Patnr: this.selectedERList.Patnr,
          NoAllergy: this.noAllergiesValue,
          NoCollection: this.noCollectionValue,
          StateComment: this.StateComment,
          StateCommentLt: this.StateComment,
          PatAllergyHdrToItmNav: {
            results: [],
          },
        };
        this.saveAllergyList();
      } else if (
        !this.noAllergies &&
        !this.noCollection &&
        this.StateComment == '' &&
        this.updateAllergyForm.controls.Allergen.value == ''
      ) {
        Swal.fire({
          text: 'Allergen is mandatory',
          icon: 'error',
          confirmButtonText: 'Ok',
          customClass: { popup: 'myalertpopup' },
        });
      } else {
        if (this.updateAllergyForm.controls.AllergySeqno.value == '0000') {
          this.allergyJson = {
            Patnr: this.selectedERList.Patnr,
            NoAllergy: this.noAllergiesValue,
            NoCollection: this.noCollectionValue,
            StateComment: this.StateComment,
            StateCommentLt: this.StateComment,
            PatAllergyHdrToItmNav: {
              results: [
                {
                  Patnr: this.selectedERList.Patnr,
                  AllergySeqno:
                    this.updateAllergyForm.controls.AllergySeqno.value,
                  Responsible: this.storageService.getGpart(),
                  ResponsibleNm:
                    this.storageService.getUserProfile()?.GpartName,
                  Allrgycatlog:
                    this.updateAllergyForm.controls.Allrgycatlog.value,
                  Allrgyid: this.updateAllergyForm.controls.Allrgyid.value,
                  Allergen: this.updateAllergyForm.controls.Allergen.value,
                  AllrgycatlogAgr:
                    this.updateAllergyForm.controls.AllrgycatlogAgr.value,
                  AllrgyidAgr:
                    this.updateAllergyForm.controls.AllrgyidAgr.value,
                  AllergenGrp:
                    this.updateAllergyForm.controls.AllergenGrp.value,
                  Cert: this.updateAllergyForm.controls.Cert.value,
                  CerText: this.updateAllergyForm.controls.CerText.value,
                  Eval: this.updateAllergyForm.controls.Eval.value,
                  EvalTxt: this.updateAllergyForm.controls.EvalTxt.value,
                  Rea: this.updateAllergyForm.controls.Rea.value,
                  ReaText: this.updateAllergyForm.controls.ReaText.value,
                  Soa: this.updateAllergyForm.controls.Soa.value,
                  SoaText: this.updateAllergyForm.controls.SoaText.value,
                  Typ: this.updateAllergyForm.controls.Typ.value,
                  TypText: this.updateAllergyForm.controls.TypText.value,
                  Adcomment: this.updateAllergyForm.controls.Adcomment.value,
                  AdcommentLt: this.updateAllergyForm.controls.Adcomment.value,
                  Mode: 'I',
                },
              ],
            },
          };
        } else {
          this.allergyJson = {
            Patnr: this.selectedERList.Patnr,
            NoAllergy: this.noAllergiesValue,
            NoCollection: this.noCollectionValue,
            StateComment: this.StateComment,
            StateCommentLt: this.StateComment,
            PatAllergyHdrToItmNav: {
              results: [
                {
                  Patnr: this.selectedERList.Patnr,
                  AllergySeqno:
                    this.updateAllergyForm.controls.AllergySeqno.value,
                  Responsible: this.storageService.getGpart(),
                  ResponsibleNm:
                    this.storageService.getUserProfile()?.GpartName,
                  Allrgycatlog:
                    this.updateAllergyForm.controls.Allrgycatlog.value,
                  Allrgyid: this.updateAllergyForm.controls.Allrgyid.value,
                  Allergen: this.updateAllergyForm.controls.Allergen.value,
                  AllrgycatlogAgr:
                    this.updateAllergyForm.controls.AllrgycatlogAgr.value,
                  AllrgyidAgr:
                    this.updateAllergyForm.controls.AllrgyidAgr.value,
                  AllergenGrp:
                    this.updateAllergyForm.controls.AllergenGrp.value,
                  Cert: this.updateAllergyForm.controls.Cert.value,
                  CerText: this.updateAllergyForm.controls.CerText.value,
                  Eval: this.updateAllergyForm.controls.Eval.value,
                  EvalTxt: this.updateAllergyForm.controls.EvalTxt.value,
                  Rea: this.updateAllergyForm.controls.Rea.value,
                  ReaText: this.updateAllergyForm.controls.ReaText.value,
                  Soa: this.updateAllergyForm.controls.Soa.value,
                  SoaText: this.updateAllergyForm.controls.SoaText.value,
                  Typ: this.updateAllergyForm.controls.Typ.value,
                  TypText: this.updateAllergyForm.controls.TypText.value,
                  Adcomment: this.updateAllergyForm.controls.Adcomment.value,
                  AdcommentLt: this.updateAllergyForm.controls.Adcomment.value,
                  Mode: 'U',
                },
              ],
            },
          };
        }
        this.saveAllergyList();
      }
    } else if (this.allergyList.length > 0) {
      if (
        !this.noAllergies &&
        !this.noCollection &&
        this.StateComment == '' &&
        this.updateAllergyForm.controls.Allergen.value == ''
      ) {
        Swal.fire({
          text: 'Allergen is mandatory',
          icon: 'error',
          confirmButtonText: 'Ok',
          customClass: { popup: 'myalertpopup' },
        });
      } else if (
        this.StateComment != '' &&
        this.updateAllergyForm.controls.Allergen.value == ''
      ) {
        this.allergyJson = {
          Patnr: this.selectedERList.Patnr,
          NoAllergy: this.noAllergiesValue,
          NoCollection: this.noCollectionValue,
          StateComment: this.StateComment,
          StateCommentLt: this.StateComment,
          PatAllergyHdrToItmNav: {
            results: [],
          },
        };
        this.saveAllergyList();
      } else if (
        this.StateComment == '' &&
        this.updateAllergyForm.controls.Allergen.value !== ''
      ) {
        if (this.updateAllergyForm.controls.AllergySeqno.value == '0000') {
          this.allergyJson = {
            Patnr: this.selectedERList.Patnr,
            NoAllergy: this.noAllergiesValue,
            NoCollection: this.noCollectionValue,
            StateComment: this.StateComment,
            StateCommentLt: this.StateComment,
            PatAllergyHdrToItmNav: {
              results: [
                {
                  Patnr: this.selectedERList.Patnr,
                  AllergySeqno:
                    this.updateAllergyForm.controls.AllergySeqno.value,
                  Responsible: this.storageService.getGpart(),
                  ResponsibleNm:
                    this.storageService.getUserProfile()?.GpartName,
                  Allrgycatlog:
                    this.updateAllergyForm.controls.Allrgycatlog.value,
                  Allrgyid: this.updateAllergyForm.controls.Allrgyid.value,
                  Allergen: this.updateAllergyForm.controls.Allergen.value,
                  AllrgycatlogAgr:
                    this.updateAllergyForm.controls.AllrgycatlogAgr.value,
                  AllrgyidAgr:
                    this.updateAllergyForm.controls.AllrgyidAgr.value,
                  AllergenGrp:
                    this.updateAllergyForm.controls.AllergenGrp.value,
                  Cert: this.updateAllergyForm.controls.Cert.value,
                  CerText: this.updateAllergyForm.controls.CerText.value,
                  Eval: this.updateAllergyForm.controls.Eval.value,
                  EvalTxt: this.updateAllergyForm.controls.EvalTxt.value,
                  Rea: this.updateAllergyForm.controls.Rea.value,
                  ReaText: this.updateAllergyForm.controls.ReaText.value,
                  Soa: this.updateAllergyForm.controls.Soa.value,
                  SoaText: this.updateAllergyForm.controls.SoaText.value,
                  Typ: this.updateAllergyForm.controls.Typ.value,
                  TypText: this.updateAllergyForm.controls.TypText.value,
                  Adcomment: this.updateAllergyForm.controls.Adcomment.value,
                  AdcommentLt: this.updateAllergyForm.controls.Adcomment.value,
                  Mode: 'I',
                },
              ],
            },
          };
        } else {
          this.allergyJson = {
            Patnr: this.selectedERList.Patnr,
            NoAllergy: this.noAllergiesValue,
            NoCollection: this.noCollectionValue,
            StateComment: this.StateComment,
            StateCommentLt: this.StateComment,
            PatAllergyHdrToItmNav: {
              results: [
                {
                  Patnr: this.selectedERList.Patnr,
                  AllergySeqno:
                    this.updateAllergyForm.controls.AllergySeqno.value,
                  Responsible: this.storageService.getGpart(),
                  ResponsibleNm:
                    this.storageService.getUserProfile()?.GpartName,
                  Allrgycatlog:
                    this.updateAllergyForm.controls.Allrgycatlog.value,
                  Allrgyid: this.updateAllergyForm.controls.Allrgyid.value,
                  Allergen: this.updateAllergyForm.controls.Allergen.value,
                  AllrgycatlogAgr:
                    this.updateAllergyForm.controls.AllrgycatlogAgr.value,
                  AllrgyidAgr:
                    this.updateAllergyForm.controls.AllrgyidAgr.value,
                  AllergenGrp:
                    this.updateAllergyForm.controls.AllergenGrp.value,
                  Cert: this.updateAllergyForm.controls.Cert.value,
                  CerText: this.updateAllergyForm.controls.CerText.value,
                  Eval: this.updateAllergyForm.controls.Eval.value,
                  EvalTxt: this.updateAllergyForm.controls.EvalTxt.value,
                  Rea: this.updateAllergyForm.controls.Rea.value,
                  ReaText: this.updateAllergyForm.controls.ReaText.value,
                  Soa: this.updateAllergyForm.controls.Soa.value,
                  SoaText: this.updateAllergyForm.controls.SoaText.value,
                  Typ: this.updateAllergyForm.controls.Typ.value,
                  TypText: this.updateAllergyForm.controls.TypText.value,
                  Adcomment: this.updateAllergyForm.controls.Adcomment.value,
                  AdcommentLt: this.updateAllergyForm.controls.Adcomment.value,
                  Mode: 'U',
                },
              ],
            },
          };
        }
        this.saveAllergyList();
      } else {
        if (this.updateAllergyForm.controls.AllergySeqno.value == '0000') {
          this.allergyJson = {
            Patnr: this.selectedERList.Patnr,
            NoAllergy: this.noAllergiesValue,
            NoCollection: this.noCollectionValue,
            StateComment: this.StateComment,
            StateCommentLt: this.StateComment,
            PatAllergyHdrToItmNav: {
              results: [
                {
                  Patnr: this.selectedERList.Patnr,
                  AllergySeqno:
                    this.updateAllergyForm.controls.AllergySeqno.value,
                  Responsible: this.storageService.getGpart(),
                  ResponsibleNm:
                    this.storageService.getUserProfile()?.GpartName,
                  Allrgycatlog:
                    this.updateAllergyForm.controls.Allrgycatlog.value,
                  Allrgyid: this.updateAllergyForm.controls.Allrgyid.value,
                  Allergen: this.updateAllergyForm.controls.Allergen.value,
                  AllrgycatlogAgr:
                    this.updateAllergyForm.controls.AllrgycatlogAgr.value,
                  AllrgyidAgr:
                    this.updateAllergyForm.controls.AllrgyidAgr.value,
                  AllergenGrp:
                    this.updateAllergyForm.controls.AllergenGrp.value,
                  Cert: this.updateAllergyForm.controls.Cert.value,
                  CerText: this.updateAllergyForm.controls.CerText.value,
                  Eval: this.updateAllergyForm.controls.Eval.value,
                  EvalTxt: this.updateAllergyForm.controls.EvalTxt.value,
                  Rea: this.updateAllergyForm.controls.Rea.value,
                  ReaText: this.updateAllergyForm.controls.ReaText.value,
                  Soa: this.updateAllergyForm.controls.Soa.value,
                  SoaText: this.updateAllergyForm.controls.SoaText.value,
                  Typ: this.updateAllergyForm.controls.Typ.value,
                  TypText: this.updateAllergyForm.controls.TypText.value,
                  Adcomment: this.updateAllergyForm.controls.Adcomment.value,
                  AdcommentLt: this.updateAllergyForm.controls.Adcomment.value,
                  Mode: 'I',
                },
              ],
            },
          };
        } else {
          this.allergyJson = {
            Patnr: this.selectedERList.Patnr,
            NoAllergy: this.noAllergiesValue,
            NoCollection: this.noCollectionValue,
            StateComment: this.StateComment,
            StateCommentLt: this.StateComment,
            PatAllergyHdrToItmNav: {
              results: [
                {
                  Patnr: this.selectedERList.Patnr,
                  AllergySeqno:
                    this.updateAllergyForm.controls.AllergySeqno.value,
                  Responsible: this.storageService.getGpart(),
                  ResponsibleNm:
                    this.storageService.getUserProfile()?.GpartName,
                  Allrgycatlog:
                    this.updateAllergyForm.controls.Allrgycatlog.value,
                  Allrgyid: this.updateAllergyForm.controls.Allrgyid.value,
                  Allergen: this.updateAllergyForm.controls.Allergen.value,
                  AllrgycatlogAgr:
                    this.updateAllergyForm.controls.AllrgycatlogAgr.value,
                  AllrgyidAgr:
                    this.updateAllergyForm.controls.AllrgyidAgr.value,
                  AllergenGrp:
                    this.updateAllergyForm.controls.AllergenGrp.value,
                  Cert: this.updateAllergyForm.controls.Cert.value,
                  CerText: this.updateAllergyForm.controls.CerText.value,
                  Eval: this.updateAllergyForm.controls.Eval.value,
                  EvalTxt: this.updateAllergyForm.controls.EvalTxt.value,
                  Rea: this.updateAllergyForm.controls.Rea.value,
                  ReaText: this.updateAllergyForm.controls.ReaText.value,
                  Soa: this.updateAllergyForm.controls.Soa.value,
                  SoaText: this.updateAllergyForm.controls.SoaText.value,
                  Typ: this.updateAllergyForm.controls.Typ.value,
                  TypText: this.updateAllergyForm.controls.TypText.value,
                  Adcomment: this.updateAllergyForm.controls.Adcomment.value,
                  AdcommentLt: this.updateAllergyForm.controls.Adcomment.value,
                  Mode: 'U',
                },
              ],
            },
          };
        }
        this.saveAllergyList();
      }
    }
  }

  saveAllergyList() {
    if (this.allergyList.length == 0) {
      let text = '';
      if (this.updateAllergyForm.controls.Allergen.value !== '') {
        text = 'Allergen is saved Successfully';
      } else if (this.noAllergies) {
        text = 'No Known Allergy is saved Successfully';
      } else if (this.noCollection) {
        text = 'No Allergy Assessment is saved Successfully';
      } else if (this.StateComment != '') {
        text = 'Allergy is saved Successfully';
      }
      this.emergencyService.SaveAllergyHistory(this.allergyJson).subscribe(
        (_success: any) => {
          this.allergyList = [];
          this.resetAllergyForm();
          this.getAllergyHistoryList(this.selectedERList);
          //this.closeAllergyModal();
          //this.getAllergyHistoryList(this.selectedERList);
          Swal.fire({
            text: text,
            icon: 'success',
            confirmButtonText: 'Ok',
            customClass: { popup: 'myalertpopup' },
          });
        },
        (_error: any) => {}
      );
    } else if (
      this.allergyList.length > 0 &&
      this.allergyJson['PatAllergyHdrToItmNav']['results'].length == 0
    ) {
      if (this.noAllergies || this.noCollection || this.StateComment !== '') {
        let text = '';
        if (this.noAllergies) {
          text = 'No Known Allergy is saved Successfully';
        } else if (this.noCollection) {
          text = 'No Allergy Assessment is saved Successfully';
        } else if (this.StateComment !== '') {
          text = 'Allergy is saved Successfully';
        }
        this.emergencyService.SaveAllergyHistory(this.allergyJson).subscribe(
          (_success: any) => {
            this.allergyList = [];
            this.resetAllergyForm();
            this.getAllergyHistoryList(this.selectedERList);
            //this.closeAllergyModal();
            //this.getAllergyHistoryList(this.selectedERList);
            Swal.fire({
              text: text,
              icon: 'success',
              confirmButtonText: 'Ok',
              customClass: { popup: 'myalertpopup' },
            });
          },
          (_error: any) => {}
        );
      }
    } else {
      if (
        this.allergyJson['PatAllergyHdrToItmNav']['results'][0]['Mode'] !== 'D'
      ) {
        if (this.noAllergies || this.noCollection || this.StateComment !== '') {
          let text = '';
          if (this.noAllergies) {
            text = 'No Known Allergy is saved Successfully';
          } else if (this.noCollection) {
            text = 'No Allergy Assessment is saved Successfully';
          } else if (this.StateComment !== '') {
            text = 'Allergy is saved Successfully';
          }
          this.emergencyService.SaveAllergyHistory(this.allergyJson).subscribe(
            (_success: any) => {
              this.allergyList = [];
              this.resetAllergyForm();
              this.getAllergyHistoryList(this.selectedERList);
              //this.closeAllergyModal();
              //this.getAllergyHistoryList(this.selectedERList);
              Swal.fire({
                text: text,
                icon: 'success',
                confirmButtonText: 'Ok',
                customClass: { popup: 'myalertpopup' },
              });
            },
            (_error: any) => {}
          );
        } else {
          if (this.updateAllergyForm.controls.Allergen.value == '') {
            Swal.fire({
              text: 'Allergen is mandatory',
              icon: 'error',
              confirmButtonText: 'Ok',
              customClass: { popup: 'myalertpopup' },
            });
          } else {
            let text = '';
            if (this.updateAllergyForm.controls.Allergen.value !== '') {
              text = 'Allergen is saved Successfully';
            }
            this.emergencyService
              .SaveAllergyHistory(this.allergyJson)
              .subscribe(
                (_success: any) => {
                  this.allergyList = [];
                  this.resetAllergyForm();
                  this.getAllergyHistoryList(this.selectedERList);
                  //this.closeAllergyModal();
                  //this.getAllergyHistoryList(this.selectedERList);
                  Swal.fire({
                    text: text,
                    icon: 'success',
                    confirmButtonText: 'Ok',
                    customClass: { popup: 'myalertpopup' },
                  });
                },
                (_error: any) => {}
              );
          }
        }
      } else if (
        this.allergyJson['PatAllergyHdrToItmNav']['results'][0]['Mode'] == 'D'
      ) {
        this.emergencyService.SaveAllergyHistory(this.allergyJson).subscribe(
          (_success: any) => {
            this.allergyList = [];
            this.cancelReasonValue = '';
            this.resetAllergyForm();
            this.getAllergyHistoryList(this.selectedERList);
            //this.closeAllergyModal();
            //this.getAllergyHistoryList(this.selectedERList);
            Swal.fire({
              text: 'Deleted Successully',
              icon: 'success',
              confirmButtonText: 'Ok',
              customClass: { popup: 'myalertpopup' },
            });
          },
          (_error: any) => {}
        );
      } else {
        let text = '';
        if (this.updateAllergyForm.controls.Allergen.value !== '') {
          text = 'Allergen is saved Successfully';
        } else if (this.noAllergies) {
          text = 'No Known Allergy is saved Successfully';
        } else if (this.noCollection) {
          text = 'No Allergy Assessment is saved Successfully';
        }
        this.emergencyService.SaveAllergyHistory(this.allergyJson).subscribe(
          (_success: any) => {
            this.allergyList = [];
            this.resetAllergyForm();
            this.getAllergyHistoryList(this.selectedERList);
            //this.closeAllergyModal();
            //this.getAllergyHistoryList(this.selectedERList);
            Swal.fire({
              text: text,
              icon: 'success',
              confirmButtonText: 'Ok',
              customClass: { popup: 'myalertpopup' },
            });
          },
          (_error: any) => {}
        );
      }
    }
  }
  resetUpdateAllergyForm() {
    this.updateAllergyForm.patchValue({
      AllergySeqno: '0000',
      Allrgycatlog: '',
      Allrgyid: '',
      Allergen: '',
      AllrgycatlogAgr: '',
      AllrgyidAgr: '',
      AllergenGrp: '',
      Cert: '',
      CerText: '',
      Eval: '',
      EvalTxt: '',
      Rea: '',
      ReaText: '',
      Soa: '',
      SoaText: '',
      Typ: '',
      TypText: '',
      Adcomment: '',
      AdcommentLt: '',
    });
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
    //  if(this.colName == 'RiskCode'){
    //   this.updateRiskForm.controls.Rsfnr.setValue(item.Rsfnr);
    //   this.updateRiskForm.controls.Rsfna.setValue(item.Rsfna);
    //   this.updateRiskForm.controls.Rsfkb.setValue(item.Rsfkb);
    //  }
    this.modalRef.hide();
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

  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }
  getTime(value) {
    if (value) {
      var str = value;
      var str = str.replace(/[PT]/g, '');
      var str = str.replace(/[H]/g, ':');
      var str = str.replace(/[M]/g, ':');
      var str = str.replace(/[S]/g, '');
      var str = str.split(':');
      var finalstr = str[0] + ':' + str[1];
      return finalstr;
    }
  }
}
