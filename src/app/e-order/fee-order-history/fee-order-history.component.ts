import { Component, Input, OnInit } from '@angular/core';
import { eOrderService } from '@services/eorder.service';

@Component({
  selector: 'app-fee-order-history',
  templateUrl: './fee-order-history.component.html',
  styleUrls: ['./fee-order-history.component.scss'],
})
export class FeeOrderHistoryComponent implements OnInit {
  @Input('orderHistory') orderHistory: any;
  constructor(public eorderService: eOrderService) {}

  ngOnInit(): void {}
}
