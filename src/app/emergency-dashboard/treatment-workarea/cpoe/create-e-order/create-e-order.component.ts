import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { DataService } from '@services/data.service';
import { CpoeService } from '@services/emergency-dashboard/cpoe.service';
import { eOrderService } from '@services/eorder.service';
import { EventService } from '@services/event.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { EmerCommentsComponent } from './emer-comments/emer-comments.component';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-create-e-order',
  templateUrl: './create-e-order.component.html',
  styleUrls: ['./create-e-order.component.scss'],
})
export class CreateEorderComponent {
  orderForm: FormGroup
  public data: any = [];
  @Input('customData') customData: any;
  createOdata: any = [];
  isCollapsed = false;
  selectedData: any;
  constructor(
    public dataservice: DataService,
    public events: EventService,
    public eorderService: CpoeService,
    public modalService: BsModalService
  ) { }

  ngOnInit() {
    // const orderForm = new FormGroup({
    //   note: new FormControl()
    // });
  }



  @ViewChild('additionalPopup') additionalPopup: EmerCommentsComponent;

  modalRef?: BsModalRef | null;
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      id: 1,
      class: 'modal-lg',
    });
  }

  onOpenInfoPopup(data: any, index: number) {
    this.additionalPopup.showPopup(data, index);
    this.additionalPopup.onUpdateData.subscribe((resp) => {
      this.customData.forEach(element => {
        element.groupItem.forEach((item, findIndex) => {
          if (resp.index === findIndex) {
            if (element.type === resp.data.type) {
              item.note = resp.note
            }
          }
        });
      });
    })
  }

  openComments(template: TemplateRef<any>,data){
    this.modalRef = this.modalService.show(template, {
      id: 1,
      class: 'additional-info-temp modal-lg',
    });
    this.selectedData = data;
  }
}
