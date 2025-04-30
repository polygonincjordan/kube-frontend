import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TimeFormat, dateHeader } from '../../my-surgeries.data';
@Component({
  selector: 'weekly-view',
  templateUrl: './weekly-view.component.html',
  styleUrls: ['./weekly-view.component.scss']
})
export class WeeklyViewComponent {
  constructor() {}

  eventArray: [] = [];
  @Input() isSelected: boolean = false;

  @Input() days: dateHeader[] = [];

  @Input() currentMonthYear: string = "";

  @Input() currentDate: Date = new Date();

  @Input() Time: TimeFormat[] = [];

  @Output() previousEvent: EventEmitter<any> = new EventEmitter<any>();

  @Output() nextEvent: EventEmitter<any> = new EventEmitter<any>();

  public previousDays() {
    this.previousEvent.emit()
  }
  
  public nextDays() {
    this.nextEvent.emit()
  }
}
