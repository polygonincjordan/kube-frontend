import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeOutChecklistComponent } from './time-out-checklist.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { SharedModuleModule } from '../shared-module.module';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';



@NgModule({
  declarations: [
    TimeOutChecklistComponent
  ],
  imports: [
    CommonModule,
    NgSelectModule,
    ReactiveFormsModule,
    FormsModule,
    BsDatepickerModule.forRoot(),
    SharedModuleModule,
    NgxMaterialTimepickerModule
  ],
  exports: [
    TimeOutChecklistComponent
  ]
})
export class TimeOutChecklistModule { }
