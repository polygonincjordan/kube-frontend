import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AdmissionService } from '@services/admission/admission.service';
import { StorageService } from '@services/storage.service';

@Component({
  selector: 'app-neonatal-medical-report',
  templateUrl: './neonatal-medical-report.component.html',
  styleUrls: ['./neonatal-medical-report.component.scss']
})
export class NeonatalMedicalReportComponent implements OnInit {
  @Input() soapFormEvent: string;
  @Output() realodEducationList = new EventEmitter();
  neoNatalForm: FormGroup;
  selectedPatientDetails: any;
  constructor(private formBuilder: FormBuilder,private storageService:StorageService,public admissionService: AdmissionService,private datePipe: DatePipe) { }

  ngOnInit() {
    this.initForm();
  }
  ngOnChanges(changes: SimpleChanges) {
    if(changes.soapFormEvent.currentValue == 'add') {
      this.createNeoNatalMRDoc(false);
    }
    if(changes.soapFormEvent.currentValue == 'edit') {
      this.updateNeoNatalMRDoc();
    }
    if(changes.soapFormEvent.currentValue == 'saveClose') {
      if(this.admissionService.isEditNeonatalMR) {
        this.updateNeoNatalMRDoc();
      } else {
        this.createNeoNatalMRDoc(false);
      }
    }

    if(changes.soapFormEvent.currentValue == 'release') {
      if(this.admissionService.isCloneNeonatalMR) {
        this.createNeoNatalMRDoc(true)
      } else {
        this.createNeoNatalMRDoc(true);
        // this.releaseNeoNatalMRDoc()
      }
    }

    if (this.admissionService.isEditNeonatalMR || this.admissionService.isCloneNeonatalMR) {
      this.getNeoNatalMRData();
    }
  }

  initForm(){
    let currentTime = this.datePipe.transform(new Date(), 'hh:mm');
    this.neoNatalForm = this.formBuilder.group({
      "Dockey": [''],
      "Dtid": "ZMED_NEOMD",
      "Einri": [this.storageService.einri],
      "Patnr": [this.storageService.patnr],
      "Falnr": [this.storageService.falnr],
      "Orgdo": [''],
      "Lfdnr": [this.storageService.lfdnr],
      "Datee": [new Date()],
      "Timee": [currentTime],
      "Ga": [''],
      "GaDays": [''],
      "Cga": [''],
      "CgaDays": [''],
      "ChronoAge": [''],
      "Gender" : [''],
      "BirthDate" : [new Date(`${new DatePipe('en-US').transform(
        this.storageService.patientData.birthDate,
        'yyyy-MM-dd'
      )}T00:00:00`)],
      "BirthTime" : [''],
      "AdmDate" : [new Date(`${new DatePipe('en-US').transform(
        this.storageService.patientData.periodStart,
        'yyyy-MM-dd'
      )}T00:00:00`)],
      "AdmTime" : [this.datePipe.transform(new Date(), "hh:mm:ss")],
      "Min1" : [''],
      "Min5" : [''],
      "Min10" : [''],
      "TypeDelivery" : [''],
      "BirthWeight": [ Object.keys(this.storageService.patientData?.weight).length === 0 ?"":
      (this.storageService.patientData?.weight!.unit == 'kg' ? 
      (this.storageService.patientData?.weight!.value * 1000)!.toString() :
        (this.storageService.patientData?.weight!.value)!.toString())],
      "BirthWgtUnit": ['0'],
      "CurrentWeight": [''],
      "CurrentWgtUnit": ['0'],
      "AttendingPhy" : [this.storageService.patientData?.careManager],
      "Problem": [''],
      "Assessment": [''],
      "Plann": [''],
      "AttendPhy": [this.storageService.getGpart()],
      "DocStatus": ['']
  });
  }
  getNeoNatalMRData() {
    const json = {
      Dockey:this.admissionService.selectedCurrentDocDetails.Dockey,
    }
    this.admissionService.getNeoNatalMRData(json).subscribe(
      (patientResult: any) => {
        this.selectedPatientDetails = patientResult?.d?.results[0]; 
        this.neoNatalForm.patchValue(patientResult?.d?.results[0]);
        this.neoNatalForm.patchValue({
          Dockey:patientResult?.d?.results[0]?.Dockey,
          Datee:this.getDate(patientResult?.d?.results[0]?.Datee),
          Timee:this.getTime(patientResult?.d?.results[0]?.Timee),
          BirthDate:this.getDate(patientResult?.d?.results[0]?.BirthDate),
          BirthTime:this.getTime(patientResult?.d?.results[0]?.BirthTime),
          AdmDate:this.getDate(patientResult?.d?.results[0]?.AdmDate),
          AdmTime:this.getTime(patientResult?.d?.results[0]?.AdmTime)
        })
        
      },
      (_error: any) => {}
    );
  } 
  async createNeoNatalMRDoc(isrelease: boolean) {
    let createJson = this.neoNatalForm.value;
    let createtime = '';
    let createbtime = '';
    let createatime = '';
    createJson['DocStatus'] = '1';

    if (createJson["Dockey"] === null || createJson["Dockey"] === undefined || createJson["Dockey"] === "") {
      if (isrelease) {
        createJson['DocStatus'] = '4';
      } else {
        createJson['DocStatus'] = '1';
      }
    } else {

      if (this.admissionService.isCloneNeonatalMR && isrelease) {
        createJson['DocStatus'] = '5';
      } else if (this.admissionService.isCloneNeonatalMR && !isrelease) {
        createJson['DocStatus'] = '3';
      } else {
        // createJson['DocStatus'] = '2';
        this.releaseNeoNatalMRDoc();
        return;
      }
    }

    createJson['Datee'] = `${new DatePipe('en-US').transform(
      createJson.Datee,
      'yyyy-MM-dd'
    )}T00:00:00`;
    createJson['BirthDate'] = `${new DatePipe('en-US').transform(
      createJson.BirthDate,
      'yyyy-MM-dd'
    )}T00:00:00`;
    createJson['AdmDate'] = `${new DatePipe('en-US').transform(
      createJson.AdmDate,
      'yyyy-MM-dd'
    )}T00:00:00`;
    createtime = createJson.Timee.split(':');
    if (createJson.BirthTime!='') {
      createbtime = createJson.BirthTime.split(':');
      createJson.BirthTime = 'PT'+createbtime[0] + 'H' + createbtime[1] + 'M' + '00S';
    }else{
      delete createJson.BirthTime;
    }

    
    createatime = createJson.AdmTime.split(':');
    createJson.Timee = 'PT'+createtime[0] + 'H' + createtime[1] + 'M' + '00S';
    
    createJson.AdmTime = 'PT'+createatime[0] + 'H' + createatime[1] + 'M' + '00S';
   await this.admissionService.createNeoNatalMRDoc(createJson).subscribe(()=>{
      if(this.soapFormEvent == 'saveClose') { 
        this.admissionService.cancelAllForm();
        this.admissionService.selectedCurrentDocDetails = '';
        this.admissionService.clearSoapEvent.next(true);
        this.realodEducationList.next(true);
      }
    })
  
  }
  async updateNeoNatalMRDoc(){
    let updateJson = this.neoNatalForm.value;
    let createtime = '';
    let createbtime = '';
    let createatime = '';
    updateJson['DocStatus'] = '1';
    updateJson['Datee'] = `${new DatePipe('en-US').transform(
      updateJson.Datee,
      'yyyy-MM-dd'
    )}T00:00:00`;
    updateJson['BirthDate'] = `${new DatePipe('en-US').transform(
      updateJson.BirthDate,
      'yyyy-MM-dd'
    )}T00:00:00`;
    updateJson['AdmDate'] = `${new DatePipe('en-US').transform(
      updateJson.AdmDate,
      'yyyy-MM-dd'
    )}T00:00:00`;
    createtime = updateJson.Timee.split(':');
    createatime = updateJson.BirthTime.split(':');
    createbtime = updateJson.AdmTime.split(':');
    updateJson.Timee = 'PT'+createtime[0] + 'H' + createtime[1] + 'M' + '00S';
    updateJson.BirthTime = 'PT'+createbtime[0] + 'H' + createbtime[1] + 'M' + '00S';
    updateJson.AdmTime = 'PT'+createatime[0] + 'H' + createatime[1] + 'M' + '00S';
    await this.admissionService.updateNeoNatalMRDoc(updateJson).subscribe(()=>{
      if(this.soapFormEvent == 'saveClose') { 
        this.admissionService.cancelAllForm();
        this.admissionService.selectedCurrentDocDetails = '';
        this.admissionService.clearSoapEvent.next(true);
        this.realodEducationList.next(true);
      }
    })
  } 
  async releaseNeoNatalMRDoc(){
   
    let updateJson = this.neoNatalForm.value;
    let createtime = '';
    let createatime = '';
    let createbtime = '';
    updateJson['DocStatus'] = '2';
    updateJson['Datee'] = `${new DatePipe('en-US').transform(
      updateJson.Datee,
      'yyyy-MM-dd'
    )}T00:00:00`;
    updateJson['BirthDate'] = `${new DatePipe('en-US').transform(
      updateJson.BirthDate,
      'yyyy-MM-dd'
    )}T00:00:00`;
    updateJson['AdmDate'] = `${new DatePipe('en-US').transform(
      updateJson.AdmDate,
      'yyyy-MM-dd'
    )}T00:00:00`;
    createtime = updateJson.Timee.split(':');
    createatime = updateJson.BirthTime.split(':');
    createbtime = updateJson.AdmTime.split(':');
    updateJson.Timee = 'PT'+createtime[0] + 'H' + createtime[1] + 'M' + '00S';
    updateJson.BirthTime = 'PT'+createbtime[0] + 'H' + createbtime[1] + 'M' + '00S';
    updateJson.AdmTime = 'PT'+createatime[0] + 'H' + createatime[1] + 'M' + '00S';
    this.admissionService.releaseNeoNatalMRDoc(updateJson).subscribe(()=>{
      this.admissionService.cancelAllForm();
    this.admissionService.selectedCurrentDocDetails = '';
    this.admissionService.clearSoapEvent.next(true);
    this.realodEducationList.next(true);
    })
   }
  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }
  getTime(value) {
    if (value) {
      var str = value;
      var str = str.replace(/[PT]/g, '');
      var str = str.replace(/[H]/g, ':');
      var str = str.replace(/[M]/g, ':');
      var str = str.replace(/[S]/g, '');
      var str = str.split(':');
      var finalstr = str[0] + ':' + str[1];
      return finalstr;
    }
  }
  handleCheckboxHeadCircum(){
    if (this.neoNatalForm.controls.HeadCircumf.value) {
      this.neoNatalForm.controls.Km.enable();
    }else{
      this.neoNatalForm.controls.Km.disable();
    }
  }

}
