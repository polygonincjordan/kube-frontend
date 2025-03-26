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
  selector: 'app-time-out-checklist',
  templateUrl: './time-out-checklist.component.html',
  styleUrls: ['./time-out-checklist.component.scss']
})
export class TimeOutChecklistComponent implements OnInit {

  timeOutForm: FormGroup;
  tabList = [
    'Procedure Details',
    'Following were verified',
    'For Dental Department',
  ];
  selectedTabName: string = 'Procedure Details';
  paramsObject: any;
  docKey: any;
  isFormValidError: boolean = false;
  private actionTypeSubscription$: Subscription;
  private subscription: Subscription;

  constructor(private formBuilder: FormBuilder, private _route: ActivatedRoute, private storageService: StorageService, private datePipe: DatePipe,
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
            this.getTimeOutDocDetails(data.value.docKey);
          }
          if (data.type == ActionType.Copy$ && data.value) {
            this.docKey = data.value.docKey;
            this.getTimeOutDocDetails(data.value.docKey);
          }
        }
      }
    );
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    let currentTime = this.datePipe.transform(new Date(), 'hh:mm:ss');
    this.timeOutForm = this.formBuilder.group({
      Dockey: "",
      Dtid: "ZMED_TIMOT",
      Einri: this.paramsObject.einri,
      Patnr: this.paramsObject.patnr,
      Falnr: this.paramsObject.falnr,
      Lfdnr: this.paramsObject.lfdnr,
      Orgdo: this.storageService?.patientData?.deptOrgUnit,
      AttendPhy: this.storageService.getUserProfile()?.Gpart,
      DocStatus: "1",
      ProcedureDate: new Date(),
      ProcedureTime: currentTime,
      ProcedureName: "",
      Indication: "",
      PIcu: false,
      POpd: false,
      PCathLab: false,
      PIdu: false,
      PLaborDelivery: false,
      PRadiology: false,
      PUrologyProcedures: false,
      PEr: false,
      PEndoscopy: false,
      PIp: false,
      PNicu: false,
      PNursery: false,
      PVipNursery: false,
      PDayCare: false,
      PInfusionBays: false,
      PHemodialysis: false,
      POthers: false,
      POthersTxt: "",
      FEquipment: false,
      FPrivilegedPra: false,
      FCorrectPatient: false,
      FConsentProcedure: false,
      FCorrectProcedure: false,
      FCorrectProcSite: false,
      FCorrectPatientPos: false,
      FSiteMarking: "",
      FdEquipment: false,
      FdCorrectPatientPos: false,
      Physician: "",
      AttendingNurse: "",
      Anaesthetist: ""

    })
  }

  getTimeOutDocDetails(docKey?) {
    this.subscription = this.dayCaseDashboard
      .fetcTimeoutCheckDocDetails(docKey)
      .subscribe({
        next: (data: any) => {
          
          this.timeOutForm.patchValue(data.d.results[0])
          this.timeOutForm.patchValue({
            ProcedureDate: this.parseDate(data.d.results[0].ProcedureDate),
            ProcedureTime: this.parseTime(data.d.results[0].ProcedureTime)
          })
        },
        error: (err: any) => {
          this.sharedService.waringSwallModel(`Error ${err}`);
          this.sharedService.waringSwallModel(
            `POST Error at Nursing care plans: ${err}`
          );
        },
      });
  }

  assessmentTabSelect(type: string) {
    this.selectedTabName = type;
  }

  createTimeOutDocument(docStatus: any, actiontype?: string) {
    return new Promise((resolve, reject) => {
      this.isFormValidError = true;
      if (this.timeOutForm.invalid) {
        return;
      }
      this.timeOutForm.value.DocStatus = docStatus;
      let paylaod = this.timeOutForm.value;
      paylaod.ProcedureTime = this.parsePayloadFormateTime(paylaod.ProcedureTime);
      if (paylaod.ProcedureDate) paylaod.ProcedureDate = paylaod.ProcedureDate.toISOString().split('T')[0] + "T00:00:00";

      this.subscription = this.dayCaseDashboard
        .saveTimeoutCheckDocument(paylaod)
        .subscribe({
          next: (data: any) => { },
          error: (err: any) => {
            this.sharedService.waringSwallModel(`Error ${err}`);
            this.sharedService.waringSwallModel(
              `PUT Error at Time Out CheckList document : ${err}`
            );
          },
          complete: () => {
            resolve(true);
            if (actiontype === 'edit') {
              this.sharedService.successSwallModel(
                'Time Out CheckList document updated successfully'
              );
            } else {
              this.sharedService.successSwallModel(
                'Time Out CheckList document created successfully'
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

  public getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
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
    if (!data || data.length !== 11 || data[4] !== 'H' || data[7] !== 'M' || data[10] !== 'S') {
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
