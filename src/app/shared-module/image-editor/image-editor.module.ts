import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageEdittorComponent } from './image-edittor/image-edittor.component';

@NgModule({
  declarations: [ImageEdittorComponent],
  exports: [ImageEdittorComponent],
  imports: [CommonModule],
})
export class ImageEditorModule {}
