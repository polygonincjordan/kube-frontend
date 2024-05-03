import { ChangeDetectorRef, Component, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChemotherapyService } from '@services/chemotherapy.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { SidebarService } from '@services/sidebar.service';

@Component({
  selector: 'app-e-prescription',
  templateUrl: './e-prescription.component.html',
  styleUrls: ['./e-prescription.component.scss']
})
export class EprescriptionComponent {
  ChemoValue: boolean;
  ngOnInit(): void {
  }
  constructor(public sidebarService: SidebarService, public eprescriptionService: EPrescriptionService, private route: ActivatedRoute,public chemotherapyService: ChemotherapyService, private cdr: ChangeDetectorRef){
    const data: any = this.route.snapshot.queryParams?.isEmr === 'true' ? true : false;
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
  }

  chemotherapyevnt(event){
    this.ChemoValue = event.isTrue;
    this.cdr.detectChanges();
  }
}
