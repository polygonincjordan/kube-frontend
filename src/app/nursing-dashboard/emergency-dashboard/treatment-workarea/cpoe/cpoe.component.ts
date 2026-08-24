import { Component, OnInit } from '@angular/core';
import { CpoeService } from '@services/emergency-dashboard/cpoe.service';
import { SidebarService } from '@services/sidebar.service';
@Component({
  selector: 'app-cpoe',
  templateUrl: './cpoe.component.html',
  styleUrls: ['./cpoe.component.css']
})
export class CpoeComponent implements OnInit {
  constructor(public sidebarService: SidebarService,
    private eOrderServ: CpoeService) { }
  ngOnInit() {
    this.eOrderServ.loadeOrderData();
  }
}
