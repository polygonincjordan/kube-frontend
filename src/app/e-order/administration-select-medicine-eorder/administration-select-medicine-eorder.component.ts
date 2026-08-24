import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { Observable, Subject, Subscription } from 'rxjs';


interface Person {
  name?: string;
}

@Component({
  selector: 'app-administration-select-medicine-eorder',
  templateUrl: './administration-select-medicine-eorder.component.html',
  styleUrls: ['./administration-select-medicine-eorder.component.scss']
})
export class AdministrationSelectMedicineEorderComponent implements OnInit {

  @Input() group: any;
  @Input() isSubmitted: boolean;
  @Input() index: number;
  @Output() onSelected: EventEmitter<any> = new EventEmitter;


  public itemData: Observable<Person>;
  public medicationDrugList: any;
  public defaultMedicationDrugListData: any;
  public isApiCalling: boolean = false;
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

  constructor(public ePrescriptionService: EPrescriptionService) {

  }
  ngOnInit() {
    this.subscribeSearchEvent();
  }

  subscribeSearchEvent() {
    this.searchTerm.pipe().subscribe(term => {
      this.searchTypeOnKeyEnter = term
    });
  }
  someMethod(event?: any, term?: string) {
    if ((term !== "" && term !== null && term.length >= 3)) {
      if (term.length === 3) {
        this.searchMedication(term)
      } else if (event.code == "Enter") {
        this.searchMedication(term);
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
