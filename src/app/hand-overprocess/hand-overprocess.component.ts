import { Component, QueryList, ViewChildren } from '@angular/core';
import { PopoverDirective } from 'ngx-bootstrap/popover';

@Component({
  selector: 'hand-overprocess',
  templateUrl: './hand-overprocess.component.html',
  styleUrls: ['./hand-overprocess.component.scss']
})
export class HandOverprocessComponent {
  constructor() { }
  @ViewChildren(PopoverDirective) popovers: QueryList<PopoverDirective>;
  closePopover(popover: any) {popover.hide();}
  askQuestion(popovers: any) {if (popovers) { this.popovers.forEach(p => p.hide()); } else { return }}

}

