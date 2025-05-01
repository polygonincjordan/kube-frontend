import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { FeeListService } from '@services/fee-service/fee-list.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'op-service-history',
  templateUrl: './op-service-history.component.html',
  styleUrls: ['./op-service-history.component.scss']
})
export class OpServiceHistoryComponent implements OnInit {
  @Input('orderHistory') orderHistory: any;
  public selectedData: any;
  public modalRef?: BsModalRef | null;

  public feeServiceListItems: FormArray;
  // public orderHistory: FormGroup;
  constructor(
    public feeListService: FeeListService,
    public modalService: BsModalService
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

}
