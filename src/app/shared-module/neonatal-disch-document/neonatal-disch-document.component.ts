import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StorageService } from '@services/storage.service';
import { Subscription } from 'rxjs';
import { ErVitalsComponent } from './er-vitals/er-vitals.component';
import { DatePipe } from '@angular/common';
import { SharedService } from '@services/shared.service';
import { DayCaseDashboardService } from '@services/day-case.dashboard/day-case-dashboard.service';
import { ActivatedRoute } from '@angular/router';
import { DataShareService } from '@services/data-share.service';
import { ActionType } from '@services/interfaces/common.enum';
import { AdmissionService } from '@services/admission/admission.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';

@Component({
  selector: 'app-neonatal-disch-document',
  templateUrl: './neonatal-disch-document.component.html',
  styleUrls: ['./neonatal-disch-document.component.scss']
})
export class NeonatalDischDocumentComponent implements OnInit {
  @ViewChild('erVitalsModal') erVitalsModal: ErVitalsComponent;
  @Input() soapFormEvent: string;
  @Output() reloadTableList = new EventEmitter();
  neonatalDischarge: FormGroup;
  selectedTabName: string = 'Skin';
  selectedTabNameMedication: string = 'Hospital Medication';
  isChecked: any;
  paramsObject: any;
  encounterId: any;
  public toVitalsArr: any = [];
  drugArray: any = [];
  selectedMedicationOrder: any = [];
  modalRefUpdateName: BsModalRef;
  tabList = [
    'Skin',
    'Head & Neck',
    'Chest and Thoracic',
    'Abdomen',
    'Genitalia',
    'Musculoskeletal / Neuromuscular',
    'Malformation',
    'General Impression',
  ];

  public medicationTabList = [
    'Hospital Medication',
    'Dicharge Medication'
  ];
  public modeOfDeliveryList = [
    { value: '0', label: 'Vaginal' },
    { value: '1', label: 'C-Section' },
    { value: '2', label: 'Forceps' },
    { value: '3', label: 'Ventouse' },
    { value: '4', label: 'Head Pres.' },
    { value: '5', label: 'Breech' },
    { value: '6', label: 'Others' }
  ];
  public patientCondition = [
    { value: '0', label: 'Stable' },
    { value: '1', label: 'Tranferred' },
    { value: '2', label: 'Deceased' }
  ];

  public weight = [
    { value: '0', label: 'gm' },
    { value: '1', label: 'kg' }
  ]
  public Breath = [
    { value: '0', label: 'Equal' },
    { value: '1', label: ' Wheezes/Rales' },
    { value: '2', label: 'Diminished' },
    { value: '3', label: 'Others' },
  ]
  public Moro = [
    { value: '0', label: 'Complete' },
    { value: '1', label: 'InComplete' },
    { value: '2', label: 'Absent' },
  ]

  public skinColorList = [
    { value: '0', label: 'Normal' },
    { value: '1', label: 'Pale' },
    { value: '2', label: 'Jaundice' },
    { value: '3', label: 'Mottled' },
    { value: '4', label: 'Flushed' },
    { value: '5', label: 'Petechiae' },
    { value: '6', label: 'Cyanotic' },
    { value: '7', label: 'Others' }
  ];
  docKey: any;
  private subscription: Subscription;
  private actionTypeSubscription$: Subscription;
  constructor(private formBuilder: FormBuilder, private _route: ActivatedRoute, public storageService: StorageService, private datePipe: DatePipe, private modalService: BsModalService, private ePrescriptionService: EPrescriptionService,
    private dataShareService: DataShareService, private dayCaseDashboard: DayCaseDashboardService, private sharedService: SharedService, private admissionService: AdmissionService) {
    this._route.queryParams.subscribe((params) => {
      this.paramsObject = params;
    });

    this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe(
      (data) => {
        if (data != null) {
          if (data.type == ActionType.Add$ && data.value == '') {
            this.docKey = data.value.Dockey;
          }
          if (data.type == ActionType.Update$ && data.value) {
            this.docKey = data.value.docKey;
            this.getNeonatalDischargeDocDetails(data.value.docKey);
          }
          if (data.type == ActionType.Copy$ && data.value) {
            this.docKey = data.value.docKey;
            this.getNeonatalDischargeDocDetails(data.value.docKey);
          }
        }
      }
    );
  }

  ngOnInit(): void {
    this.initForm();
  }

    ngOnChanges(changes: SimpleChanges) {
      if(changes.soapFormEvent.currentValue == 'add') {
        if(this.admissionService.isCloneNeonatalDischarge) {
        this.createNeonatalDischargeDocument('3')
        }
        else {
          this.createNeonatalDischargeDocument('1')
        }
      }
      if(changes.soapFormEvent.currentValue == 'edit') {
        this.createNeonatalDischargeDocument('1')
      }
  
      if(changes.soapFormEvent.currentValue == 'release') {
        if(this.admissionService.isCloneNeonatalDischarge) {
          this.createNeonatalDischargeDocument('5')
        } else {
          if(this.admissionService.isEditNeonatalDischarge) {
            this.createNeonatalDischargeDocument('2')
          } else {
            this.createNeonatalDischargeDocument('4')
          }
        }
      }
  
      if (this.admissionService.isEditNeonatalDischarge || this.admissionService.isCloneNeonatalDischarge) {
        this.getNeonatalDischargeDocDetails(this.admissionService.selectedCurrentDocDetails.Dockey);
      }
    }

  initForm(data?) {
    let currentTime = this.datePipe.transform(new Date(), 'hh:mm:ss');
    console.log(this.storageService, "this.storageService?.patientData");
    
    this.neonatalDischarge = this.formBuilder.group({
      Dockey: [data?.Dockey || ''],
      Dtid: "ZMED_NEODS",
      Einri: this.paramsObject.einri,
      Patnr: this.paramsObject.patnr,
      Falnr: this.paramsObject.falnr,
      Lfdnr: this.paramsObject.lfdnr,
      Orgdo: this.storageService?.patientData?.deptOrgUnit,
      AttendPhy: this.storageService.getUserProfile()?.Gpart,
      Datee: [this.getDate(data?.Datee) || new Date()],
      Timee: [this.parseTime(data?.Timee) || currentTime],
      Name: [data?.Name || this.storageService?.patientData?.name],
      Fname: [data?.Fname || ''],
      Ga: [data?.Ga || ''],
      GaDays: [data?.GaDays || ''],
      Cga: [data?.Cga || ''],
      CgaDays: [data?.CgaDays || ''],
      ChronoAge: [data?.ChronoAge || ''],
      DischDate: [this.getDate(data?.DischDate) || new Date()],
      AdmDate: [this.getDate(data?.AdmDate) || null],
      AdmTime: [this.parseTime(data?.AdmTime) || null],
      BirthWeight: [data?.BirthWeight || ''],
      BirthWgtUnit: [data?.BirthWgtUnit || ''],
      AdmWeight: [data?.AdmWeight || ''],
      AdmWgtUnit: [data?.AdmWgtUnit || ''],
      DischWeight: [data?.DischWeight || ''],
      DischWgtUnit: [data?.DischWgtUnit || ''],
      Transfer: [data?.Transfer || '0'],
      TransferDate: [this.getDate(data?.TransferDate) || new Date()],
      TransferPlace: [data?.TransferPlace || ''],
      AttendingPhy: [data?.AttendingPhy || ''],
      AdmReason: [data?.AdmReason || ''],
      CourseNicu: [data?.CourseNicu || ''],
      SSkincolor: [data?.SSkincolor || ''],
      SSkincolorT: [data?.SSkincolorT || ''],
      SaNormal: [data?.SaNormal || false],
      SaRash: [data?.SaRash || false],
      SaBruising: [data?.SaBruising || false],
      SaLanugo: [data?.SaLanugo || false],
      SaEdema: [data?.SaEdema || false],
      SaDry: [data?.SaDry || false],
      SaMongolian: [data?.SaMongolian || false],
      SaSkinTags: [data?.SaSkinTags || false],
      SaPetechia: [data?.SaPetechia || false],
      SaCoatings: [data?.SaCoatings || false],
      SaComments: [data?.SaComments || ''],
      HsNormal: [data?.HsNormal || false],
      HsForceps: [data?.HsForceps || false],
      HsMolding: [data?.HsMolding || false],
      HsCaput: [data?.HsCaput || false],
      HsLacerations: [data?.HsLacerations || false],
      HsOverriding: [data?.HsOverriding || false],
      HsCephalhema: [data?.HsCephalhema || false],
      HsOther: [data?.HsOther || false],
      HsOtherT: [data?.HsOtherT || { value: '', disabled: true }],
      HfAnterior: [data?.HfAnterior || false],
      HfAnteriorOc: [data?.HfAnteriorOc || { value: '', disabled: true }],
      HfAother: [data?.HfAother || { value: '', disabled: true }],
      HfAsize: [data?.HfAsize || { value: '', disabled: true }],
      HfPosterior: [data?.HfPosterior || false],
      HfPosteriorOc: [data?.HfPosteriorOc || { value: '', disabled: true }],
      HfPother: [data?.HfPother || { value: '', disabled: true }],
      HfPsize: [data?.HfPsize || { value: '', disabled: true }],
      HeNormal: [data?.HeNormal || false],
      HeLowSet: [data?.HeLowSet || false],
      HePreauricular: [data?.HePreauricular || false],
      HeBleeding: [data?.HeBleeding || false],
      HeOther: [data?.HeOther || false],
      HeOtherT: [data?.HeOtherT || { value: '', disabled: true }],
      HeyClear: [data?.HeyClear || false],
      HeyScleral: [data?.HeyScleral || false],
      HeyEdema: [data?.HeyEdema || false],
      HeyConjunct: [data?.HeyConjunct || false],
      HeyRed: [data?.HeyRed || false],
      HeyOther: [data?.HeyOther || false],
      HeyOtherT: [data?.HeyOtherT || { value: '', disabled: true }],
      HnNostrils: [data?.HnNostrils || false],
      HnClosed: [data?.HnClosed || false],
      HnOther: [data?.HnOther || false],
      HnOtherT: [data?.HnOtherT || { value: '', disabled: true }],
      HmNormal: [data?.HmNormal || false],
      HmMovement: [data?.HmMovement || false],
      HmSymmetry: [data?.HmSymmetry || false],
      HmAsymmetry: [data?.HmAsymmetry || false],
      HmCleftLip: [data?.HmCleftLip || false],
      HmCleftPalate: [data?.HmCleftPalate || false],
      HmOther: [data?.HmOther || false],
      HmOtherT: [data?.HmOtherT || { value: '', disabled: true }],
      HnNormal: [data?.HnNormal || false],
      HnShort: [data?.HnShort || false],
      HnStraight: [data?.HnStraight || false],
      HnWebbing: [data?.HnWebbing || false],
      HnNother: [data?.HnNother || false],
      HnNotherT: [data?.HnNotherT || { value: '', disabled: true }],
      CcSymmetrical: [data?.CcSymmetrical || false],
      CcAssymetrical: [data?.CcAssymetrical || false],
      CcOther: [data?.CcOther || false],
      CcOtherT: [data?.CcOtherT || { value: '', disabled: true }],
      CcaRegularHr: [data?.CcaRegularHr || false],
      CcaIrregularHr: [data?.CcaIrregularHr || false],
      CcaBradycardia: [data?.CcaBradycardia || false],
      CcaTachycardia: [data?.CcaTachycardia || false],
      CcaArrhythmia: [data?.CcaArrhythmia || false],
      CcaMurmurs: [data?.CcaMurmurs || false],
      CcaCapillary: [data?.CcaCapillary || false],
      CcaFemoral: [data?.CcaFemoral || false],
      CcaBrachial: [data?.CcaBrachial || false],
      CcaRadial: [data?.CcaRadial || false],
      CcaOther: [data?.CcaOther || false],
      CcaOtherT: [data?.CcaOtherT || { value: '', disabled: true }],
      CrRegularRr: [data?.CrRegularRr || false],
      CrIrregularRr: [data?.CrIrregularRr || false],
      CrGrunt: [data?.CrGrunt || false],
      CrBradypnea: [data?.CrBradypnea || false],
      CrTachypnea: [data?.CrTachypnea || false],
      CrNasal: [data?.CrNasal || false],
      CrApnea: [data?.CrApnea || false],
      CrRecession: [data?.CrRecession || false],
      CrOther: [data?.CrOther || false],
      CrOtherT: [data?.CrOtherT || { value: '', disabled: true }],
      CrBreathSound: [data?.CrBreathSound || false],
      CrBreathSounds: [data?.CrBreathSounds || { value: '', disabled: true }],
      CrBreathSoundt: [data?.CrBreathSoundt || ''],
      CrIntubated: [data?.CrIntubated || false],
      CrIntubatedYn: [data?.CrIntubatedYn || { value: '', disabled: true }],
      CrItubeSize: [data?.CrItubeSize || { value: '', disabled: true }],
      CrItubeLevel: [data?.CrItubeLevel || { value: '', disabled: true }],
      CrIintubation: [this.getDate(data?.CrIintubation) || { value: new Date(), disabled: true }],
      CrIextubation: [this.getDate(data?.CrIextubation) || { value: new Date(), disabled: true }],
      CrReintubation: [data?.CrReintubation || false],
      CrReintubationYn: [data?.CrReintubationYn || ''],
      CrRtubeSize: [data?.CrRtubeSize || { value: '', disabled: true }],
      CrRtubeLevel: [data?.CrRtubeLevel || { value: '', disabled: true }],
      CrRdate: [this.getDate(data?.CrRdate) || { value: new Date(), disabled: true }],
      CrRentryDate: [this.getDate(data?.CrRentryDate) || { value: new Date(), disabled: true }],
      CbNormal: [data?.CbNormal || false],
      CbAccessory: [data?.CbAccessory || false],
      CbNodule: [data?.CbNodule || false],
      CbOther: [data?.CbOther || false],
      CbOtherT: [data?.CbOtherT || { value: '', disabled: true }],
      AAbdominal: [data?.AAbdominal || ''],
      AAbdominalT: [data?.AAbdominalT || { value: '', disabled: true }],
      ALiver: [data?.ALiver || ''],
      ALiverT: [data?.ALiverT || { value: '', disabled: true }],
      ASpleen: [data?.ASpleen || ''],
      ASpleenT: [data?.ASpleenT || { value: '', disabled: true }],
      AKidney: [data?.AKidney || ''],
      AKidneyT: [data?.AKidneyT || { value: '', disabled: true }],
      AHernia: [data?.AHernia || ''],
      AHerniaT: [data?.AHerniaT || { value: '', disabled: true }],
      AArteries: [data?.AArteries || false],
      AArteriesT: [data?.AArteriesT || { value: '', disabled: true }],
      AShape: [data?.AShape || false],
      AShapeNa: [data?.AShapeNa || { value: '', disabled: true }],
      AShapeT: [data?.AShapeT || { value: '', disabled: true }],
      AVeins: [data?.AVeins || false],
      AVeinsT: [data?.AVeinsT || { value: '', disabled: true }],
      AUvc: [data?.AUvc || false],
      AUinsertion: [this.getDate(data?.AUinsertion) || { value: new Date(), disabled: true }],
      AUremoval: [this.getDate(data?.AUremoval) || { value: new Date(), disabled: true }],
      AUcomplication: [data?.AUcomplication || { value: '', disabled: true }],
      AUcomplicationT: [data?.AUcomplicationT || { value: '', disabled: true }],
      AUac: [data?.AUac || false],
      AUainsertion: [this.getDate(data?.AUainsertion) || { value: new Date(), disabled: true }],
      AUaremoval: [this.getDate(data?.AUaremoval) || { value: new Date(), disabled: true }],
      AUacomplication: [data?.AUacomplication || { value: '', disabled: true }],
      AUacomplicationsT: [data?.AUacomplicationsT || { value: '', disabled: true }],
      AComment: [data?.AComment || false],
      ACommentT: [data?.ACommentT || ''],
      GmNormal: [data?.GmNormal || false],
      GmEdema: [data?.GmEdema || false],
      GmHydrocele: [data?.GmHydrocele || false],
      GmTestes: [data?.GmTestes || false],
      GmHypoxemia: [data?.GmHypoxemia || false],
      GmOther: [data?.GmOther || false],
      GmOtherT: [data?.GmOtherT || { value: '', disabled: true }],
      GfNormal: [data?.GfNormal || false],
      GfVaginal: [data?.GfVaginal || false],
      GfHymenal: [data?.GfHymenal || false],
      GfEdema: [data?.GfEdema || false],
      GfOther: [data?.GfOther || false],
      GfOtherT: [data?.GfOtherT || { value: '', disabled: true }],
      GaPatent: [data?.GaPatent || false],
      GaHemorrh: [data?.GaHemorrh || false],
      GaOther: [data?.GaOther || false],
      GaOtherT: [data?.GaOtherT || { value: '', disabled: true }],
      GtDimple: [data?.GtDimple || false],
      GtOther: [data?.GtOther || false],
      GtOtherT: [data?.GtOtherT || { value: '', disabled: true }],
      GComment: [data?.GComment || ''],
      MmNormal: [data?.MmNormal || false],
      MmTremors: [data?.MmTremors || false],
      MmHypotonic: [data?.MmHypotonic || false],
      MmHypertonic: [data?.MmHypertonic || false],
      MmOther: [data?.MmOther || false],
      MmOtherT: [data?.MmOtherT || { value: '', disabled: true }],
      MrMoro: [data?.MrMoro || false],
      MrMoroV: [data?.MrMoroV || { value: '', disabled: true }],
      MrRooting: [data?.MrRooting || false],
      MrStepping: [data?.MrStepping || false],
      MrGag: [data?.MrGag || false],
      MrSucking: [data?.MrSucking || false],
      MrGrasp: [data?.MrGrasp || false],
      MrOther: [data?.MrOther || false],
      MrOtherT: [data?.MrOtherT || { value: '', disabled: true }],
      McNormal: [data?.McNormal || false],
      McWeak: [data?.McWeak || false],
      McHigh: [data?.McHigh || false],
      McAbsent: [data?.McAbsent || false],
      McOther: [data?.McOther || false],
      McOtherT: [data?.McOtherT || { value: '', disabled: true }],
      MaActive: [data?.MaActive || false],
      MaLethargic: [data?.MaLethargic || false],
      MaNoResponse: [data?.MaNoResponse || false],
      MaHypooactive: [data?.MaHypooactive || false],
      MaHyperactive: [data?.MaHyperactive || false],
      MaOther: [data?.MaOther || false],
      MaOtherT: [data?.MaOtherT || { value: '', disabled: true }],
      MuNormal: [data?.MuNormal || false],
      MuFractures: [data?.MuFractures || false],
      MuClavicle: [data?.MuClavicle || false],
      MuSyndactyly: [data?.MuSyndactyly || false],
      MuPolydactyly: [data?.MuPolydactyly || false],
      MuOther: [data?.MuOther || false],
      MuOtherT: [data?.MuOtherT || { value: '', disabled: true }],
      MlNormal: [data?.MlNormal || false],
      MlHipClick: [data?.MlHipClick || false],
      MlFractures: [data?.MlFractures || false],
      MlSyndactyly: [data?.MlSyndactyly || false],
      MlPolydactyly: [data?.MlPolydactyly || false],
      MlTalipes: [data?.MlTalipes || false],
      MlOther: [data?.MlOther || false],
      MlOtherT: [data?.MlOtherT || { value: '', disabled: true }],
      MPalmarCreases: [data?.MPalmarCreases || false],
      MPalmarCreasesT: [data?.MPalmarCreasesT || { value: '', disabled: true }],
      MComment: [data?.MComment || ''],
      MMalformation: [data?.MMalformation || ''],
      MMalformationT: [data?.MMalformationT || { value: '', disabled: true }],
      GeneralImpression: [data?.GeneralImpression || ''],
      FinalDiagn: [data?.FinalDiagn || ''],
      Substances: [data?.Substances || ''],
      Consultations: [data?.Consultations || '0'],
      ConsultationsT: [data?.ConsultationsT || ''],
      Complications: [data?.Complications || '0'],
      ComplicationsT: [data?.ComplicationsT || ''],
      PatCondition: [data?.PatCondition || ''],
      PatConditionT: [data?.PatConditionT || ''],
      Instructions: [data?.Instructions || ''],
      DocStatus: "1",
    })
  }

  getNeonatalDischargeDocDetails(docKey?) {
    this.subscription = this.dayCaseDashboard
      .fetcNeonatalDischargeDocDetails(docKey)
      .subscribe({
        next: (data: any) => {
          this.initForm(data?.d?.results[0]);
          this.toVitalsArr = data?.d?.results[0].TOVITALSIGNS.results
        },
        error: (err: any) => {
          this.sharedService.waringSwallModel(`Error ${err}`);
          this.sharedService.waringSwallModel(
            `POST Error at Nursing care plans: ${err}`
          );
        },
      });
  }

  public openModalVital() {
    if (this.isChecked) return;
    const item = {
      Einri: this.paramsObject.einri,
      Patnr: this.paramsObject.patnr,
      Falnr: this.paramsObject.falnr,
      Lfdnr: this.paramsObject.lfdnr,
      Patient: this.storageService?.patientData?.name,
      admissionDate: this.storageService.patientData.periodStart,
    };
    this.erVitalsModal.openModalForErVital(item);
  }

  public handleCheckboxVitals(event) {
    this.isChecked = event.target.checked;
  }

  public deleteVitalsFromTable(index: number) {
    if (index > -1) {
      this.toVitalsArr.splice(index, 1);
    }
  }

  toggleInput(checkboxName: string, inputName: string) {
    const checkboxControl = this.neonatalDischarge.get(checkboxName);
    const inputControl = this.neonatalDischarge.get(inputName);
    if (checkboxControl?.value) {
      inputControl?.enable();
      if (checkboxName == 'AShape') {
        this.neonatalDischarge.get('AShapeNa')?.setValue('0');
      }
      if (checkboxName == 'AUvc') {
        this.neonatalDischarge.get('AUcomplication')?.setValue('1');
        this.neonatalDischarge.get('AUinsertion')?.enable();
        this.neonatalDischarge.get('AUremoval')?.enable();
      }
      if (checkboxName == 'AUac') {
        this.neonatalDischarge.get('AUacomplication')?.setValue('1');
        this.neonatalDischarge.get('AUainsertion')?.enable();
        this.neonatalDischarge.get('AUaremoval')?.enable();
      }
      if (checkboxName == 'CrIntubated') {
        this.neonatalDischarge.get('CrIntubatedYn')?.setValue('1');
      }
      if (checkboxName == 'CrReintubation') {
        this.neonatalDischarge.get('CrReintubationYn')?.setValue('1');
      }
      if (checkboxName == 'HfAnterior') {
        this.neonatalDischarge.get('HfAnteriorOc')?.setValue('0');
      }
      if (checkboxName == 'HfPosterior') {
        this.neonatalDischarge.get('HfPosteriorOc')?.setValue('0');
      }
    } else {
      inputControl?.disable();
      inputControl?.setValue('');
      if (checkboxName == 'AShape') {
        this.neonatalDischarge.get('AShapeT')?.disable();
      }
      if (checkboxName == 'AUvc') {
        this.neonatalDischarge.get('AUcomplication')?.disable();
        this.neonatalDischarge.get('AUinsertion')?.disable();
        this.neonatalDischarge.get('AUremoval')?.disable();
        this.neonatalDischarge.get('AUcomplicationT')?.disable();
      }
      if (checkboxName == 'AUac') {
        this.neonatalDischarge.get('AUacomplicationsT')?.disable();
        this.neonatalDischarge.get('AUacomplication')?.disable();
        this.neonatalDischarge.get('AUainsertion')?.disable();
        this.neonatalDischarge.get('AUaremoval')?.disable();
      }
      if (checkboxName == 'HfAnterior') {
        this.neonatalDischarge.get('HfAnteriorOc')?.disable();
        this.neonatalDischarge.get('HfAother')?.disable();
        this.neonatalDischarge.get('HfAsize')?.disable();
        this.neonatalDischarge.get('HfAother')?.setValue('');
        this.neonatalDischarge.get('HfAsize')?.setValue('');
      }
      if (checkboxName == 'HfPosterior') {
        this.neonatalDischarge.get('HfPosteriorOc')?.disable();
        this.neonatalDischarge.get('HfPother')?.disable();
        this.neonatalDischarge.get('HfPsize')?.disable();
        this.neonatalDischarge.get('HfPother')?.setValue('');
        this.neonatalDischarge.get('HfPsize')?.setValue('');
      }
      if (checkboxName == 'CrIntubated') {
        this.neonatalDischarge.get('CrIntubatedYn')?.disable();
        this.neonatalDischarge.get('CrItubeSize')?.disable();
        this.neonatalDischarge.get('CrItubeLevel')?.disable();
        this.neonatalDischarge.get('CrIintubation')?.disable();
        this.neonatalDischarge.get('CrIextubation')?.disable();
        this.neonatalDischarge.get('CrIntubatedYn')?.setValue('');
        this.neonatalDischarge.get('CrItubeSize')?.setValue('');
        this.neonatalDischarge.get('CrItubeLevel')?.setValue('');
        this.neonatalDischarge.get('CrIintubation')?.setValue('');
        this.neonatalDischarge.get('CrIextubation')?.setValue('');

      }
      if (checkboxName == 'CrReintubation') {
        this.neonatalDischarge.get('CrRtubeSize')?.disable();
        this.neonatalDischarge.get('CrRtubeLevel')?.disable();
        this.neonatalDischarge.get('CrRdate')?.disable();
        this.neonatalDischarge.get('CrRentryDate')?.disable();
        this.neonatalDischarge.get('CrRtubeSize')?.setValue('');
        this.neonatalDischarge.get('CrRtubeLevel')?.setValue('');
        this.neonatalDischarge.get('CrRdate')?.setValue('');
        this.neonatalDischarge.get('CrRentryDate')?.setValue('');
      }
    }
  }
  toggleRadio(controlName: string, value: string, textinput?: string) {
    if (this.neonatalDischarge.get(controlName)?.value === value) {
      this.neonatalDischarge.get(controlName)?.setValue(null);
    }
    if (value === '1') {
      if (controlName == 'AUcomplication' || controlName == 'AUacomplication' || controlName == 'MMalformation' || controlName == 'CrIntubatedYn' || controlName == 'CrReintubationYn' || controlName == 'AHernia') {
        this.neonatalDischarge.get(textinput)?.disable();
        this.neonatalDischarge.get(textinput)?.setValue('');
        if (controlName == 'CrIntubatedYn') {
          this.neonatalDischarge.get('CrItubeSize')?.disable();
          this.neonatalDischarge.get('CrItubeLevel')?.disable();
          this.neonatalDischarge.get('CrIintubation')?.disable();
          this.neonatalDischarge.get('CrIextubation')?.disable();
          this.neonatalDischarge.get('CrItubeSize')?.setValue('');
          this.neonatalDischarge.get('CrItubeLevel')?.setValue('');
          this.neonatalDischarge.get('CrIintubation')?.setValue('');
          this.neonatalDischarge.get('CrIextubation')?.setValue('');
        }
        if (controlName == 'CrReintubationYn') {
          this.neonatalDischarge.get('CrRtubeSize')?.disable();
          this.neonatalDischarge.get('CrRtubeLevel')?.disable();
          this.neonatalDischarge.get('CrRdate')?.disable();
          this.neonatalDischarge.get('CrRentryDate')?.disable();
          this.neonatalDischarge.get('CrRtubeSize')?.setValue('');
          this.neonatalDischarge.get('CrRtubeLevel')?.setValue('');
          this.neonatalDischarge.get('CrRdate')?.setValue('');
          this.neonatalDischarge.get('CrRentryDate')?.setValue('');
        }
        if (controlName == 'AHernia') {
          this.neonatalDischarge.get('AHerniaT')?.disable();
          this.neonatalDischarge.get('AHerniaT')?.setValue('');
        }
      } else {
        this.neonatalDischarge.get(textinput)?.enable(); // Enable input when abnormal (Yes)
        if (controlName == 'HfAnteriorOc') {
          this.neonatalDischarge.get('HfAsize')?.enable();
        }
        if (controlName == 'HfPosteriorOc') {
          this.neonatalDischarge.get('HfPsize')?.enable();
        }
      }
    } else {
      if (controlName == 'AUcomplication' || controlName == 'AUacomplication' || controlName == 'MMalformation' || controlName == 'CrIntubatedYn' || controlName == 'CrReintubationYn' || controlName == 'AHernia') {
        this.neonatalDischarge.get(textinput)?.enable();
        if (controlName == 'CrIntubatedYn') {
          this.neonatalDischarge.get('CrItubeSize')?.enable();
          this.neonatalDischarge.get('CrItubeLevel')?.enable();
          this.neonatalDischarge.get('CrIintubation')?.enable();
          this.neonatalDischarge.get('CrIextubation')?.enable();
        }
        if (controlName == 'CrReintubationYn') {
          this.neonatalDischarge.get('CrRtubeSize')?.enable();
          this.neonatalDischarge.get('CrRtubeLevel')?.enable();
          this.neonatalDischarge.get('CrRdate')?.enable();
          this.neonatalDischarge.get('CrRentryDate')?.enable();
        }

        if (controlName == 'AHernia') {
          this.neonatalDischarge.get('AHerniaT')?.enable
        }

      } else {
        this.neonatalDischarge.get(textinput)?.disable(); // Disable input when normal (No)
        this.neonatalDischarge.get(textinput)?.setValue(''); // Clear input if disable
        if (controlName == 'HfAnteriorOc') {
          this.neonatalDischarge.get('HfAsize')?.disable();
          this.neonatalDischarge.get('HfAsize')?.setValue('');
        }
        if (controlName == 'HfPosteriorOc') {
          this.neonatalDischarge.get('HfPsize')?.disable();
          this.neonatalDischarge.get('HfPsize')?.setValue('');
        }
        if (controlName == 'CrIntubatedYn') {
          this.neonatalDischarge.get('CrItubeSize')?.disable();
          this.neonatalDischarge.get('CrItubeLevel')?.disable();
          this.neonatalDischarge.get('CrIintubation')?.disable();
          this.neonatalDischarge.get('CrIextubation')?.disable();
          this.neonatalDischarge.get('CrItubeSize')?.setValue('');
          this.neonatalDischarge.get('CrItubeLevel')?.setValue('');
          this.neonatalDischarge.get('CrIintubation')?.setValue('');
          this.neonatalDischarge.get('CrIextubation')?.setValue('');
        }
        if (controlName == 'CrReintubationYn') {
          this.neonatalDischarge.get('CrRtubeSize')?.disable();
          this.neonatalDischarge.get('CrRtubeLevel')?.disable();
          this.neonatalDischarge.get('CrRdate')?.disable();
          this.neonatalDischarge.get('CrRentryDate')?.disable();
          this.neonatalDischarge.get('CrRtubeSize')?.setValue('');
          this.neonatalDischarge.get('CrRtubeLevel')?.setValue('');
          this.neonatalDischarge.get('CrRdate')?.setValue('');
          this.neonatalDischarge.get('CrRentryDate')?.setValue('');
        }
      }
    }
  }
  isFormValidError: boolean = false;
  createNeonatalDischargeDocument(docStatus: any, actiontype?: string) {
    return new Promise((resolve, reject) => {
      this.isFormValidError = true;
      this.neonatalDischarge.value.DocStatus = docStatus;
      let paylaod = this.neonatalDischarge.value;
      paylaod['HsOtherT'] = this.neonatalDischarge.getRawValue().HsOtherT;
      paylaod['HfAnteriorOc'] = this.neonatalDischarge.getRawValue().HfAnteriorOc;
      paylaod['HfAother'] = this.neonatalDischarge.getRawValue().HfAother;
      paylaod['HfAsize'] = this.neonatalDischarge.getRawValue().HfAsize;
      paylaod['HfPosteriorOc'] = this.neonatalDischarge.getRawValue().HfPosteriorOc;
      paylaod['HfPother'] = this.neonatalDischarge.getRawValue().HfPother;
      paylaod['HfPsize'] = this.neonatalDischarge.getRawValue().HfPsize;
      paylaod['HeOtherT'] = this.neonatalDischarge.getRawValue().HeOtherT;
      paylaod['HeyOtherT'] = this.neonatalDischarge.getRawValue().HeyOtherT;
      paylaod['HnOtherT'] = this.neonatalDischarge.getRawValue().HnOtherT;
      paylaod['HmOtherT'] = this.neonatalDischarge.getRawValue().HmOtherT;
      paylaod['HnNotherT'] = this.neonatalDischarge.getRawValue().HnNotherT;
      paylaod['CcOtherT'] = this.neonatalDischarge.getRawValue().CcOtherT;
      paylaod['CcaOtherT'] = this.neonatalDischarge.getRawValue().CcaOtherT;
      paylaod['CrOtherT'] = this.neonatalDischarge.getRawValue().CrOtherT;
      paylaod['CrBreathSounds'] = this.neonatalDischarge.getRawValue().CrBreathSounds;
      // paylaod['CrBreathSoundt'] = this.neonatalDischarge.getRawValue().CrBreathSoundt;
      paylaod['CrIntubatedYn'] = this.neonatalDischarge.getRawValue().CrIntubatedYn;
      paylaod['CrItubeSize'] = this.neonatalDischarge.getRawValue().CrItubeSize;
      paylaod['CrItubeLevel'] = this.neonatalDischarge.getRawValue().CrItubeLevel;
      paylaod['CrIintubation'] = this.neonatalDischarge.getRawValue().CrIintubation;
      paylaod['CrIextubation'] = this.neonatalDischarge.getRawValue().CrIextubation;
      paylaod['CrRtubeSize'] = this.neonatalDischarge.getRawValue().CrRtubeSize;
      paylaod['CrRtubeLevel'] = this.neonatalDischarge.getRawValue().CrRtubeLevel;
      paylaod['CrRdate'] = this.neonatalDischarge.getRawValue().CrRdate;
      paylaod['CrRentryDate'] = this.neonatalDischarge.getRawValue().CrRentryDate;
      paylaod['CbOtherT'] = this.neonatalDischarge.getRawValue().CbOtherT;
      paylaod['AAbdominalT'] = this.neonatalDischarge.getRawValue().AAbdominalT;
      paylaod['ALiverT'] = this.neonatalDischarge.getRawValue().ALiverT;
      paylaod['ASpleenT'] = this.neonatalDischarge.getRawValue().ASpleenT;
      paylaod['AKidneyT'] = this.neonatalDischarge.getRawValue().AKidneyT;
      paylaod['AHerniaT'] = this.neonatalDischarge.getRawValue().AHerniaT;
      paylaod['AArteriesT'] = this.neonatalDischarge.getRawValue().AArteriesT;
      paylaod['AShapeNa'] = this.neonatalDischarge.getRawValue().AShapeNa;
      paylaod['AShapeT'] = this.neonatalDischarge.getRawValue().AShapeT;
      paylaod['AVeinsT'] = this.neonatalDischarge.getRawValue().AVeinsT;
      paylaod['AKidneyT'] = this.neonatalDischarge.getRawValue().AKidneyT;
      paylaod['AUinsertion'] = this.neonatalDischarge.getRawValue().AUinsertion;
      paylaod['AUremoval'] = this.neonatalDischarge.getRawValue().AUremoval;
      paylaod['AUcomplication'] = this.neonatalDischarge.getRawValue().AUcomplication;
      paylaod['AUcomplicationT'] = this.neonatalDischarge.getRawValue().AUcomplicationT;
      paylaod['AUainsertion'] = this.neonatalDischarge.getRawValue().AUainsertion;
      paylaod['AUaremoval'] = this.neonatalDischarge.getRawValue().AUaremoval;
      paylaod['AUacomplication'] = this.neonatalDischarge.getRawValue().AUacomplication;
      paylaod['AUacomplicationsT'] = this.neonatalDischarge.getRawValue().AUacomplicationsT;
      paylaod['GmOtherT'] = this.neonatalDischarge.getRawValue().GmOtherT;
      paylaod['GfOtherT'] = this.neonatalDischarge.getRawValue().GfOtherT;
      paylaod['GaOtherT'] = this.neonatalDischarge.getRawValue().GaOtherT;
      paylaod['GtOtherT'] = this.neonatalDischarge.getRawValue().GtOtherT;
      paylaod['MmOtherT'] = this.neonatalDischarge.getRawValue().MmOtherT;
      paylaod['MrMoroV'] = this.neonatalDischarge.getRawValue().MrMoroV;
      paylaod['MrOtherT'] = this.neonatalDischarge.getRawValue().MrOtherT;
      paylaod['McOtherT'] = this.neonatalDischarge.getRawValue().McOtherT;
      paylaod['MaOtherT'] = this.neonatalDischarge.getRawValue().MaOtherT;
      paylaod['MuOtherT'] = this.neonatalDischarge.getRawValue().MuOtherT;
      paylaod['MlOtherT'] = this.neonatalDischarge.getRawValue().MlOtherT;
      paylaod['MPalmarCreasesT'] = this.neonatalDischarge.getRawValue().MPalmarCreasesT;
      paylaod['MMalformationT'] = this.neonatalDischarge.getRawValue().MMalformationT;

      paylaod.Datee = paylaod.Datee ? this.dateFormateString(paylaod.Datee) : '';
      paylaod.DischDate = paylaod.DischDate ? this.dateFormateString(paylaod.DischDate) : '';
      paylaod.AdmDate = paylaod.AdmDate ? this.dateFormateString(paylaod.AdmDate) : '';
      paylaod.TransferDate = paylaod.TransferDate ? this.dateFormateString(paylaod.TransferDate) : '';
      paylaod.CrIintubation = paylaod.CrIintubation ? this.dateFormateString(paylaod.CrIintubation) : '';
      paylaod.CrRdate = paylaod.CrRdate ? this.dateFormateString(paylaod.CrRdate) : '';
      paylaod.CrRentryDate = paylaod.CrRentryDate ? this.dateFormateString(paylaod.CrRentryDate) : '';
      paylaod.AUinsertion = paylaod.AUinsertion ? this.dateFormateString(paylaod.AUinsertion) : '';
      paylaod.AUremoval = paylaod.AUremoval ? this.dateFormateString(paylaod.AUremoval) : '';
      paylaod.CrIextubation = paylaod.CrIextubation ? this.dateFormateString(paylaod.CrIextubation) : '';
      paylaod.AUainsertion = paylaod.AUainsertion ? this.dateFormateString(paylaod.AUainsertion) : '';
      paylaod.AUaremoval = paylaod.AUaremoval ? this.dateFormateString(paylaod.AUaremoval) : '';


      paylaod.AdmTime = paylaod.AdmTime ? this.convertTimeToDuration(paylaod.AdmTime) : '';
      paylaod.Timee = paylaod.Timee ? this.convertTimeToDuration(paylaod.Timee) : '';
      paylaod['TOHOSPMED'] = this.medicationImportDrugArrayForHosp.map(item => ({
        Dockey: item.Dockey || '',
        Meevtid: '',
        Descr: item.Descr,
        Dose: item.Dose,
        Validity: item.Validity,
        Route: item.Route,
        Rate: item.Rate,
        Cycle: item.Cycle
      }));
      paylaod['TODISCHMED'] = this.medicationImportDrugArray.map(item => ({
        Dockey: item.Dockey || '',
        Descr: item.Descr,
        Dose: item.Dose,
        CycleTxt: item.Cycle,
        OrderType: item.OrderType,
        Validity: item.Validity,
        RespEmp: item.RespEmp,
        Route: item.Route,
        Rate: item.Rate,
      }));
      paylaod['TOVITALSIGNS'] = this.toVitalsArr;


      console.log(this.neonatalDischarge, "neonatalDischarge");
      // return
      this.subscription = this.dayCaseDashboard
        .saveNeonatalDischargeDocument(paylaod)
        .subscribe({
          next: (data: any) => { },
          error: (err: any) => {
            this.sharedService.waringSwallModel(`Error ${err}`);
            this.sharedService.waringSwallModel(
              `PUT Error at Neonatal Discharge document : ${err}`
            );
          },
          complete: () => {
            resolve(true);
            this.reloadTableList.next(true);
            this.admissionService.cancelAllForm();
            this.admissionService.selectedCurrentDocDetails = '';
            this.admissionService?.clearSoapEvent?.next(true);
            if (actiontype === 'edit') {
              this.sharedService.successSwallModel(
                'Neonatal Discharge document updated successfully'
              );
            } else {
              this.sharedService.successSwallModel(
                'Neonatal Discharge document created successfully'
              );
            }
          },
        });
    });
  }

  public importVitalsData(data) {
    data.forEach((el) => {
      this.toVitalsArr = this.toVitalsArr.concat({
        Dockey: '',
        Vdescription: el.Name,
        MeasuredValue: el.ValueFormatted,
        NormalRange: el.NormalRange,
        DateTime: `${new DatePipe('en-US').transform(
          this.getDate(el.Date),
          'dd.MM.yyyy'
        )}/${this.parseTime(el.Time)}`,
        Vunit: el.UnitTxt,
      });
    });
  }
  assessmentTabSelect(tabName: string) {
    this.selectedTabName = tabName;
  }
  assessmentTabSelectMedi(tabName: string) {
    this.selectedTabNameMedication = tabName;
  }
  medicationImportDrugArray: any = [];
  medicationImportDrugArrayForHosp: any = [];
  medicationTye
  openModal(template: TemplateRef<any>, medicationTye) {
    this.medicationTye = medicationTye;
      const config: ModalOptions = {
        class:
          'modal-dialog modal-dialog-centered medication-order-case modal-xl',
      };
      this.modalRefUpdateName = this.modalService.show(template, config);
      this.loadMedicationHistoryData();
      // this.medicationImportDrugArray=[];
    }
  
    loadMedicationHistoryData() {
      this.selectedMedicationOrder = [];
      this.drugArray = [];
      const profileOrderHistory: Subscription = this.ePrescriptionService
        .loadData(
          `e-prescription/OrderHistorylist?Einri=${this.ePrescriptionService.parameters.einri}&Falnr=${this.ePrescriptionService.parameters.falnr}`,
          false,
          false,
          false,
          false
        )
        .subscribe(
          (resp: any) => {
            if (
              resp.body &&
              resp.body.d &&
              resp.body.d.results &&
              resp.body.d.results.length
            ) {
              //this.configurationData = resp.body.d.results;
              this.drugArray = resp.body.d.results;
              // this.medicationImportDrugArray=[];
            }
            //   this.filterEvents();
          },
          () => {
            profileOrderHistory.unsubscribe();
          }
        );
    }

 isCheckedMedi(item: any): boolean {
    return this.selectedMedicationOrder.some((x) => x.Meordid == item.Meordid);
  }

  collectMedicationIData(event, item) {
    if (event.target.checked) {
      this.selectedMedicationOrder.push(item);
      // this.medicationImportDrugArray.push(item);
    } else {
      const indexOf = this.selectedMedicationOrder.findIndex(
        (x) => x.Meordid == item.Meordid
      );
      if (indexOf !== -1) this.selectedMedicationOrder.splice(indexOf, 1);
      // this.medicationImportDrugArray.splice(index, 1);
    }
  }
  // isCheckedScale(item: any): boolean {
  //   return this.selectedScales.some((x) => x.Scaletype == item.Scaletype);
  // }

  medicationImportForHosp() {
    if (!this.medicationImportDrugArrayForHosp) {
      this.medicationImportDrugArrayForHosp = [];
    }

    this.selectedMedicationOrder.forEach((element) => {
      this.medicationImportDrugArrayForHosp.push({
        Dockey: '',
        OrderType:
          element.MotypId == '30' ? 'Planned Administration' : 'Discharge',
        Descr:
          element.Descrlt +
          element.Quan +
          element.Quanunit +
          element.Routedescr +
          element.N1id,
        HomeMedication: false,
        PatientOwnMed: false,
        Dose: element.Quan + element.Quanunit,
        Validity: `${new DatePipe('en-US').transform(
          this.getDate(element.StartD),
          'dd.MM.yyyy'
        )}-${new DatePipe('en-US').transform(
          this.getDate(element.EndD),
          'dd.MM.yyyy'
        )}`,
        Route: element.Routedescr,
        Amount: '',
        Rate: '',
        Therapy: '00000',
        Id: '',
        OrderingPhysician: element.EmpRespNm,
        Cycle: element.N1id,
        EmpResp: element.EmpResp,
      });
    });
    this.modalRefUpdateName.hide();
  }

  medicationImport() {

    if(this.medicationTye == 'Hospital') {
      this.medicationImportForHosp();
      return;
    }

    if (!this.medicationImportDrugArray) {
      this.medicationImportDrugArray = [];
    }

    this.selectedMedicationOrder.forEach((element) => {
      this.medicationImportDrugArray.push({
        Dockey: '',
        OrderType:
          element.MotypId == '30' ? 'Planned Administration' : 'Discharge',
        Descr:
          element.Descrlt +
          element.Quan +
          element.Quanunit +
          element.Routedescr +
          element.N1id,
        HomeMedication: false,
        PatientOwnMed: false,
        Dose: element.Quan + element.Quanunit,
        Validity: `${new DatePipe('en-US').transform(
          this.getDate(element.StartD),
          'dd.MM.yyyy'
        )}-${new DatePipe('en-US').transform(
          this.getDate(element.EndD),
          'dd.MM.yyyy'
        )}`,
        Route: element.Routedescr,
        Amount: '',
        Rate: '',
        Therapy: '00000',
        Id: '',
        OrderingPhysician: element.EmpRespNm,
        Cycle: element.N1id,
        EmpResp: element.EmpResp,
      });
    });
    this.modalRefUpdateName.hide();
  }

  collectAllMedicationIData(event: any) {
    if (event.target.checked) {
      this.selectedMedicationOrder = Object.assign([], this.drugArray);
    } else {
      this.selectedMedicationOrder = [];
    }
  }


  public parseTime(data: string) {
    // Check if data is valid and matches the expected format
    if (!data || data.length !== 11 || data[4] !== 'H' || data[7] !== 'M' || data[10] !== 'S') {
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

  parseDate(date: string) {
    if (date) {
      if (new Date(new Date(+(date.replace('/Date(', '').replace(')/', ''))).toLocaleDateString("en-US"))) {
        return new Date(new Date(+(date.replace('/Date(', '').replace(')/', ''))).toLocaleDateString("en-US"));
      }
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

  convertTimeToDuration(timeString: string): string {
    if (!timeString) return '';

    const [hours, minutes, seconds] = timeString.split(':').map(Number);

    // Ensure values are properly formatted
    const formattedHours = hours ? `PT${hours}H` : 'PT00H';
    const formattedMinutes = minutes ? `${minutes}M` : '00M';
    const formattedSeconds = seconds ? `${seconds}S` : '00S';

    return `${formattedHours}${formattedMinutes}${formattedSeconds}`;
  }


}
