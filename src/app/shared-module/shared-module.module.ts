import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchTextPipe } from './search-text.pipe';


@NgModule({
  declarations: [
    SearchTextPipe,
  ],
  exports: [
    SearchTextPipe
  ],
  imports: [
    CommonModule
  ]
})
export class SharedModuleModule { }
