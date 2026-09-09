import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dislike-preference-new',
  templateUrl: './dislike-preference.component.html',
  styleUrls: ['./dislike-preference.component.scss']
})
export class DislikePreferenceComponentNew implements OnInit {
  modalType: string;
  sidenavWidth: string = '0';
  mainMarginLeft: string = '0';

  dislikePreferenceList = [
    {
      type: "Preference",
      description: 'test'
    }
  ]

  constructor() { }

  ngOnInit(): void {
  }

  createNewDiet(type: string) {
    this.modalType = type;
    this.openNav();
  }

  openNav() {
    this.sidenavWidth = '480px';
    this.mainMarginLeft = '480px';
    document.body.style.backgroundColor = 'rgba(0,0,0,0.4)';
  }

  closeNav() {
    this.sidenavWidth = '0';
    this.mainMarginLeft = '0';
    document.body.style.backgroundColor = 'white';
  }
}
