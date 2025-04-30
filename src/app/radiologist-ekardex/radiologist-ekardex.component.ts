import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  ModalDismissReasons,
  NgbDateStruct,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { ISidebar, SidebarService } from '@services/sidebar.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Subscription, catchError, of, tap } from 'rxjs';
import { Patient } from '../services/e-kardex/interfaces/patient';
import { CatalogItem, VitalItem } from '../services/e-kardex/interfaces/vitals';
import { PanelService } from '../services/e-kardex/panel.service';
import { PatientService } from '../services/e-kardex/patient.service';
import { VitalsService } from '../services/e-kardex/vitals.service';
import { StorageService } from '../services/storage.service';
import { ErVitalsComponent } from './er-vitals/er-vitals.component';


@Component({
  selector: 'app-radiologist-ekardex',
  templateUrl: './radiologist-ekardex.component.html',
  styleUrls: ['./radiologist-ekardex.component.scss']
})
export class RadiologistEkardexComponent implements OnInit {
  @ViewChild('erVitalsModal') erVitalsModal: ErVitalsComponent;
  sidebarSubscription: Subscription;
  sidebar: ISidebar;
  patient: Patient = {} as Patient;
  catalog: CatalogItem[] = [] as CatalogItem[];
  listVitals: VitalItem[] = [] as VitalItem[];
  closeResult = '';
  isLoading = false;
  isError = false;
  model: NgbDateStruct;
  hasChanges = false;
  selectedERList: any;
  patientDetails: any;
  //@HostListener('window:resize', ['$event'])
  ngOnInit() {
    localStorage.removeItem("data");
    this.route.queryParams.subscribe(() => {
      this.isLoading = true;
      this.observeChangesPatient();
      this.getDataVitals();
      this.vitalsService.getListOfVitals();
      this.observeChangesInVitalList();
    })
  }

  observeChangesPatient() {
    this.patientService.patient$
      .pipe(
        tap(() => (this.isLoading = false)),
        untilDestroyed(this),
        catchError((err) => {
          this.isError = true;
          this.isLoading = false;
          return of({} as Patient);
        })
      )
      .subscribe((patientData: Patient) => {
        this.isLoading = false;
        this.patient = patientData;
      });
  }
  observeChangesInVitalList() {
    this.vitalsService.vitalList$
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((data: VitalItem[]) => {
        this.listVitals = data;
      });
  }

  getDataVitals() {
    this.vitalsService.getDataCatalog();
    this.vitalsService.catalogList$
      .pipe(
        tap(() => (this.isLoading = false)),
        untilDestroyed(this),
        catchError((err) => {
          return of({});
        })
      )
      .subscribe((data: CatalogItem[]) => {
        this.catalog = data;
      });
  }

  handleWindowResize(event: any): void {
    if (event && !event.isTrusted) {
      return;
    }
    const { containerClassnames } = this.sidebar;
    const nextClasses = this.getMenuClassesForResize(containerClassnames);
    this.sidebarService.setContainerClassnames(
      0,
      nextClasses.join(' '),
      this.sidebar.selectedMenuHasSubItems
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
  open(content) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  toggleSlide(isChecked: any, itemCatalog: CatalogItem) {
    this.hasChanges = true;
    const payload = {
      ...itemCatalog,
      [this.patient?.isInPatient ? 'IPCaseType' : 'OPCaseType']: !isChecked,
    };
    this.vitalsService.updateCatalog(itemCatalog, payload);
  }

  constructor(
    private route: ActivatedRoute,
    private sidebarService: SidebarService,
    private patientService: PatientService,
    private vitalsService: VitalsService,
    private panelService: PanelService,
    private emergencyService: EmergencyService,
    private modalService: NgbModal,
    private storageService: StorageService,
    private modalServiceForAllergy: BsModalService,
    private formBuilder: FormBuilder
  ) {
    this.sidebarSubscription = this.sidebarService.sidebar.subscribe(
      (res) => (this.sidebar = res)
    );
    this.route.queryParams.subscribe((params) => {
      this.storageService.setEinri(params['einri']);
      this.storageService.setFalnr(params['falnr']);
      this.storageService.setLfdnr(params['lfdnr']);
      this.storageService.setPatnr(params['patnr']);
    });
  }

  // collectPatientData(data){
  //  this.patientDetails = data;
  //  this.selectedERList = {
  //   Patnr:this.storageService.patnr,
  //   Patient:data.name,
  // };
  // }
  // vitals
  openModalVital(event) {
    const item = {
      Einri: this.storageService.einri,
      Patnr: this.storageService.patnr,
      Falnr: this.storageService.falnr,
      Lfdnr: this.storageService.lfdnr,
      Patient: this.storageService?.patientData?.name,
      admissionDate: this.storageService.patientData.periodStart,
    }
    this.erVitalsModal.openModalForErVital(item);
  }

  // ngOnDestroy(): void {
  //   localStorage.removeItem("patientList");
  // }
}
