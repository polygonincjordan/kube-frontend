import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchTextPipe, SearchTextProgressNotePipe } from './search-text.pipe';


@NgModule({
  declarations: [
    SearchTextPipe,
    SearchTextProgressNotePipe
  ],
  exports: [
    SearchTextPipe,
    SearchTextProgressNotePipe
  ],
  imports: [
    CommonModule
  ]
})
export class SharedModuleModule { }
