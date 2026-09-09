import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaediatricPhysicianAssessmentComponent } from './paediatric-physician-assessment.component';
import { AdmissionDataSectionComponent } from './admission-data-section/admission-data-section.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModuleModule } from '../shared-module.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { PhysicianAllergyComponent } from './physician-allergy/physician-allergy.component';
import { ErVitalsComponent } from './er-vitals/er-vitals.component';
import { VaccinationExposureSectionComponent } from './vaccination-exposure-section/vaccination-exposure-section.component';
import { PsychologicalEconomicComponent } from './psychological-economic/psychological-economic.component';
import { PhysicalAssessmentSectionComponent } from './physical-assessment-section/physical-assessment-section.component';
import { ExaminationTabComponent } from './examination-tab/examination-tab.component';
import { AssessmentTabComponent } from './assessment-tab/assessment-tab.component';



@NgModule({
  declarations: [
    PaediatricPhysicianAssessmentComponent,
    AdmissionDataSectionComponent,
    PhysicianAllergyComponent,
    ErVitalsComponent,
    VaccinationExposureSectionComponent,
    PsychologicalEconomicComponent,
    PhysicalAssessmentSectionComponent,
    ExaminationTabComponent,
    AssessmentTabComponent
  ],
  imports: [
    CommonModule,
    NgSelectModule,
    ReactiveFormsModule,
    SharedModuleModule,
    FormsModule,
    BsDatepickerModule.forRoot(),
    NgxMaterialTimepickerModule
  ],
  exports: [
    PaediatricPhysicianAssessmentComponent
  ]
})
export class PaediatricPhysicianAssessmentModule { }
