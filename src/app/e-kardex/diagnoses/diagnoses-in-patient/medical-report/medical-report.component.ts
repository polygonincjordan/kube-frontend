import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdmissionService } from '@services/admission/admission.service';
import { DataShareService } from '@services/data-share.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { ActionType } from '@services/interfaces/common.enum';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { Subscription } from 'rxjs';

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
  docKey: any;
    private actionTypeSubscription$: Subscription;
    private subscription: Subscription;
  constructor(private formBuilder: FormBuilder,private storageService:StorageService,private emergencyService:EmergencyService,private route: ActivatedRoute,public admissionService: AdmissionService,
    private sharedService: SharedService, private dataShareService: DataShareService
  ) {
    this.route.queryParams.subscribe((params) => {
      this.paramsObject = params;
    });
   }

  ngOnInit() {
    this.initForm();
        this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe(
          (data) => {
            if (data != null) {
              if (data.type == ActionType.Add$ && data.value == '') {
                this.docKey = data.value.Dockey;
              }
              if (data.type == ActionType.Update$ && data.value) {
                this.docKey = data.value.docKey;
                this.getMedReportData(data.value.docKey);
              }
              if (data.type == ActionType.Copy$ && data.value) {
                this.docKey = data.value.docKey;
                this.getMedReportData(data.value.docKey);
              }
            }
          }
        );
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

  ngOnChanges(changes: SimpleChanges) {
    // if(changes.soapFormEvent.currentValue == 'add') {
    //   this.createMedDoc(false);
    // }
    // if(changes.soapFormEvent.currentValue == 'edit') {
    //   this.updateMedDoc();
    // }

    // if(changes.soapFormEvent.currentValue == 'release') {
    //   if(this.admissionService.isCloneMedicalDoc) {
    //     this.createMedDoc(true)
    //   } else {
    //     this.releaseMedDoc()
    //   }
    // }

    if (this.admissionService.isEditMedicalDoc || this.admissionService.isCloneMedicalDoc) {
      // this.getMedReportData();
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
  getMedReportData(docKey) {
    const json = {
      Dockey:docKey,
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
   createMedDoc(dockStatus){
    let createJson = this.medReportForm.value;
    createJson['DocStatus'] = dockStatus;
    this.emergencyService.createMedDoc(createJson).subscribe(()=>{
    this.admissionService.cancelAllForm();
    this.admissionService.selectedCurrentDocDetails = '';
    this.admissionService.clearSoapEvent.next(true);
    this.realodEducationList.next(true);
    })
  }

  createMedicalReport(docStatus: any, actiontype?: string) {
    return new Promise((resolve, reject) => {
      if (this.medReportForm.invalid) {
        return;
      }
      this.medReportForm.value.DocStatus = docStatus;
      let paylaod = this.medReportForm.value;

      this.subscription = this.emergencyService
        .createMedDoc(paylaod)
        .subscribe({
          next: (data: any) => { },
          error: (err: any) => {
            this.sharedService.waringSwallModel(`Error ${err}`);
            this.sharedService.waringSwallModel(
              `PUT Error at Medical Report : ${err}`
            );
          },
          complete: () => {
            resolve(true);
            if (actiontype === 'edit') {
              this.sharedService.successSwallModel(
                'Medical Report updated successfully'
              );
            } else {
              this.sharedService.successSwallModel(
                'Medical Report created successfully'
              );
            }
          },
        });
    });
  }

  updateMedicalReport(docStatus: any, actiontype?: string) {
    return new Promise((resolve, reject) => {
      if (this.medReportForm.invalid) {
        return;
      }
      this.medReportForm.value.DocStatus = docStatus;
      let paylaod = this.medReportForm.value;

      this.subscription = this.emergencyService
        .updateMedDoc(paylaod)
        .subscribe({
          next: (data: any) => { },
          error: (err: any) => {
            this.sharedService.waringSwallModel(`Error ${err}`);
            this.sharedService.waringSwallModel(
              `PUT Error at Medical Report : ${err}`
            );
          },
          complete: () => {
            resolve(true);
            if (actiontype === 'edit') {
              this.sharedService.successSwallModel(
                'Medical Report updated successfully'
              );
            } else {
              this.sharedService.successSwallModel(
                'Medical Report created successfully'
              );
            }
          },
        });
    });
  }

  releaseMedicalReport(docStatus: any, actiontype?: string) {
    return new Promise((resolve, reject) => {
      if (this.medReportForm.invalid) {
        return;
      }
      this.medReportForm.value.DocStatus = docStatus;
      let paylaod = this.medReportForm.value;

      this.subscription = this.emergencyService.releaseMedDoc(paylaod)
        .subscribe({
          next: (data: any) => { },
          error: (err: any) => {
            this.sharedService.waringSwallModel(`Error ${err}`);
            this.sharedService.waringSwallModel(
              `PUT Error at Medical Report : ${err}`
            );
          },
          complete: () => {
            resolve(true);
            if (actiontype === 'edit') {
              this.sharedService.successSwallModel(
                'Medical Report updated successfully'
              );
            } else {
              this.sharedService.successSwallModel(
                'Medical Report created successfully'
              );
            }
          },
        });
    });
  }
  async updateMedDoc(){
    let updateJson = this.medReportForm.value;
    updateJson['DocStatus'] = '1';
    await this.emergencyService.updateMedDoc(updateJson).subscribe(()=>{
      this.admissionService.cancelAllForm();
    this.admissionService.selectedCurrentDocDetails = '';
    this.admissionService.clearSoapEvent.next(true);
    this.realodEducationList.next(true);
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
