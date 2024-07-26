import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-record-view',
  templateUrl: './record-view.component.html',
  styleUrls: ['./record-view.component.scss'],
})
export class RecordViewComponent implements OnInit {
  @Input() recordViewText: string;
  constructor() {}

  ngOnInit(): void {
    console.log('recordViewText', this.recordViewText);
  }
}
