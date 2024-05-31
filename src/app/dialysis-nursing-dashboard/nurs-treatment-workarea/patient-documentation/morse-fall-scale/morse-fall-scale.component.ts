import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { StorageService } from '@services/storage.service';

@Component({
  selector: 'app-morse-fall-scale',
  templateUrl: './morse-fall-scale.component.html',
  styleUrls: ['./morse-fall-scale.component.scss']
})
export class MorseFallScaleComponent implements OnInit {
  MorsefallForm: FormGroup<any>;
  CurrentDateAndTime: Date = new Date();
  userData;

  constructor(private fb: FormBuilder,private storageService: StorageService) {
  }

  ngOnInit(): void {
    this.MorsefallForm = this.fb.group({
      HistoryFalls: new FormControl(''),
      SecondaryDiagnosis: new FormControl(''),
      AmbulatoryAid: new FormControl(''),
      IvAccess: new FormControl(''),
      Gait: new FormControl(''),
      MentalStatus: new FormControl(''),
      Comments: new FormControl(''),
      AttendPhy: new FormControl(''),
    })

    const userData = this.storageService.getLocal('userConfig', false);

    this.userData = userData;
    // console.log(userData);
    this.MorsefallForm.controls['AttendPhy'].patchValue(userData.VMA);
    
  }

  getFormData(){
    return this.MorsefallForm.value;
  }
}
