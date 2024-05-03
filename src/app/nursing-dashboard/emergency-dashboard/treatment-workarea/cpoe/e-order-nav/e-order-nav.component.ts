import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CpoeService } from '@services/emergency-dashboard/cpoe.service';
import { eOrderService } from '@services/eorder.service';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-e-order-nav',
  templateUrl: './e-order-nav.component.html',
  styleUrls: ['./e-order-nav.component.scss'],
})
export class EOrderNavComponent {
  modalRef?: BsModalRef | null;
  constructor(
    public eorderService: CpoeService,
    public modalService: NgbModal
  ) {}
  openModal(content) {
    this.eorderService.configurationoption = JSON.parse(
      JSON.stringify(this.eorderService.configurationoptionBackup)
    );
    this.modalService.open(content, { windowClass: 'myConfigurationModel' });
  }
  changeOrderList(event: any, type: any) {
    if(type === "Allords"){
      this.eorderService.configurationoption.Myord = !event.target.checked;
    }else if(type === "Myord"){
      this.eorderService.configurationoption.Allords = !event.target.checked;
    }
  }
  changeOrganizationList(event: any, type: any){
    if(type === "Allous"){
      this.eorderService.configurationoption.Myou = !event.target.checked;
    }else if(type === "Myou"){
      this.eorderService.configurationoption.Allous = !event.target.checked;
    }
  }
}
