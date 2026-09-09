import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeTrailingZeros'
})
export class RemoveTrailingZerosPipe {
  transform(value) {
    if (typeof value === 'string') {
      value = parseFloat(value);
      if (isNaN(value)) {
        return '';
      }
    }
    if (typeof value === 'number' && !isNaN(value)) {
      if (value % 1 === 0) {
        return value.toString();
      } else {
        return value.toString().replace(/\.0+$/, '');
      }
    }
    return value.toString();
  }
}
