import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { StorageService } from '@services/storage.service';

@Component({
  selector: 'app-patient-medical-report',
  templateUrl: './patient-medical-report.component.html',
  styleUrls: ['./patient-medical-report.component.scss']
})
export class PatientMedicalReportComponent implements OnInit {

  @Input() docDetails: any
  medReportForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private storageService: StorageService,
    private emergencyService: EmergencyService
  ) {
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

  ngOnInit() {
    if (this.docDetails.length > 0) {
      this.medReportForm.patchValue({
        "Dockey": this.docDetails[0].Dockey,
        "Dtid": this.docDetails[0].Dtid,
        "Einri": this.docDetails[0].Einri,
        "Patnr": this.docDetails[0].Patnr,
        "Falnr": this.docDetails[0].Falnr,
        "Orgdo": this.docDetails[0].Orgdo,
        "Lfdnr": this.docDetails[0].Lfdnr,
        "VisitReason": this.docDetails[0].VisitReason,
        "PhysicalExam": this.docDetails[0].PhysicalExam,
        "Investgation": this.docDetails[0].Investgation,
        "CurrendCondi": this.docDetails[0].CurrendCondi,
        "Impression": this.docDetails[0].Impression,
        "Recommendation": this.docDetails[0].Recommendation,
        "Diagnosis": this.docDetails[0].Diagnosis,
        "Prefinding": this.docDetails[0].Prefinding,
        "LabResult": this.docDetails[0].LabResult,
        "CurrentMed": this.docDetails[0].CurrentMed,
        "Procedures": this.docDetails[0].Procedures,
        "AttendPhy": this.docDetails[0].AttendPhy,
        "DocStatus": this.docDetails[0].DocStatus
      })
      console.log('medReportForm', this.medReportForm);

    } else {
      this.medReportForm.patchValue({
        "Dockey": '',
        "Dtid": "ZMED_MEDRP",
        "Einri": this.storageService.einri,
        "Patnr": this.storageService.patnr,
        "Falnr": this.storageService.falnr,
        "Orgdo": '',
        "Lfdnr": this.storageService.lfdnr,
        "VisitReason": '',
        "PhysicalExam": '',
        "Investgation": '',
        "CurrendCondi": '',
        "Impression": '',
        "Recommendation": '',
        "Diagnosis": true,
        "Prefinding": true,
        "LabResult": true,
        "CurrentMed": true,
        "Procedures": true,
        "AttendPhy": this.storageService.getGpart(),
        "DocStatus": ''
      })
    }
  }
  async createMedDoc() {
    let createJson = this.medReportForm.value;
    createJson['DocStatus'] = '1';
    createJson.Orgdo = 'F21IUAMC';
    createJson.AttendPhy = this.storageService.getUserProfile().Gpart;
    return this.emergencyService.createMedDoc(createJson);

  }
  async updateMedDoc() {
    let updateJson = this.medReportForm.value;
    updateJson['DocStatus'] = '1';
    updateJson.Orgdo = 'F21IUAMC';
    updateJson.AttendPhy = this.storageService.getUserProfile().Gpart;
    return this.emergencyService.updateMedDoc(updateJson);
  }
  async deleteMedReport() {
    const json = {
      Dockey: this.docDetails[0].Dockey,
    }
    return this.emergencyService.deleteMedReport(json);
  }
  async releaseMedDoc() {

    let updateJson = this.medReportForm.value;
    updateJson['DocStatus'] = '2';
    updateJson.Orgdo = 'F21IUAMC';
    updateJson.AttendPhy = this.storageService.getUserProfile().Gpart;
    return this.emergencyService.releaseMedDoc(updateJson);
  }
  async CopyMedReport() {
    let createJson = this.medReportForm.value;
    createJson['DocStatus'] = '1';
    createJson.Orgdo = 'F21IUAMC';
    createJson.AttendPhy = this.storageService.getUserProfile().Gpart;
    return this.emergencyService.createMedDoc(createJson);

  }
  async createAndReleaseMedDoc() {
    let createJson = this.medReportForm.value;
    createJson['DocStatus'] = '2';
    createJson.Orgdo = 'F21IUAMC';
    createJson.AttendPhy = this.storageService.getUserProfile().Gpart;
    return this.emergencyService.createMedDoc(createJson);

  }
  resetAll() {
    this.medReportForm.reset();
    this.medReportForm = this.formBuilder.group({
      "Dockey": [''],
      "Dtid": ["ZMED_MEDRP"],
      "Einri": [''],
      "Patnr": [''],
      "Falnr": [''],
      "Orgdo": [''],
      "Lfdnr": [''],
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


}
