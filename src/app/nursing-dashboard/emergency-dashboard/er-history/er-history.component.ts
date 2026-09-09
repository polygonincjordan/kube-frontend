import { Component, EventEmitter, OnInit, Output, TemplateRef } from '@angular/core';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-er-history',
  templateUrl: './er-history.component.html',
  styleUrls: ['./er-history.component.scss']
})
export class ErHistoryComponent implements OnInit {
  @Output() redirectCheckInData = new EventEmitter<any>();
  ERlistData: any=[];
  modalRef: BsModalRef;
  selectedERList: any;
  currentDateObj: any;
  constructor(private emergencyService:EmergencyService,private modalService: BsModalService,) { }

  ngOnInit() {
    this.getErList(new Date());
  }
  public openModalForRisk(
    template: TemplateRef<any>,
    data: any
  ) {
    const config: ModalOptions = { class: 'modal-dialog-centered modal-xl risk-modal-size' };
      this.modalRef = this.modalService.show(template,config);
      this.selectedERList = data;

  }
  public openModalForAllergy(
    template: TemplateRef<any>,
    data: any
  ) {
    const config: ModalOptions = { class: 'modal-dialog-centered modal-xl risk-modal-size' };
      this.modalRef = this.modalService.show(template,config);
      this.selectedERList = data;

  }
  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }
  getTime(value) {
    if (value) {
      var str = value;
      var str = str.replace(/[PT]/g, '');
      var str = str.replace(/[H]/g, ':');
      var str = str.replace(/[M]/g, ':');
      var str = str.replace(/[S]/g, '');
      return str;
    }
  }
  getAssignedTime(checkintime,checkindate,index){
    let {charArr,hr,min,dateObj,totalMinutes,assignedHr,assignedMin,assignedTime}:any = {};
     charArr = checkintime.split('')
     hr = parseInt(charArr[0]+charArr[1]);
     min = parseInt(charArr[3]+charArr[4]);
     dateObj = checkindate;
    this.currentDateObj = new Date();
    dateObj.setHours(hr,min);
     totalMinutes = (this.currentDateObj.getTime() - dateObj.getTime())/1000;
     totalMinutes = totalMinutes/60;
    totalMinutes = Math.abs(Math.round(totalMinutes));
     assignedHr = Math.floor(totalMinutes / 60);
     assignedMin = totalMinutes % 60;
     assignedTime = String(assignedHr).padStart(2, '0') + 'h' + String(assignedMin).padStart(2, '0');
    console.log('assignedTime',assignedTime);
    this.ERlistData[index]['assignedTime'] = assignedTime;
  }
  getErList(date) {
    const json = {
      fromDate:date.getFullYear() +'-'+ String(date.getMonth() +1).padStart(2, '0') +'-'+ String(date.getDate()).padStart(2, '0') +'T00:00:00',
      toDate:date.getFullYear() +'-'+ String(date.getMonth() +1).padStart(2, '0') +'-'+ String(date.getDate()).padStart(2, '0') +'T00:00:00',
    }
    this.emergencyService.getErList(json).subscribe(
      (_success: any) => {
      // this.ERlistData = _success.d.results;
      this.ERlistData = [];
       _success.d.results.forEach(element => {
        if (element.StatusTxt == 'Checked Out') {
          this.ERlistData.push(element);
          this.triagePriorityList(element);
        }
       });
       this.ERlistData.forEach((element,index) => {
        this.getAssignedTime(this.getTime(element.ZeitIntern),this.getDate(element.Erdat),index);
       });
      },
      (_error: any) => {}
    );
  }
  triagePriorityList(element) {
    const json ={
      patnr : element.Patnr,
      falnr : element.Falnr
    }
    this.emergencyService.triagePriorityList(json).subscribe(
      (_success: any) => {
        this.ERlistData.forEach(e => {
          if (parseFloat(e.Patnr).toString() == _success.d.results[0]?.Patnr) {
          e['TriagePriorityCode'] = _success.d.results[0]?.TriagePriorityCode;
          e['TriageColor'] = _success.d.results[0]?.TriageColor;
          return e;
          }
        });     
      },
      (_error: any) => {}
    );
  }
  redirectToTreatment(data){
     this.redirectCheckInData.emit(data);
  }
  actionPhysicianSet(data) {
    const json = {
      Einri:data.Einri,
      Falnr:data.Falnr,
      Lfdnr:data.Lfdbw
    }
    this.emergencyService.actionPhysicianSet(json).subscribe(
      (_success: any) => {
      // this.ERlistData = _success.d.results;
      this.redirectToTreatment(data);
      },
      (_error: any) => {}
    );
  }

}
