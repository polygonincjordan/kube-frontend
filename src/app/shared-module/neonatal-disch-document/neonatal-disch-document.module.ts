import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NeonatalDischDocumentComponent } from './neonatal-disch-document.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { SharedModuleModule } from '../shared-module.module';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { ErVitalsComponent } from './er-vitals/er-vitals.component';



@NgModule({
  declarations: [
    NeonatalDischDocumentComponent,
    ErVitalsComponent
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
    NeonatalDischDocumentComponent
  ]
})
export class NeonatalDischDocumentModule { }
