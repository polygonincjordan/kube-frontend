import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { OrdersDashboardService } from '@services/orders-dashboard/orders-dashboard.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Subject, catchError, debounceTime, of } from 'rxjs';
@UntilDestroy()
@Component({
  selector: 'app-surgery-orders',
  templateUrl: './surgery-orders.component.html',
  styleUrls: ['./surgery-orders.component.scss'],
})
export class SurgeryOrdersComponent implements OnInit {
  @Input() surgeryForm: FormGroup;
  @Input() surgeryListForm: FormArray;
  @Input() assignUsersList;  
  @Input() selectedSubTitleData;
  @Input() isFormSubmittedSurgery = false;
  @Input() fieldTouchSurgery: any;
  @Output() realoadData = new EventEmitter();
  public searchTerm = new Subject<string>();
  public searchTermTreatmentOU = new Subject<string>();
  public searchTermDepartmentOU = new Subject<string>();
  @ViewChild('deleteModal') deleteModal: any;
  isFormSubmitted: boolean = false;

  serviceTextList: any = [];
  treatmentOUList: any = [];
  departmentOUList: any = [];
  selectedOrderIndex: any;
  modalRef: BsModalRef;


  constructor(private orderDashboardService: OrdersDashboardService, private modalService: BsModalService) {}

  ngOnInit(): void {
    this.subscribeSearchEvent();
    this.searchEventForTreatmentOU();
    this.searchEventForDepartmentOU();
    this.surgeryForm.valueChanges.subscribe(() => { this.isFormSubmitted = true });
  }

  subscribeSearchEvent() {
    this.searchTerm.pipe(debounceTime(2000)).subscribe((term) => {
      if (term !== '' && term !== null && term.length >= 3) {
        this.orderDashboardService.getServiceTextList('06', term).subscribe({
          next: (resp: any) => {
            this.serviceTextList = resp?.d?.results;
          },
        });
      }
    });
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

  onSelectService(value, index) {
    if(value) {
      this.surgeryFormArray.controls[index].patchValue({
        Talst: value.Talst,
        ServiceText: value.Ktext,
      });
    } else {
      this.surgeryFormArray.controls[index].patchValue({
        Talst: '',
        ServiceText: '',
      });
    }
  }

  onSelectTreatmentOU(value, index) {
    if(value) {
      this.surgeryFormArray.controls[index].patchValue({
        Trtoe: value.Orgid,
        TrtoeText: value.Orgna,
      });
    } else {
      this.surgeryFormArray.controls[index].patchValue({
        Trtoe: '',
        TrtoeText: '',
      });
    }
  }

  onSelectDepartmentOU(value, index) {
    if(value) {
      this.surgeryFormArray.controls[index].patchValue({
        Orgfa: value.Orgid,
        OrgfaText: value.Orgna,
      });
    } else {
      this.surgeryFormArray.controls[index].patchValue({
        Orgfa: '',
        OrgfaText: '',
      });
    }
  }

  onSelectSurgeon(value, index) {
    if(value) {
      this.surgeryFormArray.controls[index].patchValue({
        Surgeon: value.Gpart,
        SurgeonName: value.NamString,
      });
    } else {
      this.surgeryFormArray.controls[index].patchValue({
        Surgeon: '',
        SurgeonName: '',
      });
    }
  }

  selectOrderIndex(index, value) {
    if (this.selectedOrderIndex == index) {
      this.selectedOrderIndex = undefined;
    } else this.selectedOrderIndex = index;
  }

  removeSurgeryOrdersModal() {
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-diagnosis',
    };
    let controlArray = <FormArray>this.surgeryForm.controls['surgeryListForm'];
    if (controlArray.value[this.selectedOrderIndex]?.Seqno) {
      this.modalRef = this.modalService.show(this.deleteModal, config);
    } else {
      controlArray.removeAt(this.selectedOrderIndex);
      this.selectedOrderIndex = undefined;
    }
  }

  removeClinicalTabAPi() {
    let controlArray = <FormArray>this.surgeryForm.controls['surgeryListForm'];
    controlArray.controls[this.selectedOrderIndex].get('Delete').setValue(true);
    let payload: any = {
      Id: this.selectedSubTitleData.data.Id,
      ToSurgy: controlArray.value
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

  get surgeryFormArray(): FormArray {
    return this.surgeryForm.get('surgeryListForm') as FormArray;
  }

  setInputTitle(value: any) {
    if(value) return value;
    else return '';
  }

  onFieldFocus(index) {
    this.fieldTouchSurgery[index] = true;
  }

}
