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
import { DataShareService } from '@services/data-share.service';
import { ActionType, RedirectionType, WordType } from '@services/interfaces/common.enum';
import { SharedService } from '@services/shared.service';
import { BradenScaleComponent } from './braden-scale/braden-scale.component';
import { SurgicalPassportComponent } from './surgical-passport/surgical-passport.component';
import { DayCaseDashboardService } from '@services/day-case.dashboard/day-case-dashboard.service';
import { NursingCarePlansComponent } from 'src/app/shared-module/nursing-care-plan-document/nursing-care-plans/nursing-care-plans.component';
import { NursingDischargeSummaryComponent } from 'src/app/shared-module/nursing-discharge-summary/nursing-discharge-summary.component';
import { MorseFallScaleComponent } from './morse-fall-scale/morse-fall-scale.component';
import { PatientDocumentationService } from '@services/patient-documentation.service';
import { NursingAdmissionAssessmentComponent } from 'src/app/shared-module/nursing-admission-assessment/nursing-admission-assessment.component';
import { GlasgowComaScaleComponent } from './glasgow-coma-scale/glasgow-coma-scale.component';
import { PainAssessmentNurEmrComponent } from './pain-assessment-nur-emr/pain-assessment-nur-emr.component';
import { PediatricEarlyWarningComponent } from './pediatric-early-warning/pediatric-early-warning.component';
import { NurseEndorsementComponent } from './nurse-endorsement/nurse-endorsement.component';
import { NumericRatingScaleComponent } from './numeric-rating-scale/numeric-rating-scale.component';
import { FacePainScaleComponent } from './face-pain-scale/face-pain-scale.component';
import { NursingAssessmentComponent } from 'src/app/shared-module/nursing-assessment/nursing-assessment.component';
import { PreCardiacCathComponent } from 'src/app/shared-module/pre-cardiac-cath/pre-cardiac-cath.component';
import { CprDocumentComponent } from 'src/app/shared-module/cpr-document/cpr-document.component';
import { CorrespondenceDocumentComponent } from 'src/app/shared-module/correspondence-document/correspondence-document.component';
import { NewbornAssessmentComponent } from 'src/app/shared-module/newborn-assessment/newborn-assessment.component';
import { ModifiedAldreteDocumentComponent } from 'src/app/shared-module/modified-aldrete-document/modified-aldrete-document.component';
import { TimeOutChecklistComponent } from 'src/app/shared-module/time-out-checklist/time-out-checklist.component';
import { NeonatalDischDocumentComponent } from 'src/app/shared-module/neonatal-disch-document/neonatal-disch-document.component';

@Component({
  selector: 'app-patient-documentation',
  templateUrl: './patient-documentation.component.html',
  styleUrls: ['./patient-documentation.component.scss']
})
export class PatientDocumentationComponent implements OnInit {

  @ViewChild(ErPhysicianComponent) phyComp: ErPhysicianComponent;
  @ViewChild(PatientMedicalReportComponent) medComp: PatientMedicalReportComponent;
  @ViewChild(PatientEducationDetailsComponent) educationAssessmentComp: PatientEducationDetailsComponent;
  @ViewChild(BradenScaleComponent) BradenScaleComp: BradenScaleComponent;
  @ViewChild(SurgicalPassportComponent) SurgicalPassComp: SurgicalPassportComponent;
  @ViewChild(NewbornAssessmentComponent) newBornComp: NewbornAssessmentComponent;
  @ViewChild(NursingCarePlansComponent) NursingCarePlansComp: NursingCarePlansComponent;
  @ViewChild(NursingDischargeSummaryComponent) NursingDischargeComp: NursingDischargeSummaryComponent;
  @ViewChild(NursingAdmissionAssessmentComponent) NursingAdmissionComp: NursingAdmissionAssessmentComponent;
  @ViewChild(NursingAssessmentComponent) NursingAssessmentComp: NursingAssessmentComponent;
  @ViewChild(CprDocumentComponent) CprDocumentComp: CprDocumentComponent;
  @ViewChild(PreCardiacCathComponent) PreCardiacCathComp: PreCardiacCathComponent;
  @ViewChild(MorseFallScaleComponent) morseFallScaleC: MorseFallScaleComponent;
  @ViewChild(GlasgowComaScaleComponent) GlasgowComaScaleComp: GlasgowComaScaleComponent;
  @ViewChild(PainAssessmentNurEmrComponent) PainAssessmentComp: PainAssessmentNurEmrComponent;
  @ViewChild(CorrespondenceDocumentComponent) CorrespondenceComp: CorrespondenceDocumentComponent;
  @ViewChild(PediatricEarlyWarningComponent) PediatricWarningScaleComp: PediatricEarlyWarningComponent;
  @ViewChild(NurseEndorsementComponent) NurseEndorsmentComp: NurseEndorsementComponent;
  @ViewChild(NumericRatingScaleComponent) NumericRatingScaleComp: NumericRatingScaleComponent;
  @ViewChild(ModifiedAldreteDocumentComponent) ModifiedAldreteComp: ModifiedAldreteDocumentComponent;
  @ViewChild(FacePainScaleComponent) FacePainScaleComp: FacePainScaleComponent;
  @ViewChild(TimeOutChecklistComponent) TimeOutCheckListComp: TimeOutChecklistComponent;
  @ViewChild(NeonatalDischDocumentComponent) NeonatalDischDocumentComp: NeonatalDischDocumentComponent;

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
  numericratingscale = false;
  fallrisk = false;
  functional = false;
  nutritional = false;


  public isSurgicalPassport: boolean = false;
  public isNewBorn: boolean = false;
  public isNewBundles: boolean = false;
  public isEducationAssement: boolean = false;
  public isNursingCarePlan: boolean = false;
  public isNursingDischarge: boolean = false;
  public isBradenScale: boolean = false;
  public isAttechmentDocument: boolean = false;
  public isMorseFallScale: boolean = false;
  public morsefallScale: boolean = false;
  public isNursingAdmission: boolean = false;
  public isNursingAssessment: boolean = false;
  public isPediatricsAdmission: boolean = false;
  public isFallRiskAssessment: boolean = false;
  public isPreCardiacCath: boolean = false;
  public isNursingInitialAssessment: boolean = false;
  public isObstetricsFallRisk: boolean = false;
  latestMorseFallScaleData: any;

  public isCPRDocument: boolean = false;
  public openCPRDocument: boolean = false;

  public isCorrespondenceDocument: boolean = false;
  public openCorrespondenceDocument: boolean = false;

  public isModifiedAldreteDocument: boolean = false;
  public openModifiedAldreteDocument: boolean = false;
  latestModifiedAldreteList = [];

  public isNeonatalDisch: boolean = false;
  public openNeonatalDischDocument: boolean = false;
  latestNeonatalDischList: any = [];

  public isTimeoutCheck: boolean = false;
  public openTimeoutCheckDocument: boolean = false;
  latestTimeoutCheckList = [];

  phyDocList = [];
  latestDocList = [];
  latestGlasgowComaScaleList = [];
  latestEmergencyNursingDocList = [];
  latestNumericratingscaleList = [];
  latestFacePainScaleList = [];
  latestBridentScaleList = [];
  painAssessmentLaestDoc: any = [];
  nurseEndorsementList = [];
  surgicalPassportList = [];
  pediatricEarlyWarningList = [];
  latestNurCarePlanList = [];
  latestNurDischargeSummeryList = [];
  latestMorseFallScaleList = [];
  latestNurAdmissionList: any = [];
  latestNurAssessment = [];
  latestPediatricsAdmissionList = [];
  latestFallRiskAssessmentList = [];
  latestPreCardiacCathList = [];
  latestCprList = [];
  latestNursingInitialList = [];
  latestObstetricsList = [];
  latestCorrespondenceList = [];
  newBornList = []
  bundlesList = []
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
  documentTypeFilterValueClone: any[] = [];
  asc: boolean = true;
  desc: boolean = false;
  PatientData: any;
  medReport: boolean = false;
  openMedReport: boolean = false;
  openEducationAssessment: boolean = false;
  openNurseAdmission: boolean = false;
  openNurseAssissment: boolean = false;
  openNurseEndorsement: boolean = false;
  openPediatricEarlyWarningScale: boolean = false;
  openSurgicsalPassport: boolean = false;
  openNewBorn: boolean = false;
  openBundles : boolean = false;
  openNursingCarePlans: boolean = false;
  openDischargeSummery: boolean = false;
  openPreCardiacCath: boolean = false;

  selectedDocData: any;
  selectedDocumentOU: any;
  selectedCreatedBy: any;
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
  previousPeriodValue: any = 'Overall';
  previousPeriodsList = [
    "Current Day", "Since Yesterday", "In Past 3 Days", "In Past Week", "In Past Month", "In Past Years", "Overall"
  ];

  createdDocumentUserList: any = [];

  departmentOUList = [
    "CARMDAMC", "", "F21IUAMC"
  ];

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
  openMorseFallScale = false;
  sortedDocuments: any;
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
    private dayCaseDashboardService: DayCaseDashboardService,
    private patientDocService: PatientDocumentationService,
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
    this.getPatientProfile();
    this.getLatestAssessmentPA();
    // this.getTriageLatestDocuments(); not using this document
    // this.getPhyAssessment(); not using this document
    // this.getMedLatestAssessment(); 
    this.getNurseEndorsement()
    this.getSurgicalPass()
    this.getNewBorn();
    this.getBundlesLetDoc();
    this.getPediatricWarningScore();
    this.getNursingPlanCareDocDetails();
    this.getNursingAssessmentDocDetails();
    this.getPreCardiecCathDocDetails();
    this.getCPRDocDetails();
    this.getCorrespondenceDocDetails();
    this.getNursingDischargeDocDeatils();
    this.LatestMFSSet();
    this.getNursingAdmissionLatestDoc();
    this.fetchLatestDetails();
    this.getModifiedAldreteDocument();
    this.getTimeOutCheckDocDetails();
    this.getNeonatalDischargeDocDetails();
  }

  LatestMFSSet() {
    const json = {
      Einri: this.storageService.einri,
      Patnr: this.storageService.patnr,
      Falnr: this.storageService.falnr,
    };

    this.emergencyService.getLatestMFSSet(json).subscribe((data: any) => {
      if (data) {
        this.latestMorseFallScaleData = data.d.results[0];
        this.patientDocService.latestMorseFallScaleData = this.latestMorseFallScaleData;
      }
    }, (error) => {
      console.error(error);
    })
  }

  getLatestAssessmentPA() {
    this.emergencyService.getLatestDocForPA(this.apiJson).subscribe({
      next: (_success: any) => {
        if (_success?.d?.results) {
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

  getNursingAdmissionLatestDoc() {
    this.dayCaseDashboardService.nursingAdmissionLatestDoc(this.apiJson).subscribe({
      next: (_success: any) => {
        if (_success?.d?.results) {
          this.latestNurAdmissionList = _success.d.results;
        }
        if (this.dayCaseDashboardService.isRedirectToSelectedDoc) {
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

  getModifiedAldreteDocument() {
    this.dayCaseDashboardService.ModifiedAldretSetDocumentLatestDoc(this.apiJson).subscribe({
      next: (_success: any) => {
        this.latestModifiedAldreteList = _success.d.results
      },
      error: (err: any) => {
        // Handle errors if the request fails
        console.error('Error  Data:', err);
        this.sharedService.waringSwallModel(`GET Error : ${err}`);
      },
    });
  }
  getPediatricWarningScore() {
    this.emergencyService.getLatestAssesmentResult(this.apiJson).subscribe({
      next: (_success: any) => {
        this.pediatricEarlyWarningList = _success.d.results.filter(res => res.Dtid == 'ZSCA_PEWS' );
        console.log('_success21212121', this.pediatricEarlyWarningList);

        // this.nurseEndorsementList = _success.d.results
      },
      error: (err: any) => {
        // Handle errors if the request fails
        console.error('Error  Data:', err);
        this.sharedService.waringSwallModel(`GET Error : ${err}`);
      },
    });
  }
  getSurgicalPass() {
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
  getNewBorn() {
    this.emergencyService.getNewBornDoc(this.apiJson).subscribe({
      next: (_success: any) => {
        this.newBornList = _success.d.results
      },
      error: (err: any) => {
        // Handle errors if the request fails
        console.error('Error  Data:', err);
        this.sharedService.waringSwallModel(`GET Error : ${err}`);
      },
    });
  }
  getBundlesLetDoc() {
    this.emergencyService.getBundlesLetDoc(this.apiJson).subscribe({
      next: (_success: any) => {
        this.bundlesList = _success.d.results
      },
      error: (err: any) => {
        // Handle errors if the request fails
        console.error('Error  Data:', err);
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
  getNursingAssessmentDocDetails() {
    this.dayCaseDashboardService.nursingAssessmentLatestDoc(this.apiJson).subscribe({
      next: (_success: any) => {
        this.latestNurAssessment = _success.d.results
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

  // Time Out CheckList Latest
  getTimeOutCheckDocDetails() {
    this.dayCaseDashboardService.TimeoutCheckDocumentLatestDoc(this.apiJson).subscribe({
      next: (_success: any) => {
        this.latestTimeoutCheckList = _success.d.results
      },
      error: (err: any) => {
        console.error('Error  Data:', err);
        this.sharedService.waringSwallModel(`GET Error : ${err}`);
      },
    });
  }

  // Neonatal Discharge Summary
  getNeonatalDischargeDocDetails() {
    this.dayCaseDashboardService.NeonatalDischargeDocumentLatestDoc(this.apiJson).subscribe({
      next: (_success: any) => {
        this.latestNeonatalDischList = _success.d.results
      },
      error: (err: any) => {
        console.error('Error  Data:', err);
        this.sharedService.waringSwallModel(`GET Error : ${err}`);
      },
    });
  }

  // Nursing Discharge Assessment Document Latest
  getNursingDischargeDocDeatils() {
    this.dayCaseDashboardService.nursingDischargeLatestDoc(this.apiJson).subscribe({
      next: (_success: any) => {
        this.latestNurDischargeSummeryList = _success.d.results
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

  removeDuplicates(array: any[]): any[] {
    return [...new Set(array)];
  }

  getPatientProfile() {
    this.admissionService.getDicumentDetails(this.storageService.einri, '1', this.storageService.patnr, '', this.storageService.falnr).subscribe({
      next: (_success: any) => {
        // Handle successful data retrieval
        this.documentTypeFilterValueClone = _success.d.results;
        // this.documentTypeFilterValue = _success.d.results;
        // this.filterByPeriod();
        // this.sort();
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
      },
      error: (err: any) => {
        // Handle errors if the request fails
        console.error('Error Data:', err);
        this.sharedService.waringSwallModel(`GET Error : ${err}`);
      },
    });
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
        this.documentTypeFilterValueClone = patientProfileResponse.d.results;
        
        // this.documentTypeFilterValue = patientProfileResponse.d.results;
        this.filterByPeriod();

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
    if (this.paramsObject.action == 'Add' && this.paramsObject.doctype == RedirectionType.TRASM$) {
      this.selectAssessment('emergencynursingdoc', this.latestEmergencyNursingDocList[0])
      this.openDocument('create');
    } else if (this.paramsObject.action == 'Update' && this.paramsObject.doctype == RedirectionType.TRASM$) {
      this.selectAssessment('emergencynursingdoc', this.latestEmergencyNursingDocList[0])
      this.openDocument('edit');
    } else if (this.paramsObject.action == 'View' && this.paramsObject.doctype == RedirectionType.TRASM$) {
      this.getScaleDetails(this.latestEmergencyNursingDocList[0], RedirectionType.TRASM$);
    } else if (this.paramsObject.action == 'Add' && this.paramsObject.doctype == RedirectionType.BRADEN$) {
      this.selectAssessment('isBradenScale', this.latestBridentScaleList[0])
      this.openDocument('create');
    } else if (this.paramsObject.action == 'Update' && this.paramsObject.doctype == RedirectionType.BRADEN$) {
      this.selectAssessment('isBradenScale', this.latestBridentScaleList[0])
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
      this.selectAssessment('isEducationAssement', this.educationAssList[0])
      this.openDocument('create');
    }
    else if (this.paramsObject.action == 'Update' && this.paramsObject.doctype == RedirectionType.EDUAS$) {
      this.selectAssessment('isEducationAssement', this.educationAssList[0])
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
    } else if (this.paramsObject.action == 'Add' && this.paramsObject.doctype == RedirectionType.MORSE$) {
      this.selectAssessment('morsefallScale', this.latestMorseFallScaleData)
      this.openDocument('create');
    } else if (this.paramsObject.action == 'Update' && this.paramsObject.doctype == RedirectionType.MORSE$) {
      this.selectAssessment('morsefallScale', this.latestMorseFallScaleData)
      this.openDocument('edit');
    } else if (this.paramsObject.action == 'View' && this.paramsObject.doctype == RedirectionType.MORSE$) {
      this.getPatientProfileData(this.latestMorseFallScaleData);
    } else if (this.paramsObject.action == 'Add' && this.paramsObject.doctype == RedirectionType.SRGPP$) {
      this.selectAssessment('isSurgicalPassport', this.surgicalPassportList[0])
      this.openDocument('create');
    } else if (this.paramsObject.action == 'Update' && this.paramsObject.doctype == RedirectionType.SRGPP$) {
      this.selectAssessment('isSurgicalPassport', this.surgicalPassportList[0])
      this.openDocument('edit');
    } else if (this.paramsObject.action == 'View' && this.paramsObject.doctype == RedirectionType.SRGPP$) {
      this.getPatientProfileData(this.surgicalPassportList[0]);
    } else if (this.paramsObject.action == 'Add' && this.paramsObject.doctype == RedirectionType.NURDS$) {
      this.selectAssessment('isNursingDischarge', this.latestNurDischargeSummeryList[0])
      this.openDocument('create');
    } else if (this.paramsObject.action == 'Update' && this.paramsObject.doctype == RedirectionType.NURDS$) {
      this.selectAssessment('isNursingDischarge', this.latestNurDischargeSummeryList[0])
      this.openDocument('edit');
    } else if (this.paramsObject.action == 'View' && this.paramsObject.doctype == RedirectionType.NURDS$) {
      this.getPatientProfileData(this.latestNurDischargeSummeryList[0]);
    } else if (this.paramsObject.action == 'Add' && this.paramsObject.doctype == RedirectionType.NCP$) {
      this.selectAssessment('isNursingCarePlan', this.latestNurCarePlanList[0])
      this.openDocument('create');
    } else if (this.paramsObject.action == 'Update' && this.paramsObject.doctype == RedirectionType.NCP$) {
      this.selectAssessment('isNursingCarePlan', this.latestNurCarePlanList[0])
      this.openDocument('edit');
    } else if (this.paramsObject.action == 'View' && this.paramsObject.doctype == RedirectionType.NCP$) {
      this.getPatientProfileData(this.latestNurCarePlanList[0]);
    } else if (this.paramsObject.action == 'Add' && this.paramsObject.doctype == RedirectionType.NAA$) {
      this.selectAssessment('isNursingAdmission', this.latestNurAdmissionList[0])
      this.openDocument('create');
    } else if (this.paramsObject.action == 'Update' && this.paramsObject.doctype == RedirectionType.NAA$) {
      this.selectAssessment('isNursingAdmission', this.latestNurAdmissionList[0])
      this.openDocument('edit');
    } else if (this.paramsObject.action == 'View' && this.paramsObject.doctype == RedirectionType.NAA$) {
      this.getPatientProfileData(this.latestNurAdmissionList[0]);
    } else if (this.paramsObject.action == 'Add' && this.paramsObject.doctype == RedirectionType.NEWBORN$) {
      this.selectAssessment('isNewBorn', this.newBornList[0])
      this.openDocument('create');
    } else if (this.paramsObject.action == 'Update' && this.paramsObject.doctype == RedirectionType.NEWBORN$) {
      this.selectAssessment('isNewBorn', this.newBornList[0])
      this.openDocument('edit');
    } else if (this.paramsObject.action == 'View' && this.paramsObject.doctype == RedirectionType.NEWBORN$) {
      this.getPatientProfileData(this.newBornList[0]);
    }else if (this.paramsObject.action == 'Add' && this.paramsObject.doctype == RedirectionType.Bundles$) {
      this.selectAssessment('isNewBundles', this.bundlesList[0])
      this.openDocument('create');
    } else if (this.paramsObject.action == 'Update' && this.paramsObject.doctype == RedirectionType.Bundles$) {
      this.selectAssessment('isNewBundles', this.bundlesList[0])
      this.openDocument('edit');
    } else if (this.paramsObject.action == 'View' && this.paramsObject.doctype == RedirectionType.Bundles$) {
      this.getPatientProfileData(this.bundlesList[0]);
    }
    this.dayCaseDashboardService.isRedirectToSelectedDoc = false;
  }

  openPastHistory(template: TemplateRef<any>) {
    const config: ModalOptions = { class: 'modal-dialog-centered modal-lg pastdochistory' };
    this.modalRef = this.modalService.show(template, config);
  }


  selectAssessment(name: string, selectedDocData: any) {

    this.selectedDocData = selectedDocData;

    // Define a mapping between assessment names and corresponding properties
    const assessments = {
      'isSurgicalPassport': { isSurgicalPassport: true, selectedDocName: 'Surgical Passport' },
      'isNewBorn': { isNewBorn: true, selectedDocName: 'Newborn Physician Assessment Doc' },
      'isNewBundles': { isNewBundles: true, selectedDocName: 'IC Bundles for Urinary Catheter' },
      'isEducationAssement': { isEducationAssement: true, selectedDocName: 'Education Assessment' },
      'isNursingCarePlan': { isNursingCarePlan: true, selectedDocName: 'Nursing Care Plan' },
      'isNursingDischarge': { isNursingDischarge: true, selectedDocName: 'Nursing Discharge Summary' },
      'isBradenScale': { isBradenScale: true, selectedDocName: 'Braden Scale' },
      'isNursingAdmission': { isNursingAdmission: true, selectedDocName: 'Nursing Admission Assessment' },
      'isNursingAssessment': { isNursingAssessment: true, selectedDocName: 'Nursing Assessment' },
      'isPediatricsAdmission': { isPediatricsAdmission: true, selectedDocName: 'Pediatrics Admission Assessment' },
      'isFallRiskAssessment': { isFallRiskAssessment: true, selectedDocName: 'Fall Risk Assessment - Pediatrics' },
      'isPreCardiacCath': { isPreCardiacCath: true, selectedDocName: 'Pre-Cardiac Cath Checklist' },
      'isCPRDocument': { isCPRDocument: true, selectedDocName: 'CPR Document' },
      'isCorrespondenceDocument': { isCorrespondenceDocument: true, selectedDocName: 'Correspondence Document' },
      'isNursingInitialAssessment': { isNursingInitialAssessment: true, selectedDocName: 'Nursing Initial Assessment Gyno Obstetrics' },
      'isObstetricsFallRisk': { isObstetricsFallRisk: true, selectedDocName: 'Obstetrics Fall Risk Assessment' },
      'attachments': { attachments: true, selectedDocName: 'Attachments Document' },
      'morsefallScale': { morsefallScale: true, selectedDocName: 'Morse Fall Scale' },
      'isPainAssessment': { isPainAssessment: true, selectedDocName: 'Pain Assessment' },
      'pediatricEarlyWarningScale': { pediatricEarlyWarningScale: true, selectedDocName: 'Pediatric Early Warning Scale' },
      'numericratingscale': { numericratingscale: true, selectedDocName: 'Numeric rating scale(more than 8 years)' },
      'nurseEndorsement': { nurseEndorsement: true, selectedDocName: 'Nurse Endorsement' },
      'facepainscale': { facepainscale: true, selectedDocName: 'Face Pain Scale' },
      'glasgowcomascale': { glasgowcomascale: true, selectedDocName: 'Glasgow Coma Scale' },
      'isModifiedAldreteDocument': { isModifiedAldreteDocument: true, selectedDocName: 'Modified Aldrete Score (MAS)' },
      'isNeonatalDisch': { isNeonatalDisch: true, selectedDocName: 'Neonatal Discharge Summary' },
      'isTimeoutCheck': { isTimeoutCheck: true, selectedDocName: 'Time Out Checklist in Non-OR Settings' },
    };


    // Reset all flags to false initially
    this.isSurgicalPassport = false;
    this.isNewBorn = false;
    this.isNewBundles = false;
    this.isEducationAssement = false;
    this.isNursingCarePlan = false;
    this.isNursingDischarge = false;
    this.isBradenScale = false;
    this.isAttechmentDocument = false;
    this.isMorseFallScale = false;
    this.morsefallScale = false;
    this.isNursingAdmission = false;
    this.isNursingAssessment = false;
    this.isPediatricsAdmission = false;
    this.isFallRiskAssessment = false;
    this.isPreCardiacCath = false;
    this.isCPRDocument = false;
    this.isCorrespondenceDocument = false;
    this.isNursingInitialAssessment = false;
    this.isObstetricsFallRisk = false;
    this.glasgowcomascale = false;
    this.attachments = false;
    this.isPainAssessment = false;
    this.pediatricEarlyWarningScale = false;
    this.nurseEndorsement = false;
    this.facepainscale = false;
    this.numericratingscale = false;
    this.openNumericRatingScale = false;
    this.isModifiedAldreteDocument = false;
    this.openModifiedAldreteDocument = false;
    this.isNeonatalDisch = false;
    this.isTimeoutCheck = false;
    this.openNeonatalDischDocument = false;
    this.openTimeoutCheckDocument = false;
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
    (await this.phyComp?.createPhyDoc()).subscribe((res: any) => {
      Swal.fire({
        text: "Document is created successfully",
        icon: 'success',
        confirmButtonText: 'Ok',
        customClass: 'myalertpopup'
      })
      this.phyComp?.resetAll();
      this.refresh();
    }, (_error: any) => { });
  }
  async update() {
    (await this.phyComp?.updatePhyDoc()).subscribe((res: any) => {
      Swal.fire({
        text: "Document is updated successfully",
        icon: 'success',
        confirmButtonText: 'Ok',
        customClass: 'myalertpopup'
      })
      this.phyComp?.resetAll();
      this.refresh();
    }, (_error: any) => { });
  }
  async release() {
    (await this.phyComp?.releasePhyDoc()).subscribe((res: any) => {
      Swal.fire({
        text: "Document is released successfully",
        icon: 'success',
        confirmButtonText: 'Ok',
        customClass: 'myalertpopup'
      })
      this.phyComp?.resetAll();
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

        (await this.phyComp?.deletePhyAssessment()).subscribe(
          (_success: any) => {
            Swal.fire({
              text: "Document is deleted successfully",
              icon: 'success',
              confirmButtonText: 'Ok',
              customClass: 'myalertpopup'
            })
            this.phyComp?.resetAll();
            this.refresh();
          },
          (_error: any) => { }
        );
      }
    });
  }
  async createCopy() {
    (await this.phyComp?.copyPhyDoc()).subscribe((res: any) => {
      Swal.fire({
        text: "Document is created successfully",
        icon: 'success',
        confirmButtonText: 'Ok',
        customClass: 'myalertpopup'
      })
      this.phyComp?.resetAll();
      this.refresh();
    }, (_error: any) => { });
  }
  async createAndRelease() {
    (await this.phyComp?.createPhyDoc()).subscribe((res: any) => {
      this.phyComp?.resetAll();
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
    this.asc = true;
    this.desc = false;

    this.nursAssess = false;
    this.glasgowcomascale = false;
    this.facepainscale = false;
    this.numericratingscale = false;
    this.isBradenScale = false;
    this.educationAssessment = false;
    this.nurseEndorsement = false;
    this.isSurgicalPassport = false;
    this.isNewBorn = false;
    this.isNewBundles = false;
    this.pediatricEarlyWarningScale = false;
    this.medReport = false;
    this.emergencynursingdoc = false;
    this.isPainAssessment = false;
    this.openPainAssement = false;
    this.openDischargeSummery = false;
    this.openNurseAdmission = false;
    this.isNursingAdmission = false;
    this.isNursingAssessment = false;
    this.openNurseAssissment = false;
    this.openPreCardiacCath = false;
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
    this.openNewBorn = false
    this.openBundles = false
    this.openPediatricEarlyWarningScale = false
    this.openNursingCarePlans = false;
    this.isNursingCarePlan = false;
    this.isNursingDischarge = false;
    this.openMorseFallScale = false;
    this.isEducationAssement = false;
    this.isPreCardiacCath = false;
    this.isCPRDocument = false;
    this.isCorrespondenceDocument = false;
    this.openCorrespondenceDocument = false;
    this.attachments = false;
    this.morsefallScale = false;
    this.openPainAssement = false;
    this.isModifiedAldreteDocument = false;
    this.openModifiedAldreteDocument = false;
    this.latestModifiedAldreteList = [];
    this.openTimeoutCheckDocument = false;
    this.isTimeoutCheck = false;
    this.latestMorseFallScaleData = [];
    this.openNeonatalDischDocument = false;
    this.isNeonatalDisch = false;
    this.latestNeonatalDischList = [];
    this.searchString = '';
    this.dateRange = '';
    this.documentType = undefined;
    this.patientProfileDocumet = this.documentTypeFilterValue;
    this.medDocList = [];
    if (this.openModifiedAldreteDocument) {
      this.ModifiedAldreteComp?.ngOnDestroy();
    }
    if (this.openBradenScale) {
      this.BradenScaleComp?.ngOnDestroy();
    }
    if (this.openNurseAssissment) {
      this.NursingAssessmentComp?.ngOnDestroy();
    }
    if (this.openEducationAssessment) {
      this.educationAssessmentComp?.ngOnDestroy();
    }
    if (this.openSurgicsalPassport) {
      this.SurgicalPassComp?.ngOnDestroy();
    }
    if (this.openNewBorn) {
      this.newBornComp?.ngOnDestroy();
    }
    if (this.openNursingCarePlans) {
      this.NursingCarePlansComp?.ngOnDestroy();
    }
    if (this.openDischargeSummery) {
      this.NursingDischargeComp?.ngOnDestroy();
    }
    if (this.openNurseAdmission) {
      this.NursingAdmissionComp?.ngOnDestroy();
    }
    if (this.openGlasgowComaScale) {
      this.GlasgowComaScaleComp.ngOnDestroy();
    }
    if (this.openFacePainScale) {
      this.FacePainScaleComp.ngOnDestroy();
    }
    if (this.openPainAssement) {
      this.PainAssessmentComp.ngOnDestroy();
    }
    if (this.openPediatricEarlyWarningScale) {
      this.PediatricWarningScaleComp.ngOnDestroy();
    }
    if (this.openNurseEndorsement) {
      this.NurseEndorsmentComp.ngOnDestroy();
    }
    if (this.openNumericRatingScale) {
      this.NumericRatingScaleComp.ngOnDestroy();
    }
    if (this.openCPRDocument) {
      this.CprDocumentComp.ngOnDestroy();
    }
    if (this.openCorrespondenceDocument) {
      this.CorrespondenceComp.ngOnDestroy();
    }
    // if (this.openNeonatalDischDocument) {
    //   this.neo.ngOnDestroy();
    // }
    if (this.openTimeoutCheckDocument) {
      this.TimeOutCheckListComp.ngOnDestroy();
    }
    this.getPatientProfile();
    this.getLatestAssessment();
    // this.getPhyAssessment();
    // this.getTriageLatestDocuments();
    this.getMedLatestAssessment();
    this.getEducationAssessment();
    this.getNurseEndorsement()
    this.getPediatricWarningScore();
    this.getSurgicalPass();
    this.getNewBorn();
    this.getBundlesLetDoc();
    this.getLatestAssessmentPA();
    this.getPediatricWarningScore();
    this.getNursingPlanCareDocDetails();
    this.getNursingDischargeDocDeatils();
    this.getNursingAdmissionLatestDoc()
    this.getNursingAssessmentDocDetails();
    this.getPreCardiecCathDocDetails();
    this.getCPRDocDetails();
    this.getCorrespondenceDocDetails();
    this.LatestMFSSet();
    this.getModifiedAldreteDocument();
    this.getTimeOutCheckDocDetails();
    this.getNeonatalDischargeDocDetails();
  }

  openDocument(action) {
    this.actionType = action;
    // education assessment...
    if (this.isEducationAssement) {
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
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.sharedService.waringSwallModel(`The document is already released`)
        } else if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.releaseEducationAss();
        }
      } else if (action == 'copy') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
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
        this.openEducationAssessment = true;
        this.educationAssessmentComp.saveAndReleaseEducation('4').then((formValue: any) => {
          if (formValue) {
            this.refresh()
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating education assessment:', error);
        });
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
        // this.educationAssessmentComp.ngOnInit();
        // this.createAndReleaseMed();
      }
    }
    // Surgical passport
    if (this.isSurgicalPassport) {
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
        this.SurgicalPassComp.createSurgicalPassDoc('4').then((formValue) => {
          if (formValue) {
            this.refresh()
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating surgical passport document:', error);
        });;
      }
    }
    // pediatric early warning 

    // attachment...
    else if (this.attachments) {
      if (action == 'create') {
        this.openModalForAttachment();
      }
    }


    if (this.isNewBorn) {
      if (action == 'create') {
        this.openNewBorn = true;
      } else if (action == 'edit') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.openNewBorn = true;;
          let valueObj = {
            type: WordType.EditNE,
            docKey: this.selectedDocData.Dockey
          }
          this.dataShareService.sendActionType(ActionType.Update$, true, valueObj);
        }
      }else if (action == 'delete') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.deleteNewBornPassDoc();
        } else {
          this.sharedService.waringSwallModel(`The document is already released`);
        }
      } else if (action == 'release') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.sharedService.waringSwallModel(`The document is already released`)
        } else if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.releaseNewBorn();
        }
      } else if (action == 'copy') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.openNewBorn = true;;
          let valueObj = {
            type: WordType.CopyEA,
            docKey: this.selectedDocData.Dockey
          }
          this.dataShareService.sendActionType(ActionType.Copy$, true, valueObj);
        }
      } else if (action == 'createandrelease') {
        this.openNewBorn = true;
        this.newBornComp.createDoc('4').then((formValue: any) => {
          if (formValue) {
            this.refresh()
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating education assessment:', error);
        });
      }
    }

    if (this.isNewBundles) {
      if (action == 'create') {
        this.openBundles = true;
      } else if (action == 'edit') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.openBundles = true;;
          let valueObj = {
            type: WordType.EditNE,
            docKey: this.selectedDocData.Dockey
          }
          this.dataShareService.sendActionType(ActionType.Update$, true, valueObj);
        }
      }else if (action == 'delete') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.deleteNewBornPassDoc();
        } else {
          this.sharedService.waringSwallModel(`The document is already released`);
        }
      } else if (action == 'release') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.sharedService.waringSwallModel(`The document is already released`)
        } else if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.releaseNewBorn();
        }
      } else if (action == 'copy') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.openNewBorn = true;;
          let valueObj = {
            type: WordType.CopyEA,
            docKey: this.selectedDocData.Dockey
          }
          this.dataShareService.sendActionType(ActionType.Copy$, true, valueObj);
        }
      } else if (action == 'createandrelease') {
        this.openNewBorn = true;
        this.newBornComp.createDoc('4').then((formValue: any) => {
          if (formValue) {
            this.refresh()
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating education assessment:', error);
        });
      }
    }

    // Braden Scale
    else if (this.isBradenScale) {
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
        // this.createAndRelease();
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

    // Nursing Discharge Summery
    else if (this.isNursingDischarge) {
      if (action == 'create') {
        this.openDischargeSummery = true;
      } else if (action == 'edit') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.openDischargeSummery = true;
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
          this.deleteNursingDischarge(this.selectedDocData.Dockey);
        }
      } else if (action == 'release') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.sharedService.waringSwallModel(`The document is already released`)
        } else if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.directReleaseNursingDischargePlanDoc();
        }
      } else if (action == 'copy') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.openDischargeSummery = true;
          let valueObj = {
            type: WordType.CopyBS,
            docKey: this.selectedDocData.Dockey
          }
          this.dataShareService.sendActionType(ActionType.Copy$, true, valueObj);
        }
      } else if (action == 'createandrelease') {
        this.openDischargeSummery = true;
        this.NursingDischargeComp.createNursingDischargeDoc('4').then((formValue) => {
          if (formValue) {
            this.refresh()
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Nursing discharge summary:', error);
        });
      }

    }

    else if (this.morsefallScale) {
      if (action == 'create') {
        this.openMorseFallScale = true;
        this.dataShareService.sendActionType(ActionType.Add$, false, {});
      } else if (action == 'copy' && this.latestMorseFallScaleData?.StatusTxt == "Released") {
        this.openMorseFallScale = true;
        let valueObj = {
          type: WordType.CopyEA,
          docKey: this.selectedDocData.Dockey
        }
        this.dataShareService.sendActionType(ActionType.Copy$, true, valueObj);
      } else if (action == 'edit') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.sharedService.waringSwallModel(`The document is already released`)
        } else if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'N/A') {
          this.sharedService.waringSwallModel(`You can't edit the document, due to N/A.`)
        }
      }
      else if (action == 'delete' || action == 'release') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.sharedService.waringSwallModel(`The document is already released`)
        } else if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'N/A') {
          this.sharedService.waringSwallModel(`You can't edit the document, due to N/A.`)
        }
      }

    }

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
        } else if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.deleteNursingAdmissionDoc(this.selectedDocData.Dockey);
        }
      } else if (action == 'release') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.sharedService.waringSwallModel(`The document is already released`)
        } else if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
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
        this.NursingAdmissionComp.createNursingAdmissionDoc('4').then((formValue) => {
          if (formValue) {
            this.refresh()
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Nursing discharge summary:', error);
        });
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

    // Pain assessment
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

    else if (this.isNursingAssessment) {
      if (action == 'create') {
        this.openNurseAssissment = true;
      } else if (action == 'edit') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.openNurseAssissment = true;
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
          this.deleteNursingAssessmentDoc(this.selectedDocData.Dockey);
        }
      } else if (action == 'release') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.sharedService.waringSwallModel(`The document is already released`)
        } else if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.directReleaseNursingAssessmentDoc();
        }
      } else if (action == 'copy') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.openNurseAssissment = true;
          let valueObj = {
            type: WordType.CopyBS,
            docKey: this.selectedDocData.Dockey
          }
          this.dataShareService.sendActionType(ActionType.Copy$, true, valueObj);
        }
      } else if (action == 'createandrelease') {
        this.openNurseAssissment = true;
        this.NursingAssessmentComp.createNursingAssessmentDoc('4').then((formValue) => {
          if (formValue) {
            this.refresh()
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Nursing assessment document:', error);
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

    else if (this.isModifiedAldreteDocument) {
      if (action == 'create') {
        this.openModifiedAldreteDocument = true;
      } else if (action == 'edit') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.openModifiedAldreteDocument = true;
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
          this.directReleaseModifiedAldretePlanDoc();
        }
      } else if (action == 'copy') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.openModifiedAldreteDocument = true;
          let valueObj = {
            type: WordType.CopyBS,
            docKey: this.selectedDocData.Dockey
          }
          this.dataShareService.sendActionType(ActionType.Copy$, true, valueObj);
        }
      } else if (action == 'createandrelease') {
        this.openModifiedAldreteDocument = true;
        this.ModifiedAldreteComp.createModifiedAldreteDocument('4').then((formValue) => {
          if (formValue) {
            this.refresh()
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Glasgow coma scale:', error);
        });
      }

    }

    else if (this.isNeonatalDisch) {
      if (action == 'create') {
        this.openNeonatalDischDocument = true;
      } else if (action == 'edit') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.openNeonatalDischDocument = true;
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
          this.deleteNeonatalDischarge(this.selectedDocData.Dockey);
        }
      } else if (action == 'release') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.sharedService.waringSwallModel(`The document is already released`)
        } else if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.directReleaseNeonatalDischargeDoc();
        }
      } else if (action == 'copy') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.openNeonatalDischDocument = true;
          let valueObj = {
            type: WordType.CopyBS,
            docKey: this.selectedDocData.Dockey
          }
          this.dataShareService.sendActionType(ActionType.Copy$, true, valueObj);
        }
      } else if (action == 'createandrelease') {
        this.openNeonatalDischDocument = true;
        this.NeonatalDischDocumentComp.createNeonatalDischargeDocument('4').then((formValue) => {
          if (formValue) {
            this.refresh()
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Glasgow coma scale:', error);
        });
      }

    }

    else if (this.isTimeoutCheck) {
      if (action == 'create') {
        this.openTimeoutCheckDocument = true;
      } else if (action == 'edit') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Draft') {
          this.openTimeoutCheckDocument = true;
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
          this.directReleaseTimeOutCheckListDoc();
        }
      } else if (action == 'copy') {
        if (this.selectedDocData != undefined && this.selectedDocData.Dockey != undefined && this.selectedDocData.StatusTxt == 'Released') {
          this.openTimeoutCheckDocument = true;
          let valueObj = {
            type: WordType.CopyBS,
            docKey: this.selectedDocData.Dockey
          }
          this.dataShareService.sendActionType(ActionType.Copy$, true, valueObj);
        }
      } else if (action == 'createandrelease') {
        // this.openTimeoutCheckDocument = true;
        // this.NeonatalDischDocumentComp.createTimeOutDocument('4').then((formValue) => {
        //   if (formValue) {
        //     this.refresh()
        //   }
        // }).catch((error: any) => {
        //   console.error('Error scale:', error);
        //   console.error('Error creating Glasgow coma scale:', error);
        // });
      }

    }
  }
  private subscription: Subscription;
  directReleasePainAss() {
    this.subscription = this.emergencyService
      .getPainAssesmentDetails(this.selectedDocData.Dockey).subscribe({
        next: (data: any) => {
          let paylaod = data.d.results[0]
          paylaod.DocStatus = '2';
          this.subscription = this.emergencyService.createPainAssessmentDoc({ d: paylaod }).subscribe({
            next: (data: any) => { },
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

  directReleaseModifiedAldretePlanDoc() {
    this.subscription = this.dayCaseDashboardService
      .fetcModifiedAldreteSetDocDetails(this.selectedDocData.Dockey).subscribe({
        next: (data: any) => {
          let paylaod = data.d.results[0];
          delete paylaod.__metadata
          paylaod.DocStatus = '2';
          this.subscription = this.dayCaseDashboardService.saveModifiedAldreteDocument({ d: paylaod }).subscribe({
            next: (data: any) => { },
            error: (err: any) => {
              this.sharedService.waringSwallModel(`Error ${err}`);
              this.sharedService.waringSwallModel(`POST Error at Nurse Endorsment : ${err}`);
            },
            complete: () => {
              this.sharedService.successSwallModel('Modified Aldrete Score (MAS) released successfully');
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

  directReleaseTimeOutCheckListDoc() {
    this.subscription = this.dayCaseDashboardService
      .fetcTimeoutCheckDocDetails(this.selectedDocData.Dockey).subscribe({
        next: (data: any) => {
          let paylaod = data.d.results[0];
          delete paylaod.__metadata
          paylaod.DocStatus = '2';
          this.subscription = this.dayCaseDashboardService.saveTimeoutCheckDocument({ d: paylaod }).subscribe({
            next: (data: any) => { },
            error: (err: any) => {
              this.sharedService.waringSwallModel(`Error ${err}`);
              this.sharedService.waringSwallModel(`POST Error at Nurse Endorsment : ${err}`);
            },
            complete: () => {
              this.sharedService.successSwallModel('Time Out Checklist released successfully');
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

  directReleaseNeonatalDischargeDoc() {
    this.subscription = this.dayCaseDashboardService
      .fetcNeonatalDischargeDocDetails(this.selectedDocData.Dockey).subscribe({
        next: (data: any) => {
          let paylaod = data.d.results[0];
          delete paylaod.__metadata
          paylaod.DocStatus = '2';
          this.subscription = this.dayCaseDashboardService.saveNeonatalDischargeDocument({ d: paylaod }).subscribe({
            next: (data: any) => { },
            error: (err: any) => {
              this.sharedService.waringSwallModel(`Error ${err}`);
              this.sharedService.waringSwallModel(`POST Error at Nurse Endorsment : ${err}`);
            },
            complete: () => {
              this.sharedService.successSwallModel('Neonatal Discharge Summary released successfully');
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

  directReleaseNursingDischargePlanDoc() {
    this.subscription = this.dayCaseDashboardService
      .getNursingDischargeDocData(this.selectedDocData.Dockey).subscribe({
        next: (data: any) => {
          let paylaod = data.d.results[0];
          delete paylaod.__metadata
          paylaod.DocStatus = '2';
          this.subscription = this.dayCaseDashboardService.createNursingDischargeDoc({ d: paylaod }).subscribe({
            next: (data: any) => { },
            error: (err: any) => {
              this.sharedService.waringSwallModel(`Error ${err}`);
              this.sharedService.waringSwallModel(`POST Error at Nurse Endorsment : ${err}`);
            },
            complete: () => {
              this.sharedService.successSwallModel('Nursing discharge summery released successfully');
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

  directReleaseNursingAdmissionDoc() {
    this.subscription = this.dayCaseDashboardService
      .getNursingAdmissionDocData(this.selectedDocData.Dockey).subscribe({
        next: (data: any) => {
          let paylaod = data.d.results[0];
          delete paylaod.__metadata
          paylaod.DocStatus = '2';
          this.subscription = this.dayCaseDashboardService.createNursingAdmissionDoc({ d: paylaod }).subscribe({
            next: (data: any) => { },
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

  directReleaseNursingAssessmentDoc() {
    this.subscription = this.dayCaseDashboardService
      .getNursingAssessmentDocData(this.selectedDocData.Dockey).subscribe({
        next: (data: any) => {
          let paylaod = data.d.results[0];
          delete paylaod.__metadata
          paylaod.DocStatus = '2';
          this.subscription = this.dayCaseDashboardService.saveNursingAssessmentDoc({ d: paylaod }).subscribe({
            next: (data: any) => { },
            error: (err: any) => {
              this.sharedService.waringSwallModel(`Error ${err}`);
              this.sharedService.waringSwallModel(`POST Error at Nurse Endorsment : ${err}`);
            },
            complete: () => {
              this.sharedService.successSwallModel('Nursing assessment document released successfully');
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
      customClass: 'myalertpopup',
      icon: 'error'
    });
  }

  reloadDoc(event) {
    this.refresh();
  }
  saveDoc() {
    if (this.actionType == 'create') {
      if (this.openEducationAssessment) {
        this.educationAssessmentComp.saveEducationFormValue('1').then((res: any) => {
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
      if (this.openBradenScale) {
        this.BradenScaleComp.createBradeScale().then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
        });
      }


      if (this.openSurgicsalPassport) {
        let docStatus = '1';
        this.SurgicalPassComp.createSurgicalPassDoc(docStatus).then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Glasgow coma scale:', error);
        })
      }
      if (this.openNewBorn) {
        let docStatus = '1';
        this.newBornComp.createDoc(docStatus).then((formValue: any) => {
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

      // Nursing Discharge Assessment Create API
      if (this.openDischargeSummery) {
        let docStatus = '1';
        this.NursingDischargeComp.createNursingDischargeDoc(docStatus).then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Glasgow coma scale:', error);
        })
      }

      // Nursing Admission Assessment Create API
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

      if (this.openMorseFallScale) {
        if (this.morseFallScaleC.getFormData().AmbulatoryAid === 'A' || this.morseFallScaleC.getFormData().Gait === 'A' || this.morseFallScaleC.getFormData().HistoryFalls === 'A' || this.morseFallScaleC.getFormData().IvAccess === 'A' || this.morseFallScaleC.getFormData().MentalStatus === 'A' || this.morseFallScaleC.getFormData().SecondaryDiagnosis === 'A') {
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

        this.emergencyService.postMFSSet(formData).subscribe((resp) => {
          Swal.fire({
            text: "Document is created successfully",
            icon: 'success',
            confirmButtonText: 'Ok',
            customClass: 'myalertpopup'
          })
          this.refresh();
        }, (error) => {
          this.sharedService.errorSwallModel(error?.error?.error.message.value)
        })
      }

      if (this.openGlasgowComaScale) {
        this.GlasgowComaScaleComp.createGlosgowData().then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error creating Glasgow coma scale:', error);
        });
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

      if (this.openNurseEndorsement) {
        this.NurseEndorsmentComp.saveNurseEnd('1').then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
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

      if (this.openFacePainScale) {
        this.FacePainScaleComp.createFacePain().then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error creating Face pain scale:', error);
        });
      }

      // Nursing Admission Assessment Create API
      if (this.openNurseAssissment) {
        let docStatus = '1';
        this.NursingAssessmentComp.createNursingAssessmentDoc(docStatus).then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating nursing assessment:', error);
        })
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

      // ModifiedAldrete Document Create API
      if (this.openModifiedAldreteDocument) {
        let docStatus = '1';
        this.ModifiedAldreteComp.createModifiedAldreteDocument(docStatus).then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Modified Aldrete Score (MAS):', error);
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

      // Time Out Check Document
      if (this.openTimeoutCheckDocument) {
        let docStatus = '1';
        // if(this.selectedDocData?.Dockey) docStatus = '3';
        this.TimeOutCheckListComp.createTimeOutDocument(docStatus).then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Glasgow coma scale:', error);
        });
      }
      // Time Out Check Document
      if (this.openNeonatalDischDocument) {
        let docStatus = '1';
        // if(this.selectedDocData?.Dockey) docStatus = '3';
        this.NeonatalDischDocumentComp.createNeonatalDischargeDocument(docStatus).then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Glasgow coma scale:', error);
        });
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
      if (this.openBradenScale) {
        this.BradenScaleComp.createBradeScale().then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
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
      if (this.openFacePainScale) {
        this.FacePainScaleComp.createFacePain().then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error modifying Face pain scale:', error);
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
      if (this.openEducationAssessment) {
        this.educationAssessmentComp.saveEducationFormValue('1').then((res: any) => {
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

      if (this.openSurgicsalPassport) {
        this.SurgicalPassComp.createSurgicalPassDoc('1', 'edit').then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error modifying Glasgow coma scale:', error);
        });
      }
      if (this.openNewBorn) {
        this.newBornComp.createDoc('1', 'edit').then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error modifying Glasgow coma scale:', error);
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

      // Nursing Discharge Assessment edit API
      if (this.openDischargeSummery) {
        let docStatus = '1';
        this.NursingDischargeComp.createNursingDischargeDoc(docStatus, 'edit').then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Glasgow coma scale:', error);
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

    // ModifiedAldrete Document edit API
      if (this.openModifiedAldreteDocument) {
        let docStatus = '1';
        this.ModifiedAldreteComp.createModifiedAldreteDocument(docStatus).then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating nursing assessment:', error);
        })
      }
      if (this.openNurseAssissment) {
        let docStatus = '1';
        this.NursingAssessmentComp.createNursingAssessmentDoc(docStatus).then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Nursing assessment document:', error);
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

      // Time Out Check Document
      if (this.openTimeoutCheckDocument) {
        let docStatus = '1';
        // if(this.selectedDocData?.Dockey) docStatus = '3';
        this.TimeOutCheckListComp.createTimeOutDocument(docStatus).then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Glasgow coma scale:', error);
        });
      }

      // Time Out Check Document
      if (this.openNeonatalDischDocument) {
        let docStatus = '1';
        // if(this.selectedDocData?.Dockey) docStatus = '3';
        this.NeonatalDischDocumentComp.createNeonatalDischargeDocument(docStatus).then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Glasgow coma scale:', error);
        });
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
        this.educationAssessmentComp.saveEducationFormValue('3', 'copy').then((res: any) => {
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
      if (this.openNumericRatingScale) {
        this.NumericRatingScaleComp.copyNumericRight().then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error copy numeric rating Scale:', error);
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
      if (this.openFacePainScale) {
        this.FacePainScaleComp.copyFacePain().then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error copy Face pain scale:', error);
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

      if (this.openSurgicsalPassport) {
        this.SurgicalPassComp.copySurgicalPassDoc('3', 'copy').then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
        });
      }
      if (this.openNewBorn) {
        this.newBornComp.createDoc('3', 'copy').then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
        });
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

      // Nursing Discharge Assessment copy API
      if (this.openDischargeSummery) {
        this.NursingDischargeComp.createNursingDischargeDoc('3', 'copy').then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Glasgow coma scale:', error);
        })
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

      // ModifiedAldrete Document edit API
      if (this.openModifiedAldreteDocument) {
        let docStatus = '3';
        this.ModifiedAldreteComp.createModifiedAldreteDocument(docStatus).then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating nursing assessment:', error);
        })
      }
      
      if (this.openNurseAssissment) {
        let docStatus = '3';
        this.NursingAssessmentComp.createNursingAssessmentDoc(docStatus).then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Nursing assessment document:', error);
        })
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
      if (this.openPediatricEarlyWarningScale) {
        this.PediatricWarningScaleComp.copyPediatricEarlyWarningScale('copy').then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
        });
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

      // Time Out Check Document
      if (this.openTimeoutCheckDocument) {
        let docStatus = '3';
        // if(this.selectedDocData?.Dockey) docStatus = '3';
        this.TimeOutCheckListComp.createTimeOutDocument(docStatus).then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Glasgow coma scale:', error);
        });
      }

      // Time Out Check Document
      if (this.openNeonatalDischDocument) {
        let docStatus = '3';
        // if(this.selectedDocData?.Dockey) docStatus = '3';
        this.NeonatalDischDocumentComp.createNeonatalDischargeDocument(docStatus).then((formValue: any) => {
          if (formValue) {
            this.refresh();
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating Glasgow coma scale:', error);
        });
      }

      if (this.openMorseFallScale) {
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
        this.emergencyService.createNewMFSSet(formData).subscribe((resp) => {
          Swal.fire({
            text: "Document is released successfully",
            icon: 'success',
            confirmButtonText: 'Ok',
            customClass: 'myalertpopup'
          })
          this.refresh();
        }, (error) => {
          this.sharedService.errorSwallModel(error?.error?.error.message.value)
        })
      }
    }
  }

  releaseFromForm() {
    if (this.phyAssess) {
      // this.release();
    } else if (this.medReport) {
      this.releaseMed();
    } else if (this.isEducationAssement) {
      this.educationAssessmentComp.saveEducationFormValue('2').then((res: any) => {
        Swal.fire({
          text: "Education assessment is created successfully",
          icon: 'success',
          confirmButtonText: 'Ok',
          customClass: 'myalertpopup'
        })
        this.refresh();
        this.refresh();
      }, (_error: any) => {
        Swal.fire({
          text: `Education assessment has error, contact your administrator`,
          icon: 'warning',
          confirmButtonText: 'Ok',
          customClass: 'myalertpopup'
        })
      });
    } else if (this.openSurgicsalPassport) {
      this.SurgicalPassComp.createSurgicalPassDoc('2', 'edit').then((formValue: any) => {
        if (formValue) {
          this.refresh();
        }
      }).catch((error: any) => {
        console.error('Error scale:', error);
        console.error('Error creating Glasgow coma scale:', error);
      });
    } else if (this.openNewBorn) {
      this.newBornComp.createDoc('2', 'edit').then((formValue: any) => {
        if (formValue) {
          this.refresh();
        }
      }).catch((error: any) => {
        console.error('Error scale:', error);
        console.error('Error creating Glasgow coma scale:', error);
      });
    } else if (this.openNursingCarePlans) {
      this.NursingCarePlansComp.createNursingCarePlan('2', 'edit').then((formValue: any) => {
        if (formValue) {
          this.refresh();
        }
      }).catch((error: any) => {
        console.error('Error scale:', error);
        console.error('Error creating Glasgow coma scale:', error);
      });
    } else if (this.openDischargeSummery) {
      this.NursingDischargeComp.createNursingDischargeDoc('2', 'edit').then((formValue: any) => {
        if (formValue) {
          this.refresh();
        }
      }).catch((error: any) => {
        console.error('Error scale:', error);
        console.error('Error creating Glasgow coma scale:', error);
      });
    } else if (this.openNurseAdmission) {
      this.NursingAdmissionComp.createNursingAdmissionDoc('2', 'edit').then((formValue: any) => {
        if (formValue) {
          this.refresh();
        }
      }).catch((error: any) => {
        console.error('Error scale:', error);
        console.error('Error creating Glasgow coma scale:', error);
      });
    } else if (this.openNurseAssissment) {
      this.NursingAssessmentComp.createNursingAssessmentDoc('2', 'edit').then((formValue: any) => {
        if (formValue) {
          this.refresh();
        }
      }).catch((error: any) => {
        console.error('Error scale:', error);
        console.error('Error creating Nursing assessment:', error);
      });
    } else if (this.openPreCardiacCath) {
      this.PreCardiacCathComp.createNursingAssessmentDoc('2', 'edit').then((formValue: any) => {
        if (formValue) {
          this.refresh();
        }
      }).catch((error: any) => {
        console.error('Error scale:', error);
        console.error('Error creating Pre-Cardiac cath:', error);
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
    } else if (this.openPainAssement) {
      this.PainAssessmentComp.savePainAssessmentDoc('2').then((formValue: any) => {
        if (formValue) {
          this.refresh();
        }
      }).catch((error: any) => {
        console.error('Error scale:', error);
        console.error('Error creating Glasgow coma scale:', error);
      });
    } else if (this.nurseEndorsement) {
      this.NurseEndorsmentComp.saveNurseEnd('4');
    } else if (this.openPainAssement) {
      this.PainAssessmentComp.savePainAssessmentDoc('2').then((formValue: any) => {
        if (formValue) {
          this.refresh();
        }
      }).catch((error: any) => {
        console.error('Error scale:', error);
        console.error('Error creating Glasgow coma scale:', error);
      });
    }else if (this.openCorrespondenceDocument) {
      this.CorrespondenceComp.createCorrespondenceDocument('2', 'edit').then((formValue: any) => {
        if (formValue) {
          this.refresh();
        }
      }).catch((error: any) => {
        console.error('Error scale:', error);
        console.error('Error creating CPR Document:', error);
      });
    } else if (this.openModifiedAldreteDocument) {
      this.ModifiedAldreteComp.createModifiedAldreteDocument('2', 'edit').then((formValue: any) => {
        if (formValue) {
          this.refresh();
        }
      }).catch((error: any) => {
        console.error('Error scale:', error);
        console.error('Error creating Glasgow coma scale:', error);
      });
    } else if (this.openTimeoutCheckDocument) {
      this.TimeOutCheckListComp.createTimeOutDocument('2', 'edit').then((formValue: any) => {
        if (formValue) {
          this.refresh();
        }
      }).catch((error: any) => {
        console.error('Error scale:', error);
        console.error('Error creating Glasgow coma scale:', error);
      });
    }  else if (this.openNeonatalDischDocument) {
      this.NeonatalDischDocumentComp.createNeonatalDischargeDocument('2', 'edit').then((formValue: any) => {
        if (formValue) {
          this.refresh();
        }
      }).catch((error: any) => {
        console.error('Error scale:', error);
        console.error('Error creating Glasgow coma scale:', error);
      });
    }
  }

  newVersionDirectReleased() {
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
  }

  jsonString() {
    return JSON.stringify(this.patientProfileDocumet);
  }

  getScaleDetails(item, docType?) {
    if (docType === RedirectionType.TRASM$  || docType === RedirectionType.PRECATH$ || docType === RedirectionType.PEWS$ ) {
      item.AttMimeType = 'PDF';
    } else {
      item.AttMimeType = 'HTML';
    }
    this.getReleasedPdf(item);
  }

  getPatientProfileData(item) {
    this.getReleasedPdf(item);
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
            this.medComp?.ngOnInit();
            this.releaseMed();
          }
          this.getMedReportData();
        }
        if (this.actionType == 'createandrelease') {
          this.phyComp?.ngOnInit();
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
      this.phyComp?.resetAll();
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
    // (await this.educationAssessmentComp.saveEducationFormValue(type)).subscribe((res: any) => {
    //   Swal.fire({
    //     text: "Education assessment is created successfully",
    //     icon: 'success',
    //     confirmButtonText: 'Ok',
    //     customClass: 'myalertpopup'
    //   })
    //   this.educationAssessmentComp.resetAll();
    //   this.refresh();
    // }, (_error: any) => {
    //   Swal.fire({
    //     text: `Education assessment has error, contact your administrator`,
    //     icon: 'warning',
    //     confirmButtonText: 'Ok',
    //     customClass: 'myalertpopup'
    //   })
    // });
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

  async deleteEmergencyNursingDocument(docKey: string) {
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
        // need to implement delete API
        (await this.emergencyService.deleteNurEmrTriage(docKey)).subscribe(
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
              text: `${_error.error.error.innererror?.errordetails[0]?.message}`,
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
  async deleteNurseEndorsmentDoc() {
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
        (await this.emergencyService.deleteNurseEndDoc(this.nurseEndorsementList[0].Dockey)).subscribe(
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
              text: `${_error.error.error.innererror?.errordetails[0]?.message}`,
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
  async deleteSurgicalPassDoc() {
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
        (await this.emergencyService.deleteSurgicalPassPDoc(this.surgicalPassportList[0].Dockey)).subscribe(
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
              text: `${_error.error.error.innererror?.errordetails[0]?.message}`,
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
  async deleteNewBornPassDoc() {
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
        (await this.emergencyService.deleteNewBornDoc(this.newBornList[0].Dockey)).subscribe(
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
              text: `${_error.error.error.innererror?.errordetails[0]?.message}`,
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

  async deletePainAssessmentDocument(docKey: string) {
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
        // need to implement delete API
        (await this.emergencyService.deletePainAssessmentDoc(docKey)).subscribe(
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
              text: `${_error.error.error.innererror?.errordetails[0]?.message}`,
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

  // Delete Nursing Care Plan Document
  async deleteNursingCarePlan(docKey: string) {
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
        (await this.dayCaseDashboardService.deleteNursingCarePlan(docKey)).subscribe(
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
              text: `${_error.error.error.innererror?.errordetails[0]?.message}`,
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

  // Delete Neonatal Discharge Document
  async deleteNeonatalDischarge(docKey: string) {
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
        (await this.dayCaseDashboardService.deleteNeonatalDischargeDocument(docKey)).subscribe(
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
              text: `${_error.error.error.innererror?.errordetails[0]?.message}`,
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

  // Delete Nursing Care Plan Document
  async deleteNursingDischarge(docKey: string) {
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
        (await this.dayCaseDashboardService.deleteNursingDischargeDoc(docKey)).subscribe(
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
              text: `${_error.error.error.innererror?.errordetails[0]?.message}`,
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

  async deleteNursingAdmissionDoc(docKey: string) {
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
        (await this.dayCaseDashboardService.deleteNursingAdmissionDoc(docKey)).subscribe(
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
              text: `${_error.error.error.innererror?.errordetails[0]?.message}`,
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

  async deleteNursingAssessmentDoc(docKey: string) {
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
        (await this.dayCaseDashboardService.deleteNursingAssessmentDoc(docKey)).subscribe(
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
              text: `${_error.error.error.innererror?.errordetails[0]?.message}`,
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

  async deletePreCardiacCathDoc(docKey: string) {
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
        (await this.dayCaseDashboardService.deletePreCardiacCathDoc(docKey)).subscribe(
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
              text: `${_error.error.error.innererror?.errordetails[0]?.message}`,
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

  async deleteCPRDoc(docKey: string) {
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
        (await this.dayCaseDashboardService.deleteCprDocument(docKey)).subscribe(
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
              text: `${_error.error.error.innererror?.errordetails[0]?.message}`,
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

  async deleteCorrespondenceDoc(docKey: string) {
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
        (await this.dayCaseDashboardService.deleteCorrespondenceDocument(docKey)).subscribe(
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
              text: `${_error.error.error.innererror?.errordetails[0]?.message}`,
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
    // (await this.educationAssessmentComp.saveEducationFormValue(type)).subscribe((res: any) => {
    //   Swal.fire({
    //     text: "Document is updated successfully",
    //     icon: 'success',
    //     confirmButtonText: 'Ok',
    //     customClass: 'myalertpopup'
    //   })
    //   this.educationAssessmentComp.resetAll();
    //   this.refresh();
    // }, (_error: any) => { });
  }

  releaseEducationAss() {
    this.directReleaseEducationAssesment();
  }
  directReleaseEducationAssesment() {
    this.subscription = this.admissionService
      .getDocuEducationDetails(this.selectedDocData.Dockey).subscribe({
        next: (data: any) => {
          let paylaod = data.d.results[0];
          delete paylaod.__metadata
          paylaod.DocStatus = '2';
          this.subscription = this.admissionService.saveEducationData({ d: paylaod }).subscribe({
            next: (data: any) => { },
            error: (err: any) => {
              this.sharedService.waringSwallModel(`Error ${err}`);
              this.sharedService.waringSwallModel(`POST Error at Nurse Endorsment : ${err}`);
            },
            complete: () => {
              this.sharedService.successSwallModel('Admission assessment document released successfully');
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
  releaseNewBorn() {
    this.emergencyService.getNewBornDetail(this.newBornList[0].Dockey).subscribe((res: any) => {
      let d: any = {
        d: res?.d?.results[0],
      };
      d.d.DocStatus = '2';
      this.admissionService.createNewBorn(d).subscribe(
        (result) => {
          this.refresh();
        }
      );
    })
  }

  newVersionDirectReleasedSurgical() {
    this.SurgicalPassComp.copySurgicalPassDoc('5', 'copy').then((formValue: any) => {
      if (formValue) {
        this.refresh();
      }
    }).catch((error: any) => {
      console.error('Error scale:', error);
      console.error('Error creating Glasgow coma scale:', error);
    });
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

  // Copy + Release Nursing Discharge Document
  copyDirectReleaseNursingDischargeDoc() {
    this.NursingDischargeComp.createNursingDischargeDoc('5', 'copy').then((formValue: any) => {
      if (formValue) {
        this.refresh();
      }
    }).catch((error: any) => {
      console.error('Error scale:', error);
      console.error('Error creating Nursing discharge summary:', error);
    });
  }

  // Copy + Release Nursing Admission Document
  copyDirectReleaseNursingAdmissionDoc() {
    this.NursingAdmissionComp.createNursingAdmissionDoc('5', 'copy').then((formValue: any) => {
      if (formValue) {
        this.refresh();
      }
    }).catch((error: any) => {
      console.error('Error scale:', error);
      console.error('Error creating Nursing admission document:', error);
    });
  }

  // Copy + Release Nursing Assessment Document
  copyDirectReleaseNursingAssessmentDoc() {
    this.NursingAssessmentComp.createNursingAssessmentDoc('5', 'copy').then((formValue: any) => {
      if (formValue) {
        this.refresh();
      }
    }).catch((error: any) => {
      console.error('Error scale:', error);
      console.error('Error creating Nursing assessment document:', error);
    });
  }

  // Copy + Release Nursing Assessment Document
  copyDirectReleaseModifiedAldreteDoc() {
    this.ModifiedAldreteComp.createModifiedAldreteDocument('5', 'copy').then((formValue: any) => {
      if (formValue) {
        this.refresh();
      }
    }).catch((error: any) => {
      console.error('Error scale:', error);
      console.error('Error creating Nursing assessment document:', error);
    });
  }

  // Copy + Release Time Out Check Document
  copyDirectReleaseTimeOutDoc() {
    this.TimeOutCheckListComp.createTimeOutDocument('5', 'copy').then((formValue: any) => {
      if (formValue) {
        this.refresh();
      }
    }).catch((error: any) => {
      console.error('Error scale:', error);
      console.error('Error creating Nursing assessment document:', error);
    });
  }

  // Copy + Release Neonatal Discharge Summary Document
  copyDirectReleaseNeonatalDischarge() {
    this.NeonatalDischDocumentComp.createNeonatalDischargeDocument('5', 'copy').then((formValue: any) => {
      if (formValue) {
        this.refresh();
      }
    }).catch((error: any) => {
      console.error('Error scale:', error);
      console.error('Error creating Nursing assessment document:', error);
    });
  }

  // Copy + Release Nursing Admission Document
  copyDirectReleaseEducationAssessment() {
    // this.NursingAdmissionComp.createNursingAdmissionDoc('5','copy').then((formValue: any) => {
    this.educationAssessmentComp.saveEducationFormValue('5', 'copy').then((formValue: any) => {
      if (formValue) {
        this.refresh();
      }
    }).catch((error: any) => {
      console.error('Error scale:', error);
      console.error('Error creating Nursing admission document:', error);
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
  openNewBornPdf(Dockey) {
    this.pdfUrl = '';
    this.dayCaseDashboardService
      .getNewBornPDF(Dockey)
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

  openNeonatalDocPdf(Dockey) {
    this.pdfUrl = '';
    this.dayCaseDashboardService
      .NeonatalDischargeDocPDF(Dockey)
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

  dockVer(value) {
    return `(v${parseInt(value)})`;
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

