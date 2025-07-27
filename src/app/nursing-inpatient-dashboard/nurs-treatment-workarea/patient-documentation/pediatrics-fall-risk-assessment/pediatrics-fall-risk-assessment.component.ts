import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdmissionService } from '@services/admission/admission.service';
import { DataShareService } from '@services/data-share.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { ActionType, WordType } from '@services/interfaces/common.enum';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pediatrics-fall-risk-assessment',
  templateUrl: './pediatrics-fall-risk-assessment.component.html',
  styleUrls: ['./pediatrics-fall-risk-assessment.component.scss']
})
export class PediatricsFallRiskAssessmentComponent implements OnInit {
  modalRef?: BsModalRef;
  public pediatricsForm: FormGroup
  ageOptions = [
    { value: '1', label: '13 year and above' },
    { value: '2', label: '7 to less than 13 years old' },
    { value: '3', label: '3 to less than 7 years old' },
    { value: '4', label: 'Less than 3 years old' }
  ];

  genderOptions = [
    { value: '1', label: 'Male' },
    { value: '2', label: 'Female' }
  ];

  cognitiveOptions = [
    { value: '1', label: 'Oriented to own ability' },
    { value: '2', label: 'Forgets limitations' },
    { value: '3', label: 'Not aware of limitations' }
  ];

  responseOptions = [
    { value: '1', label: 'More than 48 hours / None' },
    { value: '2', label: 'Within 48 hours' },
    { value: '3', label: 'Within 24 hours' }
  ];

  environmentalOptions = [
    { value: '1', label: 'Outpatient area' },
    { value: '2', label: 'Patient placed in bed' },
    { value: '3', label: 'Patient uses assistant' },
    { value: '4', label: 'History of fall' }
  ];

  medicationOptions = [
    { value: '1', label: 'Other medications / None' },
    { value: '2', label: 'One of the meds listed' },
    { value: '3', label: 'Multiple usage of sedatives' }
  ];

  diagnosisOptions = [
    { value: '1', label: 'Other diagnosis' },
    { value: '2', label: 'Psych/Behavioral disorders' },
    { value: '3', label: 'Alterations in oxygenation' },
    { value: '4', label: 'Neurological diagnosis' }
  ];
  public realized: any;
  public realizedDescription: any;
  public CurrentDateAndTime: Date = new Date();

  private subscription: Subscription;
  private actionTypeSubscription$: Subscription;
  public dockeyValue: any = null;

  constructor(public modalService: BsModalService, private formBuilder: FormBuilder, private _route: ActivatedRoute, public storageService: StorageService,
    public admissionService: AdmissionService, private sharedService: SharedService, private dataShareService: DataShareService, private emergencyService: EmergencyService) {
    this.initForm();

    this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe((data) => {
      if (data != null) {
        if (data.type == ActionType.Update$ && data.isAllow == true && data.value) {
          if (data.value.type == WordType.CopyPFR && data.value.docKey != '') {
            this.dockeyValue = data.value.docKey ? data.value.docKey : null;
            if (this.dockeyValue) {
              this.getFallRiskPed(data.value.docKey);
            }
          }
        }
        console.log(data, "data-----------");
        if (data.type == ActionType.Copy$ && data.isAllow == true && data.value) {
          if (data.value.type == WordType.CopyPFR && data.value.docKey != '') {
            this.dockeyValue = data.value.docKey ? data.value.docKey : null;
            if (this.dockeyValue) {
              this.getFallRiskPed(data.value.docKey);
            }
          }
        }
      }
    });
  }

  public getFallRiskPed(dockey: string) {
    // Subscribe using an object to define handlers
    this.subscription = this.emergencyService.getDocFallRiskAssessmentDetails(dockey).subscribe({
      next: (data: any) => {
        this.pediatricsForm.patchValue(data?.d?.results[0])
        // Handle successful data retrieval

      },
      error: (err: any) => {
        // Handle errors if the request fails
        console.error('Error fetching Glasgow Scale Data:', err);
        this.sharedService.waringSwallModel(`GET Error at face pain scale : ${err}`);
      },
      complete: () => {
        // Handle completion (optional), invoked when the observable completes
        console.info('Face Pain Scale Data retrieval complete');
      }
    });
  }

  ngOnInit(): void {
    this.realized = this.storageService.getUserProfile().Gpart;
    this.realizedDescription = this.storageService.getUserProfile().GpartName;
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.actionTypeSubscription$) {
      this.actionTypeSubscription$.unsubscribe();
      this.dataShareService.sendActionType(null);
    }
  }


  initForm() {
    this.pediatricsForm = this.formBuilder.group({
      Dockey: "",
      Dtid: "SCA_FALLP",
      Einri: this.storageService.einri,
      Patnr: this.storageService.patnr,
      Falnr: this.storageService.falnr,
      Lfdnr: this.storageService.lfdnr,
      Orgdo: localStorage.getItem('initOrg'),
      AttendPhy: this.storageService.getGpart(),
      DocStatus: "",
      CompleteParalysis: false,
      Experience: false,
      Dizzeness: false,
      AgeDesc: "",
      AgeScore: "",
      GenderDesc: "",
      GenderScore: "",
      CognitiveDesc: "",
      CognitiveScore: "",
      ResponseDesc: "",
      ResponseScore: "",
      DiagnosisDesc: "",
      DiagnosisScore: "",
      EnvironmentalDesc: "",
      EnvironmentalScore: "",
      MedicationDesc: "",
      MedicationScore: "",
      TotalScore: "",
      ScoreDesc: "",
      Comments: ""
    })

    this.pediatricsForm.get('CompleteParalysis')?.valueChanges.subscribe(val => {
      if (val) {
        // Disable other checkboxes
        this.pediatricsForm.get('Experience')?.disable({ emitEvent: false });
        this.pediatricsForm.get('Dizzeness')?.disable({ emitEvent: false });

        // Disable dropdowns
        this.disableAllDropdowns(true);

        // Set score and description
        this.pediatricsForm.patchValue({
          TotalScore: '0',
          ScoreDesc: 'Low fall risk prevention protocol'
        }, { emitEvent: false });
      } else {
        // Enable other checkboxes
        this.pediatricsForm.get('Experience')?.enable({ emitEvent: false });
        this.pediatricsForm.get('Dizzeness')?.enable({ emitEvent: false });

        // Re-enable dropdowns only if other checkboxes are also false
        const exp = this.pediatricsForm.get('Experience')?.value;
        const diz = this.pediatricsForm.get('Dizzeness')?.value;
        if (!exp && !diz) {
          this.disableAllDropdowns(false);
          this.pediatricsForm.patchValue({
            TotalScore: '',
            ScoreDesc: ''
          }, { emitEvent: false });
        }
      }
    });

    ['Experience', 'Dizzeness'].forEach(ctrl => {
      this.pediatricsForm.get(ctrl)?.valueChanges.subscribe(val => {
        const otherCtrl = ctrl === 'Experience' ? 'Dizzeness' : 'Experience';
        const exp = this.pediatricsForm.get('Experience')?.value;
        const diz = this.pediatricsForm.get('Dizzeness')?.value;

        if (exp || diz) {
          this.pediatricsForm.get('CompleteParalysis')?.disable({ emitEvent: false });
          this.disableAllDropdowns(true);

          this.pediatricsForm.patchValue({
            TotalScore: '0',
            ScoreDesc: 'High fall risk prevention protocol'
          }, { emitEvent: false });
        } else {
          this.pediatricsForm.get('CompleteParalysis')?.enable({ emitEvent: false });
          this.disableAllDropdowns(false);

          this.pediatricsForm.patchValue({
            TotalScore: '',
            ScoreDesc: ''
          }, { emitEvent: false });
        }
      });
    });
    this.setDefaultAgeAndGender(this.storageService?.patientData?.gender)
    this.calculateTotalScore();

  }

  disableAllDropdowns(disabled: boolean) {
    const dropdowns = [
      'AgeDesc', 'GenderDesc', 'CognitiveDesc', 'ResponseDesc',
      'DiagnosisDesc', 'EnvironmentalDesc', 'MedicationDesc'
    ];

    dropdowns.forEach(ctrl => {
      if (disabled) {
        this.pediatricsForm.get(ctrl)?.disable({ emitEvent: false });
      } else {
        this.pediatricsForm.get(ctrl)?.enable({ emitEvent: false });
      }
    });

  }

  setDefaultAgeAndGender(genderValue: string) {
    console.log(genderValue, "genderValue")
    const parts = genderValue?.split('-');
    const age = parseInt(parts[0].trim().split(' ')[0], 10);
    const gender = parts[1].trim().toLowerCase();

    if (gender === 'male') {
      this.pediatricsForm.patchValue({ GenderDesc: '1', GenderScore: '1' });
    } else if (gender === 'female') {
      this.pediatricsForm.patchValue({ GenderDesc: '2', GenderScore: '1' });
    }

    if (age >= 13) {
      this.pediatricsForm.patchValue({ AgeDesc: '1', AgeScore: '1' });
    } else if (age >= 7) {
      this.pediatricsForm.patchValue({ AgeDesc: '2', AgeScore: '2' });
    } else if (age >= 3) {
      this.pediatricsForm.patchValue({ AgeDesc: '3', AgeScore: '3' });
    } else {
      this.pediatricsForm.patchValue({ AgeDesc: '4', AgeScore: '4' });
    }
  }


  calculateTotalScore() {
    const fieldPairs = [
      { key: 'GenderDesc', scoreKey: 'GenderScore' },
      { key: 'CognitiveDesc', scoreKey: 'CognitiveScore' },
      { key: 'ResponseDesc', scoreKey: 'ResponseScore' },
      { key: 'AgeDesc', scoreKey: 'AgeScore' },
      { key: 'DiagnosisDesc', scoreKey: 'DiagnosisScore' },
      { key: 'EnvironmentalDesc', scoreKey: 'EnvironmentalScore' },
      { key: 'MedicationDesc', scoreKey: 'MedicationScore' },
    ];

    let total = 0;

    fieldPairs.forEach(({ key, scoreKey }) => {
      const val = this.pediatricsForm.get(key)?.value;

      if (val && !isNaN(val)) {
        const score = parseInt(val, 10);
        total += score;
        this.pediatricsForm.get(scoreKey)?.setValue(score);
      } else {
        this.pediatricsForm.get(scoreKey)?.setValue('');
      }
    });

    const totalScore = Number(this.pediatricsForm.get('TotalScore')?.value || 0);
    this.pediatricsForm.get('TotalScore')?.setValue(String(total), { emitEvent: false });
    if ((totalScore >= 7 && totalScore <= 11)) {
      this.pediatricsForm.get('ScoreDesc')?.setValue('Low fall risk prevention protocol');
    } else if (totalScore >= 12) {
      this.pediatricsForm.get('ScoreDesc')?.setValue('High fall risk prevention protocol');
    } else {
      this.pediatricsForm.get('ScoreDesc')?.setValue('');
    }
  }

  createFallRiskPed(dockStatus): Promise<any> {
    Object.keys(this.pediatricsForm.value).forEach(key => {
      if (key.endsWith('Score') && typeof this.pediatricsForm.value[key] === 'number') {
        this.pediatricsForm.value[key] = this.pediatricsForm.value[key].toString();
      }
    });
    return new Promise((resolve, reject) => {
      this.pediatricsForm.value.DocStatus = dockStatus;
      this.pediatricsForm.value.AttendPhy = this.storageService.getGpart();
      let payload = {
        d: this.pediatricsForm.value
      };
      // Subscribe using an object to define handlers
      this.subscription = this.emergencyService.saveFallRiskAssessment(payload).subscribe({
        next: (data: any) => {

          // this.facePainValue.next(formValue); // emit value if needed...
        },
        error: (err: any) => {
          // Handle errors if the request fails
          this.sharedService.waringSwallModel(`Error ${err}`);
          this.sharedService.waringSwallModel(`POST Error at facepain : ${err}`);
        },
        complete: () => {
          resolve(true);
          // Handle completion (optional), invoked when the observable completes
          this.sharedService.successSwallModel('Pediatrics Fall Risk Assessment Document create successfully');
        }
      });
    });
  }


  openModal(template: TemplateRef<any>) {
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-lg',
    };
    this.modalRef = this.modalService.show(template, config);
  }
  openModalEnvironmental(template: TemplateRef<any>) {
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-lg',
    };
    this.modalRef = this.modalService.show(template, config);
  }
  openModalMedication(template: TemplateRef<any>) {
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-lg',
    };
    this.modalRef = this.modalService.show(template, config);
  }
  openModalHigh(template: TemplateRef<any>) {
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-lg',
    };
    this.modalRef = this.modalService.show(template, config);
  }

}
