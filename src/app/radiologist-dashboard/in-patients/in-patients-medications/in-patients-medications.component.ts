import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HospitalistType } from '@services/e-hospitalist/interfaces/hospitalist';
import { MissedMedicationDosesService } from '@services/e-hospitalist/missed-medication-doses.service';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'in-patients-medications',
  templateUrl: './in-patients-medications.component.html',
  styleUrls: ['./in-patients-medications.component.scss']
})
export class InPatientsMedicationsComponent implements OnInit {

  public isEvent: boolean = false;
  private modalRef: BsModalRef;
  public isOpen : boolean = false;
  @Input() listItem: Array<HospitalistType> = [];
  @Input() searchString: string;
  @Input() showColumnsListView: any;
  @Input() listType: string;

  @Output() openModuleKardex = new EventEmitter();
  @Output() openModuleAdmissionProcessEvent = new EventEmitter();
  @Output() openModuleDischargeProcessEvent = new EventEmitter();

  constructor(public missedMedicationService: MissedMedicationDosesService) { }

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


}
