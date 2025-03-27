import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'organization-unit',
  templateUrl: './organization-unit.component.html',
  styleUrls: ['./organization-unit.component.scss']
})
export class OrganizationUnitComponent {


  public modalRef: BsModalRef;
  public configurationdata: any;
  public searchByDescri: any;
  @Output() onClosetempl: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('templatecontent', { static: true }) templatecontent: TemplateRef<any>;
  constructor(private modalService: BsModalService) {}

  showPopup(data: any) {
    if (data && data.TOFILLERSET && data.TOFILLERSET.length) {
      if (data && data.TOFILLERSET.length) {
        this.configurationdata = data.TOFILLERSET;
        this.configurationdata.sort((a, b) => a.TrtoeDescr.localeCompare(b.TrtoeDescr));
        if(this.configurationdata && this.configurationdata.length){
          this.modalRef = this.modalService.show(this.templatecontent, { backdrop: true, ignoreBackdropClick: false, class: 'organizationpopup'});
        }
      }
    } else {
      Swal.fire({
        text: 'No template available for this patient',
        confirmButtonColor: '#0890c5',
        cancelButtonColor: '#84898c',
        confirmButtonText: 'OK',
        customClass: 'myalertpopup',
        icon: 'error',
      });
    }
  }

  onSelectedOrganization(data: any){
    this.onClosetempl.emit(data);
    this.modalRef.hide();
  }


}
