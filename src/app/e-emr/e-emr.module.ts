import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartService } from './../services/chart.service';
import { EEmrService } from './../services/e-emr.service';
import { InPatientsComponent } from './in-patients/in-patients.component';
import { MyClinicComponent } from './my-clinic/my-clinic.component';
import { PatientLabComponent } from './patient-lab/patient-lab.component';
import { PatientRadComponent } from './patient-rad/patient-rad.component';
import { OrderByPipe } from './pipes/order.pipe';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { CoreModule } from '../core/core.module';
import { EmrComponent } from './e-emr.component';
import { PieChartComponent } from './pie-chart/pie-chart.component';
import { QuillModule } from 'ngx-quill';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { MySurgeriesComponent } from './my-surgeries/my-surgeries.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { weekDateGroups } from './my-surgeries/weekDateGroups.pipe';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { PatientRadReportsComponent } from './in-patients/patient-rad-reports/patient-rad-reports.component';
import { InPatientLabComponent } from './in-patients/patient-lab/patient-lab.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CalenderViewComponent } from './my-surgeries/calender-view/calender-view.component';
import { DailyViewComponent } from './my-surgeries/calender-view/daily-view/daily-view.component';
import { WeeklyViewComponent } from './my-surgeries/calender-view/weekly-view/weekly-view.component';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { MissedMedicationsDosesComponent } from '../e-hospitalist/components/missed-medications-doses/missed-medications-doses.component';
import { InPatientsMedicationsComponent } from './in-patients/in-patients-medications/in-patients-medications.component';
import { InPatientMedicationEventComponent } from './in-patients/in-patient-medication-event/in-patient-medication-event.component';
import { InNonAdminitrationPipe } from './in-patients/in-patient-medication-event/in-non-adminitration.pipe';
import { MissedMedicationDosesService } from '@services/e-hospitalist/missed-medication-doses.service';
import { InAdministrationPipe } from './in-patients/in-patient-medication-event/in-administration.pipe';
import { MonthlyViewComponent } from './my-surgeries/calender-view/monthly-view/monthly-view.component';
import { ProgressNotesComponent } from './in-patients/progress-notes-kardex/progress-notes/progress-notes.component';
import { ProgressNotesKardexComponent } from './in-patients/progress-notes-kardex/progress-notes-kardex.component';
import { ProgressNoteListComponent } from './in-patients/progress-notes-kardex/progress-notes/progress-note-list/progress-note-list.component';
import { PhysicianOrdersComponent } from './in-patients/progress-notes-kardex/physician-orders/physician-orders.component';
import { PatientHistoryService } from '@services/e-kardex/patient-history.service';
import { MyFavoritePatientsComponent } from './my-favorite-patients/my-favorite-patients.component';
import { MainHospitalistListViewComponent } from './my-favorite-patients/main-hospitalist-list-view/main-hospitalist-list-view.component';
import { MyEndoscopyComponent } from './my-endoscopy/my-endoscopy.component';
import { DocumentingDeliveryComponent } from './in-patients/documenting-delivery/documenting-delivery.component';
export const emrRoutes: Routes = [
  // { path: '**', redirectTo: 'emr', pathMatch: 'full' },
  { path: '**', component: EmrComponent },
];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CoreModule,
    ReactiveFormsModule,
    BsDropdownModule.forRoot(),
    BsDatepickerModule.forRoot(),
    NgxMaterialTimepickerModule,
    NgMultiSelectDropDownModule.forRoot(),
    Ng2SearchPipeModule,
    QuillModule.forRoot(),
    RouterModule.forChild(emrRoutes),
    NgSelectModule,
    NgbModule,
    PopoverModule
  ],
  declarations: [
    EmrComponent,
    MyClinicComponent,
    InPatientsComponent,
    PatientLabComponent,
    PatientRadComponent,
    PatientRadReportsComponent,
    InPatientLabComponent,
    PieChartComponent,
    OrderByPipe,
    MySurgeriesComponent,
    weekDateGroups,
    CalenderViewComponent,
    DailyViewComponent,
    WeeklyViewComponent,
    InPatientsMedicationsComponent,
    InPatientMedicationEventComponent,
    InNonAdminitrationPipe,
    InAdministrationPipe,
    MonthlyViewComponent,
    ProgressNotesKardexComponent,
    ProgressNoteListComponent,
    ProgressNotesComponent,
    PhysicianOrdersComponent,
    MyFavoritePatientsComponent,
    MainHospitalistListViewComponent,
    MyEndoscopyComponent,
    DocumentingDeliveryComponent
  ],
  providers: [EEmrService, ChartService, EmergencyService,EPrescriptionService,MissedMedicationDosesService,PatientHistoryService],
})
export class EmrModule { }
