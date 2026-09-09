import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HandOverprocessComponent } from './hand-overprocess.component';
import { RouterModule, Routes } from '@angular/router';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HandServicesComponent } from './hand-services/hand-services.component';
import { FormsModule } from '@angular/forms';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { HandMedicationComponent } from './hand-medication/hand-medication.component';

export const handOverprocess: Routes = [
  { path: '**', component: HandOverprocessComponent },
];

@NgModule({
  declarations: [
    HandServicesComponent,
    HandOverprocessComponent,
    HandMedicationComponent

  ],
  imports: [
    CommonModule,
    NgbModule,
    PopoverModule.forRoot(),
    RouterModule.forChild(handOverprocess),
    FormsModule,
    BsDatepickerModule.forRoot(),
  ],
})
export class HandOverprocessModule { }
