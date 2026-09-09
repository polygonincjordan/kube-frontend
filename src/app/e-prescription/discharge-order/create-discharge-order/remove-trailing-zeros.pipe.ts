import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeTrailingZeros'
})
export class RemoveTrailingZerosPipe {

  transform(value) {
    if (typeof value === 'string') {
    //   let newValue: any = value;
    //   const strArray = newValue.split('');
    //   if (strArray[1] == '.') {
    //     const decimalPart = strArray[1].replace(/^0+/, ''); // Remove leading zeros
    //     newValue = parseFloat(strArray[2] + '.' + decimalPart);
    //     value= newValue;
    //   } else if (!strArray[1] || strArray[1] !== '.'){
    //   newValue = parseFloat(value);
    //   value= newValue;
    // }else{
    //   newValue = parseInt(strArray[0]);
    //   value =  newValue;
   const data = value.toString()
   value = parseFloat(value);
   if (isNaN(value)) {
     return '';
   }
    // }
    }
    if (typeof value === 'number') {
      if (value % 1 === 0) {
        // let newvalue = Number.isInteger(value) ? value.toFixed(0) : value.toFixed(3);
        return value.toString();
      } else {
        // let newvalue = Number.isInteger(value) ? value.toFixed(0) : value.toFixed(3);
        return value.toString().replace(/\.0+$/, '');
      }
    }
  }
}
