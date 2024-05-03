import { Component, Input, OnInit } from '@angular/core';
import { CpoeService } from '@services/emergency-dashboard/cpoe.service';
import { eOrderService } from '@services/eorder.service';

@Component({
  selector: 'app-e-order-fees-service',
  templateUrl: './e-order-fees-service.component.html',
  styleUrls: ['./e-order-fees-service.component.scss'],
})
export class EOrderFeesServiceComponent implements OnInit {
  @Input('customData') customData: any;
  constructor(public eOrderServ: CpoeService) {}

  ngOnInit(): void {}

  markFavourite(element: any) {
    element.Favourite = !element.Favourite;
    element.icon = element.Favourite ? 'star' : 'star_border';
    this.eOrderServ.createFeeFavourite(element);
  }
}
