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
import { DatePipe } from '@angular/common';
import { FeeListService } from '@services/fee-service/fee-list.service';
import { ER_ORDER_TABS } from 'src/app/shared-module/e-order-config/order-config.util';

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
    private patientService: PatientService, private route: ActivatedRoute, private datePipe: DatePipe, public feeListService: FeeListService,
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
    this.feeListService.onNavigationClick('Fees');
    // Every tab is shown on this screen, so it always opens on the first one.
    this.openTab(ER_ORDER_TABS[0].key);
  }

  /**
   * Show a tab and keep CpoeService.navigationTab pointing at it. The template no
   * longer reads navigationTab, but the service still uses it to choose which
   * data to reload after an order action, so the two must not drift apart.
   */
  openTab(tab: string) {
    this.eprescriptionService.eOrderTabNavigation(tab);
    const mapped = ER_ORDER_TABS.find((entry) => entry.key === tab);
    if (mapped) {
      this.CpoeService.navigationTab = mapped.tab;
    }
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

  getStatusValue(item: any) {
    if (item == "") {
      return "Released";
    } else if (item == "X") {
      return "Planned";
    } else {
      return "";
    }
  }

  getDate(item) {
    let dateParts = item.split('-');
    let dateObject = new Date(Number(dateParts[0]), Number(dateParts[1] - 1), Number(dateParts[2]));
    return this.datePipe.transform(dateObject, 'dd-MM-yyyy');
  }

}
