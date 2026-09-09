import { Component, Input, OnInit } from '@angular/core';
import { FeeListService } from '@services/fee-service/fee-list.service';

@Component({
  selector: 'app-services-list',
  templateUrl: './services-list.component.html',
  styleUrls: ['./services-list.component.scss']
})
export class ServicesListComponent implements OnInit {

  @Input('customData') customData: any;
  constructor(public feeListService: FeeListService) { }

  ngOnInit(): void { }

  markFavourite(element: any) {
    element.Favourite = !element.Favourite;
    element.icon = element.Favourite ? 'star' : 'star_border';
    this.feeListService.createFeeFavourite(element);
  }

}
