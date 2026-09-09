import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.css']
})
export class OrderDetailsComponent implements OnInit {  
    @ViewChild('erradpdfmodal') erradpdfmodal: TemplateRef<HTMLDivElement>;
    patnr: any;
    einri: any;
    patientLabHistory: any;
    patientRadHistory:any;
    activeLabHistory: any=[];
    activeRadHistory: any=[];
    activeLabForm:FormGroup;
    activeLabFormItems: FormArray;
    completedLabForm:FormGroup;
    completedLabFormItems: FormArray;
    completedLabHistory: any=[];
    activeRadForm:FormGroup;
    activeRadFormItems: FormArray;
    completedRadForm:FormGroup;
    completedRadFormItems: FormArray;
    completedRadHistory: any=[];
    completedMedHistory: any=[];
    notCompletedMedHistory: any=[];
    completedMedForm:FormGroup;
    completedMedFormItems: FormArray;
    notCompletedMedForm:FormGroup;
    notCompletedMedFormItems: FormArray;
    pdfUrl: any;
    modalRef: BsModalRef;
    patientMedNotCompletedHistory: any;
    patientMedCompletedHistory: any;
    constructor(private route: ActivatedRoute,public emergencyService:EmergencyService,private formBuilder: FormBuilder,private modalService: BsModalService,private sanitizer: DomSanitizer) {
      this.activeLabForm = this.formBuilder.group({
        activeLabFormItems: new FormArray([]),
      });
      this.completedLabForm = this.formBuilder.group({
        completedLabFormItems: new FormArray([]),
      });
      this.activeRadForm = this.formBuilder.group({
        activeRadFormItems: new FormArray([]),
      });
      this.completedRadForm = this.formBuilder.group({
        completedRadFormItems: new FormArray([]),
      });
      this.completedMedForm = this.formBuilder.group({
        completedMedFormItems: new FormArray([]),
      });
      this.notCompletedMedForm = this.formBuilder.group({
        notCompletedMedFormItems: new FormArray([]),
      });
      this.route.queryParams.subscribe((params) => {
        this.patnr = params.patnr;
        this.einri = params.einri;
      });
     }
  
    ngOnInit() {
      this.getPatientLabHistory();
      this.getPatientRadHistory();
      this.getMedCompletedHistory();
      this.getMedNotCompletedHistory();
    }
    addItemForActiveLab(element): void {
      this.activeLabFormItems = this.activeLabForm.get('activeLabFormItems') as FormArray;
      this.activeLabFormItems.push(this.showActiveLabDetails(element));
    }
    addItemForCompletedLab(element): void {
      this.completedLabFormItems = this.completedLabForm.get('completedLabFormItems') as FormArray;
      this.completedLabFormItems.push(this.showCompletedLabDetails(element));
    }
    addItemForCompletedMed(element): void {
      this.completedMedFormItems = this.completedLabForm.get('completedMedFormItems') as FormArray;
      this.completedLabFormItems.push(this.showCompletedMedDetails(element));
    }
    addItemForNotCompletedMed(element): void {
      this.notCompletedMedFormItems = this.notCompletedMedForm.get('notCompletedMedFormItems') as FormArray;
      this.completedLabFormItems.push(this.showNotCompletedMedDetails(element));
    }
    showActiveLabDetails(element?): FormGroup {
      if (element) {
        return this.formBuilder.group({
          Leitxt: [element.Leitxt],
          Leistung: [element.Leistung],
          Ebgdt: [element.Ebgdt],
          Ebzt: [element.Ebzt],
          Mode: [''],
          isChecked:[false],
        }
        );
      }
    }
    showCompletedLabDetails(element?): FormGroup {
      if (element) {
        return this.formBuilder.group({
          Leitxt: [element.Leitxt],
          Leistung: [element.Leistung],
          Ebgdt: [element.Ebgdt],
          Ebzt: [element.Ebzt],
          Mode: [''],
          isChecked:[false],
        }
        );
      }
    }
    addItemForActiveRad(element): void {
      this.activeRadFormItems = this.activeRadForm.get('activeRadFormItems') as FormArray;
      this.activeRadFormItems.push(this.showActiveRadDetails(element));
    }
    addItemForCompletedRad(element): void {
      this.completedRadFormItems = this.completedRadForm.get('completedRadFormItems') as FormArray;
      this.completedRadFormItems.push(this.showCompletedRadDetails(element));
    }
    showActiveRadDetails(element?): FormGroup {
      if (element) {
        return this.formBuilder.group({
          Ktxt1: [element.Ktxt1],
          Lnrls: [element.Lnrls],
          Edate: [element.Edate],
          Etime: [element.Etime],
          Mode: [''],
          isChecked:[false],
        }
        );
      }
    }
    showCompletedRadDetails(element?): FormGroup {
      if (element) {
        return this.formBuilder.group({
          Ktxt1: [element.Ktxt1],
          Lnrls: [''],
          Edate: [element.Edate],
          Etime: [element.Etime],
          Mode: [''],
          isChecked:[false],
        }
        );
      }
    }
    showCompletedMedDetails(element?): FormGroup {
      if (element) {
        return this.formBuilder.group({
          Motx : [element.Motx],
          Dose : [element.Dose],
          DoseUnit : [element.DoseUnit],
          Cycle : [element.Cycle],
          Duration : [element.Duration],
          DurationUnit : [element.DurationUnit],
          Movdf : [element.Movdf],
          Movtf : [element.Movtf],
  
        }
        );
      }
    }
    showNotCompletedMedDetails(element?): FormGroup {
      if (element) {
        return this.formBuilder.group({
          Motx : [element.Motx],
          Dose : [element.Dose],
          DoseUnit : [element.DoseUnit],
          Cycle : [element.Cycle],
          Duration : [element.Duration],
          DurationUnit : [element.DurationUnit],
          Movdf : [element.Movdf],
          Movtf : [element.Movtf],
  
        }
        );
      }
    }
    getPatientLabHistory() {
      const json = {
        einri:this.einri,
        patnr:this.patnr
      }
      this.emergencyService.getPatientLabHistory(json).subscribe(
        (_success: any) => {
         this.patientLabHistory = _success.d.results;
         const collapseActiveLabShow = document.getElementById('collapseActive')
         collapseActiveLabShow.classList.add('show');
         const collapseCompLabShow = document.getElementById('collapseCompleted')
         collapseCompLabShow.classList.add('show');
         this.checkForStatus();
        },
        (_error: any) => {}
      );
    }
    checkForStatus(){
      this.patientLabHistory.forEach(element => {
        element["Ebgdt"] = new Date(this.getDate(element.Ebgdt));
        element["Ebzt"] = this.getTime(element.Ebzt);
        if (element.ZzresultStatusText == 'Not done') {
          this.activeLabHistory.push(element);
          this.addItemForActiveLab(element);
        }else{
          this.completedLabHistory.push(element); 
          this.addItemForCompletedLab(element);
        }
        
      });
    }
    getPatientRadHistory() {
      const json = {
        einri:this.einri,
        patnr:this.patnr
      }
      this.emergencyService.getPatientRadHistory(json).subscribe(
        (_success: any) => {
         this.patientRadHistory = _success.d.results;
         this.checkForStatusForRad();
        },
        (_error: any) => {}
      );
    }
    checkForStatusForRad(){
      this.patientRadHistory.forEach(element => {
        element["Edate"] = new Date(this.getDate(element.Edate));
        element["Etime"] = this.getTime(element.Etime);
        if (element.StatusTxt == 'Ready') {
          this.completedRadHistory.push(element); 
          this.addItemForCompletedRad(element);
        }else{
          this.activeRadHistory.push(element);
          this.addItemForActiveRad(element);
        }
        
      });
    }
    getMedCompletedHistory() {
      const json = {
        einri:this.einri,
        patnr:this.patnr
      }
      this.emergencyService.getMedCompletedHistory(json).subscribe(
        (_success: any) => {
         this.patientMedCompletedHistory = _success.d.results;
         this.patientMedCompletedHistory.forEach(element => {
          element["Movdf"] = new Date(this.getDate(element.Movdf));
          element["Movtf"] = this.getTime(element.Movtf);
          this.completedMedHistory.push(element); 
            this.addItemForCompletedMed(element);  
        });
        },
        (_error: any) => {}
      );
    }
    getMedNotCompletedHistory() {
      const json = {
        einri:this.einri,
        patnr:this.patnr
      }
      this.emergencyService.getMedNotCompletedHistory(json).subscribe(
        (_success: any) => {
         this.patientMedNotCompletedHistory = _success.d.results;
         this.patientMedNotCompletedHistory.forEach(element => {
          element["Movdf"] = new Date(this.getDate(element.Movdf));
          element["Movtf"] = this.getTime(element.Movtf);
          this.notCompletedMedHistory.push(element); 
            this.addItemForNotCompletedMed(element);  
        });
        },
        (_error: any) => {}
      );
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
        return str;
      }
    }
    openRadPdf(index){
      const json = {
        Dockey:this.patientRadHistory[index].Dockey
      }
      this.emergencyService.getErRadPdf(json).subscribe(
        (_success: any) => {
          this.pdfUrl=this.sanitizer.bypassSecurityTrustResourceUrl(_success.d.Url);
          const config: ModalOptions = { class: 'modal-dialog-centered modal-lg' };
      this.modalRef = this.modalService.show(this.erradpdfmodal,config);
        },
        (_error: any) => {
          Swal.fire({
            text: 'No PDF document found',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      );
     
    }
   
  }
