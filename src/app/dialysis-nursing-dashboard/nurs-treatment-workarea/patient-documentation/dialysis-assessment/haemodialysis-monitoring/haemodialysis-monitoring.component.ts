import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { SharedService } from '@services/shared.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'haemodialysis-monitoring',
  templateUrl: './haemodialysis-monitoring.component.html',
  styleUrls: ['./haemodialysis-monitoring.component.scss']
})
export class HaemodialysisMonitoringComponent implements OnInit {
  private subscription: Subscription;
  haemomonitoring: FormGroup<any>;
  hemolineinfection: any;
  constructor(private sharedService: SharedService, private emergencyService: EmergencyService) { }

  ngOnInit(): void {
    this.haemomonitoring = new FormGroup({
      ChronicDone:new FormControl(),
      AcuteDone:new FormControl(),
      InternationalDone:new FormControl(),
    });
  }

  createAssessment() {
    console.log(this.haemomonitoring.value);
  }

}
