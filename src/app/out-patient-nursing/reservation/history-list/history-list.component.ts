import { Component, OnInit } from '@angular/core';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';

@Component({
  selector: 'app-history-list',
  templateUrl: './history-list.component.html',
  styleUrls: ['./history-list.component.scss']
})
export class HistoryListComponent implements OnInit {
  historyList: any;
  constructor(private emergencyService: EmergencyService) {}

  ngOnInit(): void {
    this.getHistoryList();
  }

  getHistoryList(){
    let payload = {
      CostCtr:'',
      MoveType:'',
      Matnr:'',
      Sloc:''
    }
    this.emergencyService.getHistoryReservationLiat(payload).subscribe({
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
