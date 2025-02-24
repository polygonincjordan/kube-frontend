import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CprDocumentComponent } from './cpr-document.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CardiopulmanaryResComponent } from './cardiopulmanary-res/cardiopulmanary-res.component';



@NgModule({
  declarations: [
    CprDocumentComponent,
    CardiopulmanaryResComponent
  ],
  imports: [
    CommonModule,
    NgSelectModule,
    ReactiveFormsModule,
    FormsModule,
    BsDatepickerModule.forRoot(),
  ],
  exports: [
    CprDocumentComponent
  ]
})
export class CprDocumentModule { }
