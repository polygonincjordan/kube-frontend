import { Component, Input, OnInit } from '@angular/core';
import { EEmrService } from '@services/e-emr.service';
@Component({
  selector: 'app-emr',
  templateUrl: './e-emr.component.html',
  styleUrls: ['./e-emr.component.scss'],
})
export class EmrComponent implements OnInit {
  myClinic = true;
  inPatients = false;
  patientLab = false;
  patientRad = false;
  MySurgeries=false
  FavoritePatients=false;
  Endoscopy=false;
  clinicCount = 0;
  IPCount = 0;
  LabCount=0;
  RadCount = 0;
  Surgeries = 0;

  isClinicData: boolean = false;
  isInPatientData: boolean = false;
  isLabData: boolean = false;
  isRadData: boolean = false;
  isMySurgeries: boolean = false;

  isHiddenField:any;
  constructor(private _dataServices: EEmrService) {}

  ngOnInit() {
    this.initialPatientList('home');
  }

  inPatientsData(event){
    if(event.find(d=>d.Widgetid === "MYCLINIC01").Assigned){
      this.isClinicData = true
    }else{
      this.isClinicData = false;
    }
    if(event.find(d=>d.Widgetid === "MYLAB01").Assigned){
      this.isLabData = true
    }else{
      this.isLabData = false;
    }
    if(event.find(d=>d.Widgetid === "MYRAD01").Assigned){
      this.isRadData = true
    }else{
      this.isRadData = false;
    }
    if(event.find(d=>d.Widgetid === "MYINPAT01").Assigned){
      this.isInPatientData = true
    }else{
      this.isInPatientData = false;
    }
    if(event.find(d=>d.Widgetid === "MYSURGRY01").Assigned){
      this.isMySurgeries = true
    }else{
      this.isMySurgeries = false;
    }
    if(event.find(d=>d.Widgetid === "MYCLINIC01").Assigned){
      this.myClinic = true;
      this.inPatients = false;
      this.patientLab = false;
      this.patientRad = false;
      this.MySurgeries = false;
    }else if(event.find(d=>d.Widgetid === "MYLAB01").Assigned){
      this.myClinic = false;
      this.inPatients = true;
      this.patientLab = false;
      this.patientRad = false;
      this.MySurgeries = false;
    }else if(event.find(d=>d.Widgetid === "MYINPAT01").Assigned){
      this.myClinic = false;
      this.inPatients = true;
      this.patientLab = false;
      this.patientRad = false;
      this.MySurgeries = false;
    }else if(event.find(d=>d.Widgetid === "MYLAB01").Assigned){
      this.myClinic = false;
      this.inPatients = true;
      this.patientLab = false;
      this.patientRad = false;
      this.MySurgeries = false;
    }else if(event.find(d=>d.Widgetid === "MYSURGRY01").Assigned){
      this.myClinic = false;
      this.inPatients = false;
      this.patientLab = false;
      this.patientRad = false;
      this.MySurgeries = true;
    }
  }

  onClickWidgets(name) {
    this.FavoritePatients = false;
    this.Endoscopy = false;
    if (name == 'myclinic') {
      this.myClinic = true;
      this.inPatients = false;
      this.patientLab = false;
      this.patientRad = false;
      this.MySurgeries = false;
    } else if (name == 'inpatients') {
      this.myClinic = false;
      this.inPatients = true;
      this.patientLab = false;
      this.patientRad = false;
      this.MySurgeries = false;
    } else if (name == 'patientlab') {
      this.myClinic = false;
      this.inPatients = false;
      this.patientLab = true;
      this.patientRad = false;
      this.MySurgeries = false;
    } else if (name == 'patientrad') {
      this.myClinic = false;
      this.inPatients = false;
      this.patientLab = false;
      this.patientRad = true;
      this.MySurgeries = false;
    } else if (name == 'MySurgeries') {
      this.myClinic = false;
      this.inPatients = false;
      this.patientLab = false;
      this.patientRad = false;
      this.MySurgeries = true;
    } else if (name == 'FavoritePatients') {
      this.myClinic = false;
      this.inPatients = false;
      this.patientLab = false;
      this.patientRad = false;
      this.MySurgeries = false;
      this.FavoritePatients = true;
    } else if (name == 'Endoscopy') {
      this.myClinic = false;
      this.inPatients = false;
      this.patientLab = false;
      this.patientRad = false;
      this.MySurgeries = false;
      this.Endoscopy = true;
      this.FavoritePatients = false;
    }
  }
  collectClinicCount(event) {
    this.clinicCount = event;
  }
  collectIPCount(event) {
    this.IPCount = event;
  }
  collectLabCount(event) {
    this.LabCount = event;
  }
  collectRadCount(event) {
    this.RadCount = event;
  }
  collectSurgeries(event) {
    this.Surgeries = event;
  }
  initialPatientList(module) {
    let jsonObj = {
      // AdmDateFrom: '0000-00-00T00:00:00',
      // AdmDateTo: '0000-00-00T00:00:00',
      Floor: '',
      Patientstatus: '',
      module: 'home',
    };

    this._dataServices.getInPatientList(jsonObj).subscribe(
      (_success: any) => {
        if (_success) {
          //_success = JSON.parse(_success._body);
          console.log(_success);
          this.IPCount = _success.result.d.results.length;
        }
      },
      (_error: any) => {}
    );
  }
}
