import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdmissionService } from '@services/admission/admission.service';
import { DataShareService } from '@services/data-share.service';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-pediatrics-fall-risk-assessment',
  templateUrl: './pediatrics-fall-risk-assessment.component.html',
  styleUrls: ['./pediatrics-fall-risk-assessment.component.scss']
})
export class PediatricsFallRiskAssessmentComponent implements OnInit {
  modalRef?: BsModalRef;
   public pediatricsForm :FormGroup
  ageOptions = [
    { value: '1', label: '13 year and above' },
    { value: '2', label: '7 to less than 13 years old' },
    { value: '3', label: '3 to less than 7 years old' },
    { value: '4', label: 'Less than 3 years old' }
  ];

  genderOptions = [
    { value: '1', label: 'Male' },
    { value: '2', label: 'Female' }
  ];

  cognitiveOptions = [
    { value: '1', label: 'Oriented to own ability' },
    { value: '2', label: 'Forgets limitations' },
    { value: '3', label: 'Not aware of limitations' }
  ];

  responseOptions = [
    { value: '1', label: 'More than 48 hours / None' },
    { value: '2', label: 'Within 48 hours' },
    { value: '3', label: 'Within 24 hours' }
  ];

  environmentalOptions = [
    { value: '1', label: 'Outpatient area' },
    { value: '2', label: 'Patient placed in bed' },
    { value: '3', label: 'Patient uses assistant' },
    { value: '4', label: 'History of fall' }
  ];
  
  medicationOptions = [
    { value: '1', label: 'Other medications / None' },
    { value: '2', label: 'One of the meds listed' },
    { value: '3', label: 'Multiple usage of sedatives' }
  ];
  
  diagnosisOptions = [
    { value: '1', label: 'Other diagnosis' },
    { value: '2', label: 'Psych/Behavioral disorders' },
    { value: '3', label: 'Alterations in oxygenation' },
    { value: '4', label: 'Neurological diagnosis' }
  ];
  public realized: any;
  public realizedDescription: any;
  public CurrentDateAndTime: Date = new Date();
  constructor(  public modalService: BsModalService ,private formBuilder: FormBuilder, private _route: ActivatedRoute, public storageService: StorageService,public admissionService:AdmissionService,private sharedService: SharedService,private dataShareService:DataShareService) { }

  ngOnInit(): void {
    this.initForm();
  this.realized = this.storageService.getUserProfile().Gpart;
  this.realizedDescription = this.storageService.getUserProfile().GpartName;
  }

  initForm(){
    this.pediatricsForm = this.formBuilder.group({
      Age:[''],
      AgeS:[''],
      Gender:[''],
      GenderS:[''],
      Congative:[''],
      CongativeS:[''],
      response:[''],
      responseS:[''],
      Dignosis:[''],
      DignosisS:[''],
      Environmental:[''],
      EnvironmentalS:[''],
      Medication:[''],
      MedicationS:[''],
      TotalScore:[''],
    })
  }


  calculateTotalScore() {
    const fieldPairs = [
      { key: 'Age', scoreKey: 'AgeS' },
      { key: 'Gender', scoreKey: 'GenderS' },
      { key: 'Congative', scoreKey: 'CongativeS' },
      { key: 'response', scoreKey: 'responseS' },
      { key: 'Dignosis', scoreKey: 'DignosisS' },
      { key: 'Environmental', scoreKey: 'EnvironmentalS' },
      { key: 'Medication', scoreKey: 'MedicationS' },
    ];
  
    let total = 0;
  
    fieldPairs.forEach(({ key, scoreKey }) => {
      const val = this.pediatricsForm.get(key)?.value;
  
      if (val && !isNaN(val)) {
        const score = parseInt(val, 10);
        total += score;
        this.pediatricsForm.get(scoreKey)?.setValue(score);
      } else {
        this.pediatricsForm.get(scoreKey)?.setValue('');
      }
    });
  
    this.pediatricsForm.get('TotalScore')?.setValue(String(total), { emitEvent: false });
  }
  
  


  openModal(template: TemplateRef<any>) {
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-lg' ,
    };
    this.modalRef = this.modalService.show(template, config);
  }
  openModalEnvironmental(template: TemplateRef<any>) {
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-lg' ,
    };
    this.modalRef = this.modalService.show(template, config);
  }
  openModalMedication(template: TemplateRef<any>) {
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-lg' ,
    };
    this.modalRef = this.modalService.show(template, config);
  }
  openModalHigh(template: TemplateRef<any>) {
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-lg' ,
    };
    this.modalRef = this.modalService.show(template, config);
  }

}
