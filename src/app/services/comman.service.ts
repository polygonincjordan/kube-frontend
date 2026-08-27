import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CommanService {
  constructor() {}

  public isFormatDate(date: Date) {
    if (date) {
      const Month =
        date.getMonth() < 9 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
      const Year = date.getFullYear();
      const Day = date.getDate() <= 9 ? `0${date.getDate()}` : date.getDate();
      return `${Year}-${Month}-${Day}T00:00:00`;
    }
    return null;
  }
}
