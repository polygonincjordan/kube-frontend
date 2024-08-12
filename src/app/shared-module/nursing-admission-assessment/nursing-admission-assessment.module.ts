import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NursingAdmissionAssessmentComponent } from './nursing-admission-assessment.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { PhysicianAllergyComponent } from './physician-allergy/physician-allergy.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FacePainScalePopupComponent } from './face-pain-scale/face-pain-scale-popup.component';
import { GlosGowCommaScalePopupComponent } from './glos-gow-comma-scale/glos-gow-comma-scale-popup.component';
import { NumericRatingScalePopupComponent } from './numeric-rating-scale/numeric-rating-scale-popup.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { SocialHabitComponent } from './social-habit/social-habit.component';
import { AssessmentSectionComponent } from './assessment-section/assessment-section.component';
import { OrientationSectionComponent } from './orientation-section/orientation-section.component';
import { PhysicalAssessmentSectionComponent } from './physical-assessment-section/physical-assessment-section.component';
import { MedicationSubstancesSectionComponent } from './medication-substances-section/medication-substances-section.component';
import { VaccinationExposureSectionComponent } from './vaccination-exposure-section/vaccination-exposure-section.component';
import { AdmissionDataSectionComponent } from './admission-data-section/admission-data-section.component';
import { MorseFallScaleComponent } from './morse-fall-scale/morse-fall-scale.component';
import { BradenScaleComponent } from './braden-scale/braden-scale.component';

@NgModule({
  declarations: [
    NursingAdmissionAssessmentComponent,
    PhysicianAllergyComponent,
    FacePainScalePopupComponent,
    GlosGowCommaScalePopupComponent,
    NumericRatingScalePopupComponent,
    SocialHabitComponent,
    AssessmentSectionComponent,
    OrientationSectionComponent,
    PhysicalAssessmentSectionComponent,
    MedicationSubstancesSectionComponent,
    VaccinationExposureSectionComponent,
    AdmissionDataSectionComponent,
    MorseFallScaleComponent,
    BradenScaleComponent
  ],
  exports: [NursingAdmissionAssessmentComponent],
  imports: [
    CommonModule,
    NgSelectModule,
    ReactiveFormsModule,
    FormsModule,
    BsDatepickerModule.forRoot(),
  ],
})
export class NursingAdmissionAssessmentModule {}
