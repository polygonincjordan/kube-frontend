import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  standalone: false
})
export class SearchTextPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    if(!args){
      return value;
    }
    return value.filter((val)=>{
      let rVal=(val.N1ztxt.toLocaleLowerCase().includes(args)) || val.Descrlt.toLocaleLowerCase().includes(args);
      return rVal;
    })
  }
}

@Pipe({
  name: 'searchProgress',
  standalone: false
})
export class SearchTextProgressNotePipe implements PipeTransform {
  transform(value: any, args?: any): any {
    if(!args){
      return value;
    }
    return value.filter((val)=>{
      let rVal= val?.Text?.toLocaleLowerCase().includes(args);
      return rVal;
    })
  }
}