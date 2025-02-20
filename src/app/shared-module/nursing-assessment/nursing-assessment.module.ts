import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhysicalAssessmentDocumentSectionComponent } from './physical-assessment-section/physical-assessment-section.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { GlosGowCommaScaleAssessmentPopupComponent } from './glos-gow-comma-scale/glos-gow-comma-scale-popup.component';
import { MorseFallScaleAssessmentComponent } from './morse-fall-scale/morse-fall-scale.component';
import { BradenScaleAssessmentComponent } from './braden-scale/braden-scale.component';
import { NursingAssessmentComponent } from './nursing-assessment.component';



@NgModule({
  declarations: [
    NursingAssessmentComponent,
    PhysicalAssessmentDocumentSectionComponent,
    GlosGowCommaScaleAssessmentPopupComponent,
    MorseFallScaleAssessmentComponent,
    BradenScaleAssessmentComponent,
  ],
  imports: [
    CommonModule,
    NgSelectModule,
    ReactiveFormsModule,
    FormsModule,
    BsDatepickerModule.forRoot(),
  ],
  exports: [
    NursingAssessmentComponent
  ]
})
export class NursingAssessmentModule { }
