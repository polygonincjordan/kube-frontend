import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { PointofsaleService } from '@services/pointofsale.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-point-of-sale',
  templateUrl: './point-of-sale.component.html',
  styleUrls: ['./point-of-sale.component.scss']
})
export class PointOfSaleComponent implements OnInit {
  patientDataForm: FormGroup;
  materialForm: FormGroup;
  MaterialFormitems: FormArray;
  modalRefForStorage: BsModalRef;
  patientInfo: any;
  storagesList: any;
  modalCommonDataArr: any;
  searchString ='';
  constructor(private pointOfSaleService : PointofsaleService,private formBuilder: FormBuilder,private modalService: BsModalService ) { 
    this.materialForm = this.formBuilder.group({
      MaterialFormitems: new FormArray([]),
    });
    this.patientDataForm = this.formBuilder.group({
      Pname: [''],
      Pernr: [''],
      Dname: [''],
      Insur: [''],
      Kname: [''],
      Falnr: [''],
      Einri: [''],
      Patnr: [''],
      Lgort: [''],
      Lgobe: ['']
    });
  }

  ngOnInit() {
    this.addItemForMaterial();
    this.addItemForMaterial();
    this.addItemForMaterial();
    this.addItemForMaterial();
    this.addItemForMaterial();
    this.getStorageLocations();
  }
  addItemForMaterial(): void {
    this.MaterialFormitems = this.materialForm.get('MaterialFormitems') as FormArray;
    this.MaterialFormitems.push(this.showMaterialDetailsOnList());
  }
  addnewItem(){
    const control = <FormArray>this.materialForm.controls['MaterialFormitems'];
    this.MaterialFormitems = this.materialForm.get('MaterialFormitems') as FormArray;
    this.MaterialFormitems.push(this.showMaterialDetailsOnList());
    control.insert(0,this.showMaterialDetailsOnList());
  }
  showMaterialDetailsOnList(): FormGroup {
      return this.formBuilder.group({
        Matnr : [''],
        Werks : [''],
        Charg : [''],
        Lgort : [''],
        Maktx : [''],
        Labst : [''],
        Netpr : [''],
        Menge : [''],
        Meins : [''],
        Brtwr : [''],
        Waers : ['']
      }
      );
  }
  getPatientInfoByCase() {
    const json ={
      CaseNumber:this.patientDataForm.controls.Falnr.value
    }
    this.pointOfSaleService.getPatientInfoByCase(json).subscribe((_success: any ) => {
       this.patientInfo = _success.d;
       this.patientDataForm.patchValue({
        Pname: this.patientInfo.Pname,
        Pernr: this.patientInfo.Pernr,
        Dname: this.patientInfo.Dname,
        Insur: this.patientInfo.Insur,
        Kname: this.patientInfo.Kname,
        Einri: this.patientInfo.Einri,
        Patnr: this.patientInfo.Patnr,
       })
      });
  }
  getStorageLocations() {
    this.pointOfSaleService.getStorageLocations().subscribe((_success: any ) => {
       this.storagesList = _success.d.results;
     });
  }
  openCommonModal( template: TemplateRef<any>){
    const config: ModalOptions = { class: 'list-commonmodal modal-dialog-centered' };
        this.modalRefForStorage = this.modalService.show(template,config);
        this.searchString = '';
        this.modalCommonDataArr = this.storagesList;
        this.searchString = this.patientDataForm.controls.Lgort.value;
        this.someMethod(this.searchString);
    }
    showStorageDesc(){
      let Lgobe;
      Lgobe = this.storagesList.find(el=> this.patientDataForm.controls.Lgort.value == el.Lgort);
      this.patientDataForm.controls.Lgobe.setValue(Lgobe.Lgobe);
      
    }
  selectValueFromList(item){
    this.patientDataForm.controls.Lgort.setValue(item.Lgort);
    this.patientDataForm.controls.Lgobe.setValue(item.Lgobe);
     this.modalRefForStorage.hide();
  }
  someMethod(event:string){
    if (this.modalCommonDataArr.length == 0) {
      this.modalCommonDataArr = this.storagesList;
    }else{
     if (event == "") {
      this.modalCommonDataArr = this.storagesList;
      }else{
        this.modalCommonDataArr = this.modalCommonDataArr.filter((item:any) =>{
          return item.Lgort.toLowerCase().includes(event.toLowerCase()) ||  item.Lgobe.toLowerCase().includes(event.toLowerCase()) ;          
      });
      }
    }
   
  }
   getMaterialDetailsSet(item,fieldName,index) {
    let value = '';
    if (fieldName == 'Charg') {
      value = item.Charg;
    }else{
      value = item.Matnr;
    }
    const json = {
      fieldName: fieldName,
      fieldValue: value,
      Lgort:this.patientDataForm.controls.Lgort.value
    }
    this.pointOfSaleService.getMaterialDetailsSet(json).subscribe((_success: any ) => {
       let setTableValues;
       setTableValues = this.materialForm.get('MaterialFormitems') as FormArray;
       setTableValues.controls[index].patchValue({
        Werks : _success.d.results[0].Werks,
        Charg : _success.d.results[0].Charg,
        Lgort : _success.d.results[0].Lgort,
        Maktx : _success.d.results[0].Maktx,
        Labst : _success.d.results[0].Labst,
        Netpr : _success.d.results[0].Netpr,
        Menge : _success.d.results[0].Menge,
        Meins : _success.d.results[0].Meins,
        Brtwr : _success.d.results[0].Brtwr,
        Waers : _success.d.results[0].Waers
       })
     },
     (_error: any) => {
      Swal.fire({
        title: _error.error.error.message.value,
        icon: 'error',
        confirmButtonText: 'OK',
        //preConfirm: () => {},
      });
    }
     );
  }
  calculateTotalPrice(item,index){
   let totalprice;
   let setTableValues;
   totalprice = item.Netpr * item.Menge;
   setTableValues = this.materialForm.get('MaterialFormitems') as FormArray;
   setTableValues.controls[index].patchValue({
    Brtwr : totalprice,
   })
  }
  confirmationForDeleteMaterial(index){
    Swal.fire({
      text: "Are you sure you want to delete?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      // customClass: 'myalertpopup'
    }).then((result) => {
      if (result.value) {
        let setTableValues; 
        setTableValues = this.materialForm.get('MaterialFormitems') as FormArray;
        setTableValues.removeAt(index);
      }
    })
  }
}
