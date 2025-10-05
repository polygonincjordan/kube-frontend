import { element } from 'protractor';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { PatientHistoryService } from '@services/e-kardex/patient-history.service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-past-surgical',
  templateUrl: './past-surgical.component.html',
  styleUrls: ['./past-surgical.component.css']
})
export class PastSurgicalComponent implements OnInit {
  @ViewChild('pastSurgicalKardexModal', { static: true }) pastSurgicalcalKardexModal: TemplateRef<any>;
  modalRef: BsModalRef;
  modalRefForSurg:BsModalRef;
  pastSurgList: any;
  pastsurgform: FormGroup;
  pastSurgFormitems: FormArray;
  patSurgItemsArr: any[];
  SurgCatLog: any;
  itemToDelete=[];
  updateSurgForm:FormGroup;
  pastJson = {};
  modalCommonDataArr: any;
  loginUserDetails = this.storageService.getUserProfile();
  searchString = '';
  constructor(private modalService: BsModalService,public storageService: StorageService,private patientHistory:PatientHistoryService,private formBuilder: FormBuilder) {
    this.pastsurgform = this.formBuilder.group({
      pastSurgFormitems: new FormArray([]),
    });
    this.updateSurgForm = this.formBuilder.group({
      Surgeryname:[''],
        Date: [''],
        Remarks: [''],
        Bcpid:[''],
        Bchid:['']
  }); 
   }

  ngOnInit() {
    this.getPastSurgicalHistory();
    this.getSurgicalCatalogSet();
  }
  addItemForPatSurg(element?): void {
    this.pastSurgFormitems = this.pastsurgform.get('pastSurgFormitems') as FormArray;
    this.pastSurgFormitems.push(this.showMedDetailsOnList(element));
    //this.disableInputsOfPastMed()
  }
  addNewItemForPastSurg(): void {
    console.log(this.storageService.patientData);
    const control = <FormArray>this.pastsurgform.controls['pastSurgFormitems'];
    this.pastSurgFormitems = this.pastsurgform.get('pastSurgFormitems') as FormArray;
    //this.pastSurgFormitems.push(this.showMedDetailsOnList());
    //this.disableInputs()
    control.insert(0,this.showMedDetailsOnList());
  }
  showMedDetailsOnList(element?): FormGroup {
    if (element) {
      return this.formBuilder.group({
        Surgeryname:[element.Surgeryname],
        Date: [element.Date],
        Remarks: [element.Remarks],
        Mode: [''],
        isChecked:[false],
        isNew:[false]
      }
      );
    }else{
      return this.formBuilder.group({
        Surgeryname:[''],
        Date: [''],
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
    (<FormArray>this.pastsurgform.get('pastSurgFormitems'))
      .controls
      .forEach(control => {
        control['controls']['Surgeryname'].disable();
        control['controls']['Date'].disable();
        control['controls']['Remarks'].disable();
        //control['Rsfkb'].disable();
      })
  }
  openModalForPastSurgical(){
    // const config: ModalOptions = { class: 'modal-dialog-centered past-med-modal-size' };
    // this.modalRefForSurg = this.modalService.show(this.pastSurgicalcalKardexModal, config);
    this.resetSurgMedForm();
    this.modalRefForSurg.onHide.subscribe((reason: string | any) => {
      if(reason === 'backdrop-click') {
       this.resetSurgMedForm();
       this.resetupdateMedForm();
      }
    });

  }
  getSurgicalCatalogSet() {
    this.patientHistory.getSurgicalCatalogSet().subscribe(
      (_success: any) => {
       this.SurgCatLog = _success.d.results;
     
     
      },
      (_error: any) => {}
    );
  }
  getPastSurgicalHistory() {
    const json = {
      "patnr": this.storageService.patnr
    }
    this.patientHistory.getPastSurgicalHistory(json).subscribe(
      (_success: any) => {
        this.pastSurgList = [];
       this.pastSurgList = _success.d.results;
       if (this.pastSurgList.length > 0) {
        this.pastSurgList.forEach(element => {
          element["Date"] = new Date(element.Date); 
          element["ToDate"] = new Date(element.ToDate); 
            this.addItemForPatSurg(element);
          });
     }
      
     
      },
      (_error: any) => {}
    );
  }
  
  checkDataForPastSurg(){
    if (this.pastSurgFormitems!=undefined) {
     this.patSurgItemsArr = this.pastSurgFormitems.value.filter(element => { 
      if (element.isChecked) {
         delete element.isChecked;
         element["Date"]=element.Date.getFullYear() + '-' + String(element.Date.getMonth() +1).padStart(2, '0') +'-'+ String(element.Date.getDate()).padStart(2, '0');
         return element;
         }
         
     });
     if (this.patSurgItemsArr.length >0) {
      this.patSurgItemsArr.forEach(element => {
        this.savePastSurgList();
      });
     }
   }
   else{
     this.patSurgItemsArr = [];
   }
  
  }
  savePastSurgList() {
    this.patientHistory.savePastSurList(this.pastJson).subscribe(
      (_success: any) => {
        this.getPastSurgicalHistory();
        this.resetSurgMedForm();
        this.resetupdateMedForm();
      },
      (_error: any) => {}
    );
  }
  resetSurgMedForm(){
    this.pastSurgFormitems = this.pastsurgform.get('pastSurgFormitems') as FormArray;
    this.pastSurgFormitems.clear();
    this.patSurgItemsArr = [];
  }
  confirmationForPastSurgDelete(item){
    Swal.fire({
      text: "Are you sure you want to delete?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      // customClass: 'myalertpopup'
    }).then((result) => {
      if (result.value) {
        this.deleteForPastSurg(item);
      }
    })
  }
  deleteForPastSurg(element){
    const json = {
      SurgHistid:element.SurgHistid,
      patnr:this.storageService.patnr
    }
    this.patientHistory.deleteForPastSurg(json).subscribe(
      (_success: any) => {
        this.getPastSurgicalHistory();
        this.resetSurgMedForm();
        this.resetupdateMedForm();
      },
      (_error: any) => {}
    );
  }
  collectDataForDelete(){
    this.itemToDelete = [];
     this.pastSurgFormitems.value.filter((element,index) => { 
      if (element.isChecked) {
         this.itemToDelete.push(this.pastSurgList[index]);
         }
         
     });
    if (this.itemToDelete.length > 0) {
      // this.confirmationForPastSurgDelete()
    }
    
  }
  closePastMedModal(){
    this.modalRef.hide();
   }
  resetupdateMedForm(){
    this.updateSurgForm.patchValue({
      Surgeryname:'',
      Date: '',
      Remarks: '',
      Bcpid:'',
      Bchid:''
    });
   }
  openCommonModal( template: TemplateRef<any>){
    const config: ModalOptions = { class: 'list-commonmodal modal-dialog-centered' };
        this.modalRef = this.modalService.show(template,config);
        this.searchString = '';
        this.modalCommonDataArr = this.SurgCatLog;
        this.searchString = this.updateSurgForm.controls.Surgeryname.value;
        this.someMethod(this.searchString);
    }
    selectValueFromList(item){
      this.updateSurgForm.controls.Surgeryname.setValue(item.Bcpname);
      this.updateSurgForm.controls.Bcpid.setValue(item.Bcpid);
      this.updateSurgForm.controls.Bchid.setValue(item.Bchid);
       this.modalRef.hide();
    }
     saveSurgJsonFormat(){
      this.pastJson = {};
      let datevalue = '';
      if (this.updateSurgForm.controls.Date.value != '') {
        datevalue = this.updateSurgForm.controls.Date.value.getFullYear() + '-' + String(this.updateSurgForm.controls.Date.value.getMonth() +1).padStart(2, '0') +'-'+ String(this.updateSurgForm.controls.Date.value.getDate()).padStart(2, '0');
      }
      
        this.pastJson = {
          "RespEmp" : this.storageService.getUserProfile().Gpart,
          "SurgHistid" : "",
          "Departmentou" : this.storageService.patientData.deptOrgUnit,
          "Treatou" : this.storageService.patientData.deptOrgUnit,
          "Einri" : this.storageService.einri,
          "Patnr" : this.storageService.patnr,
          "Surgeryname" : this.updateSurgForm.controls.Surgeryname.value,
          "Bchid" : this.updateSurgForm.controls.Bchid.value,
          "Bcpid" : this.updateSurgForm.controls.Bcpid.value,
          "Date" : datevalue,
          "Remarks" :this.updateSurgForm.controls.Remarks.value
          }
          // if (this.problemExists(this.updateSurgForm.controls.Surgeryname.value)) {
            this.SurgCatLog.forEach(element => {
            if (element.Bcpname.toLowerCase() === this.updateSurgForm.controls.Surgeryname.value.toLowerCase()) {
             this.pastJson['Bchid'] = element.Bchid;
             this.pastJson['Bcpid'] = element.Bcpid;
            }
         });
         this.savePastSurgList();
          // } else {
          //   Swal.fire({
          //     text: "Please select from the list of surgeries",
          //     icon: 'error',
          //     confirmButtonText: 'Ok',
          //     customClass: 'myalertpopup'
          //   })
          // }
    
  }
  problemExists(surgery) {
    return this.SurgCatLog.some(function(el) {
     return el.Bcpname.toLowerCase() === surgery.toLowerCase();
    }); 
  }
  closePastSurgModal(){
    this.resetupdateMedForm();
   this.modalRefForSurg.hide();
  }
  someMethod(event:string){
    if (this.modalCommonDataArr.length == 0) {
      this.modalCommonDataArr = this.SurgCatLog;
    }else{
     if (event == "") {
      this.modalCommonDataArr = this.SurgCatLog;
      }else{
        this.modalCommonDataArr = this.modalCommonDataArr.filter((item:any) =>{
          return item.Bcpname.toLowerCase().includes(event.toLowerCase());          
      });
      }
    }
   
  }

  selectValueFromTable(item) {
    this.updateSurgForm.controls.Surgeryname.setValue(item.Surgeryname);
    this.updateSurgForm.controls.Bchid.setValue(item.Bchid);
    this.updateSurgForm.controls.Bcpid.setValue(item.Bcpid);
    this.updateSurgForm.controls.Date.setValue(item.Date);

    this.updateSurgForm.controls.Einri.setValue(item.Einri);
    this.updateSurgForm.controls.Mandt.setValue(item.Mandt);
    this.updateSurgForm.controls.Patnr.setValue(item.Patnr);

    this.updateSurgForm.controls.SurgHistid.setValue(item.SurgHistid);
    this.updateSurgForm.controls.Remarks.setValue(item.Remarks);
    this.updateSurgForm.controls.RespEmp.setValue(item.RespEmp);
    this.updateSurgForm.controls.Source.setValue(item.Source);

    this.updateSurgForm.controls.Treatou.setValue(this.loginUserDetails.Treatmentou);
    this.updateSurgForm.controls.Departmentou.setValue(this.loginUserDetails.Deptorgunit);

  }
}
