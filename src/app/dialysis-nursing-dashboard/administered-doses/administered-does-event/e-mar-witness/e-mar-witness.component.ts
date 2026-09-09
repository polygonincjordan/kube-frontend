import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'e-mar-witness',
  templateUrl: './e-mar-witness.component.html',
  styleUrls: ['./e-mar-witness.component.scss']
})
export class EMarWitnessComponent implements OnInit {
  private modalRef: BsModalRef;
  public indexofData: number;
  public isDefaultComment: string;
  public configureData: any;
  public userGroup: FormGroup;
  username: any;
  password: any[];
  constructor(private modalService: BsModalService) { }

  ngOnInit(): void {
    this.userGroup = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    })
  }

  @ViewChild('additionalInfo', { static: true }) additionalInfo: TemplateRef<any>;

  @Output() onUpdateData: EventEmitter<any> = new EventEmitter;

  showPopup(data: any) {
    this.userGroup.patchValue({
      username:'',
      password:''
    })
    this.configureData = data
    this.isDefaultComment = data.note;
    // this.indexofData = index
    this.modalRef = this.modalService.show(this.additionalInfo, { backdrop: true, ignoreBackdropClick: false, class: 'additional-info-temp' });
  }

  updateAdditionalInfo() {
    if (this.userGroup.valid) {
      this.onUpdateData.emit({ ...this.userGroup.value })
      this.modalRef.hide();
    } else {
      this.userGroup.markAllAsTouched();
    }
  }

  cancelAdditionalInfo() {
    this.modalRef.hide();
  }
}
