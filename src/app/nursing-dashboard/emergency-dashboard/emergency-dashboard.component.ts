import { StorageService } from '@services/storage.service';
import { ErHistoryComponent } from './er-history/er-history.component';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Patient } from '@services/e-kardex/interfaces/patient';
import { PatientService } from '@services/e-kardex/patient.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { catchError, of } from 'rxjs';
import { CheckinListComponent } from './checkin-list/checkin-list.component';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { ErDischargeordersService } from '@services/emergency-dashboard/er-dischargeorders.service';
import { FloorsWardsService } from '@services/floors-wards/floors-wards.service';

@UntilDestroy()
@Component({
  selector: 'app-emergency-dashboard',
  templateUrl: './emergency-dashboard.component.html',
  styleUrls: ['./emergency-dashboard.component.scss']
})
export class EmergencyDashboardComponent implements OnInit {
  @ViewChild(CheckinListComponent) CheckinListComponent;
  @ViewChild(ErHistoryComponent) ErHistoryComponent;
  checkin=true;
  treatmentarea=false;
  day: any;
  currentDate: Date;
  callRefresh=false;
  isLoading = false;
  isError = false;
  patient: Patient = {} as Patient;
  encounterId: any;
  erhistory=false;
  dischargeorder: boolean;
  patnr: any;
  einri: any;
  lfdnr: any;
  falnr: any;
  selectedModule: any;
  constructor(private _route: ActivatedRoute,public floorsWardsService:FloorsWardsService,
    private _router: Router,private emergencyService:EmergencyService,private patientService: PatientService,public ePrescriptionService:ErDischargeordersService,private elementRef: ElementRef,private storageService:StorageService) { }

  ngOnInit() {
    this.selectModule('checkin');
    this.currentDate = new Date();
    this.getCurrentDate();
    this.elementRef.nativeElement.ownerDocument
            .body.style.setProperty("background", "#f2f4f6", "important");
  }
  selectModule(module){
    this.selectedModule = module;
    this.emergencyService.tabPanelNavigation('OrderSet');
    // if (localStorage.getItem('tabName') == 'OrderSet') {
    //   this.emergencyService.tabPanelNavigation('OrderSet');
    // }else if(localStorage.getItem('tabName') == 'CPOE'){
    //   this.emergencyService.tabPanelNavigation('CPOE');
    // }else if(localStorage.getItem('tabName') == 'orderdetails'){
    //   this.emergencyService.tabPanelNavigation('orderdetails');
    // }else if(localStorage.getItem('tabName') == 'PhysicianOrders'){
    //   this.emergencyService.tabPanelNavigation('PhysicianOrders');
    // }else if(localStorage.getItem('tabName') == 'ProgressNotes'){
    //   this.emergencyService.tabPanelNavigation('ProgressNotes');
    // }
   if (module=='checkin') {
    this.currentDate = new Date();
    this.checkin = true;
    this.treatmentarea=false;
    this.erhistory=false;
    this.dischargeorder = false;
   }
   else if(module=='treatmentarea'){
    this.treatmentarea=true;
    this.checkin = false;
    this.erhistory=false;
    this.dischargeorder = false;
   }
   else if(module=='erhistory'){
    this.treatmentarea=false;
    this.checkin = false;
    this.erhistory=true;
    this.dischargeorder = false;
   }
   else if(module=='dischargeorder'){
    this.treatmentarea=false;
    this.checkin = false;
    this.erhistory=false;
    this.dischargeorder = true;
    if (this._route.snapshot.queryParams['einri']) {
    this._route.queryParams.subscribe((params) => {
      this.patnr = params.patnr;
      this.einri = params.einri;
      this.lfdnr = params.lfdnr;
      this.falnr = params.falnr;
    });
    this.encounterId = this.einri+ this.falnr + this.lfdnr;
    //this.getDataPatient();
  }
   }
  //  else if(module=='emergkpi'){
  //   this.emergkpi=true;
  //   this.emergkardex=false;
  //   this.datefilter = false;
  //   this.emerg24=false;
  //  }
  //  else if(module=='emerg24'){
  //   this.emerg24=true;
  //   this.emergkardex=false;
  //   this.datefilter = false;
  //   this.emergkpi=false;
  //  }
  }
  getCurrentDate(){
    this.day = new Date().toLocaleDateString('en-US',{weekday: 'long'});
  }
  refreshCheckIn(){
    this.CheckinListComponent.getErList(new Date());
  }
  refreshERhistory(){
    //this.ErHistoryComponent.getErList(new Date());
    this.currentDate = new Date();
  }
  collectCheckInData(checkindata){
   this.navigateToTreatmentArea(checkindata);
  }
  collectTreatmentPatientData(checkindata){
    this.navigateToTreatmentArea(checkindata);
   }
  navigateToTreatmentArea(checkindata){
    // changes the route without moving from the current view or
    // triggering a navigation event,
    if (checkindata.Lfdbw) {
      this._router.navigate([], {
        relativeTo: this._route,
        queryParams: {
         patnr: checkindata.Patnr,
         falnr:checkindata.Falnr,
         einri:checkindata.Einri,
         lfdnr:checkindata.Lfdbw
        },
        queryParamsHandling: 'merge',
        // preserve the existing query params in the route
        skipLocationChange: false
        // do not trigger navigation
      });
    }else{
      this._router.navigate([], {
        relativeTo: this._route,
        queryParams: {
         patnr: checkindata.Patnr,
         falnr:checkindata.Falnr,
         einri:checkindata.Einri,
         lfdnr:checkindata.Lfdnr
        },
        queryParamsHandling: 'merge',
        // preserve the existing query params in the route
        skipLocationChange: false
        // do not trigger navigation
      });
    }
    if (this.selectedModule == 'checkin' || this.selectedModule == 'erhistory') {
      this.selectModule('treatmentarea');
    }else if(this.selectedModule == 'dischargeorder' ){
      this.selectModule('dischargeorder');
    }

   //this.emergencyService.tabPanelNavigation('OrderSet');
   if (checkindata.Lfdbw) {
    this.encounterId = checkindata.Einri+checkindata.Falnr+checkindata.Lfdbw;
   }else{
    this.encounterId = checkindata.Einri+checkindata.Falnr+checkindata.Lfdnr;
   }

   this.getDataPatient();
  }
  getDataPatient() {
    this.patientService
      .getDataPatient(this.encounterId)
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          this.isError = true;
          this.isLoading = false;
          return of({} as Patient);
        })
      )
      .subscribe((patientData: Patient) => {
        this.isLoading = false;
        this.patient = patientData;
       this.storageService.setPatientData(patientData);

      });
  }
  onERDateChange(){
    if (this.ErHistoryComponent!=undefined) {
      this.ErHistoryComponent.getErList(this.currentDate);
    }

  }
  previousDate(){
    this.currentDate = new Date(new Date().setDate(this.currentDate.getDate()-1));
    //this.ErHistoryComponent.getErList(this.currentDate);
  }
  upcomingDate(){
    this.currentDate = new Date(new Date().setDate(this.currentDate.getDate()+1));
    //this.ErHistoryComponent.getErList(this.currentDate);
  }
}
