import { Component, ElementRef, ViewChild} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { MultiSelectComponent } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-e-mar',
  templateUrl: './e-mar.component.html',
  styleUrls: ['./e-mar.component.scss']
})
export class EmarComponent {
  constructor(public ePrescriptionService: EPrescriptionService) { }
  public data = [];
  selectedItems = [];
  public settings = {};
  selectedItem: string;
  ngOnInit() {
    this.data = [
      { item_id: 1, item_text: 'Active' },
      { item_id: 2, item_text: 'Suspended' },
      { item_id: 3, item_text: 'Ended' },
      { item_id: 4, item_text: 'Cancelled' },
    ];
    this.settings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      enableCheckAll: true,
      allowSearchFilter: true,
      enableSearchFilter: true,
    };
}
onSelect(selecteddata: any) {
  selecteddata.forEach((item) => {
    this.ePrescriptionService.prioradmissiondata(item)
});
}
filteredData = this.data;
searchTerm = '';
filterItems(data) {
  if (this.searchTerm) {
    this.filteredData = data.filter(item =>
      item.item_text.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  } else {
    this.filteredData = this.data; // If search term is empty, show all data
  }
}

addTagFn(addedName): { name: any; tag: true } {
  return { name: addedName, tag: true };
}

}
