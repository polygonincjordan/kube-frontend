import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { OrdersDashboardService } from '@services/orders-dashboard/orders-dashboard.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Subject, catchError, debounceTime, of } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-admission-orders',
  templateUrl: './admission-orders.component.html',
  styleUrls: ['./admission-orders.component.scss']
})
export class AdmissionOrdersComponent implements OnInit {

  @Input() admissionOrderForm: FormGroup;
  @Input() admissionOrderFormArray: FormArray;
  @Input() assignUsersList
  @Input() selectedSubTitleData;

  @Output() realoadData = new EventEmitter();
  @ViewChild('deleteModal') deleteModal: any;

  public searchTermTreatmentOU = new Subject<string>();
  public searchTermDepartmentOU = new Subject<string>();

  treatmentOUList: any = [];
  departmentOUList: any = [];
  selectedOrderIndex: any;
  isFormSubmitted: boolean = false;

  modalRef: BsModalRef;

  constructor(private orderDashboardService: OrdersDashboardService, private modalService: BsModalService) { }

  ngOnInit(): void {
    this.searchEventForTreatmentOU();
    this.searchEventForDepartmentOU();
    this.admissionOrderForm.valueChanges.subscribe(() => { this.isFormSubmitted = true });
  }

  searchEventForTreatmentOU() {
    this.searchTermTreatmentOU.pipe(debounceTime(2000)).subscribe((term) => {
      if (term !== '' && term !== null && term.length >= 3) {
        this.orderDashboardService.getTreatmentOUList('01', term).subscribe({
          next: (resp: any) => {
            this.treatmentOUList = resp?.d?.results;
          },
        });
      }
    });
  }

  searchEventForDepartmentOU() {
    this.searchTermDepartmentOU.pipe(debounceTime(2000)).subscribe((term) => {
      if (term !== '' && term !== null && term.length >= 3) {
        this.orderDashboardService.getDepartmentOUList('01', term).subscribe({
          next: (resp: any) => {
            this.departmentOUList = resp?.d?.results;
          },
        });
      }
    });
  }

  selectOrderIndex(index, value) {
    if (this.selectedOrderIndex == index) {
      this.selectedOrderIndex = undefined;
    } else this.selectedOrderIndex = index;
  }

  onSelectTreatmentOU(value, index) {
    if(value) {
      this.admissionOrderFormArray.controls[index].patchValue({
        Trtoe: value.Orgid,
        TrtoeText: value.Orgna,
      });
    } else {
      this.admissionOrderFormArray.controls[index].patchValue({
        Trtoe: '',
        TrtoeText: '',
      });
    }
  }

  onSelectDepartmentOU(value, index) {
    if(value) {
      this.admissionOrderFormArray.controls[index].patchValue({
        Orgfa: value.Orgid,
        OrgfaText: value.Orgna,
      });
    } else {
      this.admissionOrderFormArray.controls[index].patchValue({
        Orgfa: '',
        OrgfaText: '',
      });
    }
  }

  onSelectSurgeon(value, index) {
    if(value) {
      this.admissionOrderFormArray.controls[index].patchValue({
        Trtgp: value.Gpart,
        TrtgpName: value.NamString,
      });
    } else {
      this.admissionOrderFormArray.controls[index].patchValue({
        Trtgp: '',
        TrtgpName: '',
      });
    }
  }

  setInputTitle(value: any) {
    if(value) return value;
    else return '';
  }

  removeAdmissionOrdersModal() {
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-diagnosis',
    };
    let controlArray = <FormArray>this.admissionOrderForm.controls['admissionOrderFormArray'];
    if (controlArray.value[this.selectedOrderIndex]?.Seqno) {
      this.modalRef = this.modalService.show(this.deleteModal, config);
    } else {
      controlArray.removeAt(this.selectedOrderIndex);
      this.selectedOrderIndex = undefined;
    }
  }

  removeClinicalTabAPi() {
    let controlArray = <FormArray>this.admissionOrderForm.controls['admissionOrderFormArray'];
    controlArray.controls[this.selectedOrderIndex].get('Delete').setValue(true);
    let payload: any = {
      Id: this.selectedSubTitleData.data.Id,
      ToAdm: controlArray.value
    };

    this.orderDashboardService
      .saveOrderConfigurationData(payload)
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((data: any) => {
        this.selectedOrderIndex = undefined;
        this.modalRef.hide();
        this.realoadData.emit(data);
      });
  }
}
