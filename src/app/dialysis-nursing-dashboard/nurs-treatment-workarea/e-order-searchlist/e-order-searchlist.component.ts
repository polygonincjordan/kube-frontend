import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { eOrderService } from '@services/eorder.service';

@Component({
  selector: 'app-e-order-searchlist',
  templateUrl: './e-order-searchlist.component.html',
  styleUrls: ['./e-order-searchlist.component.scss'],
})
export class EOrderSearchlistComponent implements OnInit{
  // constructor(private _api: ApiService, public datepipe: DatePipe) { }
  @Input() customData: any;
  @Input('type') type: any;

  constructor(public eOrderServ: eOrderService) {  }
  ngOnInit(): void {  }

  markFavourite(element: any) {
    element.isFavourite = !element.isFavourite;
    element.icon = element.isFavourite ? 'star' : 'star_border';
    this.eOrderServ.createFavourite(element);
  }
}
