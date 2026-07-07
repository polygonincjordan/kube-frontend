import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DischargeProcessComponent } from './discharge-process.component';
import { BedViewItemsPatnrComponent } from './bed-view-items-patnr/bed-view-items-patnr.component';
import { OrdersTemplatesComponent } from './orders-templates/orders-templates.component';
import { PhysicianOrderListComponent } from './orders-templates/physician-order-list/physician-order-list.component';
import { PhysicianOrdersComponent } from './physician-orders/physician-orders.component';
import { ProgressNotesComponent } from './progress-notes/progress-notes.component';
import { ProgressNoteListComponent } from './progress-notes/progress-note-list/progress-note-list.component';
import { CoreModule } from '../core/core.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { NgSelectModule } from '@ng-select/ng-select';
import { RouterModule, Routes } from '@angular/router';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { QuillModule } from 'ngx-quill';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { HelperService } from '@services/helper.service';
import { StorageService } from '@services/storage.service';
import { AuthInterceptor } from '@services/interceptor/auth.interceptor.guard';
import { LoadingInterceptor } from '@services/interceptor/loading.interceptor.guard';
import { DischargeOrderComponent } from './discharge-order/discharge-order.component';
import { TemplatePopupComponent } from './discharge-order/template-popup/template-popup.component';
import { TemplateDetailPopupComponent } from './discharge-order/template-detail-popup/template-detail-popup.component';
import { TemplateEditPopupComponent } from './discharge-order/template-edit-popup/template-edit-popup.component';
import { SearchSelectTemplateComponent } from './discharge-order/search-select-template/search-select-template.component';
import { SearchSelectMedicineComponent } from './discharge-order/search-select-medicine/search-select-medicine.component';
import { PrnConditionPopupComponent } from './discharge-order/prn-condition-popup/prn-condition-popup.component';
import { MedicationPopupComponent } from './discharge-order/medication-popup/medication-popup.component';
import { CreateDischargeOrderComponent } from './discharge-order/create-discharge-order/create-discharge-order.component';
import { AdditionInfoPopupComponent } from './discharge-order/addition-info-popup/addition-info-popup.component';
import { ErDischargeordersService } from '@services/emergency-dashboard/er-dischargeorders.service';
import { DocumentationComponent } from './documentation/documentation.component';
import { DocumentationListComponent } from './documentation/documentation-list/documentation-list.component';
import { PhysicianFormComponent } from './documentation/documentation-list/physician-form/physician-form.component';
// import { EducationFormComponent } from './documentation/documentation-list/education-form/education-form.component';
import { SopaDocumentComponent } from './documentation/documentation-list/sopa-document/sopa-document.component';
import { DischargeSummaryComponent } from './documentation/documentation-list/discharge-summary/discharge-summary.component';
import { ObstetricRiskComponent } from './documentation/documentation-list/obstetric-risk/obstetric-risk.component';
import { TemplateDescriptionComponent } from './discharge-order/create-discharge-order/template-description/template-description.component';
import { AddministrationService } from '@services/e-Prescription/Administration.service';
import { TemplatesearchPipe } from './discharge-order/template-popup/templatesearch.pipe';
import { PatientService } from '@services/e-kardex/patient.service';
import { RemoveTrailingZerosPipe } from './discharge-order/create-discharge-order/remove-trailing-zeros.pipe';
import { MedicalReportComponent } from './documentation/documentation-list/medical-report/medical-report.component';
import { EducationFormComponent } from './documentation/documentation-list/education-form/education-form.component';
import { ObsVTEAnteptmComponent } from './documentation/documentation-list/obs-vte-anteptm/obs-vte-anteptm.component';
import { FrequencyDeftimComponent } from './discharge-order/create-discharge-order/frequency-deftim/frequency-deftim.component';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { DiagnosisHistoryPopupComponent } from './documentation/documentation-list/dignosis-history-popup/diagnosis-history-popup.component';
import { OperationReportComponent } from './documentation/documentation-list/operation-report/operation-report.component';
import { ObsGynComponent } from './documentation/documentation-list/obs-gyn/obs-gyn.component';
import { CreateAllergyComponent } from './documentation/documentation-list/obs-gyn/create-allergy/create-allergy.component';
import { GynDiagnosisComponent } from './documentation/documentation-list/obs-gyn/diagnosis/diagnosis.component';
import { ErVitalsComponent } from './documentation/documentation-list/obs-gyn/er-vitals/er-vitals.component';
import { AreaChartComponent } from './documentation/documentation-list/obs-gyn/er-vitals/area-chart/area-chart.component';
import { NeonatalProgressNoteComponent } from './documentation/documentation-list/neonatal-progress-note/neonatal-progress-note.component';
import { NeonatalMedicalReportComponent } from './documentation/documentation-list/neonatal-medical-report/neonatal-medical-report.component';
import { DiagnosisComponent } from './diagnosis/diagnosis.component';
import { DiagnosisListComponent } from './diagnosis/diagnosis-list/diagnosis-list.component';
import { SearchSelectDiagnosisCodeComponent } from './diagnosis/search-select-diagnosis-code/search-select-diagnosis-code.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { PhysicianPastSurgicalComponent } from './documentation/documentation-list/physician-form/physician-past-surgical/physician-past-surgical.component';
import { PhysicianCreateAllergyComponent } from './documentation/documentation-list/physician-form/physician-create-allergy/physician-create-allergy.component';
import { PhysicianDiagnosisComponent } from './documentation/documentation-list/physician-form/physician-diagnosis/physician-diagnosis.component';
import { PhysicianErVitalsComponent } from './documentation/documentation-list/physician-form/physician-er-vitals/physician-er-vitals.component';
import { PhysicianFamilyHistoryComponent } from './documentation/documentation-list/physician-form/physician-family-history/physician-family-history.component';
import { PhysicianPastMedicalComponent } from './documentation/documentation-list/physician-form/physician-past-medical/physician-past-medical.component';
import { PatientHistoryService } from '@services/e-kardex/patient-history.service';
import { DocVisitNoteComponent } from './documentation/documentation-list/doc-visit-note/doc-visit-note.component';
import { VitalSignModule } from '../shared-module/vital-sign/vital-sign.module';
import { NeonatalDischDocumentModule } from '../shared-module/neonatal-disch-document/neonatal-disch-document.module';
import { PaediatricPhysicianAssessmentModule } from '../shared-module/paediatric-physician-assessment/paediatric-physician-assessment.module';
import { CycleDefinitionModule } from '../shared-module/cycle-definition/cycle-definition.module';


export const ePrescriptionRoutes: Routes = [
  { path: '**', component: DischargeProcessComponent },
];

@NgModule({
  declarations: [
    DischargeProcessComponent,
    BedViewItemsPatnrComponent,
    OrdersTemplatesComponent,
    PhysicianOrderListComponent,
    PhysicianOrdersComponent,
    ProgressNoteListComponent,
    ProgressNotesComponent,
    DischargeOrderComponent,
    TemplatePopupComponent,
    TemplateDetailPopupComponent,
    TemplateEditPopupComponent,
    SearchSelectTemplateComponent,
    SearchSelectMedicineComponent,
    AdditionInfoPopupComponent,
    CreateDischargeOrderComponent,
    MedicationPopupComponent,
    PrnConditionPopupComponent,
    DocumentationComponent,
    DocumentationListComponent,
    EducationFormComponent,
    PhysicianFormComponent,
    SopaDocumentComponent,
    DischargeSummaryComponent,
    ObstetricRiskComponent,
    MedicalReportComponent,
    TemplateDescriptionComponent,
    TemplatesearchPipe,
    RemoveTrailingZerosPipe,
    ObsVTEAnteptmComponent,
    FrequencyDeftimComponent,
    DiagnosisHistoryPopupComponent,
    OperationReportComponent,
    ObsGynComponent,
    CreateAllergyComponent,
    GynDiagnosisComponent,
    ErVitalsComponent,
    AreaChartComponent,
    NeonatalProgressNoteComponent,
    NeonatalMedicalReportComponent,
    DiagnosisComponent,
    DiagnosisListComponent,
    SearchSelectDiagnosisCodeComponent,
    PhysicianPastSurgicalComponent,
    PhysicianPastMedicalComponent,
    PhysicianFamilyHistoryComponent,
    PhysicianErVitalsComponent,
    PhysicianDiagnosisComponent,
    PhysicianCreateAllergyComponent,
    DocVisitNoteComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CarouselModule,
    NgSelectModule,
    RouterModule.forChild(ePrescriptionRoutes),
    BsDatepickerModule.forRoot(),
    Ng2SearchPipeModule,
    PopoverModule,
    NgxMaterialTimepickerModule,
    QuillModule.forRoot(),
    NgMultiSelectDropDownModule,
    NgbCollapseModule,
    NgxExtendedPdfViewerModule,
    VitalSignModule,
    NeonatalDischDocumentModule,
    PaediatricPhysicianAssessmentModule,
    CycleDefinitionModule
  ],
  providers: [EPrescriptionService, HelperService, DatePipe, StorageService,
    ErDischargeordersService, AddministrationService, PatientService, PatientHistoryService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true }]
})
export class DischargeProcessModule { }
