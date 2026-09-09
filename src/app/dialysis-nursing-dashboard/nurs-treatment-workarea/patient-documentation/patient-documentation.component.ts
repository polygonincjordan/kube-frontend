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
import { Observable, ReplaySubject, Subscription, filter, forkJoin } from 'rxjs';
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
import { DayCaseDashboardService } from '@services/day-case.dashboard/day-case-dashboard.service';
import { NursingAdmissionAssessmentComponent } from 'src/app/shared-module/nursing-admission-assessment/nursing-admission-assessment.component';
import { DatePipe } from '@angular/common';
import { CprDocumentComponent } from 'src/app/shared-module/cpr-document/cpr-document.component';
import { NursingCarePlansComponent } from 'src/app/shared-module/nursing-care-plan-document/nursing-care-plans/nursing-care-plans.component';
import { PreCardiacCathComponent } from 'src/app/shared-module/pre-cardiac-cath/pre-cardiac-cath.component';

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
  @ViewChild(NursingAdmissionAssessmentComponent) NursingAdmissionComp: NursingAdmissionAssessmentComponent;
  @ViewChild(CprDocumentComponent) CprDocumentComp: CprDocumentComponent;
  @ViewChild(NursingCarePlansComponent) NursingCarePlansComp: NursingCarePlansComponent;
  @ViewChild(PreCardiacCathComponent) PreCardiacCathComp: PreCardiacCathComponent;

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
  isNursingAdmission = false
  hemoCatheter = false;
  hemoDialysisFistulaGraft = false;
  numericratingscale = false;
  fallrisk = false;
  functional = false;
  nutritional = false;
  public isCPRDocument: boolean = false;
  public openCPRDocument: boolean = false;
  latestCprList = [];

  phyDocList = [];
  latestDocList = [];
  latestGlasgowComaScaleList = [];
  latestEmergencyNursingDocList = [];
  latestNumericratingscaleList = [];
  latestFacePainScaleList = [];
  latestBridentScaleList = [];
  educationAssList = [];
  latestNurAdmissionList: any = [];
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
  openNurseAdmission: boolean = false;
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

  public isNursingCarePlan: boolean = false;
  openNursingCarePlans: boolean = false;
  latestNurCarePlanList:any[] = [];

  public isPreCardiacCath: boolean = false;
  latestPreCardiacCathList = [];
  openPreCardiacCath: boolean = false;

  latestDocData: any;
  DocStatus: any;
  public RedirectionType: any;
  latestMorseFallScaleData: any;
  latestHemoCatheterData: any;
  latestHemoDialysisFistulaGraftData: any;
  documentTypeFilterValueClone: any[] = [];

  selectedDocumentOU: any;
  selectedCreatedBy: any;
  previousPeriodValue: any = 'Overall';
  previousPeriodsList = [
    "Current Day", "Since Yesterday", "In Past 3 Days", "In Past Week", "In Past Month", "In Past Years", "Overall"
  ];
  selectedDocument: any;
  documentFilterList = [
    {
      label: 'Braden Scale',
      value: 'BRS'
    },
    {
      label: 'Attachments Document',
      value: 'ATD'
    },
    {
      label: 'Dialysis Assessment',
      value: 'DIA'
    },
    {
      label: 'Morse Fall Scale',
      value: 'MFS'
    },
    {
      label: 'Nursing Admission Assessment',
      value: 'NAA'
    },
    {
      label: 'Hemo Catheter',
      value: 'HEC'
    },
    {
      label: 'IC Bundle for Hemodialysis Fistula/Graft',
      value: 'ICHF'
    },
    {
      label: 'CPR Document',
      value: 'CPD'
    },
    {
      label: 'Nursing Care Plan',
      value: 'NCP'
    },
    {
      label: 'Pre-Cardiac Cath Checklist',
      value: 'PCCC'
    }
  ]
  createdDocumentUserList: any = [];
  departmentOUList: any = [];

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
    private dataService: DataService,
    private dayCaseDashboardService:DayCaseDashboardService,
    private datePipe:DatePipe
  ) {
    this.RedirectionType = RedirectionType;
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
    this.getNursingAdmissionLatestDoc()
    this.getCPRDocDetails();
    this.getNursingPlanCareDocDetails();
    this.getPreCardiecCathDocDetails();

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
  getNursingAdmissionLatestDoc() {
    this.dayCaseDashboardService.nursingAdmissionLatestDoc(this.apiJson).subscribe({
      next: (_success: any) => {
        if(_success?.d?.results) {
          this.latestNurAdmissionList = _success.d.results;
        }
        if(this.dayCaseDashboardService.isRedirectToSelectedDoc) {
          this.checkForRedirectionAction();
        }
      },
      error: (err: any) => {
        // Handle errors if the request fails
        console.error('Error  Data:', err);
        this.sharedService.waringSwallModel(`GET Error : ${err}`);
      },
    });
  }
  // CPR Document Latest
  getCPRDocDetails() {
    this.dayCaseDashboardService.cprDocumentLatestDoc(this.apiJson).subscribe({
      next: (_success: any) => {
        this.latestCprList = _success.d.results
      },
      error: (err: any) => {
        console.error('Error  Data:', err);
        this.sharedService.waringSwallModel(`GET Error : ${err}`);
      },
    });
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
          console.log(this.latestHemoCatheterData)
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

  // Nursing Plan Care Document Latest
  getNursingPlanCareDocDetails() {
    this.dayCaseDashboardService.getNursingCarePlanLatestDoc(this.apiJson).subscribe({
      next: (_success: any) => {
        this.latestNurCarePlanList = _success.d.results
      },
      error: (err: any) => {
        console.error('Error  Data:', err);
        this.sharedService.waringSwallModel(`GET Error : ${err}`);
      },
    });
  }

  // Nursing Plan Care Document Latest
  getPreCardiecCathDocDetails() {
    this.dayCaseDashboardService.preCardiacCathLatestDoc(this.apiJson).subscribe({
      next: (_success: any) => {
        this.latestPreCardiacCathList = _success.d.results
      },
      error: (err: any) => {
        console.error('Error  Data:', err);
        this.sharedService.waringSwallModel(`GET Error : ${err}`);
      },
    });
  }

  getPatientProfile() {    
    this.admissionService.getDicumentDetails(this.storageService.einri, '1', this.storageService.patnr, '', this.storageService.falnr).subscribe({
      next: (_success: any) => {
        // Handle successful data retrieval
        this.documentTypeFilterValue = _success.d.results;
        // this.sort();
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

        // if(this.paramsObject.action && this.paramsObject.doctype){
          // const latestDocData = patientProfileResponse.d.results.find(ele => ele.Dtid === 'ZMED_DIALY');
          // if(latestDocData){
          //   this.latestDocData = {...latestDocData, StatusTxt: latestDocData.DokstText == "In Work" ? 'Draft' : latestDocData.DokstText}
          // }
          // const latestMorseFallScaleData = patientProfileResponse.d.results.find(ele => ele.Dtid === 'SCA_MORSE');
          // if(latestMorseFallScaleData){
          //   this.latestMorseFallScaleData = {...latestMorseFallScaleData, StatusTxt: latestMorseFallScaleData.DokstText == "In Work" ? 'Draft' : latestMorseFallScaleData.DokstText, PhyNm: latestMorseFallScaleData.MitarbName, DocDate: latestMorseFallScaleData.Dodat }
          //   this.patientDocService.latestMorseFallScaleData = this.latestMorseFallScaleData;
          // }
          // const latestHemoCatheterData = patientProfileResponse.d.results.find(ele => ele.Dtid === 'ZMED_HBCA');
          // if(latestHemoCatheterData){
          //   this.latestHemoCatheterData = {...latestHemoCatheterData, StatusTxt: latestHemoCatheterData.DokstText == "In Work" ? 'Draft' : latestHemoCatheterData.DokstText}
          //   this.patientDocService.latestHemoCatheterData = this.latestHemoCatheterData;
          // }
          // const latestHemoDialysisFistulaGraftData = patientProfileResponse.d.results.find(ele => ele.Dtid === 'ZMED_HBFG');
          // if(latestHemoDialysisFistulaGraftData){
          //   this.latestHemoDialysisFistulaGraftData = {...latestHemoDialysisFistulaGraftData, StatusTxt: latestHemoDialysisFistulaGraftData.DokstText == "In Work" ? 'Draft' : latestHemoDialysisFistulaGraftData.DokstText}
          //   this.patientDocService.latestHemoDialysisFistulaGraftData = this.latestHemoDialysisFistulaGraftData;
          // }


        // }


        // Handle education assessment response
        this.educationAssList = educationAssessmentResponse.d.results;

        // Handle patient profile response
        this.documentTypeFilterValueClone = patientProfileResponse.d.results;
        this.documentTypeFilterValue = patientProfileResponse.d.results;

        if (this.documentTypeFilterValue.length) {
          // this.documentTypeFilterValue = _success.d.results;
          this.filterByPeriod();
          this.sort();
          this.createdDocumentUserList = this.documentTypeFilterValueClone.map(item => item.MitarbName);
          this.createdDocumentUserList = this.removeDuplicates(this.createdDocumentUserList);
          this.departmentOUList = this.documentTypeFilterValueClone.map(item => item.Orgdo);
          this.departmentOUList = this.removeDuplicates(this.departmentOUList);
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

  removeDuplicates(array: any[]): any[] {
    return [...new Set(array)];
  }

  filterPeriodDate() {
    this.filterByPeriod();
    this.asc = true;
    this.sort();
  }

  filterByPeriod() {
    let currentDate = new Date();
    let startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
    let yesterday = new Date(startOfDay);
    yesterday.setDate(startOfDay.getDate() - 1);
  
    let filteredArray = [];
    
    switch (this.previousPeriodValue) {
      case "Current Day":
        filteredArray = this.documentTypeFilterValueClone.filter(item => this.isSameDate(this.parseODataDate(item.Dodat), startOfDay));
        break;
      case "Since Yesterday":
        filteredArray = this.documentTypeFilterValueClone.filter(item => this.parseODataDate(item.Dodat) >= yesterday);
        break;
      case "In Past 3 Days":
        let past3Days = new Date(startOfDay);
        past3Days.setDate(startOfDay.getDate() - 3);
        filteredArray = this.documentTypeFilterValueClone.filter(item => this.parseODataDate(item.Dodat) >= past3Days);
        break;
      case "In Past Week":
        let pastWeek = new Date(startOfDay);
        pastWeek.setDate(startOfDay.getDate() - 7);
        filteredArray = this.documentTypeFilterValueClone.filter(item => this.parseODataDate(item.Dodat) >= pastWeek);
        break;
      case "In Past Month":
        let pastMonth = new Date(startOfDay);
        pastMonth.setMonth(startOfDay.getMonth() - 1);
        filteredArray = this.documentTypeFilterValueClone.filter(item => this.parseODataDate(item.Dodat) >= pastMonth);
        break;
      case "In Past Years":
        let pastYear = new Date(startOfDay);
        pastYear.setFullYear(startOfDay.getFullYear() - 1);
        filteredArray = this.documentTypeFilterValueClone.filter(item => this.parseODataDate(item.Dodat) >= pastYear);
        break;
      case "Overall":
        filteredArray = this.documentTypeFilterValueClone; // No filtering needed
        break;
      default:
        filteredArray = this.documentTypeFilterValueClone; // No filtering needed
    }

    // Filter based on the selected options
    this.documentTypeFilterValue = filteredArray.filter((item) => {
      const itemDate = new Date(parseInt(item.Dodat.match(/\d+/)[0]));
      const isDateInRange = itemDate >= currentDate;

      const isCreatedByMatch =
        !this.selectedCreatedBy || item.MitarbName === this.selectedCreatedBy;

      const isDepartmentMatch =
        !this.selectedDocumentOU || item.Orgdo === this.selectedDocumentOU;

      return isCreatedByMatch && isDepartmentMatch;
    });
  }

  parseODataDate(odataDate: string): Date {
    // Extract timestamp from the OData date format
    let timestamp = parseInt(odataDate.match(/\/Date\((\d+)\)\//)?.[1] || "0", 10);
    return new Date(timestamp);
  }
  
  isSameDate(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
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
      this.selectAssessment('hemoDialysisFistulaGraft', this.latestHemoDialysisFistulaGraftData)
      this.openDocument('edit');
    } else if (this.paramsObject.action == 'View' && this.paramsObject.doctype == RedirectionType.HBFG$) {
      this.getPatientProfileData(this.latestHemoDialysisFistulaGraftData);
    } 

    else if (this.paramsObject.action == 'Add' && this.paramsObject.doctype == RedirectionType.NAA$) {
      this.selectAssessment('isNursingAdmission',this.latestNurAdmissionList[0])
      this.openDocument('create');
    } else if (this.paramsObject.action == 'Update' && this.paramsObject.doctype == RedirectionType.NAA$) {
      this.selectAssessment('isNursingAdmission', this.latestNurAdmissionList[0])
      this.openDocument('edit');
    } else if (this.paramsObject.action == 'View' && this.paramsObject.doctype == RedirectionType.NAA$) {
      this.getPatientProfileData(this.latestNurAdmissionList[0]);
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
      'isNursingAdmission': { isNursingAdmission: true, selectedDocName: 'Nursing Admission Assessment' },
      'bradenscale': { bradenscale: true, selectedDocName: 'Braden Scale' },
      'numericratingscale': { numericratingscale: true, selectedDocName: 'Numeric rating scale(more than 8 years)' },
      'emergencynursingdoc': { emergencynursingdoc: true, selectedDocName: 'Emergency Nursing Document' },
      'educationAssessment': { educationAssessment: true, selectedDocName: 'Education Assesment' },
      'assessment': { assessment: true, selectedDocName: 'Dialysis Assessment' },
      'morsefallScale': { morsefallScale: true, selectedDocName: 'Morse Fall Scale' },
      'hemoCatheter': { hemoCatheter: true, selectedDocName: 'Hemo Catheter' },
      'hemoDialysisFistulaGraft': { hemoDialysisFistulaGraft: true, selectedDocName: 'IC Bundle for Hemodialysis Fistula/Graft' },
      'isCPRDocument': { isCPRDocument: true, selectedDocName: 'CPR Document' },
      'isNursingCarePlan': { isNursingCarePlan: true, selectedDocName: 'Nursing Care Plan' },
      'isPreCardiacCath': { isPreCardiacCath: true, selectedDocName: 'Pre-Cardiac Cath Checklist' },
    };

    // Reset all flags to false initially
    this.phyAssess = false;
    this.nursAssess = false;
    this.medReport = false;
    this.attachments = false;
    this.educationAssessment = false;
    this.glasgowcomascale = false;
    this.isNursingAdmission = false;
    this.facepainscale = false;
    this.numericratingscale = false;
    this.bradenscale = false;
    this.emergencynursingdoc = false;
    this.assessment = false;
    this.morsefallScale = false;
    this.hemoCatheter = false;
    this.hemoDialysisFistulaGraft = false;
    this.isCPRDocument = false;
    this.isNursingCarePlan = false;
    this.isPreCardiacCath = false;

    // Check if the provided name exists in the assessments mapping
    if (name in assessments) {
      const assessment = assessments[name];
      // Update the corresponding flags and selected document name
      Object.assign(this, assessment);
      this.selectedDocName = assessment.selectedDocName;
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
    this.sortedDocuments = Object.keys(this.patientProfileDocumet).map(key => {
    let documents = this.patientProfileDocumet[key];

    // Sort documents in this date group by CreatedAt (latest first)
    documents.sort((a, b) => {
      const timeToSeconds = (timeStr: string) => {
        if (!timeStr) return 0;
        const match = timeStr.match(/PT(\d+)H(\d+)M(\d+)S/);
        if (!match) return 0;
        const [, h, m, s] = match.map(Number);
        return h * 3600 + m * 60 + s;
      };
      return timeToSeconds(b.CreatedAt) - timeToSeconds(a.CreatedAt);
    });

    return {
      date: new Date(parseInt(key.replace('/Date(', '').replace(')/', ''))),
      documents
    };
  });
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
        customClass: { popup: 'myalertpopup' }
      } as any)
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
        customClass: { popup: 'myalertpopup' }
      } as any)
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
        customClass: { popup: 'myalertpopup' }
      } as any)
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
      customClass: { popup: 'myalertpopup' }
    } as any).then(async (result) => {
      if (result.value) {

        (await this.phyComp.deletePhyAssessment()).subscribe(
          (_success: any) => {
            Swal.fire({
              text: "Document is deleted successfully",
              icon: 'success',
              confirmButtonText: 'Ok',
              customClass: { popup: 'myalertpopup' }
            } as any)
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
        customClass: { popup: 'myalertpopup' }
      } as any)
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
      // this.redirecTreatment();
    }
    if (this.openAssessment) {
      this.DialysisAssessment.ngOnDestroy();
      // this.refreshDialysisAssessment();
      // this.redirecTreatment();
    }
    if (this.openEducationAssessment) {
      this.educationAssessmentComp.ngOnDestroy();
    }

    if (this.openEmergencyNursingDoc) {
      this.EmergencyNursingDocumentComp.ngOnDestroy();
    }
    if(this.openMorseFallScale){
      this.morseFallScaleC.ngOnDestroy();
      // this.redirecTreatment();
    }
    if(this.openHemoCatheter){
      this.hemoCatheterC.ngOnDestroy();
      // this.redirecTreatment();
    }
    if(this.openHemoDialysisFistulaGraft){
      this.hemoDialysisFistulaGraftC.ngOnDestroy();
      // this.redirecTreatment();
    }
    if (this.openNurseAdmission) {
      this.NursingAdmissionComp?.ngOnDestroy();
    }
    if (this.openCPRDocument) {
      this.CprDocumentComp.ngOnDestroy();
    }
    if (this.openNursingCarePlans) {
      this.NursingCarePlansComp?.ngOnDestroy();
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
    this.getNursingAdmissionLatestDoc();
    this.getCPRDocDetails();
    this.getNursingPlanCareDocDetails();
    this.getPreCardiecCathDocDetails();

    this.patientDocService.initialForm()
    this.openNursingCarePlans = false;
    this.isNursingCarePlan = false;
    this.openPreCardiacCath = false;
    this.isPreCardiacCath = false;

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
    this.openAssessment = false
    this.isNursingAdmission = false;
    this.openNurseAdmission = false;
    this.openCPRDocument = false;
    this.openCPRDocument = false;

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

  redirecTreatment(){
    const urlSearchParams = new URLSearchParams(window.location.search);
    urlSearchParams.set('redirectFor', 'Documentation');
    urlSearchParams.set('action', '');
    urlSearchParams.set('doctype', '');

    // Construct the new URL
    const newUrl = `${window.location.origin}${window.location.pathname}?${urlSearchParams.toString()}${window.location.hash}`;
    localStorage.setItem('tabName',"Documenatation")

    // Redirect to the new URL
    window.location.href = newUrl;
  }

  
  refreshDialysisAssessment(){
    this.openAssessment = false;
    this.selectedDocData = null;
    this.latestDocData = null;
    this.ngOnInit();
    this.emergencyService.tabPanelNavigation("Documentation");
  }
  private subscription: Subscription;
  directReleaseNursingAdmissionDoc() {
    this.subscription = this.dayCaseDashboardService
    .getNursingAdmissionDocData(this.selectedDocData.Dockey).subscribe({
      next: (data: any) => {
        let paylaod = data.d.results[0];
        delete paylaod.__metadata
        paylaod.DocStatus = '2'; 
        this.subscription = this.dayCaseDashboardService.createNursingAdmissionDoc({ d: paylaod }).subscribe({
          next: (data: any) => {},
          error: (err: any) => {
            this.sharedService.waringSwallModel(`Error ${err}`);
            this.sharedService.waringSwallModel(`POST Error at Nurse Endorsment : ${err}`);
          },
          complete: () => {
            this.sharedService.successSwallModel('Nursing admission document released successfully');
            this.refresh();
          }
        });
      },
      error: (err: any) => {
        this.sharedService.waringSwallModel(`Error ${err}`);
        this.sharedService.waringSwallModel(
          `POST Error at Nurse Endorsment : ${err}`
        );
      }
    });
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
      if (action == 'create') {
        this.openAssessment = true;
        this.dataShareService.sendActionType(ActionType.Add$, true, {});
      }else if(action == 'edit' ) {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.sharedService.waringSwallModel(`The document is already released`)
        } else if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'N/A') {
          this.sharedService.waringSwallModel(`You can't edit the document, due to N/A.`)
        }else if(this.selectedDocData?.StatusTxt == 'Draft' && this.selectedDocData?.StatusTxt != "Released"){

          this.openAssessment = true;
          let valueObj = {
            type: WordType.EditBS,
            docKey: this.selectedDocData.Dockey
          }
          this.dataShareService.sendActionType(ActionType.Update$, true, valueObj);
        }
      }else if (action == 'release' && this.selectedDocData?.StatusTxt == 'Draft') { 
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
                customClass: { popup: 'myalertpopup' }
              } as any)
              this.refresh();
            },(error)=>{
              this.sharedService.errorSwallModel(error?.error?.error.message.value)
            })
          }
        }, (error)=>{
          this.sharedService.errorSwallModel(error?.error?.error.message.value)
        }) 
      }else if (action == 'copy' && this.selectedDocData?.StatusTxt == "Released") {
        let valueObj = {
          type: WordType.CopyEA,
          docKey: this.selectedDocData.Dockey
        }
        this.dataShareService.sendActionType(ActionType.Copy$, true, valueObj)
        this.openAssessment = true;
      }else if (action == 'delete' && this.selectedDocData?.StatusTxt == 'Draft'){
        Swal.fire({
          title: 'Confirm',
          text: 'Do you want to delete?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes',
          cancelButtonText: 'No',
          customClass: { popup: 'myalertpopup' }
        } as any).then(async (result) => {
          if (result.value) {

            (this.emergencyService.deleteDialysisDoc(this.latestDocData.Dockey).subscribe((resp)=>{
              Swal.fire({
                text: "Document is deleted successfully",
                icon: 'success',
                confirmButtonText: 'Ok',
                customClass: { popup: 'myalertpopup' }
              } as any)
              this.refresh();
            }, (error)=>{
              this.sharedService.errorSwallModel(error?.error?.error.message.value)
            })
            );
          }
        });
      }
    }
    // Morse Fall Scale
    else if (this.morsefallScale){
      if (action == 'create' ){
        this.openMorseFallScale = true;
        this.dataShareService.sendActionType(ActionType.Add$, false, {});
      }else if(action == 'copy' && this.latestMorseFallScaleData?.StatusTxt == "Released"){
        this.openMorseFallScale = true;
        let valueObj = {
          type: WordType.CopyEA,
          docKey: this.selectedDocData.Dockey
        }
        this.dataShareService.sendActionType(ActionType.Copy$, true, valueObj);
      }else if (action == 'edit'){
         if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.sharedService.waringSwallModel(`The document is already released`)
        } else if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'N/A') {
          this.sharedService.waringSwallModel(`You can't edit the document, due to N/A.`)
        }
      }
      else if (action == 'delete' ||  action == 'release'){
         if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.sharedService.waringSwallModel(`The document is already released`)
        } else if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'N/A') {
          this.sharedService.waringSwallModel(`You can't edit the document, due to N/A.`)
        }
      }
      
    }
    // Hemo Catheter
    else if(this.hemoCatheter){
      if(action == 'create'){
        this.openHemoCatheter = true;
      }else if(action == 'edit' && this.selectedDocData?.StatusTxt == 'Draft' && this.selectedDocData?.StatusTxt != "Released") {
        this.openHemoCatheter = true;
        let valueObj = {
          type: WordType.EditBS,
          docKey: this.selectedDocData.Dockey
        }
        this.dataShareService.sendActionType(ActionType.Update$, true, valueObj);
      }else if(action == 'release' && this.latestHemoCatheterData?.StatusTxt == 'Draft'){
        const dockey = this.latestHemoCatheterData?.Dockey
        this.emergencyService.getHemoCatheterDoc(dockey).subscribe({
          next: (resp:any)=>{
            const formData = resp.d.results[0];
            delete formData['__metadata']
            
            const payload = {
              ...formData,
              DocStatus: '2',
              CatheterInsertion: formData.CatheterInsertion == null ? this.formatDate(new Date()) : formData.CatheterInsertion,
              CatheterRemoval: formData.CatheterRemoval == null ? this.formatDate(new Date()) : formData.CatheterRemoval,
              SessionDate: formData.SessionDate == null ? this.formatDate(new Date()) : formData.SessionDate,
            }

            this.emergencyService.ReleaseHemoCatheterSet(payload).subscribe((resp)=>{
              Swal.fire({
                text: "Document is released successfully",
                icon: 'success',
                confirmButtonText: 'Ok',
                customClass: { popup: 'myalertpopup' }
              } as any)
              this.refresh();
            },(error)=>{
              this.sharedService.errorSwallModel(error?.error?.error.message.value)
            })
          },
          error: (error)=>{
            this.sharedService.errorSwallModel(error?.error?.error.message.value)
          }
        });

        
      }else if (action == 'copy' && this.latestHemoCatheterData?.StatusTxt == "Released") {
        this.openHemoCatheter = true;
        let valueObj = {
          type: WordType.CopyHC,
          docKey: this.selectedDocData.Dockey
        }
        this.dataShareService.sendActionType(ActionType.Copy$, true, valueObj);
      }
    }
    // HemoDialysis Fistula/Graft
    else if(this.hemoDialysisFistulaGraft){
      if(action == 'create' ){
        this.openHemoDialysisFistulaGraft = true;
      }else if(action == 'edit' && this.latestHemoDialysisFistulaGraftData?.StatusTxt == 'Draft' && this.latestHemoDialysisFistulaGraftData?.StatusTxt != "Released") {
        this.openHemoDialysisFistulaGraft = true;
        let valueObj = {
          type: WordType.EditBS,
          docKey: this.selectedDocData.Dockey
        }
        this.dataShareService.sendActionType(ActionType.Update$, true, valueObj);
      }else if(action == 'release' && this.latestHemoDialysisFistulaGraftData?.StatusTxt == 'Draft'){
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
                customClass: { popup: 'myalertpopup' }
              } as any)
              this.refresh();
            },(error)=>{
              this.sharedService.errorSwallModel(error?.error?.error.message.value)
            })
          },
          error: (error)=>{
            this.sharedService.errorSwallModel(error?.error?.error.message.value)
          }
        });

        
      }else if (action == 'copy' && this.latestHemoDialysisFistulaGraftData?.StatusTxt == "Released") {
        this.openHemoDialysisFistulaGraft = true;
        let valueObj = {
          type: WordType.CopyICB,
          docKey: this.selectedDocData.Dockey
        }
        this.dataShareService.sendActionType(ActionType.Copy$, true, valueObj);
      }else if (action == 'delete' && this.latestHemoDialysisFistulaGraftData?.StatusTxt == 'Draft') {
        Swal.fire({
          title: 'Confirm',
          text: 'Do you want to delete?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes',
          cancelButtonText: 'No',
          customClass: { popup: 'myalertpopup' }
        } as any).then(async (result) => {
          if (result.value) {

            (this.emergencyService.deleteHemoDialysisFistulaGraftDoc(this.latestHemoDialysisFistulaGraftData.Dockey).subscribe((resp)=>{
              Swal.fire({
                text: "Document is deleted successfully",
                icon: 'success',
                confirmButtonText: 'Ok',
                customClass: { popup: 'myalertpopup' }
              } as any)
              this.refresh();
            }, (error)=>{
              this.sharedService.errorSwallModel(error?.error?.error.message.value)
            })
            );
          }
        });
      }
    }

    //  nursing admission assesment

    else if (this.isNursingAdmission) {
      if (action == 'create') {
        this.openNurseAdmission = true;
      } else if (action == 'edit') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.openNurseAdmission = true;
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
        } else if(this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.deleteNursingAdmissionDoc(this.selectedDocData.Dockey);
        }
      } else if (action == 'release') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.sharedService.waringSwallModel(`The document is already released`)
        } else if(this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.directReleaseNursingAdmissionDoc();
        }
      } else if (action == 'copy') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.openNurseAdmission = true;
          let valueObj = {
            type: WordType.CopyBS,
            docKey: this.selectedDocData.Dockey
          }
          this.dataShareService.sendActionType(ActionType.Copy$, true, valueObj);
        }
      } else if (action == 'createandrelease') {
        this.openNurseAdmission = true;
        this.NursingAdmissionComp.createNursingAdmissionDoc('4').then((formValue)=>{
          if(formValue){
            this.refresh()
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Nursing discharge summary:', error);
        });
      }
    
    }
    // CPR Document
    else if (this.isCPRDocument) {
      if (action == 'create') {
        this.openCPRDocument = true;
      } else if (action == 'edit') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.openCPRDocument = true;
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
        } else if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.deleteCPRDoc(this.selectedDocData.Dockey);
        }
      } else if (action == 'release') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.sharedService.waringSwallModel(`The document is already released`)
        } else if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.directReleaseCPRDoc();
        }
      } else if (action == 'copy') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.openCPRDocument = true;
          let valueObj = {
            type: WordType.CopyBS,
            docKey: this.selectedDocData.Dockey
          }
          this.dataShareService.sendActionType(ActionType.Copy$, true, valueObj);
        }
      } else if (action == 'createandrelease') {
        this.openCPRDocument = true;
        this.CprDocumentComp.createCPRDocument('4').then((formValue) => {
          if (formValue) {
            this.refresh()
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating CPR document:', error);
        });
      }

    }

// Nusring Care Plans
    else if (this.isNursingCarePlan) {
      if (action == 'create') {
        this.openNursingCarePlans = true;
      } else if (action == 'edit') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.openNursingCarePlans = true;
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
        } else if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.deleteNursingCarePlan(this.selectedDocData.Dockey);
        }
      } else if (action == 'release') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.sharedService.waringSwallModel(`The document is already released`)
        } else if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.directReleaseNursingCarePlanDoc();
        }
      } else if (action == 'copy') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.openNursingCarePlans = true;
          let valueObj = {
            type: WordType.CopyBS,
            docKey: this.selectedDocData.Dockey
          }
          this.dataShareService.sendActionType(ActionType.Copy$, true, valueObj);
        }
      } else if (action == 'createandrelease') {
        this.openNursingCarePlans = true;
        this.NursingCarePlansComp.createNursingCarePlan('4').then((formValue) => {
          if (formValue) {
            this.refresh()
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Glasgow coma scale:', error);
        });
      }

    }

    // Pre-Cardiac Cath Checklist
    else if (this.isPreCardiacCath) {
      if (action == 'create') {
        this.openPreCardiacCath = true;
      } else if (action == 'edit') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.openPreCardiacCath = true;
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
        } else if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.deletePreCardiacCathDoc(this.selectedDocData.Dockey);
        }
      } else if (action == 'release') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.sharedService.waringSwallModel(`The document is already released`)
        } else if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.directReleasePreCardiecCathDoc();
        }
      } else if (action == 'copy') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.openPreCardiacCath = true;
          let valueObj = {
            type: WordType.CopyBS,
            docKey: this.selectedDocData.Dockey
          }
          this.dataShareService.sendActionType(ActionType.Copy$, true, valueObj);
        }
      } else if (action == 'createandrelease') {
        this.openPreCardiacCath = true;
        this.PreCardiacCathComp.createNursingAssessmentDoc('4').then((formValue) => {
          if (formValue) {
            this.refresh()
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Pre-Cardiec Cath document:', error);
        });
      }

    }
  }

 async deleteCPRDoc(docKey: string) {
    Swal.fire({
      title: 'Confirm',
      text: 'Do you want to delete?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: { popup: 'myalertpopup' }
    } as any).then(async (result) => {
      if (result.value) {
        (await this.dayCaseDashboardService.deleteCprDocument(docKey)).subscribe(
          (_success: any) => {
            Swal.fire({
              text: "Document is deleted successfully",
              icon: 'success',
              confirmButtonText: 'Ok',
              customClass: { popup: 'myalertpopup' }
            } as any)
            this.refresh();
          },
          (_error: any) => {
            Swal.fire({
              text: `${_error.error.error.innererror?.errordetails[0]?.message}`,
              icon: 'warning',
              confirmButtonText: 'Ok',
              customClass: { popup: 'myalertpopup' }
            } as any)
            this.refresh();
          }
        );
      }
    });
  }
  openCprDocumentPdf(Dockey) {
    this.pdfUrl = '';
    this.dayCaseDashboardService
      .cprDocPDF(Dockey)
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
  directReleaseCPRDoc() {
    this.subscription = this.dayCaseDashboardService
      .fetcCprDocDetails(this.selectedDocData.Dockey).subscribe({
        next: (data: any) => {
          let paylaod = data.d.results[0];
          delete paylaod.__metadata
          paylaod.DocStatus = '2';
          this.subscription = this.dayCaseDashboardService.saveCprDocument({ d: paylaod }).subscribe({
            next: (data: any) => { },
            error: (err: any) => {
              this.sharedService.waringSwallModel(`Error ${err}`);
              this.sharedService.waringSwallModel(`POST Error at Nurse Endorsment : ${err}`);
            },
            complete: () => {
              this.sharedService.successSwallModel('CPR Document released successfully');
              this.refresh();
            }
          });
        },
        error: (err: any) => {
          this.sharedService.waringSwallModel(`Error ${err}`);
          this.sharedService.waringSwallModel(
            `POST Error at Nurse Endorsment : ${err}`
          );
        }
      });
  }
  directReleasePreCardiecCathDoc() {
    this.subscription = this.dayCaseDashboardService
      .fetcPreCardiacCathDocDetails(this.selectedDocData.Dockey).subscribe({
        next: (data: any) => {
          let paylaod = data.d.results[0];
          delete paylaod.__metadata
          paylaod.DocStatus = '2';
          this.subscription = this.dayCaseDashboardService.savePreCardiacCathDoc({ d: paylaod }).subscribe({
            next: (data: any) => { },
            error: (err: any) => {
              this.sharedService.waringSwallModel(`Error ${err}`);
              this.sharedService.waringSwallModel(`POST Error at Nurse Endorsment : ${err}`);
            },
            complete: () => {
              this.sharedService.successSwallModel('Pre-Cardiec Cath released successfully');
              this.refresh();
            }
          });
        },
        error: (err: any) => {
          this.sharedService.waringSwallModel(`Error ${err}`);
          this.sharedService.waringSwallModel(
            `POST Error at Nurse Endorsment : ${err}`
          );
        }
      });
  }
  directReleaseNursingCarePlanDoc() {
    this.subscription = this.dayCaseDashboardService
      .getNursingCarePlanDetail(this.selectedDocData.Dockey).subscribe({
        next: (data: any) => {
          let paylaod = data.d.results[0];
          delete paylaod.__metadata
          paylaod.DocStatus = '2';
          this.subscription = this.dayCaseDashboardService.createNursingCarePlan({ d: paylaod }).subscribe({
            next: (data: any) => { },
            error: (err: any) => {
              this.sharedService.waringSwallModel(`Error ${err}`);
              this.sharedService.waringSwallModel(`POST Error at Nurse Endorsment : ${err}`);
            },
            complete: () => {
              this.sharedService.successSwallModel('Nursing care plan released successfully');
              this.refresh();
            }
          });
        },
        error: (err: any) => {
          this.sharedService.waringSwallModel(`Error ${err}`);
          this.sharedService.waringSwallModel(
            `POST Error at Nurse Endorsment : ${err}`
          );
        }
      });
  }

// Delete Nursing Care Plan Document
  async deleteNursingCarePlan(docKey: string) {
    Swal.fire({
      title: 'Confirm',
      text: 'Do you want to delete?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: { popup: 'myalertpopup' }
    } as any).then(async (result) => {
      if (result.value) {
        (await this.dayCaseDashboardService.deleteNursingCarePlan(docKey)).subscribe(
          (_success: any) => {
            Swal.fire({
              text: "Document is deleted successfully",
              icon: 'success',
              confirmButtonText: 'Ok',
              customClass: { popup: 'myalertpopup' }
            } as any)
            this.refresh();
          },
          (_error: any) => {
            Swal.fire({
              text: `${_error.error.error.innererror?.errordetails[0]?.message}`,
              icon: 'warning',
              confirmButtonText: 'Ok',
              customClass: { popup: 'myalertpopup' }
            } as any)
            this.refresh();
          }
        );
      }
    });
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
          console.log('formValue',formValue);
          
          if (formValue) {
            this.sharedService.successSwallModel('Braden scale created successfully');
              this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error creating Glasgow coma scale:', error);
        });
      }
      if (this.openNurseAdmission) {
        let docStatus = '1';
        this.NursingAdmissionComp.createNursingAdmissionDoc(docStatus).then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => { 
          console.error('Error scale:', error);
          console.error('Error creating Glasgow coma scale:', error);
        })
      }
      if (this.openNursingCarePlans) {
        let docStatus = '1';
        this.NursingCarePlansComp.createNursingCarePlan(docStatus).then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Glasgow coma scale:', error);
        })
      }

      // Pre Cardiec Cath Document Create API
      if (this.openPreCardiacCath) {
        let docStatus = '1';
        this.PreCardiacCathComp.createNursingAssessmentDoc(docStatus).then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Pre-Cardiac cath:', error);
        })
      }
      if (this.openAssessment) {
        this.postOpenAssessment('1', this.actionType);
      }
      if(this.openMorseFallScale) {
        if(this.morseFallScaleC.getFormData().AmbulatoryAid === 'A' || this.morseFallScaleC.getFormData().Gait === 'A' || this.morseFallScaleC.getFormData().HistoryFalls === 'A' || this.morseFallScaleC.getFormData().IvAccess === 'A' || this.morseFallScaleC.getFormData().MentalStatus === 'A' || this.morseFallScaleC.getFormData().SecondaryDiagnosis === 'A'){
          return this.sharedService.waringSwallModel('All Questions must be answered in order to release this document')
        }
        
        const formData = {
          ...this.morseFallScaleC.getFormData(),
          Dockey: '',
          Einri: this.storageService.einri,
          Patnr: this.storageService.patnr,
          Falnr: this.storageService.falnr,
          Orgdo: 'F21IUAMC',
          DocStatus: '1',
          Dtid: 'SCA_MORSE',
        };
        
        this.emergencyService.postMFSSet(formData).subscribe((resp)=>{
          Swal.fire({
            text: "Document is created successfully",
            icon: 'success',
            confirmButtonText: 'Ok',
            customClass: { popup: 'myalertpopup' }
          } as any)
          this.refresh();
        },(error)=>{
          this.sharedService.errorSwallModel(error?.error?.error.message.value)
        })
      }
      if(this.openHemoCatheter){
        this.postHemoCatheter('1', this.actionType);
      }
      if(this.openHemoDialysisFistulaGraft){
        this.postHemoDialysisFistulaGraft('1', this.actionType);
      }
      // CPR Document Create API
      if (this.openCPRDocument) {
        let docStatus = '1';
        this.CprDocumentComp.createCPRDocument(docStatus).then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating nursing assessment:', error);
        })
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
      if (this.openNursingCarePlans) {
        let docStatus = '1';
        this.NursingCarePlansComp.createNursingCarePlan(docStatus, 'edit').then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Glasgow coma scale:', error);
        })
      }
  
      // Pre Cardiec Cath Document Create API
      if (this.openPreCardiacCath) {
        let docStatus = '1';
        this.PreCardiacCathComp.createNursingAssessmentDoc(docStatus).then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Pre-Cardiac cath:', error);
        })
      }
        // Nursing Admission Assessment Edit API
      if (this.openNurseAdmission) {
        let docStatus = '1';
        this.NursingAdmissionComp.createNursingAdmissionDoc(docStatus).then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => { 
          console.error('Error scale:', error);
          console.error('Error creating Glasgow coma scale:', error);
        })
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
      // CPR Document Create API
      if (this.openCPRDocument) {
        let docStatus = '1';
        this.CprDocumentComp.createCPRDocument(docStatus).then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Pre-Cardiac cath:', error);
        })
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
       // Nursing Admission Assessment Copy API
       if (this.openNurseAdmission) {
        let docStatus = '3';
        this.NursingAdmissionComp.createNursingAdmissionDoc(docStatus).then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => { 
          console.error('Error scale:', error);
          console.error('Error creating Glasgow coma scale:', error);
        })
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
      if (this.openNursingCarePlans) {
        this.NursingCarePlansComp.createNursingCarePlan('3', 'copy').then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Glasgow coma scale:', error);
        })
      }

      // Pre Cardiec Cath Document Create API
      if (this.openPreCardiacCath) {
        let docStatus = '3';
        this.PreCardiacCathComp.createNursingAssessmentDoc(docStatus).then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Pre-Cardiac cath:', error);
        })
      }
      if(this.openMorseFallScale){
        const formData = {
          ...this.morseFallScaleC.getFormData(),
          Dockey: this.latestMorseFallScaleData.Dockey,
          Einri: this.latestMorseFallScaleData.Einri,
          Patnr: this.latestMorseFallScaleData.Patnr,
          Falnr: this.latestMorseFallScaleData.Falnr,
          Orgdo: 'F21IUAMC',
          DocStatus: '3',
          Dtid: 'SCA_MORSE',
        };
        this.emergencyService.createNewMFSSet(formData).subscribe((resp)=>{
          Swal.fire({
            text: "Document is released successfully",
            icon: 'success',
            confirmButtonText: 'Ok',
            customClass: { popup: 'myalertpopup' }
          } as any)
          this.refresh();
        },(error)=>{
          this.sharedService.errorSwallModel(error?.error?.error.message.value)
        })
      }
      if(this.openHemoCatheter){
        this.postHemoCatheter('3', this.actionType);
      }
      if(this.openHemoDialysisFistulaGraft){
        this.postHemoDialysisFistulaGraft('3', this.actionType);
      }

      // CPR Document Create API
      if (this.openCPRDocument) {
        let docStatus = '3';
        this.CprDocumentComp.createCPRDocument(docStatus).then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Pre-Cardiac cath:', error);
        })
      }
    }
  }
  directReleaseFromForm() {
    
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
    else if(this.openNurseAdmission) {
      this.NursingAdmissionComp.createNursingAdmissionDoc('2', 'edit').then((formValue: any) => {
        if (formValue) {
          this.refresh();
        }
      }).catch((error: any) => {
        console.error('Error scale:', error);
        console.error('Error creating Glasgow coma scale:', error);
      });
    } else if (this.openCPRDocument) {
      this.CprDocumentComp.createCPRDocument('2', 'edit').then((formValue: any) => {
        if (formValue) {
          this.refresh();
        }
      }).catch((error: any) => {
        console.error('Error scale:', error);
        console.error('Error creating CPR Document:', error);
      });
    } 
    else if (this.openNursingCarePlans) {
      this.NursingCarePlansComp.createNursingCarePlan('4', 'edit').then((formValue: any) => {
        if (formValue) {
          this.refresh();
        }
      }).catch((error: any) => {
        console.error('Error scale:', error);
        console.error('Error creating Glasgow coma scale:', error);
      });
    }  else if (this.openPreCardiacCath) {
      this.openPreCardiacCath = true;
        this.PreCardiacCathComp.createNursingAssessmentDoc('4').then((formValue) => {
          if (formValue) {
            this.refresh()
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Pre-Cardiec Cath document:', error);
        });
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
    else if(this.openNurseAdmission) {
      this.NursingAdmissionComp.createNursingAdmissionDoc('2', 'edit').then((formValue: any) => {
        if (formValue) {
          this.refresh();
        }
      }).catch((error: any) => {
        console.error('Error scale:', error);
        console.error('Error creating Glasgow coma scale:', error);
      });
    } else if (this.openCPRDocument) {
      this.CprDocumentComp.createCPRDocument('2', 'edit').then((formValue: any) => {
        if (formValue) {
          this.refresh();
        }
      }).catch((error: any) => {
        console.error('Error scale:', error);
        console.error('Error creating CPR Document:', error);
      });
    } 
    else if (this.openNursingCarePlans) {
      this.NursingCarePlansComp.createNursingCarePlan('2', 'edit').then((formValue: any) => {
        if (formValue) {
          this.refresh();
        }
      }).catch((error: any) => {
        console.error('Error scale:', error);
        console.error('Error creating Glasgow coma scale:', error);
      });
    }  else if (this.openPreCardiacCath) {
      this.openPreCardiacCath = true;
        this.PreCardiacCathComp.createNursingAssessmentDoc('2').then((formValue) => {
          if (formValue) {
            this.refresh()
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Pre-Cardiec Cath document:', error);
        });
    } 
  }

  // Copy + Release Nursing Care Plan Document
  copyDirectReleaseNursingCarePlanDoc() {
    this.NursingCarePlansComp.createNursingCarePlan('5', 'copy').then((formValue: any) => {
      if (formValue) {
        this.refresh();
      }
    }).catch((error: any) => {
      console.error('Error scale:', error);
      console.error('Error creating Glasgow coma scale:', error);
    });
  }

  formatDate(dateTimeString){    
    if(dateTimeString){

      const date = new Date(dateTimeString).toISOString()
      const dateDataArr = date.split('T')
      return `${dateDataArr[0]}T${dateDataArr[1].substring(0,8)}`
    }
  }

  convertTimeToPTFormat(time: string): string {    
    if(time.toString().includes('PT')){
     return time
    }else{
      const [hours, minutes] = time.split(':');
      return `PT${hours}H${minutes}M00S`;
    }
    
  }
  convertTimeToPTFormatForDialysis(time:string):string{
    if(time == null){
      let currentTime = this.datePipe.transform(new Date(), 'hh:mm:ss');
      const [hours, minutes] = currentTime?.split(':');
      return `PT${hours}H${minutes}M00S`;
    }else if(time.toString().includes('PT')){
      return time
    }else{
      const [hours, minutes] = time.split(':');
      return `PT${hours}H${minutes}M00S`;
    }
  }

 

  formatTime(dateTimeString: string): string {
    if (dateTimeString) {
      if (!dateTimeString.toString().includes('PT')) {
        // Assuming `dateTimeString` is in the format "HH:mm:ss"
        const timeParts = dateTimeString.split(':');
        if (timeParts.length === 3) {
          const hours = timeParts[0].padStart(2, '0');
          const minutes = timeParts[1].padStart(2, '0');
          const seconds = timeParts[2].padStart(2, '0');
          return `PT${hours}H${minutes}M${seconds}S`;
        }
      }
    }
    return dateTimeString;
  }
  
  

  getReleasedPdf(item) {
    if (item.AttMimeType == 'PDF' || item.AttMimeType == 'url' || item.AttMimeType == 'image/bmp' || item.AttMimeType == 'HTML') {
      this.admissionService.getPatientProfilePDF(item.Dockey).subscribe((_success: any) => {
        if (item.AttMimeType == 'PDF') {
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
          if (!_success?.d?.AttachmentDataStr) {
            this.sharedService.waringSwallModel('Document content is not available');
            return;
          }
          const config: ModalOptions = {
            class: 'modal-dialog-centered modal-xl pdfmodal-size',
          };
          this.modalRef = this.modalService.show(this.releasepdfmodal, config);
          this.htmlData = this.sanitizer.bypassSecurityTrustHtml(_success.d.AttachmentDataStr);
          this.pdfUrlType = 'html';
        }
  
      });
    }
  }

  sortedDocuments: any;
  sort() {
  // Group by Dodat
  this.patientProfileDocumet = this.groupBy(this.documentTypeFilterValue, 'Dodat');

  // Map groups into array format and sort inner documents by CreatedAt
  this.sortedDocuments = Object.keys(this.patientProfileDocumet).map(key => {
    let documents = this.patientProfileDocumet[key];

    // Sort the documents within each date group by CreatedAt (latest first)
    documents.sort((a, b) => {
      const timeToSeconds = (timeStr: string) => {
        if (!timeStr) return 0;
        const match = timeStr.match(/PT(\d+)H(\d+)M(\d+)S/);
        if (!match) return 0;
        const [, h, m, s] = match.map(Number);
        return h * 3600 + m * 60 + s;
      };
      return timeToSeconds(b.CreatedAt) - timeToSeconds(a.CreatedAt);
    });

    return {
      date: new Date(parseInt(key.replace('/Date(', '').replace(')/', ''))),
      documents
    };
  });

  // Sort the date groups ascending or descending
  if (this.asc) {
    this.asc = false;
    this.desc = true;
    this.sortedDocuments.sort((a, b) => b.date.getTime() - a.date.getTime());
  } else {
    this.asc = true;
    this.desc = false;
    this.sortedDocuments.sort((a, b) => a.date.getTime() - b.date.getTime());
  }
}

  jsonString() {
    return JSON.stringify(this.patientProfileDocumet);
  }

  getPatientProfileData(item) {
    if (item.AttMimeType == undefined) {
      item.AttMimeType = 'HTML';
    }
    this.getReleasedPdf(item);
  }

  getScaleDetails(item, docType?) {
    if (docType === RedirectionType.TRASM$) {
      item.AttMimeType = 'PDF';
    } else {
      item.AttMimeType = 'HTML';
    }
    this.getReleasedPdf(item);
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
        customClass: { popup: 'myalertpopup' }
      } as any)
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
      customClass: { popup: 'myalertpopup' }
    } as any).then(async (result) => {
      if (result.value) {

        (await this.medComp.deleteMedReport()).subscribe(
          (_success: any) => {
            Swal.fire({
              text: "Document is deleted successfully",
              icon: 'success',
              confirmButtonText: 'Ok',
              customClass: { popup: 'myalertpopup' }
            } as any)
            this.medComp.resetAll();
            this.refresh();
          },
          (_error: any) => { }
        );
      }
    });
  }

  async deletePreCardiacCathDoc(docKey: string) {
      Swal.fire({
        title: 'Confirm',
        text: 'Do you want to delete?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        customClass: { popup: 'myalertpopup' }
      } as any).then(async (result) => {
        if (result.value) {
          (await this.dayCaseDashboardService.deletePreCardiacCathDoc(docKey)).subscribe(
            (_success: any) => {
              Swal.fire({
                text: "Document is deleted successfully",
                icon: 'success',
                confirmButtonText: 'Ok',
                customClass: { popup: 'myalertpopup' }
              } as any)
              this.refresh();
            },
            (_error: any) => {
              Swal.fire({
                text: `${_error.error.error.innererror?.errordetails[0]?.message}`,
                icon: 'warning',
                confirmButtonText: 'Ok',
                customClass: { popup: 'myalertpopup' }
              } as any)
              this.refresh();
            }
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
        customClass: { popup: 'myalertpopup' }
      } as any)
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
        customClass: { popup: 'myalertpopup' }
      } as any)
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
        customClass: { popup: 'myalertpopup' }
      } as any)
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
        customClass: { popup: 'myalertpopup' }
      } as any)
      this.educationAssessmentComp.resetAll();
      this.refresh();
    }, (_error: any) => {
      Swal.fire({
        text: `Education assessment has error, contact your administrator`,
        icon: 'warning',
        confirmButtonText: 'Ok',
        customClass: { popup: 'myalertpopup' }
      } as any)
    });
  }

  // Copy + Release Nursing Admission Document
  copyDirectReleasePreCardiac() {
    // this.NursingAdmissionComp.createNursingAdmissionDoc('5','copy').then((formValue: any) => {
    this.PreCardiacCathComp.createNursingAssessmentDoc('5', 'copy').then((formValue: any) => {
      if (formValue) {
        this.refresh();
      }
    }).catch((error: any) => {
      console.error('Error scale:', error);
      console.error('Error creating Pre-Cardiac Cath document:', error);
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
      customClass: { popup: 'myalertpopup' }
    } as any).then(async (result) => {
      if (result.value) {
        (await this.admissionService
          .deleteEducationDetails(this.educationAssList[0].Dockey)).subscribe(
            (_success: any) => {
              Swal.fire({
                text: "Document is deleted successfully",
                icon: 'success',
                confirmButtonText: 'Ok',
                customClass: { popup: 'myalertpopup' }
              } as any)
              this.refresh();
            },
            (_error: any) => {
              Swal.fire({
                text: `${_error.error.error.innererror.errordetails[0].message}`,
                icon: 'warning',
                confirmButtonText: 'Ok',
                customClass: { popup: 'myalertpopup' }
              } as any)
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
        customClass: { popup: 'myalertpopup' }
      } as any)
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

  openPreCathDocPdf(Dockey) {
    this.pdfUrl = '';
    this.dayCaseDashboardService
      .preCardiacCathDocPDF(Dockey)
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

  openEducationAssPdf(Dockey) {
    this.pdfUrl = '';
    this.admissionService
      .getEducationPDF(Dockey)
      .subscribe((data: any) => {
        this.pdfUrlType = 'pdf';
        this.pdfUrlConvertToBlob(data?.d?.AttachmentData);
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
      SessionTime:this.convertTimeToPTFormat(this.hemoDialysisFistulaGraftC.hemoDialysisFistulGraftForm.controls['SessionTime'].value)
    };
    this.emergencyService.postHemoDialysisFistulaGraft(formData).subscribe((resp)=>{
      Swal.fire({
        text: `Document is ${ action == 'create' ? 'Created' : action == 'edit' ? 'Updated' : 'Released' } successfully`,
        icon: 'success',
        confirmButtonText: 'Ok',
        customClass: { popup: 'myalertpopup' }
      } as any)
      this.refresh();
    },(error)=>{
      this.sharedService.errorSwallModel(error?.error?.error.message.value)
    })
  }

  postHemoCatheter(docStatus:string,action:string){
    const formData = {
      ...this.hemoCatheterC.getFormData(),
      Dockey: action == 'create' ? '' : this.latestHemoCatheterData?.Dockey,
      Einri: action == 'create' ? this.storageService.einri : this.latestHemoCatheterData?.Einri,
      Patnr: action == 'create' ? this.storageService.patnr : this.latestHemoCatheterData?.Patnr,
      Falnr: action == 'create' ? this.storageService.falnr : this.latestHemoCatheterData?.Falnr,
      Lfdnr: action == 'create' ? this.storageService.lfdnr : this.latestHemoCatheterData?.Lfdnr,
      Orgdo: 'F21IUAMC',
      DocStatus: docStatus,
      Dtid : 'ZMED_HBCA',
      CatheterInsertion:this.formatDate(this.hemoCatheterC.hemoCatheterForm.controls['CatheterInsertion'].value),
      CatheterRemoval:this.formatDate(this.hemoCatheterC.hemoCatheterForm.controls['CatheterRemoval'].value),
      SessionDate:this.formatDate(this.hemoCatheterC.hemoCatheterForm.controls['SessionDate'].value),
      SessionTime:this.convertTimeToPTFormat(this.hemoCatheterC.hemoCatheterForm.controls['SessionTime'].value)
    };
    this.emergencyService.postHemoCatheterSet(formData).subscribe((resp)=>{
      Swal.fire({
        text: `Document is ${ action == 'create' ? 'Created' : action == 'edit' ? 'Updated' : 'Released' } successfully`,
        icon: 'success',
        confirmButtonText: 'Ok',
        customClass: { popup: 'myalertpopup' }
      } as any)
      this.refresh();
    },(error)=>{
      this.sharedService.errorSwallModel(error?.error?.error.message.value)
    })
  }

  async deleteNursingAdmissionDoc(docKey: string) {
    Swal.fire({
      title: 'Confirm',
      text: 'Do you want to delete?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: { popup: 'myalertpopup' }
    } as any).then(async (result) => {
      if (result.value) {
        (await this.dayCaseDashboardService.deleteNursingAdmissionDoc(docKey)).subscribe(
          (_success: any) => {
            Swal.fire({
              text: "Document is deleted successfully",
              icon: 'success',
              confirmButtonText: 'Ok',
              customClass: { popup: 'myalertpopup' }
            } as any)
            this.refresh();
          },
          (_error: any) => {
            Swal.fire({
              text: `${_error.error.error.innererror?.errordetails[0]?.message}`,
              icon: 'warning',
              confirmButtonText: 'Ok',
              customClass: { popup: 'myalertpopup' }
            } as any)
            this.refresh();
          }
        );
      }
    });
  }
 replaceNullWithEmptyString(payload) {
    for (const key in payload) {
        if (payload[key] === null) {
            payload[key] = "";
        }
    }
    return payload;
}

// cleanPayload(payload: any) {
//   const keysToRemove = ['HaAOther','DiOther','AcCentral','AcWindowUnit','FanCeiling','FanStanding','FanWindow','HeatingElectric','HeatingGas','HeatingSolar'
//     ,'ChOther','PdSmoke', 'PdPhone','PdFire','PdOther','StIndoors','StOutdoors','StEnclosedWFloor','StEnclosedWoFloor','StAdequate'
//     ,'StInadequate','StAreaHeated','StOther', 'HoPlumbing' ,'HoEnclosed','HoAdequate' ,'HoCleanlinessAd','HoCleanlinessNeed','HoPetsInside','PPostWeight',
//     'HoPetsOutside','HoAbsent','HoDoor', 'HoWindows', 'HoOther','WaCity','WaWell','WaSpring','WaCistern','WaOther', 'GaCity','GaSepticTank',
//      'GaGarbage','GaOther','DryWeight','PostWeight','NewDryWeight','Height'
//   ];
  
//   keysToRemove.forEach(key => {
//     if (payload[key] === "" || payload[key] === null) {
//       delete payload[key];
//     }
//   });
// console.log('newclean-payload,',payload);

//   return payload;
// }
cleanPayload(payload: any) {
  Object.keys(payload).forEach(key => {
    if (payload[key] === "" || payload[key] === null) {
      delete payload[key];
    }
  });

  console.log('newclean-payload,', payload);
  return payload;
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
      TreatmentTime: this.convertTimeToPTFormatForDialysis(
        dAssessmentForm.controls['preDialysis'].get('TreatmentTime').value
      ),
      DialysisFTime: this.convertTimeToPTFormatForDialysis(
        dAssessmentForm.controls['preDialysis'].get('DialysisFTime').value
      ),
      PTreatmentDate: this.formatDate(
        dAssessmentForm.controls['postDialysisMonitoring'].get(
          'PTreatmentDate'
        ).value
      ),
      PTreatmentTime: this.convertTimeToPTFormatForDialysis(
        dAssessmentForm.controls['postDialysisMonitoring'].get(
          'PTreatmentTime'
        ).value
      ),
      PrescribedTime: this.convertTimeToPTFormatForDialysis(
        dAssessmentForm.controls['preDialysis'].get('PrescribedTime').value
      ),
      TOMONITOR: toMonitor,
    }; 
    
    console.log('payload',payload);


    let newCleanPayload = this.replaceNullWithEmptyString(payload)

    this.emergencyService.postDailysisSet(this.cleanPayload(newCleanPayload)).subscribe(
      (resp) => {
        Swal.fire({
          text: `Document is ${ action == 'create' ? 'Created' : action == 'edit' ? 'Updated' : action == 'copy' ? 'Created' : 'Released' } successfully`,
          icon: 'success',
          confirmButtonText: 'Ok',
          customClass: { popup: 'myalertpopup' }
        } as any)
        this.refresh();
      },
      (error) => {
        this.sharedService.errorSwallModel(error?.error?.error.message.value)
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

