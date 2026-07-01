import { StorageService } from '@services/storage.service';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import Swal from 'sweetalert2';
import { Observable } from 'rxjs';
import { PatientHistoryService } from '@services/e-kardex/patient-history.service';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

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
  paramsObject: any;
  DispositionData=[];
  constructor(private modalService: BsModalService,private formBuilder: FormBuilder,private storageService:StorageService,private emergencyService:EmergencyService,private patientHistoryService:PatientHistoryService, private _route: ActivatedRoute) {
    this._route.queryParams.subscribe((params) => {
      this.paramsObject = params;
    });
    
    this.PhyAssessmentForm = this.formBuilder.group({
      "ZdocNr": [""],
      "Dockey": [""],
      "Dtid": ["ZMED_ERPHY"],
      Einri: this.paramsObject.einri,
      Patnr: this.paramsObject.patnr,
      Falnr: this.paramsObject.falnr,
      Lfdnr: this.paramsObject.lfdnr,
      Orgdo: [this.storageService.patientData.deptOrgUnit],
      AttendPhy: [this.storageService.getUserProfile().Gpart],
      "DocDate": [""],
      "DocTime": [""],
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
      "PastObgyn": [false],
      "NaObgyn": [false],
      "FollowUp": [''],
      "Substances": [''],
      "ObgynComment": [''],
      "GetLab": ["true"],
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
    let createDocTime = this.getTime(this.docDetails[0].DocTime).split(':');
    createDocTime = createDocTime[0] + ':' + createDocTime[1];
      this.PhyAssessmentForm.patchValue({
        "ZdocNr": this.docDetails[0].ZdocNr,
        "Dockey": this.docDetails[0].Dockey,
        "Dtid": "ZMED_ERPHY",
        "DocDate": this.getDate(this.docDetails[0].DocDate),
        "DocTime": createDocTime,
        Einri: this.paramsObject.einri,
        Patnr: this.paramsObject.patnr,
        Falnr: this.paramsObject.falnr,
        Lfdnr: this.paramsObject.lfdnr,
        Orgdo: this.storageService.patientData.deptOrgUnit,
        AttendPhy: this.storageService.getUserProfile().Gpart,  
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
        "PastObgyn": this.docDetails[0].PastObgyn,
        "NaObgyn": this.docDetails[0].NaObgyn,
        "FollowUp": this.docDetails[0].FollowUp,
        "Substances":this.docDetails[0].Substances,
        "ObgynComment": this.docDetails[0].ObgynComment,
        "GetLab": this.docDetails[0].GetLab != null ? this.docDetails[0].GetLab.toString() : "true",
        "DocStatus": this.docDetails[0].DocStatus
      })
      console.log('PhyAssessmentForm',this.PhyAssessmentForm);
      
    }else{
    this.setNewDocDefaults();
    }
    this.getChiefTemplate();
    this.getDispositionData();
    // if (this.PhyAssessmentForm.controls.Disposition.value == '3') {
    //   this.PhyAssessmentForm.controls.ConditionDisp.enable();
    // }else{
    // this.PhyAssessmentForm.controls.ConditionDisp.disable();
    // }
  }
  // Defaults for a brand-new document (admission date/time from encounter, room/bed, identity).
  private setNewDocDefaults() {
    // Admission comes from the encounter's real admission timestamp
    // (Encounter.period.start), a UTC ISO value e.g. 2019-04-10T07:18:43Z.
    const encounterStart = this.storageService.patientData?.encounterStart;
    if (encounterStart) {
      const admissionDateTime = new Date(encounterStart); // UTC -> local
      this.createDate = admissionDateTime;
      const admTime = String(admissionDateTime.getHours()).padStart(2, '0') + ':' +
                      String(admissionDateTime.getMinutes()).padStart(2, '0');
      this.PhyAssessmentForm.controls.AdmDate.setValue(admissionDateTime);
      this.PhyAssessmentForm.controls.AdmTime.setValue(admTime);
    } else {
      // Temporary fallback to legacy check-in data when encounterStart is absent.
      const checkindata: any = JSON.parse(localStorage.getItem('checkindata') || 'null');
      if (checkindata && checkindata.Erdat) {
        let createTime = this.getTime(checkindata.ZeitIntern).split(':');
        createTime = createTime[0] + ':' + createTime[1];
        this.createDate = this.getDate(checkindata.Erdat);
        this.PhyAssessmentForm.controls.AdmDate.setValue(this.createDate);
        this.PhyAssessmentForm.controls.AdmTime.setValue(createTime);
      }
      // else: leave AdmDate/AdmTime empty -> existing mandatory validation blocks save.
    }
    //document date/time default to current date/time (editable)
    const now = new Date();
    const docTime = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    this.PhyAssessmentForm.controls.DocDate.setValue(now);
    this.PhyAssessmentForm.controls.DocTime.setValue(docTime);
    //room/bed
    this.PhyAssessmentForm.controls.Room.setValue(this.storageService.patientData.location.room);
    this.PhyAssessmentForm.controls.Bed.setValue(this.storageService.patientData.location.bed);
    //
    this.PhyAssessmentForm.controls.Einri.setValue(this.storageService.einri);
    this.PhyAssessmentForm.controls.Patnr.setValue(this.storageService.patnr);
    this.PhyAssessmentForm.controls.Lfdnr.setValue(this.storageService.lfdnr);
    this.PhyAssessmentForm.controls.Falnr.setValue(this.storageService.falnr);
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
  // Format the Document Date/time controls into the SAP OData payload shape and
  // attach them to a payload object (date -> yyyy-MM-ddT00:00:00, time -> PThHmM00S),
  // mirroring the AdmDate/AdmTime handling. Omits empty values.
  private applyDocDateTime(json: any) {
    const dateVal = this.PhyAssessmentForm.controls.DocDate.value;
    const timeVal = this.PhyAssessmentForm.controls.DocTime.value;
    if (dateVal != '' && dateVal != undefined && dateVal != null) {
      json['DocDate'] = `${new DatePipe('en-US').transform(dateVal, 'yyyy-MM-dd')}T00:00:00`;
    } else {
      delete json['DocDate'];
    }
    if (timeVal != '' && timeVal != undefined && timeVal != null) {
      const t = timeVal.split(':');
      json['DocTime'] = 'PT' + t[0] + 'H' + t[1] + 'M' + '00S';
    } else {
      delete json['DocTime'];
    }
  }

  async createPhyDoc(){
        console.log(this.storageService.patientData, "this.storageService.patientData");

    if (this.PhyAssessmentForm.controls.ChiefComplaint.value == '') {
      Swal.fire({
        text: "Chief Complaint is mandatory",
        icon: 'error',
        confirmButtonText: 'Ok',
        customClass: { popup: 'myalertpopup' }
      })
    } else if(this.PhyAssessmentForm.controls.AdmDate.value == '') {
      Swal.fire({
        text: "Admission Date is mandatory",
        icon: 'error',
        confirmButtonText: 'Ok',
        customClass: { popup: 'myalertpopup' }
      })
    } else if(this.PhyAssessmentForm.controls.AdmTime.value == '') {
      Swal.fire({
        text: "Admission Time is mandatory",
        icon: 'error',
        confirmButtonText: 'Ok',
        customClass: { popup: 'myalertpopup' }
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
    createJson['Einri'] = this.storageService.einri;
    createJson['Patnr'] = this.storageService.patnr;
    createJson['Falnr'] = this.storageService.falnr;
    createJson['Lfdnr'] = this.storageService.lfdnr;
    createJson['AdmDate'] = createAdmDate;
    createJson['Orgdo'] = this.storageService.patientData.deptOrgUnit;
    createJson['AdmTime'] = createAdmTime;
    createJson['DiscTime'] = createDiscTime;
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
    this.applyDocDateTime(createJson);
    delete createJson['Dockey'];
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
        customClass: { popup: 'myalertpopup' }
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
    updateJson['Einri'] = this.storageService.einri;
    updateJson['Patnr'] = this.storageService.patnr;
    updateJson['Falnr'] = this.storageService.falnr;
    updateJson['Lfdnr'] = this.storageService.lfdnr;
    updateJson['AdmDate'] = createAdmDate;
    updateJson['Orgdo'] = this.storageService.patientData.deptOrgUnit;
    updateJson['AdmTime'] = createAdmTime;
    updateJson['DiscTime'] = createDiscTime
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
    this.applyDocDateTime(updateJson);
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
    updateJson['Orgdo'] = this.storageService.patientData.deptOrgUnit;
    updateJson['DiscTime'] = createDiscTime;
    updateJson['DateDisp'] = createDateDisp;
    updateJson['DiscDate'] = createDiscDate;
    updateJson['Einri'] = this.storageService.einri;
    updateJson['Falnr'] = this.storageService.falnr;
    updateJson['Patnr'] = this.storageService.patnr;
    updateJson['Lfdnr'] = this.storageService.lfdnr;
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
    this.applyDocDateTime(updateJson);
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
      DocStatus: '3',
    }
   return this.emergencyService.deletePhyAssessment(json);
  }
  async copyPhyDoc(){
    if (this.PhyAssessmentForm.controls.ChiefComplaint.value == '') {
      Swal.fire({
        text: "Chief Complaint is mandatory",
        icon: 'error',
        confirmButtonText: 'Ok',
        customClass: { popup: 'myalertpopup' }
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
    createJson['Orgdo'] = this.storageService.patientData.deptOrgUnit;
    createJson['Patnr'] = this.storageService.patnr;
    createJson['Falnr'] = this.storageService.falnr;
    createJson['Lfdnr'] = this.storageService.lfdnr;
    createJson['AdmDate'] = createAdmDate;
    createJson['AdmTime'] = createAdmTime;
    createJson['DiscTime'] = createDiscTime;
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
    this.applyDocDateTime(createJson);
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
        customClass: { popup: 'myalertpopup' }
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
    createJson['Orgdo'] = this.storageService.patientData.deptOrgUnit;
    createJson['AdmTime'] = createAdmTime;
    createJson['DiscTime'] = createDiscTime;
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
    createJson['DocStatus'] = '4';
    this.applyDocDateTime(createJson);
    delete createJson['Dockey'];
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
      "DocDate": [""],
      "DocTime": [""],
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
      "GetLab": ["true"],
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
