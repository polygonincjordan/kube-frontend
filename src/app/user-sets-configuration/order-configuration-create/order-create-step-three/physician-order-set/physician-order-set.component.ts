import { Component, Input, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { EEmrService } from '@services/e-emr.service';
import { OrdersDashboardService } from '@services/orders-dashboard/orders-dashboard.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { catchError, of } from 'rxjs';
@UntilDestroy()
@Component({
  selector: 'app-physician-order-set',
  templateUrl: './physician-order-set.component.html',
  styleUrls: ['./physician-order-set.component.scss'],
})
export class PhysicianOrderSetComponent implements OnInit {
  @Input() selectedSubTitleData: any;
  @Input() physicianOrderForm: FormGroup;
  @Input() physicianOrderList: FormArray;
  @Input() occupationGroupList;
  @Output() realoadData = new EventEmitter();
  @Input() fieldTouchPhy: any
  isFormSubmitted: boolean = false;

  @Input() isFormSubmittedPhy = false

  @ViewChild('deletePhysicianModal') deletePhysicianModal: any;
  modalRefForPhysician: BsModalRef;

  selectedPhyOrderIndex: any;
  phyOrderDetails: any[];
  constructor(
    public modalService: BsModalService,
    private _ordersDashboardService: OrdersDashboardService
  ) {}

  ngOnInit(): void {
    this.physicianOrderForm.valueChanges.subscribe(()=> {this.isFormSubmitted = true})
  }

  selectedphyOrderData(item, index) {
    if (this.selectedPhyOrderIndex == index)
      this.selectedPhyOrderIndex = undefined;
    else this.selectedPhyOrderIndex = index;
  }

  removePhysicianModal() {
    let controlArray = <FormArray>this.physicianOrderForm.get('physicianOrderList');
      if (controlArray.value[this.selectedPhyOrderIndex].Seqno) {
        const config: ModalOptions = { class: 'modal-dialog-centered modal-diagnosis' };
        this.modalRefForPhysician = this.modalService.show(this.deletePhysicianModal, config);
      } else{
        controlArray.removeAt(this.selectedPhyOrderIndex);
        this.selectedPhyOrderIndex = undefined;
      }
  }

  get phyOrderListArray(): FormArray {
    return this.physicianOrderForm.get('physicianOrderList') as FormArray;
  }

  onSelectedOccuption(event, index) {
    if(event) {
      this.phyOrderListArray.controls[index].patchValue({
        ProfGroupText: event.Text,
      });
    } else {
      this.phyOrderListArray.controls[index].patchValue({
        ProfGroupText: 'NURS',
      });
    }
  }

  removeDiagnosisAPi() {
    let controlArray = <FormArray>(this.physicianOrderForm.get('physicianOrderList'));
    controlArray.controls[this.selectedPhyOrderIndex].get('Delete').setValue(true);
    let payload = {
      Id: this.selectedSubTitleData.data.Id,
      ToPhyOrd: {
        results: [controlArray.value[this.selectedPhyOrderIndex]],
      },
    };

    this._ordersDashboardService
      .saveOrderConfigurationData(payload)
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((data: any) => {
        this.selectedPhyOrderIndex = undefined;
        this.modalRefForPhysician.hide();
        this.realoadData.emit(data);
      });
  }

  titleShow(value) {
    const data = this.occupationGroupList?.find((x) => {
      return x.Group == value;
    });
    return data?.Text;
  }

  onFieldFocus(index) {
    this.fieldTouchPhy[index] = true;
  }

}
