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

  parseWcfDate(wcfDateStr: string | null): Date | null {
    if (!wcfDateStr) return null;
    const matches = wcfDateStr.match(/\/Date\((\d+)\)\//);
    if (matches && matches[1]) {
      return new Date(parseInt(matches[1], 10));
    }
    return null;
  }

  formatToWcfDate(date: Date | null): string | null {
    if (!date) return null;
    return `/Date(${date.getTime()})/`;
  }

  parseIsoDuration(
    duration: string | null
  ): { hour: number; minute: number; second: number } | null {
    if (!duration) return null;
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const matches = duration.match(regex);

    if (!matches) return null;

    return {
      hour: parseInt(matches[1] || '0', 10),
      minute: parseInt(matches[2] || '0', 10),
      second: parseInt(matches[3] || '0', 10),
    };
  }

  formatToIsoDuration(hours: number, minutes: number, seconds: number): string {
    const h = String(hours).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');
    const s = String(seconds).padStart(2, '0');
    return `PT${h}H${m}M${s}S`;
  }
}
