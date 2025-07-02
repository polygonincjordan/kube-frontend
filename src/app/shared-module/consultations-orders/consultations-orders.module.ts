import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsultationsOrdersComponent } from './consultations-orders/consultations-orders.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { NgxSpinnerModule } from 'ngx-spinner';
import { PhysicianOrdersComponent } from './consultations-orders/progress-notes-kardex/physician-orders/physician-orders.component';
import { ProgressNoteListComponent } from './consultations-orders/progress-notes-kardex/progress-notes/progress-note-list/progress-note-list.component';
import { ProgressNotesComponent } from './consultations-orders/progress-notes-kardex/progress-notes/progress-notes.component';
import { ProgressNotesKardexComponent } from './consultations-orders/progress-notes-kardex/progress-notes-kardex.component';

@NgModule({
  declarations: [ConsultationsOrdersComponent, PhysicianOrdersComponent, ProgressNoteListComponent, ProgressNotesComponent, ProgressNotesKardexComponent],
  imports: [
    CommonModule,
    NgSelectModule,
    ReactiveFormsModule,
    FormsModule,
    AccordionModule.forRoot(),
    TooltipModule,
    NgxSpinnerModule,
    Ng2SearchPipeModule,
    TabsModule.forRoot(),
    TimepickerModule,
    BsDropdownModule,
    BsDatepickerModule,
    NgbCollapseModule,
    NgxMaterialTimepickerModule,
  ],
  exports: [ConsultationsOrdersComponent],
})
export class ConsultationsOrdersModule { }
