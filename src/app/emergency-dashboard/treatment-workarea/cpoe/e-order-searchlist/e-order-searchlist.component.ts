import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { eOrderService } from '@services/eorder.service';
import { OrganizationUnitComponent } from '../organization-unit/organization-unit.component';
import { CpoeService } from '@services/emergency-dashboard/cpoe.service';

@Component({
  selector: 'app-e-order-searchlist',
  templateUrl: './e-order-searchlist.component.html',
  styleUrls: ['./e-order-searchlist.component.scss'],
})
export class EOrderSearchlistComponent implements OnInit {
  // constructor(private _api: ApiService, public datepipe: DatePipe) { }
  @Input() customData: any;
  @Input('type') type: any;
  count: number;

  constructor(public eOrderServ: CpoeService) { }
  ngOnInit(): void { }

  markFavourite(element: any) {
    element.isFavourite = !element.isFavourite;
    element.icon = element.isFavourite ? 'star' : 'star_border';
    this.eOrderServ.createFavourite(element);
  }

}
