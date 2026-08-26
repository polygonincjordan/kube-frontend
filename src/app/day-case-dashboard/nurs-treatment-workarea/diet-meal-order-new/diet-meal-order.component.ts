import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-diet-meal-order-new',
  templateUrl: './diet-meal-order.component.html',
  styleUrls: ['./diet-meal-order.component.scss'],
})
export class DietMealOrderComponentNew implements OnInit {
  activeTab = '';
  constructor() {}

  ngOnInit(): void {
    this.tabPanelNavigation('patients-diet-meal');
  }

  tabPanelNavigation(name: string) {
    this.activeTab = name;
  }
}
