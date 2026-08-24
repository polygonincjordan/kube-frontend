import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NIPSDocumentComponent } from '../nips-document/nips-document.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';



@NgModule({
  declarations: [
    NIPSDocumentComponent
  ],
  imports: [
    CommonModule,
    NgSelectModule,
    ReactiveFormsModule,
    FormsModule,
    BsDatepickerModule.forRoot(),
  ],
  exports: [
    NIPSDocumentComponent
  ],
})
export class NIPSDocumentModule { }
