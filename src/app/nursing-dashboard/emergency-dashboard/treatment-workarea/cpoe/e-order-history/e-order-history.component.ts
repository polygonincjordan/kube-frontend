import { Component, Input } from '@angular/core';
import { CpoeService } from '@services/emergency-dashboard/cpoe.service';
import { eOrderService } from '@services/eorder.service';

@Component({
  selector: 'app-e-order-history',
  templateUrl: './e-order-history.component.html',
  styleUrls: ['./e-order-history.component.scss'],
})
export class EOrderHistoryComponent {
  @Input('orderHistory') orderHistory: any;
  constructor(public eorderService: CpoeService) {}
  ngOnDestroy() {
    this.orderHistory = [];
  }
}
