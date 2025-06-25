import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Patient } from '@services/e-kardex/interfaces/patient';
import { StorageService } from '@services/storage.service';
import { catchError, Subscription } from 'rxjs';
import { ErVitalsComponent } from './er-vitals/er-vitals.component';
import { DatePipe } from '@angular/common';
import { PhysicianAllergyComponent } from './physician-allergy/physician-allergy.component';
import Swal from 'sweetalert2';
import { DataShareService } from '@services/data-share.service';
import { ActionType } from '@services/interfaces/common.enum';
import { DayCaseDashboardService } from '@services/day-case.dashboard/day-case-dashboard.service';
import { SharedService } from '@services/shared.service';

@Component({
  selector: 'app-pre-cardiac-cath',
  templateUrl: './pre-cardiac-cath.component.html',
  styleUrls: ['./pre-cardiac-cath.component.scss']
})
export class PreCardiacCathComponent implements OnInit {

  @ViewChild('erVitalsModal') erVitalsModal: ErVitalsComponent;
  @ViewChild('createAllergyId') createAllergyId: PhysicianAllergyComponent;


  physicianName = [
    { id: "01", name: "Dr. Kais Balbissi" },
    { id: "02", name: "Dr. Ramzi Tabbalat" },
    { id: "03", name: "Dr. Kamel Toukan" },
    { id: "04", name: "Dr. Amir Malkawi" },
    { id: "05", name: "Dr. Ziad Qura'n" },
    { id: "06", name: "Dr. Nazih Kadri" },
    { id: "07", name: "Dr. Mohammad Hajiri" },
    { id: "08", name: "Dr. Fadi Alqaisi" },
  ]

  constrastAllergy = [
    {
      label: "Yes",
      value: '0'
    },
    {
      label: "No",
      value: '1'
    },
    {
      label: "Unknown",
      value: '2'
    },
  ]

  asaStatus = [
    { id: "1", status: "I" },
    { id: "2", status: "II" },
    { id: "3", status: "III" },
    { id: "4", status: "IV" },
    { id: "5", status: "V" },
    { id: "6", status: "VI" }
  ]

  preCardiacForm: FormGroup;
  isChecked: any;
  paramsObject: any;
  encounterId: any;
  docKey: any;
  public toVitalsArr: any = [];
  toAllergyArr: any = [];
  duplicates: any[];

  private subscription: Subscription;
  private actionTypeSubscription$: Subscription;

  constructor(private formBuilder: FormBuilder, private _route: ActivatedRoute, private storageService: StorageService,
    private dataShareService: DataShareService,
    private sharedService: SharedService,
    private dayCaseDashboard: DayCaseDashboardService
  ) {

    this._route.queryParams.subscribe((params) => {
      this.paramsObject = params;
      if (this.paramsObject.lfdnr) {
        this.encounterId = this.paramsObject.einri + this.paramsObject.falnr + this.paramsObject.lfdnr;
      }
      this.storageService.setEinri(this.paramsObject.einri);
      this.storageService.setFalnr(this.paramsObject.falnr);
      this.storageService.setLfdnr(this.paramsObject.lfdnr);
      this.storageService.setPatnr(this.paramsObject.patnr);
      this.getPatinetDetails(this.encounterId);
    });

    this.initForm();

    this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe(
      (data) => {
        if (data != null) {
          if (data.type == ActionType.Add$ && data.value == '') {
            this.docKey = data.value.Dockey;
          }
          if (data.type == ActionType.Update$ && data.value) {
            this.docKey = data.value.docKey;
            this.getPreCardiacCathDocDetails(data.value.docKey);
          }
          if (data.type == ActionType.Copy$ && data.value) {
            this.docKey = data.value.docKey;
            this.getPreCardiacCathDocDetails(data.value.docKey);
          }
        }
      }
    );
  }

  ngOnInit(): void {
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
    this.preCardiacForm = this.formBuilder.group({
      Dockey: "",
      Dtid: "ZMED_PCC",
      Einri: this.paramsObject.einri,
      Patnr: this.paramsObject.patnr,
      Falnr: this.paramsObject.falnr,
      Lfdnr: this.paramsObject.lfdnr,
      Orgdo: this.storageService?.patientData?.deptOrgUnit,
      Datee: new Date(),
      Timee: "",
      PhysicianName: "",
      ExternalPhy: "",
      Proceduree: "",
      Contrast: "",
      AsaStatus: "",
      MalampatiScore: "",
      CardiacDisease: "",
      CardiacDiseaseTxt: "",
      Dm: "",
      DmTxt: "",
      Htn: "",
      HtnTxt: "",
      Asthma: "",
      AsthmaTxt: "",
      Copd: "",
      CopdTxt: "",
      Others: "",
      OthersTxt: "",
      History: "",
      HistoryTxt: "",
      InformedConsent: "",
      InformedConsentTxt: "",
      PreviousOperations: "",
      PreviousOperationsTxt: "",
      PreviousCardiac: "",
      PreviousCardiacTxt: "",
      Npo: "",
      NpoTxt: "",
      DorsalisPedis: "",
      DorsalisPedisTxt: "",
      Preparee: "",
      PrepareeTxt: "",
      ChlorhexidineWash: "",
      ChlorhexidineWashTxt: "",
      PatientAttempt: "",
      PatientAttemptTxt: "",
      InsertInt: "",
      InsertIntTxt: "",
      RemoveDentures: "",
      RemoveDenturesTxt: "",
      RemoveJewelry: "",
      RemoveJewelryTxt: "",
      HeadCap: "",
      HeadCapTxt: "",
      AllMetformin: "",
      AllMetforminTxt: "",
      Creatinine15: "",
      Creatinine15Txt: "",
      ContrastAllergy: "",
      ContrastAllergyTxt: "",
      AttendPhy: this.storageService.getUserProfile()?.Gpart,
      DocStatus: "1",
      isVitals: false
    });

    const currentTime1 = new Date();
    const hours = currentTime1.getHours().toString().padStart(2, '0');
    const minutes = currentTime1.getMinutes().toString().padStart(2, '0');
    const seconds = currentTime1.getSeconds().toString().padStart(2, '0');
    this.preCardiacForm.get('Timee')?.setValue(`${hours}:${minutes}:${seconds}`);
  }

  getPreCardiacCathDocDetails(docKey?) {
    this.subscription = this.dayCaseDashboard
      .fetcPreCardiacCathDocDetails(docKey)
      .subscribe({
        next: (data: any) => {
          this.preCardiacForm.patchValue(data.d.results[0]);
          this.toAllergyArr = data.d?.results[0].TOALLERGIES?.results;
          this.toVitalsArr = data.d?.results[0].TOVITALSIGNS?.results;
          this.preCardiacForm.patchValue({
            Datee: this.parseDate(data.d.results[0].Datee),
            Timee: this.parseTime(data.d.results[0].Timee),
          });

          // if (data?.d?.results[0].TOSCALE.results.length) {
          //   data?.d?.results[0].TOSCALE.results.forEach((element) => {
          //     this.scalesList.forEach((res: any) => {
          //       if (element.ScaleType == res.ScaleType && element.LastScore) {
          //         res.Datetimee = element.Datetimee,
          //           res.Dockey = element.Dockey,
          //           res.ScoreDesc = element.ScoreDesc,
          //           res.LastScore = element.LastScore,
          //           res.ScaleType = element.ScaleType
          //       }
          //     })
          //   })
          // }
          // this.bindDataToFormArray(data?.d?.results[0].TOINFECTION.results)
        },
        error: (err: any) => {
          this.sharedService.waringSwallModel(`Error ${err}`);
          this.sharedService.waringSwallModel(
            `POST Error at Nursing care plans: ${err}`
          );
        },
      });
  }

  public getPatinetDetails(encounterId) {
    // this.patientService.getDataPatient(encounterId).pipe(catchError(() => {
    //   return of({} as Patient);
    // })).subscribe((patientData: Patient) => {
    //   this.patientDetails = patientData;
    //   this.maritalStatus = this.patientDetails.maritalStatus;
    //   this.storageService.setPatientData(patientData);
    // });
  }

  public handleCheckboxVitals(event) {
    this.isChecked = event.target.checked;
    this.preCardiacForm.get('isVitals')?.setValue(this.isChecked);
  }

  public openModalVital() {
    if (this.isChecked) return;
    const item = {
      Einri: this.paramsObject.einri,
      Patnr: this.paramsObject.patnr,
      Falnr: this.paramsObject.falnr,
      Lfdnr: this.paramsObject.lfdnr,
      Patient: this.storageService?.patientData?.name,
      admissionDate: this.storageService.patientData.periodStart,
    };
    this.erVitalsModal.openModalForErVital(item);
  }

  public deleteVitalsFromTable(index: number) {
    if (index > -1) {
      this.toVitalsArr.splice(index, 1);
    }
  }

  public importVitalsData(data) {
    data.forEach((el) => {
      this.toVitalsArr = this.toVitalsArr.concat({
        Dockey: '',
        Vdescription: el.Name,
        MeasuredValue: el.ValueFormatted,
        NormalRange: el.NormalRange,
        DateTime: `${new DatePipe('en-US').transform(
          this.getDate(el.Date),
          'dd.MM.yyyy'
        )}/${this.parseTime(el.Time)}`,
        Vunit: el.UnitTxt,
      });
    });
  }

  public openModalForAllergy() {
    this.createAllergyId.openModalForAllergy();
  }

  public deleteFromAllergy(item, index) {
    this.toAllergyArr.splice(index, 1);
  }

  public importAllergyData(data) {
    data.forEach((el) => {
      this.toAllergyArr = this.toAllergyArr.concat({
        Dockey: '',
        Agroup: el.AllergenGrp,
        Description: el.Allergen,
      });
    });
    this.duplicates = [];
    this.duplicates = this.findDuplicatesAllergy();
    this.toAllergyArr = this.toAllergyArr.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.Description === value.Description)
    );
    if (this.duplicates.length > 0) {
      this.errorMsgForDuplicatesAllergy();
    }
  }

  sanitizeSAPDateFormat(date: any) {
    if (typeof date === 'string') {
      return date;
    } else {
      return `\/Date(${date.getTime()})\/`;
    }
  }

  createNursingAssessmentDoc(docStatus: any, actiontype?: string) {
    return new Promise((resolve, reject) => {
      // this.isFormValidError = true;
      if (this.preCardiacForm.invalid) {
        return;
      }
      this.preCardiacForm.value.DocStatus = docStatus;
      let paylaod = this.preCardiacForm.value;
      // paylaod.Datee = this.sanitizeSAPDateFormat(this.preCardiacForm.value.Datee);
      paylaod.Timee = this.parsePayloadFormateTime(this.preCardiacForm.value.Timee);
      if (this.preCardiacForm.value.Datee) paylaod.Datee = this.preCardiacForm.value.Datee.toISOString().split('T')[0] + "T00:00:00";
      delete paylaod.isVitals
      paylaod['TOALLERGIES'] = this.toAllergyArr;
      paylaod['TOVITALSIGNS'] = this.toVitalsArr;

      // paylaod.TOSCALE = this.scalesList.filter((res: any) => {
      //   delete res.value;
      //   res.LastScore = res?.LastScore.toString();
      //   if (res.LastScore) {
      //     return res;
      //   }
      // });
      paylaod.Orgdo = this.storageService?.patientData?.deptOrgUnit;
      this.subscription = this.dayCaseDashboard
        .savePreCardiacCathDoc(paylaod)
        .subscribe({
          next: (data: any) => { },
          error: (err: any) => {
            this.sharedService.waringSwallModel(`Error ${err}`);
            this.sharedService.waringSwallModel(
              `PUT Error at Pre-Cardiac Cath document : ${err}`
            );
          },
          complete: () => {
            resolve(true);
            if (actiontype === 'edit') {
              this.sharedService.successSwallModel(
                'Pre-Cardiac Cath document updated successfully'
              );
            } else {
              this.sharedService.successSwallModel(
                'Pre-Cardiac Cath document created successfully'
              );
            }
          },
        });
    });
  }

  private findDuplicatesAllergy() {
    let tempArr = [];
    const lookup = this.toAllergyArr.reduce((a, e) => {
      a[e.Description] = ++a[e.Description] || 0;
      return a;
    }, {});
    tempArr = this.toAllergyArr.filter((e) => lookup[e.Description]);
    return tempArr.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.Description === value.Description)
    );
  }

  private errorMsgForDuplicatesAllergy() {
    let codeArr = [];
    this.duplicates.forEach((element) => {
      codeArr.push(element.Description);
    });

    Swal.fire({
      text: `${codeArr.toString()} is/are already Imported `,
      icon: 'warning',
      confirmButtonText: 'Ok',
      customClass: 'myalertpopup',
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

  parsePayloadFormateTime(data: string) {
    if (data && data.length) {
      const strArr: string[] = data.split(':');
      if (data && data.length === 8) {
        return `PT${strArr[0]}H${strArr[1]}M${strArr[2]}S`;
      }
    }
    return null;
  }

}
