import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminAttechmentComponent } from './admin-attechment.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';



@NgModule({
  declarations: [
    AdminAttechmentComponent
  ],
  imports: [
    CommonModule,
    NgxExtendedPdfViewerModule
  ],
  exports: [
    AdminAttechmentComponent
  ]
})
export class AdminAttechmentModule { }
