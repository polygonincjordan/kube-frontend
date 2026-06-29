import { Injectable } from '@angular/core';
import { EPrescriptionService } from './e-prescription.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AddministrationService {
  public frequencyList: any[];
  public Administrative: any[];
  public durationUnitList: any[];
  public medicationDrugList: any[];
  public medicationfrequencyQ24Cycle: any[];
  public routeDropdownList: any[];
  public AdminiEmployeeresponsible: any[];
  public AdminiOrderingList: any[];
  public PriorToAdministration:any[] = [];
  public patientProfileHistoryData: any[] = [];
  public medicationAdministrative: any;
  isExpanded: boolean = true;
  isConditionTrue: boolean = false;
  public searchMedicationProfile: string = '';
  public PriorToAdministrSubject = new Subject<any>();
  constructor(private ePrescriptionService: EPrescriptionService) { }
  IsEditMode: boolean[] = new Array(this.PriorToAdministration.length).fill(false);
  loadDropdownList() {
    this.loadMedicationDrugList();
    this.loadFrequencylist();
    this.loadDurationUnit();
    this.loadRouteDropdownList();
    this.loadMedicationAdministrative();
    this.employeeordering();
  }
  loadDurationUnit() {
    this.ePrescriptionService.loadData('e-prescription/DurationAdministrationUnitSet', false, false, false, false).subscribe({
      next: (resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results) {
          this.durationUnitList = resp.body.d.results;
        }
      },
    });
  }

  loadFrequencylist() {
    let filter = this.ePrescriptionService.loadParameters(false, false, false, false, true)
    this.ePrescriptionService.loadData('FrequencySet', filter, false, false, true).subscribe({
      next: (resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results) {
          resp.body.d.results.forEach(element => {
            element.OptionField = [element.Text, element.N1id].join(" - ");
          });
          this.frequencyList = resp.body.d.results;
        }
      }
    });
  }

  getStatFrequency() {
    return this.frequencyList ? this.frequencyList.find(d => d.N1id === "STAT") : null;
  }

  loadMedicationDrugList() {
    this.ePrescriptionService.loadData(`e-prescription/medicationDetails?Einri=${this.ePrescriptionService.parameters.einri}&Falnr=${this.ePrescriptionService.parameters.falnr}&Searchtype=${'B'}&SearchString=${''}`, false, false, false, false).subscribe({
      next: (resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results) {
          this.medicationDrugList = resp.body.d.results[0].TODURG.results
        }
      },
    })
  }

  loadRouteDropdownList() {
    this.ePrescriptionService.loadData(`e-prescription/routeDropdownlist`, false, false, false, false).subscribe({
      next: (resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results) {
          this.routeDropdownList = resp.body.d.results;
        }
      },
    })
  }

  employeeresponsible() {
    this.ePrescriptionService.loadData(`e-prescription/employeeresponsible?`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d.results) {
        this.AdminiEmployeeresponsible = resp.body.d.results;
      }
    })
  }

  employeeordering() {
    this.ePrescriptionService.loadData(`e-prescription/OrderingList?`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d.results) {
        this.AdminiOrderingList = resp.body.d.results;
      }
    })
  }

  loadMedicationAdministrative() {
    this.ePrescriptionService.loadData(`e-prescription/medicationAdministrationUnitSet?Einri=${this.ePrescriptionService.parameters.einri}&Falnr=${this.ePrescriptionService.parameters.falnr}&Lfdnr=${this.ePrescriptionService.parameters.lfdnr}`, false, false, false, false).subscribe({
      next: (resp: any) => {
        if (resp.body && resp.body.d) {
          this.medicationAdministrative = {
            EmpResp: resp.body.d.EmpResp,
            OrderDepartment: resp.body.d.OrddeptOrgfaNm,
            OrderingTo: resp.body.d.OrdtoOrgpf,
            OrderingDept: resp.body.d.OrddeptOrgfa
          };
        }
      },
    });
  }

  PriorToAdmission() {
    this.ePrescriptionService.loadData(`e-prescription/PriorToAdmissionget?Einri=${this.ePrescriptionService.parameters.einri}&Falnr=${this.ePrescriptionService.parameters.falnr}`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d.results) {
        this.PriorToAdministration = resp.body.d.results;
        this.PriorToAdministrSubject.next(resp.body.d.results)
      }
    });
  }

  PatientProfileHistory() {
    this.ePrescriptionService.loadData(`e-prescription/OrderHistoryPatientSet?Einri=${this.ePrescriptionService.parameters.einri}&Patnr=${this.ePrescriptionService.parameters.patnr}`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        this.patientProfileHistoryData = resp.body.d.results;
      }
    });
  }

}

