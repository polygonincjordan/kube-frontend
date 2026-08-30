
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { InPatientDataResult } from '@services/e-kardex/interfaces/inpatient-data';
import Swal from 'sweetalert2';
import {
  PatientVisitDataResult
} from '../../services/e-kardex/interfaces/patient-visit-data';

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss'],
})
export class PdfViewerComponent implements OnInit {
  patientVisitDataSet: PatientVisitDataResult =
  {} as PatientVisitDataResult;
  oldversion: boolean;
  @Input() set patientVisitData(data){
    this.patientVisitDataSet = data.patientVisit;
    this.oldversion = data.Oldversion;
  }

  @Input() inPatientVisitData: InPatientDataResult = {} as InPatientDataResult;

  @Output() updateEvent = new EventEmitter<boolean>();
  @Output() copyItemEvent = new EventEmitter();
  @Input() isInPatientSoap:any;
  @Input() soapPdf:any;
  @Input() inPatientSoapData:any;
  inOutData: any;
  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {}

  updateForm(isUpdate: boolean) {
    this.updateEvent.emit(isUpdate);
  }

  copyReleaseForm() {
    if(this.oldversion){
      Swal.fire({
        html: 'Copying is not allowed for this version. <br>Please copy the most recent',
        confirmButtonColor: '#0890c5',
        cancelButtonColor: '#84898c',
        confirmButtonText: 'OK',
        customClass: { popup: 'myalertpopup' },
        icon: 'error',
      });
    }else{
      this.copyItemEvent.emit(this.inOutData);
    }
  }

  sanitizeBase64() {
    if(this.inPatientVisitData && this.inPatientVisitData.DOCCATTOATTACHMENTS){
      this.inOutData = {};
      this.inOutData = this.inPatientVisitData;
      this.inOutData['DataType'] = "in-patient";
      if (
        this.inPatientVisitData.DOCCATTOATTACHMENTS?.results.length > 0 &&
        this.inPatientVisitData.DOCCATTOATTACHMENTS?.results.find((obj) => {
          return obj.FileId === '';
        }) != null
      )
     { if(this.inPatientVisitData.DOCCATTOATTACHMENTS?.results.find((obj) => {
        return obj.AttMimeType === 'PDF';
      }) != null){
        return this.sanitizer.bypassSecurityTrustResourceUrl(
          `data:application/pdf;base64, ${
            this.inPatientVisitData.DOCCATTOATTACHMENTS.results.find((obj) => {
              return obj.FileId === '';
            }).AttachmentData
          }`
        );
      }else{
        let itemData=this.patientVisitDataSet.VISITTOATTACHMENTS.results.find((obj) => {
          return obj.FileID === '';
          });
          return this.sanitizer.bypassSecurityTrustResourceUrl(
          `data:${itemData.AttMimeType};base64, ${
          itemData.AttachmentData
          }`)
      }
    }
    
    else if(this.inPatientVisitData.DOCCATTOATTACHMENTS?.results.length > 0){           
          console.log('Attachment with FileID', this.patientVisitDataSet.DOCCATTOATTACHMENTS?.results);
          if(this.inPatientVisitData.DOCCATTOATTACHMENTS?.results[0].AttMimeType === 'PDF'){
          return this.sanitizer.bypassSecurityTrustResourceUrl(
            `data:application/pdf;base64, ${
              this.inPatientVisitData.DOCCATTOATTACHMENTS.results[0].AttachmentData
            }`
          );
        }else{
          return this.sanitizer.bypassSecurityTrustResourceUrl(
            `data:${ this.inPatientVisitData.DOCCATTOATTACHMENTS.results[0].AttMimeType}, ${
              this.inPatientVisitData.DOCCATTOATTACHMENTS.results[0].AttachmentData
            }`
          );
        }
      }
    }
    if (this.patientVisitDataSet && this.patientVisitDataSet.VISITTOATTACHMENTS) {
      this.inOutData = {};
      this.inOutData = this.patientVisitDataSet
      if (
        this.patientVisitDataSet.VISITTOATTACHMENTS?.results.length > 0 &&
        this.patientVisitDataSet.VISITTOATTACHMENTS?.results.find((obj) => {
          return obj.FileID === '';
        }) != null
      )
      if(this.patientVisitDataSet.VISITTOATTACHMENTS?.results.find((obj) => {
        return obj.AttMimeType === 'PDF';
      }) != null){
        return this.sanitizer.bypassSecurityTrustResourceUrl(
          `data:application/pdf;base64, ${
            this.patientVisitDataSet.VISITTOATTACHMENTS.results.find((obj) => {
              return obj.FileID === '';
            }).AttachmentData
          }`
        );
      }else{
        let itemData=this.patientVisitDataSet.VISITTOATTACHMENTS.results.find((obj) => {
          return obj.FileID === '';
          });
          return this.sanitizer.bypassSecurityTrustResourceUrl(
          `data:${itemData.AttMimeType};base64, ${
          itemData.AttachmentData
          }`)
      }
    } else if (this.patientVisitDataSet &&   this.patientVisitDataSet.DOCCATTOATTACHMENTS) {
      this.inOutData = {};
      this.inOutData = this.patientVisitDataSet
      if (
        this.patientVisitDataSet.DOCCATTOATTACHMENTS?.results.length > 0 &&
        this.patientVisitDataSet.DOCCATTOATTACHMENTS?.results.find((obj) => {
          return obj.FileID === '';
        }) != null
      )
      {
      if( this.patientVisitDataSet.DOCCATTOATTACHMENTS?.results.find((obj) => {
        return obj.AttMimeType === 'PDF';
      }) != null){
        return this.sanitizer.bypassSecurityTrustResourceUrl(
          `data:application/pdf;base64, ${
            this.patientVisitDataSet.DOCCATTOATTACHMENTS.results.find((obj) => {
              return obj.FileID === '';
            }).AttachmentData
          }`
        );
      }else{
        let itemData=this.patientVisitDataSet.DOCCATTOATTACHMENTS.results.find((obj) => {
          return obj.FileID === '';
          });
          return this.sanitizer.bypassSecurityTrustResourceUrl(
          `data:${itemData.AttMimeType};base64, ${
          itemData.AttachmentData
          }`)
      }
    }    
    else if(this.patientVisitDataSet.DOCCATTOATTACHMENTS?.results.length > 0){ 
     console.log('Attachment with FileID', this.patientVisitDataSet.DOCCATTOATTACHMENTS?.results);
      if(this.patientVisitDataSet.DOCCATTOATTACHMENTS?.results[0].AttMimeType === 'PDF'){
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        `data:application/pdf;base64, ${
          this.patientVisitDataSet.DOCCATTOATTACHMENTS.results[0].AttachmentData
        }`
      );
    }else{
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        `data:${ this.inPatientVisitData.DOCCATTOATTACHMENTS.results[0].AttMimeType}, ${
          this.inPatientVisitData.DOCCATTOATTACHMENTS.results[0].AttachmentData
        }`
      );
    }
  }
    }
    if(this.isInPatientSoap){
      this.inOutData = this.inPatientSoapData;
      this.inOutData['DataType'] = 'in-patient'
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        `data:application/pdf;base64, ${this.soapPdf?.AttachmentData}`
      );
    }
  }
}
