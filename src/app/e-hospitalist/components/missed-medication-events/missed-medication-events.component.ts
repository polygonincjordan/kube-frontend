import { DatePipe } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { HistoryTime, MedicationData, MedicationEventData, MissedMedicationDosesService, MissedMedicationList } from '@services/e-hospitalist/missed-medication-doses.service';
import { PopoverDirective } from 'ngx-bootstrap/popover';

@Component({
  selector: 'missed-medication-events',
  templateUrl: './missed-medication-events.component.html',
  styleUrls: ['./missed-medication-events.component.scss']
})
export class MissedMedicationEventsComponent implements OnInit {

  public allMedicationData: MedicationData[] = [];
  public configurationData: MedicationData[] = [];
  public SeeMoreDefaultListNumber: number = 4;
  public lfdnr = `${'00001'}`
  @ViewChild('missedpopup') public popover: PopoverDirective;
  missedMedicationList: any;
  formattedTime: string;
  Administered: string;
  constructor(public missedmedicationsdoses: MissedMedicationDosesService, public datePipe: DatePipe) { }
  ngOnInit(): void {
    if (window.innerWidth <= 1550) {
      this.SeeMoreDefaultListNumber = 3;
    }
  }
  @Input() set medicationData(data: MissedMedicationList) {
    this.processData(data.medicationData, data.eventData);
  }
  Removedata() {
    this.missedmedicationsdoses.missedMedicationList.medicationData = [];
  }

  processData(data: MedicationData[], events: MedicationEventData[]) {
    if (data && data.length) {
      data.forEach((item: MedicationData) => {
        item.ViewOrderDate = this.datePipe.transform(this.parseDate(item.Movdf), 'dd.MM.yyyy');
        item.TimeData = this.parseTime(item.Movtf);
        const EventData = events.filter(d => d.Meordid === item.Meordid);
        if (EventData && EventData.length) {
          item.Schedule = [];
          EventData.forEach((Schedule: MedicationEventData) => {
            // Schedule.ParsedDate = this.parseDate(Schedule.Pbdad);
            // Schedule.TimeData = this.parseTime(Schedule.Pbtad);
            Schedule.ParsedDate = new Date(`${this.datePipe.transform(this.parseDate(Schedule.Pbdad), "yyyy-MM-dd")}T${this.parsePtTime(Schedule.Pbtad)}`);
            Schedule.TimeData = this.parseTime(Schedule.Pbtad);
            item.Schedule.push({
              CreatedDate: this.datePipe.transform(this.parseDate(Schedule.Cycdat), 'dd.MM.yyyy'),
              CreatedTime: this.parsePtTime(Schedule.Cyctim),
              ViewOrderDate: new Date(`${this.parseDate(Schedule.Cycdat)}T${this.parsePtTime(Schedule.Cyctim)}`),
              CreatedBy: Schedule.Erusr,
              Color:
                // (Schedule.Mesid === '200' || Schedule.Mesid === '317') && Schedule.Passtm && (Schedule.ParsedDate < new Date()) ? "eh-orange-data" :
                // (Schedule.Mesid === '200' || Schedule.Mesid === '317') && (Schedule.ParsedDate > new Date()) ? "eh-blue-data" :
                (Schedule.Mesid === '200' || Schedule.Mesid === '317') && Schedule.Passtm  && (Schedule.ParsedDate < new Date()) ? "eh-orange-data" :
                  Schedule.Mesid === '200' || Schedule.Mesid === '317' && (Schedule.ParsedDate > new Date()) ? "eh-blue-data" :
                    Schedule.Mesid === '500' ? "eh-red-data" :
                      Schedule.Mesid === '600' ? "eh-green-data" :
                        Schedule.Mesid === '400' ? 'eh-green-data' :
                        Schedule.ParsedDate < new Date() ? "eh-orange-data" :
                          (Schedule.ParsedDate > new Date()) ? "eh-blue-data" : 'eh-blank-data',
              Hour: Schedule.TimeData.Hour,
              Minute: Schedule.TimeData.Minute,
              Second: Schedule.TimeData.Second,
              Label: `${Schedule.TimeData.Hour > 9 ? "" + Schedule.TimeData.Hour : "0" + Schedule.TimeData.Hour}:${Schedule.TimeData.Minute > 9 ? "" + Schedule.TimeData.Minute : "0" + Schedule.TimeData.Minute}`,
              SubLabel: Schedule.EmpRespNm,
              // Administered : Schedule.EmpRespNm,
              Administered : Schedule.Mesid === '400' || Schedule.Mesid === '600' ?  Schedule.Erusr : '',
            });
          });
          item.currentStartingIndex = 0;
          item.ScheduleLength = item.Schedule.filter(item => item.Color === 'eh-yellow-data' || item.Color === 'eh-red-data' || item.Color === 'eh-orange-data').length;
          // if (item.Schedule && item.Schedule.length) {
          //   item.SeeMoreListNumber = this.SeeMoreDefaultListNumber
          //   item.ScheduleVisible = [...item.Schedule].splice(0, this.SeeMoreDefaultListNumber);
          // }
        }
      });
      this.configurationData = data.sort((a, b) => a.ViewOrderDate < b.ViewOrderDate ? -1 : 1);

    }
  }


  // nextEventData(index: number) {
  //   if (this.configurationData && this.configurationData.length) {
  //     if (this.configurationData[index] && this.configurationData[index].Schedule && this.configurationData[index].Schedule.length) {
  //       if (this.configurationData[index].Schedule.length > this.SeeMoreDefaultListNumber) {
  //         this.configurationData[index].ScheduleVisible = [...this.configurationData[index].Schedule].splice(this.configurationData[index].SeeMoreListNumber, this.configurationData[index].SeeMoreListNumber + this.SeeMoreDefaultListNumber);
  //         this.configurationData[index].SeeMoreListNumber = this.configurationData[index].SeeMoreListNumber += this.SeeMoreDefaultListNumber
  //       }
  //     }
  //   }
  // }

  // prevEventData(index: number) {
  //   if (this.configurationData && this.configurationData.length) {
  //     if (this.configurationData[index] && this.configurationData[index].Schedule && this.configurationData[index].Schedule.length) {
  //       if (this.configurationData[index].Schedule.length > this.SeeMoreDefaultListNumber) {
  //         this.configurationData[index].SeeMoreListNumber = this.configurationData[index].SeeMoreListNumber -= this.SeeMoreDefaultListNumber
  //         this.configurationData[index].ScheduleVisible = [...this.configurationData[index].Schedule].splice(this.configurationData[index].SeeMoreListNumber - this.SeeMoreDefaultListNumber, this.configurationData[index].SeeMoreListNumber);
  //       }
  //     }
  //   }
  // }

  // processEvents(events: MedicationEventData[]) {
  //   if (events && events.length) {
  //     events.forEach((item: MedicationEventData) => {
  //       item.ParsedDate = this.parseDate(item.Pbdad);
  //       item.TimeData = this.parseTime(item.Pbtad);
  //       item.Schedule = {
  //         Color:
  //           item.Mesid === '200' && item.Passtm ? "orange-data" :
  //             item.Mesid === '200' ? "blue-data" :
  //               item.Mesid === '500' ? "red-data" :
  //                 item.Mesid === '600' ? "green-data" :
  //                   item.Mesid === '400' ? 'green-data' : 'blank-data',
  //         Hour: item.TimeData.Hour,
  //         Label: `${item.TimeData.Hour > 9 ? "" + item.TimeData.Hour : "0" + item.TimeData.Hour}:${item.TimeData.Minute > 9 ? "" + item.TimeData.Minute : "0" + item.TimeData.Minute}`,
  //         SubLabel: item.Erusr,
  //       }
  //       if (item.Notgiven) { item.Schedule.Color = 'yellow-data'; }
  //     });
  //   }
  //   this.setCurrentDateData();
  // }

  setCurrentDateData() {
    // this.setHours();
    this.configurationData = JSON.parse(JSON.stringify(this.allMedicationData));
    // this.setEventDataBasedOnDate();
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

  parsePtTime(data: string) {
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
        const hours = +(strArr[2] + strArr[3]) <= 9 ? `0${+(strArr[2] + strArr[3])}` : +(strArr[2] + strArr[3]);
        const Minute = +(strArr[5] + strArr[6]) <= 9 ? `0${+(strArr[5] + strArr[6])}` : +(strArr[5] + strArr[6]);
        const Second = +(strArr[8] + strArr[9]) <= 9 ? `0${+(strArr[8] + strArr[9])}` : +(strArr[8] + strArr[9]);
        return `${hours}:${Minute}:${Second}`
      }
    }
    return null;
  }

  parseDate(data: string) {
    return data ? this.datePipe.transform(new Date(this.datePipe.transform(data.replace(/[^0-9]/g, '').replace(/\//g, ""))), 'yyyy-MM-dd') : null;
  }

  parseDateFormate(date: any) {
    if (date !== null) {
      var StartD = "/Date(1268524800000)/";
      var num = parseInt(StartD.replace(/[^0-9]/g, ""));
    }
    return null;
  }

  RemoveDecimal(data: any) {
    return Math.floor(data);
  }
}
