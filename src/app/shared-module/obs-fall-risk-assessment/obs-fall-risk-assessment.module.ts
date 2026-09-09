import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObsFallRiskAssessmentComponent } from './obs-fall-risk-assessment.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    ObsFallRiskAssessmentComponent
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  exports: [
    ObsFallRiskAssessmentComponent
  ],
})
export class ObsFallRiskAssessmentModule { }
