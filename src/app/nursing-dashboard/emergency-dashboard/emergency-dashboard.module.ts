import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { EmergencyDashboardComponent } from './emergency-dashboard.component';
import { OrdersTemplatesComponent } from './treatment-workarea/orders-templates/orders-templates.component';
import { PhysicianOrdersComponent } from './treatment-workarea/physician-orders/physician-orders.component';
import { TreatmentWorkareaComponent } from './treatment-workarea/treatment-workarea.component';
//phy order
import { NgSelectModule } from '@ng-select/ng-select';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { HelperService } from '@services/helper.service';
import { StorageService } from '@services/storage.service';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
//import { ProgressNotesComponent } from './progress-notes/progress-notes.component';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { AddministrationService } from '@services/e-Prescription/Administration.service';
import { CpoeService } from '@services/emergency-dashboard/cpoe.service';
import { ErDischargeordersService } from '@services/emergency-dashboard/er-dischargeorders.service';
import { eOrderService } from '@services/eorder.service';
import { EventService } from '@services/event.service';
import { WebService } from '@services/web.service';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { QuillModule } from 'ngx-quill';
import { NgxSpinnerModule } from 'ngx-spinner';
import { CoreModule } from 'src/app/core/core.module';
import { FloorsWardModule } from '../floors-ward/floors-ward.module';
import { ErVitalsComponent } from './checkin-list/er-vitals/er-vitals.component';
import { AdministrationSearchSelectMedicineComponent } from './e-prescription/administration/administration-search-select-medicine/administration-search-select-medicine.component';
import { AdministrationSearchSelectTemplateComponent } from './e-prescription/administration/administration-search-select-template/administration-search-select-template.component';
import { AdministrationTemplateDetailPopupComponent } from './e-prescription/administration/administration-template-detail-popup/administration-template-detail-popup.component';
import { AdministrationTemplatePopupComponent } from './e-prescription/administration/administration-template-popup/administration-template-popup.component';
import { AdministrationTemplateEditPopupComponent } from './e-prescription/administration/administration-template-edit-popup/administration-template-edit-popup.component';
import { AdministrationComponent } from './e-prescription/administration/administration.component';
import { ComplexOrderComponent } from './e-prescription/administration/complex-order/complex-order.component';
import { CreateAdministrationComponent } from './e-prescription/administration/create-administration/create-administration.component';
import { EventsOrderComponent } from './e-prescription/administration/events-order/events-order.component';
import { FrequencyDeftimComponent } from './e-prescription/administration/frequency-deftim/frequency-deftim.component';
import { MedicationDetailsComponent } from './e-prescription/administration/medication-details-popup/medication-details.component';
import { AdditionInfoPopupComponent } from './e-prescription/discharge-order/addition-info-popup/addition-info-popup.component';
import { CreateDischargeOrderComponent } from './e-prescription/discharge-order/create-discharge-order/create-discharge-order.component';
import { DischargeOrderComponent } from './e-prescription/discharge-order/discharge-order.component';
import { MedicationPopupComponent } from './e-prescription/discharge-order/medication-popup/medication-popup.component';
import { PrnConditionPopupComponent } from './e-prescription/discharge-order/prn-condition-popup/prn-condition-popup.component';
import { SearchSelectMedicineComponent } from './e-prescription/discharge-order/search-select-medicine/search-select-medicine.component';
import { SearchSelectTemplateComponent } from './e-prescription/discharge-order/search-select-template/search-select-template.component';
import { TemplateDetailPopupComponent } from './e-prescription/discharge-order/template-detail-popup/template-detail-popup.component';
import { TemplatePopupComponent } from './e-prescription/discharge-order/template-popup/template-popup.component';
import { TemplateEditPopupComponent } from './e-prescription/discharge-order/template-edit-popup/template-edit-popup.component';
import { DrugEventsAdminComponent } from './e-prescription/e-mar/e-mar-order-history/drug-events-admin/drug-events-admin.component';
import { EMarOrderHistoryComponent } from './e-prescription/e-mar/e-mar-order-history/e-mar-order-history.component';
import { EmarComponent } from './e-prescription/e-mar/e-mar.component';
import { EprescriptionComponent } from './e-prescription/e-prescription.component';
import { AdditionInfoprnPopupComponent } from './e-prescription/prior-admission/addition-infoprn-popup/addition-infoprn-popup.component';
import { DigitDecimaNumberEmergencyDirective } from './e-prescription/prior-admission/edit-medication/digit-decima-number.directive';
import { EditMedicationComponent } from './e-prescription/prior-admission/edit-medication/edit-medication.component';
import { EventfilterPipe } from './e-prescription/prior-admission/eventfilter.pipe';
import { FilterPipePipe } from './e-prescription/prior-admission/filter.pipe.pipe';
import { MedicationProfileEventsComponent } from './e-prescription/prior-admission/medication-profile-events/medication-profile-events.component';
import { MedicationTabsComponent } from './e-prescription/prior-admission/medication-tabs/medication-tabs.component';
import { MedicationsPopupComponent } from './e-prescription/prior-admission/medications-popup/medications-popup.component';
import { CustomDecimalPipe } from './e-prescription/prior-admission/medications-profile/custom.decimal.pipe';
import { CustomSearchPipe } from './e-prescription/prior-admission/medications-profile/custom.search.pipe';
import { MedicationsProfileComponent } from './e-prescription/prior-admission/medications-profile/medications-profile.component';
import { ModetailPanelComponent } from './e-prescription/prior-admission/modetail-panel/modetail-panel.component';
import { PriorAdmissionComponent } from './e-prescription/prior-admission/prior-admission.component';
import { ErHistoryComponent } from './er-history/er-history.component';
import { CpoeComponent } from './treatment-workarea/cpoe/cpoe.component';
import { CreateEorderComponent } from './treatment-workarea/cpoe/create-e-order/create-e-order.component';
import { EmerCommentsComponent } from './treatment-workarea/cpoe/create-e-order/emer-comments/emer-comments.component';
import { CreateFeeOrderComponent } from './treatment-workarea/cpoe/create-fee-order/create-fee-order.component';
import { EOrderFeesServiceComponent } from './treatment-workarea/cpoe/e-order-fees-service/e-order-fees-service.component';
import { EOrderHistoryComponent } from './treatment-workarea/cpoe/e-order-history/e-order-history.component';
import { EOrderEmergencyComponent } from './treatment-workarea/cpoe/e-order-main/e-order-emergency/e-order-emergency.component';
import { EOrderMainComponent } from './treatment-workarea/cpoe/e-order-main/e-order-main.component';
import { EOrderMedicationComponent } from './treatment-workarea/cpoe/e-order-medication/e-order-medication.component';
import { EOrderNavComponent } from './treatment-workarea/cpoe/e-order-nav/e-order-nav.component';
import { EOrderSearchlistComponent } from './treatment-workarea/cpoe/e-order-searchlist/e-order-searchlist.component';
import { EOrderSelectComponent } from './treatment-workarea/cpoe/e-order-select/e-order-select.component';
import { FeeOrderHistoryComponent } from './treatment-workarea/cpoe/fee-order-history/fee-order-history.component';
import { OrganizationUnitComponent } from './treatment-workarea/cpoe/organization-unit/organization-unit.component';
import { DiagnosisListComponent } from './treatment-workarea/diagnosis/diagnosis-list/diagnosis-list.component';
import { DiagnosisComponent } from './treatment-workarea/diagnosis/diagnosis.component';
import { SearchSelectDiagnosisCodeComponent } from './treatment-workarea/diagnosis/search-select-diagnosis-code/search-select-diagnosis-code.component';
import { DocumentationComponent } from './treatment-workarea/documentation/documentation.component';
import { ErPhysicianComponent } from './treatment-workarea/documentation/er-physician/er-physician.component';
import { OrderDetailsComponent } from './treatment-workarea/order-details/order-details.component';
import { PhysicianOrderListComponent } from './treatment-workarea/orders-templates/physician-order-list/physician-order-list.component';
import { ProgressNoteListComponent } from './treatment-workarea/progress-notes/progress-note-list/progress-note-list.component';
import { ProgressNotesComponent } from './treatment-workarea/progress-notes/progress-notes.component';
import { CheckinListComponent } from './checkin-list/checkin-list.component';



export const emergencyDashboard: Routes = [
  // { path: '**', redirectTo: 'emr', pathMatch: 'full' },
  { path: '**', component: EmergencyDashboardComponent },
];
@NgModule({
  declarations: [
    EmergencyDashboardComponent,
    TreatmentWorkareaComponent,
    CheckinListComponent, PhysicianOrdersComponent, OrdersTemplatesComponent, ProgressNotesComponent, ProgressNoteListComponent, PhysicianOrderListComponent, CpoeComponent, OrderDetailsComponent, ErHistoryComponent, DischargeOrderComponent, CreateDischargeOrderComponent,
    MedicationPopupComponent, TemplatePopupComponent,
    SearchSelectMedicineComponent, SearchSelectTemplateComponent,
    TemplateDetailPopupComponent, AdditionInfoPopupComponent, PrnConditionPopupComponent, DiagnosisComponent, DiagnosisListComponent, SearchSelectDiagnosisCodeComponent, EOrderNavComponent, EOrderSearchlistComponent, EOrderMainComponent, CreateEorderComponent, EOrderMedicationComponent, EOrderHistoryComponent, EOrderFeesServiceComponent, CreateFeeOrderComponent, FeeOrderHistoryComponent, EOrderSelectComponent, OrganizationUnitComponent,
    EmarComponent,
    EprescriptionComponent,
    PriorAdmissionComponent,
    AdministrationComponent,
    EMarOrderHistoryComponent,
    CreateAdministrationComponent,
    ComplexOrderComponent,
    MedicationDetailsComponent,
    EventsOrderComponent,
    AdministrationSearchSelectMedicineComponent,
    AdministrationSearchSelectTemplateComponent,
    AdministrationTemplatePopupComponent,
    AdministrationTemplateEditPopupComponent,
    TemplateEditPopupComponent,
    AdministrationTemplateDetailPopupComponent,
    MedicationsProfileComponent,
    FrequencyDeftimComponent,
    AdditionInfoprnPopupComponent,
    MedicationTabsComponent,
    FilterPipePipe,
    EventfilterPipe,
    MedicationsPopupComponent,
    MedicationProfileEventsComponent,
    CustomSearchPipe,
    EditMedicationComponent,
    ModetailPanelComponent,
    DigitDecimaNumberEmergencyDirective,
    CustomDecimalPipe,
    DrugEventsAdminComponent,
    ErVitalsComponent,
    DocumentationComponent,
    EOrderEmergencyComponent,
    EmerCommentsComponent,
    ErPhysicianComponent,
  ],
  providers: [EmergencyService, EPrescriptionService, HelperService, DatePipe, StorageService, ErDischargeordersService, eOrderService, WebService, EventService, CpoeService, AddministrationService],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(emergencyDashboard),
    CoreModule,
    CarouselModule,
    NgSelectModule,
    BsDatepickerModule.forRoot(),
    Ng2SearchPipeModule,
    PopoverModule,
    NgxMaterialTimepickerModule,
    QuillModule.forRoot(),
    PerfectScrollbarModule,
    AccordionModule.forRoot(),
    TooltipModule,
    NgxSpinnerModule,
    TabsModule.forRoot(),
    NgbCollapseModule,
    TimepickerModule,
  ]
})
export class EmergencyDashboardModule { }
