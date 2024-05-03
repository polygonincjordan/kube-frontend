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
      return Object.keys(item.value).some(key => {
        return String(item.value[key]).toLowerCase().includes(searchText.toLowerCase());
      });
    });
  }

}
