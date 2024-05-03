import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-physician-order-list',
  templateUrl: './physician-order-list.component.html',
  styleUrls: ['./physician-order-list.component.scss'],
})
export class PhysicianOrderListComponent implements OnInit {
  @Input() physicianOrderList: any
  public physicianList: any[] = [
    {
      createOn: 'text',
      status: 'active',
      occupationalGroup: 'Text',
      employee: 'Text',
      physicianOrder: 'text',
      action: 'active',
    },
    {
      createOn: 'text',
      status: 'active',
      occupationalGroup: 'Text',
      employee: 'Text',
      physicianOrder: 'text',
      action: 'active',
    },
    {
      createOn: 'text',
      status: 'active',
      occupationalGroup: 'Text',
      employee: 'Text',
      physicianOrder: 'text',
      action: 'active',
    },
    {
      createOn: 'text',
      status: 'active',
      occupationalGroup: 'Text',
      employee: 'Text',
      physicianOrder: 'text',
      action: 'active',
    },
    {
      createOn: 'text',
      status: 'active',
      occupationalGroup: 'Text',
      employee: 'Text',
      physicianOrder: 'text',
      action: 'active',
    },
    {
      createOn: 'text',
      status: 'active',
      occupationalGroup: 'Text',
      employee: 'Text',
      physicianOrder: 'text',
      action: 'active',
    },
    {
      createOn: 'text',
      status: 'active',
      occupationalGroup: 'Text',
      employee: 'Text',
      physicianOrder: 'text',
      action: 'active',
    },
  ];
  constructor() {}

  ngOnInit(): void {
    this.physicianList = [1,2,3,4]
  }

  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }
}
