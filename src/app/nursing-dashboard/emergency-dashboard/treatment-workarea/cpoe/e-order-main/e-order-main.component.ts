import { Component, ViewChild } from '@angular/core';
import { eOrderService } from '@services/eorder.service';
import { EventService } from '@services/event.service';
import { OrganizationUnitComponent } from '../organization-unit/organization-unit.component';
import { CpoeService } from '@services/emergency-dashboard/cpoe.service';

@Component({
  selector: 'app-e-order-main',
  templateUrl: './e-order-main.component.html',
  styleUrls: ['./e-order-main.component.scss'],
})
export class EOrderMainComponent {
  searchString: string;
  searchMedString: string;
  labOrdersSearchList: any;
  radOrdersSearchList: any;
  procedureSearchList: any;
  eOrders: any;
  historyOrders: any;
  searchFeestring: any;
  modalService: any;
  @ViewChild('organizationUnit', { static: true }) organizationUnit: OrganizationUnitComponent;

  constructor(public CpoeService: CpoeService) {
    this.CpoeService.isFilterDataPopup.subscribe((data) => {
      this.organizationUnit.showPopup(data)
      this.organizationUnit.onClosetempl.subscribe((item)=>{
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
}
