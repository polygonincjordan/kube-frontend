import { ChartConfiguration, ChartOptions } from 'chart.js';
import * as dayjs from 'dayjs';

export interface Catalog {
  list: CatalogItem[];
}

export interface CatalogItem {
  CatItemKey?: string;
  CatKey?: string;
  IPCaseType?: boolean;
  ItemName?: string;
  SettItemName?: string;
  Display?: boolean;
  OPCaseType?: boolean;
  PairKey?: string;
  PairKeyName?: string;
  Unit?: string;
  UnitText?: string;
}

export interface VitalItem {
  CatItemKey: string;
  CatKey: string;
  ItemName: string;
  PairKey: string;
  PairKeyName: string;
  Unit: string;
  UnitText: string;
  Institution: string;
  LastValue: number;
  Patient: string;
  Ranges: any[];
  ValDateTimeUTC: string;
  ValRangeType: string;
  ValueUnit: string;
  PairVital?: VitalItem;
  isAbnormal?: boolean;
  isWarning?: boolean;
  isActive?: boolean
}

export interface VitalDetailItemGraphNode {
  AlarmHigh?: number;
  AlarmLow?: number;
  CatItemKey: string;
  CatKey: string;
  Institution: string;
  NormalHigh?: number;
  NormalLow?: number;
  Patient: string;
  ValDateTimeUTC: string;
  ValRangeType: string;
  Value: number;
  ValueId: string;
  ValueIdVers: string;
  ValueUnit: string;
  WarningHigh?: number;
  WarningLow?: number;
  xAxisLabel?: string;
  ItemName?: string;
  UnitText?: string;
}
export interface detailsVital {
  Institution: string,
  Patient: string,
  ValueId: string,
  ValueIdVers: string,
  CatKey: string,
  CatItemKey: string,
  Value: number,
  ValueUnit: string,
  ValRangeType: string,
  ValDateTimeUTC: string,
  NormalLow?: number,
  NormalHigh?: number,
  WarningLow?: number,
  WarningHigh?: number,
  AlarmLow?: number,
  AlarmHigh?: number,
}
export interface RangeTime {
  from: dayjs.ConfigType;
  to: dayjs.ConfigType;
}

export interface ChartRawDataToProcess {
  rawData: VitalDetailItemGraphNode[];
  vitalsRelated: VitalItem[];
}

export interface VitalLineChartProcessed {
  lineChartData: ChartConfiguration<'line'>['data'];
  lineChartOptions: ChartOptions<'line'>;
  leyendMinMax?: LeyendMinMax;
}

export interface LeyendMinMax {
  min: number[];
  max: number[];
  minLabel?: string;
  maxLabel?: string;
  unit: string;
}

export enum TIME_LIST {
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export enum TIME_INDEX {
  HOUR = 0,
  DAY = 1,
  WEEK = 2,
  MONTH = 3,
  YEAR = 4,
}

export interface iconRangeIndicator {
  icon?: string;
  color?: string;
  process?: string;
}
