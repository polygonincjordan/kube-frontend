import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientService } from '@services/e-kardex/patient.service';
import { FloorsWardsService } from '@services/floors-wards/floors-wards.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { catchError, of } from 'rxjs';
import { Patient } from '@services/e-kardex/interfaces/patient';
import { StorageService } from '@services/storage.service';

@Component({
  selector: 'floors-ward',
  templateUrl: './floors-ward.component.html',
  styleUrls: ['./floors-ward.component.scss']
})
export class FloorsWardComponent implements OnInit {
  checkin=false;
  erhistory=false;
  treatmentarea=false;
  IsFloors = true;
  IsClinic = false;
  IsEmergency = false;
  dischargeorder: boolean;
  Folderorder=false;
  userconfig=false;
  DataManagement=false;
  selectedModule: any;
  currentDate: Date;

  encounterId: any;
  isError = false;
  isLoading = false;
  patient: Patient = {} as Patient;
  constructor(public floorsWardsService:FloorsWardsService,private _route: ActivatedRoute,
    private _router: Router,private patientService: PatientService,private storageService:StorageService) { }

  ngOnInit(): void {
    this.selectModule('checkin');
  }
  selectModule(module){
    this.currentDate = new Date();
    this.selectedModule = module;
   if (module=='checkin') {
    this.checkin = true;
    this.treatmentarea=false;
    this.erhistory=false;
    this.dischargeorder = false;
    this.Folderorder = false;
    this.DataManagement=false;
    this.userconfig=false;
   }
   else if(module=='treatmentarea'){
    this.treatmentarea=true;
    this.checkin = false;
    this.erhistory=false;
    this.dischargeorder = false;
    this.Folderorder = false;
    this.DataManagement=false;
    this.userconfig=false;
   }
   else if(module=='erhistory'){
    this.treatmentarea=false;
    this.checkin = false;
    this.erhistory=true;
    this.dischargeorder = false;
    this.Folderorder = false;
    this.DataManagement=false;
    this.userconfig=false;
   }
   else if(module=='dischargeorder'){
    this.treatmentarea=false;
    this.checkin = false;
    this.erhistory=false;
    this.dischargeorder = true;
    this.Folderorder = false;
    this.DataManagement=false;
    this.userconfig=false;
   }
   else if(module=='Folderorder'){
    this.treatmentarea=false;
    this.checkin = false;
    this.erhistory=false;
    this.dischargeorder = false;
    this.Folderorder = true;
    this.DataManagement=false;
    this.userconfig=false;
   }
   else if(module=='DataManagement'){
    this.treatmentarea=false;
    this.checkin = false;
    this.erhistory=false;
    this.dischargeorder = false;
    this.Folderorder = false;
    this.DataManagement=true;
    this.userconfig=false;
   }
   else if(module=='userconfig'){
    this.treatmentarea=false;
    this.checkin = false;
    this.erhistory=false;
    this.dischargeorder = false;
    this.Folderorder = false;
    this.DataManagement=false;
    this.userconfig=true;
   }
  }

  Selectmenu(module){
    if(module =='IsFloors'){
      this.IsFloors = true;
      this.IsClinic = false;
      this.IsEmergency = false;
    }else if(module=='IsClinic'){
      this.IsFloors = false;
      this.IsClinic = true;
      this.IsEmergency = false;
    }else if(module=='IsEmergency'){
      this.IsFloors = false;
      this.IsClinic = false;
      this.IsEmergency = true;
    }
  }
  refreshERhistory(){
    this.currentDate = new Date();
  }
  previousDate(){
    this.currentDate = new Date(new Date().setDate(this.currentDate.getDate()-1));
  }
  upcomingDate(){
    this.currentDate = new Date(new Date().setDate(this.currentDate.getDate()+1));
  }





  // collectCheckInData(checkindata){
  //   this.navigateToTreatmentArea(checkindata);
  //  }
  //  collectTreatmentPatientData(checkindata){
  //    this.navigateToTreatmentArea(checkindata);
  //   }
  //  navigateToTreatmentArea(checkindata){
  //    // changes the route without moving from the current view or
  //    // triggering a navigation event,
  //    if (checkindata.Lfdbw) {
  //      this._router.navigate([], {
  //        relativeTo: this._route,
  //        queryParams: {
  //         patnr: checkindata.Patnr,
  //         falnr:checkindata.Falnr,
  //         einri:checkindata.Einri,
  //         lfdnr:checkindata.Lfdbw
  //        },
  //        queryParamsHandling: 'merge',
  //        // preserve the existing query params in the route
  //        skipLocationChange: false
  //        // do not trigger navigation
  //      });
  //    }else{
  //      this._router.navigate([], {
  //        relativeTo: this._route,
  //        queryParams: {
  //         patnr: checkindata.Patnr,
  //         falnr:checkindata.Falnr,
  //         einri:checkindata.Einri,
  //         lfdnr:checkindata.Lfdnr
  //        },
  //        queryParamsHandling: 'merge',
  //        // preserve the existing query params in the route
  //        skipLocationChange: false
  //        // do not trigger navigation
  //      });
  //    }
  //    if (this.selectedModule == 'checkin' || this.selectedModule == 'erhistory') {
  //      this.selectModule('treatmentarea');
  //    }else if(this.selectedModule == 'dischargeorder' ){
  //      this.selectModule('dischargeorder');
  //    }

  //   //this.emergencyService.tabPanelNavigation('OrderSet');
  //   if (checkindata.Lfdbw) {
  //    this.encounterId = checkindata.Einri+checkindata.Falnr+checkindata.Lfdbw;
  //   }else{
  //    this.encounterId = checkindata.Einri+checkindata.Falnr+checkindata.Lfdnr;
  //   }

  //   this.getDataPatient();
  //  }

  //  getDataPatient() {
  //   this.patientService
  //     .getDataPatient(this.encounterId)
  //     .pipe(
  //       untilDestroyed(this),
  //       catchError((err) => {
  //         this.isError = true;
  //         this.isLoading = false;
  //         return of({} as Patient);
  //       })
  //     )
  //     .subscribe((patientData: Patient) => {
  //       this.isLoading = false;
  //       this.patient = patientData;
  //      this.storageService.setPatientData(patientData);

  //     });
  // }
}
