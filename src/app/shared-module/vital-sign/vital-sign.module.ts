import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErVitalsComponentComman } from './er-vitals/er-vitals.component';
import { AreaChartComponentComman } from './er-vitals/area-chart/area-chart.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [ErVitalsComponentComman, AreaChartComponentComman],
  exports: [ErVitalsComponentComman, AreaChartComponentComman],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    BsDatepickerModule.forRoot(),
    NgxMaterialTimepickerModule,
    NgSelectModule
  ],
})
export class VitalSignModule {}
