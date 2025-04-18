import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-post-anesthesia-care-record',
  templateUrl: './post-anesthesia-care-record.component.html',
  styleUrls: ['./post-anesthesia-care-record.component.scss']
})
export class PostAnesthesiaCareRecordComponent implements OnInit {
  tabItems = [
    { label: 'Vital Signs', value: '1' },
    { label: 'Aldrete Score', value: '2' },
    { label: 'Intake/Output', value: '3' },
    { label: 'Post Anaesthesia Complications', value: '4' },
    { label: 'Current Medication', value: '5' }
  ];
  public scalesList: any[] = [
    {
      ScaleType: 'Glasgow Coma Scale',
      LastScore: '',
      ScoreDesc: '',
      Datetimee: '',
      value: '1',
      Dockey: '',
    },
    {
      ScaleType: 'Morse Fall Scale (MFS)',
      LastScore: '',
      ScoreDesc: '',
      Datetimee: '',
      value: '2',
      Dockey: '',
    },
    {
      ScaleType: 'Braden scale for predicting pressure ulcers',
      LastScore: '',
      ScoreDesc: '',
      Datetimee: '',
      value: '3',
      Dockey: '',
    },
  ];
  vitalSigns = [
    { value: 0, label: 'Heart Rate/mt' },
    { value: 1, label: 'Respirations/mt' },
    { value: 2, label: 'O2 Saturation' },
    { value: 3, label: 'Blood Pressure' },
    { value: 4, label: 'Mode of Ventilation' },
    { value: 5, label: 'Compressions' },
    { value: 6, label: 'Atropine' },
    { value: 7, label: 'Adrenaline' },
    { value: 8, label: 'Sodium Bicarbonate' },
    { value: 9, label: 'Calcium Gluconate' },
    { value: 10, label: 'Xylocaine Bolus' },
    { value: 11, label: 'Infusion' },
    { value: 12, label: 'Amiodarone' },
    { value: 13, label: 'D/C Shock Jolues' },
    { value: 14, label: 'Others' },
    { value: 15, label: 'Pain Score' },
    { value: 16, label: 'Temperature' },
    { value: 17, label: 'Nausea and Vomiting' },
    { value: 18, label: 'Level of Consciousness' }
  ];
  activeTab: string = '1'; // Default tab
  otherChecked = false
  otherChecked1 = false
  constructor() { }

  ngOnInit(): void {
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

}
