import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CheckInComponent } from './check-in/check-in.component';
import { RouterModule, Routes } from '@angular/router';

import { CoreModule } from '../core/core.module';

import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { ErBedComponent } from './check-in/er-bed/er-bed.component';
import { ErVitalsComponent } from './check-in/er-vitals/er-vitals.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { NurErAllergyComponent } from './check-in/nur-er-allergy/nur-er-allergy.component';
import { NursTreatmentWorkareaComponent } from './nurs-treatment-workarea/nurs-treatment-workarea.component';
import { PatientProfileComponent } from './nurs-treatment-workarea/patient-profile/patient-profile.component';
import { LaboratoryTableListComponent } from './nurs-treatment-workarea/patient-profile/laboratory-table-list/laboratory-table-list.component';
import { RadiologyTableListComponent } from './nurs-treatment-workarea/patient-profile/radiology-table-list/radiology-table-list.component';
import { MedicationTableListComponent } from './nurs-treatment-workarea/patient-profile/medication-table-list/medication-table-list.component';
import { SurgeryTableListComponent } from './nurs-treatment-workarea/patient-profile/surgery-table-list/surgery-table-list.component';
import { AccordionModule } from 'ngx-bootstrap/accordion';
// import { CustomDecimalPipe2 } from '../core/pipes/custom.decimal.pipe';
// import { EventfilterPipe2 } from '../core/pipes/eventfilter.pipe';
import { AddministrationService } from '@services/e-Prescription/Administration.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { PatientHistoryService } from '@services/e-kardex/patient-history.service';
import { UserConfigurationService } from '@services/e-kardex/user-configuration.service';
import { CpoeService } from '@services/emergency-dashboard/cpoe.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { ErDischargeordersService } from '@services/emergency-dashboard/er-dischargeorders.service';
import { eOrderService } from '@services/eorder.service';
import { EventService } from '@services/event.service';
import { HelperService } from '@services/helper.service';
import { OrdersDashboardService } from '@services/orders-dashboard/orders-dashboard.service';
import { StorageService } from '@services/storage.service';
import { WebService } from '@services/web.service';
import { PhysicianOrdersComponent } from './nurs-treatment-workarea/physician-orders/physician-orders.component';
import { OrdersTemplatesComponent } from './nurs-treatment-workarea/orders-templates/orders-templates.component';
import { PhysicianOrderListComponent } from './nurs-treatment-workarea/orders-templates/physician-order-list/physician-order-list.component';
import { ProgressNotesComponent } from './nurs-treatment-workarea/progress-notes/progress-notes.component';
import { ProgressNoteListComponent } from './nurs-treatment-workarea/progress-notes/progress-note-list/progress-note-list.component';
import { DiagnosisComponent } from './nurs-treatment-workarea/diagnosis/diagnosis.component';
import { DiagnosisListComponent } from './nurs-treatment-workarea/diagnosis/diagnosis-list/diagnosis-list.component';
import { SearchSelectDiagnosisCodeComponent } from './nurs-treatment-workarea/diagnosis/search-select-diagnosis-code/search-select-diagnosis-code.component';
import { ErHistoryComponent } from './er-history/er-history.component';
import { PatientSearchComponent } from './er-history/patient-search/patient-search.component';
import { ERDiagnosisComponent } from './er-history/diagnosis/diagnosis.component';
import { LabResultsComponent } from './lab-results/lab-results.component';
import { PhysicianOrdersListComponent } from './physician-orders-list/physician-orders-list.component';
import { AdministeredDosesComponent } from './administered-doses/administered-doses.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { AdministeredDoesEventComponent } from './administered-doses/administered-does-event/administered-does-event.component';
import { RemoveTrailingZerosPipe } from './administered-doses/administered-does-event/remove-trailing-zeros.pipe';
import { ConsumablesComponent } from './nurs-treatment-workarea/consumables/consumables.component';
import { ConsumablesListComponent } from './nurs-treatment-workarea/consumables/consumables-list/consumables-list.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { AlertModule } from 'ngx-bootstrap/alert';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PatientAssignmentComponent } from './patient-assignment/patient-assignment.component';
import { ConsumablesHistoryComponent } from './nurs-treatment-workarea/consumables/consumables-history/consumables-history.component';
import { PatientWithoutConsumableComponent } from './patient-without-consumable/patient-without-consumable.component';

import { ErTriageComponent } from './check-in/er-triage/er-triage.component';
import { PhysicianErVitalsComponent } from './check-in/er-triage/physician-er-vitals/physician-er-vitals.component';
import { PhysicianCreateAllergyComponent } from './check-in/er-triage/physician-create-allergy/physician-create-allergy.component';
import { ScalesGlosgowComaComponent } from './check-in/er-triage/scales-glosgow-coma/scales-glosgow-coma.component';
import { ScalesFacePainComponent } from './check-in/er-triage/scales-face-pain/scales-face-pain.component';
import { ServicesComponent } from './nurs-treatment-workarea/services/services.component';
import { ServicesListComponent } from './nurs-treatment-workarea/services/services-list/services-list.component';
import { EMarWitnessComponent } from './administered-doses/administered-does-event/e-mar-witness/e-mar-witness.component';
import { ScalesNumericRatingComponent } from './check-in/er-triage/scales-numeric-rating/scales-numeric-rating.component';
import { CreateFeeServiceComponent } from './nurs-treatment-workarea/services/services-list/create-fee-service/create-fee-service.component';
import { ServiceHistoryComponent } from './nurs-treatment-workarea/services/services-list/service-history/service-history.component';
import { FeeListService } from '@services/fee-service/fee-list.service';
import { PatientDocumentationComponent } from './nurs-treatment-workarea/patient-documentation/patient-documentation.component';
import { PatientDiagnoisiHistoryComponent } from './nurs-treatment-workarea/patient-documentation/patient-diagnoisi-history/patient-diagnoisi-history.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { PatientEducationDetailsComponent } from './nurs-treatment-workarea/patient-documentation/patient-education-details/patient-education-details.component';
import { PatientMedicalReportComponent } from './nurs-treatment-workarea/patient-documentation/patient-medical-report/patient-medical-report.component';
import { ErPhysicianComponent } from './nurs-treatment-workarea/patient-documentation/er-physician/er-physician.component';
import { AddHabitSocialComponent } from './check-in/er-triage/add-habit-social/add-habit-social.component';
import { BradenScaleComponent } from './nurs-treatment-workarea/patient-documentation/braden-scale/braden-scale.component';
import { AnalisysDashboardComponent } from './analisys-dashboard/analisys-dashboard.component';
import { BarChartComponent } from './analisys-dashboard/bar-chart/bar-chart.component';
import { PatientWithoutDocumentsComponent } from './patient-without-documents/patient-without-documents.component';
import { EPrescriptionComponent } from './nurs-treatment-workarea/e-prescription/e-prescription.component';
import { MadicationProfileNursComponent } from './nurs-treatment-workarea/e-prescription/madication-profile-nurs/madication-profile-nurs.component';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { PriotoAdmissionlistNursComponent } from './nurs-treatment-workarea/e-prescription/madication-profile-nurs/prioto-admissionlist-nurs/prioto-admissionlist-nurs.component';
import { EMarOrderNurseComponent } from './nurs-treatment-workarea/e-prescription/madication-profile-nurs/e-mar-order-nurse/e-mar-order-nurse.component';
import { PatientProfileHistoryNurseComponent } from './nurs-treatment-workarea/e-prescription/madication-profile-nurs/patient-profile-history-nurse/patient-profile-history-nurse.component';
import { PriorAdmissionOptionsNurseComponent } from './nurs-treatment-workarea/e-prescription/madication-profile-nurs/prioto-admissionlist-nurs/prior-admission-options-nurse/prior-admission-options-nurse.component';
import { EEmarOptionsNurseComponent } from './nurs-treatment-workarea/e-prescription/madication-profile-nurs/e-mar-order-nurse/e-emar-options-nurse/e-emar-options-nurse.component';
import { FilterOrderNurseStatusPipe } from './filter-order-nurse-status.pipe';
import { CustomSearchNursePipe } from './custom-search-nurse.pipe';
import { FilterPipeNursePipe } from './filter-pipe-nurse.pipe';
import { SurgicalPassportComponent } from './nurs-treatment-workarea/patient-documentation/surgical-passport/surgical-passport.component';
import { DiagnosisTabComponent } from './nurs-treatment-workarea/patient-documentation/surgical-passport/diagnosis-tab/diagnosis-tab.component';
import { PainAssessmentNurEmrComponent } from './nurs-treatment-workarea/patient-documentation/pain-assessment-nur-emr/pain-assessment-nur-emr.component';
import { ImageEditorModule } from '../shared-module/image-editor/image-editor.module';
import { NursingInpatientDashboardComponent } from './nursing-inpatient-dashboard.component';
import { NursingCarePlanDocumentModule } from '../shared-module/nursing-care-plan-document/nursing-care-plan-document.module';
import { NursingDischargeSummaryModule } from '../shared-module/nursing-discharge-summary/nursing-discharge-summary.module';
import { MorseFallScaleComponent } from './nurs-treatment-workarea/patient-documentation/morse-fall-scale/morse-fall-scale.component';
import { NursingAdmissionAssessmentModule } from '../shared-module/nursing-admission-assessment/nursing-admission-assessment.module';
import { HistoryListComponent } from './reservation/history-list/history-list.component';
import { ReservationListComponent } from './reservation/reservation-list/reservation-list.component';
import { ReservationComponent } from './reservation/reservation.component';
import { IoChartsComponent } from './nurs-treatment-workarea/io-charts/io-charts.component';
import { RecordViewComponent } from './nurs-treatment-workarea/io-charts/record-view/record-view.component';
import { DietMealOrderComponent } from './nurs-treatment-workarea/diet-meal-order/diet-meal-order.component';
import { PatientsDietMealComponent } from './nurs-treatment-workarea/diet-meal-order/patients-diet-meal/patients-diet-meal.component';
import { CompanionMealOrderingComponent } from './nurs-treatment-workarea/diet-meal-order/companion-meal-ordering/companion-meal-ordering.component';
import { DislikePreferenceComponent } from './nurs-treatment-workarea/diet-meal-order/dislike-preference/dislike-preference.component';
import { EmarWitnessComponent } from './nurs-treatment-workarea/e-prescription/madication-profile-nurs/e-mar-order-nurse/drug-events-admin/emar-witness/emar-witness.component';
import { DrugEventsAdminComponent } from './nurs-treatment-workarea/e-prescription/madication-profile-nurs/e-mar-order-nurse/drug-events-admin/drug-events-admin.component';
import { VitalSignModule } from '../shared-module/vital-sign/vital-sign.module';
import { DietMealOrderComponentNew } from './nurs-treatment-workarea/diet-meal-order-new/diet-meal-order.component';
import { PatientsDietMealComponentNew } from './nurs-treatment-workarea/diet-meal-order-new/patients-diet-meal/patients-diet-meal.component';
import { DislikePreferenceComponentNew } from './nurs-treatment-workarea/diet-meal-order-new/dislike-preference/dislike-preference.component';
import { CompanionMealOrderingComponentNew } from './nurs-treatment-workarea/diet-meal-order-new/companion-meal-ordering/companion-meal-ordering.component';
import { RecordViewComponentNew } from './nurs-treatment-workarea/io-charts-new/record-view/record-view.component';
import { IntakeOutputHistoryComponentNew } from './nurs-treatment-workarea/io-charts-new/view-history/intake-output-history/intake-output-history.component';
import { ViewHistoryComponentNew } from './nurs-treatment-workarea/io-charts-new/view-history/view-history.component';
import { IoChartsComponentNew } from './nurs-treatment-workarea/io-charts-new/io-charts.component';
import { GlasgowComaScaleComponent } from './nurs-treatment-workarea/patient-documentation/glasgow-coma-scale/glasgow-coma-scale.component';
import { HistoryAssessmentComponent } from './nurs-treatment-workarea/history-assessment/history-assessment.component';
import { PastSurgicalComponent } from './nurs-treatment-workarea/history-assessment/past-surgical/past-surgical.component';
import { PastMedicalComponent } from './nurs-treatment-workarea/history-assessment/past-medical/past-medical.component';
import { FamilyHistoryComponent } from './nurs-treatment-workarea/history-assessment/family-history/family-history.component';
import { PediatricEarlyWarningComponent } from './nurs-treatment-workarea/patient-documentation/pediatric-early-warning/pediatric-early-warning.component';
import { NurseEndorsementComponent } from './nurs-treatment-workarea/patient-documentation/nurse-endorsement/nurse-endorsement.component';
import { NumericRatingScaleComponent } from './nurs-treatment-workarea/patient-documentation/numeric-rating-scale/numeric-rating-scale.component';
import { FacePainScaleComponent } from './nurs-treatment-workarea/patient-documentation/face-pain-scale/face-pain-scale.component';
import { NursingAssessmentModule } from '../shared-module/nursing-assessment/nursing-assessment.module';
import { PreCardiacCathModule } from '../shared-module/pre-cardiac-cath/pre-cardiac-cath.module';
import { CprDocumentModule } from '../shared-module/cpr-document/cpr-document.module';
import { CorrespondenceDocumentModule } from '../shared-module/correspondence-document/correspondence-document.module';
import { SharedModuleModule } from '../shared-module/shared-module.module';
import { NewbornAssessmentModule } from "../shared-module/newborn-assessment/newborn-assessment.module";
import { ModifiedAldreteDocumentModule } from '../shared-module/modified-aldrete-document/modified-aldrete-document.module';
import { NeonatalDischDocumentModule } from '../shared-module/neonatal-disch-document/neonatal-disch-document.module';
import { ICBundlesComponent } from './nurs-treatment-workarea/patient-documentation/ic-bundles/ic-bundles.component';
import { TimeOutChecklistModule } from '../shared-module/time-out-checklist/time-out-checklist.module';
import { CvcInsertionModule } from '../shared-module/cvc-insertion/cvc-insertion.module';
import { CvcMaintenanceComponent } from './nurs-treatment-workarea/patient-documentation/cvc-maintenance/cvc-maintenance.component';
import { NursAssessmentRestraintsComponent } from './nurs-treatment-workarea/patient-documentation/nurs-assessment-restraints/nurs-assessment-restraints.component';
import { ListFilterPipe } from './list-filter.pipe';
import { CriticalCarePainComponent } from './nurs-treatment-workarea/patient-documentation/critical-care-pain/critical-care-pain.component';
import { MaternityEarlyWarningSignComponent } from './nurs-treatment-workarea/patient-documentation/maternity-early-warning-sign/maternity-early-warning-sign.component';
import { IntraOperativeRecordComponent } from './nurs-treatment-workarea/patient-documentation/intra-operative-record/intra-operative-record.component';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { PaediatricsAdmDocumentModule } from '../shared-module/paediatrics-adm-document/paediatrics-adm-document.module';
import { ReceiveCartComponent } from './nurs-treatment-workarea/e-prescription/madication-profile-nurs/receive-cart/receive-cart.component';
import { DocumentingDeliveryComponent } from './check-in/documenting-delivery/documenting-delivery.component';
import { ObsFallRiskAssessmentModule } from '../shared-module/obs-fall-risk-assessment/obs-fall-risk-assessment.module';
import { PediatricsFallRiskAssessmentComponent } from './nurs-treatment-workarea/patient-documentation/pediatrics-fall-risk-assessment/pediatrics-fall-risk-assessment.component';
import { PostPatientFallAssessmentModule } from '../shared-module/post-patient-fall-assessment/post-patient-fall-assessment.module';
import { NursingInitialAssessmentComponent } from './nurs-treatment-workarea/patient-documentation/nursing-initial-assessment/nursing-initial-assessment.component';
import { PostAnesthesiaCareRecordComponent } from './nurs-treatment-workarea/patient-documentation/post-anesthesia-care-record/post-anesthesia-care-record.component';
import { InitialNursingAssessmentNewbornModule } from '../shared-module/initial-nursing-assessment-newborn/initial-nursing-assessment-newborn.module';
import { DailyNursingAssessmentNewbornComponent } from './nurs-treatment-workarea/patient-documentation/daily-nursing-assessment-newborn/daily-nursing-assessment-newborn.component';
import { MalnutritionPaediatricsComponent } from './nurs-treatment-workarea/patient-documentation/malnutrition-paediatrics/malnutrition-paediatrics.component';
import { PaediatricPhysicianAssessmentModule } from '../shared-module/paediatric-physician-assessment/paediatric-physician-assessment.module';
import { RichmondScaleComponent } from './nurs-treatment-workarea/patient-documentation/richmond-scale/richmond-scale.component';
import { DeliveryRecordDocComponent } from './nurs-treatment-workarea/patient-documentation/delivery-record-doc/delivery-record-doc.component';
import { NewScaleDocumentModule } from '../shared-module/new-scale-document/new-scale-document.module';
import { NIPSDocumentModule } from '../shared-module/nips-document/nips-document.module';
import { RamsaySedationScaleModule } from '../shared-module/ramsay-sedation-scale/ramsay-sedation-scale.module';
import { ConfusionAssessmentMethodModule } from '../shared-module/confusion-assessment-method/confusion-assessment-method.module';
import { SbarNursingEndorsementComponent } from './nurs-treatment-workarea/patient-documentation/sbar-nursing-endorsement/sbar-nursing-endorsement.component';
import { DyingPatientComponent } from './nurs-treatment-workarea/patient-documentation/dying-patient/dying-patient.component';
import { PostCathRadialComponent } from './nurs-treatment-workarea/patient-documentation/post-cath-radial/post-cath-radial.component';
import { PostCathFemoralComponent } from './nurs-treatment-workarea/patient-documentation/post-cath-femoral/post-cath-femoral.component';
import { IcBundleAdultVentilatorModule } from '../shared-module/ic-bundle-adult-ventilator/ic-bundle-adult-ventilator.module';
import { IcuHoursFlowsheetModule } from '../shared-module/icu-hours-flowsheet/icu-hours-flowsheet.module';
import { NicuNursingFlowSheetComponent } from './nurs-treatment-workarea/patient-documentation/nicu-nursing-flow-sheet/nicu-nursing-flow-sheet.component';
import { LaborRoomFlowSheetComponent } from './nurs-treatment-workarea/patient-documentation/labor-room-flow-sheet/labor-room-flow-sheet.component';
import { ArrivalMainListComponent } from './arrival-main-list/arrival-main-list.component';


const route: Routes = [
  {
    path: '',
    component: NursingInpatientDashboardComponent,
  },
];

@NgModule({
  declarations: [
    CheckInComponent,
    NursingInpatientDashboardComponent,
    ErBedComponent,
    ErVitalsComponent,
    NurErAllergyComponent,
    NursTreatmentWorkareaComponent,
    PatientProfileComponent,
    LaboratoryTableListComponent,
    RadiologyTableListComponent,
    MedicationTableListComponent,
    SurgeryTableListComponent,
    // CustomDecimalPipe2,
    // EventfilterPipe2,
    PhysicianOrdersComponent,
    OrdersTemplatesComponent,
    PhysicianOrderListComponent,
    ProgressNotesComponent,
    ProgressNoteListComponent,
    DiagnosisComponent,
    DiagnosisListComponent,
    SearchSelectDiagnosisCodeComponent,
    ErHistoryComponent,
    PatientSearchComponent,
    ERDiagnosisComponent,
    LabResultsComponent,
    PhysicianOrdersListComponent,
    AdministeredDosesComponent,
    AdministeredDoesEventComponent,
    RemoveTrailingZerosPipe,
    ConsumablesComponent,
    ConsumablesListComponent,
    PatientAssignmentComponent,
    ConsumablesHistoryComponent,
    PatientWithoutConsumableComponent,
    ErTriageComponent,
    PhysicianErVitalsComponent,
    PhysicianCreateAllergyComponent,
    ScalesGlosgowComaComponent,
    ScalesFacePainComponent,
    ServicesComponent,
    ServicesListComponent,
    EMarWitnessComponent,
    ScalesNumericRatingComponent,
    CreateFeeServiceComponent,
    ServiceHistoryComponent,
    PatientDocumentationComponent,
    PatientDiagnoisiHistoryComponent,
    PatientEducationDetailsComponent,
    PatientMedicalReportComponent,
    ErPhysicianComponent,
    AddHabitSocialComponent,
    BradenScaleComponent,
    AnalisysDashboardComponent,
    BarChartComponent,
    PatientWithoutDocumentsComponent,
    EPrescriptionComponent,
    MadicationProfileNursComponent,
    PriotoAdmissionlistNursComponent,
    PatientProfileHistoryNurseComponent,
    PriorAdmissionOptionsNurseComponent,
    EEmarOptionsNurseComponent,
    FilterOrderNurseStatusPipe,
    CustomSearchNursePipe,
    FilterPipeNursePipe,
    SurgicalPassportComponent,
    DiagnosisTabComponent,
    PainAssessmentNurEmrComponent,
    EMarOrderNurseComponent,
    MorseFallScaleComponent,
    ReservationComponent,
    ReservationListComponent,
    HistoryListComponent,
    IoChartsComponent,
    RecordViewComponent,
    DietMealOrderComponent,
    PatientsDietMealComponent,
    CompanionMealOrderingComponent,
    DislikePreferenceComponent,
    PediatricEarlyWarningComponent,
    NurseEndorsementComponent,
    NumericRatingScaleComponent,
    EmarWitnessComponent,
    DrugEventsAdminComponent,
    FacePainScaleComponent,
    DietMealOrderComponentNew,
    PatientsDietMealComponentNew,
    DislikePreferenceComponentNew,
    CompanionMealOrderingComponentNew,
    RecordViewComponentNew,
    IntakeOutputHistoryComponentNew,
    ViewHistoryComponentNew,
    IoChartsComponentNew,
    GlasgowComaScaleComponent,
    HistoryAssessmentComponent,
    PastSurgicalComponent,
    PastMedicalComponent,
    FamilyHistoryComponent,
    ICBundlesComponent,
    CvcMaintenanceComponent,
    NursAssessmentRestraintsComponent,
    ListFilterPipe,
    CriticalCarePainComponent,
    ReceiveCartComponent,
    MaternityEarlyWarningSignComponent,
    IntraOperativeRecordComponent,
    DocumentingDeliveryComponent,
    PediatricsFallRiskAssessmentComponent,
    NursingInitialAssessmentComponent,
    PostAnesthesiaCareRecordComponent,
    DailyNursingAssessmentNewbornComponent,
    MalnutritionPaediatricsComponent,
    RichmondScaleComponent,
    DeliveryRecordDocComponent,
    SbarNursingEndorsementComponent,
    DyingPatientComponent,
    PostCathRadialComponent,
    PostCathFemoralComponent,
    NicuNursingFlowSheetComponent,
    LaborRoomFlowSheetComponent,
    ArrivalMainListComponent
  ],
  providers: [
    EmergencyService,
    EPrescriptionService,
    FeeListService,
    HelperService,
    DatePipe,
    StorageService,
    ErDischargeordersService,
    eOrderService,
    WebService,
    EventService,
    CpoeService,
    AddministrationService,
    PatientHistoryService,
    OrdersDashboardService,
    UserConfigurationService,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgMultiSelectDropDownModule.forRoot(),
    RouterModule.forChild(route),
    CoreModule,
    NgSelectModule,
    ReactiveFormsModule,
    Ng2SearchPipeModule,
    BsDatepickerModule.forRoot(),
    NgxMaterialTimepickerModule,
    AccordionModule.forRoot(),
    TimepickerModule,
    TooltipModule.forRoot(),
    AlertModule.forRoot(),
    TabsModule.forRoot(),
    NgbCollapseModule,
    PopoverModule,
    NgxExtendedPdfViewerModule,
    ImageEditorModule,
    NursingCarePlanDocumentModule,
    NursingDischargeSummaryModule,
    NursingAdmissionAssessmentModule,
    NursingAssessmentModule,
    VitalSignModule,
    PreCardiacCathModule,
    CprDocumentModule,
    CorrespondenceDocumentModule,
    SharedModuleModule,
    NewbornAssessmentModule,
    ModifiedAldreteDocumentModule,
    NeonatalDischDocumentModule,
    TimeOutChecklistModule,
    CvcInsertionModule,
    PaediatricsAdmDocumentModule,
    ObsFallRiskAssessmentModule,
    PostPatientFallAssessmentModule,
    InitialNursingAssessmentNewbornModule,
    PaediatricPhysicianAssessmentModule,
    NewScaleDocumentModule,
    NIPSDocumentModule,
    RamsaySedationScaleModule,
    ConfusionAssessmentMethodModule,
    IcBundleAdultVentilatorModule,
    IcuHoursFlowsheetModule
],
})
export class NursingInpatientDashboardModule {}
