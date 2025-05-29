import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { CreateAllergyComponent } from './create-allergy/create-allergy.component';
import { GynDiagnosisComponent } from './diagnosis/diagnosis.component';
import { ErVitalsComponent } from './er-vitals/er-vitals.component';
import { StorageService } from '@services/storage.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdmissionService } from '@services/admission/admission.service';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { SharedService } from '@services/shared.service';

@Component({
  selector: 'app-obs-gyn',
  templateUrl: './obs-gyn.component.html',
  styleUrls: ['./obs-gyn.component.scss']
})
export class ObsGynComponent implements OnInit,OnChanges {
  @ViewChild('diagnosisNotesKardexId') diagnosisNotesKardex: GynDiagnosisComponent;
  @ViewChild('createAllergyId') createAllergyId: CreateAllergyComponent;
  @ViewChild('erVitalsModal') erVitalsModal: ErVitalsComponent;
  @Input() soapFormEvent: string;
  @Output() realodEducationList = new EventEmitter();
  allergy: boolean=true;
  diagnosis: boolean=false;
  vitals: boolean=false;
  paramsObject: any;
  obsGynReportForm: FormGroup;
  gynAllDetails: any;
  generalPhyExamForm:FormGroup;
  headNeckPhyExamForm: FormGroup;
  eyesPhyExamForm: FormGroup;
  entPhyExamForm: FormGroup;
  respiratoryPhyExamForm: FormGroup;
  cardioPhyExamForm: FormGroup;
  haemaPhyExamForm: FormGroup;
  gastroPhyExamForm: FormGroup;
  musculoPhyExamForm: FormGroup;
  skinPhyExamForm: FormGroup;
  neuroPhyExamForm: FormGroup;
  genitPhyExamForm: FormGroup;
  breastPhyExamForm: FormGroup;
  toPhyExamArr=[];
  toAllergyArr:any=[];
  toVitalsArr: any=[];
  toDiagnosisArr: any=[];
  enableCreateDiagnosis=false;
  enableCreateVitals: boolean;
  duplicates=[];
  modalRefForComment: BsModalRef;
  longComment='';
  formName: any;
  constructor(private storageService: StorageService,private route: ActivatedRoute,private formBuilder: FormBuilder,public admissionService: AdmissionService,private datePipe: DatePipe,private modalService: BsModalService,
    private sharedService: SharedService
  ) { 
    this.route.queryParams.subscribe((params) => {
      this.paramsObject = params;
    });
  }

  ngOnInit() {
    this.initForm();
    this.initPhyExamForm();
  }
  ngOnChanges(changes: SimpleChanges) {
    if(changes.soapFormEvent.currentValue == 'add') {
      this.createObsGynDoc(false);
    }
    if(changes.soapFormEvent.currentValue == 'edit') {
      this.updateObsGynDoc();
    }
    if(changes.soapFormEvent.currentValue == 'edit') {
      if(this.admissionService.isEditObsGynDoc) {
        this.updateObsGynDoc();
      } else {
        this.createObsGynDoc(false);
      }
    }

    if(changes.soapFormEvent.currentValue == 'release') {
      if(this.admissionService.isEditObsGynDoc) {
        this.releaseObsGynDoc()
      } else {
        this.createObsGynDoc(true)
      }
    }

    if (this.admissionService.isEditObsGynDoc || this.admissionService.isCloneObsGynDoc) {
      this.getObsGynData();
    }
  }

  switchTabs(tab){
   if (tab == 'allergies') {
     this.allergy = true;
     this.diagnosis = false;
     this.vitals = false;
   }else if(tab == 'diagnosis'){
    this.allergy = false;
    this.diagnosis = true;
    this.vitals = false;
   }else if(tab == 'vitals'){
    this.allergy = false;
    this.diagnosis = false;
    this.vitals = true;
   }
  }
  openModalForAllergy() {
    this.createAllergyId.openModalForAllergy();
  }
  openModalForDiagnosis() {
    this.diagnosisNotesKardex.openModalForDiagnosisKardex();
  }
  openModalVital() {
    const item = {
      Einri: this.storageService.einri,
      Patnr: this.storageService.patnr,
      Falnr: this.storageService.falnr,
      Lfdnr: this.storageService.lfdnr,
      Patient: this.storageService?.patientData?.name,
      admissionDate: this.storageService.patientData.periodStart,
    }
    this.erVitalsModal.openModalForErVital(item);
  }
  
  initForm(){
    this.obsGynReportForm = this.formBuilder.group({
      "Dockey": [""],
        "Dtid": ["ZMED_OBPHY"],
        "Einri": [this.storageService.einri],
        "Patnr": [this.storageService.patnr],
        "Falnr": [this.storageService.falnr],
        "Orgdo": [""],
        "Lfdnr": [this.storageService.lfdnr],
        "Ddate": [new Date(`${new DatePipe('en-US').transform(
          new Date(),
          'yyyy-MM-dd'
        )}T00:00:00`)],
        "Dtime": [this.datePipe.transform(new Date(),'hh:mm')],
        "Admphy": [this.storageService.patientData.careManager],
        "Patient": [false],
        "Rrelative": [false],
        "Others": [false],
        "OthersTxt": [""],
        "LengthStay": [this.storageService.patientData.lenghtOfStay.toString()],
        "ChiefComplaint": [""],
        "Medication": [""],
        "MedHist": [""],
        "SurgicalHist": [""],
        "ObstetricalHist": [""],
        "Menarche": [false],
        "MenarcheTxt": [""],
        "Amount": [false],
        "AmountTxt": [""],
        "Oorder": [false],
        "OorderTxt": [""],
        "Contraception": [false],
        "ContraceptionTxt": [""],
        "Cycle": [false],
        "CycleTxt": [""],
        "VagDc": [false],
        "VagDcTxt": [""],
        "Pcb": [false],
        "PcbTxt": [""],
        "Infertility": [false],
        "InfertilityTxt": [""],
        "Duration": [false],
        "DurationTxt": [""],
        "Itching": [false],
        "ItchingTxt": [""],
        "Imb": [false],
        "ImbTxt": [""],
        "Std": [false],
        "StdTxt": [""],
        "NotDone": [false],
        "Negative": [false],
        "Positive": [false],
        "Location": [""],
        "Psychological": [""],
        "Nutritional": [""],
        "PrenatalScreen": [false],
        "Trimester1st": [false],
        "Yes1st": [false],
        "No1st": [false],
        "YesTxt": [""],
        "Trimester2nd": [false],
        "Ultrasound": [false],
        "UltrasoundTxt": [""],
        "Other": [false],
        "OtherTxt": [""],
        "Laboratory": [false],
        "Hb": [false],
        "HbTxt": [""],
        "Platelets": [false],
        "PlateletsTxt": [""],
        "BloodGroup": [false],
        "BloodType": "0",
        "BloodGroupF": [false],
        "BloodTypeF": "1",
        "GlucoseTest": [false],
        "GlucoseValue": "2",
        "GlucoseTxt": [""],
        "Gtt": [false],
        "GttValue": "2",
        "GttTxt": [""],
        "Gbs": [false],
        "GbsValue": "2",
        "GbsTxt": [""],
        "HepatitisB": [false],
        "HepatitisBVal": [""],
        "HepatitisBTxt": [""],
        "HepatitisC": [false],
        "HepatitisCVal": [""],
        "HepatitisCTxt": [""],
        "Hiv": [false],
        "HivValue": [""],
        "HivTxt": [""],
        "LOthers": [false],
        "LOthersTxt": [""],
        "DiffDiagnosis": [""],
        "ManagementPlan": [""],
        "Consultations": [""],
        "ConsultationsTxt": [""],
        "ExpectedStay": [false],
        "Home": [false],
        "Dothers": [false],
        "DothersTxt": [""],
        "Dcomments": [""],
        "RiskReviewed": [false],
        "Rhome": [false],
        "Rothers": [false],
        "RothersTxt": [""],
        "Referrals": [false],
        "ReferralsYes": [false],
        "ReferralsNo": [false],
        "IllnessCondition": [false],
        "IllnessCondYes": [false],
        "IllnessCondNo": [false],
        "DiagnosisPrognosis": [false],
        "DiagnosisProgYes": [false],
        "DiagnosisProgNo": [false],
        "RNoReportedAbnorm" : [false],
        "RShortnessBreath" : [false],
        "RCough" : [false],
        "RWheezing" : [false],
        "RCoughingBlood" : [false],
        "RProductionPhlegm" : [false],
        "RChestPain" : [false],
        "RFever" : [false],
        "RNightSweats" : [false],
        "RBlueFingersToes" : [false],
        "RSwellingHandsFeet" : [false],
        "RBronchitisEmphysema" : [false],
        "RHeartMurmur" : [false],
        "RHxHeartMedication" : [false],
        "RSkippingHeartBeats" : [false],
        "RComments" : [''],
        "GNoReportedAbnorm" : false,
        "GChangeAppetiteWeight" : [false],
        "GProblemsSwallowing" : [false],
        "GNausea" : [false],
        "GHeartburn" : [false],
        "GVomiting" : [false],
        "GVomitingBlood" : [false],
        "GConstipation" : [false],
        "GDiarrhea" : [false],
        "GChangeBowelHabits" : [false],
        "GAbdominalPain" : [false],
        "GExcessiveBelching" : [false],
        "GExcessiveFlatus" : [false],
        "GYellowColourSkin" : [false],
        "GFoodIntolerance" : [false],
        "GRectalBleedingHemo" : [false],
        "GToiletTrained" : [false],
        "GTfreq" : [''],
        "GUsesDiaper" : [false],
        "GUfreq" : [''],
        "GComments" : [''],
        "UNoReportedAbnorm" : [false],
        "UDifficultyUrination" : [false],
        "UPainBurningUrination" : [false],
        "UFrequentUrinationNight" : [false],
        "UUrgentNeedUrinate" : [false],
        "UIncontinenceUrine" : [false],
        "UDribbling" : [false],
        "UDecreasedUrineStream" : [false],
        "UBloodUrine" : [false],
        "UUtiStonesProstate" : [false],
        "UComments" : [''],
        "PNoReportedAbnorm" : [false],
        "PLegCramps" : [false],
        "PVaricoseVeins" : [false],
        "PClotsVeins" : [false],
        "PComments" : [''],
        "NoDiagnoses": [false],
        "NoVitalSigns": [false],
        "CannotBeAssessed": [false],
        "TOALLERGIES" :[[]],
        "TOVITALSIGNS" : [[]],
        "TOPHYEXAM" : [[]],
        "TODIAGNOSES" : [[]],
        "AttendPhy": [this.storageService.getGpart()],
        "DocStatus": [""]
  });
  this.obsGynReportForm.controls.MenarcheTxt.disable();
  this.obsGynReportForm.controls.CycleTxt.disable();
  this.obsGynReportForm.controls.DurationTxt.disable();
  this.obsGynReportForm.controls.AmountTxt.disable();
  this.obsGynReportForm.controls.VagDcTxt.disable(); 
  this.obsGynReportForm.controls.ItchingTxt.disable();
  this.obsGynReportForm.controls.OorderTxt.disable();
  this.obsGynReportForm.controls.PcbTxt.disable();
  this.obsGynReportForm.controls.ImbTxt.disable();
  this.obsGynReportForm.controls.ContraceptionTxt.disable();
  this.obsGynReportForm.controls.InfertilityTxt.disable();
  this.obsGynReportForm.controls.StdTxt.disable();
  this.obsGynReportForm.controls.Location.disable();
  this.obsGynReportForm.controls.OthersTxt.disable();
  this.gastroElimination();
}
  initPhyExamForm(){
    this.generalPhyExamForm = this.formBuilder.group({
      "Dockey" : [""],
      "Description" : ["General"],
      "Modee" : [""],
      "Comments" :[""]
    });
    this.headNeckPhyExamForm = this.formBuilder.group({
      "Dockey" : [""],
      "Description" : ["Head and Neck"],
      "Modee" : [""],
      "Comments" :[""]
    });
    this.eyesPhyExamForm = this.formBuilder.group({
      "Dockey" : [""],
      "Description" : ["Eyes"],
      "Modee" : [""],
      "Comments" :[""]
    });
    this.entPhyExamForm = this.formBuilder.group({
      "Dockey" : [""],
      "Description" : ["ENT"],
      "Modee" : [""],
      "Comments" :[""]
    });
    this.respiratoryPhyExamForm = this.formBuilder.group({
      "Dockey" : [""],
      "Description" : ["Respiratory"],
      "Modee" : [""],
      "Comments" :[""]
    });
    this.cardioPhyExamForm = this.formBuilder.group({
      "Dockey" : [""],
      "Description" : ["Cardiovascular"],
      "Modee" : [""],
      "Comments" :[""]
    });
    this.haemaPhyExamForm = this.formBuilder.group({
      "Dockey" : [""],
      "Description" : ["Haematology"],
      "Modee" : [""],
      "Comments" :[""]
    });
    this.gastroPhyExamForm = this.formBuilder.group({
      "Dockey" : [""],
      "Description" : ["Gastrointestinal"],
      "Modee" : [""],
      "Comments" :[""]
    });
    this.musculoPhyExamForm = this.formBuilder.group({
      "Dockey" : [""],
      "Description" : ["Musculoskeletal"],
      "Modee" : [""],
      "Comments" :[""]
    });
    this.skinPhyExamForm = this.formBuilder.group({
      "Dockey" : [""],
      "Description" : ["Skin"],
      "Modee" : [""],
      "Comments" :[""]
    });
    this.neuroPhyExamForm = this.formBuilder.group({
      "Dockey" : [""],
      "Description" : ["Neurologic"],
      "Modee" : [""],
      "Comments" :[""]
    });
    this.genitPhyExamForm = this.formBuilder.group({
      "Dockey" : [""],
      "Description" : ["Genitourinary"],
      "Modee" : [""],
      "Comments" :[""]
    });
    this.breastPhyExamForm = this.formBuilder.group({
      "Dockey" : [""],
      "Description" : ["Breast"],
      "Modee" : [""],
      "Comments" :[""]
    })
  } 
  getObsGynData() {
    const json = {
      Einri:this.storageService.einri,
      Falnr:this.storageService.falnr
    }
    this.admissionService.getObsGynData(json).subscribe(
      (patientResult: any) => {
        this.gynAllDetails = patientResult?.results[0];
        this.toAllergyArr =  patientResult?.results[0].TOALLERGIES?.results;
        this.toVitalsArr =  patientResult?.results[0].TOVITALSIGNS?.results;
        this.toDiagnosisArr =  patientResult?.results[0].TODIAGNOSES?.results;
        this.toPhyExamArr =  patientResult?.results[0].TOPHYEXAM?.results;
        this.obsGynReportForm.patchValue(patientResult?.results[0]);
        this.obsGynReportForm.patchValue({
          Dockey:patientResult?.results[0]?.Dockey,
          Ddate:this.getDate(patientResult?.results[0]?.Ddate),
          Dtime:this.getTime(patientResult?.results[0]?.Dtime),
        })
          for (let element in this.gynAllDetails) {
            this.handleCheckboxOfGynHist(element);
            if(!this.obsGynReportForm.controls.CannotBeAssessed.value){
              this.handleCheckboxOfRespiratory();
              this.handleCheckboxOfPeripheral();
              this.handleCheckboxOfUrinary();
              this.handleCheckboxOfGastro();
              this.gastroElimination();
            }else{
              this.handleCheckboxCannotBeAccess();
            }
            
            this.handleCheckboxDiagnosis();
            this.handleCheckboxVitals();
            
            
          }
          var soiArr = ['Patient','Rrelative','Others']
          var papsmearArr = ['notdone','positive','negative']
         for (let index = 0; index < soiArr.length; index++) {
          this.handleCheckboxOfSourceOfInfo(soiArr[index]);
         }
         for (let index = 0; index < papsmearArr.length; index++) {
          this.handleCheckboxOfPapSmear(papsmearArr[index]);
         }
         this.setValuesForPhyExam();
      },
      (_error: any) => {}
    );
  } 
  async createObsGynDoc(isrelease:boolean){
    let createJson = this.obsGynReportForm.value;

    if (createJson["Dockey"] === null || createJson["Dockey"] === undefined || createJson["Dockey"] === "") {
      if (isrelease) {
        createJson['DocStatus'] = '4';
      } else {
        createJson['DocStatus'] = '1';
      }
    } else {

      if (this.admissionService.isCloneObsGynDoc && isrelease) {
        createJson['DocStatus'] = '5';
      } else if (this.admissionService.isCloneObsGynDoc && !isrelease) {
        createJson['DocStatus'] = '3';
      }
    }
    let createtime = '';
    if (createJson.Ddate != '') {
      createJson.Ddate = `${new DatePipe('en-US').transform(
        createJson.Ddate,
        'yyyy-MM-dd'
      )}T00:00:00`;
    }
   if (createJson.Dtime != '') {
    createtime = createJson.Dtime.split(':');
    createJson.Dtime = 'PT'+createtime[0] + 'H' + createtime[1] + 'M' + '00S';
   }
   createJson['TOALLERGIES'] = this.toAllergyArr;
   createJson['TOVITALSIGNS'] = this.toVitalsArr;
   createJson['TODIAGNOSES'] = this.toDiagnosisArr;
   createJson['TOPHYEXAM'] = this.toPhyExamResponse();
   await this.admissionService.createObsGyn(createJson).subscribe(()=>{
      if(this.soapFormEvent == 'saveClose' || this.soapFormEvent == 'release') { 
        this.admissionService.cancelAllForm();
        this.admissionService.selectedCurrentDocDetails = '';
        this.realodEducationList.next(true);
      }
      this.admissionService.clearSoapEvent.next(true);
      this.admissionService.isEditObsGynDoc = false; 
      this.admissionService.isCloneObsGynDoc = false;
    }, (err) => {
      this.admissionService.isEditObsGynDoc = false; 
      this.admissionService.isCloneObsGynDoc = false;
      this.admissionService.clearSoapEvent.next(true);
      const errorMsg = err?.error?.error?.message?.value || 'Unknown error';
      this.sharedService.waringSwallModel(`${errorMsg}`);
    })
  
  }
  async updateObsGynDoc(){
    let updateJson = this.obsGynReportForm.value;
    let createtime = '';
    if (updateJson.Ddate != '') {
      updateJson.Ddate = `${new DatePipe('en-US').transform(
        updateJson.Ddate,
        'yyyy-MM-dd'
      )}T00:00:00`;
    }
   if (updateJson.Dtime != '') {
    createtime = updateJson.Dtime.split(':');
    updateJson.Dtime = 'PT'+createtime[0] + 'H' + createtime[1] + 'M' + '00S';
   }
    updateJson['DocStatus'] = '1';
    updateJson['TOALLERGIES'] = this.toAllergyArr;
    updateJson['TOVITALSIGNS'] = this.toVitalsArr;
    updateJson['TOPHYEXAM'] = this.toPhyExamResponse();
    updateJson['TODIAGNOSES'] = this.toDiagnosisArr;
    await this.admissionService.updateObsGynDoc(updateJson).subscribe(()=>{
      if(this.soapFormEvent == 'saveClose' || this.soapFormEvent == 'release') { 
        this.admissionService.cancelAllForm();
        this.admissionService.selectedCurrentDocDetails = '';
        this.realodEducationList.next(true);
      }
      this.admissionService.clearSoapEvent.next(true);
      this.admissionService.isEditObsGynDoc = false; 
      this.admissionService.isCloneObsGynDoc = false;
    }, (err) => {
      this.admissionService.isEditObsGynDoc = false; 
      this.admissionService.isCloneObsGynDoc = false;
      this.admissionService.clearSoapEvent.next(true);
      const errorMsg = err?.error?.error?.message?.value || 'Unknown error';
      this.sharedService.waringSwallModel(`${errorMsg}`);
    })
  }

  async releaseObsGynDoc(){
   
    let updateJson = this.obsGynReportForm.value;
    let createtime = '';
    updateJson['DocStatus'] = '2';
    if (updateJson.Ddate != '') {
    updateJson['Ddate'] = `${new DatePipe('en-US').transform(
      updateJson.Ddate,
      'yyyy-MM-dd'
    )}T00:00:00`;
    }
    if (updateJson.Dtime != '') {
      createtime = updateJson.Dtime.split(':');
      updateJson.Dtime = 'PT'+createtime[0] + 'H' + createtime[1] + 'M' + '00S';
     } 
     updateJson['TOALLERGIES'] = this.toAllergyArr;
    updateJson['TOVITALSIGNS'] = this.toVitalsArr;
    updateJson['TOPHYEXAM'] = this.obsGynReportForm.value.TOPHYEXAM.results;
    updateJson['TODIAGNOSES'] = this.toDiagnosisArr;
    this.admissionService.releaseObsGynDoc(updateJson).subscribe(()=>{
    this.admissionService.cancelAllForm();
    this.admissionService.selectedCurrentDocDetails = '';
    this.admissionService.clearSoapEvent.next(true);
    this.realodEducationList.next(true);
    })
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
  toPhyExamResponse(){
    //this.toPhyExamArr = [];
    let sendPhyExamArr = [];
    if (this.generalPhyExamForm.value.Modee != '') {
      sendPhyExamArr.push(this.generalPhyExamForm.value);
    }
    if (this.headNeckPhyExamForm.value.Modee != '') {
      sendPhyExamArr.push(this.headNeckPhyExamForm.value);
    }
    if (this.eyesPhyExamForm.value.Modee != '') {
      sendPhyExamArr.push(this.eyesPhyExamForm.value);
    }
    if (this.entPhyExamForm.value.Modee != '') {
      sendPhyExamArr.push(this.entPhyExamForm.value);
    }
    if (this.respiratoryPhyExamForm.value.Modee != '') {
      sendPhyExamArr.push(this.respiratoryPhyExamForm.value);
    }
    if (this.cardioPhyExamForm.value.Modee != '') {
      sendPhyExamArr.push(this.cardioPhyExamForm.value);
    }
    if (this.haemaPhyExamForm.value.Modee != '') {
      sendPhyExamArr.push(this.haemaPhyExamForm.value);
    }
    if (this.gastroPhyExamForm.value.Modee != '') {
      sendPhyExamArr.push(this.gastroPhyExamForm.value);
    }
    if (this.musculoPhyExamForm.value.Modee != '') {
      sendPhyExamArr.push(this.musculoPhyExamForm.value);
    }
    if (this.skinPhyExamForm.value.Modee != '') {
      sendPhyExamArr.push(this.skinPhyExamForm.value);
    }
    if (this.neuroPhyExamForm.value.Modee != '') {
      sendPhyExamArr.push(this.neuroPhyExamForm.value);
    }
    if (this.genitPhyExamForm.value.Modee != '') {
      sendPhyExamArr.push(this.genitPhyExamForm.value);
    }
    if (this.breastPhyExamForm.value.Modee != '') {
      sendPhyExamArr.push(this.breastPhyExamForm.value);
    }
    return sendPhyExamArr;
  }
  handleCheckboxOfRespiratory(){
    if (this.obsGynReportForm.controls.RNoReportedAbnorm.value) {
      this.obsGynReportForm.controls.RShortnessBreath.disable();
      this.obsGynReportForm.controls.RCough.disable();
      this.obsGynReportForm.controls.RWheezing.disable();
      this.obsGynReportForm.controls.RCoughingBlood.disable();
      this.obsGynReportForm.controls.RProductionPhlegm.disable();
      this.obsGynReportForm.controls.RChestPain.disable();
      this.obsGynReportForm.controls.RFever.disable();
      this.obsGynReportForm.controls.RNightSweats.disable();
      this.obsGynReportForm.controls.RBlueFingersToes.disable();
      this.obsGynReportForm.controls.RSwellingHandsFeet.disable();
      this.obsGynReportForm.controls.RBronchitisEmphysema.disable();
      this.obsGynReportForm.controls.RHeartMurmur.disable();
      this.obsGynReportForm.controls.RHxHeartMedication.disable();
      this.obsGynReportForm.controls.RSkippingHeartBeats.disable();
      
      this.obsGynReportForm.controls.RShortnessBreath.setValue(false);
      this.obsGynReportForm.controls.RCough.setValue(false);
      this.obsGynReportForm.controls.RWheezing.setValue(false);
      this.obsGynReportForm.controls.RCoughingBlood.setValue(false);
      this.obsGynReportForm.controls.RProductionPhlegm.setValue(false);
      this.obsGynReportForm.controls.RChestPain.setValue(false);
      this.obsGynReportForm.controls.RFever.setValue(false);
      this.obsGynReportForm.controls.RNightSweats.setValue(false);
      this.obsGynReportForm.controls.RBlueFingersToes.setValue(false);
      this.obsGynReportForm.controls.RSwellingHandsFeet.setValue(false);
      this.obsGynReportForm.controls.RBronchitisEmphysema.setValue(false);
      this.obsGynReportForm.controls.RHeartMurmur.setValue(false);
      this.obsGynReportForm.controls.RHxHeartMedication.setValue(false);
      this.obsGynReportForm.controls.RSkippingHeartBeats.setValue(false);
    }else{
      this.obsGynReportForm.controls.RShortnessBreath.enable();
    this.obsGynReportForm.controls.RCough.enable();
    this.obsGynReportForm.controls.RWheezing.enable();
    this.obsGynReportForm.controls.RCoughingBlood.enable();
    this.obsGynReportForm.controls.RProductionPhlegm.enable();
    this.obsGynReportForm.controls.RChestPain.enable();
    this.obsGynReportForm.controls.RFever.enable();
    this.obsGynReportForm.controls.RNightSweats.enable();
    this.obsGynReportForm.controls.RBlueFingersToes.enable();
    this.obsGynReportForm.controls.RSwellingHandsFeet.enable();
    this.obsGynReportForm.controls.RBronchitisEmphysema.enable();
    this.obsGynReportForm.controls.RHeartMurmur.enable();
    this.obsGynReportForm.controls.RHxHeartMedication.enable();
    this.obsGynReportForm.controls.RSkippingHeartBeats.enable();

    // this.obsGynReportForm.controls.RShortnessBreath.setValue(false);
    //   this.obsGynReportForm.controls.RCough.setValue(false);
    //   this.obsGynReportForm.controls.RWheezing.setValue(false);
    //   this.obsGynReportForm.controls.RCoughingBlood.setValue(false);
    //   this.obsGynReportForm.controls.RProductionPhlegm.setValue(false);
    //   this.obsGynReportForm.controls.RChestPain.setValue(false);
    //   this.obsGynReportForm.controls.RFever.setValue(false);
    //   this.obsGynReportForm.controls.RNightSweats.setValue(false);
    //   this.obsGynReportForm.controls.RBlueFingersToes.setValue(false);
    //   this.obsGynReportForm.controls.RSwellingHandsFeet.setValue(false);
    //   this.obsGynReportForm.controls.RBronchitisEmphysema.setValue(false);
    //   this.obsGynReportForm.controls.RHeartMurmur.setValue(false);
    //   this.obsGynReportForm.controls.RHxHeartMedication.setValue(false);
    //   this.obsGynReportForm.controls.RSkippingHeartBeats.setValue(false);
    }
    

  }
  handleCheckboxOfUrinary(){
    if (this.obsGynReportForm.controls.UNoReportedAbnorm.value) {
      this.obsGynReportForm.controls.UDifficultyUrination.disable();
      this.obsGynReportForm.controls.UPainBurningUrination.disable();
      this.obsGynReportForm.controls.UFrequentUrinationNight.disable();
      this.obsGynReportForm.controls.UUrgentNeedUrinate.disable();
      this.obsGynReportForm.controls.UIncontinenceUrine.disable();
      this.obsGynReportForm.controls.UDribbling.disable();
      this.obsGynReportForm.controls.UDecreasedUrineStream.disable();
      this.obsGynReportForm.controls.UBloodUrine.disable();
      this.obsGynReportForm.controls.UUtiStonesProstate.disable();
      
      this.obsGynReportForm.controls.UDifficultyUrination.setValue(false);
      this.obsGynReportForm.controls.UPainBurningUrination.setValue(false);
      this.obsGynReportForm.controls.UPainBurningUrination.setValue(false);
      this.obsGynReportForm.controls.UFrequentUrinationNight.setValue(false);
      this.obsGynReportForm.controls.UUrgentNeedUrinate.setValue(false);
      this.obsGynReportForm.controls.UIncontinenceUrine.setValue(false);
      this.obsGynReportForm.controls.UDribbling.setValue(false);
      this.obsGynReportForm.controls.UDecreasedUrineStream.setValue(false);
      this.obsGynReportForm.controls.UBloodUrine.setValue(false);
      this.obsGynReportForm.controls.UUtiStonesProstate.setValue(false);
     
    }else{
      this.obsGynReportForm.controls.UDifficultyUrination.enable();
      this.obsGynReportForm.controls.UPainBurningUrination.enable();
      this.obsGynReportForm.controls.UFrequentUrinationNight.enable();
      this.obsGynReportForm.controls.UUrgentNeedUrinate.enable();
      this.obsGynReportForm.controls.UIncontinenceUrine.enable();
      this.obsGynReportForm.controls.UDribbling.enable();
      this.obsGynReportForm.controls.UDecreasedUrineStream.enable();
      this.obsGynReportForm.controls.UBloodUrine.enable();
      this.obsGynReportForm.controls.UUtiStonesProstate.enable();
      
      // this.obsGynReportForm.controls.UDifficultyUrination.setValue(false);
      // this.obsGynReportForm.controls.UPainBurningUrination.setValue(false);
      // this.obsGynReportForm.controls.UPainBurningUrination.setValue(false);
      // this.obsGynReportForm.controls.UFrequentUrinationNight.setValue(false);
      // this.obsGynReportForm.controls.UUrgentNeedUrinate.setValue(false);
      // this.obsGynReportForm.controls.UIncontinenceUrine.setValue(false);
      // this.obsGynReportForm.controls.UDribbling.setValue(false);
      // this.obsGynReportForm.controls.UDecreasedUrineStream.setValue(false);
      // this.obsGynReportForm.controls.UBloodUrine.setValue(false);
      // this.obsGynReportForm.controls.UUtiStonesProstate.setValue(false);
    }
    

  }
  handleCheckboxOfGastro(){
    if (this.obsGynReportForm.controls.GNoReportedAbnorm.value) {
      this.obsGynReportForm.controls.GChangeAppetiteWeight.disable();
      this.obsGynReportForm.controls.GProblemsSwallowing.disable();
      this.obsGynReportForm.controls.GNausea.disable();
      this.obsGynReportForm.controls.GVomiting.disable();
      this.obsGynReportForm.controls.GVomitingBlood.disable();
      this.obsGynReportForm.controls.GConstipation.disable();
      this.obsGynReportForm.controls.GDiarrhea.disable();
      this.obsGynReportForm.controls.GChangeBowelHabits.disable();
      this.obsGynReportForm.controls.GAbdominalPain.disable();
      this.obsGynReportForm.controls.GExcessiveBelching.disable();
      this.obsGynReportForm.controls.GExcessiveFlatus.disable();
      this.obsGynReportForm.controls.GYellowColourSkin.disable();
      this.obsGynReportForm.controls.GFoodIntolerance.disable();
      this.obsGynReportForm.controls.GRectalBleedingHemo.disable();
      this.obsGynReportForm.controls.GChangeAppetiteWeight.setValue(false);
      this.obsGynReportForm.controls.GProblemsSwallowing.setValue(false);
      this.obsGynReportForm.controls.GNausea.setValue(false);
      this.obsGynReportForm.controls.GVomiting.setValue(false);
      this.obsGynReportForm.controls.GVomitingBlood.setValue(false);
      this.obsGynReportForm.controls.GConstipation.setValue(false);
      this.obsGynReportForm.controls.GDiarrhea.setValue(false);
      this.obsGynReportForm.controls.GChangeBowelHabits.setValue(false);
      this.obsGynReportForm.controls.GAbdominalPain.setValue(false);
      this.obsGynReportForm.controls.GExcessiveBelching.setValue(false);
      this.obsGynReportForm.controls.GExcessiveFlatus.setValue(false);
      this.obsGynReportForm.controls.GYellowColourSkin.setValue(false);
      this.obsGynReportForm.controls.GFoodIntolerance.setValue(false);
      this.obsGynReportForm.controls.GRectalBleedingHemo.setValue(false);
    }else{
      this.obsGynReportForm.controls.GChangeAppetiteWeight.enable();
      this.obsGynReportForm.controls.GProblemsSwallowing.enable();
      this.obsGynReportForm.controls.GNausea.enable();
      this.obsGynReportForm.controls.GVomiting.enable();
      this.obsGynReportForm.controls.GVomitingBlood.enable();
      this.obsGynReportForm.controls.GConstipation.enable();
      this.obsGynReportForm.controls.GDiarrhea.enable();
      this.obsGynReportForm.controls.GChangeBowelHabits.enable();
      this.obsGynReportForm.controls.GAbdominalPain.enable();
      this.obsGynReportForm.controls.GExcessiveBelching.enable();
      this.obsGynReportForm.controls.GExcessiveFlatus.enable();
      this.obsGynReportForm.controls.GYellowColourSkin.enable();
      this.obsGynReportForm.controls.GFoodIntolerance.enable();
      this.obsGynReportForm.controls.GRectalBleedingHemo.enable();

      // this.obsGynReportForm.controls.GChangeAppetiteWeight.setValue(false);
      // this.obsGynReportForm.controls.GProblemsSwallowing.setValue(false);
      // this.obsGynReportForm.controls.GNausea.setValue(false);
      // this.obsGynReportForm.controls.GVomiting.setValue(false);
      // this.obsGynReportForm.controls.GVomitingBlood.setValue(false);
      // this.obsGynReportForm.controls.GConstipation.setValue(false);
      // this.obsGynReportForm.controls.GDiarrhea.setValue(false);
      // this.obsGynReportForm.controls.GChangeBowelHabits.setValue(false);
      // this.obsGynReportForm.controls.GAbdominalPain.setValue(false);
      // this.obsGynReportForm.controls.GExcessiveBelching.setValue(false);
      // this.obsGynReportForm.controls.GExcessiveFlatus.setValue(false);
      // this.obsGynReportForm.controls.GYellowColourSkin.setValue(false);
      // this.obsGynReportForm.controls.GFoodIntolerance.setValue(false);
      // this.obsGynReportForm.controls.GRectalBleedingHemo.setValue(false);
    }
    

  }
  handleCheckboxOfPeripheral(){
    if (this.obsGynReportForm.controls.PNoReportedAbnorm.value) {
      this.obsGynReportForm.controls.PLegCramps.disable();
      this.obsGynReportForm.controls.PVaricoseVeins.disable();
      this.obsGynReportForm.controls.PClotsVeins.disable();
      
      this.obsGynReportForm.controls.PLegCramps.setValue(false);
      this.obsGynReportForm.controls.PVaricoseVeins.setValue(false);
      this.obsGynReportForm.controls.PClotsVeins.setValue(false);
     
     
    }else{
      this.obsGynReportForm.controls.PLegCramps.enable();
      this.obsGynReportForm.controls.PVaricoseVeins.enable();
      this.obsGynReportForm.controls.PClotsVeins.enable();
      
      // this.obsGynReportForm.controls.PLegCramps.setValue(false);
      // this.obsGynReportForm.controls.PVaricoseVeins.setValue(false);
      // this.obsGynReportForm.controls.PClotsVeins.setValue(false);
    }
    

  }
  gastroElimination(){
    if (this.obsGynReportForm.controls.GToiletTrained.value) {
      this.obsGynReportForm.controls.GTfreq.enable();
    }else{
      this.obsGynReportForm.controls.GTfreq.disable();
      this.obsGynReportForm.controls.GTfreq.setValue('');
    }
    if (this.obsGynReportForm.controls.GUsesDiaper.value) {
      this.obsGynReportForm.controls.GUfreq.enable();
    }else{
      this.obsGynReportForm.controls.GUfreq.disable();
      this.obsGynReportForm.controls.GUfreq.setValue('');
    }
  }

  handleCheckboxOfSourceOfInfo(label){
    if (label == 'Patient') {
      if (this.obsGynReportForm.controls.Patient.value) {
        this.obsGynReportForm.controls.Rrelative.setValue(false);
      this.obsGynReportForm.controls.Others.setValue(false);
      this.obsGynReportForm.controls.OthersTxt.setValue('');
      this.obsGynReportForm.controls.OthersTxt.disable();
      }else{
        this.obsGynReportForm.controls.OthersTxt.disable();
      }
    }else if(label == 'Rrelative'){
      if (this.obsGynReportForm.controls.Rrelative.value) {
        this.obsGynReportForm.controls.Patient.setValue(false);
      this.obsGynReportForm.controls.Others.setValue(false);
      this.obsGynReportForm.controls.OthersTxt.setValue('');
      this.obsGynReportForm.controls.OthersTxt.disable();
      }else{
        this.obsGynReportForm.controls.OthersTxt.disable();
      }
      
    }else if(label == 'Others'){
      if (this.obsGynReportForm.controls.Others.value) {
        this.obsGynReportForm.controls.Patient.setValue(false);
      this.obsGynReportForm.controls.Rrelative.setValue(false);
      //this.obsGynReportForm.controls.OthersTxt.setValue('');
      this.obsGynReportForm.controls.OthersTxt.enable();
      }
      
    }
  }
  handleCheckboxOfPapSmear(label){
    if (label == 'notdone') {
      if (this.obsGynReportForm.controls.NotDone.value) {
        this.obsGynReportForm.controls.Positive.setValue(false);
      this.obsGynReportForm.controls.Negative.setValue(false);
      this.obsGynReportForm.controls.Location.setValue('');
      }
    } if(label == 'positive'){
      if (this.obsGynReportForm.controls.Positive.value) {
        this.obsGynReportForm.controls.NotDone.setValue(false);
      this.obsGynReportForm.controls.Negative.setValue(false);
      }
      
    } if(label == 'negative'){
      if (this.obsGynReportForm.controls.Negative.value) {
        this.obsGynReportForm.controls.NotDone.setValue(false);
      this.obsGynReportForm.controls.Positive.setValue(false);
      }
      
    }
    if (this.obsGynReportForm.controls.Negative.value || this.obsGynReportForm.controls.Positive.value) {
      this.obsGynReportForm.controls.Location.enable();
    }else{
      this.obsGynReportForm.controls.Location.disable();
    }
  }
  handleCheckboxOfGynHist(label){
   if (label == 'Menarche') {
    if (this.obsGynReportForm.controls.Menarche.value) {
      this.obsGynReportForm.controls.MenarcheTxt.enable();
    }else{
      this.obsGynReportForm.controls.MenarcheTxt.disable();
    }
   }
   if (label == 'Cycle') {
    if (this.obsGynReportForm.controls.Cycle.value) {
      this.obsGynReportForm.controls.CycleTxt.enable();
    }else{
      this.obsGynReportForm.controls.CycleTxt.disable();
    }
   }
   if (label == 'Duration') {
    if (this.obsGynReportForm.controls.Duration.value) {
      this.obsGynReportForm.controls.DurationTxt.enable();
    }else{
      this.obsGynReportForm.controls.DurationTxt.disable();
    }
   }
   if (label == 'Amount') {
    if (this.obsGynReportForm.controls.Amount.value) {
      this.obsGynReportForm.controls.AmountTxt.enable();
    }else{
      this.obsGynReportForm.controls.AmountTxt.disable();
    }
   }
   if (label == 'VagDc') {
    if (this.obsGynReportForm.controls.VagDc.value) {
      this.obsGynReportForm.controls.VagDcTxt.enable();
    }else{
      this.obsGynReportForm.controls.VagDcTxt.disable();
    }
   }
   if (label == 'Itching') {
    if (this.obsGynReportForm.controls.Itching.value) {
      this.obsGynReportForm.controls.ItchingTxt.enable();
    }else{
      this.obsGynReportForm.controls.ItchingTxt.disable();
    }
   }
   if (label == 'Oorder') {
    if (this.obsGynReportForm.controls.Oorder.value) {
      this.obsGynReportForm.controls.OorderTxt.enable();
    }else{
      this.obsGynReportForm.controls.OorderTxt.disable();
    }
   }
   if (label == 'Pcb') {
    if (this.obsGynReportForm.controls.Pcb.value) {
      this.obsGynReportForm.controls.PcbTxt.enable();
    }else{
      this.obsGynReportForm.controls.PcbTxt.disable();
    }
   }
   if (label == 'Imb') {
    if (this.obsGynReportForm.controls.Imb.value) {
      this.obsGynReportForm.controls.ImbTxt.enable();
    }else{
      this.obsGynReportForm.controls.ImbTxt.disable();
    }
   }
   if (label == 'Contraception') {
    if (this.obsGynReportForm.controls.Contraception.value) {
      this.obsGynReportForm.controls.ContraceptionTxt.enable();
    }else{
      this.obsGynReportForm.controls.ContraceptionTxt.disable();
    }
   }
   if (label == 'Infertility') {
    if (this.obsGynReportForm.controls.Infertility.value) {
      this.obsGynReportForm.controls.InfertilityTxt.enable();
    }else{
      this.obsGynReportForm.controls.InfertilityTxt.disable();
    }
   }
   if (label == 'Std') {
    if (this.obsGynReportForm.controls.Std.value) {
      this.obsGynReportForm.controls.StdTxt.enable();
    }else{
      this.obsGynReportForm.controls.StdTxt.disable();
    }
   }
  }
  importAllergyData(data){
    data.forEach(el => {
      this.toAllergyArr = this.toAllergyArr.concat({ 
        "Dockey" : "",
        "Agroup" : el.AllergenGrp,
        "Description" : el.Allergen}); 
    });
    this.duplicates = [];
    this.duplicates = this.findDuplicatesAllergy();
    this.toAllergyArr = this.toAllergyArr.filter((value, index, self) =>
    index === self.findIndex((t) => (
      t.Description === value.Description
    ))
  )
  if(this.duplicates.length>0){
    this.errorMsgForDuplicatesAllergy();
    }
  }
  findDuplicatesAllergy() {
    let tempArr = []
    const lookup = this.toAllergyArr.reduce((a, e) => {
      a[e.Description] = ++a[e.Description] || 0;
      return a;
    }, {});
  tempArr = this.toAllergyArr.filter(e => lookup[e.Description]);
 return tempArr.filter((value, index, self) =>
    index === self.findIndex((t) => (
      t.Description === value.Description
    ))
  )
    
 }
 errorMsgForDuplicatesAllergy(){
  let codeArr = [];
  this.duplicates.forEach(element => {
    codeArr.push(element.Description);
  });
  
  Swal.fire({
    text: `${codeArr.toString()} is/are already Imported `,
    icon: 'warning',
    confirmButtonText: 'Ok',
    customClass: 'myalertpopup'
  })
 }
  deleteFromTable(item,index){
  this.toAllergyArr.splice(index,1);
  console.log(this.toAllergyArr);
  
  }
  importVitalsData(data){
    data.forEach(el => {
      this.toVitalsArr = this.toVitalsArr.concat({ 
        "Dockey" : "",
        "Vdescription" : el.Name,
        "MeasuredValue" : el.Value,
        "NormalRange" : el.NormalRange,
        "DateTime" : `${new DatePipe('en-US').transform(
          this.getDate(el.Date),
          'dd.MM.yyyy'
        )}/${this.getTime(el.Time)}`,
        "Vunit" : el.UnitTxt
      }); 
    });
  }
  deleteVitalsFromTable(item,index){
  this.toVitalsArr.splice(index,1);
  } 
  importDiagnosisData(data){
    data.forEach(el => {
      this.toDiagnosisArr = this.toDiagnosisArr.concat({ 
        "Dockey" : "",
        "DCode" : el.DiagKey1,
        "DDescription" : el.DiagShorttext,
        "DRemarks" : el.DiagText,
        "DAdmission" : el.AdmissionDia,
        "DDischarge" : el.DischargeDia,
        "DWorking" : el.WorkDiagInd,
        "DPreoperative" : el.PreopDiagInd,
        "DSurgery" : el.SurgeryDia,
        "DDeath" : el.CauseOfDeath,
        "DDepartment" : el.DeptMainDia,
        "DHospital" : el.HospMainDia
      }); 
    });
    this.duplicates = [];
    this.duplicates = this.findDuplicatesDiagnosis();
    this.toDiagnosisArr = this.toDiagnosisArr.filter((value, index, self) =>
    index === self.findIndex((t) => (
      t.DCode === value.DCode
    ))
  )
if(this.duplicates.length>0){
this.errorMsgForDuplicatesDiagnosis();
}
 
  }
  findDuplicatesDiagnosis() {
    let tempArr = []
    const lookup = this.toDiagnosisArr.reduce((a, e) => {
      a[e.DCode] = ++a[e.DCode] || 0;
      return a;
    }, {});
  tempArr = this.toDiagnosisArr.filter(e => lookup[e.DCode]);
 return tempArr.filter((value, index, self) =>
    index === self.findIndex((t) => (
      t.DCode === value.DCode
    ))
  )
    
 }
 errorMsgForDuplicatesDiagnosis(){
  let codeArr = [];
  this.duplicates.forEach(element => {
    codeArr.push(element.DCode);
  });
  
  Swal.fire({
    text: `${codeArr.toString()} is/are already Imported `,
    icon: 'warning',
    confirmButtonText: 'Ok',
    customClass: 'myalertpopup'
  })
 }
  deleteDiagnosisFromTable(item,index){
  this.toDiagnosisArr.splice(index,1);
  } 
  // get tophyexam
  setValuesForPhyExam(){
    this.toPhyExamArr.forEach(element => {
      if (element.Description == 'General') {
        this.generalPhyExamForm.controls.Modee.setValue(element.Modee);
        this.generalPhyExamForm.controls.Comments.setValue(element.Comments);
      }
      if (element.Description == 'Head and Neck') {
        this.headNeckPhyExamForm.controls.Modee.setValue(element.Modee);
        this.headNeckPhyExamForm.controls.Comments.setValue(element.Comments);
      }
      if (element.Description == 'Eyes') {
        this.eyesPhyExamForm.controls.Modee.setValue(element.Modee);
        this.eyesPhyExamForm.controls.Comments.setValue(element.Comments);
      }
      if (element.Description == 'ENT') {
        this.entPhyExamForm.controls.Modee.setValue(element.Modee);
        this.entPhyExamForm.controls.Comments.setValue(element.Comments);
      }
      if (element.Description == 'Respiratory') {
        this.respiratoryPhyExamForm.controls.Modee.setValue(element.Modee);
        this.respiratoryPhyExamForm.controls.Comments.setValue(element.Comments);
      }
      if (element.Description == 'Cardiovascular') {
        this.cardioPhyExamForm.controls.Modee.setValue(element.Modee);
        this.cardioPhyExamForm.controls.Comments.setValue(element.Comments);
      }
      if (element.Description == 'Haematology') {
        this.haemaPhyExamForm.controls.Modee.setValue(element.Modee);
        this.haemaPhyExamForm.controls.Comments.setValue(element.Comments);
      }
      if (element.Description == 'Gastrointestinal') {
        this.gastroPhyExamForm.controls.Modee.setValue(element.Modee);
        this.gastroPhyExamForm.controls.Comments.setValue(element.Comments);
      }
      if (element.Description == 'Musculoskeletal') {
        this.musculoPhyExamForm.controls.Modee.setValue(element.Modee);
        this.musculoPhyExamForm.controls.Comments.setValue(element.Comments);
      }
      if (element.Description == 'Skin') {
        this.skinPhyExamForm.controls.Modee.setValue(element.Modee);
        this.skinPhyExamForm.controls.Comments.setValue(element.Comments);
      }
      if (element.Description == 'Neurologic') {
        this.neuroPhyExamForm.controls.Modee.setValue(element.Modee);
        this.neuroPhyExamForm.controls.Comments.setValue(element.Comments);
      }
      if (element.Description == 'Genitourinary') {
        this.genitPhyExamForm.controls.Modee.setValue(element.Modee);
        this.genitPhyExamForm.controls.Comments.setValue(element.Comments);
      }
      if (element.Description == 'Breast') {
        this.breastPhyExamForm.controls.Modee.setValue(element.Modee);
        this.breastPhyExamForm.controls.Comments.setValue(element.Comments);
      }
    
    });
  }
  handleCheckboxDiagnosis(){
    if (this.obsGynReportForm.controls.NoDiagnoses.value) {
      this.enableCreateDiagnosis = true;
    }else{
      this.enableCreateDiagnosis = false;
    }
  }
  handleCheckboxVitals(){
    if (this.obsGynReportForm.controls.NoVitalSigns.value) {
      this.enableCreateVitals = true;
    }else{
      this.enableCreateVitals = false;
    }
  }
  handleCheckboxCannotBeAccess(){
    if (this.obsGynReportForm.controls.CannotBeAssessed.value) {
      this.obsGynReportForm.controls.RShortnessBreath.disable();
      this.obsGynReportForm.controls.RCough.disable();
      this.obsGynReportForm.controls.RWheezing.disable();
      this.obsGynReportForm.controls.RCoughingBlood.disable();
      this.obsGynReportForm.controls.RProductionPhlegm.disable();
      this.obsGynReportForm.controls.RChestPain.disable();
      this.obsGynReportForm.controls.RFever.disable();
      this.obsGynReportForm.controls.RNightSweats.disable();
      this.obsGynReportForm.controls.RBlueFingersToes.disable();
      this.obsGynReportForm.controls.RSwellingHandsFeet.disable();
      this.obsGynReportForm.controls.RBronchitisEmphysema.disable();
      this.obsGynReportForm.controls.RHeartMurmur.disable();
      this.obsGynReportForm.controls.RHxHeartMedication.disable();
      this.obsGynReportForm.controls.RSkippingHeartBeats.disable();
      this.obsGynReportForm.controls.RComments.disable();
      this.obsGynReportForm.controls.RNoReportedAbnorm.disable();
      this.obsGynReportForm.controls.RShortnessBreath.setValue(false);
      this.obsGynReportForm.controls.RCough.setValue(false);
      this.obsGynReportForm.controls.RWheezing.setValue(false);
      this.obsGynReportForm.controls.RCoughingBlood.setValue(false);
      this.obsGynReportForm.controls.RProductionPhlegm.setValue(false);
      this.obsGynReportForm.controls.RChestPain.setValue(false);
      this.obsGynReportForm.controls.RFever.setValue(false);
      this.obsGynReportForm.controls.RNightSweats.setValue(false);
      this.obsGynReportForm.controls.RBlueFingersToes.setValue(false);
      this.obsGynReportForm.controls.RSwellingHandsFeet.setValue(false);
      this.obsGynReportForm.controls.RBronchitisEmphysema.setValue(false);
      this.obsGynReportForm.controls.RHeartMurmur.setValue(false);
      this.obsGynReportForm.controls.RHxHeartMedication.setValue(false);
      this.obsGynReportForm.controls.RSkippingHeartBeats.setValue(false);
      this.obsGynReportForm.controls.RComments.setValue('');
      this.obsGynReportForm.controls.RNoReportedAbnorm.setValue(false);
      //urinary
      this.obsGynReportForm.controls.UDifficultyUrination.disable();
      this.obsGynReportForm.controls.UPainBurningUrination.disable();
      this.obsGynReportForm.controls.UFrequentUrinationNight.disable();
      this.obsGynReportForm.controls.UUrgentNeedUrinate.disable();
      this.obsGynReportForm.controls.UIncontinenceUrine.disable();
      this.obsGynReportForm.controls.UDribbling.disable();
      this.obsGynReportForm.controls.UDecreasedUrineStream.disable();
      this.obsGynReportForm.controls.UBloodUrine.disable();
      this.obsGynReportForm.controls.UUtiStonesProstate.disable();
      this.obsGynReportForm.controls.UComments.disable();
      this.obsGynReportForm.controls.UNoReportedAbnorm.disable();
      this.obsGynReportForm.controls.UDifficultyUrination.setValue(false);
      this.obsGynReportForm.controls.UPainBurningUrination.setValue(false);
      this.obsGynReportForm.controls.UPainBurningUrination.setValue(false);
      this.obsGynReportForm.controls.UFrequentUrinationNight.setValue(false);
      this.obsGynReportForm.controls.UUrgentNeedUrinate.setValue(false);
      this.obsGynReportForm.controls.UIncontinenceUrine.setValue(false);
      this.obsGynReportForm.controls.UDribbling.setValue(false);
      this.obsGynReportForm.controls.UDecreasedUrineStream.setValue(false);
      this.obsGynReportForm.controls.UBloodUrine.setValue(false);
      this.obsGynReportForm.controls.UUtiStonesProstate.setValue(false);
      this.obsGynReportForm.controls.UComments.setValue('');
      this.obsGynReportForm.controls.UNoReportedAbnorm.setValue(false);
      //  gastro
      this.obsGynReportForm.controls.GChangeAppetiteWeight.disable();
      this.obsGynReportForm.controls.GProblemsSwallowing.disable();
      this.obsGynReportForm.controls.GNausea.disable();
      this.obsGynReportForm.controls.GVomiting.disable();
      this.obsGynReportForm.controls.GVomitingBlood.disable();
      this.obsGynReportForm.controls.GConstipation.disable();
      this.obsGynReportForm.controls.GDiarrhea.disable();
      this.obsGynReportForm.controls.GChangeBowelHabits.disable();
      this.obsGynReportForm.controls.GAbdominalPain.disable();
      this.obsGynReportForm.controls.GExcessiveBelching.disable();
      this.obsGynReportForm.controls.GExcessiveFlatus.disable();
      this.obsGynReportForm.controls.GYellowColourSkin.disable();
      this.obsGynReportForm.controls.GFoodIntolerance.disable();
      this.obsGynReportForm.controls.GRectalBleedingHemo.disable();
      this.obsGynReportForm.controls.GComments.disable();
      this.obsGynReportForm.controls.GNoReportedAbnorm.disable();
      this.obsGynReportForm.controls.GToiletTrained.disable();
      this.obsGynReportForm.controls.GUsesDiaper.disable();
      this.obsGynReportForm.controls.GTfreq.disable();
      this.obsGynReportForm.controls.GUfreq.disable();
      this.obsGynReportForm.controls.GChangeAppetiteWeight.setValue(false);
      this.obsGynReportForm.controls.GProblemsSwallowing.setValue(false);
      this.obsGynReportForm.controls.GNausea.setValue(false);
      this.obsGynReportForm.controls.GVomiting.setValue(false);
      this.obsGynReportForm.controls.GVomitingBlood.setValue(false);
      this.obsGynReportForm.controls.GConstipation.setValue(false);
      this.obsGynReportForm.controls.GDiarrhea.setValue(false);
      this.obsGynReportForm.controls.GChangeBowelHabits.setValue(false);
      this.obsGynReportForm.controls.GAbdominalPain.setValue(false);
      this.obsGynReportForm.controls.GExcessiveBelching.setValue(false);
      this.obsGynReportForm.controls.GExcessiveFlatus.setValue(false);
      this.obsGynReportForm.controls.GYellowColourSkin.setValue(false);
      this.obsGynReportForm.controls.GFoodIntolerance.setValue(false);
      this.obsGynReportForm.controls.GRectalBleedingHemo.setValue(false);
      this.obsGynReportForm.controls.GComments.setValue('');
      this.obsGynReportForm.controls.GNoReportedAbnorm.setValue(false);
      this.obsGynReportForm.controls.GTfreq.setValue('');
      this.obsGynReportForm.controls.GToiletTrained.setValue(false);
      this.obsGynReportForm.controls.GUfreq.setValue('');
      this.obsGynReportForm.controls.GUsesDiaper.setValue(false);
      // peripheral
      this.obsGynReportForm.controls.PLegCramps.disable();
      this.obsGynReportForm.controls.PVaricoseVeins.disable();
      this.obsGynReportForm.controls.PClotsVeins.disable();
      this.obsGynReportForm.controls.PComments.disable();
      this.obsGynReportForm.controls.PNoReportedAbnorm.disable();
      this.obsGynReportForm.controls.PLegCramps.setValue(false);
      this.obsGynReportForm.controls.PVaricoseVeins.setValue(false);
      this.obsGynReportForm.controls.PClotsVeins.setValue(false);
      this.obsGynReportForm.controls.PComments.setValue('');
      this.obsGynReportForm.controls.PNoReportedAbnorm.setValue(false);
    }else{
      this.obsGynReportForm.controls.RShortnessBreath.enable();
      this.obsGynReportForm.controls.RCough.enable();
      this.obsGynReportForm.controls.RWheezing.enable();
      this.obsGynReportForm.controls.RCoughingBlood.enable();
      this.obsGynReportForm.controls.RProductionPhlegm.enable();
      this.obsGynReportForm.controls.RChestPain.enable();
      this.obsGynReportForm.controls.RFever.enable();
      this.obsGynReportForm.controls.RNightSweats.enable();
      this.obsGynReportForm.controls.RBlueFingersToes.enable();
      this.obsGynReportForm.controls.RSwellingHandsFeet.enable();
      this.obsGynReportForm.controls.RBronchitisEmphysema.enable();
      this.obsGynReportForm.controls.RHeartMurmur.enable();
      this.obsGynReportForm.controls.RHxHeartMedication.enable();
      this.obsGynReportForm.controls.RSkippingHeartBeats.enable();
      this.obsGynReportForm.controls.RComments.enable();
      this.obsGynReportForm.controls.RNoReportedAbnorm.enable();
       //urinary
       this.obsGynReportForm.controls.UDifficultyUrination.enable();
       this.obsGynReportForm.controls.UPainBurningUrination.enable();
       this.obsGynReportForm.controls.UFrequentUrinationNight.enable();
       this.obsGynReportForm.controls.UUrgentNeedUrinate.enable();
       this.obsGynReportForm.controls.UIncontinenceUrine.enable();
       this.obsGynReportForm.controls.UDribbling.enable();
       this.obsGynReportForm.controls.UDecreasedUrineStream.enable();
       this.obsGynReportForm.controls.UBloodUrine.enable();
       this.obsGynReportForm.controls.UUtiStonesProstate.enable();
       this.obsGynReportForm.controls.UComments.enable();
       this.obsGynReportForm.controls.UNoReportedAbnorm.enable();
      //  gastro
      this.obsGynReportForm.controls.GChangeAppetiteWeight.enable();
      this.obsGynReportForm.controls.GProblemsSwallowing.enable();
      this.obsGynReportForm.controls.GNausea.enable();
      this.obsGynReportForm.controls.GVomiting.enable();
      this.obsGynReportForm.controls.GVomitingBlood.enable();
      this.obsGynReportForm.controls.GConstipation.enable();
      this.obsGynReportForm.controls.GDiarrhea.enable();
      this.obsGynReportForm.controls.GChangeBowelHabits.enable();
      this.obsGynReportForm.controls.GAbdominalPain.enable();
      this.obsGynReportForm.controls.GExcessiveBelching.enable();
      this.obsGynReportForm.controls.GExcessiveFlatus.enable();
      this.obsGynReportForm.controls.GYellowColourSkin.enable();
      this.obsGynReportForm.controls.GFoodIntolerance.enable();
      this.obsGynReportForm.controls.GRectalBleedingHemo.enable();
      this.obsGynReportForm.controls.GComments.enable();
      this.obsGynReportForm.controls.GNoReportedAbnorm.enable();
      this.obsGynReportForm.controls.GToiletTrained.enable();
      this.obsGynReportForm.controls.GUsesDiaper.enable();
      this.obsGynReportForm.controls.GTfreq.disable();
      this.obsGynReportForm.controls.GUfreq.disable();
      // peripheral
      this.obsGynReportForm.controls.PLegCramps.enable();
      this.obsGynReportForm.controls.PVaricoseVeins.enable();
      this.obsGynReportForm.controls.PClotsVeins.enable();
      this.obsGynReportForm.controls.PComments.enable();
      this.obsGynReportForm.controls.PNoReportedAbnorm.enable();
    }
  }

  openCommentBox(template: TemplateRef<any>,form){
    this.formName = form;
    const config: ModalOptions = {
      class: 'modal-dialog additional-info-temp',
    };
    this.modalRefForComment = this.modalService.show(template, config);
    this.fillCommentBox(this.formName);
  }
  fillCommentBox(form){
    this.formName = form;
    if (this.formName == 'generalPhyExamForm') {
      if (this.generalPhyExamForm.controls.Modee.value == '0') {
        if (this.generalPhyExamForm.controls.Comments.value == '') {
          this.longComment = 'No Distress, lying in bed, not jaundiced, not cyanosed,  alert,conscious, oriented to person, place & time.'
          this.generalPhyExamForm.controls.Comments.setValue(this.longComment);
        }else{
          this.longComment = this.generalPhyExamForm.controls.Comments.value;
        }
      }else{
        this.longComment = '';
        this.generalPhyExamForm.controls.Comments.setValue('');
      }
     
     }
     if (this.formName == 'headNeckPhyExamForm') {
      if (this.headNeckPhyExamForm.controls.Modee.value == '0') {
        if (this.headNeckPhyExamForm.controls.Comments.value =='') {
          this.longComment ="No head and neck injury, no lesions, intact sensation, no facial weakness or paralysis, no thyroid nodules, no abnormal lymph nodes. No Jugular venous distension (JVD)."
          
          this.headNeckPhyExamForm.controls.Comments.setValue(this.longComment);
        }else{
          this.longComment = this.headNeckPhyExamForm.controls.Comments.value;
        }
      }else{
        this.longComment = '';
        this.headNeckPhyExamForm.controls.Comments.setValue('');
      }
     
     }
     if (this.formName == 'eyesPhyExamForm') {
      if (this.eyesPhyExamForm.controls.Modee.value == '0') {
        if (this.eyesPhyExamForm.controls.Comments.value == '') {
          this.longComment = "Conjunctiva and sclera are anicteric pupils equally round and reactive to light and accommodation bilaterally. No ptosis. The extraocular movements are intact."
          
          this.eyesPhyExamForm.controls.Comments.setValue(this.longComment);
        }else{
          this.longComment = this.eyesPhyExamForm.controls.Comments.value;
        }
      }else{
        this.longComment = '';
        this.eyesPhyExamForm.controls.Comments.setValue('');
      }
     
     }
     if (this.formName == 'entPhyExamForm') {
      if (this.entPhyExamForm.controls.Modee.value == '0') {
        if (this.entPhyExamForm.controls.Comments.value == '') {
          this.longComment = "Denies hearing loss, ringing in ears, or lesions. Oropharynx: Normal.No oral lesions. Neck: No lymphadenopathy. Trachea is midline. No thyroid masses."
          
          this.entPhyExamForm.controls.Comments.setValue(this.longComment);
        }else{
          this.longComment = this.entPhyExamForm.controls.Comments.value;
        }
      }else{
        this.longComment = '';
        this.entPhyExamForm.controls.Comments.setValue('');
      }
     
     }
     if (this.formName == 'respiratoryPhyExamForm') {
      if (this.respiratoryPhyExamForm.controls.Modee.value == '0') {
        if (this.respiratoryPhyExamForm.controls.Comments.value == '') {
          this.longComment = "Good Air Entry bilateral, normal vesicular breathing, no added sounds.Normal chest expansion and percussion notes, no skin lesions."
          
          this.respiratoryPhyExamForm.controls.Comments.setValue(this.longComment);
        }else{
          this.longComment = this.respiratoryPhyExamForm.controls.Comments.value;
        }
      }else{
        this.longComment = '';
        this.respiratoryPhyExamForm.controls.Comments.setValue('');
      }
     
     }
     if (this.formName == 'cardioPhyExamForm') {
      if (this.cardioPhyExamForm.controls.Modee.value == '0') {
        if (this.cardioPhyExamForm.controls.Comments.value == '') {
          this.longComment = "Regular rhythm, S1 and S2 are normal, no murmurs or added sounds.Peripheral pulses are present, normal & intact."
          
          this.cardioPhyExamForm.controls.Comments.setValue(this.longComment);
        }else{
          this.longComment = this.cardioPhyExamForm.controls.Comments.value;
        }
      }else{
        this.longComment = '';
        this.cardioPhyExamForm.controls.Comments.setValue('');
      }
     
     }
     if (this.formName == 'haemaPhyExamForm') {
      if (this.haemaPhyExamForm.controls.Modee.value == '0') {
        if (this.haemaPhyExamForm.controls.Comments.value == '') {
          this.longComment = "No neck, axillary or inguinal lymphadenopathy. No skin discoloration or subdermal or subcutaneous bleeding"
          
          this.haemaPhyExamForm.controls.Comments.setValue(this.longComment);
        }else{
          this.longComment = this.haemaPhyExamForm.controls.Comments.value;
        }
      }else{
        this.longComment = '';
        this.haemaPhyExamForm.controls.Comments.setValue('');
      }
     
     }
     if (this.formName == 'gastroPhyExamForm') {
      if (this.gastroPhyExamForm.controls.Modee.value == '0') {
        if (this.gastroPhyExamForm.controls.Comments.value == '') {
          this.longComment = "Soft & lax abdomen, non-tender and non-distended. No guarding rebound or rigidity. No distention. Bowel sounds are normal. No suprapubic tenderness. No bruit. No hepatosplenomegaly. No skin lesion or palpable superficial masses. Normal umbilicus position."
          
          this.gastroPhyExamForm.controls.Comments.setValue(this.longComment);
        }else{
          this.longComment = this.gastroPhyExamForm.controls.Comments.value;
        }
      }else{
        this.longComment = '';
        this.gastroPhyExamForm.controls.Comments.setValue('');
      }
     
     }
     if (this.formName == 'musculoPhyExamForm') {
      if (this.musculoPhyExamForm.controls.Modee.value == '0') {
        if (this.musculoPhyExamForm.controls.Comments.value == '') {
          this.longComment = "Normal range of motion, no joint swelling or erythema. No cyanosis/clubbing/or edema."
          
          this.musculoPhyExamForm.controls.Comments.setValue(this.longComment);
        }else{
          this.longComment = this.musculoPhyExamForm.controls.Comments.value;
        }
      }else{
        this.longComment = '';
        this.musculoPhyExamForm.controls.Comments.setValue('');
      }
     
     }
     if (this.formName == 'skinPhyExamForm') {
      if (this.skinPhyExamForm.controls.Modee.value == '0') {
        if (this.skinPhyExamForm.controls.Comments.value == '') {
          this.longComment = "Intact, no rashes, no lesions, no erythema, no abnormal colours,normal nails texture and colour."
          
          this.skinPhyExamForm.controls.Comments.setValue(this.longComment);
        }else{
          this.longComment = this.skinPhyExamForm.controls.Comments.value;
        }
      }else{
        this.longComment = '';
        this.skinPhyExamForm.controls.Comments.setValue('');
      }
     
     }
     if (this.formName == 'neuroPhyExamForm') {
      if (this.neuroPhyExamForm.controls.Modee.value == '0') {
        if (this.neuroPhyExamForm.controls.Comments.value == '') {
          this.longComment = "Cranial nerves II-XII are intact. Deep tendon reflexes are normal.Power is 5/5. No abnormal movements."
          
          this.neuroPhyExamForm.controls.Comments.setValue(this.longComment);
        }else{
          this.longComment = this.neuroPhyExamForm.controls.Comments.value;
        }
      }else{
        this.longComment = '';
        this.neuroPhyExamForm.controls.Comments.setValue('');
      }
     
     }
     if (this.formName == 'genitPhyExamForm') {
      if (this.genitPhyExamForm.controls.Modee.value == '0') {
        if (this.genitPhyExamForm.controls.Comments.value == '') {
          this.longComment ="Male: Normal urethral orifice, location and size, no skin lesions or ulcers, normal colour, no abnormal secretions.Female: No gross masses or skin lesions, no discharge, no prolapses."
          
          this.genitPhyExamForm.controls.Comments.setValue(this.longComment);
        }else{
          this.longComment = this.genitPhyExamForm.controls.Comments.value;
        }
      }else{
        this.longComment = '';
        this.genitPhyExamForm.controls.Comments.setValue('');
      }
     
     }
     if (this.formName == 'breastPhyExamForm') {
      if (this.breastPhyExamForm.controls.Modee.value == '0') {
        if (this.breastPhyExamForm.controls.Comments.value == '') {
          this.longComment = "Symmetrical size and shape, no masses, lumps, nipple intact, no discharges, no skin changes or discoloration."
          
          this.breastPhyExamForm.controls.Comments.setValue(this.longComment);
        }else{
          this.longComment = this.breastPhyExamForm.controls.Comments.value;
        }
      }else{
        this.longComment = '';
        this.breastPhyExamForm.controls.Comments.setValue('');
      }
     
     }
  }
  closeCommentBox(){
    this.modalRefForComment.hide();
    this.longComment = '';
  }
  saveComment(){
    if (this.formName == 'generalPhyExamForm') {
      this.generalPhyExamForm.controls.Comments.setValue(this.longComment);
     }
     if (this.formName == 'headNeckPhyExamForm') {
      this.headNeckPhyExamForm.controls.Comments.setValue(this.longComment);
     }
      if (this.formName == 'eyesPhyExamForm') {
      this.eyesPhyExamForm.controls.Comments.setValue(this.longComment);
     }
     if (this.formName == 'entPhyExamForm') {
      this.entPhyExamForm.controls.Comments.setValue(this.longComment);
     }
     if (this.formName == 'respiratoryPhyExamForm') {
      this.respiratoryPhyExamForm.controls.Comments.setValue(this.longComment);
     }
     if (this.formName == 'cardioPhyExamForm') {
      this.cardioPhyExamForm.controls.Comments.setValue(this.longComment);
     }
     if (this.formName == 'haemaPhyExamForm') {
      this.haemaPhyExamForm.controls.Comments.setValue(this.longComment);
     }
     if (this.formName == 'gastroPhyExamForm') {
      this.gastroPhyExamForm.controls.Comments.setValue(this.longComment);
     }
     if (this.formName == 'musculoPhyExamForm') {
      this.musculoPhyExamForm.controls.Comments.setValue(this.longComment);
     }
     if (this.formName == 'skinPhyExamForm') {
      this.skinPhyExamForm.controls.Comments.setValue(this.longComment);
     }
     if (this.formName == 'neuroPhyExamForm') {
      this.neuroPhyExamForm.controls.Comments.setValue(this.longComment);
     }
     if (this.formName == 'skinPhyExamForm') {
      this.skinPhyExamForm.controls.Comments.setValue(this.longComment);
     }
     if (this.formName == 'breastPhyExamForm') {
      this.breastPhyExamForm.controls.Comments.setValue(this.longComment);
     }
     this.modalRefForComment.hide();
  }
}
