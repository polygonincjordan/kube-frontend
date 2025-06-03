import { DatePipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DataService } from '@services/data.service';
import { Patient } from '@services/e-kardex/interfaces/patient';
import { PatientService } from '@services/e-kardex/patient.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { HelperService } from '@services/helper.service';
// import { AuthService } from '@services/auth.service';
// import { PopupService } from '@services/popup.service';
import { ISidebar, SidebarService } from '@services/sidebar.service';
import { StorageService } from '@services/storage.service';
// import { TranslationsService } from '@services/translations.service';
import { getThemeColor, setThemeColor } from '@services/utiltiy.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { catchError, filter, map, of, Subscription, tap } from 'rxjs';
import { AdminAttechmentComponent } from 'src/app/shared-module/admin-attechment/admin-attechment.component';
import { environment } from 'src/environments/environment';
@UntilDestroy()
@Component({
  selector: 'app-topnav',
  templateUrl: './topnav.component.html',
  styleUrls: ['./topnav.component.scss'],
})
export class TopnavComponent implements OnInit, AfterViewInit, OnDestroy {
  // @ViewChild('formPopup', { static: true }) formPopup: DyFormPopupComponent;
  //resourceRequest: ResourceRequest = Resources.ChangePassword;
  @ViewChild('nurErAttechment') nurErAttechment: AdminAttechmentComponent;
  
  @Output() PatientData = new EventEmitter<any>();
  sidebarSubscription: Subscription;
  sidebar: ISidebar;
  isFullScreen = false;
  isDarkModeActive = false;
  searchKey = '';
  username = localStorage.UserName;
  isLoading = false;
  isError = false;
  patient: Patient = {} as Patient;

  patientDataSubscription: Subscription;
  private patientSubscription: Subscription;
  private userData: any = {};
  allergyList: any;
  allergenValues: any;
  allergenGroupValues: any;
  allergyCertaintyValues: any;
  allergyEvaluationValues: any;
  allergyReactionValues: any;
  severityValues: any;
  modalRef:BsModalRef;
  constructor(
    private spinner: NgxSpinnerService,
    private dataService: DataService,
    private domSanitizer: DomSanitizer,
    private uiHelper: HelperService,
    private datePipe: DatePipe,
    // public authService: AuthService,
    // public popupService: PopupService,
    private route: ActivatedRoute,
    private sidebarService: SidebarService,
    private patientService: PatientService,
    private emergencyService: EmergencyService,
    private storageService: StorageService,
    private titleService: Title,
    private router: Router,
    private modalService: BsModalService,
    private formBuilder: FormBuilder

  ) // public translationsService: TranslationsService,
  {
    this.isDarkModeActive = getThemeColor().indexOf('dark') > -1 ? true : false;
    this.route.queryParams.subscribe((params) => {
      this.storageService.setEinri(params['einri']);
      this.storageService.setFalnr(params['falnr']);
      this.storageService.setLfdnr(params['lfdnr']);
      this.storageService.setPatnr(params['patnr']);
    });
  }
  onDarkModeChange(event: any): void {
    let color = getThemeColor();
    if (color.indexOf('dark') > -1) {
      color = color.replace('dark', 'light');
    } else if (color.indexOf('light') > -1) {
      color = color.replace('light', 'dark');
    }
    setThemeColor(color);
    setTimeout(() => window.location.reload(), 200);
  }

  fullScreenClick(): void {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }

  ngOnInit() {
    this.sidebarSubscription = this.sidebarService.sidebar.subscribe(
      (res) => (this.sidebar = res)
    );
    this.getDataPatient(this.storageService.getEncounterId());
    this.loadPatientData();

    this.patientSubscription = this.patientService.patientapi.subscribe((res) =>{
      this.getDataPatient(res);
      this.loadPatientData();
    });
    this.menuButtonClick(
      { stopPropagation: () => {} }, // Dummy event object
      0,
      'menu-default sub-hidden main-hidden'
    );
  }

  ngAfterViewInit(): void {
    //this.popupService.formPopup = this.formPopup;
  }
  getDataPatient(encounterId) {    
    //const appTitle = this.titleService.getTitle();
    this.patientService
      .getDataPatient(encounterId)
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
        console.log(this.patient, "this.patient");
        
        this.titleService.setTitle(`${patientData?.name} | ${this.route.snapshot.parent.routeConfig.path}`);
        this.PatientData.emit(patientData);
        this.storageService.setPatientData(patientData);
      });
  if(this.patient){
    // this.titleService.setTitle(this.patient.name+ "Product Page - This is the product page");
  }

  }

  menuButtonClick(
    e: { stopPropagation: () => void },
    menuClickCount: number,
    containerClassnames: string
  ): any {
    if (e) {
      e.stopPropagation();
    }

    setTimeout(() => {
      const event = document.createEvent('HTMLEvents');
      event.initEvent('resize', false, false);
      window.dispatchEvent(event);
    }, 350);

    this.sidebarService.setContainerClassnames(
      ++menuClickCount,
      containerClassnames,
      this.sidebar.selectedMenuHasSubItems
    );
  }

  mobileMenuButtonClick(
    event: { stopPropagation: () => void },
    containerClassnames: string
  ): void {
    if (event) {
      event.stopPropagation();
    }
    this.sidebarService.clickOnMobileMenu(containerClassnames);
  }

  searchKeyUp(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.search();
    } else if (event.key === 'Escape') {
      const input = document.querySelector('.mobile-view');
      if (input && input.classList) {
        input.classList.remove('mobile-view');
      }
      this.searchKey = '';
    }
  }

  searchAreaClick(event): void {
    event.stopPropagation();
  }

  searchClick(event): void {
    if (window.innerWidth < environment.menuHiddenBreakpoint) {
      let elem = event.target;
      if (!event.target.classList.contains('search')) {
        if (event.target.parentElement.classList.contains('search')) {
          elem = event.target.parentElement;
        } else if (
          event.target.parentElement.parentElement.classList.contains('search')
        ) {
          elem = event.target.parentElement.parentElement;
        }
      }

      if (elem.classList.contains('mobile-view')) {
        this.search();
        elem.classList.remove('mobile-view');
      } else {
        elem.classList.add('mobile-view');
      }
    } else {
      this.search();
    }
    event.stopPropagation();
  }

  search(): void {
    if (this.searchKey && this.searchKey.length > 1) {
      // this.router.navigate([this.adminRoot + '/pages/miscellaneous/search'], {
      //   queryParams: { key: this.searchKey.toLowerCase().trim() },
      // });
      // this.searchKey = '';
    }
  }

  reloadPanel(): void {
    // this.authService.reloadUser();
    // this.translationsService.reloadTranslation();
  }

  @HostListener('document:fullscreenchange', ['$event'])
  handleFullscreen(event): void {
    if (document.fullscreenElement) {
      this.isFullScreen = true;
    } else {
      this.isFullScreen = false;
    }
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event): void {
    const input = document.querySelector('.mobile-view');
    if (input && input.classList) {
      input.classList.remove('mobile-view');
    }
    this.searchKey = '';
  }

  loadPatientData() {
    let falnr = this.storageService.falnr;
    let caseArray = [falnr];
    this.spinner.show();
    let expandEntities = ['CASTOPATSET/NAVTOALLERGY', 'CASTOPATSET/PATTORISKFACTORSET', 'CASTODIASET', 'CASTOPHYSSET', 'CASTOPATSET/PATTOIMAGE', 'CASTOMOVEMENTSET',
    ];
    this.patientDataSubscription = this.dataService.loadData('CASESET', caseArray, 'falnr', false, expandEntities, true, true, true, false, true).subscribe(
      (resp: any) => {
        let success = resp;
        if (resp._body) {
          success = JSON.parse(resp._body);
        }
        let data = success.d.results[0].CASTOPATSET;
        let dob = data.gbdat.replace(/[^0-9]/g, '');
        this.userData.patientName = data.patnamefull;
        this.userData.age = data.age;
        this.userData.sex = data.sex;
        this.userData.email = data.email;
        this.userData.dob = dob
          ? this.datePipe.transform(dob, 'dd.MM.yyyy')
          : '';
        this.userData.patnr = data.patnr;
        this.userData.case = success.d.results[0].falnr;
        this.userData.deparment = success.d.results[0].deptorgna;
        this.userData.attendingPhysician =
          success.d.results[0].CASTOPHYSSET.results.length > 0
            ? success.d.results[0].CASTOPHYSSET.results[0].physname
            : '';
        let allergies: any = [];
        data.NAVTOALLERGY.results.forEach((obj: any) => {
          allergies.push('\n' + obj.descr);
        });

        this.userData.image =
          data.PATTOIMAGE.image_binary !== null &&
            data.PATTOIMAGE.image_binary !== ''
            ? this.domSanitizer.bypassSecurityTrustResourceUrl(
              'data:image/jpg;base64,' + data.PATTOIMAGE.image_binary
            )
            : this.uiHelper.getBase64String(this.userData.sex);
        this.userData.imageExist =
          data.PATTOIMAGE.image_binary !== null &&
          data.PATTOIMAGE.image_binary !== '';
        this.userData.allergies =
          allergies.length > 0 ? allergies.toString() : 'N/A';
        this.userData.payerType = success.d.results[0].FinCat;
        const movmntSeqData =
          success.d.results[0].CASTOMOVEMENTSET?.results.filter(
            (obj: any) =>
              obj['movmntSeq'] === this.storageService.lfdnr
          );
        const intDeptData =
          movmntSeqData && movmntSeqData.length
            ? movmntSeqData[0]['departmentOrg']
            : null;
        this.storageService.setLocal('intDept', intDeptData);

        const intOrgData =
          movmntSeqData && movmntSeqData.length
            ? movmntSeqData[0]['nursingOrg']
            : null;
        this.storageService.setLocal('initOrg', intOrgData);
        localStorage.setItem('initOrg', intOrgData);
      },
      (_error: any) => {
        this.spinner.hide();
      }
    );
  }

  ngOnDestroy(): void {
    if (this.sidebarSubscription) {
      this.sidebarSubscription.unsubscribe();
    }
    if (this.patientDataSubscription) {
      this.patientDataSubscription.unsubscribe();
    }
    if (this.patientSubscription) {
      this.patientSubscription.unsubscribe();
    }
  }

  getHeaderPatientDetail(patient) {
    if (patient) {
      localStorage.setItem('myPatient', JSON.stringify(patient));
      return (patient.deptOrgUnitTxt !=undefined ? patient.deptOrgUnitTxt : '') + ' ' + (patient.location !=undefined ? patient.location?.room : '') + (patient.location !=undefined ? patient.location?.bed ? `,${patient.location?.bed}` : "" : '');

    }
    else {
      return "";
    }
  }
  openPatientInfo( template: TemplateRef<any>,){
    const config: ModalOptions = { class: 'modal-dialog-centered patient-info-modal-size' };
    this.modalRef = this.modalService.show(template,config);
  }

  caseNumberReturn(caseNumber: any) {
    return parseInt(caseNumber, 10).toString()
  }

  openModalForAttechment(data) {
    let checkindata: any = JSON.parse(localStorage.getItem('checkindata'));
    data.Falnr = data.case;
    data.Pnamec = data.name;
    data.Patnr = data.id;
    data.Bwidt = data.periodStart
    this.nurErAttechment.openModalForAttechment(data);
  }
}
