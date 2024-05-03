import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { formatDate } from 'ngx-bootstrap/chronos';
import Swal from 'sweetalert2';
import { PatientVisitDataResult } from '../../services/e-kardex/interfaces/patient-visit-data';
import { PatientVisitService } from '../../services/e-kardex/patient-visit.service';

@Component({
  selector: 'app-soap-form',
  templateUrl: './soap-form.component.html',
  styleUrls: ['./soap-form.component.scss'],
})
export class SoapFormComponent implements OnInit {
  public patientVisitData: any;
  public soapDataType: string;
  isUpdate=false;
  @Input()  isCopy: boolean;
  @Input() set patientSoapData(result: any) {
    
    this.soapDataType = result.type;
    this.patientVisitData = result.data;
    
    this.patientVisitData.Dockey !== ""  && this.isCopy ? this.patientVisitData.Visitdate = formatDate(new Date(), "YYYY-MM-DD") : this.patientVisitData.Visitdate;
    this.patientVisitData['VisitDate'] = this.patientVisitData.Visitdate;
     
   
    if (result.data.DocKey == '') {
      this.isUpdate = false;
    }else if(this.patientVisitData.Dockey !== '' && !this.isCopy){
      this.isUpdate = true;
    }
  }
  @Input() isCreateRequest: boolean;
  @Input() set isCopyRequest(value:any){
  }
  @Output() updateEvent = new EventEmitter<boolean>();
  constructor(private patientVisitService: PatientVisitService) { }

  ngOnInit(): void { 
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
        this.updateEvent.emit(isUpdate);
      }
    })
  }

  async saveForm() {
    await this.patientVisitService.savePatientVisitData(this.patientVisitData);
    this.updateEvent.emit(true);
  }
  async updateSoapForm(){
  await this.patientVisitService.updatePatientVisitData(this.patientVisitData);
  this.updateEvent.emit(true);
  this.isUpdate = false;
  }
  async releaseForm() {
    
    this.patientVisitData.Released = 'X';
    if(this.isUpdate){
    await this.patientVisitService.toReleaseSoapPatientVisitData(this.patientVisitData);
    }
    else{
      await this.patientVisitService.savePatientVisitData(this.patientVisitData);
    }
    this.updateEvent.emit(true);
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
          this.patientVisitService.deletePatientVisitData(
          this.patientVisitData
        );
        this.updateEvent.emit(true);
      }
    })
  }
}
