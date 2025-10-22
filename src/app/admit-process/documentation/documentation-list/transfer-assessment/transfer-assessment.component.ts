import { DatePipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AdmissionService } from '@services/admission/admission.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { PhysicianErVitalsComponent } from '../physician-form/physician-er-vitals/physician-er-vitals.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-transfer-assessment',
  templateUrl: './transfer-assessment.component.html',
  styleUrls: ['./transfer-assessment.component.scss'],
})
export class TransferAssessmentComponent implements OnInit {
  @Output() realodEducationList = new EventEmitter();
  @ViewChild('erVitalsModal', { static: true })
  erVitalsModal: PhysicianErVitalsComponent;
  @Input() searchString: string;
  @Input() soapFormEvent: string = '';
  medicationOrderCase: any;
  medicationImportDrugArray: any;
  scalesArray: any[] = [];

  enableCreateVitals: any;
  modalRefUpdateName: BsModalRef;
  modalRefScales: BsModalRef;

  transferAssessForm: FormGroup;
  selectedScales: any[] = [];
  selectedMedicationOrder: any[] = [];
  drugArray: any[] = [];
  toAllergyArr: any = [];
  toVitalsArr: any = [];
  toExam: any = [];
  toMedication: any = [];
  toScaleArr: any[] = [];
  toProc: any = [];
  noMedicationOrder: any = false;
  noVitalSigns: any = false;

  orgUnits = [
    { code: '4THFL-C', name: '4th Floor-Zone C-IP' },
    { code: '4THFLVIP', name: '4th Floor-Zone B-VIP' },
    { code: '6FL-NICU', name: '6th Floor NICU' },
    { code: '6FL-NURS', name: '6th Floor Nursery Unit' },
    { code: '6FL-OROU', name: '6th Floor LDR Operation Rooms' },
    { code: 'F02AGAMC', name: '2nd Floor' },
    { code: 'F03AGAMC', name: '3rd Floor' },
    { code: 'F04GAMC', name: '4th Floor' },
    { code: 'F05AGAMC', name: '5th Floor' },
    { code: 'F06AGAMC', name: '6th Floor' },
    { code: 'F07AGAMC', name: '7th Floor' },
    { code: 'F09AGAMC', name: '9th Floor' },
    { code: 'F21IUAMC', name: '2nd Floor-Zone C-IP' },
    { code: 'F2DAGAMC', name: '2nd Floor Dialysis' },
    { code: 'F2DTUAMC', name: '2nd Floor Dialysis' },
    { code: 'F31IUAMC', name: '3rd Floor-Zone C-IP' },
    { code: 'F3CIUAMC', name: '3rd Floor-Zone B-IP' },
    { code: 'F3IAGAMC', name: 'Infusion Bay Area' },
    { code: 'F3TTUAMC', name: 'Infusion Bay Treatment Unit' },
    { code: 'EXCPTAMC', name: 'DAY CARE AREA' },
    // { code: 'F02AGAMC', name: '2nd Floor' },
    // { code: 'F03AGAMC', name: '3rd Floor' },
    // { code: 'F04AGAMC', name: '4th Floor' },
    // { code: 'F05AGAMC', name: '5th Floor' },
    // { code: 'F06AGAMC', name: '6th Floor' },
    // { code: 'F07AGAMC', name: '7th Floor' },
    { code: 'F51IUAMC', name: '5th Floor-Zone C-IP' },
    { code: 'F5VIUAMC', name: '5th Floor-Zone B-IP' },
    { code: 'F6CIUAMC', name: '6th Floor-Zone C-IP' },
    { code: 'F7IIUAMC', name: '7th Class 2-3 Medical/Surgical' },
    { code: 'F9DAGAMC', name: '9th Floor Day Surgery Area' },
    { code: 'F9DIUAMC', name: '9th Floor Day Surgery' },
    { code: 'F9GOTAMC', name: 'Major OT (GRAL)' },
    { code: 'F9IIUAMC', name: '9th Floor ICU Area' },
    { code: 'LDRASMTU', name: '6th Floor LDR Birthing Unit' },
    { code: 'LDRINTOU', name: '6th Floor Neonatal Intermediate' },
  ];

  selectedOrgUnit: any;

  constructor(
    public modalService: BsModalService,
    public storageService: StorageService,
    private formBuilder: FormBuilder,
    private admissionService: AdmissionService,
    private datePipe: DatePipe,
    public ePrescriptionService: EPrescriptionService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.initTransferAssesstForm();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.soapFormEvent.currentValue == 'add') {
      this.createTransferAssessForm(false);
    }
    if (changes.soapFormEvent.currentValue == 'edit') {
      this.updateTransferAssessForm();
    }
    if (changes.soapFormEvent.currentValue == 'edit') {
      if (this.admissionService.isEditTransferAssestForm) {
        this.updateTransferAssessForm();
      } else {
        this.createTransferAssessForm(false);
      }
    }

    if (changes.soapFormEvent.currentValue == 'release') {
      if (this.admissionService.isEditTransferAssestForm) {
        this.releaseTransferAssessForm();
      } else {
        this.createTransferAssessForm(true);
      }
    }

    if (
      this.admissionService.isEditTransferAssestForm ||
      this.admissionService.isCloneTransferAssestForm
    ) {
      this.getTransferData();
    }
  }
  initForm() {
    this.transferAssessForm = this.formBuilder.group({
      Dockey: [''],
      Dtid: ['ZMED_TRFAS'],
      Einri: [this.storageService.einri],
      Patnr: [this.storageService.patnr],
      Falnr: [this.storageService.falnr],
      Lfdnr: [this.storageService.lfdnr],
      Orgdo: [localStorage.getItem('initOrg')],
      Datee: [
        new Date(
          `${new DatePipe('en-US').transform(
            new Date(),
            'yyyy-MM-dd'
          )}T00:00:00`
        ),
      ],
      Timee: [this.datePipe.transform(new Date(), 'hh:mm')],
      DelUnit: [''],
      RecUnit: [''],
      TransReason: [''],
      SummaryInte: [''],
      Wheelchair: [''],
      Stretcher: [''],
      Oxygen: [''],
      Isolationn: [''],
      IsolationType: [''],
      ContiMonitoring: [''],
      OtherRequir: [''],
      AttendPhy: [this.storageService.getGpart()],
      DocStatus: [''],
      CarePlan: [''],
      TransferCond: [''],
      PatAsses: [''],
      NoVitalSigns: false,
      NoProcedure: false,
      NoMedication: false,
      NoExamination: false,
      NoScales: false,
    });
  }

  initTransferAssesstForm() { }

  getTransferData() {
    let json = {
      Dockey: this.admissionService.selectedCurrentDocDetails.Dockey,
    };
    this.admissionService
      .getTansferAssessData(json)
      .subscribe((patientResult) => {
        console.log(patientResult);
        this.toVitalsArr = patientResult?.results[0].TOVITALSIGNS?.results;
        this.medicationImportDrugArray =
          patientResult?.results[0].TOMED?.results.map((element) => ({
            Dockey: '',
            OrderType: element.OrderType,
            Descr: element.Descr,
            HomeMedication: false,
            PatientOwnMed: false,
            Dose: element.Dose,
            Validity: element.Validity,
            Route: element.Routedescr,
            Amount: '',
            Rate: '',
            Therapy: '00000',
            Id: '',
            OrderingPhysician: element.RespEmp,
            Cycle: element.CycleTxt,
          }));

        this.scalesArray = patientResult?.results[0].TOSCALE?.results.map(
          (element) => ({
            Scaletype: element.ScaleType,
            LastScore: element.LastScore,
            ScoreDesc: element.ScoreDesc,
            DateTime: element.Datetimee,
          })
        );
        this.transferAssessForm.patchValue(patientResult?.results[0]);
        this.transferAssessForm.patchValue({
          Dockey: patientResult?.results[0]?.Dockey,
          Datee: this.getDate(patientResult?.results[0]?.Datee),
          Timee: this.getTime(patientResult?.results[0]?.Timee),
        });
      });
  }

  async createTransferAssessForm(isrelease: boolean) {

    let createJson = this.transferAssessForm.value;
    console.log(createJson);
    if (
      createJson['Dockey'] === null ||
      createJson['Dockey'] === undefined ||
      createJson['Dockey'] === ''
    ) {
      if (isrelease) {
        createJson['DocStatus'] = '4';
      } else {
        createJson['DocStatus'] = '1';
      }
    } else {
      if (this.admissionService.isCloneTransferAssestForm && isrelease) {
        createJson['DocStatus'] = '5';
      }
      if (this.admissionService.isCloneTransferAssestForm && !isrelease) {
        createJson['DocStatus'] = '3';
      }
    }

    if (createJson.Datee != '') {
      createJson.Datee = `${new DatePipe('en-US').transform(
        createJson.Datee,
        'yyyy-MM-dd'
      )}T00:00:00`;
    }
    let createtime = '';
    if (createJson.Timee != '') {
      createtime = createJson.Timee.split(':');
      createJson.Timee =
        'PT' + createtime[0] + 'H' + createtime[1] + 'M' + '00S';
    }

    createJson['TOVITALSIGNS'] = this.toVitalsArr;
    createJson['TOPROCE'] = [];
    createJson['TOEXAM'] = [];
    createJson['TOMED'] = this.medicationImportDrugArray?.length ? this.medicationImportDrugArray.map((med) => ({
      Dockey: '',
      OrderType: med.OrderType,
      Descr: med.Description, // assuming this is the correct mapping
      Dose: med.Dose,
      CycleTxt: med.Cycle, // static value as per your example
      Validity: med.Validity,
      RespEmp: med.OrderingPhysician, // assuming that's what you want
      Route: med.Route,
      Rate: med.Rate || '',
    })) : [];
    createJson['TOSCALE'] = this.scalesArray?.length
      ? this.scalesArray
        .filter(element => element.LastScore && element.ScoreDesc) // Only include if both fields have data
        .map(element => ({
          Dockey: '',
          ScaleType: element.ScaleType,
          LastScore: element.LastScore,
          ScoreDesc: element.ScoreDesc,
          Datetimee: element.Datetimee,
        })) : [];
    await this.admissionService
      .createTansferAssessData(createJson)
      .subscribe((x) => {
        console.log(x);
        // if(this.soapFormEvent == 'saveClose' || this.soapFormEvent == 'release') { 
        // }
        this.admissionService.cancelAllForm();
        this.admissionService.selectedCurrentDocDetails = '';
        this.admissionService.clearSoapEvent.next(true);
        this.realodEducationList.next(true);
      });
  }

  async updateTransferAssessForm() {
    let updateJson = this.transferAssessForm.value;
    let createtime = '';
    if (updateJson.Datee != '') {
      updateJson.Datee = `${new DatePipe('en-US').transform(
        updateJson.Datee,
        'yyyy-MM-dd'
      )}T00:00:00`;
    }
    if (updateJson.Timee != '') {
      createtime = updateJson.Timee.split(':');
      updateJson.Timee =
        'PT' + createtime[0] + 'H' + createtime[1] + 'M' + '00S';
    }
    updateJson['DocStatus'] = '1';
    updateJson['TOVITALSIGNS'] = this.toVitalsArr;
    updateJson['TOPROCE'] = [];
    updateJson['TOEXAM'] = [];
    updateJson['TOMED'] = this.medicationImportDrugArray.map((med) => ({
      Dockey: '',
      OrderType: med.OrderType,
      Descr: med.Description, // assuming this is the correct mapping
      Dose: med.Dose,
      CycleTxt: med.Cycle, // static value as per your example
      Validity: med.Validity,
      RespEmp: med.OrderingPhysician, // assuming that's what you want
      Route: med.Route,
      Rate: med.Rate || '',
    }));
    updateJson['TOSCALE'] = this.scalesArray?.length
      ? this.scalesArray
        .filter(element => element.LastScore && element.ScoreDesc) // Only include if both fields have data
        .map(element => ({
          Dockey: '',
          ScaleType: element.ScaleType,
          LastScore: element.LastScore,
          ScoreDesc: element.ScoreDesc,
          Datetimee: element.Datetimee,
        })) : [];
    await this.admissionService.updateTransferDoc(updateJson).subscribe(() => {
      // if(this.soapFormEvent == 'saveClose' || this.soapFormEvent == 'release') { 
      // }
      this.admissionService.cancelAllForm();
      this.admissionService.selectedCurrentDocDetails = '';
      this.admissionService.clearSoapEvent.next(true);
      this.realodEducationList.next(true);
    });
  }
  async releaseTransferAssessForm() {
    let updateJson = this.transferAssessForm.value;
    let createtime = '';
    if (updateJson.Datee != '') {
      updateJson.Datee = `${new DatePipe('en-US').transform(
        updateJson.Datee,
        'yyyy-MM-dd'
      )}T00:00:00`;
    }
    if (updateJson.Timee != '') {
      createtime = updateJson.Timee.split(':');
      updateJson.Timee =
        'PT' + createtime[0] + 'H' + createtime[1] + 'M' + '00S';
    }
    updateJson['DocStatus'] = '1';
    updateJson['TOVITALSIGNS'] = this.toVitalsArr;
    updateJson['TOPROCE'] = [];
    updateJson['TOEXAM'] = [];
    updateJson['TOMED'] = this.medicationImportDrugArray.map((med) => ({
      Dockey: '',
      OrderType: med.OrderType,
      Descr: med.Description, // assuming this is the correct mapping
      Dose: med.Dose,
      CycleTxt: med.Cycle, // static value as per your example
      Validity: med.Validity,
      RespEmp: med.OrderingPhysician, // assuming that's what you want
      Route: med.Route,
      Rate: med.Rate || '',
    }));
    updateJson['TOSCALE'] = this.scalesArray?.length
      ? this.scalesArray
        .filter(element => element.LastScore && element.ScoreDesc) // Only include if both fields have data
        .map(element => ({
          Dockey: '',
          ScaleType: element.ScaleType,
          LastScore: element.LastScore,
          ScoreDesc: element.ScoreDesc,
          Datetimee: element.Datetimee,
        })) : [];
    this.admissionService.releaseTransferDoc(updateJson).subscribe(() => {
      this.admissionService.cancelAllForm();
      this.admissionService.selectedCurrentDocDetails = '';
      this.admissionService.clearSoapEvent.next(true);
      this.realodEducationList.next(true);
    });
  }

  openModalForScales(template: TemplateRef<any>) {
    const config: ModalOptions = {
      class:
        'modal-dialog modal-dialog-centered medication-order-case modal-xl',
    };
    this.modalRefScales = this.modalService.show(template, config);
    this.loadScalesData();
    // this.medicationImportDrugArray=[];
  }

  loadScalesData() {
    // this.selectedScales = [];
    this.toScaleArr = [];
    const scalesOrders: Subscription = this.ePrescriptionService
      .loadData(
        `e-prescription/ScalesList?Patnr=${this.ePrescriptionService.parameters.patnr}`,
        false,
        false,
        false,
        false
      )
      .subscribe(
        (resp: any) => {
          console.log(resp);
          if (
            resp.body &&
            resp.body.d &&
            resp.body.d.results &&
            resp.body.d.results.length
          ) {
            //this.configurationData = resp.body.d.results;
            this.toScaleArr = resp.body.d.results;
            // this.medicationImportDrugArray=[];
            //http://amcqaemr01.ach.jo:8000/sap/opu/odata/sap/ZN_TRANSFER_ASSES_SRV/PatScalesSet?$filter=Patnr
          }
          //   this.filterEvents();
        },
        () => {
          scalesOrders.unsubscribe();
        }
      );
  }
  openModal(template: TemplateRef<any>) {
    if (this.noMedicationOrder) return;
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

  openModalVital() {
    if (this.noVitalSigns) return;
    const item = {
      Einri: this.storageService.einri,
      Patnr: this.storageService.patnr,
      Falnr: this.storageService.falnr,
      Lfdnr: this.storageService.lfdnr,
      Patient: this.storageService?.patientData?.name,
      admissionDate: this.storageService.patientData.periodStart,
    };
    this.erVitalsModal.openModalForErVital(item);
  }

  handleCheckboxVitals() {
    throw new Error('Method not implemented.');
  }
  // toVitalsArr: any[]=[];
  public deleteVitalsFromTable(index: number) {
    if (index > -1) {
      this.toVitalsArr.splice(index, 1);
    }
  }

  onDateChange($event: any) {
    //  throw new Error('Method not implemented.');
  }
  fillCommentBox(arg0: string) {
    throw new Error('Method not implemented.');
  }

  importVitalsData(data) {
    data.forEach((el) => {
      this.toVitalsArr = this.toVitalsArr.concat({
        Dockey: '',
        Vdescription: el.Name,
        MeasuredValue: el.ValueFormatted,
        NormalRange: el.NormalRange,
        DateTime: `${new DatePipe('en-US').transform(
          this.getDate(el.Date),
          'dd.MM.yyyy'
        )}/${this.getTime(el.Time)}`,
        Vunit: el.UnitTxt,
      });
    });
    this.transferAssessForm.patchValue({
      NoVitalSigns: false
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
      var str = str.split(':');
      var finalstr = str[0] + ':' + str[1];
      return finalstr;
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
    this.transferAssessForm.patchValue({
      NoMedication: false
    });
  }

  collectAllMedicationIData(event: any) {
    if (event.target.checked) {
      this.selectedMedicationOrder = Object.assign([], this.drugArray);
    } else {
      this.selectedMedicationOrder = [];
    }
  }

  scalesImport() {
    // this.scalesArray = [] ;
    // this.drugArray.forEach(element => {
    this.selectedScales.forEach((element) => {
      console.log(element);
      this.scalesArray = this.scalesArray.concat({
        Dockey: '',
        ScaleType: element.Scaletype,
        ScoreDesc: element.ScoreDesc,
        Datetimee: element.DateTime,
        LastScore: element.Score,
      });
    });
    this.modalRefScales.hide();
    this.transferAssessForm.patchValue({
      NoScales: false
    });
  }

  collectAllScalesData(event: any) {
    if (event.target.checked) {
      this.selectedScales = Object.assign([], this.toScaleArr);
    } else {
      this.selectedScales = [];
    }
  }

  isCheckedScale(item: any): boolean {
    return this.selectedScales.some((x) => x.Scaletype == item.Scaletype);
  }

  collectScalesIData(event, item) {
    if (event.target.checked) {
      this.selectedScales.push(item);
    } else {
      const indexOf = this.selectedScales.findIndex(
        (x) => x.Scaletype == item.Scaletype
      );
      if (indexOf !== -1) this.selectedScales.splice(indexOf, 1);
    }
  }

  onIsolationChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    const isoTypeControl = this.transferAssessForm.get('IsolationType');

    if (selectedValue === '2') {
      isoTypeControl?.enable();
    } else {
      isoTypeControl?.disable();
      isoTypeControl?.reset();
    }
  }

  importProcedures() {
    Swal.fire({
      text: 'There is no procedures to import',
      confirmButtonColor: '#0890c5',
      cancelButtonColor: '#84898c',
      confirmButtonText: 'OK',
      customClass: { popup: 'myalertpopup' },
      icon: 'warning',
    });
  }
  importExamination() {
    Swal.fire({
      text: 'There is no examination to import',
      confirmButtonColor: '#0890c5',
      cancelButtonColor: '#84898c',
      confirmButtonText: 'OK',
      customClass: { popup: 'myalertpopup' },
      icon: 'warning',
    });
  }
}
