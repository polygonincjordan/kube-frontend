import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataShareService } from '@services/data-share.service';
import { DayCaseDashboardService } from '@services/day-case.dashboard/day-case-dashboard.service';
import { ActionType } from '@services/interfaces/common.enum';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cvc-insertion',
  templateUrl: './cvc-insertion.component.html',
  styleUrls: ['./cvc-insertion.component.scss']
})
export class CvcInsertionComponent implements OnInit {

  cvcInsertionForm: FormGroup;

  isFormValidError: boolean = false;
  paramsObject: any;
  docKey: any;
  private actionTypeSubscription$: Subscription;
  private subscription: Subscription;

  anatomicalList = [
    {
      label: 'Subdavian',
      value: '1'
    },
    {
      label: 'Intra-Jugular',
      value: '2'
    },
    {
      label: 'Femoral',
      value: '3'
    },
    {
      label: 'Implanted',
      value: '4'
    },
    {
      label: 'Umbilical',
      value: '5'
    },
    {
      label: 'Peripheral',
      value: '6'
    }
  ];

  venousCatheterList = [
    {
      label: 'Temporary contral line',
      value: '1'
    },
    {
      label: 'Temporary dialysis catheter',
      value: '2'
    },
    {
      label: 'PICC',
      value: '3'
    },
    {
      label: 'Hickman',
      value: '4'
    },
    {
      label: 'Port a-cath',
      value: '5'
    }
  ];

  cvcLumensList = [
    {
      label: '1',
      value: '1'
    },
    {
      label: '2',
      value: '2'
    },
    {
      label: '3',
      value: '3'
    }
  ];
  genderDetails: any;

  constructor(private formBuilder: FormBuilder, private _route: ActivatedRoute, public storageService: StorageService, private datePipe: DatePipe,
    private dataShareService: DataShareService, private dayCaseDashboard: DayCaseDashboardService, private sharedService: SharedService) {
    this._route.queryParams.subscribe((params) => {
      this.paramsObject = params;
    });

    this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe(
      (data) => {
        if (data != null) {
          if (data.type == ActionType.Add$ && data.value == '') {
            this.docKey = data.value.Dockey;
          }
          if (data.type == ActionType.Update$ && data.value) {
            this.docKey = data.value.docKey;
            this.getCvcInsertionDocDetails(data.value.docKey);
          }
          if (data.type == ActionType.Copy$ && data.value) {
            this.docKey = data.value.docKey;
            this.getCvcInsertionDocDetails(data.value.docKey);
          }
        }
      }
    );
  }

  ngOnInit() {
    this.initForm();
    console.log(this.storageService?.patientData, 'this.storageService?.patientData');
    this.genderDetails = this.storageService?.patientData?.gender.includes('Female') ? 'Female' : 'Male'
  }
  cvcFields: string[] = ['Cvc1', 'Cvc2', 'Cvc21', 'Cvc22', 'Cvc23', 'Cvc24', 'Cvc25', 'Cvc3Skin', 'Cvc3Antiseptic', 'Cvc4OptimalCatheter'];
  initForm() {
    let currentTime = this.datePipe.transform(new Date(), 'hh:mm:ss');

    this.cvcInsertionForm = this.formBuilder.group({
      Dockey: "",
      Dtid: "ZMED_CVCI",
      Einri: this.paramsObject.einri,
      Patnr: this.paramsObject.patnr,
      Falnr: this.paramsObject.falnr,
      Lfdnr: this.paramsObject.lfdnr,
      Orgdo: this.storageService?.patientData?.deptOrgUnit,
      AttendPhy: this.storageService.getUserProfile()?.Gpart,
      DocStatus: "1",
      ReceivedTraining1: true,
      AmEmpowered2: true,
      CvcInsertion3: true,
      CvcInsertionBy: "",
      CvcInsertionDate: new Date(),
      CvcInsertionTime: currentTime,
      PatientLocation: "",
      AnatomicalSite: "",
      UltrasoundUsed: "",
      TypeCentralVenous: "",
      NumberCvcLumens: "",
      Cvc1: "",
      Cvc1Txt: "",
      Cvc1Comments: "",
      Cvc2: "",
      Cvc2Txt: "",
      Cvc21: "",
      Cvc21Txt: "",
      Cvc22: "",
      Cvc22Txt: "",
      Cvc23: "",
      Cvc23Txt: "",
      Cvc24: "",
      Cvc24Txt: "",
      Cvc25: "",
      Cvc25Txt: "",
      CvcComments: "",
      Cvc3Skin: "",
      Cvc3SkinTxt: "",
      Cvc3Contraindication: false,
      Cvc3Contraindication1: [{value: '', disabled: true}],
      Cvc3Antiseptic: "",
      Cvc3AntisepticTxt: "",
      Cvc3Comments: "",
      Cvc4OptimalCatheter: "",
      Cvc4OptimalCatheterTxt: "",
      Cvc4Comments: "",
      ComplianceScore: "",
      AnyComplications: "",
      InsertionTrials1: false,
      InsertionTrials2: false,
      InsertionTrials3: false,
      InsertionTrials4: false,
      Comments: ""
    })
  }

  calculateComplianceScore() {
    let total = 0;
    this.cvcFields.forEach(field => {
      const value = this.cvcInsertionForm.get(field)?.value;
      if (!isNaN(value)) {
        total += +value; // Convert to number and add
      }
    });
    this.cvcInsertionForm.get('ComplianceScore')?.setValue(total.toString());
  }

  changeDisabledchlorhexidine() {
    if(this.cvcInsertionForm.get('Cvc3Contraindication')?.value) {
      this.cvcInsertionForm.get('Cvc3Contraindication1').enable()
    } else {
      this.cvcInsertionForm.get('Cvc3Contraindication1').disable();
      this.cvcInsertionForm.setValue({
        Cvc3Contraindication1: ''
      })
    }
  }

  getCvcInsertionDocDetails(docKey?) {
    this.subscription = this.dayCaseDashboard
      .fetcCVCInsertionDocDetails(docKey)
      .subscribe({
        next: (data: any) => {
          this.cvcInsertionForm.patchValue(data.d.results[0])
          this.cvcInsertionForm.patchValue({
            CvcInsertionDate: this.parseDate(data.d.results[0].CvcInsertionDate),
            CvcInsertionTime: this.parseTime(data.d.results[0].CvcInsertionTime),
          });
        },
        error: (err: any) => {
          this.sharedService.waringSwallModel(`Error ${err}`);
          this.sharedService.waringSwallModel(
            `POST Error at Nursing care plans: ${err}`
          );
        },
      });
  }


  createCvcInsertionDocument(docStatus: any, actiontype?: string) {
    return new Promise((resolve, reject) => {
      this.isFormValidError = true;
      if (this.cvcInsertionForm.invalid) {
        return;
      }
      this.cvcInsertionForm.value.DocStatus = docStatus;
      let paylaod = this.cvcInsertionForm.value;
      paylaod['Cvc3Contraindication1'] = this.cvcInsertionForm.getRawValue()?.Cvc3Contraindication1;

      paylaod.CvcInsertionDate = this.sanitizeSAPDateFormat(paylaod.CvcInsertionDate);
      paylaod.CvcInsertionTime = this.parsePayloadFormateTime(paylaod.CvcInsertionTime);
      this.subscription = this.dayCaseDashboard
        .saveCVCInsertionDocument(paylaod)
        .subscribe({
          next: (data: any) => { },
          error: (err: any) => {
            this.sharedService.waringSwallModel(`Error ${err}`);
            this.sharedService.waringSwallModel(
              `PUT Error at Correspondence document : ${err}`
            );
          },
          complete: () => {
            resolve(true);
            if (actiontype === 'edit') {
              this.sharedService.successSwallModel(
                'Correspondence document updated successfully'
              );
            } else {
              this.sharedService.successSwallModel(
                'Correspondence document created successfully'
              );
            }
          },
        });
    });
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


  sanitizeSAPDateFormat(date: any) {
    if (typeof date === 'string') {
      return date;
    } else {
      return `\/Date(${date.getTime()})\/`;
    }
  }

  formatDateToMilliseconds(dateString: string): string {
    console.log(dateString, "--")
    const [datePart, timePart] = dateString.split('/');
    const [day, month, year] = datePart.split('.').map(Number);
    const [hours, minutes, seconds] = timePart.split(':').map(Number);
    const date = new Date(year, month - 1, day, hours, minutes, seconds);
    const timeInMillis = date.getTime();
    return `/Date${timeInMillis}/`;
  }

  parsePayloadFormateTime(data: string) {
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
}
