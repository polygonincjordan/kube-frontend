import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DataShareService } from '@services/data-share.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { ActionType } from '@services/interfaces/common.enum';
import { PatientDocumentationService } from '@services/patient-documentation.service';
import { StorageService } from '@services/storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ramsay-sedation-scale',
  templateUrl: './ramsay-sedation-scale.component.html',
  styleUrls: ['./ramsay-sedation-scale.component.scss']
})
export class RamsaySedationScaleComponent implements OnInit {

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

  ramsayList = [
    {
      label : 'Not answered',
      value : 0
    },
    {
      label : 'Patient is anxious and agitated and/or restless',
      value : 1
    },
    {
      label : 'Patient is cooperative, oriented and quiet',
      value : 2
    },
    {
      label : 'Patient responds to commands only',
      value : 3
    },
    {
      label : 'Patient exhibits brisk response to light glabellar tap',
      value : 4
    },
    {
      label : 'Patient exhibits a sluggish response to light glabellar tap',
      value : 5
    },
    {
      label : 'Patient exhibits no response',
      value : 6
    },
  ]

  morseFallScaleData;
  private actionTypeSubscription$: Subscription;

  constructor(private fb: FormBuilder,private patientDocService: PatientDocumentationService, private emergencyService: EmergencyService,private dataShareService:DataShareService,private storageService:StorageService) {
    // this.getDocData();
    this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe((data) => {
      if (data != null) {       
        if (data.type == ActionType.Copy$ && data.isAllow == true && data.value) {
           this.getDocData();
        }
      }
    });
  }

  getDocData(){
    this.emergencyService.getMFSDoc(this.patientDocService.latestMorseFallScaleData?.Dockey).subscribe((data:any)=>{
      if(data.d){
        this.MorsefallForm.patchValue(data.d);
      }
    }, (error)=>{
      console.error(error)
    })
  }

  ngOnInit(): void {
    this.MorsefallForm = this.fb.group({
      HistoryFalls: new FormControl('0'),
      Comments: new FormControl(''),
      AttendPhy: new FormControl(''),
    })

    this.realized = this.storageService.getUserProfile().Gpart;
    this.realizedDescription = this.storageService.getUserProfile().GpartName;

    this.MorsefallForm.controls['AttendPhy'].patchValue(this.realized);

    
  }

  getFormData(){
    return this.MorsefallForm.value;
  }

  calculateTotal(value: any) {
      this.description = this.ramsayList[value].label
      this.totalScore = this.ramsayList[value].value
  }


}
