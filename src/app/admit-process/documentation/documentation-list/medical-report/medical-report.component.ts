import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdmissionService } from '@services/admission/admission.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { DocsService } from '@services/docs.service';

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
  constructor(private formBuilder: FormBuilder,private storageService:StorageService,private emergencyService:EmergencyService,private route: ActivatedRoute,
    public admissionService: AdmissionService, private sharedService: SharedService, private docsService:DocsService) {
    this.route.queryParams.subscribe((params) => {
      this.paramsObject = params;
    });
   }

  ngOnInit() {
    this.initForm();
    this.handleDocLoadingIfNeeded();
  }
  
  ngOnChanges(changes: SimpleChanges) {
    this.handleSoapFormEvent();
  }

  private handleSoapFormEvent(): void {
    switch (this.soapFormEvent) {
      case 'add':
        this.handleAddEvent();
        break;
      case 'edit':
        this.handleEditEvent();
        break;
      case 'release':
        this.handleReleaseEvent();
        break;
    }
  }

  private handleDocLoadingIfNeeded(): void {
    if (this.admissionService.isEditMedicalDoc || this.admissionService.isCloneMedicalDoc) {
      this.getMedReportData();
    }
  }


  private handleAddEvent(): void {
    const docStatus = this.resolveDocStatus();
    this.createMedDoc(docStatus);
  }

  private handleEditEvent(): void {
    this.updateMedDoc();
  }

  private handleReleaseEvent(): void {
    if (this.admissionService.isEditMedicalDoc) {
      this.releaseMedDoc();
    } else {
      const docStatus = this.resolveDocStatus();
      this.createMedDoc(docStatus);
    }
  }

  private resolveDocStatus(): string {
    if (this.soapFormEvent === 'add') {
      return this.admissionService.isCloneMedicalDoc ? '3' : '1';
    }

    if (this.soapFormEvent === 'release') {
      return this.admissionService.isCloneMedicalDoc ? '5' : '4';
    }
    return '1';
  }

  initForm() {
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
    };
    this.emergencyService.getMedReportData(json).subscribe(
      (patientResult: any) => {
        this.selectedPatientDetails = patientResult?.d?.results[0];
        this.medReportForm.patchValue(patientResult?.d?.results[0]);
        this.medReportForm.patchValue({
          Dockey:patientResult?.d?.results[0]?.Dockey
        });
      },
      (_error: any) => {}
    );
  } 
  private createMedDoc(docStatus: string): void {
    const payload = {
      ...this.medReportForm.value,
      DocStatus: docStatus
    };

    this.emergencyService.createMedDoc(payload).subscribe({
      next: () => this.handleSuccess(),
      error: (err) => this.handleError(err)
    });
  }

  private updateMedDoc(): void {
    const payload = {
      ...this.medReportForm.value,
      DocStatus: '1'
    };

    this.emergencyService.updateMedDoc(payload).subscribe({
      next: () => this.handleSuccess(),
      error: (err) => this.handleError(err)
    });
  }

  private releaseMedDoc(): void {
    const payload = {
      ...this.medReportForm.value,
      DocStatus: '2'
    };

    this.emergencyService.releaseMedDoc(payload).subscribe({
      next: () => this.handleSuccess(),
      error: (err) => this.handleError(err)
    });
  }

  private handleSuccess(): void {
    this.resetDocumentState();
    this.docsService.showSuccessMsg(this.soapFormEvent, 'Medical Report Document');
    this.emitReloadEvent();
  }

  private handleError(err: any): void {
    this.resetDocumentState();
    this.docsService.showErrorMsg(err);
  }

  private resetDocumentState(): void {
    this.admissionService.cancelAllForm();
    this.admissionService.selectedCurrentDocDetails = '';
    this.admissionService.clearSoapEvent.next(true);
    this.admissionService.isEditMedicalDoc = false;
    this.admissionService.isCloneMedicalDoc = false;
  }

  private emitReloadEvent(): void {
    this.realodEducationList.next(true);
  }
}
