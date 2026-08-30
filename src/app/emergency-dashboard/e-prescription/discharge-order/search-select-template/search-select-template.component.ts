

import { Component, ElementRef, EventEmitter, Input, Output, Renderer2, ViewChild } from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { EPrescriptionService, TemplateMedicationData } from '@services/e-Prescription/e-prescription.service';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'ctrl-search-select-template',
  templateUrl: './search-select-template.component.html',
  styleUrls: ['./search-select-template.component.scss']
})

export class SearchSelectTemplateComponent {
  @ViewChild('ngSelectElement') ngSelectElement: NgSelectComponent;
  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();
  public templateDrugList: any;
  public searchTerm = new Subject<string | null>();
  public defaultTemplateMedicationListData: any;
  public searchTypeOnKeyEnter: any;
  constructor(public ePrescriptionService: EPrescriptionService, private renderer: Renderer2, private el: ElementRef) {
    this.subscribeSearchEvent();
  }

  @Input() set defaultTemplateMedication(data: TemplateMedicationData[]) {
    if (data && data.length) {
      this.templateDrugList = data;
      this.defaultTemplateMedicationListData = data;
    }
  }
  ngAfterViewInit() {
    this.ngSelectElement.focus();
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
      }else{
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
    this.onClose.emit(event);
  }

}









