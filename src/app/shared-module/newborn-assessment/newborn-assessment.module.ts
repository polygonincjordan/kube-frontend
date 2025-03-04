import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewbornAssessmentComponent } from './newborn-assessment.component';



@NgModule({
  declarations: [
    NewbornAssessmentComponent,
  ],
  imports: [
    CommonModule
  ],
  exports:[
    NewbornAssessmentComponent
  ]
})
export class NewbornAssessmentModule { }
