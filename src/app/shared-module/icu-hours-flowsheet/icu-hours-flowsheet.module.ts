import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IcuHoursFlowsheetComponent } from './icu-hours-flowsheet.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BradenScaleComponent } from './braden-scale/braden-scale.component';
import { GlosGowCommaScalePopupComponent } from './glos-gow-comma-scale/glos-gow-comma-scale-popup.component';
import { MorseFallScaleComponent } from './morse-fall-scale/morse-fall-scale.component';



@NgModule({
  declarations: [
    IcuHoursFlowsheetComponent,
    BradenScaleComponent,
    GlosGowCommaScalePopupComponent,
    MorseFallScaleComponent
  ],
  imports: [
    CommonModule,
    NgSelectModule,
    ReactiveFormsModule,
    FormsModule,
    BsDatepickerModule.forRoot(),
  ],
  exports: [
    IcuHoursFlowsheetComponent
  ]
})
export class IcuHoursFlowsheetModule { }
