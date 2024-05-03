import { Component, EventEmitter, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'hand-medication',
  templateUrl: './hand-medication.component.html',
  styleUrls: ['./hand-medication.component.scss']
})
export class HandMedicationComponent {
  @Output('onClose') onClose: EventEmitter<any> = new EventEmitter<any>();
  onPopoverClose() { this.onClose.emit(); }
}
