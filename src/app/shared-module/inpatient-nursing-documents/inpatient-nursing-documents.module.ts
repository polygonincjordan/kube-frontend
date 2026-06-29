import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { SharedModuleModule } from '../shared-module.module';
import { NursingDischargeSummaryModule } from '../nursing-discharge-summary/nursing-discharge-summary.module';
import { CvcMaintenanceComponent } from '../../nursing-inpatient-dashboard/nurs-treatment-workarea/patient-documentation/cvc-maintenance/cvc-maintenance.component';
import { ICBundlesComponent } from '../../nursing-inpatient-dashboard/nurs-treatment-workarea/patient-documentation/ic-bundles/ic-bundles.component';
import { IntraOperativeRecordComponent } from '../../nursing-inpatient-dashboard/nurs-treatment-workarea/patient-documentation/intra-operative-record/intra-operative-record.component';

@NgModule({
  declarations: [
    CvcMaintenanceComponent,
    ICBundlesComponent,
    IntraOperativeRecordComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    BsDatepickerModule.forRoot(),
    NgxMaterialTimepickerModule,
    SharedModuleModule,
    NursingDischargeSummaryModule,
  ],
  exports: [
    CvcMaintenanceComponent,
    ICBundlesComponent,
    IntraOperativeRecordComponent,
  ],
})
export class InpatientNursingDocumentsModule {}
