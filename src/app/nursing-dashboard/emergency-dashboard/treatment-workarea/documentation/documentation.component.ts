import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { ErPhysicianComponent } from './er-physician/er-physician.component';

@Component({
  selector: 'app-documentation',
  templateUrl: './documentation.component.html',
  styleUrls: ['./documentation.component.css']
})
export class DocumentationComponent implements OnInit {
  @ViewChild(ErPhysicianComponent) phyComp:ErPhysicianComponent;
  @ViewChild('releasepdfmodal') releasepdfmodal: TemplateRef<HTMLDivElement>;
  modalRef: BsModalRef;
  phyAssess=false;
  nursAssess=false;
  patienteducation=false;
  fallrisk=false;
  functional=false;
  nutritional=false;
  phyDocList=[];
  latestDocList=[];
  createDate: any;
  pdfUrl: any;
  constructor(private modalService: BsModalService,private emergencyService:EmergencyService,private storageService:StorageService,private route: ActivatedRoute,private sanitizer: DomSanitizer) {
    this.route.queryParams.subscribe((params) => {
      this.storageService.setEinri(params['einri']);
      this.storageService.setFalnr(params['falnr']);
      this.storageService.setLfdnr(params['lfdnr']);
      this.storageService.setPatnr(params['patnr']);
    });
   }

  ngOnInit() {
    this.getLatestAssessment();
    this.getPhyAssessment();
  }
  openPastHistory(template: TemplateRef<any>){
    const config: ModalOptions = { class: 'modal-dialog-centered modal-lg pastdochistory' };
    this.modalRef = this.modalService.show(template,config);
  }
  selectAssessment(name,status){
    if (name=='nursing') {
      this.nursAssess = true;
      this.phyAssess = false;
    }else if(name == 'phy'){
      if (status !=undefined) {
        if (status.StatusTxt == 'Released') {
          this.openReleasePdf(status.ZdocNr);
        }else{
          this.phyAssess = true;
          this.nursAssess = false;
        }
      }else{
        this.phyAssess = true;
          this.nursAssess = false;
      }


    }
  }
  selectNursAssessment(name){
   if (name == 'patienteducation') {
    this.patienteducation = true;
    this.fallrisk = false;
    this.functional = false;
    this.nutritional = false;
   }else if(name == 'fallrisk'){
    this.fallrisk = true;
    this.patienteducation = false;
    this.functional = false;
    this.nutritional = false;
   }else if(name =='functional'){
    this.functional = true;
    this.patienteducation = false;
    this.fallrisk = false;
    this.nutritional = false;
   }else if(name == 'nutritional'){
    this.nutritional = true;
    this.functional = false;
    this.patienteducation = false;
    this.fallrisk = false;
   }
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
  getLatestAssessment() {
    const json = {
      Einri:this.storageService.einri,
      Falnr:this.storageService.falnr,
      Patnr:this.storageService.patnr,
      Lfdnr:this.storageService.lfdnr
    }
    this.emergencyService.getLatestAssessment(json).subscribe(
      (_success: any) => {
       this.latestDocList = _success.d.results;
      },
      (_error: any) => {}
    );
  }
  getPhyAssessment() {
    const json = {
      Einri:this.storageService.einri,
      Falnr:this.storageService.falnr,
    }
    this.emergencyService.getPhyAssessment(json).subscribe(
      (_success: any) => {
       this.phyDocList = _success.d.results;
      },
      (_error: any) => {}
    );
  }
  async create(){
    (await this.phyComp.createPhyDoc()).subscribe((res:any)=>{
      Swal.fire({
        text: "Document is created successfully",
        icon: 'success',
        confirmButtonText: 'Ok',
        customClass: 'myalertpopup'
      })
      this.phyComp.resetAll();
      this.refresh();
   },(_error: any) => {});
  }
  async update(){
    (await this.phyComp.updatePhyDoc()).subscribe((res:any)=>{
      Swal.fire({
        text: "Document is updated successfully",
        icon: 'success',
        confirmButtonText: 'Ok',
        customClass: 'myalertpopup'
      })
      this.phyComp.resetAll();
      this.refresh();
   },(_error: any) => {});
  }
  async release(){
    (await this.phyComp.releasePhyDoc()).subscribe((res:any)=>{
      Swal.fire({
        text: "Document is released successfully",
        icon: 'success',
        confirmButtonText: 'Ok',
        customClass: 'myalertpopup'
      })
      this.phyComp.resetAll();
      this.refresh();
   },(_error: any) => {});
  }
   async delete(){
    Swal.fire({
      title: 'Confirm',
      text: 'Do you want to delete?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: 'myalertpopup'
    }).then(async (result) => {
      if (result.value) {
        (await this.phyComp.deletePhyAssessment()).subscribe(
          (_success: any) => {
            Swal.fire({
              text: "Document is deleted successfully",
              icon: 'success',
              confirmButtonText: 'Ok',
              customClass: 'myalertpopup'
            })
            this.phyComp.resetAll();
            this.refresh();
          },
          (_error: any) => {}
        );
      }
    });
  }
  openReleasePdf(id){
  const config: ModalOptions = {
    class: 'modal-dialog-centered modal-lg',
  };
  this.modalRef = this.modalService.show(this.releasepdfmodal, config);
  this.getReleasedDoc(id);
}
getReleasedDoc(id){
  const json = {
    ZdocNr:id
  }
  this.emergencyService.getReleasedPdf(json).subscribe(
    (_success: any) => {
      if (_success) {
      this.pdfUrl=this.sanitizer.bypassSecurityTrustResourceUrl('data:application/pdf;base64,'+ _success.d.AttachmentData);
      const config: ModalOptions = { class: 'modal-dialog-centered modal-lg' };
   }
    },
    (_error: any) => {}
  );
}
refresh(){
  this.getLatestAssessment();
  this.getPhyAssessment();
  this.phyAssess=false;
  this.nursAssess=false;
}
}
