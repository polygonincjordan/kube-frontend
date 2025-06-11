import { DatePipe } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { PhysicianAllergyComponent } from 'src/app/shared-module/paediatrics-adm-document/physician-allergy/physician-allergy.component';
import Swal from 'sweetalert2';
import { ErVitalsForSBARComponent } from '../sbar-nursing-endorsement/er-vitals/er-vitals.component';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-nursing-initial-assessment',
  templateUrl: './nursing-initial-assessment.component.html',
  styleUrls: ['./nursing-initial-assessment.component.scss']
})
export class NursingInitialAssessmentComponent implements OnInit {
  @ViewChild('createAllergyId') createAllergyId: PhysicianAllergyComponent;
  @ViewChild('erVitalsModal') erVitalsModal: ErVitalsForSBARComponent;

  nursingFormGroup: FormGroup;
  activeTab: string = 'persoalData'
  activeTab3: string = 'postPartumAssessment'
  activeTab2: string = 'functionalAssessment'
  public CurrentDateAndTime: Date = new Date();
  items: []
  toVitalsArr: any = [];
  toAllergyArr: any = [];
  statusDescriptions = [
    { id: 0, label: 'Normal' },
    { id: 1, label: 'Birth Defects' },
    { id: 2, label: 'Premature' },
    { id: 3, label: 'Post Mature' }
  ];

  bloodGroups = [
    { id: 0, label: 'A-' },
    { id: 1, label: 'A+' },
    { id: 2, label: 'B-' },
    { id: 3, label: 'B+' },
    { id: 4, label: 'O-' },
    { id: 5, label: 'O+' },
    { id: 6, label: 'AB-' },
    { id: 7, label: 'AB+' }
  ];
  pain = [
    { id: 0, label: '1' },
    { id: 1, label: '2' },
    { id: 2, label: '3' },
    { id: 3, label: '4' },
    { id: 4, label: '5' },
    { id: 5, label: '6' },
    { id: 6, label: '7' },
    { id: 7, label: '8' },
    { id: 7, label: '9' },
    { id: 7, label: '10' }
  ];
  currentTime: any;
  paramsObject: any;
  apiJson: any;
  constructor(private modalService: BsModalService, private ePrescriptionService: EPrescriptionService, public storageService: StorageService,
    private sharedService: SharedService, private route: ActivatedRoute, private fb: FormBuilder
  ) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    this.currentTime = `${hours}:${minutes}:${seconds}`;

    this.route.queryParams.subscribe((params) => {
      this.paramsObject = params;
      this.storageService.setEinri(params['einri']);
      this.storageService.setFalnr(params['falnr']);
      this.storageService.setLfdnr(params['lfdnr']);
      this.storageService.setPatnr(params['patnr']);
    });
    this.apiJson = {
      Einri: this.storageService.einri,
      Falnr: this.storageService.falnr,
      Patnr: this.storageService.patnr,
      Lfdnr: this.storageService.lfdnr,
      Lfdbw: this.storageService.lfdnr
    }
  }


  ngOnInit() {
    this.nursingFormGroup = this.fb.group({
      Dockey: [''],
      Dtid: ['ZMED_NIAGO'],
      Einri: ['1000'],
      Patnr: ['1101'],
      Falnr: ['1402'],
      Lfdnr: ['00001'],
      Orgdo: ['F21IUAMC'],
      AttendPhy: ['9000000020'],
      DocStatus: ['1'],
      Datee: [''],
      Timee: [''],

      RObservation: [false],
      RLabour: [false],
      RAntePartum: [false],
      RPostPartum: [false],
      RTermination: [false],
      RCaesarean: [false],
      ROther: [false],
      ROtherTxt: [''],

      PPatientOcc: [''],
      PLHighSchool: [false],
      PLIlliterate: [false],
      PLUniversity: [false],
      PLOther: [false],
      PLOtherTxt: [''],
      PMaritalStatus: [''],

      PBSentFamily: [false],
      POBedControls: [false],
      POBathroomEmergency: [false],
      POSideRails: [false],
      PONurseCall: [false],
      POMealsTime: [false],
      POPatientFamily: [false],
      POTelevision: [false],
      POSmoking: [false],
      POQibia: [false],
      POTelephone: [false],
      PORiskFall: [false],

      PMNoIllness: [false],
      PMDm: [false],
      PMHypertension: [false],
      PMEmotionalDisorder: [false],
      PMDrugAbuse: [false],
      PMVictimAbuse: [false],
      PMAsthma: [false],
      PMRespProblems: [false],
      PMRenalProblems: [false],
      PMCardiacProblem: [false],
      PMBloodReaction: [false],
      PMEpilepsy: [false],
      PMMajorSurgery: [false],
      PMPostAnesthesia: [false],
      PMHxDvt: [false],
      PMCriticallyIll: [false],
      PMCancerPatient: [false],
      PMDying: [false],
      PMImmunocompromised: [false],
      PMReceiving: [false],
      PMCommunicable: [false],
      PMComplications: [''],
      PMOther: [false],
      PMOtherTxt: [''],

      PaDoYouHave: [''],
      PaSlHeadache: [false],
      PaSlBreast: [false],
      PaSlAbdominalCramps: [false],
      PaSlIncisionSite: [false],
      PaSlLowBack: [false],
      PaSlLegCalf: [false],
      PaSlPerineum: [false],
      PaSlAnal: [false],
      PaSlWholeBody: [false],
      PaSlOther: [false],
      PaSlOtherTxt: [''],
      PaPainIntensity: [false],
      PaPainIntensity1: [''],
      PaSleepingNight: [''],
      PaParticipatingActivities: [''],
      PaPainEveryday: [''],

      SSleepProblem: [''],
      SSleepingDifficulty: [false],
      SAwakeFrequently: [false],
      SSleepingAids: [false],

      NDiabetic: [''],
      NSevereAnorexia: [''],
      NLactating: [''],
      NVitamins: [''],
      NSwallowing: [''],
      NSpecialDiet: [''],
      NGiDisturbance: [''],
      NComments: [''],
      NPatientRiskResult: [''],
      NPatientRiskResultTxt: [''],
      NReferDietician: [''],
      NNameDietician: [''],

      PhGravida: [''],
      PhPara: [''],
      PhAbortion: [''],
      PhNoAlive: [''],
      PhNoDead: [''],
      PhLmp: [''],
      PhBloodGroup: [''],
      PhEdd: [''],
      PhGestationalAge: [''],
      PhNoPastOb: [false],
      PhPartumDepression: [false],
      PhPartumHemorrhage: [false],
      PhPreviousCs: [''],
      PhNoCs: [''],
      PhDateLastCs: [''],
      PhHepatitisA: [''],
      PhHepatitisB: [''],
      PhHepatitisC: [''],

      SkSkinProblem: [''],
      SkWound: [false],
      SkPressureUlcer: [false],
      SkDry: [false],
      SkPale: [false],
      SkCyanosis: [false],
      SkRashes: [false],

      FaFunctional: [''],
      FaParalysis: [false],
      FaMuscularWeakness: [false],
      FaWithWalkingAids: [false],
      FaSensoryImpairment: [false],

      SeDependent: [false],
      SeIndependent: [false],
      SeRestless: [false],
      SeCalm: [false],
      SeStressed: [false],
      SeCrying: [false],
      SeDistressed: [false],
      SeIrritable: [false],
      SeSad: [false],
      SeAfraid: [false],
      SeGrieving: [false],
      SeRefuseCare: [false],
      SeNoResponses: [false],
      SeHerFamily: [false],
      SeHusbandFamily: [false],

      NaOrientedTo: [false],
      NaOTime: [false],
      NaOPlace: [false],
      NaOPerson: [false],
      NaDisorientedTo: [false],
      NaDTime: [false],
      NaDPlace: [false],
      NaDPerson: [false],
      NaAlObeysCommand: [false],
      NaAlRespondsTo: [false],
      NaAlVoice: [false],
      NaAlPain: [false],
      NaAlUnresponsive: [false],
      NaAlAmnesiac: [false],
      NaSpeech: [''],
      NaOrderingPhysician: [''],

      RaRespiratory: [''],
      RaDryCough: [false],
      RaWheezing: [false],
      RaProductiveCough: [false],
      RaCrackles: [false],
      RaGrasping: [false],
      RaSuction: [false],
      RaSuctionR: [''],
      RaSecretion: [''],
      RaFrequency: [''],
      RaCyanotic: [false],
      RaCyanoticR: [''],
      RaOnOxygen: [''],
      RaNc: [''],
      RaFm: [''],
      RaOthers: [false],
      RaOthersTxt: [''],

      CaCardiovascular: [''],
      CaCardiovascularTxt: [''],
      CaHeartRate: [''],
      CaChestPain: [''],
      CaCapillary: [''],
      CaCapillaryTxt: [''],

      SMDeliveryDate: [''],
      SMDeliveryTime: [''],
      SMGa: [''],
      SMTypeDelivery: [false],
      SMTVaginal: [false],
      SMTForceps: [false],
      SMTVacuum: [false],
      SMTSpontaneous: [false],
      SMTCaesarean: [false],
      SMTElective: [false],
      SMTEmergency: [false],
      SMAGa: [false],
      SMAEpidural: [false],
      SMASpinal: [false],
      SMANone: [false],
      SMDActiveBaby: [false],
      SMDIufd: [false],
      SMDDeadBaby: [false],
      SMDCongenital: [false],
      SMDStillBaby: [false],

      SBVertex: [false],
      SBBreech: [false],
      SBTransverse: [false],
      SBNormalNursery: [false],
      SBNicu: [false],

      // Continue adding rest of the fields...

      TOALLERGY: this.fb.array([]),
      TOVITALSIGN: this.fb.array([]),
      TOMEDICATION: this.fb.array([]),
      TORISKFACTOR: this.fb.array([]),
      TOBABY: this.fb.array([]),
    });
  }

  get TOALLERGY(): FormArray {
    return this.nursingFormGroup.get('TOALLERGY') as FormArray;
  }

  get TOVITALSIGN(): FormArray {
    return this.nursingFormGroup.get('TOVITALSIGN') as FormArray;
  }

  get TOMEDICATION(): FormArray {
    return this.nursingFormGroup.get('TOMEDICATION') as FormArray;
  }

  get TORISKFACTOR(): FormArray {
    return this.nursingFormGroup.get('TORISKFACTOR') as FormArray;
  }

  get TOBABY(): FormArray {
    return this.nursingFormGroup.get('TOBABY') as FormArray;
  }

  addAllergy(data: any) {
    this.TOALLERGY.push(this.fb.group({
      Dockey: [data.Dockey || ''],
      Agroup: [data.Agroup || ''],
      Description: [data.Description || '']
    }));
  }

  addVitalSign(data: any) {
    this.TOVITALSIGN.push(this.fb.group({
      Dockey: [data.Dockey || ''],
      Vdescription: [data.Vdescription || ''],
      MeasuredValue: [data.MeasuredValue || ''],
      NormalRange: [data.NormalRange || ''],
      DateTime: [data.DateTime || ''],
      Vunit: [data.Vunit || '']
    }));
  }

  addMedication(data: any) {
    this.TOMEDICATION.push(this.fb.group({
      Dockey: [data.Dockey || ''],
      OrderType: [data.OrderType || ''],
      Description: [data.Description || ''],
      HomeMedication: [data.HomeMedication || false],
      PatientOwnMed: [data.PatientOwnMed || false],
      Dose: [data.Dose || ''],
      Validity: [data.Validity || ''],
      Route: [data.Route || ''],
      Amount: [data.Amount || ''],
      Rate: [data.Rate || ''],
      Therapy: [data.Therapy || ''],
      Id: [data.Id || ''],
      OrderingPhysician: [data.OrderingPhysician || ''],
      Cycle: [data.Cycle || '']
    }));
  }

  addRiskFactor(data: any) {
    this.TORISKFACTOR.push(this.fb.group({
      Dockey: [data.Dockey || ''],
      Id: [data.Id || ''],
      Desc: [data.Desc || ''],
      Code: [data.Code || '']
    }));
  }

  addBaby(data: any) {
    this.TOBABY.push(this.fb.group({
      Dockey: [data.Dockey || ''],
      No: [data.No || ''],
      Time: [data.Time || ''],
      Sex: [data.Sex || ''],
      ApgarScore1: [data.ApgarScore1 || ''],
      ApgarScore5: [data.ApgarScore5 || ''],
      ApgarScore10: [data.ApgarScore10 || ''],
      StatusDesc: [data.StatusDesc || '']
    }));
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;

  }
  setActiveTab2(tab: string): void {
    this.activeTab2 = tab;

  }
  setActiveTab3(tab: string): void {
    this.activeTab3 = tab;
  }

  modalRefUpdateName: BsModalRef;
  selectedMedicationOrder: any[] = [];
  drugArray: any[] = [];
  medicationImportDrugArray: any;
  toDiagnosisArr: any = [];
  duplicates: any = [];

  openModal(template: TemplateRef<any>) {
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

  medicationImport() {
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
  isChecked(item: any): boolean {
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

  public openModalForAllergy() {
    this.createAllergyId.openModalForAllergy();
  }

  public importAllergyData(data) {
    data.forEach((el) => {
      this.toAllergyArr = this.toAllergyArr.concat({
        Dockey: '',
        Agroup: el.AllergenGrp,
        Description: el.Allergen,
      });
    });
    this.duplicates = [];
    this.duplicates = this.findDuplicatesAllergy();
    this.toAllergyArr = this.toAllergyArr.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.Description === value.Description)
    );
    if (this.duplicates.length > 0) {
      this.errorMsgForDuplicatesAllergy();
    }
  }

  private errorMsgForDuplicatesAllergy() {
    let codeArr = [];
    this.duplicates.forEach((element) => {
      codeArr.push(element.Description);
    });

    Swal.fire({
      text: `${codeArr.toString()} is/are already Imported `,
      icon: 'warning',
      confirmButtonText: 'Ok',
      customClass: 'myalertpopup',
    });
  }

  private findDuplicatesAllergy() {
    let tempArr = [];
    const lookup = this.toAllergyArr.reduce((a, e) => {
      a[e.Description] = ++a[e.Description] || 0;
      return a;
    }, {});
    tempArr = this.toAllergyArr.filter((e) => lookup[e.Description]);
    return tempArr.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.Description === value.Description)
    );
  }

  convertToPTTime(time) {
    var createTime = time.split(':')
    createTime = 'PT' + createTime[0] + 'H' + createTime[1] + 'M' + '00S'
    return createTime;
  }

  public deleteFromAllergy(item, index) {
    this.toAllergyArr.splice(index, 1);
  }


  isCheckedVital: any = false;
  public handleCheckboxVitals(event) {
    this.isCheckedVital = event.target.checked;
  }


  public openModalVital() {
    if (this.isCheckedVital) return;
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

  parseDate(date: string) {
    if (date) {
      return new Date(new Date(+(date.replace('/Date(', '').replace(')/', ''))).toLocaleDateString("en-US"));
    }
  }

  getDate(value) {
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

}
