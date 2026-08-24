import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { PatientService } from '@services/e-kardex/patient.service';
import { debounceTime, distinctUntilChanged, Observable, Subject, Subscription, switchMap } from 'rxjs';
interface Person {
  name?: string;
}
@Component({
  selector: 'administration-search-select-medicine',
  templateUrl: './administration-search-select-medicine.component.html',
  styleUrls: ['./administration-search-select-medicine.component.scss']
})
export class AdministrationSearchSelectMedicineComponent implements OnInit {

  @Input() group: any;
  @Input() isSubmitted: boolean;
  @Input() index: number;
  @Output() onSelected: EventEmitter<any> = new EventEmitter;
  // @Input() onclear: any;
  @Output() onclear: EventEmitter<any> = new EventEmitter;
  public itemData: Observable<Person>;
  public medicationDrugList: any;
  public defaultMedicationDrugListData: any;
  public isApiCalling: boolean = false;
  public HeaderConfigurationData = this.patientService.HeaderConfigurationData.deptOrgUnitTxt === 'EMEMDAMC'
  public searchTypeOnKeyEnter: any;

  public medicationDataSubscription: Subscription;
  @Input() set medicineDefaultData(data: any[]) {
    if (data && data.length) {
      this.medicationDrugList = data;
      this.defaultMedicationDrugListData = data;
    } else {
      this.medicationDrugList = [{ Drugname: '', Drugid: '' }];
    }
  };
  public searchTerm = new Subject<string>();

  constructor(public ePrescriptionService: EPrescriptionService, public patientService: PatientService) {
  }
  ngOnInit() {
    this.subscribeSearchEvent();
  }

  subscribeSearchEvent() {
    this.searchTerm.subscribe(term => {
      this.searchTypeOnKeyEnter = term
    });
  }
  someMethod(event?: any, term?: string) {
    if ((term !== "" && term !== null && term.length >= 3)) {
      if (term.length === 3 || term.length > 3) {
        setTimeout(()=>{
          this.searchMedication(term)
        }, 2000)
      } else if(term.length === 0){
        setTimeout(()=>{
          this.searchMedication(term)
        }, 2000)
      }
      else {
        setTimeout(()=>{
          this.searchMedication(term)
        }, 2000)
      }
    } else {
      this.medicationDrugList = this.defaultMedicationDrugListData
    }
  }


  searchMedication(term: any) {
    this.ePrescriptionService.loadData(`e-prescription/medicationDetails?Einri=${this.ePrescriptionService.parameters.einri}&Falnr=${this.ePrescriptionService.parameters.falnr}&Searchtype=${'B'}&SearchString=${term}`, false, false, false, false).subscribe({
      next: (resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results) {
          this.medicationDrugList = resp.body.d.results[0].TODURG.results;
        }
      }
    });

  }
  broadcastEvent(event) {
      this.onSelected.emit({ data: event, index: this.index, medicationDruglist: this.medicationDrugList });
  }
}
