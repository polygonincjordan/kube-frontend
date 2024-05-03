import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LeyendIndicatorService {
  // Leyend
  // NR -> Normal  -> Color Green -> icon dot (.)
  // WL -> Warning Low -> Color Yellow -> arrow down
  // WH -> Warning High -> Color Yellow -> arrow up
  // AL -> Alarm Low -> Color Red -> arrow down
  // AH -> Alarm High -> Color Red -> arrow up

  private mapLeyendValues: {
    [K: string]: { readonly icon: string; readonly color: string };
  } = {
    NR: {
      icon: '',
      color: '',
    },
    WL: {
      icon: 'down',
      color: 'text-orange-500',
    },
    WH: {
      icon: 'up',
      color: 'text-orange-500',
    },
    AL: {
      icon: 'down',
      color: 'text-red-500',
    },
    AH: {
      icon: 'up',
      color: 'text-red-500',
    },
  };

  constructor() {}

  getByKey(key: string) {
    return this.mapLeyendValues[key];
  }

  isAbnormal(key: string): boolean {
    return ['AL', 'AH'].includes(key);
  }

  isWarning(key: string): boolean {
    return ['WH', 'WL'].includes(key);
  }
}
