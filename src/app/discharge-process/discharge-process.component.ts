import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { AdmissionService } from '@services/admission/admission.service';
import { HospitalistService } from '@services/e-hospitalist/hospitalist.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { SidebarService } from '@services/sidebar.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { catchError, of } from 'rxjs';
import { EEmrService } from '@services/e-emr.service';
import { ActivatedRoute } from '@angular/router';
import { ProgressNotesListModel } from '@services/admission/interfaces/template-model';
import { CreateDischargeOrderComponent } from './discharge-order/create-discharge-order/create-discharge-order.component';
import Swal from 'sweetalert2';

@UntilDestroy()
@Component({
  selector: 'app-discharge-process',
  templateUrl: './discharge-process.component.html',
  styleUrls: ['./discharge-process.component.scss']
})
export class DischargeProcessComponent implements OnInit {
  @ViewChild(CreateDischargeOrderComponent) createDischarge: CreateDischargeOrderComponent;
  navTabBoxActiveValue: string = '02';
  graphChartCountType: string = '1';
  reloadPhyOrderList: boolean = false;
  inHospitalistList: any[] = [];
  occupationalGroupData: any;
  institutionid: any;
  caseid: any;
  physicianOrderList: any[];
  searchString: string;
  admittedFrom: string;
  admittedTo: string;
  paramsFilter: any = {};
  paramsObj: any = {};
  ProgressNotesList: ProgressNotesListModel[];
  ProgressNotesListFilterValue: ProgressNotesListModel[];
  physicianOrderListFilterValue: any[];
  isExpanded: boolean = false;
  filterDateValue: any;
  soapFormEvent: any;
  isDocumentTypeFilter: boolean = false;
  unsavedProgressNote: boolean = false;

  checkCounterPatient: any={
    isEnCounterCheck: true, isPatientCheck: false
  };
  constructor(
    public ePrescriptionService: EPrescriptionService,
    public sidebarService: SidebarService,
    public _admissionservice: AdmissionService,
    private hospitalistService: HospitalistService,
    private _dataServices: EEmrService,
    private route: ActivatedRoute,
  ) {
    this.route.queryParams.subscribe((params) => {
      this.paramsObj.patientId = params.patnr;
      this.paramsObj.caseid = params.falnr;
      this.institutionid = params.einri;
      this.navTabBoxActiveValue = params.activeValue;
      this.caseid = params.falnr;
      this.paramsFilter = {
        admittedFrom: params.admittedFrom,
        admittedTo: params.admittedTo,
        wardNo: params.wardNo,
        physician: params.physician,
        speciality: params.speciality
      };
      this.getBedDetails();
    });

    this.phyOrderTableList();
    this.occupationalGroupList();

    if (localStorage.getItem('tabName')) {
      this.tabChange(localStorage.getItem('tabName'));
    }
  }

  ngOnInit(): void {
    this._admissionservice.clearSoapEvent.subscribe((res)=>{
      if(res) {
        this.soapFormEvent = '';
      }
    })
    this.getProgressNotesData();
  }

  documentTypeFilter(event: any) {
    if(event) {
      this.isDocumentTypeFilter = true;
    }
  }

  phyOrderTableList() {
    const res = this._admissionservice.getPhyOrderSetDataSet(
      this.institutionid,
      this.caseid
    );

    this._admissionservice.phyOrderlistData$
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((data: any[]) => {
        this.physicianOrderList = data;
        this.physicianOrderListFilterValue = data;
      });
  }

  formEvent(event) {
    this.soapFormEvent = event;
  }

  inPatientListByFilter(admittedFrom, admittedTo, wardNo) {
    const res = this.hospitalistService.getIpListSetDataSetWithFilter(
      this.navTabBoxActiveValue,
      admittedFrom,
      admittedTo,
      wardNo,
      ""
    );

    this.hospitalistService.inHospitalistData$
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((data: any[]) => {
        // this.showFilter = false;
        this.inHospitalistList = data;
      });
  }

  async getBedDetails() {
    const res = this.hospitalistService.getIpListDataSet(
      this.navTabBoxActiveValue, this.paramsFilter.admittedFrom, this.paramsFilter.admittedTo,
      this.paramsFilter.wardNo, this.paramsFilter.physician, this.paramsFilter.speciality, ''
    );

    this.hospitalistService.getInHospitalistData$
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((data: any[]) => {
        this.inHospitalistList = data[0].ToIPList.results;
      });
  }

  redirectToeKardex(data) {
    // this.openModuleKardex.emit(data);
  }

  checkPatientCounter(event: any) {
    this.checkCounterPatient = event;
  }

  occupationalGroupList() {
    this._dataServices.occupationalGroupList().subscribe(
      (_success: any) => {
        this.occupationalGroupData = _success.d.results;
      },
      (_error: any) => {}
    );
  }

  onSearchChange(event: any): void {
    this.searchString = event;
  }

  reloadPhyOrderAPI() {}

  reloadPhyOrderListEvent(event) {
    if (event) {
      this.phyOrderTableList();
    }
  }

  commaSeparatForAttendPhy(value: any) {
    return Array.prototype.map.call(value, function(item) { return item.Gpart; }).join(",");
  }

  commaSeparatForSpecialty(value: any) {
    return Array.prototype.map.call(value, function(item) { return item.Deptou; }).join(",");
  }

  openModuleAdmissionProcess(data) {
    let admittedFrom = '';
    let admittedTo = '';
    let wardNo = '';
    let physician = '';
    let speciality = '';

    if (this.paramsFilter.admittedFrom) {
      admittedFrom = this.paramsFilter.admittedFrom;
    }

    if (this.paramsFilter.admittedTo) {
      admittedTo = this.paramsFilter.admittedTo;
    }

    if (this.paramsFilter.wardNo) {
      wardNo = this.paramsFilter.wardNo;
    }

    if (this.paramsFilter.physician) {
      physician = this.commaSeparatForAttendPhy(this.paramsFilter.physician);
    }

    if (this.paramsFilter.speciality) {
      speciality = this.commaSeparatForSpecialty(this.paramsFilter.speciality);
    }

    window.open(
      'discharge-process?patnr=' +
        data.Mrn +
        '&falnr=' +
        data.CaseNumber +
        '&einri=' +
        data.Institute +
        '&lfdnr=' +
        data.Lfdnr +
        '&admittedFrom=' +
        admittedFrom +
        '&admittedTo=' +
        admittedTo +
        '&wardNo=' + wardNo +
        '&physician=' + physician +
        '&speciality=' + speciality +
        '&activeValue=' +
        this.navTabBoxActiveValue,
      '_self'
    );
  }

  redirectToAdmissionProcess(data) {
    let admittedFrom = '';
    let admittedTo = '';
    let wardNo = '';
    let physician = '';
    let speciality = '';

    if (this.paramsFilter.admittedFrom) {
      admittedFrom = this.paramsFilter.admittedFrom;
    }

    if (this.paramsFilter.admittedTo) {
      admittedTo = this.paramsFilter.admittedTo;
    }

    if (this.paramsFilter.wardNo) {
      wardNo = this.paramsFilter.wardNo;
    }

    if (this.paramsFilter.physician) {
      physician = this.paramsFilter.physician;
    }

    if (this.paramsFilter.speciality) {
      speciality = this.paramsFilter.speciality;
    }

    window.open(
      'discharge-process?patnr=' +
        data.Mrn +
        '&falnr=' +
        data.CaseNumber +
        '&einri=' +
        data.Institute +
        '&lfdnr=' +
        data.Lfdnr +
        '&admittedFrom=' +
        admittedFrom +
        '&admittedTo=' +
        admittedTo +
        '&wardNo=' + wardNo +
        '&physician=' + physician +
        '&speciality=' + speciality +
        '&activeValue=' +
        this.navTabBoxActiveValue,
      '_self'
    );
  }

  phyOrderFilterList(formFilter: any) {
    this.admittedFrom = '';
    this.admittedTo = '';
    let profGroup =
      formFilter.value.SelectDropdown === null
        ? ''
        : formFilter.value.SelectDropdown;
    this.admittedFrom =
      formFilter.value.DateRange.length === 0
        ? ''
        : formFilter.value.DateRange[0].toISOString().split('.')[0];
    this.admittedTo =
      formFilter.value.DateRange.length === 0
        ? ''
        : formFilter.value.DateRange[1].toISOString().split('.')[0];
    if (this.admittedFrom == this.admittedTo) {
      this.admittedFrom = '';
      this.admittedTo = '';
    }
    this._admissionservice.getPhyOrderSetDataSetWithFilter(
      this.institutionid,
      this.caseid,
      this.admittedFrom,
      this.admittedTo,
      profGroup
    );
    this._admissionservice.phyOrderlistDataWithFilter$
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((data: any[]) => {
        this.physicianOrderList = data;
      });
  }

  getProgressNotesData() {
    const res = this._admissionservice.getProgressNotesSetData(
      this.paramsObj.patientId,
      this.paramsObj.caseid
    );

    this._admissionservice.progressNotesSetData$
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((data: any[]) => {
        this.ProgressNotesList = data;
        this.ProgressNotesListFilterValue = data;
      });
  }

  progressNotesFilterList(formFilter: any) {
    this.admittedFrom = '';
    this.admittedTo = '';
    let profGroup = formFilter?.value?.SelectDropdown === null ? '' : formFilter?.value?.SelectDropdown;
    this.admittedFrom = formFilter?.value?.DateRange?.length === 0 ? '' : formFilter?.value?.DateRange[0].toISOString().split('.')[0];
    this.admittedTo = formFilter?.value?.DateRange?.length === 0 ? '' : formFilter?.value?.DateRange[1].toISOString().split('.')[0];
    // if (this.admittedFrom || this.admittedTo || profGroup) {
      if (this.admittedFrom == this.admittedTo) {
        this.admittedFrom = '';
        this.admittedTo = '';
      }
      this._admissionservice.getProgressNotesDataSetWithFilter(
        this.paramsObj.patientId,
        this.caseid,
        this.admittedFrom,
        this.admittedTo,
        profGroup
      );
      this._admissionservice.progressNoteSetDataWithFilter$
        .pipe(
          untilDestroyed(this),
          catchError((err) => {
            return of([]);
          })
        )
        .subscribe((data: any[]) => {
          this.ProgressNotesList = data;
        });
    // }
  }

  tabChange(tabName: string) {
    if (tabName == 'ProgressNotes') {
      this.calltab('ProgressNotes');
      // this._admissionservice.tabPanelNavigation('ProgressNotes');
    } else if (tabName == 'PhysicianOrders') {
      this.calltab('PhysicianOrders');
      // this._admissionservice.tabPanelNavigation('PhysicianOrders');
    } else if (tabName == 'Diagnosis') {
      this.calltab('Diagnosis');
      // this._admissionservice.tabPanelNavigation('Diagnosis');
    } else if (tabName == 'Documentation') {
      this.calltab('Documentation');
      // this._admissionservice.tabPanelNavigation('Documentation');
    } else if (tabName == 'vitalSign') {
      this.calltab('vitalSign');
      // this._admissionservice.tabPanelNavigation('vitalSign');
    }
    this.onSearchChange('');
    this.ProgressNotesList = this.ProgressNotesListFilterValue;
    this.physicianOrderList = this.physicianOrderListFilterValue;
  }

  dataGetEvent(data) {
    this.unsavedProgressNote = data
  }

  async calltab(tabName) {
    if (this.unsavedProgressNote) {
      const result = await Swal.fire({
        title: 'Confirm',
        text: 'Are you sure you want to leave without saving?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        // customClass: 'myalertpopup'
      });
      if (result.isConfirmed) {
        this.unsavedProgressNote = false;
        this._admissionservice.tabPanelNavigation(tabName);
      } else {
        return;
      }
    } else {
      this.unsavedProgressNote = false;
      this._admissionservice.tabPanelNavigation(tabName);
    }
  }

  handleSidebarToggle() {
    this.isExpanded = !this.isExpanded;
  }

  onDateFilter(event) {
    this.filterDateValue = event
  }
  createEventFn() {
    this.createDischarge.onSubmitData();
  }

  onTemplatedata() {
    this.createDischarge.onTemplate();
  }
}
