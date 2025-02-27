import { Component, Input, OnInit } from '@angular/core';
import { dispositionCode, ettArrest, observationList } from '../dropdown-values';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-observation',
  templateUrl: './observation.component.html',
  styleUrls: ['./observation.component.scss']
})
export class ObservationComponent implements OnInit {

  dispositionCodeList = dispositionCode;
  observationList = observationList;
  ettArrestList = ettArrest;
  @Input() cprForm: FormGroup;
  tableHeading = ['Time', 'Type', '2 min', '4 min', '6 min', '8 min', '10 min', '12 min', '14 min', '16 min', '18 min', '20 min', '22 min', '24 min', '26 min', '28 min', '30 min', '32 min', '34 min', '36 min', '38 min', '40 min'] 

  constructor() { }

  ngOnInit(): void {
  }

}
