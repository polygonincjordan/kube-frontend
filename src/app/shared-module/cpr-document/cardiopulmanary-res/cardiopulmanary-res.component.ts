import { Component, Input, OnInit } from '@angular/core';
import { arrest, typeOfArrest } from '../dropdown-values';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-cardiopulmanary-res',
  templateUrl: './cardiopulmanary-res.component.html',
  styleUrls: ['./cardiopulmanary-res.component.scss']
})
export class CardiopulmanaryResComponent implements OnInit {

  typeOfArrest = typeOfArrest;
  arrestList = arrest;

  @Input() cprForm: FormGroup;

  constructor() { }

  ngOnInit(): void {
  }

  toggleValue(controlName: string) {
    const currentValue = this.cprForm.get(controlName)?.value;
    this.cprForm.get(controlName)?.setValue(!currentValue);
  }
  

}
