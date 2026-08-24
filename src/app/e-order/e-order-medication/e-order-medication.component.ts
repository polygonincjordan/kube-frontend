import { Component, Input } from '@angular/core';
import { eOrderService } from '@services/eorder.service';

@Component({
  selector: 'app-e-order-medication',
  templateUrl: './e-order-medication.component.html',
  styleUrls: ['./e-order-medication.component.scss'],
})
export class EOrderMedicationComponent {
  @Input('customData') customData: any;
  constructor(public eOrderServ: eOrderService) {}
  markFavourite(element: any) {
    element.Favourite = !element.Favourite;
    element.icon = element.Favourite ? 'star' : 'star_border';
    this.eOrderServ.createFavouriteEPresc(element);
  }
}
