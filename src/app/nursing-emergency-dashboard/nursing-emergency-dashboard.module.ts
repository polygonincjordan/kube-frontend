import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CheckInComponent } from './check-in/check-in.component';
import { RouterModule, Routes } from '@angular/router';
import { NursingEmergencyDashboardComponent } from './nursing-emergency-dashboard.component';
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
import { GlasgowComaScaleComponent } from './nurs-treatment-workarea/patient-documentation/glasgow-coma-scale/glasgow-coma-scale.component';
import { FacePainScaleComponent } from './nurs-treatment-workarea/patient-documentation/face-pain-scale/face-pain-scale.component';
import { NumericRatingScaleComponent } from './nurs-treatment-workarea/patient-documentation/numeric-rating-scale/numeric-rating-scale.component';

import { AddHabitSocialComponent } from './check-in/er-triage/add-habit-social/add-habit-social.component';
import { BradenScaleComponent } from './nurs-treatment-workarea/patient-documentation/braden-scale/braden-scale.component';
import { AnalisysDashboardComponent } from './analisys-dashboard/analisys-dashboard.component';
import { BarChartComponent } from './analisys-dashboard/bar-chart/bar-chart.component';
import { EmergencyNursingDocumentComponent } from './nurs-treatment-workarea/patient-documentation/emergency-nursing-document/emergency-nursing-document.component';
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
import { PhysicianAllergyComponent } from './nurs-treatment-workarea/patient-documentation/emergency-nursing-document/physician-allergy/physician-allergy.component';
import { ErVitalComponent } from './nurs-treatment-workarea/patient-documentation/emergency-nursing-document/er-vital/er-vital.component';
import { SocialHabitComponent } from './nurs-treatment-workarea/patient-documentation/emergency-nursing-document/social-habit/social-habit.component';
import { GlosGowCommaScalePopupComponent } from './nurs-treatment-workarea/patient-documentation/emergency-nursing-document/glos-gow-comma-scale/glos-gow-comma-scale-popup.component';
import { NumericRatingScalePopupComponent } from './nurs-treatment-workarea/patient-documentation/emergency-nursing-document/numeric-rating-scale/numeric-rating-scale-popup.component';
import { FacePainScalePopupComponent } from './nurs-treatment-workarea/patient-documentation/emergency-nursing-document/face-pain-scale/face-pain-scale-popup.component';
import { NurseEndorsementComponent } from './nurs-treatment-workarea/patient-documentation/nurse-endorsement/nurse-endorsement.component';
import { SurgicalPassportComponent } from './nurs-treatment-workarea/patient-documentation/surgical-passport/surgical-passport.component';
import { DiagnosisTabComponent } from './nurs-treatment-workarea/patient-documentation/surgical-passport/diagnosis-tab/diagnosis-tab.component';
import { PainAssessmentNurEmrComponent } from './nurs-treatment-workarea/patient-documentation/pain-assessment-nur-emr/pain-assessment-nur-emr.component';
import { ImageEditorModule } from '../shared-module/image-editor/image-editor.module';
import { PediatricEarlyWarningComponent } from './nurs-treatment-workarea/patient-documentation/pediatric-early-warning/pediatric-early-warning.component';
import { NursingCarePlansComponent } from './nurs-treatment-workarea/patient-documentation/nursing-care-plans/nursing-care-plans.component';
import { ReservationComponent } from './reservation/reservation.component';
import { ReservationListComponent } from './reservation/reservation-list/reservation-list.component';
import { HistoryListComponent } from './reservation/history-list/history-list.component';
import { EmarWitnessComponent } from './nurs-treatment-workarea/e-prescription/madication-profile-nurs/e-mar-order-nurse/drug-events-admin/emar-witness/emar-witness.component';
import { DrugEventsAdminComponent } from './nurs-treatment-workarea/e-prescription/madication-profile-nurs/e-mar-order-nurse/drug-events-admin/drug-events-admin.component';
import { VitalSignModule } from '../shared-module/vital-sign/vital-sign.module';
import { CorrespondenceDocumentModule } from '../shared-module/correspondence-document/correspondence-document.module';
import { HistoryAssessmentModule } from '../shared-module/history-assessment/history-assessment.module';
import { CprDocumentModule } from '../shared-module/cpr-document/cpr-document.module';
import { ReceiveCartComponent } from './nurs-treatment-workarea/e-prescription/madication-profile-nurs/receive-cart/receive-cart.component';

const route: Routes = [
  {
    path: '',
    component: NursingEmergencyDashboardComponent,
  },
];

@NgModule({
  declarations: [
    CheckInComponent,
    NursingEmergencyDashboardComponent,
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
    GlasgowComaScaleComponent,
    FacePainScaleComponent,
    NumericRatingScaleComponent,
    BradenScaleComponent,
    AnalisysDashboardComponent,
    BarChartComponent,
    EmergencyNursingDocumentComponent,
    PatientWithoutDocumentsComponent,
    EPrescriptionComponent,
    MadicationProfileNursComponent,
    PriotoAdmissionlistNursComponent,
    EMarOrderNurseComponent,
    PatientProfileHistoryNurseComponent,
    PriorAdmissionOptionsNurseComponent,
    EEmarOptionsNurseComponent,
    FilterOrderNurseStatusPipe,
    CustomSearchNursePipe,
    FilterPipeNursePipe,
    PhysicianAllergyComponent,
    ErVitalComponent,
    SocialHabitComponent,
    GlosGowCommaScalePopupComponent,
    NumericRatingScalePopupComponent,
    FacePainScalePopupComponent,
    NurseEndorsementComponent,
    SurgicalPassportComponent,
    DiagnosisTabComponent,
    PainAssessmentNurEmrComponent,
    PediatricEarlyWarningComponent,
    NursingCarePlansComponent,
    ReservationComponent,
    ReservationListComponent,
    HistoryListComponent,
    EmarWitnessComponent,
    DrugEventsAdminComponent,
    ReceiveCartComponent
  ],
  providers: [EmergencyService, EPrescriptionService, FeeListService, HelperService, DatePipe, StorageService, ErDischargeordersService, eOrderService, WebService, EventService, CpoeService, AddministrationService, PatientHistoryService, OrdersDashboardService, UserConfigurationService],
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
    TooltipModule.forRoot(),
    AlertModule.forRoot(),
    TabsModule.forRoot(),
    NgbCollapseModule,
    PopoverModule,
    NgxExtendedPdfViewerModule,
    ImageEditorModule,
    VitalSignModule,
    CorrespondenceDocumentModule,
    HistoryAssessmentModule,
    CprDocumentModule
  ],
})
export class NursingEmergencyDashboardModule { }
