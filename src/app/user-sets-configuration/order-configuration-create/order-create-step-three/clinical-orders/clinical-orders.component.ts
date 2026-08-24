import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { OrdersDashboardService } from '@services/orders-dashboard/orders-dashboard.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Subject, catchError, debounceTime, of } from 'rxjs';
@UntilDestroy()
@Component({
  selector: 'app-clinical-orders',
  templateUrl: './clinical-orders.component.html',
  styleUrls: ['./clinical-orders.component.scss'],
})
export class ClinicalOrdersComponent implements OnInit {
  @Input() clinicalForm: FormGroup;
  @Input() laboratoyFormArray: FormArray;
  @Input() radiologyFormArray: FormArray;
  @Input() proceduresFormArray: FormArray;
  @Input() selectedSubTitleData;
  @Output() realoadData = new EventEmitter();
  @ViewChild('deleteModal') deleteModal: any;
  modalRef: BsModalRef;

  @Input() fieldTouchLab: any;
  @Input() fieldTouchRad: any;
  @Input() fieldTouchProce: any;

  public searchTerm = new Subject<string>();

  selectedTabName: string = 'laboratory';
  selectedOrderIndex: number;
  localizationListOrderSet: any;
  serviceTextList: any = [];
  category: string = '01';
  isFormSubmitted: boolean = false;
  @Input() isFormSubmittedLab: boolean = false;
  @Input() isFormSubmittedRad: boolean = false;
  @Input() isFormSubmittedProc: boolean = false;


  procedureCategoryList = [
    {
      name: 'Procedure',
      value: '03' 
    },
    {
      name: 'Service',
      value: '04' 
    }
  ]

  constructor(
    private ePrescriptionService: EPrescriptionService,
    public orderDashboardService: OrdersDashboardService,
    public modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.localizationForOrderSets();
    this.subscribeSearchEvent();
    this.clinicalForm.get('laboratoyFormArray').valueChanges.subscribe((res) => { console.log(res, "-"); this.isFormSubmitted = true });
    this.clinicalForm.get('radiologyFormArray').valueChanges.subscribe((res) => { console.log(res, "-"); this.isFormSubmitted = true });
    this.clinicalForm.get('proceduresFormArray').valueChanges.subscribe((res) => { console.log(res, "-"); this.isFormSubmitted = true });

    setTimeout(() => {
    }, 10000);

    if(this.orderDashboardService.isActiveLaboratory) {
      this.changeTab('laboratory');
    }
    if(this.orderDashboardService.isActiveRadiology) {
      this.changeTab('radiology');
    }
    if(this.orderDashboardService.isActiveProcedures) {
      this.changeTab('procedures');
    }
  }

  checkLab(lab) {
    console.log(lab, this.laboratoyFormArray);
  }
  changeTab(tabName: string) {
    if (tabName == 'radiology') {
      this.selectedTabName = 'radiology';
      this.category = '02';
      this.orderDashboardService.isActiveRadiology = true;
      this.orderDashboardService.isActiveProcedures = false;
      this.orderDashboardService.isActiveLaboratory = false;
    } else if (tabName == 'procedures') {
      this.selectedTabName = 'procedures';
      // this.category = '04';
      this.category = '03';
      this.orderDashboardService.isActiveRadiology = false;
      this.orderDashboardService.isActiveProcedures = true;
      this.orderDashboardService.isActiveLaboratory = false;
    } else {
      this.selectedTabName = 'laboratory';
      this.category = '01';
      this.orderDashboardService.isActiveRadiology = false;
      this.orderDashboardService.isActiveProcedures = false;
      this.orderDashboardService.isActiveLaboratory = true;
    }
    this.serviceTextList = [];
    this.selectedOrderIndex = undefined;
  }

  localizationForOrderSets() {
    this.ePrescriptionService
      .getData(`e-prescription/LocalizationSet`)
      .subscribe((resp: any) => {
        this.localizationListOrderSet = resp.body.d.results;
      });
  }

  onFieldFocus(index, formType) {
    if(formType == 'lab') this.fieldTouchLab[index] = true;
    if(formType == 'rad') this.fieldTouchRad[index] = true;
    if(formType == 'proce') this.fieldTouchProce[index] = true; 
  }

  onSelectLocalization(event, index) {
    if (event) {
      this.getClinicalFormList('radiologyFormArray').controls[index].patchValue({
        LocalizationText: event.Dialotext,
        Localization: event.Dialo
      });
    }
  }

  selectOrderIndex(index, item) {
    if (this.selectedOrderIndex == index) {
      this.selectedOrderIndex = undefined;
    } else this.selectedOrderIndex = index;
  }

  removeClinicalOrders() {
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-diagnosis',
    };
    let controlArray = this.getControls();
    if (controlArray.value[this.selectedOrderIndex]?.Seqno) {
      this.modalRef = this.modalService.show(this.deleteModal, config);
    } else {
      controlArray.removeAt(this.selectedOrderIndex);
      this.selectedOrderIndex = undefined;
    }
  }

  removeClinicalTabAPi() {
    let controlArray = this.getControls();
    controlArray.controls[this.selectedOrderIndex].get('Delete').setValue(true);
    let payload: any = {
      Id: this.selectedSubTitleData.data.Id,
    };
    if(this.orderDashboardService.isActiveLaboratory) payload.ToLab = controlArray.value
    if(this.orderDashboardService.isActiveRadiology) payload.ToRad = controlArray.value
    if(this.orderDashboardService.isActiveProcedures) payload.ToServices = controlArray.value

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

  getControls() {
    if (this.orderDashboardService.isActiveLaboratory) {
      return <FormArray>this.clinicalForm.controls['laboratoyFormArray'];
    } else if (this.orderDashboardService.isActiveProcedures) {
      return <FormArray>this.clinicalForm.controls['proceduresFormArray'];
    } else {
      return <FormArray>this.clinicalForm.controls['radiologyFormArray'];
    }
  }

  onSelectService(event, index) {
    if(this.orderDashboardService.isActiveLaboratory) {
      this.getClinicalFormList('laboratoyFormArray').controls[index].patchValue({
        Talst: event.Talst,
        ServiceText: event.Ktext,
        Trtoe: event.Trtoe
      });
    
    } else if(this.orderDashboardService.isActiveProcedures) {
      this.getClinicalFormList('proceduresFormArray').controls[index].patchValue({
        Service: event.Talst,
        ServiceText: event.Ktext,
        Trtoe: event.Trtoe
      });
    } else {
      this.getClinicalFormList('radiologyFormArray').controls[index].patchValue({
        Talst: event.Talst,
        ServiceText: event.Ktext,
        Trtoe: event.Trtoe
      });
    }
  }

  getClinicalFormList(formArrayName) {
    return this.clinicalForm?.get(formArrayName) as FormArray;
  }


  subscribeSearchEvent() {
    this.searchTerm.pipe(debounceTime(2000)).subscribe((term) => {
      if (term !== '' && term !== null && term.length >= 3) {
        this.orderDashboardService.getServiceTextList(this.category, term)
          .subscribe({
            next: (resp: any) => {
                this.serviceTextList = resp?.d?.results;
            },
          });
      }
    });
  }

  onSelect(event: string, index: number) {
    if(!event) {
      this.getClinicalFormList('proceduresFormArray').controls[index].patchValue({
        Category: '03'
      });
    } 
  }

  setInputTitle(value: any) {
    if(value) return value;
    else return '';
  }

  dropDownInputTitle(type: string, value: any) {
    if(type == 'localization' && value) {
      let local = this.localizationListOrderSet.find(element => element.Dialo == value);
      return local.Dialotext;
    }
    if(type == 'category' && value) {
      let local = this.procedureCategoryList.find(element => element.value == value);
      return local.name;
    }
  }
}
