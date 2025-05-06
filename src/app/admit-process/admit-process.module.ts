import { ObsGynComponent } from './documentation/documentation-list/obs-gyn/obs-gyn.component';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { HelperService } from '@services/helper.service';
import { AuthInterceptor } from '@services/interceptor/auth.interceptor.guard';
import { LoadingInterceptor } from '@services/interceptor/loading.interceptor.guard';
import { StorageService } from '@services/storage.service';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { CoreModule } from '../core/core.module';
import { AdmitProcessComponent } from './admit-process.component';
import { BedViewItemsPatnrComponent } from './bed-view-items-patnr/bed-view-items-patnr.component';
import { PhysicianOrdersComponent } from './physician-orders/physician-orders.component';
import { OrdersTemplatesComponent } from './orders-templates/orders-templates.component';
import { PhysicianOrderListComponent } from './orders-templates/physician-order-list/physician-order-list.component';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { ProgressNotesComponent } from './progress-notes/progress-notes.component';
import { QuillModule } from 'ngx-quill';
import { ProgressNoteListComponent } from './progress-notes/progress-note-list/progress-note-list.component';
import { DiagnosisComponent } from './diagnosis/diagnosis.component';
import { GynDiagnosisComponent } from './documentation/documentation-list/obs-gyn/diagnosis/diagnosis.component';
import { DiagnosisListComponent } from './diagnosis/diagnosis-list/diagnosis-list.component';
import { SearchSelectDiagnosisCodeComponent } from './diagnosis/search-select-diagnosis-code/search-select-diagnosis-code.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { DocumentationComponent } from './documentation/documentation.component';
import { DocumentationListComponent } from './documentation/documentation-list/documentation-list.component';
import { EducationFormComponent } from './documentation/documentation-list/education-form/education-form.component';
import { PhysicianFormComponent } from './documentation/documentation-list/physician-form/physician-form.component';
import { SopaDocumentComponent } from './documentation/documentation-list/sopa-document/sopa-document.component';
import { DischargeSummaryComponent } from './documentation/documentation-list/discharge-summary/discharge-summary.component';
import { ObstetricRiskComponent } from './documentation/documentation-list/obstetric-risk/obstetric-risk.component';
import { MedicalReportComponent } from './documentation/documentation-list/medical-report/medical-report.component';
import { ObsVTEAnteptmComponent } from './documentation/documentation-list/obs-vte-anteptm/obs-vte-anteptm.component';
import { DiagnosisHistoryPopupComponent } from './documentation/documentation-list/dignosis-history-popup/diagnosis-history-popup.component';
import { CreateAllergyComponent } from './documentation/documentation-list/obs-gyn/create-allergy/create-allergy.component';
import { ErVitalsComponent } from './documentation/documentation-list/obs-gyn/er-vitals/er-vitals.component';
import { AreaChartComponent } from './documentation/documentation-list/obs-gyn/er-vitals/area-chart/area-chart.component';
import { OperationReportComponent } from './documentation/documentation-list/operation-report/operation-report.component';
import { NeonatalProgressNoteComponent } from './documentation/documentation-list/neonatal-progress-note/neonatal-progress-note.component';
import { NeonatalMedicalReportComponent } from './documentation/documentation-list/neonatal-medical-report/neonatal-medical-report.component';
import { PhysicianDiagnosisComponent } from './documentation/documentation-list/physician-form/physician-diagnosis/physician-diagnosis.component';
import { PhysicianErVitalsComponent } from './documentation/documentation-list/physician-form/physician-er-vitals/physician-er-vitals.component';
import { PhysicianCreateAllergyComponent } from './documentation/documentation-list/physician-form/physician-create-allergy/physician-create-allergy.component';
import { PhysicianFamilyHistoryComponent } from './documentation/documentation-list/physician-form/physician-family-history/physician-family-history.component';
import { PhysicianPastMedicalComponent } from './documentation/documentation-list/physician-form/physician-past-medical/physician-past-medical.component';
import { PhysicianPastSurgicalComponent } from './documentation/documentation-list/physician-form/physician-past-surgical/physician-past-surgical.component';
import { PatientHistoryService } from '@services/e-kardex/patient-history.service';
import { DocVisitNoteComponent } from './documentation/documentation-list/doc-visit-note/doc-visit-note.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { TransferAssessmentComponent } from './documentation/documentation-list/transfer-assessment/transfer-assessment.component';
import { NewbornAssessmentModule } from '../shared-module/newborn-assessment/newborn-assessment.module';
import { VitalSignModule } from '../shared-module/vital-sign/vital-sign.module';
import { NicuAssessmentDocumentComponent } from './documentation/documentation-list/nicu-assessment-document/nicu-assessment-document.component';
import { NicuErVitalsComponent } from './documentation/documentation-list/nicu-assessment-document/er-vitals/er-vitals.component';
import { NeonatalDischDocumentModule } from '../shared-module/neonatal-disch-document/neonatal-disch-document.module';
import { PaediatricsAdmDocumentModule } from '../shared-module/paediatrics-adm-document/paediatrics-adm-document.module';


export const ePrescriptionRoutes: Routes = [
  { path: '**', component: AdmitProcessComponent },
];
@NgModule({
  declarations: [
    AdmitProcessComponent,
    PhysicianOrdersComponent,
    BedViewItemsPatnrComponent,
    OrdersTemplatesComponent,
    PhysicianOrderListComponent,
    ProgressNotesComponent,
    ProgressNoteListComponent,
    DiagnosisComponent,
    DiagnosisListComponent,
    SearchSelectDiagnosisCodeComponent,
    DocumentationComponent,
    DocumentationListComponent,
    EducationFormComponent,
    PhysicianFormComponent,
    SopaDocumentComponent,
    DischargeSummaryComponent,
    ObstetricRiskComponent,
    MedicalReportComponent,
    ObsVTEAnteptmComponent,
    DiagnosisHistoryPopupComponent,
    ObsGynComponent,
    CreateAllergyComponent,
    GynDiagnosisComponent,
    ErVitalsComponent,
    AreaChartComponent,
    OperationReportComponent,
    NeonatalProgressNoteComponent,
    NeonatalMedicalReportComponent,
    PhysicianDiagnosisComponent,
    PhysicianErVitalsComponent,
    PhysicianCreateAllergyComponent,
    PhysicianFamilyHistoryComponent,
    PhysicianPastMedicalComponent,
    PhysicianPastSurgicalComponent,
    DocVisitNoteComponent,
    TransferAssessmentComponent,
    NicuAssessmentDocumentComponent,
    NicuErVitalsComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    NgxExtendedPdfViewerModule,
    HttpClientModule,
    CarouselModule,
    NgSelectModule,
    RouterModule.forChild(ePrescriptionRoutes),
    BsDatepickerModule.forRoot(),
    Ng2SearchPipeModule,
    PopoverModule,
    NgxMaterialTimepickerModule,
    QuillModule.forRoot(),
    NgMultiSelectDropDownModule.forRoot(),
    NewbornAssessmentModule,
    VitalSignModule,
    NeonatalDischDocumentModule,
    PaediatricsAdmDocumentModule
  ],
  providers: [EPrescriptionService, HelperService, DatePipe, StorageService, PatientHistoryService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true }]
})
export class AdmitProcessModule { }
