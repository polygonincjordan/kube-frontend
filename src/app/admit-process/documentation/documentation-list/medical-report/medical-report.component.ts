import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdmissionService } from '@services/admission/admission.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { StorageService } from '@services/storage.service';

@Component({
  selector: 'app-medical-report',
  templateUrl: './medical-report.component.html',
  styleUrls: ['./medical-report.component.scss']
})
export class MedicalReportComponent implements OnInit,OnChanges {
  @Input() soapFormEvent: string;
  @Output() realodEducationList = new EventEmitter();
  medReportForm: FormGroup;
  paramsObject: any;
  selectedPatientDetails: any;
  constructor(private formBuilder: FormBuilder,private storageService:StorageService,private emergencyService:EmergencyService,private route: ActivatedRoute,public admissionService: AdmissionService,) {
    this.route.queryParams.subscribe((params) => {
      this.paramsObject = params;
    });
   }

  ngOnInit() {
    this.initForm();
  }
  ngOnChanges(changes: SimpleChanges) {
    if(changes.soapFormEvent.currentValue == 'add') {
      this.createMedDoc(false);
    }
    if(changes.soapFormEvent.currentValue == 'edit') {
      this.updateMedDoc();
    }
    if(changes.soapFormEvent.currentValue == 'saveClose') {
      if(this.admissionService.isEditMedicalDoc) {
        this.updateMedDoc();
      } else {
        this.createMedDoc(false);
      }
    }

    if(changes.soapFormEvent.currentValue == 'release') {
      if(this.admissionService.isCloneMedicalDoc) {
        this.createMedDoc(true)
      } else {
        this.releaseMedDoc()
      }
    }

    if (this.admissionService.isEditMedicalDoc || this.admissionService.isCloneMedicalDoc) {
      this.getMedReportData();
    }
  }

  initForm(){
    this.medReportForm = this.formBuilder.group({
      "Dockey": [''],
      "Dtid": ["ZMED_MEDRP"],
      "Einri": [this.storageService.einri],
      "Patnr": [this.storageService.patnr],
      "Falnr": [this.storageService.falnr],
      "Orgdo": [''],
      "Lfdnr": [this.storageService.lfdnr],
      "VisitReason": [''],
      "PhysicalExam": [''],
      "Investgation": [''],
      "CurrendCondi": [''],
      "Impression": [''],
      "Recommendation": [''],
      "Diagnosis": [true],
      "Prefinding": [true],
      "LabResult": [true],
      "CurrentMed": [true],
      "Procedures": [true],
      "AttendPhy": [this.storageService.getGpart()],
      "DocStatus": ['']
  });
  } 
  getMedReportData() {
    const json = {
      Dockey:this.admissionService.selectedCurrentDocDetails.Dockey,
    }
    this.emergencyService.getMedReportData(json).subscribe(
      (patientResult: any) => {
        this.selectedPatientDetails = patientResult?.d?.results[0]; 
        this.medReportForm.patchValue(patientResult?.d?.results[0]);
        this.medReportForm.patchValue({
          Dockey:patientResult?.d?.results[0]?.Dockey
        })
      },
      (_error: any) => {}
    );
  } 
   async createMedDoc(isrelease:boolean){
    let createJson = this.medReportForm.value;
    createJson['DocStatus'] = '1';
   await this.emergencyService.createMedDoc(createJson).subscribe(()=>{
    if(this.soapFormEvent == 'saveClose' || this.soapFormEvent == 'release') { 
      this.admissionService.cancelAllForm();
      this.admissionService.selectedCurrentDocDetails = '';
      this.admissionService.clearSoapEvent.next(true);
      this.realodEducationList.next(true);
    }
    })
  
  }
  async updateMedDoc(){
    let updateJson = this.medReportForm.value;
    updateJson['DocStatus'] = '1';
    await this.emergencyService.updateMedDoc(updateJson).subscribe(()=>{
      if(this.soapFormEvent == 'saveClose' || this.soapFormEvent == 'release') { 
        this.admissionService.cancelAllForm();
        this.admissionService.selectedCurrentDocDetails = '';
        this.admissionService.clearSoapEvent.next(true);
        this.realodEducationList.next(true);
      }
    })
  }
  async releaseMedDoc(){
   
    let updateJson = this.medReportForm.value;
    updateJson['DocStatus'] = '2';  
    this.emergencyService.releaseMedDoc(updateJson).subscribe(()=>{
      this.admissionService.cancelAllForm();
    this.admissionService.selectedCurrentDocDetails = '';
    this.admissionService.clearSoapEvent.next(true);
    this.realodEducationList.next(true);
    })
   }
}
