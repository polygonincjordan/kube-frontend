import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { StorageService } from '@services/storage.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ErVitalsComponent } from './er-vitals/er-vitals.component';
import { DatePipe } from '@angular/common';
import { AdmissionService } from '@services/admission/admission.service';
import { Subscription } from 'rxjs';
import { DataShareService } from '@services/data-share.service';
import { SharedService } from '@services/shared.service';
import { ActionType } from '@services/interfaces/common.enum';

@Component({
  selector: 'app-newborn-assessment',
  templateUrl: './newborn-assessment.component.html',
  styleUrls: ['./newborn-assessment.component.scss']
})
export class NewbornAssessmentComponent implements OnInit ,OnChanges {
  @ViewChild('erVitalsModal') erVitalsModal: ErVitalsComponent;
    @Output() successEvent: EventEmitter<any> = new EventEmitter<any>();
    @Output() realodEducationList = new EventEmitter();
    @Input () callFunction :any
    @Input() soapFormEvent: string = '';
  newBornForm:FormGroup
  selectedTabName: string = 'Skin';
  isChecked: any;
  paramsObject: any;
  encounterId: any;
  public toVitalsArr: any = [];
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
  docKey: any;
   private subscription: Subscription;
   private actionTypeSubscription$: Subscription;
  constructor(private formBuilder: FormBuilder, private _route: ActivatedRoute, public storageService: StorageService,public admissionService:AdmissionService,private sharedService: SharedService,private dataShareService:DataShareService,
    private modalService: BsModalService) {
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
    this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe((data) => {      
          if (data != null) {
            if (data.type == ActionType.Add$ && data.value == '') {
              this.docKey = data.value.Dockey
            }
            if (data.type == ActionType.Update$  && data.value) {
            this.docKey = data.value.docKey
            this.getDocument(data.value.docKey)
              }
              if (data.type == ActionType.Copy$  && data.value) {
                 this.docKey = data.value.docKey
                 this.getDocument(data.value.docKey)
              }
            }  else {
            // for after code
            }
    })

  }

  ngOnChanges(changes: SimpleChanges) {
      if (changes.soapFormEvent.currentValue == 'add') {
       this.createDoc('1','add')
      }
      if (changes.soapFormEvent.currentValue == 'edit') {
        this.createDoc('1','edit')
      }
      if (changes.soapFormEvent.currentValue == 'release') {
        this.createDoc('2','edit')
      }
      if (
        this.admissionService.isEditBornForm ||
        this.admissionService.isCloneNewBornForm
      ) {
        this.getDocument();
      }
    }

  ngOnInit(): void {
    this.initForm()
    this.newBornForm.get('SSkincolorT')?.disable();
    this.newBornForm.get('SSkincolor')?.valueChanges.subscribe(value => {
      if (value === '7') {
        this.newBornForm.get('SSkincolorT')?.enable();
    } else {
      this.newBornForm.get('SSkincolorT')?.disable();
      this.newBornForm.get('SSkincolorT')?.setValue(''); // Clear input if disabled
    }
  });
  
    this.newBornForm.get('CrBreathSounds')?.valueChanges.subscribe(value => {
    if (value === '3') {
      this.newBornForm.get('CrBreathSoundt')?.enable();
    } else {
      this.newBornForm.get('CrBreathSoundt')?.disable();
      this.newBornForm.get('CrBreathSoundt')?.setValue(''); // Clear input if disabled
    }
   });

   let storedPatientStr = localStorage.getItem('myPatient')
   if (storedPatientStr) {
    let storedPatient = JSON.parse(storedPatientStr); 
    let genderString = storedPatient.gender;
    if (genderString.includes('Female')) {
      this.newBornForm.get('Gender')?.setValue('Female'); 
    } else if (genderString.includes('Male')) {
      this.newBornForm.get('Gender')?.setValue('Male');
    }
  }
  
  }

  toggleInput(checkboxName: string, inputName: string) {
    const checkboxControl = this.newBornForm.get(checkboxName);
    const inputControl = this.newBornForm.get(inputName);
    if (checkboxControl?.value) {
      inputControl?.enable();
      if(checkboxName == 'AShape'){
        this.newBornForm.get('AShapeNa')?.setValue('0');
      }
      if(checkboxName == 'AUvc'){
        this.newBornForm.get('AUcomplication')?.setValue('1');
        this.newBornForm.get('AUinsertion')?.enable();
        this.newBornForm.get('AUremoval')?.enable();
      }
      if(checkboxName == 'AUac'){
        this.newBornForm.get('AUacomplication')?.setValue('1');
        this.newBornForm.get('AUainsertion')?.enable();
        this.newBornForm.get('AUaremoval')?.enable();
      }
      if(checkboxName == 'CrIntubated'){
        this.newBornForm.get('CrIntubatedYn')?.setValue('1');
      }
      if(checkboxName == 'CrReintubation'){
        this.newBornForm.get('CrReintubationYn')?.setValue('1');
      }
      if(checkboxName == 'HfAnterior'){
        this.newBornForm.get('HfAnteriorOc')?.setValue('0');
      }
      if(checkboxName == 'HfPosterior'){
        this.newBornForm.get('HfPosteriorOc')?.setValue('0');
      }
    } else {
      inputControl?.disable();
      inputControl?.setValue('');
      if(checkboxName == 'AShape'){
        this.newBornForm.get('AShapeT')?.disable();
      }
      if(checkboxName == 'AUvc'){
        this.newBornForm.get('AUcomplication')?.disable();
        this.newBornForm.get('AUinsertion')?.disable();
        this.newBornForm.get('AUremoval')?.disable();
        this.newBornForm.get('AUcomplicationT')?.disable();
      }
      if(checkboxName == 'AUac'){
        this.newBornForm.get('AUacomplicationsT')?.disable();
        this.newBornForm.get('AUacomplication')?.disable();
        this.newBornForm.get('AUainsertion')?.disable();
        this.newBornForm.get('AUaremoval')?.disable();
      }
      if(checkboxName == 'HfAnterior'){
        this.newBornForm.get('HfAnteriorOc')?.disable();
        this.newBornForm.get('HfAother')?.disable();
        this.newBornForm.get('HfAsize')?.disable();
        this.newBornForm.get('HfAother')?.setValue('');
        this.newBornForm.get('HfAsize')?.setValue('');
      }
      if(checkboxName == 'HfPosterior'){
        this.newBornForm.get('HfPosteriorOc')?.disable();
        this.newBornForm.get('HfPother')?.disable();
        this.newBornForm.get('HfPsize')?.disable();
        this.newBornForm.get('HfPother')?.setValue('');
        this.newBornForm.get('HfPsize')?.setValue('');
      }
      if(checkboxName == 'CrIntubated'){
        this.newBornForm.get('CrIntubatedYn')?.disable();
        this.newBornForm.get('CrItubeSize')?.disable();
        this.newBornForm.get('CrItubeLevel')?.disable();
        this.newBornForm.get('CrIintubation')?.disable();
        this.newBornForm.get('CrIextubation')?.disable();
        this.newBornForm.get('CrIntubatedYn')?.setValue('');
        this.newBornForm.get('CrItubeSize')?.setValue('');
        this.newBornForm.get('CrItubeLevel')?.setValue('');
        this.newBornForm.get('CrIintubation')?.setValue('');
        this.newBornForm.get('CrIextubation')?.setValue('');

      }
      if(checkboxName == 'CrReintubation'){
        this.newBornForm.get('CrRtubeSize')?.disable();
        this.newBornForm.get('CrRtubeLevel')?.disable();
        this.newBornForm.get('CrRdate')?.disable();
        this.newBornForm.get('CrRentryDate')?.disable();
        this.newBornForm.get('CrRtubeSize')?.setValue('');
        this.newBornForm.get('CrRtubeLevel')?.setValue('');
        this.newBornForm.get('CrRdate')?.setValue('');
        this.newBornForm.get('CrRentryDate')?.setValue('');
      }
    }
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

  initForm(data?){
    this.newBornForm = this.formBuilder.group({
        Datee : [this.getDate(data?.Datee) || null],
        Timee : [this.parseTime(data?.Timee) || null],
        ModeDelivery : [data?.ModeDelivery || ''],
        AssessmentDone : [data?.AssessmentDone || ''],
        AssessedBy : [data?.AssessedBy || ''],
        BirthDate : [this.getDate(data?.BirthDate) || null],
        BirthTime : [this.parseTime(data?.BirthTime) || null],
        BirthWeight : [data?.BirthWeight || null,[Validators.required, Validators.pattern(/^(0|[1-9]\d*)(\.\d+)?$/)]],
        WeightUnit : [data?.WeightUnit || ''],
        HeadCircum : [data?.HeadCircum || '',[Validators.required, Validators.pattern(/^(0|[1-9]\d*)(\.\d+)?$/)]],
        BabyLength : [data?.BabyLength || null,[Validators.required, Validators.pattern(/^(0|[1-9]\d*)(\.\d+)?$/)]],
        ChestCircum : [data?.ChestCircum || null,[Validators.required, Validators.pattern(/^(0|[1-9]\d*)(\.\d+)?$/)]],
        Gestation : [data?.Gestation || null,[Validators.required, Validators.pattern(/^(0|[1-9]\d*)(\.\d+)?$/)]],
        Gender : [''],
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
        CrIintubation : [data?.CrIintubation || { value: null, disabled: true }],
        CrIextubation : [data?.CrIextubation || { value: null, disabled: true }],
        CrReintubation : [data?.CrReintubation || false],
        CrReintubationYn : [data?.CrReintubationYn || ''],
        CrRtubeSize : [data?.CrRtubeSize || { value: '', disabled: true }],
        CrRtubeLevel : [data?.CrRtubeLevel || { value: '', disabled: true }],
        CrRdate : [data?.CrRdate || { value: null, disabled: true }],
        CrRentryDate : [data?.CrRentryDate || { value: null, disabled: true }],
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
        AComment : [data?.AComment || false],
        ACommentT : [data?.ACommentT || ''],
        GmNormal : [data?.GmNormal || false],
        GmEdema : [data?.GmEdema || false],
        GmHydrocele : [data?.GmHydrocele || false],
        GmTestes : [data?.GmTestes || false],
        GmHypoxemia : [data?.GmHypoxemia || false],
        GmOther : [data?.GmOther || false],
        GmOtherT : [data?.GmOtherT || { value: '', disabled: true }],
        GfNormal : [data?.GfNormal || false],
        GfVaginal : [data?.GfVaginal || false],
        GfHymenal : [data?.GfHymenal || false],
        GfEdema : [data?.GfEdema || false],
        GfOther : [data?.GfOther || false],
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
        VitK : [data?.VitK || ''],
        HepB : [data?.HepB || ''],
        Comments : [data?.Comments || ''],
    })
  }

  isInvalid(field: string): boolean {
    return this.newBornForm.get(field)?.invalid && (this.newBornForm.get(field)?.dirty || this.newBornForm.get(field)?.touched);
  }

  restrictToNumeric(event: any) {
    const charCode = event.which ? event.which : event.keyCode;
    if (
      (charCode < 48 || charCode > 57) && // Allow numbers 0-9
      charCode !== 46 // Allow decimal point
    ) {
      event.preventDefault();
    }
  }

  toggleRadio(controlName: string, value: string,textinput?:string) {
    if (this.newBornForm.get(controlName)?.value === value) {
      this.newBornForm.get(controlName)?.setValue(null);
    }
    if (value === '1') {
      if(controlName == 'AUcomplication' || controlName == 'AUacomplication' || controlName == 'MMalformation' || controlName == 'CrIntubatedYn' || controlName == 'CrReintubationYn' || controlName == 'AHernia'){
        this.newBornForm.get(textinput)?.disable();
        this.newBornForm.get(textinput)?.setValue('');
        if(controlName == 'CrIntubatedYn'){
          this.newBornForm.get('CrItubeSize')?.disable();
          this.newBornForm.get('CrItubeLevel')?.disable();
          this.newBornForm.get('CrIintubation')?.disable();
          this.newBornForm.get('CrIextubation')?.disable();
          this.newBornForm.get('CrItubeSize')?.setValue('');
          this.newBornForm.get('CrItubeLevel')?.setValue('');
          this.newBornForm.get('CrIintubation')?.setValue('');
          this.newBornForm.get('CrIextubation')?.setValue('');
        }
        if(controlName == 'CrReintubationYn'){
          this.newBornForm.get('CrRtubeSize')?.disable();
          this.newBornForm.get('CrRtubeLevel')?.disable();
          this.newBornForm.get('CrRdate')?.disable();
          this.newBornForm.get('CrRentryDate')?.disable();
          this.newBornForm.get('CrRtubeSize')?.setValue('');
          this.newBornForm.get('CrRtubeLevel')?.setValue('');
          this.newBornForm.get('CrRdate')?.setValue('');
          this.newBornForm.get('CrRentryDate')?.setValue('');
        }
        if(controlName == 'AHernia'){
          this.newBornForm.get('AHerniaT')?.disable();
          this.newBornForm.get('AHerniaT')?.setValue('');
        }
      }else{
        this.newBornForm.get(textinput)?.enable(); // Enable input when abnormal (Yes)
        if(controlName == 'HfAnteriorOc'){
          this.newBornForm.get('HfAsize')?.enable();
        }
        if(controlName == 'HfPosteriorOc'){
          this.newBornForm.get('HfPsize')?.enable();
        }
      }
    } else {
      if(controlName == 'AUcomplication' || controlName == 'AUacomplication' || controlName == 'MMalformation' || controlName == 'CrIntubatedYn' || controlName == 'CrReintubationYn' || controlName == 'AHernia'){
        this.newBornForm.get(textinput)?.enable();
        if(controlName == 'CrIntubatedYn'){
          this.newBornForm.get('CrItubeSize')?.enable();
          this.newBornForm.get('CrItubeLevel')?.enable();
          this.newBornForm.get('CrIintubation')?.enable();
          this.newBornForm.get('CrIextubation')?.enable();
        }
        if(controlName == 'CrReintubationYn'){
          this.newBornForm.get('CrRtubeSize')?.enable();
          this.newBornForm.get('CrRtubeLevel')?.enable();
          this.newBornForm.get('CrRdate')?.enable();
          this.newBornForm.get('CrRentryDate')?.enable();
        }

        if(controlName == 'AHernia'){
          this.newBornForm.get('AHerniaT')?.enable
        }
        
      }else{
        this.newBornForm.get(textinput)?.disable(); // Disable input when normal (No)
        this.newBornForm.get(textinput)?.setValue(''); // Clear input if disable
        if(controlName == 'HfAnteriorOc'){
          this.newBornForm.get('HfAsize')?.disable();
          this.newBornForm.get('HfAsize')?.setValue('');
        }
        if(controlName == 'HfPosteriorOc'){
          this.newBornForm.get('HfPsize')?.disable();
          this.newBornForm.get('HfPsize')?.setValue('');
        }
        if(controlName == 'CrIntubatedYn'){
          this.newBornForm.get('CrItubeSize')?.disable();
          this.newBornForm.get('CrItubeLevel')?.disable();
          this.newBornForm.get('CrIintubation')?.disable();
          this.newBornForm.get('CrIextubation')?.disable();
          this.newBornForm.get('CrItubeSize')?.setValue('');
          this.newBornForm.get('CrItubeLevel')?.setValue('');
          this.newBornForm.get('CrIintubation')?.setValue('');
          this.newBornForm.get('CrIextubation')?.setValue('');
        }
        if(controlName == 'CrReintubationYn'){
          this.newBornForm.get('CrRtubeSize')?.disable();
          this.newBornForm.get('CrRtubeLevel')?.disable();
          this.newBornForm.get('CrRdate')?.disable();
          this.newBornForm.get('CrRentryDate')?.disable();
          this.newBornForm.get('CrRtubeSize')?.setValue('');
          this.newBornForm.get('CrRtubeLevel')?.setValue('');
          this.newBornForm.get('CrRdate')?.setValue('');
          this.newBornForm.get('CrRentryDate')?.setValue('');
        }
      }
    }
  }


  getDocument(data?){
    this.docKey = this.admissionService.selectedCurrentDocDetails.Dockey;
    let json = {
      Dockey: this.admissionService.selectedCurrentDocDetails.Dockey,
    };
    this.admissionService
    .getNewBornDocument(json.Dockey)
    .subscribe({
      next: (data: any) => {
        if(data){
          this.initForm(data?.results[0]);
          this.toVitalsArr = data?.results[0].TOVITALSIGNS.results
        }
      },
      error: (err: any) => {
      
      },
    });
  }

  public createDoc(status?:any,actionType?:any){
    if(this.admissionService.isCloneNewBornForm){
      status = '3',
      actionType='copy'
    }
    if (this.newBornForm.invalid) {
      this.newBornForm.markAllAsTouched(); // Mark all fields as touched to show errors
      return;
    }
    return new Promise((resolve, reject) => {
      let formData = this.newBornForm.value;
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
  if (formData.AUinsertion) {
    if(typeof formData.AUinsertion === 'string'){
      if (/\d{2}-\d{2}-\d{4}/.test(formData.AUinsertion)) {
        formData.AUinsertion = convertDateFormat(formData.AUinsertion);
      }
    }
    const date = new Date(formData.AUinsertion);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');

    formData.AUinsertion = `${year}-${month}-${day}T00:00:00`;
  }
  if (formData.AUremoval) {
    if(typeof formData.AUremoval === 'string'){
      if (/\d{2}-\d{2}-\d{4}/.test(formData.AUremoval)) {
        formData.AUremoval = convertDateFormat(formData.AUremoval);
      }
    }
    const date = new Date(formData.AUremoval);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');

    formData.AUremoval = `${year}-${month}-${day}T00:00:00`;
  }
  if (formData.AUainsertion) {
    if(typeof formData.AUainsertion === 'string'){
      if (/\d{2}-\d{2}-\d{4}/.test(formData.AUainsertion)) {
        formData.AUainsertion = convertDateFormat(formData.AUainsertion);
      }
    }
    const date = new Date(formData.AUainsertion);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');

    formData.AUainsertion = `${year}-${month}-${day}T00:00:00`;
  }
  if (formData.AUaremoval) {
    if(typeof formData.AUaremoval === 'string'){
      if (/\d{2}-\d{2}-\d{4}/.test(formData.AUaremoval)) {
        formData.AUaremoval = convertDateFormat(formData.AUaremoval);
      }
    }
    const date = new Date(formData.AUaremoval);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');

    formData.AUaremoval = `${year}-${month}-${day}T00:00:00`;
  }
   let checkVitalList: any[] = this.toVitalsArr.filter((res) => {
    delete res.Vunit;
    delete res.value;
     return res;
  });
  if(formData.BirthTime){
   formData.BirthTime= this.convertTimeToDuration(formData.BirthTime)
  }
  if(formData.Timee){
   formData.Timee= this.convertTimeToDuration(formData.Timee)
  }
  formData.Gestation = formData.Gestation ? Number(formData.Gestation) : null;
    let payload = {
      ...formData,
      Dockey : actionType === 'edit' ||  actionType === 'copy' ? this.docKey : '',
      Dtid : 'ZMED_NBASM',
      Einri: this.paramsObject.einri,
      Patnr: this.paramsObject.patnr,
      Falnr: this.paramsObject.falnr,
      Lfdnr: this.paramsObject.lfdnr,
      Orgdo: this.storageService.patientData.deptOrgUnit,
      AttendPhy :this.storageService.getUserProfile().Gpart,
      DocStatus :status,
      TOVITALSIGNS:checkVitalList
    }
   
      this.subscription = this.admissionService.createNewBorn(payload).subscribe({
        next: (data: any) => {
          this.admissionService.cancelAllForm();
        this.admissionService.selectedCurrentDocDetails = '';
        this.admissionService.clearSoapEvent.next(true);
        this.realodEducationList.next(true);
        },
        error: (err: any) => {
          this.sharedService.waringSwallModel(`Error ${err}`);
          this.sharedService.waringSwallModel(`PUT Error at new born : ${err}`);
        },
        complete: () => {
          resolve(true);
          if(status === 'edit'){
            this.sharedService.successSwallModel('new born updated successfully');
          }else{
            this.sharedService.successSwallModel('new born created successfully');
          }
          this.successEvent.emit(true)
        }
      });
    })   
    
  }


  formatedDate(dateStr: any) {
    let date: Date;

    if (
      typeof dateStr === 'string' &&
      dateStr.length === 8 &&
      /^\d{8}$/.test(dateStr)
    ) {
      // Handle formatted date like "20241223"
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      date = new Date(`${year}-${month}-${day}`);
    } else if (
      typeof dateStr === 'string' &&
      /^\d{2}-\d{2}-\d{4}$/.test(dateStr)
    ) {
      // Handle date in "dd-MM-yyyy" format
      const [day, month, year] = dateStr.split('-');
      date = new Date(`${year}-${month}-${day}`);
    } else {
      // Handle other date formats
      date = new Date(dateStr);
    }

    if (isNaN(date.getTime())) {
      return ''
      // throw new Error('Invalid date format');
    }

    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Adding 1 because getMonth() returns 0-11
    const day = ('0' + date.getDate()).slice(-2);

    return `${year}${month}${day}`;
  }

  assessmentTabSelect(tabName: string) {
    this.selectedTabName = tabName;
  }

  public handleCheckboxVitals(event) {
    this.isChecked = event.target.checked;
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

  public deleteVitalsFromTable(index: number) {
    if (index > -1) {
      this.toVitalsArr.splice(index, 1);
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

  parsePayloadFormateTime(data: string) {
    if (data && data.length) {
      const strArr: string[] = data.split(':');
      if (data && data.length === 8) {
        return `PT${strArr[0]}H${strArr[1]}M${strArr[2]}S`;
      }
    }
    return null;
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

  convertMicrosoftDate(msDateString: string): Date | null {
    const match = msDateString.match(/\/Date\((\d+)\)\//);
    return match ? new Date(Number(match[1])) : null;
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
