import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'templatesearch'
})
export class TemplatesearchPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if(!args){
      return value;
    }
    return value.filter((val)=>{
      let rVal=(val.Descr.toLowerCase().includes(args.toLowerCase()));
      return rVal;
    })
  }
}
