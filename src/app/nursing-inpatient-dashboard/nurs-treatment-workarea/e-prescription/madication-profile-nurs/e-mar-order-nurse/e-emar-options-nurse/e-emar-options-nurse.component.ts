import { Component, OnInit } from '@angular/core';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';

@Component({
  selector: 'app-e-emar-options-nurse',
  templateUrl: './e-emar-options-nurse.component.html',
  styleUrls: ['./e-emar-options-nurse.component.scss']
})
export class EEmarOptionsNurseComponent implements OnInit {
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
    this.selectedItems = [this.data[0]];
    this.ePrescriptionService.prioradmissiondata(this.selectedItems[0]);
    this.onSelect([{ item_id: 1, item_text: 'Active' }])
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
  this.ePrescriptionService.selectedItems = selecteddata
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
resetFilter(){
    this.ePrescriptionService.checkedFilterData = {
      Administered:false,
      Cancelled:false,
      NotAdministered:false
    }
    this.ePrescriptionService.resetFilter(this.selectedItems);
}
}
