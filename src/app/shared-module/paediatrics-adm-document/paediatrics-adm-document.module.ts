import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaediatricsAdmDocumentComponent } from './paediatrics-adm-document.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { AdmissionDataSectionComponent } from './admission-data-section/admission-data-section.component';
import { PhysicianAllergyComponent } from './physician-allergy/physician-allergy.component';
import { BradenScaleComponent } from './braden-scale/braden-scale.component';
import { GlosGowCommaScalePopupComponent } from './glos-gow-comma-scale/glos-gow-comma-scale-popup.component';
import { MorseFallScaleComponent } from './morse-fall-scale/morse-fall-scale.component';
import { ErVitalsComponent } from './er-vitals/er-vitals.component';
import { SharedModuleModule } from '../shared-module.module';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { MedicationSubstancesSectionComponent } from './medication-substances-section/medication-substances-section.component';
import { VaccinationExposureSectionComponent } from './vaccination-exposure-section/vaccination-exposure-section.component';
import { PsychologicalEconomicComponent } from './psychological-economic/psychological-economic.component';
import { PhysicalAssessmentSectionComponent } from './physical-assessment-section/physical-assessment-section.component';



@NgModule({
  declarations: [
    PaediatricsAdmDocumentComponent,
    AdmissionDataSectionComponent,
    PhysicianAllergyComponent,
    BradenScaleComponent,
    GlosGowCommaScalePopupComponent,
    MorseFallScaleComponent,
    ErVitalsComponent,
    MedicationSubstancesSectionComponent,
    VaccinationExposureSectionComponent,
    PsychologicalEconomicComponent,
    PhysicalAssessmentSectionComponent
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
    PaediatricsAdmDocumentComponent
  ]
})
export class PaediatricsAdmDocumentModule { }
