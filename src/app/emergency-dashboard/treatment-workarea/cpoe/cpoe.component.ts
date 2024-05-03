import { Component, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CpoeService } from './../../../services/emergency-dashboard/cpoe.service';
import { SidebarService } from '@services/sidebar.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-cpoe',
  templateUrl: './cpoe.component.html',
  styleUrls: ['./cpoe.component.css']
})
export class CpoeComponent implements OnInit {
  private subscription: Subscription;
 constructor( public sidebarService: SidebarService,
  private eOrderServ: CpoeService, private route: ActivatedRoute){}
 ngOnInit() {
  this.eOrderServ.loadeOrderData();
  this.subscription =  this.route.queryParams.subscribe(()=>{
    this.eOrderServ.loadeOrderData();
  })
 }
 ngOnDestroy() {
  if (this.subscription) {
    this.subscription.unsubscribe();
  }
}
}
