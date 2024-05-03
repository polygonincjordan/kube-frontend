import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customDecimal'
})
export class CustomDecimalPipe2 implements PipeTransform {
  transform(item: any): any {
    return item && parseInt(item) === Number(item) ? parseInt(item) : item;
  }
}
