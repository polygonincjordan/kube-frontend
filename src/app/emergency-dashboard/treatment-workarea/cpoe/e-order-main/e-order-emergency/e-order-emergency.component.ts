import { Component, OnInit, ViewChild } from '@angular/core';
import { CpoeService } from '@services/emergency-dashboard/cpoe.service';
import { OrganizationUnitComponent } from '../../organization-unit/organization-unit.component';

@Component({
  selector: 'e-order-emergency',
  templateUrl: './e-order-emergency.component.html',
  styleUrls: ['./e-order-emergency.component.scss']
})
export class EOrderEmergencyComponent {

  searchString: string;
  searchMedString: string;
  labOrdersSearchList: any;
  radOrdersSearchList: any;
  procedureSearchList: any;
  eOrders: any;
  historyOrders: any;
  showPatients = false;
  searchFeestring: any;
  modalService: any;
  @ViewChild('organizationUnit', { static: true }) organizationUnit: OrganizationUnitComponent;

  constructor(public CpoeService: CpoeService) {
    this.CpoeService.isFilterDataPopup.subscribe((data) => {
      this.organizationUnit.showPopup(data)
      this.organizationUnit.onClosetempl.subscribe((item) => {
        const SelectedData = {
          ...data,
          defaultOrgCode: item.OrgfaDefault,
          defaultOrgDescription: item.OrgfaDescr,
          treatingUnitCode: item.Trtoe,
          treatingUnitDescription: item.TrtoeDescr
        }
        this.CpoeService.onInsertOrder(SelectedData);
      })
    })
  }


  showhidePatients() {
    this.showPatients = !this.showPatients;
  }

}
