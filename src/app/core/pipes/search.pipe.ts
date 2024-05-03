import { Pipe, PipeTransform } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

@Pipe({
  name: 'search',
})
export class SearchPipe implements PipeTransform {
  public transform(value, keys: string, term: string) {
    if (!term) return value;
    return (value || []).filter((item) =>
      keys
        .split(',')
        .some(
          (key) =>
            item.hasOwnProperty(key) && new RegExp(term, 'gi').test(item[key])
        )
    );
  }
}

@Pipe({
  name: 'searchArray',
})

export class FormArrayFilterPipe implements PipeTransform {

  transform(items: any[], searchText: string): any[] {
    if(!items) return [];
    if(!searchText) return items;

    searchText = searchText.toLowerCase();
    return items.filter( it => {
      return it?.Name?.toLowerCase().includes(searchText) || it?.Usnam?.toLowerCase().includes(searchText);
    });
  }

}


@Pipe({
  name: 'formArraySearch'
})
export class FormArrayAllFilterPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if (!items) return [];
    if (!searchText) return items;

    searchText = searchText.toLowerCase();

    return items.filter(item => {
      if (item instanceof FormControl) {
        // For FormControl
        return item.value && item.value.toString().toLowerCase().includes(searchText);
      } else if (item instanceof FormGroup || item instanceof FormArray) {
        // For FormGroup or FormArray
        // Here, you can access a specific control or property within the FormGroup or FormArray
        // For example, if you have a 'name' FormControl within the FormGroup:
        // return item.get('name').value && item.get('name').value.toLowerCase().includes(searchText);
        
        // If you want to check any control's value within FormGroup or FormArray
        // you might need to loop through its controls and check each one
        let found = false;
        Object.values(item.controls).forEach(control => {
          if (control.value && control.value.toString().toLowerCase().includes(searchText)) {
            found = true;
          }
        });
        return found;
      } else {
        // For other types of items, you can adjust the condition as needed
        return false;
      }
    });
  }
}