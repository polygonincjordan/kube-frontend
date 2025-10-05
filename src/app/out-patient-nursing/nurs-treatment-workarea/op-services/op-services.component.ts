import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataShareService } from '@services/data-share.service';
import { FeeListService } from '@services/fee-service/fee-list.service';
import { FeeList } from '@services/fee-service/interface/fee-list.interface';
import { ActionType, WordType } from '@services/interfaces/common.enum';
import Swal from 'sweetalert2';

@Component({
  selector: 'op-services',
  templateUrl: './op-services.component.html',
  styleUrls: ['./op-services.component.scss']
})
export class OpServicesComponent implements OnInit {

  public searchFeestring: any;
  public feeDetailsList: Array<any> = [];
  public filteredFeeDetailsList: Array<FeeList> = [];

  private paramsValue: any;


  constructor(
    private dataShareService: DataShareService,
    public feeListService: FeeListService,
    private route: ActivatedRoute,
  ) {

    this.route.queryParams.subscribe((params) => {
      this.paramsValue = params;
    });

  }

  ngOnInit(): void {
    this.feeListService.onNavigationClick('Fees')
  }

  public clearSearch() {
    this.searchFeestring = '';
    this.feeListService.searchFeeData('')
    // Add any additional logic you need here
  }

  public create() {
    Swal.fire({
      title: 'Confirm',
      text: 'Are You Sure to Add New Services?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      // customClass: 'myalertpopup'
    }).then(async (result) => {
      if (result.value) {
        this.dataShareService.sendActionType(ActionType.Save$, true, WordType.CreateNewFeeServiceOrder);
      }
    });
  }

  public cancel() {
    this.feeListService.onCancelOrder();
  }

  public refresh() {
    this.feeListService.loadeOrderData();
  }
}
