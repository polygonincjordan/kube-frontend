import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiagnosisTableComponent } from './surgery-operation-note/diagnosis-table/diagnosis-table.component';
import { SurgeryOperationNoteComponent } from './surgery-operation-note/surgery-operation-note.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { SharedModuleModule } from '../shared-module.module';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [SurgeryOperationNoteComponent, DiagnosisTableComponent],
  imports: [
    CommonModule,
    NgSelectModule,
    ReactiveFormsModule,
    FormsModule,
    BsDatepickerModule.forRoot(),
    SharedModuleModule,
    NgxMaterialTimepickerModule,
  ],
  exports: [SurgeryOperationNoteComponent],
})
export class SurgeryOperationNoteModule {}
