import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterPipe'
})
export class FilterPipePipe implements PipeTransform {
  transform(item: any, order: string, column: any) {
    return item.sort((a, b) => {
      if (column === "Descrlt" || column === "EmpRespNm") {
        if (order === "asc") {
          if (a.value[column].toLowerCase() > b.value[column].toLowerCase()) { return 1} else { return -1}
        }
        if (order === "desc") {
          if (a.value[column].toLowerCase() < b.value[column].toLowerCase()) { return 1 } else { return -1}
        }
      }
      else if (column === "StartD") {
        if (order === "asc") {
          if (a.value[column] > b.value[column]) { return 1} else { return -1}
        }
        if (order === "desc") {
          if (a.value[column] > b.value[column]) { return -1 } else { return 1 }
        }
      }
    })
  }
}




