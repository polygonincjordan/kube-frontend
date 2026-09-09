import { Component, Input, OnInit, SimpleChanges, Output, EventEmitter, ViewChild} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { AdmissionService } from '@services/admission/admission.service';
import { OrdersDashboardService } from '@services/orders-dashboard/orders-dashboard.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Subject, catchError, debounceTime, of } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-diagnosis-order',
  templateUrl: './diagnosis-order.component.html',
  styleUrls: ['./diagnosis-order.component.scss'],
})
export class DiagnosisOrderComponent implements OnInit {
  @Input() selectedSubTitleData;
  @Output() diangosisData = new EventEmitter();
  @Output() realoadData = new EventEmitter();
  @Output() diagnosisData = new EventEmitter();
  @ViewChild('deleteDIagnosisModal') deleteDIagnosisModal: any;
  @Input() diagnosisForm: FormGroup;
  @Input() diagnosisFormList: FormArray;
  @Input() fieldTouchDiagnosis: any;

  public searchCodeTypeHead = new Subject<string>();
  modalRefForDiagnosis: BsModalRef;
  
  diagnosisSearchList: any[];
  subTitleDetails: any;
  selectedOrderIndex: any;
  isFormSubmitted: boolean = false;
  
  treatmentValue: any = [
    {
      label: 'Treatment',
      value: false,
    },
    {
      label: 'Referral',
      value: true,
    },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private _admissionService: AdmissionService,
    private _ordersDashboardService: OrdersDashboardService,
    public modalService: BsModalService
  ) {}

  ngOnInit(): void { 
    this.diagnosisCodeList();
    this.diagnosisForm.valueChanges.subscribe(() => { this.isFormSubmitted = true });
  }

  bindValue(diagnosisValue) {
    let controlArray = <FormArray>(this.diagnosisForm.controls['diagnosisFormList']);
    diagnosisValue.forEach((element) => {
      if (this.subTitleDetails.Stid == element.Stid) {
        this.addItem(element);
      }
    });
    if (controlArray.value.length === 0) {
      this.diagnosisFormDetails('');
    }
  }

  diagnosisFormDetails(diagnosisValue) {
    for (let index = 0; index < 3; index++) {
      this.addItem(diagnosisValue);
    }
  }

  addItem(diagnosisValue): void {
    this.diagnosisFormList = this.diagnosisForm?.get( 'diagnosisFormList') as FormArray;
    this.diagnosisFormList.push(this.creatDiagnosisFormData(diagnosisValue));
  }

  creatDiagnosisFormData(value): FormGroup {
    return this.formBuilder.group({
      Id: [this.selectedSubTitleData?.data?.Id],
      Stid: [this.subTitleDetails?.Stid],
      Seqno: [value.Seqno ? value.Seqno : ''],
      DiagKey1: [value.DiagKey1 ? value.DiagKey1 : '', [Validators.required]],
      Dtext1: [value.Dtext1 ? value.Dtext1 : '', [Validators.required]],
      DiagText: [value.DiagText ? value.DiagText : '', [Validators.required]],
      ShortText: [value.ShortText ? value.ShortText : ''],
      ReferralDia: [value.ReferralDia ? value.ReferralDia : false],
      TreatmentDia: [value.TreatmentDia ? value.TreatmentDia : false],
      AdmissionDia: [value.AdmissionDia ? value.AdmissionDia : false],
      DischargeDia: [value.DischargeDia ? value.DischargeDia : false],
      SurgeryDia: [value.SurgeryDia ? value.SurgeryDia : false],
      PreopDiagInd: [value.PreopDiagInd ? value.PreopDiagInd : false],
      Autoselect: [value.Autoselect ? value.Autoselect : true],
      Delete: [value.Delete ? value.Delete : false],
    });
  }

  onSelectMedicine(event: any, index: any) {
    if (event) {
      this.diagnosisFormArray.controls[index].patchValue({
        Dtext1: event.Dtext1,
        DiagKey1: event.Dkey,
        Favorite: event.Favorite,
      });
      this.diagnosisFormArray.controls[index].get('DiagText').clearValidators();
    } else{
      this.diagnosisFormArray.controls[index].patchValue({Dtext1: ''});
      this.diagnosisFormArray.controls[index].get('DiagText').setValidators([Validators.required]);
    }
    this.diagnosisFormArray.controls[index].get('DiagText').updateValueAndValidity();
    this.diagnosisSearchList = [];
  }

  get diagnosisFormArray(): FormArray {
    return this.diagnosisForm.get('diagnosisFormList') as FormArray;
  }

  diagnosisTextValid(event, index) {
    if(event.value) {
      this.diagnosisFormArray.controls[index].get('DiagKey1').clearValidators();
      this.diagnosisFormArray.controls[index].get('Dtext1').clearValidators();
    } else{      
      this.diagnosisFormArray.controls[index].get('DiagKey1').setValidators([Validators.required]);
      this.diagnosisFormArray.controls[index].get('Dtext1').setValidators([Validators.required]);
    }
    this.diagnosisFormArray.controls[index].get('DiagKey1').updateValueAndValidity();
    this.diagnosisFormArray.controls[index].get('Dtext1').updateValueAndValidity();
}

  diagnosisCodeList() {
    this.searchCodeTypeHead.pipe(debounceTime(1000)).subscribe((term) => {
      if (term) {
        this._admissionService.searchDiagnosis(term)
          .subscribe((result: any) => {
            if (result.d.results) {
              this.diagnosisSearchList = result.d.results;
            }
          });
      }
    });
  }

  selectTreatMent(event, index) {
    if (event) {
      this.diagnosisFormArray.controls[index].patchValue({
        TreatmentDia: true,
        ReferralDia: false,
      });
    } else {
      this.diagnosisFormArray.controls[index].patchValue({
        TreatmentDia: false,
        ReferralDia: true,
      });
    }
  }

  clearFormArray = (formArray: FormArray) => {
    if (formArray) {
      while (formArray.length !== 0) {
        formArray.removeAt(0);
      }
    }
  };

  selecteDiagnosis(index: number) {
    if (this.selectedOrderIndex == index) {
      this.selectedOrderIndex = undefined;
    } else this.selectedOrderIndex = index;
  }

  removeDiagnosis() {
    if (this.selectedOrderIndex != undefined) {
      let controlArray = <FormArray>this.diagnosisForm.get('diagnosisFormList');
      if (controlArray.value[this.selectedOrderIndex].Seqno) {
        controlArray.controls[this.selectedOrderIndex].get('Delete').setValue(true);
        const config: ModalOptions = {
          class: 'modal-dialog-centered modal-diagnosis',
        };
        this.modalRefForDiagnosis = this.modalService.show( this.deleteDIagnosisModal, config );
      } else {
        controlArray.removeAt(this.selectedOrderIndex);
        this.selectedOrderIndex = undefined;
      }
    }
  }

  removeDiagnosisAPi() {
    let controlArray = <FormArray>this.diagnosisForm.get('diagnosisFormList');
    controlArray.controls[this.selectedOrderIndex].get('Delete').setValue(true);
    let payload = {
      Id: this.selectedSubTitleData.data.Id,
      ToNdia: {
        results: controlArray.value,
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
        this.selectedOrderIndex = undefined;
        this.modalRefForDiagnosis.hide();
        this.realoadData.emit(data);
      });
  }

  treatmentTitle(value) {
    if(value == true) {
      return 'Treatment';
    } else {
      return 'Referral';
    }
  }

  onFieldFocus(index) {
    this.fieldTouchDiagnosis[index] = true;
  }
}
