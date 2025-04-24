import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IcuHoursFlowsheetComponent } from './icu-hours-flowsheet.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';



@NgModule({
  declarations: [
    IcuHoursFlowsheetComponent
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
