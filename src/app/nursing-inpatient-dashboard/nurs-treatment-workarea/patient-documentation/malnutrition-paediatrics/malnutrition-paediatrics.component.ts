import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdmissionService } from '@services/admission/admission.service';
import { DataShareService } from '@services/data-share.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { ActionType, WordType } from '@services/interfaces/common.enum';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-malnutrition-paediatrics',
  templateUrl: './malnutrition-paediatrics.component.html',
  styleUrls: ['./malnutrition-paediatrics.component.scss'],
})
export class MalnutritionPaediatricsComponent implements OnInit {
  @Input() isReadOnly : boolean =false;
  public CurrentDateAndTime: Date = new Date();
  malnutritionForm: FormGroup;
  currentTime: any;
  toAllergyArr: any;
  toVitalsArr: any;
  activeTab: string = 'Neurosensory'; // Default tab
  diagnosisOptions = [
    { value: '0', label: '(0) No nutritional implications' },
    { value: '2', label: '(2) Possible nutritional implications' },
    { value: '3', label: '(3) Definite nutritional implications' }
  ];

  intakeOptions = [
    { value: '0', label: '(0) No change in eating patterns and good nutritional intake' },
    { value: '2', label: '(2) Recently decreased or poor nutritional intake' },
    { value: '3', label: '(3) No nutritional intake' }
  ];

  growthChartOptions = [
    { value: '0', label: '(0) 0 to 1 centile spaces/columns apart' },
    { value: '1', label: '(1) > 2 centile spaces/= 2 columns apart' },
    { value: '3', label: '(3) ≥ 3 centile spaces/≥ 3 columns apart/weight < 2ndcentile' }
  ];
  realized: any;
  realizedDescription: any;
  vitalSigns: any
  dockeyValue: any
  private subscription: Subscription;
  private actionTypeSubscription$: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private _route: ActivatedRoute,
    public storageService: StorageService,
    public admissionService: AdmissionService,
    private sharedService: SharedService,
    private dataShareService: DataShareService,
    private emergencyService: EmergencyService
  ) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    this.currentTime = `${hours}:${minutes}:${seconds}`;

    this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe((data) => {
      if (data != null) {
        if (data.type == ActionType.Update$ && data.isAllow == true && data.value) {
          if (data.value.type == WordType.EditBS && data.value.docKey != '') {
            this.dockeyValue = data.value.docKey ? data.value.docKey : null;
            if (this.dockeyValue) {
              this.getStampDocDetails(data.value.docKey);
            }
          }
        }
        if (data.type == ActionType.Copy$ && data.isAllow == true && data.value) {
          if (data.value.type == WordType.CopyBS && data.value.docKey != '') {
            this.dockeyValue = data.value.docKey ? data.value.docKey : null;
            if (this.dockeyValue) {
              this.getStampDocDetails(data.value.docKey);
            }
          }
        }
      }
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.realized = this.storageService.getUserProfile().Gpart;
    this.realizedDescription = this.storageService.getUserProfile().GpartName;
    if(this.isReadOnly){
      this.getStampDocDetails(this.admissionService.selectedCurrentDocDetails.Dockey)
    }
  }

  initForm() {
    this.malnutritionForm = this.formBuilder.group({
      Dockey: "",
      Dtid: "ZSCA_STAMP",
      Einri: this.storageService.einri,
      Patnr: this.storageService.patnr,
      Falnr: this.storageService.falnr,
      Lfdnr: this.storageService.lfdnr,
      Orgdo: localStorage.getItem('initOrg'),
      AttendPhy: this.storageService.getGpart(),
      DocStatus: "1",
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

  calculateScore(index: number) {
    const diagnosisArray = this.malnutritionForm.get('Diagnosis') as FormArray;
    const nutritionalArray = this.malnutritionForm.get('Nutritional') as FormArray;
    const weightArray = this.malnutritionForm.get('Weight') as FormArray;
    const overallArray = this.malnutritionForm.get('Overall') as FormArray;

    let score = 0;

    const doesTheChild = +diagnosisArray.at(index).get('DoesTheChild')?.value || 0;
    const whatIsTheChild = +nutritionalArray.at(index).get('WhatIsTheChild')?.value || 0;
    const useGrowthChart = +weightArray.at(index).get('UseGrowthChart')?.value || 0;

    score = doesTheChild + whatIsTheChild + useGrowthChart;

    // overallArray.at(index).patchValue({ Score: score.toString() });
    let riskLevel = '';

    if (isNaN(score)) {
      riskLevel = '';
    } else if (score >= 4) {
      riskLevel = 'High Risk';
    } else if (score === 2 || score === 3) {
      riskLevel = 'Medium Risk';
    } else if (score === 0 || score === 1) {
      riskLevel = 'Low Risk';
    }

    // Patch both Score and RiskLevel
    overallArray.at(index).patchValue({
      Score: score.toString(),
      RiskLevel: riskLevel
    });
  }

  addDiagnosis() {
    const drainGroup = this.formBuilder.group({
      Dockey: "",
      Screening: (this.Diagnosis.length + 1),
      DoesTheChild: "",
      EntryDate: new Date(),
      EntryTime: this.currentTime,
      Signature: ""
    });
    this.Diagnosis.push(drainGroup);
  }
  addNutritional() {
    const drainGroup = this.formBuilder.group({
      Dockey: "",
      Screening: (this.Nutritional.length + 1),
      WhatIsTheChild: "",
      EntryDate: new Date(),
      EntryTime: this.currentTime,
      Signature: ""
    });
    this.Nutritional.push(drainGroup);
  }
  addWeight() {
    const drainGroup = this.formBuilder.group({
      Dockey: "",
      Screening: (this.Weight.length + 1),
      Weight: "",
      Height: "",
      UseGrowthChart: "",
      EntryDate: new Date(),
      EntryTime: this.currentTime,
      Signature: ""
    });
    this.Weight.push(drainGroup);
  }
  addOverall() {
    const drainGroup = this.formBuilder.group({
      Dockey: "",
      Screening: (this.Overall.length + 1),
      Score: "",
      RiskLevel: "",
      EntryDate: new Date(),
      EntryTime: this.currentTime,
      Signature: ""
    });
    this.Overall.push(drainGroup);
  }

  public getStampDocDetails(dockey: string) {
    // Subscribe using an object to define handlers
    this.subscription = this.emergencyService.getDocStampDetails(dockey).subscribe({
      next: (resposne: any) => {
        const data = resposne.d.results[0];

        // Step 1: Patch simple fields
        this.malnutritionForm.patchValue({
          Dockey: data.Dockey,
          Dtid: data.Dtid,
          Einri: data.Einri,
          Patnr: data.Patnr,
          Falnr: data.Falnr,
          Lfdnr: data.Lfdnr,
          Orgdo: data.Orgdo,
          AttendPhy: data.AttendPhy,
          DocStatus: data.DocStatus || "1",
        });

        // Step 2: Bind TOWEIGHTHEIGHT (Weight FormArray)
        const weightArray = this.malnutritionForm.get('Weight') as FormArray;
        weightArray.clear();

        data.TOWEIGHTHEIGHT.results
          .filter(item => item.Screening?.trim() !== '')
          .forEach(item => {
            weightArray.push(this.formBuilder.group({
              Dockey: item.Dockey,
              Screening: item.Screening,
              Weight: item.Weight,
              Height: item.Height,
              UseGrowthChart: item.UseGrowthChart,
              EntryDate: this.parseDate(item.EntryDate),
              EntryTime: this.parseTime(item.EntryTime),
              Signature: item.Signature
            }));
          });

        for (let index = data.TOWEIGHTHEIGHT.results.length; index < 3; index++) {
          this.addWeight();
        }

        // Step 3: Bind TONUTRITIONAL (Nutritional FormArray)
        const nutritionalArray = this.malnutritionForm.get('Nutritional') as FormArray;
        nutritionalArray.clear();

        data.TONUTRITIONAL.results
          .filter(item => item.Screening?.trim() !== '')
          .forEach(item => {
            nutritionalArray.push(this.formBuilder.group({
              Dockey: item.Dockey,
              Screening: item.Screening,
              WhatIsTheChild: item.WhatIsTheChild,
              EntryDate: this.parseDate(item.EntryDate),
              EntryTime: this.parseTime(item.EntryTime),
              Signature: item.Signature
            }));
          });

        for (let index = data.TONUTRITIONAL.results.length; index < 3; index++) {
          this.addNutritional();
        }

        // Step 4: Bind TOVERALLRISK (Overall FormArray)
        const overallArray = this.malnutritionForm.get('Overall') as FormArray;
        overallArray.clear();

        data.TOVERALLRISK.results
          .filter(item => item.Screening?.trim() !== '')
          .forEach(item => {
            overallArray.push(this.formBuilder.group({
              Dockey: item.Dockey,
              Screening: item.Screening,
              Score: item.Score,
              RiskLevel: item.RiskLevel,
              EntryDate: this.parseDate(item.EntryDate),
              EntryTime: this.parseTime(item.EntryTime),
              Signature: item.Signature
            }));
          });

        for (let index = data.TOVERALLRISK.results.length; index < 3; index++) {
          this.addOverall();
        }

        // Step 5: Bind TODIAGNOSIS (Diagnosis FormArray)
        const diagnosisArray = this.malnutritionForm.get('Diagnosis') as FormArray;
        diagnosisArray.clear();

        data.TODIAGNOSIS.results
          .filter(item => item.Screening?.trim() !== '')
          .forEach(item => {
            diagnosisArray.push(this.formBuilder.group({
              Dockey: item.Dockey,
              Screening: item.Screening,
              DoesTheChild: item.DoesTheChild,
              EntryDate: this.parseDate(item.EntryDate),
              EntryTime: this.parseTime(item.EntryTime),
              Signature: item.Signature
            }));
          });

         for (let index = data.TODIAGNOSIS.results.length; index < 3; index++) {
            this.addDiagnosis();
          }
      },
      error: (err: any) => {
        // Handle errors if the request fails
        console.error('Error fetching Braden Scale Data:', err);
        this.sharedService.waringSwallModel(`GET Error at braden : ${err}`);
      },
      complete: () => {
        // Handle completion (optional), invoked when the observable completes
        console.log('Braden Scale Data retrieval complete');
      }
    });
  }

  createStampDocument(docStatus): Promise<any> {
    return new Promise((resolve, reject) => {
      let payload = {
        d: {
          Dockey: this.malnutritionForm.value.Dockey,
          Dtid: this.malnutritionForm.value.Dtid,
          Einri: this.malnutritionForm.value.Einri,
          Patnr: this.malnutritionForm.value.Patnr,
          Falnr: this.malnutritionForm.value.Falnr,
          Lfdnr: this.malnutritionForm.value.Lfdnr,
          Orgdo: this.malnutritionForm.value.Orgdo,
          AttendPhy: this.malnutritionForm.value.AttendPhy,
          DocStatus: docStatus,
          TONUTRITIONAL: this.malnutritionForm.value.Nutritional.filter(item => item?.WhatIsTheChild).map((item) => ({
            ...item,
            WhatIsTheChild: item.WhatIsTheChild.toString(),
            Screening: item.Screening.toString(),
            EntryDate: this.sanitizeSAPDateFormat(item.EntryDate),
            EntryTime: this.parsePayloadFormateTime(item.EntryTime),
          })),


          TOWEIGHTHEIGHT: this.malnutritionForm.value.Weight.filter(item => item?.UseGrowthChart).map((item) => ({
            ...item,
            UseGrowthChart: item.UseGrowthChart.toString(),
            Screening: item.Screening.toString(),
            EntryDate: this.sanitizeSAPDateFormat(item.EntryDate),
            EntryTime: this.parsePayloadFormateTime(item.EntryTime),
          })),
          TOVERALLRISK: this.malnutritionForm.value.Overall.filter(item => item?.Score).map((item) => ({
            ...item,
            Screening: item?.Screening.toString(),
            EntryDate: this.sanitizeSAPDateFormat(item.EntryDate),
            EntryTime: this.parsePayloadFormateTime(item.EntryTime),
          })),
          TODIAGNOSIS: this.malnutritionForm.value.Diagnosis.filter(item => item?.DoesTheChild).map((item) => ({
            ...item,
            DoesTheChild: item.DoesTheChild.toString(),
            Screening: item?.Screening.toString(),
            EntryDate: this.sanitizeSAPDateFormat(item.EntryDate),
            EntryTime: this.parsePayloadFormateTime(item.EntryTime),
          }))
        },
      };

      console.log(payload, "-----");
      // return;
      this.subscription = this.emergencyService.saveStampDocument(payload).subscribe({
        next: (data: any) => {

        },
        error: (err: any) => {
          this.sharedService.waringSwallModel(`POST Error at Screening Tool for the Assessment of Malnutrition in Paediatrics : ${err}`);
        },
        complete: () => {
          resolve(true);
          this.sharedService.successSwallModel('Screening Tool for the Assessment of Malnutrition in Paediatrics created successfully');
        }
      });
    });
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

  parsePayloadFormateTime(data: string) {
    if (data.slice(0, 2) == 'PT') {
      return data;
    }
    if (data && data.length) {
      const strArr: string[] = data.split(':');
      if (data && data.length === 8) {
        return `PT${strArr[0]}H${strArr[1]}M${strArr[2]}S`;
      }
    }
    return null;
  }

  public parseTime(data: string) {
    // Check if data is valid and matches the expected format
    if (
      !data ||
      data.length !== 11 ||
      data[4] !== 'H' ||
      data[7] !== 'M' ||
      data[10] !== 'S'
    ) {
      return null;
    }

    // Extract hours, minutes, and seconds from the input string
    const hours = parseInt(data.slice(2, 4), 10);
    const minutes = parseInt(data.slice(5, 7), 10);
    const seconds = parseInt(data.slice(8, 10), 10);

    // Check if extracted values are valid numbers
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
      return null;
    }

    // Format hours, minutes, and seconds with leading zeros if necessary
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    // Construct the formatted time string
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    return null;
  }

  parseDate(date: string) {
    if (date) {
      if (new Date(new Date(+(date.replace('/Date(', '').replace(')/', ''))).toLocaleDateString("en-US"))) {
        return new Date(new Date(+(date.replace('/Date(', '').replace(')/', ''))).toLocaleDateString("en-US"));
      }
    }
  }


  sanitizeSAPDateFormat(date: any) {
    if (typeof (date) === 'string') {
      return date;
    } else {
      return `\/Date(${date.getTime()})\/`
    }
  }
}
