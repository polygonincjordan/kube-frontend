import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RamsaySedationScaleComponent } from './ramsay-sedation-scale.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';



@NgModule({
  declarations: [
    RamsaySedationScaleComponent
  ],
  imports: [
    CommonModule,
    NgSelectModule,
    ReactiveFormsModule,
    FormsModule,
    BsDatepickerModule.forRoot(),
  ],
  exports: [
    RamsaySedationScaleComponent
  ]
})
export class RamsaySedationScaleModule { }
