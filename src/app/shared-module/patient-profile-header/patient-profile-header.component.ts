import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { Patient } from '@services/e-kardex/interfaces/patient';
import { PatientService } from '@services/e-kardex/patient.service';
import { catchError, of } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-patient-profile-header',
  templateUrl: './patient-profile-header.component.html',
  styleUrls: ['./patient-profile-header.component.scss']
})
export class PatientProfileHeaderComponent implements OnInit {

  constructor(private patientService: PatientService, private _route: ActivatedRoute,) { }
  einri: any;
  falnr: any;
  admittedFrom = '';
  lfdnr: any;
  queryNav: any;
  encounterId: any;
  isLoading = false;
  isError = false;
  patient: Patient = {} as Patient;
  ngOnInit(): void {
    this._route.queryParams.subscribe((params) => {
      this.queryNav = params.nav;
      this.einri = params.einri;
      this.falnr = params.falnr;
      this.lfdnr = params.lfdnr;
    });
    this.encounterId = this.einri + this.falnr + this.lfdnr;

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
      });
  }

    caseNumberReturn(caseNumber: any) {
    return parseInt(caseNumber, 10).toString()
  }


}
