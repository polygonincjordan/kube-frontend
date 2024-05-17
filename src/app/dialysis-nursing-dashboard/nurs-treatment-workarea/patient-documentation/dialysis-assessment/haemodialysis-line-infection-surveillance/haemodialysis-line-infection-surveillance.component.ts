import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'haemodialysis-line-infection-surveillance',
  templateUrl: './haemodialysis-line-infection-surveillance.component.html',
  styleUrls: ['./haemodialysis-line-infection-surveillance.component.scss']
})
export class HaemodialysisLineInfectionSurveillanceComponent implements OnInit {
  isChecked: boolean = false;
  hemolineinfection: FormGroup<any>;
  private subscription: Subscription;
  constructor() { }

  ngOnInit(): void {
    this.hemolineinfection = new FormGroup({
      HaemodialysisLine : new FormControl(),
      OtherTxt : new FormControl(),
      Redness : new FormControl(),
      RednessScore : new FormControl(),
      Swelling : new FormControl(),
      SwellingScore : new FormControl(),
      Exuade : new FormControl(),
      ExuadeScore : new FormControl(),
      Pus : new FormControl(),
      PusScore : new FormControl(),
      TotalScore : new FormControl(),
    });
  }

  toggleTextBox() {
    this.isChecked = !this.isChecked;
  }

  createAssessment() {
    console.log(this.hemolineinfection.value);
  }

}
