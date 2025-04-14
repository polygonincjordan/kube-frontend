import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-documenting-delivery',
  templateUrl: './documenting-delivery.component.html',
  styleUrls: ['./documenting-delivery.component.scss']
})
export class DocumentingDeliveryComponent implements OnInit {

  activeTab: string = 'deliverydata'; // Default tab
  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

}
