import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';

@Component({
  selector: 'app-icon-box-side-menu',
  templateUrl: './icon-box-side-menu.component.html',
  styleUrls: ['./icon-box-side-menu.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class IconBoxSideMenuComponent implements OnInit {
  @Input() title = '';
  @Input() url = '';
  constructor() { }

  ngOnInit(): void {
  }

}
