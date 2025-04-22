import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AdmissionService } from '@services/admission/admission.service';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { NewbornAssessmentComponent } from 'src/app/shared-module/newborn-assessment/newborn-assessment.component';

@Component({
  selector: 'app-new-born-popup',
  templateUrl: './new-born-popup.component.html',
  styleUrls: ['./new-born-popup.component.scss']
})
export class NewBornPopupComponent implements OnInit {
  @ViewChild('newBornComp') newBornComp: NewbornAssessmentComponent;
  @Output() selectedItemClicked = new EventEmitter<any>();
  @Input() data: any;
  modalRef: BsModalRef;
  constructor(public activeModal: NgbActiveModal,public admissionService:AdmissionService) { }

  ngOnInit(): void {
  }

  saveNewBornDocument(status?){
    this.newBornComp.createDoc(status)
  }

  releaseNewborn(status?){
    this.admissionService.isEditBornForm = false
    if(this.data) {
      status = '2'
    } else {
      status = '4'
    }
    this.newBornComp.createDoc(status,'edit');
  }

  reloadList(event){
    if(event){
      this.selectedItemClicked.emit(true)
      this.activeModal.dismiss()
    }
  }

}
