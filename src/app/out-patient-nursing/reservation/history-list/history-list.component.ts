import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';

@Component({
  selector: 'app-history-list',
  templateUrl: './history-list.component.html',
  styleUrls: ['./history-list.component.scss']
})
export class HistoryListComponent implements OnInit {
  historyList: any;
  payload: { CostCtr: any; MoveType: any; Matnr: any; Sloc: any; Erdat: string; Erdat1: string; };
  constructor(private emergencyService: EmergencyService) {}

  ngOnInit(): void {
    this.getHistoryList('');
  }

  getHistoryList(formValues: any){
    this.payload = {
        CostCtr:formValues?.cosCenter?.Kostl ? formValues?.cosCenter?.Kostl : '',
        MoveType:formValues?.moveType ? formValues?.moveType : '' ,
        Matnr:formValues.meCode?.Matnr ? formValues.meCode?.Matnr:'',
        Sloc:formValues.stoLocation?.Lgort?formValues.stoLocation?.Lgort:'',
        Erdat:`${new DatePipe('en-US').transform(
          formValues.FromDate ?  formValues.FromDate[0] : new Date().setDate(new Date().getDate()),
          'yyyy-MM-dd'
        )}T00:00:00`,
        Erdat1:`${new DatePipe('en-US').transform(
          formValues.ToDate ?  formValues.ToDate[1]  :new Date().setDate(new Date().getDate()),
          'yyyy-MM-dd'
        )}T00:00:00`,
        
      }
    this.emergencyService.getHistoryReservationLiat(this.payload).subscribe({
      next:(res:any)=>{
        if(res){
          this.historyList = res.d?.results
        }else{
          this.historyList = [];
        }
      },error:(err:any)=>{}
    })
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
