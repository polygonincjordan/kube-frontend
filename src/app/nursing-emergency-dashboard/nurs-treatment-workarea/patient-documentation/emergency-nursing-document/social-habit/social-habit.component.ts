import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-social-habit',
  templateUrl: './social-habit.component.html',
  styleUrls: ['./social-habit.component.scss']
})
export class SocialHabitComponent implements OnInit {

  @ViewChild('addHabit', { static: true }) addHabit: TemplateRef<any>;
  @Output() saveHabitData = new EventEmitter<any>();

  public habitForm: FormGroup;
  public isFormSubmitted: boolean = false;
  public modalRef: BsModalRef;
  public habitType: string;

  cigarettersList = [
    {
      value: '1',
      label: 'Cigarettes',
    },
    {
      value: '2',
      label: 'Cigars',
    },
    {
      value: '3',
      label: 'Pipe bowl',
    },
    {
      value: '4',
      label: 'Tabacco',
    },
    {
      value: '5',
      label: 'Water pipe',
    },
  ];
  frequencyList = [
    {
      value: '1',
      label: 'Once',
    },
    {
      value: '2',
      label: 'Twince',
    },
    {
      value: '3',
      label: 'Thrice',
    },
    {
      value: '4',
      label: 'Four times',
    },
    {
      value: '5',
      label: 'Five times',
    },
    {
      value: '6',
      label: 'Six times',
    },
    {
      value: '7',
      label: 'Seven times',
    },
  ];
  dailyList = [
    {
      value: 'D',
      label: 'Daily',
    },
    {
      value: 'W',
      label: 'Weekly',
    },
    {
      value: 'M',
      label: 'Monthly',
    },
    {
      value: 'F',
      label: 'Fortnight',
    },
    {
      value: 'Y',
      label: 'Yearly',
    },
    {
      value: 'O',
      label: 'Occasionally',
    },
    {
      value: 'R',
      label: 'Rarely',
    },
  ];
  frequencySocial = [
    {
      value: 'SO',
      label: 'Socially',
    },
    {
      value: 'US',
      label: 'Under Stress',
    },
  ];

  otherHabitUnitList = [
    { code: 'TUB', description: 'Tube' },
    { code: 'SYR', description: 'Syringe' },
    { code: 'TAB', description: 'Tablet' },
    { code: 'SCP', description: 'Scoop' },
    { code: 'SET', description: 'Set' },
    { code: 'SPN', description: 'Spoon' },
    { code: 'STR', description: 'Strip' },
    { code: 'PT', description: 'Pint, US liquid' },
    { code: 'PUF', description: 'Puff' },
    { code: 'PKT', description: 'PACKET' },
    { code: 'PC', description: 'Piece' },
    { code: 'PAA', description: 'Pair' },
    { code: 'PAC', description: 'Pack' },
    { code: 'L', description: 'Liter' },
    { code: 'LB', description: 'Pound' },
    { code: 'KG', description: 'Kilogram' },
    { code: 'INH', description: 'inhalation' },
    { code: 'INJ', description: 'Injection' },
    { code: 'IU', description: 'International Unit' },
    { code: 'G', description: 'Gram' },
    { code: 'DZ', description: 'Dozen' },
    { code: 'EA', description: 'each' },
    { code: 'DOS', description: 'Dose' },
    { code: 'AMP', description: 'Ampule' },
    { code: 'BAG', description: 'Bag' },
    { code: 'BAR', description: 'bar' },
    { code: 'BOX', description: 'BOX' },
    { code: 'BT', description: 'Bottle' },
    { code: 'CAN', description: 'Canister' },
    { code: 'CAP', description: 'CApsule' },
    { code: 'CAR', description: 'Carton' }
  ]
  selectedTableData: any;
  patientDetails: any;
  selectedSocialData: any;

  constructor(
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private emergencyService: EmergencyService,
    private sharedService: SharedService,
    private storageService: StorageService
  ) { }

  ngOnInit(): void { }

  initForm() {
    this.habitForm = this.formBuilder.group({
      NoConsumpation: false,
      fromYears: ['', Validators.required],
      toYears: '',
      cigaretters: '',
      cigarettersTxt: '',
      pickYears: '',
      fOnce: '',
      fDaily: '',
      fSocial: '',
      agramWeek: '',
      units: '',
      dgramWeek: '',
      dComments: '',
      quantity: [''],
      dUnits: '',
      dType: '',
      Habitid: ''
    });
  }

  openModalForAddHabit(habitType: string, selectedTableData: any, patientDetails: any, selectedSocialData: any) {
    this.selectedTableData = selectedTableData;
    this.patientDetails = patientDetails;
    this.habitType = habitType;
    this.selectedSocialData = selectedSocialData
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-xl add-habit-size',
      ignoreBackdropClick: true,
    };
    this.modalRef = this.modalService.show(this.addHabit, config);
    this.isFormSubmitted = false;
    this.initForm();
    if (habitType == 'Other') {
      this.habitForm.get('quantity').setValidators(Validators.required);
      this.habitForm.get('dType').setValidators(Validators.required);
    }
    this.diagnosisCodeList();
  }

  closeModel() {
    this.modalRef?.hide();
    this.initForm();
  }

  diagnosisCodeList() {
    this.habitForm
      .get('agramWeek')
      .valueChanges.pipe(debounceTime(1000))
      .subscribe((value) => {
        if (value) {
          let payload = {
            d: {
              Einri: this.selectedTableData.Einri,
              Patnr: this.selectedTableData.Patnr,
              Grams: this.habitForm.value.agramWeek,
              Frequency: this.habitForm.value.fOnce,
              FreqUnit: this.habitForm.value.fDaily,
              FreqCond: this.habitForm.value.fSocial,
              FromAge: this.habitForm.value.fromYears,
              ToAge: this.habitForm.value.toYears,
            },
          };
          this.emergencyService
            .calculateAlcoholConsumption(payload)
            .subscribe((res: any) => {
              this.habitForm.patchValue({
                units: res?.d?.UnitsDay,
              });
            });
        }
      });
  }

  saveHabit() {
    let payload: any = {};
    if (this.habitForm.value.NoConsumpation) {
      this.clearAllValidators();
      let checkNoConsume = {
        isNoConsume: true,
        habitType: this.habitType
      }
      this.saveHabitData.next(checkNoConsume);
      this.closeModel();
    }
    this.isFormSubmitted = true;
    if (this.habitForm.invalid) return;
    if (!this.habitForm.value.NoConsumpation) {
      this.setPaylaod();
    }
  }

  clearAllValidators(): void {
    Object.keys(this.habitForm.controls).forEach((key) => {
      const control = this.habitForm.get(key);
      control.clearValidators();
      control.updateValueAndValidity();
    });
  }

  setPaylaod() {
    let payload = {};
    if (this.habitType == 'Alcohol') {
      payload = {
        d: {
          Habitid: this.selectedSocialData.Habitid,
          Einri: this.selectedTableData.Einri,
          Patnr: this.selectedTableData.Patnr,
          RespEmp: this.storageService.getGpart(),
          DepartOu: this.patientDetails.deptOrgUnit,
          TreatOu: this.patientDetails.deptOrgUnit,
          DrinkYes: true,
          NoConsumptionKnown: '',
          Grams: this.habitForm.value.agramWeek,
          Frequency: this.habitForm.value.fOnce,
          FreqUnit: this.habitForm.value.fDaily,
          FreqCond: this.habitForm.value.fSocial,
          FromAge: this.habitForm.value.fromYears,
          ToAge: this.habitForm.value.toYears,
          UnitsDay: this.habitForm.value.units,
        },
      };

      this.emergencyService.saveAlcoholWithDrink(payload).subscribe(
        (res: any) => {
          this.sharedService.successSwallModel(
            'Alcohol habit saved successfully.'
          );
          this.closeModel();
          this.saveHabitData.next('success');
        },
        (error) => {
          this.sharedService.errorSwallModel(error?.error?.error?.message?.value);
        }
      );
    }

    if (this.habitType == 'Drugs') {
      payload = {
        d: {
          Habitid: this.selectedSocialData.Habitid,
          Einri: this.selectedTableData.Einri,
          Patnr: this.selectedTableData.Patnr,
          RespEmp: this.storageService.getGpart(),
          DepartOu: this.patientDetails.deptOrgUnit,
          TreatOu: this.patientDetails.deptOrgUnit,
          DrugYes: true,
          GramsPerWeek: this.habitForm.value.dgramWeek,
          RegistrationTxt: this.habitForm.value.dComments,
          NoConsumptionKnown: '',
          Frequency: this.habitForm.value.fOnce,
          FreqUnit: this.habitForm.value.fDaily,
          FreqCond: this.habitForm.value.fSocial,
          FromAge: this.habitForm.value.fromYears,
          ToAge: this.habitForm.value.toYears,
        },
      };
      this.emergencyService.saveDrugsHabit(payload).subscribe(
        (res: any) => {
          this.sharedService.successSwallModel(
            'Drugs habit saved successfully.'
          );
          this.closeModel();
          this.saveHabitData.next('success');
        },
        (error) => {
          this.sharedService.errorSwallModel(error?.error?.error?.message?.value);
        }
      );
    }

    if (this.habitType == 'Tobacco') {
      payload = {
        d: {
          Habitid: this.selectedSocialData.Habitid,
          Einri: this.selectedTableData.Einri,
          Patnr: this.selectedTableData.Patnr,
          RespEmp: this.storageService.getGpart(),
          DepartOu: this.patientDetails.deptOrgUnit,
          TreatOu: this.patientDetails.deptOrgUnit,
          SmokeYes: true,
          TobaccoType: this.habitForm.value.cigarettersTxt,
          Cigarretes: this.habitForm.value.cigaretters,
          NoConsumptionKnown: '',
          Frequency: this.habitForm.value.fOnce,
          FreqUnit: this.habitForm.value.fDaily,
          FreqCond: this.habitForm.value.fSocial,
          FromAge: this.habitForm.value.fromYears,
          ToAge: this.habitForm.value.toYears,
        },
      };
      this.emergencyService.saveTabaccoHabit(payload).subscribe(
        (res: any) => {
          this.sharedService.successSwallModel(
            'Tobacco habit saved successfully.'
          );
          this.closeModel();
          this.saveHabitData.next('success');
        },
        (error) => {
          this.sharedService.errorSwallModel(error?.error?.error?.message?.value);
        }
      );
    }

    if (this.habitType == 'Other') {
      payload = {
        d: {
          Habitid: this.selectedSocialData.Habitid,
          Einri: this.selectedTableData.Einri,
          Patnr: this.selectedTableData.Patnr,
          RespEmp: this.storageService.getGpart(),
          DepartOu: this.patientDetails.deptOrgUnit,
          TreatOu: this.patientDetails.deptOrgUnit,
          NotConsumes: '',
          Quantity: this.habitForm.value.quantity,
          Unit: this.habitForm.value.dUnits,
          Type: this.habitForm.value.dType,
          NoConsumptionKnown: '',
          Frequency: this.habitForm.value.fOnce,
          FreqUnit: this.habitForm.value.fDaily,
          FreqCond: this.habitForm.value.fSocial,
          FromAge: this.habitForm.value.fromYears,
          ToAge: this.habitForm.value.toYears,
        },
      };
      this.emergencyService.saveOtherHabit(payload).subscribe(
        (res: any) => {
          this.sharedService.successSwallModel(
            'Other habit saved successfully.'
          );
          this.closeModel();
          this.saveHabitData.next('success');
        },
        (error) => {
          this.sharedService.errorSwallModel(error?.error?.error?.message?.value);
        }
      );
    }
  }
}
