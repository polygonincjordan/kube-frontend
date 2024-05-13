import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'dialysis-assessment',
  templateUrl: './dialysis-assessment.component.html',
  styleUrls: ['./dialysis-assessment.component.scss']
})
export class DialysisAssessmentComponent implements OnInit {
  private subscription: Subscription;
  public Haemodialysis: boolean = true;
  public PreDialysis: boolean = false;
  constructor() { }

  ngOnInit(): void {
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  tabPanelNavigation(tabName: any){
    if (tabName && tabName === 'haemodialysis') {
      this.Haemodialysis = true; this.PreDialysis = false;
    } else if (tabName && tabName === 'preDialysis') {
      this.Haemodialysis = false; this.PreDialysis = true;
    }
  }
}
