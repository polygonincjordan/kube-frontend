import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EPrescriptionService, TemplateMedicationData } from '@services/e-Prescription/e-prescription.service';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'ctrl-search-select-template',
  templateUrl: './search-select-template.component.html',
  styleUrls: ['./search-select-template.component.scss']
})

export class SearchSelectTemplateComponent {

  // public templateDrugList: any;
  // public searchTerm = new Subject<string | null>();
  // public defaultTemplateMedicationListData: any;
  // constructor(public ePrescriptionService: EPrescriptionService) {
  //   this.subscribeSearchEvent();
  // }
  // @Output() onClose: EventEmitter<any> = new EventEmitter<any>();

  // @Input() set defaultTemplateMedication(data: TemplateMedicationData[]) {
  //   if (data && data.length) {
  //     this.templateDrugList = data;
  //     this.defaultTemplateMedicationListData = data;
  //   }
  // }

  // subscribeSearchEvent() {
  //   this.searchTerm.pipe(debounceTime(250)).subscribe(term => {
  //     if (term !== "") {
  //       const filters = this.ePrescriptionService.loadParameters(true, true, false, false);
  //       filters['SearchString'] = term;
  //       filters['Searchtype'] = 'B';
  //       const expandEntities = ['TODURG', 'TOTEMPLATE'];
  //       this.ePrescriptionService.loadData('SearchMSet', filters, expandEntities, true, true).subscribe({
  //         next: (resp: any) => {
  //           if (resp.body && resp.body.d && resp.body.d.results) {
  //             this.templateDrugList = resp.body.d.results[0].TOTEMPLATE.results;
  //           }
  //         }
  //       });
  //     } else {
  //       this.templateDrugList = this.defaultTemplateMedicationListData
  //     }
  //   });
  // }

  // broadcastEvent(event: any) {
  //   const filters = { 'EINRI': this.ePrescriptionService.parameters.einri, 'PRSCRID': event };
  //   this.ePrescriptionService.loadData('PrescriptionSet', filters, ['PrescriptionItemSet'], true, true).subscribe((resp: any) => {
  //     if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results[0].PrescriptionItemSet.results && resp.body.d.results[0].PrescriptionItemSet.results.length) {
  //       this.ePrescriptionService.templatePopupSaveData = resp.body.d.results[0].PrescriptionItemSet.results;
  //     }
  //   });
  // }
  public templateDrugList: any;
  public searchTerm = new Subject<string | null>();
  public defaultTemplateMedicationListData: any;
  public searchTypeOnKeyEnter: any;
  constructor(public ePrescriptionService: EPrescriptionService) {
    this.subscribeSearchEvent();
  }
  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();
  @Input() set defaultTemplateMedication(data: TemplateMedicationData[]) {
    if (data && data.length) {
      this.templateDrugList = data;
      this.defaultTemplateMedicationListData = data;
    }
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
      else{
        this.searchMedication(term);
      }
    } else {
      this.templateDrugList = this.defaultTemplateMedicationListData
    }
  }

  searchMedication(term: any) {
    this.ePrescriptionService.loadData(`e-prescription/templatesearchtype?Einri=${this.ePrescriptionService.parameters.einri}&Falnr=${this.ePrescriptionService.parameters.falnr}&Searchtype=${'B'}&SearchString=${term}&Ordtype=${'2'}`, false, false, false, false).subscribe({
      next: (resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results) {
          this.templateDrugList = resp.body.d.results[0].TOTEMPLATE.results;
        }
      }
    });
  }

  broadcastEvent(event: any) {
    this.onClose.emit(event)
  }


}
