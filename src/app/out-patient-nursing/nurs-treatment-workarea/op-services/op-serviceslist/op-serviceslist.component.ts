import { Component, Input, OnInit } from '@angular/core';
import { FeeListService } from '@services/fee-service/fee-list.service';

@Component({
  selector: 'op-serviceslist',
  templateUrl: './op-serviceslist.component.html',
  styleUrls: ['./op-serviceslist.component.scss']
})
export class OpServiceslistComponent implements OnInit {
  @Input('customData') customData: any;
  constructor(public feeListService: FeeListService) { }

  ngOnInit(): void { }

  markFavourite(element: any) {
    element.Favourite = !element.Favourite;
    element.icon = element.Favourite ? 'star' : 'star_border';
    this.feeListService.createFeeFavourite(element);
  }


}
