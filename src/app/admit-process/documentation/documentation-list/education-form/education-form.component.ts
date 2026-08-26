import { DatePipe } from '@angular/common';
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  Input,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AdmissionService } from '@services/admission/admission.service';
import { PatientService } from '@services/e-kardex/patient.service';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { catchError, of } from 'rxjs';
import { berriers, healthLiteracy, informationTought, learnerNeedPlan, literacyEducationLevel, needsInterpreter, patientResponse, personTaught, readLinessToLearn, toolsList, understanding } from 'src/app/core/constants';
import { DocsService } from 'src/app/services/docs.service';
@UntilDestroy()
@Component({
  selector: 'app-education-form',
  templateUrl: './education-form.component.html',
  styleUrls: ['./education-form.component.scss'],
})
export class EducationFormComponent implements OnInit, OnChanges {
  @Input() soapFormEvent;
  @Input() isExpanded
  @Output() reloadTableList = new EventEmitter();

  @Output() realodEducationList = new EventEmitter();
  educationForm: FormGroup;
  TOITEM: FormArray;

  educationHead = [
    {
      name: 'Date',
      width: '20',
      minWidth: '100',
    },
    {
      name: 'Time',
      width: '20',
      minWidth: '130',
    },
    {
      name: 'Designation',
      width: '20',
      minWidth: '100',
    },
    {
      name: 'Information Tought/Education',
      width: '70',
      minWidth: '250',
    },
    {
      name: 'Barriers',
      width: '20',
      minWidth: '130',
    },
    {
      name: 'Person Taught',
      width: '20',
      minWidth: '170',
    },
    {
      name: 'Tools',
      width: '10',
      minWidth: '150',
    },
    {
      name: 'Patients response',
      width: '40',
      minWidth: '180',
    },
    {
      name: 'Learner need plan',
      width: '40',
      minWidth: '150',
    },
    {
      name: 'Understanding',
      width: '30',
      minWidth: '170',
    },
    {
      name: 'Plan',
      width: '10',
      minWidth: '250',
    },
    {
      name: 'Entry date',
      width: '30',
      minWidth: '100',
    },
    {
      name: 'Entry time',
      width: '30',
      minWidth: '130',
    },
    {
      name: 'Signature',
      width: '30',
      minWidth: '100',
    },
    {
      name: 'Action',
      width: '5',
      minWidth: '100',
    },
  ];

  bsConfig: Partial<BsDatepickerConfig> = {
    showWeekNumbers: false,
    dateInputFormat: 'DD/MM/YYYY',
    containerClass: 'document-education-class',
  };
  currentTime: string;
  paramsObject: any;
  AttendPhy: any;

  readLinessToLearn: any[] = readLinessToLearn;
  healthLiteracy: any[] = healthLiteracy;
  needsInterpreter: any[] = needsInterpreter;
  informationTought: any[] = informationTought;
  berriers: any[] = berriers;
  personTaught: any[] = personTaught;
  toolsList: any[] = toolsList;
  literacyEducationLevel: any[] = literacyEducationLevel;
  patientResponse: any[] = patientResponse;
  learnerNeedPlan: any[] = learnerNeedPlan;
  understanding: any[] = understanding;
  isCheckAPICall: boolean = false;


  constructor(
    private formBuilder: FormBuilder,
    public admissionService: AdmissionService,
    private route: ActivatedRoute,
    private patientService: PatientService,
    private datePipe: DatePipe,
    private sharedService: SharedService,
    private storageService: StorageService,
    private docsService: DocsService
  ) {
    this.route.queryParams.subscribe((params) => {
      this.paramsObject = params;
    });
    this.AttendPhy =
      this.patientService?.HeaderConfigurationData?.participant?.individual.id;
  }

  ngOnInit(): void {
    this.initForm();
    this.defaultAddRow();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes.soapFormEvent.currentValue, "3");
    if (changes.soapFormEvent.currentValue == 'add') {
      if(this.admissionService.isCloneEducationAsset) this.directReleasedData(false);
      else this.saveEducationFormValue(false);
      return;
    }

    if (changes.soapFormEvent.currentValue == 'edit') {
      this.saveEducationFormValue(false);
      return;
    }
    if (changes.soapFormEvent.currentValue == 'saveClose') {
      this.saveEducationFormValue(false);
      return;
    }

    if (changes.soapFormEvent.currentValue == 'release') {
      if (this.admissionService.isEditEducationAsset) {
        this.saveEducationFormValue(true);
      } else {
        this.directReleasedData(true);
      }
      return;
    }

    if (this.admissionService.isCloneEducationAsset || this.admissionService.isEditEducationAsset) {
      if(!this.isCheckAPICall) {
        this.getEducationList();
      }
      return;
    }
  }

  initForm() {
    this.educationForm = this.formBuilder.group({
      Dockey: [''],
      Dtid: ['ZMED_EDUAS'],
      Einri: [this.paramsObject.einri],
      Patnr: [this.paramsObject.patnr],
      Falnr: [this.paramsObject.falnr],
      Orgdo: [localStorage.getItem('initOrg')],
      Lfdnr: [this.paramsObject.lfdnr],
      PatFalmily: [false],
      Medications: [false],
      Discharge: [false],
      Pain: [false],
      Financial: [false],
      Anesthesia: [false],
      PerformProc: [false],
      CareSupport: [false],
      Disease: [false],
      FoodDrug: [false],
      Nutrional: [false],
      Rehabilitation: [false],
      IsolationPrec: [false],
      Other: [false],
      OtherTxt: [{ value: '', disabled: true }],
      LiteracyEdu: [''],
      Readiness: [''],
      HealthLit: [''],
      NeedsInter: [''],
      Language: [''],
      PatReligion: [''],
      AttendPhy: [this.AttendPhy],
      DocStatus: ['1'],
      TOITEM: new FormArray([]),
    });

    this.educationForm.get('Other').valueChanges.subscribe((v) => {
      if (v) {
        this.educationForm.get('OtherTxt').enable();
      } else {
        this.educationForm.get('OtherTxt').disable();
        this.educationForm.patchValue({
          OtherTxt: ''
        })
      }
    });
  }

  addItemRow() {
    this.TOITEM = this.educationForm.get('TOITEM') as FormArray;
    this.TOITEM.push(this.itemFormArrayField());
  }

  itemFormArrayField(): FormGroup {
    this.currentTime = this.datePipe.transform(new Date(), 'hh:mm:ss');
    return this.formBuilder.group({
      Dockey: [''],
      Datum: [new Date()],
      Tims: [this.currentTime],
      Designation: [''],
      InfoTaught: [null],
      Barriers: [null],
      PersonTaught: [null],
      Tools: [null],
      PlannedDate: [new Date()],
      PatientResp: [null],
      Learner: [null],
      Understanding: [null],
      Plann: [''],
      PlannedTime: [this.currentTime],
      Signature: [this.storageService.getUserProfile()?.UserName],
    });
  }

  defaultAddRow() {
    for (let index = 0; index < 5; index++) {
      this.addItemRow();
    }
  }

  getEducationList() {
    this.admissionService
      .getDocuEducationDetails(
        this.admissionService.selectedCurrentDocDetails.Dockey
      )
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((data: any) => {
        this.educationForm.patchValue({
          Dockey: data.d.results[0].Dockey,
          PatFalmily: data.d.results[0].PatFalmily,
          Medications: data.d.results[0].Medications,
          Discharge: data.d.results[0].Discharge,
          Pain: data.d.results[0].Pain,
          Financial: data.d.results[0].Financial,
          Anesthesia: data.d.results[0].Anesthesia,
          PerformProc: data.d.results[0].PerformProc,
          CareSupport: data.d.results[0].CareSupport,
          Disease: data.d.results[0].Disease,
          FoodDrug: data.d.results[0].FoodDrug,
          Nutrional: data.d.results[0].Nutrional,
          Rehabilitation: data.d.results[0].Rehabilitation,
          IsolationPrec: data.d.results[0].IsolationPrec,
          Other: data.d.results[0].Other,
          OtherTxt: data.d.results[0].OtherTxt,
          LiteracyEdu: data.d.results[0].LiteracyEdu,
          Readiness: data.d.results[0].Readiness,
          HealthLit: data.d.results[0].HealthLit,
          NeedsInter: data.d.results[0].NeedsInter,
          Language: data.d.results[0].Language,
          PatReligion: data.d.results[0].PatReligion,
          DocStatus: data.d.results[0].DocStatus,
        });
        let controlArray = <FormArray>this.educationForm.get('TOITEM');
          data.d.results[0].TOITEM.results.filter((res: any, index: number) => {
            controlArray.controls[index].patchValue({
              Dockey: res.Dockey,
              Datum: this.getDate(res.Datum) ? this.getDate(res.Datum) : new Date(),
              Tims: this.parseTime(res.Tims),
              Designation: res.Designation ? res.Designation : null,
              InfoTaught: res.InfoTaught ? res.InfoTaught : null,
              Barriers: res.Barriers ? res.Barriers :null,
              PersonTaught: res.PersonTaught ? res.PersonTaught : null,
              Tools: res.Tools ? res.Tools : null,
              PlannedDate: this.getDate(res.PlannedDate) ? this.getDate(res.PlannedDate) : new Date(),
              PatientResp: res.PatientResp ? res.PatientResp : null,
              Learner: res.Learner ? res.Learner : null,
              Understanding: res.Understanding ? res.Understanding : null,
              Plann: res.Plann,
              PlannedTime: this.parseTime(res.PlannedTime),
              Signature: this.admissionService.isCloneEducationAsset ? this.storageService.getUserProfile()?.UserName : res.Signature,
            });
          });
        this.isCheckAPICall = true;
      });
  }

  removeItem(index: number) {
    this.TOITEM.removeAt(index);
  }

  parsePayloadFormateTime(data: any) {
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

  saveEducationFormValue(type) {
    let saveEducation = [];
    this.educationForm.value.TOITEM.filter((element) => {
      if (element.Designation || element.InfoTaught || element.Barriers || element.PersonTaught || element.Tools || element.PatientResp || element.Learner || element.Understanding || element.Plann ) {
        element.Designation = element.Designation ? element.Designation : '';
        element.InfoTaught = element.InfoTaught ? element.InfoTaught : ''; 
        element.Barriers = element.Barriers ? element.Barriers : ''; 
        element.PersonTaught = element.PersonTaught ? element.PersonTaught : ''; 
        element.Tools = element.Tools ? element.Tools : ''; 
        element.PatientResp = element.PatientResp ? element.PatientResp : ''; 
        element.Learner = element.Learner ? element.Learner : ''; 
        element.Understanding = element.Understanding ? element.Understanding : ''; 
    
        (element.Datum =
          element.Datum !== undefined && element.Datum !== null
            ? this.sanitizeSAPDateFormat(element.Datum)
            : null),
          (element.Tims = this.parsePayloadFormateTime(element.Tims)),
          (element.PlannedTime = this.parsePayloadFormateTime(
            element.PlannedTime
          )),
          (element.PlannedDate =
            element.PlannedDate !== undefined && element.PlannedDate !== null
              ? this.sanitizeSAPDateFormat(element.PlannedDate)
              : null),
          saveEducation.push(element);
      }
    });

    this.educationForm.value.TOITEM = saveEducation;
    if (type) this.educationForm.value.DocStatus = '2';
    else this.educationForm.value.DocStatus = '1';
    let d = {
      d: this.educationForm.value,
    };
    d.d.AttendPhy = this.storageService.getUserProfile().Gpart;

    if (this.admissionService.isCloneEducationAsset) {
      this.educationForm.value.DocStatus = '3';
    }

    this.admissionService.saveEducationData(d).subscribe(
      (result) => {
        console.log(this.soapFormEvent, "this.soapFormEvent");
        
        // if(this.soapFormEvent == 'saveClose' || this.soapFormEvent == 'release') { 
        // }
        this.reloadTableList.next(true);
        this.admissionService.cancelAllForm();
        this.admissionService.clearSoapEvent.next(true);
        this.admissionService.isEditEducationAsset = false;
        this.admissionService.isCloneEducationAsset = false;
        this.docsService.showSuccessMsg(this.soapFormEvent, 'Education Assessment');
      },
      (err) => {
        this.admissionService.clearSoapEvent.next(true);
        this.admissionService.isEditEducationAsset = false;
        this.admissionService.isCloneEducationAsset = false;
        const errorMsg = err?.error?.error?.message?.value || 'Unknown error';
        this.docsService.showErrorMsg(err);
        this.admissionService.isSaveEducationData.next(false);
      }
    );
  }

  directReleasedData(type) {
    let saveEducation = [];
    this.educationForm.value.TOITEM.filter((element: any) => {
      if (element.Designation || element.InfoTaught || element.Barriers || element.PersonTaught || element.Tools || element.PatientResp || element.Learner || element.Understanding || element.Plann ) {
        element.Designation = element.Designation ? element.Designation : '';
        element.InfoTaught = element.InfoTaught ? element.InfoTaught : ''; 
        element.Barriers = element.Barriers ? element.Barriers : ''; 
        element.PersonTaught = element.PersonTaught ? element.PersonTaught : ''; 
        element.Tools = element.Tools ? element.Tools : ''; 
        element.PatientResp = element.PatientResp ? element.PatientResp : ''; 
        element.Learner = element.Learner ? element.Learner : ''; 
        element.Understanding = element.Understanding ? element.Understanding : '';   
        (element.Datum =
          element.Datum !== undefined && element.Datum !== null
            ? `\/Date(${element.Datum.getTime()})\/`
            : null),
          (element.Tims = this.parsePayloadFormateTime(element.Tims)),
          (element.PlannedTime = this.parsePayloadFormateTime(
            element.PlannedTime
          )),
          (element.PlannedDate =
            element.PlannedDate !== undefined && element.PlannedDate !== null
              ? `\/Date(${element.PlannedDate.getTime()})\/`
              : null),
          saveEducation.push(element);
      }
    });

    this.educationForm.value.TOITEM = saveEducation;
    if(this.admissionService.isCloneEducationAsset) {
      this.educationForm.value.DocStatus = '3';
    } else {
      this.educationForm.value.DocStatus = '1';
    }
    let d = {
      d: this.educationForm.value,
    };
    d.d.AttendPhy = this.storageService.getUserProfile().Gpart;
    this.admissionService.saveEducationData(d).subscribe(
      (result: any) => {
        if(type) result.d.DocStatus = '2';
        else result.d.DocStatus = '1';
        if(type) {
          this.admissionService.saveEducationData(result).subscribe((res) => {
            this.reloadTableList.next(true);
            this.admissionService.cancelAllForm();
            this.admissionService.clearSoapEvent.next(true);
            this.docsService.showSuccessMsg(this.soapFormEvent, 'Education Assessment');
          }, error => {
            this.docsService.showErrorMsg(error);
          });
        } else {
          this.reloadTableList.next(true);
          this.admissionService.cancelAllForm();
          this.admissionService.clearSoapEvent.next(true);
        }
      },
      (err) => {
        this.admissionService.isSaveEducationData.next(false);
        this.docsService.showErrorMsg(err);
      }
    );
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

  setInputTitle(value: any) {
    if(value) return value;
    else return '';
  }

  getTitle(value, labelName) {
    if(labelName == 'information') {
      return this.informationTought.find(res => res.value === value)?.label ? this.informationTought.find(res => res.value === value)?.label : '';
    }
    if(labelName == 'barriers') {
      return this.berriers.find(res => res.value === value)?.label ? this.berriers.find(res => res.value === value)?.label : '';
    }
    if(labelName == 'personTaught') {
      return this.personTaught.find(res => res.value === value)?.label ? this.personTaught.find(res => res.value === value)?.label : '';
    }
    if(labelName == 'tools') {
      return this.toolsList.find(res => res.value === value)?.label ? this.toolsList.find(res => res.value === value)?.label : '';
    }
    if(labelName == 'patient') {
      return this.patientResponse.find(res => res.value === value)?.label ? this.patientResponse.find(res => res.value === value)?.label : '';
    }
    if(labelName == 'learner') {
      return this.learnerNeedPlan.find(res => res.value === value)?.label ? this.learnerNeedPlan.find(res => res.value === value)?.label : '';
    }
    if(labelName == 'Understanding') {
      return this.understanding.find(res => res.value === value)?.label ? this.understanding.find(res => res.value === value)?.label :'';
    }
  }
}
