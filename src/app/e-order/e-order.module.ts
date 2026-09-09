import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { eOrderService } from '@services/eorder.service';
import { EventService } from '@services/event.service';
import { HelperService } from '@services/helper.service';
import { WebService } from '@services/web.service';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { NgxSpinnerModule } from 'ngx-spinner';
import { CoreModule } from '../core/core.module';
import { CreateEorderComponent } from './create-e-order/create-e-order.component';
import { CreateFeeOrderComponent } from './create-fee-order/create-fee-order.component';
import { EOrderFeesServiceComponent } from './e-order-fees-service/e-order-fees-service.component';
import { EOrderHistoryComponent } from './e-order-history/e-order-history.component';
import { EOrderMainComponent } from './e-order-main/e-order-main.component';
import { EOrderMedicationComponent } from './e-order-medication/e-order-medication.component';
import { EOrderNavComponent } from './e-order-nav/e-order-nav.component';
import { EOrderSearchlistComponent } from './e-order-searchlist/e-order-searchlist.component';
import { EOrderSelectComponent } from './e-order-select/e-order-select.component';
import { EOrderComponent } from './e-order.component';
import { FeeOrderHistoryComponent } from './fee-order-history/fee-order-history.component';
import { OrganizationUnitComponent } from './organization-unit/organization-unit.component';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { AddministrationService } from '@services/e-Prescription/Administration.service';
import { EPrescriptionModule } from '../e-prescription/e-prescription.module';
import { AdministrationSelectMedicineEorderComponent } from './administration-select-medicine-eorder/administration-select-medicine-eorder.component';
import { FrequencyDeftimComponent } from '../e-prescription/administration/frequency-deftim/frequency-deftim.component';
import { OrderFrequencyDeftimComponent } from './order-frequency-deftim/order-frequency-deftim.component';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { SurgeryEOrderComponent } from './e-order-main/surgery-e-order/surgery-e-order.component';
import { ConsultationOrderComponent } from './e-order-main/consultation-order/consultation-order.component';
import { AdmissionEOrderComponent } from './e-order-main/admission-e-order/admission-e-order.component';
import { OrderProfileComponent } from './e-order-main/order-profile/order-profile.component';
import { LaboratoryTableListComponent } from './e-order-main/order-profile/laboratory-table-list/laboratory-table-list.component';
import { RadiologyTableListComponent } from './e-order-main/order-profile/radiology-table-list/radiology-table-list.component';
import { SurgeryTableListComponent } from './e-order-main/order-profile/surgery-table-list/surgery-table-list.component';
import { FeeListService } from '@services/fee-service/fee-list.service';
import { ConsultationsOrdersComponent } from './e-order-main/order-profile/consultations-orders/consultations-orders.component';
// import { ConsultationsOrdersModule } from '../shared-module/consultations-orders/consultations-orders.module';

export const eOrderRoutes: Routes = [
  { path: '**', component: EOrderComponent },
];

@NgModule({
  declarations: [
    EOrderComponent,
    EOrderNavComponent,
    EOrderSearchlistComponent,
    EOrderMainComponent,
    CreateEorderComponent,
    EOrderMedicationComponent,
    EOrderHistoryComponent,
    EOrderFeesServiceComponent,
    CreateFeeOrderComponent,
    FeeOrderHistoryComponent,
    EOrderSelectComponent,
    OrganizationUnitComponent,
    AdministrationSelectMedicineEorderComponent,
    OrderFrequencyDeftimComponent,
    SurgeryEOrderComponent,
    ConsultationOrderComponent,
    AdmissionEOrderComponent,
    OrderProfileComponent,
    LaboratoryTableListComponent,
    RadiologyTableListComponent,
    SurgeryTableListComponent,
    ConsultationsOrdersComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    PerfectScrollbarModule,
    RouterModule.forChild(eOrderRoutes),
    ReactiveFormsModule,
    FormsModule,
    AccordionModule.forRoot(),
    NgSelectModule,
    TooltipModule,
    NgxSpinnerModule,
    Ng2SearchPipeModule,
    TabsModule.forRoot(),
    TimepickerModule,
    BsDropdownModule,
    BsDatepickerModule,
    NgbCollapseModule,
    NgxMaterialTimepickerModule,
    // ConsultationsOrdersModule
  ],
  providers: [eOrderService, WebService, DatePipe, EventService, HelperService, EPrescriptionService, AddministrationService, FeeListService],
})
export class EOrderModule { }
