import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { PatientHistoryService } from '@services/e-kardex/patient-history.service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-physician-family-history',
  templateUrl: './physician-family-history.component.html',
  styleUrls: ['./physician-family-history.component.scss']
})
export class PhysicianFamilyHistoryComponent implements OnInit {
  @ViewChild('familyHistoryKardexModal', { static: true }) pastSurgicalcalKardexModal: TemplateRef<any>;
  modalRef: BsModalRef;
  constructor(private modalService: BsModalService,public storageService: StorageService,private patientHistory:PatientHistoryService,private formBuilder: FormBuilder) { }

  ngOnInit() {
  }
  openModalForFamilyHistory(){
    const config: ModalOptions = { class: 'modal-dialog-centered past-med-modal-size' };
    this.modalRef = this.modalService.show(this.pastSurgicalcalKardexModal, config);
    this.modalRef.onHide.subscribe((reason: string | any) => {
      if(reason === 'backdrop-click') {
      
      }
    });
  }
}

