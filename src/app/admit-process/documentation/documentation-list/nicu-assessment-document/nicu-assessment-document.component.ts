import { Component, OnInit, Output, SimpleChanges ,EventEmitter, Input, ViewChild} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdmissionService } from '@services/admission/admission.service';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { Subscription } from 'rxjs';
import { NicuErVitalsComponent } from './er-vitals/er-vitals.component';
import { DatePipe } from '@angular/common';




@Component({
  selector: 'app-nicu-assessment-document',
  templateUrl: './nicu-assessment-document.component.html',
  styleUrls: ['./nicu-assessment-document.component.scss']
})
export class NicuAssessmentDocumentComponent implements OnInit {
   @ViewChild('erVitalsModal') erVitalsModal: NicuErVitalsComponent;
   @Output() realodEducationList = new EventEmitter();
   @Input() soapFormEvent:any
   @Input() isExpanded:any
  nicuForm:FormGroup;
  paramsObject: any;
  encounterId: any;
  private subscription: Subscription;
  private actionTypeSubscription$: Subscription;
  selectedTabName: string = 'Skin';
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
  public modeOfDeliveryList = [
    { value: '0', label: 'Vaginal' },
    { value: '1', label: 'C-Section' },
    { value: '2', label: 'Forceps' },
    { value: '3', label: 'Ventouse' },
    { value: '4', label: 'Head Pres.' },
    { value: '5', label: 'Breech' },
    { value: '6', label: 'Others' }
  ];

  public weight = [
    {value : '0',label:'gm'},
    {value : '1',label:'kg'}
  ]
  public Breath = [
    {value : '0',label:'Equal'},
    {value : '1',label:' Wheezes/Rales'},
    {value : '2',label:'Diminished'},
    {value : '3',label:'Others'},
  ]
  public Moro = [
    {value : '0',label:'Complete'},
    {value : '1',label:'InComplete'},
    {value : '2',label:'Absent'},
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


  deliveryOptions = [
    { value: '0', label: 'C/S' },
    { value: '1', label: 'Normal VD' },
    { value: '2', label: 'Forceps VD' },
    { value: '3', label: 'Not Stated' },
    { value: '4', label: 'Vacuum VE' }
  ];
  transferOptions = [
    { value: '0', label: 'Hospital' },
    { value: '1', label: 'Home' },
    { value: '2', label: 'Nursery' },
    { value: '3', label: 'Intermediate' },
    { value: '4', label: 'Others' }
  ];
  
  conceptionOptions = [
    { value: '0', label: 'IVF' },
    { value: '1', label: 'Spontaneous' },
    { value: '2', label: 'IUI' },
    { value: '3', label: 'Others' }
  ];
  public gender = [
    {value : '1',label:'Male'},
    {value : '2',label:'Female'},
    {value : '3',label:'UnKnown'}
  ]
  bloodGroupOptions = [
    { label: 'A-', value: '0' },
    { label: 'A+', value: '1' },
    { label: 'B-', value: '2' },
    { label: 'B+', value: '3' },
    { label: 'O-', value: '4' },
    { label: 'O+', value: '5' },
    { label: 'AB-', value: '6' },
    { label: 'AB+', value: '7' }
  ];
  public anti = [
    {value : '0',label:'No'},
    {value : '1',label:'Yes'},
    {value : '2',label:'UnKnown'}
  ]
  public antiD = [
    {value : '0',label:'No'},
    {value : '1',label:'Yes'},
  ]
  public motherAgeOptions = Array.from({ length: 51 }, (_, i) => ({ label: (0 + i).toString(), value: (0 + i).toString() }));

  
  docKey: any;
  public toVitalsArr: any = [];
  isChecked: any;
  genderString: any;
  isFemale: boolean;
  throwingError: boolean = false;
  constructor(private _route: ActivatedRoute,public storageService: StorageService,private formBuilder: FormBuilder,public admissionService:AdmissionService,private sharedService: SharedService) { }

  ngOnInit(): void {
    this.initForm();
    this._route.queryParams.subscribe((params) => {
      this.paramsObject = params;
      if (this.paramsObject.lfdnr) {
        this.encounterId = this.paramsObject.einri + this.paramsObject.falnr + this.paramsObject.lfdnr;
      }
      this.storageService.setEinri(this.paramsObject.einri);
      this.storageService.setFalnr(this.paramsObject.falnr);
      this.storageService.setLfdnr(this.paramsObject.lfdnr);
      this.storageService.setPatnr(this.paramsObject.patnr);
      // this.getPatinetDetails(this.encounterId);
    });

    this.nicuForm.get('SSkincolorT')?.disable();
    this.nicuForm.get('SSkincolor')?.valueChanges.subscribe(value => {
      if (value === '7') {
        this.nicuForm.get('SSkincolorT')?.enable();
    } else {
      this.nicuForm.get('SSkincolorT')?.disable();
      this.nicuForm.get('SSkincolorT')?.setValue(''); // Clear input if disabled
    }
  });
  
    this.nicuForm.get('CrBreathSounds')?.valueChanges.subscribe(value => {
    if (value === '3') {
      this.nicuForm.get('CrBreathSoundt')?.enable();
    } else {
      this.nicuForm.get('CrBreathSoundt')?.disable();
      this.nicuForm.get('CrBreathSoundt')?.setValue(''); // Clear input if disabled
    }
   });
    this.nicuForm.get('Conception')?.valueChanges.subscribe(value => {
    if (value === '3') {
      this.nicuForm.get('ConceptionT')?.enable();
    } else {
      this.nicuForm.get('ConceptionT')?.disable();
      this.nicuForm.get('ConceptionT')?.setValue(''); // Clear input if disabled
    }
   });
    this.nicuForm.get('TransferPlace')?.valueChanges.subscribe(value => {
    if (value === '4') {
      this.nicuForm.get('TransferPlaceT')?.enable();
    } else {
      this.nicuForm.get('TransferPlaceT')?.disable();
      this.nicuForm.get('TransferPlaceT')?.setValue(''); // Clear input if disabled
    }
   });
    this.nicuForm.get('TypeDelivery')?.valueChanges.subscribe(value => {
    if (value === '3') {
      this.nicuForm.get('TypeDeliveryT')?.enable();
    } else {
      this.nicuForm.get('TypeDeliveryT')?.disable();
      this.nicuForm.get('TypeDeliveryT')?.setValue(''); // Clear input if disabled
    }
   });

   let storedPatientStr = localStorage.getItem('myPatient')
   if (storedPatientStr) {
    let storedPatient = JSON.parse(storedPatientStr); 
    this.genderString = storedPatient.gender;
    if (this.genderString.includes('Female')) {
      this.isFemale = true;
    } else if (this.genderString.includes('Male')) {
      this.isFemale = false;
    }
  }
    if(this.isFemale){
      this.nicuForm.get('GfNormal')?.enable();
      this.nicuForm.get('GfVaginal')?.enable();
      this.nicuForm.get('GfHymenal')?.enable();
      this.nicuForm.get('GfEdema')?.enable();
      this.nicuForm.get('GfOther')?.enable();
      this.nicuForm.get('GmTestes')?.enable();
    
    }else{
      this.nicuForm.get('GmNormal')?.enable();
      this.nicuForm.get('GmHypoxemia')?.enable();
      this.nicuForm.get('GmEdema')?.enable();
      this.nicuForm.get('GmHydrocele')?.enable();
      this.nicuForm.get('GmTestes')?.enable();
      this.nicuForm.get('GmOther')?.enable();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
      if (changes.soapFormEvent.currentValue == 'add') {
       this.createDoc('1','add')
      }
      if (changes.soapFormEvent.currentValue == 'edit') {
        this.createDoc('1','edit')
      }
      if (changes.soapFormEvent.currentValue == 'saveClose') {
        this.createDoc('1','edit')
      }
      if (changes.soapFormEvent.currentValue == 'release') {
        this.createDoc('2','edit')
      }
      console.log(changes.soapFormEvent.currentValue, this.admissionService.isEditNicuForm, this.admissionService.isCloneNicuForm , "this.admissionService.isCloneNicuForm");
      
      if (
        this.admissionService.isCloneNicuForm ||
        this.admissionService.isEditNicuForm
      ) {
        if(this.admissionService.isCloneNicuForm) this.throwingError = true;
        this.getDocument();
      }
  }

  assessmentTabSelect(tabName: string) {
    this.selectedTabName = tabName;
  }

  initForm(data?){
    this.nicuForm = this.formBuilder.group({
      Orgdo: ['F21IUAMC'],
      Datee: [this.getDate(data?.Datee) || null],
      Timee: [this.parseTime(data?.Timee) || null],
      ReasonAdm: [data?.ReasonAdm || ''],
      Ga: [data?.Ga || ''],
      GaDays: [data?.GaDays || ''],
      Cga: [data?.Cga || ''],
      CgaDays: [data?.CgaDays || ''],
      ChronoAge: [data?.ChronoAge || ''],
      Gender: [data?.Gender || ''],
      BirthDate: [this.getDate(data?.BirthDate) || null],
      BirthTime: [this.parseTime(data?.BirthTime) || null],
      AdmDate: [this.getDate(data?.AdmDate) || this.convertDateFormat(JSON.parse(localStorage.getItem('checkindata'))?.AdmissionDate)],
      AdmTime: [this.parseTime(data?.AdmTime) || this.convertTimeFormat(JSON.parse(localStorage.getItem('checkindata'))?.AdmissionTime)],
      PlaceBirth: [data?.PlaceBirth || ''],
      BirthWeight: [data?.BirthWeight || ''],
      BirthWgtUnit: [data?.BirthWgtUnit || ''],
      CurrentWeight: [data?.CurrentWeight || ''],
      CurrentWgtUnit: [data?.CurrentWgtUnit || ''],
      Min1: [data?.Min1 || ''],
      Min5: [data?.Min5 || ''],
      Min10: [data?.Min10 || ''],
      Unavailable: [data?.Unavailable || false],
      TypeDelivery: [data?.TypeDelivery || ''],
      TypeDeliveryT: [{ value: data?.TypeDeliveryT || '', disabled: true }],
      Conception: [data?.Conception || ''],
      ConceptionT: [{ value: data?.ConceptionT || '', disabled: true }],
      TransferPlace: [data?.TransferPlace || ''],
      TransferPlaceT: [{ value: data?.TransferPlaceT || '', disabled: true }],
      AttendingPhy: [data?.AttendingPhy || ''],
      ObgyPhy: [data?.ObgyPhy || ''],
      MotherAge: [data?.MotherAge || ''],
      MotherBg: [data?.MotherBg || ''],
      FatherBg: [data?.FatherBg || ''],
      AntiD: [data?.AntiD || ''],
      AntiDT: [{ value: data?.AntiDT || '', disabled: true }],
      Gravida: [data?.Gravida || ''],
      Para: [data?.Para || ''],
      Abortion: [data?.Abortion || ''],
      NoBabies: [data?.NoBabies || ''],
      Lmp: [this.getDate(data?.Lmp) || null],
      Edd: [this.getDate(data?.Edd) || null],
      Stds: [data?.Stds || false],
      StdYn: [{ value: data?.StdYn || '', disabled: true }],
      StdT: [{ value: data?.StdT || '', disabled: true }],
      Rupture: [data?.Rupture || false],
      RuptureYn: [{ value: data?.RuptureYn || '', disabled: true }],
      RuptureT: [{ value: data?.RuptureT || '', disabled: true }],
      Steroids: [data?.Steroids || false],
      SteroidsYn: [{ value: data?.SteroidsYn || '', disabled: true }],
      SteroidsT: [{ value: data?.SteroidsT || '', disabled: true }],
      Smoking: [data?.Smoking || false],
      SmokingYn: [{ value: data?.SmokingYn || '', disabled: true }],
      SmokingT: [{ value: data?.SmokingT || '', disabled: true }],
      Gbs: [data?.Gbs || false],
      GbsPn: [{ value: data?.GbsPn || '', disabled: true }],
      GbsT: [{ value: data?.GbsT || '', disabled: true }],
      HepatitisB: [data?.HepatitisB || false],
      HepatitisBPn: [{ value: data?.HepatitisBPn || '', disabled: true }],
      HepatitisBT: [{ value: data?.HepatitisBT || '', disabled: true }],
      HepatitisC: [data?.HepatitisC || false],
      HepatitisCPn: [{ value: data?.HepatitisCPn || '', disabled: true }],
      HepatitisCT: [{ value: data?.HepatitisCT || '', disabled: true }],
      Hiv: [data?.Hiv || false],
      HivPn: [{ value: data?.HivPn || '', disabled: true }],
      HivT: [{ value: data?.HivT || '', disabled: true }],
      MaternalDisea: [data?.MaternalDisea || false],
      Dm: [{ value: false, disabled: true }],
      Htn: [{ value: false, disabled: true }],
      Thyroid: [{ value: false, disabled: true }],
      Hematology: [{ value: false, disabled: true }],
      Uti: [{ value: false, disabled: true }],
      Cardiac: [{ value: false, disabled: true }],
      Neurological: [{ value: false, disabled: true }],
      Others: [{ value: false, disabled: true }],
      OthersT: [{ value: data?.OthersT || '', disabled: true }],
      MaternalMed: [data?.MaternalMed || false],
      MaternalMedT: [data?.MaternalMedT || ''],
      DetailAnomaly: [data?.DetailAnomaly || false],
      DetailAnomalyYn: [{ value: data?.DetailAnomalyYn || '', disabled: true }],
      DetailAnomalyT: [{ value: data?.DetailAnomalyT || '', disabled: true }],
      General: [data?.General || false],
      GeneralYn: [{ value: data?.GeneralYn || '', disabled: true }],
      GeneralT: [{ value: data?.GeneralT || '', disabled: true }],
      Labs: [data?.Labs || false],
      LabsT: [{ value: data?.LabsT || '', disabled: true }],
      Family: [data?.Family || false],
      FamilyT: [{ value: data?.FamilyT || '', disabled: true }],
      Iothers: [data?.Iothers || false],
      IothersT: [{ value: data?.IothersT || '', disabled: true }],
      CourseNicu: [data?.CourseNicu || ''],
      Assessment: [data?.Assessment || ''],
      Plan: [data?.Plan || ''],
      SSkincolor : [data?.SSkincolor || ''],
        SSkincolorT : [data?.SSkincolorT ||''],
        SaNormal : [data?.SaNormal || false],
        SaRash : [data?.SaRash || false],
        SaBruising : [data?.SaBruising || false],
        SaLanugo : [data?.SaLanugo || false],
        SaEdema : [data?.SaEdema || false],
        SaDry : [data?.SaDry || false],
        SaMongolian : [data?.SaMongolian || false],
        SaSkinTags : [data?.SaSkinTags || false],
        SaPetechia : [data?.SaPetechia || false],
        SaCoatings : [data?.SaCoatings || false],
        SaComments : [data?.SaComments || ''],
        HsNormal : [data?.HsNormal || false],
        HsForceps : [data?.HsForceps || false],
        HsMolding : [data?.HsMolding || false],
        HsCaput : [data?.HsCaput || false],
        HsLacerations : [data?.HsLacerations || false],
        HsOverriding : [data?.HsOverriding || false],
        HsCephalhema : [data?.HsCephalhema || false],
        HsOther : [data?.HsOther || false],
        HsOtherT : [data?.HsOtherT || { value: '', disabled: true }],
        HfAnterior : [data?.HfAnterior || false],
        HfAnteriorOc : [data?.HfAnteriorOc ||  { value: '', disabled: true }],  
        HfAother : [data?.HfAother ||  { value: '', disabled: true }],
        HfAsize : [data?.HfAsize ||  { value: '', disabled: true }],
        HfPosterior : [data?.HfPosterior || false],
        HfPosteriorOc : [data?.HfPosteriorOc || { value: '', disabled: true }],
        HfPother : [data?.HfPother ||{ value: '', disabled: true }],
        HfPsize : [data?.HfPsize || { value: '', disabled: true }],
        HeNormal : [data?.HeNormal || false],
        HeLowSet : [data?.HeLowSet || false],
        HePreauricular : [data?.HePreauricular || false],
        HeBleeding : [data?.HeBleeding || false],
        HeOther : [data?.HeOther || false],
        HeOtherT : [data?.HeOtherT || { value: '', disabled: true }],
        HeyClear : [data?.HeyClear || false],
        HeyScleral : [data?.HeyScleral || false],
        HeyEdema : [data?.HeyEdema || false],
        HeyConjunct : [data?.HeyConjunct || false],
        HeyRed : [data?.HeyRed || false],
        HeyOther : [data?.HeyOther || false],
        HeyOtherT : [data?.HeyOtherT || { value: '', disabled: true }],
        HnNostrils : [data?.HnNostrils || false],
        HnClosed : [data?.HnClosed || false],
        HnOther : [data?.HnOther || false],
        HnOtherT : [data?.HnOtherT ||{ value: '', disabled: true }],
        HmNormal : [data?.HmNormal || false],
        HmMovement : [data?.HmMovement || false],
        HmSymmetry : [data?.HmSymmetry || false],
        HmAsymmetry : [data?.HmAsymmetry || false],
        HmCleftLip : [data?.HmCleftLip || false],
        HmCleftPalate : [data?.HmCleftPalate || false],
        HmOther : [data?.HmOther || false],
        HmOtherT : [data?.HmOtherT || { value: '', disabled: true }],
        HnNormal : [data?.HnNormal || false],
        HnShort : [data?.HnShort || false],
        HnStraight : [data?.HnStraight || false],
        HnWebbing : [data?.HnWebbing || false],
        HnNother : [data?.HnNother || false],
        HnNotherT : [data?.HnNotherT || { value: '', disabled: true }],
        CcSymmetrical : [data?.CcSymmetrical || false],
        CcAssymetrical : [data?.CcAssymetrical || false],
        CcOther : [data?.CcOther || false],
        CcOtherT : [data?.CcOtherT || { value: '', disabled: true }],
        CcaRegularHr : [data?.CcaRegularHr || false],
        CcaIrregularHr : [data?.CcaIrregularHr || false],
        CcaBradycardia : [data?.CcaBradycardia || false],
        CcaTachycardia : [data?.CcaTachycardia || false],
        CcaArrhythmia : [data?.CcaArrhythmia || false],
        CcaMurmurs : [data?.CcaMurmurs || false],
        CcaCapillary : [data?.CcaCapillary || false],
        CcaFemoral : [data?.CcaFemoral || false],
        CcaBrachial : [data?.CcaBrachial || false],
        CcaRadial : [data?.CcaRadial || false],
        CcaOther : [data?.CcaOther || false],
        CcaOtherT : [data?.CcaOtherT || { value: '', disabled: true }],
        CrRegularRr : [data?.CrRegularRr || false],
        CrIrregularRr : [data?.CrIrregularRr || false],
        CrGrunt : [data?.CrGrunt || false],
        CrBradypnea : [data?.CrBradypnea || false],
        CrTachypnea : [data?.CrTachypnea || false],
        CrNasal : [data?.CrNasal || false],
        CrApnea : [data?.CrApnea || false],
        CrRecession : [data?.CrRecession || false],
        CrOther : [data?.CrOther || false],
        CrOtherT : [data?.CrOtherT || { value: '', disabled: true }],
        CrBreathSound : [data?.CrBreathSound || false],
        CrBreathSounds : [data?.CrBreathSounds || { value: '', disabled: true }],
        CrBreathSoundt : [data?.CrBreathSoundt || { value: '', disabled: true }],
        CrIntubated : [data?.CrIntubated || false],
        CrIntubatedYn : [data?.CrIntubatedYn ||{ value: '', disabled: true }],
        CrItubeSize : [data?.CrItubeSize || { value: '', disabled: true }],
        CrItubeLevel : [data?.CrItubeLevel || { value: '', disabled: true }],
        CrIintubation : [this.getDate(data?.CrIintubation) || { value: null, disabled: true }],
        CrIextubation : [this.getDate(data?.CrIextubation) || { value: null, disabled: true }],
        CrReintubation : [data?.CrReintubation || false],
        CrReintubationYn : [data?.CrReintubationYn || { value: '', disabled: true }],
        CrRtubeSize : [data?.CrRtubeSize || { value: '', disabled: true }],
        CrRtubeLevel : [data?.CrRtubeLevel || { value: '', disabled: true }],
        CrRdate : [this.getDate(data?.CrRdate) || { value: null, disabled: true }],
        CrRentryDate : [this.getDate(data?.CrRentryDate) || { value: null, disabled: true }],
        CbNormal : [data?.CbNormal || false],
        CbAccessory : [data?.CbAccessory || false],
        CbNodule : [data?.CbNodule || false],
        CbOther : [data?.CbOther || false],
        CbOtherT : [data?.CbOtherT || { value: '', disabled: true }],
        AAbdominal : [data?.AAbdominal || ''],
        AAbdominalT : [data?.AAbdominalT || { value: '', disabled: true }],
        ALiver : [data?.ALiver || ''],
        ALiverT : [data?.ALiverT || { value: '', disabled: true }],
        ASpleen : [data?.ASpleen || ''],
        ASpleenT : [data?.ASpleenT ||{ value: '', disabled: true }],
        AKidney : [data?.AKidney || ''],
        AKidneyT : [data?.AKidneyT || { value: '', disabled: true }],
        AHernia : [data?.AHernia || ''],
        AHerniaT : [data?.AHerniaT ||{ value: '', disabled: true }],
        AArteries : [data?.AArteries || false],
        AArteriesT : [data?.AArteriesT || { value: '', disabled: true }],
        AShape : [data?.AShape || false],
        AShapeNa : [data?.AShapeNa || { value: '', disabled: true }],
        AShapeT : [data?.AShapeT || { value: '', disabled: true }],
        AVeins : [data?.AVeins || false],
        AVeinsT : [data?.AVeinsT || { value: '', disabled: true }],
        AUvc : [data?.AUvc || false],
        AUinsertion : [data?.AUinsertion || { value: null, disabled: true }],
        AUremoval : [data?.AUremoval || { value: null, disabled: true }],
        AUcomplication : [data?.AUcomplication || { value: '', disabled: true }],
        AUcomplicationT : [data?.AUcomplicationT || { value: '', disabled: true }],
        AUac : [data?.AUac || false],
        AUainsertion : [data?.AUainsertion || { value: null, disabled: true }],
        AUaremoval : [data?.AUaremoval || { value: null, disabled: true }],
        AUacomplication : [data?.AUacomplication || { value: '', disabled: true }],
        AUacomplicationsT : [data?.AUacomplicationsT || { value: '', disabled: true }],
        AComment : [data?.AComment || ''],
        // ACommentT : [data?.ACommentT || ''],
        GmNormal : [data?.GmNormal || { value: false, disabled: true }],
        GmEdema : [data?.GmEdema || { value: false, disabled: true }],
        GmHydrocele : [data?.GmHydrocele || { value: false, disabled: true }],
        GmTestes : [data?.GmTestes || { value: false, disabled: true }],
        GmHypoxemia : [data?.GmHypoxemia || { value: false, disabled: true }],
        GmOther : [data?.GmOther || { value: false, disabled: true }],
        GmOtherT : [data?.GmOtherT || { value: '', disabled: true }],
        GfNormal : [data?.GfNormal || { value: false, disabled: true }],
        GfVaginal : [data?.GfVaginal || { value: false, disabled: true }],
        GfHymenal : [data?.GfHymenal || { value: false, disabled: true }],
        GfEdema : [data?.GfEdema || { value: false, disabled: true }],
        GfOther : [data?.GfOther || { value: false, disabled: true }],
        GfOtherT : [data?.GfOtherT || { value: '', disabled: true }],
        GaPatent : [data?.GaPatent || false],
        GaHemorrh : [data?.GaHemorrh || false],
        GaOther : [data?.GaOther || false],
        GaOtherT : [data?.GaOtherT || { value: '', disabled: true }],
        GtDimple : [data?.GtDimple || false],
        GtOther : [data?.GtOther || false],
        GtOtherT : [data?.GtOtherT || { value: '', disabled: true }],
        GComment : [data?.GComment || ''],
        MmNormal : [data?.MmNormal || false],
        MmTremors : [data?.MmTremors || false],
        MmHypotonic : [data?.MmHypotonic || false],
        MmHypertonic : [data?.MmHypertonic || false],
        MmOther : [data?.MmOther || false],
        MmOtherT : [data?.MmOtherT || { value: '', disabled: true }],
        MrMoro : [data?.MrMoro || false],
        MrMoroV : [data?.MrMoroV || { value: '', disabled: true }],
        MrRooting : [data?.MrRooting || false],
        MrStepping : [data?.MrStepping || false],
        MrGag : [data?.MrGag || false],
        MrSucking : [data?.MrSucking || false],
        MrGrasp : [data?.MrGrasp || false],
        MrOther : [data?.MrOther || false],
        MrOtherT : [data?.MrOtherT ||{ value: '', disabled: true }],
        McNormal : [data?.McNormal || false],
        McWeak : [data?.McWeak || false],
        McHigh : [data?.McHigh || false],
        McAbsent : [data?.McAbsent || false],
        McOther : [data?.McOther || false],
        McOtherT : [data?.McOtherT || { value: '', disabled: true }],
        MaActive : [data?.MaActive || false],
        MaLethargic : [data?.MaLethargic || false],
        MaNoResponse : [data?.MaNoResponse || false],
        MaHypooactive : [data?.MaHypooactive || false],
        MaHyperactive : [data?.MaHyperactive || false],
        MaOther : [data?.MaOther || false],
        MaOtherT : [data?.MaOtherT || { value: '', disabled: true }],
        MuNormal : [data?.MuNormal || false],
        MuFractures : [data?.MuFractures || false],
        MuClavicle : [data?.MuClavicle || false],
        MuSyndactyly : [data?.MuSyndactyly || false],
        MuPolydactyly : [data?.MuPolydactyly || false],
        MuOther : [data?.MuOther || false],
        MuOtherT : [data?.MuOtherT || { value: '', disabled: true }],
        MlNormal : [data?.MlNormal || false],
        MlHipClick : [data?.MlHipClick || false],
        MlFractures : [data?.MlFractures || false],
        MlSyndactyly : [data?.MlSyndactyly || false],
        MlPolydactyly : [data?.MlPolydactyly || false],
        MlTalipes : [data?.MlTalipes || false],
        MlOther : [data?.MlOther || false],
        MlOtherT : [data?.MlOtherT || { value: '', disabled: true }],
        MPalmarCreases : [data?.MPalmarCreases || false],
        MPalmarCreasesT : [data?.MPalmarCreasesT ||{ value: '', disabled: true }],
        MComment : [data?.MComment || ''],
        MMalformation : [data?.MMalformation || ''],
        MMalformationT : [data?.MMalformationT || { value: '', disabled: true }],
        GeneralImpression : [data?.GeneralImpression || ''],
        // VitK : [data?.VitK || ''],
        // HepB : [data?.HepB || ''],
        // Comments : [data?.Comments || ''],
    })
  }

  

  toggleInput(checkboxName: string, inputName: string) {
    const checkboxControl = this.nicuForm.get(checkboxName);
    const inputControl = this.nicuForm.get(inputName);
    if (checkboxControl?.value) {
      inputControl?.enable();
      if(checkboxName == 'AShape'){
        this.nicuForm.get('AShapeNa')?.setValue('0');
      }
      if(checkboxName == 'Stds'){
        this.nicuForm.get('StdYn')?.setValue('0');
      }
      if(checkboxName == 'Rupture'){
        this.nicuForm.get('RuptureYn')?.setValue('0');
      }
      if(checkboxName == 'Steroids'){
        this.nicuForm.get('SteroidsYn')?.setValue('0');
      }
      if(checkboxName == 'Smoking'){
        this.nicuForm.get('SmokingYn')?.setValue('0');
      }
      if(checkboxName == 'Rupture'){
        this.nicuForm.get('RuptureYn')?.setValue('0');
      }
      if(checkboxName == 'Gbs'){
        this.nicuForm.get('GbsPn')?.setValue('0');
      
      }
      if(checkboxName == 'HepatitisB'){
        this.nicuForm.get('HepatitisBPn')?.setValue('0');
      
      }
      if(checkboxName == 'HepatitisC'){
        this.nicuForm.get('HepatitisCPn')?.setValue('0');
       
      }
      if(checkboxName == 'Hiv'){
        this.nicuForm.get('HivPn')?.setValue('0');
       
      }
      if(checkboxName == 'DetailAnomaly'){
        this.nicuForm.get('DetailAnomalyYn')?.setValue('0');
      
      }
      if(checkboxName == 'General'){
        this.nicuForm.get('GeneralYn')?.setValue('0');
      
      }
      if(checkboxName == 'AUvc'){
        this.nicuForm.get('AUcomplication')?.setValue('1');
        this.nicuForm.get('AUinsertion')?.enable();
        this.nicuForm.get('AUremoval')?.enable();
      }
      if(checkboxName == 'AUac'){
        this.nicuForm.get('AUacomplication')?.setValue('1');
        this.nicuForm.get('AUainsertion')?.enable();
        this.nicuForm.get('AUaremoval')?.enable();
      }
      if(checkboxName == 'CrIntubated'){
        this.nicuForm.get('CrIntubatedYn')?.setValue('1');
      }
      if(checkboxName == 'CrReintubation'){
        this.nicuForm.get('CrReintubationYn')?.setValue('1');
      }
      if(checkboxName == 'HfAnterior'){
        this.nicuForm.get('HfAnteriorOc')?.setValue('0');
      }
      if(checkboxName == 'HfPosterior'){
        this.nicuForm.get('HfPosteriorOc')?.setValue('0');
      }
      if(checkboxName == 'MaternalDisea'){
        this.nicuForm.get('Dm')?.enable();
        this.nicuForm.get('Htn')?.enable();
        this.nicuForm.get('Thyroid')?.enable();
        this.nicuForm.get('Hematology')?.enable();
        this.nicuForm.get('Uti')?.enable();
        this.nicuForm.get('Cardiac')?.enable();
        this.nicuForm.get('Neurological')?.enable();
        this.nicuForm.get('Others')?.enable();
      }
    } else {
      inputControl?.disable();
      inputControl?.setValue('');
      if(checkboxName == 'AShape'){
        this.nicuForm.get('AShapeT')?.disable();
      }
      // ********************?
      if(checkboxName == 'Stds'){
        this.nicuForm.get('StdYn')?.disable();
        this.nicuForm.get('StdT')?.disable();
        this.nicuForm.get('StdT')?.setValue('');
      }
      if(checkboxName == 'Rupture'){
        this.nicuForm.get('RuptureYn')?.disable();
        this.nicuForm.get('RuptureT')?.disable();
        this.nicuForm.get('RuptureT')?.setValue('');
      }
      if(checkboxName == 'Steroids'){
        this.nicuForm.get('SteroidsYn')?.disable();
        this.nicuForm.get('SteroidsT')?.disable();
        this.nicuForm.get('SteroidsT')?.setValue('');
      }
      if(checkboxName == 'DetailAnomaly'){
        this.nicuForm.get('DetailAnomalyYn')?.disable();
        this.nicuForm.get('DetailAnomalyT')?.disable();
        this.nicuForm.get('DetailAnomalyT')?.setValue('');
      }
      if(checkboxName == 'Smoking'){
        this.nicuForm.get('SmokingYn')?.disable();
        this.nicuForm.get('SmokingT')?.disable();
        this.nicuForm.get('SmokingT')?.setValue('');
      }
      if(checkboxName == 'Gbs'){
        this.nicuForm.get('GbsPn')?.disable();
        this.nicuForm.get('GbsT')?.disable();
        this.nicuForm.get('GbsT')?.setValue('');
      }
      if(checkboxName == 'HepatitisB'){
        this.nicuForm.get('HepatitisBPn')?.disable();
        this.nicuForm.get('HepatitisBT')?.disable();
        this.nicuForm.get('HepatitisBT')?.setValue('');
      }
      if(checkboxName == 'HepatitisC'){
        this.nicuForm.get('HepatitisCPn')?.disable();
        this.nicuForm.get('HepatitisCT')?.disable();
        this.nicuForm.get('HepatitisCT')?.setValue('');
      }
      if(checkboxName == 'Hiv'){
        this.nicuForm.get('HivPn')?.disable();
        this.nicuForm.get('HivT')?.disable();
        this.nicuForm.get('HivT')?.setValue('');
      }
      if(checkboxName == 'General'){
        this.nicuForm.get('GeneralYn')?.disable();
        this.nicuForm.get('HepatitisBT')?.disable();
        this.nicuForm.get('GeneralT')?.setValue('');
      }
      if(checkboxName == 'AUvc'){
        this.nicuForm.get('AUcomplication')?.disable();
        this.nicuForm.get('AUinsertion')?.disable();
        this.nicuForm.get('AUremoval')?.disable();
        this.nicuForm.get('AUcomplicationT')?.disable();
      }
      if(checkboxName == 'AUac'){
        this.nicuForm.get('AUacomplicationsT')?.disable();
        this.nicuForm.get('AUacomplication')?.disable();
        this.nicuForm.get('AUainsertion')?.disable();
        this.nicuForm.get('AUaremoval')?.disable();
      }
      if(checkboxName == 'HfAnterior'){
        this.nicuForm.get('HfAnteriorOc')?.disable();
        this.nicuForm.get('HfAother')?.disable();
        this.nicuForm.get('HfAsize')?.disable();
        this.nicuForm.get('HfAother')?.setValue('');
        this.nicuForm.get('HfAsize')?.setValue('');
      }
      if(checkboxName == 'HfPosterior'){
        this.nicuForm.get('HfPosteriorOc')?.disable();
        this.nicuForm.get('HfPother')?.disable();
        this.nicuForm.get('HfPsize')?.disable();
        this.nicuForm.get('HfPother')?.setValue('');
        this.nicuForm.get('HfPsize')?.setValue('');
      }
      if(checkboxName == 'CrIntubated'){
        this.nicuForm.get('CrIntubatedYn')?.disable();
        this.nicuForm.get('CrItubeSize')?.disable();
        this.nicuForm.get('CrItubeLevel')?.disable();
        this.nicuForm.get('CrIintubation')?.disable();
        this.nicuForm.get('CrIextubation')?.disable();
        this.nicuForm.get('CrIntubatedYn')?.setValue('');
        this.nicuForm.get('CrItubeSize')?.setValue('');
        this.nicuForm.get('CrItubeLevel')?.setValue('');
        this.nicuForm.get('CrIintubation')?.setValue('');
        this.nicuForm.get('CrIextubation')?.setValue('');

      }
      if(checkboxName == 'CrReintubation'){
        this.nicuForm.get('CrRtubeSize')?.disable();
        this.nicuForm.get('CrRtubeLevel')?.disable();
        this.nicuForm.get('CrRdate')?.disable();
        this.nicuForm.get('CrRentryDate')?.disable();
        this.nicuForm.get('CrRtubeSize')?.setValue('');
        this.nicuForm.get('CrRtubeLevel')?.setValue('');
        this.nicuForm.get('CrRdate')?.setValue('');
        this.nicuForm.get('CrRentryDate')?.setValue('');
      }

      if(checkboxName == 'MaternalDisea'){
        this.nicuForm.get('OthersT')?.disable();
        this.nicuForm.get('OthersT')?.setValue('');
        this.nicuForm.get('Others')?.disable();
        this.nicuForm.get('Others')?.setValue(false);
        this.nicuForm.get('Dm')?.disable();
        this.nicuForm.get('Htn')?.disable();
        this.nicuForm.get('Thyroid')?.disable();
        this.nicuForm.get('Hematology')?.disable();
        this.nicuForm.get('Uti')?.disable();
        this.nicuForm.get('Cardiac')?.disable();
        this.nicuForm.get('Neurological')?.disable();
        
      }
    }
  }


  toggleRadio(controlName: string, value: string,textinput?:string) {
    if (this.nicuForm.get(controlName)?.value === value) {
      this.nicuForm.get(controlName)?.setValue(null);
    }
    if (value === '1') {  
      if(controlName == 'AUcomplication' || controlName == 'AUacomplication' || controlName == 'MMalformation' || controlName == 'CrIntubatedYn' || controlName == 'CrReintubationYn'){
        this.nicuForm.get(textinput)?.disable();
        this.nicuForm.get(textinput)?.setValue('');
        if(controlName == 'CrIntubatedYn'){
          this.nicuForm.get('CrItubeSize')?.disable();
          this.nicuForm.get('CrItubeLevel')?.disable();
          this.nicuForm.get('CrIintubation')?.disable();
          this.nicuForm.get('CrIextubation')?.disable();
          this.nicuForm.get('CrItubeSize')?.setValue('');
          this.nicuForm.get('CrItubeLevel')?.setValue('');
          this.nicuForm.get('CrIintubation')?.setValue('');
          this.nicuForm.get('CrIextubation')?.setValue('');
        }
        if(controlName == 'CrReintubationYn'){
          this.nicuForm.get('CrRtubeSize')?.disable();
          this.nicuForm.get('CrRtubeLevel')?.disable();
          this.nicuForm.get('CrRdate')?.disable();
          this.nicuForm.get('CrRentryDate')?.disable();
          this.nicuForm.get('CrRtubeSize')?.setValue('');
          this.nicuForm.get('CrRtubeLevel')?.setValue('');
          this.nicuForm.get('CrRdate')?.setValue('');
          this.nicuForm.get('CrRentryDate')?.setValue('');
        }
        // if(controlName == 'AHernia'){
        //   this.nicuForm.get('AHerniaT')?.disable();
        //   this.nicuForm.get('AHerniaT')?.setValue('');
        // }
      }else{
        this.nicuForm.get(textinput)?.enable(); // Enable input when abnormal (Yes)
        if(controlName == 'HfAnteriorOc'){
          this.nicuForm.get('HfAsize')?.enable();
        }
        if(controlName == 'HfPosteriorOc'){
          this.nicuForm.get('HfPsize')?.enable();
        }
      }
    } else {
      if(controlName == 'AUcomplication' || controlName == 'AUacomplication' || controlName == 'MMalformation' || controlName == 'CrIntubatedYn' || controlName == 'CrReintubationYn'){
        this.nicuForm.get(textinput)?.enable();
        if(controlName == 'CrIntubatedYn'){
          this.nicuForm.get('CrItubeSize')?.enable();
          this.nicuForm.get('CrItubeLevel')?.enable();
          this.nicuForm.get('CrIintubation')?.enable();
          this.nicuForm.get('CrIextubation')?.enable();
        }
        if(controlName == 'CrReintubationYn'){
          this.nicuForm.get('CrRtubeSize')?.enable();
          this.nicuForm.get('CrRtubeLevel')?.enable();
          this.nicuForm.get('CrRdate')?.enable();
          this.nicuForm.get('CrRentryDate')?.enable();
        }

        // if(controlName == 'AHernia'){
        //   this.nicuForm.get('AHerniaT')?.enable
        // }
        
      }else{
        this.nicuForm.get(textinput)?.disable(); // Disable input when normal (No)
        this.nicuForm.get(textinput)?.setValue(''); // Clear input if disable
        if(controlName == 'HfAnteriorOc'){
          this.nicuForm.get('HfAsize')?.disable();
          this.nicuForm.get('HfAsize')?.setValue('');
        }
        if(controlName == 'HfPosteriorOc'){
          this.nicuForm.get('HfPsize')?.disable();
          this.nicuForm.get('HfPsize')?.setValue('');
        }
        if(controlName == 'CrIntubatedYn'){
          this.nicuForm.get('CrItubeSize')?.disable();
          this.nicuForm.get('CrItubeLevel')?.disable();
          this.nicuForm.get('CrIintubation')?.disable();
          this.nicuForm.get('CrIextubation')?.disable();
          this.nicuForm.get('CrItubeSize')?.setValue('');
          this.nicuForm.get('CrItubeLevel')?.setValue('');
          this.nicuForm.get('CrIintubation')?.setValue('');
          this.nicuForm.get('CrIextubation')?.setValue('');
        }
        if(controlName == 'CrReintubationYn'){
          this.nicuForm.get('CrRtubeSize')?.disable();
          this.nicuForm.get('CrRtubeLevel')?.disable();
          this.nicuForm.get('CrRdate')?.disable();
          this.nicuForm.get('CrRentryDate')?.disable();
          this.nicuForm.get('CrRtubeSize')?.setValue('');
          this.nicuForm.get('CrRtubeLevel')?.setValue('');
          this.nicuForm.get('CrRdate')?.setValue('');
          this.nicuForm.get('CrRentryDate')?.setValue('');
        }
      }
    }
  }
  toggleRadioMulti(controlName: string, value: string,textinput?:string) {
    if (this.nicuForm.get(controlName)?.value === value) {
      this.nicuForm.get(controlName)?.setValue(null);
    }
    if (value === '3') {  
      this.nicuForm.get(textinput)?.enable(); // Enable input when abnormal (Yes)
    } else {
        this.nicuForm.get(textinput)?.disable(); // Disable input when normal (No)
        this.nicuForm.get(textinput)?.setValue(''); // Clear input if disable
  
      }
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

  public getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
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

  toggleRadioMultiple(controlName: string, value: string,textinput?:string) {
    if (this.nicuForm.get(controlName)?.value === value) {
      this.nicuForm.get(controlName)?.setValue(null);
    }
    if (value === '2') {  
      this.nicuForm.get(textinput)?.enable(); // Enable input when abnormal (Yes)
    } else {
        this.nicuForm.get(textinput)?.disable(); // Disable input when normal (No)
        this.nicuForm.get(textinput)?.setValue(''); // Clear input if disable
  
      }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }  
     if (this.actionTypeSubscription$) {
      this.actionTypeSubscription$.unsubscribe();
      // this.dataShareService.sendActionType(null);
    }
  }

  getDocument(data?){
    this.docKey = this.admissionService.selectedCurrentDocDetails.Dockey;
    let json = {
      Dockey: this.admissionService.selectedCurrentDocDetails.Dockey,
    };
    this.admissionService
    .getNicuDocument(json.Dockey)
    .subscribe({
      next: (data: any) => {
        if(data){
          this.initForm(data?.results[0]);
          this.toVitalsArr = data?.results[0].TOVITALSIGNS.results;
        }
      },
      error: (err: any) => {
      
      },
    });
  }


  public createDoc(status?:any,actionType?:any){
    if(this.throwingError){
      status = '3',
      actionType='copy'
    }
    // if (this.nicuForm.invalid) {
    //   this.nicuForm.markAllAsTouched(); // Mark all fields as touched to show errors
    //   return;
    // }
    return new Promise((resolve, reject) => {
      let formData = this.nicuForm.getRawValue();
   const convertDateFormat = (dateString: string): string => {
    const [day, month, year] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toString();
  };
   if (formData.Datee) {
    if(typeof formData.Datee === 'string'){
      if (/\d{2}-\d{2}-\d{4}/.test(formData.Datee)) {
        formData.Datee = convertDateFormat(formData.Datee);
      }
    }
    const date = new Date(formData.Datee);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');

    formData.Datee = `${year}-${month}-${day}T00:00:00`;
  }
  if (formData.BirthDate) {
    if(typeof formData.BirthDate === 'string'){
      if (/\d{2}-\d{2}-\d{4}/.test(formData.BirthDate)) {
        formData.BirthDate = convertDateFormat(formData.BirthDate);
      }
    }
    const date = new Date(formData.BirthDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');

    formData.BirthDate = `${year}-${month}-${day}T00:00:00`;
  }
  if (formData.Lmp) {
    if(typeof formData.Lmp === 'string'){
      if (/\d{2}-\d{2}-\d{4}/.test(formData.Lmp)) {
        formData.Lmp = convertDateFormat(formData.Lmp);
      }
    }
    const date = new Date(formData.Lmp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');

    formData.Lmp = `${year}-${month}-${day}T00:00:00`;
  }
  if (formData.Edd) {
    if(typeof formData.Edd === 'string'){
      if (/\d{2}-\d{2}-\d{4}/.test(formData.Edd)) {
        formData.Edd = convertDateFormat(formData.Edd);
      }
    }
    const date = new Date(formData.Edd);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');

    formData.Edd = `${year}-${month}-${day}T00:00:00`;
  }
  if (formData.AdmDate) {
    if(typeof formData.AdmDate === 'string'){
      if (/\d{2}-\d{2}-\d{4}/.test(formData.AdmDate)) {
        formData.AdmDate = convertDateFormat(formData.AdmDate);
      }
    }
    const date = new Date(formData.AdmDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');

    formData.AdmDate = `${year}-${month}-${day}T00:00:00`;
  }
  if (formData.CrIintubation) {
    if(typeof formData.CrIintubation === 'string'){
      if (/\d{2}-\d{2}-\d{4}/.test(formData.CrIintubation)) {
        formData.CrIintubation = convertDateFormat(formData.CrIintubation);
      }
    }
    const date = new Date(formData.CrIintubation);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');

    formData.CrIintubation = `${year}-${month}-${day}T00:00:00`;
  }
  if (formData.CrIextubation) {
    if(typeof formData.CrIextubation === 'string'){
      if (/\d{2}-\d{2}-\d{4}/.test(formData.CrIextubation)) {
        formData.CrIextubation = convertDateFormat(formData.CrIextubation);
      }
    }
    const date = new Date(formData.CrIextubation);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');

    formData.CrIextubation = `${year}-${month}-${day}T00:00:00`;
  }
  if (formData.CrRentryDate) {
    if(typeof formData.CrRentryDate === 'string'){
      if (/\d{2}-\d{2}-\d{4}/.test(formData.CrRentryDate)) {
        formData.CrRentryDate = convertDateFormat(formData.CrRentryDate);
      }
    }
    const date = new Date(formData.CrRentryDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');

    formData.CrRentryDate = `${year}-${month}-${day}T00:00:00`;
  }
  if (formData.CrRdate) {
    if(typeof formData.CrRdate === 'string'){
      if (/\d{2}-\d{2}-\d{4}/.test(formData.CrRdate)) {
        formData.CrRdate = convertDateFormat(formData.CrRdate);
      }
    }
    const date = new Date(formData.CrRdate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');

    formData.CrRdate = `${year}-${month}-${day}T00:00:00`;
  }
   let checkVitalList: any[] = this.toVitalsArr?.filter((res) => {
    delete res.Vunit;
    delete res.value;
     return res;
  });
  if(formData.BirthTime){
   formData.BirthTime= this.convertTimeToDuration(formData.BirthTime)
  }
  if(formData.AdmTime){
   formData.AdmTime= this.convertTimeToDuration(formData.AdmTime)
  }
  if(formData.Timee){
   formData.Timee= this.convertTimeToDuration(formData.Timee)
  }
    let payload = {
      ...formData,
      Dockey : actionType === 'edit' ||  actionType === 'copy' ? this.docKey ? this.docKey : '' : '',
      Dtid : 'ZMED_NICAD',
      Einri: this.paramsObject.einri,
      MotherAge: formData.MotherAge,
      Patnr: this.paramsObject.patnr,
      Falnr: this.paramsObject.falnr,
      Lfdnr: this.paramsObject.lfdnr,
      Orgdo: this.storageService.patientData.deptOrgUnit,
      AttendPhy :this.storageService.getUserProfile().Gpart,
      DocStatus :status,
      TOVITALSIGNS:checkVitalList
    }
   
      this.subscription = this.admissionService.createNicuSet(payload).subscribe({
        next: (data: any) => {
          // if(this.soapFormEvent == 'saveClose' || this.soapFormEvent == 'release') {
          // }
          this.admissionService.cancelAllForm();
          this.admissionService.selectedCurrentDocDetails = '';
          this.realodEducationList.next(true);
          this.admissionService.clearSoapEvent.next(true);
          this.admissionService.isCloneNicuForm = false;
          this.admissionService.isEditNicuForm = false;
        },
        error: (err: any) => {
          this.admissionService.clearSoapEvent.next(true);
          this.admissionService.isCloneNicuForm = false;
          this.admissionService.isEditNicuForm = false;
          const errorMsg = err?.error?.error?.message?.value || 'Unknown error';
          this.sharedService.waringSwallModel(`PUT Error at Nicu: ${errorMsg}`);
        },
        complete: () => {
          resolve(true);
          if(status === 'edit'){
            this.sharedService.successSwallModel('Nicu updated successfully');
          }else{
            this.sharedService.successSwallModel('Nicu created successfully');
          }
        }
      });
    })   
    
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

  
  private convertDateFormat(dateInput) {

    // If input is a Date object, convert to /Date(timestamp)/
    if (dateInput instanceof Date) {
      return `/Date(${dateInput.getTime()})/`;
    }

    // If input is an ISO date string (e.g. "2025-06-30T05:07:07.976Z")
    if (typeof dateInput === 'string' && dateInput.includes('T')) {
      const date = new Date(dateInput);
      if (!isNaN(date.getTime())) {
        return `/Date(${date.getTime()})/`;
      }
    }

    // If input is in /Date(timestamp)/ format
    const match = /\/Date\((\d+)\)\//.exec(dateInput);
    if (match) {
      const timestamp = parseInt(match[1], 10);
      return new Date(timestamp);
    }
    return null;

  }


  private convertTimeFormat(timeInput) {

    // If format is HH:mm
    if (typeof timeInput === 'string' && /^\d{1,2}:\d{2}$/.test(timeInput)) {
      const [hours, minutes] = timeInput.split(':').map(Number);
      return `PT${hours}H${minutes}M0S`;
    }

    // If format is ISO 8601 duration (e.g. PT15H51M25S)
    const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(timeInput);
    if (match) {
      const hours = match[1] ? parseInt(match[1], 10) : 0;
      const minutes = match[2] ? parseInt(match[2], 10) : 0;
      // You can choose to include or ignore seconds
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    return null;
  }
}
