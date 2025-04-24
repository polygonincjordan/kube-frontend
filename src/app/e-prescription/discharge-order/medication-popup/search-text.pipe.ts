import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class SearchTextPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    if(!args){
      return value;
    }
    return value.filter((val)=>{
      let rVal=(val.N1ztxt.toLocaleLowerCase().includes(args)) || val.Descrlt.toLocaleLowerCase().includes(args.toLowerCase());
      return rVal;
    })
  }
}
