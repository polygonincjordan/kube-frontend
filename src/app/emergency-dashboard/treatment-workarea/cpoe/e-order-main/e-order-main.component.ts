import { Component, ViewChild, OnInit } from '@angular/core';
import { OrganizationUnitComponent } from '../organization-unit/organization-unit.component';
import { CpoeService } from '@services/emergency-dashboard/cpoe.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { eOrderService } from '@services/eorder.service';
import { StorageService } from '@services/storage.service';
import { PatientService } from '@services/e-kardex/patient.service';
import { ActivatedRoute } from '@angular/router';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { Subject, catchError, debounceTime, of } from 'rxjs';
import { Patient } from '@services/e-kardex/interfaces/patient';

@UntilDestroy()
@Component({
  selector: 'app-e-order-main',
  templateUrl: './e-order-main.component.html',
  styleUrls: ['./e-order-main.component.scss'],
})
export class EOrderMainComponent implements OnInit {
  searchString: string;
  searchMedString: string;
  labOrdersSearchList: any;
  radOrdersSearchList: any;
  procedureSearchList: any;
  eOrders: any;
  historyOrders: any;
  searchFeestring: any;
  modalService: any;
  @ViewChild('organizationUnit', { static: true }) organizationUnit: OrganizationUnitComponent;
  paramsObj: any;
  isLoading = false;
  isError = false;
  patient: Patient = {} as Patient;
  encounterId: any;
  constructor(public CpoeService: CpoeService, public eprescriptionService: EPrescriptionService, public eOrderService: eOrderService,
    private patientService: PatientService, private route: ActivatedRoute,
    private storageService:StorageService) {
    this.CpoeService.isFilterDataPopup.subscribe((data) => {
      this.organizationUnit.showPopup(data)
      this.organizationUnit.onClosetempl.subscribe((item)=>{
        const SelectedData = {
          ...data,
          defaultOrgCode: item.OrgfaDefault,
          defaultOrgDescription: item.OrgfaDescr,
          treatingUnitCode: item.Trtoe,
          treatingUnitDescription: item.TrtoeDescr
        }
        this.CpoeService.onInsertOrder(SelectedData);
      })
    })
    this.CpoeService.loadeOrderData();
    this.route.queryParams.subscribe((params) => {
      this.paramsObj = params;
    });
  }

  ngOnInit(): void {
    this.encounterId = this.paramsObj.einri+ this.paramsObj.falnr + this.paramsObj.lfdnr;
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
      localStorage.setItem('myPatient', JSON.stringify(this.patient));

      });
  }
}
