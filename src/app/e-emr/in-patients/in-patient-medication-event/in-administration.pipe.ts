import { Pipe, PipeTransform } from '@angular/core';
import { DrugSchedule } from '@services/e-hospitalist/missed-medication-doses.service';

@Pipe({
  name: 'inAdministration'
})
export class InAdministrationPipe implements PipeTransform {

  transform(items: any[]): any {
    if (items && items instanceof Array && items.length) {
      const administrationData = items.filter((item) => { if (item.Color === 'eh-green-data' || item.Color === 'eh-blue-data') { return true; } return false; })
      const FilteredData: DrugSchedule[] = [];
      if (administrationData && administrationData.length) {
        const CurrentDate: Date = new Date();
        const sortingDatevise = administrationData.sort((a, b) => a.ViewOrderDate - b.ViewOrderDate);
        const previousData = sortingDatevise.filter(d => d.ViewOrderDate < CurrentDate);
        const nextData = sortingDatevise.filter(d => d.ViewOrderDate > CurrentDate);
        if (previousData && previousData.length) {
          FilteredData.push(previousData[previousData.length - 1])
        }
        if (nextData && nextData.length) {
          FilteredData.push(nextData[0])
        }
        return FilteredData;
      }
    }
  }

}
