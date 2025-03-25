import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-time-out-checklist',
  templateUrl: './time-out-checklist.component.html',
  styleUrls: ['./time-out-checklist.component.scss']
})
export class TimeOutChecklistComponent implements OnInit {

  tabList = [
    'Procedure Details',
    'Following were verified',
    'For Dental Department',
  ];
  selectedTabName: string = 'Procedure Details';
  constructor() { }

  ngOnInit(): void {
  }

  assessmentTabSelect(type: string) {
    this.selectedTabName = type;
  }
}
