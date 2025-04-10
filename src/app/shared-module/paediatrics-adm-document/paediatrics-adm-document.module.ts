import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaediatricsAdmDocumentComponent } from './paediatrics-adm-document.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { AdmissionDataSectionComponent } from './admission-data-section/admission-data-section.component';



@NgModule({
  declarations: [
    PaediatricsAdmDocumentComponent,
    AdmissionDataSectionComponent
  ],
  imports: [
    CommonModule,
    NgSelectModule,
    ReactiveFormsModule,
    FormsModule,
    BsDatepickerModule.forRoot(),
  ],
  exports: [
    PaediatricsAdmDocumentComponent
  ]
})
export class PaediatricsAdmDocumentModule { }
