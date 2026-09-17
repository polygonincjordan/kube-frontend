import { Component } from '@angular/core';
import { CpoeService } from '@services/emergency-dashboard/cpoe.service';

/**
 * The emergency e-Orders nav carries the refresh control only. The configuration
 * is edited in the consultant dashboard; this screen just displays the tabs that
 * configuration enables.
 */
@Component({
  selector: 'app-e-order-nav',
  templateUrl: './e-order-nav.component.html',
  styleUrls: ['./e-order-nav.component.scss'],
})
export class EOrderNavComponent {
  constructor(public eorderService: CpoeService) {}
}
