import { Component, OnInit } from '@angular/core';
import { eOrderService } from '@services/eorder.service';
import { SidebarService } from '@services/sidebar.service';

@Component({
  selector: 'app-e-order',
  templateUrl: './e-order.component.html',
  styleUrls: ['./e-order.component.scss'],
})
export class EOrderComponent implements OnInit {
  constructor(
    public sidebarService: SidebarService,
    private eOrderServ: eOrderService,
  ) {}

  ngOnInit(): void {
    this.eOrderServ.loadeOrderData();
  }
}
