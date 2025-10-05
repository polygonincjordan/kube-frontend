import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { FloorsWardsService } from '@services/floors-wards/floors-wards.service';
import { AuthGuard } from '@services/interceptor/auth.guard';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NursingDashboardComponent } from './nursing-dashboard.component';
// import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

const route: Routes = [
  {
    path: '',
    component: NursingDashboardComponent,
    children: [
      {
        path: 'floorward',
        canActivate: [AuthGuard],
        loadChildren: () => import('./floors-ward/floors-ward.module').then((m) => m.FloorsWardModule),
      },
      {
        path: 'emergency',
        canActivate: [AuthGuard],
        loadChildren: () => import('./emergency-dashboard/emergency-dashboard.module').then((m) => m.EmergencyDashboardModule),
      },
      {
        path: 'Clinic',
        canActivate: [AuthGuard],
        loadChildren: () => import('./my-clinic/clinicdashboard.module').then((m) => m.ClinicdashboardModule),
      }
    ]
  }
]
@NgModule({
  declarations: [NursingDashboardComponent],
  imports: [
    CommonModule,
    // NgMultiSelectDropDownModule.forRoot(),
    ReactiveFormsModule,
    BsDatepickerModule,
    RouterModule.forChild(route),
    NgbModule

  ],
  providers: [FloorsWardsService],
})
export class NursingDashboardModule { }
