import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-ic-bundle-adult-ventilator',
  templateUrl: './ic-bundle-adult-ventilator.component.html',
  styleUrls: ['./ic-bundle-adult-ventilator.component.scss']
})
export class IcBundleAdultVentilatorComponent implements OnInit {
  @Output() cancelEvent: EventEmitter<void> = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
  }

  onCancel(): void {
    this.cancelEvent.emit();
  }
}
