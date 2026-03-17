import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdmissionService } from '@services/admission/admission.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { StorageService } from '@services/storage.service';
import { DocsService } from '@services/docs.service';

@Component({
  selector: 'app-medical-report',
  templateUrl: './medical-report.component.html',
  styleUrls: ['./medical-report.component.scss']
})
export class MedicalReportComponent implements OnInit,OnChanges {
  @Input() soapFormEvent: string;
  @Input() docType: any;
  @Output() realodEducationList = new EventEmitter();
  @Output() doctypeLoaded = new EventEmitter<any>();
  medReportForm: FormGroup;
  paramsObject: any;
  selectedPatientDetails: any;
  constructor(private formBuilder: FormBuilder,private storageService:StorageService,private emergencyService:EmergencyService,private route: ActivatedRoute,public admissionService: AdmissionService, private docsService: DocsService) {
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
    if (this.docType === undefined || this.docType === null || this.docType === '') {
      this.docsService.showWarningMsg('Please select Document Type (Legal/Non Legal) before saving.');
      return;
    }

    let createJson = this.medReportForm.value;
    createJson['DocStatus'] = '1';
    createJson['Doctype'] = this.docType.toString();
   await this.emergencyService.createMedDoc(createJson).subscribe(()=>{
    this.admissionService.cancelAllForm();
    this.admissionService.selectedCurrentDocDetails = '';
    this.admissionService.clearSoapEvent.next(true);
    this.realodEducationList.next(true);
    })
  
  }
  async updateMedDoc(){
    if (this.docType === undefined || this.docType === null || this.docType === '') {
      this.docsService.showWarningMsg('Please select Document Type (Legal/Non Legal) before saving.');
      return;
    }

    let updateJson = this.medReportForm.value;
    updateJson['DocStatus'] = '1';
    updateJson['Doctype'] = this.docType.toString();
    await this.emergencyService.updateMedDoc(updateJson).subscribe(()=>{
      this.admissionService.cancelAllForm();
    this.admissionService.selectedCurrentDocDetails = '';
    this.admissionService.clearSoapEvent.next(true);
    this.realodEducationList.next(true);
    })
  }
  async releaseMedDoc(){
    if (this.docType === undefined || this.docType === null || this.docType === '') {
      this.docsService.showWarningMsg('Please select Document Type (Legal/Non Legal) before releasing.');
      return;
    }

    let updateJson = this.medReportForm.value;
    updateJson['DocStatus'] = '2';
    updateJson['Doctype'] = this.docType.toString();
    this.emergencyService.releaseMedDoc(updateJson).subscribe(()=>{
      this.admissionService.cancelAllForm();
    this.admissionService.selectedCurrentDocDetails = '';
    this.admissionService.clearSoapEvent.next(true);
    this.realodEducationList.next(true);
    })
   }
}
