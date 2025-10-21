import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { CoreModule } from '../core/core.module';
import { GraphicalAnalysisComponent } from './components/graphical-analysis/graphical-analysis.component';
import { IconBoxSideMenuComponent } from './components/icon-box-side-menu/icon-box-side-menu.component';
import { IconNavTabComponent } from './components/icon-nav-tab/icon-nav-tab.component';
import { BedViewItemComponent } from './components/main-hospitalist-bed-view/bed-view-item/bed-view-item.component';
import { MainHospitalistBedViewComponent } from './components/main-hospitalist-bed-view/main-hospitalist-bed-view.component';
import { MainHospitalistListViewComponent } from './components/main-hospitalist-list-view/main-hospitalist-list-view.component';
import { InPatientDashboardComponent } from './in-patient-dashboard/in-patient-dashboard.component';
// import { HeaderComponent } from '../core/header/header.component';
import { MissedMedicationDosesService } from '@services/e-hospitalist/missed-medication-doses.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { InPatientsComponent } from './components/in-patients/in-patients.component';
import { AdministrationPipe } from './components/missed-medication-events/administration.pipe';
import { MissedMedicationEventsComponent } from './components/missed-medication-events/missed-medication-events.component';
import { MissedeventsDirective } from './components/missed-medication-events/missedevents.directive';
import { NonAdminitrationPipe } from './components/missed-medication-events/non.asminitration.pipe';
import { MissedMedicationsDosesComponent } from './components/missed-medications-doses/missed-medications-doses.component';
import { PatientLabComponent } from './components/patient-lab/patient-lab.component';
import { PatientRadReportsComponent } from './components/patient-rad-reports/patient-rad-reports.component';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { PhysicianOrderKardexComponent } from './components/main-hospitalist-list-view/physician-order-kardex/physician-order-kardex.component';
import { PhysicianOrdersComponent } from './components/main-hospitalist-list-view/physician-order-kardex/physician-orders/physician-orders.component';
import { PhysicianOrderListComponent } from './components/main-hospitalist-list-view/physician-order-kardex/orders-templates/physician-order-list/physician-order-list.component';
import { OrdersTemplatesComponent } from './components/main-hospitalist-list-view/physician-order-kardex/orders-templates/orders-templates.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { PatientHistoryService } from '@services/e-kardex/patient-history.service';
import { ProgressNotesKardexComponent } from './components/main-hospitalist-list-view/progress-notes-kardex/progress-notes-kardex.component';
import { ProgressNoteListComponent } from './components/main-hospitalist-list-view/progress-notes-kardex/progress-notes/progress-note-list/progress-note-list.component';
import { ProgressNotesComponent } from './components/main-hospitalist-list-view/progress-notes-kardex/progress-notes/progress-notes.component';
import { DocumentingDeliveryComponent } from './components/main-hospitalist-list-view/documenting-delivery/documenting-delivery.component';
import { ArrivalMainListComponent } from './components/arrival-main-list/arrival-main-list.component';
import { SurgeryWorklistTabComponent } from './components/surgery-worklist-tab/surgery-worklist-tab.component';
import { NurErAllergyComponent } from './components/surgery-worklist-tab/nur-er-allergy/nur-er-allergy.component';
import { AdminAttechmentModule } from '../shared-module/admin-attechment/admin-attechment.module';
import { ConsultationsOrdersListComponent } from './components/consultations-orders-list/consultations-orders-list.component';

export const eHospitalistRoutes: Routes = [
  { path: '**', component: InPatientDashboardComponent },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CoreModule,
    ReactiveFormsModule,
    PerfectScrollbarModule,
    NgbModule,
    BsDatepickerModule.forRoot(),
    BsDropdownModule.forRoot(),
    NgMultiSelectDropDownModule,
    Ng2SearchPipeModule,
    RouterModule.forChild(eHospitalistRoutes),
    NgxMaterialTimepickerModule,
    PopoverModule,
    NgSelectModule,
    AdminAttechmentModule
  ],
  providers: [EmergencyService, MissedMedicationDosesService, DatePipe,EPrescriptionService,PatientHistoryService],
  declarations: [
    InPatientDashboardComponent,
    IconNavTabComponent,
    IconBoxSideMenuComponent,
    MainHospitalistListViewComponent,
    MainHospitalistBedViewComponent,
    BedViewItemComponent,
    GraphicalAnalysisComponent,
    InPatientsComponent,
    PatientLabComponent,
    PatientRadReportsComponent,
    MissedMedicationsDosesComponent,
    MissedMedicationEventsComponent,
    MissedeventsDirective,
    NonAdminitrationPipe,
    AdministrationPipe,
    PhysicianOrderKardexComponent,
    PhysicianOrdersComponent,
    PhysicianOrderListComponent,
    OrdersTemplatesComponent,
    ProgressNotesKardexComponent,
    ProgressNoteListComponent,
    ProgressNotesComponent,
    DocumentingDeliveryComponent,
    ArrivalMainListComponent,
    SurgeryWorklistTabComponent,
    NurErAllergyComponent,
    ConsultationsOrdersListComponent
    // HeaderComponent
  ],
})
export class EHospitalistModule { }
