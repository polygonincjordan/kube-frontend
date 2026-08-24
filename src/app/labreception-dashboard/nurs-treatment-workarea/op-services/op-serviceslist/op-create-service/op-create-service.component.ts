import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { DataShareService } from '@services/data-share.service';
import { DataService } from '@services/data.service';
import { EventService } from '@services/event.service';
import { FeeListService } from '@services/fee-service/fee-list.service';
import { ActionType, WordType } from '@services/interfaces/common.enum';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'op-create-service',
  templateUrl: './op-create-service.component.html',
  styleUrls: ['./op-create-service.component.scss']
})
export class OpCreateServiceComponent implements OnInit {
  @Input('customData') customData: any;

  public data: any = [];
  public selectedDosageUnit: string;
  public createOdata: any = [];
  public selectedData: any;
  public actionTypeSubscription$: Subscription;
  constructor(
    public dataservice: DataService,
    public events: EventService,
    public feeListService: FeeListService,
    public modalService: BsModalService,
    private dataShareService: DataShareService,
  ) {
    this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe((data) => {
      if (data != null) {
        if (data.type == ActionType.Save$ && data.isAllow == true && data.value == WordType.CreateNewFeeServiceOrder) {
          this.createNewFeeServiceOrder();
        }
      }
    });
  }

  ngOnInit(): void { }

  public modalRef?: BsModalRef | null;

  public openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      id: 1,
      class: 'modal-lg',
    });
  }

  public findSelectedDosageUnit(dosageUnit: any[], defaultUnit: string) {
    let selectedUnit = dosageUnit.find((ele) => { ele.unit === defaultUnit });
    this.selectedDosageUnit = selectedUnit ? selectedUnit.unit : '';
  }

  public openComments(template: TemplateRef<any>, data) {
    this.modalRef = this.modalService.show(template, {
      id: 1,
      class: 'additional-info-temp modal-lg',
    });
    this.selectedData = data;
  }

  public createNewFeeServiceOrder() {
    this.feeListService.onCreateFeeOrder()
  }
}
