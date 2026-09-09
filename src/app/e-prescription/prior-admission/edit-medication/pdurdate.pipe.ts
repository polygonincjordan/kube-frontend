import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pdurdate'
})
export class PdurdatePipe implements PipeTransform {
  transform(value: any, ...args: unknown[]): unknown {
    if (!value) { return; }
    const startingDate = new Date(value);
    if (startingDate > new Date()) { return 'You will born in future.'; }
    const daysInMonth = [31,
      (startingDate.getFullYear() % 4 === 0 && startingDate.getFullYear() % 100 !== 0) || startingDate.getFullYear() % 400 === 0 ? 29 : 28
      , 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    let yearDiff = new Date().getFullYear() - startingDate.getFullYear();
    let monthDiff = new Date().getMonth() - startingDate.getMonth();
    let dayDiff = new Date().getDate() - startingDate.getDate();
    if (monthDiff < 0) { yearDiff--; monthDiff += 12; }
    if (dayDiff < 0) { if (monthDiff > 0) { monthDiff--; } else { yearDiff--; monthDiff = 11; } dayDiff += daysInMonth[startingDate.getMonth()]; }
    return `You are ${yearDiff > 1 ? `${yearDiff} years` : yearDiff == 1 ? `1 year` : ''}
    ${monthDiff > 1 ? `${monthDiff} months` : monthDiff == 1 ? `1 month` : ''} ${dayDiff > 1 ? `${dayDiff} days` : dayDiff == 1 ? `1 day` : ''} old.`;
  }

}
