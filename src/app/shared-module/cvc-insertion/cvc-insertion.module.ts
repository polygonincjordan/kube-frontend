import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CvcInsertionComponent } from './cvc-insertion.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { SharedModuleModule } from '../shared-module.module';



@NgModule({
  declarations: [
    CvcInsertionComponent
  ],
  imports: [
    CommonModule,
    NgSelectModule,
    ReactiveFormsModule,
    FormsModule,
    BsDatepickerModule.forRoot(),
    NgxMaterialTimepickerModule,
    SharedModuleModule
  ],
  exports:[
    CvcInsertionComponent
  ]
})
export class CvcInsertionModule { }
