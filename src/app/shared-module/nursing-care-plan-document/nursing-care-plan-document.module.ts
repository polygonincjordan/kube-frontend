import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NursingCarePlansComponent } from './nursing-care-plans/nursing-care-plans.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NutritionTabComponent } from './nursing-care-plans/nutrition-tab/nutrition-tab.component';
import { DiarrheaTabComponent } from './nursing-care-plans/diarrhea-tab/diarrhea-tab.component';
import { ActivityRestTabComponent } from './nursing-care-plans/activity-rest-tab/activity-rest-tab.component';
import { StressToleranceComponent } from './nursing-care-plans/stress-tolerance/stress-tolerance.component';
import { AcutePainTabComponent } from './nursing-care-plans/acute-pain-tab/acute-pain-tab.component';
import { BleendingTabComponent } from './nursing-care-plans/bleending-tab/bleending-tab.component';
import { TissueIntegrityTabComponent } from './nursing-care-plans/tissue-integrity-tab/tissue-integrity-tab.component';
import { FallRiskTabComponent } from './nursing-care-plans/fall-risk-tab/fall-risk-tab.component';
import { HyperthermiaTabComponent } from './nursing-care-plans/hyperthermia-tab/hyperthermia-tab.component';
import { HypothermiaTabComponent } from './nursing-care-plans/hypothermia-tab/hypothermia-tab.component';
import { AspirationTabComponent } from './nursing-care-plans/aspiration-tab/aspiration-tab.component';
import { InjectionTabComponent } from './nursing-care-plans/injection-tab/injection-tab.component';
import { PatternDisturbanceTabComponent } from './nursing-care-plans/pattern-disturbance-tab/pattern-disturbance-tab.component';
import { PhysicalMobilityTabComponent } from './nursing-care-plans/physical-mobility-tab/physical-mobility-tab.component';
import { BreathingPatternsTabComponent } from './nursing-care-plans/breathing-patterns-tab/breathing-patterns-tab.component';
import { ChestPainTabComponent } from './nursing-care-plans/chest-pain-tab/chest-pain-tab.component';
import { ExchangeDehdrationTabComponent } from './nursing-care-plans/exchange-dehdration-tab/exchange-dehdration-tab.component';
import { NauseaVomatingTabComponent } from './nursing-care-plans/nausea-vomating-tab/nausea-vomating-tab.component';
import { VteRiskTabComponent } from './nursing-care-plans/vte-risk-tab/vte-risk-tab.component';
import { ProtectionDisrhythmiasTabComponent } from './nursing-care-plans/protection-disrhythmias-tab/protection-disrhythmias-tab.component';
import { UnstableBGlucoseTabComponent } from './nursing-care-plans/unstable-b-glucose-tab/unstable-b-glucose-tab.component';
import { InfantFeedingPatternTabComponent } from './nursing-care-plans/infant-feeding-pattern-tab/infant-feeding-pattern-tab.component';
import { ElectrolyteImbalanceTabComponent } from './nursing-care-plans/electrolyte-imbalance-tab/electrolyte-imbalance-tab.component';
import { KnowledgeDeficitTabComponent } from './nursing-care-plans/knowledge-deficit-tab/knowledge-deficit-tab.component';

@NgModule({
  declarations: [NursingCarePlansComponent, NutritionTabComponent, DiarrheaTabComponent, ActivityRestTabComponent, StressToleranceComponent, AcutePainTabComponent, BleendingTabComponent, TissueIntegrityTabComponent, FallRiskTabComponent, HyperthermiaTabComponent, HypothermiaTabComponent, AspirationTabComponent, InjectionTabComponent, PatternDisturbanceTabComponent, PhysicalMobilityTabComponent, BreathingPatternsTabComponent, ChestPainTabComponent, ExchangeDehdrationTabComponent, NauseaVomatingTabComponent, VteRiskTabComponent, ProtectionDisrhythmiasTabComponent, UnstableBGlucoseTabComponent, InfantFeedingPatternTabComponent, ElectrolyteImbalanceTabComponent, KnowledgeDeficitTabComponent],
  exports: [NursingCarePlansComponent,NutritionTabComponent],
  imports: [CommonModule,FormsModule,ReactiveFormsModule],
})
export class NursingCarePlanDocumentModule {}
