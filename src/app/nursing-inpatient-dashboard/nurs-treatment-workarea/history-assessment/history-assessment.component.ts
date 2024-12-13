import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-history-assessment',
  templateUrl: './history-assessment.component.html',
  styleUrls: ['./history-assessment.component.scss']
})
export class HistoryAssessmentComponent implements OnInit {

  activeAllergy: boolean = false;
  activeProgressNotes: boolean = false;
  activePhysicianOrders: boolean = false;
  activeRiskFactor: boolean = false;
  activePastMedical: boolean = false;
  activePastSurgical: boolean = false;
  activeFamilyHistory: boolean = false;
  activeStructuredDoc: boolean = false;
  activeDiagnosis: boolean = false;
  constructor() { }

  ngOnInit(): void {
  }


  activateTabs(tabname) {
    this.activeProgressNotes = false;
    this.activePhysicianOrders = false;
    this.activeAllergy = false;
    this.activeRiskFactor = false;
    this.activePastMedical = false;
    this.activePastSurgical = false;
    this.activeFamilyHistory = false;
    this.activeStructuredDoc = false;
    this.activeDiagnosis = false;
    if (tabname == 'Allergies') {
      this.activeAllergy = true;
      // this.openModalForAllergy(this.allergyModal);
    } else if (tabname == 'RiskFactors') {
      this.activeRiskFactor = true;
      // this.openModalForRisk(this.riskModal);
    } else if (tabname == 'PastMedical') {
      this.activePastMedical = true;
      // this.openModalForPastMedical();
    } else if (tabname == 'PastSurgical') {
      this.activePastSurgical = true;
      // this.openModalForPastSurgical();
    } else if (tabname == 'FamilyHistory') {
      this.activeFamilyHistory = true;
      // this.openModalForFamilyHistory();
    }
  }
}
