import { Component, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { AdmissionService } from '@services/admission/admission.service';
import { InPatientConfigurationService } from '@services/e-kardex/inPatient.service';
import { InPatientDataResult } from '@services/e-kardex/interfaces/inpatient-data';
import { PatientVisitDataResult } from '@services/e-kardex/interfaces/patient-visit-data';
import { PatientHistoryService } from '@services/e-kardex/patient-history.service';
import { UserConfigurationService } from '@services/e-kardex/user-configuration.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Observable, ReplaySubject, filter, forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { PatientDiagnoisiHistoryComponent } from './patient-diagnoisi-history/patient-diagnoisi-history.component';
import { PatientMedicalReportComponent } from './patient-medical-report/patient-medical-report.component';
import { PatientEducationDetailsComponent } from './patient-education-details/patient-education-details.component';
import { ErPhysicianComponent } from './er-physician/er-physician.component';
import { GlasgowComaScaleComponent } from './glasgow-coma-scale/glasgow-coma-scale.component';
import { FacePainScaleComponent } from './face-pain-scale/face-pain-scale.component';
import { NumericRatingScaleComponent } from './numeric-rating-scale/numeric-rating-scale.component';
import { DataShareService } from '@services/data-share.service';
import { ActionType, RedirectionType, WordType } from '@services/interfaces/common.enum';
import { SharedService } from '@services/shared.service';
import { BradenScaleComponent } from './braden-scale/braden-scale.component';
import { EmergencyNursingDocumentComponent } from './emergency-nursing-document/emergency-nursing-document.component';
import { DialysisAssessmentComponent } from './dialysis-assessment/dialysis-assessment.component';
import { PatientDocumentationService } from '@services/patient-documentation.service';
import { DataService } from '@services/data.service';
import { environment } from 'src/environments/environment';
import { MorseFallScaleComponent } from './morse-fall-scale/morse-fall-scale.component';
import { HemoCatheterComponent } from './hemo-catheter/hemo-catheter.component';
import { HemodialysisFistulaGraftComponent } from './hemodialysis-fistula-graft/hemodialysis-fistula-graft.component';

@Component({
  selector: 'app-patient-documentation',
  templateUrl: './patient-documentation.component.html',
  styleUrls: ['./patient-documentation.component.scss']
})
export class PatientDocumentationComponent implements OnInit {

  @ViewChild(DialysisAssessmentComponent) DialysisAssessment: DialysisAssessmentComponent;
  @ViewChild(ErPhysicianComponent) phyComp: ErPhysicianComponent;
  @ViewChild(PatientMedicalReportComponent) medComp: PatientMedicalReportComponent;
  @ViewChild(PatientEducationDetailsComponent) educationAssessmentComp: PatientEducationDetailsComponent;
  @ViewChild(GlasgowComaScaleComponent) GlasgowComaScaleComp: GlasgowComaScaleComponent;
  @ViewChild(FacePainScaleComponent) FacePainScaleComp: FacePainScaleComponent;
  @ViewChild(NumericRatingScaleComponent) NumericRatingScaleComp: NumericRatingScaleComponent;
  @ViewChild(BradenScaleComponent) BradenScaleComp: BradenScaleComponent;
  @ViewChild(EmergencyNursingDocumentComponent) EmergencyNursingDocumentComp: EmergencyNursingDocumentComponent;
  @ViewChild(MorseFallScaleComponent) morseFallScaleC: MorseFallScaleComponent;
  @ViewChild(HemoCatheterComponent) hemoCatheterC: HemoCatheterComponent;
  @ViewChild(HemodialysisFistulaGraftComponent) hemoDialysisFistulaGraftC: HemodialysisFistulaGraftComponent;

  @ViewChild('patientDiagnosisHistory', { static: true }) patientDiagnosisHistory: PatientDiagnoisiHistoryComponent;
  @ViewChild('releasepdfmodal') releasepdfmodal: TemplateRef<HTMLDivElement>;
  @ViewChild('notreleasedmodal') notreleasedmodal: TemplateRef<HTMLDivElement>;
  @ViewChild('selectIconPdf', { static: true }) selectIconPdf: TemplateRef<any>;
  @ViewChild('attachmentmodal') attachmentModal: any;
  modalRef: BsModalRef;
  phyAssess = false;
  nursAssess = false;
  attachments = false;
  educationAssessment = false;
  patienteducation = false;
  glasgowcomascale = false;
  emergencynursingdoc = false;
  facepainscale = false;
  bradenscale = false;
  assessment = false;
  morsefallScale = false;
  hemoCatheter = false;
  hemoDialysisFistulaGraft = false;
  numericratingscale = false;
  fallrisk = false;
  functional = false;
  nutritional = false;
  phyDocList = [];
  latestDocList = [];
  latestGlasgowComaScaleList = [];
  latestEmergencyNursingDocList = [];
  latestNumericratingscaleList = [];
  latestFacePainScaleList = [];
  latestBridentScaleList = [];
  educationAssList = [];
  documentTypeFilter = []
  createDate: any;
  searchString: any = '';
  filterToDate: Date;
  filterFromDate: Date;
  dateRange: any;
  documentType: any;
  pdfUrl: any;
  openPhyAssess = false;
  openGlasgowComaScale = false;
  openFacePainScale = false;
  openNumericRatingScale = false;
  openBradenScale = false;
  openAssessment = false;
  openMorseFallScale = false;
  openHemoCatheter = false;
  openHemoDialysisFistulaGraft = false;
  openEmergencyNursingDoc = false;
  actionType = '';
  selectedDocName: string;
  patientProfileDocumet: any;
  pdfTemplateRef: BsModalRef;
  documentTypeFilterValue: any[] = [];
  asc: boolean = true;
  desc: boolean = false;
  PatientData: any;
  medReport: boolean = false;
  openMedReport: boolean = false;
  openEducationAssessment: boolean = false;
  selectedDocData: any;
  medlatestDocList = [];
  medDocList = [];
  releaseDocumentImage: string;
  pdfUrlType: string;
  htmlData: any;
  selectedIconPdf: BsModalRef;

  createAttachmentForm: FormGroup;
  attachmentList: any;
  modalRefForStrucDoc: BsModalRef;
  userProfile: any;
  base64Value: string;
  mimetype: any;
  filename: any;
  file: File;
  selectedFile: File | null = null;
  documentUrl: SafeResourceUrl | null = null;

  patientVisitRecord: PatientVisitDataResult = {} as PatientVisitDataResult;
  inPatientVisitData: InPatientDataResult;
  pdfFormDiv: boolean;
  paramsObject: any;
  seletcedCurrentDoc: any;
  InOutPatientViewValue: { showBoth: boolean; showIn: boolean; showOut: boolean; };
  imgType: string;
  apiJson: any;

  latestDocData: any;
  DocStatus: any;

  latestMorseFallScaleData: any;
  latestHemoCatheterData: any;
  latestHemoDialysisFistulaGraftData: any;

  constructor(
    private modalService: BsModalService,
    private emergencyService: EmergencyService,
    private inPatientConfigurationService: InPatientConfigurationService,
    private userconfig: UserConfigurationService,
    private patientHistoryService: PatientHistoryService,
    private storageService: StorageService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private admissionService: AdmissionService,
    private userConfigurationService: UserConfigurationService,
    private formBuilder: FormBuilder,
    private dataShareService: DataShareService,
    private sharedService: SharedService,
    private patientDocService: PatientDocumentationService,
    private dataService: DataService
  ) {
    this.route.queryParams.subscribe((params) => {
      this.paramsObject = params;
      this.storageService.setEinri(params['einri']);
      this.storageService.setFalnr(params['falnr']);
      this.storageService.setLfdnr(params['lfdnr']);
      this.storageService.setPatnr(params['patnr']);
    });
    this.apiJson = {
      Einri: this.storageService.einri,
      Falnr: this.storageService.falnr,
      Patnr: this.storageService.patnr,
      Lfdnr: this.storageService.lfdnr,
      Lfdbw: this.storageService.lfdnr
    }
  }


  ngOnInit() {
    this.createAttachmentForm = this.formBuilder.group({
      attachmentType: [null, Validators.required],
      attachmentFile: [null, Validators.required],
    });
    // this.getLatestAssessment();
    // this.getEducationAssessment();
    // this.getPatientProfile();
    this.getTriageLatestDocuments();
    this.getPhyAssessment();
    this.getMedLatestAssessment();
    this.fetchLatestDetails();
    this.LatestDocSet();
    this.LatestMFSSet();
    this.LatestHemoCatheter();
    this.LatestHemoDialysisFistulaGraft();

    this.patientDocService.dialysisAssecementForm.setControl("TOMONITOR", new FormArray([]))
    this.patientDocService.dialysisAssecementForm.reset();

  }

  LatestDocSet() {
    const json = {
      Einri: this.storageService.einri,
      Patnr: this.storageService.patnr,
      Falnr: this.storageService.falnr,
      Lfdnr: this.storageService.lfdnr,
    };

    this.emergencyService.getLatestDocSet(json).subscribe((data: any) => {
        if(data){
          this.latestDocData = data.d.results[0];
        }
      }, (error) => {
        console.error(error);
      });
  }

  LatestMFSSet(){
    const json = {
      Einri: this.storageService.einri,
      Patnr: this.storageService.patnr,
      Falnr: this.storageService.falnr,
    };

    this.emergencyService.getLatestMFSSet(json).subscribe((data: any)=>{
      if(data){
        this.latestMorseFallScaleData = data.d.results[0];
        this.patientDocService.latestMorseFallScaleData = this.latestMorseFallScaleData;
      }
    }, (error)=>{
      console.error(error);
    })
  }

  LatestHemoCatheter(){
    const json = {
      Einri: this.storageService.einri,
      Patnr: this.storageService.patnr,
      Falnr: this.storageService.falnr,
      Lfdnr: this.storageService.lfdnr,
    }

    this.emergencyService.getLatestHemoCatheter(json).subscribe({
      next : (data: any)=>{
        if(data){
          this.latestHemoCatheterData = {...data.d.results[0], AttMimeType: 'PDF'};
          this.patientDocService.latestHemoCatheterData = this.latestHemoCatheterData;
        }
      },
      error : (error)=>{
        console.error(error);
      }
    })
  }

  LatestHemoDialysisFistulaGraft(){
    const json = {
      Einri: this.storageService.einri,
      Patnr: this.storageService.patnr,
      Falnr: this.storageService.falnr,
      Lfdnr: this.storageService.lfdnr,
    }

    this.emergencyService.getLatestHemoDialysisFistulaGraft(json).subscribe({
      next : (data: any)=>{
        if(data){
          this.latestHemoDialysisFistulaGraftData = data.d.results[0];
          this.patientDocService.latestHemoDialysisFistulaGraftData = this.latestHemoDialysisFistulaGraftData;
        }
      },
      error : (error)=>{
        console.error(error);
      }
    })
  }

  getLatestAssessment() {
    this.emergencyService.getLatestAssesmentResult(this.apiJson).subscribe({
      next: (_success: any) => {
        // Handle successful data retrieval
        this.latestGlasgowComaScaleList = _success.d.results.filter((ele) => ele.Dtid == 'SCA_COMA');
        this.latestFacePainScaleList = _success.d.results.filter((ele) => ele.Dtid == 'SCA_FAC');
        this.latestNumericratingscaleList = _success.d.results.filter((ele) => ele.Dtid == 'SCA_NMRTSC');
        this.latestBridentScaleList = _success.d.results.filter((ele) => ele.Dtid == 'SCA_BRADEN');

      },
      error: (err: any) => {
        // Handle errors if the request fails
        console.error('Error  Data:', err);
        this.sharedService.waringSwallModel(`GET Error : ${err}`);
      },
    });
  }

  getEducationAssessment() {

    this.emergencyService.getEduAssesLatestDocSet(this.apiJson).subscribe({
      next: (_success: any) => {
        // Handle successful data retrieval
        this.educationAssList = _success.d.results;
        if (this.actionType == 'createandrelease') {
          // this.educationAssessmentComp.ngOnInit();
          // this.release();
        }
      },
      error: (err: any) => {
        // Handle errors if the request fails
        console.error('Error fetching Data:', err);
        this.sharedService.waringSwallModel(`GET Error : ${err}`);
      },
    });

  }

  getPatientProfile() {
    this.admissionService.getDicumentDetails(this.storageService.einri, '1', this.storageService.patnr, '', this.storageService.falnr).subscribe({
      next: (_success: any) => {
        // Handle successful data retrieval
        this.documentTypeFilterValue = _success.d.results;
        this.sort();
        if (this.documentTypeFilterValue.length) {
          this.documentTypeFilterValue.forEach((element) => {
            let checkPatinet = this.documentTypeFilter.find(el => el.Dtid === element.Dtid);
            if (!checkPatinet) {
              this.documentTypeFilter.push({
                Dtid: element.Dtid,
                DtidText: element.DtidText
              })
            }
          })
        }
      },
      error: (err: any) => {
        // Handle errors if the request fails
        console.error('Error Data:', err);
        this.sharedService.waringSwallModel(`GET Error : ${err}`);
      },
    });
  }

  getTriageLatestDocuments() {
    this.emergencyService.getTriageLatestDocumentSet(this.apiJson).subscribe({
      next: (data: any) => {
        // Handle successful data retrieval
        this.latestEmergencyNursingDocList = data.d.results;
      },
      error: (err: any) => {
        // Handle errors if the request fails
        console.error('Error  Data:', err);
        this.sharedService.waringSwallModel(`GET Error : ${err}`);
      },
    });

  }

  // Assuming this code is within a method of a class
  fetchLatestDetails() {
    const latestAssessment$ = this.emergencyService.getLatestAssesmentResult(this.apiJson);
    const educationAssessment$ = this.emergencyService.getEduAssesLatestDocSet(this.apiJson);
    const patientProfile$ = this.admissionService.getDicumentDetails(
      this.storageService.einri,
      '1',
      this.storageService.patnr,
      '',
      this.storageService.falnr
    );

    forkJoin({
      latestAssessment: latestAssessment$,
      educationAssessment: educationAssessment$,
      patientProfile: patientProfile$
    }).subscribe({
      next: (results: any) => {
        // Handle successful data retrieval
        const latestAssessmentResponse = results.latestAssessment;
        const educationAssessmentResponse = results.educationAssessment;
        const patientProfileResponse = results.patientProfile;

        // Handle latest assessment response
        this.latestGlasgowComaScaleList = latestAssessmentResponse.d.results.filter(ele => ele.Dtid === 'SCA_COMA');
        this.latestFacePainScaleList = latestAssessmentResponse.d.results.filter(ele => ele.Dtid === 'SCA_FAC');
        this.latestNumericratingscaleList = latestAssessmentResponse.d.results.filter(ele => ele.Dtid === 'SCA_NMRTSC');
        this.latestBridentScaleList = latestAssessmentResponse.d.results.filter(ele => ele.Dtid === 'SCA_BRADEN');

        // Handle education assessment response
        this.educationAssList = educationAssessmentResponse.d.results;

        // Handle patient profile response
        this.documentTypeFilterValue = patientProfileResponse.d.results;
        this.sort();
        if (this.documentTypeFilterValue.length) {
          this.documentTypeFilterValue.forEach(element => {
            const checkPatient = this.documentTypeFilter.find(el => el.Dtid === element.Dtid);
            if (!checkPatient) {
              this.documentTypeFilter.push({
                Dtid: element.Dtid,
                DtidText: element.DtidText
              });
            }
          });
        }

        this.checkForRedirectionAction();
      },
      error: (err: any) => {
        // Handle errors if the request fails
        console.error('Error  Data:', err);
        this.sharedService.waringSwallModel(`GET Error : ${err}`);
      },
    });
  }


  checkForRedirectionAction() {
    if (this.paramsObject.action == 'Add' && this.paramsObject.doctype == RedirectionType.DIALYSIS$) {
      this.selectAssessment('assessment', this.latestDocData)
      this.openDocument('create');
    } else if (this.paramsObject.action == 'Update' && this.paramsObject.doctype == RedirectionType.DIALYSIS$) {
      this.selectAssessment('assessment', this.latestDocData)
      this.openDocument('edit');
    } else if (this.paramsObject.action == 'View' && this.paramsObject.doctype == RedirectionType.DIALYSIS$) {
      this.getPatientProfileData(this.latestDocData);
    } else if (this.paramsObject.action == 'Add' && this.paramsObject.doctype == RedirectionType.BRADEN$) {
      this.selectAssessment('bradenscale', this.latestBridentScaleList[0])
      this.openDocument('create');
    } else if (this.paramsObject.action == 'Update' && this.paramsObject.doctype == RedirectionType.BRADEN$) {
      this.selectAssessment('bradenscale', this.latestBridentScaleList[0])
      this.openDocument('edit');
    } else if (this.paramsObject.action == 'View' && this.paramsObject.doctype == RedirectionType.BRADEN$) {
      this.getPatientProfileData(this.latestBridentScaleList[0]);
    } else if (this.paramsObject.action == 'Add' && this.paramsObject.doctype == RedirectionType.MORSE$) {
      this.selectAssessment('morsefallScale', this.latestMorseFallScaleData)
      this.openDocument('create');
    } else if (this.paramsObject.action == 'Update' && this.paramsObject.doctype == RedirectionType.MORSE$) {
      this.selectAssessment('morsefallScale', this.latestMorseFallScaleData)
      this.openDocument('edit');
    } else if (this.paramsObject.action == 'View' && this.paramsObject.doctype == RedirectionType.MORSE$) {
      this.getPatientProfileData(this.latestMorseFallScaleData);
    } else if (this.paramsObject.action == 'Add' && this.paramsObject.doctype == RedirectionType.HBCA$) {
      this.selectAssessment('hemoCatheter', this.latestHemoCatheterData)
      this.openDocument('create');
    } else if (this.paramsObject.action == 'Update' && this.paramsObject.doctype == RedirectionType.HBCA$) {
      this.selectAssessment('hemoCatheter', this.latestHemoCatheterData)
      this.openDocument('edit');
    } else if (this.paramsObject.action == 'View' && this.paramsObject.doctype == RedirectionType.HBCA$) {
      this.getPatientProfileData(this.latestHemoCatheterData);
    } else if (this.paramsObject.action == 'Add' && this.paramsObject.doctype == RedirectionType.HBFG$) {
      this.selectAssessment('hemoDialysisFistulaGraft', this.latestHemoDialysisFistulaGraftData)
      this.openDocument('create');
    } else if (this.paramsObject.action == 'Update' && this.paramsObject.doctype == RedirectionType.HBFG$) {
      console.log(this.latestHemoDialysisFistulaGraftData);
      debugger
      this.selectAssessment('hemoDialysisFistulaGraft', this.latestHemoDialysisFistulaGraftData)
      this.openDocument('edit');
    } else if (this.paramsObject.action == 'View' && this.paramsObject.doctype == RedirectionType.HBFG$) {
      this.getPatientProfileData(this.latestHemoDialysisFistulaGraftData);
    } 
  }

  openPastHistory(template: TemplateRef<any>) {
    const config: ModalOptions = { class: 'modal-dialog-centered modal-lg pastdochistory' };
    this.modalRef = this.modalService.show(template, config);
  }


  selectAssessment(name: string, selectedDocData: any) {

    this.selectedDocData = selectedDocData;

    // Define a mapping between assessment names and corresponding properties
    const assessments = {
      'nursing': { educationAssessment: true, selectedDocName: 'Education Assessment' },
      'phy': { phyAssess: true, selectedDocName: 'ER Physician Assessment' },
      'medreport': { medReport: true, selectedDocName: 'Medical Report' },
      'attachments': { attachments: true, selectedDocName: 'Attachments Document' },
      'glasgowcomascale': { glasgowcomascale: true, selectedDocName: 'Glasgow Coma Scale' },
      'facepainscale': { facepainscale: true, selectedDocName: 'Face Pain Scale' },
      'bradenscale': { bradenscale: true, selectedDocName: 'Braden Scale' },
      'numericratingscale': { numericratingscale: true, selectedDocName: 'Numeric rating scale(more than 8 years)' },
      'emergencynursingdoc': { emergencynursingdoc: true, selectedDocName: 'Emergency Nursing Document' },
      'educationAssessment': { educationAssessment: true, selectedDocName: 'Education Assesment' },
      'assessment': { assessment: true, selectedDocName: 'Dialysis Assessment' },
      'morsefallScale': { morsefallScale: true, selectedDocName: 'Morse Fall Scale' },
      'hemoCatheter': { hemoCatheter: true, selectedDocName: 'Hemo Catheter' },
      'hemoDialysisFistulaGraft': { hemoDialysisFistulaGraft: true, selectedDocName: 'IC Bundle for Hemodialysis Fistula/Graft' } 
    };

    // Reset all flags to false initially
    this.phyAssess = false;
    this.nursAssess = false;
    this.medReport = false;
    this.attachments = false;
    this.educationAssessment = false;
    this.glasgowcomascale = false;
    this.facepainscale = false;
    this.numericratingscale = false;
    this.bradenscale = false;
    this.emergencynursingdoc = false;
    this.assessment = false;
    this.morsefallScale = false;
    this.hemoCatheter = false;
    this.hemoDialysisFistulaGraft = false;

    // Check if the provided name exists in the assessments mapping
    if (name in assessments) {
      const assessment = assessments[name];
      // Update the corresponding flags and selected document name
      Object.assign(this, assessment);
      this.selectedDocName = assessment.selectedDocName;
    }
  }

  selectNursAssessment(name) {
    if (name == 'patienteducation') {
      this.patienteducation = true;
      this.fallrisk = false;
      this.functional = false;
      this.nutritional = false;
    } else if (name == 'fallrisk') {
      this.fallrisk = true;
      this.patienteducation = false;
      this.functional = false;
      this.nutritional = false;
    } else if (name == 'functional') {
      this.functional = true;
      this.patienteducation = false;
      this.fallrisk = false;
      this.nutritional = false;
    } else if (name == 'nutritional') {
      this.nutritional = true;
      this.functional = false;
      this.patienteducation = false;
      this.fallrisk = false;
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

  documentFilter(event, type) {
    if (type == 'date') {
      this.dateRange = event;
    }

    if (this.dateRange || this.documentType) {
      this.patientProfileDocumet = [];
      let filterValue = this.documentTypeFilterValue;
      if (this.documentType) {
        filterValue = filterValue.filter((element) => {
          if (this.documentType == element.Dtid) {
            return element;
          }
        })
      }

      if (this.dateRange) {
        this.filterFromDate = this.dateRange[0];
        this.filterToDate = this.dateRange[1];
        filterValue = filterValue.filter(item => {
          let itemDate = new Date(this.dateFormate(this.getDate(item.Dodat)));
          let fromDate = new Date(this.filterFromDate);
          let toDate = new Date(this.filterToDate);
          return itemDate >= fromDate && itemDate <= toDate;
        }
        );
      }
      this.patientProfileDocumet = this.groupBy(filterValue, 'Dodat');
    } else {
      this.patientProfileDocumet = this.groupBy(this.documentTypeFilterValue, 'Dodat');
    }
    this.sortedDocuments = Object.keys(this.patientProfileDocumet).map(key => ({
      date: new Date(parseInt(key.replace('/Date(', '').replace(')/', ''))),
      documents: this.patientProfileDocumet[key]
    }));
  }

  dateFormate(dt) {
    return dt.getFullYear() + "/" + (dt.getMonth() + 1) + "/" + dt.getDate();
  }

  getPhyAssessment() {
    const json = {
      Einri: this.storageService.einri,
      Falnr: this.storageService.falnr,
    }
    this.emergencyService.getPhyAssessment(json).subscribe(
      (_success: any) => {
        this.phyDocList = _success.d.results;
      },
      (_error: any) => { }
    );
  }


  groupBy(array: any[], key: string): any {
    return array.reduce((result, currentValue) => {
      (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
      return result;
    }, {});
  }
  async create() {
    (await this.phyComp.createPhyDoc()).subscribe((res: any) => {
      Swal.fire({
        text: "Document is created successfully",
        icon: 'success',
        confirmButtonText: 'Ok',
        customClass: 'myalertpopup'
      })
      this.phyComp.resetAll();
      this.refresh();
    }, (_error: any) => { });
  }
  async update() {
    (await this.phyComp.updatePhyDoc()).subscribe((res: any) => {
      Swal.fire({
        text: "Document is updated successfully",
        icon: 'success',
        confirmButtonText: 'Ok',
        customClass: 'myalertpopup'
      })
      this.phyComp.resetAll();
      this.refresh();
    }, (_error: any) => { });
  }
  async release() {
    (await this.phyComp.releasePhyDoc()).subscribe((res: any) => {
      Swal.fire({
        text: "Document is released successfully",
        icon: 'success',
        confirmButtonText: 'Ok',
        customClass: 'myalertpopup'
      })
      this.phyComp.resetAll();
      this.refresh();
    }, (_error: any) => { });
  }
  async delete() {
    Swal.fire({
      title: 'Confirm',
      text: 'Do you want to delete?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: 'myalertpopup'
    }).then(async (result) => {
      if (result.value) {

        (await this.phyComp.deletePhyAssessment()).subscribe(
          (_success: any) => {
            Swal.fire({
              text: "Document is deleted successfully",
              icon: 'success',
              confirmButtonText: 'Ok',
              customClass: 'myalertpopup'
            })
            this.phyComp.resetAll();
            this.refresh();
          },
          (_error: any) => { }
        );
      }
    });
  }
  async createCopy() {
    (await this.phyComp.copyPhyDoc()).subscribe((res: any) => {
      Swal.fire({
        text: "Document is created successfully",
        icon: 'success',
        confirmButtonText: 'Ok',
        customClass: 'myalertpopup'
      })
      this.phyComp.resetAll();
      this.refresh();
    }, (_error: any) => { });
  }
  async createAndRelease() {
    (await this.phyComp.createPhyDoc()).subscribe((res: any) => {
      this.phyComp.resetAll();
      this.refresh();
    }, (_error: any) => { });
  }
  openReleasePdf(id) {
    this.pdfUrl = '';
    this.getReleasedDoc(id);
  }
  getReleasedDoc(id) {
    const json = {
      Dockey: id
    }
    this.emergencyService.getReleasedPdf(json).subscribe(
      (_success: any) => {
        if (_success) {
          this.pdfUrlType = 'pdf';
          const config: ModalOptions = {
            class: 'modal-dialog-centered modal-xl pdfmodal-size',
          };
          this.modalRef = this.modalService.show(this.releasepdfmodal, config);
          this.pdfUrlConvertToBlob(_success?.d?.AttachmentData);
          // this.pdfUrl=this.sanitizer.bypassSecurityTrustResourceUrl('data:application/pdf;base64,'+ _success?.d?.AttachmentData);
        }
      },
      (_error: any) => { }
    );
  }

  onReleaseHistoryData(releaseId: any, item) {
    this.seletcedCurrentDoc = item;
    this.inPatientVisitData = {} as InPatientDataResult;
    this.patientVisitRecord = {} as PatientVisitDataResult;
    this.admissionService
      .getReleaseHistoryData(releaseId, this.paramsObject.einri)
      .subscribe((data) => {
        if (data && data.length) {
          this.patientDiagnosisHistory.showPopup(data);
        }
      });
  }

  onOpenAttachment(attachmentId: any) {
    this.inPatientVisitData = {} as InPatientDataResult;
    this.patientVisitRecord = {} as PatientVisitDataResult;
    if (attachmentId.Mimetype == 'PDF' || attachmentId.Mimetype == 'url' || attachmentId.Mimetype == 'image/bmp' || attachmentId.Mimetype == 'HTML') {
      this.admissionService
        .getPatientProfilePDF(attachmentId.DocKey)
        .subscribe((_success: any) => {
          if (_success) {
            this.patientVisitRecord = {
              ..._success,
              DOCCATTOATTACHMENTS: { results: [_success] },
            };

            this.InOutPatientViewValue = {
              showBoth: false,
              showIn: false,
              showOut: true,
            };

            if (attachmentId.Mimetype == 'PDF') {
              this.pdfUrlConvertToBlob(_success.d.AttachmentData);
              this.pdfUrlType = 'pdf';
              this.pdfFormOpen();
            } else if (attachmentId.Mimetype == 'url') {
              window.open(_success.d.Url);
            } else if (attachmentId.Mimetype == 'image/bmp') {
              this.pdfUrlType = 'image';
              this.pdfFormOpen();
              this.releaseDocumentImage = 'data:image/png;base64,' + _success.d.AttachmentData;
            } else if (attachmentId.Mimetype == 'HTML') {
              this.pdfUrlType = 'html';
              this.pdfFormOpen();
              this.htmlData = this.sanitizer.bypassSecurityTrustHtml(_success.d.AttachmentDataStr);
            }
          }
        });
    }
  }

  pdfFormOpen() {
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-xl pdfmodal-size',
    };
    this.selectedIconPdf = this.modalService.show(this.selectIconPdf, config);
    // this.openRealsePDFModal(this.seletcedCurrentDoc, this.labpdfmodal, '')
    this.pdfFormDiv = true;
  }

  modelFormOpen(value, oldVersion) {

  }

  pdfUrlConvertToBlob(pdfValue) {
    let byteArray = new Uint8Array(atob(pdfValue).split("").map(char => char.charCodeAt(0)));
    let file = new Blob([byteArray], { type: "application/pdf" });
    this.pdfUrl = file;
  }
  refresh() {
    if (this.openGlasgowComaScale) {
      this.GlasgowComaScaleComp.ngOnDestroy();
    }
    if (this.openFacePainScale) {
      this.FacePainScaleComp.ngOnDestroy();
    }
    if (this.openNumericRatingScale) {
      this.NumericRatingScaleComp.ngOnDestroy();
    }
    if (this.openBradenScale) {
      this.BradenScaleComp.ngOnDestroy();
    }
    if (this.openAssessment) {
      this.DialysisAssessment.ngOnDestroy();
      this.refreshDialysisAssessment();
    }
    if (this.openEducationAssessment) {
      this.educationAssessmentComp.ngOnDestroy();
    }

    if (this.openEmergencyNursingDoc) {
      this.EmergencyNursingDocumentComp.ngOnDestroy();
    }

    this.getLatestAssessment();
    this.getPhyAssessment();
    this.getTriageLatestDocuments();
    this.getMedLatestAssessment();
    this.getEducationAssessment();
    this.getPatientProfile();
    // this.fetchLatestDetails();
    this.LatestDocSet();
    this.LatestMFSSet();
    this.LatestHemoCatheter();
    this.LatestHemoDialysisFistulaGraft();

    this.phyAssess = false;
    this.nursAssess = false;
    this.glasgowcomascale = false;
    this.facepainscale = false;
    this.numericratingscale = false;
    this.bradenscale = false;
    this.educationAssessment = false;
    this.medReport = false;
    this.emergencynursingdoc = false;
    this.assessment=false;
    this.openPhyAssess = false;
    this.openMedReport = false;
    this.openGlasgowComaScale = false;
    this.openFacePainScale = false;
    this.openNumericRatingScale = false;
    this.openBradenScale = false;
    this.openEducationAssessment = false;
    this.openEmergencyNursingDoc = false;
    this.openMorseFallScale = false;
    this.openHemoCatheter = false;
    this.openHemoDialysisFistulaGraft = false;

    this.searchString = '';
    this.dateRange = '';
    this.documentType = undefined;
    this.patientProfileDocumet = this.documentTypeFilterValue;
    this.medDocList = [];
    this.latestDocData = null;
    this.latestMorseFallScaleData = null;
    this.latestHemoCatheterData = null;
    this.latestHemoDialysisFistulaGraftData = null;
  }

  
  refreshDialysisAssessment(){
    this.openAssessment = false;
    this.selectedDocData = null;
    this.latestDocData = null;
    this.ngOnInit();
    this.emergencyService.tabPanelNavigation("Documentation");
  }

  openDocument(action) {
    this.actionType = action;
    
    // education assessment...
    if (this.educationAssessment) {
      if (action == 'create') {
        this.openEducationAssessment = true;
      } else if (action == 'edit') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.openEducationAssessment = true;;
          let valueObj = {
            type: WordType.EditEA,
            docKey: this.selectedDocData.Dockey
          }
          this.dataShareService.sendActionType(ActionType.Update$, true, valueObj);
        }
      } else if (action == 'delete') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.deleteEducationAss();
        } else {
          this.sharedService.waringSwallModel(`The document is already released`);
        }
      } else if (action == 'release') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.releaseEducationAss();
        } else {
          this.sharedService.waringSwallModel(`The document is already released`);
        }
      } else if (action == 'copy') {
        this.openEducationAssessment = true;
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.openEducationAssessment = true;;
          let valueObj = {
            type: WordType.CopyEA,
            docKey: this.selectedDocData.Dockey
          }
          this.dataShareService.sendActionType(ActionType.Copy$, true, valueObj);
        }
      } else if (action == 'createandrelease') {
        // this.openEducationAssessment = true;
        // this.educationAssessmentComp.saveAndReleaseEducation(false);
        // this.educationAssessmentComp.ngOnInit();
        // this.createAndReleaseMed();
      }
    }
    // attachment...
    else if (this.attachments) {
      if (action == 'create') {
        this.openModalForAttachment();
      }
    }
    // Glasgow Coma Scale...
    else if (this.glasgowcomascale) {
      if (action == 'create') {
        this.openGlasgowComaScale = true;
      } else if (action == 'edit') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.openGlasgowComaScale = true;;
          let valueObj = {
            type: WordType.EditGGCS,
            docKey: this.selectedDocData.Dockey
          }
          this.dataShareService.sendActionType(ActionType.Update$, true, valueObj);
        } else if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.sharedService.waringSwallModel(`The document is already released`);
        } else if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'N/A') {
          this.sharedService.waringSwallModel(`You can't edit the document, due to N/A.`)
        }
      } else if (action == 'delete') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.sharedService.waringSwallModel(`The document is already released`)
        }
      } else if (action == 'release') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.sharedService.waringSwallModel(`The document is already released`)
        }
      } else if (action == 'copy') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.openGlasgowComaScale = true;
          let valueObj = {
            type: WordType.CopyGGCS,
            docKey: this.selectedDocData.Dockey
          }
          this.dataShareService.sendActionType(ActionType.Copy$, true, valueObj);
        }
      } else if (action == 'createandrelease') {
        this.openGlasgowComaScale = true;
        setTimeout(() => {
          this.GlasgowComaScaleComp.ngOnInit();
        }, 1000);
        this.createAndRelease();
      }
    }
    // Face Pain Scale...
    else if (this.facepainscale) {
      if (action == 'create') {
        this.openFacePainScale = true;
      } else if (action == 'edit') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.openFacePainScale = true;
          let valueObj = {
            type: WordType.EditFPS,
            docKey: this.selectedDocData.Dockey
          }
          this.dataShareService.sendActionType(ActionType.Update$, true, valueObj);
        } else if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.sharedService.waringSwallModel(`The document is already released`)
        } else if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'N/A') {
          this.sharedService.waringSwallModel(`You can't edit the document, due to N/A.`)
        }
      } else if (action == 'delete') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.sharedService.waringSwallModel(`The document is already released`)
        }
      } else if (action == 'release') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.sharedService.waringSwallModel(`The document is already released`)
        }
      } else if (action == 'copy') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.openFacePainScale = true;
          let valueObj = {
            type: WordType.CopyFPS,
            docKey: this.selectedDocData.Dockey
          }
          this.dataShareService.sendActionType(ActionType.Copy$, true, valueObj);
        }
      } else if (action == 'createandrelease') {
        this.openFacePainScale = true;
        this.FacePainScaleComp.ngOnInit();
        this.createAndRelease();
      }
    }
    // Numeric Rating Scale...
    else if (this.numericratingscale) {
      if (action == 'create') {
        this.openNumericRatingScale = true;
        //this.NumericRatingScaleComp.ngOnInit();
      } else if (action == 'edit') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.openNumericRatingScale = true;
          let valueObj = {
            type: WordType.EditNRS,
            docKey: this.selectedDocData.Dockey
          }
          this.dataShareService.sendActionType(ActionType.Update$, true, valueObj);
        } else if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.sharedService.waringSwallModel(`The document is already released`)
        } else if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'N/A') {
          this.sharedService.waringSwallModel(`You can't edit the document, due to N/A.`)
        }
      } else if (action == 'delete') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.sharedService.waringSwallModel(`The document is already released`)
        }
      } else if (action == 'release') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.sharedService.waringSwallModel(`The document is already released`)
        }
      } else if (action == 'copy') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.openNumericRatingScale = true;
          let valueObj = {
            type: WordType.CopyNRS,
            docKey: this.selectedDocData.Dockey
          }
          this.dataShareService.sendActionType(ActionType.Copy$, true, valueObj);
        }
      } else if (action == 'createandrelease') {
        this.openNumericRatingScale = true;
        this.createAndRelease();
      }
    }
    // Braden Scale
    else if (this.bradenscale) {
      if (action == 'create') {
        this.openBradenScale = true;
      } else if (action == 'edit') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.openBradenScale = true;
          let valueObj = {
            type: WordType.EditBS,
            docKey: this.selectedDocData.Dockey
          }
          this.dataShareService.sendActionType(ActionType.Update$, true, valueObj);
        } else if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.sharedService.waringSwallModel(`The document is already released`)
        } else if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'N/A') {
          this.sharedService.waringSwallModel(`You can't edit the document, due to N/A.`)
        }
      } else if (action == 'delete') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.sharedService.waringSwallModel(`The document is already released`)
        }
      } else if (action == 'release') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.sharedService.waringSwallModel(`The document is already released`)
        }
      } else if (action == 'copy') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.openBradenScale = true;
          let valueObj = {
            type: WordType.CopyBS,
            docKey: this.selectedDocData.Dockey
          }
          this.dataShareService.sendActionType(ActionType.Copy$, true, valueObj);
        }
      } else if (action == 'createandrelease') {
        // this.openBradenScale = true;
        //this.NumericRatingScaleComp.ngOnInit();
        // this.createAndRelease();
      }
    }
    // Emergency Nursing Document
    else if (this.emergencynursingdoc) {
      if (action == 'create') {
        this.openEmergencyNursingDoc = true;
      } else if (action == 'edit') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.openEmergencyNursingDoc = true;;
          let valueObj = {
            type: WordType.EditEND,
            docKey: this.selectedDocData.Dockey,
            latestTriageData: this.latestEmergencyNursingDocList
          }
          this.dataShareService.sendActionType(ActionType.Update$, true, valueObj);
        }
      } else if (action == 'delete') {
      } else if (action == 'release') {
      } else if (action == 'copy') {
      } else if (action == 'createandrelease') {
      }
    }
    // Dialysis Assessment
    else if (this.assessment) {
      if (action == 'create' && this.selectedDocData?.StatusTxt != 'Draft' && this.selectedDocData?.StatusTxt != "Released") {
        this.openAssessment = true;
      }else if(action == 'edit' && this.selectedDocData?.StatusTxt == 'Draft' && this.selectedDocData?.StatusTxt != "Released") {
        this.openAssessment = true;
      }else if (action == 'release' && this.selectedDocData?.StatusTxt == 'Draft') {   
        console.log("status 2")

        const json = {
          Dockey: this.latestDocData?.Dockey,
        };

        this.emergencyService.getDailysisSet(json).subscribe((data:any)=>{
          if(data.d.results[0]){
            const payload = {
              ...data.d.results[0],
              TOMONITOR: data.d.results[0]?.TOMONITOR.results,
              DocStatus: '2',
              TreatmentDate: this.formatDate(this.patientDocService.formatDate(data.d.results[0]?.TreatmentDate)),
              DialysisFDate: this.formatDate(this.patientDocService.formatDate(data.d.results[0]?.DialysisFDate)),
              TreatmentTime: this.formatTime(data.d.results[0]?.TreatmentTime),
              DialysisFTime: this.formatTime(data.d.results[0]?.DialysisFTime),
              PTreatmentDate: this.formatDate(this.patientDocService.formatDate(data.d.results[0]?.PTreatmentDate)),
              PTreatmentTime: this.formatTime(data.d.results[0]?.PTreatmentTime),
              PrescribedTime: this.formatTime(data.d.results[0]?.PrescribedTime),
            };

            this.emergencyService.releaseDialysisDoc(payload).subscribe((resp)=>{
              Swal.fire({
                text: "Document is released successfully",
                icon: 'success',
                confirmButtonText: 'Ok',
                customClass: 'myalertpopup'
              })
              this.refresh();
            },(error)=>{
              console.log(error);
            })
          }
        }, (err)=>{
          console.log(err);
        }) 
      }else if (action == 'copy' && this.selectedDocData?.StatusTxt == "Released") {
        this.openAssessment = true;
      }else if (action == 'delete' && this.selectedDocData?.StatusTxt == 'Draft'){
        Swal.fire({
          title: 'Confirm',
          text: 'Do you want to delete?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes',
          cancelButtonText: 'No',
          customClass: 'myalertpopup'
        }).then(async (result) => {
          if (result.value) {

            (this.emergencyService.deleteDialysisDoc(this.latestDocData.Dockey).subscribe((resp)=>{
              Swal.fire({
                text: "Document is deleted successfully",
                icon: 'success',
                confirmButtonText: 'Ok',
                customClass: 'myalertpopup'
              })
              this.refresh();
            }, (err)=>{
              console.log(err);
            })
            );
          }
        });
      }
    }
    // Morse Fall Scale
    else if (this.morsefallScale){
      if (action == 'create'  && this.latestMorseFallScaleData?.StatusTxt != 'Released'){
        this.openMorseFallScale = true;
      }else if(action == 'copy' && this.latestMorseFallScaleData?.StatusTxt == "Released"){
        this.openMorseFallScale = true;
      }
    }
    // Hemo Catheter
    else if(this.hemoCatheter){
      if(action == 'create' && this.latestHemoCatheterData?.StatusTxt != 'Draft' && this.latestHemoCatheterData?.StatusTxt != 'Released'){
        this.openHemoCatheter = true;
      }else if(action == 'edit' && this.selectedDocData?.StatusTxt == 'Draft' && this.selectedDocData?.StatusTxt != "Released") {
        this.openHemoCatheter = true;
      }else if(action == 'release' && this.latestHemoCatheterData?.StatusTxt == 'Draft'){
        console.log('status 2');

        const dockey = this.latestHemoCatheterData?.Dockey
        this.emergencyService.getHemoCatheterDoc(dockey).subscribe({
          next: (resp:any)=>{
            const formData = resp.d.results[0];
            delete formData['__metadata']
            
            const payload = {
              ...formData,
              DocStatus: '2'
            }

            this.emergencyService.ReleaseHemoCatheterSet(payload).subscribe((resp)=>{
              Swal.fire({
                text: "Document is released successfully",
                icon: 'success',
                confirmButtonText: 'Ok',
                customClass: 'myalertpopup'
              })
              this.refresh();
            },(error)=>{
              console.log(error);
            })
          },
          error: (error)=>{
            console.log(error);
          }
        });

        
      }else if (action == 'copy' && this.latestHemoCatheterData?.StatusTxt == "Released") {
        this.openHemoCatheter = true;
      }
    }
    // HemoDialysis Fistula/Graft
    else if(this.hemoDialysisFistulaGraft){
      if(action == 'create' && this.latestHemoDialysisFistulaGraftData?.StatusTxt != 'Draft' && this.latestHemoDialysisFistulaGraftData?.StatusTxt != 'Released'){
        this.openHemoDialysisFistulaGraft = true;
      }else if(action == 'edit' && this.latestHemoDialysisFistulaGraftData?.StatusTxt == 'Draft' && this.latestHemoDialysisFistulaGraftData?.StatusTxt != "Released") {
        this.openHemoDialysisFistulaGraft = true;
      }else if(action == 'release' && this.latestHemoDialysisFistulaGraftData?.StatusTxt == 'Draft'){
        console.log('status 2');

        const dockey = this.latestHemoDialysisFistulaGraftData?.Dockey
        this.emergencyService.getHemoDialysisFistulaGraftDoc(dockey).subscribe({
          next: (resp:any)=>{
            const formData = resp.d.results[0];
            delete formData['__metadata']
            
            const payload = {
              ...formData,
              DocStatus: '2'
            }

            this.emergencyService.releaseHemoDialysisFistiulaGraft(payload).subscribe((resp)=>{
              Swal.fire({
                text: "Document is released successfully",
                icon: 'success',
                confirmButtonText: 'Ok',
                customClass: 'myalertpopup'
              })
              this.refresh();
            },(error)=>{
              console.log(error);
            })
          },
          error: (error)=>{
            console.log(error);
          }
        });

        
      }else if (action == 'copy' && this.latestHemoDialysisFistulaGraftData?.StatusTxt == "Released") {
        this.openHemoDialysisFistulaGraft = true;
      }else if (action == 'delete' && this.latestHemoDialysisFistulaGraftData?.StatusTxt == 'Draft') {
        Swal.fire({
          title: 'Confirm',
          text: 'Do you want to delete?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes',
          cancelButtonText: 'No',
          customClass: 'myalertpopup'
        }).then(async (result) => {
          if (result.value) {

            (this.emergencyService.deleteHemoDialysisFistulaGraftDoc(this.latestHemoDialysisFistulaGraftData.Dockey).subscribe((resp)=>{
              Swal.fire({
                text: "Document is deleted successfully",
                icon: 'success',
                confirmButtonText: 'Ok',
                customClass: 'myalertpopup'
              })
              this.refresh();
            }, (err)=>{
              console.log(err);
            })
            );
          }
        });
      }
    }
  }

  public openModalForAttachment() {
    const config: ModalOptions = { class: 'modal-dialog-centered attachment-modal' };
    this.removeFile();
    this.getAttachmentsList();
    this.createAttachmentForm.reset();
    this.modalRef = this.modalService.show(this.attachmentModal, config);
    if (this.modalRefForStrucDoc != undefined) {
      this.modalRefForStrucDoc.hide();
    }
    this.userProfile = this.storageService.getUserProfile();
  }

  getAttachmentsList() {
    this.patientHistoryService.getAttachmentsList().subscribe(
      (_success: any) => {
        this.attachmentList = _success.d.results;
      },
      (_error: any) => { }
    );
  }

  resetAttachment() {
    this.modalRef.hide();
    this.createAttachmentForm.reset();
  }
  cancelDoc() {
    this.modalService.hide()
    // this.createAttachmentForm.reset();
  }

  handleFileChange(event) {
    this.file = event.target.files[0];
    this.filename = event.target.files[0].name;
    this.mimetype = event.target.files[0].type;
    this.convertFile(event.target.files[0]).subscribe((base64) => {
      this.base64Value = base64;
    });
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
      this.modalService.show(template, config);
      const fileReader = new FileReader();
      this.imgType = this.file.type?.split('/')[0]
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


  createAttachmentDoc() {
    this.createAttachmentForm.markAllAsTouched();
    if (this.createAttachmentForm.valid) {
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
        "AttachmentDataStr": this.base64Value
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
            // this.inPatientConfigurationService.getListOfAllPatientVisitDataSet();
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
      customClass: 'myalertpopup',
      icon: 'error'
    });
  }

  reloadDoc(event) {
    this.refresh();
  }
  saveDoc() {
    if (this.actionType == 'create') {
      if (this.openGlasgowComaScale) {
        this.GlasgowComaScaleComp.createGlosgowData().then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error creating Glasgow coma scale:', error);
        });
      }
      if (this.openFacePainScale) {
        this.FacePainScaleComp.createFacePain().then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error creating Face pain scale:', error);
        });
      }
      if (this.openNumericRatingScale) {
        this.NumericRatingScaleComp.saveNumericRight().then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error creating numeric rating Scale:', error);
        });
      }
      if (this.openEducationAssessment) {
        this.createEducationAss(false);
      }
      if (this.openBradenScale) {
        this.BradenScaleComp.createBradeScale().then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error creating Glasgow coma scale:', error);
        });
      }
      if (this.openAssessment) {
        this.postOpenAssessment('1', this.actionType);
      }
      if(this.openMorseFallScale) {
        console.log('status 1');

        const formData = {
          ...this.morseFallScaleC.getFormData(),
          Dockey: '',
          Einri: this.storageService.einri,
          Patnr: this.storageService.patnr,
          Falnr: this.storageService.falnr,
          Orgdo: 'F21IUAMC',
          DocStatus: '1'
        };
        this.emergencyService.postMFSSet(formData).subscribe((resp)=>{
          Swal.fire({
            text: "Document is created successfully",
            icon: 'success',
            confirmButtonText: 'Ok',
            customClass: 'myalertpopup'
          })
          this.refresh();
        },(error)=>{
          console.log(error);
        })
      }
      if(this.openHemoCatheter){
        this.postHemoCatheter('1', this.actionType);
      }
      if(this.openHemoDialysisFistulaGraft){
        this.postHemoDialysisFistulaGraft('1', this.actionType);
      }
    }
    else if (this.actionType == 'edit') {
      if (this.openGlasgowComaScale) {
        this.GlasgowComaScaleComp.createGlosgowData().then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error modifying Glasgow coma scale:', error);
        });
      }
      if (this.openFacePainScale) {
        this.FacePainScaleComp.createFacePain().then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error modifying Face pain scale:', error);
        });
      }
      if (this.openNumericRatingScale) {
        this.NumericRatingScaleComp.saveNumericRight().then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error modifying numeric rating Scale:', error);
        });
      }
      if (this.openEducationAssessment) {
        this.updateEducationAss(false);
      }
      if (this.openAssessment) {
        this.postOpenAssessment('1', this.actionType);
      }
      if(this.openHemoCatheter){
        this.postHemoCatheter('1', this.actionType);
      }
      if(this.openHemoDialysisFistulaGraft){
        this.postHemoDialysisFistulaGraft('1', this.actionType);
      }
    }
    else if (this.actionType == 'copy') {
      if (this.openGlasgowComaScale) {
        this.GlasgowComaScaleComp.copyGlosgowData().then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error copy Glasgow coma scale:', error);
        });
      }
      if (this.openFacePainScale) {
        this.FacePainScaleComp.copyFacePain().then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error copy Face pain scale:', error);
        });
      }
      if (this.openNumericRatingScale) {
        this.NumericRatingScaleComp.copyNumericRight().then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error copy numeric rating Scale:', error);
        });
      }
      if (this.openEducationAssessment) {
        this.createEducationAss(false);
      }
      if (this.openBradenScale) {
        this.BradenScaleComp.copyBradeScale().then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error copy numeric rating Scale:', error);
        });
      }
      if (this.openAssessment) {
        this.postOpenAssessment('3', this.actionType);
      }
      if(this.openMorseFallScale){
        console.log('status 3');

        const formData = {
          ...this.morseFallScaleC.getFormData(),
          Dockey: this.latestMorseFallScaleData.Dockey,
          Einri: this.latestMorseFallScaleData.Einri,
          Patnr: this.latestMorseFallScaleData.Patnr,
          Falnr: this.latestMorseFallScaleData.Falnr,
          Orgdo: 'F21IUAMC',
          DocStatus: '3'
        };
        this.emergencyService.createNewMFSSet(formData).subscribe((resp)=>{
          Swal.fire({
            text: "Document is released successfully",
            icon: 'success',
            confirmButtonText: 'Ok',
            customClass: 'myalertpopup'
          })
          this.refresh();
        },(error)=>{
          console.log(error);
        })
      }
      if(this.openHemoCatheter){
        this.postHemoCatheter('3', this.actionType);
      }
      if(this.openHemoDialysisFistulaGraft){
        this.postHemoDialysisFistulaGraft('3', this.actionType);
      }
    }
  }
  releaseFromForm() {
    if (this.phyAssess) {
      // this.release();
    } else if (this.medReport) {
      this.releaseMed();
    } else if (this.educationAssessment) {
      this.createEducationAss(true);
    } else if (this.assessment){
      if(this.actionType === "create"){
        this.postOpenAssessment('4', this.actionType);
      }
      if(this.actionType === "edit"){
        this.postOpenAssessment('2', this.actionType);
      }
      if(this.actionType == 'copy'){
        this.postOpenAssessment('5', this.actionType);
      }
    } else if(this.hemoCatheter){
      if(this.actionType == 'create'){
        this.postHemoCatheter('4', this.actionType);
      }
      if(this.actionType == 'edit'){
        this.postHemoCatheter('2', this.actionType);
      }
      if(this.actionType == 'copy'){
        this.postHemoCatheter('5', this.actionType);
      }
    } else if(this.hemoDialysisFistulaGraft){
      if(this.actionType == 'create'){
        this.postHemoDialysisFistulaGraft('4', this.actionType);
      }
      if(this.actionType == 'edit'){
        this.postHemoDialysisFistulaGraft('2', this.actionType);
      }
      if(this.actionType == 'copy'){
        this.postHemoDialysisFistulaGraft('5', this.actionType);
      }
    }
  }

  formatDate(dateTimeString){
    if(dateTimeString){
      const date = new Date(dateTimeString).toISOString()
      const dateDataArr = date.split('T')
      return `${dateDataArr[0]}T${dateDataArr[1].substring(0,8)}`
    }
  }

  formatTime(dateTimeString){
    if(dateTimeString){
      if(!dateTimeString.toString().includes('PT')){
        const date = new Date(dateTimeString).toISOString()
        const dateDataArr = date.split('T')
        return `PT${dateDataArr[1].substring(0,2)}H${dateDataArr[1].substring(3,5)}M${dateDataArr[1].substring(6,8)}S`
      }else{
        return dateTimeString;
      }
    }
  }


  getReleasedPdf(item) {
    if (item.AttMimeType == 'PDF' || item.AttMimeType == 'url' || item.AttMimeType == 'image/bmp' || item.AttMimeType == 'HTML') {
      this.admissionService.getPatientProfilePDF(item.Dockey).subscribe((_success: any) => {
        if (item.AttMimeType == 'PDF') {
          // this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl('data:application/pdf;base64,' + _success.d.AttachmentData);
          const config: ModalOptions = {
            class: 'modal-dialog-centered modal-xl pdfmodal-size',
          };
          this.modalRef = this.modalService.show(this.releasepdfmodal, config);
          this.pdfUrlConvertToBlob(_success?.d?.AttachmentData);
          this.pdfUrlType = 'pdf';
        } else if (item.AttMimeType == 'url') {
          window.open(_success.d.Url);
        } else if (item.AttMimeType == 'image/bmp') {
          const config: ModalOptions = {
            class: 'modal-dialog-centered modal-xl pdfmodal-size',
          };
          this.releaseDocumentImage = 'data:image/png;base64,' + _success.d.AttachmentData;
          this.modalRef = this.modalService.show(this.releasepdfmodal, config);
          this.pdfUrlType = 'image';
        } else if (item.AttMimeType == 'HTML') {
          const config: ModalOptions = {
            class: 'modal-dialog-centered modal-xl pdfmodal-size',
          };
          this.modalRef = this.modalService.show(this.releasepdfmodal, config);
          this.htmlData = this.sanitizer.bypassSecurityTrustHtml(_success.d.AttachmentDataStr);
          this.pdfUrlType = 'html';
        }
        // this.pdfUrl=this.sanitizer.bypassSecurityTrustResourceUrl('data:application/pdf;base64,'+ _success.d.AttachmentData);
        // const config: ModalOptions = {
        //   class: 'modal-dialog-centered modal-xl pdfmodal-size',
        // };
        // this.modalRef = this.modalService.show(this.releasepdfmodal, config);
      });
    }
  }

  sortedDocuments: any;
  sort() {

    this.patientProfileDocumet = this.groupBy(this.documentTypeFilterValue, 'Dodat');

    this.sortedDocuments = Object.keys(this.patientProfileDocumet).map(key => ({
      date: new Date(parseInt(key.replace('/Date(', '').replace(')/', ''))),
      documents: this.patientProfileDocumet[key]
    }));

    // Sort the array based on the date property
    if (this.asc) {
      this.asc = false;
      this.desc = true;
      this.sortedDocuments.sort((a, b) => b.date - a.date);
    } else {
      this.asc = true;
      this.desc = false;
      this.sortedDocuments.sort((a, b) => a.date - b.date);
    }
    // this.documentTypeFilterValue.sort((a, b) => 0 - (a > b ? -1 : 1));
    // console.log(this.patientProfileDocumet, "this.patientProfileDocumet");
  }

  jsonString() {
    return JSON.stringify(this.patientProfileDocumet);
  }

  getPatientProfileData(item) {
    if (item.AttMimeType == undefined) {
      item.AttMimeType = 'HTML';
    }
    this.getReleasedPdf(item);
    // if (item.AttMimeType !== '' && item.Dtid == 'ZMED_SOAP') {
    //   this.openSoapDetails(item);
    // }else{
    // }
  }
  openSoapDetails(item) {
    this.userConfigurationService
      .getSoapPatientdata(
        item.Dockey,
        item.Einri,
        this.storageService.falnr
      ).subscribe((_success: any) => {
        this.PatientData = _success?.d?.results[0];
        this.PatientData['VisitDate'] = this.getDate(this.PatientData?.Visitdate);
        const config: ModalOptions = {
          class: 'modal-dialog-centered modal-xl soap-modal',
        };
        this.modalRef = this.modalService.show(this.notreleasedmodal, config);
      })

  }
  // Med report
  getMedLatestAssessment() {
    const json = {
      Einri: this.storageService.einri,
      Falnr: this.storageService.falnr,
      Patnr: this.storageService.patnr,
      Lfdnr: this.storageService.lfdnr
    }
    this.emergencyService.getMedLatestAssessment(json).subscribe(
      (_success: any) => {
        this.medlatestDocList = [];
        if (_success?.d?.results.length > 0) {
          this.medlatestDocList = _success?.d?.results;
          if (this.actionType == 'createandrelease' && this.medReport) {
            this.medComp.ngOnInit();
            this.releaseMed();
          }
          this.getMedReportData();
        }
        if (this.actionType == 'createandrelease') {
          this.phyComp.ngOnInit();
          this.release();
        }
      },
      (_error: any) => { }
    );
  }
  saveMedDoc() {
    if (this.actionType == 'create') {
      // this.createMedDoc();
    } else if (this.actionType == 'edit') {
      this.updateMedDoc();
    } else if (this.actionType == 'copy') {
      this.CopyMedReport();
    }
  }

  saveEducationAss() {
    if (this.actionType == 'create') {
      this.createEducationAss(false);
    } else if (this.actionType == 'edit') {
      this.updateEducationAss(false);
    } else if (this.actionType == 'copy') {
      this.createEducationAss(false);
    }
  }
  getMedReportData() {
    const json = {
      Dockey: this.medlatestDocList[0].Dockey
    }
    this.emergencyService.getMedReportData(json).subscribe(
      (_success: any) => {
        this.medDocList = _success.d.results;
      },
      (_error: any) => { }
    );
  }
  async createMedDoc() {
    (await this.medComp.createMedDoc()).subscribe((res: any) => {
      Swal.fire({
        text: "Document is created successfully",
        icon: 'success',
        confirmButtonText: 'Ok',
        customClass: 'myalertpopup'
      })
      this.medComp.resetAll();
      this.refresh();
    }, (_error: any) => { });
  }
  async deleteMedReport() {
    Swal.fire({
      title: 'Confirm',
      text: 'Do you want to delete?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: 'myalertpopup'
    }).then(async (result) => {
      if (result.value) {

        (await this.medComp.deleteMedReport()).subscribe(
          (_success: any) => {
            Swal.fire({
              text: "Document is deleted successfully",
              icon: 'success',
              confirmButtonText: 'Ok',
              customClass: 'myalertpopup'
            })
            this.medComp.resetAll();
            this.refresh();
          },
          (_error: any) => { }
        );
      }
    });
  }
  async updateMedDoc() {
    (await this.medComp.updateMedDoc()).subscribe((res: any) => {
      Swal.fire({
        text: "Document is updated successfully",
        icon: 'success',
        confirmButtonText: 'Ok',
        customClass: 'myalertpopup'
      })
      this.medComp.resetAll();
      this.refresh();
    }, (_error: any) => { });
  }
  async releaseMed() {
    (await this.medComp.releaseMedDoc()).subscribe((res: any) => {
      Swal.fire({
        text: "Document is released successfully",
        icon: 'success',
        confirmButtonText: 'Ok',
        customClass: 'myalertpopup'
      })
      this.medComp.resetAll();
      this.refresh();
    }, (_error: any) => { });
  }
  getMedReleasedDoc(id) {
    const json = {
      Dockey: id
    }
    this.emergencyService.getMedReleasedPdf(json).subscribe(
      (_success: any) => {
        if (_success) {
          this.pdfUrlType = 'pdf';
          this.pdfUrlConvertToBlob(_success?.d?.AttachmentData);
          // this.pdfUrl=this.sanitizer.bypassSecurityTrustResourceUrl('data:application/pdf;base64,'+ _success?.d?.AttachmentData);
          const config: ModalOptions = {
            class: 'modal-dialog-centered modal-xl pdfmodal-size',
          };
          this.modalRef = this.modalService.show(this.releasepdfmodal, config);
        }
      },
      (_error: any) => { }
    );
  }
  async CopyMedReport() {
    (await this.medComp.CopyMedReport()).subscribe((res: any) => {
      Swal.fire({
        text: "Document is created successfully",
        icon: 'success',
        confirmButtonText: 'Ok',
        customClass: 'myalertpopup'
      })
      this.phyComp.resetAll();
      this.refresh();
    }, (_error: any) => { });
  }
  async createAndReleaseMed() {
    (await this.medComp.createMedDoc()).subscribe((res: any) => {
      this.medComp.resetAll();
      this.refresh();
    }, (_error: any) => { });
  }
  openMedReleasePdf(id) {
    this.pdfUrl = '';
    this.getMedReleasedDoc(id);
  }

  openDiaAssessReleasePdf(id){
    this.pdfUrl = '';
    this.getDiaAssessReleasedDoc(id);
  }

  openFistulaGraftPDF(id){
    this.pdfUrl = '';
    this.getHemoDialysisFistulaGraft(id);
  }

  getDiaAssessReleasedDoc(id) {
    const json = {
      Dockey: id
    }

    this.emergencyService.getDiaAssessReleasedPdf(json).subscribe(
      (_success: any) => {

        if (_success) {
          this.pdfUrlType = 'pdf';
          this.pdfUrlConvertToBlob(_success?.d?.AttachmentData);
          const config: ModalOptions = {
            class: 'modal-dialog-centered modal-xl pdfmodal-size',
          };
          this.modalRef = this.modalService.show(this.releasepdfmodal, config);
        }
      },
      (_error: any) => { }
    );
  }

  getHemoDialysisFistulaGraft(id) {
    this.emergencyService.getHemoDialysisFistulaGraftPDF(id).subscribe(
      (_success: any) => {

        if (_success) {
          this.pdfUrlType = 'pdf';
          this.pdfUrlConvertToBlob(_success?.d?.AttachmentData);
          const config: ModalOptions = {
            class: 'modal-dialog-centered modal-xl pdfmodal-size',
          };
          this.modalRef = this.modalService.show(this.releasepdfmodal, config);
        }
      },
      (_error: any) => { }
    );
  }


  // Education Assessment


  async createEducationAss(type) {
    (await this.educationAssessmentComp.saveEducationFormValue(type)).subscribe((res: any) => {
      Swal.fire({
        text: "Education assessment is created successfully",
        icon: 'success',
        confirmButtonText: 'Ok',
        customClass: 'myalertpopup'
      })
      this.educationAssessmentComp.resetAll();
      this.refresh();
    }, (_error: any) => {
      Swal.fire({
        text: `Education assessment has error, contact your administrator`,
        icon: 'warning',
        confirmButtonText: 'Ok',
        customClass: 'myalertpopup'
      })
    });
  }

  async deleteEducationAss() {
    Swal.fire({
      title: 'Confirm',
      text: 'Do you want to delete?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: 'myalertpopup'
    }).then(async (result) => {
      if (result.value) {
        (await this.admissionService
          .deleteEducationDetails(this.educationAssList[0].Dockey)).subscribe(
            (_success: any) => {
              Swal.fire({
                text: "Document is deleted successfully",
                icon: 'success',
                confirmButtonText: 'Ok',
                customClass: 'myalertpopup'
              })
              this.refresh();
            },
            (_error: any) => {
              Swal.fire({
                text: `${_error.error.error.innererror.errordetails[0].message}`,
                icon: 'warning',
                confirmButtonText: 'Ok',
                customClass: 'myalertpopup'
              })
              this.refresh();
            }
          );
      }
    });
  }

  async updateEducationAss(type) {
    (await this.educationAssessmentComp.saveEducationFormValue(type)).subscribe((res: any) => {
      Swal.fire({
        text: "Document is updated successfully",
        icon: 'success',
        confirmButtonText: 'Ok',
        customClass: 'myalertpopup'
      })
      this.educationAssessmentComp.resetAll();
      this.refresh();
    }, (_error: any) => { });
  }

  releaseEducationAss() {
    this.admissionService.getDocuEducationDetails(this.educationAssList[0].Dockey).subscribe((res: any) => {
      let d: any = {
        d: res?.d?.results[0],
      };
      d.d.DocStatus = '2';
      this.admissionService.saveEducationData(d).subscribe(
        (result) => {
          this.refresh();
        }
      );
    })
  }

  openEducationAssPdf(Dockey) {
    this.pdfUrl = '';
    this.admissionService
      .getEducationPDF(Dockey)
      .subscribe((data: any) => {
        this.pdfUrlType = 'pdf';
        this.pdfUrlConvertToBlob(data?.d?.AttachmentData);
        // this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        //   'data:application/pdf;base64,' + data.d.AttachmentData
        // );
        const config: ModalOptions = {
          class: 'modal-dialog-centered modal-xl pdfmodal-size',
        };
        this.modalRef = this.modalService.show(this.releasepdfmodal, config);
      });
  }

  dockVer(value) {
    return `(v${parseInt(value)})`;
  }

  closePdfModal() {
    this.releaseDocumentImage = '';
    this.modalRef.hide();
  }

  postHemoDialysisFistulaGraft(docStatus:string,action:string){
    const formData = {
      ...this.hemoDialysisFistulaGraftC.getFormData(),
      Dockey: action == 'create' ? '' : this.latestHemoDialysisFistulaGraftData?.Dockey,
      Einri: action == 'create' ? this.storageService.einri : this.latestHemoDialysisFistulaGraftData?.Einri,
      Patnr: action == 'create' ? this.storageService.patnr : this.latestHemoDialysisFistulaGraftData?.Patnr,
      Falnr: action == 'create' ? this.storageService.falnr : this.latestHemoDialysisFistulaGraftData?.Falnr,
      Lfdnr: action == 'create' ? this.storageService.lfdnr : this.latestHemoDialysisFistulaGraftData?.Lfdnr,
      Orgdo: 'F21IUAMC',
      DocStatus: docStatus,
      Dtid : 'ZMED_HBFG',
      SessionDate:this.formatDate(this.hemoDialysisFistulaGraftC.hemoDialysisFistulGraftForm.controls['SessionDate'].value),
      SessionTime:this.formatTime(this.hemoDialysisFistulaGraftC.hemoDialysisFistulGraftForm.controls['SessionTime'].value)
    };
    this.emergencyService.postHemoDialysisFistulaGraft(formData).subscribe((resp)=>{
      Swal.fire({
        text: `Document is ${ action == 'create' ? 'Created' : action == 'edit' ? 'Updated' : 'Released' } successfully`,
        icon: 'success',
        confirmButtonText: 'Ok',
        customClass: 'myalertpopup'
      })
      this.refresh();
    },(error)=>{
      console.log(error);
    })
  }

  postHemoCatheter(docStatus:string,action:string){
    const formData = {
      ...this.hemoCatheterC.getFormData(),
      Dockey: action == 'create' ? '' : this.latestHemoCatheterData?.Dockey,
      Einri: action == 'create' ? this.storageService.einri : this.latestHemoCatheterData?.Einri,
      Patnr: action == 'create' ? this.storageService.einri : this.latestHemoCatheterData?.Patnr,
      Falnr: action == 'create' ? this.storageService.einri : this.latestHemoCatheterData?.Falnr,
      Lfdnr: action == 'create' ? this.storageService.einri : this.latestHemoCatheterData?.Lfdnr,
      Orgdo: 'F21IUAMC',
      DocStatus: docStatus,
      Dtid : 'ZMED_HBCA',
      CatheterInsertion:this.formatDate(this.hemoCatheterC.hemoCatheterForm.controls['CatheterInsertion'].value),
      CatheterRemoval:this.formatDate(this.hemoCatheterC.hemoCatheterForm.controls['CatheterRemoval'].value),
      SessionDate:this.formatDate(this.hemoCatheterC.hemoCatheterForm.controls['SessionDate'].value),
      SessionTime:this.formatTime(this.hemoCatheterC.hemoCatheterForm.controls['SessionTime'].value)
    };
    this.emergencyService.postHemoCatheterSet(formData).subscribe((resp)=>{
      Swal.fire({
        text: `Document is ${ action == 'create' ? 'Created' : action == 'edit' ? 'Updated' : 'Released' } successfully`,
        icon: 'success',
        confirmButtonText: 'Ok',
        customClass: 'myalertpopup'
      })
      this.refresh();
    },(error)=>{
      console.log(error);
    })
  }

  postOpenAssessment(docStatus:string,action:string){
    const toMonitor =
    this.patientDocService.dialysisAssecementForm.get('TOMONITOR').value;
    const dAssessmentForm = this.patientDocService.dialysisAssecementForm;


    toMonitor.forEach((monitor) => {
      monitor.Timee = this.formatTime(monitor.Timee);
    });

    const otherData = {
      Dockey: action == 'create' ? '' : this.latestDocData?.Dockey,
      Dtid: 'ZMED_DIALY',
      Einri: action == 'create' ? this.storageService.einri : this.latestDocData?.Einri,
      Patnr: action == 'create' ? this.storageService.patnr : this.latestDocData?.Patnr,
      Falnr: action == 'create' ? this.storageService.falnr : this.latestDocData?.Falnr,
      Lfdnr: action == 'create' ? this.storageService.lfdnr : this.latestDocData?.Lfdnr,
      Orgdo: 'F21IUAMC',
      AttendPhy: action == 'create' ? '9000000020' : this.latestDocData?.AttendPhy,
      DocStatus: docStatus,
    };

    dAssessmentForm.patchValue({ otherDetails: otherData });

    const payload = {
      ...dAssessmentForm.controls['hemodialysis'].value,
      ...dAssessmentForm.controls['haemodialysisMonitoring'].value,
      ...dAssessmentForm.controls['haemodialysisLineMonitoring'].value,
      ...dAssessmentForm.controls['peritonealForm'].value,
      ...dAssessmentForm.controls['postDialysisMonitoring'].value,
      ...dAssessmentForm.controls['preDialysis'].value,
      ...dAssessmentForm.controls['otherDetails'].value,
      TreatmentDate: this.formatDate(
        dAssessmentForm.controls['preDialysis'].get('TreatmentDate').value
      ),
      DialysisFDate: this.formatDate(
        dAssessmentForm.controls['preDialysis'].get('DialysisFDate').value
      ),
      TreatmentTime: this.formatTime(
        dAssessmentForm.controls['preDialysis'].get('TreatmentTime').value
      ),
      DialysisFTime: this.formatTime(
        dAssessmentForm.controls['preDialysis'].get('DialysisFTime').value
      ),
      PTreatmentDate: this.formatDate(
        dAssessmentForm.controls['postDialysisMonitoring'].get(
          'PTreatmentDate'
        ).value
      ),
      PTreatmentTime: this.formatTime(
        dAssessmentForm.controls['postDialysisMonitoring'].get(
          'PTreatmentTime'
        ).value
      ),
      PrescribedTime: this.formatTime(
        dAssessmentForm.controls['preDialysis'].get('PrescribedTime').value
      ),
      TOMONITOR: toMonitor,
    };

    this.emergencyService.postDailysisSet(payload).subscribe(
      (resp) => {
        Swal.fire({
          text: `Document is ${ action == 'create' ? 'Created' : action == 'edit' ? 'Updated' : 'Released' } successfully`,
          icon: 'success',
          confirmButtonText: 'Ok',
          customClass: 'myalertpopup'
        })
        this.refresh();
      },
      (error) => {
        console.log(error);
      }
    );
  }

  // Calculate content height based on screen resolution
  getContentHeight(): number {
    // Get the viewport height using window.innerHeight
    const viewportHeight = window.innerHeight;

    // Calculate desired content height based on viewport height (adjust as needed)
    const contentHeight = viewportHeight - 400; // Subtract any fixed heights like headers, footers, etc.

    return contentHeight;
  }

  // Listen for window resize events to recalculate content height
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    // Recalculate content height whenever the window is resized
    // This will automatically update the height of the scrollable div
    this.getContentHeight();
  }

}

