import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { DataService } from '@services/data.service';
import { eOrderService } from '@services/eorder.service';
import { EventService } from '@services/event.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-create-e-order',
  templateUrl: './create-e-order.component.html',
  styleUrls: ['./create-e-order.component.scss'],
})
export class CreateEorderComponent {
  public data: any = [];
  @Input('customData') customData: any;
selectedDosageUnit:string;
  createOdata: any = [];
  selectedData: any;
  constructor(
    public dataservice: DataService,
    public events: EventService,
    public eorderService: eOrderService,
    public modalService: BsModalService
  ) { }
  modalRef?: BsModalRef | null;
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      id: 1,
      class: 'modal-lg',
    });
  }

  findSelectedDosageUnit(dosageUnit:any[],defaultUnit:string){
   let selectedUnit= dosageUnit.find((ele)=>{ele.unit === defaultUnit});
   this.selectedDosageUnit= selectedUnit?selectedUnit.unit:'';
  }
  openComments(template: TemplateRef<any>,data){
    this.modalRef = this.modalService.show(template, {
      id: 1,
      class: 'additional-info-temp modal-lg',
    });
    this.selectedData = data;
  }
}
