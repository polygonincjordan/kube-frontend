import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfusionAssessmentMethodComponent } from './confusion-assessment-method.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BradenScaleComponent } from './braden-scale/braden-scale.component';
import { GlosGowCommaScalePopupComponent } from './glos-gow-comma-scale/glos-gow-comma-scale-popup.component';
import { MorseFallScaleComponent } from './morse-fall-scale/morse-fall-scale.component';
import { NumericRatingScalePopupComponent } from './numeric-rating-scale/numeric-rating-scale-popup.component';
import { RamsaySedationScaleComponent } from './ramsay-sedation-scale/ramsay-sedation-scale.component';
import { RichmondScaleComponent } from './richmond-scale/richmond-scale.component';



@NgModule({
  declarations: [
    ConfusionAssessmentMethodComponent,
    BradenScaleComponent,
    GlosGowCommaScalePopupComponent,
    MorseFallScaleComponent,
    NumericRatingScalePopupComponent,
    RamsaySedationScaleComponent,
    RichmondScaleComponent
  ],
  imports: [
    CommonModule,
    NgSelectModule,
    ReactiveFormsModule,
    FormsModule,
    BsDatepickerModule.forRoot(),
  ],
  exports: [
    ConfusionAssessmentMethodComponent
  ]
})
export class ConfusionAssessmentMethodModule { }
