import { CommonModule, DatePipe } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbCollapseModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { AddministrationService } from '@services/e-Prescription/Administration.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { HelperService } from '@services/helper.service';
import { AuthInterceptor } from '@services/interceptor/auth.interceptor.guard';
import { LoadingInterceptor } from '@services/interceptor/loading.interceptor.guard';
import { StorageService } from '@services/storage.service';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { deLocale } from 'ngx-bootstrap/locale';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CoreModule } from '../core/core.module';
import { AdministrationSearchSelectMedicineComponent } from './administration/administration-search-select-medicine/administration-search-select-medicine.component';
import { AdministrationSearchSelectTemplateComponent } from './administration/administration-search-select-template/administration-search-select-template.component';
import { AdministrationTemplateDetailPopupComponent } from './administration/administration-template-detail-popup/administration-template-detail-popup.component';
import { AdministrationTemplatePopupComponent } from './administration/administration-template-popup/administration-template-popup.component';
import { AdministrationTemplateEditPopupComponent } from './administration/administration-template-edit-popup/administration-template-edit-popup.component';
import { AdministrationComponent } from './administration/administration.component';
import { ComplexOrderComponent } from './administration/complex-order/complex-order.component';
import { CreateAdministrationComponent } from './administration/create-administration/create-administration.component';
import { EventsOrderComponent } from './administration/events-order/events-order.component';
import { FrequencyDeftimComponent } from './administration/frequency-deftim/frequency-deftim.component';
import { MedicationDetailsComponent } from './administration/medication-details-popup/medication-details.component';
import { AdditionInfoPopupComponent } from './discharge-order/addition-info-popup/addition-info-popup.component';
import { CreateDischargeOrderComponent } from './discharge-order/create-discharge-order/create-discharge-order.component';
import { DischargeOrderComponent } from './discharge-order/discharge-order.component';
import { MedicationPopupComponent } from './discharge-order/medication-popup/medication-popup.component';
import { PrnConditionPopupComponent } from './discharge-order/prn-condition-popup/prn-condition-popup.component';
import { SearchSelectMedicineComponent } from './discharge-order/search-select-medicine/search-select-medicine.component';
import { SearchSelectTemplateComponent } from './discharge-order/search-select-template/search-select-template.component';
import { TemplateDetailPopupComponent } from './discharge-order/template-detail-popup/template-detail-popup.component';
import { TemplatePopupComponent } from './discharge-order/template-popup/template-popup.component';
import { TemplateEditPopupComponent } from './discharge-order/template-edit-popup/template-edit-popup.component';
import { DrugEventsAdminComponent } from './e-mar/e-mar-order-history/drug-events-admin/drug-events-admin.component';
import { EMarOrderHistoryComponent } from './e-mar/e-mar-order-history/e-mar-order-history.component';
import { EmarComponent } from './e-mar/e-mar.component';
import { EprescriptionComponent } from './e-prescription.component';
import { AdditionInfoprnPopupComponent } from './prior-admission/addition-infoprn-popup/addition-infoprn-popup.component';
import { DigitDecimaNumberPrescriptionDirective } from './prior-admission/edit-medication/digit-decima-number.directive';
import { EditMedicationComponent } from './prior-admission/edit-medication/edit-medication.component';
import { EventfilterPipe } from './prior-admission/eventfilter.pipe';
import { FilterPipePipe } from './prior-admission/filter.pipe.pipe';
import { MedicationProfileEventsComponent } from './prior-admission/medication-profile-events/medication-profile-events.component';
import { MedicationTabsComponent } from './prior-admission/medication-tabs/medication-tabs.component';
import { MedicationsPopupComponent } from './prior-admission/medications-popup/medications-popup.component';
import { CustomDecimalPipe } from './prior-admission/medications-profile/custom.decimal.pipe';
import { CustomSearchPipe } from './prior-admission/medications-profile/custom.search.pipe';
import { MedicationsProfileComponent } from './prior-admission/medications-profile/medications-profile.component';
import { ModetailPanelComponent } from './prior-admission/modetail-panel/modetail-panel.component';
import { PriorAdmissionComponent } from './prior-admission/prior-admission.component';
import { TemplateDescriptionComponent } from './administration/create-administration/template-description/template-description.component';
import { EMarWitnessComponent } from './e-mar/e-mar-order-history/drug-events-admin/e-mar-witness/e-mar-witness.component';
import { SearchTextPipe } from './discharge-order/medication-popup/search-text.pipe';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FilterOrderStatusPipe } from './e-mar/e-mar-order-history/filter-order-status.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { TemplatesearchPipe } from './administration/administration-template-popup/templatesearch.pipe';
import { NumbersOnlyDirective } from './administration/complex-order/numbers-only.directive';
import { PatientService } from '@services/e-kardex/patient.service';
import { RemoveTrailingZerosPipe } from './discharge-order/create-discharge-order/remove-trailing-zeros.pipe';
import { HeaderChemoComponent } from '../chemotherapy/header-chemo/header-chemo.component';
import { ChemotherapyComponent } from '../chemotherapy/chemotherapy.component';
import { ChemoPanelComponent } from '../chemotherapy/chemo-panel/chemo-panel.component';
import { ChemoHydrationComponent } from '../chemotherapy/chemo-hydration/chemo-hydration.component';
import { ChemoDischargeComponent } from '../chemotherapy/chemo-discharge/chemo-discharge.component';
import { ClinicWebCamComponent } from '../chemotherapy/web-cam/web-cam.component';
import { WebcamModule } from 'ngx-webcam';
import { NotificationService } from '../chemotherapy/notification.service';
import { ImageCropperModule } from 'ngx-image-cropper';
import { HistoryDiagnosisComponent } from '../chemotherapy/history-diagnosis/history-diagnosis.component';
import { ChemotherapyService } from '@services/chemotherapy.service';
import { PreChemohydrationComponent } from '../chemotherapy/pre-chemohydration/pre-chemohydration.component';
import { PremedicationsComponent } from '../chemotherapy/premedications/premedications.component';
import { ChemotherapeuticBiologicComponent } from '../chemotherapy/chemotherapeutic-biologic/chemotherapeutic-biologic.component';
import { SearchPipe } from '../chemotherapy/search-text.pipe';
import { ToAdmissionComponent } from './to-admission/to-admission.component';
import { PriorToAdmissionComponent } from './to-admission/prior-to-admission/prior-to-admission.component';
import { PlannedAdministrationComponent } from './to-admission/planned-administration/planned-administration.component';
import { PriortoAdmissionlistComponent } from './prior-admission/priorto-admissionlist/priorto-admissionlist.component';
import { EditPriortoAdmissionlistComponent } from './prior-admission/priorto-admissionlist/edit-priorto-admissionlist/edit-priorto-admissionlist.component';
import { PatientProfileHistoryComponent } from './prior-admission/patient-profile-history/patient-profile-history.component';
import { PriorComplexorderComponent } from './to-admission/prior-complexorder/prior-complexorder.component';

defineLocale('de', deLocale);

export const ePrescriptionRoutes: Routes = [
  { path: '**', component: EprescriptionComponent },
];
@NgModule({
  declarations: [
    EmarComponent,
    EprescriptionComponent,
    PriorAdmissionComponent,
    AdministrationComponent,
    DischargeOrderComponent,
    EMarOrderHistoryComponent,
    CreateDischargeOrderComponent,
    MedicationPopupComponent,
    TemplatePopupComponent,
    SearchSelectMedicineComponent,
    SearchSelectTemplateComponent,
    TemplateDetailPopupComponent,
    AdditionInfoPopupComponent,
    PrnConditionPopupComponent,
    CreateAdministrationComponent,
    ComplexOrderComponent,
    MedicationDetailsComponent,
    EventsOrderComponent,
    AdministrationSearchSelectMedicineComponent,
    AdministrationSearchSelectTemplateComponent,
    AdministrationTemplatePopupComponent,
    AdministrationTemplateDetailPopupComponent,
    AdministrationTemplateEditPopupComponent,
    TemplateEditPopupComponent,
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
    DigitDecimaNumberPrescriptionDirective,
    CustomDecimalPipe,
    DrugEventsAdminComponent,
    TemplateDescriptionComponent,
    EMarWitnessComponent,
    SearchTextPipe,
    FilterOrderStatusPipe,
    TemplatesearchPipe,
    NumbersOnlyDirective,
    RemoveTrailingZerosPipe,
    HeaderChemoComponent,
    ChemotherapyComponent,
    ChemoPanelComponent,
    ChemoHydrationComponent,
    ChemoDischargeComponent,
    ClinicWebCamComponent,
    HistoryDiagnosisComponent,
    PreChemohydrationComponent,
    PremedicationsComponent,
    ChemotherapeuticBiologicComponent,
    SearchPipe,
    ToAdmissionComponent,
    PriorToAdmissionComponent,
    PlannedAdministrationComponent,
    PriortoAdmissionlistComponent,
    EditPriortoAdmissionlistComponent,
    PatientProfileHistoryComponent,
    PriorComplexorderComponent,
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
    BsDropdownModule.forRoot(),
    TimepickerModule,
    Ng2SearchPipeModule,
    PopoverModule,
    AccordionModule,
    NgbCollapseModule,
    TooltipModule,
    NgbModule,
    WebcamModule,
    ImageCropperModule,
    NgMultiSelectDropDownModule,
    NgbCollapseModule
  ],


  providers: [EPrescriptionService, HelperService, DatePipe, StorageService, AddministrationService, PatientService,NotificationService,ChemotherapyService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true }]
})
export class EPrescriptionModule { }
