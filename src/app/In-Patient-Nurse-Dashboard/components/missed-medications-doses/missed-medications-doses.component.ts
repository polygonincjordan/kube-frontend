import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { HospitalistType } from '@services/e-hospitalist/interfaces/hospitalist';
import { MissedMedicationDosesService } from '@services/e-hospitalist/missed-medication-doses.service';
import { MissedMedicationEventsComponent } from '../missed-medication-events/missed-medication-events.component';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { HospitalistService } from '@services/e-hospitalist/hospitalist.service';

@Component({
  selector: 'missed-medications-doses',
  templateUrl: './missed-medications-doses.component.html',
  styleUrls: ['./missed-medications-doses.component.scss']
})
export class MissedMedicationsDosesComponent implements OnInit{
  public isEvent: boolean = false;
  modalRef: BsModalRef;
  public isOpen : boolean = false;
  @Input() listItem: Array<HospitalistType> = [];
  @Input() searchString: string;
  @Input() showColumnsListView: any;
  @Input() listType: string;

  @Output() openModuleKardex = new EventEmitter();
  @Output() openModuleAdmissionProcessEvent = new EventEmitter();
  @Output() openModuleDischargeProcessEvent = new EventEmitter();
  @Output() reloadTableData = new EventEmitter();

  phyOrderData: any;

  constructor(public missedMedicationService: MissedMedicationDosesService, private _hospitallistService: HospitalistService,
    private modalService: BsModalService,) { }

  redirectToeKardex(data) {
    this.openModuleKardex.emit(data);
  }

  openModuleAdmissionProcess(data) {
    this.openModuleAdmissionProcessEvent.emit(data);
    localStorage.removeItem('tabName');
  }

  openModuleDischargeProcess(data) {
    this.openModuleDischargeProcessEvent.emit(data);
    localStorage.removeItem('tabName');
  }

  ngOnInit(): void {
    this.filterData()
  }

  filterData(){
    // this.listItem.filter((data) => data.Us)
  }

  public openModalForPhyOrder(template: TemplateRef<any>, data: any) {
    const config: ModalOptions = {
      class: 'modal-dialog-centered execute-delete-modal',
    };
    this.modalRef = this.modalService.show(template, config);

    this.phyOrderData = data;
  }

  removePhysicianOrder(phyOrderDetails: any) {
    let jsonObj: any = {
      PorderId: phyOrderDetails.PorderId
    };
    this._hospitallistService.getCheckPDF(jsonObj).subscribe(
      (_success: any) => {
        if (_success) {
          this.reloadTableData.next('physicianOrder');
        }
      },
      (_error: any) => {}
    );  
}
}
