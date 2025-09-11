import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataShareService } from '@services/data-share.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { ActionType, WordType } from '@services/interfaces/common.enum';
import { PatientDocumentationService } from '@services/patient-documentation.service';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { parseDate } from 'ngx-bootstrap/chronos';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-new-scale-document',
  templateUrl: './new-scale-document.component.html',
  styleUrls: ['./new-scale-document.component.scss'],
})
export class NewScaleDocumentComponent implements OnInit {
  MorsefallForm: FormGroup<any>;
  CurrentDateAndTime: Date = new Date();
  realized: string;
  realizedDescription: string;
  ch_mfs_history_falls: number | null;
  ch_mfs_secondary_diagnosis: number | null;
  ch_mfs_ambulatory_aid: number | null;
  ch_mfs_IV_acess: number | null;
  ch_mfs_gait: number | null;
  ch_mfs_mental_status: number | null;
  totalScore: number;
  description: string;
  dockeyValue: any;
  paramsObject: any;
  encounterId: any;
  apiJson: any;
  morseFallScaleData;
  private actionTypeSubscription$: Subscription;
  private subscription: Subscription;

  constructor(
    private fb: FormBuilder,
    private patientDocService: PatientDocumentationService,
    private emergencyService: EmergencyService,
    private dataShareService: DataShareService,
    private storageService: StorageService,
    private sharedService: SharedService,
    private _route: ActivatedRoute,
    private datePipe: DatePipe
  ) {
    // this.getDocData();
    this._route.queryParams.subscribe((params) => {
      this.paramsObject = params;
      if (this.paramsObject.lfdnr) {
        this.encounterId =
          this.paramsObject.einri +
          this.paramsObject.falnr +
          this.paramsObject.lfdnr;
      }
      this.storageService.setEinri(this.paramsObject.einri);
      this.storageService.setFalnr(this.paramsObject.falnr);
      this.storageService.setLfdnr(this.paramsObject.lfdnr);
      this.storageService.setPatnr(this.paramsObject.patnr);
    });

    this.apiJson = {
      Einri: this.storageService.einri,
      Falnr: this.storageService.falnr,
      Patnr: this.storageService.patnr,
      Lfdnr: this.storageService.lfdnr,
      Lfdbw: this.storageService.lfdnr,
    };
    this.initForm();
    this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe(
      (data) => {
        if (data != null) {
          if (
            data.type == ActionType.Update$ &&
            data.isAllow == true &&
            data.value
          ) {
            if (
              data.value.type == WordType.EditNRS &&
              data.value.docKey != ''
            ) {
              this.dockeyValue = data.value.docKey ? data.value.docKey : null;
              if (this.dockeyValue) {
                this.getDocData(this.dockeyValue);
              }
            }
          }
          if (
            data.type == ActionType.Copy$ &&
            data.isAllow == true &&
            data.value
          ) {
            if (
              data.value.type == WordType.CopyNRS &&
              data.value.docKey != ''
            ) {
              this.dockeyValue = data.value.docKey ? data.value.docKey : null;
              if (this.dockeyValue) {
                this.getDocData(this.dockeyValue);
              }
            }
          }
        }
      }
    );
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

  getDocData(dockey: string) {
    // Subscribe using an object to define handlers
    this.subscription = this.emergencyService
      .fetchApgarScaleDoc(dockey)
      .subscribe({
        next: (res: any) => {
          // Handle successful data retrieval
          // this.MorsefallForm.patchValue(data?.d?.results[0]);
          // this.MorsefallForm.setValue({
          //   Datee: this.parseDate(data?.d?.results[0]?.Datee),
          // });
          const data = res.d.results[0];
          this.MorsefallForm.patchValue({
            Dockey: data.Dockey,
            Dtid: data.Dtid,
            Einri: data.Einri,
            Datee: parseDate(data.Datee), // Convert SAP date
            Timee: this.parseTime(data.Timee), // Convert SAP time
            Patnr: data.Patnr,
            Falnr: data.Falnr,
            Lfdnr: data.Lfdnr,
            Orgdo: data.Orgdo,
            AttendPhy: data.AttendPhy,
            DocStatus: data.DocStatus,
            SkinColor: data.SkinColor,
            PulseRate: data.PulseRate,
            Grimace: data.Grimace,
            Activity: data.Activity,
            RespiratoryEffort: data.RespiratoryEffort,
            TotalScore: data.TotalScore,
            ScoreDesc: data.ScoreDesc,
            Comments: data.Comments,
          });
        },
        error: (err: any) => {
          // Handle errors if the request fails
          console.error('Error fetching Glasgow Scale Data:', err);
          this.sharedService.waringSwallModel(
            `GET Error at numeric rating scale : ${err}`
          );
        },
        complete: () => {
          // Handle completion (optional), invoked when the observable completes
          console.info('Numeric Rating Scale Data retrieval complete');
        },
      });
  }

  ngOnInit(): void {}

  initForm() {
    let currentTime = this.datePipe.transform(new Date(), 'hh:mm');

    this.MorsefallForm = this.fb.group({
      Dockey: [''],
      Dtid: ['SCA_APG'],
      Einri: this.paramsObject.einri,
      Datee: [new Date()],
      Timee: [currentTime],
      Patnr: this.paramsObject.patnr,
      Falnr: this.paramsObject.falnr,
      Lfdnr: this.paramsObject.lfdnr,
      Orgdo: [this.storageService.patientData.deptOrgUnit],
      AttendPhy: [this.storageService.getUserProfile().Gpart],
      DocStatus: ['1'],
      SkinColor: ['A'],
      PulseRate: ['A'],
      Grimace: ['A'],
      Activity: ['A'],
      RespiratoryEffort: ['A'],
      TotalScore: ['0'],
      ScoreDesc: [''],
      Comments: [''],
    });

    this.realized = this.storageService.getUserProfile().Gpart;
    this.realizedDescription = this.storageService.getUserProfile().GpartName;

    this.MorsefallForm.controls['AttendPhy'].patchValue(this.realized);
    this.MorsefallForm.get('SkinColor').valueChanges.subscribe(() =>
      this.calculateTotalScore()
    );
    this.MorsefallForm.get('PulseRate').valueChanges.subscribe(() =>
      this.calculateTotalScore()
    );
    this.MorsefallForm.get('Grimace').valueChanges.subscribe(() =>
      this.calculateTotalScore()
    );
    this.MorsefallForm.get('Activity').valueChanges.subscribe(() =>
      this.calculateTotalScore()
    );
    this.MorsefallForm.get('RespiratoryEffort').valueChanges.subscribe(() =>
      this.calculateTotalScore()
    );

    this.calculateTotalScore();
  }

  getFormData() {
    return this.MorsefallForm.value;
  }

  calculateTotalScore() {
    const getVal = (key: string) =>
      parseInt(this.MorsefallForm.get(key).value, 10) || 0;
    const total =
      getVal('SkinColor') +
      getVal('PulseRate') +
      getVal('Grimace') +
      getVal('Activity') +
      getVal('RespiratoryEffort');

    this.MorsefallForm.get('TotalScore').setValue(total);

    let desc = '';
    if (total >= 0 && total <= 3) {
      desc = 'Needs immediate resuscitation';
    } else if (total >= 4 && total <= 6) {
      desc = 'Needs medical intervention';
    } else if (total >= 7 && total <= 10) {
      desc = 'Normal';
    }

    this.MorsefallForm.get('ScoreDesc').setValue(desc);
  }

  saveApgarScaleDoc(status): Promise<any> {
    return new Promise((resolve, reject) => {
      let payload = {
        d: this.MorsefallForm.value,
      };
      // if(status == '3') payload.d.Dockey = '';
      payload.d.DocStatus = status;
      payload.d.TotalScore = payload.d.TotalScore.toString();
      (payload.d.Orgdo = this.storageService.patientData.deptOrgUnit),
        (payload.d.AttendPhy = this.storageService.getUserProfile().Gpart),
        (payload.d.Datee = `${new DatePipe('en-US').transform(
          payload.d.Datee,
          'yyyy-MM-dd'
        )}T00:00:00`);
      payload.d.Timee = this.convertTimeToDuration(payload.d.Timee);

      // Subscribe using an object to define handlers
      this.subscription = this.emergencyService
        .saveApgarScaleDoc(payload)
        .subscribe({
          next: (data: any) => {
            // Handle successful data retrieva
            // resolve(formValue); // Resolve the promise with formValue
          },
          error: (err: any) => {
            // Handle errors if the request fails
            this.sharedService.waringSwallModel(`Error ${err}`);
            this.sharedService.waringSwallModel(
              `POST Error at glosgow : ${err}`
            );
          },
          complete: () => {
            // Handle completion (optional), invoked when the observable completes
            resolve(true); // Resolve the promise with formValue
            this.sharedService.successSwallModel(
              'APGAR Scale Document created successfully'
            );
          },
        });
    });
  }

  public getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }

  convertODataDate(dateString: string): Date {
    return new Date(parseInt(dateString.match(/\d+/)[0], 10));
  }

  // Convert OData time (PT12H48M00S → HH:mm:ss)
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
  convertTimeToDuration(timeString: string): string {
    if (!timeString) return '';

    const [hours, minutes, seconds] = timeString.split(':').map(Number);

    // Ensure values are properly formatted
    const formattedHours = hours ? `PT${hours}H` : 'PT00H';
    const formattedMinutes = minutes ? `${minutes}M` : '00M';
    const formattedSeconds = seconds ? `${seconds}S` : '00S';

    return `${formattedHours}${formattedMinutes}${formattedSeconds}`;
  }

  parseDate(date: string) {
    if (date) {
      return new Date(
        new Date(
          +date.replace('/Date(', '').replace(')/', '')
        ).toLocaleDateString('en-US')
      );
    }
  }
}
