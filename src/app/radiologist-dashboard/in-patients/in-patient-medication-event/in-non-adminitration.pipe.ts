import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'inNonAdminitration'
})
export class InNonAdminitrationPipe implements PipeTransform {

  transform(items: any[], start?: number, end?: number): any {
    if (items && items instanceof Array && items.length) {
      return items.filter(item => item.Color === 'eh-yellow-data' || item.Color === 'eh-red-data' || item.Color === 'eh-orange-data').slice(start, end);
    }
  }

}
