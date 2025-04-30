import { Component, Input, OnInit } from '@angular/core';
import { Patient } from '../../services/e-kardex/interfaces/patient';

@Component({
  selector: 'app-pateint-bmi',
  templateUrl: './pateint-bmi.component.html',
  styleUrls: ['./pateint-bmi.component.scss'],
})
export class PateintBmiComponent implements OnInit {
  @Input() patient: Patient = {} as Patient;
  constructor() {}

  ngOnInit(): void {}
}
