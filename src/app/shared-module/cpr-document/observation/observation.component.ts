import { Component, Input, OnInit } from '@angular/core';
import { dispositionCode, ettArrest } from '../dropdown-values';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-observation',
  templateUrl: './observation.component.html',
  styleUrls: ['./observation.component.scss']
})
export class ObservationComponent implements OnInit {

  dispositionCodeList = dispositionCode;
  ettArrestList = ettArrest;
  @Input() cprForm: FormGroup;

  constructor() { }

  ngOnInit(): void {
  }

}
