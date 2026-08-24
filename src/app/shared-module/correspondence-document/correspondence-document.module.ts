import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CorrespondenceDocumentComponent } from './correspondence-document.component';



@NgModule({
  declarations: [
    CorrespondenceDocumentComponent
  ],
  exports: [CorrespondenceDocumentComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ]
})
export class CorrespondenceDocumentModule { }
