import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Events, TimeFormat, dateHeader } from '../../my-surgeries.data';
import { PopoverConfig, PopoverDirective } from 'ngx-bootstrap/popover';
import { FormControl, FormGroup } from '@angular/forms';
import { DatePipe, formatDate } from '@angular/common';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { UserConfig } from '@services/e-kardex/interfaces/user-config';
import { StorageService } from '@services/storage.service';

@Component({
  selector: 'daily-view',
  templateUrl: './daily-view.component.html',
  styleUrls: ['./daily-view.component.scss']
})
export class DailyViewComponent {
  selectedDate = new Date();
  public getUserConfigData: UserConfig;
  public timeArray: TimeFormat[] = [];
  constructor(private ePrescriptionService: EPrescriptionService,public storageService: StorageService) {
    
    }
  @Input() isSelected: boolean = false;
  @Input() days: dateHeader[] = [];

  @Input() currentMonthYear: string = "";

  @Input() currentDate: Date = new Date();

  @Input() Time: TimeFormat[] = [];

  @Output() previousEvent: EventEmitter<any> = new EventEmitter<any>();

  @Output() nextEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() chooseaaaPickDate = new EventEmitter();
  public defaultView: FormGroup = new FormGroup({ currentView: new FormControl('Weekly') });

  public previousDays() {
    this.previousEvent.emit()
  }
  public nextDays() {
    this.nextEvent.emit()
  }
  

  public selectPickDate(value: any) { 
    this.selectedDate = value;
    this.storageService.setMySurgerySelectedDate(value);
    this.chooseaaaPickDate.emit();
  }

  formatDateWithWeekday(date: any): any {
    const weekday = formatDate(date, 'EEEE', 'en-US');
    return weekday;
  }
 

}
