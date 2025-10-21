import { CommonModule, DatePipe } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { AddministrationService } from '@services/e-Prescription/Administration.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { HelperService } from '@services/helper.service';
import { AuthInterceptor } from '@services/interceptor/auth.interceptor.guard';
import { LoadingInterceptor } from '@services/interceptor/loading.interceptor.guard';
import { StorageService } from '@services/storage.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { QuillModule } from 'ngx-quill';
import { CoreModule } from '../core/core.module';
// import { DigitDecimaNumberUserSetDirective } from './digit-decima-number.directive';
import { OrderConfigurationCreateComponent } from './order-configuration-create/order-configuration-create.component';
import { OrderCreateStepThreeComponent } from './order-configuration-create/order-create-step-three/order-create-step-three.component';
import { OrderSetsConfigurationComponent } from './order-sets-configuration/order-sets-configuration.component';
import { InputTextComponent } from './order-sets-configuration/order-show-detail/input-text/input-text.component';
import { OrderShowDetailComponent } from './order-sets-configuration/order-show-detail/order-show-detail.component';
import { DiagnosisOrderComponent } from './order-configuration-create/order-create-step-three/diagnosis-order/diagnosis-order.component';
import { PhysicianOrderSetComponent } from './order-configuration-create/order-create-step-three/physician-order-set/physician-order-set.component';
import { ClinicalOrdersComponent } from './order-configuration-create/order-create-step-three/clinical-orders/clinical-orders.component';
import { MedicationOrdersComponent } from './order-configuration-create/order-create-step-three/medication-orders/medication-orders.component';
import { SurgeryOrdersComponent } from './order-configuration-create/order-create-step-three/surgery-orders/surgery-orders.component';
import { AdmissionOrdersComponent } from './order-configuration-create/order-create-step-three/admission-orders/admission-orders.component';

export const ePrescriptionRoutes: Routes = [
  { path: '', component: OrderSetsConfigurationComponent },
  { path: 'order-create', component: OrderConfigurationCreateComponent },
];

@NgModule({
  declarations: [
    OrderSetsConfigurationComponent,
    OrderConfigurationCreateComponent,
    OrderShowDetailComponent,
    InputTextComponent,
    OrderCreateStepThreeComponent,
    // DigitDecimaNumberUserSetDirective,
    DiagnosisOrderComponent,
    PhysicianOrderSetComponent,
    ClinicalOrdersComponent,
    MedicationOrdersComponent,
    SurgeryOrdersComponent,
    AdmissionOrdersComponent
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
  ],
  providers: [HelperService, DatePipe, StorageService, EPrescriptionService, AddministrationService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true }]
})
export class UserSetsConfigurationModule { }
