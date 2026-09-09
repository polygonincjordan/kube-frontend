import { StorageService } from '@services/storage.service';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import Swal from 'sweetalert2';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-er-physician',
  templateUrl: './er-physician.component.html',
  styleUrls: ['./er-physician.component.css']
})
export class ErPhysicianComponent implements OnInit {
  @Input() docDetails: any;
  @Output() getPhyList = new EventEmitter<any>();
  modalRef: BsModalRef;
  PhyAssessmentForm: FormGroup;
  createDate: any;
  constructor(private modalService: BsModalService,private formBuilder: FormBuilder,private storageService:StorageService,private emergencyService:EmergencyService) {
    this.PhyAssessmentForm = this.formBuilder.group({
      "ZdocNr": [""],
      "Dtid": ["ZMED_ERPHY"],
      "Einri": [""],
      "Patnr": [""],
      "Falnr": [""],
      "Orgdo": [""],
      "Lfdnr": [""],
      "AdmDate": [""],
      "AdmTime": [""],
      "DiscDate": [""],
      "DiscTime": [""],
      "Bed": [""],
      "Room": [""],
      "ChiefComplaint": [""],
      "Significant": [""],
      "Treatments": [""],
      "Disposition": [""],
      "ConditionDisp": [""],
      "PlanCare": [""],
      "InstructionDisp": [""],
      "DateDisp": [""],
      "Speciality": [""],
      "Allergies": ["true"],
      "VitalSign": ["true"],
      "Diagnosis": ["true"],
      "Hospital": ["true"],
      "SurgicalHist": ["true"],
      "Discharge": ["true"],
      "Family": ["true"],
      "MedicalHist": ["true"],
      "ObgynHist": ["true"],
      "Na": [false],
      "Hr24": [false],
      "Hr48": [false],
      "AttendPhy": [this.storageService.getGpart()],
      "GetLab": ["true"],
      "DocStatus": [""]
    });
   }

  ngOnInit() {
    //date/time
    if (this.docDetails.length > 0) {
      let createTime = this.getTime(this.docDetails[0].AdmTime).split(':');
    createTime = createTime[0] + ':' + createTime[1];
    this.createDate = this.getDate(this.docDetails[0].AdmDate);
    this.createDate = String(this.createDate.getDate()).padStart(2, '0') + '.' + String(this.createDate.getMonth() + 1).padStart(2, '0') + '.' + String(this.createDate.getFullYear());
    let createDiscTime = this.getTime(this.docDetails[0].DiscTime).split(':');
    createDiscTime = createDiscTime[0] + ':' + createDiscTime[1];
      this.PhyAssessmentForm.patchValue({
        "ZdocNr": this.docDetails[0].ZdocNr,
        "Dtid": "ZMED_ERPHY",
        "Einri": this.docDetails[0].Einri,
        "Patnr": this.docDetails[0].Patnr,
        "Falnr": this.docDetails[0].Falnr,
        "Orgdo": this.docDetails[0].Orgdo,
        "Lfdnr": this.docDetails[0].Lfdnr,
        "AdmDate": this.createDate,
        "AdmTime": createTime,
        "DiscDate": this.getDate(this.docDetails[0].DiscDate),
        "DiscTime": createDiscTime,
        "Bed": this.docDetails[0].Bed,
        "Room": this.docDetails[0].Room,
        "ChiefComplaint": this.docDetails[0].ChiefComplaint,
        "Significant": this.docDetails[0].Significant,
        "Treatments": this.docDetails[0].Treatments,
        "Disposition": this.docDetails[0].Disposition,
        "ConditionDisp": this.docDetails[0].ConditionDisp,
        "PlanCare": this.docDetails[0].PlanCare,
        "InstructionDisp": this.docDetails[0].InstructionDisp,
        "DateDisp": this.getDate(this.docDetails[0].DateDisp),
        "Speciality": this.docDetails[0].Speciality,
        "Allergies": "true",
        "VitalSign": this.docDetails[0].VitalSign.toString(),
        "Diagnosis": this.docDetails[0].Diagnosis.toString(),
        "Hospital": this.docDetails[0].Hospital.toString(),
        "SurgicalHist": this.docDetails[0].SurgicalHist.toString(),
        "Discharge": this.docDetails[0].Discharge.toString(),
        "Family": this.docDetails[0].Family.toString(),
        "MedicalHist": this.docDetails[0].MedicalHist.toString(),
        "ObgynHist": this.docDetails[0].ObgynHist.toString(),
        "Na": this.docDetails[0].Na,
        "Hr24": this.docDetails[0].Hr24,
        "Hr48": this.docDetails[0].Hr48,
        "AttendPhy": this.storageService.getGpart(),
        "GetLab": (this.docDetails[0].GetLab !== undefined && this.docDetails[0].GetLab !== null) ? this.docDetails[0].GetLab.toString() : "true",
        "DocStatus": this.docDetails[0].DocStatus
      })
      console.log('PhyAssessmentForm',this.PhyAssessmentForm);
      
    }else{
    // Admission comes from the encounter's real admission timestamp
    // (Encounter.period.start), a UTC ISO value e.g. 2019-04-10T07:18:43Z.
    const encounterStart = this.storageService.patientData?.encounterStart;
    if (encounterStart) {
      const admissionDateTime = new Date(encounterStart); // UTC -> local
      this.createDate = String(admissionDateTime.getDate()).padStart(2, '0') + '.' + String(admissionDateTime.getMonth() + 1).padStart(2, '0') + '.' + String(admissionDateTime.getFullYear());
      const admTime = String(admissionDateTime.getHours()).padStart(2, '0') + ':' + String(admissionDateTime.getMinutes()).padStart(2, '0');
      this.PhyAssessmentForm.controls.AdmDate.setValue(this.createDate);
      this.PhyAssessmentForm.controls.AdmTime.setValue(admTime);
    } else if (this.storageService.checkinPatientData && this.storageService.checkinPatientData.Erdat) {
      // Temporary fallback to legacy check-in data when encounterStart is absent.
      let createTime = this.getTime(this.storageService.checkinPatientData.ZeitIntern).split(':');
      createTime = createTime[0] + ':' + createTime[1];
      const admDateObj = this.getDate(this.storageService.checkinPatientData.Erdat);
      this.createDate = String(admDateObj.getDate()).padStart(2, '0') + '.' + String(admDateObj.getMonth() + 1).padStart(2, '0') + '.' + String(admDateObj.getFullYear());
      this.PhyAssessmentForm.controls.AdmDate.setValue(this.createDate);
      this.PhyAssessmentForm.controls.AdmTime.setValue(createTime);
    }
    // else: leave AdmDate/AdmTime empty.
    //room/bed 
    this.PhyAssessmentForm.controls.Room.setValue(this.storageService.patientData.location.room);
    this.PhyAssessmentForm.controls.Bed.setValue(this.storageService.patientData.location.bed);
    // 
    this.PhyAssessmentForm.controls.Einri.setValue(this.storageService.einri);
    this.PhyAssessmentForm.controls.Patnr.setValue(this.storageService.patnr);
    this.PhyAssessmentForm.controls.Lfdnr.setValue(this.storageService.lfdnr);
    this.PhyAssessmentForm.controls.Falnr.setValue(this.storageService.falnr);
    }
  }
  openPastHistory(template: TemplateRef<any>){
    const config: ModalOptions = { class: 'modal-dialog-centered modal-lg pastdochistory' };
    this.modalRef = this.modalService.show(template,config);
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
      return str;
    }
  }

  async createPhyDoc(){
    let createAdmDate = this.PhyAssessmentForm.value.AdmDate.split('.');
    let createAdmTime = this.PhyAssessmentForm.value.AdmTime.split(':');
    let createDiscDate = this.PhyAssessmentForm.controls.DiscDate.value.getFullYear() + '-' + String(this.PhyAssessmentForm.controls.DiscDate.value.getMonth() + 1).padStart(2, '0') + '-' + String(this.PhyAssessmentForm.controls.DiscDate.value.getDate()).padStart(2, '0') + 'T00:00:00'; 
    let createDiscTime = this.PhyAssessmentForm.value.DiscTime.split(':');
    let createDateDisp = this.PhyAssessmentForm.controls.DateDisp.value.getFullYear() + '-' + String(this.PhyAssessmentForm.controls.DateDisp.value.getMonth() + 1).padStart(2, '0') + '-' + String(this.PhyAssessmentForm.controls.DateDisp.value.getDate()).padStart(2, '0') + 'T00:00:00'; 
    let createJson = this.PhyAssessmentForm.value;
    createJson['AdmDate'] = createAdmDate[2] + '-' + createAdmDate[1] + '-' + createAdmDate[0] + 'T00:00:00';
    createJson['AdmTime'] = 'PT'+createAdmTime[0] + 'H' + createAdmTime[1] + 'M' + '00S';
    createJson['DiscTime'] = 'PT'+createDiscTime[0] + 'H' + createDiscTime[1] + 'M' + '00S';
    createJson['DateDisp'] = createDateDisp;
    createJson['DiscDate'] = createDiscDate;
    createJson['Allergies'] = true;
    createJson['VitalSign'] = JSON.parse(createJson.VitalSign);
    createJson['Diagnosis'] = JSON.parse(createJson.Diagnosis);
    createJson['Hospital'] = JSON.parse(createJson.Hospital);
    createJson['SurgicalHist'] = JSON.parse(createJson.SurgicalHist);
    createJson['Discharge'] = JSON.parse(createJson.Discharge);
    createJson['Family'] = JSON.parse(createJson.Family);
    createJson['MedicalHist'] = JSON.parse(createJson.MedicalHist);
    createJson['ObgynHist'] = JSON.parse(createJson.ObgynHist);
    createJson['GetLab'] = JSON.parse(createJson.GetLab);
    createJson['DocStatus'] = '1';
    
    return this.emergencyService.createPhyDoc(createJson);
  }
  async updatePhyDoc(){
    let createAdmDate = this.PhyAssessmentForm.value.AdmDate.split('.');
    let createAdmTime = this.PhyAssessmentForm.value.AdmTime.split(':');
    let createDiscDate = this.PhyAssessmentForm.controls.DiscDate.value.getFullYear() + '-' + String(this.PhyAssessmentForm.controls.DiscDate.value.getMonth() + 1).padStart(2, '0') + '-' + String(this.PhyAssessmentForm.controls.DiscDate.value.getDate()).padStart(2, '0') + 'T00:00:00'; 
    let createDiscTime = this.PhyAssessmentForm.value.DiscTime.split(':');
    let createDateDisp = this.PhyAssessmentForm.controls.DateDisp.value.getFullYear() + '-' + String(this.PhyAssessmentForm.controls.DateDisp.value.getMonth() + 1).padStart(2, '0') + '-' + String(this.PhyAssessmentForm.controls.DateDisp.value.getDate()).padStart(2, '0') + 'T00:00:00'; 
    let updateJson = this.PhyAssessmentForm.value;
    updateJson['AdmDate'] = createAdmDate[2] + '-' + createAdmDate[1] + '-' + createAdmDate[0] + 'T00:00:00';
    updateJson['AdmTime'] = 'PT'+createAdmTime[0] + 'H' + createAdmTime[1] + 'M' + '00S';
    updateJson['DiscTime'] = 'PT'+createDiscTime[0] + 'H' + createDiscTime[1] + 'M' + '00S';
    updateJson['DateDisp'] = createDateDisp;
    updateJson['DiscDate'] = createDiscDate;
    updateJson['Allergies'] = true;
    updateJson['VitalSign'] = JSON.parse(updateJson.VitalSign);
    updateJson['Diagnosis'] = JSON.parse(updateJson.Diagnosis);
    updateJson['Hospital'] = JSON.parse(updateJson.Hospital);
    updateJson['SurgicalHist'] = JSON.parse(updateJson.SurgicalHist);
    updateJson['Discharge'] = JSON.parse(updateJson.Discharge);
    updateJson['Family'] = JSON.parse(updateJson.Family);
    updateJson['MedicalHist'] = JSON.parse(updateJson.MedicalHist);
    updateJson['ObgynHist'] = JSON.parse(updateJson.ObgynHist);
    updateJson['GetLab'] = JSON.parse(updateJson.GetLab);
    updateJson['DocStatus'] = '2';
    
    return this.emergencyService.updatePhyDoc(updateJson);
  }
  async releasePhyDoc(){
    let createAdmDate = this.PhyAssessmentForm.value.AdmDate.split('.');
    let createAdmTime = this.PhyAssessmentForm.value.AdmTime.split(':');
    let createDiscDate = this.PhyAssessmentForm.controls.DiscDate.value.getFullYear() + '-' + String(this.PhyAssessmentForm.controls.DiscDate.value.getMonth() + 1).padStart(2, '0') + '-' + String(this.PhyAssessmentForm.controls.DiscDate.value.getDate()).padStart(2, '0') + 'T00:00:00'; 
    let createDiscTime = this.PhyAssessmentForm.value.DiscTime.split(':');
    let createDateDisp = this.PhyAssessmentForm.controls.DateDisp.value.getFullYear() + '-' + String(this.PhyAssessmentForm.controls.DateDisp.value.getMonth() + 1).padStart(2, '0') + '-' + String(this.PhyAssessmentForm.controls.DateDisp.value.getDate()).padStart(2, '0') + 'T00:00:00'; 
    let updateJson = this.PhyAssessmentForm.value;
    updateJson['AdmDate'] = createAdmDate[2] + '-' + createAdmDate[1] + '-' + createAdmDate[0] + 'T00:00:00';
    updateJson['AdmTime'] = 'PT'+createAdmTime[0] + 'H' + createAdmTime[1] + 'M' + '00S';
    updateJson['DiscTime'] = 'PT'+createDiscTime[0] + 'H' + createDiscTime[1] + 'M' + '00S';
    updateJson['DateDisp'] = createDateDisp;
    updateJson['DiscDate'] = createDiscDate;
    updateJson['Allergies'] = true;
    updateJson['VitalSign'] = JSON.parse(updateJson.VitalSign);
    updateJson['Diagnosis'] = JSON.parse(updateJson.Diagnosis);
    updateJson['Hospital'] = JSON.parse(updateJson.Hospital);
    updateJson['SurgicalHist'] = JSON.parse(updateJson.SurgicalHist);
    updateJson['Discharge'] = JSON.parse(updateJson.Discharge);
    updateJson['Family'] = JSON.parse(updateJson.Family);
    updateJson['MedicalHist'] = JSON.parse(updateJson.MedicalHist);
    updateJson['ObgynHist'] = JSON.parse(updateJson.ObgynHist);
    updateJson['GetLab'] = JSON.parse(updateJson.GetLab);
    updateJson['DocStatus'] = '4';
    
    return this.emergencyService.releasePhyDoc(updateJson);
  }
  async deletePhyAssessment() {
    const json = {
      ZdocNr:this.docDetails[0].ZdocNr,
      DocStatus: '3',
    }
   return this.emergencyService.deletePhyAssessment(json);
  }
   resetAll(){
    this.PhyAssessmentForm.reset();
   }
}
