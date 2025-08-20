import { DatePipe } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DataShareService } from '@services/data-share.service';
import { FacePaingScaleType } from '@services/e-kardex/interfaces/documents.interface';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { ActionType, WordType } from '@services/interfaces/common.enum';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { Subscription } from 'rxjs';
import Painterro from 'painterro';
import { BsDaterangepickerConfig } from 'ngx-bootstrap/datepicker';
import { PainLocationComponent } from './pain-location/pain-location.component';
import {
  FacePainResponse,
  NonMedicationCheckBox,
  ReAssessmentInterventions,
  ReAssessmentPainOnset,
  ReAssessmentPainPattern,
  ReAssessmentPainRadi,
  activityList,
  consolabilityList,
  cryList,
  faceList,
  flowSheetInfusion,
  flowSheetSedation,
  flowSheetSideEffects,
  hiddenTools,
  legList,
  painScoreList,
  sedationList,
} from './pain-assissment-dropdown-list/dropdown-value';

@Component({
  selector: 'app-pain-assessment-nur-emr',
  templateUrl: './pain-assessment-nur-emr.component.html',
  styleUrls: ['./pain-assessment-nur-emr.component.scss'],
})
export class PainAssessmentNurEmrComponent implements OnInit, OnDestroy {
  @ViewChild('imageEditorPainLocation')
  imageEditorPainLocation: PainLocationComponent;

  painAssessmentForm: FormGroup;
  private subscription: Subscription;
  dateRange: Date[];
  isFacePain: boolean = true;
  isNumericRating: boolean = false;
  isFlacc: boolean = false;
  isNips: boolean = false;
  isComatosePatient: boolean = false;
  isSedation: boolean = false;
  isReAssessment: boolean = false;
  isPainLocation: boolean = false;
  isFlowSheet: boolean = false;
  paniScoreValue = null;

  public FacePainResponse: FacePaingScaleType[] = FacePainResponse;
  public faceList = faceList;
  public legList = legList;
  public cryList = cryList;
  public consolabilityList = consolabilityList;
  public painScoreList = painScoreList;
  public NonMedicationCheckBox = NonMedicationCheckBox;
  public sedationList = sedationList;
  public ReAssessmentInterventions = ReAssessmentInterventions;
  public ReAssessmentPainRadi = ReAssessmentPainRadi;
  public ReAssessmentPainPattern = ReAssessmentPainPattern;
  public ReAssessmentPainOnset = ReAssessmentPainOnset;
  public flowSheetInfusion = flowSheetInfusion;
  public flowSheetSedation = flowSheetSedation;
  public flowSheetSideEffects = flowSheetSideEffects;
  public hiddenTools: any = hiddenTools;
  public activityList = activityList;

  public toolbarPosition: any = 'top';
  public defaultImage: any = 'assets/img/pain-location-area.png';

  public dockeyValue: any = null;
  public totalScore: any = '0';
  public facePainDescription: string = 'No hurt';
  reAssessmentTableList: any = [];
  characterConcate: any = [];
  NoMedicationConcate: any = [];
  userProfile: any;
  flowSheetAssessmentList: any = [];
  otherConcate: any = [];
  bsConfig: any;
  private actionTypeSubscription$: Subscription;
  docKey: any;
  documentType: string;

  constructor(
    private formBuilder: FormBuilder,
    private storageService: StorageService,
    private datePipe: DatePipe,
    private emergencyService: EmergencyService,
    private sharedService: SharedService,
    private dataShareService: DataShareService
  ) {
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-blue', dateInputFormat: 'YYYY-MM-DD' }
    );
  }

  ngOnInit(): void {
    this.initForm();
    this.userProfile = this.storageService.getUserProfile();
    this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe(
      (data) => {
        if (data != null) {
          console.log(data, "data.type");
          this.documentType = data.type;
          if (data.type == ActionType.Add$ && data.value == '') {
            this.docKey = data.value.Dockey;
          }
          if (data.type == ActionType.Update$ && data.value) {
            if (data.value.type == WordType.EditBS && data.value.docKey != '') {
    
              this.dockeyValue = data.value.docKey ? data.value.docKey : null;
              if (this.dockeyValue) {
                this.getPainAssessment(data.value.docKey);
              }
            }
            this.docKey = data.value.docKey;
          }
          if (data.type == ActionType.Copy$ && data.value) {
            this.docKey = data.value.docKey;
            this.getPainAssessment(data.value.docKey);
          }
        } else if (data.type == ActionType.Copy$ && data.value) {
          this.docKey = data.value.docKey;
          this.getPainAssessment(data.value.docKey);
        } else {
          // for after code
        }
      }
    );
    this.getPABackImage();
  }

  getPABackImage() {
    this.emergencyService.getPABackGroundImage(this.storageService.einri).subscribe((elemnet: any) =>{
      this.defaultImage = `data:image/png;base64,${elemnet?.d?.Image64}`;
    })
  }

  getPainAssessment(dockey?: any) {
    this.subscription = this.emergencyService
      .getPainAssesmentDetails(dockey).subscribe({
        next: (data: any) => {
          this.painAssessmentForm.patchValue(data.d.results[0]);
          this.painAssessmentForm.patchValue({
            FloDate: this.getDate(data?.d?.results[0]?.FloDate),
            FloTime: this.getTime(data?.d?.results[0]?.FloTime),
            PlDate: this.getDate(data?.d?.results[0]?.PlDate),
            PlTime: this.getTime(data?.d?.results[0]?.PlTime),
          });
          if(data?.d?.results[0].TOPAINLOGS?.results.length) {
            data?.d?.results[0].TOPAINLOGS?.results.forEach((element) =>{
              element.PlDate = this.getDate(element?.PlDate),
              element.PlTime = this.getTime(element?.PlTime)
            })
          }
          if(data?.d?.results[0].TOFLOWSHEET?.results?.length) {
            data?.d?.results[0].TOFLOWSHEET?.results.forEach((element) =>{
              element.FloDate = this.getDate(element?.FloDate),
              element.FloTime = this.getTime(element?.FloTime)
            })
          }
          this.reAssessmentTableList = data?.d?.results[0].TOPAINLOGS?.results || [];
          this.flowSheetAssessmentList = data?.d?.results[0].TOFLOWSHEET?.results || [];
        },
        error: (err: any) => {
          this.sharedService.waringSwallModel(`Error ${err}`);
          this.sharedService.waringSwallModel(
            `POST Error at Nurse Endorsment : ${err}`
          );
        }
      });
  }

  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }
  getTime(value) {
    if (value) {
      var str = value;
      var str = str.replace(/[PT]/g, '');
      var str = str.replace(/[H]/g, ':');
      var str = str.replace(/[M]/g, ':');
      var str = str.replace(/[S]/g, '');
      return str;
    }
  }

  initForm() {
    let currentTime = this.datePipe.transform(new Date(), 'hh:mm:ss');
    this.painAssessmentForm = this.formBuilder.group({
      Dockey: '',
      Dtid: new FormControl('ZMED_PAIN'),
      Einri: new FormControl(this.storageService.einri),
      Patnr: new FormControl(this.storageService.patnr),
      Falnr: new FormControl(this.storageService.falnr),
      Lfdnr: new FormControl(this.storageService.lfdnr),
      Orgdo: new FormControl('F21IUAMC'),
      FpNa: new FormControl(false),
      FpPainScale: new FormControl(''),
      FpTotalScore: new FormControl(''),
      FpTotalScoreTxt: new FormControl(''),
      NrsNa: new FormControl(false),
      NrsPainScore: new FormControl(''),
      NrsTotalScore: new FormControl(''),
      NrsTotalScoreTxt: new FormControl(''),
      FlNa: new FormControl(false),
      FlFace: new FormControl(''),
      FlLeg: new FormControl(''),
      FlActivity: new FormControl(''),
      FlCry: new FormControl(''),
      FlConsolability: new FormControl(''),
      FlScore: new FormControl(''),
      FlScoreTxt: new FormControl(''),
      NiFacial: new FormControl(''),
      NiCry: new FormControl(''),
      NiBreathing: new FormControl(''),
      NiArms: new FormControl(''),
      NiLegs: new FormControl(''),
      NiArousal: new FormControl(''),
      NiTotalScore: new FormControl(''),
      NiTotalScoreTxt: new FormControl(''),
      ComNoSigns: new FormControl(false),
      ComIrIntermittent: new FormControl(false),
      ComIrActivity: new FormControl(false),
      ComIrFrowning: new FormControl(false),
      ComIrMildly: new FormControl(false),
      ComIrArousability: new FormControl(false),
      ComIrUnexplained: new FormControl(false),
      ComPaLoudCry: new FormControl(false),
      ComPaRefuses: new FormControl(false),
      ComPaThrashing: new FormControl(false),
      ComPaMarked: new FormControl(false),
      ComPaActivity: new FormControl(false),
      ComPaTense: new FormControl(false),
      ComPaFleshed: new FormControl(false),
      ComPaSleep: new FormControl(false),
      ComPaWithdraw: new FormControl(false),
      ComPaDuskiness: new FormControl(false),
      ComPaRrHr: new FormControl(false),
      ComScore: new FormControl(''),
      ComComment: new FormControl(''),
      SedationAgitation: new FormControl(''),
      SedationScore: new FormControl(''),
      SedationComment: new FormControl(''),
      PlDate: new FormControl(new Date()),
      PlTime: new FormControl(currentTime),
      PlPainIntensity: new FormControl(''),
      PlPainScaling: new FormControl(''),
      PlChSharp: new FormControl(false),
      PlChDull: new FormControl(false),
      PlChStabbing: new FormControl(false),
      PlChBurns: new FormControl(false),
      PlChCrushing: new FormControl(false),
      PlChDeep: new FormControl(false),
      PlChSore: new FormControl(false),
      PlChAching: new FormControl(false),
      PlChColic: new FormControl(false),
      PlChThrobbing: new FormControl(false),
      PlChNumb: new FormControl(false),
      PlChShooting: new FormControl(false),
      PlChPressing: new FormControl(false),
      PlChTight: new FormControl(false),
      PlChPulling: new FormControl(false),
      PlChSqueezing: new FormControl(false),
      PlLocation: new FormControl(''),
      PlFrequency: new FormControl(''),
      PlDuration: new FormControl(''),
      PlInterventions: new FormControl(''),
      PlRadiation: new FormControl(''),
      PlRadiationTxt: new FormControl(''),
      PlPattern: new FormControl(''),
      PlOnset: new FormControl(''),
      PlCauses: new FormControl(''),
      PlRelieves: new FormControl(''),
      PlMedication: new FormControl(''),
      PlHeatPacks: new FormControl(false),
      PlColdPacks: new FormControl(false),
      PlRepositioning: new FormControl(false),
      PlAmbulation: new FormControl(false),
      PlRelaxation: new FormControl(false),
      PlDeep: new FormControl(false),
      PlRhythmic: new FormControl(false),
      PlComment: new FormControl(''),
      FloDate: new FormControl(new Date()),
      FloTime: new FormControl(currentTime),
      FloPsRest: new FormControl(''),
      FloPsMovement: new FormControl(''),
      FloPreRest: new FormControl(''),
      FloPreMovement: new FormControl(''),
      FloIvInfusion: new FormControl(''),
      FloIvBolus: new FormControl(''),
      FloIvAmount: new FormControl(''),
      FloPcaReservoir: new FormControl(''),
      FloPcaInfusion: new FormControl(''),
      FloPcaInfusionUnit: new FormControl(''),
      FloPcaDemandDose: new FormControl(''),
      FloPcaTimeInterval: new FormControl(''),
      FloPcaMaximumDoses: new FormControl(''),
      FloPcaDoseGiven: new FormControl(''),
      FloPcaDoseAttempted: new FormControl(''),
      FloPcaClinicalBolus: new FormControl(''),
      FloPcaAmount: new FormControl(''),
      FloEpiInfusion: new FormControl(''),
      FloEpiBlock: new FormControl(''),
      FloEpiAmount: new FormControl(''),
      FloOthIvStat: new FormControl(false),
      FloOthIvPrn: new FormControl(false),
      FloOthLocally: new FormControl(false),
      FloOral: new FormControl(''),
      FloTransdermal: new FormControl(''),
      FloSedation: new FormControl(''),
      FloSideEffects: new FormControl(''),
      Resimage: new FormControl(''),
      Notation: new FormControl(''),
      AttendPhy: new FormControl(this.storageService.getGpart()),
      DocStatus: new FormControl('1'),
    });
  }

  public switchTabs(tab: string) {
    this.isFacePain = false;
    this.isNumericRating = false;
    this.isFlacc = false;
    this.isNips = false;
    this.isComatosePatient = false;
    this.isSedation = false;
    this.isReAssessment = false;
    this.isPainLocation = false;
    this.isFlowSheet = false;
    this[tab] = true;

    if(this.painAssessmentForm.value.NrsPainScore) {
      this.painAssessmentForm.patchValue({
        PlPainIntensity: `${this.painAssessmentForm.value.NrsTotalScore}-${this.painAssessmentForm.value.NrsTotalScoreTxt}`,
        PlPainScaling: 'Face Scale'
      })
    }
  }

  // Face Pain
  public selectRadio(id: string, value: string, description: string) {
    if (this.dockeyValue) return;
    const radioBtn = document.getElementById(id) as HTMLInputElement;
    if (radioBtn) {
      radioBtn.checked = true;
    }
    this.setFacePainValue(value, description);
  }

  public setFacePainValue(value: any, description: string) {
    if (this.painAssessmentForm.get('FpNa').value) return;
    this.painAssessmentForm.patchValue({
      FpTotalScore: value,
      FpTotalScoreTxt: description,
    });
    this.totalScore = value;
    this.facePainDescription = description;
  }

  public uncheckFacePain() {
    this.painAssessmentForm.patchValue({
      FpTotalScore: '',
      FpTotalScoreTxt: '',
      FpPainScale: '',
    });
  }

  // Numeric Rating Scale
  selectPainScore() {
    this.painAssessmentForm.patchValue({
      NrsTotalScore: this.painAssessmentForm.value.NrsPainScore,
      NrsTotalScoreTxt: this.setDescription(
        this.painAssessmentForm.value.NrsPainScore
      ),
    });
  }

  setDescription(value) {
    if (parseInt(value) <= 0) {
      return 'No pain';
    } else if (parseInt(value) >= 1 && parseInt(value) <= 3) {
      return 'Slight pain';
    } else if (parseInt(value) == 4) {
      return 'Mild pain';
    } else if (parseInt(value) >= 5 && parseInt(value) <= 6) {
      return 'Moderate pain';
    } else if (parseInt(value) >= 7 && parseInt(value) <= 9) {
      return 'Severe pain';
    } else if (parseInt(value) == 10) {
      return 'Worst pain possible';
    }
  }

  uncheckRatingValue() {
    this.painAssessmentForm.patchValue({
      NrsTotalScoreTxt: '',
      NrsTotalScore: '',
      NrsPainScore: '',
    });
  }

  // FLACC
  uncheckFLACC() {
    this.painAssessmentForm.patchValue({
      FlFace: '',
      FlLeg: '',
      FlActivity: '',
      FlCry: '',
      FlConsolability: '',
      FlScore: '',
      FlScoreTxt: '',
    });
  }

  totalOfFlacc() {
    const face = parseFloat(this.painAssessmentForm.get('FlFace').value) || 0;
    const leg = parseFloat(this.painAssessmentForm.get('FlLeg').value) || 0;
    const activity =
      parseFloat(this.painAssessmentForm.get('FlActivity').value) || 0;
    const cry = parseFloat(this.painAssessmentForm.get('FlCry').value) || 0;
    const consolability =
      parseFloat(this.painAssessmentForm.get('FlConsolability').value) || 0;

    const totalScore = face + leg + activity + cry + consolability;

    this.painAssessmentForm.get('FlScore').setValue(totalScore.toString());

    let description;
    if (totalScore === 0) {
      description = 'Relaxed and Comfortable';
    } else if (totalScore >= 1 && totalScore <= 3) {
      description = 'Mild pain / mild discomfort';
    } else if (totalScore >= 4 && totalScore <= 6) {
      description = 'Moderate pain';
    } else if (totalScore >= 7 && totalScore <= 10) {
      description = 'Severe pain';
    } else {
      description = '';
    }

    this.painAssessmentForm.get('FlScoreTxt').setValue(description);
  }

  // NIPS
  totalOfNips() {
    if (
      this.painAssessmentForm.get('NiFacial').value == 'A' ||
      this.painAssessmentForm.get('NiCry').value == 'A' ||
      this.painAssessmentForm.get('NiBreathing').value == 'A' ||
      this.painAssessmentForm.get('NiArms').value == 'A' ||
      this.painAssessmentForm.get('NiLegs').value == 'A' ||
      this.painAssessmentForm.get('NiArousal').value == 'A'
    ) {
      this.painAssessmentForm.get('NiTotalScore').setValue('N/A');
      this.painAssessmentForm
        .get('NiTotalScoreTxt')
        .setValue('Not all questions are answered');
      return;
    }

    const facial =
      parseFloat(this.painAssessmentForm.get('NiFacial').value) || 0;
    const cry = parseFloat(this.painAssessmentForm.get('NiCry').value) || 0;
    const breathing =
      parseFloat(this.painAssessmentForm.get('NiBreathing').value) || 0;
    const arms = parseFloat(this.painAssessmentForm.get('NiArms').value) || 0;
    const legs = parseFloat(this.painAssessmentForm.get('NiLegs').value) || 0;
    const arousal =
      parseFloat(this.painAssessmentForm.get('NiArousal').value) || 0;

    // Calculate total score
    const totalScore = facial + cry + breathing + arms + legs + arousal;

    // Update the value of nipstotalscore form control
    this.painAssessmentForm.get('NiTotalScore').setValue(totalScore.toString());
    let description;
    // Assign description based on total score
    if (totalScore >= 0 && totalScore <= 2) {
      description = 'Mild to no pain';
    } else if (totalScore >= 3 && totalScore <= 4) {
      description = 'Mild to moderate pain';
    } else if (totalScore > 4) {
      description = 'Severe pain';
    } else {
      description = '';
    }

    // Update the value of nipsdescription form control
    this.painAssessmentForm.get('NiTotalScoreTxt').setValue(description);
  }

  // Comatose Patient Adult and Pediatrics
  uncheckComatose() {
    this.painAssessmentForm.patchValue({
      ComIrIntermittent: false,
      ComIrActivity: false,
      ComIrFrowning: false,
      ComIrMildly: false,
      ComIrArousability: false,
      ComIrUnexplained: false,
      ComPaLoudCry: false,
      ComPaRefuses: false,
      ComPaThrashing: false,
      ComPaMarked: false,
      ComPaActivity: false,
      ComPaTense: false,
      ComPaFleshed: false,
      ComPaSleep: false,
      ComPaWithdraw: false,
      ComPaDuskiness: false,
      ComPaRrHr: false,
      ComScore: '',
      ComComment: '',
    });
  }

  calculateScore() {
    let totalScore = 0;
    const checkboxScores = {
      ComIrIntermittent: 2,
      ComIrActivity: 2,
      ComIrFrowning: 2,
      ComIrMildly: 2,
      ComIrArousability: 2,
      ComIrUnexplained: 2,
      ComPaLoudCry: 1,
      ComPaRefuses: 1,
      ComPaThrashing: 1,
      ComPaMarked: 1,
      ComPaActivity: 1,
      ComPaTense: 1,
      ComPaFleshed: 1,
      ComPaSleep: 1,
      ComPaWithdraw: 1,
      ComPaDuskiness: 1,
      ComPaRrHr: 1,
    };

    Object.keys(checkboxScores).forEach((key) => {
      if (this.painAssessmentForm.get(key).value) {
        totalScore += checkboxScores[key];
      }
    });

    this.painAssessmentForm.patchValue({
      ComScore: totalScore,
    });
  }

  // Sedation & Agitation
  calculateOfSedation() {
    this.painAssessmentForm.patchValue({
      SedationScore: Number(this.painAssessmentForm.value.SedationAgitation),
    });
  }

  // Assessment ans Re-Assessment
  reAssessmentSetTable() {
    let characterJoin = this.characterConcate.join(',');
    let nonMedicationJoin = this.NoMedicationConcate.join(',');
    let payload = {
      Dockey: '',
      PlDate: this.painAssessmentForm.value.PlDate,
      PlTime: this.painAssessmentForm.value.PlTime,
      PlPainIntensity: this.painAssessmentForm.value.PlPainIntensity,
      PlPainScaling: this.painAssessmentForm.value.PlPainScaling,
      PlCharacter: characterJoin,
      PlLocation: this.painAssessmentForm.value.PlLocation,
      PlFrequency: this.painAssessmentForm.value.PlFrequency,
      PlDuration: this.painAssessmentForm.value.PlDuration,
      PlInterventions: this.painAssessmentForm.value.PlInterventions,
      PlRadiation: this.painAssessmentForm.value.PlRadiation,
      PlRadiationTxt: this.painAssessmentForm.value.PlRadiationTxt,
      PlPattern: this.painAssessmentForm.value.PlPattern,
      PlOnset: this.painAssessmentForm.value.PlOnset,
      PlCauses: this.painAssessmentForm.value.PlCauses,
      PlRelieves: this.painAssessmentForm.value.PlRelieves,
      PlMedication: this.painAssessmentForm.value.PlMedication,
      PlNonMedication: nonMedicationJoin,
      PlComment: this.painAssessmentForm.value.PlComment,
      PlAssessedBy: this.userProfile?.GpartName,
    };

    this.reAssessmentTableList.push(payload);
  }

  characterCheck(event, value) {
    if (event.target.checked) {
      this.characterConcate.push(value);
    } else {
      let index = this.characterConcate.indexOf(value);
      if (index !== -1) {
        this.characterConcate.splice(index, 1);
      }
    }
  }

  deletePIData(index) {
    this.reAssessmentTableList.splice(index, 1);
  }

  nonMedicationCheck(event, value) {
    if (event.target.checked) {
      this.NoMedicationConcate.push(value);
    } else {
      let index = this.NoMedicationConcate.indexOf(value);
      if (index !== -1) {
        this.NoMedicationConcate.splice(index, 1);
      }
    }
  }

  clearReAssessmentForm() {
    let currentTime = this.datePipe.transform(new Date(), 'hh:mm:ss');
    this.painAssessmentForm.patchValue({
      PlDate: new Date(),
      PlTime: currentTime,
      PlPainIntensity: '',
      PlPainScaling: '',
      PlChSharp: false,
      PlChDull: false,
      PlChStabbing: false,
      PlChBurns: false,
      PlChCrushing: false,
      PlChDeep: false,
      PlChSore: false,
      PlChAching: false,
      PlChColic: false,
      PlChThrobbing: false,
      PlChNumb: false,
      PlChShooting: false,
      PlChPressing: false,
      PlChTight: false,
      PlChPulling: false,
      PlChSqueezing: false,
      PlLocation: '',
      PlFrequency: '',
      PlDuration: '',
      PlInterventions: '',
      PlRadiation: '',
      PlRadiationTxt: '',
      PlPattern: '',
      PlOnset: '',
      PlCauses: '',
      PlRelieves: '',
      PlMedication: '',
      PlHeatPacks: false,
      PlColdPacks: false,
      PlRepositioning: false,
      PlAmbulation: false,
      PlRelaxation: false,
      PlDeep: false,
      PlRhythmic: false,
      PlComment: '',
    });
  }

  // Assessment and Management Flow Sheet
  flowSheetSetTable() {
    let characterJoin = this.otherConcate.join(',');
    let payload = {
      Dockey: '',
      FloDate: this.painAssessmentForm.value.FloDate,
      FloTime: this.painAssessmentForm.value.FloTime,
      FloPsRest: this.painAssessmentForm.value.FloPsRest,
      FloPsMovement: this.painAssessmentForm.value.FloPsMovement,
      FloPreRest: this.painAssessmentForm.value.FloPreRest,
      FloPreMovement: this.painAssessmentForm.value.FloPreMovement,
      FloIvInfusion: this.painAssessmentForm.value.FloIvInfusion,
      FloIvBolus: this.painAssessmentForm.value.FloIvBolus,
      FloIvAmount: this.painAssessmentForm.value.FloIvAmount,
      FloPcaReservoir: this.painAssessmentForm.value.FloPcaReservoir,
      FloPcaInfusion: this.painAssessmentForm.value.FloPcaInfusion,
      FloPcaDemandDose: this.painAssessmentForm.value.FloPcaDemandDose,
      FloPcaTimeInterval: this.painAssessmentForm.value.FloPcaTimeInterval,
      FloPcaMaximumDoses: this.painAssessmentForm.value.FloPcaMaximumDoses,
      FloPcaDoseGiven: this.painAssessmentForm.value.FloPcaDoseGiven,
      FloPcaDoseAttempted: this.painAssessmentForm.value.FloPcaDoseAttempted,
      FloPcaClinicalBolus: this.painAssessmentForm.value.FloPcaClinicalBolus,
      FloPcaAmount: this.painAssessmentForm.value.FloPcaAmount,
      FloEpiInfusion: this.painAssessmentForm.value.FloEpiInfusion,
      FloEpiBlock: this.painAssessmentForm.value.FloEpiBlock,
      FloEpiAmount: this.painAssessmentForm.value.FloEpiAmount,
      FloOral: this.painAssessmentForm.value.FloOral,
      FloTransdermal: this.painAssessmentForm.value.FloTransdermal,
      FloSedation: this.painAssessmentForm.value.FloSedation,
      FloSideEffects: this.painAssessmentForm.value.FloSideEffects,
      FloAssessedBy: this.painAssessmentForm.value.FloAssessedBy,
      FloOther: characterJoin,
    };

    this.flowSheetAssessmentList.push(payload);
  }

  otherTextJoin(event, value) {
    if (event.target.checked) {
      this.otherConcate.push(value);
    } else {
      let index = this.otherConcate.indexOf(value);
      if (index !== -1) {
        this.otherConcate.splice(index, 1);
      }
    }
  }

  deleteFlowSheetData(index) {
    this.flowSheetAssessmentList.splice(index, 1);
  }

  transformDate(dateString: string): string {
    const date = new Date(dateString);
    const timestamp = date.getTime();
    return `/Date(${timestamp})/`;
  }

  transformTime(timeString: string): string {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return `PT${hours}H${minutes}M${seconds}S`;
  }

  savePainAssessmentDoc(docStatus?: any): Promise<any> {
    this.painAssessmentForm.value.DocStatus = docStatus;

    let painAssessmentValue = this.deepClone(this.painAssessmentForm.value);
    painAssessmentValue.AttendPhy = this.storageService.getGpart();
    const flowSheetAssessmentCloneValue = this.processFlowSheet(this.flowSheetAssessmentList, painAssessmentValue);
    const reAssessmentCloneValue = this.processReAssessment(this.reAssessmentTableList, painAssessmentValue);
  
    const payload = this.createPayload(painAssessmentValue, reAssessmentCloneValue, flowSheetAssessmentCloneValue);
    
    return new Promise((resolve, reject) => {
      this.subscription = this.emergencyService.createPainAssessmentDoc({ d: payload }).subscribe({
        next: (data: any) => {},
        error: (err: any) => {
          this.sharedService.waringSwallModel(`Error ${err}`);
          this.sharedService.waringSwallModel(`POST Error at Nurse Endorsment : ${err}`);
          reject(err);
        },
        complete: () => {
          resolve(true);
          this.sharedService.successSwallModel(this.manageMessage());
        }
      });
    });
  }

  manageMessage() {
    if(this.documentType == ActionType.Add$) {
      return 'Pain Assessment created successfully';
    } else if(this.documentType == ActionType.Update$) {
      return 'Pain Assessment edited successfully'
    } else if(this.documentType == ActionType.Copy$) {
      return 'Pain Assessment copied successfully'
    }
  }
  
  deepClone(obj: any): any {
    return JSON.parse(JSON.stringify(obj));
  }
  
  processFlowSheet(flowSheetList: any[], painAssessmentValue: any): any[] {
    return flowSheetList.length ? flowSheetList.map(element => ({
      ...element,
      FloDate: this.transformDate(painAssessmentValue.FloDate),
      FloTime: this.transformTime(painAssessmentValue.FloTime),
      FloPcaTimeInterval: Number(element.FloPcaTimeInterval)
    })) : [];
  }
  
  processReAssessment(reAssessmentList: any[], painAssessmentValue: any): any[] {
    return reAssessmentList.length ? reAssessmentList.map(element => {
      const { PlAssessedBy, ...rest } = element;
      return {
        ...rest,
        PlDate: this.transformDate(painAssessmentValue.PlDate),
        PlTime: this.transformTime(painAssessmentValue.PlTime)
      };
    }) : [];
  }
  
  createPayload(painAssessmentValue: any, reAssessmentCloneValue: any[], flowSheetAssessmentCloneValue: any[]): any {
    const payload = {
      ...painAssessmentValue,
      PlDate: this.transformDate(painAssessmentValue.PlDate),
      PlTime: this.transformTime(painAssessmentValue.PlTime),
      TOPAINLOGS: reAssessmentCloneValue,
      TOFLOWSHEET: flowSheetAssessmentCloneValue,
      FloDate: this.transformDate(painAssessmentValue.FloDate),
      FloTime: this.transformTime(painAssessmentValue.FloTime),
      FloPcaTimeInterval: Number(painAssessmentValue.FloPcaTimeInterval),
      Orgdo: 'F21IUAMC',
      AttendPhy: this.storageService.getUserProfile().Gpart,
      ComScore: painAssessmentValue.ComNoSigns ? 0 : painAssessmentValue.ComScore
    };
    return this.setEmptyStrings(payload);
  }
  

  openImageEditor() {
    this.imageEditorPainLocation.initializePainterro();
  }

  getEditImage(event: any) {
    console.log(event);
    this.painAssessmentForm.patchValue({
      Resimage: event,
    });
  }

  removePainImg() {
    this.painAssessmentForm.patchValue({
      Resimage: '',
    });
  }

  setEmptyStrings(obj: any): any {
    if (obj === null || obj === undefined) {
      return '';
    }
    if (typeof obj === 'object' && !Array.isArray(obj)) {
      const newObj = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          newObj[key] = this.setEmptyStrings(obj[key]);
        }
      }
      return newObj;
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => this.setEmptyStrings(item));
    }
    return obj;
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
}
