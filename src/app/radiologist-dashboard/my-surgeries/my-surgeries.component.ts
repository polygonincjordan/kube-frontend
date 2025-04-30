import { DatePipe, formatDate } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { UserConfigurationService } from '@services/e-kardex/user-configuration.service';
import { Events, TimeFormat, dateHeader } from './my-surgeries.data';
import { FormControl, FormGroup } from '@angular/forms';
import { UserConfig } from '@services/e-kardex/interfaces/user-config';
import { StorageService } from '@services/storage.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'my-surgeries',
  templateUrl: './my-surgeries.component.html',
  styleUrls: ['./my-surgeries.component.scss']
})
export class MySurgeriesComponent {
  public currentDate: Date = new Date()
  public selectedDate: Date = new Date();
  public days: dateHeader[] = [];
  public dataArray: any[] = [];
  public groupedData: any;
  public currentMonthYear: string = "";
  public events: Events[] = [];
  public surgeryView: string[] = ['Daily', 'Weekly', 'Monthly'];
  public defaultView: FormGroup = new FormGroup({ currentView: new FormControl('Daily') });
  private daysViewCount: number = 1;
  public isSelected: boolean = true;
  public timeArray: TimeFormat[] = [];
  public getUserConfigData: UserConfig;
  @Output() fileExcelDataEvent: EventEmitter<any> = new EventEmitter<any>();

  @Output() public dataCount = new EventEmitter<any>();
  constructor(private ePrescriptionService: EPrescriptionService, private datePipe: DatePipe, private userConfigurationService: UserConfigurationService,public storageService: StorageService) { }

  ngOnInit(): void {
    this.userConfigurationService.getUserConfigData().subscribe((resp) => {
      this.getUserConfigData = resp;
      this.getDays(this.selectedDate);
    })
  }

  onChangeView() {
    if (this.defaultView.get('currentView').value === 'Weekly') {
      this.selectedDate = new Date(); this.daysViewCount = 7; this.getDays(this.selectedDate)
    } else if (this.defaultView.get('currentView').value === 'Daily') {
      this.selectedDate = new Date(); this.daysViewCount = 1; this.getDays(this.selectedDate);
    }else if (this.defaultView.get('currentView').value === 'Monthly') {
      this.selectedDate = new Date(); this.daysViewCount = 11; this.getDays(this.selectedDate);
    }
    // this.groupedData = this.groupByCategory(this.days);
  }


  groupByCategory(data: any[]) {
    return data.reduce((acc, obj) => {
      const key = obj.dayName;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(obj);
      return acc;
    }, {});
  }
  getDays(date: Date) {
    this.days = [];
    this.dataArray = [];
    const startDate = new Date(date);
    if (this.defaultView.get('currentView').value === "Weekly")
     {
      startDate.setDate(startDate.getDate() - startDate.getDay());
     }
     else if (this.defaultView.get('currentView').value === "Monthly"){
      startDate.setDate(startDate.getDate()- parseInt(startDate.toLocaleString('en', { day: '2-digit' }))+1);
      this.daysViewCount=new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
    }
    for (let i = 0; i < this.daysViewCount; i++) {
      const currentDate = new Date(startDate);
      this.days.push({
        date: currentDate,
        formatedDate: formatDate(currentDate, "YYYY-MM-dd", "en-US"),
        fulldayFormat: formatDate(currentDate, "dd MMM, YYYY | EEEE", "en-US"),
        day: formatDate(currentDate, "dd", "en-US"),
        dayName: formatDate(currentDate, "EEE", "en-US"),
        dayMonth: formatDate(currentDate, "MMM", "en-US"),
        dayYear: currentDate.getFullYear(),
        active: this.selectedDate
      });
      startDate.setDate(startDate.getDate() + 1);
    }
    this.loadSurgeryStatus();
    if (this.days[0].dayMonth === this.days[this.days.length - 1].dayMonth) {
      this.currentMonthYear = `${this.days[0].dayMonth} ${this.days[0].dayYear}`
    } else {
      this.currentMonthYear = `${this.days[0].dayMonth} ${this.days[0].dayYear} - ${this.days[this.days.length - 1].dayMonth} ${this.days[this.days.length - 1].dayYear}`
    }
  //   if (this.days[0].dayMonth === this.days[this.days.length - 1].dayMonth) {
  //     this.currentMonthYear = `${formatDate(this.days[0].date, 'MMMM yyyy', 'en-US')}`;
  // } else {
  //     this.currentMonthYear = `${formatDate(this.days[0].date, 'MMMM yyyy', 'en-US')} - ${formatDate(this.days[this.days.length - 1].date, 'MMMM yyyy', 'en-US')}`;
  // }
  }

  previousDays() {
    this.getDays(new Date(this.selectedDate.setDate(this.selectedDate.getDate() - this.daysViewCount)))

  }

  nextDays() {
    this.getDays(new Date(this.selectedDate.setDate(this.selectedDate.getDate() + this.daysViewCount)))

  }

  chooseaaaPickDate() {
    this.selectedDate=new Date(this.storageService.getMySurgerySelectedDate());
    this.getDays(new Date(this.selectedDate))
    this.loadSurgeryStatus();
  }

  loadSurgeryStatus() {
    // `e-prescription/SurgeryStatus?Einri=${'1000'}&Fromdatetime=2020-04-29T00:00:00&Todatetime=2020-06-29T23:59:59&SurgResp=${'9000000000'}`
    // `e-prescription/SurgeryStatus?Einri=${'1000'}&Fromdatetime=${startDate}&Todatetime=${endDate}&SurgResp=${'9000000000'}`
    let startDate: string = "";
    let endDate: string = "";
    // if (this.defaultView.get('currentView').value === 'Monthly') {
    //   startDate = `${this.days[0].formatedDate}T00:00:00`;
    //   endDate = `${this.days[0].formatedDate}T23:59:59`;
    // } else {

    // }
    startDate = `${this.days[0].formatedDate}T00:00:00`;
    endDate = `${this.days[this.days.length - 1].formatedDate}T23:59:59`;

    this.ePrescriptionService.loadData(`e-prescription/SurgeryStatus?Einri=${'1000'}&Fromdatetime=${startDate}&Todatetime=${endDate}&SurgResp=${this.getUserConfigData.VMA}`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        resp.body.d.results.forEach((element: Events) => {
          element.Fromdatetime = this.sanitizeSAPDateFormat(element.Fromdatetime);
          element.AppEndDatetime = this.sanitizeSAPDateFormat(element.AppEndDatetime);
          element.AppStartDatetime = this.sanitizeSAPDateFormat(element.AppStartDatetime);
          element.Todatetime = this.sanitizeSAPDateFormat(element.Todatetime);
          element.Color = element.StatusColor === 'O' ? "sr-orange-data" : element.StatusColor === 'P' ? "sr-blue-data" : element.StatusColor === 'C' ? "sr-red-data" : element.StatusColor === 'G' ? "sr-green-data" : element.StatusColor === 'B' ? "sr-blank-data" : ''
        })

      }
      this.days.forEach((element) => { element.events = resp.body.d.results && resp.body.d.results.length ? resp.body.d.results.filter(item => formatDate(item.Fromdatetime, "YYYY-MM-dd", "en-US") === formatDate(element.date, "YYYY-MM-dd", "en-US")) : [] })
      this.timeArray.forEach((element) => {
        element.events = resp.body.d.results && resp.body.d.results.length ? resp.body.d.results.filter(item => formatDate(item.Fromdatetime, "hh:mm a", "en-US") === element.ConvertedTime && formatDate(item.Fromdatetime, "YYYY-MM-dd", "en-US") === this.days[0].formatedDate) : []
      })

      if (this.defaultView.get('currentView').value === 'Daily') {
        this.dataCount.emit(resp.body?.d?.results?.length);
    }
    });
    this.generatedTimeDisplay();
    this.dataArray = [];
    if (this.defaultView.get('currentView').value === 'Monthly') {
      this.dataArray=this.chunkArray(this.days,7);
    }
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
          dayYear: element.getFullYear(),
          active: this.selectedDate
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
          dayYear: newDateAdded.getFullYear(),
          active: this.selectedDate
        });
      }
    }
    for (let i = 0; i < sortDates.length; i += size) {
      result.push(sortDates.slice(i, i + size));
    }
    return result;
  }

  isSameDate(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
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
  sanitizeSAPDateFormat(date: any): Date {
    if (date) { return new Date(new DatePipe('en-US').transform(date.replace('/Date(', '').replace(')/', ''), 'yyyy-MM-dd HH:mm:ss')); }
  }
  resetfilterData() {
    if (this.defaultView.get('currentView').value === 'Weekly') {
      this.selectedDate = new Date(); this.daysViewCount = 7; this.getDays(this.selectedDate)
    } else if (this.defaultView.get('currentView').value === 'Daily') {
      this.selectedDate = new Date(); this.daysViewCount = 1; this.getDays(this.selectedDate);
    }else if (this.defaultView.get('currentView').value === 'Monthly') {
      this.selectedDate = new Date(); this.daysViewCount = 11; this.getDays(this.selectedDate);
    }
  }
  getEventArray(mainArray: any[]): any[] {
    const eventArray: any[] = [];
    mainArray.forEach(item => {
      eventArray.push(...item.events);
    });
    return eventArray;
  }
  exportToExcel(nameofFile: string = 'Surgery List', fileExtention: string = 'xlsx'): void {
    const eventArray = this.getEventArray(this.days);
    const mappedEvents = eventArray.map(event => ({
      Date: this.datePipe.transform(event.Fromdatetime, 'yyyy-MM-dd'),
      Fromdatetime: this.datePipe.transform(event.Fromdatetime, 'HH:mm:ss')  + "-" + this.datePipe.transform(event.Todatetime, 'HH:mm:ss'),
      Patnr: event.Patnr,
      Nname: event.Nname + " " + event.Vname,
      Age: event.Age,
      Gender: event.Gender,
      SurgSrvDescr: event.SurgSrvDescr,
      Baukb: event.Baukb,
      SurgassistRespNam: event.SurgassistRespNam,
    }));
    let Heading = [['Date', 'Time' , 'MRN','Full Name','Age','Gender','Surgery Name','Room','Assistant Surgeon']];
    const workbook = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws, Heading);
    XLSX.utils.sheet_add_json(ws, mappedEvents, { origin: 'A2', skipHeader: true });
    XLSX.utils.book_append_sheet(workbook, ws, "test");
    XLSX.writeFile(workbook, `${nameofFile}.${fileExtention}`);
  }
  generatedTimeDisplay() {
    this.timeArray = [];
    for (let hours = 7; hours <= 23; hours++) {
      const formattedHours = hours.toString().padStart(2, '0');
      for (let minutes = 0; minutes < 60; minutes++) {
        const formattedMinutes = minutes.toString().padStart(2, '0');
        this.timeArray.push({
          Time: `${formattedHours}:${formattedMinutes}`,
          ConvertedTime: formatDate(new Date(`${formatDate(new Date(), "YYYY-MM-dd", "en-US")}T${formattedHours}:${formattedMinutes}`), "hh:mm a", "en-US"),
          Hours: `${formattedHours}`,
          Minutes: `${formattedMinutes}`
        });
      }
    }
  }
}
