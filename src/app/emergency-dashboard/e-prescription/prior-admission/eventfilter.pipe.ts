import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from 'ngx-bootstrap/chronos';

@Pipe({
  name: 'eventfilter'
})
export class EventfilterPipe implements PipeTransform {

  transform(item: any, order: string, column: any): any[] {
    return item.sort((a, b) => {
      if (order === "test") {
        if (formatDate(a.value[column], "DD.MM.YYYY") > formatDate(b.value[column], "DD.MM.YYYY")) { return 1 } else { return -1 }
      }
      if (order === "testnu") {
        if (formatDate(b.value[column], "DD.MM.YYYY") < formatDate(a.value[column], "DD.MM.YYYY")) { return -1 } else { return 1 }
      }
    })
  }

}
