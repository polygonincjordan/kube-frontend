import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataShareService } from '@services/data-share.service';
import { BradenScaleType } from '@services/e-kardex/interfaces/documents.interface';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { ActionType, WordType } from '@services/interfaces/common.enum';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-braden-scale',
  templateUrl: './braden-scale.component.html',
  styleUrls: ['./braden-scale.component.scss']
})
export class BradenScaleComponent implements OnInit, OnDestroy {
  public Sensoryperception: any;
  public Activity: any;
  public Moisture: any;
  public Mobility: any;
  public Nutrition: any;
  public Frictionandshear: any;
  public NrsComments: any;
  public dockeyValue: any = null;

  public currentDate: any;
  public currentTime: any;
  public realized: any;
  public realizedDescription: any;

  public totalScoreDescription: string = "";
  public totalProjectScore: number = 0;

  private subscription: Subscription;
  private actionTypeSubscription$: Subscription;

  public initialValueList: BradenScaleType[] = [
    { id: 1, keyId: '', text: '', value: '0', isDisable: false },
    { id: 2, keyId: '', text: '', value: '1', isDisable: false },
    { id: 3, keyId: '', text: '', value: '2', isDisable: false },
    { id: 4, keyId: '', text: '', value: '3', isDisable: false },
    { id: 5, keyId: '', text: '', value: '4', isDisable: false }
  ];

  public SensoryPrescriptionList: BradenScaleType[] = [
    { id: 1, keyId: 'notanswered1', text: 'Not Answered', value: '0', isDisable: false },
    { id: 2, keyId: 'completelylimited', text: 'Completely Limited', value: '1', isDisable: false },
    { id: 3, keyId: 'verylimited1', text: 'Very Limited', value: '2', isDisable: false },
    { id: 4, keyId: 'slightlylimited1', text: 'Slightly Limited', value: '3', isDisable: false },
    { id: 5, keyId: 'noimpairment1', text: 'No Impairment', value: '4', isDisable: false }
  ];
  public MoistureList: BradenScaleType[] = [
    { id: 1, keyId: 'notanswered2', text: 'Not Answered', value: '0', isDisable: false },
    { id: 2, keyId: 'constantlymoist', text: 'Constantly Moist', value: '1', isDisable: false },
    { id: 3, keyId: 'verymoist', text: 'Very Moist', value: '2', isDisable: false },
    { id: 4, keyId: 'occasionallymoist', text: 'Occasionally Moist', value: '3', isDisable: false },
    { id: 5, keyId: 'rarelymoist', text: 'Rarely Moist', value: '4', isDisable: false }
  ];
  public ActivityList: BradenScaleType[] = [
    { id: 1, keyId: 'notanswered3', text: 'Not Answered', value: '0', isDisable: false },
    { id: 2, keyId: 'bedrest', text: 'Bed Rest', value: '1', isDisable: false },
    { id: 3, keyId: 'chairfast', text: 'Chairfast', value: '2', isDisable: false },
    { id: 4, keyId: 'walkoccasionally', text: 'Walk Occasionally', value: '3', isDisable: false },
    { id: 5, keyId: 'Walks', text: 'Walks', value: '4', isDisable: false }
  ];
  public MobilityList: BradenScaleType[] = [
    { id: 1, keyId: 'notanswered4', text: 'Not Answered', value: '0', isDisable: false },
    { id: 2, keyId: 'completelyimmobile', text: 'Completely Immobile', value: '1', isDisable: false },
    { id: 3, keyId: 'verylimited2', text: 'Very Limited', value: '2', isDisable: false },
    { id: 4, keyId: 'slightlylimited2', text: 'Slightly Limited', value: '3', isDisable: false },
    { id: 5, keyId: 'noimpairment2', text: 'No Impairment', value: '4', isDisable: false }
  ];
  public NutritionList: BradenScaleType[] = [
    { id: 1, keyId: 'notanswered5', text: 'Not Answered', value: '0', isDisable: false },
    { id: 2, keyId: 'verypoor', text: 'Very Poor', value: '1', isDisable: false },
    { id: 3, keyId: 'probablyinadequate', text: 'Probably inadequate', value: '2', isDisable: false },
    { id: 4, keyId: 'adequate', text: 'Adequate', value: '3', isDisable: false },
    { id: 5, keyId: 'excellent', text: 'Excellent', value: '4', isDisable: false }
  ];
  public FrictionNShearList: BradenScaleType[] = [
    { id: 1, keyId: 'notanswered6', text: 'Not Answered', value: '0', isDisable: false },
    { id: 2, keyId: 'problem', text: 'Problem', value: '1', isDisable: false },
    { id: 3, keyId: 'potentialproblem', text: 'Potential Problem', value: '2', isDisable: false },
    { id: 4, keyId: 'noapparentproblem', text: 'No Apparent Problem', value: '3', isDisable: false },
  ];

  constructor(
    private emergencyService: EmergencyService,
    private dataShareService: DataShareService,
    private storageService: StorageService,
    private sharedService: SharedService,
    private datePipe: DatePipe,
  ) {
    this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe((data) => {
      if (data != null) {
        if (data.type == ActionType.Update$ && data.isAllow == true && data.value) {
          if (data.value.type == WordType.EditBS && data.value.docKey != '') {
            this.totalScoreCalc();
            this.dockeyValue = data.value.docKey ? data.value.docKey : null;
            if (this.dockeyValue) {
              this.getBradenScaleDetails(data.value.docKey);
            }
          }
        }
        if (data.type == ActionType.Copy$ && data.isAllow == true && data.value) {
          if (data.value.type == WordType.CopyBS && data.value.docKey != '') {
            this.totalScoreCalc();
            this.dockeyValue = data.value.docKey ? data.value.docKey : null;
            if (this.dockeyValue) {
              this.getBradenScaleDetails(data.value.docKey);
            }
          }
        }
      }
    });
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

  ngOnInit(): void {
    this.Sensoryperception = '0';
    this.Activity = '0';
    this.Moisture = '0';
    this.Mobility = '0';
    this.Nutrition = '0';
    this.Frictionandshear = '0';

    this.currentDate = new Date();
    this.currentTime = this.datePipe.transform(new Date(), 'hh:mm:ss');

    this.totalProjectScore = 0;
    this.totalScoreDescription = "Not all questions are answered";

    this.realized = JSON.parse(
      localStorage.getItem('amc_dev_loggedInUserProfile')
    ).Gpart;
    this.realizedDescription = JSON.parse(
      localStorage.getItem('amc_dev_loggedInUserProfile')
    ).GpartName;
  }


  public selectSensoryPerceptionQuestion(event: any, number: any) {
    this.Sensoryperception = number;
    this.totalScoreCalc();
  }
  public selectMoistureQuestion(event: any, number: any) {
    this.Moisture = number;
    this.totalScoreCalc();
  }
  public selectActivityQuestion(event: any, number: any) {
    this.Activity = number;
    this.totalScoreCalc();
  }
  public selectMobilityQuestion(event: any, number: any) {
    this.Mobility = number;
    this.totalScoreCalc();
  }
  public selectNutritionQuestion(event: any, number: any) {
    this.Nutrition = number;
    this.totalScoreCalc();
  }
  public selectFrictionNSearQuestion(event: any, number: any) {
    this.Frictionandshear = number;
    this.totalScoreCalc();
  }

  public totalScoreCalc() {
    this.totalProjectScore = parseInt(this.Sensoryperception);
    this.totalScoreDescription = `Sensory perception ${this.Sensoryperception}`;
    if (this.Activity) {
      this.totalProjectScore =
        this.totalProjectScore + parseInt(this.Activity);
      // this.totalScoreDescription = this.totalScoreDescription + ` Activity ${this.Activity}`;
    }
    if (this.Moisture) {
      this.totalProjectScore =
        this.totalProjectScore + parseInt(this.Moisture);
      // this.totalScoreDescription = this.totalScoreDescription + ` Moisture ${this.Moisture}`;
    }
    if (this.Mobility) {
      this.totalProjectScore =
        this.totalProjectScore + parseInt(this.Mobility);
      // this.totalScoreDescription = this.totalScoreDescription + ` Mobility ${this.Mobility}`;
    }
    if (this.Nutrition) {
      this.totalProjectScore =
        this.totalProjectScore + parseInt(this.Nutrition);
      // this.totalScoreDescription = this.totalScoreDescription + ` Nutrition ${this.Nutrition}`;
    }
    if (this.Frictionandshear) {
      this.totalProjectScore =
        this.totalProjectScore + parseInt(this.Frictionandshear);
      // this.totalScoreDescription = this.totalScoreDescription + ` Friction and shear ${this.Frictionandshear}`;
    }
    this.totalScoreDescription = `${this.conditionalScoreLabel()}`;
  }


  public conditionalScoreLabel() {
    console.log(this.totalProjectScore);
    if (this.totalProjectScore <= 0) {
      return 'Not all questions are answered'
    } else if (this.totalProjectScore <= 9) {
      return 'Very High Risk';
    } else if (10 <= this.totalProjectScore && this.totalProjectScore <= 12) {
      return 'High Risk';
    } else if (13 <= this.totalProjectScore && this.totalProjectScore <= 14) {
      return 'Moderate risk';
    } else if (15 <= this.totalProjectScore && this.totalProjectScore <= 18) {
      return 'Mild risk';
    } else if (19 <= this.totalProjectScore && this.totalProjectScore <= 23) {
      return 'No risk';
    }
  }

  createBradeScale(): Promise<any> {
    return new Promise((resolve, reject) => {
      let payload = {
        d: {
          Dockey: this.dockeyValue != null ? this.dockeyValue : '',
          Einri: this.storageService.einri,
          Patnr: this.storageService.patnr,
          Falnr: this.storageService.falnr,
          Lfdnr: this.storageService.lfdnr,
          Orgdo: localStorage.getItem('initOrg'),
          AttendPhy: this.storageService.getGpart(),
          SensoryPerception: this.Sensoryperception,
          Moisture: this.Moisture,
          Activity: this.Activity,
          Mobility: this.Mobility,
          Nutrition: this.Nutrition,
          FrictionShear: this.Frictionandshear,
          NrsComments: this.NrsComments,
          DocStatus: '1',
        },
      };
      // Subscribe using an object to define handlers
      this.subscription = this.emergencyService.createBradenData(payload).subscribe({
        next: (data: any) => {
          // Handle successful data retrieval
          let currentTime = this.datePipe.transform(new Date(), 'HH:mm:ss');
          let formValue = {
            totalScore: this.totalProjectScore,
            description: this.totalScoreDescription,
            dockey: data?.d.Dockey,
            time: currentTime,
            date: new Date()
          }
          // this.glasgowValue.next(formValue); // emit value if needed...
          // resolve(formValue); // Resolve the promise with formValue
        },
        error: (err: any) => {
          // Handle errors if the request fails
          this.sharedService.waringSwallModel(`POST Error at braden scale : ${err}`);
        },
        complete: () => {
          // Handle completion (optional), invoked when the observable completes
          resolve(true); // Resolve the promise with formValue
          this.sharedService.successSwallModel('Braden scale created successfully');
        }
      });
    });
  }

  public getBradenScaleDetails(dockey: string) {
    // Subscribe using an object to define handlers
    this.subscription = this.emergencyService.getBradenScaleData(dockey).subscribe({
      next: (data: any) => {
        // Handle successful data retrieval
        this.Activity = data?.d.Activity;
        this.Mobility = data?.d.Mobility;
        this.Moisture = data?.d.Moisture;
        this.NrsComments = data?.d.NrsComments;
        this.Nutrition = data?.d.Nutrition;
        this.Sensoryperception = data?.d.SensoryPerception;
        this.Frictionandshear = data?.d.FrictionShear;
        this.totalScoreCalc();
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

  copyBradeScale(): Promise<any> {
    return new Promise((resolve, reject) => {
      let payload = {
        d: {
          Dockey: this.dockeyValue != null ? this.dockeyValue : '',
          Einri: this.storageService.einri,
          Patnr: this.storageService.patnr,
          Falnr: this.storageService.falnr,
          Lfdnr: this.storageService.lfdnr,
          Orgdo: localStorage.getItem('initOrg'),
          SensoryPerception: this.Sensoryperception,
          Moisture: this.Moisture,
          Activity: this.Activity,
          Mobility: this.Mobility,
          Nutrition: this.Nutrition,
          FrictionShear: this.Frictionandshear,
          NrsComments: this.NrsComments,
          AttendPhy: this.storageService.getGpart(),
          DocStatus: '3',
        },
      };
      // Subscribe using an object to define handlers
      this.subscription = this.emergencyService.copyBradenScaleSet(payload).subscribe({
        next: (data: any) => {
          // Handle successful data retrieval
          // resolve(formValue); // Resolve the promise with formValue
        },
        error: (err: any) => {
          // Handle errors if the request fails
          this.sharedService.waringSwallModel(`PUT Error at braden scale : ${err}`);
        },
        complete: () => {
          // Handle completion (optional), invoked when the observable completes
          resolve(true); // Resolve the promise with formValue
          this.sharedService.successSwallModel('Braden scale Copied successfully');
        }
      });
    });
  }

}
