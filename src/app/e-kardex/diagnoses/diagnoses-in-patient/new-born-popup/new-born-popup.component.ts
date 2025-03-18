import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { NewbornAssessmentComponent } from 'src/app/shared-module/newborn-assessment/newborn-assessment.component';

@Component({
  selector: 'app-new-born-popup',
  templateUrl: './new-born-popup.component.html',
  styleUrls: ['./new-born-popup.component.scss']
})
export class NewBornPopupComponent implements OnInit {
  @ViewChild('newBornComp', { static: false }) newBornComp: NewbornAssessmentComponent;
  @Output() selectedItemClicked = new EventEmitter<any>();
     modalRef: BsModalRef;
  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
  }

  saveNewBornDocument(status?){
    this.newBornComp.createDoc(status)
  }

  releaseNewborn(status?){
    this.newBornComp.createDoc(status,'edit');
  }

  reloadList(event){
    if(event){
      this.selectedItemClicked.emit(true)
      this.activeModal.dismiss()
    }
  }

}
