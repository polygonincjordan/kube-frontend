import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-nicu-nursing-flow-sheet',
  templateUrl: './nicu-nursing-flow-sheet.component.html',
  styleUrls: ['./nicu-nursing-flow-sheet.component.scss'],
})
export class NicuNursingFlowSheetComponent implements OnInit {
  constructor() {}
  toVitalsArr:any
  amountList = [
    { value: 0, label: 'Large' },
    { value: 1, label: 'Moderate' },
    { value: 2, label: 'Scanty' }
  ];
  
  colorList = [
    { value: 0, label: 'Clear' },
    { value: 1, label: 'White' },
    { value: 2, label: 'Bloody' },
    { value: 3, label: 'Yellowish' }
  ];
  
  consistencyList = [
    { value: 0, label: 'Creamy' },
    { value: 1, label: 'Thick' },
    { value: 2, label: 'Thin' },
    { value: 3, label: 'Viscvalue' }
  ];
  
  siteOfSuctionList = [
    { value: 0, label: 'Oral' },
    { value: 1, label: 'Nasal' },
    { value: 2, label: 'ETT' }
  ];
  
  catheterSizeList = [
    { value: 0, label: '4' },
    { value: 1, label: '6' },
    { value: 2, label: '8' },
    { value: 3, label: '10' },
    { value: 4, label: '12' }
  ];
  cptList = [
    { value: 0, label: 'Vibratorers' },
    { value: 1, label: 'Taping' }
  ];
  
  oximeterSiteList = [
    { value: 0, label: 'RLE' },
    { value: 1, label: 'LLE' },
    { value: 2, label: 'LUE' },
    { value: 3, label: 'RUE' }
  ];
  
  respirationsList = [
    { value: 0, label: 'Crying' },
    { value: 1, label: 'Regular' },
    { value: 2, label: 'Grunting' },
    { value: 3, label: 'Irregular' },
    { value: 4, label: 'Flarring' },
    { value: 5, label: 'Shallow' },
    { value: 6, label: 'Strvalueor' },
    { value: 7, label: 'Unlabored' },
    { value: 8, label: 'Labored' }
  ];
  
  retractionsList = [
    { value: 0, label: 'Absent' },
    { value: 1, label: 'Severe' },
    { value: 2, label: 'Mild' },
    { value: 3, label: 'Subcostal' },
    { value: 4, label: 'Inter Costal' },
    { value: 5, label: 'Moderate' },
    { value: 6, label: 'Supraclavicular' }
  ];
  soundList = [
    { value: 0, label: 'Absent' },
    { value: 1, label: 'Clear' },
    { value: 2, label: 'Crackles' },
    { value: 3, label: 'Equals' },
    { value: 4, label: 'Expiratory' },
    { value: 5, label: 'Moist' },
    { value: 6, label: 'Air Leak' },
    { value: 7, label: 'Coarse' },
    { value: 8, label: 'Decrease' },
    { value: 9, label: 'Pain/Distant' },
    { value: 10, label: 'Inspiratory' },
    { value: 11, label: 'Wheeze' },
    { value: 12, label: 'Tight' }
  ];
  
  siteList = [
    { value: 0, label: 'RUL' },
    { value: 1, label: 'RML' },
    { value: 2, label: 'RLL' },
    { value: 3, label: 'LUL' },
    { value: 4, label: 'LML' },
    { value: 5, label: 'LLL' }
  ];
  
  sizeList = [
    { value: 0, label: '2' },
    { value: 1, label: '2.5' },
    { value: 2, label: '2.3' },
    { value: 3, label: '3.5' }
  ];
  
  levelList = [
    { value: 0, label: 'Free text' } // Assuming you want free text option
  ];
  
  apneaList = [
    { value: 0, label: 'Yes' },
    { value: 1, label: 'No' },
    { value: 2, label: 'Unknown' },
    { value: 3, label: 'Swallow' }
  ];
  
  colorList2 = [
    { value: 0, label: 'No Change' },
    { value: 1, label: 'Slight Cyanosis' },
    { value: 2, label: 'Cyanotic' },
    { value: 3, label: 'Pale' },
    { value: 4, label: 'Dusky' },
    { value: 5, label: 'Central Cyanosis' },
    { value: 6, label: 'Acrocyanosis' }
  ];
  
  positionList = [
    { value: 0, label: 'None' },
    { value: 1, label: 'Gentle' },
    { value: 2, label: 'Bagging' },
    { value: 3, label: 'Vigorous Stim' },
    { value: 4, label: 'Reposition' },
    { value: 5, label: 'Free Flow' }
  ];
  
  modeList = [
    { value: 0, label: 'SIMV' },
    { value: 1, label: 'IMV' },
    { value: 2, label: 'Nasal CPAP' },
    { value: 3, label: 'Hood O2' },
    { value: 4, label: 'Volume' },
    { value: 5, label: 'HFNC' },
    { value: 6, label: 'HPDV' },
    { value: 7, label: 'ET Tube with CPAP' },
    { value: 8, label: 'Nasal Pharyngeal CPAP' },
    { value: 9, label: 'Nasal Prong' }
  ];
    siteOptions = [
      { value: 'capillary', label: 'Capillary' },
      { value: 'umbilical_artery', label: 'Umbilical Artery' },
      { value: 'temporal_artery', label: 'Temporal Artery' },
      { value: 'posterior_tibial_artery', label: 'Posterior Tibial Artery' },
      { value: 'radial_artery', label: 'Radial Artery' },
      { value: 'dorsalis_pedis_artery', label: 'Dorsalis Pedis Artery' },
      { value: 'umbilical_venous_catheter', label: 'Umbilical Venous Catheter' },
      { value: 'venous', label: 'Venous' },
      { value: 'central_venous_line', label: 'Central Venous Line' }
    ];
  
    chestDrainOptions = [
      { value: 'oscillating', label: 'Oscillating' },
      { value: 'bubbling', label: 'Bubbling' },
      { value: 'not_functioning', label: 'Not Functioning' }
    ];

    siteOptions2 = [
      { value: 'capillary', label: 'Capillary' },
      { value: 'umbilical_artery', label: 'Umbilical Artery' },
      { value: 'temporal_artery', label: 'Temporal Artery' },
      { value: 'posterior_tibial_artery', label: 'Posterior Tibial Artery' },
      { value: 'radial_artery', label: 'Radial Artery' },
      { value: 'dorsalis_pedis_artery', label: 'Dorsalis Pedis Artery' },
      { value: 'umbilical_venous_catheter', label: 'Umbilical Venous Catheter' },
      { value: 'venous', label: 'Venous' },
      { value: 'central_venous_line', label: 'Central Venous Line' }
    ];
  
    methodOptions = [
      { value: 'oscillating', label: 'Oscillating' },
      { value: 'bubbling', label: 'Bubbling' },
      { value: 'not_functioning', label: 'Not Functioning' },
      { value: 'by_mouth', label: 'By Mouth' },
      { value: 'by_nurse', label: 'By Nurse' }
    ];
  
    stoolOptions = [
      { value: 'scant', label: 'Scant' },
      { value: 'small', label: 'Small' },
      { value: 'medium', label: 'Medium' },
      { value: 'large', label: 'Large' }
    ];
  
    yesNoOptions = [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' }
    ];
  
    positioningOptions = [
      { value: 'right', label: 'Right' },
      { value: 'left', label: 'Left' },
      { value: 'prone', label: 'Prone' },
      { value: 'supine', label: 'Supine' },
      { value: 'up', label: 'Up' }
    ];
  
    comfortOptions = [
      { value: 'nested', label: 'Nested' },
      { value: 'hands_to_mouth', label: 'Hands to Mouth' },
      { value: 'isolate_bed_cover', label: 'Isolate/Bed Cover' },
      { value: 'pacifier', label: 'Pacifier' }
    ];
  
    eyesPatchOptions = [
      { value: 0, label: '0 Right' },
      { value: 1, label: '1 Left' },
      { value: 2, label: '2 Prone' },
      { value: 3, label: '3 Supine' },
      { value: 4, label: '4 Upright' }
    ];
  
    residualOptions = [
      { value: 0, label: '0 Oscillating' },
      { value: 1, label: '1 Bubbling' },
      { value: 2, label: '2 Not Functioning' }
    ];

  
    latchOnOptions = [
      { value: 0, label: '0 Good' },
      { value: 1, label: '1 Fair' },
      { value: 2, label: '2 Poor' },
      { value: 3, label: '3 Other' }
    ];
  
    suckingOptions = [
      { value: 0, label: '0 Good' },
      { value: 1, label: '1 Fair' },
      { value: 2, label: '2 Poor' },
      { value: 3, label: '3 Other' }
    ];
  
    swallowOptions = [
      { value: 0, label: '0 Good' },
      { value: 1, label: '1 Fair' },
      { value: 2, label: '2 Poor' },
      { value: 3, label: '3 Other' }
    ];
  
    ivfOptions = [
      { value: 0, label: '0 NS 0.9%' },
      { value: 1, label: '1 GS 0.9%' },
      { value: 2, label: '2 GS 0.45%' },
      { value: 3, label: '3 GS 0.18%' },
      { value: 4, label: '4 DW 5%' },
      { value: 5, label: '5 DW 10%' },
      { value: 6, label: '6 DW 25%' },
      { value: 7, label: '7 DW 7.5%' },
      { value: 8, label: '8 DW 12.5%' },
      { value: 9, label: '9 DW 15%' },
      { value: 10, label: '10 DW 20%' },
      { value: 11, label: '11 Hypertonic Saline' },
      { value: 12, label: '12 Distilled Water' }
    ];
  
    siteOptions3 = [
      { value: 0, label: '0 Cannula' },
      { value: 1, label: '1 A-line' },
      { value: 2, label: '2 UAC' },
      { value: 3, label: '3 UVC' }
    ];
  public scalesList: any[] = [
    {
      ScaleType: 'NIPS (Newborn to 1 years)',
      LastScore: '',
      ScoreDesc: '',
      Datetimee: '',
      value: '1',
      Dockey: '',
    },
    {
      ScaleType: '',
      LastScore: '',
      ScoreDesc: '',
      Datetimee: '',
      value: '2',
      Dockey: '',
    },
    {
      ScaleType: '',
      LastScore: '',
      ScoreDesc: '',
      Datetimee: '',
      value: '3',
      Dockey: '',
    },
  ];
  ngOnInit(): void {}

  activeTab: string = 'enviroTemp'; // Default tab
  activeTab2: string = 'nurseAssessment'; // Default tab
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
  setActiveTab2(tab: string): void {
    this.activeTab2 = tab;
  }
}
