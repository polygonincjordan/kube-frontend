import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AdmissionService } from '@services/admission/admission.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { PhysicianErVitalsComponent } from '../physician-form/physician-er-vitals/physician-er-vitals.component';

@Component({
  selector: 'app-transfer-assessment',
  templateUrl: './transfer-assessment.component.html',
  styleUrls: ['./transfer-assessment.component.scss']
})
export class TransferAssessmentComponent implements OnInit {
  @Output() realodEducationList = new EventEmitter();
  @ViewChild('erVitalsModal', { static: true }) erVitalsModal: PhysicianErVitalsComponent;
  @Input() searchString: string;
  @Input() soapFormEvent: string = '';
  medicationOrderCase: any;
  medicationImportDrugArray: any;
 scalesArray: any[]=[];

  enableCreateVitals: any;
  modalRefUpdateName: BsModalRef;
  modalRefScales: BsModalRef;

  transferAssessForm: FormGroup;
  selectedScales:any[]=[];
  selectedMedicationOrder: any[] = [];
  drugArray: any[] = [];
  toAllergyArr: any = [];
  toVitalsArr: any = [];
  toExam: any = [];
  toMedication: any = [];
  toScaleArr: any[] = [];
  toProc: any = [];
  constructor(
    public modalService: BsModalService,
    public storageService: StorageService,
    private formBuilder: FormBuilder,
    private admissionService: AdmissionService,
    private datePipe: DatePipe,
    public ePrescriptionService: EPrescriptionService,) { }

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

    if (changes.soapFormEvent.currentValue == 'release') {
      if (this.admissionService.isEditPhysicianForm) {
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
      Orgdo: [''],
      Datee: [
        new Date(
          `${new DatePipe('en-US').transform(
            new Date(),
            'yyyy-MM-dd'
          )}T00:00:00`
        ),
      ],
      Timee: [this.datePipe.transform(new Date(), 'hh:mm')],
      DelUnit:[""] ,
      RecUnit:[""],
      TransReason: [""],
      SummaryInte:[""],
      Wheelchair:[""],
      Stretcher:[""],
      Oxygen:[""],
      Isolationn:[""],
      IsolationType:[""],
      ContiMonitoring:[""],
      OtherRequir:[""],
      AttendPhy:[""],
      DocStatus:[""],
      CarePlan:[""],
      TransferCond:[""],
      PatAsses:[""]
    });
  }

  initTransferAssesstForm() {

  }

  getTransferData() {
    let json = {
      Dockey: this.admissionService.selectedCurrentDocDetails.Dockey,
    };
    this.admissionService.getTansferAssessData(json).subscribe((patientResult) => {
      console.log(patientResult);
      this.toVitalsArr = patientResult?.results[0].TOVITALSIGNS?.results;
      this.medicationImportDrugArray = patientResult?.results[0].TOMEDICATION?.results;
      this.toScaleArr=patientResult?.results[0].TOSCALE?.results;
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
console.log(createJson)
    if (createJson["Dockey"] === null || createJson["Dockey"] === undefined || createJson["Dockey"] === "") {
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
    createJson['TOMED'] = this.medicationImportDrugArray;
    createJson['TOSCALE'] = [];
    await this.admissionService
      .createTansferAssessData(createJson)
      .subscribe((x) => {
        console.log(x)
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
    updateJson['TOMED'] = this.medicationImportDrugArray;
    updateJson['TOSCALE'] = [];
    await this.admissionService
      .updateTransferDoc(updateJson)
      .subscribe(() => {
        this.admissionService.cancelAllForm();
        this.admissionService.selectedCurrentDocDetails = '';
        this.admissionService.clearSoapEvent.next(true);
        this.realodEducationList.next(true);
      });
  }
  async releaseTransferAssessForm() {
    let updateJson = this.transferAssessForm.value;
    let createtime = '';
    updateJson['DocStatus'] = '2';
    if (updateJson.Datee != '') {
      updateJson['Datee'] = `${new DatePipe('en-US').transform(
        updateJson.Datee,
        'yyyy-MM-dd'
      )}T00:00:00`;
    }
    if (updateJson.Timee != '') {
      createtime = updateJson.Timee.split(':');
      updateJson.Timee =
        'PT' + createtime[0] + 'H' + createtime[1] + 'M' + '00S';
    }
    updateJson['TOALLERGIES'] = this.toAllergyArr;
    updateJson['TOVITALSIGNS'] = this.toVitalsArr;
    updateJson['TOPHYEXAM'] = this.transferAssessForm.value.TOPHYEXAM.results;
    // updateJson['TODIAGNOSES'] = this.toDiagnosisArr;
    updateJson['TOPMEDCOND'] = this.toMedication;
    // updateJson['TOPSURGERIHIST'] = this.toPastSurgical;
    // updateJson['TOFAMILYHIST'] = this.toFamilyHistory;
    updateJson['TOMEDICATION'] = this.medicationImportDrugArray;
    this.admissionService.releasePhysicianDoc(updateJson).subscribe(() => {
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
    const scalesOrders: Subscription = this.ePrescriptionService.loadData(`e-prescription/ScalesList?Patnr=${this.ePrescriptionService.parameters.patnr}`, false, false, false, false).subscribe((resp: any) => {
     console.log(resp)
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        //this.configurationData = resp.body.d.results;
        this.toScaleArr = resp.body.d.results;
        // this.medicationImportDrugArray=[];
       //http://amcqaemr01.ach.jo:8000/sap/opu/odata/sap/ZN_TRANSFER_ASSES_SRV/PatScalesSet?$filter=Patnr
      }
      //   this.filterEvents();
    }, () => { scalesOrders.unsubscribe(); });
  }
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
    const profileOrderHistory: Subscription = this.ePrescriptionService.loadData(`e-prescription/OrderHistorylist?Einri=${this.ePrescriptionService.parameters.einri}&Falnr=${this.ePrescriptionService.parameters.falnr}`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        //this.configurationData = resp.body.d.results;
        this.drugArray = resp.body.d.results;
        // this.medicationImportDrugArray=[];

      }
      //   this.filterEvents();
    }, () => { profileOrderHistory.unsubscribe(); });
  }

  openModalVital() {
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
  deleteVitalsFromTable(_t73: any,_t74: number) {
  throw new Error('Method not implemented.');
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
    return this.selectedMedicationOrder.some(x => x.Meordid == item.Meordid);
  }

  collectMedicationIData(event, item) {
    if (event.target.checked) {
      this.selectedMedicationOrder.push(item);
      // this.medicationImportDrugArray.push(item);
    } else {
      const indexOf = this.selectedMedicationOrder.findIndex(x => x.Meordid == item.Meordid);
      if (indexOf !== -1)
        this.selectedMedicationOrder.splice(indexOf, 1);
      // this.medicationImportDrugArray.splice(index, 1);
    }
  }

  medicationImport() {
    // this.medicationImportDrugArray =  this.drugArray ;
    // this.drugArray.forEach(element => {
    this.selectedMedicationOrder.forEach(element => {
      this.medicationImportDrugArray = this.medicationImportDrugArray.concat({
        "Dockey": "",
        "OrderType": element.MotypId == '30' ? 'Planned Administration' : 'Discharge',
        "Description": element.Descrlt + element.Quan + element.Quanunit + element.Routedescr + element.N1id,
        "HomeMedication": false,
        "PatientOwnMed": false,
        "Dose": element.Quan + element.Quanunit,
        "Validity": `${new DatePipe('en-US').transform(
          this.getDate(element.StartD),
          'dd.MM.yyyy'
        )}` + '-' + `${new DatePipe('en-US').transform(
          this.getDate(element.EndD),
          'dd.MM.yyyy'
        )}`,
        "Route": element.Routedescr,
        "Amount": "",
        "Rate": "",
        "Therapy": "00000",
        "Id": "",
        "OrderingPhysician": element.EmpRespNm,
        "Cycle": element.N1id
      });
    });
    this.modalRefUpdateName.hide();
  }




  collectAllMedicationIData(event: any) {
    if (event.target.checked) {
      this.selectedMedicationOrder = (Object.assign([], this.drugArray));
    } else {
      this.selectedMedicationOrder = [];
    }
  }

  scalesImport() {

    // this.scalesArray = [] ;
    // this.drugArray.forEach(element => {
    this.selectedScales.forEach(element => {
      console.log(element)
      this.scalesArray = this.scalesArray.concat({
        "Dockey": "",
        "ScaleType": element.Scaletype ,
        "ScoreDesc": element.ScoreDesc ,
        "Datetimee": element.DateTime,
        "LastScore": element.Score,
      });
    });
    this.modalRefScales.hide();
  }

  collectAllScalesData(event: any) {
    if (event.target.checked) {
      this.selectedScales = (Object.assign([], this.toScaleArr));
    } else {
      this.selectedScales = [];
    }
  }

  isCheckedScale(item: any): boolean {
    return this.selectedScales.some(x => x.Scaletype == item.Scaletype);
  }

  collectScalesIData(event, item) {
    if (event.target.checked) {
      this.selectedScales.push(item);
    } else {
      const indexOf = this.selectedScales.findIndex(x => x.Scaletype == item.Scaletype);
      if (indexOf !== -1)
        this.selectedScales.splice(indexOf, 1);
    }
  }

}
