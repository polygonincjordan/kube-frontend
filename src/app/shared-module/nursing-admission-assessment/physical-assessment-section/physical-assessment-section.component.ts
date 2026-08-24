import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  capiliaryList,
  chestAppearanceList,
  earsNoseNickDropdownValue,
  lesionsList,
  micturitionList,
  moistureList,
  rhonchiList,
  skinColorList,
  temperatureList,
  urineColorOptions,
} from '../dropdown-value';

@Component({
  selector: 'app-physical-assessment-section',
  templateUrl: './physical-assessment-section.component.html',
  styleUrls: ['./physical-assessment-section.component.scss'],
})
export class PhysicalAssessmentSectionComponent implements OnInit {
  @Input() nursingAdmissionForm: FormGroup;
  selectedTabName: string = 'Gastrontestinal';

  tabList = [
    'Gastrontestinal',
    'Reproductive',
    'Genitourinary',
    'Skin/Integumentary',
    'Neurological',
    'Cardiovascular',
    'Ears/Nose/Throat',
    'Ophthalmology',
    'Respiratory',
  ];

  urineColorOptions = urineColorOptions;
  micturitionList = micturitionList;
  moistureList = moistureList;
  temperatureList = temperatureList;
  lesionsList = lesionsList;
  capiliaryList = capiliaryList;
  skinColorList = skinColorList;
  earsNoseNickDropdownValue = earsNoseNickDropdownValue;
  chestAppearanceList = chestAppearanceList;
  rhonchiList = rhonchiList;

  constructor() {}

  ngOnInit(): void {}

  assessmentTabSelect(tabName: string) {
    this.selectedTabName = tabName;
  }

  isInputDisabled(formControlName: string, value: any): boolean {
    const control = this.nursingAdmissionForm.get(formControlName);
    return control ? control.value != value : false;
  }

  isGeOstomyTypeTxtDisabled(formControlName?: string): boolean {
    if (this.nursingAdmissionForm.get('disabledAllPhy').value) {
      return true;
    }
    return !this.nursingAdmissionForm.get(formControlName).value;
  }

  isDisabled(): boolean {
    return this.nursingAdmissionForm.get('disabledAllPhy')?.value;
  }

  disabledAllValue() {
    this.nursingAdmissionForm.patchValue({
      GgRectalPain: false,
      GgIndigestion: false,
      GbAbsent: false,
      GbPresent: false,
      GbHypoactive: false,
      GbHyperactive: false,
      GaSoft: false,
      GaDistendend: false,
      GaFirm: false,
      GaTenderness: false,
      GeEnema: false,
      GeLaxatives: false,
      GeOstomyType: false,
      GeOstomyTypeTxt: '',
      GeOther: false,
      GeOtherTxt: '',
      RmProstate: false,
      RmLesions: false,
      RmDischarge: false,
      RmScrotal: false,
      RmDescr: '',
      RfPregnant: false,
      RfLmp: null,
      RfDischarge: false,
      RfLesions: false,
      RfItching: false,
      RfPelvic: false,
      RfMenarcheAge: '',
      RfNotReached1: false,
      RfMenopauseAge: '',
      RfNotReached2: false,
      RfBirthCont: false,
      RfBirthContTxt: '',
      RbTenderness: false,
      RbDischarge: false,
      RbSwelling: false,
      RbProsthesis: false,
      RbLumps: false,
      GPainful: false,
      GIncontinence: false,
      GBurning: false,
      GHematuria: false,
      GOliguria: false,
      GDysuria: false, //
      GPolyuria: false,
      GDribbling: false,
      GNocturia: false,
      GRetention: false,
      GStraining: false,
      GUrineColour: '',
      GUrineClarity: '',
      GCatheterType: false,
      GCatheterTypeTxt: '',
      GMicturition: '',
      GOther: false,
      GOtherTxt: '',
      SSkinColor: '',
      SSkinColorTxt: '',
      STemperature: '',
      SMoisture: '',
      SLesions: '',
      SLocation: '',
      NnHeadache: false,
      NnDizziness: false,
      NnNumbness: false,
      NnNumbnessLoc: '',
      NnTingling: false,
      NnTinglingLoc: '',
      NnParalysis: false,
      NnParalysisLoc: '',
      NnTremors: false,
      NnTremorsLoc: '',
      NLevelConscious: '',
      NoPlace: false,
      NoTime: false,
      NoPresent: false,
      NResponsiveness: '',
      CgChestPain: false,
      CgPalpitations: false,
      CgPacemaker: false,
      CgPainCalves: false,
      CpRegular: false,
      CpIrregular: false,
      CpStrong: false,
      CpWeak: false,
      CPedalPulses: '',
      CeYes: false,
      CeNo: false,
      CePitting: false,
      CeNonPitting: false,
      CeLocation: '',
      CNailBed: '',
      CCapillaryRefill: '',
      EeHardHearing: '',
      EePain: '',
      EeDrainage: '',
      EeDeaf: '',
      EnEpistaxis: false,
      EnCongestion: false,
      EnDrainage: false,
      EnType: '',
      EtDysphagia: false,
      EtBleeding: false,
      EtSwollenGlands: false,
      EtSwollenGums: false,
      EtPain: false,
      EtLesions: false,
      EtLocation: '',
      OGlassEye: '',
      ORedness: '',
      OPain: '',
      ODischarge: '',
      OBlind: '',
      OComments: '',
      RChestAppearance: '',
      RbDyspneaRest: false,
      RbDyspneaExertion: false,
      RbNonLabored: false,
      RBbreathSounds: '',
      RRhonchi: '',
      RCough: '',
      RColor: '',
      RAmount: '',
      RTracheostomy: false,
      RTubeSize: '',
      RO2: false,
      RBy: '',
      ROtherTxt: '', //
      RAt: '',
    });
  }
}
