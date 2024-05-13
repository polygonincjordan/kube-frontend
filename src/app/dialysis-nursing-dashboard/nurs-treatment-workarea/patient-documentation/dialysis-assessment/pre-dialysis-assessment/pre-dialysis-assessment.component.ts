import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'pre-dialysis-assessment',
  templateUrl: './pre-dialysis-assessment.component.html',
  styleUrls: ['./pre-dialysis-assessment.component.scss']
})
export class PreDialysisAssessmentComponent implements OnInit {


  constructor() { }

  ngOnInit(): void {
  }
  public Haemodialysis: boolean;
  public PreDialysis: boolean;

  tabPanelNavigation(tabName: any) {
    if (tabName && tabName === 'preDialysis') {
      this.Haemodialysis = false; this.PreDialysis = true;
    } else if (tabName && tabName === 'haemodialysis') {
      this.Haemodialysis = true; this.PreDialysis = false;
    }
  }
}
