import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { AdmissionService } from '@services/admission/admission.service';
import { debounceTime, Observable, Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-search-select-diagnosis-code',
  templateUrl: './search-select-diagnosis-code.component.html',
  styleUrls: ['./search-select-diagnosis-code.component.scss']
})
export class SearchSelectDiagnosisCodeComponent implements OnInit {

  @Input() group: any;
  @Input() isSubmitted: boolean;
  @Input() index: number;
  @Output() onSelected: EventEmitter<any> = new EventEmitter;
  @Input() diagnoDescri: boolean;


  public itemData: Observable<any>;
  public medicationDrugList: any;
  public defaultMedicationDrugListData: any;
  public isApiCalling: boolean = false;

  public medicationDataSubscription: Subscription;
  diagnosisSearchList: any[];
  @Input() set medicineDefaultData(data: any[]) {
    if (data && data.length) {
      this.medicationDrugList = data;
      this.defaultMedicationDrugListData = data;
    } else {
      this.medicationDrugList = [{ Drugname: ' ', Drugid: '' }];
    }
  };
  public searchTerm = new Subject<string>();

  constructor(private _admissionService: AdmissionService) {

  }
  ngOnInit() {
    this.diagnosisCodeList();
  }

  diagnosisCodeList() {
    this.searchTerm.pipe(debounceTime(500)).subscribe((term) => {
      if (term) {
        this._admissionService.searchDiagnosis(term).subscribe((result: any)=>{
          if (result.d.results) {
            this.diagnosisSearchList = result.d.results;
          }
        })
      }
    })
  }

  broadcastEvent(event) {
    this.onSelected.emit(event);
  }
 
}
