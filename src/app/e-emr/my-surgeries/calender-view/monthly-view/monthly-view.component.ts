import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TimeFormat, dateHeader } from '../../my-surgeries.data';
import { HttpClient } from '@angular/common/http';
import { DatePipe, formatDate } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'monthly-view',
  templateUrl: './monthly-view.component.html',
  styleUrls: ['./monthly-view.component.scss']
})
export class MonthlyViewComponent {
 
  @Input() isSelected: boolean = false;

  @Input() days: dateHeader[] = [];
  @Input() startDate: dateHeader[] = [];
  @Input() currentMonthYear: string = "";

  @Input() currentDate: Date = new Date();

  @Input() Time: TimeFormat[] = [];
  @Input() dataArray: any[] = [];
  @Output() previousEvent: EventEmitter<any> = new EventEmitter<any>();

  @Output() nextEvent: EventEmitter<any> = new EventEmitter<any>();
  constructor(private sanitizer: DomSanitizer) {
  }
  // dataArray: any[] = [];
  ngAfterViewInit() {
    // this.dataArray=this.chunkArray(this.days,7); // Load data when component initializes
    let data:any[] = this.dataArray[1];
  }
  public previousDays() {
    this.previousEvent.emit()
  }

  public nextDays() {
    this.nextEvent.emit()
  }
  eventDetails: any;
  getEvent(value: any) {
    this.eventDetails = value;
  }

  public fnGetCalendarData(item,dayofWeek){
    
    if(item != undefined && item.date.getDay() ===  dayofWeek && item.events.length>0){
      return item;
    }
  }

  getWeekNumberOfMonth(date: Date): number {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const daysIntoFirstWeek = (7 - firstDayOfMonth.getDay() + 1) % 7;
    const dayOfMonth = date.getDate();
    return Math.ceil((dayOfMonth - daysIntoFirstWeek) / 7) + 1;
  }
  isSameDate(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }
  chunkArray(array: any[], size: number): any[][] {
    const result = [];
    
    let sortDates=array.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    let firstdate=new Date(sortDates[0].date);
    this.generateDaysInMonth(firstdate).forEach(element => {
      if(!array.some(f=>this.isSameDate(f.date,element)))
      {
        sortDates.unshift({
          date: element,
          formatedDate: formatDate(element, "YYYY-MM-dd", "en-US"),
          fulldayFormat: formatDate(element, "dd MMM, YYYY | EEEE", "en-US"),
          day: formatDate(element, "dd", "en-US"),
          dayName: formatDate(element, "EEE", "en-US"),
          dayMonth: formatDate(element, "MMM", "en-US"),
          dayYear: element.getFullYear()
        });
      }
    }); 

    
    if(firstdate.getDay()>0){
      let newDateAdded = new Date(firstdate);
      for (let i = 0; i < firstdate.getDay(); i++) {        
        newDateAdded.setTime(firstdate.getTime() - ((i+1)*24 * 60 * 60 * 1000));
        sortDates.unshift({
          date: newDateAdded,
          formatedDate: formatDate(newDateAdded, "YYYY-MM-dd", "en-US"),
          fulldayFormat: formatDate(newDateAdded, "dd MMM, YYYY | EEEE", "en-US"),
          day: formatDate(newDateAdded, "dd", "en-US"),
          dayName: formatDate(newDateAdded, "EEE", "en-US"),
          dayMonth: formatDate(newDateAdded, "MMM", "en-US"),
          dayYear: newDateAdded.getFullYear()
        });
      }
    }
    for (let i = 0; i < sortDates.length; i += size) {
      result.push(sortDates.slice(i, i + size));
    }
    return result;
  }
  
  generateDaysInMonth(firstdate) {
    const year = firstdate.getFullYear();
    const month = firstdate.getMonth();
    let daysInMonth: Date[] = []; 
    // Get the number of days in the month
    const numDays = new Date(year, month + 1, 0).getDate();

    // Generate an array of dates for each day of the month
    for (let i = 1; i <= numDays; i++) {
      daysInMonth.push(new Date(year, month, i));
    }
    return daysInMonth;
  }
  
  
}
