import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InitialNursingAssessmentNewbornComponent } from './initial-nursing-assessment-newborn.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { ScalesFacePainComponent } from './scales-face-pain/scales-face-pain.component';
import { ScalesGlosgowComaComponent } from './scales-glosgow-coma/scales-glosgow-coma.component';
import { ScalesNumericRatingComponent } from './scales-numeric-rating/scales-numeric-rating.component';
import { HeadEyesPhysicalTabComponent } from './head-eyes-physical-tab/head-eyes-physical-tab.component';
import { SkinPhysicalTabComponent } from './skin-physical-tab/skin-physical-tab.component';
import { RespiratoryPhysicalTabComponent } from './respiratory-physical-tab/respiratory-physical-tab.component';
import { CardiovascularPhysicalTabComponent } from './cardiovascular-physical-tab/cardiovascular-physical-tab.component';
import { GastrointestinalPhysicalTabComponent } from './gastrointestinal-physical-tab/gastrointestinal-physical-tab.component';
import { GenitourinaryPhysicalTabComponent } from './genitourinary-physical-tab/genitourinary-physical-tab.component';



@NgModule({
  declarations: [
    InitialNursingAssessmentNewbornComponent,
    ScalesFacePainComponent,
    ScalesGlosgowComaComponent,
    ScalesNumericRatingComponent,
    HeadEyesPhysicalTabComponent,
    SkinPhysicalTabComponent,
    RespiratoryPhysicalTabComponent,
    CardiovascularPhysicalTabComponent,
    GastrointestinalPhysicalTabComponent,
    GenitourinaryPhysicalTabComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    ReactiveFormsModule,
    BsDatepickerModule.forRoot(),
    NgxMaterialTimepickerModule
  ],
  exports: [InitialNursingAssessmentNewbornComponent]
})
export class InitialNursingAssessmentNewbornModule { }
