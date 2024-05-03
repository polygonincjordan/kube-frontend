import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, SimpleChanges, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdmissionService } from '@services/admission/admission.service';
import { StorageService } from '@services/storage.service';

@Component({
  selector: 'app-obs-vte-anteptm',
  templateUrl: './obs-vte-anteptm.component.html',
  styleUrls: ['./obs-vte-anteptm.component.scss'],
})
export class ObsVTEAnteptmComponent implements OnInit {
  @Output() reloadTableList = new EventEmitter();
  @Input() soapFormEvent;
  obsVteAnteptm: FormGroup;
  paramsObj: any;
  totalObsValue: number = 0;
  isCheckAPICall: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private storageService: StorageService,
    private admissionService: AdmissionService
  ) {
    this.route.queryParams.subscribe((res) => {
      this.paramsObj = res;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.soapFormEvent.currentValue == 'add') {
      this.createObsVteAntDoc(false);
      return;
    }

    if (changes.soapFormEvent.currentValue == 'edit') {
      this.updateObsVteAnt(false);
      return;
    }

    if (changes.soapFormEvent.currentValue == 'release') {
      if (this.admissionService.isEditObsVteAnt) {
        this.updateObsVteAnt(true);
      } else {
        this.createObsVteAntDoc(true);
      }
      return;
    }

    if (changes.soapFormEvent.currentValue == 'copy') {
      this.enableAllField();
    }

    if (this.admissionService.isCloneObsVteAnt || this.admissionService.isEditObsVteAnt) {
      if(!this.isCheckAPICall) {
        this.getObsVteAnt();
      }
      return;
    }
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    let currentTime = this.datePipe.transform(new Date(), 'hh:mm:ss');
    this.obsVteAnteptm = this.formBuilder.group({
      Dockey: [''],
      Dtid: ['ZMED_OBANT'],
      Einri: [this.paramsObj.einri],
      Patnr: [this.paramsObj.einri],
      Falnr: [this.paramsObj.falnr],
      Orgdo: [localStorage.getItem('initOrg')],
      Lfdnr: [this.paramsObj.lfdnr],
      Datee: [new Date()],
      Timee: [currentTime],
      PreviousVte: [false],
      Ohss: [false],
      PreVteSurgery: [false],
      SurgicalProcedure: [false],
      MedicalMorbidity: [false],
      Hyperemesis: [false],
      FamilyHistory: [false],
      LrThrombophilia: [false],
      Age35: [false],
      Bmi30: [false],
      Bmi40: [false],
      Parity3: [false],
      Smoker: [false],
      GrossVaricose: [false],
      PreEclampsia: [false],
      ArtIvf: [false],
      MultiplePregnancy: [false],
      Immobility: [false],
      SystemicInfection: [false],

      Lmwh: [''],
      Dose: [''],
      StartOn: [new Date()],
      AttendPhy: [this.storageService.getGpart()],
      DocStatus: ['1'],
      Total: [{ value: '', disabled: true }],
    });
  }

  createObsVteAntDoc(type) {
    let payload = this.obsVteAnteptm.value;
    payload.DocStatus = '1';
    (payload.Timee = this.parsePayloadFormateTime(
      this.obsVteAnteptm.value.Timee
    )),
      (payload.Datee =
        this.obsVteAnteptm.value.Datee !== undefined &&
        this.obsVteAnteptm.value.Datee !== null
          ? this.sanitizeSAPDateFormat(this.obsVteAnteptm.value.Datee)
          : null),
      (payload.StartOn =
        this.obsVteAnteptm.value.StartOn !== undefined &&
        this.obsVteAnteptm.value.StartOn !== null
          ?this.sanitizeSAPDateFormat(this.obsVteAnteptm.value.StartOn)
          : null);
    this.admissionService.createObsVteAnt(this.obsVteAnteptm.value).subscribe(
      (resp) => {
        if (type) {
          this.saveAndReleas(resp);
        } else {
          this.reloadTableList.next(true);
          this.admissionService.cancelAllForm();
          this.admissionService.clearSoapEvent.next(true);
        }
      },
      (error) => {
        this.admissionService.clearSoapEvent.next(true);
      }
    );
  }

  getObsVteAnt() {
    let currentTime = this.datePipe.transform(new Date(), 'hh:mm:ss');

    this.admissionService
      .getObsVteAntData(this.admissionService.selectedCurrentDocDetails.Dockey)
      .subscribe((resp) => {
        if (resp && resp.results && resp.results.length) {
          let obstetricData = resp.results[0];
          this.totalObsValue = parseInt(obstetricData.Total);
          this.obsVteAnteptm.patchValue(obstetricData);
          if (this.admissionService.isEditObsVteAnt) {
            this.obsVteAnteptm.patchValue({
              Datee: this.getDate(obstetricData.Datee),
              Timee: this.parseTime(obstetricData.Timee),
              StartOn: this.getDate(obstetricData.StartOn),
            });
          } else {
            this.obsVteAnteptm.patchValue({
              Datee: new Date(),
              Timee: currentTime,
              StartOn: new Date(),
            });
          }
          if(this.admissionService.isPDFObsVteAnt) {
            this.disableAllField();
          }
          this.isCheckAPICall = true;
        }
      });
  }

  saveAndReleas(data) {
    let payload = data;
    payload.DocStatus = '2';
    this.admissionService.updateObsVteAntDoc(payload).subscribe(
      (resp) => {
        this.reloadTableList.next(true);
        this.admissionService.cancelAllForm();
        this.admissionService.clearSoapEvent.next(true);
      },
      (error) => {
        this.admissionService.clearSoapEvent.next(true);
      }
    );
  }

  updateObsVteAnt(type) {
    let payload = this.obsVteAnteptm.value;
    if (type) payload.DocStatus = '2';
    else payload.DocStatus = '1';
    (payload.Timee = this.parsePayloadFormateTime(
      this.obsVteAnteptm.value.Timee
    )),
      (payload.Datee =
        this.obsVteAnteptm.value.Datee !== undefined &&
        this.obsVteAnteptm.value.Datee !== null
          ? `\/Date(${this.obsVteAnteptm.value.Datee.getTime()})\/`
          : null),
      (payload.StartOn =
        this.obsVteAnteptm.value.StartOn !== undefined &&
        this.obsVteAnteptm.value.StartOn !== null
          ? `\/Date(${this.obsVteAnteptm.value.StartOn.getTime()})\/`
          : null);
    this.admissionService
      .updateObsVteAntDoc(this.obsVteAnteptm.value)
      .subscribe(
        (resp) => {
          this.reloadTableList.next(true);
          this.admissionService.cancelAllForm();
          this.admissionService.clearSoapEvent.next(true);
        },
        (error) => {
          this.admissionService.clearSoapEvent.next(true);
        }
      );
  }

  totalValue(value, control) {
    if(this.getControl(control)) {
      this.totalObsValue = this.totalObsValue + value;
    } else {
      this.totalObsValue = this.totalObsValue - value;
    }
    this.obsVteAnteptm.patchValue({
      Total: this.totalObsValue
    })
    
  }

  getControl(control) {
    return this.obsVteAnteptm.get(control).value;
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

  
  disableAllField() {
    this.obsVteAnteptm.get('PreviousVte').disable();
    this.obsVteAnteptm.get('Ohss').disable();
    this.obsVteAnteptm.get('PreVteSurgery').disable();
    this.obsVteAnteptm.get('SurgicalProcedure').disable();
    this.obsVteAnteptm.get('MedicalMorbidity').disable();
    this.obsVteAnteptm.get('FamilyHistory').disable();
    this.obsVteAnteptm.get('LrThrombophilia').disable();
    this.obsVteAnteptm.get('Age35').disable();
    this.obsVteAnteptm.get('Bmi30').disable();
    this.obsVteAnteptm.get('Bmi40').disable();
    this.obsVteAnteptm.get('Parity3').disable();
    this.obsVteAnteptm.get('Smoker').disable();
    this.obsVteAnteptm.get('GrossVaricose').disable();
    this.obsVteAnteptm.get('PreEclampsia').disable();
    this.obsVteAnteptm.get('ArtIvf').disable();
    this.obsVteAnteptm.get('MultiplePregnancy').disable();
    this.obsVteAnteptm.get('Immobility').disable();
    this.obsVteAnteptm.get('SystemicInfection').disable();
    this.obsVteAnteptm.get('Lmwh').disable();
    this.obsVteAnteptm.get('Dose').disable();
    this.obsVteAnteptm.get('StartOn').disable();
    this.obsVteAnteptm.get('Datee').disable();
    this.obsVteAnteptm.get('Timee').disable();
    this.obsVteAnteptm.get('Hyperemesis').disable();
  }

  enableAllField() {
    this.obsVteAnteptm.get('PreviousVte').enable();
    this.obsVteAnteptm.get('Ohss').enable();
    this.obsVteAnteptm.get('PreVteSurgery').enable();
    this.obsVteAnteptm.get('SurgicalProcedure').enable();
    this.obsVteAnteptm.get('MedicalMorbidity').enable();
    this.obsVteAnteptm.get('FamilyHistory').enable();
    this.obsVteAnteptm.get('LrThrombophilia').enable();
    this.obsVteAnteptm.get('Age35').enable();
    this.obsVteAnteptm.get('Bmi30').enable();
    this.obsVteAnteptm.get('Bmi40').enable();
    this.obsVteAnteptm.get('Parity3').enable();
    this.obsVteAnteptm.get('Smoker').enable();
    this.obsVteAnteptm.get('GrossVaricose').enable();
    this.obsVteAnteptm.get('PreEclampsia').enable();
    this.obsVteAnteptm.get('ArtIvf').enable();
    this.obsVteAnteptm.get('MultiplePregnancy').enable();
    this.obsVteAnteptm.get('Immobility').enable();
    this.obsVteAnteptm.get('SystemicInfection').enable();
    this.obsVteAnteptm.get('Lmwh').enable();
    this.obsVteAnteptm.get('Dose').enable();
    this.obsVteAnteptm.get('StartOn').enable();
    this.obsVteAnteptm.get('Datee').enable();
    this.obsVteAnteptm.get('Timee').enable();
    this.obsVteAnteptm.get('Hyperemesis').enable();
  }

  sanitizeSAPDateFormat(date: any) {
    if (typeof (date) === 'string') {
      return date;
    } else {
      return `\/Date(${date.getTime()})\/`
    }
  }
}
