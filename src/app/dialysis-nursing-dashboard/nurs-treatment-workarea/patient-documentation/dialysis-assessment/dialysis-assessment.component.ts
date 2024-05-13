import { Component, OnInit, ViewChild } from '@angular/core';
import { DataShareService } from '@services/data-share.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { ActionType, WordType } from '@services/interfaces/common.enum';
import { SharedService } from '@services/shared.service';
import { Subscription } from 'rxjs';
import { HaemodialysisAccessComponent } from './haemodialysis-access/haemodialysis-access.component';

@Component({
  selector: 'dialysis-assessment',
  templateUrl: './dialysis-assessment.component.html',
  styleUrls: ['./dialysis-assessment.component.scss']
})
export class DialysisAssessmentComponent implements OnInit {
  private subscription: Subscription;
  public Haemodialysis: boolean = true;
  public PreDialysis: boolean = false;
  public dockeyValue: any = null;
  private actionTypeSubscription$: Subscription;
  @ViewChild(HaemodialysisAccessComponent) HaemodialysisAccess: HaemodialysisAccessComponent;
  constructor( private dataShareService: DataShareService,private sharedService: SharedService, private emergencyService: EmergencyService,) {
     this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe((data) => {
    if (data != null) {
      if (data.type == ActionType.Update$ && data.isAllow == true && data.value) {
        if (data.value.type == WordType.EditGGCS && data.value.docKey != '') {
          this.dockeyValue = data.value.docKey ? data.value.docKey : null;
          if (this.dockeyValue) {
            // this.getFacePainDetail(data.value.docKey);
          }
        }
      }
      if(data.type == ActionType.Copy$ && data.isAllow == true && data.value){
        if (data.value.type == WordType.CopyFPS && data.value.docKey != '') {
          this.dockeyValue = data.value.docKey ? data.value.docKey : null;
          if (this.dockeyValue) {
            // this.getFacePainDetail(data.value.docKey);
          }
        }
      }
    }
  });}

  ngOnInit(): void {
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    if (this.actionTypeSubscription$) {
      this.actionTypeSubscription$.unsubscribe();
      this.dataShareService.sendActionType(null);
    }
  }

  tabPanelNavigation(tabName: any){
    if (tabName && tabName === 'haemodialysis') {
      this.Haemodialysis = true; this.PreDialysis = false;
    } else if (tabName && tabName === 'preDialysis') {
      this.Haemodialysis = false; this.PreDialysis = true;
    }
  }

  createAssessment(): Promise<any> {
    return new Promise((resolve, reject) => {
    this.HaemodialysisAccess.createAssessment()
    });
  }
}
