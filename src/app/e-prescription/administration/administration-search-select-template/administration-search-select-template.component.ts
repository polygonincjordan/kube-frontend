import { UpperCasePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AdministrationTemplateData, EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'administration-search-select-template',
  templateUrl: './administration-search-select-template.component.html',
  styleUrls: ['./administration-search-select-template.component.scss']
})
export class AdministrationSearchSelectTemplateComponent implements OnInit {


  ngOnInit(): void {
  }
  public templateDrugList: any;
  public searchTerm = new Subject<string | null>();
  public defaultTemplateMedicationListData: any;
  public searchTypeOnKeyEnter: any;
  constructor(public ePrescriptionService: EPrescriptionService) {
    this.subscribeSearchEvent();
  }

  @Input() set defaultTemplateMedication(data: AdministrationTemplateData[]) {
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
    if ((term !== "" && term !== null && term.length >= 3 )) {
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
    this.ePrescriptionService.loadData(`e-prescription/templatesearchtype?Einri=${this.ePrescriptionService.parameters.einri}&Falnr=${this.ePrescriptionService.parameters.falnr}&Searchtype=${'B'}&SearchString=${term}&Ordtype=${'1'}`, false, false, false, false).subscribe({
      next: (resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results) {
          this.templateDrugList = resp.body.d.results[0].TOTEMPLATE.results;
        }
      }
    });
  }

  broadcastEvent(event: any) {
    this.ePrescriptionService.loadAdministrationTemplateRows(event).subscribe((templateList: any[]) => {
      this.ePrescriptionService.templatePopupSaveData = templateList;
    });
  }
}
