

import { Component, Input } from '@angular/core';
import { EPrescriptionService, TemplateMedicationData } from '@services/e-Prescription/e-prescription.service';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'ctrl-search-select-template',
  templateUrl: './search-select-template.component.html',
  styleUrls: ['./search-select-template.component.scss']
})

export class SearchSelectTemplateComponent {

  public templateDrugList: any;
  public searchTerm = new Subject<string | null>();
  public defaultTemplateMedicationListData: any;
  public searchTypeOnKeyEnter: any;
  constructor(public ePrescriptionService: EPrescriptionService) {
    this.subscribeSearchEvent();
  }

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
    if (event.Tmptype === "1") {
      this.ePrescriptionService.loadData(`e-prescription/orderTemplateMedication?EINRI=${this.ePrescriptionService.parameters.einri}&FALNR=${this.ePrescriptionService.parameters.falnr}&PRSCRID=${event.Prscrid}&Ordtype=${'2'}`, false, false, false, false).subscribe((resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results[0].PrescriptionItemSet.results && resp.body.d.results[0].PrescriptionItemSet.results.length) {
          this.ePrescriptionService.templatePopupSaveData = resp.body.d.results[0].PrescriptionItemSet.results;
        }
      });
    } else if (event.Tmptype === "2") {
      this.ePrescriptionService.loadData(`e-prescription/userTemplateMedication?EINRI=${this.ePrescriptionService.parameters.einri}&FALNR=${this.ePrescriptionService.parameters.falnr}&PRSCRID=${event.Prscrid}&Ordtype=${'2'}`, false, false, false, false).subscribe((resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results[0].PrescriptionItemSet.results && resp.body.d.results[0].PrescriptionItemSet.results.length) {
          this.ePrescriptionService.templatePopupSaveData = resp.body.d.results[0].PrescriptionItemSet.results;
        }
      });
    }
  }

}









