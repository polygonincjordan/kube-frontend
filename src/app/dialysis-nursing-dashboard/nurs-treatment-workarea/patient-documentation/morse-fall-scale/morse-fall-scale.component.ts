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

  calculateTotal() {
    const formValues = this.MorsefallForm.value;

    const scores = {
        HistoryFalls: { 'A': null, '1': 25, '0': 0 },
        SecondaryDiagnosis: { 'A': null, '1': 15, '0': 0 },
        AmbulatoryAid: { 'A': null, 'F': 30, 'C': 15, 'N': 0 },
        IvAccess: { 'A': null, '1': 20, '0': 0 },
        Gait: { 'A': null, 'I': 20, 'W': 10, 'N': 0 },
        MentalStatus: { 'A': null, 'F': 15, 'O': 0 }
    };

    Object.keys(scores).forEach(key => {
        const value = formValues[key];
        this['ch_mfs_' + key.toLowerCase()] = scores[key][value];
    });


    this.totalScore = Object.keys(scores).reduce((acc, key) => acc + (scores[key][formValues[key]] || 0), 0);

    if (this.totalScore <= 24) {
        this.description = 'Low risk. Basic nursing care.';
    } else if (this.totalScore < 45) {
        this.description = 'Moderate risk. Standard fall prevention indicators.';
    } else {
        this.description = 'High risk. High risk fall prevention indicators.';
    }
  }

}
