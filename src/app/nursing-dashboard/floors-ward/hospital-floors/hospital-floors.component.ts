import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'hospital-floors',
  templateUrl: './hospital-floors.component.html',
  styleUrls: ['./hospital-floors.component.scss']
})
export class HospitalFloorsComponent implements OnInit {
  floorsWardsform: FormGroup
  constructor() { }

  ngOnInit(): void {
    this.floorsWardsform = new FormGroup({
      floorsWardsdata: new FormArray([])
    })
    for (let i = 0; i < 10; i++) { this.floorsWardsArray.push(this.floorsWardsGroup()) }
  }

  get floorsWardsArray() {
    return this.floorsWardsform.get('floorsWardsdata') as FormArray
  }

  floorsWardsGroup() {
    return new FormGroup({
      Date: new FormControl('02/05/2023'),
      Time: new FormControl('02:03:21'),
      DeptOu: new FormControl('NEOMDAMC'),
      Attenting: new FormControl('Dr.john Deo'),
      Roomid: new FormControl('Room 321'),
      Bedid: new FormControl('Bed 321'),
      PatientSex: new FormControl('Alkufaji,Qais Kathi Mohammad Kawa(M,89)'),
      Case: new FormControl('215131'),
      Patient: new FormControl('8279'),
      Flags: new FormControl('')
    })
  }
}
