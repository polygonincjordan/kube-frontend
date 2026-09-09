import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { ChemoDischargeComponent } from '../chemo-discharge/chemo-discharge.component';
import { CreateAdministrationComponent } from 'src/app/e-prescription/administration/create-administration/create-administration.component';
import { ChemotherapyService } from '@services/chemotherapy.service';
import { PremedicationsComponent } from '../premedications/premedications.component';
import { ChemotherapeuticBiologicComponent } from '../chemotherapeutic-biologic/chemotherapeutic-biologic.component';
import { ChemotherapyComponent } from '../chemotherapy.component';

@Component({
  selector: 'chemo-panel',
  templateUrl: './chemo-panel.component.html',
  styleUrls: ['./chemo-panel.component.scss']
})
export class ChemoPanelComponent implements OnInit {
  constructor(public eprescriptionService: EPrescriptionService,public chemotherapyService:ChemotherapyService) {}
  // @ViewChild(ChemoDischargeComponent) createDischarge: ChemoDischargeComponent;
  // @ViewChild(PremedicationsComponent) createMedications: PremedicationsComponent;
  // @ViewChild(ChemotherapeuticBiologicComponent) ChemotherapeuticBiologic: ChemotherapeuticBiologicComponent;
  // @ViewChild(ChemotherapyComponent) Chemotherapy : ChemotherapyComponent;
  // @Output() createEvent = new EventEmitter<any>();
  // @Output() chemoevent = new EventEmitter<any>();
  // @Output() prechemohy = new EventEmitter<any>();
  // @Output() chemopeutic = new EventEmitter<any>();
  // @Output() hydrationCreate = new EventEmitter<any>();
  // CreateSubmitmedications(event){
  //   event.contnload = true;
  //   this.chemoevent.emit(event);
  // }

  // prechemohydration(event){
  //   this.prechemohy.emit(event);
  // }

  // chemotherapypeutic(event){
  //   this.chemopeutic.emit(event);
  // }

  // dichargeChemo(event){
  // this.dichargeCreate.emit(event);
  // }

  // chemohydrationData(event){
  //   this.hydrationCreate.emit(event);
  // }
  @Output() dichargeCreate = new EventEmitter<any>();
  @Output() Createpanel = new EventEmitter<any>();
  @Input() isExpanded: any;
  @Input() startdata:any;
  ngOnInit(): void {
  }

  premedications(event){
    event['type'] = 'premedications'
    this.Createpanel.emit(event);
  }

  prechemohydration(event){
    event['type'] = 'prechemohydration'
    this.Createpanel.emit(event);
  }

  chemotherapypeutic(event){
    event['type'] = 'chemotherapypeutic'
    this.Createpanel.emit(event);
  }

  dichargeChemo(event){
    event['type'] = 'dichargeChemo'
   this.Createpanel.emit(event);
  }

  chemohydrationData(event){
    event['type'] = 'chemohydrationData'
    this.Createpanel.emit(event);
  }
}
