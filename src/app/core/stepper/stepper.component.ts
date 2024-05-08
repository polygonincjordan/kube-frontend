import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { StepperType } from './types';
import { StorageService } from '@services/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientService } from '@services/e-kardex/patient.service';
import { Patient } from '@services/e-kardex/interfaces/patient';
import { catchError, of, tap } from 'rxjs';
import { untilDestroyed } from '@ngneat/until-destroy';
import { Subscription } from 'rxjs';
import { DataService } from '@services/data.service';
import { DatePipe } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { HelperService } from '@services/helper.service';
import { UserConfigurationService } from '@services/e-kardex/user-configuration.service';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
})
export class StepperComponent implements OnDestroy {
  @Output() redirectTreatmentPatientData = new EventEmitter<any>();
  @Input() listItem: Array<StepperType> = [];
  getUser: Array<any> = [];
  storedData: any;
  selectedData:any;
  selectedback:any;
  isLoading = false;
  patient: Patient = {} as Patient;
  isError = false;
  sortedList: any[];
  patientDataSubscription: Subscription;
  isRefreshed: boolean = true;
  private userData: any = {};
  constructor(private storageService: StorageService,private patientService: PatientService, private route: ActivatedRoute, private router: Router, private patientservices: PatientService, private dataService: DataService, private datePipe: DatePipe,
    private domSanitizer: DomSanitizer,
    private uiHelper: HelperService) {
    this.route.queryParams.subscribe((resp) => {      
      if (this.isRefreshed ) {
        localStorage.patientList = JSON.stringify(resp);
      }
      // if (this.isRefreshed && localStorage && !localStorage.patientList) {
      //   localStorage.patientList = JSON.stringify(resp);
      // }
    });

  }
  ngOnInit() {
    this.sortList();
    this.isRefreshed = false;
    localStorage.removeItem("data");
    // const patientListdata = JSON.parse(localStorage.getItem('patientList'));
    // if (!patientListdata && patientListdata.length) {
    //   localStorage.setItem('patientList', JSON.stringify({ einri: this.storageService.einri, falnr: this.storageService.falnr, patnr: this.storageService.patnr }));
    // }
  }

  sortList(): void {
    this.listItem.sort((a: any, b: any) => {
      const startDateA = this.parseDateString(a.StartDate);
      const startDateB = this.parseDateString(b.StartDate);
      return startDateA.getTime() - startDateB.getTime();
    });
    this.listItem = [...this.listItem];
  }

  private parseDateString(dateString: string): Date {
    const [day, month, year] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  scrollLeft() {
    let myElement = document.getElementById('target');
    myElement.scrollBy(-200, 0);
  }

  scrollRight() {
    let myElement = document.getElementById('target');
    myElement.scrollBy(200, 0);
  }

  showItem(item) {
    if (item.MovementType === 'OS' || item.MovementType === 'MI') {
      return false;
    } else {
      return true;
    }
  }

  showStepperLineLeftHighlightDiv(item) {
    if (
      (item.MovementType != 'OS' || item.MovementType != 'MI') &&
      (item.CaseType === '1' || item.CaseType === '3') &&
      (item.MovementType === 'RD' ||
        item.MovementType === 'LW' ||
        item.MovementType === 'EX' ||
        item.MovementType === 'DE' ||
        item.MovementType === 'AM')
    ) {
      return true;
    } else {
      return false;
    }
  }

  showStepperLineRightHighlightDiv(item) {
    if (
      (item.MovementType != 'OS' || item.MovementType != 'MI') &&
      (item.CaseType === '1' || item.CaseType === '3') &&
      (item.MovementType === 'ER' ||
        item.MovementType === 'EL' ||
        item.MovementType === 'NB' ||
        item.MovementType === 'DV' ||
        item.MovementType === 'CS')
    ) {
      return true;
    } else {
      return false;
    }
  }

  Refreshdata(listItem) {
    localStorage.setItem('data', JSON.stringify(true));
    this.patientService.patientapi.next(listItem.Einri+listItem.Case.toString().padStart(10, '0')+this.storageService.lfdnr)
    this.selectedback = 'goback';
    this.selectedData = listItem;
    this.storageService.falnr = listItem.Case
    this.storageService.einri = listItem.Einri
    this.storageService.patnr = listItem.Patient
    const currentParams = this.route.snapshot.queryParams;
  this.router.navigate([], {
    relativeTo: this.route,
    queryParams: { ...currentParams, einri: listItem['Einri'], falnr: listItem['Case'].toString().padStart(10, '0') , patnr: listItem['Patient'].toString().padStart(10, '0')},
    queryParamsHandling: 'merge',
  });
  }

  goback(goback) {
    localStorage.setItem('data', JSON.stringify(false));
    this.selectedData = '';
    this.selectedback = '';
      const data = JSON.parse(localStorage.getItem('patientList'));
      if (data) {
        this.storageService.falnr = data.falnr;
        this.storageService.einri = data.einri;
        this.storageService.patnr = data.patnr;
        this.patientService.patientapi.next(data.einri+data.falnr+this.storageService.lfdnr)
        const currentParams = this.route.snapshot.queryParams;
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { ...currentParams, einri: data['einri'], falnr: data['falnr'].toString().padStart(10, '0'), patnr: data['patnr'].toString().padStart(10, '0') },
          queryParamsHandling: 'merge',
        });
      }

  }

  getImageLogic(item) {
    return (
      (item.CaseType === '2' && 'assets/img/stepperIcon_op.jpg') ||
      ((item.CaseType === '1' || item.CaseType === '3') &&
        (item.MovementType === 'RD' ||
          item.MovementType === 'LW' ||
          item.MovementType === 'EX' ||
          item.MovementType === 'DE' ||
          item.MovementType === 'AM') &&
        'assets/img/stepperIcon_ipd.jpg') ||
      ((item.CaseType === '1' || item.CaseType === '3') && 'assets/img/stepperIcon_ip.jpg')
    );
  }

  public getImageBorderLogic(item) {
    return (
      ((item.MovementType === 'OS' || item.MovementType === 'MI') && {
        'border-color': '#F9777D', //Surgery
      }) ||
      ((item.CaseType === '2') && {
        'border-color': '#7b9fdf', //OutPateint
      }) ||
      ((item.CaseType === '1' || item.CaseType === '3') &&
        (item.MovementType === 'RD' ||
          item.MovementType === 'LW' ||
          item.MovementType === 'EX' ||
          item.MovementType === 'DE' ||
          item.MovementType === 'AM') && {
        'border-color': '#39D7AA', //Discharge
      }) ||
      ((item.CaseType === '1' || item.CaseType === '3') &&
        (item.MovementType === 'ER' ||
          item.MovementType === 'EL' ||
          item.MovementType === 'NB' ||
          item.MovementType === 'DV' ||
          item.MovementType === 'CS') && {
        'border-color': '#49C5F3', //Admission
      })
    );
  }

  public getImageBorderTriangleLogic(item) {
    return (
      (item.CaseType === '2' && {
        'border-top-color': '#7b9fdf',
      }) ||
      ((item.CaseType === '1' || item.CaseType === '3') &&
        (item.MovementType === 'RD' ||
          item.MovementType === 'LW' ||
          item.MovementType === 'EX' ||
          item.MovementType === 'DE' ||
          item.MovementType === 'AM') && {
        'border-top-color': '#39D7AA',
      }) ||
      ((item.CaseType === '1' || item.CaseType === '3') && {
        'border-top-color': '#49C5F3',
      })
    );
  }

  public getCircleBGLogic(item) {
    return (
      ((item.MovementType === 'OS' || item.MovementType === 'MI') && {
        'background-color': '#F9777D',
      }) ||
      (item.CaseType === '2' && {
        'background-color': '#7b9fdf',
      }) ||
      ((item.CaseType === '1' || item.CaseType === '3') &&
        (item.MovementType === 'RD' ||
          item.MovementType === 'LW' ||
          item.MovementType === 'EX' ||
          item.MovementType === 'DE' ||
          item.MovementType === 'AM') && {
        'background-color': '#39D7AA',
      }) ||
      ((item.CaseType === '1' || item.CaseType === '3') && {
        'background-color': '#49C5F3',
      })
    );
  }

  ngOnDestroy(): void {
    this.getUser = [];
    localStorage.removeItem("data");
    localStorage.removeItem("patientList");
  }
}
function loadPatientData() {
  throw new Error('Function not implemented.');
}

