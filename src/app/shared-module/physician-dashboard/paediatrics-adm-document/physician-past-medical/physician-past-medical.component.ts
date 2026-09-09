import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { PatientHistoryService } from '@services/e-kardex/patient-history.service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-physician-past-medical',
  templateUrl: './physician-past-medical.component.html',
  styleUrls: ['./physician-past-medical.component.scss']
})
export class PhysicianPastMedicalComponent implements OnInit {
  @ViewChild('pastMedicalKardexModal', { static: true }) pastMedicalKardexModal: TemplateRef<any>;
  @Output() importEvent = new EventEmitter();
  @Input() isReadOnly: boolean = false;
  
  modalRef: BsModalRef;
  modalRefForProblem: BsModalRef;
  pastMedList: any;
  pastmedform: FormGroup;
  pastMedFormitems: FormArray;
  patMedItemsArr: any[];
  diseaseCatLog: any;
  itemToDelete=[];
  updateMedForm:FormGroup;
  isMedUpdate: any;
  pastJson: {};
  searchString = '';
  modalCommonDataArr: any;
  constructor(private modalService: BsModalService,public storageService: StorageService,private patientHistory:PatientHistoryService,private formBuilder: FormBuilder) {
    this.pastmedform = this.formBuilder.group({
      pastMedFormitems: new FormArray([]),
    });
    this.updateMedForm = this.formBuilder.group({
      Disease:[''],
      FromDate: [''],
      ToDate: [''],
      Treatment: [''],
      Remarks: [''],
      Bchid : [''],
      Bcpid : [''],
  });
   }

  ngOnInit() {
    console.log(this.storageService.patientData);
  }
  addItemForPatMed(element?): void {
    this.pastMedFormitems = this.pastmedform.get('pastMedFormitems') as FormArray;
    this.pastMedFormitems.push(this.showMedDetailsOnList(element));
    this.disableInputsOfPastMed()
  }
  addNewItemForPastMed(): void {
    console.log(this.storageService.patientData);
    const control = <FormArray>this.pastmedform.controls['pastMedFormitems'];
    this.pastMedFormitems = this.pastmedform.get('pastMedFormitems') as FormArray;
    control.insert(0,this.showMedDetailsOnList());
  }
  showMedDetailsOnList(element?): FormGroup {
    if (element) {
      return this.formBuilder.group({
        Disease:[element.Disease],
        FromDate: [element.FromDate],
        ToDate: [element.ToDate],
        Treatment: [element.Treatment],
        Remarks: [element.Remarks],
        Mode: [''],
        isChecked:[true],
        isNew:[false]
      }
      );
    }else{
      return this.formBuilder.group({
        Disease:[''],
        FromDate: [''],
        ToDate: [''],
        Treatment: [''],
        Remarks: [''],
        Mode: [''],
        isChecked:[true],
        isNew:[false]
      }
      );

    }
  }
  disableInputsOfPastMed() {
    (<FormArray>this.pastmedform.get('pastMedFormitems'))
      .controls
      .forEach(control => {
        control['controls']['Disease'].disable();
        control['controls']['FromDate'].disable();
        control['controls']['ToDate'].disable();
        control['controls']['Treatment'].disable();
        control['controls']['Remarks'].disable();
        //control['Rsfkb'].disable();
      })
  }
  openModalForPastMedical(){
    const config: ModalOptions = { class: 'modal-dialog-centered past-med-modal-size' };
    this.modalRef = this.modalService.show(this.pastMedicalKardexModal, config);
    this.resetPastMedForm();
    this.modalRef.onHide.subscribe((reason: string | any) => {
      if(reason === 'backdrop-click') {
       this.resetPastMedForm();
       this.resetupdateMedForm();
      }
    });

    this.getPastMedicalHistory();
    this.getProblemCatalogSet();
  }
  getProblemCatalogSet() {
    this.patientHistory.getProblemCatalogSet().subscribe(
      (_success: any) => {
       this.diseaseCatLog = _success.d.results;


      },
      (_error: any) => {}
    );
  }
  getPastMedicalHistory() {
    const json = {
      "patnr": this.storageService.patnr
    }
    this.patientHistory.getPastMedicalHistory(json).subscribe(
      (_success: any) => {
        this.pastMedList = [];
       this.pastMedList = _success.d.results;
       if (this.pastMedList.length > 0) {
        this.pastMedList.forEach(element => {
          element["FromDate"] = new Date(element.FromDate);
          element["ToDate"] = new Date(element.ToDate);
            this.addItemForPatMed(element);
          });
     }


      },
      (_error: any) => {}
    );
  }

  checkDataForPastMed(){
    if (this.pastMedFormitems!=undefined) {
     this.patMedItemsArr = this.pastMedFormitems.value.filter(element => {
      if (element.isChecked) {
         delete element.isChecked;
         element["FromDate"]=element.FromDate.getFullYear() + '-' + String(element.FromDate.getMonth() +1).padStart(2, '0') +'-'+ String(element.FromDate.getDate()).padStart(2, '0');
         element["ToDate"]=element.ToDate.getFullYear() + '-' + String(element.ToDate.getMonth() +1).padStart(2, '0') +'-'+ String(element.ToDate.getDate()).padStart(2, '0');
         return element;
         }

     });
     console.log(this.patMedItemsArr);

     if (this.patMedItemsArr.length >0) {
      this.patMedItemsArr.forEach(element => {
        this.savePastMedList();
      });
     }
   }
   else{
     this.patMedItemsArr = [];
   }

  }
  savePastMedList() {
    this.patientHistory.savePastMedList(this.pastJson).subscribe(
      (_success: any) => {
        this.getPastMedicalHistory();
        this.resetPastMedForm();
        this.resetupdateMedForm();
      },
      (_error: any) => {}
    );
  }
  resetPastMedForm(){
    this.pastMedFormitems = this.pastmedform.get('pastMedFormitems') as FormArray;
    this.pastMedFormitems.clear();
    this.patMedItemsArr = [];
  }
  confirmationForPastMedDelete(){
    Swal.fire({
      text: "Are you sure you want to delete?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: { popup: 'myalertpopup' }
    }).then((result) => {
      if (result.value) {
        if (this.itemToDelete.length >0) {
          this.itemToDelete.forEach(element => {
            this.deleteForPastMed(element);
          });
         }
      }
    })
  }
  deleteForPastMed(element){
    const json = {
      Medhistid:element.Medhistid,
      patnr:this.storageService.patnr
    }
    this.patientHistory.deleteForPastMed(json).subscribe(
      (_success: any) => {
        this.getPastMedicalHistory();
        this.resetPastMedForm();
        this.resetupdateMedForm();
      },
      (_error: any) => {}
    );
  }
  collectDataForDelete(){
    this.itemToDelete = [];
     this.pastMedFormitems.value.filter((element,index) => {
      if (element.isChecked) {
         this.itemToDelete.push(this.pastMedList[index]);
         }

     });
    if (this.itemToDelete.length > 0) {
      this.confirmationForPastMedDelete()
    }

  }
  closePastMedModal(){
    this.resetupdateMedForm();
   this.modalRef.hide();
   this.modalRefForProblem.hide();
  }
  resetupdateMedForm(){
    this.updateMedForm.patchValue({
      Disease:'',
      FromDate: '',
      ToDate: '',
      Treatment: '',
      Remarks: '',
      Bchid : '',
      Bcpid : '',
    });
    this.isMedUpdate = false;
   }
  openCommonModal( template: TemplateRef<any>){
    const config: ModalOptions = { class: 'list-commonmodal modal-dialog-centered' };
        this.modalRefForProblem = this.modalService.show(template,config);
        this.searchString = '';
        this.modalCommonDataArr = this.diseaseCatLog;
        this.searchString = this.updateMedForm.controls.Disease.value;
        this.someMethod(this.searchString);
    }
    selectValueFromList(item){
      this.updateMedForm.controls.Disease.setValue(item.Bcpname);
      this.updateMedForm.controls.Bcpid.setValue(item.Bcpid);
      this.updateMedForm.controls.Bchid.setValue(item.Bchid);
       this.modalRefForProblem.hide();
    }
     saveMedJsonFormat(){
      this.pastJson = {};
      let fromdate = '';
      let todate = '';
      if(this.updateMedForm.controls.FromDate.value != ''){
        fromdate = this.updateMedForm.controls.FromDate.value.getFullYear() + '-' + String(this.updateMedForm.controls.FromDate.value.getMonth() +1).padStart(2, '0') +'-'+ String(this.updateMedForm.controls.FromDate.value.getDate()).padStart(2, '0');
      }

      if (this.updateMedForm.controls.ToDate.value != '') {
         todate = this.updateMedForm.controls.ToDate.value.getFullYear() + '-' + String(this.updateMedForm.controls.ToDate.value.getMonth() +1).padStart(2, '0') +'-'+ String(this.updateMedForm.controls.ToDate.value.getDate()).padStart(2, '0')
      }

        this.pastJson = {
          "RespEmp" : this.storageService.getUserProfile().Gpart,
          "Medhistid" : "",
          "Departmentou" : this.storageService.patientData.deptOrgUnit,
          "Treatou" : this.storageService.patientData.deptOrgUnit,
          "Einri" : this.storageService.einri,
          "Patnr" : this.storageService.patnr,
          "Disease" : this.updateMedForm.controls.Disease.value.charAt(0).toUpperCase() + this.updateMedForm.controls.Disease.value.slice(1),
          "Bchid" : this.updateMedForm.controls.Bchid.value,
          "Bcpid" : this.updateMedForm.controls.Bcpid.value,
          "FromDate" : fromdate,
          "ToDate" : todate,
          "Treatment" : this.updateMedForm.controls.Treatment.value,
          "Remarks" :this.updateMedForm.controls.Remarks.value
          }

          if (this.problemExists(this.updateMedForm.controls.Disease.value)) {
            this.diseaseCatLog.forEach(element => {
            if (element.Bcpname.toLowerCase() === this.updateMedForm.controls.Disease.value.toLowerCase()) {
             this.pastJson['Bchid'] = element.Bchid;
             this.pastJson['Bcpid'] = element.Bcpid;
            }
         });
            this.savePastMedList();
          } else {
            Swal.fire({
              text: "Please select from the list of problems",
              icon: 'error',
              confirmButtonText: 'Ok',
              customClass: { popup: 'myalertpopup' }
            })
          }

  }
   problemExists(problem) {
    return this.diseaseCatLog.some(function(el) {
     return el.Bcpname.toLowerCase() === problem.toLowerCase();
    });
  }
  confirmationForMedDelete(item){
    Swal.fire({
      text: "Are you sure you want to delete?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: { popup: 'myalertpopup' }
    }).then((result) => {
      if (result.value) {
        this.deleteForPastMed(item);
      }
    })
  }
  someMethod(event:string){
    if (this.modalCommonDataArr.length == 0) {
      this.modalCommonDataArr = this.diseaseCatLog;
    }else{
     if (event == "") {
      this.modalCommonDataArr = this.diseaseCatLog;
      }else{
        this.modalCommonDataArr = this.modalCommonDataArr.filter((item:any) =>{
          return item.Bcpname.toLowerCase().includes(event.toLowerCase());
      });
      }
    }
  }
  import() {
    let pastMedFormitems = [];
    this.pastmedform.get('pastMedFormitems')['controls'].forEach(element => {
      if(element.get('isChecked').value) {
        pastMedFormitems.push({
          Disease: element.get('Disease').value,
          FromDate: element.get('FromDate').value,
          Mode: element.get('Mode').value,
          Remarks: element.get('Remarks').value,
          ToDate: element.get('ToDate').value,
          Treatment: element.get('Treatment').value,
          isChecked: element.get('isChecked').value,
          isNew: element.get('isNew').value,
        })
      }
    });
    this.importEvent.emit(pastMedFormitems);
    this.resetupdateMedForm();
   this.modalRef.hide();
  //  this.modalRefForProblem.hide();
  }
}

