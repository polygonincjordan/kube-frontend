import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-examination-tab',
  templateUrl: './examination-tab.component.html',
  styleUrls: ['./examination-tab.component.scss']
})
export class ExaminationTabComponent implements OnInit, OnChanges {

  @Input() nursingAdmissionForm: FormGroup;
    private formSubscriptions: Subscription[] = [];

  physicianForm: FormGroup;
  generalPhyExamForm: FormGroup;
  headNeckPhyExamForm: FormGroup;
  eyesPhyExamForm: FormGroup;
  entPhyExamForm: FormGroup;
  respiratoryPhyExamForm: FormGroup;
  cardioPhyExamForm: FormGroup;
  haemaPhyExamForm: FormGroup;
  gastroPhyExamForm: FormGroup;
  musculoPhyExamForm: FormGroup;
  skinPhyExamForm: FormGroup;
  neuroPhyExamForm: FormGroup;
  genitPhyExamForm: FormGroup;
  breastPhyExamForm: FormGroup;
  @Output() PhysicianExaminationDrugArrayList: EventEmitter<any> = new EventEmitter();
    formName: any;
      longComment = '';
  selectedTabName: string = 'Physical Examination';
  // @Output() addTableRow = new EventEmitter<any>();
  @Input() toPHYEXAMmportedData: any;

  tabList = [
    'Physical Examination',
    'Sexual Development',
  ];

  modePhysicalList = [
    {
      label: 'Normal',
      value: '0'
    },
    {
      label: 'Abnormal',
      value: '1'
    },
  ]
  functionalAssessment = [
    {
      label: 'Feeding',
      value: '0'
    },
    {
      label: 'Toileting',
      value: '1'
    },
    {
      label: 'Dressing',
      value: '1'
    },
    {
      label: 'Grooming',
      value: '1'
    },
    {
      label: 'Walking',
      value: '1'
    },
    {
      label: 'Transfer',
      value: '1'
    },
    {
      label: 'Mobility',
      value: '1'
    }
  ]
  constructor(private formBuilder:FormBuilder) { }

  ngOnInit(): void {
    this.initPhyExamForm();

     if(this.toPHYEXAMmportedData && this.toPHYEXAMmportedData?.length){

       const phyExamFormMap = {
   'General': this.generalPhyExamForm,
   'Head and Neck': this.headNeckPhyExamForm,
   'Eyes': this.eyesPhyExamForm,
   'ENT': this.entPhyExamForm,
   'Respiratory': this.respiratoryPhyExamForm,
   'Cardiovascular': this.cardioPhyExamForm,
   'Haematology': this.haemaPhyExamForm,
   'Gastrointestinal': this.gastroPhyExamForm,
   'Musculoskeletal': this.musculoPhyExamForm,
   'Skin': this.skinPhyExamForm,
   'Neurologic': this.neuroPhyExamForm,
   'Genitourinary': this.genitPhyExamForm,
   'Breast': this.breastPhyExamForm,
 };

      this.toPHYEXAMmportedData.forEach(dataItem => {
        const formgrop = phyExamFormMap[dataItem?.PhyDescription];
        if(formgrop){
          formgrop.patchValue(dataItem);
        }
      });
      }



    //emtting the value to parent on any value change
    this.subscribeToFormChanges();

  }

  ngOnChanges() {
     if (this.toPHYEXAMmportedData && this.toPHYEXAMmportedData?.length) {

      const phyExamFormMap = {
        'General': this.generalPhyExamForm,
        'Head and Neck': this.headNeckPhyExamForm,
        'Eyes': this.eyesPhyExamForm,
        'ENT': this.entPhyExamForm,
        'Respiratory': this.respiratoryPhyExamForm,
        'Cardiovascular': this.cardioPhyExamForm,
        'Haematology': this.haemaPhyExamForm,
        'Gastrointestinal': this.gastroPhyExamForm,
        'Musculoskeletal': this.musculoPhyExamForm,
        'Skin': this.skinPhyExamForm,
        'Neurologic': this.neuroPhyExamForm,
        'Genitourinary': this.genitPhyExamForm,
        'Breast': this.breastPhyExamForm,
      };

      this.toPHYEXAMmportedData.forEach(dataItem => {
        const formgrop = phyExamFormMap[dataItem?.PhyDescription];
        if (formgrop) {
          formgrop.patchValue(dataItem);
        }
      });
    }
  }

   subscribeToFormChanges() {
    // For each form group, subscribe to valueChanges
    this.formSubscriptions.push(
      this.generalPhyExamForm.valueChanges.subscribe(() => {
        this.PhysicianExaminationDrugArrayList.emit(this.toPhyExamResponse());
      }),
      this.headNeckPhyExamForm.valueChanges.subscribe(() => {
        this.PhysicianExaminationDrugArrayList.emit(this.toPhyExamResponse());
      }),
      this.eyesPhyExamForm.valueChanges.subscribe(() => {
        this.PhysicianExaminationDrugArrayList.emit(this.toPhyExamResponse());
      }),
      this.entPhyExamForm.valueChanges.subscribe(() => {
        this.PhysicianExaminationDrugArrayList.emit(this.toPhyExamResponse());
      }),
      this.respiratoryPhyExamForm.valueChanges.subscribe(() => {
        this.PhysicianExaminationDrugArrayList.emit(this.toPhyExamResponse());
      }),
      this.cardioPhyExamForm.valueChanges.subscribe(() => {
        this.PhysicianExaminationDrugArrayList.emit(this.toPhyExamResponse());
      }),
      this.haemaPhyExamForm.valueChanges.subscribe(() => {
        this.PhysicianExaminationDrugArrayList.emit(this.toPhyExamResponse());
      }),
      this.gastroPhyExamForm.valueChanges.subscribe(() => {
        this.PhysicianExaminationDrugArrayList.emit(this.toPhyExamResponse());
      }),
      this.musculoPhyExamForm.valueChanges.subscribe(() => {
        this.PhysicianExaminationDrugArrayList.emit(this.toPhyExamResponse());
      }),
      this.skinPhyExamForm.valueChanges.subscribe(() => {
        this.PhysicianExaminationDrugArrayList.emit(this.toPhyExamResponse());
      }),
      this.neuroPhyExamForm.valueChanges.subscribe(() => {
        this.PhysicianExaminationDrugArrayList.emit(this.toPhyExamResponse());
      }),
      this.genitPhyExamForm.valueChanges.subscribe(() => {
        this.PhysicianExaminationDrugArrayList.emit(this.toPhyExamResponse());
      }),
      this.breastPhyExamForm.valueChanges.subscribe(() => {
        this.PhysicianExaminationDrugArrayList.emit(this.toPhyExamResponse());
      })
    );
  }

  assessmentTabSelect(tabName: string) {
    this.selectedTabName = tabName;
  }
  // addRow() {
  //   if (this.selectedTabName == "Physical Examination") {
  //   this.addTableRow.emit(this.selectedTabName);
  //   }
  // }

  //managint 'SdPrEarly', 'SdPrDelayed' and 'SdPrOther' radior button and enableing on click on other
onSelectOption(selected: 'SdPrEarly' | 'SdPrDelayed' | 'SdPrOther') {
  this.nursingAdmissionForm.patchValue({
    SdPrEarly: selected === 'SdPrEarly',
    SdPrDelayed: selected === 'SdPrDelayed',
    SdPrOther: selected === 'SdPrOther'
  });

  const otherText = this.nursingAdmissionForm.get('SdPrOtherTxt');

  if (selected === 'SdPrOther') {
    otherText?.enable();
  } else {
    otherText?.disable();
    otherText?.reset();
  }
}


  initPhyExamForm() {
    this.generalPhyExamForm = this.formBuilder.group({
      Dockey: [''],
      PhyDescription: ['General'],
      PhyMode: [''],
      PhyComments: [''],
    });
    this.headNeckPhyExamForm = this.formBuilder.group({
      Dockey: [''],
      PhyDescription: ['Head and Neck'],
      PhyMode: [''],
      PhyComments: [''],
    });
    this.eyesPhyExamForm = this.formBuilder.group({
      Dockey: [''],
      PhyDescription: ['Eyes'],
      PhyMode: [''],
      PhyComments: [''],
    });
    this.entPhyExamForm = this.formBuilder.group({
      Dockey: [''],
      PhyDescription: ['ENT'],
      PhyMode: [''],
      PhyComments: [''],
    });
    this.respiratoryPhyExamForm = this.formBuilder.group({
      Dockey: [''],
      PhyDescription: ['Respiratory'],
      PhyMode: [''],
      PhyComments: [''],
    });
    this.cardioPhyExamForm = this.formBuilder.group({
      Dockey: [''],
      PhyDescription: ['Cardiovascular'],
      PhyMode: [''],
      PhyComments: [''],
    });
    this.haemaPhyExamForm = this.formBuilder.group({
      Dockey: [''],
      PhyDescription: ['Haematology'],
      PhyMode: [''],
      PhyComments: [''],
    });
    this.gastroPhyExamForm = this.formBuilder.group({
      Dockey: [''],
      PhyDescription: ['Gastrointestinal'],
      PhyMode: [''],
      PhyComments: [''],
    });
    this.musculoPhyExamForm = this.formBuilder.group({
      Dockey: [''],
      PhyDescription: ['Musculoskeletal'],
      PhyMode: [''],
      PhyComments: [''],
    });
    this.skinPhyExamForm = this.formBuilder.group({
      Dockey: [''],
      PhyDescription: ['Skin'],
      PhyMode: [''],
      PhyComments: [''],
    });
    this.neuroPhyExamForm = this.formBuilder.group({
      Dockey: [''],
      PhyDescription: ['Neurologic'],
      PhyMode: [''],
      PhyComments: [''],
    });
    this.genitPhyExamForm = this.formBuilder.group({
      Dockey: [''],
      PhyDescription: ['Genitourinary'],
      PhyMode: [''],
      PhyComments: [''],
    });
    this.breastPhyExamForm = this.formBuilder.group({
      Dockey: [''],
      PhyDescription: ['Breast'],
      PhyMode: [''],
      PhyComments: [''],
    });
  }




   fillCommentBox(form) {
    this.formName = form;
    if (this.formName == 'generalPhyExamForm') {
      if (this.generalPhyExamForm.controls.PhyMode.value == '0') {
        if (this.generalPhyExamForm.controls.PhyComments.value == '') {
          this.longComment =
            'No Distress, lying in bed, not jaundiced, not cyanosed,  alert,conscious, oriented to person, place & time.';
          this.generalPhyExamForm.controls.PhyComments.setValue(
            this.longComment
          );
        } else {
          this.longComment = this.generalPhyExamForm.controls.PhyComments.value;
        }
      } else {
        this.longComment = '';
        this.generalPhyExamForm.controls.PhyComments.setValue('');
      }
    }
    if (this.formName == 'headNeckPhyExamForm') {
      if (this.headNeckPhyExamForm.controls.PhyMode.value == '0') {
        if (this.headNeckPhyExamForm.controls.PhyComments.value == '') {
          this.longComment =
            'No head and neck injury, no lesions, intact sensation, no facial weakness or paralysis, no thyroid nodules, no abnormal lymph nodes. No Jugular venous distension (JVD).';

          this.headNeckPhyExamForm.controls.PhyComments.setValue(
            this.longComment
          );
        } else {
          this.longComment =
            this.headNeckPhyExamForm.controls.PhyComments.value;
        }
      } else {
        this.longComment = '';
        this.headNeckPhyExamForm.controls.PhyComments.setValue('');
      }
    }
    if (this.formName == 'eyesPhyExamForm') {
      if (this.eyesPhyExamForm.controls.PhyMode.value == '0') {
        if (this.eyesPhyExamForm.controls.PhyComments.value == '') {
          this.longComment =
            'Conjunctiva and sclera are anicteric pupils equally round and reactive to light and accommodation bilaterally. No ptosis. The extraocular movements are intact.';

          this.eyesPhyExamForm.controls.PhyComments.setValue(this.longComment);
        } else {
          this.longComment = this.eyesPhyExamForm.controls.PhyComments.value;
        }
      } else {
        this.longComment = '';
        this.eyesPhyExamForm.controls.PhyComments.setValue('');
      }
    }
    if (this.formName == 'entPhyExamForm') {
      if (this.entPhyExamForm.controls.PhyMode.value == '0') {
        if (this.entPhyExamForm.controls.PhyComments.value == '') {
          this.longComment =
            'Denies hearing loss, ringing in ears, or lesions. Oropharynx: Normal.No oral lesions. Neck: No lymphadenopathy. Trachea is midline. No thyroid masses.';

          this.entPhyExamForm.controls.PhyComments.setValue(this.longComment);
        } else {
          this.longComment = this.entPhyExamForm.controls.PhyComments.value;
        }
      } else {
        this.longComment = '';
        this.entPhyExamForm.controls.PhyComments.setValue('');
      }
    }
    if (this.formName == 'respiratoryPhyExamForm') {
      if (this.respiratoryPhyExamForm.controls.PhyMode.value == '0') {
        if (this.respiratoryPhyExamForm.controls.PhyComments.value == '') {
          this.longComment =
            'Good Air Entry bilateral, normal vesicular breathing, no added sounds.Normal chest expansion and percussion notes, no skin lesions.';

          this.respiratoryPhyExamForm.controls.PhyComments.setValue(
            this.longComment
          );
        } else {
          this.longComment =
            this.respiratoryPhyExamForm.controls.PhyComments.value;
        }
      } else {
        this.longComment = '';
        this.respiratoryPhyExamForm.controls.PhyComments.setValue('');
      }
    }
    if (this.formName == 'cardioPhyExamForm') {
      if (this.cardioPhyExamForm.controls.PhyMode.value == '0') {
        if (this.cardioPhyExamForm.controls.PhyComments.value == '') {
          this.longComment =
            'Regular rhythm, S1 and S2 are normal, no murmurs or added sounds.Peripheral pulses are present, normal & intact.';

          this.cardioPhyExamForm.controls.PhyComments.setValue(
            this.longComment
          );
        } else {
          this.longComment = this.cardioPhyExamForm.controls.PhyComments.value;
        }
      } else {
        this.longComment = '';
        this.cardioPhyExamForm.controls.PhyComments.setValue('');
      }
    }
    if (this.formName == 'haemaPhyExamForm') {
      if (this.haemaPhyExamForm.controls.PhyMode.value == '0') {
        if (this.haemaPhyExamForm.controls.PhyComments.value == '') {
          this.longComment =
            'No neck, axillary or inguinal lymphadenopathy. No skin discoloration or subdermal or subcutaneous bleeding';

          this.haemaPhyExamForm.controls.PhyComments.setValue(this.longComment);
        } else {
          this.longComment = this.haemaPhyExamForm.controls.PhyComments.value;
        }
      } else {
        this.longComment = '';
        this.haemaPhyExamForm.controls.PhyComments.setValue('');
      }
    }
    if (this.formName == 'gastroPhyExamForm') {
      if (this.gastroPhyExamForm.controls.PhyMode.value == '0') {
        if (this.gastroPhyExamForm.controls.PhyComments.value == '') {
          this.longComment =
            'Soft & lax abdomen, non-tender and non-distended. No guarding rebound or rigidity. No distention. Bowel sounds are normal. No suprapubic tenderness. No bruit. No hepatosplenomegaly. No skin lesion or palpable superficial masses. Normal umbilicus position.';

          this.gastroPhyExamForm.controls.PhyComments.setValue(
            this.longComment
          );
        } else {
          this.longComment = this.gastroPhyExamForm.controls.PhyComments.value;
        }
      } else {
        this.longComment = '';
        this.gastroPhyExamForm.controls.PhyComments.setValue('');
      }
    }
    if (this.formName == 'musculoPhyExamForm') {
      if (this.musculoPhyExamForm.controls.PhyMode.value == '0') {
        if (this.musculoPhyExamForm.controls.PhyComments.value == '') {
          this.longComment =
            'Normal range of motion, no joint swelling or erythema. No cyanosis/clubbing/or edema.';

          this.musculoPhyExamForm.controls.PhyComments.setValue(
            this.longComment
          );
        } else {
          this.longComment = this.musculoPhyExamForm.controls.PhyComments.value;
        }
      } else {
        this.longComment = '';
        this.musculoPhyExamForm.controls.PhyComments.setValue('');
      }
    }
    if (this.formName == 'skinPhyExamForm') {
      if (this.skinPhyExamForm.controls.PhyMode.value == '0') {
        if (this.skinPhyExamForm.controls.PhyComments.value == '') {
          this.longComment =
            'Intact, no rashes, no lesions, no erythema, no abnormal colours,normal nails texture and colour.';

          this.skinPhyExamForm.controls.PhyComments.setValue(this.longComment);
        } else {
          this.longComment = this.skinPhyExamForm.controls.PhyComments.value;
        }
      } else {
        this.longComment = '';
        this.skinPhyExamForm.controls.PhyComments.setValue('');
      }
    }
    if (this.formName == 'neuroPhyExamForm') {
      if (this.neuroPhyExamForm.controls.PhyMode.value == '0') {
        if (this.neuroPhyExamForm.controls.PhyComments.value == '') {
          this.longComment =
            'Cranial nerves II-XII are intact. Deep tendon reflexes are normal.Power is 5/5. No abnormal movements.';

          this.neuroPhyExamForm.controls.PhyComments.setValue(this.longComment);
        } else {
          this.longComment = this.neuroPhyExamForm.controls.PhyComments.value;
        }
      } else {
        this.longComment = '';
        this.neuroPhyExamForm.controls.PhyComments.setValue('');
      }
    }
    if (this.formName == 'genitPhyExamForm') {
      if (this.genitPhyExamForm.controls.PhyMode.value == '0') {
        if (this.genitPhyExamForm.controls.PhyComments.value == '') {
          this.longComment =
            'Male: Normal urethral orifice, location and size, no skin lesions or ulcers, normal colour, no abnormal secretions.Female: No gross masses or skin lesions, no discharge, no prolapses.';

          this.genitPhyExamForm.controls.PhyComments.setValue(this.longComment);
        } else {
          this.longComment = this.genitPhyExamForm.controls.PhyComments.value;
        }
      } else {
        this.longComment = '';
        this.genitPhyExamForm.controls.PhyComments.setValue('');
      }
    }
    if (this.formName == 'breastPhyExamForm') {
      if (this.breastPhyExamForm.controls.PhyMode.value == '0') {
        if (this.breastPhyExamForm.controls.PhyComments.value == '') {
          this.longComment =
            'Symmetrical size and shape, no masses, lumps, nipple intact, no discharges, no skin changes or discoloration.';

          this.breastPhyExamForm.controls.PhyComments.setValue(
            this.longComment
          );
        } else {
          this.longComment = this.breastPhyExamForm.controls.PhyComments.value;
        }
      } else {
        this.longComment = '';
        this.breastPhyExamForm.controls.PhyComments.setValue('');
      }
    }

  }

  toPhyExamResponse() {
    // this.toPhyExamArr = [];
    let sendPhyExamArr = [];
    if (this.generalPhyExamForm.value.PhyMode != '') {
      sendPhyExamArr.push(this.generalPhyExamForm.value);
    }
    if (this.headNeckPhyExamForm.value.PhyMode != '') {
      sendPhyExamArr.push(this.headNeckPhyExamForm.value);
    }
    if (this.eyesPhyExamForm.value.PhyMode != '') {
      sendPhyExamArr.push(this.eyesPhyExamForm.value);
    }
    if (this.entPhyExamForm.value.PhyMode != '') {
      sendPhyExamArr.push(this.entPhyExamForm.value);
    }
    if (this.respiratoryPhyExamForm.value.PhyMode != '') {
      sendPhyExamArr.push(this.respiratoryPhyExamForm.value);
    }
    if (this.cardioPhyExamForm.value.PhyMode != '') {
      sendPhyExamArr.push(this.cardioPhyExamForm.value);
    }
    if (this.haemaPhyExamForm.value.PhyMode != '') {
      sendPhyExamArr.push(this.haemaPhyExamForm.value);
    }
    if (this.gastroPhyExamForm.value.PhyMode != '') {
      sendPhyExamArr.push(this.gastroPhyExamForm.value);
    }
    if (this.musculoPhyExamForm.value.PhyMode != '') {
      sendPhyExamArr.push(this.musculoPhyExamForm.value);
    }
    if (this.skinPhyExamForm.value.PhyMode != '') {
      sendPhyExamArr.push(this.skinPhyExamForm.value);
    }
    if (this.neuroPhyExamForm.value.PhyMode != '') {
      sendPhyExamArr.push(this.neuroPhyExamForm.value);
    }
    if (this.genitPhyExamForm.value.PhyMode != '') {
      sendPhyExamArr.push(this.genitPhyExamForm.value);
    }
    if (this.breastPhyExamForm.value.PhyMode != '') {
      sendPhyExamArr.push(this.breastPhyExamForm.value);
    }
    return sendPhyExamArr;
  }



}
