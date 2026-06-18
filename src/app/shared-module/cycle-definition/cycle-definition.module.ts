import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CycleDefinitionPopupComponent } from './cycle-definition-popup.component';

@NgModule({
  declarations: [CycleDefinitionPopupComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BsDatepickerModule
  ],
  exports: [CycleDefinitionPopupComponent],
  providers: [DatePipe]
})
export class CycleDefinitionModule { }
