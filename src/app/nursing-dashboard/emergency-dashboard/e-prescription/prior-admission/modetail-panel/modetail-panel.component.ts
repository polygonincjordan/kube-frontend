import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { AddministrationService } from '@services/e-Prescription/Administration.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'modetail-panel',
  templateUrl: './modetail-panel.component.html',
  styleUrls: ['./modetail-panel.component.scss']
})
export class ModetailPanelComponent {
  @Input() set modetailpanel(data: any) { }
  public modalRef: BsModalRef;
  public tabmodetail: string;
  public tabdetail: any;
  public configurationData: any;
  constructor(public addministrationService: AddministrationService, public ePrescriptionService: EPrescriptionService, private modalService: BsModalService) { }

  @ViewChild('addmodetailpanel', { static: true }) addmodetailpanel: TemplateRef<any>;

  showPopup(data): void {
    this.tabmodetail = "Eventdata";
    this.configurationData = data
    if (data) {
      this.modalRef = this.modalService.show(this.addmodetailpanel, { backdrop: true, ignoreBackdropClick: false, class: ' modetailpanel ' });;
    }
  }

  onClickTabChange(tabdetail) {
    if (tabdetail === "Medicationdata") { this.tabmodetail = tabdetail }
    else if (tabdetail === "Eventdata") { this.tabmodetail = tabdetail }
  }
  closeModetail() {
    this.modalService.hide()
  }
}
