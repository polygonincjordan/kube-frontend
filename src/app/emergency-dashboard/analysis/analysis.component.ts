import { polarAreaChartData } from './../../e-kardex/er-vitals/charts';
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ChartService } from '@services/chart.service';
import { Colors } from "@services/colors.service";
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.css']
})


export class AnalysisComponent implements OnInit {
  chartDataConfig: ChartService;
  analysisDetails: any;
  toHourly=[];
  toRoadMap=[];
  toZoneStat=[];
  barChartData = {};
  labelArr: any[];
  dataSetArr: any[];
  labelsWithoutAMPM: any[];
  showZoneStatsArr = [];
  diffRegTriage: any;
  constructor(public chartService: ChartService,private emergencyService:EmergencyService) { 
    this.chartDataConfig = this.chartService;
  }

  ngOnInit() {
    this.getAnalysisDetails();
  }
  getAnalysisDetails(){
    const json = {
      fromDate:`${new DatePipe('en-US').transform(
        new Date(),
        'yyyy-MM-dd'
      )}T00:00:00`,
      toDate:`${new DatePipe('en-US').transform(
        new Date(),
        'yyyy-MM-dd'
      )}T00:00:00`,
    }
    this.emergencyService.getAnalysisDetails(json).subscribe(
      (_success: any) => {
        if (_success?.d?.results.length > 0) {
          this.analysisDetails = _success?.d?.results[0];
        }
      
      if (_success?.d?.results[0]?.TOHOURLYPAT?.results.length > 0) {
        this.toHourly = _success?.d?.results[0]?.TOHOURLYPAT?.results[0];
      }
      
      this.toRoadMap = _success?.d?.results[0]?.TOROADMAP?.results;
      this.toZoneStat = _success?.d?.results[0]?.TOZONESTAT?.results;
      this.plotBarChart();
      this.zoneStats();
      this.plotRoadMap();
      },
      (_error: any) => {}
    );
  } 
  plotBarChart(){
    this.labelArr = [
      new Date(new Date().getTime() - (1000*60*60) - (1000*60*60) - (1000*60*60) - (1000*60*60) - (1000*60*60)).toLocaleString('en-US', { hour: '2-digit', hour12: true }), 
      new Date(new Date().getTime() - (1000*60*60) - (1000*60*60) - (1000*60*60) - (1000*60*60)).toLocaleString('en-US', { hour: '2-digit', hour12: true }), 
      new Date(new Date().getTime() - (1000*60*60) - (1000*60*60) - (1000*60*60)).toLocaleString('en-US', { hour: '2-digit', hour12: true }), 
      new Date(new Date().getTime() - (1000*60*60) - (1000*60*60)).toLocaleString('en-US', { hour: '2-digit', hour12: true }), 
      new Date(new Date().getTime() - (1000*60*60)).toLocaleString('en-US', { hour: '2-digit', hour12: true }),
      new Date().toLocaleString('en-US', { hour: '2-digit', hour12: true })];
    this.dataSetArr = [];
    this.labelsWithoutAMPM = [];
    for (let index = 0; index < this.labelArr.length; index++) {
      this.labelsWithoutAMPM.push(this.labelArr[index].replace(/[AMPM]/g,'').trim(''));
      //this.labelArr[index].replace('PM','')
    }
    if (this.toHourly) {
      for (let index = 0; index < this.labelsWithoutAMPM.length; index++) {
        if (this.toHourly.hasOwnProperty('Hr'+this.labelsWithoutAMPM[index])) {
          this.dataSetArr.push(this.toHourly[`Hr${this.labelsWithoutAMPM[index]}`])
        }
        
      }
    }
   
     this.barChartData = {
      labels: this.labelArr,
      datasets: [
        {
          label:'No. of Patients',
          borderColor: Colors.getColors().themeColor1,
          backgroundColor: '#0056b0',
          data: this.dataSetArr,
          borderWidth: 2,
        },
      ],
    };
  }
  zoneStats(){
   this.showZoneStatsArr = [{
    "Einri": "",
    "Patnr": "",
    "Falnr": "",
    "TriageCode": "02",
    "Color": "",
    "Registration": "",
    "Triage": "",
    "Treatement": "",
    "Discharge": "",
    "Billing": ""
   },
   {
    "Einri": "",
    "Patnr": "",
    "Falnr": "",
    "TriageCode": "03",
    "Color": "",
    "Registration": "",
    "Triage": "",
    "Treatement": "",
    "Discharge": "",
    "Billing": ""
   },
   {
    "Einri": "",
    "Patnr": "",
    "Falnr": "",
    "TriageCode": "04",
    "Color": "",
    "Registration": "",
    "Triage": "",
    "Treatement": "",
    "Discharge": "",
    "Billing": ""
   },
   {
    "Einri": "",
    "Patnr": "",
    "Falnr": "",
    "TriageCode": "01",
    "Color": "",
    "Registration": "",
    "Triage": "",
    "Treatement": "",
    "Discharge": "",
    "Billing": ""
   },
   {
    "Einri": "",
    "Patnr": "",
    "Falnr": "",
    "TriageCode": "05",
    "Color": "",
    "Registration": "",
    "Triage": "",
    "Treatement": "",
    "Discharge": "",
    "Billing": ""
   }
  ]
    this.toZoneStat.forEach((el,index) => {
      if (el.TriageCode == '02') {
        this.showZoneStatsArr[0] = el; 
      }
      if (el.TriageCode == '03') {
        this.showZoneStatsArr[1] = el; 
      }
      if (el.TriageCode == '04') {
        this.showZoneStatsArr[2] = el; 
      }
      if (el.TriageCode == '01') {
        this.showZoneStatsArr[3] = el; 
      }
      if (el.TriageCode == '05') {
        this.showZoneStatsArr[4] = el; 
      }
    });    
  }
  plotRoadMap(){
   this.toRoadMap.forEach(element => {
     element['RegToTriage'] = this.calculateTime(element.RTime,element.TriTime);
     element['TriageToCalled'] = this.calculateTime(element.TriTime,element.CallTime);
     element['CalledToTreat'] = this.calculateTime(element.CallTime,element.TreTime);
     element['TreatToBill'] = this.calculateTime(element.TreTime,element.BTime);
     element['BillToDischarge'] = this.calculateTime(element.BTime,element.DTime);
     element['ElapsedTimeInMins'] = this.calculateElapsed(element.Elapased);
    //  
    element['RegToTriageInHr'] = this.timeConvert(this.calculateTime(element.RTime,element.TriTime));
     element['TriageToCalledInHr'] = this.timeConvert(this.calculateTime(element.TriTime,element.CallTime));
     element['CalledToTreatInHr'] = this.timeConvert(this.calculateTime(element.CallTime,element.TreTime));
     element['TreatToBillInHr'] = this.timeConvert(this.calculateTime(element.TreTime,element.BTime));
     element['BillToDischargeInHr'] = this.timeConvert(this.calculateTime(element.BTime,element.DTime));
     
   });
   console.log('RegToTriage---',this.toRoadMap);
   
  }
  calculateTime(time1,time2){
      var str1 = time1;
      var str1 = str1.replace(/[PT]/g, '');
      var str1 = str1.replace(/[H]/g, ':');
      var str1 = str1.replace(/[M]/g, ':');
      var str1 = str1.replace(/[S]/g, '');
      var str1 = str1.split(':');
      var str2 = time2;
      var str2 = str2.replace(/[PT]/g, '');
      var str2 = str2.replace(/[H]/g, ':');
      var str2 = str2.replace(/[M]/g, ':');
      var str2 = str2.replace(/[S]/g, '');
      var str2 = str2.split(':');
      var finalstr = Math.floor(Math.abs(str2[0] - str1[0]) * 60) + Math.abs(str2[1]- str1[1]);
      return finalstr;
  }
  calculateElapsed(time){
    var str = time.split(':');
    var finalstr = Math.floor(str[0] * 60) + parseFloat(str[1]);
    return finalstr; 
  }
   timeConvert(n) {
    var num = n;
    var hours = (num / 60);
    var rhours = Math.floor(hours);
    var minutes = (hours - rhours) * 60;
    var rminutes = Math.round(minutes);
    return rhours + ":" + rminutes;
    }
}
