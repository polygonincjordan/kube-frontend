import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { PatientDocumentationService } from '@services/patient-documentation.service';
import { StorageService } from '@services/storage.service';

@Component({
  selector: 'app-morse-fall-scale',
  templateUrl: './morse-fall-scale.component.html',
  styleUrls: ['./morse-fall-scale.component.scss']
})
export class MorseFallScaleComponent implements OnInit {
  MorsefallForm: FormGroup<any>;
  CurrentDateAndTime: Date = new Date();
  realized: string;
  realizedDescription: string;
  ch_mfs_history_falls: number | null; 
  ch_mfs_secondary_diagnosis: number | null; 
  ch_mfs_ambulatory_aid: number | null; 
  ch_mfs_IV_acess: number | null; 
  ch_mfs_gait: number | null; 
  ch_mfs_mental_status  : number | null; 
  totalScore: number;
  description: string;

  morseFallScaleData;

  constructor(private fb: FormBuilder,private patientDocService: PatientDocumentationService, private emergencyService: EmergencyService) {
    this.getDocData();
  }

  getDocData(){
    this.emergencyService.getMFSDoc(this.patientDocService.latestMorseFallScaleData?.Dockey).subscribe((data:any)=>{
      if(data.d){
        this.MorsefallForm.patchValue(data.d);
        this.calculateTotal();
      }
    }, (error)=>{
      console.error(error)
    })
  }

  ngOnInit(): void {
    this.MorsefallForm = this.fb.group({
      HistoryFalls: new FormControl('A'),
      SecondaryDiagnosis: new FormControl('A'),
      AmbulatoryAid: new FormControl('A'),
      IvAccess: new FormControl('A'),
      Gait: new FormControl('A'),
      MentalStatus: new FormControl('A'),
      Comments: new FormControl(''),
      AttendPhy: new FormControl(''),
    })

    this.realized = JSON.parse(
      localStorage.getItem('amc_dev_loggedInUserProfile')
    ).Gpart;
    this.realizedDescription = JSON.parse(
      localStorage.getItem('amc_dev_loggedInUserProfile')
    ).GpartName;

    this.MorsefallForm.controls['AttendPhy'].patchValue(this.realized);

    this.calculateTotal();
    
  }

  getFormData(){
    return this.MorsefallForm.value;
  }

  calculateTotal(){
    const historyFalls = this.MorsefallForm.get('HistoryFalls').value;
    const secondaryDiagnosis = this.MorsefallForm.get('SecondaryDiagnosis').value;
    const ambulatoryAid = this.MorsefallForm.get('AmbulatoryAid').value;
    const ivAccess = this.MorsefallForm.get("IvAccess").value;
    const gait = this.MorsefallForm.get("Gait").value;
    const mentalStatus = this.MorsefallForm.get('MentalStatus').value;

    if(historyFalls === 'A'){
      this.ch_mfs_history_falls = null;
    }else if(historyFalls === '1'){
      this.ch_mfs_history_falls = 25;
    }else if(historyFalls === '0'){
      this.ch_mfs_history_falls = 0;
    }

    if(secondaryDiagnosis === 'A'){
      this.ch_mfs_secondary_diagnosis = null;
    }else if(secondaryDiagnosis === '1'){
      this.ch_mfs_secondary_diagnosis = 15;
    }else if(secondaryDiagnosis === '0'){
      this.ch_mfs_secondary_diagnosis = 0;
    }

    if(ambulatoryAid === 'A'){
      this.ch_mfs_ambulatory_aid = null;
    }else if(ambulatoryAid === 'F'){
      this.ch_mfs_ambulatory_aid = 30;
    }else if(ambulatoryAid === 'C'){
      this.ch_mfs_ambulatory_aid = 15;
    }else if(ambulatoryAid === 'N'){
      this.ch_mfs_ambulatory_aid = 0;
    }

    if(ivAccess === 'A'){
      this.ch_mfs_IV_acess = null;
    }else if(ivAccess === '1'){
      this.ch_mfs_IV_acess = 20;
    }else if(ivAccess === '0'){
      this.ch_mfs_IV_acess = 0;
    }

    if(gait === 'A'){
      this.ch_mfs_gait = null;
    }else if(gait === 'I'){
      this.ch_mfs_gait = 20;
    }else if(gait === 'W'){
      this.ch_mfs_gait = 10;
    }else if(gait === 'N'){
      this.ch_mfs_gait = 0;
    }

    if(mentalStatus === 'A'){
      this.ch_mfs_mental_status = null;
    }else if(mentalStatus === 'F'){
      this.ch_mfs_mental_status = 15;
    }else if(mentalStatus === 'O'){
      this.ch_mfs_mental_status = 0;
    }

    this.totalScore = this.ch_mfs_IV_acess + this.ch_mfs_ambulatory_aid + this.ch_mfs_gait + this.ch_mfs_history_falls + this.ch_mfs_mental_status + this.ch_mfs_secondary_diagnosis;

    if(this.totalScore <= 24){
      this.description = 'Low risk. Basic nursing care.'
    }else if(this.totalScore >= 25 && this.totalScore < 45){
      this.description = 'Moderate risk. Standard fall prevention indicators.'
    }else if(this.totalScore >= 45){
      this.description = 'High risk. High risk fall prevention indicators.'
    }
  }
}
