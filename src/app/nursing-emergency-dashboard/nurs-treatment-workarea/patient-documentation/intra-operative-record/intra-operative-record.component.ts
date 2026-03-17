import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdmissionService } from '@services/admission/admission.service';
import { DataShareService } from '@services/data-share.service';
import { AddministrationService } from '@services/e-Prescription/Administration.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { ActionType } from '@services/interfaces/common.enum';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { ImportDiagnosisComponent } from 'src/app/shared-module/nursing-discharge-summary/diagnosis-tab/import-diagnosis/import-diagnosis.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-intra-operative-record',
  templateUrl: './intra-operative-record.component.html',
  styleUrls: ['./intra-operative-record.component.scss'],
})
export class IntraOperativeRecordComponent implements OnInit {
  @Output() successEvent: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('diagnosisNotesKardexId')
  diagnosisNotesKardex: ImportDiagnosisComponent;
  public equipment = [
    { value: '1', label: 'No' },
    { value: '0', label: 'Yes' },
  ];
  yesNoOptions = [
    { value: '0', label: 'Yes' },
    { value: '1', label: 'No' },
  ];

  classifications = [
    { value: '0', label: 'Intermediate' },
    { value: '1', label: 'Major Plus' },
    { value: '2', label: 'Complex Major' },
    { value: '3', label: 'Minor' },
  ];

  surgeryTypes = [
    { value: '0', label: 'Elective' },
    { value: '1', label: 'Emergency' },
    { value: 2, label: 'Urgent' },
  ];

  surgeryRoomTypes = [
    { value: '0', label: 'Sterilized' },
    { value: '1', label: 'Destilized' },
  ];

  positions = [
    { value: '0', label: 'Supine' },
    { value: '1', label: 'Prone' },
    { value: '2', label: 'Lithotomy' },
    { value: '3', label: 'Sitting' },
    { value: '4', label: 'Lateral Rt.' },
    { value: '5', label: 'Lateral Lt.' },
    { value: '7', label: 'Others' },
  ];

  skinConditions = [
    { value: '0', label: 'Intact' },
    { value: '1', label: 'Non-Intact' },
  ];

  sutureTypes = [
    { value: '0', label: 'Suture' },
    { value: '1', label: 'Stapler' },
    { value: '2', label: 'Glue' },
  ];

  drainMethods = [
    { value: '0', label: 'Single' },
    { value: '1', label: 'Continuous' },
    { value: '2', label: 'Retention' },
  ];

  investigationTypes = [
    { value: '0', label: 'Pathology' },
    { value: '1', label: 'Cytology' },
    { value: '2', label: 'Bacteriology' },
    { value: '3', label: 'Other Lab Investigations' },
  ];

  babyGenders = [
    { value: '0', label: 'Unknown' },
    { value: '1', label: 'Female' },
    { value: '2', label: 'Male' },
  ];

  babyDischargeOptions = [
    { value: '0', label: 'NICU' },
    { value: '1', label: 'Nursery' },
    { value: '2', label: 'Other' },
  ];

  dischargeDestinations = [
    { value: '0', label: 'PACU' },
    { value: '1', label: 'Ward' },
    { value: '2', label: 'Intensive Care Unit' },
    { value: '3', label: 'Other' },
  ];

  public criticalForm: FormGroup;
  loginForm: FormGroup;
  public paramsObject: any;
  private subscription: Subscription;
  private actionTypeSubscription$: Subscription;
  public docKey: any;
  public CurrentDateAndTime: Date = new Date();
  constructor(
    public modalService: BsModalService,
    private formBuilder: FormBuilder,
    private _route: ActivatedRoute,
    public storageService: StorageService,
    public admissionService: AdmissionService,
    private sharedService: SharedService,
    private dataShareService: DataShareService,
    public emergencyService: EmergencyService,
    public administrationService: AddministrationService
  ) {
    this._route.queryParams.subscribe((params) => {
      this.paramsObject = params;
      this.storageService.setEinri(this.paramsObject.einri);
      this.storageService.setFalnr(this.paramsObject.falnr);
      this.storageService.setLfdnr(this.paramsObject.lfdnr);
      this.storageService.setPatnr(this.paramsObject.patnr);
    });
    this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe(
      (data) => {
        if (data != null) {
          if (data.type == ActionType.Add$ && data.value == '') {
            this.docKey = data.value.Dockey;
          }
          if (data.type == ActionType.Update$ && data.value) {
            this.docKey = data.value.docKey;
            this.getDocument(data.value.docKey);
          }
          if (data.type == ActionType.Copy$ && data.value) {
            this.docKey = data.value.docKey;
            this.getDocument(data.value.docKey);
          }
        } else {
          // for after code
        }
      }
    );
  }

  currentTime: any;

  ngOnInit(): void {
    this.initForm();
    this.initLoginForm();
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    this.currentTime = `${hours}:${minutes}:${seconds}`;
  }

  calculateTotal() {
    const site = this.criticalForm.get('FProcedureSite')?.value === '0' ? 1 : 0;
    const oxygen = this.criticalForm.get('FOpenOxygen')?.value === '0' ? 1 : 0;
    const ignition =
      this.criticalForm.get('FIgnitionSource')?.value === '0' ? 1 : 0;

    const total = site + oxygen + ignition;

    this.criticalForm.get('FTotal')?.setValue(total, { emitEvent: false });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.actionTypeSubscription$) {
      this.actionTypeSubscription$.unsubscribe();
      this.dataShareService.sendActionType(null);
    }
  }

  getDocument(data?) {
    this.admissionService.getIntraOpNurRecSetDetail(this.docKey).subscribe({
      next: (data: any) => {
        if (data) {
          this.toDiagnosisArr = data?.results[0]?.TODIAGNOSES?.results;
          this.initForm(data?.results[0]);
        }
      },
      error: (err: any) => {},
    });
  }

  initForm(data?) {
    this.criticalForm = this.formBuilder.group({
      // START section
      SDate: [this.getDate(data?.SDate) || this.CurrentDateAndTime],
      SsiTime: [this.parseTime(data?.SsiTime) || null],
      SsiPatientId: [data?.SsiPatientId || false],
      SsiProcedureName: [data?.SsiProcedureName || false],
      SsiProcedureSide: [data?.SsiProcedureSide || false],
      SsiProcedureSite: [data?.SsiProcedureSite || false],
      SsiConsentFromSigned: [data?.SsiConsentFromSigned || false],
      SsiPreAnaesthesia: [data?.SsiPreAnaesthesia || false],
      SsiEquipment: [data?.SsiEquipment || false],
      SsiAirway: [data?.SsiAirway || false],
      SsiAspiration: [data?.SsiAspiration || false],
      SsiRiskBlood: [data?.SsiRiskBlood || false],
      SsiAllergies: [data?.SsiAllergies || false],
      SsiAnaesthesiaEquipment: [data?.SsiAnaesthesiaEquipment || false],
      SsiVerificationCritical: [data?.SsiVerificationCritical || false],
      SsiVerificationExistence: [data?.SsiVerificationExistence || false],

      // TIMEOUT section
      StTime: [this.parseTime(data?.StTime) || null],
      StTeamOrientation: [data?.StTeamOrientation || false],
      StIdConfirmation: [data?.StIdConfirmation || false],
      StProcedureName: [data?.StProcedureName || false],
      StProcedureSide: [data?.StProcedureSide || false],
      StProcedureSite: [data?.StProcedureSite || false],
      StAnticipated: [data?.StAnticipated || false],
      StAntibiotic: [data?.StAntibiotic || false],
      StImageDisplayed: [data?.StImageDisplayed || false],
      StImplantsReady: [data?.StImplantsReady || false],
      StSWhatAre: [data?.StSWhatAre || false],
      StSHowLong: [data?.StSHowLong || false],
      StSWhatIs: [data?.StSWhatIs || false],
      StAAreThere: [data?.StAAreThere || false],
      StNHasSterility: [data?.StNHasSterility || false],
      StNAreThere: [data?.StNAreThere || false],

      // SIGN OUT section
      SsoTime: [this.parseTime(data?.SsoTime) || null],
      SsoProcedureName: [data?.SsoProcedureName || false],
      SsoInstrumentCount: [data?.SsoInstrumentCount || false],
      SsoSpecimenLabelled: [data?.SsoSpecimenLabelled || false],
      SsoEquipmentProblems: [data?.SsoEquipmentProblems || ''],
      SsoEquipmentProblemsTxt: [data?.SsoEquipmentProblemsTxt || ''],
      SsoProblemEncountered: [data?.SsoProblemEncountered || false],
      SsoProblemEncounteredTxt: [data?.SsoProblemEncounteredTxt || ''],
      SsoKeyConcerns: [data?.SsoKeyConcerns || false],

      // FIRE RISK section
      FDate: [this.getDate(data?.FDate) || this.CurrentDateAndTime],
      FProcedureSite: [data?.FIgnitionSource ?? ''],
      FOpenOxygen: [data?.FOpenOxygen ?? ''],
      FIgnitionSource: [data?.FIgnitionSource ?? ''],
      FTotal: [data?.FTotal || 0],
      FComments: [data?.FComments || ''],

      // IOD1
      Iod1NoDiagnoses: [data?.Iod1NoDiagnoses || false],
      Iod1NoProcedure: [data?.Iod1NoProcedure || false],

      // IOD2
      Iod2Date: [this.getDate(data?.Iod2Date) || null],
      Iod2Surgery: [data?.Iod2Surgery || ''],
      Iod2RoomNo: [data?.Iod2RoomNo || ''],
      Iod2RoomType: [data?.Iod2RoomType || ''],
      Iod2Classification: [data?.Iod2Classification || ''],
      Iod2Positioning: [data?.Iod2Positioning || ''],
      Iod2PositioningTxt: [data?.Iod2PositioningTxt || ''],
      Iod2SSafetyBelts: [data?.Iod2SSafetyBelts || false],
      Iod2SLateralSupport: [data?.Iod2SLateralSupport || false],
      Iod2SWarmingDevices: [data?.Iod2SWarmingDevices || false],
      Iod2SPillows: [data?.Iod2SPillows || false],
      Iod2SLeft: [data?.Iod2SLeft || false],
      Iod2SRight: [data?.Iod2SRight || false],
      Iod2SGelPads: [data?.Iod2SGelPads || false],
      Iod2SHeadRest: [data?.Iod2SHeadRest || false],
      Iod2SArmBoards: [data?.Iod2SArmBoards || false],
      Iod2SOther: [data?.Iod2SOther || false],
      Iod2SOtherTxt: [data?.Iod2SOtherTxt || ''],
      Iod2PArms: [data?.Iod2PArms || false],
      Iod2PAxilla: [data?.Iod2PAxilla || false],
      Iod2PHeals: [data?.Iod2PHeals || false],
      Iod2PHips: [data?.Iod2PHips || false],
      Iod2PKnees: [data?.Iod2PKnees || false],
      Iod2PHead: [data?.Iod2PHead || false],
      Iod2PShoulders: [data?.Iod2PShoulders || false],
      Iod2POther: [data?.Iod2POther || false],
      Iod2POtherTxt: [data?.Iod2POtherTxt || ''],
      Iod2HairClipping: [data?.Iod2HairClipping || ''],
      Iod2HairClippingTxt: [data?.Iod2HairClippingTxt || ''],
      Iod2SkPovidoneIodine: [data?.Iod2SkPovidoneIodine || false],
      Iod2SkChlorhexidine: [data?.Iod2SkChlorhexidine || false],
      Iod2SkOther: [data?.Iod2SkOther || false],
      Iod2SkOtherTxt: [data?.Iod2SkOtherTxt || ''],
      Iod2WarmingBlanket: [data?.Iod2WarmingBlanket || ''],
      Iod2ElectroCautry: [data?.Iod2ElectroCautry || ''],
      Iod2AssetsNo: [data?.Iod2AssetsNo || false],
      Iod2AssetsNoTxt: [data?.Iod2AssetsNoTxt || ''],
      Iod2PaArm: [data?.Iod2PaArm || false],
      Iod2PaLeg: [data?.Iod2PaLeg || false],
      Iod2PaButtocks: [data?.Iod2PaButtocks || false],
      Iod2PaLeft: [data?.Iod2PaLeft || false],
      Iod2PaRight: [data?.Iod2PaRight || false],
      Iod2PaOther: [data?.Iod2PaOther || false],
      Iod2PaOtherTxt: [data?.Iod2PaOtherTxt || ''],
      Iod2SkinCondition: [data?.Iod2SkinCondition || ''],
      Iod2TTourniquet: [data?.Iod2TTourniquet || ''],
      Iod2TAssetNo: [data?.Iod2TAssetNo || ''],
      Iod2TAppliedBy: [data?.Iod2TAppliedBy || ''],
      Iod2TLeftLimb: [data?.Iod2TLeftLimb || false],
      Iod2TLTimeApplied: [this.parseTime(data?.Iod2TLTimeApplied) || null],
      Iod2TLTimeInflated: [this.parseTime(data?.Iod2TLTimeInflated) || null],
      Iod2TLPressure: [data?.Iod2TLPressure || ''],
      Iod2TLTimeDeflated: [this.parseTime(data?.Iod2TLTimeDeflated) || null],
      Iod2TLTimeRemoved: [this.parseTime(data?.Iod2TLTimeRemoved) || null],
      Iod2TRightLimb: [data?.Iod2TRightLimb || false],
      Iod2TRTimeApplied: [this.parseTime(data?.Iod2TRTimeApplied) || null],
      Iod2TRTimeInflated: [this.parseTime(data?.Iod2TRTimeInflated) || null],
      Iod2TRPressure: [data?.Iod2TRPressure || ''],
      Iod2TRTimeDeflated: [this.parseTime(data?.Iod2TRTimeDeflated) || null],
      Iod2TRTimeRemoved: [this.parseTime(data?.Iod2TRTimeRemoved) || null],
      Iod2TImplants: [data?.Iod2TImplants || ''],
      Iod2TSkinClosure: [data?.Iod2TSkinClosure || ''],
      Iod2TType: [data?.Iod2TType || ''],
      Iod2TMethod: [data?.Iod2TMethod || ''],
      Iod2TOthers: [data?.Iod2TOthers || ''],
      Iod2TSwabs: [data?.Iod2TSwabs || ''],
      Iod2TSuction: [data?.Iod2TSuction || ''],
      Iod2TTotal: [data?.Iod2TTotal || ''],
      Iod2TDrains: [data?.Iod2TDrains || ''],
      Iod2TPacks: [data?.Iod2TPacks || ''],
      Iod2TIfIncorrectTxt: [data?.Iod2TIfIncorrectTxt || ''],
      Iod2TSpecimensNa: [data?.Iod2TSpecimensNa || false],
      Iod2TLscsNa: [data?.Iod2TLscsNa || false],
      Iod2TLscsBabyGender: [data?.Iod2TLscsBabyGender || ''],
      Iod2TLscsWeight: [data?.Iod2TLscsWeight || '0'],
      Iod2TLscsBirthTime: [this.parseTime(data?.Iod2TLscsBirthTime) || null],
      Iod2TLscsIdentification: [data?.Iod2TLscsIdentification || ''],
      Iod2TLscsBy: [data?.Iod2TLscsBy || ''],
      Iod2TLscsBabyDischarge: [data?.Iod2TLscsBabyDischarge || ''],
      Iod2TLscsBabyDischargeTxt: [data?.Iod2TLscsBabyDischargeTxt || ''],
      Iod2TCirculatingNurse: [data?.Iod2TCirculatingNurse || ''],
      Iod2TScrubNurse: [data?.Iod2TScrubNurse || ''],

      // POST-OP DATA
      PodGkIntact: [data?.PodGkIntact || false],
      PodGkBurns: [data?.PodGkBurns || false],
      PodGkBlister: [data?.PodGkBlister || false],
      PodGkEcchymosis: [data?.PodGkEcchymosis || false],
      PodGkAbrasions: [data?.PodGkAbrasions || false],
      PodLocation: [data?.PodLocation || ''],
      PodDischargedTo: [data?.PodDischargedTo || ''],
      PodDischargedToTxt: [data?.PodDischargedToTxt || ''],
      PodRWoundStatus: [data?.PodRWoundStatus || false],
      PodRTed: [data?.PodRTed || false],
      PodRDressing: [data?.PodRDressing || false],
      PodRPatientMedical: [data?.PodRPatientMedical || false],
      PodRUrinaryCatheter: [data?.PodRUrinaryCatheter || false],
      PodRXRay: [data?.PodRXRay || false],
      PodRNgt: [data?.PodRNgt || false],
      PodRIv: [data?.PodRIv || false],
      PodROthers: [data?.PodROthers || false],
      PodROthersTxt: [data?.PodROthersTxt || ''],
      PodHandoverBy: [data?.PodHandoverBy || ''],
      PodHandoverByTime: [this.parseTime(data?.PodHandoverByTime) || null],
      PodReceivedBy: [data?.PodReceivedBy || ''],
      PodReceivedByTime: [this.parseTime(data?.PodReceivedByTime) || null],

      // ARRAYS
      TOPROCEDURE: [],
      TOSURGICALTEAM: [],
      TODIAGNOSES: [],
      TOPACKS: this.formBuilder.array([]),
      TOIMPLANTS: this.formBuilder.array([]),
      TOINSTRUMENT_SET: this.formBuilder.array([]),
      TOCOUNT: this.formBuilder.array([]),
      TODRAINS: this.formBuilder.array([]),
      TOSPECIMENS: this.formBuilder.array([]),
    });
    this.populateFormArrays(data);
  }

 populateFormArrays(data: any) {
  const packArray = this.criticalForm.get('TOPACKS') as FormArray;
  const implantArray = this.criticalForm.get('TOIMPLANTS') as FormArray;
  const inssetArray = this.criticalForm.get('TOINSTRUMENT_SET') as FormArray;
  const countArray = this.criticalForm.get('TOCOUNT') as FormArray;
  const drainsArray = this.criticalForm.get('TODRAINS') as FormArray;
  const specimensArray = this.criticalForm.get('TOSPECIMENS') as FormArray;

  // TOPACKS
  if (data?.TOPACKS?.results?.length) {
    data.TOPACKS.results.forEach((item: any) => {
      packArray.push(this.addPacks(item));
    });
  } else {
    for (let i = 0; i < 5; i++) {
      packArray.push(this.addPacks());
    }
  }

  // TOIMPLANTS
  if (data?.TOIMPLANTS?.results?.length) {
    data.TOIMPLANTS.results.forEach((item: any) => {
      implantArray.push(this.addImplants(item));
    });
  } else {
    for (let i = 0; i < 5; i++) {
      implantArray.push(this.addImplants());
    }
  }

  // TOINSTRUMENT_SET
  if (data?.TOINSTRUMENT_SET?.results?.length) {
    data.TOINSTRUMENT_SET.results.forEach((item: any) => {
      inssetArray.push(this.addInstrument(item));
    });
  } else {
    for (let i = 0; i < 5; i++) {
      inssetArray.push(this.addInstrument());
    }
  }

  // TOCOUNT
  if (data?.TOCOUNT?.results?.length) {
    data.TOCOUNT.results.forEach((item: any) => {
      countArray.push(this.addCount(item));
    });
  } else {
    for (let i = 0; i < 5; i++) {
      countArray.push(this.addCount());
    }
  }

  // TODRAINS
  if (data?.TODRAINS?.results?.length) {
    data.TODRAINS.results.forEach((item: any) => {
      drainsArray.push(this.addDrain(item));
    });
  } else {
    for (let i = 0; i < 5; i++) {
      drainsArray.push(this.addDrain());
    }
  }

  // TOSPECIMENS
  if (data?.TOSPECIMENS?.results?.length) {
    data.TOSPECIMENS.results.forEach((item: any) => {
      specimensArray.push(this.addSpecimens(item));
    });
  } else {
    for (let i = 0; i < 5; i++) {
      specimensArray.push(this.addSpecimens());
    }
  }
}


  get TODRAINS(): FormArray {
    return this.criticalForm.get('TODRAINS') as FormArray;
  }
  get TOPACKS(): FormArray {
    return this.criticalForm.get('TOPACKS') as FormArray;
  }
  get TOIMPLANTS(): FormArray {
    return this.criticalForm.get('TOIMPLANTS') as FormArray;
  }
  get TOCOUNT(): FormArray {
    return this.criticalForm.get('TOCOUNT') as FormArray;
  }
  get TOINSTRUMENT_SET(): FormArray {
    return this.criticalForm.get('TOINSTRUMENT_SET') as FormArray;
  }
  get TOSPECIMENS(): FormArray {
    return this.criticalForm.get('TOSPECIMENS') as FormArray;
  }

  addDrain(data?: any): FormGroup {
    return this.formBuilder.group({
      Type: [data?.Type ?? ''],
      Size: [data?.Size ?? ''],
      Site: [data?.Site ?? ''],
    });
  }
  addInstrument(data?: any): FormGroup {
    return this.formBuilder.group({
      InstrumentSets: [data?.InstrumentSets ?? ''],
      CycleNumber: [data?.CycleNumber ?? ''],
      PackedBy: [data?.PackedBy ?? ''],
      PackedByName: [data?.PackedByName ?? ''],
    });
  }
  addImplants(data?: any): FormGroup {
    return this.formBuilder.group({
      Type: [data?.Type ?? ''],
      Size: [data?.Size ?? ''],
      Quantity: [data?.Quantity ?? ''],
    });
  }
  addCount(data?: any): FormGroup {
    return this.formBuilder.group({
      Item: [data?.Item ?? ''],
      IniCorrect: [data?.IniCorrect ?? ''],
      IniIncorrect: [data?.IniIncorrect ?? ''],
      SecCorrect: [data?.SecCorrect ?? ''],
      SecIncorrect: [data?.SecIncorrect ?? ''],
      FinCorrect: [data?.FinCorrect ?? ''],
      FinIncorrect: [data?.FinIncorrect ?? ''],
    });
  }
  addSpecimens(data?: any): FormGroup {
    return this.formBuilder.group({
      Type: [data?.Type ?? ''],
      SpecimenSamples: [data?.SpecimenSamples ?? ''],
    });
  }
  addPacks(data?: any): FormGroup {
    return this.formBuilder.group({
      Type: [data?.Type ?? ''],
      No: [data?.No ?? ''],
      Site: [data?.Site ?? ''],
    });
  }

addDrainRow(): void {
  this.TODRAINS.push(this.addDrain());
}

addPacksRow(): void {
  this.TOPACKS.push(this.addPacks());
}

addImplantsRow(): void {
  this.TOIMPLANTS.push(this.addImplants());
}

addCountRow(): void {
  this.TOCOUNT.push(this.addCount());
}

addInstrumentRow(): void {
  this.TOINSTRUMENT_SET.push(this.addInstrument());
}

addSpecimensRow(): void {
  this.TOSPECIMENS.push(this.addSpecimens());
}


  removeDrain(index: number) {
    this.TODRAINS.removeAt(index);
  }
  removePacks(index: number) {
    this.TOPACKS.removeAt(index);
  }
  removeImplants(index: number) {
    this.TOIMPLANTS.removeAt(index);
  }

  removeCount(index: number) {
    this.TOCOUNT.removeAt(index);
  }
  removeInstrument(index: number) {
    this.TOINSTRUMENT_SET.removeAt(index);
  }
  removeSpecimens(index: number) {
    this.TOSPECIMENS.removeAt(index);
  }

  toggleInput(controlName: string, value: string): void {
    // const control = this.criticalForm.get(controlName);
    if (value === '0') {
      this.criticalForm.get(controlName)?.enable();
    } else {
      if (controlName === 'type') {
        this.criticalForm.get('type')?.disable();
        this.criticalForm.get('type')?.setValue('');
        this.criticalForm.get('size')?.disable();
        this.criticalForm.get('size')?.setValue('');
        this.criticalForm.get('site')?.disable();
        this.criticalForm.get('site')?.setValue('');
      } else {
        this.criticalForm.get(controlName)?.disable();
        this.criticalForm.get(controlName)?.setValue('');
      }
    }
  }

  onSelectChange(selectControl: string, inputControl: string) {
    const value = this.criticalForm.get(selectControl)?.value;
    this.toggleInput(inputControl, value);
  }

  toggleInputText(checkboxName: string, inputName: string) {
    const checkboxControl = this.criticalForm.get(checkboxName);
    const inputControl = this.criticalForm.get(inputName);
    if (checkboxControl?.value) {
      inputControl?.enable();
    } else {
      inputControl?.disable();
      inputControl?.setValue('');
    }
  }

  public createDoc(status?: any, actionType?: any) {
    return new Promise((resolve, reject) => {
      let formData = this.criticalForm.value;
      formData.SDate = formData.SDate
        ? this.dateFormateString(formData.SDate)
        : null;
      formData.FDate = formData.FDate
        ? this.dateFormateString(formData.FDate)
        : null;
      formData.Iod2Date = formData.Iod2Date
        ? this.dateFormateString(formData.Iod2Date)
        : null;
      formData.SsiTime = formData.SsiTime
        ? this.convertTimeToDuration(formData.SsiTime)
        : null;
      formData.Iod2TLTimeApplied = formData.Iod2TLTimeApplied
        ? this.convertTimeToDuration(formData.Iod2TLTimeApplied)
        : null;
      formData.Iod2TLTimeInflated = formData.Iod2TLTimeInflated
        ? this.convertTimeToDuration(formData.Iod2TLTimeInflated)
        : null;
      formData.Iod2TLTimeDeflated = formData.Iod2TLTimeDeflated
        ? this.convertTimeToDuration(formData.Iod2TLTimeDeflated)
        : null;
      formData.Iod2TLTimeRemoved = formData.Iod2TLTimeRemoved
        ? this.convertTimeToDuration(formData.Iod2TLTimeRemoved)
        : null;
      formData.Iod2TRTimeApplied = formData.Iod2TRTimeApplied
        ? this.convertTimeToDuration(formData.Iod2TRTimeApplied)
        : null;
      formData.Iod2TRTimeInflated = formData.Iod2TRTimeInflated
        ? this.convertTimeToDuration(formData.Iod2TRTimeInflated)
        : null;
      formData.Iod2TRTimeDeflated = formData.Iod2TRTimeDeflated
        ? this.convertTimeToDuration(formData.Iod2TRTimeDeflated)
        : null;
      formData.Iod2TRTimeRemoved = formData.Iod2TRTimeRemoved
        ? this.convertTimeToDuration(formData.Iod2TRTimeRemoved)
        : null;
      formData.Iod2TLscsBirthTime = formData.Iod2TLscsBirthTime
        ? this.convertTimeToDuration(formData.Iod2TLscsBirthTime)
        : null;
      formData.PodHandoverByTime = formData.PodHandoverByTime
        ? this.convertTimeToDuration(formData.PodHandoverByTime)
        : null;
      formData.PodReceivedByTime = formData.PodReceivedByTime
        ? this.convertTimeToDuration(formData.PodReceivedByTime)
        : null;
      formData.StTime = formData.StTime
        ? this.convertTimeToDuration(formData.StTime)
        : null;
      formData.SsoTime = formData.SsoTime
        ? this.convertTimeToDuration(formData.SsoTime)
        : null;
      (formData.TOPROCEDURE = []),
        (formData.TOSURGICALTEAM = []),
        (formData.TODIAGNOSES = this.toDiagnosisArr),
        (formData.TOPACKS = this.cleanArray(formData.TOPACKS));
      formData.TOIMPLANTS = this.cleanArray(formData.TOIMPLANTS);
      formData.TOCOUNT = this.cleanArray(formData.TOCOUNT);
      formData.TODRAINS = this.cleanArray(formData.TODRAINS);
      formData.TOSPECIMENS = this.cleanArray(formData.TOSPECIMENS);
      formData.TOINSTRUMENT_SET = this.cleanArray(formData.TOINSTRUMENT_SET);
      let payload = {
        ...formData,
        Dockey:
          actionType === 'edit' || actionType === 'copy' ? this.docKey : '',
        Dtid: 'ZMED_INTOP',
        Einri: this.paramsObject.einri,
        Patnr: this.paramsObject.patnr,
        Falnr: this.paramsObject.falnr,
        Lfdnr: this.paramsObject.lfdnr,
        Orgdo: 'F21IUAMC',
        AttendPhy: this.storageService.getUserProfile().Gpart,
        DocStatus: status,
      };

      this.subscription = this.admissionService
        .createIntraOpNurRecSetDoc(payload)
        .subscribe({
          next: (data: any) => {},
          error: (err: any) => {
            this.sharedService.waringSwallModel(`Error ${err}`);
            this.sharedService.waringSwallModel(
              `PUT Error at Intra Operative Nursing Record : ${err}`
            );
          },
          complete: () => {
            resolve(true);
            if (status === 'edit') {
              this.sharedService.successSwallModel(
                'Intra Operative Nursing Record updated successfully'
              );
            } else {
              this.sharedService.successSwallModel(
                'Intra Operative Nursing Record created successfully'
              );
            }
            this.successEvent.next(true);
          },
        });
    });
  }

  private cleanArray(arr: any): any {
    return (arr = arr.filter((item) =>
      Object.values(item).every((val) => !!val)
    ));
  }
  activeTab: string = 'surgicalsafetychecklist'; // Default tab
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
  userGroup: FormGroup;
  updateAdditionalInfo() {}

  cancelAdditionalInfo() {
    this.modalRef.hide();
  }
  modalRef?: BsModalRef;

  showPopup(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      backdrop: true,
      ignoreBackdropClick: false,
      class: 'additional-info-temp',
    });
    this.loginForm.reset();
  }

  initLoginForm() {
    this.loginForm = this.formBuilder.group({
      userName: [''],
      password: [''],
    });
  }

  userlogin() {
    const userName = this.loginForm.value.userName;
    const password = this.loginForm.value.password;

    if (userName && password) {
      this.emergencyService.login(userName, password).subscribe((res: any) => {
        const responseData = res._body ? JSON.parse(res._body) : res;
        if (responseData && responseData.d && responseData.d.Uname) {
          const uname = responseData.d.Uname;
          const currentDate = new Date();

          this.criticalForm.controls['PodReceivedBy'].setValue(uname);
          this.criticalForm.controls['Iod2TScrubNurse'].setValue(uname);
          this.criticalForm.controls['PodReceivedByTime'].setValue(
            currentDate.toTimeString().slice(0, 5)
          ); // Set the current time (HH:MM format)
        }
        this.modalRef.hide();
        this.loginForm.reset();
      });
    }
  }
  public getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }

  dateFormateString(dateString: any) {
    const convertDateFormat = (dateString: string): string => {
      const [day, month, year] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toString();
    };
    if (typeof dateString === 'string') {
      if (/\d{2}-\d{2}-\d{4}/.test(dateString)) {
        dateString = convertDateFormat(dateString);
      }
    }
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}T00:00:00`;
  }
  public parseTime(data: string) {
    // Check if data is valid and matches the expected format
    if (
      !data ||
      data.length !== 11 ||
      data[4] !== 'H' ||
      data[7] !== 'M' ||
      data[10] !== 'S'
    ) {
      return null;
    }

    // Extract hours, minutes, and seconds from the input string
    const hours = parseInt(data.slice(2, 4), 10);
    const minutes = parseInt(data.slice(5, 7), 10);
    const seconds = parseInt(data.slice(8, 10), 10);

    // Check if extracted values are valid numbers
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
      return null;
    }

    // Format hours, minutes, and seconds with leading zeros if necessary
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    // Construct the formatted time string
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    return null;
  }

  convertTimeToDuration(timeString: string): string {
    if (!timeString) return '';

    const [hours, minutes, seconds] = timeString.split(':').map(Number);

    // Ensure values are properly formatted
    const formattedHours = hours ? `PT${hours}H` : 'PT00H';
    const formattedMinutes = minutes ? `${minutes}M` : '00M';
    const formattedSeconds = seconds ? `${seconds}S` : '00S';

    return `${formattedHours}${formattedMinutes}${formattedSeconds}`;
  }
  public openModalForDiagnosis() {
    if (this.criticalForm.value.Iod1NoDiagnoses) return;
    this.diagnosisNotesKardex.openModalForDiagnosisKardex();
  }

  public deleteDiagnosisFromTable(index, i) {
    this.toDiagnosisArr.splice(index, 1);
  }
  duplicates: any[];
  @Input() toDiagnosisArr: any = [];
  importDiagnosisData(data) {
    data.forEach((el) => {
      this.toDiagnosisArr = this.toDiagnosisArr.concat({
        Dockey: '',
        DCode: el.DiagKey1,
        DDescription: el.DiagShorttext,
        DRemarks: el.DiagText,
        DAdmission: el.AdmissionDia,
        DDischarge: el.DischargeDia,
        DWorking: el.WorkDiagInd,
        DPreoperative: el.PreopDiagInd,
        DSurgery: el.SurgeryDia,
        DDeath: el.CauseOfDeath,
        DDepartment: el.DeptMainDia,
        DHospital: el.HospMainDia,
      });
    });
    this.duplicates = [];
    this.duplicates = this.findDuplicatesDiagnosis();
    this.toDiagnosisArr = this.toDiagnosisArr.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.DCode === value.DCode)
    );
    if (this.duplicates.length > 0) {
      this.errorMsgForDuplicatesDiagnosis();
    }
  }

  findDuplicatesDiagnosis() {
    let tempArr = [];
    const lookup = this.toDiagnosisArr.reduce((a, e) => {
      a[e.DCode] = ++a[e.DCode] || 0;
      return a;
    }, {});
    tempArr = this.toDiagnosisArr.filter((e) => lookup[e.DCode]);
    return tempArr.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.DCode === value.DCode)
    );
  }

  errorMsgForDuplicatesDiagnosis() {
    let codeArr = [];
    this.duplicates.forEach((element) => {
      codeArr.push(element.DCode);
    });

    Swal.fire({
      text: `${codeArr.toString()} is/are already Imported `,
      icon: 'warning',
      confirmButtonText: 'Ok',
      customClass: { popup: 'myalertpopup' },
    });
  }
}
