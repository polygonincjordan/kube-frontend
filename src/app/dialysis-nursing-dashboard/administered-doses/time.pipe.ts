import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'time'
})
export class TimePipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): unknown {
    if(value){
      if(value.includes('PT')){
        const splitString = value.split(/(?<=[ THMS])/);
        const hours = splitString[1].slice(0,-1)
        const mins = splitString[2].slice(0,-1)
        const seconds = splitString[3].slice(0,-1)
        return `${hours}.${mins}.${seconds}`
      }else{
        return value;
      }
    }
  }

}
