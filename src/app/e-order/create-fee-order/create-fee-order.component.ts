import { Component, Input } from '@angular/core';
import { eOrderService } from '@services/eorder.service';

@Component({
  selector: 'app-create-fee-order',
  templateUrl: './create-fee-order.component.html',
  styleUrls: ['./create-fee-order.component.scss'],
})
export class CreateFeeOrderComponent {
  @Input('customData') customData: any;
  constructor(public eorderService: eOrderService) {}
}
