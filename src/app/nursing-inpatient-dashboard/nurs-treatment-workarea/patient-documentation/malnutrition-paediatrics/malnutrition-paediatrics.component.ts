import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdmissionService } from '@services/admission/admission.service';
import { DataShareService } from '@services/data-share.service';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';

@Component({
  selector: 'app-malnutrition-paediatrics',
  templateUrl: './malnutrition-paediatrics.component.html',
  styleUrls: ['./malnutrition-paediatrics.component.scss'],
})
export class MalnutritionPaediatricsComponent implements OnInit {
  public CurrentDateAndTime: Date = new Date();
  malnutritionForm: FormGroup;
  currentTime: any;
  toAllergyArr: any;
  toVitalsArr: any;
  activeTab: string = 'Neurosensory'; // Default tab
  diagnosisOptions = [
    { value: 0, label: '0 (0) No nutritional implications' },
    { value: 2, label: '2 (2) Possible nutritional implications' },
    { value: 3, label: '3 (3) Definite nutritional implications' }
  ];

  intakeOptions = [
    { value: 0, label: '0 (0) No change in eating patterns and good nutritional intake' },
    { value: 2, label: '2 (2) Recently decreased or poor nutritional intake' },
    { value: 3, label: '3 (3) No nutritional intake' }
  ];

  growthChartOptions = [
    { value: 0, label: '0 (0) 0 to 1 centile spaces/columns apart' },
    { value: 1, label: '1 (1) > 2 centile spaces/= 2 columns apart' },
    { value: 3, label: '3 (3) ≥ 3 centile spaces/≥ 3 columns apart/weight < 2ndcentile' }
  ];
  realized: any;
  realizedDescription: any;

  constructor(
    private formBuilder: FormBuilder,
    private _route: ActivatedRoute,
    public storageService: StorageService,
    public admissionService: AdmissionService,
    private sharedService: SharedService,
    private dataShareService: DataShareService
  ) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    this.currentTime = `${hours}:${minutes}:${seconds}`;
  }

  ngOnInit(): void {
    this.initForm();
    this.realized = this.storageService.getUserProfile().Gpart;
    this.realizedDescription = this.storageService.getUserProfile().GpartName;
  }

  initForm() {
    this.malnutritionForm = this.formBuilder.group({
      Nutritional: this.formBuilder.array([]),
      Weight: this.formBuilder.array([]),
      Overall: this.formBuilder.array([]),
      Diagnosis: this.formBuilder.array([]),
    });

    for (let i = 0; i < 3; i++) {
      this.addDiagnosis();
      this.addNutritional();
      this.addWeight();
      this.addOverall();
    }
  }

  get Nutritional(): FormArray {
    return this.malnutritionForm.get('Nutritional') as FormArray;
  }
  get Weight(): FormArray {
    return this.malnutritionForm.get('Weight') as FormArray;
  }
  get Overall(): FormArray {
    return this.malnutritionForm.get('Overall') as FormArray;
  }
  get Diagnosis(): FormArray {
    return this.malnutritionForm.get('Diagnosis') as FormArray;
  }
  vitalSigns:any
  addDiagnosis() {
    const drainGroup = this.formBuilder.group({
      time: [''],
      date: [''],
      Screening: [''],
      diagnosis : [''],
      Signature : [''],
    });
    this.Diagnosis.push(drainGroup);
  }
  addNutritional() {
    const drainGroup = this.formBuilder.group({
      time: [''],
      date: [''],
      Screening: [''],
      diagnosis : [''],
      Signature : [''],
    });
    this.Nutritional.push(drainGroup);
  }
  addWeight() {
    const drainGroup = this.formBuilder.group({
      time: [''],
      date: [''],
      Screening: [''],
      diagnosis : [''],
      Signature : [''],
      wigth:[''],
      height:['']
    });
    this.Weight.push(drainGroup);
  }
  addOverall() {
    const drainGroup = this.formBuilder.group({
      time: [''],
      date: [''],
      Screening: [''],
      diagnosis : [''],
      Signature : [''],
      wigth:[''],
      height:['']
    });
    this.Overall.push(drainGroup);
  }
 

  removeWeight(index: number) {
    this.Weight.removeAt(index);
  }
  removeOverall(index: number) {
    this.Overall.removeAt(index);
  }
  removeDiagnosis(index: number) {
    this.Diagnosis.removeAt(index);
  }
  removeNutritional(index: number) {
    this.Nutritional.removeAt(index);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
}
