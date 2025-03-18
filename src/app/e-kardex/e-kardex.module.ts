import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { eOrderService } from '@services/eorder.service';
import { EventService } from '@services/event.service';
import { HelperService } from '@services/helper.service';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { CoreModule } from '../core/core.module';
import { InPatientConfigurationService } from '../services/e-kardex/inPatient.service';
import { SearchModalConfigurationService } from '../services/e-kardex/search-modal.service';
import { UserConfigurationService } from '../services/e-kardex/user-configuration.service';
import { DiagnosesComponent } from './diagnoses/diagnoses.component';
import { EKardexComponent } from './e-kardex.component';
import { ErrorPlaceholderComponent } from './error-placeholder/error-placeholder.component';
import { NoDataFoundComponent } from './no-data-found/no-data-found.component';
import { NotAddedComponent } from './not-added/not-added.component';
import { PateintBmiComponent } from './pateint-bmi/pateint-bmi.component';
import { PdfViewerComponent } from './pdf-viewer/pdf-viewer.component';
import { SoapFormComponent } from './soap-form/soap-form.component';
import { VerticalArrowIndicatorComponent } from './vertical-arrow-indicator/vertical-arrow-indicator.component';
import { VisitFormComponent } from './visit-form/visit-form.component';
import { VitalsCardListComponent } from './vitals-card-list/vitals-card-list.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { HospitalistService } from '@services/e-hospitalist/hospitalist.service';
import { PatientHistoryService } from '@services/e-kardex/patient-history.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { QuillModule } from 'ngx-quill';
import { DiagnosesInPatientComponent } from './diagnoses/diagnoses-in-patient/diagnoses-in-patient.component';
import { DiagnosisTableComponent } from './diagnoses/diagnoses-in-patient/diagnosis-table/diagnosis-table.component';
import { DiagnosisHistoryPopupComponent } from './diagnoses/dignosis-history-popup/diagnosis-history-popup.component';
import { AreaChartComponent } from './er-vitals/area-chart/area-chart.component';
import { ErVitalsComponent } from './er-vitals/er-vitals.component';
import { DiagnosisComponent } from './patient-history/diagnosis/diagnosis.component';
import { FamilyHistoryComponent } from './patient-history/family-history/family-history.component';
import { PastMedicalComponent } from './patient-history/past-medical/past-medical.component';
import { PastSurgicalComponent } from './patient-history/past-surgical/past-surgical.component';
import { PatientHistoryComponent } from './patient-history/patient-history.component';
import { OrdersTemplatesComponent } from './patient-history/physician-order-kardex/orders-templates/orders-templates.component';
import { PhysicianOrderListComponent } from './patient-history/physician-order-kardex/orders-templates/physician-order-list/physician-order-list.component';
import { PhysicianOrderKardexComponent } from './patient-history/physician-order-kardex/physician-order-kardex.component';
import { PhysicianOrdersComponent } from './patient-history/progress-notes-kardex/physician-orders/physician-orders.component';
import { ProgressNotesKardexComponent } from './patient-history/progress-notes-kardex/progress-notes-kardex.component';
import { ProgressNoteListComponent } from './patient-history/progress-notes-kardex/progress-notes/progress-note-list/progress-note-list.component';
import { ProgressNotesComponent } from './patient-history/progress-notes-kardex/progress-notes/progress-notes.component';
import { StructureDocComponent } from './patient-history/structure-doc/structure-doc.component';
import { PhysicianFormComponent } from './diagnoses/diagnoses-in-patient/physician-form/physician-form.component';
import { PhysicianCreateAllergyComponent } from './diagnoses/diagnoses-in-patient/physician-form/physician-create-allergy/physician-create-allergy.component';
import { PhysicianDiagnosisComponent } from './diagnoses/diagnoses-in-patient/physician-form/physician-diagnosis/physician-diagnosis.component';
import { PhysicianErVitalsComponent } from './diagnoses/diagnoses-in-patient/physician-form/physician-er-vitals/physician-er-vitals.component';
import { PhysicianFamilyHistoryComponent } from './diagnoses/diagnoses-in-patient/physician-form/physician-family-history/physician-family-history.component';
import { PhysicianPastMedicalComponent } from './diagnoses/diagnoses-in-patient/physician-form/physician-past-medical/physician-past-medical.component';
import { PhysicianPastSurgicalComponent } from './diagnoses/diagnoses-in-patient/physician-form/physician-past-surgical/physician-past-surgical.component';
import { CorrespondenceDocumentModule } from '../shared-module/correspondence-document/correspondence-document.module';
import { SharedModuleModule } from '../shared-module/shared-module.module';
import { NewbornAssessmentModule } from '../shared-module/newborn-assessment/newborn-assessment.module';
import { NewBornPopupComponent } from './diagnoses/diagnoses-in-patient/new-born-popup/new-born-popup.component';

export const eKardexRoutes: Routes = [
  { path: '**', component: EKardexComponent },
];

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    PerfectScrollbarModule,
    NgbModule,
    ReactiveFormsModule,
    FormsModule,
    BsDatepickerModule.forRoot(),
    QuillModule.forRoot(),
    TranslateModule.forRoot(),
    BsDropdownModule.forRoot(),
    RouterModule.forChild(eKardexRoutes),
    NgSelectModule,
    Ng2SearchPipeModule,
    NgxMaterialTimepickerModule,
    NgxExtendedPdfViewerModule,
    CorrespondenceDocumentModule,
    SharedModuleModule,
    NewbornAssessmentModule
  ],
  providers: [
    eOrderService,
    UserConfigurationService,
    InPatientConfigurationService,
    SearchModalConfigurationService,
    DatePipe,
    EventService,
    HelperService,
    EmergencyService,
    PatientHistoryService,
    HospitalistService,
    EPrescriptionService
  ],
  declarations: [
    EKardexComponent,
    ErrorPlaceholderComponent,
    NotAddedComponent,
    VitalsCardListComponent,
    PateintBmiComponent,
    NoDataFoundComponent,
    VisitFormComponent,
    SoapFormComponent,
    PdfViewerComponent,
    DiagnosesComponent,
    VerticalArrowIndicatorComponent,
    DiagnosesInPatientComponent,
    DiagnosisTableComponent,
    DiagnosisHistoryPopupComponent,
    PatientHistoryComponent,
    ProgressNotesKardexComponent,
    ProgressNoteListComponent,
    ProgressNotesComponent,
    PhysicianOrdersComponent,
    PhysicianOrderKardexComponent,
    PhysicianOrderListComponent,
    OrdersTemplatesComponent,
    PastMedicalComponent,
    PastSurgicalComponent,
    StructureDocComponent,
    FamilyHistoryComponent,
    DiagnosisComponent,
    ErVitalsComponent,
    AreaChartComponent,

    PhysicianFormComponent,
    PhysicianCreateAllergyComponent,
    PhysicianDiagnosisComponent,
    PhysicianErVitalsComponent,
    PhysicianFamilyHistoryComponent,
    PhysicianPastMedicalComponent,
    PhysicianPastSurgicalComponent,
    NewBornPopupComponent
  ],
})
export class EKardexModule { }
