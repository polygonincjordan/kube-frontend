import { StorageService } from '@services/storage.service';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import Swal from 'sweetalert2';
import { Observable } from 'rxjs';
import { PatientHistoryService } from '@services/e-kardex/patient-history.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-er-physician',
  templateUrl: './er-physician.component.html',
  styleUrls: ['./er-physician.component.css']
})
export class ErPhysicianComponent implements OnInit {
  @Input() docDetails: any;
  @Input() latestDocs: any;
  @Output() getPhyList = new EventEmitter<any>();
  modalRef: BsModalRef;
  PhyAssessmentForm: FormGroup;
  createDate: any;
  chiefTemplate: any;
  DispositionData=[];
  constructor(private modalService: BsModalService,private formBuilder: FormBuilder,private storageService:StorageService,private emergencyService:EmergencyService,private patientHistoryService:PatientHistoryService) {
    this.PhyAssessmentForm = this.formBuilder.group({
      "ZdocNr": [""],
      "Dockey": [""],
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
      "PastObgyn": [false],
      "NaObgyn": [false],
      "FollowUp": [''],
      "Substances": [''],
      "ObgynComment": [''],
      "DocStatus": [""]
    });
   }

  ngOnInit() {
    //date/time
    this.createDate = '';
    if (this.docDetails.length > 0) {
      let createTime = this.getTime(this.docDetails[0].AdmTime).split(':');
    createTime = createTime[0] + ':' + createTime[1];
    this.createDate = this.getDate(this.docDetails[0].AdmDate);
    //this.createDate = String(this.createDate.getDate()).padStart(2, '0') + '.' + String(this.createDate.getMonth() + 1).padStart(2, '0') + '.' + String(this.createDate.getFullYear());
    let createDiscTime = this.getTime(this.docDetails[0].DiscTime).split(':');
    createDiscTime = createDiscTime[0] + ':' + createDiscTime[1];
      this.PhyAssessmentForm.patchValue({
        "ZdocNr": this.docDetails[0].ZdocNr,
        "Dockey": this.docDetails[0].Dockey,
        "Dtid": "ZMED_ERPHY",
        "Einri": this.docDetails[0].Einri,
        "Patnr": this.docDetails[0].Patnr,
        "Falnr": this.docDetails[0].Falnr,
        "Orgdo": this.docDetails[0].Orgdo,
        "Lfdnr": this.docDetails[0].Lfdnr,
        "AdmDate": this.getDate(this.docDetails[0].AdmDate),
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
        "Allergies": this.docDetails[0].Allergies.toString(),
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
        "PastObgyn": this.docDetails[0].PastObgyn,
        "NaObgyn": this.docDetails[0].NaObgyn,
        "FollowUp": this.docDetails[0].FollowUp,
        "Substances":this.docDetails[0].Substances,
        "ObgynComment": this.docDetails[0].ObgynComment,
        "DocStatus": this.docDetails[0].DocStatus
      })
      console.log('PhyAssessmentForm',this.PhyAssessmentForm);
      
    }else{
    let checkindata:any = JSON.parse(localStorage.getItem('checkindata'));
    let createTime = this.getTime(checkindata.ZeitIntern).split(':');
    createTime = createTime[0] + ':' + createTime[1];
    this.createDate = this.getDate(checkindata.Erdat);
    //this.createDate = String(this.createDate.getDate()).padStart(2, '0') + '.' + String(this.createDate.getMonth() + 1).padStart(2, '0') + '.' + String(this.createDate.getFullYear()); 
    this.PhyAssessmentForm.controls.AdmDate.setValue(this.createDate);
    this.PhyAssessmentForm.controls.AdmTime.setValue(createTime);
    //room/bed 
    this.PhyAssessmentForm.controls.Room.setValue(this.storageService.patientData.location.room);
    this.PhyAssessmentForm.controls.Bed.setValue(this.storageService.patientData.location.bed);
    // 
    this.PhyAssessmentForm.controls.Einri.setValue(this.storageService.einri);
    this.PhyAssessmentForm.controls.Patnr.setValue(this.storageService.patnr);
    this.PhyAssessmentForm.controls.Lfdnr.setValue(this.storageService.lfdnr);
    this.PhyAssessmentForm.controls.Falnr.setValue(this.storageService.falnr);
    }
    this.getChiefTemplate();
    this.getDispositionData();
    // if (this.PhyAssessmentForm.controls.Disposition.value == '3') {
    //   this.PhyAssessmentForm.controls.ConditionDisp.enable();
    // }else{
    // this.PhyAssessmentForm.controls.ConditionDisp.disable();
    // }
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
    if (this.PhyAssessmentForm.controls.ChiefComplaint.value == '') {
      Swal.fire({
        text: "Chief Complaint is mandatory",
        icon: 'error',
        confirmButtonText: 'Ok',
        customClass: 'myalertpopup'
      })
    } else if(this.PhyAssessmentForm.controls.AdmDate.value == '') {
      Swal.fire({
        text: "Admission Date is mandatory",
        icon: 'error',
        confirmButtonText: 'Ok',
        customClass: 'myalertpopup'
      })
    } else if(this.PhyAssessmentForm.controls.AdmTime.value == '') {
      Swal.fire({
        text: "Admission Time is mandatory",
        icon: 'error',
        confirmButtonText: 'Ok',
        customClass: 'myalertpopup'
      })
    } else{
    let createAdmDate = '';
    let createAdmTime = '';
    let createDiscDate = '';
    let createDiscTime = '';
    let createDateDisp = ''; 
    if ( this.PhyAssessmentForm.controls.AdmDate.value != '' && this.PhyAssessmentForm.controls.AdmDate.value != undefined) {
      createAdmDate = this.PhyAssessmentForm.controls.AdmDate.value;
      createAdmDate = `${new DatePipe('en-US').transform(
        createAdmDate,
        'yyyy-MM-dd'
      )}T00:00:00`
    }else{
      createAdmDate = '';
    }
    if ( this.PhyAssessmentForm.controls.AdmTime.value != '' && this.PhyAssessmentForm.controls.AdmTime.value != undefined) {
      createAdmTime = this.PhyAssessmentForm.controls.AdmTime.value.split(':');
      createAdmTime = 'PT'+createAdmTime[0] + 'H' + createAdmTime[1] + 'M' + '00S';
    }else{
      createAdmTime = '';
    }
    if ( this.PhyAssessmentForm.value.DiscDate != '' && this.PhyAssessmentForm.value.DiscDate != undefined) {
      createDiscDate = this.PhyAssessmentForm.controls.DiscDate.value.getFullYear() + '-' + String(this.PhyAssessmentForm.controls.DiscDate.value.getMonth() + 1).padStart(2, '0') + '-' + String(this.PhyAssessmentForm.controls.DiscDate.value.getDate()).padStart(2, '0') + 'T00:00:00';
    }else{
      createDiscDate = '';
    }
    if ( this.PhyAssessmentForm.value.DiscTime != '' && this.PhyAssessmentForm.value.DiscTime != undefined) {
      createDiscTime = this.PhyAssessmentForm.value.DiscTime.split(':');
      createDiscTime = 'PT'+createDiscTime[0] + 'H' + createDiscTime[1] + 'M' + '00S';
    }else{
      createDiscTime = '';
    }
    if ( this.PhyAssessmentForm.value.DateDisp != '' && this.PhyAssessmentForm.value.DateDisp != undefined) {
      createDateDisp = this.PhyAssessmentForm.controls.DateDisp.value.getFullYear() + '-' + String(this.PhyAssessmentForm.controls.DateDisp.value.getMonth() + 1).padStart(2, '0') + '-' + String(this.PhyAssessmentForm.controls.DateDisp.value.getDate()).padStart(2, '0') + 'T00:00:00';
    }else{
      createDateDisp = '';
    }
   
    let createJson = this.PhyAssessmentForm.value;
    createJson['AdmDate'] = createAdmDate;
    createJson['AdmTime'] = createAdmTime;
    createJson['DiscTime'] = createDiscTime;
    createJson['DateDisp'] = createDateDisp;
    createJson['DiscDate'] = createDiscDate;
    createJson['Allergies'] = JSON.parse(createJson.Allergies);
    createJson['VitalSign'] = JSON.parse(createJson.VitalSign);
    createJson['Diagnosis'] = JSON.parse(createJson.Diagnosis);
    createJson['Hospital'] = JSON.parse(createJson.Hospital);
    createJson['SurgicalHist'] = JSON.parse(createJson.SurgicalHist);
    createJson['Discharge'] = JSON.parse(createJson.Discharge);
    createJson['Family'] = JSON.parse(createJson.Family);
    createJson['MedicalHist'] = JSON.parse(createJson.MedicalHist);
    createJson['ObgynHist'] = JSON.parse(createJson.ObgynHist);
    createJson['DocStatus'] = '1';
    if (createJson['DiscDate'] == '') {
      delete createJson['DiscDate'];
    }
    if (createJson['DiscTime'] == '') {
      delete createJson['DiscTime'];
    }
    if (createJson['DateDisp'] == '') {
      delete createJson['DateDisp'];
    }
    return this.emergencyService.createPhyDoc(createJson);
  }
  }
  async updatePhyDoc(){
    if (this.PhyAssessmentForm.controls.ChiefComplaint.value == '') {
      Swal.fire({
        text: "Chief Complaint is mandatory",
        icon: 'error',
        confirmButtonText: 'Ok',
        customClass: 'myalertpopup'
      })
    }else{
    let createAdmDate = '';
    let createAdmTime = '';
    let createDiscDate = '';
    let createDiscTime = '';
    let createDateDisp = ''; 
    if ( this.PhyAssessmentForm.controls.AdmDate.value != '' && this.PhyAssessmentForm.controls.AdmDate.value != undefined) {
      createAdmDate = this.PhyAssessmentForm.controls.AdmDate.value;
      createAdmDate =  `${new DatePipe('en-US').transform(
        createAdmDate,
        'yyyy-MM-dd'
      )}T00:00:00`
    }else{
      createAdmDate = '';
    }
    if ( this.PhyAssessmentForm.controls.AdmTime.value != '' && this.PhyAssessmentForm.controls.AdmTime.value != undefined) {
      createAdmTime = this.PhyAssessmentForm.controls.AdmTime.value.split(':');
      createAdmTime = 'PT'+createAdmTime[0] + 'H' + createAdmTime[1] + 'M' + '00S';
    }else{
      createAdmTime = '';
    }
    if ( this.PhyAssessmentForm.value.DiscDate != '' && this.PhyAssessmentForm.value.DiscDate != undefined) {
      createDiscDate = this.PhyAssessmentForm.controls.DiscDate.value.getFullYear() + '-' + String(this.PhyAssessmentForm.controls.DiscDate.value.getMonth() + 1).padStart(2, '0') + '-' + String(this.PhyAssessmentForm.controls.DiscDate.value.getDate()).padStart(2, '0') + 'T00:00:00';
    }else{
      createDiscDate = '';
    }
    if ( this.PhyAssessmentForm.value.DiscTime != '' &&  this.PhyAssessmentForm.value.DiscTime != undefined) {
      createDiscTime = this.PhyAssessmentForm.value.DiscTime.split(':');
      createDiscTime = 'PT'+createDiscTime[0] + 'H' + createDiscTime[1] + 'M' + '00S';
    }else{
      createDiscTime = '';
    }
    if ( this.PhyAssessmentForm.value.DateDisp != '' && this.PhyAssessmentForm.value.DateDisp != undefined) {
      createDateDisp = this.PhyAssessmentForm.controls.DateDisp.value.getFullYear() + '-' + String(this.PhyAssessmentForm.controls.DateDisp.value.getMonth() + 1).padStart(2, '0') + '-' + String(this.PhyAssessmentForm.controls.DateDisp.value.getDate()).padStart(2, '0') + 'T00:00:00';
    }else{
      createDateDisp = '';
    }
    let updateJson = this.PhyAssessmentForm.value;
    updateJson['AdmDate'] = createAdmDate;
    updateJson['AdmTime'] = createAdmTime;
    updateJson['DiscTime'] = createDiscTime
    updateJson['DateDisp'] = createDateDisp;
    updateJson['DiscDate'] = createDiscDate;
    updateJson['Allergies'] = JSON.parse(updateJson.Allergies);
    updateJson['VitalSign'] = JSON.parse(updateJson.VitalSign);
    updateJson['Diagnosis'] = JSON.parse(updateJson.Diagnosis);
    updateJson['Hospital'] = JSON.parse(updateJson.Hospital);
    updateJson['SurgicalHist'] = JSON.parse(updateJson.SurgicalHist);
    updateJson['Discharge'] = JSON.parse(updateJson.Discharge);
    updateJson['Family'] = JSON.parse(updateJson.Family);
    updateJson['MedicalHist'] = JSON.parse(updateJson.MedicalHist);
    updateJson['ObgynHist'] = JSON.parse(updateJson.ObgynHist);
    updateJson['DocStatus'] = '1';
    if (updateJson['DiscDate'] == '') {
      delete updateJson['DiscDate'];
    }
    if (updateJson['DiscTime'] == '') {
      delete updateJson['DiscTime'];
    }
    if (updateJson['DateDisp'] == '') {
      delete updateJson['DateDisp'];
    }
    return this.emergencyService.updatePhyDoc(updateJson);
  }
  }
  async releasePhyDoc(){
    let createAdmDate = '';
    let createAdmTime = '';
    let createDiscDate = '';
    let createDiscTime = '';
    let createDateDisp = ''; 
    if ( this.PhyAssessmentForm.controls.AdmDate.value != '' && this.PhyAssessmentForm.controls.AdmDate.value != undefined) {
      createAdmDate = this.PhyAssessmentForm.controls.AdmDate.value;
      createAdmDate =  `${new DatePipe('en-US').transform(
        createAdmDate,
        'yyyy-MM-dd'
      )}T00:00:00`
    }else{
      createAdmDate = '';
    }
    if ( this.PhyAssessmentForm.controls.AdmTime.value != '' && this.PhyAssessmentForm.controls.AdmTime.value != undefined) {
      createAdmTime = this.PhyAssessmentForm.controls.AdmTime.value.split(':');
      createAdmTime = 'PT'+createAdmTime[0] + 'H' + createAdmTime[1] + 'M' + '00S';
    }else{
      createAdmTime = '';
    }
    if ( this.PhyAssessmentForm.value.DiscDate != '' && this.PhyAssessmentForm.value.DiscDate != undefined) {
      createDiscDate = this.PhyAssessmentForm.controls.DiscDate.value.getFullYear() + '-' + String(this.PhyAssessmentForm.controls.DiscDate.value.getMonth() + 1).padStart(2, '0') + '-' + String(this.PhyAssessmentForm.controls.DiscDate.value.getDate()).padStart(2, '0') + 'T00:00:00';
    }else{
      createDiscDate = '';
    }
    if ( this.PhyAssessmentForm.value.DiscTime != '' &&  this.PhyAssessmentForm.value.DiscTime != undefined) {
      createDiscTime = this.PhyAssessmentForm.value.DiscTime.split(':');
      createDiscTime = 'PT'+createDiscTime[0] + 'H' + createDiscTime[1] + 'M' + '00S';
    }else{
      createDiscTime = '';
    }
    if ( this.PhyAssessmentForm.value.DateDisp != '' && this.PhyAssessmentForm.value.DateDisp != undefined) {
      createDateDisp = this.PhyAssessmentForm.controls.DateDisp.value.getFullYear() + '-' + String(this.PhyAssessmentForm.controls.DateDisp.value.getMonth() + 1).padStart(2, '0') + '-' + String(this.PhyAssessmentForm.controls.DateDisp.value.getDate()).padStart(2, '0') + 'T00:00:00';
    }else{
      createDateDisp = '';
    }
   let updateJson = this.PhyAssessmentForm.value;
    updateJson['AdmDate'] = createAdmDate;
    updateJson['AdmTime'] = createAdmTime;
    updateJson['DiscTime'] = createDiscTime;
    updateJson['DateDisp'] = createDateDisp;
    updateJson['DiscDate'] = createDiscDate;
    updateJson['Einri'] = this.storageService.einri;
    updateJson['Falnr'] = this.storageService.falnr;
    updateJson['Patnr'] = this.storageService.patnr;
    updateJson['Lfdnr'] = this.storageService.lfdnr;
    updateJson['Allergies'] = true;
    updateJson['VitalSign'] = true;
    updateJson['Diagnosis'] = true;
    updateJson['Hospital'] = true;
    updateJson['SurgicalHist'] = true;
    updateJson['Discharge'] = true;
    updateJson['Family'] = true;
    updateJson['MedicalHist'] = true;
    updateJson['ObgynHist'] = JSON.parse(updateJson.ObgynHist);
    updateJson['DocStatus'] = '2';
    if (updateJson['DiscDate'] == '') {
      delete updateJson['DiscDate'];
    }
    if (updateJson['DiscTime'] == '') {
      delete updateJson['DiscTime'];
    }
    if (updateJson['DateDisp'] == '') {
      delete updateJson['DateDisp'];
    }
    console.log(updateJson);
    
    return this.emergencyService.releasePhyDoc(updateJson);
  }
  async deletePhyAssessment() {
    const json = {
      Dockey:this.docDetails[0].Dockey,
    }
   return this.emergencyService.deletePhyAssessment(json);
  }
  async copyPhyDoc(){
    if (this.PhyAssessmentForm.controls.ChiefComplaint.value == '') {
      Swal.fire({
        text: "Chief Complaint is mandatory",
        icon: 'error',
        confirmButtonText: 'Ok',
        customClass: 'myalertpopup'
      })
    }else{
    let createAdmDate = '';
    let createAdmTime = '';
    let createDiscDate = '';
    let createDiscTime = '';
    let createDateDisp = ''; 
    if ( this.PhyAssessmentForm.controls.AdmDate.value != '' && this.PhyAssessmentForm.controls.AdmDate.value != undefined) {
      createAdmDate = this.PhyAssessmentForm.controls.AdmDate.value;
      createAdmDate =  `${new DatePipe('en-US').transform(
        createAdmDate,
        'yyyy-MM-dd'
      )}T00:00:00`
    }else{
      createAdmDate = '';
    }
    if ( this.PhyAssessmentForm.controls.AdmTime.value != '' && this.PhyAssessmentForm.controls.AdmTime.value != undefined) {
      createAdmTime = this.PhyAssessmentForm.controls.AdmTime.value.split(':');
      createAdmTime = 'PT'+createAdmTime[0] + 'H' + createAdmTime[1] + 'M' + '00S';
    }else{
      createAdmTime = '';
    }
    if ( this.PhyAssessmentForm.value.DiscDate != '' && this.PhyAssessmentForm.value.DiscDate != undefined) {
      createDiscDate = this.PhyAssessmentForm.controls.DiscDate.value.getFullYear() + '-' + String(this.PhyAssessmentForm.controls.DiscDate.value.getMonth() + 1).padStart(2, '0') + '-' + String(this.PhyAssessmentForm.controls.DiscDate.value.getDate()).padStart(2, '0') + 'T00:00:00';
    }else{
      createDiscDate = '';
    }
    if ( this.PhyAssessmentForm.value.DiscTime != '' && this.PhyAssessmentForm.value.DiscTime != undefined) {
      createDiscTime = this.PhyAssessmentForm.value.DiscTime.split(':');
      createDiscTime = 'PT'+createDiscTime[0] + 'H' + createDiscTime[1] + 'M' + '00S';
    }else{
      createDiscTime = '';
    }
    if ( this.PhyAssessmentForm.value.DateDisp != '' && this.PhyAssessmentForm.value.DateDisp != undefined) {
      createDateDisp = this.PhyAssessmentForm.controls.DateDisp.value.getFullYear() + '-' + String(this.PhyAssessmentForm.controls.DateDisp.value.getMonth() + 1).padStart(2, '0') + '-' + String(this.PhyAssessmentForm.controls.DateDisp.value.getDate()).padStart(2, '0') + 'T00:00:00';
    }else{
      createDateDisp = '';
    }
   
    let createJson = this.PhyAssessmentForm.value;
    createJson['Einri'] = this.storageService.einri;
    createJson['Patnr'] = this.storageService.patnr;
    createJson['Falnr'] = this.storageService.falnr;
    createJson['Lfdnr'] = this.storageService.lfdnr;
    createJson['AdmDate'] = createAdmDate;
    createJson['AdmTime'] = createAdmTime;
    createJson['DiscTime'] = createDiscTime;
    createJson['DateDisp'] = createDateDisp;
    createJson['DiscDate'] = createDiscDate;
    createJson['Allergies'] = JSON.parse(createJson.Allergies);
    createJson['VitalSign'] = JSON.parse(createJson.VitalSign);
    createJson['Diagnosis'] = JSON.parse(createJson.Diagnosis);
    createJson['Hospital'] = JSON.parse(createJson.Hospital);
    createJson['SurgicalHist'] = JSON.parse(createJson.SurgicalHist);
    createJson['Discharge'] = JSON.parse(createJson.Discharge);
    createJson['Family'] = JSON.parse(createJson.Family);
    createJson['MedicalHist'] = JSON.parse(createJson.MedicalHist);
    createJson['ObgynHist'] = JSON.parse(createJson.ObgynHist);
    createJson['DocStatus'] = '1';
    if (createJson['DiscDate'] == '') {
      delete createJson['DiscDate'];
    }
    if (createJson['DiscTime'] == '') {
      delete createJson['DiscTime'];
    }
    if (createJson['DateDisp'] == '') {
      delete createJson['DateDisp'];
    }
    return this.emergencyService.createPhyDoc(createJson);
  }
  }
  async createAndReleasePhyDoc(){
    if (this.PhyAssessmentForm.controls.ChiefComplaint.value == '') {
      Swal.fire({
        text: "Chief Complaint is mandatory",
        icon: 'error',
        confirmButtonText: 'Ok',
        customClass: 'myalertpopup'
      })
    }else{
    let createAdmDate = '';
    let createAdmTime = '';
    let createDiscDate = '';
    let createDiscTime = '';
    let createDateDisp = ''; 
    if ( this.PhyAssessmentForm.controls.AdmDate.value != '' && this.PhyAssessmentForm.controls.AdmDate.value != undefined) {
      createAdmDate = this.PhyAssessmentForm.controls.AdmDate.value;
      createAdmDate =  `${new DatePipe('en-US').transform(
        createAdmDate,
        'yyyy-MM-dd'
      )}T00:00:00`
    }else{
      createAdmDate = '';
    }
    if ( this.PhyAssessmentForm.controls.AdmTime.value != '' && this.PhyAssessmentForm.controls.AdmTime.value != undefined) {
      createAdmTime = this.PhyAssessmentForm.controls.AdmTime.value.split(':');
      createAdmTime = 'PT'+createAdmTime[0] + 'H' + createAdmTime[1] + 'M' + '00S';
    }else{
      createAdmTime = '';
    }
    if ( this.PhyAssessmentForm.value.DiscDate != '' && this.PhyAssessmentForm.value.DiscDate != undefined) {
      createDiscDate = this.PhyAssessmentForm.controls.DiscDate.value.getFullYear() + '-' + String(this.PhyAssessmentForm.controls.DiscDate.value.getMonth() + 1).padStart(2, '0') + '-' + String(this.PhyAssessmentForm.controls.DiscDate.value.getDate()).padStart(2, '0') + 'T00:00:00';
    }else{
      createDiscDate = '';
    }
    if ( this.PhyAssessmentForm.value.DiscTime != '' && this.PhyAssessmentForm.value.DiscTime != undefined) {
      createDiscTime = this.PhyAssessmentForm.value.DiscTime.split(':');
      createDiscTime = 'PT'+createDiscTime[0] + 'H' + createDiscTime[1] + 'M' + '00S';
    }else{
      createDiscTime = '';
    }
    if ( this.PhyAssessmentForm.value.DateDisp != '' && this.PhyAssessmentForm.value.DateDisp != undefined) {
      createDateDisp = this.PhyAssessmentForm.controls.DateDisp.value.getFullYear() + '-' + String(this.PhyAssessmentForm.controls.DateDisp.value.getMonth() + 1).padStart(2, '0') + '-' + String(this.PhyAssessmentForm.controls.DateDisp.value.getDate()).padStart(2, '0') + 'T00:00:00';
    }else{
      createDateDisp = '';
    }
   
    let createJson = this.PhyAssessmentForm.value;
    createJson['AdmDate'] = createAdmDate;
    createJson['AdmTime'] = createAdmTime;
    createJson['DiscTime'] = createDiscTime;
    createJson['DateDisp'] = createDateDisp;
    createJson['DiscDate'] = createDiscDate;
    createJson['Allergies'] = JSON.parse(createJson.Allergies);
    createJson['VitalSign'] = JSON.parse(createJson.VitalSign);
    createJson['Diagnosis'] = JSON.parse(createJson.Diagnosis);
    createJson['Hospital'] = JSON.parse(createJson.Hospital);
    createJson['SurgicalHist'] = JSON.parse(createJson.SurgicalHist);
    createJson['Discharge'] = JSON.parse(createJson.Discharge);
    createJson['Family'] = JSON.parse(createJson.Family);
    createJson['MedicalHist'] = JSON.parse(createJson.MedicalHist);
    createJson['ObgynHist'] = JSON.parse(createJson.ObgynHist);
    createJson['DocStatus'] = '2';
    if (createJson['DiscDate'] == '') {
      delete createJson['DiscDate'];
    }
    if (createJson['DiscTime'] == '') {
      delete createJson['DiscTime'];
    }
    if (createJson['DateDisp'] == '') {
      delete createJson['DateDisp'];
    }
    return this.emergencyService.createPhyDoc(createJson);
  }
  }
   resetAll(){
    this.PhyAssessmentForm.reset();
    this.PhyAssessmentForm = this.formBuilder.group({
      "ZdocNr": [""],
      "Dockey": [""],
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
      "PastObgyn": [false],
      "NaObgyn": [false],
      "FollowUp": [''],
      "Substances": [''],
      "ObgynComment": [''],
      "DocStatus": [""]
    });
   }
   getChiefTemplate() {
    this.patientHistoryService.getChiefTemplate().subscribe(
      (_success: any) => {
       this.chiefTemplate = _success.d.results;
      },
      (_error: any) => {}
    );
  }
  setValueOfComplaintText(value){
    this.PhyAssessmentForm.controls.ChiefComplaint.setValue(value);
  }
  getDispositionData(){
    this.DispositionData = [
      {
        Text:'Discharged Home',
        Value:'0'
      },
      {
        Text:'DAMA',
        Value:'1'
      },
      {
        Text:'Deceased',
        Value:'2'
      },
      {
        Text:'Others',
        Value:'3'
      },
      {
        Text:'Admitted to hospital',
        Value:'4'
      },
      {
        Text:'Transfered to another hospital',
        Value:'5'
      },
    ]
  }
  updateSickLeave(el){
   if (el.value == 'na') {
    this.PhyAssessmentForm.controls.Hr24.setValue(false)
    this.PhyAssessmentForm.controls.Hr48.setValue(false)
   }else if (el.value == '24') {
    this.PhyAssessmentForm.controls.Na.setValue(false)
    this.PhyAssessmentForm.controls.Hr48.setValue(false)
   }else if (el.value == '48') {
    this.PhyAssessmentForm.controls.Hr24.setValue(false)
    this.PhyAssessmentForm.controls.Na.setValue(false)
   }
  }
  selectDisposition(){
    if (this.PhyAssessmentForm.controls.Disposition.value == '3') {
      this.PhyAssessmentForm.controls.ConditionDisp.enable();
    }else{
    this.PhyAssessmentForm.controls.ConditionDisp.disable();
    this.PhyAssessmentForm.controls.ConditionDisp.setValue('');
    }
  }
}
