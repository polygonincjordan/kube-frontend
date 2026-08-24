import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClinicComponent } from './clinic.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { RouterModule, Routes } from '@angular/router';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { EEmrService } from '@services/e-emr.service';

export const Clinic: Routes = [
  { path: '**', component: ClinicComponent },
];


@NgModule({
  declarations: [ClinicComponent],
  imports: [
    CommonModule,
    NgbModule,
    NgMultiSelectDropDownModule,
    FormsModule,
    BsDatepickerModule.forRoot(),
    Ng2SearchPipeModule,
    RouterModule.forChild(Clinic)
  ],
  providers: [EEmrService],
})
export class ClinicdashboardModule { }
