import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostPatientFallAssessmentComponent } from './post-patient-fall-assessment.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { SharedModuleModule } from '../shared-module.module';
import { DiagnosisTabComponent } from './diagnosis-tab/diagnosis-tab.component';
import { ErVitalsComponent } from './er-vitals/er-vitals.component';



@NgModule({
  declarations: [
    PostPatientFallAssessmentComponent,
    DiagnosisTabComponent,
    ErVitalsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    ReactiveFormsModule,
    BsDatepickerModule.forRoot(),
    NgxMaterialTimepickerModule,
    SharedModuleModule
  ],
  exports: [
    PostPatientFallAssessmentComponent
  ]
})
export class PostPatientFallAssessmentModule { }
