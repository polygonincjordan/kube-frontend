import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-physician-allergy',
  templateUrl: './physician-allergy.component.html',
  styleUrls: ['./physician-allergy.component.scss'],
})
export class PhysicianAllergyComponent implements OnInit {
  @ViewChild('allergyModal', { static: true }) allergyModal: TemplateRef<any>;
  @Output() importEvent = new EventEmitter();
  allergyform: FormGroup;
  updateAllergyForm: FormGroup;
  updateRiskForm: FormGroup;
  allergyFormitems: FormArray;
  riskList = [];
  allergyList = [];
  allergenValues: any;
  allergenGroupValues: any;
  allergyCertaintyValues: any;
  allergyEvaluationValues: any;
  allergyReactionValues: any;
  severityValues: any;
  allergyTypeValues: any;
  allergyJson = {};
  allergyItemsArr: any = [];
  allergyFinalApiArr: any = [];
  userProfile: any;
  noCollection: boolean = false;
  noAllergies: boolean = false;
  allergySelectedRowArr: any = [];
  noAllergiesValue: string = '';
  noCollectionValue: string = '';
  riskform: FormGroup;
  riskFormitems: FormArray;
  riskValues: any;
  riskItemsArr: any = [];
  modalRef: BsModalRef;
  modalRefForStrucDoc: BsModalRef;
  selectedERList: any;
  getPhyDocForm: FormGroup;
  getNursDocForm: FormGroup;
  createDocForm: FormGroup;
  ZdocNr = '';
  phyAssessmentList: any;
  actionStatus: any;
  enableCreate: boolean = true;
  enableRelease: boolean = true;
  enableEdit: boolean = true;
  enableDelete: boolean = true;
  pdfUrl: any;
  //phy order
  navTabBoxActiveValue: string = '02';
  graphChartCountType: string = '1';
  reloadPhyOrderList: boolean = false;
  inHospitalistList: any[] = [];
  institutionid: any;
  caseid: any;
  physicianOrderList: any[];
  admittedFrom: string;
  admittedTo: string;
  paramsFilter: any = {};
  paramsObj: any = {};
  occupationalGroupData: any;
  StateComment = '';
  activeAllergy: boolean = false;
  activeProgressNotes: boolean = false;
  activePhysicianOrders: boolean = false;
  activeRiskFactor: boolean = false;
  activePastMedical: boolean = false;
  activePastSurgical: boolean = false;
  activeFamilyHistory: boolean = false;
  activeStructuredDoc: boolean = false;
  activeDiagnosis: boolean = false;
  modalRefForAllergy: BsModalRef;
  modalRefForRisk: BsModalRef;
  modalRefForDelete: BsModalRef;
  modalCommonDataArr: any;
  colName: any;
  searchString = '';
  isCheckboxesDisabled = false;
  isRiskUpdate = false;
  riskJson = [];
  cancelReasonListData: any;
  cancelReasonValue = '';
  errmsg = '';
  allergyActionStatus: any;
  rowData: any;
  selectedDataForUpdate: any;
  importCheckedData = [];

  constructor(
    private modalServiceForAllergy: BsModalService,
    private formBuilder: FormBuilder,
    public storageService: StorageService,
    private emergencyService: EmergencyService,
    private sanitizer: DomSanitizer
  ) {
    this.allergyform = this.formBuilder.group({
      allergyFormitems: new FormArray([]),
    });
    this.riskform = this.formBuilder.group({
      riskFormitems: new FormArray([]),
    });
    this.updateAllergyForm = this.formBuilder.group({
      AllergySeqno: ['0000'],
      Allrgycatlog: [''],
      Allrgyid: [''],
      Allergen: [''],
      AllrgycatlogAgr: [''],
      AllrgyidAgr: [''],
      AllergenGrp: [''],
      Cert: [''],
      CerText: [''],
      Eval: [''],
      EvalTxt: [''],
      Rea: [''],
      ReaText: [''],
      Soa: [''],
      SoaText: [''],
      Typ: [''],
      TypText: [''],
      Adcomment: [''],
      AdcommentLt: [''],
    });
  }

  ngOnInit() {}
  // allergy code
  disableInputsOfAllergy() {
    (<FormArray>this.allergyform.get('allergyFormitems')).controls.forEach(
      (control) => {
        control['controls']['Allergen'].disable();
        control['controls']['AllergenGrp'].disable();
        control['controls']['CerText'].disable();
        control['controls']['EvalTxt'].disable();
        control['controls']['ReaText'].disable();
        control['controls']['SoaText'].disable();
        control['controls']['TypText'].disable();
        control['controls']['AdCommentLt'].disable();
        control['controls']['isChecked'].disable();
        //control['Rsfkb'].disable();
      }
    );
  }
  enableInputsOfAllergy() {
    (<FormArray>this.allergyform.get('allergyFormitems')).controls.forEach(
      (control) => {
        control['controls']['Allergen'].enable();
        control['controls']['AllergenGrp'].enable();
        control['controls']['CerText'].enable();
        control['controls']['EvalTxt'].enable();
        control['controls']['ReaText'].enable();
        control['controls']['SoaText'].enable();
        control['controls']['TypText'].enable();
        control['controls']['AdCommentLt'].enable();
        control['controls']['isChecked'].enable();
        //control['Rsfkb'].disable();
      }
    );
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
        // Patnr: [this.storageService.patnr],
        // Lfdnr: [this.selectedERList.Lfdbw],
        Mode: [''],
        isChecked: [true],
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
        // Patnr: [this.storageService.patnr],
        // Lfdnr: [this.selectedERList.Lfdbw],
        Mode: [''],
        isChecked: [true],
        isNew: [true],
      });
    }
  }
  public openModalForAllergy() {
    const config: ModalOptions = {
      class: 'modal-dialog-centered allergy-modal-size',
      ignoreBackdropClick: true,
    };
    this.modalRefForAllergy = this.modalServiceForAllergy.show(
      this.allergyModal,
      config
    );
    this.userProfile = this.storageService.getUserProfile();
    this.isCheckboxesDisabled = false;
    this.modalRefForAllergy.onHide.subscribe((reason: string | any) => {
      if (reason === 'backdrop-click') {
        this.resetAllergyForm();
      }
    });
    this.importCheckedData = [];
    this.getAllergyHistoryList();
    this.getAllergenValues();
    this.getAllergenGroupValues();
    this.getAllergyCertaintyValues();
    this.getAllergyEvaluationValues();
    this.getAllergyReactionValues();
    this.getSeverityValues();
    this.getAllergyTypeValues();
    this.getCancelReasons();
  }
  openCommonModal(template: TemplateRef<any>, column) {
    const config: ModalOptions = {
      class: 'list-commonmodal modal-dialog-centered',
    };
    this.modalRef = this.modalServiceForAllergy.show(template, config);
    this.colName = column;
    this.searchString = '';
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
    if (column == 'Comments') {
      this.modalCommonDataArr = this.allergenValues;
    }
    if (column == 'RiskCode') {
      this.modalCommonDataArr = this.riskValues;
      this.searchString = this.updateRiskForm.controls.Rsfna.value;
      this.someMethod(this.searchString);
    }
  }
  resetAllergyForm() {
    this.allergyFormitems = this.allergyform.get(
      'allergyFormitems'
    ) as FormArray;
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
  // allergy
  getCancelReasons() {
    const json = {
      einri: this.storageService.einri,
      patnr: this.storageService.patnr,
    };
    this.emergencyService.getCancelReasons().subscribe(
      (_success: any) => {
        this.cancelReasonListData = _success.d.results;
      },
      (_error: any) => {}
    );
  }
  getAllergyHistoryList() {
    const json = {
      einri: this.storageService.einri,
      patnr: this.storageService.patnr,
    };
    this.emergencyService.getAllergyHistory(json).subscribe(
      (_success: any) => {
        this.allergyList = [];
        this.isCheckboxesDisabled = false;
        this.allergyList = _success.d.results;
        if (this.allergyList[0]?.PatAllergyHdrToItmNav.results.length == 0) {
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
      },
      (_error: any) => {}
    );
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
  confirmationForAllergyDelete(template: TemplateRef<any>, status, item) {
    const config: ModalOptions = {
      class: 'modal-dialog-centered allergy-delete-modal',
    };
    this.modalRefForDelete = this.modalServiceForAllergy.show(template, config);
    this.allergyActionStatus = status;
    this.rowData = item;
  }
  checkForDeleteValue() {
    if (this.cancelReasonValue == '') {
      this.errmsg = 'Select a Reason for Deletion';
    } else {
      this.modalRefForDelete.hide();
      this.deleteAllergyJson(this.allergyActionStatus, this.rowData);
    }
  }
  checkDataForAllergy(status) {
    if (this.allergyFormitems != undefined) {
      if (this.noAllergies || this.noCollection) {
        status = 'D';
      }
      this.allergyItemsArr = this.allergyFormitems.value.filter((element) => {
        if (element.isNew) {
          if (element.isChecked) {
            delete element.isChecked;
            delete element.isNew;
            if (status == 'I') {
              element['Mode'] = 'I';
            } else {
              element['Mode'] = 'D';
            }
            return element;
          }
        } else {
          if (element.isChecked) {
            delete element.isChecked;
            delete element.isNew;
            if (status == 'I') {
              element['Mode'] = 'I';
            } else {
              element['Mode'] = 'D';
            }
            return element;
          }
        }
      });
      if (this.allergyItemsArr.length > 0) {
        var PatAllergyHdrToItmNav = [];
        this.allergyItemsArr.forEach((element) => {
          PatAllergyHdrToItmNav.push({
            Patnr: this.storageService.patnr,
            AllergySeqno: element.AllergySeqno,
            Responsible: this.userProfile.Gpart,
            ResponsibleNm: this.userProfile.GpartName,
            Allrgycatlog: element.Allergen.Bchid,
            Allrgyid: element.Allergen.Bcpid,
            Allergen: element.Allergen.Bcpname,
            AllrgycatlogAgr: element.AllergenGrp.Bchid,
            AllrgyidAgr: element.AllergenGrp.Bcpid,
            AllergenGrp: element.AllergenGrp.Bcpname,
            Cert: element.CerText.Cer,
            CerText: element.CerText.CerText,
            Eval: element.EvalTxt.Eval,
            EvalTxt: element.EvalTxt.EvalTxt,
            Rea: element.ReaText.Rea,
            ReaText: element.ReaText.ReaText,
            Soa: element.SoaText.Soa,
            SoaText: element.SoaText.SoaText,
            Typ: element.TypText.Typ,
            TypText: element.TypText.TypText,
            Adcomment: element.AdCommentLt,
            AdcommentLt: element.AdCommentLt,
            Mode: element.Mode,
          });
        });
        this.allergyJson = {
          Patnr: this.storageService.patnr,
          NoAllergy: this.noAllergiesValue,
          NoCollection: this.noCollectionValue,
          StateComment: this.StateComment,
          StateCommentLt: this.StateComment,
          PatAllergyHdrToItmNav: {
            results: PatAllergyHdrToItmNav,
          },
        };
        //this.allergyFinalApiArr = this.allergyJson;
        this.saveAllergyList();
      }
    } else {
      this.allergyItemsArr = [];
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
          this.getAllergyHistoryList();
          //this.closeAllergyModal();
          //this.getAllergyHistoryList(this.selectedERList);
          Swal.fire({
            text: text,
            icon: 'success',
            confirmButtonText: 'Ok',
            customClass: 'myalertpopup',
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
            this.getAllergyHistoryList();
            //this.closeAllergyModal();
            //this.getAllergyHistoryList(this.selectedERList);
            Swal.fire({
              text: text,
              icon: 'success',
              confirmButtonText: 'Ok',
              customClass: 'myalertpopup',
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
              this.getAllergyHistoryList();
              //this.closeAllergyModal();
              //this.getAllergyHistoryList(this.selectedERList);
              Swal.fire({
                text: text,
                icon: 'success',
                confirmButtonText: 'Ok',
                customClass: 'myalertpopup',
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
              customClass: 'myalertpopup',
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
                  this.getAllergyHistoryList();
                  //this.closeAllergyModal();
                  //this.getAllergyHistoryList(this.selectedERList);
                  Swal.fire({
                    text: text,
                    icon: 'success',
                    confirmButtonText: 'Ok',
                    customClass: 'myalertpopup',
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
            this.getAllergyHistoryList();
            //this.closeAllergyModal();
            //this.getAllergyHistoryList(this.selectedERList);
            Swal.fire({
              text: 'Deleted Successully',
              icon: 'success',
              confirmButtonText: 'Ok',
              customClass: 'myalertpopup',
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
            this.getAllergyHistoryList();
            //this.closeAllergyModal();
            //this.getAllergyHistoryList(this.selectedERList);
            Swal.fire({
              text: text,
              icon: 'success',
              confirmButtonText: 'Ok',
              customClass: 'myalertpopup',
            });
          },
          (_error: any) => {}
        );
      }
    }
  }

  updateAllergyCheckboxes(model, element) {
    if (element == 'noallergy') {
      this.noCollectionValue = '';
      if (model) {
        this.noCollection = false;
        //this.disableInputsOfAllergy();
        this.noAllergiesValue = 'X';
        this.setAllValuesChecked();
        this.updateAllergyForm.disable();
      } else {
        this.noCollection = false;
        this.noAllergies = false;
        this.noAllergiesValue = '';
        this.setAllValuesUnChecked();
        this.updateAllergyForm.enable();
        //this.enableInputsOfAllergy();
      }
    } else if (element == 'nocollection') {
      this.noAllergiesValue = '';
      if (model) {
        this.noAllergies = false;
        //this.disableInputsOfAllergy();
        this.noCollectionValue = 'X';
        this.setAllValuesChecked();
        this.updateAllergyForm.disable();
      } else {
        this.noCollection = false;
        this.noAllergies = false;
        this.noCollectionValue = '';
        this.setAllValuesUnChecked();
        this.updateAllergyForm.enable();
        //this.enableInputsOfAllergy();
      }
    }
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
    if (this.colName == 'RiskCode') {
      this.updateRiskForm.controls.Rsfnr.setValue(item.Rsfnr);
      this.updateRiskForm.controls.Rsfna.setValue(item.Rsfna);
      this.updateRiskForm.controls.Rsfkb.setValue(item.Rsfkb);
    }
    this.modalRef.hide();
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
          Patnr: this.storageService.patnr,
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
          customClass: 'myalertpopup',
        });
      } else {
        if (this.updateAllergyForm.controls.AllergySeqno.value == '0000') {
          this.allergyJson = {
            Patnr: this.storageService.patnr,
            NoAllergy: this.noAllergiesValue,
            NoCollection: this.noCollectionValue,
            StateComment: this.StateComment,
            StateCommentLt: this.StateComment,
            PatAllergyHdrToItmNav: {
              results: [
                {
                  Patnr: this.storageService.patnr,
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
            Patnr: this.storageService.patnr,
            NoAllergy: this.noAllergiesValue,
            NoCollection: this.noCollectionValue,
            StateComment: this.StateComment,
            StateCommentLt: this.StateComment,
            PatAllergyHdrToItmNav: {
              results: [
                {
                  Patnr: this.storageService.patnr,
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
          customClass: 'myalertpopup',
        });
      } else if (
        this.StateComment != '' &&
        this.updateAllergyForm.controls.Allergen.value == ''
      ) {
        this.allergyJson = {
          Patnr: this.storageService.patnr,
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
            Patnr: this.storageService.patnr,
            NoAllergy: this.noAllergiesValue,
            NoCollection: this.noCollectionValue,
            StateComment: this.StateComment,
            StateCommentLt: this.StateComment,
            PatAllergyHdrToItmNav: {
              results: [
                {
                  Patnr: this.storageService.patnr,
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
            Patnr: this.storageService.patnr,
            NoAllergy: this.noAllergiesValue,
            NoCollection: this.noCollectionValue,
            StateComment: this.StateComment,
            StateCommentLt: this.StateComment,
            PatAllergyHdrToItmNav: {
              results: [
                {
                  Patnr: this.storageService.patnr,
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
            Patnr: this.storageService.patnr,
            NoAllergy: this.noAllergiesValue,
            NoCollection: this.noCollectionValue,
            StateComment: this.StateComment,
            StateCommentLt: this.StateComment,
            PatAllergyHdrToItmNav: {
              results: [
                {
                  Patnr: this.storageService.patnr,
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
            Patnr: this.storageService.patnr,
            NoAllergy: this.noAllergiesValue,
            NoCollection: this.noCollectionValue,
            StateComment: this.StateComment,
            StateCommentLt: this.StateComment,
            PatAllergyHdrToItmNav: {
              results: [
                {
                  Patnr: this.storageService.patnr,
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

  deleteAllergyJson(mode, item) {
    this.allergyJson = {};
    this.allergyJson = {
      Patnr: this.storageService.patnr,
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
  }

  closeAllergyModal() {
    //  this.modalRefForAllergy.hide();
    this.resetAllergyForm();
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
  Import() {
    this.importCheckedData = [];
    this.allergyform.value.allergyFormitems.forEach((element) => {
      if (element.isChecked) {
        this.importCheckedData.push(element);
      }
    });
    this.importEvent.emit(this.importCheckedData);
    this.closeAllergyModal();
    this.modalRefForAllergy.hide();
  }
}
