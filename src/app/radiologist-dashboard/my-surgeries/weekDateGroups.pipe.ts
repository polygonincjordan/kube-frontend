import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'weekDateGroups'
})
export class weekDateGroups implements PipeTransform {

  transform(items: any[], groupKey: string, groupValue: any): any[] {
    if (!items || !groupKey || !groupValue) {
      return items;
    }

    return items.filter(item => item[groupKey] === groupValue);
  }

}
