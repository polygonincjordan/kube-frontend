import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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
export class NewbornAssessmentComponent implements OnInit {
  @ViewChild('erVitalsModal') erVitalsModal: ErVitalsComponent;
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

  ngOnInit(): void {
   this.initForm()
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
        Datee : [data?.Datee ||''],
        Timee : [data?.Timee ||'PT12H30M07S'],
        ModeDelivery : [data?.ModeDelivery || ''],
        AssessmentDone : [data?.AssessmentDone || ''],
        AssessedBy : [data?.AssessedBy || ''],
        BirthDate : [data?.BirthDate || ''],
        BirthTime : [data?.BirthTime || 'PT15H21M29S'],
        BirthWeight : [data?.BirthWeight || ''],
        WeightUnit : [data?.WeightUnit || ''],
        HeadCircum : [data?.HeadCircum || ''],
        BabyLength : [data?.BabyLength || ''],
        ChestCircum : [data?.ChestCircum || ''],
        Gestation : [data?.Gestation || ''],
        Gender : [data?.Gender || ''],
        SSkincolor : [data?.SSkincolor || ''],
        SSkincolorT : [data?.SSkincolorT || ''],
        SaNormal : [data?.SaNormal || ''],
        SaRash : [data?.SaRash || ''],
        SaBruising : [data?.SaBruising || ''],
        SaLanugo : [data?.SaLanugo || ''],
        SaEdema : [data?.SaEdema || ''],
        SaDry : [data?.SaDry || ''],
        SaMongolian : [data?.SaMongolian || ''],
        SaSkinTags : [data?.SaSkinTags || ''],
        SaPetechia : [data?.SaPetechia || ''],
        SaCoatings : [data?.SaCoatings || ''],
        SaComments : [data?.SaComments || ''],
        HsNormal : [data?.HsNormal || ''],
        HsForceps : [data?.HsForceps || ''],
        HsMolding : [data?.HsMolding || ''],
        HsCaput : [data?.HsCaput || ''],
        HsLacerations : [data?.HsLacerations || ''],
        HsOverriding : [data?.HsOverriding || ''],
        HsCephalhema : [data?.HsCephalhema || ''],
        HsOther : [data?.HsOther || ''],
        HsOtherT : [data?.HsOtherT || ''],
        HfAnterior : [data?.HfAnterior || ''],
        HfAnteriorOc : [data?.HfAnteriorOc || ''],
        HfAother : [data?.HfAother || ''],
        HfAsize : [data?.HfAsize || ''],
        HfPosterior : [data?.HfPosterior || ''],
        HfPosteriorOc : [data?.HfPosteriorOc || ''],
        HfPother : [data?.HfPother || ''],
        HfPsize : [data?.HfPsize || ''],
        HeNormal : [data?.HeNormal || ''],
        HeLowSet : [data?.HeLowSet || ''],
        HePreauricular : [data?.HePreauricular || ''],
        HeBleeding : [data?.HeBleeding || ''],
        HeOther : [data?.HeOther || ''],
        HeOtherT : [data?.HeOtherT || ''],
        HeyClear : [data?.HeyClear || ''],
        HeyScleral : [data?.HeyScleral || ''],
        HeyEdema : [data?.HeyEdema || ''],
        HeyConjunct : [data?.HeyConjunct || ''],
        HeyRed : [data?.HeyRed || ''],
        HeyOther : [data?.Datee || ''],
        HeyOtherT : [data?.HeyOther || ''],
        HnNostrils : [data?.HnNostrils || ''],
        HnClosed : [data?.HnClosed || ''],
        HnOther : [data?.HnOther || ''],
        HnOtherT : [data?.HnOtherT || ''],
        HmNormal : [data?.HmNormal || ''],
        HmMovement : [data?.HmMovement || ''],
        HmSymmetry : [data?.HmSymmetry || ''],
        HmAsymmetry : [data?.HmAsymmetry || ''],
        HmCleftLip : [data?.HmCleftLip || ''],
        HmCleftPalate : [data?.HmCleftPalate || ''],
        HmOther : [data?.HmOther || ''],
        HmOtherT : [data?.HmOtherT || ''],
        HnNormal : [data?.HnNormal || ''],
        HnShort : [data?.HnShort || ''],
        HnStraight : [data?.HnStraight || ''],
        HnWebbing : [data?.HnWebbing || ''],
        HnNother : [data?.HnNother || ''],
        HnNotherT : [data?.HnNotherT || ''],
        CcSymmetrical : [data?.CcSymmetrical || ''],
        CcAssymetrical : [data?.CcAssymetrical || ''],
        CcOther : [data?.CcOther || ''],
        CcOtherT : [data?.CcOtherT || ''],
        CcaRegularHr : [data?.CcaRegularHr || ''],
        CcaIrregularHr : [data?.CcaIrregularHr || ''],
        CcaBradycardia : [data?.CcaBradycardia || ''],
        CcaTachycardia : [data?.CcaTachycardia || ''],
        CcaArrhythmia : [data?.CcaArrhythmia || ''],
        CcaMurmurs : [data?.CcaMurmurs || ''],
        CcaCapillary : [data?.CcaCapillary || ''],
        CcaFemoral : [data?.CcaFemoral || ''],
        CcaBrachial : [data?.CcaBrachial || ''],
        CcaRadial : [data?.CcaRadial || ''],
        CcaOther : [data?.CcaOther || ''],
        CcaOtherT : [data?.CcaOtherT || ''],
        CrRegularRr : [data?.CrRegularRr || ''],
        CrIrregularRr : [data?.CrIrregularRr || ''],
        CrGrunt : [data?.CrGrunt || ''],
        CrBradypnea : [data?.CrBradypnea || ''],
        CrTachypnea : [data?.CrTachypnea || ''],
        CrNasal : [data?.CrNasal || ''],
        CrApnea : [data?.CrApnea || ''],
        CrRecession : [data?.CrRecession || ''],
        CrOther : [data?.CrOther || ''],
        CrOtherT : [data?.CrOtherT || ''],
        CrBreathSound : [data?.CrBreathSound || ''],
        CrBreathSounds : [data?.CrBreathSounds || ''],
        CrBreathSoundt : [data?.CrBreathSoundt || ''],
        CrIntubated : [data?.CrIntubated || ''],
        CrIntubatedYn : [data?.CrIntubatedYn || ''],
        CrItubeSize : [data?.CrItubeSize || ''],
        CrItubeLevel : [data?.CrItubeLevel || ''],
        CrIintubation : [data?.CrIintubation || ''],
        CrIextubation : [data?.CrIextubation || ''],
        CrReintubation : [data?.CrReintubation || ''],
        CrReintubationYn : [data?.CrReintubationYn || ''],
        CrRtubeSize : [data?.CrRtubeSize || ''],
        CrRtubeLevel : [data?.CrRtubeLevel || ''],
        CrRdate : [data?.CrRdate || ''],
        CrRentryDate : [data?.CrRentryDate || ''],
        CbNormal : [data?.CbNormal || ''],
        CbAccessory : [data?.CbAccessory || ''],
        CbNodule : [data?.CbNodule || ''],
        CbOther : [data?.CbOther || ''],
        CbOtherT : [data?.CbOtherT || ''],
        AAbdominal : [data?.AAbdominal || ''],
        AAbdominalT : [data?.AAbdominalT || ''],
        ALiver : [data?.ALiver || ''],
        ALiverT : [data?.ALiverT || ''],
        ASpleen : [data?.ASpleen || ''],
        ASpleenT : [data?.ASpleenT || ''],
        AKidney : [data?.AKidney || ''],
        AKidneyT : [data?.AKidneyT || ''],
        AHernia : [data?.AHernia || ''],
        AHerniaT : [data?.AHerniaT || ''],
        AArteries : [data?.AArteries || ''],
        AArteriesT : [data?.AArteriesT || ''],
        AShape : [data?.AShape || ''],
        AShapeNa : [data?.AShapeNa || ''],
        AShapeT : [data?.AShapeT || ''],
        AVeins : [data?.AVeins || ''],
        AVeinsT : [data?.AVeinsT || ''],
        AUvc : [data?.AUvc || ''],
        AUinsertion : [data?.AUinsertion || ''],
        AUremoval : [data?.AUremoval || ''],
        AUcomplication : [data?.AUcomplication || ''],
        AUcomplicationT : [data?.AUcomplicationT || ''],
        AUac : [data?.AUac || ''],
        AUainsertion : [data?.AUainsertion || ''],
        AUaremoval : [data?.AUaremoval || ''],
        AUacomplication : [data?.AUacomplication || ''],
        AUacomplicationsT : [data?.AUacomplicationsT || ''],
        AComment : [data?.AComment || ''],
        ACommentT : [data?.ACommentT || ''],
        GmNormal : [data?.GmNormal || ''],
        GmEdema : [data?.GmEdema || ''],
        GmHydrocele : [data?.GmHydrocele || ''],
        GmTestes : [data?.GmTestes || ''],
        GmHypoxemia : [data?.GmHypoxemia || ''],
        GmOther : [data?.GmOther || ''],
        GmOtherT : [data?.GmOtherT || ''],
        GfNormal : [data?.GfNormal || ''],
        GfVaginal : [data?.GfVaginal || ''],
        GfHymenal : [data?.GfHymenal || ''],
        GfEdema : [data?.GfEdema || ''],
        GfOther : [data?.GfOther || ''],
        GfOtherT : [data?.GfOtherT || ''],
        GaPatent : [data?.GaPatent || ''],
        GaHemorrh : [data?.GaHemorrh || ''],
        GaOther : [data?.GaOther || ''],
        GaOtherT : [data?.GaOtherT || ''],
        GtDimple : [data?.GtDimple || ''],
        GtOther : [data?.GtOther || ''],
        GtOtherT : [data?.GtOtherT || ''],
        GComment : [data?.GComment || ''],
        MmNormal : [data?.MmNormal || ''],
        MmTremors : [data?.MmTremors || ''],
        MmHypotonic : [data?.MmHypotonic || ''],
        MmHypertonic : [data?.MmHypertonic || ''],
        MmOther : [data?.MmOther || ''],
        MmOtherT : [data?.MmOtherT || ''],
        MrMoro : [data?.MrMoro || ''],
        MrMoroV : [data?.MrMoroV || ''],
        MrRooting : [data?.MrRooting || ''],
        MrStepping : [data?.MrStepping || ''],
        MrGag : [data?.MrGag || ''],
        MrSucking : [data?.MrSucking || ''],
        MrGrasp : [data?.MrGrasp || ''],
        MrOther : [data?.MrOther || ''],
        MrOtherT : [data?.MrOtherT || ''],
        McNormal : [data?.McNormal || ''],
        McWeak : [data?.McWeak || ''],
        McHigh : [data?.McHigh || ''],
        McAbsent : [data?.McAbsent || ''],
        McOther : [data?.McOther || ''],
        McOtherT : [data?.McOtherT || ''],
        MaActive : [data?.MaActive || ''],
        MaLethargic : [data?.MaLethargic || ''],
        MaNoResponse : [data?.MaNoResponse || ''],
        MaHypooactive : [data?.MaHypooactive || ''],
        MaHyperactive : [data?.MaHyperactive || ''],
        MaOther : [data?.MaOther || ''],
        MaOtherT : [data?.MaOtherT || ''],
        MuNormal : [data?.MuNormal || ''],
        MuFractures : [data?.MuFractures || ''],
        MuClavicle : [data?.MuClavicle || ''],
        MuSyndactyly : [data?.MuSyndactyly || ''],
        MuPolydactyly : [data?.MuPolydactyly || ''],
        MuOther : [data?.MuOther || ''],
        MuOtherT : [data?.MuOtherT || ''],
        MlNormal : [data?.MlNormal || ''],
        MlHipClick : [data?.MlHipClick || ''],
        MlFractures : [data?.MlFractures || ''],
        MlSyndactyly : [data?.MlSyndactyly || ''],
        MlPolydactyly : [data?.MlPolydactyly || ''],
        MlTalipes : [data?.MlTalipes || ''],
        MlOther : [data?.MlOther || ''],
        MlOtherT : [data?.MlOtherT || ''],
        MPalmarCreases : [data?.MPalmarCreases || ''],
        MPalmarCreasesT : [data?.MPalmarCreasesT || ''],
        MComment : [data?.MComment || ''],
        MMalformation : [data?.MMalformation || ''],
        MMalformationT : [data?.MMalformationT || ''],
        GeneralImpression : [data?.GeneralImpression || ''],
        VitK : [data?.VitK || ''],
        HepB : [data?.HepB || ''],
        Comments : [data?.Comments || ''],
    })
  }

  


  getDocument(data){
    this.admissionService
    .getNewBornDocument('MED000000000000001000000085000000' )
    .subscribe({
      next: (data: any) => {
        if(data && data?.length){
          this.initForm(data.d.results[0]);
          this.toVitalsArr = data.d.results[0].TOVITALSIGNS.results

        }
      },
      error: (err: any) => {
      
      },
    });
  }

  createDoc(status?:any,actionType?:any){
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

    let payload = {
      ...formData,
      Dockey : actionType === 'edit' ? this.docKey : '',
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

  
  convertTimeToDuration(timeString: string): string {
    
    const [hours, minutes] = timeString.split(':').map(Number);

    const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;

    const durationString = `PT${formattedHours}H${formattedMinutes}M00S`;
    return timeString ? durationString : '';
}
}
