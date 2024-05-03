import { Injectable } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { _DeepPartialObject } from 'chart.js/types/utils';
import { ZoomPluginOptions } from 'chartjs-plugin-zoom/types/options';
import { get as _get } from 'lodash';
import * as dayjs from 'dayjs';

import { ReplaySubject } from 'rxjs';
import {
  ChartRawDataToProcess,
  VitalDetailItemGraphNode,
  VitalLineChartProcessed,
} from '../interfaces/vitals';

@Injectable({
  providedIn: 'root',
})
export class ChartVitalsService {
  /** Chart Details */
  private chartVitalSubject$ = new ReplaySubject<VitalLineChartProcessed>(1);
  public chartDetailsVital$ = this.chartVitalSubject$.asObservable();

  private zoomOptions: _DeepPartialObject<ZoomPluginOptions> = {
    // pan: {
    //   enabled: false,
    //   mode: 'x',
    //   onPanComplete(context) {
    //       console.log(context);
    //   },
    // },
    // zoom: {
    //   mode: 'x',
    //   drag: {
    //     enabled: true,
    //     borderColor: 'rgb(54, 162, 235)',
    //     borderWidth: 1,
    //     backgroundColor: 'rgba(54, 162, 235, 0.3)'
    //   },
    //   wheel: {
    //     enabled: true,
    //     speed: 1
    //   },
    //   pinch: {
    //     enabled: true
    //   },
    //   onZoomComplete({chart}) {
    //     // This update is needed to display up to date zoom level in the title.
    //     // Without this, previous zoom level is displayed.
    //     // The reason is: title uses the same beforeUpdate hook, and is evaluated before zoom.
    //     chart.update('none');
    //   }
    //}
    zoom: {
      wheel: {
        enabled: true,
      },
      pinch: {
        enabled: false,
      },
      mode: 'x',
    },
    pan: {
      enabled: true,
      mode: 'x',
      modifierKey: 'ctrl',
    },
  };

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [],
  };

  public lineChartOptions: ChartOptions<'line'> = {
    parsing: {
      yAxisKey: 'Value',
      xAxisKey: 'xAxisLabel',
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          beforeLabel: this.titleTooltipCreator,
          beforeFooter: this.footerCreator,
          label: this.labelCreator,
        },
      },
      // zoom: this.zoomOptions
    },
    elements: {
      point: {
        radius: 5,
        hoverRadius: 7,
      },
      line: {
        borderWidth: 2,
      },
    },
    responsive: false,
    scales: {
      // y: {
      //   // the data minimum used for determining the ticks is Math.min(dataMin, suggestedMin)
      //   suggestedMin: 0,
      //   // the data maximum used for determining the ticks is Math.max(dataMax, suggestedMax)
      //   suggestedMax: 160,
      // }
    },
  };

  private colorsBusinesLogic = ['#1357a6', '#FFD858'];

  private colorsAlternatives = [
    '#4dc9f6',
    '#f67019',
    '#f53794',
    '#537bc4',
    '#acc236',
    '#166a8f',
    '#00a950',
    '#58595b',
    '#8549ba',
  ];

  private RED_COLOR = 'rgb(239 68 68)';

  constructor() { }

  processDataChart(rawDataToProcess: ChartRawDataToProcess): void {
    const { rawData, vitalsRelated } = rawDataToProcess;

    let maxlongData: number = 0;
    // let labels = []

    const maxValue: number[] = [];
    const minValue: number[] = [];

    const datasets = vitalsRelated.reduce(
      (lastValue, vitalRelated, vitalIndex) => {
        const { ItemName = '', UnitText = '' } = vitalRelated;

        const _dataRelated = rawData.filter(
          ({ CatItemKey }) => CatItemKey === vitalRelated.CatItemKey
        );

        let maxValueInThisDataSet: number = 0;
        let minValueInThisDataSet: number = 0;

        const pointsBackgroundColor: string[] = [];

        const _data = _dataRelated.map((node, index) => {
          if (index == 0) {
            maxValueInThisDataSet = node.Value;
            minValueInThisDataSet = node.Value;
          }
          if (node.Value > maxValueInThisDataSet) {
            maxValueInThisDataSet = node.Value;
          }
          if (node.Value < minValueInThisDataSet) {
            minValueInThisDataSet = node.Value;
          }
          pointsBackgroundColor.push(this.getPointColor(node, vitalIndex));
          // (vitalIndex === 0) && labels.push(node.ValDateTimeUTC);
          return {
            ...node,
            ItemName: ItemName,
            UnitText: UnitText,
            xAxisLabel: '',
          };
        });

        if (_data.length > maxlongData) {
          maxlongData = _data.length;
        }

        maxValue.push(maxValueInThisDataSet);
        minValue.push(minValueInThisDataSet);

        let dataSet = {
          data: [..._data],
          tension: 0,
          label: '',
          fill: false,
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          backgroundColor: this.getColor(vitalIndex),
          borderColor: this.getColor(vitalIndex),
          pointBackgroundColor: pointsBackgroundColor,
          pointHoverBorderColor: pointsBackgroundColor,
        };

        lastValue.push(dataSet);
        return lastValue;
      },
      []
    );

    const labels = Array(maxlongData).fill('');
    // labels = Array(maxlongData).fill("")

    const unitText = _get(datasets[0], 'data[0].UnitText', '');

    const leyendMinMax = {
      min: minValue,
      max: maxValue,
      unit: unitText,
      maxLabel: maxValue.join('-'),
      minLabel: minValue.join('-'),
    };

    this.lineChartOptions.scales = {
      ...this.lineChartOptions.scales,
      y: {
        display: true,
        title: {
          display: true,
          text: unitText,
        },
      },
    };

    const lineChart: VitalLineChartProcessed = {
      lineChartData: { datasets, labels },
      lineChartOptions: this.lineChartOptions,
      leyendMinMax: leyendMinMax,
    };

    // Broadcast Data processed
    return this.chartVitalSubject$.next(lineChart);
  }

  getPointColor(node: VitalDetailItemGraphNode, vitalIndex: number): string {
    const { ValRangeType } = node;
    const isAbnormal = ['AL', 'AH', 'WL', 'WH'].includes(ValRangeType);
    if (isAbnormal) {
      return this.RED_COLOR;
    }
    return this.getColor(vitalIndex);
  }

  getColor(index: number): string {
    const color =
      this.colorsBusinesLogic[index] ||
      this.colorsAlternatives[
      Math.round(Math.random() * this.colorsAlternatives.length)
      ];
    return `${color}`;
  }

  titleTooltipCreator(tooltipItems: any) {
    const { raw = {} } = tooltipItems;
    const { ItemName = '' } = raw;
    return ` ${ItemName}`;
  }

  footerCreator(tooltipItems: any) {
    const { raw = {} } = tooltipItems[0];
    const { ValDateTimeUTC = '' } = raw;
    return ValDateTimeUTC
      ? `Date: ${dayjs(ValDateTimeUTC).format('DD.MM.YYYY HH:mm')}`
      : '';
  }

  labelCreator(tooltipItems: any) {
    console.log(tooltipItems);
    const { raw, formattedValue } = tooltipItems;
    const { UnitText } = raw;
    return ` ${formattedValue} ${UnitText}`;
  }

  textTitle(ctx: any) {
    const panStatus = () =>
      this.zoomOptions.pan.enabled ? 'enabled' : 'disabled';
    const zoomStatus = (chart: any) =>
      (this.zoomOptions.zoom.wheel.enabled ? 'enabled' : 'disabled') +
      ' (' +
      chart.getZoomLevel() +
      'x)';
    return 'Zoom: ' + zoomStatus(ctx.chart) + ', Pan: ' + panStatus();
  }
}
