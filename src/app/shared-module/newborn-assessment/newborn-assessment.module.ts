import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewbornAssessmentComponent } from './newborn-assessment.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ErVitalsComponent } from './er-vitals/er-vitals.component';
import { SharedModuleModule } from '../shared-module.module';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';



@NgModule({
  declarations: [
    NewbornAssessmentComponent,
    ErVitalsComponent
  ],
  imports: [
    CommonModule,
    NgSelectModule,
    ReactiveFormsModule,
    FormsModule,
    BsDatepickerModule.forRoot(),
    SharedModuleModule,
    NgxMaterialTimepickerModule
  ],
  exports: [
    NewbornAssessmentComponent
  ]
})
export class NewbornAssessmentModule { }
