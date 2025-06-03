import { DatePipe } from '@angular/common';
import {
  Component,
  OnInit,
  SimpleChanges,
  EventEmitter,
  Output,
  Input,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdmissionService } from '@services/admission/admission.service';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';

@Component({
  selector: 'app-obstetric-risk',
  templateUrl: './obstetric-risk.component.html',
  styleUrls: ['./obstetric-risk.component.scss'],
})
export class ObstetricRiskComponent implements OnInit {
  @Output() reloadTableList = new EventEmitter();
  @Input() soapFormEvent: string;
  isHighRisk: boolean = false;
  isIntermediateRisk: boolean = false;
  isLowRisk: boolean = false;

  obstetricForm: FormGroup;

  finalRisk = [
    {
      label: 'High risk',
      value: '0',
    },
    {
      label: 'Intermediate risk',
      value: '1',
    },
    {
      label: 'Low risk',
      value: '2',
    },
  ];

  plan = [
    {
      label: '6 weeks LMWH if any H, 3I',
      value: '0',
    },
    {
      label: '1 10 days LMWH is any I, >= 2L',
      value: '1',
    },
    {
      label: '2 Mobilization and Hydration < 2L',
      value: '2',
    },
  ];
  paramsObj: any;

  constructor(
    private formBuilder: FormBuilder,
    private admissionService: AdmissionService,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private sharedService: SharedService,
    private storageService: StorageService
  ) {
    this.route.queryParams.subscribe((res) => {
      this.paramsObj = res;
    });
  }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.soapFormEvent.currentValue == 'add') {
      this.createObstetricDoc(false);
      return;
    }

    if (changes.soapFormEvent.currentValue == 'edit') {
      this.updateObstetricDoc(false);
      return;
    }

     if (changes.soapFormEvent.currentValue == 'copy') {
      this.enableAllField();
      this.mainCheckBox();
      return;
    }
  
    if (changes.soapFormEvent.currentValue == 'saveClose') {
      if (this.admissionService.isEditObstetricRisk) {
        this.updateObstetricDoc(true);
      } else {
        this.createObstetricDoc(true);
      }
      return;
    }
    if (changes.soapFormEvent.currentValue == 'release') {
      if (this.admissionService.isEditObstetricRisk) {
        this.updateObstetricDoc(true);
      } else {
        this.createObstetricDoc(true);
      }
      return;
    }

    if (
      this.admissionService.isCloneObstetricRisk ||
      this.admissionService.isEditObstetricRisk
    ) {
      this.getDichargeDataByDockey();
      return;
    }
  }

  initForm() {
    let currentTime = this.datePipe.transform(new Date(), 'hh:mm:ss');
    this.obstetricForm = this.formBuilder.group({
      Dockey: [''],
      Dtid: ['ZMED_OBPPT'],
      Einri: [this.paramsObj.einri],
      Patnr: [this.paramsObj.einri],
      Falnr: [this.paramsObj.falnr],
      Orgdo: [localStorage.getItem('initOrg')],
      Lfdnr: [this.paramsObj.lfdnr],
      Datee: [new Date()],
      Timee: [currentTime],
      HighRisk: [false],
      HPrevVte: [{ value: false, disabled: true }],
      HLmwh: [{ value: false, disabled: true }],
      HLrThrombophilia: [{ value: false, disabled: true }],
      HHrThrombophilia: [{ value: false, disabled: true }],
      IntermediateRisk: [false],
      ICaesarianLabor: [{ value: false, disabled: true }],
      IBmi40: [{ value: false, disabled: true }],
      IReAdmission: [{ value: false, disabled: true }],
      ISurgicalProc: [{ value: false, disabled: true }],
      IMedical: [{ value: false, disabled: true }],
      LowRisk: [false],
      LAge35: [{ value: false, disabled: true }],
      LObesity: [{ value: false, disabled: true }],
      LParity: [{ value: false, disabled: true }],
      LSmoker: [{ value: false, disabled: true }],
      LElective: [{ value: false, disabled: true }],
      LFamilyHistory: [{ value: false, disabled: true }],
      LLrThrombophilia: [{ value: false, disabled: true }],
      LGrossVaricose: [{ value: false, disabled: true }],
      LSystemicInfection: [{ value: false, disabled: true }],
      LImmobility: [{ value: false, disabled: true }],
      LLongDistance: [{ value: false, disabled: true }],
      LPreEclampsia: [{ value: false, disabled: true }],
      LMultiplePregnancy: [{ value: false, disabled: true }],
      LPreTermDelivery: [{ value: false, disabled: true }],
      LStillBirth: [{ value: false, disabled: true }],
      LMidCavity: [{ value: false, disabled: true }],
      LProlongedLabor: [{ value: false, disabled: true }],
      LPhh: [{ value: false, disabled: true }],
      FinalRisk: [''],
      FPlan: [''],
      AttendPhy: [this.storageService.getGpart()],
      DocStatus: ['1'],
    });
    this.mainCheckBox();
  }

  mainCheckBox() {
    if(!this.admissionService.isPDFObstetricRisk){      
      this.obstetricForm.get('HighRisk').valueChanges.subscribe((v) => {
        this.enableHighRisk(v);
      });
  
      this.obstetricForm.get('IntermediateRisk').valueChanges.subscribe((v) => {
        this.enableDisableInter(v);
      });
  
      this.obstetricForm.get('LowRisk').valueChanges.subscribe((v) => {
        this.enableDisableLow(v);
      });
    }
  }

  getHighRisk() {
    return this.obstetricForm.value.HighRisk;
  }

  getDichargeDataByDockey() {
    let currentTime = this.datePipe.transform(new Date(), 'hh:mm:ss');

    this.admissionService
      .getObstetricData(this.admissionService.selectedCurrentDocDetails.Dockey)
      .subscribe((resp) => {
        if (resp && resp.results && resp.results.length) {
          let obstetricData = resp.results[0];
          this.obstetricForm.patchValue({
            HighRisk: resp.results[0].HighRisk,
            HPrevVte: resp.results[0].HPrevVte,
            HLmwh: resp.results[0].HLmwh,
            HLrThrombophilia: resp.results[0].HLrThrombophilia,
            HHrThrombophilia: resp.results[0].HHrThrombophilia,
            IntermediateRisk: resp.results[0].IntermediateRisk,
            ICaesarianLabor: resp.results[0].ICaesarianLabor,
            IBmi40: resp.results[0].IBmi40,
            IReAdmission: resp.results[0].IReAdmission,
            ISurgicalProc: resp.results[0].ISurgicalProc,
            IMedical: resp.results[0].IMedical,
            LowRisk: resp.results[0].LowRisk,
            LAge35: resp.results[0].LAge35,
            LObesity: resp.results[0].LObesity,
            LParity: resp.results[0].LParity,
            LSmoker: resp.results[0].LSmoker,
            LElective: resp.results[0].LElective,
            LFamilyHistory: resp.results[0].LFamilyHistory,
            LLrThrombophilia: resp.results[0].LLrThrombophilia,
            LGrossVaricose: resp.results[0].LGrossVaricose,
            LSystemicInfection: resp.results[0].LSystemicInfection,
            LImmobility: resp.results[0].LImmobility,
            LLongDistance: resp.results[0].LLongDistance,
            LPreEclampsia: resp.results[0].LPreEclampsia,
            LMultiplePregnancy: resp.results[0].LMultiplePregnancy,
            LPreTermDelivery: resp.results[0].LPreTermDelivery,
            LStillBirth: resp.results[0].LStillBirth,
            LMidCavity: resp.results[0].LMidCavity,
            LProlongedLabor: resp.results[0].LProlongedLabor,
            LPhh: resp.results[0].LPhh,
            FinalRisk: resp.results[0].FinalRisk,
            FPlan: resp.results[0].FPlan,
            AttendPhy: resp.results[0].AttendPhy,
            DocStatus: resp.results[0].DocStatus,
            Dockey: resp.results[0].Dockey,
            Orgdo: resp.results[0].Orgdo,
          });
          if (!this.admissionService.isCloneObstetricRisk) {
            this.obstetricForm.patchValue({
              Datee: this.getDate(obstetricData.Datee),
              Timee: this.parseTime(obstetricData.Timee),
            });
          } else {
            this.obstetricForm.patchValue({
              Datee: new Date(),
              Timee: currentTime,
            });
          }
          if(!this.admissionService.isPDFObstetricRisk) {
            if (resp.results[0].HighRisk) {
              this.enableHighRisk(resp.results[0].HighRisk);
            }
            if (resp.results[0].LowRisk) {
              this.enableDisableLow(resp.results[0].LowRisk);
            }
            if (resp.results[0].IntermediateRisk) {
              this.enableDisableInter(resp.results[0].IntermediateRisk);
            }
          }
          if(this.admissionService.isPDFObstetricRisk) {
            this.disableField();
          }
        }
      });
  }

  enableHighRisk(v) {
    if (v) {
      this.obstetricForm.get('HPrevVte').enable();
      this.obstetricForm.get('HLmwh').enable();
      this.obstetricForm.get('HLrThrombophilia').enable();
      this.obstetricForm.get('HHrThrombophilia').enable();
    } else {
      this.obstetricForm.get('HPrevVte').disable();
      this.obstetricForm.get('HLmwh').disable();
      this.obstetricForm.get('HLrThrombophilia').disable();
      this.obstetricForm.get('HHrThrombophilia').disable();
    }
  }

  enableDisableInter(v) {
    if (v) {
      this.obstetricForm.get('ICaesarianLabor').enable();
      this.obstetricForm.get('IBmi40').enable();
      this.obstetricForm.get('IReAdmission').enable();
      this.obstetricForm.get('ISurgicalProc').enable();
      this.obstetricForm.get('IMedical').enable();
    } else {
      this.obstetricForm.get('ICaesarianLabor').disable();
      this.obstetricForm.get('IBmi40').disable();
      this.obstetricForm.get('IReAdmission').disable();
      this.obstetricForm.get('ISurgicalProc').disable();
      this.obstetricForm.get('IMedical').disable();
    }
  }

  enableDisableLow(v) {
    if (v) {
      this.obstetricForm.get('LAge35').enable();
      this.obstetricForm.get('LObesity').enable();
      this.obstetricForm.get('LParity').enable();
      this.obstetricForm.get('LSmoker').enable();
      this.obstetricForm.get('LElective').enable();
      this.obstetricForm.get('LFamilyHistory').enable();
      this.obstetricForm.get('LLrThrombophilia').enable();
      this.obstetricForm.get('LGrossVaricose').enable();
      this.obstetricForm.get('LSystemicInfection').enable();
      this.obstetricForm.get('LImmobility').enable();
      this.obstetricForm.get('LLongDistance').enable();
      this.obstetricForm.get('LPreEclampsia').enable();
      this.obstetricForm.get('LMultiplePregnancy').enable();
      this.obstetricForm.get('LPreTermDelivery').enable();
      this.obstetricForm.get('LStillBirth').enable();
      this.obstetricForm.get('LMidCavity').enable();
      this.obstetricForm.get('LProlongedLabor').enable();
      this.obstetricForm.get('LPhh').enable();
    } else {
      this.obstetricForm.get('LAge35').disable();
      this.obstetricForm.get('LObesity').disable();
      this.obstetricForm.get('LParity').disable();
      this.obstetricForm.get('LSmoker').disable();
      this.obstetricForm.get('LElective').disable();
      this.obstetricForm.get('LFamilyHistory').disable();
      this.obstetricForm.get('LLrThrombophilia').disable();
      this.obstetricForm.get('LGrossVaricose').disable();
      this.obstetricForm.get('LSystemicInfection').disable();
      this.obstetricForm.get('LImmobility').disable();
      this.obstetricForm.get('LLongDistance').disable();
      this.obstetricForm.get('LPreEclampsia').disable();
      this.obstetricForm.get('LMultiplePregnancy').disable();
      this.obstetricForm.get('LPreTermDelivery').disable();
      this.obstetricForm.get('LStillBirth').disable();
      this.obstetricForm.get('LMidCavity').disable();
      this.obstetricForm.get('LProlongedLabor').disable();
      this.obstetricForm.get('LPhh').disable();
    }
  }

  disableField() {
    this.obstetricForm.get('ICaesarianLabor').disable();
    this.obstetricForm.get('IBmi40').disable();
    this.obstetricForm.get('IReAdmission').disable();
    this.obstetricForm.get('ISurgicalProc').disable();
    this.obstetricForm.get('IMedical').disable();
    this.obstetricForm.get('HPrevVte').disable();
    this.obstetricForm.get('HLmwh').disable();
    this.obstetricForm.get('HLrThrombophilia').disable();
    this.obstetricForm.get('HHrThrombophilia').disable();
    this.obstetricForm.get('LAge35').disable();
    this.obstetricForm.get('LObesity').disable();
    this.obstetricForm.get('LParity').disable();
    this.obstetricForm.get('LSmoker').disable();
    this.obstetricForm.get('LElective').disable();
    this.obstetricForm.get('LFamilyHistory').disable();
    this.obstetricForm.get('LLrThrombophilia').disable();
    this.obstetricForm.get('LGrossVaricose').disable();
    this.obstetricForm.get('LSystemicInfection').disable();
    this.obstetricForm.get('LImmobility').disable();
    this.obstetricForm.get('LLongDistance').disable();
    this.obstetricForm.get('LPreEclampsia').disable();
    this.obstetricForm.get('LMultiplePregnancy').disable();
    this.obstetricForm.get('LPreTermDelivery').disable();
    this.obstetricForm.get('LStillBirth').disable();
    this.obstetricForm.get('LMidCavity').disable();
    this.obstetricForm.get('LProlongedLabor').disable();
    this.obstetricForm.get('LPhh').disable();
    this.obstetricForm.get('Datee').disable();
    this.obstetricForm.get('Timee').disable();
    this.obstetricForm.get('HighRisk').disable();
    this.obstetricForm.get('FinalRisk').disable();
    this.obstetricForm.get('LowRisk').disable();
    this.obstetricForm.get('IntermediateRisk').disable();
    this.obstetricForm.get('FPlan').disable();

  }

  enableAllField() {
    this.obstetricForm.get('HighRisk').enable();
    this.obstetricForm.get('IntermediateRisk').enable();
    this.obstetricForm.get('LowRisk').enable();
    if(this.obstetricForm.get('HighRisk').value) {
      this.enableHighRisk(true);
    }
    if(this.obstetricForm.get('IntermediateRisk').value) {
      this.enableDisableInter(true);
    }
    if(this.obstetricForm.get('LowRisk').value) {
      this.enableDisableLow(true);
    }
    // this.obstetricForm.get('HighRisk').valueChanges.subscribe((v) => {
    //   this.enableHighRisk(v);
    // });

    // this.obstetricForm.get('IntermediateRisk').valueChanges.subscribe((v) => {
    //   this.enableDisableInter(v);
    // });

    // this.obstetricForm.get('LowRisk').valueChanges.subscribe((v) => {
    //   this.enableDisableLow(v);
    // });
    // this.obstetricForm.get('ICaesarianLabor').enable();
    // this.obstetricForm.get('IBmi40').enable();
    // this.obstetricForm.get('IReAdmission').enable();
    // this.obstetricForm.get('ISurgicalProc').enable();
    // this.obstetricForm.get('IMedical').enable();
    // this.obstetricForm.get('HPrevVte').enable();
    // this.obstetricForm.get('HLmwh').enable();
    // this.obstetricForm.get('HLrThrombophilia').enable();
    // this.obstetricForm.get('HHrThrombophilia').enable();
    // this.obstetricForm.get('LAge35').enable();
    // this.obstetricForm.get('LObesity').enable();
    // this.obstetricForm.get('LParity').enable();
    // this.obstetricForm.get('LSmoker').enable();
    // this.obstetricForm.get('LElective').enable();
    // this.obstetricForm.get('LFamilyHistory').enable();
    // this.obstetricForm.get('LLrThrombophilia').enable();
    // this.obstetricForm.get('LGrossVaricose').enable();
    // this.obstetricForm.get('LSystemicInfection').enable();
    // this.obstetricForm.get('LImmobility').enable();
    // this.obstetricForm.get('LLongDistance').enable();
    // this.obstetricForm.get('LPreEclampsia').enable();
    // this.obstetricForm.get('LMultiplePregnancy').enable();
    // this.obstetricForm.get('LPreTermDelivery').enable();
    // this.obstetricForm.get('LStillBirth').enable();
    // this.obstetricForm.get('LMidCavity').enable();
    // this.obstetricForm.get('LProlongedLabor').enable();
    // this.obstetricForm.get('LPhh').enable();
    this.obstetricForm.get('Datee').enable();
    this.obstetricForm.get('Timee').enable();
    // this.obstetricForm.get('HighRisk').enable();
    this.obstetricForm.get('FinalRisk').enable();
    this.obstetricForm.get('FPlan').enable();
    // this.obstetricForm.get('LowRisk').enable();
    // this.obstetricForm.get('IntermediateRisk').enable();
  }

  createObstetricDoc(type) {
    let payload = this.obstetricForm.value;
    payload.DocStatus = '1';
    // if(this.admissionService.isPDFObstetricRisk || this.admissionService.isCloneObstetricRisk) {
    //   payload.Dockey = '';
    // }
    (payload.Timee = this.parsePayloadFormateTime(
      this.obstetricForm.value.Timee
    )),
      (payload.Datee =
        this.obstetricForm.value.Datee !== undefined &&
        this.obstetricForm.value.Datee !== null
          ? this.sanitizeSAPDateFormat(this.obstetricForm.value.Datee)
          : null),
      this.admissionService
        .createObstetricDoc(this.obstetricForm.value)
        .subscribe(
          (resp) => {
            if (type) {
              this.saveAndReleas(resp);
            } else {
              // if(this.soapFormEvent == 'saveClose' || this.soapFormEvent == 'release') { 
              // }
              this.reloadTableList.next(true);
              this.admissionService.cancelAllForm();
              this.admissionService.clearSoapEvent.next(true);
              this.admissionService.isEditObstetricRisk = false; 
              this.admissionService.isCloneObstetricRisk = false;
            }
          },
          (error) => {
            this.admissionService.isEditObstetricRisk = false; 
            this.admissionService.isCloneObstetricRisk = false;
            this.admissionService.clearSoapEvent.next(true);
            const errorMsg = error?.error?.error?.message?.value || 'Unknown error';
            this.sharedService.waringSwallModel(`${errorMsg}`);
          }
        );
  }

  saveAndReleas(data) {
    let payload = data;
    payload.DocStatus = '2';
    this.admissionService.updateObstetricDoc(payload).subscribe(
      (resp) => {
      //  if(this.soapFormEvent == 'saveClose' || this.soapFormEvent == 'release') { 
      // }
      this.reloadTableList.next(true);
      this.admissionService.cancelAllForm();
            this.admissionService.clearSoapEvent.next(true);
            this.admissionService.isEditObstetricRisk = false; 
            this.admissionService.isCloneObstetricRisk = false;
          },
          (error) => {
            this.admissionService.isEditObstetricRisk = false; 
            this.admissionService.isCloneObstetricRisk = false;
            this.admissionService.clearSoapEvent.next(true);
            const errorMsg = error?.error?.error?.message?.value || 'Unknown error';
            this.sharedService.waringSwallModel(`${errorMsg}`);
          }
    );
  }

  updateObstetricDoc(type) {
    let payload = this.obstetricForm.value;
    if (type) payload.DocStatus = '2';
    else payload.DocStatus = '1';
    (payload.Timee = this.parsePayloadFormateTime(
      this.obstetricForm.value.Timee
    )),
      (payload.Datee =
        this.obstetricForm.value.Datee !== undefined &&
        this.obstetricForm.value.Datee !== null
          ? this.sanitizeSAPDateFormat(this.obstetricForm.value.Datee)
          : null),
      this.admissionService
        .updateObstetricDoc(this.obstetricForm.value)
        .subscribe(
          (resp) => {
            // if(this.soapFormEvent == 'saveClose' || this.soapFormEvent == 'release') { 
            // }
            this.reloadTableList.next(true);
            this.admissionService.cancelAllForm();
            this.admissionService.clearSoapEvent.next(true);
            this.admissionService.isEditObstetricRisk = false; 
            this.admissionService.isCloneObstetricRisk = false;
          },
          (error) => {
            this.admissionService.isEditObstetricRisk = false; 
            this.admissionService.isCloneObstetricRisk = false;
            this.admissionService.clearSoapEvent.next(true);
            const errorMsg = error?.error?.error?.message?.value || 'Unknown error';
            this.sharedService.waringSwallModel(`${errorMsg}`);
          }
        );
  }

  highRiskChecked() {
    this.obstetricForm.get('HighRisk').valueChanges.subscribe((v) => {
      if (v) {
        this.obstetricForm.get('HPrevVte').enable();
      } else {
        this.obstetricForm.get('HPrevVte').disable();
      }
    });
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

  sanitizeSAPDateFormat(date: any) {
    if (typeof (date) === 'string') {
      return date;
    } else {
      return `\/Date(${date.getTime()})\/`
    }
  }

  parseTime(data: string) {
    if (data && data.length) {
      const strArr: string[] = data.split('');
      if (
        data &&
        data.length === 11 &&
        strArr[4] === 'H' &&
        strArr[7] === 'M' &&
        strArr[10] === 'S' &&
        !isNaN(+(strArr[2] + strArr[3])) &&
        !isNaN(+(strArr[5] + strArr[6])) &&
        !isNaN(+(strArr[8] + strArr[9]))
      ) {
        const hours =
          +(strArr[2] + strArr[3]) <= 9
            ? `0${+(strArr[2] + strArr[3])}`
            : +(strArr[2] + strArr[3]);
        const Minute =
          +(strArr[5] + strArr[6]) <= 9
            ? `0${+(strArr[5] + strArr[6])}`
            : +(strArr[5] + strArr[6]);
        const Second =
          +(strArr[8] + strArr[9]) <= 9
            ? `0${+(strArr[8] + strArr[9])}`
            : +(strArr[8] + strArr[9]);
        return `${hours}:${Minute}:${Second}`;
      }
    }
    return null;
  }

  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }
}
