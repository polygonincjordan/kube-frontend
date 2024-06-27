import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NursingCarePlansComponent } from './nursing-care-plans/nursing-care-plans.component';

@NgModule({
  declarations: [NursingCarePlansComponent],
  exports: [NursingCarePlansComponent],
  imports: [CommonModule],
})
export class NursingCarePlanDocumentModule {}
