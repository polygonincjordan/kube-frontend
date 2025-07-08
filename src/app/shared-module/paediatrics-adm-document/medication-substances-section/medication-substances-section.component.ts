import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, OnChanges, SimpleChange } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { DatePipe } from '@angular/common';
import { StorageService } from '@services/storage.service';

@Component({
  selector: 'app-medication-substances-section',
  templateUrl: './medication-substances-section.component.html',
  styleUrls: ['./medication-substances-section.component.scss'],
})
export class MedicationSubstancesSectionComponent implements OnInit, OnChanges {
  noMedication: boolean = false;
  medicationList: any[] = [];
  drugArray: any[] = [];
  selectedMedicationOrder: any[] = [];
  medicationImportDrugArray: any[] = [];
  modalRefUpdateName: BsModalRef;
  @Input() nursingAdmissionForm: FormGroup;
  @Input() toADMMEDImportedData: any[] = [];

  @Output() medicationImportDrugArrayList: EventEmitter<any> = new EventEmitter();
  constructor(public modalService: BsModalService, public storageService: StorageService, private datePipe: DatePipe, public ePrescriptionService: EPrescriptionService,) { }

  ngOnInit(): void {
    if (this.toADMMEDImportedData && this.toADMMEDImportedData?.length) {
      this.medicationImportDrugArray = this.toADMMEDImportedData;
    }
  }

  ngOnChanges() {
    if(this.toADMMEDImportedData || this.toADMMEDImportedData?.length) {
      this.medicationImportDrugArray = this.toADMMEDImportedData.map(item => ({
        EventDesc: item.EventDesc,
        Dose: item.Dose,
        Dockey: item.Dockey
      }));
    }
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

  collectAllMedicationIData(event: any) {
    if (event.target.checked) {
      this.selectedMedicationOrder = (Object.assign([], this.drugArray));
    } else {
      this.selectedMedicationOrder = [];
    }
  }
  isChecked(item: any): boolean {
    return this.selectedMedicationOrder.some(x => x.Meordid == item.Meordid);
  }
  medicationImport() {
    // this.medicationImportDrugArray =  this.drugArray ;
    // this.drugArray.forEach(element => {
    this.selectedMedicationOrder.forEach(element => {
      this.medicationImportDrugArray = this.medicationImportDrugArray.concat({
        "Dockey": "",
        "OrderType": element.MotypId == '30' ? 'Planned Administration' : 'Discharge',
        "EventDesc": element.Descrlt + element.Quan + element.Quanunit + element.Routedescr + element.N1id,
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
    this.medicationImportDrugArrayList.emit(this.medicationImportDrugArray)
    this.modalRefUpdateName.hide();
  }


  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
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

}
