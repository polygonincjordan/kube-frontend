import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { EPrescriptionService, HistoryTime } from '@services/e-Prescription/e-prescription.service';
import { DatePipe } from '@angular/common';
import { formatDate } from 'ngx-bootstrap/chronos';
import { OrdersDashboardService } from '@services/orders-dashboard/orders-dashboard.service';
import { ChangeDetectionStrategy } from '@angular/core';
import { OutpatientNursingService } from '@services/outpatient-nursing.service';
@Component({
  selector: 'appointments-list',
  templateUrl: './appointments-list.component.html',
  styleUrls: ['./appointments-list.component.scss'],
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppointmentsListComponent implements OnInit {
  public day = [];
  public selectedOptions: any[] = [];
  public bsInlineRangeValue: Date[];
  public assignUsersList: any;
  // public assignUsersList: any[] = [];
  public selectedDate: Date = new Date();
  public pernrs: any;
  public allEventData: any[];
  public allAppointmentData: any[];
  public configurationData: any[];
  public currentDate: Date = new Date();
  public startDate: Date;
  public endDate: Date;
  public doctorDelete: any;
  public storedUser: any;
  constructor(private ePrescriptionService: EPrescriptionService, private datePipe: DatePipe,public outpatientNursingService:OutpatientNursingService ,private cdr: ChangeDetectorRef) {
    this.bsInlineRangeValue = [this.currentDate, this.currentDate]
    this.appointmentsSet(this.bsInlineRangeValue);

  }

  ngOnInit(): void {
    // this.getAssignSurgeonList();
  }

  appointmentsSet(event) {
    this.currentDate = event[0];
    if (this.ePrescriptionService.valueStory) {
      this.selectedOptions = this.ePrescriptionService.valueStory;
    }
    this.storedUser = JSON.parse(localStorage.getItem('UserConfiguration'));
    if(this.storedUser){
      this.selectedOptions.push(this.storedUser.AttendPhyNm);
    }
    this.loadDataForDisplayedDate(event, this.selectedOptions);
  }

  // removeDuplicates(array: any[], property: string) {
  //   return array.filter((obj, index, self) =>
  //     index === self.findIndex((o) => o[property] === obj[property])
  //   );
  // }

  loadDataForDisplayedDate(date, value?) {
    if (value && value.length) {
      var item = this.outpatientNursingService.assignUsersList.filter(item => value.includes(item.NamString));
      this.doctorDelete = item;
    } else {
      this.doctorDelete = value;
    }

    // this.assignUsersList = this.removeDuplicates(this.assignUsersList, 'NamString');


    if (!date.length) {
      const apiCalls = [];
      apiCalls.push(item);
      let key: any = [];
      apiCalls.forEach((res) => { key.push(res?.map((key) => `${key.Gpart}`)) });
      const doctorKeys = key.flat();
      var pernrs = doctorKeys.map(key => `Pernr=${key ? key : ''}`).join('OR');
      this.pernrs = pernrs;
    }
    this.ePrescriptionService.loadData(`e-prescription/ApptgetSet?${this.pernrs}&Tmndtge=${this.parseDate(date[0] ? date[0] : date)}&Tmndtle=${this.parseDate(date[1] ? date[1] : date)}&$format=json`, false, false, false, false).subscribe({
      next: (resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results) {
          this.allEventData = resp.body.d.results;
          this.processData(this.allEventData);
        }
      },
    });
  }

  processData(data: any) {
    data.forEach((item) => {
      item.parseDate = new Date(`${this.ParsedDate(this.parseDatedata(item.Tmndt))}T${this.parsePtTime(item.Tmnzt, "HH:mm:ss")}`);
      item.parseTime = this.parsePtTime(item.Tmnzt, "HH:mm");
    });
    this.allAppointmentData = data.sort((a, b) => a.parseDate < b.parseDate ? -1 : 1);
    this.currentDate;
    if (this.allAppointmentData && this.allAppointmentData.length) {
      this.startDate = this.allAppointmentData.reduce(function (a, b) { return a.parseDate < b.parseDate ? a : b; }).parseDate;
      this.endDate = this.allAppointmentData.reduce(function (a, b) { return a.parseDate > b.parseDate ? a : b; }).parseDate;
      this.currentDate = this.startDate;
      this.setDoctorDataBasedOnDate(this.currentDate);
    }
  }

  setDoctorDataBasedOnDate(currentDate: Date) {
    this.configurationData = this.allAppointmentData.filter(d => this.datePipe.transform(d.parseDate, 'YYYY-MM-dd') === this.datePipe.transform(currentDate, 'YYYY-MM-dd'));
    this.configurationData.forEach((item) => {
      item.Doctors = [];
      if (this.selectedOptions && this.selectedOptions.length) {
        for (let i = 0; this.selectedOptions.length > i; i++) {
          item.Doctors.push({ ApptType: "", Patnr: "", PatnrName: "", StatuText: "", Color: "", DoctorKey: this.selectedOptions[i].Gpart, DoctorValue: this.selectedOptions[i].NamString });
        }
      }
    })
    this.filterDoctorEvents();
  }

  filterDoctorEvents() {
    this.configurationData = this.allEventData.filter(d => this.datePipe.transform(d.parseDate, 'YYYY-MM-dd') === this.datePipe.transform(this.currentDate, 'YYYY-MM-dd'));
    this.configurationData.forEach((element) => {
      if (element.Doctors && element.Doctors.length > 0) {
        const doctor = element.Doctors[0];
        if (doctor) {
          doctor.ApptType = element?.ApptType;
          doctor.Patnr = element?.Patnr;
          doctor.PatnrName = element?.PatnrName;
          doctor.StatuText = element?.StatuText;
          doctor.parseDate = element?.parseDate;
          doctor.Color = this.getColorForStatus(element?.Statu);
        }
      }
    });
  }

  getColorForStatus(status: string) {
    switch (status) {
      case '20': return "bg-silver";
      case '30': return "bg-green";
      case '40': return "bg-red";
      case '50': return "bg-yellow";
      default: return '';
    }
  }

  showNextDate() {
    this.configurationData = [];
    const currentDate = formatDate(this.currentDate, 'YYYY-MM-dd');
    const filterData = this.allAppointmentData.filter((d) => { const parseDate = formatDate(d.parseDate, 'YYYY-MM-dd'); return parseDate > currentDate; });
    this.currentDate = filterData && filterData.length ? filterData.reduce((a, b) => {
      return formatDate(a.parseDate, 'YYYY-MM-dd') < formatDate(b.parseDate, 'YYYY-MM-dd') ? a : b;
    }).parseDate : this.currentDate;
    this.setDoctorDataBasedOnDate(this.currentDate);
  }

  showPreviousDate() {
    this.configurationData = [];
    const currentDate = formatDate(this.currentDate, 'YYYY-MM-dd');
    const filterData = this.allAppointmentData.filter((d) => { const parseDate = formatDate(d.parseDate, 'YYYY-MM-dd'); return parseDate < currentDate; });
    this.currentDate = filterData && filterData.length ? filterData.reduce((a, b) => {
      return formatDate(a.parseDate, 'YYYY-MM-dd') > formatDate(b.parseDate, 'YYYY-MM-dd') ? a : b;
    }).parseDate : this.currentDate;
    this.setDoctorDataBasedOnDate(this.currentDate);
  }

  // getAssignSurgeonList() {
  //   this.orderDashboardService.getAssignUsersData().subscribe((data: any) => {
  //     this.assignUsersList = data?.d?.results;
  //   });
  // }

  parseDate(date: any) {
    if (date !== null) {
      return `${new DatePipe('en-US').transform(date, "YYYY-MM-dd")}T${formatDate(date, "HH:mm:ss")}`;
    }
    return null;
  }

  parseDatedata(date: any) {
    if (date !== null) {
      const timestamp = parseInt(date.match(/\d+/)[0], 10);
      return new Date(timestamp);
    }
    return null;
  }

  ParsedDate(date: any) {
    if (date !== null) {
      return `${new DatePipe('en-US').transform(date, "YYYY-MM-dd")}`;
    }
    return null;
  }

  parsePtTime(data: string, format: string) {
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
        return format === 'HH:mm:ss' ? `${hours}:${Minute}:${Second}` : `${hours}:${Minute}`
      }
    }
    return null;
  }

  ngOnDestroy() {
    this.ePrescriptionService.valueStory = this.selectedOptions;
  }
}
