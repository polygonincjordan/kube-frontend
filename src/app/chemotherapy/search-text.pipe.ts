import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterchemo'
})
export class SearchPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    if(!args){
      return value;
    }
    return value.filter((val)=>{
      let rVal=(val.DiagText.toLocaleLowerCase().includes(args.toLowerCase()));
      return rVal;
    })
  }
}
