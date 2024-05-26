import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatTime'
})
export class FormatTimePipe implements PipeTransform {

  transform(value: string, ...args: string[]): string {
    const timeArr = value.split(':');
    
    return `PT${timeArr[0]}H${timeArr[1]}M${timeArr[2]}S`;
  }

}
