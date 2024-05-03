import { DatePipe, formatDate } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import { EPrescriptionService, MedicationData, HistoryTime, PrescriptionList, MedicationEventData, MedicationEventFilter } from '@services/e-Prescription/e-prescription.service';
import { DrugEventsAdminComponent } from './drug-events-admin/drug-events-admin.component';

@Component({
  selector: 'e-mar-order-history',
  templateUrl: './e-mar-order-history.component.html',
  styleUrls: ['./e-mar-order-history.component.scss'],
})
export class EMarOrderHistoryComponent {
  startHour: number;
  endHour: number;
  currentHour: number = new Date().getHours();

  sliderhourslide: number = 1;
  isDesableArrow: boolean;

  allMedicationData: MedicationData[] = [];
  allEventData: MedicationEventData[] = [];
  configurationData: MedicationData[] = [];
  filterConfig: MedicationEventFilter = { Administered: false, Cancelled: false, NotAdministered: false };

  startDate: Date;
  endDate: Date;
  currentDate: Date;
  isMultidate: boolean = false;
  hours: number[] = [];

  popoverIsVisible: boolean = false

  @ViewChild('drugEvents') drugEvents: DrugEventsAdminComponent;
  @Input() set medicationData(data: PrescriptionList) {
    this.processData(data.medicationData, data.eventData);
  }

  @Input() set filterData(data: MedicationEventFilter) {
    this.filterConfig = data;
    this.setCurrentDateData();
  }

  constructor(public datePipe: DatePipe, public ePrescriptionService: EPrescriptionService) { }

  processData(data: MedicationData[], events: MedicationEventData[]) {
    if (data && data.length) {
      data.forEach((item: MedicationData) => {
        item.ViewOrderDate = this.datePipe.transform(this.parseDate(item.Movdf), 'dd.MM.yyyy');
        item.TimeData = this.parseTime(item.Movtf);
        item.Schedule = [];
        for (let i = 0; i <= 23; i++) { item.Schedule.push({ Hour: i, Color: 'blank-data', Label: '', SubLabel: '' }); }
      });
      this.allMedicationData = data.sort((a, b) => a.ViewOrderDate < b.ViewOrderDate ? -1 : 1);
    }
    this.processEvents(events);
  }

  processEvents(events: MedicationEventData[]) {
    if (events && events.length) {
      events.forEach((item: MedicationEventData) => {
        item.ParsedDate = this.parseDate(item.Pbdad);
        item.TimeData = this.parseTime(item.Pbtad);
        item.Schedule = {
          Color:
            item.Mesid === '200' && item.Passtm ? "orange-data" :
              item.Mesid === '200' ? "blue-data" :
                item.Mesid === '500' ? "red-data" :
                  item.Mesid === '600' ? "green-data" :
                    item.Mesid === '400' ? 'green-data' : 'blank-data',
          Hour: item.TimeData.Hour,
          Label: `${item.TimeData.Hour > 9 ? "" + item.TimeData.Hour : "0" + item.TimeData.Hour}:${item.TimeData.Minute > 9 ? "" + item.TimeData.Minute : "0" + item.TimeData.Minute}`,
          SubLabel: item.Erusr,
        }
        if (item.Notgiven) { item.Schedule.Color = 'yellow-data'; }
      });
      this.currentDate;
      this.allEventData = events.sort((a, b) => a.ParsedDate < b.ParsedDate ? -1 : 1);
      this.startDate = this.allEventData.reduce(function (a, b) { return a.ParsedDate < b.ParsedDate ? a : b; }).ParsedDate;
      this.endDate = this.allEventData.reduce(function (a, b) { return a.ParsedDate > b.ParsedDate ? a : b; }).ParsedDate;
      this.isMultidate = this.startDate !== this.endDate;
      this.currentDate = this.startDate;
    }
    this.setCurrentDateData();
  }

  setHours() {
    this.hours = [];
    for (let i = 0; i <= 23; i++) { this.hours.push(i); }
    this.currentHour < 16 ? this.startHour = this.currentHour - 4 : this.startHour = 11;
    this.currentHour < 16 ? this.endHour = this.currentHour + 8 : this.endHour = 23;
  }

  setCurrentDateData() {
    this.setHours();
    this.configurationData = JSON.parse(JSON.stringify(this.allMedicationData));
    this.setEventDataBasedOnDate();
  }

  setEventDataBasedOnDate() {
    const todayEvents = this.allEventData.filter(d => formatDate(d.ParsedDate, 'yyyy-MM-dd', 'en_US') === formatDate(this.currentDate, 'yyyy-MM-dd', 'en_US'));
    this.configurationData.forEach(data => {
      const dataEvents = todayEvents.filter(d => d.Meordid == data.Meordid);
      if (dataEvents && dataEvents.length) {
        dataEvents.forEach(eventToSet => {
          const Schedule = data.Schedule.find(d => d.Hour == eventToSet.Schedule.Hour);
          Schedule.Color = eventToSet.Schedule.Color;
          Schedule.Label = eventToSet.Schedule.Label;
          Schedule.SubLabel = eventToSet.Schedule.SubLabel;

          const SameHourEvents = dataEvents.filter(d => d.Schedule.Hour == eventToSet.Schedule.Hour);
          if (SameHourEvents.length > 1) {
            Schedule.MultipleEvent = [];
            SameHourEvents.forEach(oEvent => {
              Schedule.MultipleEvent.push({
                Color: oEvent.Schedule.Color,
                Label: oEvent.Schedule.Label,
                SubLabel: oEvent.Schedule.SubLabel,
                Hour: eventToSet.TimeData.Hour,
                Minute: eventToSet.TimeData.Minute,
                Second: eventToSet.TimeData.Second,
              });
            });
          }
        });
      }
    });
    this.filterEvents();
  }

  nextHours() {
    let hourStart = this.startHour + this.sliderhourslide;
    let hourEnd = this.endHour + this.sliderhourslide;
    if (hourEnd <= 23) {
      this.startHour = hourStart;
      this.endHour = hourEnd;
    }
  }

  prevHours() {
    let hourStart = this.startHour - this.sliderhourslide;
    let hourEnd = this.endHour - this.sliderhourslide;
    if (hourStart >= 0) {
      this.startHour = hourStart;
      this.endHour = hourEnd;
    }
  }

  nextDate() {
    const currentDate = formatDate(this.currentDate,'yyyy-MM-dd','en_US');
    const filterData = this.allEventData.filter((d)=>{const ParsedDate =  formatDate(d.ParsedDate,'yyyy-MM-dd','en_US'); return ParsedDate >  currentDate;});
    this.currentDate = filterData && filterData.length ? filterData.reduce((a, b) => {
       return formatDate(a.ParsedDate,'yyyy-MM-dd','en_US')  < formatDate(b.ParsedDate,'yyyy-MM-dd','en_US')? a : b; }).ParsedDate : this.currentDate;
    this.setCurrentDateData();
  }

  prevDate() {
    const currentDate = formatDate(this.currentDate,'yyyy-MM-dd','en_US');
    const filterData = this.allEventData.filter((d)=>{const ParsedDate =  formatDate(d.ParsedDate,'yyyy-MM-dd','en_US'); return ParsedDate <  currentDate;});
    this.currentDate = filterData && filterData.length ? filterData.reduce((a, b) => {
       return formatDate(a.ParsedDate,'yyyy-MM-dd','en_US')  > formatDate(b.ParsedDate,'yyyy-MM-dd','en_US')? a : b; }).ParsedDate : this.currentDate;
    this.setCurrentDateData();
  }

  filterEvents() {
    const newData: MedicationData[] = [];
    if (this.filterConfig.Administered || this.filterConfig.NotAdministered || this.filterConfig.Cancelled) {
      const scheduleList = ([].concat.apply([], this.configurationData.map(d => d.Schedule))).filter(d =>
        (this.filterConfig.NotAdministered && (d.Color === 'yellow-data' || d.Color === 'blue-data' || d.Color === 'orange-data')) ||
        (this.filterConfig.Administered && d.Color === 'green-data') ||
        (this.filterConfig.Cancelled && d.Color === 'red-data')
      );

      this.hours = [];
      if (scheduleList && scheduleList.length) {
        this.hours = scheduleList.map((d: any) => d.Hour);
        this.hours = this.hours.filter((value, index) => this.hours.indexOf(value) === index)
          .sort((a: number, b: number) => a < b ? -1 : 1);
      }
      if (this.hours) {
        this.startHour = this.hours[0];
        this.endHour = this.hours[this.hours.length - 1] + 1;
      }

      this.configurationData.forEach(data => {
        const scheduleFilter = data.Schedule.filter(d =>
          (this.filterConfig.NotAdministered && (d.Color === 'yellow-data' || d.Color === 'blue-data' || d.Color === 'orange-data')) ||
          (this.filterConfig.Administered && d.Color === 'green-data') ||
          (this.filterConfig.Cancelled && d.Color === 'red-data') ||
          this.hours.filter(h => h === d.Hour).length > 0
        );

        scheduleFilter.forEach(d => {
          if (!((this.filterConfig.NotAdministered && (d.Color === 'yellow-data' || d.Color === 'blue-data' || d.Color === 'orange-data')) ||
            (this.filterConfig.Administered && d.Color === 'green-data') ||
            (this.filterConfig.Cancelled && d.Color === 'red-data'))) {
            d.Color = '';
            d.Label = '';
            d.SubLabel = '';
          }
        });

        newData.push({ ...data, Schedule: scheduleFilter });
      });
      this.configurationData = newData;
    }
  }

  parseTime(data: string): HistoryTime {
    if (data && data.length) {
      const strArr: string[] = data.split('');
      if (
        data &&
        data.length === 11 &&
        strArr[4] === 'H' &&
        strArr[7] === 'M' &&
        strArr[10] === 'S' &&
        !isNaN(+(strArr[2] + strArr[3])) &&
        !isNaN(+(strArr[5] + strArr[6])) &&
        !isNaN(+(strArr[8] + strArr[9]))
      ) {
        return {
          Extension: strArr[0] + strArr[1],
          Hour: +(strArr[2] + strArr[3]),
          Minute: +(strArr[5] + strArr[6]),
          Second: +(strArr[8] + strArr[9]),
          Formate: {
            H: strArr[4],
            M: strArr[7],
            S: strArr[10]
          }
        };
      }
    }
    return null;
  }

  parseDate(data: string): Date {
    return data ? new Date(this.datePipe.transform(data.replace(/[^0-9]/g, '').replace(/\//g, ""), 'yyyy-MM-dd')) : null;
  }
  // drug events
  openModalForDrugEvent(){
    this.drugEvents.openModalForDrugsEvents();
    }
}
