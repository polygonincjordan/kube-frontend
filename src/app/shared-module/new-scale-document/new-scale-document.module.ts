import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewScaleDocumentComponent } from './new-scale-document.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';



@NgModule({
  declarations: [
    NewScaleDocumentComponent
  ],
  imports: [
    CommonModule,
    NgSelectModule,
    ReactiveFormsModule,
    FormsModule,
    BsDatepickerModule.forRoot(),
  ], 
  exports: [
    NewScaleDocumentComponent
  ],
})
export class NewScaleDocumentModule { }
