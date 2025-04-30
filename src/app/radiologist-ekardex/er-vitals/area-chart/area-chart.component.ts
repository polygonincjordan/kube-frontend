import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Chart } from 'chart.js';
import { Colors } from '@services/colors.service';

@Component({
  selector: 'area-chart',
  templateUrl: './area-chart.component.html',
})
export class AreaChartComponent implements OnDestroy, OnInit {
  @Input() data;
  @Input() UnitText;
  @Input() chartDatalabel;
  @Input() shadow = false;
  @Input() options;
  @Input() labelDate;
  @Input() ChartData
  @Input() backgroundColorArray;
  @Input() set datass(data: any[]) {
    
  }
  @Input() class = 'chart-container';
  @ViewChild('chart', { static: true }) chartRef: ElementRef;

  chart: Chart;
  // @Input() chartData: any = [];
  ngOnInit() {
    this.initChart();
  }

 
  public constructor() {}

  initChart() {
    if (this.shadow) {
      Chart.defaults.lineWithShadow = Chart.defaults.line;
      Chart.controllers.lineWithShadow = Chart.controllers.line.extend({
        draw(ease): any {
          Chart.controllers.line.prototype.draw.call(this, ease);
          const chartCtx = this.chart.ctx;
          chartCtx.save();
          chartCtx.shadowColor = 'rgba(0,0,0,0.15)';
          chartCtx.shadowBlur = 10;
          chartCtx.shadowOffsetX = 0;
          chartCtx.shadowOffsetY = 10;
          chartCtx.responsive = true;
          chartCtx.stroke();
          Chart.controllers.line.prototype.draw.apply(this, arguments);
          chartCtx.restore();
        },
      });
    }
    
    
    const chartRefEl = this.chartRef.nativeElement;
    const ctx = chartRefEl.getContext('2d');
    this.chart = new Chart(ctx, {
      type: this.shadow ? 'lineWithShadow' : 'line',
      data: {
        labels: ['', '', '', '', '', '', '', '', ''],
        // dataset: this.getDataSetValue(data),
        datasets: [
          {
            data: this.ChartData[0] ? this.ChartData[0] :[],
            additionalData: this.chartDatalabel,
            label: this.UnitText,
            borderColor: Colors.getColors().primaryColor,
            pointBackgroundColor: this.backgroundColorArray,
            pointBorderColor: Colors.getColors().themeColor1,
            pointHoverBackgroundColor: Colors.getColors().themeColor1,
            pointHoverBorderColor: Colors.getColors().foregroundColor,
            // pointRadius: 0,
            // pointBorderWidth: 0,
            // pointHoverRadius: 0,
            fill: false,
            // borderline: [5, 5],
            borderWidth: 2,
            borderRadius: 1,
            backgroundColor: Colors.getColors().themeColor1_10,
          },
          {
            data: this.ChartData[1] ? this.ChartData[1] :[],
            additionalData: this.chartDatalabel,
            label: this.UnitText,
            borderColor: Colors.getColors().multipleColor,
            pointBackgroundColor: this.backgroundColorArray,
            pointBorderColor: Colors.getColors().themeColor1,
            pointHoverBackgroundColor: Colors.getColors().themeColor1,
            pointHoverBorderColor: Colors.getColors().foregroundColor,
            fill: false,
            borderline: [5, 5],
            borderWidth: 2,
            borderRadius: 1,
            backgroundColor: Colors.getColors().themeColor1_10,
          },
        ],
      },
      options: this.options,
     
    });
  }

  getDataSetValue(currentData) {    
    let dataset: any = currentData;
    return dataset;
  }

  ngAfterContentInit(): void {
    // if (this.shadow) {
    //   Chart.defaults.lineWithShadow = Chart.defaults.line;
    //   Chart.controllers.lineWithShadow = Chart.controllers.line.extend({
    //     draw(ease): any {
    //       Chart.controllers.line.prototype.draw.call(this, ease);
    //       const chartCtx = this.chart.ctx;
    //       chartCtx.save();
    //       chartCtx.shadowColor = 'rgba(0,0,0,0.15)';
    //       chartCtx.shadowBlur = 10;
    //       chartCtx.shadowOffsetX = 0;
    //       chartCtx.shadowOffsetY = 10;
    //       chartCtx.responsive = true;
    //       chartCtx.stroke();
    //       Chart.controllers.line.prototype.draw.apply(this, arguments);
    //       chartCtx.restore();
    //     }
    //   });
    // }
    // const chartRefEl = this.chartRef.nativeElement;
    // const ctx = chartRefEl.getContext('2d');
    // this.chart = new Chart(ctx, {
    //   type: this.shadow ? 'lineWithShadow' : 'line',
    //   data: {
    //     labels: ['', '', '', '', '', '', '', '', ''],
    //     datasets: [
    //       {
    //         label: '',
    //         data: this.Chart,
    //         borderColor: Colors.getColors().themeColor1,
    //         pointBackgroundColor: Colors.getColors().foregroundColor,
    //         pointBorderColor: Colors.getColors().themeColor1,
    //         pointHoverBackgroundColor: Colors.getColors().themeColor1,
    //         pointHoverBorderColor: Colors.getColors().foregroundColor,
    //         // pointRadius: 0,
    //         // pointBorderWidth: 0,
    //         // pointHoverRadius: 0,
    //         fill: false,
    //         // borderline: [5, 5],
    //         borderWidth: 2,
    //         borderRadius: 1,
    //         backgroundColor: Colors.getColors().themeColor1_10,
    //       },
    //     ],
    //   },
    //   options: this.options,
    // });
    // new Chart(
    //   document.getElementById('acquisitions'),
    //   {
    //     type: this.shadow ? 'lineWithShadow' : 'line',
    //     data: {
    //       labels: this.array.map(row => row.year),
    //       datasets: [
    //         {
    //           label: 'Acquisitions by year',
    //           data: this.array.map(row => row.count)
    //         }
    //       ]
    //     },
    //     options: this.options
    //   }
    // );
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.chartDatalabel && changes.chartDatalabel.currentValue) {
      this.initChart();
    }
    this.initChart();
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
