import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataShareService } from '@services/data-share.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { ActionType, WordType } from '@services/interfaces/common.enum';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-obs-fall-risk-assessment',
  templateUrl: './obs-fall-risk-assessment.component.html',
  styleUrls: ['./obs-fall-risk-assessment.component.scss']
})
export class ObsFallRiskAssessmentComponent implements OnInit {

  // Prior History
  priorOptions = [
    { label: '(2) HX of a fall', value: 2, checked: false },
    { label: '(2) HX of a bedrest', value: 2, checked: false },
    { label: '(3) Visual Impairment', value: 3, checked: false },
    { label: '(0) None', value: 0, checked: false }
  ];

  // Cardiovascular
  cardiovascularOptions = [
    { label: '(2) HX of anemia or preeclampsia', value: 2, checked: false },
    { label: '(3) Orthostatic', value: 3, checked: false },
    { label: '(2) Dizziness', value: 2, checked: false },
    { label: '(0) None', value: 0, checked: false }
  ];

  // Hemorrhage
  hemorrhageOptions = [
    { label: '(3) PP Hemorrhage', value: 3, checked: false },
    { label: '(3) DX abruption or previa', value: 3, checked: false },
    { label: '(0) None', value: 0, checked: false }
  ];

  // Medication
  medicationOptions = [
    { label: '(1) IV / IM Narcotics w in 30 min', value: 1, checked: false },
    { label: '(3) Anti-hypertensives', value: 3, checked: false },
    { label: '(0) None', value: 0, checked: false }
  ];

  priorValue = 0;
  cardiovascularValue = 0;
  hemorrhageValue = 0;
  motorValue = 0;
  medicationValue = 0;

  totalScore: any;
  paramsObject: any;
  obsFallRiskForm: FormGroup;
  apiJson: any;
  dockeyValue: any;
  morseFallScaleData;
  private actionTypeSubscription$: Subscription;
  private subscription: Subscription;

  constructor(private fb: FormBuilder, private _route: ActivatedRoute, private storageService: StorageService, private dataShareService: DataShareService,
    private emergencyService: EmergencyService, private sharedService: SharedService) {
    this._route.queryParams.subscribe((params) => {
      this.paramsObject = params;
    });
    this.apiJson = {
      Einri: this.storageService.einri,
      Falnr: this.storageService.falnr,
      Patnr: this.storageService.patnr,
      Lfdnr: this.storageService.lfdnr,
      Lfdbw: this.storageService.lfdnr
    }
    this.initForm();
    this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe((data) => {
      if (data != null) {
        if (data.type == ActionType.Update$ && data.isAllow == true && data.value) {
          if (data.value.type == WordType.EditBS && data.value.docKey != '') {
            this.dockeyValue = data.value.docKey ? data.value.docKey : null;
            if (this.dockeyValue) {
              this.getDocData(this.dockeyValue);
            }
          }

        }
        if (data.type == ActionType.Copy$ && data.isAllow == true && data.value) {
          if (data.value.type == WordType.CopyBS && data.value.docKey != '') {
            this.dockeyValue = data.value.docKey ? data.value.docKey : null;
            if (this.dockeyValue) {
              this.getDocData(this.dockeyValue);
            }
          }
        }
      }
    });
  }

  ngOnInit(): void {
  }

  initForm() {
    this.obsFallRiskForm = this.fb.group({
      Dockey: [''],
      Dtid: ['ZPRGRISK'],
      Einri: this.paramsObject.einri,
      Patnr: this.paramsObject.patnr,
      Falnr: this.paramsObject.falnr,
      Lfdnr: this.paramsObject.lfdnr,
      Orgdo: this.storageService?.patientData?.deptOrgUnit,
      DocStatus: ['1'],

      PHxFall: [false],
      PHxBedrest: [false],
      PVisual: [false],
      PNone: [false],
      PScore: [''],

      CHxAnemia: [false],
      COrthostatic: [false],
      CDizziness: [false],
      CNone: [false],
      CScore: [''],

      HPpHemorrhage: [false],
      HDxAbruption: [false],
      HNone: [false],
      HScore: [''],

      NNumbness: [false],
      NEpiduralOff: [false],
      NNone: [false],
      NScore: [''],

      Motor: [''],
      MoScore: [''],

      MeIvImNarcotics: [false],
      MeAntiHypertensives: [false],
      MeNone: [false],
      MeScore: [''],

      TotalScore: [''],
      TotalScoreDesc: [''],
      Recommendations: ['']
    });
  }


  getDocData(dockey: string) {
    // Subscribe using an object to define handlers
    this.subscription = this.emergencyService.fetchObsFallRiskScale(dockey).subscribe({
      next: (data: any) => {
        // Handle successful data retrieval
        this.obsFallRiskForm.patchValue(data?.d?.results[0]);
        this.obsFallRiskForm.patchValue({
          Motor: parseFloat(data?.d?.results[0].Motor)
        });
      },
      error: (err: any) => {
        // Handle errors if the request fails
        console.error('Error fetching Glasgow Scale Data:', err);
        this.sharedService.waringSwallModel(`GET Error at numeric rating scale : ${err}`);
      },
      complete: () => {
        // Handle completion (optional), invoked when the observable completes
        console.info('Numeric Rating Scale Data retrieval complete');
      }
    });
  }

  updateCheckboxValue(section: string): number {
    let total = 0;
    const form = this.obsFallRiskForm;

    const map = {
      prior: [
        { key: 'PHxFall', value: 2 },
        { key: 'PHxBedrest', value: 2 },
        { key: 'PVisual', value: 3 },
        { key: 'PNone', value: 0 }
      ],
      cardio: [
        { key: 'CHxAnemia', value: 2 },
        { key: 'COrthostatic', value: 3 },
        { key: 'CDizziness', value: 2 },
        { key: 'CNone', value: 0 }
      ],
      hemorrhage: [
        { key: 'HPpHemorrhage', value: 3 },
        { key: 'HDxAbruption', value: 3 },
        { key: 'HNone', value: 0 }
      ],
      medication: [
        { key: 'MeIvImNarcotics', value: 1 },
        { key: 'MeAntiHypertensives', value: 3 },
        { key: 'MeNone', value: 0 }
      ]
    };

    const currentMap = map[section];

    currentMap.forEach(option => {
      if (form.get(option.key)?.value && option.value > 0) {
        total += option.value;
      }
    });

    switch (section) {
      case 'prior': this.priorValue = total; break;
      case 'cardio': this.cardiovascularValue = total; break;
      case 'hemorrhage': this.hemorrhageValue = total; break;
      case 'medication': this.medicationValue = total; break;
    }

    this.calculateTotalScore();
    return total;
  }

  updateRadioValue(value: number) {
    this.motorValue = value;
    this.obsFallRiskForm.get('Motor')?.setValue(value);
    this.calculateTotalScore();
  }

  calculateTotalScore() {
    this.totalScore =
      this.priorValue +
      this.cardiovascularValue +
      this.hemorrhageValue +
      this.motorValue +
      this.medicationValue;

    this.obsFallRiskForm.get('TotalScore')?.setValue(this.totalScore);

    let description = '';
    if (this.totalScore <= 2) {
      description = '1';
    } else if (this.totalScore <= 5) {
      description = '2';
    } else {
      description = '3';
    }
    this.obsFallRiskForm.get('TotalScoreDesc')?.setValue(description);
  }


  updateCheckboxValue1(options: any[], maxOptions: number): number {
    const noneOption = options.find(opt => opt.isNone);
    if (noneOption?.checked) {
      // If "None" is selected, uncheck all others
      options.forEach(opt => {
        if (!opt.isNone) opt.checked = false;
      });
      return 0;
    } else {
      // If any other is selected, uncheck "None"
      if (noneOption) noneOption.checked = false;
    }

    // Sum up all checked values
    const total = options
      .filter(opt => opt.checked)
      .reduce((sum, opt) => sum + opt.value, 0);
    return total;
  }

  calculateTotalScore1() {
    this.totalScore = this.priorValue + this.cardiovascularValue + this.hemorrhageValue + this.motorValue + this.medicationValue;
  }

  // For radio
  updateRadioValue1(val: number) {
    this.motorValue = val;
    this.calculateTotalScore();
  }


  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.actionTypeSubscription$) {
      this.actionTypeSubscription$.unsubscribe();
      this.dataShareService.sendActionType(null);
    }
  }

  saveObsFallRiskDoc(status): Promise<any> {
    return new Promise((resolve, reject) => {
      let payload = {
        d: this.obsFallRiskForm.value
      };
      // if(status == '3') payload.d.Dockey = ''; 
      payload.d.DocStatus = status;
      payload.d.TotalScore = payload.d.TotalScore.toString();
      payload.d.Motor = payload.d.Motor.toString();
      // Subscribe using an object to define handlers
      this.subscription = this.emergencyService.saveObsFallRiskScale(payload).subscribe({
        next: (data: any) => {
          // Handle successful data retrieva
          // resolve(formValue); // Resolve the promise with formValue
        },
        error: (err: any) => {
          // Handle errors if the request fails
          this.sharedService.waringSwallModel(`Error ${err}`);
          this.sharedService.waringSwallModel(`POST Error at glosgow : ${err}`);
        },
        complete: () => {
          // Handle completion (optional), invoked when the observable completes
          resolve(true); // Resolve the promise with formValue
          this.sharedService.successSwallModel('APGAR Scale Document created successfully');
        }
      });
    });
  }


}
