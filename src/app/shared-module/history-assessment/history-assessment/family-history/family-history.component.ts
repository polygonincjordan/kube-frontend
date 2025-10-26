import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PatientHistoryService } from '@services/e-kardex/patient-history.service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { element } from 'protractor';
import { map, Observable, of, startWith, Subject } from 'rxjs';
import Swal from 'sweetalert2';

interface IProblemList {
  Bchid: string;
  Bcpid: string;
  Extid: string;
  Name: string;
  ValidFromDate: string;
  ValidFromTime: string;
  ValidToDate: string;
  ValidToTime: string;
}

interface IFamilyHistory {
  FamilyHistid: string;
  Einri: string;
  Patnr: string;
  Bchid: string;
  Bcpid: string;
  Problem: string;
  Father: boolean;
  Mother: boolean;
  Brother: boolean;
  Sister: boolean;
  Paternal: boolean;
  Maternal: boolean;
  Son: boolean;
  Comments: string;
  RespEmp: string;
  DeptOu: string;
  TreatOu: string;
}
@Component({
  selector: 'app-family-history',
  templateUrl: './family-history.component.html',
  styleUrls: ['./family-history.component.scss']
})
export class FamilyHistoryComponent implements OnInit {
  @ViewChild('familyHistoryKardexModal', { static: true }) pastSurgicalcalKardexModal: TemplateRef<any>;
  @Input() hideAction = true;
  
  modalRef: BsModalRef;
  familyHistroyList: IFamilyHistory[] = [];
  registerForm: FormGroup;
  familyHistoryForm: FormGroup;
  familyHistoryFormItems: FormArray;
  updateFamilyHistoryForm: FormGroup;
  problemList: IProblemList[] = [];
  searchString = '';
  modalCommonDataArr: any;
  SurgCatLog: any;
  updateSurgForm: FormGroup;
  isRiskUpdate: boolean;
  selectedDataForUpdate: any;
  riskValues: any;
  enableCreatePMed: boolean;
  colName: any;
  allergenValues: any;
  allergenGroupValues: any;
  allergyCertaintyValues: any;
  allergyEvaluationValues: any;
  allergyReactionValues: any;
  severityValues: any;
  allergyTypeValues: any;
  constructor(private modalService: BsModalService, public storageService: StorageService, private patientHistory:
    PatientHistoryService, private formBuilder: FormBuilder) {
    this.familyHistoryForm = this.formBuilder.group({
      familyHistoryFormItems: new FormArray([]),
    });


  }

  ngOnInit() {
    this.initForm();
    this.registerForm = this.formBuilder.group({
      Father: [{ value: "", disabled: false }],
      Mother: [{ value: "", disabled: false }],
      Brother: [{ value: "", disabled: false }],
      Sister: [{ value: "", disabled: false }],
      Son: [{ value: "", disabled: false }],
      Paternal: [{ value: "", disabled: false }],
      Maternal: [{ value: "", disabled: false }],
      Problem: [{ value: "", disabled: false }],
      Comments: [{ value: "", disabled: false }],
    });
    this.getProblemList();
    this.getFamilyHistory();
    this.addFamilyHistroyForm();
  }
  initForm() {
    this.updateSurgForm = this.formBuilder.group({
      FamilyHistid: [''],
      Einri: [this.storageService.einri],
      Patnr: [this.storageService.patnr],
      Bchid: [''],
      Bcpid: [''],
      Problem: [''],
      Father: [false],
      Mother: [false],
      Brother: [false],
      Sister: [false],
      Paternal: [false],
      Maternal: [false],
      Son: [false],
      Comments: [''],
      RespEmp: [this.storageService.getGpart()],
      DeptOu: ['CARMDAMC'],
      TreatOu: ['CAROPAMC'],
      NoFamilyHistory: [false]
    });
    console.log(this.updateSurgForm, "updateSurgForm")
  }
  getProblemList() {
    this.patientHistory.getProblemList().subscribe((res: any) => {
      this.problemList = res.d.results;
      console.log(this.problemList, "this.problemList");
      
    })
  }

  getFamilyHistory() {
    let json = {
      patnr: this.storageService.patnr
    }
    this.patientHistory.getFamilyHistory(json).subscribe((res: any) => {
      console.log(res)
      this.familyHistroyList = res.d.results;
      if (this.familyHistroyList.length > 0) {
        this.familyHistroyList.forEach((element: IFamilyHistory) => {
          this.setFamilyHistoryForm(element)
        })
      }
    })
  }

  setFamilyHistoryForm(familyHistroy: IFamilyHistory) {
    this.familyHistoryFormItems = this.familyHistoryForm.get('familyHistoryFormItems') as FormArray;
    let problem = this.problemList.find((problem: IProblemList) => {
      return problem.Bchid == familyHistroy.Bchid
    });
    let group = this.formBuilder.group({
      checkHistroy: [""],
      problemName: [problem],
      father: [familyHistroy.Father],
      mother: [familyHistroy.Mother],
      brother: [familyHistroy.Brother],
      sister: [familyHistroy.Sister],
      child: [familyHistroy.Son],
      maternal: [familyHistroy.Maternal],
      paternal: [familyHistroy.Paternal],
      comment: [familyHistroy.Comments],
    });

    this.familyHistoryFormItems.push(group);
  }
  openModalForFamilyHistory() {
    // const config: ModalOptions = { class: 'modal-dialog-centered past-med-modal-size' };
    // this.modalRef = this.modalService.show(this.pastSurgicalcalKardexModal, config);
    // this.modalRef.onHide.subscribe((reason: string | any) => {
    //   if (reason === 'backdrop-click') {

    //   }
    // });

    this.getProblemList();
    this.getFamilyHistory();
    this.addFamilyHistroyForm();
    // this.resetFamilyHistroyForm();
  }

  createFamilyHistroyForm(): FormGroup {
    return this.formBuilder.group({
      checkHistroy: [""],
      problemName: [""],
      father: [false],
      mother: [false],
      brother: [false],
      sister: [false],
      child: [false],
      paternal: [false],
      maternal: [false],
      comment: [""],
    });
  }

  addFamilyHistroyForm(): void {
    this.familyHistoryFormItems = this.familyHistoryForm.get('familyHistoryFormItems') as FormArray;
    this.familyHistoryFormItems.push(this.createFamilyHistroyForm());
  }

  removeFamilyHistroyForm(): void {
    this.familyHistoryFormItems = this.familyHistoryForm.get('familyHistoryFormItems') as FormArray;
    this.familyHistoryFormItems.removeAt(this.familyHistoryFormItems.length - 1);
  }


  resetFamilyHistroyForm(): void {
    this.initForm();
  }
  saveFamilyHistroyForm() {
    if (this.isRiskUpdate) {
      const payload = this.updateSurgForm.value;
      this.patientHistory.updateFamilyHistory(payload).subscribe({
        next: (res: any) => {
          this.initForm();
          this.getFamilyHistory();
          this.isRiskUpdate = false;
          this.resetFamilyHistroyForm();
        },
        error: (err: Error) => {
          this.resetFamilyHistroyForm();

        }
      });
    } else {
      const payload = this.updateSurgForm.value;
      this.patientHistory.createFamilyHistory(payload).subscribe((res: any) => {
        this.initForm();
        this.getFamilyHistory();
        this.isRiskUpdate = false;
        this.resetFamilyHistroyForm();

      }, (err: Error) => {
        this.resetFamilyHistroyForm();

      });
    }
  }
  // openCommonModal(template: TemplateRef<any>) {
  //   const config: ModalOptions = { class: 'list-commonmodal modal-dialog-centered' };
  //   this.modalRef = this.modalService.show(template, config);
  //   this.searchString = '';
  //   this.modalCommonDataArr = this.problemList;
  //   this.searchString = this.updateSurgForm.controls.Problem.value;
  //   // this.searchString = this.problemList;
  //   this.someMethod(this.searchString);
  // }
  openCommonModal( template: TemplateRef<any>,column){
    const config: ModalOptions = { class: 'list-commonmodal modal-dialog-centered' };
    this.modalRef = this.modalService.show(template, config);
        this.colName = column;
        this.searchString = '';
        if (column == 'Problem') {
          console.log(this.problemList, "this.problemList Coman");
          
          this.modalCommonDataArr = this.problemList;
          this.searchString = this.registerForm.controls.Problem.value;
        this.someMethod(this.searchString);
        }
    }
  onSelectProblemList(event: any, index: number) {
    console.log(event, index)
  }

  someMethod(event:string){
    if (this.modalCommonDataArr.length == 0) {
      if (this.colName == 'Problem') {
        this.modalCommonDataArr = this.allergenValues;
      }else{
        this.modalCommonDataArr = this.riskValues;
      }
      
    }else{
     if (event == "") {
      if (this.colName == 'Problem') {
        this.modalCommonDataArr = this.problemList;
      }else{
        this.modalCommonDataArr = this.riskValues;
      }
      }else{
        this.modalCommonDataArr = this.modalCommonDataArr.filter((item:any) =>{
            return item.Name.toLowerCase().includes(event.toLowerCase());
         
      });
      }
    }
   
  }
  selectValueFromRiskTable(item) {
    this.isRiskUpdate = true;
    this.selectedDataForUpdate = item;
    this.updateSurgForm.controls.Problem.setValue(item.Problem);
    this.updateSurgForm.controls.Father.setValue(item.Father);
    this.updateSurgForm.controls.Mother.setValue(item.Mother);
    this.updateSurgForm.controls.Brother.setValue(item.Brother);
    this.updateSurgForm.controls.Sister.setValue(item.Sister);
    this.updateSurgForm.controls.Son.setValue(item.Son);
    this.updateSurgForm.controls.Comments.setValue(item.Comments);
    this.updateSurgForm.controls.Bcpid.setValue(item.Bcpid);
    this.updateSurgForm.controls.Bchid.setValue(item.Bchid);
    this.updateSurgForm.controls.FamilyHistid.setValue(item.FamilyHistid);
    this.updateSurgForm.controls.FamilyHistid.setValue(item.FamilyHistid);
    this.updateSurgForm.controls.Einri.setValue(item.Einri);
    this.updateSurgForm.controls.Patnr.setValue(item.Patnr);
    this.updateSurgForm.controls.RespEmp.setValue(this.storageService.getGpart());
    this.updateSurgForm.controls.DeptOu.setValue(item.DeptOu);
    this.updateSurgForm.controls.TreatOu.setValue(item.TreatOu);
    this.updateSurgForm.controls.Paternal.setValue(item.Paternal);
    this.updateSurgForm.controls.Maternal.setValue(item.Maternal);
  }
  selectValueFromList(item) {
    
    this.updateSurgForm.controls.Problem.setValue(item.Name);
    this.updateSurgForm.controls.Bcpid.setValue(item.Bcpid);
    this.updateSurgForm.controls.Bchid.setValue(item.Bchid);

    if (this.colName == 'Problem') { 
      this.registerForm.patchValue({Problem: item.Name})
    }
      this.modalRef.hide();
  }

  seelectValeRisk(item) {

  }
  confirmationForPastSurgDelete(item) {
    Swal.fire({
      text: "Are you sure you want to delete?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: { popup: 'myalertpopup' }
    }).then((result) => {
      if (result.value) {
        this.deleteFamilyHistory(item);
      }
    })
  }
  deleteFamilyHistory(item) {
    const payload = item;
    this.patientHistory.deleteFamilyHistory(payload).subscribe((res: any) => {
      this.getFamilyHistory();
      this.initForm();
    });
  }
  handleCheckboxPastMed() {
    if (this.updateSurgForm.controls.NoFamilyHistory.value) {
      this.enableCreatePMed = true;
    } else {
      this.enableCreatePMed = false;
    }
  }

  disableField(checked) {
    Object.keys(this.f).forEach(key => {
      if (!checked) {
        this.f[key].enable();
      } else {
        this.f[key].disable();
      }
    });
  }
   // convenience getter for easy access to form fields
   get f() {
    return this.registerForm.controls;
  }
}
