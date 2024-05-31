import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-morse-fall-scale',
  templateUrl: './morse-fall-scale.component.html',
  styleUrls: ['./morse-fall-scale.component.scss']
})
export class MorseFallScaleComponent implements OnInit {
  MorsefallForm: FormGroup<any>;
  CurrentDateAndTime: Date = new Date();

  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.MorsefallForm = this.fb.group({
      Dockey: new FormControl(''),
      Einri: new FormControl(''),
      Patnr: new FormControl(''),
      Falnr: new FormControl(''),
      Orgdo: new FormControl(''),
      HistoryFalls: new FormControl(''),
      SecondaryDiagnosis: new FormControl(''),
      AmbulatoryAid: new FormControl(''),
      IvAccess: new FormControl(''),
      Gait: new FormControl(''),
      MentalStatus: new FormControl(''),
      Comments: new FormControl(''),
      AttendPhy: new FormControl(''),
      DocStatus: new FormControl('')
    })
  }

  getFormData(){
    return this.MorsefallForm.value;
  }
}
