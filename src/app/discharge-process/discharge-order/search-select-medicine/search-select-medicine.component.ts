import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { PatientService } from '@services/e-kardex/patient.service';
import { debounceTime, Observable, Subject, Subscription } from 'rxjs';
interface Person {
  name?: string;
}
@Component({
  selector: 'ctrl-search-select-medicine',
  templateUrl: './search-select-medicine.component.html',
  styleUrls: ['./search-select-medicine.component.scss']
})

// export class SearchSelectMedicineComponent implements OnInit {
//   @Input() group: any;
//   @Input() isSubmitted: boolean;
//   @Input() index: number;
//   @Output() onSelected: EventEmitter<any> = new EventEmitter;


//   public itemData: Observable<Person>;
//   public medicationDrugList: any;
//   public defaultMedicationDrugListData: any;
//   public isApiCalling: boolean = false;

//   public medicationDataSubscription: Subscription;
//   @Input() set medicineDefaultData(data: any[]) {
//     if (data && data.length) {
//       this.medicationDrugList = data;
//       this.defaultMedicationDrugListData = data;
//     } else {
//       this.medicationDrugList = [{ Drugname: ' ', Drugid: '' }];
//     }
//   };
//   public searchTerm = new Subject<string>();

//   constructor(public ePrescriptionService: EPrescriptionService) {

//   }
//   ngOnInit() {
//     this.subscribeSearchEvent();
//   }

//   subscribeSearchEvent() {
//     this.searchTerm.pipe(debounceTime(250)).subscribe((term) => {
//       if (term !== "") {
//         const filters = this.ePrescriptionService.loadParameters(true, true, false, false);
//         filters['SearchString'] = term;
//         filters['Searchtype'] = 'B';
//         const expandEntities = ['TODURG', 'TOTEMPLATE'];
//         // this.medicationDrugList = [];
//         this.ePrescriptionService.loadData('SearchMSet', filters, expandEntities, true, true).subscribe({
//           next: (resp: any) => {
//             if (resp.body && resp.body.d && resp.body.d.results) {
//               this.medicationDrugList = resp.body.d.results[0].TODURG.results;
//             }
//           }
//         });
//       } else {
//         this.medicationDrugList = this.defaultMedicationDrugListData;
//       }
//     });
//   }

//   broadcastEvent(event) {
//     this.onSelected.emit({ data: event, index: this.index, medicationDruglist: this.medicationDrugList });
//   }
// }
export class SearchSelectMedicineComponent implements OnInit {
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
      this.medicationDrugList = [{ Drugname: ' ', Drugid: '' }];
    }
  };
  public searchTerm = new Subject<string>();

  constructor(public ePrescriptionService: EPrescriptionService, public patientService: PatientService) {
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
        setTimeout(()=>{
          this.searchMedication(term)
        }, 2000)
      } else {
        setTimeout(()=>{
          this.searchMedication(term);
        }, 2000)
      }
    } else {
      this.medicationDrugList = this.defaultMedicationDrugListData
    }
  }

  searchMedication(term: any) {
    const filters = this.ePrescriptionService.loadParameters(true, true, false, false);
    filters['SearchString'] = term;
    filters['Searchtype'] = 'B';
    const expandEntities = ['TODURG', 'TOTEMPLATE'];
    // this.medicationDrugList = [];
    this.ePrescriptionService.loadData('SearchMSet', filters, expandEntities, true, true).subscribe({
      next: (resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results) {
          this.medicationDrugList = resp.body.d.results[0].TODURG.results;
        }
      }
    });
  }

  broadcastEvent(event) {
    setTimeout(()=>{
      this.onSelected.emit({ data: event, index: this.index, medicationDruglist: this.medicationDrugList });
    }, 2000)
  }
}

