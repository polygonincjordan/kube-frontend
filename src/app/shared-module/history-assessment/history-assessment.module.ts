import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FamilyHistoryComponent } from './history-assessment/family-history/family-history.component';
import { PastMedicalComponent } from './history-assessment/past-medical/past-medical.component';
import { PastSurgicalComponent } from './history-assessment/past-surgical/past-surgical.component';
import { HistoryAssessmentComponent } from './history-assessment/history-assessment.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgSelectModule } from '@ng-select/ng-select';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { AlertModule } from 'ngx-bootstrap/alert';
import { TabsModule } from 'ngx-bootstrap/tabs';



@NgModule({
  declarations: [
    FamilyHistoryComponent,
    PastMedicalComponent,
    PastSurgicalComponent,
    HistoryAssessmentComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgMultiSelectDropDownModule,
    NgSelectModule,
    ReactiveFormsModule,
    Ng2SearchPipeModule,
    BsDatepickerModule.forRoot(),
    NgxMaterialTimepickerModule,
    AccordionModule.forRoot(),
    TooltipModule.forRoot(),
    AlertModule.forRoot(),
    TabsModule.forRoot(),
  ],
  exports: [HistoryAssessmentComponent]
})
export class HistoryAssessmentModule { }
