import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-drug-events-admin',
  templateUrl: './drug-events-admin.component.html',
  styleUrls: ['./drug-events-admin.component.css']
})
export class DrugEventsAdminComponent implements OnInit {
  modalRef: BsModalRef;
  @ViewChild('drugEventMain', { static: true }) drugEventMain: TemplateRef<any>;
  administered: boolean = true;
  qadministered: boolean = false;
  notadministered: boolean = false;
  addsupply: boolean = false;
  drugreturn: boolean = false;
  constructor(private modalService: BsModalService) { }

  ngOnInit() {
  }
  openModalForDrugsEvents(){
    const config: ModalOptions = { class: 'modal-dialog-centered drug-event-modal-size' };
    this.modalRef = this.modalService.show(this.drugEventMain, config);
    this.modalRef.onHide.subscribe((reason: string | any) => {
      if(reason === 'backdrop-click') {
      
      }
    });
  }
  changeEvents(item){
   if (item == 'Administered') {
    this.administered = true;
    this.qadministered = false;
    this.notadministered = false;
    this.addsupply = false;
    this.drugreturn = false;
   }else if (item == 'QAdministered') {
    this.administered = false;
    this.qadministered = true;
    this.notadministered = false;
    this.addsupply = false;
    this.drugreturn = false;
   }else if (item == 'NotAdministered') {
    this.administered = false;
    this.qadministered = false;
    this.notadministered = true;
    this.addsupply = false;
    this.drugreturn = false;
   }else if (item == 'AddSupply') {
    this.administered = false;
    this.qadministered = false;
    this.notadministered = false;
    this.addsupply = true;
    this.drugreturn = false;
   }else if (item == 'DrugReturn') {
    this.administered = false;
    this.qadministered = false;
    this.notadministered = false;
    this.addsupply = false;
    this.drugreturn = true;
   }
  }
  }
