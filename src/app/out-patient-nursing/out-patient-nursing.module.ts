import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { OutPatientNursingComponent } from './out-patient-nursing.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { CoreModule } from '../core/core.module';
import { PatientHistoryService } from '@services/e-kardex/patient-history.service';
import { UserConfigurationService } from '@services/e-kardex/user-configuration.service';
import { AddministrationService } from '@services/e-Prescription/Administration.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { CpoeService } from '@services/emergency-dashboard/cpoe.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { ErDischargeordersService } from '@services/emergency-dashboard/er-dischargeorders.service';
import { eOrderService } from '@services/eorder.service';
import { EventService } from '@services/event.service';
import { HelperService } from '@services/helper.service';
import { OrdersDashboardService } from '@services/orders-dashboard/orders-dashboard.service';
import { StorageService } from '@services/storage.service';
import { WebService } from '@services/web.service';
import { DiagnosisListComponent } from './nurs-treatment-workarea/diagnosis/diagnosis-list/diagnosis-list.component';
import { PhysicianOrdersComponent } from './nurs-treatment-workarea/physician-orders/physician-orders.component';
import { OrdersTemplatesComponent } from './nurs-treatment-workarea/orders-templates/orders-templates.component';
import { PhysicianOrderListComponent } from './nurs-treatment-workarea/orders-templates/physician-order-list/physician-order-list.component';
import { ProgressNotesComponent } from './nurs-treatment-workarea/progress-notes/progress-notes.component';
import { ProgressNoteListComponent } from './nurs-treatment-workarea/progress-notes/progress-note-list/progress-note-list.component';
import { DiagnosisComponent } from './nurs-treatment-workarea/diagnosis/diagnosis.component';
import { SearchSelectDiagnosisCodeComponent } from './nurs-treatment-workarea/diagnosis/search-select-diagnosis-code/search-select-diagnosis-code.component';
import { ErHistoryComponent } from './er-history/er-history.component';
import { PatientSearchComponent } from './er-history/patient-search/patient-search.component';
import { ERDiagnosisComponent } from './er-history/diagnosis/diagnosis.component';
import { LabResultsComponent } from './lab-results/lab-results.component';
import { PhysicianOrdersListComponent } from './physician-orders-list/physician-orders-list.component';
import { AdministeredDosesComponent } from './administered-doses/administered-doses.component';
import { AdministeredDoesEventComponent } from './administered-doses/administered-does-event/administered-does-event.component';
import { ErBedComponent } from './check-in/er-bed/er-bed.component';
import { ErVitalsComponent } from './check-in/er-vitals/er-vitals.component';
import { NurErAllergyComponent } from './check-in/nur-er-allergy/nur-er-allergy.component';
import { NursTreatmentWorkareaComponent } from './nurs-treatment-workarea/nurs-treatment-workarea.component';
import { PatientProfileComponent } from './nurs-treatment-workarea/patient-profile/patient-profile.component';
import { LaboratoryTableListComponent } from './nurs-treatment-workarea/patient-profile/laboratory-table-list/laboratory-table-list.component';
import { RadiologyTableListComponent } from './nurs-treatment-workarea/patient-profile/radiology-table-list/radiology-table-list.component';
import { MedicationTableListComponent } from './nurs-treatment-workarea/patient-profile/medication-table-list/medication-table-list.component';
import { SurgeryTableListComponent } from './nurs-treatment-workarea/patient-profile/surgery-table-list/surgery-table-list.component';
import { CheckInComponent } from './check-in/check-in.component';
import { CustomDecimalPipe } from './custom.decimal.pipe';
import { EventfilterPipe } from './eventfilter.pipe';
import { ProgressNotesNursingComponent } from './progress-notes-nursing/progress-notes-nursing.component';
import { EprescriptionComponent } from './e-prescription/e-prescription.component';
import { EmarComponent } from './e-prescription/e-mar/e-mar.component';
import { EMarOrderHistoryComponent } from './e-prescription/e-mar/e-mar-order-history/e-mar-order-history.component';
import { DrugEventsAdminComponent } from './e-prescription/e-mar/e-mar-order-history/drug-events-admin/drug-events-admin.component';
import { FilterOrderStatusPipe } from './e-prescription/e-mar/e-mar-order-history/filter-order-status.pipe';
import { ConsumablesComponent } from './nurs-treatment-workarea/consumables/consumables.component';
import { ConsumablesListComponent } from './nurs-treatment-workarea/consumables/consumables-list/consumables-list.component';
import { ConsumablesHistoryComponent } from './nurs-treatment-workarea/consumables/consumables-history/consumables-history.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { AppointmentsListComponent } from './appointments-list/appointments-list.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DocumentationComponent } from './nurs-treatment-workarea/documentation/documentation.component';
import { DiagnosisHistoryPopupComponent } from './nurs-treatment-workarea/documentation/diagnosis-history-popup/diagnosis-history-popup.component';
import { ErPhysicianComponent } from './nurs-treatment-workarea/documentation/er-physician/er-physician.component';
import { MedicalReportComponent } from './nurs-treatment-workarea/documentation/medical-report/medical-report.component';
import { EducationFormComponent } from './nurs-treatment-workarea/documentation/education-form/education-form.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { OpServicesComponent } from './nurs-treatment-workarea/op-services/op-services.component';
import { FeeListService } from '@services/fee-service/fee-list.service';
import { OpServiceslistComponent } from './nurs-treatment-workarea/op-services/op-serviceslist/op-serviceslist.component';
import { OpCreateServiceComponent } from './nurs-treatment-workarea/op-services/op-serviceslist/op-create-service/op-create-service.component';
import { OpServiceHistoryComponent } from './nurs-treatment-workarea/op-services/op-serviceslist/op-service-history/op-service-history.component';
import { DataShareService } from '@services/data-share.service';
import { OutpatientNursingService } from '@services/outpatient-nursing.service';
import { ReservationComponent } from './reservation/reservation.component';
import { ReservationListComponent } from './reservation/reservation-list/reservation-list.component';
import { HistoryListComponent } from './reservation/history-list/history-list.component';
import { EmarWitnessComponent } from './e-prescription/e-mar/e-mar-order-history/drug-events-admin/emar-witness/emar-witness.component';
import { VitalSignModule } from '../shared-module/vital-sign/vital-sign.module';
import { CorrespondenceDocumentModule } from '../shared-module/correspondence-document/correspondence-document.module';
import { HistoryAssessmentModule } from '../shared-module/history-assessment/history-assessment.module';
import { CprDocumentModule } from '../shared-module/cpr-document/cpr-document.module';
import { ReceiveCartComponent } from './e-prescription/receive-cart/receive-cart.component';
import { AdminAttechmentModule } from '../shared-module/admin-attechment/admin-attechment.module';

const route: Routes = [
  {
    path: '',
    component: OutPatientNursingComponent,
  },
];

@NgModule({
  declarations: [
    OutPatientNursingComponent,
    CheckInComponent,
    ErBedComponent,
    ErVitalsComponent,
    NurErAllergyComponent,
    NursTreatmentWorkareaComponent,
    PatientProfileComponent,
    LaboratoryTableListComponent,
    RadiologyTableListComponent,
    MedicationTableListComponent,
    SurgeryTableListComponent,
    CustomDecimalPipe,
    EventfilterPipe,
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
    ProgressNotesNursingComponent,
    EprescriptionComponent,
    EmarComponent,
    EMarOrderHistoryComponent,
    DrugEventsAdminComponent,
    FilterOrderStatusPipe,
    ConsumablesComponent,
    ConsumablesListComponent,
    ConsumablesHistoryComponent,
    AppointmentsListComponent,
    DocumentationComponent,
    DiagnosisHistoryPopupComponent,
    ErPhysicianComponent,
    MedicalReportComponent,
    EducationFormComponent,
    OpServicesComponent,
    OpServiceslistComponent,
    OpCreateServiceComponent,
    OpServiceHistoryComponent,
    ReservationComponent,
    ReservationListComponent,
    HistoryListComponent,
    EmarWitnessComponent,
    ReceiveCartComponent
  ],
  providers: [EmergencyService, FeeListService,OutpatientNursingService, EPrescriptionService, HelperService, DatePipe, StorageService, ErDischargeordersService, eOrderService, WebService, EventService, CpoeService, AddministrationService, PatientHistoryService, OrdersDashboardService, UserConfigurationService, DataShareService],
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
    TabsModule.forRoot(),
    NgbModule,
    NgxExtendedPdfViewerModule,
    VitalSignModule,
    CorrespondenceDocumentModule,
    HistoryAssessmentModule,
    CprDocumentModule,
    AdminAttechmentModule
  ],


})
export class OutPatientNursingModule { }
