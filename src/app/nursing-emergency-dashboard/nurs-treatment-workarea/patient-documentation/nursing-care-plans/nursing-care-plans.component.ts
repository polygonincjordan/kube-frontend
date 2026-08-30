import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-nursing-care-plans',
  templateUrl: './nursing-care-plans.component.html',
  styleUrls: ['./nursing-care-plans.component.scss'],
})
export class NursingCarePlansComponent implements OnInit {
  tabLabelList = [
    'Nutrition',
    'Elimination & Exchange; Diarrhea',
    'Activity / Rest',
    'Coping / Stress Tolerance',
    'Comfort; Acute Pain',
    'Safety / Protection; Bleeding',
    'Safety / Protection; Tissue Integrity',
    'Safety / Protection; Fall Risk',
    'Safety / Protection; Hyperthermia',
    'Safety / Protection; Hypothermia',
    'Safety / Protection; Aspiration',
    'Safety / Protection; Injection',
    'Activity/Rest; Sleep Pattern Disturbance',
    'Activity/Rest; Impaired Physical Mobility',
    'Activity/Rest; Inffective Breathing Patterns',
    'Comfort; Chest Pain',
    'Elimination & Exchange; Dehdration',
    'Elimination & Exchange; Nausea & Vomating',
    'Safety / Protection; VTE Risk',
    'Safety / Protection; Disrhythmias',
    'Safety / Protection; Unstable B.Glucose',
    'Nutrition; Ineffecive Infant Feeding Pattern',
    'Nutrition; Electrolyte Imbalance',
    'Perception / Cognition; Knowledge Deficit',
  ];
  selectedTabName: string = 'Nutrition';

  constructor() {}

  ngOnInit(): void {}

  switchTabs(tabName: string) {
    this.selectedTabName = tabName;
  }
}
