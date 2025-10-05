import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { PatientHistoryService } from '@services/e-kardex/patient-history.service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
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
  isChecked: boolean;
}

@Component({
  selector: 'app-physician-family-history',
  templateUrl: './physician-family-history.component.html',
  styleUrls: ['./physician-family-history.component.scss']
})
export class PhysicianFamilyHistoryComponent implements OnInit {
  @ViewChild('familyHistoryKardexModal', { static: true }) familyHistoryKardexModal: TemplateRef<any>;
  modalRef: BsModalRef;
  modalProblemRef: BsModalRef;
  @Input() isReadOnly: boolean = false;

  familyHistroyList: IFamilyHistory[] = [];
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
  enableCreatePMed: boolean;

  @Output() importEvent = new EventEmitter();

  constructor(private modalService: BsModalService, public storageService: StorageService, private patientHistory:
    PatientHistoryService, private formBuilder: FormBuilder) {
    this.familyHistoryForm = this.formBuilder.group({
      familyHistoryFormItems: new FormArray([]),
    });


  }

  ngOnInit() {
    this.initForm();
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
  }
  getProblemList() {
    this.patientHistory.getProblemList().subscribe((res: any) => {
      this.problemList = res.d.results;
      this.getFamilyHistory();
    })
  }

  getFamilyHistory() {
    let json = {
      patnr: this.storageService.patnr
    }
    this.patientHistory.getFamilyHistory(json).subscribe((res: any) => {
      console.log(res)
      this.familyHistroyList = res.d.results;
      this.familyHistroyList.forEach(function (element) {
        element.isChecked = true;
      });
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
      return problem.Bcpid == familyHistroy.Bcpid
    });
    let group = this.formBuilder.group({
      isChecked: [true],
      checkHistroy: [""],
      problemName: [problem?.Name],
      father: [familyHistroy.Father],
      mother: [familyHistroy.Mother],
      brother: [familyHistroy.Brother],
      sister: [familyHistroy.Sister],
      child: [familyHistroy.Son],
      comment: [familyHistroy.Comments],
      maternal: [familyHistroy.Maternal],
      paternal: [familyHistroy.Paternal]
    });

    this.familyHistoryFormItems.push(group);
  }
  openModalForFamilyHistory() {
    const config: ModalOptions = { class: 'modal-dialog-centered past-med-modal-size' };
    this.modalRef = this.modalService.show(this.familyHistoryKardexModal, config);
    this.modalRef.onHide.subscribe((reason: string | any) => {
      if (reason === 'backdrop-click') {

      }
    });
    this.getProblemList();
    // this.getFamilyHistory();
    this.resetUpdateFormData();
    this.resetFamilyHistroyForm();
    // this.addFamilyHistroyForm();
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
      comment: [""],
      maternal: [false],
      paternal: [false]
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
  resetFamilyHistroyForm():void{
    this.isRiskUpdate = false;
    this.updateSurgForm.reset();
    this.initForm();
  }

  saveFamilyHistroyForm() {
    if (this.isRiskUpdate) {
      const payload = this.updateSurgForm.value;
      this.patientHistory.updateFamilyHistory(payload).subscribe((res: any) => {
        this.initForm();
        this.getFamilyHistory();
        this.isRiskUpdate = false;
    this.resetFamilyHistroyForm();

      });
    } else {
      const payload = this.updateSurgForm.value;
      this.patientHistory.createFamilyHistory(payload).subscribe((res: any) => {
        this.initForm();
        this.getFamilyHistory();
        this.isRiskUpdate = false;
    this.resetFamilyHistroyForm();

      });
    }
  }
  openCommonModal(template: TemplateRef<any>) {
    const config: ModalOptions = { class: 'list-commonmodal modal-dialog-centered' };
    this.modalProblemRef = this.modalService.show(template, config);
    this.searchString = '';
    this.modalCommonDataArr = this.problemList;
    this.searchString = this.updateSurgForm.controls.Problem.value;
    // this.searchString = this.problemList;
    this.someMethod(this.searchString);
  }
  onSelectProblemList(event: any, index: number) {
    console.log(event, index)

  }

  someMethod(event: any) {
    if (this.modalCommonDataArr.length == 0) {
      this.modalCommonDataArr = this.problemList;
    } else {
      if (event == "") {
        this.modalCommonDataArr = this.problemList;
      } else {
        this.modalCommonDataArr = this.modalCommonDataArr.filter((item: any) => {

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
    this.modalProblemRef.hide();
  }
  confirmationForPastSurgDelete(item) {
    Swal.fire({
      text: "Are you sure you want to delete?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: 'myalertpopup'
    } as any).then((result) => {
      if (result.value) {
        this.deleteFamilyHistory(item);
      }
    })
  }
  deleteFamilyHistory(item) {
    const payload = item;
    this.patientHistory.deleteFamilyHistory(payload).subscribe((res: any) => {
      this.resetUpdateFormData();
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

  import() {
    let familyHistoryFormValues = [];
    this.familyHistoryFormItems.value.forEach(element => {
      if (element.isChecked) {
        familyHistoryFormValues.push({
          Dockey: "",
          Problem: element.problemName,
          Father: element.father,
          Mother: element.mother,
          Brother: element.brother,
          Sister: element.sister,
          Son: element.child,
          Remarks: element.comment,
          Maternal: element.maternal,
          Paternal: element.paternal
        })
      }
    });

    this.importEvent.emit(familyHistoryFormValues);
    this.modalRef.hide();

  }
  onCheckChange(event, index: number) {
    let control = this.familyHistoryFormItems.controls[index] as FormGroup
    control.controls["isChecked"].setValue(event)
  }
  resetUpdateFormData() {
    this.familyHistoryForm = this.formBuilder.group({
      familyHistoryFormItems: new FormArray([]),
    });
  }
}

