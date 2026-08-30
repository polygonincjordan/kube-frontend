import { Component,EventEmitter,OnInit, Output } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { Patient } from '@services/e-kardex/interfaces/patient';
import { PatientService } from '@services/e-kardex/patient.service';
import { StorageService } from '@services/storage.service';
import { catchError, of, tap } from 'rxjs';


@Component({
  selector: 'header-chemo',
  templateUrl: './header-chemo.component.html',
  styleUrls: ['./header-chemo.component.scss']
})
export class HeaderChemoComponent implements OnInit {
  isLoading: boolean;
  isError: boolean;
ngOnInit(): void {
  this.getDataPatient(this.ePrescriptionService.parameters.einri+this.ePrescriptionService.parameters.falnr+this.ePrescriptionService.parameters.lfdnr)
}
constructor(private patientService: PatientService , public ePrescriptionService: EPrescriptionService,private route: ActivatedRoute, private titleService: Title){}
patient: Patient = {} as Patient;
getDataPatient(encounterId) {
  this.patientService
    .getDataPatient(encounterId)
    .pipe(
      tap(() => (this.isLoading = false)),
      catchError((err) => {
        this.isError = true;
        this.isLoading = false;
        return of({} as Patient);
      })
    )
    .subscribe((patientData: Patient) => {
      this.isLoading = false;
      this.patient = patientData;
      this.titleService.setTitle(`${patientData?.name} | ${this.route.snapshot.parent.routeConfig.path}`);
    });
}
}
