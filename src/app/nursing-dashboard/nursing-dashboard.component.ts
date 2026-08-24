import { Component, OnInit } from '@angular/core';
import { FloorsWardsService } from '@services/floors-wards/floors-wards.service';

@Component({
  selector: 'app-nursing-dashboard',
  templateUrl: './nursing-dashboard.component.html',
  styleUrls: ['./nursing-dashboard.component.scss']
})
export class NursingDashboardComponent implements OnInit {
  showprofilemenu = false;
  profileResponse: any;
  constructor(public floorsWardsService:FloorsWardsService) { }

  ngOnInit(): void {
  }

  // openProfileMenu($event) {
  //   this.showprofilemenu = !this.showprofilemenu
  //   $event.stopPropagation();
  //   if (this.showprofilemenu) {
  //     // this.showprofilemenu = true;
  //     this.sideWidget = false;
  //   } else {
  //     // this.showprofilemenu = true;
  //   }
  // }

}
