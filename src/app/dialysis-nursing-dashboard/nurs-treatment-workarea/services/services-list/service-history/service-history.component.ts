import { DatePipe } from '@angular/common';
import { Component, Inject, Input, OnInit, TemplateRef } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { FeeListService } from '@services/fee-service/fee-list.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-service-history',
  templateUrl: './service-history.component.html',
  styleUrls: ['./service-history.component.scss']
})
export class ServiceHistoryComponent implements OnInit {

  @Input('orderHistory') orderHistory: any;
  public selectedData: any;
  public modalRef?: BsModalRef | null;
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' | null = null;
  public feeServiceListItems: FormArray;
  // public orderHistory: FormGroup;
  constructor(
    public feeListService: FeeListService,
    public modalService: BsModalService,
    @Inject(DatePipe) private datePipe: DatePipe,
  ) { }

  ngOnInit(): void { }

  ngOnDestroy() { this.orderHistory = []; }

  openComments(template: TemplateRef<any>, data) {
    this.modalRef = this.modalService.show(template, {
      id: 1,
      class: 'additional-info-temp modal-lg',
    });
    this.selectedData = data;
  }
  confirmationForRiskDelete(item, index) {
    Swal.fire({
      text: 'Are you sure you want to delete?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: 'myalertpopup',
    }).then((result) => {
      if (result.value) {
        this.deleteItem(index);
      }
    });
  }
  getStatusValue(item: any) {
    if(item == "") {
      return "Released";
    } else if(item == "X") {
      return "Planned";
    } else {
      return "";
    }
  }

  getDate(item) {
    let dateParts = item.split('-');
    let dateObject = new Date(Number(dateParts[0]), Number(dateParts[1] - 1), Number(dateParts[2]));
    return this.datePipe.transform(dateObject, 'dd-MM-yyyy');
  }

  sortingItem(column: string) {
    if (this.sortColumn === column) {
      // Toggle sort direction
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Set new column and default to ascending
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    // Perform sorting
    this.orderHistory.sort((a: any, b: any) => {
      let valueA = a[column];
      let valueB = b[column];

      // Handle cases where values are strings
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }

      if (valueA < valueB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  deleteItem(index: number): void {
    if(index){
      this.orderHistory.splice(index, 1);
    }
  }
  
}
