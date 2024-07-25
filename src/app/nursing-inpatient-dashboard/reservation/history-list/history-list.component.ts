import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { from, Subscription } from 'rxjs';

@Component({
  selector: 'app-history-list',
  templateUrl: './history-list.component.html',
  styleUrls: ['./history-list.component.scss']
})
export class HistoryListComponent implements OnInit {
  historyList: any;
  filteredHistoryList: any[] = [];
  payload: { CostCtr: any; MoveType: any; Matnr: any; Sloc: any; Erdat: string; Erdat1: string; };
  itemDate: Date;
  matchesDateRange: boolean;
  historyCloneList: any;
  constructor(private emergencyService: EmergencyService) {}

  ngOnInit(): void {
    this.getHistoryList();
  }

  getHistoryList(){
    this.emergencyService.getHistoryReservationLiat().subscribe({
      next:(res:any)=>{
        if (res) {
          this.historyList = res.d?.results || [];
          this.historyCloneList = res.d?.results || [];
        } else {
          this.historyList = [];
          this.filteredHistoryList = [];
        }
      },error:(err:any)=>{
        console.log(err)
      }
    })
  }

  filterHistory(formValues){
    this.filteredHistoryList = this.historyCloneList.filter(item => {
      const erdat = new Date(parseInt(item.Erdat.match(/\d+/)[0]));
      // const erdat1 = new Date(parseInt(item.Erdat1.match(/\d+/)[0]));
      const startDate = new Date(formValues.dateRange?.[0]);
      const endDate = new Date(formValues.dateRange?.[1]);
      return (!formValues.moveType || item.MoveType === formValues.moveType) &&
             (!formValues.stoLocation || item.Sloc === formValues.stoLocation.Lgort) &&
             (!formValues.cosCenter || item.CostCtr === formValues.cosCenter.Kostl) &&
             (!formValues.meCode || item.Matnr === formValues.meCode.Matnr) &&
             (!formValues.userName || item.Erusr === formValues.userName) &&
             (!formValues.dateRange || (erdat >= startDate && erdat <= endDate));
    });
    if(this.filteredHistoryList?.length){
     this.historyList = this.filteredHistoryList; 
    }else{
      this.historyList = [];
    }
  }
  

  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }

}
