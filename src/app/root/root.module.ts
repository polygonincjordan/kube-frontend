import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthEMRGuard } from '@services/interceptor/auth-emr.guard';
import { PointOfSaleGuard } from '@services/interceptor/auth-pointofsale.guard';
import { AuthGuard } from '@services/interceptor/auth.guard';
import { AuthGuardFloorHospitalist } from '@services/interceptor/auth.guard.Floor.Hospitalist';
import { AuthInterceptor } from '@services/interceptor/auth.interceptor.guard';
import { ERDashboardGuard } from '@services/interceptor/er-dashboard.guard';
import { InPatientGuard } from '@services/interceptor/in-patient.guard';
import { LoadingInterceptor } from '@services/interceptor/loading.interceptor.guard';
import { OrdersSetsGuard } from '@services/interceptor/orders-sets.guard';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { ModalModule } from 'ngx-bootstrap/modal';
import { RootComponent } from './root.component';
import { NursingEmergencyGuard } from '@services/interceptor/nursing-emergency.guard';
import { OutPatientNursingGuard } from '@services/interceptor/out-patient-nursing.guard';
import { DialysisNursingDashboardGuard } from '@services/interceptor/dialysis-nursing-dashboard.guard';
import { PatientNurseDashboardGuard } from '@services/interceptor/patient-nurse-dashboard.guard';
import { DayCaseDashboardGuard } from '@services/interceptor/day-case-dashboard.guard';
import { NursingInpatientDashboardGuard } from '@services/interceptor/nursing-inpatient-dashboard.guard';

export const rootRoutes: Routes = [
  {
    path: 'emr',
    component: RootComponent,
    canActivate: [AuthEMRGuard],
    loadChildren: () =>
      import('../e-emr/e-emr.module').then((m) => m.EmrModule),
  },
  {
    path: 'radiologist',
    component: RootComponent,
    // canActivate: [AuthEMRGuard],
    loadChildren: () =>
      import('../radiologist-dashboard/radiologist-dashboard.module').then((m) => m.RadiologistDashboardModule),
  },
  {
    path: 'radiologist-ekardex',
    // canActivate: [AuthGuard],
    component: RootComponent,
    loadChildren: () =>
      import('../radiologist-ekardex/radiologist-ekardex.module').then((m) => m.RadiologistEkardexModule),
  },
  {
    path: 'labreception-dashboard',
    // canActivate: [AuthGuard],
    component: RootComponent,
    loadChildren: () =>
      import('../labreception-dashboard/labreception-dashboard.module').then((m) => m.LabreceptionDashboardModule),
  },
  
  {
    path: 'e-order',
    canActivate: [AuthGuard],
    component: RootComponent,
    loadChildren: () =>
      import('../e-order/e-order.module').then((m) => m.EOrderModule),
  },
  {
    path: 'e-kardex',
    canActivate: [AuthGuard],
    component: RootComponent,
    loadChildren: () =>
      import('../e-kardex/e-kardex.module').then((m) => m.EKardexModule),
  },
  {
    path: 'e-prescription',
    canActivate: [AuthGuard],
    component: RootComponent,
    loadChildren: () =>
      import('../e-prescription/e-prescription.module').then(
        (m) => m.EPrescriptionModule
      ),
  },
  {
    path: 'e-hospitalist',
    component: RootComponent,
    canActivate: [InPatientGuard],
    loadChildren: () =>
      import('../e-hospitalist/e-hospitalist.module').then(
        (m) => m.EHospitalistModule
      ),
  },
  {
    path: 'in-patient-nurse-dashboard',
    component: RootComponent,
    canActivate: [PatientNurseDashboardGuard],
    loadChildren: () =>
      import(
        '../In-Patient-Nurse-Dashboard/In-Patient-Nurse-Dashboard.module'
      ).then((m) => m.InPatientNurseDashboardModule),
  },
  {
    path: 'admit-process',
    component: RootComponent,
    canActivate: [AuthGuardFloorHospitalist],
    loadChildren: () =>
      import('../admit-process/admit-process.module').then(
        (m) => m.AdmitProcessModule
      ),
  },
  {
    path: 'discharge-process',
    component: RootComponent,
    canActivate: [AuthGuardFloorHospitalist],
    loadChildren: () =>
      import('../discharge-process/discharge-process.module').then(
        (m) => m.DischargeProcessModule
      ),
  },
  {
    path: 'orders-dashboard',
    component: RootComponent,
    canActivate: [OrdersSetsGuard],
    loadChildren: () =>
      import('../user-sets-configuration/user-sets-configuration.module').then(
        (m) => m.UserSetsConfigurationModule
      ),
  },
  {
    path: 'point-of-sale',
    canActivate: [PointOfSaleGuard],
    component: RootComponent,
    loadChildren: () =>
      import('../point-of-sale/point-of-sale.module').then(
        (m) => m.PointOfSaleModule
      ),
  },
  {
    path: 'nursingdashboard',
    component: RootComponent,
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('../nursing-dashboard/nursing-dashboard.module').then(
        (m) => m.NursingDashboardModule
      ),
  },
  {
    path: 'nursing-emergncy-dashboard',
    component: RootComponent,
    canActivate: [NursingEmergencyGuard],
    loadChildren: () =>
      import(
        '../nursing-emergency-dashboard/nursing-emergency-dashboard.module'
      ).then((m) => m.NursingEmergencyDashboardModule),
  },
  {
    path: 'day-case-dashboard',
    component: RootComponent,
    canActivate: [DayCaseDashboardGuard],
    loadChildren: () =>
      import('../day-case-dashboard/day-case-dashboard.module').then(
        (m) => m.DayCaseDashboardModule
      ),
  },
  {
    path: 'nursing-inpatient-dashboard',
    component: RootComponent,
    canActivate: [NursingInpatientDashboardGuard],
    loadChildren: () =>
      import(
        '../nursing-inpatient-dashboard/nursing-inpatient-dashboard.module'
      ).then((m) => m.NursingInpatientDashboardModule),
  },
  {
    path: 'out-patient-nursing',
    component: RootComponent,
    canActivate: [OutPatientNursingGuard],
    loadChildren: () =>
      import('../out-patient-nursing/out-patient-nursing.module').then(
        (m) => m.OutPatientNursingModule
      ),
  },
  {
    path: 'dialysis-nursing-dashboard',
    component: RootComponent,
    canActivate: [DialysisNursingDashboardGuard],
    loadChildren: () =>
      import(
        '../dialysis-nursing-dashboard/dialysis-nursing-dashboard.module'
      ).then((m) => m.DialysisNursingDashboardModule),
  },
  {
    path: 'emergencydashboard',
    component: RootComponent,
    canActivate: [ERDashboardGuard],
    loadChildren: () =>
      import('../emergency-dashboard/emergency-dashboard.module').then(
        (m) => m.EmergencyDashboardModule
      ),
  },
  {
    path: 'handOverprocess',
    component: RootComponent,
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('../hand-overprocess/hand-overprocess.module').then(
        (m) => m.HandOverprocessModule
      ),
  },
  {
    path: 'login',
    component: RootComponent,
    loadChildren: () =>
      import('../login/login.module').then((m) => m.LoginModule),
  },
  {
    path: '',
    component: RootComponent,
    loadChildren: () =>
      import('../login/login.module').then((m) => m.LoginModule),
  },
];

@NgModule({
  declarations: [RootComponent],
  imports: [
    CommonModule,
    ModalModule.forRoot(),
    RouterModule.forChild(rootRoutes),
    SimpleNotificationsModule.forRoot({
      timeOut: 5000,
      clickToClose: true,
      theClass: 'outline primary',
      position: ['bottom', 'center'],
    }),
    // TranslateModule.forRoot({
    //   isolate: true,
    //   useDefaultLang: false,
    //   missingTranslationHandler: {
    //     provide: MissingTranslationHandler,
    //     useClass: MyMissingTranslationHandler,
    //   },
    //   loader: {
    //     provide: TranslateLoader,
    //     useClass: TranslationsService,
    //     deps: [DataService],
    //   },
    // }),
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
  ],
})
export class RootModule {}
