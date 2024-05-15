import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-icon-nav-tab',
  templateUrl: './icon-nav-tab.component.html',
  styleUrls: ['./icon-nav-tab.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class IconNavTabComponent implements OnInit {
  @Input() title = '';
  @Input() subText: string | number = '';
  @Input() url = '';
  @Output() onClickBox = new EventEmitter();
  constructor() { }

  ngOnInit(): void {
  }

  clickBox(){
    this.onClickBox.emit();
  }

}
