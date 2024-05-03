import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { FloorsWardsService } from '@services/floors-wards/floors-wards.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CoreModule } from 'src/app/core/core.module';
import { FloorsWardComponent } from './floors-ward.component';
import { HospitalFloorsComponent } from './hospital-floors/hospital-floors.component';
import { TabfloorswardsComponent } from './tabfloorswards/tabfloorswards.component';

export const nursingdashboard: Routes = [
  { path: '**', component: FloorsWardComponent },
];

@NgModule({
  declarations: [
    FloorsWardComponent,
    HospitalFloorsComponent,
    TabfloorswardsComponent,
  ],
  imports: [
    CommonModule,
    CoreModule,
    RouterModule.forChild(nursingdashboard),
    BsDatepickerModule.forRoot(),
    ReactiveFormsModule,
  ],
})
export class FloorsWardModule { }
