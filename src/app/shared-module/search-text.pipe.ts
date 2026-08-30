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
    return value.filter(item => {
      return Object.values(item).some(val => val?.toString().toLowerCase().includes(args.toLowerCase()));
      });
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