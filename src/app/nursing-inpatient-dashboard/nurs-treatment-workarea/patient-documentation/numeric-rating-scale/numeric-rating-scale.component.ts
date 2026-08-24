import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataShareService } from '@services/data-share.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { ActionType, WordType } from '@services/interfaces/common.enum';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-numeric-rating-scale',
  templateUrl: './numeric-rating-scale.component.html',
  styleUrls: ['./numeric-rating-scale.component.scss']
})
export class NumericRatingScaleComponent implements OnInit, OnDestroy {

  public scalesNumericRating: TemplateRef<any>;
  public painScoreList = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
  ];

  public numericRatingForm: FormGroup;
  public userProfile: any;
  public dockeyValue: any;
  private org = localStorage.getItem('initOrg')

  private subscription: Subscription;
  private actionTypeSubscription$: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private storageService: StorageService,
    private datePipe: DatePipe,
    private emergencyService: EmergencyService,
    private sharedService: SharedService,
    private dataShareService: DataShareService,
  ) {
    this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe((data) => {
      if (data != null) {
        if (data.type == ActionType.Update$ && data.isAllow == true && data.value) {
          if (data.value.type == WordType.EditNRS && data.value.docKey != '') {
            this.dockeyValue = data.value.docKey ? data.value.docKey : null;
            if (this.dockeyValue) {
              this.getNumericRatingDetail(this.dockeyValue);
            }
          }

        }
        if(data.type == ActionType.Copy$ && data.isAllow == true && data.value){
          if (data.value.type == WordType.CopyNRS && data.value.docKey != '') {
            this.dockeyValue = data.value.docKey ? data.value.docKey : null;
            if (this.dockeyValue) {
              this.getNumericRatingDetail(this.dockeyValue);
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
    this.userProfile = this.storageService.getUserProfile();
    this.initForm();
  }

  getNumericRatingDetail(dockey: string) {
    // Subscribe using an object to define handlers
    this.subscription = this.emergencyService.getNumericRatingDetail(dockey).subscribe({
      next: (data: any) => {
        // Handle successful data retrieval
        this.numericRatingForm.patchValue({
          AttendPhy: data?.d.AttendPhy,
          Dockey: data?.d.Dockey,
          Einri: data?.d.Einri,
          Falnr: data?.d.Falnr,
          Lfdnr: data?.d.Lfdnr,
          NrsComments: data?.d.NrsComments,
          NrsPainScore: data?.d.NrsPainScore,
          Orgdo: data?.d.Orgdo,
          Patnr: data?.d.Patnr,
        });
        this.selectPainValue(data?.d.NrsPainScore);
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

  initForm() {
    let currentTime = this.datePipe.transform(new Date(), 'hh:mm:ss');
    this.numericRatingForm = this.formBuilder.group({
      Dockey: '',
      Einri: this.storageService.einri,
      Patnr: this.storageService.patnr,
      Falnr: this.storageService.falnr,
      Lfdnr: this.storageService.lfdnr,
      Orgdo: this.org,
      name: '',
      date: new Date(),
      time: currentTime,
      realized: this.userProfile.Gpart,
      realizedDescription: this.userProfile.GpartName,
      totalScore: '',
      description: '',
      NrsPainScore: '',
      NrsComments: '',
      AttendPhy: this.storageService.getGpart(),
      DocStatus: '1',
    });
  }

  selectPainValue(event: any) {
    if (event == '0') {
      this.patchTotalScore('', 'No pain');
    } else if (event == '1') {
      this.patchTotalScore('01', 'Slight pain');
    } else if (event == '2') {
      this.patchTotalScore('02', 'Slight pain');
    } else if (event == '3') {
      this.patchTotalScore('03', 'Slight pain');
    } else if (event == '4') {
      this.patchTotalScore('04', 'Mild pain');
    } else if (event == '5') {
      this.patchTotalScore('05', 'Moderate pain');
    } else if (event == '6') {
      this.patchTotalScore('06', 'Moderate pain');
    } else if (event == '7') {
      this.patchTotalScore('07', 'Severe pain');
    } else if (event == '8') {
      this.patchTotalScore('08', 'Severe pain');
    } else if (event == '9') {
      this.patchTotalScore('09', 'Severe pain');
    } else if (event == '10') {
      this.patchTotalScore('10', 'Worst pain possible');
    }
  }

  patchTotalScore(value: any, description: string) {
    this.numericRatingForm.patchValue({
      totalScore: value,
      description: description,
    });
  }

  saveNumericRight(): Promise<any> {
    return new Promise((resolve, reject) => {
      let payload = {
        d: {
          Dockey: this.numericRatingForm.value.Dockey,
          Einri: this.numericRatingForm.value.Einri,
          Patnr: this.numericRatingForm.value.Patnr,
          Falnr: this.numericRatingForm.value.Falnr,
          Lfdnr: this.numericRatingForm.value.Lfdnr,
          Orgdo: this.storageService.patientData.deptOrgUnit,
          NrsPainScore: this.numericRatingForm.value.NrsPainScore,
          NrsComments: this.numericRatingForm.value.NrsComments,
          AttendPhy: this.storageService.getUserProfile().Gpart,
          DocStatus: this.numericRatingForm.value.DocStatus,
        },
      };
      // Subscribe using an object to define handlers
      this.subscription = this.emergencyService.saveNumericRatingDetail(payload).subscribe({
        next: (data: any) => {
          // Handle successful data retrieval
          let formValue = this.numericRatingForm.value;
          formValue['dockey'] = data?.d.Dockey;
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
          this.sharedService.successSwallModel('Numeric rating scale(more than 8 years) created successfully');
        }
      });
    });
  }


  copyNumericRight(): Promise<any> {
    return new Promise((resolve, reject) => {
      let payload = {
        d: {
          Dockey: this.numericRatingForm.value.Dockey,
          Einri: this.numericRatingForm.value.Einri,
          Patnr: this.numericRatingForm.value.Patnr,
          Falnr: this.numericRatingForm.value.Falnr,
          Lfdnr: this.numericRatingForm.value.Lfdnr,
          Orgdo: this.storageService.patientData.deptOrgUnit,
          NrsPainScore: this.numericRatingForm.value.NrsPainScore,
          NrsComments: this.numericRatingForm.value.NrsComments,
          AttendPhy: this.storageService.getUserProfile().Gpart,
          DocStatus: '3',
        },
      };
      // Subscribe using an object to define handlers
      this.subscription = this.emergencyService.copyNRSScaleSet(payload).subscribe({
        next: (data: any) => {
          // Handle successful data retrieval
          let formValue = this.numericRatingForm.value;
          formValue['dockey'] = data?.d.Dockey;
          // resolve(formValue); // Resolve the promise with formValue
        },
        error: (err: any) => {
          // Handle errors if the request fails
          this.sharedService.waringSwallModel(`PUT Error at numeric right scale : ${err}`);
        },
        complete: () => {
          // Handle completion (optional), invoked when the observable completes
          resolve(true); // Resolve the promise with formValue
          this.sharedService.successSwallModel('Numeric rating scale copied successfully');
        }
      });
    });
  }


}
