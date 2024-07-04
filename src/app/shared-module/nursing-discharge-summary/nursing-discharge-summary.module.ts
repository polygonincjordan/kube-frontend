import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NursingDischargeSummaryComponent } from './nursing-discharge-summary.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DischargePlanTabComponent } from './discharge-plan-tab/discharge-plan-tab.component';
import { DischargeDetailsTabComponent } from './discharge-details-tab/discharge-details-tab.component';
import { DiagnosisTabComponent } from './diagnosis-tab/diagnosis-tab.component';
import { MaternalVaccinationTabComponent } from './maternal-vaccination-tab/maternal-vaccination-tab.component';
import { EnvironmentalSafetyTabComponent } from './environmental-safety-tab/environmental-safety-tab.component';
import { ImportDiagnosisComponent } from './diagnosis-tab/import-diagnosis/import-diagnosis.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { SearchTextPipe } from 'src/app/e-prescription/discharge-order/medication-popup/search-text.pipe';

@NgModule({
  declarations: [
    NursingDischargeSummaryComponent,
    DischargePlanTabComponent,
    DischargeDetailsTabComponent,
    DiagnosisTabComponent,
    MaternalVaccinationTabComponent,
    EnvironmentalSafetyTabComponent,
    ImportDiagnosisComponent,
  ],
  exports: [NursingDischargeSummaryComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    ReactiveFormsModule,
    BsDatepickerModule.forRoot(),
    NgxMaterialTimepickerModule
  ],
})
export class NursingDischargeSummaryModule {}
