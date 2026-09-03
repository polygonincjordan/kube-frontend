import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { MergedPatientNoticeService } from '@services/merged-patient-notice.service';

@Component({
  selector: 'app-patient-search',
  templateUrl: './patient-search.component.html',
  styleUrls: ['./patient-search.component.scss']
})
export class PatientSearchComponent implements OnInit {
  @ViewChild('patientSearchModal', { static: true }) patientSearchModal: TemplateRef<any>;
  @Output() sendToERhistory = new EventEmitter<any>();
  modalRef: BsModalRef;
  modalRefForList: BsModalRef;
  form: FormGroup;
  patientSearchData: any;
  searchString!: string;
  constructor( private modalService: BsModalService,private formBuilder: FormBuilder,private emergencyService:EmergencyService,private mergedPatientNotice: MergedPatientNoticeService) { 
    this.form = this.formBuilder.group({
      dob: [''],
      mrn: [''],
      firstName: [''],
      lastName: [''],
      telephone: [''],
    });
  }

  ngOnInit() {
  }
  openModalForPatient(){
    this.form.reset();
    const config: ModalOptions = { class: 'modal-dialog-centered' };
    this.modalRef = this.modalService.show(this.patientSearchModal, config);
    this.modalRef.onHide.subscribe((reason: string | any) => {
      if (reason === 'backdrop-click') {
        this.form.reset();
      }
    });
  }
  openModalForPatientList(template){
    this.modalRef.hide();
    this.form.reset();
    this.searchString='';
    const config: ModalOptions = { class: 'modal-dialog-centered modal-xl' };
    this.modalRefForList = this.modalService.show(template, config);
    this.modalRefForList.onHide.subscribe((reason: string | any) => {
      if (reason === 'backdrop-click') {
        this.searchString='';
      }
    });
  }
  patientSearchByField(template, mrnOverride?: string){
    // The merged-patient redirect searches the MRN SAP returned; the form
    // field shows it without padding.
    const patnr = mrnOverride ?? this.form.controls.mrn.value;
    const json = {
      Patnr:patnr,
      Vname:this.form.controls.firstName.value,
      Nname:this.form.controls.lastName.value,
      Telnr:this.form.controls.telephone.value
    }
    this.emergencyService.DialysisPatientSearch(json).subscribe(
      (_success: any) => {
        this.openModalForPatientList(template);
        this.patientSearchData = _success.d.results;
        this.patientSearchData.forEach(element => {
          element["isVisible"] = true;
        });
      },
      (_error: any) => {
        // A merged MRN fails the search but is a redirect, not a dead end: SAP
        // names the surviving record, so offer it instead of failing silently.
        this.mergedPatientNotice.handle(_error, (activeMrn, displayMrn) => {
          // Clear the criteria that belonged to the merged record; they would
          // wrongly narrow the search for the surviving patient.
          this.form.patchValue({
            mrn: displayMrn,
            firstName: '',
            lastName: '',
            dob: '',
            telephone: '',
          });
          this.patientSearchByField(template, activeMrn);
        });
      }
    );
  }
  selectedVisitDetailsData(visitdata){
    const json = {
      Patnr:visitdata.Patnr,
      Einri:visitdata.Einri,
      Falnr:visitdata.Falnr,
      Lfdnr:visitdata.Lfdnr
    }
    //this.storageService.setCheckinData(data);
    this.modalRefForList.hide();
    this.sendToERhistory.emit(json);
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
  showHideList(actionRow,index){
    if (actionRow.isVisible) {
      this.patientSearchData[index].isVisible = false;
    }else{
      this.patientSearchData[index].isVisible = true;
    }
  }
}
