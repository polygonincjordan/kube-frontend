import { Component, Input, OnInit } from '@angular/core';
import { ettArrest, sitesList, unresponsive, ventilationByList } from '../dropdown-values';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-condition-patient',
  templateUrl: './condition-patient.component.html',
  styleUrls: ['./condition-patient.component.scss']
})
export class ConditionPatientComponent implements OnInit {

  unResponseList = unresponsive;
  sitesList = sitesList;
  ettArrestList = ettArrest;
  VentilationList = ventilationByList;
    @Input() cprForm: FormGroup;
  
  constructor() { }

  ngOnInit(): void {
  }

}
