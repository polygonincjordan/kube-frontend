import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { SidebarService } from '@services/sidebar.service';
import { CreateDischargeOrderComponent } from './discharge-order/create-discharge-order/create-discharge-order.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-e-prescription',
  templateUrl: './e-prescription.component.html',
  styleUrls: ['./e-prescription.component.scss']
})
export class EprescriptionComponent {
  @ViewChild(CreateDischargeOrderComponent) createDischarge: CreateDischargeOrderComponent;
  showPatients = false;
  @Output() redirectTreatmentPatientData = new EventEmitter<any>();
  treatmentPatientData: any;
  subscription: Subscription;
  constructor(public sidebarService: SidebarService, public eprescriptionService: EPrescriptionService, private route: ActivatedRoute, public emergencyService: EmergencyService) {

    const data: any = this.route.snapshot.queryParams?.isEmr === 'true' ? true : false;
    this.eprescriptionService.parameters = {
      einri: this.route.snapshot.queryParamMap.get('einri'),
      falnr: this.route.snapshot.queryParamMap.get('falnr'),
      lfdnr: this.route.snapshot.queryParamMap.get('lfdnr'),
      patnr: this.route.snapshot.queryParamMap.get('patnr')
    }
    this.eprescriptionService.tabPanelNavigation('Administration')
    this.subscription = this.route.queryParams.subscribe(() => {
      if (!!data) {
        this.eprescriptionService.eEmar = data;
        this.eprescriptionService.OrderDetails = !data
      }
      if (this.eprescriptionService.Administration) {
        this.eprescriptionService.loadAddministrationPanel();
      } else if (this.eprescriptionService.DischargeOrder) {
        this.eprescriptionService.loadDischargePanelData();
      } else if (this.eprescriptionService.eEmar) {
        this.eprescriptionService.loadEmarPanelData();
      }
    })

  }
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  ngOnInit() {
    this.getPatientData();
  }
  showhidePatients() {
    this.showPatients = !this.showPatients;
  }
  refreshPatientData(data) {
    this.eprescriptionService.parameters = {
      einri: data.Einri,
      falnr: data.Falnr,
      lfdnr: data.Lfdbw,
      patnr: data.Patnr
    }
    this.eprescriptionService.tabPanelNavigation('Administration')
    this.redirectTreatmentPatientData.emit(data);
  }
  getPatientData() {
    this.emergencyService.getPatientData().subscribe(
      (_success: any) => {
        if (_success) {
          // _success = JSON.parse(_success._body);
          this.treatmentPatientData = _success.d.results;
        }
      },
      (_error: any) => { }
    );
  }
  createEventFn() {
    this.createDischarge.onSubmitData();
  }

  onTemplatedata() {
    this.createDischarge.onTemplate();
  }
}
