import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientProfileHeaderComponent } from './patient-profile-header.component';



@NgModule({
  declarations: [
    PatientProfileHeaderComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [PatientProfileHeaderComponent]
})
export class PatientProfileHeaderModule { }
