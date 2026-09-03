import { Component, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { NurseEndorsementComponent } from './nurse-endorsement/nurse-endorsement.component';
import { SurgicalPassportComponent } from './surgical-passport/surgical-passport.component';
import { PainAssessmentNurEmrComponent } from './pain-assessment-nur-emr/pain-assessment-nur-emr.component';
import { PediatricEarlyWarningComponent } from './pediatric-early-warning/pediatric-early-warning.component';
import { NursingCarePlansComponent } from './nursing-care-plans/nursing-care-plans.component';
import { DayCaseDashboardService } from '@services/day-case.dashboard/day-case-dashboard.service';
import { CorrespondenceDocumentComponent } from 'src/app/shared-module/correspondence-document/correspondence-document.component';
import { CprDocumentComponent } from 'src/app/shared-module/cpr-document/cpr-document.component';
import { SbarNursingEndorsementComponent } from './sbar-nursing-endorsement/sbar-nursing-endorsement.component';
import { CvcInsertionComponent } from 'src/app/shared-module/cvc-insertion/cvc-insertion.component';
import { CvcMaintenanceComponent } from 'src/app/nursing-inpatient-dashboard/nurs-treatment-workarea/patient-documentation/cvc-maintenance/cvc-maintenance.component';
import { ICBundlesComponent } from 'src/app/nursing-inpatient-dashboard/nurs-treatment-workarea/patient-documentation/ic-bundles/ic-bundles.component';
import { IntraOperativeRecordComponent } from 'src/app/nursing-inpatient-dashboard/nurs-treatment-workarea/patient-documentation/intra-operative-record/intra-operative-record.component';
import { hasPreviousDocumentVersions } from '@services/document-version-history.util';

@Component({
  selector: 'app-patient-documentation',
  templateUrl: './patient-documentation.component.html',
  styleUrls: ['./patient-documentation.component.scss']
})
export class PatientDocumentationComponent implements OnInit {

  @ViewChild(ErPhysicianComponent) phyComp: ErPhysicianComponent;
  @ViewChild(PatientMedicalReportComponent) medComp: PatientMedicalReportComponent;
  @ViewChild(PatientEducationDetailsComponent) educationAssessmentComp: PatientEducationDetailsComponent;
  @ViewChild(GlasgowComaScaleComponent) GlasgowComaScaleComp: GlasgowComaScaleComponent;
  @ViewChild(FacePainScaleComponent) FacePainScaleComp: FacePainScaleComponent;
  @ViewChild(NumericRatingScaleComponent) NumericRatingScaleComp: NumericRatingScaleComponent;
  @ViewChild(BradenScaleComponent) BradenScaleComp: BradenScaleComponent;
  @ViewChild(EmergencyNursingDocumentComponent) EmergencyNursingDocumentComp: EmergencyNursingDocumentComponent;
  @ViewChild(NurseEndorsementComponent) NurseEndorsmentComp: NurseEndorsementComponent;
  @ViewChild(SurgicalPassportComponent) SurgicalPassComp: SurgicalPassportComponent;
  @ViewChild(PainAssessmentNurEmrComponent) PainAssessmentComp: PainAssessmentNurEmrComponent;
  @ViewChild(NursingCarePlansComponent) NursingCarePlansComp: NursingCarePlansComponent;
  @ViewChild(PediatricEarlyWarningComponent) PediatricWarningScaleComp: PediatricEarlyWarningComponent;
  @ViewChild(CorrespondenceDocumentComponent) CorrespondenceComp: CorrespondenceDocumentComponent;
  @ViewChild(CprDocumentComponent) CprDocumentComp: CprDocumentComponent;
  @ViewChild(SbarNursingEndorsementComponent) SbarNursingEndorsementComp: SbarNursingEndorsementComponent;
  @ViewChild(ICBundlesComponent) ICBundlesComp: ICBundlesComponent;
  @ViewChild(CvcMaintenanceComponent) ICCvcMainComp: CvcMaintenanceComponent;
  @ViewChild(IntraOperativeRecordComponent) NurseIntraComp: IntraOperativeRecordComponent;
  @ViewChild(CvcInsertionComponent) CVCInsertionComp: CvcInsertionComponent;

  @ViewChild('patientDiagnosisHistory', { static: true }) patientDiagnosisHistory: PatientDiagnoisiHistoryComponent;
  @ViewChild('releasepdfmodal') releasepdfmodal: TemplateRef<HTMLDivElement>;
  @ViewChild('notreleasedmodal') notreleasedmodal: TemplateRef<HTMLDivElement>;
  @ViewChild('selectIconPdf', { static: true }) selectIconPdf: TemplateRef<any>;
  @ViewChild('attachmentmodal') attachmentModal: any;
  modalRef: BsModalRef;
  phyAssess = false;
  nursAssess = false;
  attachments = false;
  nurseEndorsement = false;
  surgicalPassport = false;
  pediatricEarlyWarningScale = false;
  educationAssessment = false;
  patienteducation = false;
  glasgowcomascale = false;
  emergencynursingdoc = false;
  facepainscale = false;
  bradenscale = false;
  isPainAssessment = false;
  isNursingCarePlans = false;
  numericratingscale = false;

  public isCorrespondenceDocument: boolean = false;
  public openCorrespondenceDocument: boolean = false;
  public isBundles: boolean = false;
  public isCvcMain: boolean = false;
  public isNurseIntra: boolean = false;
  public isCVCInsertion: boolean = false;
  public openBundles: boolean = false;
  public openCvcMain: boolean = false;
  public openNurseIntra: boolean = false;
  public openCVCInsertionDocument: boolean = false;
  public isCPRDocument: boolean = false;
  public openCPRDocument: boolean = false;
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
  painAssessmentLaestDoc: any = [];
  nursingCarePlanDoc: any = [];
  nurseEndorsementList = [];
  surgicalPassportList = [];
  pediatricEarlyWarningList = [];
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
  openNurseEndorsement: boolean = false;
  openPediatricEarlyWarningScale: boolean = false;
  openSurgicsalPassport: boolean = false;
  public isSbarNursingEnd: boolean = false;
  openSbarNursingEnd: boolean = false;
  sbarNurEndList: any = [];
  selectedDocData: any;
  medlatestDocList = [];
  medDocList = [];
  latestCorrespondenceList = [];
  latestCprList = [];
  bundlesList: any[] = [];
  cvcMainList: any[] = [];
  nurseIntraMainList: any[] = [];
  latestCVCInsertionList: any[] = [];
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
  public RedirectionType: any;
  public ActionType: any;
  openPainAssement: any = false;
  openNursingCarePlans: boolean = false;
  documentTypeFilterValueClone: any[] = [];
  selectedDocumentOU: any;
  selectedCreatedBy: any;
  previousPeriodValue: any = 'Overall';
  previousPeriodsList = [
    "Current Day", "Since Yesterday", "In Past 3 Days", "In Past Week", "In Past Month", "In Past Years", "Overall"
  ];

  selectedDocument: any;
  get nursingDocumentOpen(): boolean {
    return this.openBundles || this.openCvcMain || this.openNurseIntra || this.openCVCInsertionDocument;
  }

  documentFilterList = [
    {
      label: 'Emergency Nursing Document',
      value: 'END'
    },
    {
      label: 'Nursing Intra-Operative Record',
      value: 'NIOR'
    },
    {
      label: 'IC Bundles for Urinary Catheter',
      value: 'ICBUC'
    },
    {
      label: 'IC Bundles for CVC Insertion',
      value: 'ICBCI'
    },
    {
      label: 'IC Bundles for CVC Maintenance',
      value: 'ICBCM'
    },
    {
      label: 'Glasgow Coma Scale',
      value: 'GCS'
    },
    {
      label: 'Face Pain Scale',
      value: 'FPS'
    },
    {
      label: 'Numeric Rating Scale',
      value: 'NRS'
    },
    {
      label: 'Braden Scale',
      value: 'BRS'
    },
    {
      label: 'Education Assessment',
      value: 'EDA'
    },
    {
      label: 'Attachments Document',
      value: 'ATD'
    },
    {
      label: 'Nurse Endorsement',
      value: 'NED'
    },
    {
      label: 'Surgical Passport',
      value: 'SUP'
    },
    {
      label: 'Pain Assessment',
      value: 'PAA'
    },
    {
      label: 'Pediatric Early Warning Scale',
      value: 'PEWS'
    },
    {
      label: 'CPR Document',
      value: 'CPD'
    },
    {
      label: 'SBAR Nursing Endorsement',
      value: 'SBARNE'
    },
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
    private dayCaseDashboardService: DayCaseDashboardService
  ) {

    this.RedirectionType = RedirectionType;
    this.ActionType = ActionType;

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
    this.getLatestAssessmentPA();
    this.getTriageLatestDocuments();
    this.getPhyAssessment();
    this.getMedLatestAssessment();
    this.fetchLatestDetails();
    this.getNurseEndorsement()
    this.getSurgicalPass()
    this.getCorrespondenceDocDetails();
    this.getCPRDocDetails();
    this.getSBARNursingDocDetails();
    this.getBundlesLetDoc();
    this.getCvcMainDoc();
    this.getIntraOpNurRecSetMainDoc();
    this.getCVCInsertionDocDetails();

  }

  getLatestAssessmentPA() {
    this.emergencyService.getLatestDocForPA(this.apiJson).subscribe({
      next: (_success: any) => {
        if(_success?.d?.results) {
          this.painAssessmentLaestDoc = _success.d.results;
        }
      },
      error: (err: any) => {
        // Handle errors if the request fails
        console.error('Error  Data:', err);
        this.sharedService.waringSwallModel(`GET Error : ${err}`);
      },
    });
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

  getNurseEndorsement() {
    this.emergencyService.getNurseEndorsementDetail(this.apiJson).subscribe({
      next: (_success: any) => {
        this.nurseEndorsementList = _success.d.results
      },
      error: (err: any) => {
        // Handle errors if the request fails
        console.error('Error  Data:', err);
        this.sharedService.waringSwallModel(`GET Error : ${err}`);
      },
    });
  }

  getSurgicalPass(){
    this.emergencyService.getSurgicalPasportDoc(this.apiJson).subscribe({
      next: (_success: any) => {        
        this.surgicalPassportList = _success.d.results        
      },
      error: (err: any) => {
        // Handle errors if the request fails
        console.error('Error  Data:', err);
        this.sharedService.waringSwallModel(`GET Error : ${err}`);
      },
    });
  }

  // Correspondence Latest
  getCorrespondenceDocDetails() {
    this.dayCaseDashboardService.correspondenceSetDocumentLatestDoc(this.apiJson).subscribe({
      next: (_success: any) => {
        this.latestCorrespondenceList = _success.d.results
      },
      error: (err: any) => {
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

  getSBARNursingDocDetails() {
    this.emergencyService.SBARNursingLatestDoc(this.apiJson).subscribe({
      next: (_success: any) => {
        this.sbarNurEndList = _success.d.results
      },
      error: (err: any) => {
        console.error('Error  Data:', err);
        this.sharedService.waringSwallModel(`GET Error : ${err}`);
      },
    });
  }

  getBundlesLetDoc() {
    this.emergencyService.getBundlesLetDoc(this.apiJson).subscribe({
      next: (_success: any) => {
        this.bundlesList = _success?.d?.results || [];
      },
      error: (err: any) => {
        console.error('Error Data:', err);
        this.sharedService.waringSwallModel(`GET Error : ${err}`);
      },
    });
  }

  getCvcMainDoc() {
    this.emergencyService.getCvcMainDoc(this.apiJson).subscribe({
      next: (_success: any) => {
        this.cvcMainList = _success?.d?.results || [];
      },
      error: (err: any) => {
        console.error('Error Data:', err);
        this.sharedService.waringSwallModel(`GET Error : ${err}`);
      },
    });
  }

  getIntraOpNurRecSetMainDoc() {
    this.emergencyService.getIntraOpNurRecSetMainDoc(this.apiJson).subscribe({
      next: (_success: any) => {
        this.nurseIntraMainList = _success?.d?.results || [];
      },
      error: (err: any) => {
        console.error('Error Data:', err);
        this.sharedService.waringSwallModel(`GET Error : ${err}`);
      },
    });
  }

  getCVCInsertionDocDetails() {
    this.dayCaseDashboardService.CVCInsertionDocumentLatestDoc(this.apiJson).subscribe({
      next: (_success: any) => {
        this.latestCVCInsertionList = _success?.d?.results || [];
      },
      error: (err: any) => {
        console.error('Error Data:', err);
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
        // this.pediatricEarlyWarningList = latestAssessmentResponse.d.results.filter((ele) => ele.Dtid == 'ZSCA_PEWS');
        this.pediatricEarlyWarningList = latestAssessmentResponse.d.results.filter(res => res.Dtid == 'ZSCA_PEWS' );

        // Handle education assessment response
        this.educationAssList = educationAssessmentResponse.d.results;


        // Handle patient profile response
        this.documentTypeFilterValue = patientProfileResponse.d.results;

        this.documentTypeFilterValueClone = patientProfileResponse.d.results;
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
    if (this.paramsObject.action == 'Add' && this.paramsObject.doctype == RedirectionType.TRASM$) {
      this.selectAssessment('emergencynursingdoc', this.latestEmergencyNursingDocList[0])
      this.openDocument('create');
    } else if (this.paramsObject.action == 'Update' && this.paramsObject.doctype == RedirectionType.TRASM$) {
      this.selectAssessment('emergencynursingdoc', this.latestEmergencyNursingDocList[0])
      this.openDocument('edit');
    } else if (this.paramsObject.action == 'View' && this.paramsObject.doctype == RedirectionType.TRASM$) {
      this.getScaleDetails(this.latestEmergencyNursingDocList[0], RedirectionType.TRASM$);
    } else if (this.paramsObject.action == 'Add' && this.paramsObject.doctype == RedirectionType.BRADEN$) {
      this.selectAssessment('bradenscale', this.latestBridentScaleList[0])
      this.openDocument('create');
    } else if (this.paramsObject.action == 'Update' && this.paramsObject.doctype == RedirectionType.BRADEN$) {
      this.selectAssessment('bradenscale', this.latestBridentScaleList[0])
      this.openDocument('edit');
    } else if (this.paramsObject.action == 'View' && this.paramsObject.doctype == RedirectionType.BRADEN$) {
      this.getScaleDetails(this.latestBridentScaleList[0], RedirectionType.BRADEN$);
    } else if (this.paramsObject.action == 'Add' && this.paramsObject.doctype == RedirectionType.COMMA$) {
      this.selectAssessment('glasgowcomascale', this.latestGlasgowComaScaleList[0])
      this.openDocument('create');
    } else if (this.paramsObject.action == 'Update' && this.paramsObject.doctype == RedirectionType.COMMA$) {
      this.selectAssessment('glasgowcomascale', this.latestGlasgowComaScaleList[0])
      this.openDocument('edit');
    } else if (this.paramsObject.action == 'View' && this.paramsObject.doctype == RedirectionType.COMMA$) {
      this.getScaleDetails(this.latestGlasgowComaScaleList[0], RedirectionType.COMMA$);
    } else if (this.paramsObject.action == 'Add' && this.paramsObject.doctype == RedirectionType.FAC$) {
      this.selectAssessment('facepainscale', this.latestFacePainScaleList[0])
      this.openDocument('create');
    } else if (this.paramsObject.action == 'Update' && this.paramsObject.doctype == RedirectionType.FAC$) {
      this.selectAssessment('facepainscale', this.latestFacePainScaleList[0])
      this.openDocument('edit');
    } else if (this.paramsObject.action == 'View' && this.paramsObject.doctype == RedirectionType.FAC$) {
      this.getScaleDetails(this.latestFacePainScaleList[0], RedirectionType.FAC$);
    } else if (this.paramsObject.action == 'Add' && this.paramsObject.doctype == RedirectionType.NMRTSC$) {
      this.selectAssessment('numericratingscale', this.latestNumericratingscaleList[0])
      this.openDocument('create');
    } else if (this.paramsObject.action == 'Update' && this.paramsObject.doctype == RedirectionType.NMRTSC$) {
      this.selectAssessment('numericratingscale', this.latestNumericratingscaleList[0])
      this.openDocument('edit');
    } else if (this.paramsObject.action == 'View' && this.paramsObject.doctype == RedirectionType.NMRTSC$) {
      this.getScaleDetails(this.latestNumericratingscaleList[0], RedirectionType.NMRTSC$);
    } else if (this.paramsObject.action == 'Add' && this.paramsObject.doctype == RedirectionType.EDUAS$) {
      this.selectAssessment('educationAssessment', this.educationAssList[0])
      this.openDocument('create');
    }
    else if (this.paramsObject.action == 'Update' && this.paramsObject.doctype == RedirectionType.EDUAS$) {
      this.selectAssessment('educationAssessment', this.educationAssList[0])
      this.openDocument('edit');
    } else if (this.paramsObject.action == 'View' && this.paramsObject.doctype == RedirectionType.EDUAS$) {
      this.openEducationAssPdf(this.educationAssList[0].Dockey);
    }
    else if (this.paramsObject.action == 'Add' && this.paramsObject.doctype == RedirectionType.EDUAS$) {
      this.selectAssessment('nurseEndorsement', this.nurseEndorsementList[0])
      this.openDocument('create');
    }
    else if (this.paramsObject.action == 'Update' && this.paramsObject.doctype == RedirectionType.EDUAS$) {
      this.selectAssessment('nurseEndorsement', this.nurseEndorsementList[0])
      this.openDocument('create');
    }
    else if (this.paramsObject.action == 'View' && this.paramsObject.doctype == RedirectionType.NMRTSC$) {
      this.openEducationAssPdf(this.educationAssList[0].Dockey);
    } else if (this.paramsObject.action == 'Add' && this.paramsObject.doctype == RedirectionType.PEWS$) {
      this.selectAssessment('pediatricEarlyWarningScale', this.pediatricEarlyWarningList[0])
      this.openDocument('create');
    } else if (this.paramsObject.action == 'Update' && this.paramsObject.doctype == RedirectionType.PEWS$) {
      this.selectAssessment('pediatricEarlyWarningScale', this.pediatricEarlyWarningList[0])
      this.openDocument('edit');
    } else if (this.paramsObject.action == 'View' && this.paramsObject.doctype == RedirectionType.PEWS$) {
      this.getScaleDetails(this.pediatricEarlyWarningList[0], RedirectionType.PEWS$);
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
      'nurseEndorsement': { nurseEndorsement: true, selectedDocName: 'Nurse Endorsement' },
      'surgicalPassport': { surgicalPassport: true, selectedDocName: 'Surgical Passport' },
      'pediatricEarlyWarningScale': { pediatricEarlyWarningScale: true, selectedDocName: 'Pediatric Early Warning Score' },
      'glasgowcomascale': { glasgowcomascale: true, selectedDocName: 'Glasgow Coma Scale' },
      'facepainscale': { facepainscale: true, selectedDocName: 'Face Pain Scale' },
      'bradenscale': { bradenscale: true, selectedDocName: 'Braden Scale' },
      'numericratingscale': { numericratingscale: true, selectedDocName: 'Numeric rating scale(more than 8 years)' },
      'emergencynursingdoc': { emergencynursingdoc: true, selectedDocName: 'Emergency Nursing Document' },
      'educationAssessment': { educationAssessment: true, selectedDocName: 'Education Assesment' },
      'isPainAssessment': { isPainAssessment: true, selectedDocName: 'Pain Assesment' },
      'isNursingCarePlans': { isNursingCarePlans: true, selectedDocName: 'Nursing Care Plan' },
      'isCPRDocument': { isCPRDocument: true, selectedDocName: 'CPR Document' },
      'isSbarNursingEnd': { isSbarNursingEnd: true, selectedDocName: 'SBAR Nursing Endorsement' },
      'isNurseIntra': { isNurseIntra: true, selectedDocName: 'Nursing Intra-Operative Record' },
      'isBundles': { isBundles: true, selectedDocName: 'IC Bundles for Urinary Catheter' },
      'isCVCInsertion': { isCVCInsertion: true, selectedDocName: 'IC Bundles for CVC Insertion' },
      'isCvcMain': { isCvcMain: true, selectedDocName: 'IC Bundles for CVC Maintenance' },
    };

    // Reset all flags to false initially
    this.phyAssess = false;
    this.nursAssess = false;
    this.medReport = false;
    this.attachments = false;
    this.nurseEndorsement = false;
    this.surgicalPassport = false;
    this.pediatricEarlyWarningScale = false;
    this.educationAssessment = false;
    this.glasgowcomascale = false;
    this.facepainscale = false;
    this.numericratingscale = false;
    this.bradenscale = false;
    this.emergencynursingdoc = false;
    this.isPainAssessment = false;
    this.isNursingCarePlans = false;
    this.isCPRDocument = false;
    this.isSbarNursingEnd = false;
    this.isBundles = false;
    this.isCvcMain = false;
    this.isNurseIntra = false;
    this.isCVCInsertion = false;

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
          this.patientDiagnosisHistory.showPopup(data, item);
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

    console.log(this.pdfUrl, "pdfUrl");
    
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
    if (this.openEducationAssessment) {
      this.educationAssessmentComp.ngOnDestroy();
    }
    if (this.openNurseEndorsement) {
      this.NurseEndorsmentComp.ngOnDestroy();
    }
    if (this.openSurgicsalPassport) {
      this.SurgicalPassComp.ngOnDestroy();
    }
    if (this.openPediatricEarlyWarningScale) {
      this.PediatricWarningScaleComp.ngOnDestroy();
    }

    if (this.openEmergencyNursingDoc) {
      this.EmergencyNursingDocumentComp.ngOnDestroy();
    }

    if (this.openPainAssement) {
      this.PainAssessmentComp.ngOnDestroy();
    }

    if (this.openCPRDocument) {
      this.CprDocumentComp.ngOnDestroy();
    }
    if (this.openSbarNursingEnd) {
      this.SbarNursingEndorsementComp.ngOnDestroy();
    }
    if (this.openBundles) {
      this.ICBundlesComp.ngOnDestroy();
    }
    if (this.openCvcMain) {
      this.ICCvcMainComp.ngOnDestroy();
    }
    if (this.openNurseIntra) {
      this.NurseIntraComp.ngOnDestroy();
    }
    if (this.openCVCInsertionDocument) {
      this.CVCInsertionComp.ngOnDestroy();
    }
    // if (this.openNursingCarePlans) {
    //   this.NursingCarePlansComp.ngOnDestroy();
    // }

    this.getCPRDocDetails();
    this.getLatestAssessment();
    this.getPhyAssessment();
    this.getTriageLatestDocuments();
    this.getMedLatestAssessment();
    this.getEducationAssessment();
    this.getPatientProfile();
    this.getNurseEndorsement()
    this.getSurgicalPass();
    this.getLatestAssessmentPA();
    this.getSurgicalPass()
    this.fetchLatestDetails();
    this.getSBARNursingDocDetails();
    this.getBundlesLetDoc();
    this.getCvcMainDoc();
    this.getIntraOpNurRecSetMainDoc();
    this.getCVCInsertionDocDetails();

    this.nursAssess = false;
    this.glasgowcomascale = false;
    this.facepainscale = false;
    this.numericratingscale = false;
    this.bradenscale = false;
    this.educationAssessment = false;
    this.nurseEndorsement = false;
    this.surgicalPassport = false;
    this.pediatricEarlyWarningScale = false;
    this.medReport = false;
    this.emergencynursingdoc = false;
    this.isPainAssessment = false;
    this.openPainAssement = false;
    this.openNursingCarePlans = false;
    this.isCPRDocument = false;
    this.openCPRDocument = false;
    
    this.openPhyAssess = false;
    this.openMedReport = false;
    this.openGlasgowComaScale = false;
    this.openFacePainScale = false;
    this.openNumericRatingScale = false;
    this.openBradenScale = false;
    this.openEducationAssessment = false;
    this.openEmergencyNursingDoc = false;
    this.openNurseEndorsement = false
    this.openSurgicsalPassport = false
    this.openPediatricEarlyWarningScale = false
    this.isSbarNursingEnd = false;
    this.openSbarNursingEnd = false;
    this.isBundles = false;
    this.isCvcMain = false;
    this.isNurseIntra = false;
    this.isCVCInsertion = false;
    this.openBundles = false;
    this.openCvcMain = false;
    this.openNurseIntra = false;
    this.openCVCInsertionDocument = false;

    this.searchString = '';
    this.dateRange = '';
    this.documentType = undefined;
    this.patientProfileDocumet = this.documentTypeFilterValue;
    this.medDocList = [];
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
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.openEducationAssessment = true;;
          let valueObj = {
            type: WordType.CopyEA,
            docKey: this.selectedDocData.Dockey
          }
          this.dataShareService.sendActionType(ActionType.Copy$, true, valueObj);
        }
      } else if (action == 'createandrelease') {
        this.openEducationAssessment = true;
        this.educationAssessmentComp.saveAndReleaseEducation(false);
        this.educationAssessmentComp.ngOnInit();
      }
    }
    // nurse endorsement

    if (this.nurseEndorsement) {
      if (action == 'create') {
        this.openNurseEndorsement = true;
      } else if (action == 'edit') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.openNurseEndorsement = true;;
          let valueObj = {
            type: WordType.EditNE,
            docKey: this.selectedDocData.Dockey
          }
          this.dataShareService.sendActionType(ActionType.Update$, true, valueObj);
        }
      } else if (action == 'delete') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.deleteNurseEndorsmentDoc();
        } else {
          // this.sharedService.waringSwallModel(`The document is already released`);
        }
      } else if (action == 'release') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.releaseNurseEndorsment();
        } else {
          // this.sharedService.waringSwallModel(`The document is already released`);
        }
      } else if (action == 'copy') {
        // this.openNurseEndorsement = true;
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.openNurseEndorsement = true;;
          let valueObj = {
            type: WordType.CopyEA,
            docKey: this.selectedDocData.Dockey
          }
          this.dataShareService.sendActionType(ActionType.Copy$, true, valueObj);
        }
      } else if (action == 'createandrelease') {
        this.openNurseEndorsement = true;
        this.NurseEndorsmentComp.saveNurseEnd('1');
        // this.educationAssessmentComp.ngOnInit();
        // this.createAndReleaseMed();
      }
    }

    if (this.isSbarNursingEnd) {
      if (action == 'create') {
        this.openSbarNursingEnd = true;
      } else if (action == 'edit') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.openSbarNursingEnd = true;;
          let valueObj = {
            type: WordType.EditNE,
            docKey: this.selectedDocData.Dockey
          }
          this.dataShareService.sendActionType(ActionType.Update$, true, valueObj);
        }
      } else if (action == 'delete') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.deleteSbarNursingDoc();
        } else {
          this.sharedService.waringSwallModel(`The document is already released`);
        }
      } else if (action == 'release') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.sharedService.waringSwallModel(`The document is already released`)
        } else if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.releaseSbarNursingMainDetail();
        }
      } else if (action == 'copy') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.openSbarNursingEnd = true;;
          let valueObj = {
            type: WordType.CopyEA,
            docKey: this.selectedDocData.Dockey
          }
          this.dataShareService.sendActionType(ActionType.Copy$, true, valueObj);
        }
      } else if (action == 'createandrelease') {
        this.openSbarNursingEnd = true;
        this.SbarNursingEndorsementComp.createSbarNursingDoc('4').then((formValue: any) => {
          if (formValue) {
            this.refresh()
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating SBAR Nursing Endorsement Document:', error);
        });
      }
    }
    
    // Surgical passport
    if (this.surgicalPassport) {
      if (action == 'create') {
        this.openSurgicsalPassport = true;
      } else if (action == 'edit') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.openSurgicsalPassport = true;;
          let valueObj = {
            type: WordType.EditNE,
            docKey: this.selectedDocData.Dockey
          }
          this.dataShareService.sendActionType(ActionType.Update$, true, valueObj);
        }
      } else if (action == 'delete') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.deleteSurgicalPassDoc();
        } else {
          // this.sharedService.waringSwallModel(`The document is already released`);
        }
      } else if (action == 'release') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.releaseSurgicalPassp();
        } else {
          // this.sharedService.waringSwallModel(`The document is already released`);
        }
      } else if (action == 'copy') {
        // this.openNurseEndorsement = true;
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.openSurgicsalPassport = true;;
          let valueObj = {
            type: WordType.CopyEA,
            docKey: this.selectedDocData.Dockey
          }
          this.dataShareService.sendActionType(ActionType.Copy$, true, valueObj);
        }
      } else if (action == 'createandrelease') {
        this.openSurgicsalPassport = true;
        this.SurgicalPassComp.createSurgicalPassDoc('4').then((formValue)=>{
          if(formValue){
            this.refresh()
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Glasgow coma scale:', error);
        });;
      }
    }
    // pediatric early warning 
    if (this.pediatricEarlyWarningScale) {
      if (action == 'create') {
        this.openPediatricEarlyWarningScale = true;
      } else if (action == 'edit') {        
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.openPediatricEarlyWarningScale = true;;
          let valueObj = {
            type: WordType.EditNE,
            docKey: this.selectedDocData.Dockey
          }
          this.dataShareService.sendActionType(ActionType.Update$, true, valueObj);
        }
      } else if (action == 'delete') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.deleteNurseEndorsmentDoc();
        } else {
          // this.sharedService.waringSwallModel(`The document is already released`);
        }
      } else if (action == 'release') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.releaseNurseEndorsment();
        } else {
          // this.sharedService.waringSwallModel(`The document is already released`);
        }
      } else if (action == 'copy') {
        // this.openNurseEndorsement = true;
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.openPediatricEarlyWarningScale = true;;
          let valueObj = {
            type: WordType.CopyEA,
            docKey: this.selectedDocData.Dockey
          }
          this.dataShareService.sendActionType(ActionType.Copy$, true, valueObj);
        }
      } else if (action == 'createandrelease') {
        this.openPediatricEarlyWarningScale = true;
        this.PediatricWarningScaleComp.savePediatricEarlyWarningScale();
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
        this.NumericRatingScaleComp.ngOnInit();
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
        this.dataShareService.sendActionType(ActionType.Add$, true, '');
      } else if (action == 'edit') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.openEmergencyNursingDoc = true;;
          let valueObj = {
            type: WordType.EditEND,
            docKey: this.selectedDocData.Dockey,
            latest: this.latestEmergencyNursingDocList[0],
          }
          this.dataShareService.sendActionType(ActionType.Update$, true, valueObj);
        }
      } else if (action == 'delete') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.deleteEmergencyNursingDocument(this.selectedDocData.Dockey);
        }
      } else if (action == 'release') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.emergencyService.getTriageDataIfStatusDraftForDetails(this.selectedDocData.Dockey).subscribe((res: any) => {
            let d: any = {
              d: res?.d?.results[0],
            };
            d.d.DocStatus = '2';
            this.emergencyService.saveNurEmrTriage(d).subscribe((result) => {
              this.refresh();
            });
          })
        }
      } else if (action == 'copy') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.openEmergencyNursingDoc = true;
          let valueObj = {
            type: WordType.CopyEND,
            docKey: this.selectedDocData.Dockey,
            latest: this.latestEmergencyNursingDocList[0],
          }
          this.dataShareService.sendActionType(ActionType.Copy$, true, valueObj);
        }
      } else if (action == 'createandrelease') {
        this.openNurseEndorsement = true;
        this.EmergencyNursingDocumentComp.directReleaseNReleaseEmergencyNursingDocument('1');
      }
    }
    else if (this.isPainAssessment) {
        if (action == 'create') {
          this.openPainAssement = true;
        } else if (action == 'edit') {
          if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
            this.openPainAssement = true;
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
            this.deletePainAssessmentDocument(this.selectedDocData.Dockey);
          }
        } else if (action == 'release') {
          if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
            this.sharedService.waringSwallModel(`The document is already released`)
          } else if(this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
            this.directReleasePainAss();
          }
        } else if (action == 'copy') {
          if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
            this.openPainAssement = true;
            let valueObj = {
              type: WordType.CopyBS,
              docKey: this.selectedDocData.Dockey
            }
            this.dataShareService.sendActionType(ActionType.Copy$, true, valueObj);
          }
        } else if (action == 'createandrelease') {
          this.openPainAssement = true;
          this.PainAssessmentComp.savePainAssessmentDoc('4').then((formValue: any) => {
            if (formValue) {
              this.refresh();
            }
          }).catch((error: any) => {
            console.error('Error scale:', error);
            console.error('Error creating Glasgow coma scale:', error);
          });
        }
      
    }

    else if (this.isNursingCarePlans) {
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
        } else if(this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.deletePainAssessmentDocument(this.selectedDocData.Dockey);
        }
      } else if (action == 'release') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.sharedService.waringSwallModel(`The document is already released`)
        } else if(this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.directReleasePainAss();
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
        this.PainAssessmentComp.savePainAssessmentDoc('4').then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Glasgow coma scale:', error);
        });
      }
    
  }

    // CPR Document
    else if (this.isCorrespondenceDocument) {
      if (action == 'create') {
        this.openCorrespondenceDocument = true;
      } else if (action == 'edit') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.openCorrespondenceDocument = true;
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
          this.deleteCorrespondenceDoc(this.selectedDocData.Dockey);
        }
      } else if (action == 'release') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.sharedService.waringSwallModel(`The document is already released`)
        } else if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.directReleaseCorrespondenceDoc();
        }
      } else if (action == 'copy') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.openCorrespondenceDocument = true;
          let valueObj = {
            type: WordType.CopyBS,
            docKey: this.selectedDocData.Dockey
          }
          this.dataShareService.sendActionType(ActionType.Copy$, true, valueObj);
        }
      } else if (action == 'createandrelease') {
        this.openCorrespondenceDocument = true;
        this.CorrespondenceComp.createCorrespondenceDocument('4').then((formValue) => {
          if (formValue) {
            this.refresh()
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating CPR document:', error);
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
    else if (this.isBundles || this.isCvcMain || this.isNurseIntra || this.isCVCInsertion) {
      this.openSelectedNursingDocument(action);
    }
  }

  openSelectedNursingDocument(action: string) {
    if (action == 'create') {
      this.setSelectedNursingDocumentOpen();
    } else if (action == 'edit') {
      if (this.canUseSelectedDraft()) {
        this.setSelectedNursingDocumentOpen();
        this.sendSelectedDocAction(ActionType.Update$);
      }
    } else if (action == 'copy') {
      if (this.canCopySelectedReleased()) {
        this.setSelectedNursingDocumentOpen();
        this.sendSelectedDocAction(ActionType.Copy$);
      }
    } else if (action == 'delete') {
      if (this.canUseSelectedDraft()) {
        this.deleteSelectedNursingDocument();
      }
    } else if (action == 'release') {
      if (this.canUseSelectedDraft()) {
        this.releaseSelectedNursingDocument();
      }
    } else if (action == 'createandrelease') {
      this.setSelectedNursingDocumentOpen();
      this.saveSelectedNursingDocument('4');
    }
  }

  setSelectedNursingDocumentOpen() {
    this.openBundles = this.isBundles;
    this.openCvcMain = this.isCvcMain;
    this.openNurseIntra = this.isNurseIntra;
    this.openCVCInsertionDocument = this.isCVCInsertion;
  }

  sendSelectedDocAction(type: ActionType) {
    this.dataShareService.sendActionType(type, true, {
      docKey: this.selectedDocData?.Dockey,
    });
  }

  canUseSelectedDraft(): boolean {
    if (!this.selectedDocData?.Dockey) {
      return false;
    }
    if (this.selectedDocData?.StatusTxt == 'Released') {
      this.sharedService.waringSwallModel('The document is already released');
      return false;
    }
    if (this.selectedDocData?.StatusTxt == 'N/A') {
      this.sharedService.waringSwallModel("You can't edit the document, due to N/A.");
      return false;
    }
    return this.selectedDocData?.StatusTxt == 'Draft';
  }

  canCopySelectedReleased(): boolean {
    return !!this.selectedDocData?.Dockey && this.selectedDocData?.StatusTxt == 'Released';
  }

  saveSelectedNursingDocument(docStatus?: string) {
    const status = docStatus || (this.actionType == 'copy' ? '3' : '1');
    const actionType = this.actionType == 'edit' || this.actionType == 'copy' ? this.actionType : undefined;
    let savePromise: Promise<any>;

    if (this.openBundles) {
      savePromise = this.ICBundlesComp.createDoc(status, actionType);
    } else if (this.openCvcMain) {
      savePromise = this.ICCvcMainComp.createDoc(status, actionType);
    } else if (this.openNurseIntra) {
      savePromise = this.NurseIntraComp.createDoc(status, actionType);
    } else if (this.openCVCInsertionDocument) {
      savePromise = this.CVCInsertionComp.createCvcInsertionDocument(status, actionType);
    }

    if (savePromise) {
      savePromise.then((formValue: any) => {
        if (formValue) {
          this.refresh();
        }
      });
    }
  }

  deleteSelectedNursingDocument() {
    const docKey = this.selectedDocData?.Dockey;
    if (!docKey) {
      return;
    }

    Swal.fire({
      title: 'Confirm',
      text: 'Do you want to delete?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: { popup: 'myalertpopup' }
    } as any).then((result) => {
      if (!result.value) {
        return;
      }

      let request;
      if (this.isBundles) {
        request = this.emergencyService.deleteBundlesDoc(docKey);
      } else if (this.isCvcMain) {
        request = this.emergencyService.deleteCvcMainDoc(docKey);
      } else if (this.isNurseIntra) {
        request = this.emergencyService.deleteIntraOpNurRecSetDoc(docKey);
      } else if (this.isCVCInsertion) {
        request = this.dayCaseDashboardService.deleteCVCInsertionDocument(docKey);
      }

      if (request) {
        request.subscribe(
          () => {
            Swal.fire({
              text: 'Document is deleted successfully',
              icon: 'success',
              confirmButtonText: 'Ok',
              customClass: { popup: 'myalertpopup' }
            } as any);
            this.refresh();
          },
          (_error: any) => {
            this.sharedService.waringSwallModel(`${_error?.error?.error?.innererror?.errordetails?.[0]?.message || _error}`);
            this.refresh();
          }
        );
      }
    });
  }

  releaseSelectedNursingDocument() {
    const docKey = this.selectedDocData?.Dockey;
    if (!docKey) {
      return;
    }

    if (this.isBundles) {
      this.emergencyService.getUrinaryDetail(docKey).subscribe((res: any) => {
        const payload = res?.d?.results?.[0];
        if (payload) {
          payload.DocStatus = '2';
          this.admissionService.createUrinary(payload).subscribe(() => {
            this.sharedService.successSwallModel('IC Bundles for Urinary Catheter released successfully');
            this.refresh();
          });
        }
      });
    } else if (this.isCvcMain) {
      this.admissionService.getCvcMainDetail(docKey).subscribe((res: any) => {
        const payload = res?.results?.[0];
        if (payload) {
          delete payload.__metadata;
          payload.DocStatus = '2';
          this.admissionService.createCvcMainDoc({ d: payload }).subscribe(() => {
            this.sharedService.successSwallModel('IC Bundles for CVC Maintenance released successfully');
            this.refresh();
          });
        }
      });
    } else if (this.isNurseIntra) {
      this.admissionService.getIntraOpNurRecSetDetail(docKey).subscribe((res: any) => {
        const payload = res?.results?.[0];
        if (payload) {
          delete payload.__metadata;
          payload.DocStatus = '2';
          this.admissionService.createIntraOpNurRecSetDoc({ d: payload }).subscribe(() => {
            this.sharedService.successSwallModel('Nursing Intra-Operative Record released successfully');
            this.refresh();
          });
        }
      });
    } else if (this.isCVCInsertion) {
      this.dayCaseDashboardService.fetcCVCInsertionDocDetails(docKey).subscribe((res: any) => {
        const payload = res?.d?.results?.[0];
        if (payload) {
          delete payload.__metadata;
          payload.DocStatus = '2';
          this.dayCaseDashboardService.saveCVCInsertionDocument({ d: payload }).subscribe(() => {
            this.sharedService.successSwallModel('IC Bundles for CVC Insertion released successfully');
            this.refresh();
          });
        }
      });
    }
  }
  private subscription: Subscription;
  directReleasePainAss() {
    this.subscription = this.emergencyService
    .getPainAssesmentDetails(this.selectedDocData.Dockey).subscribe({
      next: (data: any) => {
        let paylaod = data.d.results[0] 
        paylaod.DocStatus = '2'; 
        paylaod.AttendPhy = this.storageService.getGpart();
        this.subscription = this.emergencyService.createPainAssessmentDoc({ d: paylaod }).subscribe({
          next: (data: any) => {},
          error: (err: any) => {
            this.sharedService.waringSwallModel(`Error ${err}`);
            this.sharedService.waringSwallModel(`POST Error at Nurse Endorsment : ${err}`);
          },
          complete: () => {
            this.sharedService.successSwallModel('Pain Assessment released successfully');
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

  // Copy + Release CPR Document
  copyDirectReleaseCPRDocument() {
    // this.NursingAdmissionComp.createNursingAdmissionDoc('5','copy').then((formValue: any) => {
    this.CprDocumentComp.createCPRDocument('5', 'copy').then((formValue: any) => {
      if (formValue) {
        this.refresh();
      }
    }).catch((error: any) => {
      console.error('Error scale:', error);
      console.error('Error creating CPR Document:', error);
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

  async deleteCorrespondenceDoc(docKey: string) {
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
        (await this.dayCaseDashboardService.deleteCorrespondenceDocument(docKey)).subscribe(
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

  directReleaseCorrespondenceDoc() {
    this.subscription = this.dayCaseDashboardService
      .fetcCorrespondenceSetDocDetails(this.selectedDocData.Dockey).subscribe({
        next: (data: any) => {
          let paylaod = data.d.results[0];
          delete paylaod.__metadata
          paylaod.DocStatus = '2';
          this.subscription = this.dayCaseDashboardService.saveCorrespondenceDocument({ d: paylaod }).subscribe({
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
      customClass: { popup: 'myalertpopup' },
      icon: 'error'
    } as any);
  }

  reloadDoc(event) {
    this.refresh();
  }
  saveDoc() {
    if (this.nursingDocumentOpen) {
      this.saveSelectedNursingDocument();
      return;
    }

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
          console.error('Error scale:', error);
        });
      }
      if (this.openEmergencyNursingDoc) {
        this.EmergencyNursingDocumentComp.saveEmergencyNursingDocument().then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
        });
      }
      if (this.openNurseEndorsement) {
        this.NurseEndorsmentComp.saveNurseEnd('1').then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
        });
      }
      if (this.openSurgicsalPassport) {
        this.SurgicalPassComp.createSurgicalPassDoc('1').then((formValue: any) => {

          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => { 
          console.error('Error scale:', error);
          console.error('Error creating Glasgow coma scale:', error);
        })
      }
          
      if (this.openPainAssement) {
        let docStatus = '1';
        // if(this.selectedDocData?.Dockey) docStatus = '3';
        this.PainAssessmentComp.savePainAssessmentDoc(docStatus).then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Glasgow coma scale:', error);
        });
      }
      if (this.openPediatricEarlyWarningScale) {
        this.PediatricWarningScaleComp.savePediatricEarlyWarningScale().then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
        });
      }
      if (this.openPediatricEarlyWarningScale) {
        this.PediatricWarningScaleComp.savePediatricEarlyWarningScale().then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
        });
      }
      // Correspondence Document
      if (this.openCorrespondenceDocument) {
        let docStatus = '1';
        // if(this.selectedDocData?.Dockey) docStatus = '3';
        this.CorrespondenceComp.createCorrespondenceDocument(docStatus).then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Glasgow coma scale:', error);
        });
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
      if (this.openSbarNursingEnd) {
        let docStatus = '1';
        this.SbarNursingEndorsementComp.createSbarNursingDoc(docStatus).then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Glasgow coma scale:', error);
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
      if (this.openBradenScale) {
        this.BradenScaleComp.createBradeScale().then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
        });
      }
      if (this.openEducationAssessment) {
        this.updateEducationAss(false);
      }
      if (this.openEmergencyNursingDoc) {
        this.EmergencyNursingDocumentComp.saveEmergencyNursingDocument().then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error modifying Glasgow coma scale:', error);
        });
      }
      if (this.openNurseEndorsement) {
        this.NurseEndorsmentComp.editNurseEndDoc('edit').then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error modifying Glasgow coma scale:', error);
        });
      }
      if (this.openSurgicsalPassport) {
        this.SurgicalPassComp.createSurgicalPassDoc('1','edit').then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error modifying Glasgow coma scale:', error);
        });
      }
      if (this.openPainAssement) {
        this.PainAssessmentComp.savePainAssessmentDoc('1').then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Glasgow coma scale:', error);
        });
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
      // Correspondence Document Edit
      if (this.openCorrespondenceDocument) {
        let docStatus = '1';
        // if(this.selectedDocData?.Dockey) docStatus = '3';
        this.CorrespondenceComp.createCorrespondenceDocument(docStatus).then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Glasgow coma scale:', error);
        });
      }
      if (this.openSbarNursingEnd) {
        let docStatus = '1';
        this.SbarNursingEndorsementComp.createSbarNursingDoc(docStatus, 'edit').then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Glasgow coma scale:', error);
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
      if (this.openNumericRatingScale) {
        this.NumericRatingScaleComp.copyNumericRight().then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error copy numeric rating Scale:', error);
        });
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
      if (this.openEducationAssessment) {
        this.createEducationAss(false);
      }
      if (this.openEmergencyNursingDoc) {
        this.EmergencyNursingDocumentComp.directReleaseNReleaseEmergencyNursingDocument("5").then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error copy emergency nursing document:', error);
        });
      }
      if (this.openNurseEndorsement) {
        this.NurseEndorsmentComp.editNurseEndDoc('copy').then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
        });
      }
      if (this.openSurgicsalPassport) {
        this.SurgicalPassComp.copySurgicalPassDoc('3','copy').then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
        });
      }
      if (this.openPediatricEarlyWarningScale) {
        this.PediatricWarningScaleComp.copyPediatricEarlyWarningScale('copy').then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
        });
      }
      if (this.openPainAssement) {
        this.PainAssessmentComp.savePainAssessmentDoc('3').then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Glasgow coma scale:', error);
        });
      }
      // Correspondence Document Edit
      if (this.openCorrespondenceDocument) {
        let docStatus = '3';
        // if(this.selectedDocData?.Dockey) docStatus = '3';
        this.CorrespondenceComp.createCorrespondenceDocument(docStatus).then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Glasgow coma scale:', error);
        });
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
      if (this.openSbarNursingEnd) {
        let docStatus = '3';
        this.SbarNursingEndorsementComp.createSbarNursingDoc(docStatus, 'copy').then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Glasgow coma scale:', error);
        })
      }
    }
  }

  releaseFromForm() {
    if (this.nursingDocumentOpen) {
      this.saveSelectedNursingDocument('2');
    } else if (this.phyAssess) {
      // this.release();
    } else if (this.medReport) {
      this.releaseMed();
    } else if (this.educationAssessment) {
      this.createEducationAss(true);
    } else if (this.nurseEndorsement) {
      this.NurseEndorsmentComp.saveNurseEnd('4');
    } else if (this.openEmergencyNursingDoc) {
      this.EmergencyNursingDocumentComp.directReleaseNReleaseEmergencyNursingDocument('4');
    } else if (this.openSurgicsalPassport) {
      this.SurgicalPassComp.createSurgicalPassDoc('2','edit').then((formValue: any) => {
        if (formValue) {
          this.refresh();
        }
      }).catch((error: any) => {
        console.error('Error scale:', error);
        console.error('Error creating Glasgow coma scale:', error);
      });
    } else if (this.openPainAssement) {
      this.PainAssessmentComp.savePainAssessmentDoc('2').then((formValue: any) => {
        if (formValue) {
          this.refresh();
        }
      }).catch((error: any) => {
        console.error('Error scale:', error);
        console.error('Error creating Glasgow coma scale:', error);
      });
    } else if (this.openCorrespondenceDocument) {
      this.CorrespondenceComp.createCorrespondenceDocument('2', 'edit').then((formValue: any) => {
        if (formValue) {
          this.refresh();
        }
      }).catch((error: any) => {
        console.error('Error scale:', error);
        console.error('Error creating CPR Document:', error);
      });
    } 
    else if (this.openSbarNursingEnd) {
      this.SbarNursingEndorsementComp.createSbarNursingDoc('2', 'edit').then((formValue: any) => {
        if (formValue) {
          this.refresh();
        }
      }).catch((error: any) => {
        console.error('Error scale:', error);
        console.error('Error creating Glasgow coma scale:', error);
      });
    }
  }

  newVersionDirectReleasedSurgical() {
    this.SurgicalPassComp.copySurgicalPassDoc('5','copy').then((formValue: any) => {
      if (formValue) {
        this.refresh();
      }
    }).catch((error: any) => {
      console.error('Error scale:', error);
      console.error('Error creating Glasgow coma scale:', error);
    });
  }

  newVersionDirectReleased() {
    this.PainAssessmentComp.savePainAssessmentDoc('5').then((formValue: any) => {
      if (formValue) {
        this.refresh();
      }
    }).catch((error: any) => {
      console.error('Error scale:', error);
      console.error('Error creating Glasgow coma scale:', error);
    });
  }

  // Copy + Release Correspondence Document
  copyDirectReleaseCorrespondenceDocument() {
    // this.NursingAdmissionComp.createNursingAdmissionDoc('5','copy').then((formValue: any) => {
    this.CorrespondenceComp.createCorrespondenceDocument('5', 'copy').then((formValue: any) => {
      if (formValue) {
        this.refresh();
      }
    }).catch((error: any) => {
      console.error('Error scale:', error);
      console.error('Error creating Pre-Cardiac Cath document:', error);
    });
  }
  openCorrespondenceDocumentPdf(Dockey) {
    this.pdfUrl = '';
    this.dayCaseDashboardService
      .correspondenceDocPDF(Dockey)
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
  getReleasedPdf(item) {
    if (item.AttMimeType == 'PDF' || item.AttMimeType == 'url' || item.AttMimeType == 'image/bmp' || item.AttMimeType == 'HTML') {
      this.admissionService.getPatientProfilePDF(item.Dockey).subscribe((_success: any) => {
        if (item.AttMimeType == 'PDF') {
          this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl('data:application/pdf;base64,' + _success.d.AttachmentData);
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

  getScaleDetails(item, docType?) {
    if (docType === RedirectionType.TRASM$ || docType === RedirectionType.PEWS$) {
      item.AttMimeType = 'PDF';
    } else {
      item.AttMimeType = 'HTML';
    }
    this.getReleasedPdf(item);
  }

  getPatientProfileData(item) {
    this.getReleasedPdf(item);
  }

  openNurseIntraHtml(item) {
    if (!item?.Dockey) {
      this.sharedService.waringSwallModel('Nursing Intra-Operative Record is not available');
      return;
    }
    this.getReleasedPdf({ ...item, AttMimeType: 'HTML' });
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
  async deleteSbarNursingDoc() {
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
          (await this.emergencyService.deleteSBARNursingDocument(this.sbarNurEndList[0].Dockey)).subscribe(
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
  releaseSbarNursingMainDetail() {
    this.emergencyService.fetchSBARNursingDocument(this.sbarNurEndList[0].Dockey).subscribe((res: any) => {
      delete res?.d?.results[0]?.__metadata;
      let d: any = {
        d: res?.d?.results[0],
      };
      d.d.DocStatus = '2';
      this.emergencyService.saveSBARNursingDoc(d).subscribe(
        (result) => {
          this.refresh();
        }
      );
    })
  }
 newVersionDirectReleasedSBAR() {
    this.SbarNursingEndorsementComp.createSbarNursingDoc('5', 'copy').then((formValue: any) => {
      if (formValue) {
        this.refresh();
      }
    }).catch((error: any) => {
      console.error('Error scale:', error);
      console.error('Error creating Glasgow coma scale:', error);
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

  async deleteEmergencyNursingDocument(docKey: string) {
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
        // need to implement delete API
        (await this.emergencyService.deleteNurEmrTriage(docKey)).subscribe(
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
  async deleteNurseEndorsmentDoc() {
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
        (await this.emergencyService.deleteNurseEndDoc(this.nurseEndorsementList[0].Dockey)).subscribe(
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
  async deleteSurgicalPassDoc() {    
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
        (await this.emergencyService.deleteSurgicalPassPDoc(this.surgicalPassportList[0].Dockey)).subscribe(
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


  openSurgicalAssPdf(Dockey) {
    this.pdfUrl = '';
    this.dayCaseDashboardService
      .getSurgicalPDF(Dockey)
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

  async deletePainAssessmentDocument(docKey: string) {
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
        // need to implement delete API
        (await this.emergencyService.deletePainAssessmentDoc(docKey)).subscribe(
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
  releaseNurseEndorsment() {
    this.emergencyService.getNurseEndDetail(this.nurseEndorsementList[0].Dockey).subscribe((res: any) => {
      let d: any = {
        d: res?.d?.results[0],
      };
      d.d.DocStatus = '2';
      this.emergencyService.updateNurseEndDetail(d).subscribe(
        (result) => {
          this.refresh();
        }
      );
    })
  }
  releaseSurgicalPassp() {
    this.emergencyService.getSurgicalPassPortDetail(this.surgicalPassportList[0].Dockey).subscribe((res: any) => {
      let d: any = {
        d: res?.d?.results[0],
      };
      d.d.DocStatus = '2';
      this.emergencyService.createSurgicalPassDetail(d).subscribe(
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

  openPainAssessmentPdf(Dockey) {
    this.pdfUrl = '';
    this.emergencyService
      .getPainAssessmentPDF(Dockey)
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

  openBundlesPdf(Dockey) {
    this.openNursingDocumentPdf(this.dayCaseDashboardService.getBundlesPdf(Dockey));
  }

  openCvcMainsPdf(Dockey) {
    this.openNursingDocumentPdf(this.dayCaseDashboardService.getCvcMainPdf(Dockey));
  }

  getNurseIntraPdf(Dockey) {
    this.openNursingDocumentPdf(this.dayCaseDashboardService.getNurseIntraPdf(Dockey));
  }

  openCVCInsertionDocumentPdf(Dockey) {
    this.openNursingDocumentPdf(this.dayCaseDashboardService.CVCInsertionDocPDF(Dockey));
  }

  openNursingDocumentPdf(request: Observable<any>) {
    this.pdfUrl = '';
    request.subscribe((data: any) => {
      const attachmentData = data?.d?.AttachmentData || data?.d?.AttachmentDataStr;
      if (!attachmentData) {
        this.sharedService.waringSwallModel('PDF is not available for this document');
        return;
      }
      this.pdfUrlType = 'pdf';
      this.pdfUrlConvertToBlob(attachmentData);
      const config: ModalOptions = {
        class: 'modal-dialog-centered modal-xl pdfmodal-size',
      };
      this.modalRef = this.modalService.show(this.releasepdfmodal, config);
    }, () => {
      this.sharedService.waringSwallModel('Unable to load document PDF');
    });
  }

  openPDfModal(template, item: any) {
    this.admissionService.selectedCurrentDocDetails = item;
    let config: ModalOptions = {
      class: 'modal-dialog-centered modal-xl pdfmodal-size',
    };
    this.modalService.show(template, config);
  }

  closePopup() { if (this.modalService) { this.modalService.hide(); } }
  dockVer(value) {
    return `(v${parseInt(value)})`;
  }

  // The history popup lists previous releases only, so the version control is
  // hidden for a first version or a document without a usable version number.
  hasPreviousVersions(document: any): boolean {
    return hasPreviousDocumentVersions(document);
  }

  closePdfModal() {
    this.releaseDocumentImage = '';
    this.modalRef.hide();
  }

  // Calculate content height based on screen resolution
  getContentHeight(): number {
    // Get the viewport height using window.innerHeight
    const viewportHeight = window.innerHeight;

    // Calculate desired content height based on viewport height (adjust as needed)
    const contentHeight = viewportHeight - 390; // Subtract any fixed heights like headers, footers, etc.

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
