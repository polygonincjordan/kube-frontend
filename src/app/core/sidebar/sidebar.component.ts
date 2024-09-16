import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PatientService } from '@services/e-kardex/patient.service';
import { SidebarService } from '@services/sidebar.service';
import { StorageService } from '@services/storage.service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';
import { UserType } from '@services/interfaces/common.enum';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  sidebarSubscription: Subscription;
  currentUrl: string;
  urlParts: string[];
  closedCollapseList = [];
  isUniversal = false;
  ePrescriptionActive: boolean = true;
  PATNR = this.storageService.patnr;
  FALNR = this.storageService.falnr;
  EINRI = this.storageService.einri;
  LFDBW = this.storageService.lfdnr;

  @HostListener('window:resize', ['$event'])
  handleWindowResize(event: any): void {
    if (event && !event.isTrusted) {
      return;
    }
    const { containerClassnames } = this.sidebarService.sidebarObject;
    const nextClasses = this.getMenuClassesForResize(containerClassnames);
    this.sidebarService.setContainerClassnames(
      0,
      nextClasses.join(' '),
      this.sidebarService.sidebarObject.selectedMenuHasSubItems
    );
  }

  getMenuClassesForResize(classes: string): string[] {
    let nextClasses = classes.split(' ').filter((x: string) => x !== '');
    const windowWidth = window.innerWidth;

    if (windowWidth < this.sidebarService.menuHiddenBreakpoint) {
      nextClasses.push('menu-mobile');
    } else {
      nextClasses = nextClasses.filter((x: string) => x !== 'menu-mobile');
      if (nextClasses.includes('menu-default')) {
        nextClasses = nextClasses.filter(
          (x: string) => x !== 'menu-sub-hidden'
        );
      }
    }
    return nextClasses;
  }
  constructor(
    private router: Router,
    private sidebarService: SidebarService,
    private storageService: StorageService,
    public PatientService: PatientService
  ) {
    this.sidebarSubscription = this.sidebarService.sidebar.subscribe(
      (res) => (this.sidebarService.sidebarObject = res)
    );
    this.currentUrl = this.router.url.split('?')[0];
  }
  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.ePrescriptionActive = this.PatientService.HeaderConfigurationData?.episodeOfCare.caseTypeTxt === "Inpatient Case";
    }, 3000);
  }

  openModuleLabChart() {

    window.open(
      environment.labChartUrl + 'patnr=' +
      this.PATNR +
      '&falnr=' +
      this.FALNR +
      '&einri=' +
      this.EINRI +
      '&lfdnr=' +
      this.LFDBW +
      '&appl=LABCHART',
      '_blank'
    );
  }


  openModuleRad() {
    window.open(
      environment.radiologyUrl + 'patient_id=' + this.PATNR,
      '_blank'
    );
  }
  openEPrescription() {
    const userType = this.storageService.getKubeRule()
    let redirectPoint = "";
    if ([UserType.SeniorPhysician].includes(userType)) {
      redirectPoint = 'e-prescription?';
    }
    // else if (userType === UserType.opnurse) {
    //   redirectPoint = 'out-patient-nursing?';
    // } else if (userType === UserType.ERNurse) {
    //   redirectPoint = 'nursing-emergncy-dashboard?';
    // }

    const queryParams = `patnr=${this.PATNR}&falnr=${this.FALNR}&einri=${this.EINRI}&lfdnr=${this.LFDBW}&nav=Treatmentarea`;
    const url = redirectPoint + queryParams;

    window.open(url, '_blank');
  }
}
