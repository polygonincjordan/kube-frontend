import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Pipe({
  name: 'customSearch'
})
export class CustomSearchPipe implements PipeTransform {

  transform(items: any, searchText: string): any[] {
    if (!items) return [];
    if (!searchText) return items;
    return items.filter((item: AbstractControl) => {
      return String(item.value.Descrlt).toLowerCase().includes(searchText.toLowerCase());
    });
  }

}
