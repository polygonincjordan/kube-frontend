import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from 'ngx-bootstrap/chronos';

@Pipe({
  name: 'eventfilter'
})
export class EventfilterPipe implements PipeTransform {

  transform(item: any, order: string, column: any): any[] {
    return item.sort((a, b) => {
      if (order === "test") {
        if (a.value[column] > b.value[column]) { return 1 } else { return -1 }
      }
      if (order === "testnu") {
        if (b.value[column] < a.value[column]) { return -1 } else { return 1 }
      }
    })
  }

}
