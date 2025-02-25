import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CprDocumentComponent } from './cpr-document.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CardiopulmanaryResComponent } from './cardiopulmanary-res/cardiopulmanary-res.component';
import { DiagnosisTabComponent } from './diagnosis-tab/diagnosis-tab.component';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { SharedModuleModule } from '../shared-module.module';
import { ErVitalsComponent } from './er-vitals/er-vitals.component';
import { ConditionPatientComponent } from './condition-patient/condition-patient.component';
import { ObservationComponent } from './observation/observation.component';



@NgModule({
  declarations: [
    CprDocumentComponent,
    CardiopulmanaryResComponent,
    DiagnosisTabComponent,
    ErVitalsComponent,
    ConditionPatientComponent,
    ObservationComponent
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
  exports: [
    CprDocumentComponent
  ]
})
export class CprDocumentModule { }
