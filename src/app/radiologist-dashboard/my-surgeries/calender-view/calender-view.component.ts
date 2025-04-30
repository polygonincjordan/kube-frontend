import { AfterViewInit, Component, ComponentRef, DoCheck, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { TimeFormat, dateHeader } from '../my-surgeries.data';
import { DailyViewComponent } from './daily-view/daily-view.component';
import { WeeklyViewComponent } from './weekly-view/weekly-view.component';
import { MonthlyViewComponent } from './monthly-view/monthly-view.component';

@Component({
  selector: 'calender-view',
  templateUrl: './calender-view.component.html',
  styleUrls: ['./calender-view.component.scss']
})
export class CalenderViewComponent implements AfterViewInit, OnChanges {

  @ViewChild('viewCalendar', { read: ViewContainerRef }) container: ViewContainerRef;

  private viewCalendarview: ComponentRef<any>
  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (!!this.container) {
      this.container.clear();
      this.defaultView === 'Daily' ? this.generateComponent(DailyViewComponent) : this.defaultView === 'Weekly' ? this.generateComponent(WeeklyViewComponent) :this.defaultView === 'Monthly' ? this.generateComponent(MonthlyViewComponent) : this.container.clear();
    }
  }


  ngAfterViewInit() {
    this.container.clear();
    this.defaultView === 'Daily' ? this.generateComponent(DailyViewComponent) : this.defaultView === 'Weekly' ? this.generateComponent(WeeklyViewComponent) :this.defaultView === 'Monthly' ? this.generateComponent(MonthlyViewComponent) : this.container.clear();
  }


  @Input() isSelected: boolean = false;

  @Input() days: dateHeader[] = [];
  
  @Input() dataArray: any[] = [];

  @Input() currentMonthYear: string = "";

  @Input() currentDate: Date = new Date();

  @Input() defaultView: string = "";

  @Input() Time: TimeFormat[] = [];

  @Output() previousEvent: EventEmitter<any> = new EventEmitter<any>();

  @Output() nextEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() chooseaaaPickDate: EventEmitter<any> = new EventEmitter<any>();

  generateComponent(component: any) {
    this.viewCalendarview = this.container.createComponent(component);
    this.generateExtendData();
  }

  generateExtendData() {
    this.viewCalendarview.instance.isSelected = this.isSelected;
    this.viewCalendarview.instance.days = this.days;
    this.viewCalendarview.instance.dataArray = this.dataArray;
    this.viewCalendarview.instance.currentMonthYear = this.currentMonthYear;
    this.viewCalendarview.instance.currentDate = this.currentDate;
    this.viewCalendarview.instance.Time = this.Time;
    this.viewCalendarview.instance.previousEvent.subscribe(() => {
      this.previousEvent.emit();
    })
    this.viewCalendarview.instance.nextEvent.subscribe(() => { this.nextEvent.emit(); })
    this.viewCalendarview.instance.chooseaaaPickDate.subscribe(() => { this.chooseaaaPickDate.emit(); })
  }


}
