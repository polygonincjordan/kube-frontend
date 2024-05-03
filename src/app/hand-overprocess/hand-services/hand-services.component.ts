import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'hand-services',
  templateUrl: './hand-services.component.html',
  styleUrls: ['./hand-services.component.scss']
})
export class HandServicesComponent {
  @Output('onClose') onClose: EventEmitter<any> = new EventEmitter<any>();
  onPopoverClose() {this.onClose.emit();}
}
