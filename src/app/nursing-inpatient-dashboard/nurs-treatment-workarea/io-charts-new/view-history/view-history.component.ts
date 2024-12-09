import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';

@Component({
    selector: 'app-view-history-new',
    templateUrl: './view-history.component.html',
    styleUrls: ['./view-history.component.scss']
})
export class ViewHistoryComponentNew implements OnInit, OnDestroy {

  @Output() backevent = new EventEmitter();

  chartHistory: any = [];

  paramsObj: any;
  viewIntakeOutputList: boolean = false;
  itemNumber: any;

  constructor(private emergencyService: EmergencyService, private route: ActivatedRoute) {
      this.route.queryParams.subscribe((params) => {
          this.paramsObj = params;
      });
  }

  ngOnInit(): void {
      this.viewHistory();
  }

  viewHistory() {
      this.emergencyService.viewHistoryDetails(this.paramsObj.patnr, this.paramsObj.falnr).subscribe((res: any) => {
          console.log(res);
          this.chartHistory = res?.d?.results;
          this.chartHistory = this.chartHistory.map((item) => ({
              ...item,
              statusTag: item.Status === 'PRC' ? 'Open' : 'Completed',
          }));
          this.chartHistory = this.chartHistory.sort((a, b) => {
              if (a.changedon === null) return -1;
              if (b.changedon === null) return 1;
              return 0;
          });
      })
  }

  ngOnDestroy(): void {
      console.log('RecordViewComponent destroyed!');
      // Add any cleanup logic here, like unsubscribing from observables.
  }


  back() {
      this.backevent.emit();
  }

  parseDate(date: string) {
      if (date) {
          return new Date(new Date(+(date.replace('/Date(', '').replace(')/', ''))).toLocaleDateString("en-US"));
      }
  }

  convertDurationToTime(duration) {
      if (duration) {
          const regex = /PT(\d+H)?(\d+M)?(\d+S)?/;
          const matches = duration.match(regex);
          const hours = matches[1] ? parseInt(matches[1].replace('H', '')) : 0;
          const minutes = matches[2] ? parseInt(matches[2].replace('M', '')) : 0;
          const formattedHours = hours.toString().padStart(2, '0');
          const formattedMinutes = minutes.toString().padStart(2, '0');
          return `${formattedHours}:${formattedMinutes}`;
      }
  }

  showIOList(Hrecdno: any) {
      this.itemNumber = Hrecdno;
      this.viewIntakeOutputList = !this.viewIntakeOutputList;
  }

  backeventHistory(event) {
      this.viewIntakeOutputList = !this.viewIntakeOutputList;
  }

  checkValue(item) {
     if (parseFloat(item.Netoutput) > parseFloat(item.Netinput)) {
      return true
     }
     return false
  }
}
