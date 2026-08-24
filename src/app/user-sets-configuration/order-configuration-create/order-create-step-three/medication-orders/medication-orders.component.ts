import { Component, Input, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormArray, FormGroup, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AddministrationService } from '@services/e-Prescription/Administration.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { OrdersDashboardService } from '@services/orders-dashboard/orders-dashboard.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Subject, catchError, debounceTime, of } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-medication-orders',
  templateUrl: './medication-orders.component.html',
  styleUrls: ['./medication-orders.component.scss'],
})
export class MedicationOrdersComponent implements OnInit {
  @Input() medicationForm: FormGroup;
  @Input() dispensingForm: FormGroup;
  @Input() medicationListForm: FormArray;
  @Input() dispensingListForm: FormArray;
  @Input() selectedSubTitleData: any;
  @Output() realoadData = new EventEmitter();
  @Input() fieldTouchAdministration: any;
  @Input() fieldTouchDispensing: any;

  @Input() isFormSubmittedAdmi = false;
  @Input() isFormSubmittedDispe = false;
  selectedOrderIndex: any;
  defaultAgentId: any;
  dosageUnitList: any;
  isFormSubmitted: boolean = false;
  modalRefForMedication: BsModalRef;

  public searchTerm = new Subject<string>();
  @ViewChild('deleteMedicationModal') deleteMedicationModal: any;

  
  public priorityArray: any = [
    { Desc: 'Regular', Value: '010' },
    { Desc: 'High', Value: '020' },
    { Desc: 'STAT', Value: '030' },
  ];
  medicationDrugList: any[];

  constructor(
    private ePrescriptionService: EPrescriptionService,
    public addministrationService: AddministrationService,
    public _ordersDashboardService : OrdersDashboardService,
    public modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.medicationForm.valueChanges.subscribe(() => { this.isFormSubmitted = true });
    this.dispensingForm.valueChanges.subscribe(() => { this.isFormSubmitted = true });
    this.subscribeSearchEvent();
  }

  changeTab(tabName: any) {
    this.selectedOrderIndex = undefined;
    if(tabName == 'medication') {
      this._ordersDashboardService.isActiveMedication = true;
      this._ordersDashboardService.isActiveDispensing = false;
    } else {
      this._ordersDashboardService.isActiveMedication = false;
      this._ordersDashboardService.isActiveDispensing = true;
    }
  }

  
  onFieldFocus(index, formType) {
    if(formType == 'admini') this.fieldTouchAdministration[index] = true;
    if(formType == 'dispen') this.fieldTouchDispensing[index] = true;
  }


  selectOrderIndex(index: any, value) {
    if (this.selectedOrderIndex == index) {
      this.selectedOrderIndex = undefined;
    } else this.selectedOrderIndex = index;
  }

  onSelectMedicine(event: any, index, type) {
    if (event) {
      this.defaultAgentId = event.Agentid;
      const filter = {
        einri: this.ePrescriptionService.parameters.einri,
        case: this.ePrescriptionService.parameters.falnr,
        movement: this.ePrescriptionService.parameters.lfdnr,
        AgentID: event.Agentid,
        DrugID: event.Drugid,
        purpose: '',
      };
      let expandEntities = ['NAVDRUGFORMATS', 'NAVDRUGFORMATROUTES', 'NAVDRUGFORMATROUTEUNITS', 'NAVDRUGUNITS'];
      this.ePrescriptionService.loadData('DrugPropSet', filter, expandEntities, true, true)
        .subscribe((resp: any) => {
          if (resp.body && resp.body.d && resp.body.d.results) {
            if (resp.body.d.results[0].NAVDRUGFORMATROUTEUNITS.results && resp.body.d.results[0].NAVDRUGFORMATROUTEUNITS.results.length) {
              this.dosageUnitList = resp.body.d.results[0].NAVDRUGFORMATROUTEUNITS.results;
            }
          }
          if(type === 'medication') {
            this.getMedicationFormList.controls[index].patchValue({
              Formula: resp.body.d.results[0].NAVDRUGFORMATROUTES.results[0].FormID,
              Route: resp.body.d.results[0].NAVDRUGFORMATROUTES.results[0].RouteID,
              ResultDrugName: event.Drugname,
              Routedescr: event.Routedescr,
              FormulaText: event.Formatdescr,
              Agentid: event.Agentid,
              Drugid: event.Drugid,
            });
          }

          if(type === 'dispensing') {
            this.getDispensingFormList.controls[index].patchValue({
              Formula: resp.body.d.results[0].NAVDRUGFORMATROUTES.results[0].FormID,
              Route: resp.body.d.results[0].NAVDRUGFORMATROUTES.results[0].RouteID,
              ResultDrugName: event.Drugname,
              Routedescr: event.Routedescr,
              FormulaText: event.Formatdescr,
              Agentid: event.Agentid,
              Drugid: event.Drugid,
            });
          }
        });
      this.ePrescriptionService
        .loadData(`e-prescription/DurgUnitlist?Einri=${this.ePrescriptionService.parameters.einri}&Falnr=${this.ePrescriptionService.parameters.falnr}&Lfdnr=${this.ePrescriptionService.parameters.lfdnr}&Drugid=${event.Drugid}`, false, false, false, false)
        .subscribe((resp: any) => {
          if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
            if (resp.body.d.results[0] && resp.body.d.results.length) {
              resp.body.d.results.forEach((element) => {
                if (element.Mseht !== '' && element.Agent !== '') {
                  element.OptionField = [element.Mseht, element.Agent].join(' - ');
                } else {
                  element.OptionField = element.Mseht;
                }
              });

              if(type == 'medication') {
                this.getMedicationFormList.controls[index].patchValue({
                  AgentidResult: resp.body.d.results,
                  DosageUnit: resp.body.d.results[0].Meinh,
                  Dosage: Math.floor(resp.body.d.results[0].Quant).toString(),
                });
              }

              if(type === 'dispensing') {
                this.getDispensingFormList.controls[index].patchValue({
                  AgentidResult: resp.body.d.results,
                  DosageUnit: resp.body.d.results[0].Meinh,
                  Dosage: Math.floor(resp.body.d.results[0].Quant).toString(),
                });
              }
            }
          }
        });
    }
  }

  get getMedicationFormList() {
    return this.medicationForm?.get('medicationListForm') as FormArray;
  }

  get getDispensingFormList() {
    return this.dispensingForm?.get('dispensingListForm') as FormArray;
  }

  subscribeSearchEvent() {
    this.searchTerm.pipe(debounceTime(2000)).subscribe((term) => {
      if (term !== '' && term !== null && term.length >= 3) {
        this.ePrescriptionService.loadData(`e-prescription/medicationDetails?Einri=1000&Falnr=0000000001&Searchtype=${'B'}&SearchString=${term}`, false, false, false, false)
          .subscribe({
            next: (resp: any) => {
              if (resp.body && resp.body.d && resp.body.d.results) {
                this.addministrationService.medicationDrugList = resp.body.d.results[0].TODURG.results;
              }
            },
          });
      }
    });
  }

  
  routeTitle(routeName: any, type: any) {
    let title: any;
    if (type == 'route') {
      const data = this.addministrationService.routeDropdownList.find((x) => {
        return x.Aprouid == routeName;
      });
      title = data?.Descr;
    } else if (type == 'frequncy') {
      const data = this.addministrationService.frequencyList.find((x) => {
        return x.CycleKey == routeName;
      });
      title = data?.Text;
    } else if (type == 'durationUnit') {
      const data = this.addministrationService.durationUnitList.find((x) => {
        return x.Unit == routeName;
      });
      title = data?.Text;
    }
    return title;
  }

  onChangeDosageUnit(data: any, event: any, index: number) {
    const selectedDosage = data.find((d) => d.Meinh === event);
    if (selectedDosage !== undefined && selectedDosage.Agentid !== '') {
      this.getMedicationFormList.controls[index].patchValue({
        Agentid: selectedDosage.Agentid !== null ? selectedDosage.Agentid : '',
        Dosage: Math.floor(selectedDosage.Quant),
      });
    } else {
      this.getMedicationFormList.controls[index].patchValue({
        Agentid: this.defaultAgentId,
      });
    }
  }


  onChangeFrequencySet(data?: any, index?: number, event?: any) {
    if (data !== null || data !== '') {
      if (this.getMedicationFormList.controls[index].get('ResultDrugName').value === '' || this.getMedicationFormList.controls[index].get('ResultDrugName').value === null) {
        // this._ordersDashboardService.showErrorPopup('', 'Please select medicine', 'Error').then(
        //   (result) => {
        //     if (result.value) {
        //       this.getMedicationFormList.controls[index].patchValue({ Frequency: null });
        //     }
        //   }
        // );
      }

      if(event === '0000000080') {
        this.getMedicationFormList.controls[index].patchValue({ Priority: '030' });
      }
    }
  }

  
  addValidation(item: FormGroup) {
    if (item.controls['Prn'].value) {
      item.controls['Prncond'].setValidators([Validators.required]);
    } else {
      item.controls['Prncond'].clearValidators();
    }
    item.controls['Prncond'].updateValueAndValidity();
  }

  removeMedicationDetails() {
    const config: ModalOptions = { class: 'modal-dialog-centered modal-diagnosis' };
    let controlArray = this.getControls();
    if (controlArray.value[this.selectedOrderIndex]?.Seqno) {
      this.modalRefForMedication = this.modalService.show( this.deleteMedicationModal, config );
    } else{
      controlArray.removeAt(this.selectedOrderIndex);
      this.selectedOrderIndex = undefined;
    }
  }

  getControls() {
    if(this._ordersDashboardService.isActiveMedication) {
      return <FormArray>(this.medicationForm.get('medicationListForm'));
    } else { 
      return <FormArray>(this.dispensingForm.get('dispensingListForm'));
    }
  }

  removeMedicationAPI() {
    let payload: any = {};
    payload.Id = this.selectedSubTitleData.data.Id;
      let controlArray = this.getControls();
      controlArray.controls[this.selectedOrderIndex].get('Delete').setValue(true);
      delete controlArray.value[this.selectedOrderIndex].AgentidResult;
      payload.ToMedOrd = {
        results: [controlArray.value[this.selectedOrderIndex]],
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
        this.modalRefForMedication.hide();
        this.realoadData.emit(data);
      });
  }
}
