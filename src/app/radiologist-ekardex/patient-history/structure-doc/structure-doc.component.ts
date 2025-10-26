import { Component, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { untilDestroyed } from '@ngneat/until-destroy';
import { EEmrService } from '@services/e-emr.service';
import { HospitalistService } from '@services/e-hospitalist/hospitalist.service';
import { InPatientConfigurationService } from '@services/e-kardex/inPatient.service';
import { PatientVisitDataResult } from '@services/e-kardex/interfaces/patient-visit-data';
import { PatientHistoryService } from '@services/e-kardex/patient-history.service';
import { PatientService } from '@services/e-kardex/patient.service';
import { UserConfigurationService } from '@services/e-kardex/user-configuration.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Observable, ReplaySubject, catchError, of } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-structure-doc',
  templateUrl: './structure-doc.component.html',
  styleUrls: ['./structure-doc.component.scss']
})
export class StructureDocComponent implements OnInit {
  @ViewChild('structuredDoc', { static: true }) structuredDoc: TemplateRef<any>;
  @ViewChild('specialNotesModal', { static: true }) specialNotesModal: TemplateRef<any>;
  @ViewChild('releasedocpdfmodal') releasedocpdfmodal: TemplateRef<HTMLDivElement>;
  fileSelected: boolean = false;
  showRedBorder: boolean = false;
  modalRef: BsModalRef;
  modalRefForStrucDoc:BsModalRef;
  selectedERList: any;
  getPhyDocForm:FormGroup;
  getNursDocForm:FormGroup;
  getAttachDocForm:FormGroup;
  getCVISAttachDocForm:FormGroup;
  getSpecialDocForm:FormGroup;
  createDocForm:FormGroup;
  createNursDocForm:FormGroup;
  createAttachmentForm:FormGroup;
  createCVISAttachmentForm:FormGroup;
  vitalSignsForm:FormGroup
  ZdocNr='';
  phyAssessmentList: any;
  actionStatus: any;
  enableCreate: boolean=true;
  enableRelease: boolean=true;
  enableEdit: boolean=true;
  enableDelete: boolean=true;
  enableCreateNurs: boolean=true;
  enableReleaseNurs: boolean=true;
  enableEditNurs: boolean=true;
  enableDeleteNurs: boolean=true;
  pdfUrl: any;
  userProfile: any;
  arrivalModeList: { value: string; name: string; }[];
  vitalSignsList: any[];
  vitalSignsFormitems: FormArray;
  nursAssessmentList: any;
  ZdocNrForNurs: any;
  pastSurgList: any;
  pastsurgform: FormGroup;
  pastSurgFormitems: FormArray;
  patSurgItemsArr: any[];
  SurgCatLog: any;
  pastMedList: any;
  pastmedform: FormGroup;
  pastMedFormitems: FormArray;
  patMedItemsArr: any[];
  diseaseCatLog: any;
  attachmentList: any;
  base64Value: string;
  mimetype: any;
  filename: any;
  chiefTemplate: any;
  specialNote = '';
  file: File;
  selectedFile: File | null = null;
  documentUrl: SafeResourceUrl | null = null;
  constructor(private modalServiceForAllergy: BsModalService,private inPatientConfigurationService:InPatientConfigurationService,private userconfig:UserConfigurationService,
    private formBuilder: FormBuilder,public storageService: StorageService,private emergencyService:EmergencyService,private patientHistoryService:PatientHistoryService,private sanitizer: DomSanitizer,private hospitalistService: HospitalistService,private _dataServices: EEmrService,private viewContainerRef: ViewContainerRef) {
      this.getPhyDocForm = this.formBuilder.group({
        docName: ['Physician Assessment'],
        docDate: [''],
        docTime: [''],
        docStatus:[''],
        docPhysician: [''],
      });
      this.getNursDocForm = this.formBuilder.group({
        docName: ['Nursing Assessment'],
        docDate: [''],
        docTime: [''],
        docStatus:[''],
        docPhysician: [''],
      });
      this.getAttachDocForm = this.formBuilder.group({
        docName: ['Attachments'],
        docDate: [''],
        docTime: [''],
        docStatus:[''],
        docPhysician: [''],
      });
      this.getCVISAttachDocForm = this.formBuilder.group({
        docName: ['CVIS Attachments'],
        docDate: [''],
        docTime: [''],
        docStatus:[''],
        docPhysician: [''],
      });
      this.getSpecialDocForm = this.formBuilder.group({
        docName: ['Special Notes'],
        docDate: [''],
        docTime: [''],
        docStatus:[''],
        docPhysician: [''],
      });
      this.createDocForm = this.formBuilder.group({
        assDate: [''],
        assTime: [''],
        chiefTemp:[''],
        chiefComment:[''],
        impression: [''],
        allergies:[false],
        vitalSigns:[false],
        diagnosis:[false]

      });
      this.createNursDocForm = this.formBuilder.group({
        assDate: [''],
        assTime: [''],
        chiefComment:[''],
        impression: [''],
        allergies:[false],
        vitalSigns:[false],
        diagnosis:[false],
        arrivalMode:['']
      });
      this.createAttachmentForm= this.formBuilder.group({
        attachmentType: [null, Validators.required],
      attachmentFile: [null, Validators.required],
      });
      this.createCVISAttachmentForm= this.formBuilder.group({
      attachmentFile: [null, Validators.required],
      });
      this.vitalSignsForm = this.formBuilder.group({
        vitalSignsFormitems: new FormArray([]),
      });
      this.pastsurgform = this.formBuilder.group({
        pastSurgFormitems: new FormArray([]),
      });
      this.pastmedform = this.formBuilder.group({
        pastMedFormitems: new FormArray([]),
      });
    }

  ngOnInit() {

    this.arrivalModeList = [{
      value:'0',
      name:'Ambulatory'
    },
    {
      value:'1',
      name:'Wheel Chair'
    },
    {
      value:'2',
      name:'Stretcher'
    },
    {
      value:'3',
      name:'Carried'
    },
    {
      value:'4',
      name:'Cuddled'
    },
    {
      value:'5',
      name:'Other'
    }
  ]
  this.getInitialVitalList();
  }
  getInitialVitalList(){
    this.vitalSignsList = [{
      ZdocNr:'',
      Zvital:'',
      vitalSignName:'WEIGHT',
      VitalName:'Weight',
      Uom:'kg',
      Value:''
    },
    {
      ZdocNr:'',
      Zvital:'',
      vitalSignName:'HEIGHT',
      VitalName:'Height',
      Uom:'cm',
      Value:''
    },
    {
      ZdocNr:'',
      Zvital:'',
      vitalSignName:'SYSTOLIC BLOOD PRESSURE',
      VitalName:'Systolic blood pressure',
      Uom:'mmHg',
      Value:''
    },
    {
      ZdocNr:'',
      Zvital:'',
      vitalSignName:'DIASTOLIC BLOOD PRESSURE',
      VitalName:'Diastolic blood pressure',
      Uom:'mmHg',
      Value:''
    },
    {
      ZdocNr:'',
      Zvital:'',
      vitalSignName:'TEMP_TYMP',
      VitalName:'Temperature tympanic',
      Uom:'c',
      Value:''
    },
    {
      ZdocNr:'',
      Zvital:'',
      vitalSignName:'TEMP_ORAL',
      VitalName:'Temperature-oral',
      Uom:'c',
      Value:''
    },
    {
      ZdocNr:'',
      Zvital:'',
      vitalSignName:'TEMP_AXIL',
      VitalName:'Temperature-axila',
      Uom:'c',
      Value:''
    },
    {
      ZdocNr:'',
      Zvital:'',
      vitalSignName:'HEART RATE',
      VitalName:'Heart rate',
      Uom:'bpm',
      Value:''
    },
    {
      ZdocNr:'',
      Zvital:'',
      vitalSignName:'OXYGEN SATURATION',
      VitalName:'Oxygen saturation',
      Uom:'%',
      Value:''
    },
    {
      ZdocNr:'',
      Zvital:'',
      vitalSignName:'RESPIRATORY RATE',
      VitalName:'Respiratory rate',
      Uom:'bpm',
      Value:''
    },
    {
      ZdocNr:'',
      Zvital:'',
      vitalSignName:'PAIN SCORE',
      VitalName:'Pain score',
      Uom:'UnLess',
      Value:''
    },

  ]
  }
  getInitialCreateDocForm(){
    this.createDocForm = this.formBuilder.group({
      assDate: [''],
      assTime: [''],
      chiefTemp:[''],
      chiefComment:[''],
      impression: [''],
      allergies:[false],
      vitalSigns:[false],
      diagnosis:[false]

    });
  }
  getInitialCreateNursDocForm(){
    this.createNursDocForm = this.formBuilder.group({
      assDate: [''],
      assTime: [''],
      chiefComment:[''],
      impression: [''],
      allergies:[false],
      vitalSigns:[false],
      diagnosis:[false],
      arrivalMode:['']
    });
  }
  get createDocControls() {
    return this.createDocForm.controls;
  }
  get createNursDocControls() {
    return this.createNursDocForm.controls;
  }
  public openModalForStructuredDoc() {
    const config: ModalOptions = { class: 'modal-dialog-centered structure-modal-size' };
      this.modalRefForStrucDoc = this.modalServiceForAllergy.show(this.structuredDoc,config);
      this.userProfile = this.storageService.getUserProfile();
      this.modalRefForStrucDoc.onHide.subscribe((reason: string | any) => {
        if(reason === 'backdrop-click') {

        }
      });
      this.getPhyAssessmentDoc();
      this.getNursAssessmentDoc();
      this.getAttachmentsList();
      this.getSpecialNotes();
  }
  public openModalForCreateStructuredDoc(
    template: TemplateRef<any>,
    status
  ) {
    const config: ModalOptions = { class: 'modal-dialog-centered allergy-modal-size' };
      this.modalRef = this.modalServiceForAllergy.show(template,config);
      this.modalRefForStrucDoc.hide();
      this.userProfile = this.storageService.getUserProfile();
      this.modalRef.onHide.subscribe((reason: string | any) => {
        if(reason === 'backdrop-click') {

        }
      });
      this.actionStatus = status;
      if (status == 'update' || status == 'release') {
       if (this.phyAssessmentList.length > 0) {
       this.createDocForm.controls.assDate.setValue(this.getDate(this.phyAssessmentList[0].AssDate));
       this.createDocForm.controls.assTime.setValue(this.getTimeWithoutSeconds(this.phyAssessmentList[0].AssTime));
       this.createDocForm.controls.chiefComment.setValue(this.phyAssessmentList[0].ChiefComplaint);
       this.createDocForm.controls.impression.setValue(this.phyAssessmentList[0].PlanCare);
       this.createDocForm.controls.allergies.setValue(this.phyAssessmentList[0].Allergies);
       this.createDocForm.controls.vitalSigns.setValue(this.phyAssessmentList[0].VitalSign);
       this.createDocForm.controls.diagnosis.setValue(this.phyAssessmentList[0].Diagnosis);
       }
      }else{
        //this.createDocForm.reset();
        this.getInitialCreateDocForm()
      }
      this.getChiefTemplate();
      this.getPastMedicalHistory();
      this.getPastSurgicalHistory();
      this.getSurgicalCatalogSet();
      this.getProblemCatalogSet();
  }
  getPhyAssessmentDoc() {
    const json = {
      einri:this.storageService.einri,
      falnr:this.storageService.falnr
    }
    this.patientHistoryService.getPhyAssessmentDoc(json).subscribe(
      (_success: any) => {
       this.phyAssessmentList = _success.d.results;
       if (this.phyAssessmentList.length > 0) {
        var docStatus;
        if (this.phyAssessmentList[0].DocStatus == '1') {
          docStatus = 'Draft';
        }else{
          docStatus = 'Released';
        }
        this.getPhyDocForm.patchValue({
        docName: ['Physician Assessment'],
        docDate: [this.getDateInStringFormat(this.phyAssessmentList[0].DocDate)],
        docTime: [this.getTimeWithoutSeconds(this.phyAssessmentList[0].DocTime)],
        docStatus:[docStatus],
        docPhysician: [this.phyAssessmentList[0].AttendPhy],
        })
        this.getPhyDocForm.controls['docName'].disable();
        this.getPhyDocForm.controls['docDate'].disable();
        this.getPhyDocForm.controls['docTime'].disable();
        this.getPhyDocForm.controls['docStatus'].disable();
        this.getPhyDocForm.controls['docPhysician'].disable();
        if (this.phyAssessmentList[0].DocStatus == '1') {
        this.enableCreate=false;
        this.enableRelease=true;
        this.enableEdit=true;
        this.enableDelete=true;
        }else if(this.phyAssessmentList[0].DocStatus == '2'){
        this.enableCreate=false;
        this.enableRelease=false;
        this.enableEdit=false;
        this.enableDelete=true;
        }

       }else{
        this.getPhyDocForm.patchValue({
          docName: ['Physician Assessment'],
          docDate: [''],
          docTime: [''],
          docStatus:[''],
          docPhysician: [''],
          })
        this.getPhyDocForm.controls['docName'].disable();
        this.getPhyDocForm.controls['docDate'].disable();
        this.getPhyDocForm.controls['docTime'].disable();
        this.getPhyDocForm.controls['docStatus'].disable();
        this.getPhyDocForm.controls['docPhysician'].disable();
        this.enableCreate=true;
        this.enableRelease=false;
        this.enableEdit=false;
        this.enableDelete=false;
       }
      },
      (_error: any) => {}
    );
  }
  getChiefTemplate() {
    this.patientHistoryService.getChiefTemplate().subscribe(
      (_success: any) => {
       this.chiefTemplate = _success.d.results;
      },
      (_error: any) => {}
    );
  }
  setValueOfComplaintText(){
    this.createDocForm.controls.chiefComment.setValue(this.createDocForm.controls.chiefTemp.value);
  }
  submitPhyAssessDoc(){
   if (this.actionStatus == 'update') {
    this.ZdocNr = this.phyAssessmentList[0].ZdocNr;
    this.UpdatePhyAssessmentDoc();
   }else if(this.actionStatus == 'release'){
    this.ZdocNr = this.phyAssessmentList[0].ZdocNr;
    this.ReleasePhyAssessmentDoc();
   }
    else{
   this.CreatePhyAssessmentDoc();
   }
  }
  CreatePhyAssessmentDoc() {
    var createTime = this.createDocControls.assTime.value.split(':')
            createTime = 'PT'+ createTime[0]+'H' + createTime[1] + 'M' + '00S'
    const json = {
        "ZdocNr": "",
        "Dtid": "ZMED_PHASM",
        "Einri": this.storageService.einri,
        "Patnr": this.storageService.patnr,
        "Falnr": this.storageService.falnr,
        "Falar": "1",
        "Orgdo": this.storageService.patientData.deptOrgUnit,
        "Lfdnr": this.storageService.lfdnr,
        "AssDate": this.createDocControls.assDate.value.getFullYear() +'-'+ String(this.createDocControls.assDate.value.getMonth() +1).padStart(2, '0') +'-'+ String(this.createDocControls.assDate.value.getDate()).padStart(2, '0') +'T00:00:00',
        "AssTime": createTime,
        "ChiefComplaint": this.createDocControls.chiefComment.value,
        "Allergies": this.createDocControls.allergies.value,
        "VitalSign": this.createDocControls.vitalSigns.value,
        "Diagnosis": this.createDocControls.diagnosis.value,
        "PlanCare": this.createDocControls.impression.value,
        "AttendPhy": this.storageService.getUserProfile().Gpart,
        "DocStatus": "1"
    }
    this.patientHistoryService.createPhyAssessmentDoc(json).subscribe(
      (_success: any) => {
       //this.allergyTypeValues = _success.d.results;
       this.checkDataForPastSurg();
       this.checkDataForPastMed();
       this.modalRef.hide();
       Swal.fire({
        title: 'Created Successfully',
        icon: 'success',
        confirmButtonText: 'OK',
      });
      },
      (_error: any) => {}
    );
  }
  UpdatePhyAssessmentDoc(){
    var createTime = this.createDocControls.assTime.value.split(':')
            createTime = 'PT'+ createTime[0]+'H' + createTime[1] + 'M' + '00S'
    const json = {
      "ZdocNr": this.ZdocNr,
      "Dtid": "ZMED_PHASM",
      "Einri": this.storageService.einri,
      "Patnr": this.storageService.patnr,
      "Falnr": this.storageService.falnr,
      "Falar": "1",
      "Orgdo": this.storageService.patientData.deptOrgUnit,
      "Lfdnr": this.storageService.lfdnr,
      "AssDate": this.createDocControls.assDate.value.getFullYear() +'-'+ String(this.createDocControls.assDate.value.getMonth() +1).padStart(2, '0') +'-'+ String(this.createDocControls.assDate.value.getDate()).padStart(2, '0') +'T00:00:00',
      "AssTime": createTime,
      "ChiefComplaint": this.createDocControls.chiefComment.value,
      "Allergies": this.createDocControls.allergies.value,
      "VitalSign": this.createDocControls.vitalSigns.value,
      "Diagnosis": this.createDocControls.diagnosis.value,
      "PlanCare": this.createDocControls.impression.value,
      "AttendPhy": this.storageService.getUserProfile().Gpart,
      "DocStatus": "1"
  }
  this.patientHistoryService.updatePhyAssessmentDoc(json).subscribe(
    (_success: any) => {
     //this.allergyTypeValues = _success.d.results;
     this.modalRef.hide();
     Swal.fire({
      title: 'Updated Successfully',
      icon: 'success',
      confirmButtonText: 'OK',
    });
    },
    (_error: any) => {}
  );
  }
  ReleasePhyAssessmentDoc(){
    var createTime = this.createDocControls.assTime.value.split(':')
    createTime = 'PT'+ createTime[0]+'H' + createTime[1] + 'M' + '00S'
    const json = {
      "ZdocNr": this.ZdocNr,
      "Dtid": "ZMED_PHASM",
      "Einri": this.storageService.einri,
      "Patnr": this.storageService.patnr,
      "Falnr": this.storageService.falnr,
      "Falar": "1",
      "Orgdo": this.storageService.patientData.deptOrgUnit,
      "Lfdnr": this.storageService.lfdnr,
      "AssDate": this.createDocControls.assDate.value.getFullYear() +'-'+ String(this.createDocControls.assDate.value.getMonth() +1).padStart(2, '0') +'-'+ String(this.createDocControls.assDate.value.getDate()).padStart(2, '0') +'T00:00:00',
      "AssTime": createTime,
      "ChiefComplaint": this.createDocControls.chiefComment.value,
      "Allergies": this.createDocControls.allergies.value,
      "VitalSign": this.createDocControls.vitalSigns.value,
      "Diagnosis": this.createDocControls.diagnosis.value,
      "PlanCare": this.createDocControls.impression.value,
      "AttendPhy": this.storageService.getUserProfile().Gpart,
      "DocStatus": "2"
  }
  this.patientHistoryService.updatePhyAssessmentDoc(json).subscribe(
    (_success: any) => {
     //this.allergyTypeValues = _success.d.results;
     this.modalRef.hide();
     Swal.fire({
      title: 'Released Successfully',
      icon: 'success',
      confirmButtonText: 'OK',
    });
    },
    (_error: any) => {}
  );
  }
  confirmDeletePhyAssessmentDoc(){
    Swal.fire({
      text: "Are you sure you want to delete?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: { popup: 'myalertpopup' }
    } as any).then((result) => {
      if (result.value) {
        this.ZdocNr = this.phyAssessmentList[0].ZdocNr;
        this.deletePhyAssessmentDoc();
      }
    })
  }
  deletePhyAssessmentDoc() {
    const json = {
      ZdocNr:this.ZdocNr,
    }
    this.patientHistoryService.deletePhyAssessmentDoc(json).subscribe(
      (_success: any) => {
       //this.allergyTypeValues = _success.d.results;
       this.modalRefForStrucDoc.hide();
       this.getPhyDocForm.reset();
       this.phyAssessmentList=[];
      },
      (_error: any) => {
        Swal.fire({
          title: _error.error.error.message.value,
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    );
  }
  getDocPdf(){
    this.ZdocNr = this.phyAssessmentList[0].ZdocNr;
    this.patientHistoryService.getDocPdf(this.ZdocNr).subscribe(
      (_success: any) => {
        this.modalRefForStrucDoc.hide();
        this.pdfUrl= this.sanitizer.bypassSecurityTrustResourceUrl('data:application/pdf;base64,'+ _success.d.AttachmentData);
        const config: ModalOptions = { class: 'modal-dialog-centered modal-lg kardex-risk-modal-size' };
      this.modalRef = this.modalServiceForAllergy.show(this.releasedocpdfmodal,config);
      },
      (_error: any) => {}
    );
  }
  getTimeWithoutSeconds(value){
    if (value) {
      var str = value;
      var str = str.replace(/[PT]/g, '');
      var str = str.replace(/[H]/g, ':');
      var str = str.split('M')[0];
      return str;
    }
  }
  getDateInStringFormat(value){
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      var finalstr = String(date.getDate()).padStart(2, '0')+'.'+String(date.getMonth() +1).padStart(2, '0')+'.'+ date.getFullYear();
      return finalstr;
    }

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
  // Nursing
  public openModalForCreateNursing(
    template: TemplateRef<any>,
    status
  ) {
    const config: ModalOptions = { class: 'modal-dialog-centered allergy-modal-size' };
      this.modalRef = this.modalServiceForAllergy.show(template,config);
      this.modalRefForStrucDoc.hide();
      this.userProfile = this.storageService.getUserProfile();
      this.modalRef.onHide.subscribe((reason: string | any) => {
        if(reason === 'backdrop-click') {
          this.resetVitalListForm();

        }
      });
      this.actionStatus = status;
      if (status == 'update' || status == 'release') {
       if (this.nursAssessmentList.length > 0) {
       this.createNursDocForm.controls.assDate.setValue(this.getDate(this.nursAssessmentList[0].AssDate));
       this.createNursDocForm.controls.assTime.setValue(this.getTimeWithoutSeconds(this.nursAssessmentList[0].AssTime));
       this.createNursDocForm.controls.chiefComment.setValue(this.nursAssessmentList[0].ChiefComplaint);
       this.createNursDocForm.controls.impression.setValue(this.nursAssessmentList[0].PlanCare);
       this.createNursDocForm.controls.allergies.setValue(this.nursAssessmentList[0].Allergies);
       this.createNursDocForm.controls.vitalSigns.setValue(this.nursAssessmentList[0].VitalSign);
       this.createNursDocForm.controls.diagnosis.setValue(this.nursAssessmentList[0].Diagnosis);
       this.createNursDocForm.controls.arrivalMode.setValue(this.nursAssessmentList[0].ArrivalMode);
       this.vitalSignsList = this.nursAssessmentList[0].TOVITALSIGN.results;
       this.setvaluesInVitals();
       }
      }else{
        this.getInitialCreateNursDocForm();
        this.getInitialVitalList();
        this.setvaluesInVitals();
      }


  }
  setvaluesInVitals(){
    this.vitalSignsList.forEach(element => {
      this.addItemForVitalList(element);
    });
  }
  getNursAssessmentDoc() {
    const json = {
      einri:this.storageService.einri,
      falnr:this.storageService.falnr,
      lfdnr:this.storageService.lfdnr
    }
    this.patientHistoryService.getNursAssessmentDoc(json).subscribe(
      (_success: any) => {
       this.nursAssessmentList = _success.d.results;
       if (this.nursAssessmentList.length > 0) {
        var docStatus;
        if (this.nursAssessmentList[0].DocStatus == '1') {
          docStatus = 'Draft';
        }else{
          docStatus = 'Released';
        }
        this.getNursDocForm.patchValue({
          docName: ['Nursing Assessment'],
          docDate: [this.getDateInStringFormat(this.nursAssessmentList[0].DocDate)],
          docTime: [this.getTimeWithoutSeconds(this.nursAssessmentList[0].DocTime)],
          docStatus:[docStatus],
          docPhysician: [this.nursAssessmentList[0].AttendPhy],
          })
        this.getNursDocForm.controls['docName'].disable();
        this.getNursDocForm.controls['docDate'].disable();
        this.getNursDocForm.controls['docTime'].disable();
        this.getNursDocForm.controls['docStatus'].disable();
        this.getNursDocForm.controls['docPhysician'].disable();
        if (this.nursAssessmentList[0].DocStatus == '1') {
        this.enableCreateNurs=false;
        this.enableReleaseNurs=true;
        this.enableEditNurs=true;
        this.enableDeleteNurs=true;
        }else if(this.nursAssessmentList[0].DocStatus == '2'){
        this.enableCreateNurs=false;
        this.enableReleaseNurs=false;
        this.enableEditNurs=false;
        this.enableDeleteNurs=true;
        }

       }else{
        this.getNursDocForm.patchValue({
          docName: ['Nursing Assessment'],
          docDate: [''],
          docTime: [''],
          docStatus:[''],
          docPhysician: [''],
          })
        this.getNursDocForm.controls['docName'].disable();
        this.getNursDocForm.controls['docDate'].disable();
        this.getNursDocForm.controls['docTime'].disable();
        this.getNursDocForm.controls['docStatus'].disable();
        this.getNursDocForm.controls['docPhysician'].disable();
        this.enableCreateNurs=true;
        this.enableReleaseNurs=false;
        this.enableEditNurs=false;
        this.enableDeleteNurs=false;
       }
      },
      (_error: any) => {}
    );
  }
  submitNursAssessDoc(){
    if (this.actionStatus == 'update') {
     this.ZdocNrForNurs = this.nursAssessmentList[0].ZdocNr;
     this.UpdateNursAssessmentDoc();
    }else if(this.actionStatus == 'release'){
     this.ZdocNrForNurs = this.nursAssessmentList[0].ZdocNr;
     this.ReleaseNursAssessmentDoc();
    }
     else{
     this.CreateNursAssessmentDoc();
    }
   }
   CreateNursAssessmentDoc() {
     var createTime = this.createNursDocControls.assTime.value.split(':')
             createTime = 'PT'+ createTime[0]+'H' + createTime[1] + 'M' + '00S'
     const json = {
         "ZdocNr": "",
         "Dtid": "ZMED_TRASM",
         "Einri": this.storageService.einri,
         "Patnr": this.storageService.patnr,
         "Falnr": this.storageService.falnr,
         "Falar": "1",
         "Orgdo": this.storageService.patientData.deptOrgUnit,
         "Lfdnr": this.storageService.lfdnr,
         "AssDate": this.createNursDocControls.assDate.value.getFullYear() +'-'+ String(this.createNursDocControls.assDate.value.getMonth() +1).padStart(2, '0') +'-'+ String(this.createNursDocControls.assDate.value.getDate()).padStart(2, '0') +'T00:00:00',
         "AssTime": createTime,
         "ChiefComplaint": this.createNursDocControls.chiefComment.value,
         "Allergies": this.createNursDocControls.allergies.value,
         "VitalSign": this.createNursDocControls.vitalSigns.value,
         "ArrivalMode" : this.createNursDocControls.arrivalMode.value,
         "PlanCare": this.createNursDocControls.impression.value,
         "AttendPhy": this.storageService.getUserProfile().Gpart,
         "DocStatus": "1",
         "TOVITALSIGN":this.vitalSignsFormitems.value
     }
     this.patientHistoryService.createNursAssessmentDoc(json).subscribe(
       (_success: any) => {
        //this.allergyTypeValues = _success.d.results;
        this.modalRef.hide();
        this.getNursDocForm.reset();
        this.resetVitalListForm();
        Swal.fire({
         title: 'Created Successfully',
         icon: 'success',
         confirmButtonText: 'OK',
       });
       },
       (_error: any) => {}
     );
   }
   UpdateNursAssessmentDoc(){
     var createTime = this.createNursDocControls.assTime.value.split(':')
             createTime = 'PT'+ createTime[0]+'H' + createTime[1] + 'M' + '00S'
     const json = {
       "ZdocNr": this.ZdocNrForNurs,
       "Dtid": "ZMED_TRASM",
       "Einri": this.storageService.einri,
       "Patnr": this.storageService.patnr,
       "Falnr": this.storageService.falnr,
       "Falar": "1",
       "Orgdo": this.storageService.patientData.deptOrgUnit,
       "Lfdnr": this.storageService.lfdnr,
       "AssDate": this.createNursDocControls.assDate.value.getFullYear() +'-'+ String(this.createNursDocControls.assDate.value.getMonth() +1).padStart(2, '0') +'-'+ String(this.createNursDocControls.assDate.value.getDate()).padStart(2, '0') +'T00:00:00',
       "AssTime": createTime,
       "ChiefComplaint": this.createNursDocControls.chiefComment.value,
       "Allergies": this.createNursDocControls.allergies.value,
       "VitalSign": this.createNursDocControls.vitalSigns.value,
       "Diagnosis": this.createNursDocControls.diagnosis.value,
       "PlanCare": this.createNursDocControls.impression.value,
       "AttendPhy": this.storageService.getUserProfile().Gpart,
       "DocStatus": "1",
       "ArrivalMode" : this.createNursDocControls.arrivalMode.value,
       "TOVITALSIGN":this.vitalSignsFormitems.value
   }
   this.patientHistoryService.updateNursAssessmentDoc(json).subscribe(
     (_success: any) => {
      //this.allergyTypeValues = _success.d.results;
      this.modalRef.hide();
      this.getNursDocForm.reset();
      this.resetVitalListForm();
      Swal.fire({
       title: 'Updated Successfully',
       icon: 'success',
       confirmButtonText: 'OK',
     });
     },
     (_error: any) => {}
   );
   }
   ReleaseNursAssessmentDoc(){
     var createTime = this.createNursDocControls.assTime.value.split(':')
     createTime = 'PT'+ createTime[0]+'H' + createTime[1] + 'M' + '00S'
     const json = {
       "ZdocNr": this.ZdocNrForNurs,
       "Dtid": "ZMED_TRASM",
       "Einri": this.storageService.einri,
       "Patnr": this.storageService.patnr,
       "Falnr": this.storageService.falnr,
       "Falar": "1",
       "Orgdo": this.storageService.patientData.deptOrgUnit,
       "Lfdnr": this.storageService.lfdnr,
       "AssDate": this.createNursDocControls.assDate.value.getFullYear() +'-'+ String(this.createNursDocControls.assDate.value.getMonth() +1).padStart(2, '0') +'-'+ String(this.createNursDocControls.assDate.value.getDate()).padStart(2, '0') +'T00:00:00',
       "AssTime": createTime,
       "ChiefComplaint": this.createNursDocControls.chiefComment.value,
       "Allergies": this.createNursDocControls.allergies.value,
       "VitalSign": this.createNursDocControls.vitalSigns.value,
       "Diagnosis": this.createNursDocControls.diagnosis.value,
       "PlanCare": this.createNursDocControls.impression.value,
       "AttendPhy": this.storageService.getUserProfile().Gpart,
       "DocStatus": "2",
       "ArrivalMode" : this.createNursDocControls.arrivalMode.value,
       "TOVITALSIGN":this.vitalSignsFormitems.value
   }
   this.patientHistoryService.updateNursAssessmentDoc(json).subscribe(
     (_success: any) => {
      //this.allergyTypeValues = _success.d.results;
      this.modalRef.hide();
      this.getNursDocForm.reset();
      this.resetVitalListForm();
      Swal.fire({
       title: 'Released Successfully',
       icon: 'success',
       confirmButtonText: 'OK',
     });
     },
     (_error: any) => {}
   );
   }
   confirmDeleteNursAssessmentDoc(){
     Swal.fire({
       text: "Are you sure you want to delete?",
       icon: 'warning',
       showCancelButton: true,
       confirmButtonText: 'Yes',
       cancelButtonText: 'No',
       customClass: { popup: 'myalertpopup' }
     } as any).then((result) => {
       if (result.value) {
         this.ZdocNrForNurs = this.nursAssessmentList[0].ZdocNr;
         this.deleteNursAssessmentDoc();
       }
     })
   }
   deleteNursAssessmentDoc() {
     const json = {
       ZdocNr:this.ZdocNrForNurs,
     }
     this.patientHistoryService.deleteNursAssessmentDoc(json).subscribe(
       (_success: any) => {
        //this.allergyTypeValues = _success.d.results;
        this.modalRefForStrucDoc.hide();
        this.getNursDocForm.reset();
        this.resetVitalListForm();
        this.nursAssessmentList=[];
       },
       (_error: any) => {
         Swal.fire({
           title: _error.error.error.message.value,
           icon: 'error',
           confirmButtonText: 'OK',
         });
       }
     );
   }
   getNursDocPdf(){
     this.ZdocNrForNurs = this.nursAssessmentList[0].ZdocNr;
     this.patientHistoryService.getNursDocPdf(this.ZdocNrForNurs).subscribe(
       (_success: any) => {
         this.modalRefForStrucDoc.hide();
         this.pdfUrl= this.sanitizer.bypassSecurityTrustResourceUrl('data:application/pdf;base64,'+ _success.d.AttachmentData);
         const config: ModalOptions = { class: 'modal-dialog-centered modal-lg kardex-risk-modal-size' };
       this.modalRef = this.modalServiceForAllergy.show(this.releasedocpdfmodal,config);
       },
       (_error: any) => {}
     );
   }
   addItemForVitalList(element?): void {
    this.vitalSignsFormitems = this.vitalSignsForm.get('vitalSignsFormitems') as FormArray;
    this.vitalSignsFormitems.push(this.showVitalDetailsOnList(element));
    //this.disableInputsOfPastMed()
  }
  showVitalDetailsOnList(element?): FormGroup {
    if (element) {
      return this.formBuilder.group({
        ZdocNr: [element.ZdocNr],
        Zvital :[element.Zvital],
        VitalName: [element.VitalName],
        Value: [element.Value],
        Uom: [element.Uom]
      }
      );
    }
  }
  resetVitalListForm(){
    this.vitalSignsList=[];
    this.vitalSignsFormitems = this.vitalSignsForm.get('vitalSignsFormitems') as FormArray;
    this.vitalSignsFormitems.clear();
    //this.patSurgItemsArr = [];
    //this.getInitialVitalList();
  }

  // past surgical for structure doc
  addItemForPatSurg(element?): void {
    this.pastSurgFormitems = this.pastsurgform.get('pastSurgFormitems') as FormArray;
    this.pastSurgFormitems.push(this.showSurgDetailsOnList(element));
    this.disableInputsOfPastSurg();
  }
  addNewItemForPastSurg(): void {
    const control = <FormArray>this.pastsurgform.controls['pastSurgFormitems'];
    this.pastSurgFormitems = this.pastsurgform.get('pastSurgFormitems') as FormArray;
    //this.pastSurgFormitems.push(this.showMedDetailsOnList());
    //this.disableInputs()
    control.insert(0,this.showSurgDetailsOnList());
    console.log('new record',this.pastSurgFormitems);

  }
  showSurgDetailsOnList(element?): FormGroup {
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
        isNew:[true]
      }
      );

    }
  }
  disableInputsOfPastSurg() {
    (<FormArray>this.pastsurgform.get('pastSurgFormitems'))
      .controls
      .forEach(control => {
        control['controls']['Surgeryname'].disable();
        control['controls']['Date'].disable();
        control['controls']['Remarks'].disable();
        //control['Rsfkb'].disable();
      })
  }
  getSurgicalCatalogSet() {
    this.patientHistoryService.getSurgicalCatalogSet().subscribe(
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
    this.patientHistoryService.getPastSurgicalHistory(json).subscribe(
      (_success: any) => {
        this.pastSurgList = [];
       this.pastSurgList = _success.d.results;
       if (this.pastSurgList.length > 0) {
        for (let index = 0; index < this.pastSurgList.length; index++) {
         if (this.pastSurgList[index]) {
          this.pastSurgList[index]["Date"] = new Date(this.pastSurgList[index].Date);
          // this.pastSurgList[index]["ToDate"] = new Date(this.pastSurgList[index].ToDate);
           this.addItemForPatSurg(this.pastSurgList[index]);
         }else {
           this.addItemForPatSurg();
         }
       }
     }
       else{
      //    this.pastSurgList.forEach(element => {
      //      this.addItemForPatSurg(element);
      //  });
      this.addNewItemForPastSurg();
       }

      },
      (_error: any) => {}
    );
  }

  checkDataForPastSurg(){
    console.log(this.pastSurgFormitems);

    if (this.pastSurgFormitems!=undefined) {
     this.patSurgItemsArr = this.pastSurgFormitems.value.filter(element => {
         if (element.isNew) {
          delete element.isChecked;
          delete element.isNew;
          element["Date"]=element.Date.getFullYear() + '-' + String(element.Date.getMonth() +1).padStart(2, '0') +'-'+ String(element.Date.getDate()).padStart(2, '0');
          return element;
         }

     });
     if (this.patSurgItemsArr.length >0) {
      this.patSurgItemsArr.forEach(element => {
        this.savePastSurgList(element);
      });
     }
   }
   else{
     this.patSurgItemsArr = [];
   }

  }
  savePastSurgList(element) {
    const json = {
      "RespEmp" : this.storageService.getUserProfile().Gpart,
      "SurgHistid" : "",
      "Departmentou" : this.storageService.patientData.deptOrgUnit,
      "Treatou" : this.storageService.patientData.deptOrgUnit,
      "Einri" : this.storageService.einri,
      "Patnr" : this.storageService.patnr,
      "Surgeryname" : element.Surgeryname.Bcpname,
      "Bchid" : element.Surgeryname.Bchid,
      "Bcpid" : element.Surgeryname.Bcpid,
      "Date" : element.Date,
      "Remarks" : element.Remarks

    }
    this.patientHistoryService.savePastSurList(json).subscribe(
      (_success: any) => {
        this.resetSurgMedForm();
        this.modalRef.hide();
      },
      (_error: any) => {}
    );
  }
  resetSurgMedForm(){
    this.pastSurgFormitems = this.pastsurgform.get('pastSurgFormitems') as FormArray;
    this.pastSurgFormitems.clear();
    this.patSurgItemsArr = [];
  }

  // past medical structure
  addItemForPatMed(element?): void {
    this.pastMedFormitems = this.pastmedform.get('pastMedFormitems') as FormArray;
    this.pastMedFormitems.push(this.showMedDetailsOnList(element));
    this.disableInputsOfPastMed()
  }
  addNewItemForPastMed(): void {
    console.log(this.storageService.patientData);
    const control = <FormArray>this.pastmedform.controls['pastMedFormitems'];
    this.pastMedFormitems = this.pastmedform.get('pastMedFormitems') as FormArray;
    //this.pastMedFormitems.push(this.showMedDetailsOnList());
    //this.disableInputs()
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
        isChecked:[false],
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
        isNew:[true]
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
  getProblemCatalogSet() {
    this.patientHistoryService.getProblemCatalogSet().subscribe(
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
    this.patientHistoryService.getPastMedicalHistory(json).subscribe(
      (_success: any) => {
        this.pastMedList = [];
       this.pastMedList = _success.d.results;
       if (this.pastMedList.length > 0) {
        for (let index = 0; index < this.pastMedList.length; index++) {
         if (this.pastMedList[index]) {
          this.pastMedList[index]["FromDate"] = new Date(this.pastMedList[index].FromDate);
          this.pastMedList[index]["ToDate"] = new Date(this.pastMedList[index].ToDate);
           this.addItemForPatMed(this.pastMedList[index]);
         }else {
           this.addItemForPatMed();
         }
       }
     }
       else{
          this.addNewItemForPastMed();
       }

      },
      (_error: any) => {}
    );
  }

  checkDataForPastMed(){
    if (this.pastMedFormitems!=undefined) {
     this.patMedItemsArr = this.pastMedFormitems.value.filter(element => {
       if (element.isNew) {
        delete element.isChecked;
        delete element.isNew;
         element["FromDate"]=element.FromDate.getFullYear() + '-' + String(element.FromDate.getMonth() +1).padStart(2, '0') +'-'+ String(element.FromDate.getDate()).padStart(2, '0');
         element["ToDate"]=element.ToDate.getFullYear() + '-' + String(element.ToDate.getMonth() +1).padStart(2, '0') +'-'+ String(element.ToDate.getDate()).padStart(2, '0');
         return element;
       }

     });
     console.log(this.patMedItemsArr);

     if (this.patMedItemsArr.length >0) {
      this.patMedItemsArr.forEach(element => {
        this.savePastMedList(element);
      });
     }
   }
   else{
     this.patMedItemsArr = [];
   }

  }
  savePastMedList(element) {
    const json = {
      "RespEmp" : this.storageService.getUserProfile().Gpart,
      "Medhistid" : "",
      "Departmentou" : this.storageService.patientData.deptOrgUnit,
      "Treatou" : this.storageService.patientData.deptOrgUnit,
      "Einri" : this.storageService.einri,
      "Patnr" : this.storageService.patnr,
      "Disease" : element.Disease.Bcpname,
      "Bchid" : element.Disease.Bchid,
      "Bcpid" : element.Disease.Bcpid,
      "FromDate" : element.FromDate,
      "ToDate" : element.ToDate,
      "Treatment" : element.Treatment,
      "Remarks" : element.Remarks

    }
    this.patientHistoryService.savePastMedList(json).subscribe(
      (_success: any) => {
        this.resetPastMedForm();
        this.modalRef.hide();
      },
      (_error: any) => {}
    );
  }
  resetPastMedForm(){
    this.pastMedFormitems = this.pastmedform.get('pastMedFormitems') as FormArray;
    this.pastMedFormitems.clear();
    this.patMedItemsArr = [];
  }
  // attachments
  getAttachmentsList() {
    this.patientHistoryService.getAttachmentsList().subscribe(
      (_success: any) => {
       this.attachmentList = _success.d.results;

      },
      (_error: any) => {}
    );
  }
  public openModalForAttachment(
    template: TemplateRef<any>,
  ) {
    this.createAttachmentForm.reset();
    this.createCVISAttachmentForm.reset();
    this.removeFile();
    const config: ModalOptions = { class: 'modal-dialog-centered attachment-modal' };
      this.modalRef = this.modalServiceForAllergy.show(template,config);
      this.modalRefForStrucDoc.hide();
      this.userProfile = this.storageService.getUserProfile();
      this.modalRef.onHide.subscribe((reason: string | any) => {
        if(reason === 'backdrop-click') {
        }
      });

  }
  resetAttachment(_error?: any, p0?: string){
    this.modalRef.hide();
    this.createAttachmentForm.reset();
  }
  resetCVISAttachment(_error?: any, p0?: string){
    this.modalRef.hide();
    this.createCVISAttachmentForm.reset();
  }

  handleFileChange(event){
  this.file = event.target.files[0];
  this.filename = event.target.files[0].name;
  this.mimetype = event.target.files[0].type;
  this.convertFile(event.target.files[0]).subscribe((base64) => {
    this.base64Value = base64;
  });

  this.fileSelected = true;
  // Reset the showRedBorder variable
  this.showRedBorder = false;
  }
removeFile() {
  this.file = null;
  this.filename = '';
  this.mimetype = '';
  this.base64Value = '';

}

onFileSelected(template: TemplateRef<any>): void {
  this.uploadDocument(template);
}
uploadDocument(template) {
  if (this.file) {
    const config: ModalOptions = { class: 'document' };
    this.modalServiceForAllergy.show(template, config);
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      this.documentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        ((e.target as FileReader).result as string)
      );
    };
    fileReader.readAsDataURL(this.file);
  }
}

  convertFile(file: File): Observable<string> {
    const result = new ReplaySubject<string>(1);
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event) =>
      result.next(btoa(event.target.result.toString()));
    return result;
  }

  createAttachmentDoc(){
    this.createAttachmentForm.markAllAsTouched();
    if(this.createAttachmentForm.valid){
      const json = {
        "DocNr": "",
        "Version": "",
        "Dtid": "ZMED_ATCHM",
        "Einri": this.storageService.einri,
        "Patnr": this.storageService.patnr,
        "Falnr": this.storageService.falnr,
        "Orgdo": this.storageService.patientData.deptOrgUnit,
        "AttendPhy": this.storageService.getUserProfile().Gpart,
        "DocType": this.createAttachmentForm.controls.attachmentType.value,
        "FileName": this.filename,
        "Mimetype": this.mimetype,
        "AttachmentDataStr":this.base64Value
      }
      this.patientHistoryService.createAttachmentDoc(json).subscribe(
        (_success: any) => {
          this.resetAttachment();
          this.createAttachmentForm.reset();
          Swal.fire({
            title: 'Created Successfully',
            icon: 'success',
            confirmButtonText: 'OK',
          }).then(() => {
            this.file = null;
            this.filename = '';
            this.mimetype = '';
            this.base64Value = '';
            this.inPatientConfigurationService.getListOfAllPatientVisitDataSet();
            this.userconfig.getListOfPatientVisitDataSet()
          });
        },
        (_error: any) => {
          this.showErrorPopup("", _error.error.error.message.value, "Error")
        }
        );
      }
  }
  createCVISAttachmentDoc(){
    this.createCVISAttachmentForm.markAllAsTouched();    
    if(this.createCVISAttachmentForm.valid){
      const json = {
        "DocNr": "",
        "Version": "",
        "Dtid": "ZMED_CVIS",
        "Einri": this.storageService.einri,
        "Patnr": this.storageService.patnr,
        "Falnr": this.storageService.falnr,
        "Orgdo": this.storageService.patientData.deptOrgUnit,
        "AttendPhy": this.storageService.getUserProfile().Gpart,
        "DocType": "",
        "FileName": this.filename,
        "Mimetype": this.mimetype,
        "AttachmentDataStr":this.base64Value
      }
      this.patientHistoryService.createAttachmentDoc(json).subscribe(
        (_success: any) => {
          this.resetCVISAttachment();
          this.createCVISAttachmentForm.reset();
          Swal.fire({
            title: 'Created Successfully',
            icon: 'success',
            confirmButtonText: 'OK',
          }).then(() => {
            this.file = null;
            this.filename = '';
            this.mimetype = '';
            this.base64Value = '';
            this.inPatientConfigurationService.getListOfAllPatientVisitDataSet();
            this.userconfig.getListOfPatientVisitDataSet()
          });
        },
        (_error: any) => {
          this.showErrorPopup("", _error.error.error.message.value, "Error")
        }
        );
      }
  }

  showErrorPopup(title: any, text: any, messageType) {
    return Swal.fire({
      title: title ? title : '',
      text: text ? text : '',
      showCancelButton: messageType === 'Conform' ? true : false,
      confirmButtonColor: '#0890c5',
      cancelButtonColor: '#84898c',
      confirmButtonText: messageType === 'Error' ? 'Close' : 'Yes',
      cancelButtonText: 'No',
      customClass: { popup: 'myalertpopup' },
      icon: 'error'
    } as any);
  }

  public openModalForSpecialNotes(
    template?: TemplateRef<any>,
  ) {
    const config: ModalOptions = { class: 'modal-dialog-centered attachment-modal' };
      this.modalRef = this.modalServiceForAllergy.show(this.specialNotesModal,config);
      this.getSpecialNotes();
      this.modalRefForStrucDoc?.hide();
      this.userProfile = this.storageService.getUserProfile();
      this.modalRef.onHide.subscribe((reason: string | any) => {
        if(reason === 'backdrop-click') {
        }
      });
  }
  getSpecialNotes(){
    const json = {
      einri:this.storageService.einri,
      falnr:this.storageService.falnr
    }
    this.patientHistoryService.getSpecialNotes(json).subscribe(
      (_success: any) => {
        this.specialNote = _success.d.Content;
      },
      (_error: any) => {}
    );
  }
  saveSpecialNotes(){
    const json = {
      Einri:this.storageService.einri,
      Falnr:this.storageService.falnr,
      Content : this.specialNote,
    }
    this.patientHistoryService.saveSpecialNotes(json).subscribe(
      (_success: any) => {
        this.modalRef.hide();
        Swal.fire({
          title: 'Saved Successfully',
          icon: 'success',
          confirmButtonText: 'OK',
        });
      },
      (_error: any) => {}
    );
  }
  confirmDeleteSpecialNotes(){
    Swal.fire({
      text: "Are you sure you want to delete?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: { popup: 'myalertpopup' }
    } as any).then((result) => {
      if (result.value) {
        this.deleteSpecialNotes();
      }
    })
  }
  deleteSpecialNotes(){
    const json = {
      Einri:this.storageService.einri,
      Falnr:this.storageService.falnr,
      Content : this.specialNote,
    }
    this.patientHistoryService.deleteSpecialNotes(json).subscribe(
      (_success: any) => {
        this.modalRefForStrucDoc?.hide();
        this.modalRef?.hide();
        Swal.fire({
          title: 'Deleted Successfully',
          icon: 'success',
          confirmButtonText: 'OK',
        } as any);
      },
      (_error: any) => {}
    );
  }
}
