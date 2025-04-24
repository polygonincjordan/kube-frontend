import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { IcBundleAdultVentilatorComponent } from './ic-bundle-adult-ventilator.component';



@NgModule({
  declarations: [
    IcBundleAdultVentilatorComponent
  ],
  imports: [
    CommonModule,
    NgSelectModule,
    ReactiveFormsModule,
    FormsModule,
    BsDatepickerModule.forRoot(),
  ],
  exports: [
    IcBundleAdultVentilatorComponent
  ]
})
export class IcBundleAdultVentilatorModule { }
