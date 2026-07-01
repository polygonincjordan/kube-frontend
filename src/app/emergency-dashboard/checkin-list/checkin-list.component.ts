import { EEmrService } from '@services/e-emr.service';
import { StorageService } from './../../services/storage.service';
import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { ErVitalsComponent } from './er-vitals/er-vitals.component';
import { OrdersDashboardService } from '@services/orders-dashboard/orders-dashboard.service';
import { DatePipe } from '@angular/common';
import { AdminAttechmentComponent } from 'src/app/shared-module/admin-attechment/admin-attechment.component';

@Component({
  selector: 'app-checkin-list',
  templateUrl: './checkin-list.component.html',
  styleUrls: ['./checkin-list.component.css']
})
export class CheckinListComponent implements OnInit {
  @Output() redirectCheckInData = new EventEmitter<any>();
  @Output() sendErPatientCount = new EventEmitter<any>();
  @ViewChild('erVitalsModal') erVitalsModal: ErVitalsComponent;
  @ViewChild('nurErAttechment') nurErAttechment: AdminAttechmentComponent;

  ERlistData: any = [];
  modalRef: BsModalRef;
  modalRefForAllergy: BsModalRef;
  modalRefForRisk: BsModalRef;
  modalRefForTriage: BsModalRef;
  modalRefForDelete: BsModalRef;
  selectedERList: any;
  riskform: FormGroup;
  riskFormitems: FormArray;
  allergyform: FormGroup;
  allergyFormitems: FormArray;
  updateAllergyForm: FormGroup;
  updateRiskForm: FormGroup;
  surgeonForm: FormGroup;
  riskList = [];
  allergyList = [];
  riskValues: any;
  riskItemsArr: any = [];
  allergenValues: any;
  allergenGroupValues: any;
  allergyCertaintyValues: any;
  allergyEvaluationValues: any;
  allergyReactionValues: any;
  severityValues: any;
  allergyTypeValues: any;
  allergyJson = {};
  riskJson = [];
  allergyItemsArr: any = [];
  allergyFinalApiArr: any = [];
  userProfile: any;
  noCollection: boolean = false;
  noAllergies: boolean = false;
  allergySelectedRowArr: any = [];
  noAllergiesValue: string = '';
  noCollectionValue: string = '';
  StateComment: any;
  triageList = [];
  currentDateObj: any;
  modalCommonDataArr: any;
  colName: any;
  isCheckboxesDisabled = false;
  isRiskUpdate = false;
  rowIsActive = false;
  allTriageData = [];
  selectedTriageFromCheckin: any;
  selectedRowOfAllTriage: any;
  searchString = '';
  cancelReasonListData: any;
  cancelReasonValue = '';
  errmsg = '';
  allergyActionStatus: any;
  rowData: any;
  selectedDataForUpdate: any;
  assignUsersList: any;
  ERlistDataClone: any = [];
  asc = false;
  triageValueArr: any = [];
  physicianValueArr: any = [];
  statusValueArr: any = [];
  erListIndex: any;
  visitComments: any;
  constructor(private emergencyService: EmergencyService, private modalService: BsModalService, private formBuilder: FormBuilder, private storageService: StorageService, private emrservice: EEmrService, private orderDashboardService: OrdersDashboardService,) {
    this.riskform = this.formBuilder.group({
      riskFormitems: new FormArray([]),
    });
    this.allergyform = this.formBuilder.group({
      allergyFormitems: new FormArray([]),
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
    this.updateRiskForm = this.formBuilder.group({
      Rsfnr: [''],
      Rsfna: [''],
      Rsfkb: [''],
      Rsfsn: [''],
      Repdt: [''],
    });
    this.surgeonForm = this.formBuilder.group({
      Surgeon: [''],
      SurgeonName: [''],
    })
  }

  ngOnInit() {
    this.getErList();
    this.dataForTriage();
  }
  addItemForRisk(element?): void {
    this.riskFormitems = this.riskform.get('riskFormitems') as FormArray;
    this.riskFormitems.push(this.showRiskDetailsOnList(element));
    this.disableInputs()
  }
  addNewItemForRisk() {
    const control = <FormArray>this.riskform.controls['riskFormitems'];
    this.riskFormitems = this.riskform.get('riskFormitems') as FormArray;
    control.insert(0, this.showRiskDetailsOnList());
  }
  disableInputs() {
    (<FormArray>this.riskform.get('riskFormitems'))
      .controls
      .forEach(control => {
        console.log(control);

        control['controls']['Rsfna'].disable();
        control['controls']['Rsfkb'].disable();
        //control['Rsfkb'].disable();
      })
  }
  disableInputsOfAllergy() {
    (<FormArray>this.allergyform.get('allergyFormitems'))
      .controls
      .forEach(control => {
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
      })
  }
  enableInputsOfAllergy() {
    (<FormArray>this.allergyform.get('allergyFormitems'))
      .controls
      .forEach(control => {
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
      })
  }
  setAllValuesChecked() {
    (<FormArray>this.allergyform.get('allergyFormitems'))
      .controls
      .forEach(control => {
        control['controls']['isChecked'].setValue(true);
        //control['Rsfkb'].disable();
      })
  }
  setAllValuesUnChecked() {
    (<FormArray>this.allergyform.get('allergyFormitems'))
      .controls
      .forEach(control => {
        control['controls']['isChecked'].setValue(false);
        //control['Rsfkb'].disable();
      })
  }
  showRiskDetailsOnList(element?): FormGroup {
    if (element) {
      return this.formBuilder.group({
        Rsfnr: [element.Rsfnr],
        Rsfna: [element.Rsfna],
        Rsfkb: [element.Rsfkb],
        Rsfsn: [element.Rsfsn],
        Repdt: [element.Repdt],
        Einri: [this.selectedERList.Einri],
        Patnr: [this.selectedERList.Patnr],
        Lfdnr: [this.selectedERList.Lfdbw],
        Mode: [''],
        isChecked: [false],
      }
      );
    } else {
      return this.formBuilder.group({
        Rsfnr: [''],
        Rsfna: [''],
        Rsfkb: [''],
        Rsfsn: [''],
        Repdt: [''],
        Einri: [this.selectedERList.Einri],
        Patnr: [this.selectedERList.Patnr],
        Lfdnr: [this.selectedERList.Lfdbw],
        Mode: [''],
        isChecked: [true],
      }
      );

    }
  }
  addItemForAllergy(element?): void {
    this.allergyFormitems = this.allergyform.get('allergyFormitems') as FormArray;
    this.allergyFormitems.push(this.showAllergyDetailsOnList(element));
    //this.disableInputs()
  }
  addNewItemForAllergy(): void {
    const control = <FormArray>this.allergyform.controls['allergyFormitems'];
    this.allergyFormitems = this.allergyform.get('allergyFormitems') as FormArray;
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
        isNew: [false]
      }
      );
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
        isNew: [true]
      }
      );

    }
  }
  public openModalForRisk(
    template: TemplateRef<any>,
    data: any
  ) {
    const config: ModalOptions = { class: 'modal-dialog-centered modal-xl risk-modal-size' };
    this.modalRefForRisk = this.modalService.show(template, config);
    this.selectedERList = data;
    this.getRiskList(data);
    this.getRiskValues();
    this.isRiskUpdate = false;
    this.modalRefForRisk.onHide.subscribe((reason: string | any) => {
      if (reason === 'backdrop-click') {
        this.closeRiskModal();
      }
    });

  }
  public openModalForAllergy(
    template: TemplateRef<any>,
    data: any
  ) {
    const config: ModalOptions = { class: 'modal-dialog-centered modal-xl allergy-modal-size' };
    this.modalRefForAllergy = this.modalService.show(template, config);
    this.selectedERList = data;
    this.userProfile = JSON.parse(localStorage.getItem('amc_dev_loggedInUserProfile'));
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

  // Extracts the numeric age embedded in the patient name string, e.g. "Er14, Er Patient (F, 31)" -> "31"
  getAgeFromName(value) {
    if (value) {
      const match = value.match(/\(\s*[A-Za-z]?\s*,\s*(\d+)\s*\)/);
      if (match && match[1]) {
        return match[1];
      }
    }
    return '';
  }
  getAssignedTime(triagetime, triagedate, index) {
    let { charArr, hr, min, dateObj, totalMinutes, assignedHr, assignedMin, assignedTime }: any = '';
    charArr = triagetime.split('')
    hr = parseInt(charArr[0] + charArr[1]);
    min = parseInt(charArr[3] + charArr[4]);
    dateObj = triagedate;
    this.currentDateObj = new Date();
    dateObj.setHours(hr, min);
    totalMinutes = (this.currentDateObj.getTime() - dateObj.getTime()) / 1000;
    totalMinutes = totalMinutes / 60;
    totalMinutes = Math.abs(Math.round(totalMinutes));
    assignedHr = Math.floor(totalMinutes / 60);
    assignedMin = totalMinutes % 60;
    assignedTime = String(assignedHr).padStart(2, '0') + 'h' + String(assignedMin).padStart(2, '0');
    this.ERlistData[index]['assignedTime'] = assignedTime;
  }
  getErList() {
    // let fromdate;
    // if (new Date().getDate() == 1) {
    //   fromdate = new Date().getFullYear() +'-'+ String(new Date().getMonth() +1).padStart(2, '0') +'-'+ '31'.padStart(2, '0') +'T00:00:00';
    // }else{
    // fromdate = new Date().getFullYear() +'-'+ String(new Date().getMonth() +1).padStart(2, '0') +'-'+ String(new Date().getDate()-1).padStart(2, '0') +'T00:00:00';
    // }
    const json = {
      fromDate: `${new DatePipe('en-US').transform(
        new Date().setDate(new Date().getDate() - 1),
        'yyyy-MM-dd'
      )}T00:00:00`,
      toDate: `${new DatePipe('en-US').transform(
        new Date(),
        'yyyy-MM-dd'
      )}T00:00:00`,
      History: false
    }
    this.emergencyService.getErList(json).subscribe(
      (_success: any) => {
        console.log('emergencyListSet response', _success);
        console.table(_success?.d?.results?.map((r: any) => ({
          Patnr: r.Patnr, Falnr: r.Falnr, Lfdnr: r.Lfdbw, Erdat: r.Erdat, ZeitIntern: r.ZeitIntern
        })));
        // this.ERlistData = _success.d.results;
        this.ERlistData = [];
        if (_success.d.results.length > 0) {
          if (_success.d.results.length == 0) {
            this.sendErPatientCount.emit(this.ERlistData.length);
          }
          _success.d.results.forEach((element) => {
            if (element.StatusTxt != 'Checked Out') {
              this.ERlistData.push(element);
              this.sendErPatientCount.emit(this.ERlistData.length);
              //this.triagePriorityList(element);
            }
          });
          this.ERlistData.forEach((element, index) => {
            if (element.TriageDate != null && element.TriageDate != '') {
              this.getAssignedTime(this.getTime(element.TriageTime), this.getDate(element.TriageDate), index);
            } else {
              this.ERlistData[index]['assignedTime'] = '';
            }

          });
          this.ERlistDataClone = this.ERlistData
        }

      },
      (_error: any) => { }
    );
  }
  redirectToTreatment(data) {
    this.redirectCheckInData.emit(data);
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
        // this.ERlistData = _success.d.results;
        this.redirectToTreatment(data);
      },
      (_error: any) => { }
    );
  }
  redirectToTreatByName(data) {
    const json = {
      Patnr: data.Patnr,
      Einri: data.Einri,
      Falnr: data.Falnr,
      Lfdnr: data.Lfdbw
    }
    this.storageService.setCheckinData(data);
    localStorage.setItem('checkindata', JSON.stringify(data));
    this.redirectToTreatment(json);

  }
  getRiskList(data) {
    const json = {
      "einri": data.Einri,
      "patnr": data.Patnr
    }
    this.emergencyService.getRiskList(json).subscribe(
      (_success: any) => {
        this.riskList = [];
        this.riskList = _success.d.results;

        this.riskList.forEach(element => {
          element["Repdt"] = new Date(element.Repdt);
          this.addItemForRisk(element);
        });
        console.log(this.riskList);

      },
      (_error: any) => { }
    );
  }
  getRiskValues() {
    this.emergencyService.getRiskValues().subscribe(
      (_success: any) => {
        this.riskValues = _success.d.results;
      },
      (_error: any) => { }
    );
  }

  checkDataForRisk(status) {
    if (this.riskFormitems != undefined) {
      this.riskItemsArr = this.riskFormitems.value.filter(element => {
        if (element.isChecked) {
          delete element.isChecked;
          element["Repdt"] = String(element.Repdt.getDate()).padStart(2, '0') + '.' + String(element.Repdt.getMonth() + 1).padStart(2, '0') + '.' + element.Repdt.getFullYear()
          if (status == 'I') {
            element['Mode'] = 'I';
          } else {
            element['Mode'] = 'D';
          }
          return element;
        }

      });
      if (this.riskItemsArr.length > 0) {
        this.saveRiskList();
      }
    }
    else {
      this.riskItemsArr = [];
    }

  }
  saveRiskList() {
    if (this.riskJson[0]['Mode'] !== 'D') {
      if (this.updateRiskForm.controls.Rsfna.value == '') {
        Swal.fire({
          text: "Risk Code is Mandatory",
          icon: 'error',
          confirmButtonText: 'Ok',
          customClass: { popup: 'myalertpopup' }
        })
      } else {
        const json = {
          Patnr: this.selectedERList.Patnr,
          PatRiskHdrToItmNav: {
            results: this.riskJson
          }
        }
        this.emergencyService.saveRiskList(json).subscribe(
          (_success: any) => {
            this.resetRiskForm();
            this.resetUpdateRiskForm();
            this.getRiskList(this.selectedERList);
            Swal.fire({
              text: "Saved successfully",
              icon: 'success',
              confirmButtonText: 'Ok',
              customClass: { popup: 'myalertpopup' }
            })
          },
          (_error: any) => { }
        );
      }
    } else if (this.riskJson[0]['Mode'] == 'D') {
      const json = {
        Patnr: this.selectedERList.Patnr,
        PatRiskHdrToItmNav: {
          results: this.riskJson
        }
      }
      this.emergencyService.saveRiskList(json).subscribe(
        (_success: any) => {
          this.resetRiskForm();
          this.resetUpdateRiskForm();
          this.getRiskList(this.selectedERList);
          Swal.fire({
            text: "Deleted successfully",
            icon: 'success',
            confirmButtonText: 'Ok',
            customClass: { popup: 'myalertpopup' }
          })
        },
        (_error: any) => { }
      );
    }
    else {
      const json = {
        Patnr: this.selectedERList.Patnr,
        PatRiskHdrToItmNav: {
          results: this.riskJson
        }
      }
      this.emergencyService.saveRiskList(json).subscribe(
        (_success: any) => {
          this.resetRiskForm();
          this.resetUpdateRiskForm();
          this.getRiskList(this.selectedERList);
          Swal.fire({
            text: "Saved successfully",
            icon: 'success',
            confirmButtonText: 'Ok',
            customClass: { popup: 'myalertpopup' }
          })
        },
        (_error: any) => { }
      );
    }
  }
  resetRiskForm() {
    this.riskFormitems = this.riskform.get('riskFormitems') as FormArray;
    this.riskform.reset();
    this.riskFormitems.clear();
    this.riskItemsArr = [];
  }
  confirmationForRiskDelete(status, item) {
    Swal.fire({
      text: "Are you sure you want to delete?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: { popup: 'myalertpopup' }
    }).then((result) => {
      if (result.value) {
        this.deleteRiskJson(item);
      }
    })
  }
  resetAllergyForm() {
    this.allergyFormitems = this.allergyform.get('allergyFormitems') as FormArray;
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
  // allergy
  getCancelReasons() {
    const json = {
      "einri": this.selectedERList.Einri,
      "patnr": this.selectedERList.Patnr
    }
    this.emergencyService.getCancelReasons().subscribe(
      (_success: any) => {
        this.cancelReasonListData = _success.d.results;
      },
      (_error: any) => { }
    );
  }
  getAllergyHistoryList(data) {
    const json = {
      "einri": data.Einri,
      "patnr": data.Patnr
    }
    this.emergencyService.getAllergyHistory(json).subscribe(
      (_success: any) => {
        this.allergyList = [];
        this.isCheckboxesDisabled = false;
        this.allergyList = _success.d.results;
        if (this.allergyList[0].PatAllergyHdrToItmNav.results.length == 0) {
          this.isCheckboxesDisabled = false;
        } else {
          this.isCheckboxesDisabled = true;
        }
        this.allergyList = _success.d.results[0].PatAllergyHdrToItmNav.results;
        this.StateComment = _success.d.results[0].StateComment;
        if (_success.d.results[0].NoCollection == 'X' || _success.d.results[0].NoAllergy == 'X') {
          if (_success.d.results[0].NoAllergy == 'X') {
            this.noAllergies = true;
            this.updateAllergyCheckboxes(this.noAllergies, 'noallergy');
          } else if (_success.d.results[0].NoCollection == 'X') {
            this.noCollection = true;
            this.updateAllergyCheckboxes(this.noCollection, 'nocollection');
          }


        }

        this.allergyList.forEach(element => {
          this.addItemForAllergy(element);
        });


      },
      (_error: any) => { }
    );
  }
  getAllergenValues() {
    this.emergencyService.getAllergenValues().subscribe(
      (_success: any) => {
        this.allergenValues = _success.d.results;
      },
      (_error: any) => { }
    );
  }
  getAllergenGroupValues() {
    this.emergencyService.getAllergenGroupValues().subscribe(
      (_success: any) => {
        this.allergenGroupValues = _success.d.results;
      },
      (_error: any) => { }
    );
  }
  getAllergyCertaintyValues() {
    this.emergencyService.getAllergyCertaintyValues().subscribe(
      (_success: any) => {
        this.allergyCertaintyValues = _success.d.results;
      },
      (_error: any) => { }
    );
  }
  getAllergyEvaluationValues() {
    this.emergencyService.getAllergyEvaluationValues().subscribe(
      (_success: any) => {
        this.allergyEvaluationValues = _success.d.results;
      },
      (_error: any) => { }
    );
  }
  getAllergyReactionValues() {
    this.emergencyService.getAllergyReactionValues().subscribe(
      (_success: any) => {
        this.allergyReactionValues = _success.d.results;
      },
      (_error: any) => { }
    );
  }
  getSeverityValues() {
    this.emergencyService.getSeverityValues().subscribe(
      (_success: any) => {
        this.severityValues = _success.d.results;
      },
      (_error: any) => { }
    );
  }
  getAllergyTypeValues() {
    this.emergencyService.getAllergyTypeValues().subscribe(
      (_success: any) => {
        this.allergyTypeValues = _success.d.results;
      },
      (_error: any) => { }
    );
  }
  confirmationForAllergyDelete(template: TemplateRef<any>, status, item) {
    const config: ModalOptions = { class: 'modal-dialog-centered allergy-delete-modal' };
    this.modalRefForDelete = this.modalService.show(template, config);
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
        status = 'D'
      }
      this.allergyItemsArr = this.allergyFormitems.value.filter(element => {
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
        this.allergyItemsArr.forEach(element => {
          PatAllergyHdrToItmNav.push({
            "Patnr": this.selectedERList.Patnr,
            "AllergySeqno": element.AllergySeqno,
            "Responsible": this.userProfile.Gpart,
            "ResponsibleNm": this.userProfile.GpartName,
            "Allrgycatlog": element.Allergen.Bchid,
            "Allrgyid": element.Allergen.Bcpid,
            "Allergen": element.Allergen.Bcpname,
            "AllrgycatlogAgr": element.AllergenGrp.Bchid,
            "AllrgyidAgr": element.AllergenGrp.Bcpid,
            "AllergenGrp": element.AllergenGrp.Bcpdescription,
            "Cert": element.CerText.Cer,
            "CerText": element.CerText.CerText,
            "Eval": element.EvalTxt.Eval,
            "EvalTxt": element.EvalTxt.EvalTxt,
            "Rea": element.ReaText.Rea,
            "ReaText": element.ReaText.ReaText,
            "Soa": element.SoaText.Soa,
            "SoaText": element.SoaText.SoaText,
            "Typ": element.TypText.Typ,
            "TypText": element.TypText.TypText,
            "Adcomment": element.AdCommentLt,
            "AdcommentLt": element.AdCommentLt,
            "Mode": element.Mode
          })
        });
        this.allergyJson = {
          "Patnr": this.selectedERList.Patnr,
          "NoAllergy": this.noAllergiesValue,
          "NoCollection": this.noCollectionValue,
          "StateComment": this.StateComment,
          "StateCommentLt": this.StateComment,
          "PatAllergyHdrToItmNav": {
            "results": PatAllergyHdrToItmNav
          }

        }
        this.allergyFinalApiArr = this.allergyJson;
        this.saveAllergyList();
      }
    }
    else {
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
      }
      else if (this.noCollection) {
        text = 'No Allergy Assessment is saved Successfully';
      }
      else if (this.StateComment != '') {
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
            customClass: { popup: 'myalertpopup' }
          })
        },
        (_error: any) => { }
      );
    }
    else if (this.allergyList.length > 0 && this.allergyJson['PatAllergyHdrToItmNav']['results'].length == 0) {
      if (this.noAllergies || this.noCollection || (this.StateComment !== '')) {
        let text = '';
        if (this.noAllergies) {
          text = 'No Known Allergy is saved Successfully';
        }
        else if (this.noCollection) {
          text = 'No Allergy Assessment is saved Successfully';
        }
        else if (this.StateComment !== '') {
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
              customClass: { popup: 'myalertpopup' }
            })
          },
          (_error: any) => { }
        );
      }
    }
    else {
      if (this.allergyJson['PatAllergyHdrToItmNav']['results'][0]['Mode'] !== 'D') {
        if (this.noAllergies || this.noCollection || (this.StateComment !== '')) {
          let text = '';
          if (this.noAllergies) {
            text = 'No Known Allergy is saved Successfully';
          }
          else if (this.noCollection) {
            text = 'No Allergy Assessment is saved Successfully';
          }
          else if (this.StateComment !== '') {
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
                customClass: { popup: 'myalertpopup' }
              })
            },
            (_error: any) => { }
          );
        } else {
          if (this.updateAllergyForm.controls.Allergen.value == '') {
            Swal.fire({
              text: "Allergen is mandatory",
              icon: 'error',
              confirmButtonText: 'Ok',
              customClass: { popup: 'myalertpopup' }
            })
          } else {
            let text = '';
            if (this.updateAllergyForm.controls.Allergen.value !== '') {
              text = 'Allergen is saved Successfully';
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
                  customClass: { popup: 'myalertpopup' }
                })
              },
              (_error: any) => { }
            );
          }
        }
      }
      else if (this.allergyJson['PatAllergyHdrToItmNav']['results'][0]['Mode'] == 'D') {
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
              customClass: { popup: 'myalertpopup' }
            })
          },
          (_error: any) => { }
        );
      }
      else {
        let text = '';
        if (this.updateAllergyForm.controls.Allergen.value !== '') {
          text = 'Allergen is saved Successfully';
        } else if (this.noAllergies) {
          text = 'No Known Allergy is saved Successfully';
        }
        else if (this.noCollection) {
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
              customClass: { popup: 'myalertpopup' }
            })
          },
          (_error: any) => { }
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

  triagePriorityList(element) {
    const json = {
      patnr: element.Patnr,
      falnr: element.Falnr
    }
    this.emergencyService.triagePriorityList(json).subscribe(
      (_success: any) => {
        this.triageList = [];
        this.triageList = _success.d.results[0];
        this.selectedTriageFromCheckin = this.triageList;
      },
      (_error: any) => { }
    );
  }

  openModalVital(item) {
    item["admissionDate"] = this.getDate(item.Datum);
    this.erVitalsModal.openModalForErVital(item);
  }
  getAttachmentTooltip(status: string): string {
    switch (status) {
      case 'Red':
        return 'No Attached Documents';
      case 'Green':
        return 'Attached Documents Exist';
      default:
        return '';
    }
  }

  openModalForAttechment(data) {
    data.Pnamec = data.Patient;
    data.Bwidt = data.Datum;
    this.nurErAttechment.openModalForAttechment(data);
  }

  getShapeClass(status: string): string {
    switch (status) {
      case 'Green':
        return 'square';
      case 'Red':
        return 'circle';
      case 'Yellow':
        return 'triangle';
      default:
        return '';
    }
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
    if (column == 'Comments') {
      this.modalCommonDataArr = this.allergenValues;
    }
    if (column == 'RiskCode') {
      this.modalCommonDataArr = this.riskValues;
      this.searchString = this.updateRiskForm.controls.Rsfna.value;
      this.someMethod(this.searchString);
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
    this.updateAllergyForm.controls.AllrgycatlogAgr.setValue(item.AllrgycatlogAgr);
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
      if ((this.noAllergies || this.noCollection || (this.StateComment != '')) && this.updateAllergyForm.controls.Allergen.value == '') {
        this.allergyJson = {
          "Patnr": this.selectedERList.Patnr,
          "NoAllergy": this.noAllergiesValue,
          "NoCollection": this.noCollectionValue,
          "StateComment": this.StateComment,
          "StateCommentLt": this.StateComment,
          "PatAllergyHdrToItmNav": {
            "results": []
          }
        }
        this.saveAllergyList();
      }
      else if (!this.noAllergies && !this.noCollection && (this.StateComment == '') && (this.updateAllergyForm.controls.Allergen.value == '')) {
        Swal.fire({
          text: "Allergen is mandatory",
          icon: 'error',
          confirmButtonText: 'Ok',
          customClass: { popup: 'myalertpopup' }
        })
      }
      else {
        if (this.updateAllergyForm.controls.AllergySeqno.value == '0000') {
          this.allergyJson = {
            "Patnr": this.selectedERList.Patnr,
            "NoAllergy": this.noAllergiesValue,
            "NoCollection": this.noCollectionValue,
            "StateComment": this.StateComment,
            "StateCommentLt": this.StateComment,
            "PatAllergyHdrToItmNav": {
              "results": [{
                "Patnr": this.selectedERList.Patnr,
                "AllergySeqno": this.updateAllergyForm.controls.AllergySeqno.value,
                "Responsible": this.storageService.getGpart(),
                "ResponsibleNm": this.storageService.getUserProfile()?.GpartName,
                "Allrgycatlog": this.updateAllergyForm.controls.Allrgycatlog.value,
                "Allrgyid": this.updateAllergyForm.controls.Allrgyid.value,
                "Allergen": this.updateAllergyForm.controls.Allergen.value,
                "AllrgycatlogAgr": this.updateAllergyForm.controls.AllrgycatlogAgr.value,
                "AllrgyidAgr": this.updateAllergyForm.controls.AllrgyidAgr.value,
                "AllergenGrp": this.updateAllergyForm.controls.AllergenGrp.value,
                "Cert": this.updateAllergyForm.controls.Cert.value,
                "CerText": this.updateAllergyForm.controls.CerText.value,
                "Eval": this.updateAllergyForm.controls.Eval.value,
                "EvalTxt": this.updateAllergyForm.controls.EvalTxt.value,
                "Rea": this.updateAllergyForm.controls.Rea.value,
                "ReaText": this.updateAllergyForm.controls.ReaText.value,
                "Soa": this.updateAllergyForm.controls.Soa.value,
                "SoaText": this.updateAllergyForm.controls.SoaText.value,
                "Typ": this.updateAllergyForm.controls.Typ.value,
                "TypText": this.updateAllergyForm.controls.TypText.value,
                "Adcomment": this.updateAllergyForm.controls.Adcomment.value,
                "AdcommentLt": this.updateAllergyForm.controls.Adcomment.value,
                "Mode": 'I'
              }]
            }
          }
        }
        else {
          this.allergyJson = {
            "Patnr": this.selectedERList.Patnr,
            "NoAllergy": this.noAllergiesValue,
            "NoCollection": this.noCollectionValue,
            "StateComment": this.StateComment,
            "StateCommentLt": this.StateComment,
            "PatAllergyHdrToItmNav": {
              "results": [{
                "Patnr": this.selectedERList.Patnr,
                "AllergySeqno": this.updateAllergyForm.controls.AllergySeqno.value,
                "Responsible": this.storageService.getGpart(),
                "ResponsibleNm": this.storageService.getUserProfile()?.GpartName,
                "Allrgycatlog": this.updateAllergyForm.controls.Allrgycatlog.value,
                "Allrgyid": this.updateAllergyForm.controls.Allrgyid.value,
                "Allergen": this.updateAllergyForm.controls.Allergen.value,
                "AllrgycatlogAgr": this.updateAllergyForm.controls.AllrgycatlogAgr.value,
                "AllrgyidAgr": this.updateAllergyForm.controls.AllrgyidAgr.value,
                "AllergenGrp": this.updateAllergyForm.controls.AllergenGrp.value,
                "Cert": this.updateAllergyForm.controls.Cert.value,
                "CerText": this.updateAllergyForm.controls.CerText.value,
                "Eval": this.updateAllergyForm.controls.Eval.value,
                "EvalTxt": this.updateAllergyForm.controls.EvalTxt.value,
                "Rea": this.updateAllergyForm.controls.Rea.value,
                "ReaText": this.updateAllergyForm.controls.ReaText.value,
                "Soa": this.updateAllergyForm.controls.Soa.value,
                "SoaText": this.updateAllergyForm.controls.SoaText.value,
                "Typ": this.updateAllergyForm.controls.Typ.value,
                "TypText": this.updateAllergyForm.controls.TypText.value,
                "Adcomment": this.updateAllergyForm.controls.Adcomment.value,
                "AdcommentLt": this.updateAllergyForm.controls.Adcomment.value,
                "Mode": 'U'
              }]
            }
          }
        }
        this.saveAllergyList();
      }
    }
    else if (this.allergyList.length > 0) {
      if (!this.noAllergies && !this.noCollection && (this.StateComment == '') && (this.updateAllergyForm.controls.Allergen.value == '')) {
        Swal.fire({
          text: "Allergen is mandatory",
          icon: 'error',
          confirmButtonText: 'Ok',
          customClass: { popup: 'myalertpopup' }
        })
      }
      else if (this.StateComment != '' && this.updateAllergyForm.controls.Allergen.value == '') {
        this.allergyJson = {
          "Patnr": this.selectedERList.Patnr,
          "NoAllergy": this.noAllergiesValue,
          "NoCollection": this.noCollectionValue,
          "StateComment": this.StateComment,
          "StateCommentLt": this.StateComment,
          "PatAllergyHdrToItmNav": {
            "results": []
          }
        }
        this.saveAllergyList();
      }
      else if (this.StateComment == '' && this.updateAllergyForm.controls.Allergen.value !== '') {
        if (this.updateAllergyForm.controls.AllergySeqno.value == '0000') {
          this.allergyJson = {
            "Patnr": this.selectedERList.Patnr,
            "NoAllergy": this.noAllergiesValue,
            "NoCollection": this.noCollectionValue,
            "StateComment": this.StateComment,
            "StateCommentLt": this.StateComment,
            "PatAllergyHdrToItmNav": {
              "results": [{
                "Patnr": this.selectedERList.Patnr,
                "AllergySeqno": this.updateAllergyForm.controls.AllergySeqno.value,
                "Responsible": this.storageService.getGpart(),
                "ResponsibleNm": this.storageService.getUserProfile()?.GpartName,
                "Allrgycatlog": this.updateAllergyForm.controls.Allrgycatlog.value,
                "Allrgyid": this.updateAllergyForm.controls.Allrgyid.value,
                "Allergen": this.updateAllergyForm.controls.Allergen.value,
                "AllrgycatlogAgr": this.updateAllergyForm.controls.AllrgycatlogAgr.value,
                "AllrgyidAgr": this.updateAllergyForm.controls.AllrgyidAgr.value,
                "AllergenGrp": this.updateAllergyForm.controls.AllergenGrp.value,
                "Cert": this.updateAllergyForm.controls.Cert.value,
                "CerText": this.updateAllergyForm.controls.CerText.value,
                "Eval": this.updateAllergyForm.controls.Eval.value,
                "EvalTxt": this.updateAllergyForm.controls.EvalTxt.value,
                "Rea": this.updateAllergyForm.controls.Rea.value,
                "ReaText": this.updateAllergyForm.controls.ReaText.value,
                "Soa": this.updateAllergyForm.controls.Soa.value,
                "SoaText": this.updateAllergyForm.controls.SoaText.value,
                "Typ": this.updateAllergyForm.controls.Typ.value,
                "TypText": this.updateAllergyForm.controls.TypText.value,
                "Adcomment": this.updateAllergyForm.controls.Adcomment.value,
                "AdcommentLt": this.updateAllergyForm.controls.Adcomment.value,
                "Mode": 'I'
              }]
            }
          }
        }
        else {
          this.allergyJson = {
            "Patnr": this.selectedERList.Patnr,
            "NoAllergy": this.noAllergiesValue,
            "NoCollection": this.noCollectionValue,
            "StateComment": this.StateComment,
            "StateCommentLt": this.StateComment,
            "PatAllergyHdrToItmNav": {
              "results": [{
                "Patnr": this.selectedERList.Patnr,
                "AllergySeqno": this.updateAllergyForm.controls.AllergySeqno.value,
                "Responsible": this.storageService.getGpart(),
                "ResponsibleNm": this.storageService.getUserProfile()?.GpartName,
                "Allrgycatlog": this.updateAllergyForm.controls.Allrgycatlog.value,
                "Allrgyid": this.updateAllergyForm.controls.Allrgyid.value,
                "Allergen": this.updateAllergyForm.controls.Allergen.value,
                "AllrgycatlogAgr": this.updateAllergyForm.controls.AllrgycatlogAgr.value,
                "AllrgyidAgr": this.updateAllergyForm.controls.AllrgyidAgr.value,
                "AllergenGrp": this.updateAllergyForm.controls.AllergenGrp.value,
                "Cert": this.updateAllergyForm.controls.Cert.value,
                "CerText": this.updateAllergyForm.controls.CerText.value,
                "Eval": this.updateAllergyForm.controls.Eval.value,
                "EvalTxt": this.updateAllergyForm.controls.EvalTxt.value,
                "Rea": this.updateAllergyForm.controls.Rea.value,
                "ReaText": this.updateAllergyForm.controls.ReaText.value,
                "Soa": this.updateAllergyForm.controls.Soa.value,
                "SoaText": this.updateAllergyForm.controls.SoaText.value,
                "Typ": this.updateAllergyForm.controls.Typ.value,
                "TypText": this.updateAllergyForm.controls.TypText.value,
                "Adcomment": this.updateAllergyForm.controls.Adcomment.value,
                "AdcommentLt": this.updateAllergyForm.controls.Adcomment.value,
                "Mode": 'U'
              }]
            }
          }
        }
        this.saveAllergyList();
      }
      else {
        if (this.updateAllergyForm.controls.AllergySeqno.value == '0000') {
          this.allergyJson = {
            "Patnr": this.selectedERList.Patnr,
            "NoAllergy": this.noAllergiesValue,
            "NoCollection": this.noCollectionValue,
            "StateComment": this.StateComment,
            "StateCommentLt": this.StateComment,
            "PatAllergyHdrToItmNav": {
              "results": [{
                "Patnr": this.selectedERList.Patnr,
                "AllergySeqno": this.updateAllergyForm.controls.AllergySeqno.value,
                "Responsible": this.storageService.getGpart(),
                "ResponsibleNm": this.storageService.getUserProfile()?.GpartName,
                "Allrgycatlog": this.updateAllergyForm.controls.Allrgycatlog.value,
                "Allrgyid": this.updateAllergyForm.controls.Allrgyid.value,
                "Allergen": this.updateAllergyForm.controls.Allergen.value,
                "AllrgycatlogAgr": this.updateAllergyForm.controls.AllrgycatlogAgr.value,
                "AllrgyidAgr": this.updateAllergyForm.controls.AllrgyidAgr.value,
                "AllergenGrp": this.updateAllergyForm.controls.AllergenGrp.value,
                "Cert": this.updateAllergyForm.controls.Cert.value,
                "CerText": this.updateAllergyForm.controls.CerText.value,
                "Eval": this.updateAllergyForm.controls.Eval.value,
                "EvalTxt": this.updateAllergyForm.controls.EvalTxt.value,
                "Rea": this.updateAllergyForm.controls.Rea.value,
                "ReaText": this.updateAllergyForm.controls.ReaText.value,
                "Soa": this.updateAllergyForm.controls.Soa.value,
                "SoaText": this.updateAllergyForm.controls.SoaText.value,
                "Typ": this.updateAllergyForm.controls.Typ.value,
                "TypText": this.updateAllergyForm.controls.TypText.value,
                "Adcomment": this.updateAllergyForm.controls.Adcomment.value,
                "AdcommentLt": this.updateAllergyForm.controls.Adcomment.value,
                "Mode": 'I'
              }]
            }
          }
        }
        else {
          this.allergyJson = {
            "Patnr": this.selectedERList.Patnr,
            "NoAllergy": this.noAllergiesValue,
            "NoCollection": this.noCollectionValue,
            "StateComment": this.StateComment,
            "StateCommentLt": this.StateComment,
            "PatAllergyHdrToItmNav": {
              "results": [{
                "Patnr": this.selectedERList.Patnr,
                "AllergySeqno": this.updateAllergyForm.controls.AllergySeqno.value,
                "Responsible": this.storageService.getGpart(),
                "ResponsibleNm": this.storageService.getUserProfile()?.GpartName,
                "Allrgycatlog": this.updateAllergyForm.controls.Allrgycatlog.value,
                "Allrgyid": this.updateAllergyForm.controls.Allrgyid.value,
                "Allergen": this.updateAllergyForm.controls.Allergen.value,
                "AllrgycatlogAgr": this.updateAllergyForm.controls.AllrgycatlogAgr.value,
                "AllrgyidAgr": this.updateAllergyForm.controls.AllrgyidAgr.value,
                "AllergenGrp": this.updateAllergyForm.controls.AllergenGrp.value,
                "Cert": this.updateAllergyForm.controls.Cert.value,
                "CerText": this.updateAllergyForm.controls.CerText.value,
                "Eval": this.updateAllergyForm.controls.Eval.value,
                "EvalTxt": this.updateAllergyForm.controls.EvalTxt.value,
                "Rea": this.updateAllergyForm.controls.Rea.value,
                "ReaText": this.updateAllergyForm.controls.ReaText.value,
                "Soa": this.updateAllergyForm.controls.Soa.value,
                "SoaText": this.updateAllergyForm.controls.SoaText.value,
                "Typ": this.updateAllergyForm.controls.Typ.value,
                "TypText": this.updateAllergyForm.controls.TypText.value,
                "Adcomment": this.updateAllergyForm.controls.Adcomment.value,
                "AdcommentLt": this.updateAllergyForm.controls.Adcomment.value,
                "Mode": 'U'
              }]
            }
          }
        }
        this.saveAllergyList();
      }
    }
  }

  deleteAllergyJson(mode, item) {
    this.allergyJson = {};
    this.allergyJson = {
      "Patnr": this.selectedERList.Patnr,
      "NoAllergy": this.noAllergiesValue,
      "NoCollection": this.noCollectionValue,
      "StateComment": this.StateComment,
      "StateCommentLt": this.StateComment,
      "PatAllergyHdrToItmNav": {
        "results": [{
          "Patnr": item.Patnr,
          "AllergySeqno": item.AllergySeqno,
          "Responsible": item.Responsible,
          "ResponsibleNm": item.ResponsibleNm,
          "Allrgycatlog": item.Allrgycatlog,
          "Allrgyid": item.Allrgyid,
          "Allergen": item.Allergen,
          "AllrgycatlogAgr": item.AllrgycatlogAgr,
          "AllrgyidAgr": item.AllrgyidAgr,
          "AllergenGrp": item.AllergenGrp,
          "Cert": item.Cert,
          "CerText": item.CerText,
          "Eval": item.Eval,
          "EvalTxt": item.EvalTxt,
          "Rea": item.Rea,
          "ReaText": item.ReaText,
          "Soa": item.Soa,
          "SoaText": item.SoaText,
          "Typ": item.Typ,
          "TypText": item.TypText,
          "Adcomment": item.Adcomment,
          "AdcommentLt": item.AdcommentLt,
          "CancelReason": this.cancelReasonValue,
          "Mode": 'D'
        }]
      }
    }
    this.saveAllergyList();
  }
  closeAllergyModal() {
    this.modalRefForAllergy.hide();
    this.resetAllergyForm();
    this.searchString = '';
  }
  closeRiskModal() {
    this.modalRefForRisk.hide();
    this.resetRiskForm();
    this.resetUpdateRiskForm();
    this.searchString = '';
  }
  deleteRiskJson(item) {
    this.riskJson = [];
    this.riskJson = [{
      Patnr: this.selectedERList.Patnr,
      Lfdnr: item.Lfdnr,
      Rsfnr: item.Rsfnr,
      Rsfna: item.Rsfna,
      Rsfkb: item.Rsfkb,
      Rsfsn: item.Rsfsn,
      Mode: 'D'
    }]
    this.saveRiskList();
  }
  saveRiskJsonFormat() {
    this.riskJson = [];
    let mode = '';
    if (this.isRiskUpdate) {
      mode = 'U';
    } else {
      mode = 'I';
    }
    let finallfdnrValue;
    if (mode == 'I') {
      finallfdnrValue = '000';
    } else {
      finallfdnrValue = this.selectedDataForUpdate.Lfdnr;
    }
    let reportedon = '';
    if (this.updateRiskForm.controls.Repdt.value !== '') {
      reportedon = this.updateRiskForm.controls.Repdt.value.getDate() + '.' + this.updateRiskForm.controls.Repdt.value.getMonth(this.updateRiskForm.controls.Repdt.value.setMonth(this.updateRiskForm.controls.Repdt.value.getMonth() + 1)) + '.' + this.updateRiskForm.controls.Repdt.value.getFullYear();
    }
    this.riskJson = [{
      Patnr: this.selectedERList.Patnr,
      Lfdnr: finallfdnrValue,
      Rsfnr: this.updateRiskForm.controls.Rsfnr.value,
      Rsfna: this.updateRiskForm.controls.Rsfna.value,
      Rsfkb: this.updateRiskForm.controls.Rsfkb.value,
      Rsfsn: this.updateRiskForm.controls.Rsfsn.value,
      Mode: mode
    }]
    if (this.updateRiskForm.controls.Repdt.value !== '') {
      reportedon = this.updateRiskForm.controls.Repdt.value.getFullYear() + '-' + String(this.updateRiskForm.controls.Repdt.value.getMonth() + 1).padStart(2, '0') + '-' + String(this.updateRiskForm.controls.Repdt.value.getDate()).padStart(2, '0') + 'T00:00:00',
        this.riskJson[0]["Repdt"] = reportedon;
    }
    this.saveRiskList();
  }
  resetUpdateRiskForm() {
    this.updateRiskForm.patchValue({
      Rsfnr: '',
      Rsfna: '',
      Rsfkb: '',
      Rsfsn: '',
      Repdt: '',
    });
    this.isRiskUpdate = false;
  }
  selectValueFromRiskTable(item) {
    this.isRiskUpdate = true;
    this.selectedDataForUpdate = item;
    this.updateRiskForm.controls.Rsfnr.setValue(item.Rsfnr);
    this.updateRiskForm.controls.Rsfna.setValue(item.Rsfna);
    this.updateRiskForm.controls.Rsfkb.setValue(item.Rsfkb);
    this.updateRiskForm.controls.Rsfsn.setValue(item.Rsfsn);
    this.updateRiskForm.controls.Repdt.setValue(item.Repdt);
  }
  public openModalForTriage(
    template: TemplateRef<any>,
    data: any, index: any
  ) {
    const config: ModalOptions = { class: 'modal-dialog-centered modal-xl triage-modal-size' };
    this.modalRefForTriage = this.modalService.show(template, config);
    this.selectedERList = data;
    this.triagePriorityList(data);
    // this.triageList.forEach(element => {
    //   if (element.Patnr == parseInt(this.selectedERList.Patnr)) {
    //     this.selectedTriageFromCheckin = element;
    //   }
    // });

    this.modalRefForTriage.onHide.subscribe((reason: string | any) => {
      if (reason === 'backdrop-click') {
        this.closeTriageModal();
      }
    });

  }
  dataForTriage() {
    this.allTriageData = [{
      Allergen: 'Level I - Resuscitation',
      Triage: '01',
      color: 'blue',
      isActive: false
    },
    {
      Allergen: 'Level II - Emergency',
      Triage: '02',
      color: 'red',
      isActive: false
    },
    {
      Allergen: 'Level III - Urgency',
      Triage: '03',
      color: 'yellow',
      isActive: false
    },
    {
      Allergen: 'Level IV - Less Urgency',
      Triage: '04',
      color: 'green',
      isActive: false
    },
    {
      Allergen: 'Level V - Non Urgency',
      Triage: '05',
      color: 'white',
      isActive: false
    },
    ]
  }
  selectedRow(data, index) {
    this.selectedRowOfAllTriage = data;
    this.allTriageData.forEach((element, i) => {
      if (index == i) {
        this.allTriageData[i].isActive = true;
      } else {
        this.allTriageData[i].isActive = false;
      }
    });

  }
  saveTriage() {
    if (this.selectedTriageFromCheckin == undefined) {
      this.selectedTriageFromCheckin = {
        Dockey: "",
        Dokst: "",
        Dokvr: "",
        Dtid: "ZMED_TRPRI",
        DtidText: "",
        Einri: this.selectedERList.Einri,
        Etag: "",
        Falnr: this.selectedERList.Falnr,
        Lfdnr: this.selectedERList.Lfdbw,
        Mitarb: "",
        Mitarbname: "",
        Orgdo: localStorage.getItem('initOrg'),
        Orgfa: "",
        Orgpf: "",
        Patnr: this.selectedERList.Patnr,
        Referredby: "",
        Released: false,
        TriageColor: this.selectedRowOfAllTriage['color'],
        TriagePriorityCode: this.selectedRowOfAllTriage['Triage'],
        TriagePriorityText: this.selectedRowOfAllTriage['Allergen'],
        Zimmr: "",
        Mode: true,
      }
    } else {
      this.selectedTriageFromCheckin['Lfdnr'] = this.selectedERList.Lfdbw;
      this.selectedTriageFromCheckin['TriageColor'] = this.selectedRowOfAllTriage['color'];
      this.selectedTriageFromCheckin['TriagePriorityCode'] = this.selectedRowOfAllTriage['Triage'];
      this.selectedTriageFromCheckin['TriagePriorityText'] = this.selectedRowOfAllTriage['Allergen'];
      this.selectedTriageFromCheckin['Mode'] = true;
    }
    console.log(this.selectedTriageFromCheckin);
    this.emergencyService.saveTriage(this.selectedTriageFromCheckin).subscribe(
      (_success: any) => {
        this.getErList();
        this.dataForTriage();
        this.closeTriageModal();
      },
      (_error: any) => { }
    );
  }
  closeTriageModal() {
    this.modalRefForTriage.hide();
    this.dataForTriage();
  }
  someMethod(event: string) {
    if (this.modalCommonDataArr.length == 0) {
      if (this.colName == 'Allergen') {
        this.modalCommonDataArr = this.allergenValues;
      } else {
        this.modalCommonDataArr = this.riskValues;
      }

    } else {
      if (event == "") {
        if (this.colName == 'Allergen') {
          this.modalCommonDataArr = this.allergenValues;
        } else {
          this.modalCommonDataArr = this.riskValues;
        }
      } else {
        this.modalCommonDataArr = this.modalCommonDataArr.filter((item: any) => {
          if (item.hasOwnProperty('Bcpname')) {
            return item.Bcpname.toLowerCase().includes(event.toLowerCase());
          } else {
            return item.Rsfna.toLowerCase().includes(event.toLowerCase());
          }

        });
      }
    }

  }
  confirmationOfCheckout(item) {
    Swal.fire({
      text: "Are you sure you want to check patient out?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: { popup: 'myalertpopup' }
    }).then((result) => {
      if (result.value) {
        this.changeStatus(item);
      }
    })
  }
  changeStatus(item) {
    let createTime = 'PT' + new Date().getHours() + 'H' + new Date().getMinutes() + 'M' + '00S'
    const json = {
      "Einri": item.Einri,
      "Falnr": item.Falnr,
      "Patnr": item.Patnr,
      "Lfdnr": item.Lfdbw,
      "VisitStat": "70",
      "Sdate": new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0') + '-' + String(new Date().getDate()).padStart(2, '0') + 'T00:00:00',
      "Stime": createTime
    }
    this.emrservice.changeStatus(json).subscribe(
      (success: any) => {
        this.getErList();
      });
  }

  confirmationOfPhysicianStatus(item) {
    Swal.fire({
      text: "Are You Sure to Mark Physician Treatment as Complete?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: { popup: 'myalertpopup' }
    }).then((result) => {
      if (result.value) {
        this.changePhysicianStatus(item);
      }
    })
  }
  changePhysicianStatus(item) {
    let createTime = 'PT' + new Date().getHours() + 'H' + new Date().getMinutes() + 'M' + '00S'
    const json = {
      "Einri": item.Einri,
      "Falnr": item.Falnr,
      "Patnr": item.Patnr,
      "Lfdnr": item.Lfdbw,
      "VisitStat": "65",
      "Sdate": new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0') + '-' + String(new Date().getDate()).padStart(2, '0') + 'T00:00:00',
      "Stime": createTime
    }
    this.emrservice.changeStatus(json).subscribe(
      (success: any) => {
        this.getErList();
      });
  }
  openAssignDoc(template: TemplateRef<any>, data) {
    const config: ModalOptions = { class: 'modal-dialog-centered' };
    this.modalRef = this.modalService.show(template, config);
    this.modalRef.onHide.subscribe((reason: string | any) => {
      if (reason === 'backdrop-click') {
        this.closeAssignDoc();
      }
    });
    this.getAssignSurgeonList();
    this.selectedERList = data;
  }
  getAssignSurgeonList() {
    this.orderDashboardService
      .getAssignUsersData()
      .subscribe((data: any) => {
        this.assignUsersList = data?.d?.results;
      });
  }
  onSelectSurgeon(value) {
    this.surgeonForm.patchValue({
      Surgeon: value.Gpart,
      SurgeonName: value.NamString,
    })
  }
  saveAssignedDoctor() {
    const json = {
      Einri: this.selectedERList.Einri,
      Falnr: this.selectedERList.Falnr,
      Lfdnr: this.selectedERList.Lfdbw,
      Pernr: this.surgeonForm.controls.Surgeon.value
    }
    this.emergencyService.actionPhysicianSet(json).subscribe(
      (_success: any) => {
        this.getErList();
        this.closeAssignDoc();
      },
      (_error: any) => { }
    );
  }
  closeAssignDoc() {
    this.modalRef.hide();
    this.surgeonForm.patchValue({
      Surgeon: '',
      SurgeonName: '',
    });
  }
  filterListData(event) {
    this.triageValueArr = [];
    this.physicianValueArr = [];
    this.statusValueArr = [];
    //  this.ERlistData = this.ERlistData.filter(el =>{
    //   if (event.Triage != '' && el.TriagePriorityCode.includes(event.Triage)) {
    //     return el;
    //   }
    //   if (event.Physician != '' && el.Behpersname.includes(event.Physician)) {
    //    return el;
    //  }
    //  if (event.Status != '' && el.StatusTxt.includes(event.Status)) {
    //    return el;
    //  }
    //  })

    if (event.Triage || event.Physician || event.Status || event.FCategory || event.PatientAgeFrom || event.PatientAgeTo || event.DateFrom || event.DateTo || event.AdmissionTimeFrom || event.AdmissionTimeTo) {
      let filterValue = this.ERlistDataClone;
      if (event.Triage) {
        event.Triage.forEach(triageValue => {
          this.triageValueArr.push(filterValue.filter(element => {
            if (element.TriagePriorityCode === triageValue) {
              return element;
            }
          }));
        });
        filterValue = this.triageValueArr.flat();
      }

      if (event.Physician) {
        event.Physician.forEach(physicianValue => {
          this.physicianValueArr.push(filterValue.filter(element => {
            if (element.Behpersname === physicianValue.trimStart()) {
              return element;
            }

          }))
        });
        filterValue = this.physicianValueArr.flat();
      }

      if (event.Status) {
        event.Status.forEach(statusValue => {
          this.statusValueArr.push(filterValue.filter(element => {
            if (element.StatusTxt == statusValue) {
              return element;
            }
          }))
        });
        filterValue = this.statusValueArr.flat();
      }
      if (event.FCategory) {
        if (event.FCategory == 'Self Payer') {
          filterValue = filterValue.filter((element: any) => {
            if (element.ZzfinCat === 'Self Payer') {
              return element;
            }
          })
        } else {
          filterValue = filterValue.filter((element: any) => {
            if (element.ZzfinCat !== 'Self Payer') {
              return element;
            }
          })
        }

      }
      if (event.PatientAgeFrom || event.PatientAgeTo) {
        filterValue = filterValue.filter((element: any) => {
          const age = parseInt(this.getAgeFromName(element.Patient), 10);
          if (isNaN(age)) { return false; }
          let matches = true;
          if (event.PatientAgeFrom !== '' && event.PatientAgeFrom != null) { matches = matches && age >= +event.PatientAgeFrom; }
          if (event.PatientAgeTo !== '' && event.PatientAgeTo != null) { matches = matches && age <= +event.PatientAgeTo; }
          return matches;
        });
      }
      if (event.DateFrom || event.DateTo) {
        filterValue = filterValue.filter((element: any) => {
          const dateObj = this.getDate(element.Datum);
          if (!dateObj) { return false; }
          const day = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()).getTime();
          let matches = true;
          if (event.DateFrom) { const from = new Date(event.DateFrom); matches = matches && day >= new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime(); }
          if (event.DateTo) { const to = new Date(event.DateTo); matches = matches && day <= new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime(); }
          return matches;
        });
      }
      if (event.AdmissionTimeFrom || event.AdmissionTimeTo) {
        filterValue = filterValue.filter((element: any) => {
          const time = this.getTime(element.ZeitIntern);
          if (!time) { return false; }
          let matches = true;
          if (event.AdmissionTimeFrom) { matches = matches && time >= event.AdmissionTimeFrom; }
          if (event.AdmissionTimeTo) { matches = matches && time <= event.AdmissionTimeTo; }
          return matches;
        });
      }
      this.ERlistData = filterValue;
      this.sendErPatientCount.emit(this.ERlistData.length);
    } else {
      this.ERlistData = this.ERlistDataClone;
      this.sendErPatientCount.emit(this.ERlistData.length);
    }
  }
  // sorting
  sortTime() {
    if (!this.asc) {
      this.asc = true;
      this.ERlistData.sort((a, b) => {
        const nameA = a.ZeitIntern.toUpperCase(); // ignore upper and lowercase
        const nameB = b.ZeitIntern.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // names must be equal
        return 0;
      });
    } else {
      this.asc = false;
      this.ERlistData.sort((a, b) => {
        const nameA = a.ZeitIntern.toUpperCase(); // ignore upper and lowercase
        const nameB = b.ZeitIntern.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return 1;
        }
        if (nameA > nameB) {
          return -1;
        }

        // names must be equal
        return 0;
      });
    }

  }
  sortPatient() {
    if (!this.asc) {
      this.asc = true;
      this.ERlistData.sort((a, b) => {
        const nameA = a.Patient.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Patient.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // names must be equal
        return 0;
      });
    } else {
      this.asc = false;
      this.ERlistData.sort((a, b) => {
        const nameA = a.Patient.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Patient.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return 1;
        }
        if (nameA > nameB) {
          return -1;
        }

        // names must be equal
        return 0;
      });
    }
  }
  sortPhysician() {
    if (!this.asc) {
      this.asc = true;
      this.ERlistData.sort((a, b) => {
        const nameA = a.Behpersname.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Behpersname.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // names must be equal
        return 0;
      });
    } else {
      this.asc = false;
      this.ERlistData.sort((a, b) => {
        const nameA = a.Behpersname.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Behpersname.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return 1;
        }
        if (nameA > nameB) {
          return -1;
        }

        // names must be equal
        return 0;
      });
    }
  }
  sortMrn() {
    if (!this.asc) {
      this.asc = true;
      this.ERlistData.sort((a, b) => {
        const nameA = a.Patnr.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Patnr.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // names must be equal
        return 0;
      });
    } else {
      this.asc = false;
      this.ERlistData.sort((a, b) => {
        const nameA = a.Patnr.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Patnr.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return 1;
        }
        if (nameA > nameB) {
          return -1;
        }

        // names must be equal
        return 0;
      });
    }

  }
  sortCaseNumber() {
    if (!this.asc) {
      this.asc = true;
      this.ERlistData.sort((a, b) => {
        const nameA = a.Falnr.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Falnr.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // names must be equal
        return 0;
      });
    } else {
      this.asc = false;
      this.ERlistData.sort((a, b) => {
        const nameA = a.Falnr.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Falnr.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return 1;
        }
        if (nameA > nameB) {
          return -1;
        }

        // names must be equal
        return 0;
      });
    }
  }
  sortRoom() {
    if (!this.asc) {
      this.asc = true;
      this.ERlistData.sort((a, b) => {
        const nameA = a.BehraumKb.toUpperCase(); // ignore upper and lowercase
        const nameB = b.BehraumKb.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // names must be equal
        return 0;
      });
    } else {
      this.asc = false;
      this.ERlistData.sort((a, b) => {
        const nameA = a.BehraumKb.toUpperCase(); // ignore upper and lowercase
        const nameB = b.BehraumKb.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return 1;
        }
        if (nameA > nameB) {
          return -1;
        }

        // names must be equal
        return 0;
      });
    }
  }
  sortCategory() {
    if (!this.asc) {
      this.asc = true;
      this.ERlistData.sort((a, b) => {
        const nameA = a.ZzfinCat.toUpperCase(); // ignore upper and lowercase
        const nameB = b.ZzfinCat.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // names must be equal
        return 0;
      });
    } else {
      this.asc = false;
      this.ERlistData.sort((a, b) => {
        const nameA = a.ZzfinCat.toUpperCase(); // ignore upper and lowercase
        const nameB = b.ZzfinCat.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return 1;
        }
        if (nameA > nameB) {
          return -1;
        }

        // names must be equal
        return 0;
      });
    }
  }
  sortWaitTime() {
    console.log(this.ERlistData);

    if (!this.asc) {
      this.asc = true;
      this.ERlistData.sort((a, b) => {
        const nameA = a.assignedTime.toUpperCase(); // ignore upper and lowercase
        const nameB = b.assignedTime.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // names must be equal
        return 0;
      });
    } else {
      this.asc = false;
      this.ERlistData.sort((a, b) => {
        const nameA = a.assignedTime.toUpperCase(); // ignore upper and lowercase
        const nameB = b.assignedTime.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return 1;
        }
        if (nameA > nameB) {
          return -1;
        }

        // names must be equal
        return 0;
      });
    }

  }
  sortTriage() {
    if (!this.asc) {
      this.asc = true;
      this.ERlistData.sort((a, b) => {
        const nameA = a.TriagePriorityCode.toUpperCase(); // ignore upper and lowercase
        const nameB = b.TriagePriorityCode.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // names must be equal
        return 0;
      });
    } else {
      this.asc = false;
      this.ERlistData.sort((a, b) => {
        const nameA = a.TriagePriorityCode.toUpperCase(); // ignore upper and lowercase
        const nameB = b.TriagePriorityCode.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return 1;
        }
        if (nameA > nameB) {
          return -1;
        }

        // names must be equal
        return 0;
      });
    }

  }
  selectFromErList(index) {
    this.erListIndex = index;
  }
  openVisitComments(template: TemplateRef<any>, data) {
    const config: ModalOptions = { class: 'modal-dialog-centered modal-lg' };
    this.modalRef = this.modalService.show(template, config);
    this.visitComments = data.VisitComments;
    this.modalRef.onHide.subscribe((reason: string | any) => {
      if (reason === 'backdrop-click') {

      }
    });
  }
}
