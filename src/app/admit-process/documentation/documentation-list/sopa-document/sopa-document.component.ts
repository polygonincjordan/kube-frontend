import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { AdmissionService } from '@services/admission/admission.service';
import { PatientVisitService } from '@services/e-kardex/patient-visit.service';
import { UserConfigurationService } from '@services/e-kardex/user-configuration.service';
import { SharedService } from '@services/shared.service';
import { DocsService } from '@services/docs.service';

@UntilDestroy()
@Component({
  selector: 'app-sopa-document',
  templateUrl: './sopa-document.component.html',
  styleUrls: ['./sopa-document.component.scss'],
})
export class SopaDocumentComponent implements OnInit, OnChanges {
  @Output() realodEducationList = new EventEmitter();
  @Input() soapFormEvent: string;
  soapDocForm: FormGroup;
  paramsObject: any;
  selectedPatientDetails: any;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    public admissionService: AdmissionService,
    private patientVisitService: PatientVisitService,
    private sharedService: SharedService,
    private userConfigurationService: UserConfigurationService,
    private docsService: DocsService
  ) {
    this.route.queryParams.subscribe((params) => {
      this.paramsObject = params;
    });
  }

  ngOnInit(): void {
    this.initForm();
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if(changes.soapFormEvent.currentValue == 'add') {
      this.saveDocument(false);
    }

    if(changes.soapFormEvent.currentValue == 'edit') {
      this.updateDocument();
    }
    if(changes.soapFormEvent.currentValue == 'saveClose') {
      if(this.admissionService.isEditSoapDoc) { 
        this.updateDocument();
      } else {
        this.saveDocument(false);
      }
    }

    if(changes.soapFormEvent.currentValue == 'release') {
      if(this.admissionService.isCloneSoapDoc) {
        this.saveDocument(true)
      } else {
        this.releaseDoc()
      }
    }

    if (this.admissionService.isEditSoapDoc || this.admissionService.isCloneSoapDoc) {
      this.getSoapDoc();
    }
  }

  getSoapDoc() {
    this.userConfigurationService
      .getSoapPatientdata(
        this.admissionService.selectedCurrentDocDetails.Dockey,
        this.paramsObject.einri,
        this.paramsObject.falnr
      )
      .subscribe((patientResult: any) => {
        this.selectedPatientDetails = patientResult?.d?.results[0]; 
        this.soapDocForm.patchValue(patientResult?.d?.results[0]);
        this.soapDocForm.patchValue({
          VisitDate: this.getDate(patientResult?.d?.results[0]?.Visitdate),
          Subjective: patientResult?.d?.results[0]?.Subjective,
          Objective: patientResult?.d?.results[0]?.Objective,
          Assessment: patientResult?.d?.results[0]?.Assessment,
          Plann: patientResult?.d?.results[0]?.Plann,
          Dockey:patientResult?.d?.results[0]?.Dockey
        })

        if(this.admissionService.isCloneSoapDoc) {
          this.soapDocForm.patchValue({
            Etag: '',
            VisitDate: new Date()
          })
        }
      });
  }

  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }

  initForm() {
    this.soapDocForm = this.formBuilder.group({
      Einri: [this.paramsObject.einri],
      Falnr: [this.paramsObject.falnr],
      Dockey: [
        this.admissionService.selectedCurrentDocDetails?.Dockey
          ? this.admissionService.selectedCurrentDocDetails?.Dockey
          : '',
      ],
      Lfdnr: [this.paramsObject.lfdnr],
      Patnr: [this.paramsObject.patnr],
      VisitDate: [new Date()],
      Dtid: [ this.admissionService?.selectedCurrentDocDetails?.Dtid
        ? this.admissionService?.selectedCurrentDocDetails?.Dtid
        : '',],
      Subjective: [''],
      Objective: [''],
      Assessment: [''],
      Plann: [''],
      Srcapp: [''],
      Etag: [''],
      ReferredBy: [''],
      ReasonForVisit: [''],
      TranscriberText: [''],
      Released: ['']
    });
  }

  async releaseDoc() {
    let payload = this.soapDocForm.value;
    if(!this.admissionService.isEditSoapDoc) {
      payload.Dockey = '';
    }
    if(this.admissionService.isCloneSoapDoc) {
      payload.Dockey = this.selectedPatientDetails.Dockey;
    }
    payload.VisitDate = this.soapDocForm.value.VisitDate;
    await this.patientVisitService
      .toReleaseSoapPatientVisitData(payload)
      .then((res: any) => {
        this.admissionService.selectedCurrentDocDetails = '';
        this.admissionService.cancelAllForm();
        this.admissionService.clearSoapEvent.next(true);
        this.realodEducationList.next(true);
        this.docsService.showSuccessMsg(this.soapFormEvent,'SOAP Document');
      }, (error) => {
        this.admissionService.clearSoapEvent.next(true);
        this.docsService.showErrorMsg(error);
      });
  }

  async saveDocument(isrelease:boolean) {
    let payload: any = this.soapDocForm.value;
    payload.Dockey = '';
    if(this.admissionService.isCloneSoapDoc) {
      payload.Dockey = this.selectedPatientDetails.Dockey;
    }

    if(isrelease){             
      payload.Released = "X";
    }

    await this.patientVisitService
      .savePatientVisitData(payload)
      .then((res: any) => {
        // if(this.soapFormEvent == 'saveClose' || this.soapFormEvent == 'release') { 
        // }
        this.admissionService.cancelAllForm();
        this.admissionService.selectedCurrentDocDetails = '';
        this.realodEducationList.next(true);
        this.admissionService.clearSoapEvent.next(true);
        this.admissionService.isCloneSoapDoc = false;
        this.admissionService.isEditSoapDoc = false;
        this.docsService.showSuccessMsg(this.soapFormEvent,'SOAP Document');
      }, (error) => {
        this.admissionService.isCloneSoapDoc = false;
        this.admissionService.isEditSoapDoc = false;
        this.admissionService.clearSoapEvent.next(true);
        this.docsService.showErrorMsg(error);
      });
  }

  async updateDocument() {
    let payload = this.soapDocForm.value;
    payload.VisitDate = this.soapDocForm.value.VisitDate;
    await this.patientVisitService
      .updatePatientVisitData(this.soapDocForm.value)
      .then((res: any) => {
        // if(this.soapFormEvent == 'saveClose' || this.soapFormEvent == 'release') { 
        // }
        this.admissionService.cancelAllForm();
        this.admissionService.selectedCurrentDocDetails = '';
        this.realodEducationList.next(true);
        this.admissionService.clearSoapEvent.next(true);
        this.admissionService.isCloneSoapDoc = false;
        this.admissionService.isEditSoapDoc = false;
        this.docsService.showSuccessMsg(this.soapFormEvent,'SOAP Document');
      }, (error) => {
        this.admissionService.isCloneSoapDoc = false;
        this.admissionService.isEditSoapDoc = false;
        this.admissionService.clearSoapEvent.next(true);
        this.docsService.showErrorMsg(error);
      });
  }

  async deleteForm() {
    await this.patientVisitService.deletePatientVisitData(this.soapDocForm.value
    );
    this.realodEducationList.emit(true);
  }
}
