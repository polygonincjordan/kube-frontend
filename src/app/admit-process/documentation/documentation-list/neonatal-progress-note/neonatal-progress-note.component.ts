import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AdmissionService } from '@services/admission/admission.service';
import { StorageService } from '@services/storage.service';

@Component({
  selector: 'app-neonatal-progress-note',
  templateUrl: './neonatal-progress-note.component.html',
  styleUrls: ['./neonatal-progress-note.component.scss']
})
export class NeonatalProgressNoteComponent implements OnInit,OnChanges {
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
      this.createNeoNatalDoc(false);
    }
    if(changes.soapFormEvent.currentValue == 'edit') {
      this.updateNeoNatalDoc();
    }
    if(changes.soapFormEvent.currentValue == 'saveClose') {
      if(this.admissionService.isEditNeonatal) {
        this.updateNeoNatalDoc();
      } else {
        this.createNeoNatalDoc(false);
      }
    }


    if(changes.soapFormEvent.currentValue == 'release') {
      if(this.admissionService.isCloneNeonatal) {
        this.createNeoNatalDoc(true)
      } else {
        // this.releaseNeoNatalDoc()
        this.createNeoNatalDoc(true)
      }
    }

    if (this.admissionService.isEditNeonatal || this.admissionService.isCloneNeonatal) {
      this.getNeoNatalData();
    }
  }

  initForm(){
    let currentTime = this.datePipe.transform(new Date(), 'hh:mm');
    this.neoNatalForm = this.formBuilder.group({
      "Dockey": [''],
      "Dtid": "ZMED_NEOPN",
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
      "BirthWeight": [ Object.keys(this.storageService.patientData?.weight).length === 0 ?"":
      (this.storageService.patientData?.weight!.unit == 'kg' ? 
      (this.storageService.patientData?.weight!.value * 1000)!.toString() :
        (this.storageService.patientData?.weight!.value)!.toString())],
      "BirthWgtUnit": ['0'],
      "CurrentWeight": [''],
      "CurrentWgtUnit": ['0'],
      "HeadCircumf": [true],
      "Km": [''],
      "Subjective": [''],
      "Objective": [''],
      "Assessment": [''],
      "Plann": [''],
      "AttendPhy": [this.storageService.getGpart()],
      "DocStatus": ['']
  });
  }
  getNeoNatalData() {
    const json = {
      Dockey:this.admissionService.selectedCurrentDocDetails.Dockey,
    }
    this.admissionService.getNeoNatalData(json).subscribe(
      (patientResult: any) => {
        this.selectedPatientDetails = patientResult?.d?.results[0]; 
        this.neoNatalForm.patchValue(patientResult?.d?.results[0]);
        this.neoNatalForm.patchValue({
          Dockey:patientResult?.d?.results[0]?.Dockey,
          Datee:this.getDate(patientResult?.d?.results[0]?.Datee),
          Timee:this.getTime(patientResult?.d?.results[0]?.Timee)
        })
        
      },
      (_error: any) => {}
    );
  } 
  async createNeoNatalDoc(isrelease:boolean){
    let createJson = this.neoNatalForm.value;
    let createtime = '';

    createJson['DocStatus'] = '1';
    // if (this.admissionService.isCloneNeonatal && isrelease) {
    //   createJson['DocStatus'] = '5';
    // }else     if (this.admissionService.isCloneNeonatal && !isrelease) {
    //   createJson['DocStatus'] = '3';
    // } 
     createJson.AttendPhy = this.storageService.getGpart();
    if (createJson["Dockey"] === null || createJson["Dockey"] === undefined || createJson["Dockey"] === "") {
      if (isrelease) {
        createJson['DocStatus'] = '4';
      } else {
        createJson['DocStatus'] = '1';
      }
    } else {

      if (this.admissionService.isCloneNeonatal && isrelease) {
        createJson['DocStatus'] = '5';
      } else if (this.admissionService.isCloneNeonatal && !isrelease) {
        createJson['DocStatus'] = '3';
      } else {
        // createJson['DocStatus'] = '2';
        this.releaseNeoNatalDoc();
        return;
      }

    }

    // if dockey available-- - copy
    // docstatus = 3 -- - save
    // docstatus = 5 -- - release

    // if dockey not available-- - initial N / A
    // docstatus = 1 -- - save
    // docstatus = 4 -- - release

    createJson['Datee'] = `${new DatePipe('en-US').transform(
      createJson.Datee,
      'yyyy-MM-dd'
    )}T00:00:00`;
    createtime = createJson.Timee.split(':');
    createJson.Timee = 'PT'+createtime[0] + 'H' + createtime[1] + 'M' + '00S';
   await this.admissionService.createNeoNatalDoc(createJson).subscribe(()=>{
      if(this.soapFormEvent == 'saveClose') { 
        this.admissionService.cancelAllForm();
        this.admissionService.selectedCurrentDocDetails = '';
        this.admissionService.clearSoapEvent.next(true);
        this.realodEducationList.next(true);
      }
    })
  
  }
  async updateNeoNatalDoc(){
    let updateJson = this.neoNatalForm.value;
    let createtime = '';
    updateJson['DocStatus'] = '1';
    updateJson['Datee'] = `${new DatePipe('en-US').transform(
      updateJson.Datee,
      'yyyy-MM-dd'
    )}T00:00:00`;
    createtime = updateJson.Timee.split(':');
    updateJson.Timee = 'PT'+createtime[0] + 'H' + createtime[1] + 'M' + '00S';
    await this.admissionService.updateNeoNatalDoc(updateJson).subscribe(()=>{
       if(this.soapFormEvent == 'saveClose') { 
        this.admissionService.cancelAllForm();
        this.admissionService.selectedCurrentDocDetails = '';
        this.admissionService.clearSoapEvent.next(true);
        this.realodEducationList.next(true);
      }
    })
  } 
  async releaseNeoNatalDoc(){
   
    let updateJson = this.neoNatalForm.value;
    let createtime = '';
    updateJson['DocStatus'] = '2';
    updateJson['Datee'] = `${new DatePipe('en-US').transform(
      updateJson.Datee,
      'yyyy-MM-dd'
    )}T00:00:00`;
    createtime = updateJson.Timee.split(':');
    updateJson.Timee = 'PT'+createtime[0] + 'H' + createtime[1] + 'M' + '00S';
    updateJson.AttendPhy = this.storageService.getGpart();
   
    this.admissionService.releaseNeoNatalDoc(updateJson).subscribe(()=>{
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
