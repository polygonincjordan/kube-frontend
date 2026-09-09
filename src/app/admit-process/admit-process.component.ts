import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AdmissionService } from '@services/admission/admission.service';
import { HospitalistService } from '@services/e-hospitalist/hospitalist.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { SidebarService } from '@services/sidebar.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { catchError, of } from 'rxjs';
import { EEmrService } from '@services/e-emr.service';
import { ActivatedRoute } from '@angular/router';
import { ProgressNotesListModel } from '@services/admission/interfaces/template-model';
import { StorageService } from '@services/storage.service';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';

@UntilDestroy()
@Component({
  selector: 'app-e-prescription',
  templateUrl: './admit-process.component.html',
  styleUrls: ['./admit-process.component.scss'],
})
export class AdmitProcessComponent implements OnInit {
  // @Input() searchString: string;
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
  checkCounterPatient: any={
    isEnCounterCheck: true, isPatientCheck: false
  };
  showFilter: boolean = false;
  isExpanded: boolean = false;
  filterDateValue: any;
  soapFormEvent: any = '';
  isDocumentTypeFilter: boolean = false;
  inHospitalist: any[] = [];
  inLDRAttendPhyList: any;
  unsavedProgressNote: any = false;
  constructor(
    public sidebarService: SidebarService,
    public eprescriptionService: EPrescriptionService,
    public _admissionservice: AdmissionService,
    private hospitalistService: HospitalistService,
    private _dataServices: EEmrService,
    private route: ActivatedRoute,
    public storageService: StorageService

  ) {
    this.route.queryParams.subscribe((params) => {
        this.storageService.setEinri(params['einri']);
        this.storageService.setFalnr(params['falnr']);
        this.storageService.setLfdnr(params['lfdnr']);
        this.storageService.setPatnr(params['patnr']);
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
      if(this.navTabBoxActiveValue == '07') {
        this.LDRListSet();
      } else {
        this.getBedDetails();
      }
    });

    this.phyOrderTableList();
    this.occupationalGroupList();
  }

  ngOnInit(): void {
    this._admissionservice.clearSoapEvent.subscribe((res)=>{
      if(res) {
        this.soapFormEvent = '';
      }
    })
    this.getProgressNotesData();
    this.tabChange('ProgressNotes');
  }
  LDRListSet(fromdate?,todate?,physician?) {
    let fromdatevalue = '';
    let todatevalue = '';
    let physicianvalue = '';
    if (fromdate) {
      fromdatevalue = `${new DatePipe('en-US').transform(
        fromdate,
        'yyyy-MM-dd'
      )}T00:00:00`
    }
    if(todate){
      todatevalue = `${new DatePipe('en-US').transform(
        todate,
        'yyyy-MM-dd'
      )}T00:00:00`
    }
    if(physician){
      physicianvalue = JSON.stringify(physician);
    }
    this.eprescriptionService.loadData(`eHospitalist/LDRListSet?Behperson=${physicianvalue}&FromDate=${fromdatevalue}&ToDate=${todatevalue}`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        this.inHospitalistList = resp.body.d.results[0]?.ToLDRBu?.results;
        // this.inHospitalistList = resp.body.d.results[0]?.ToPhysician?.results;
        this.showFilter =false;
      }
    });
  }
  checkPatientCounter(event: any) {
    this.checkCounterPatient = event;
  }

  formEvent(event) {
    this.soapFormEvent = event;
    console.log(this.soapFormEvent, "2");
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

  handleSidebarToggle() {
    this.isExpanded = !this.isExpanded;
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
   
    this.openAdmitProcessUrl({
      patnr: data.Mrn,
      falnr: data.CaseNumber,
      einri: data.Institute,
      lfdnr: data.Lfdnr,
      admittedFrom,
      admittedTo,
      wardNo,
      physician,
      speciality,
      Deptou: data.Deptou,
      activeValue: this.navTabBoxActiveValue
    });
  
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

    if(this.navTabBoxActiveValue == '07') {
      this.openAdmitProcessUrl({
        patnr: data.Patnr,
        falnr: data.Falnr,
        einri: data.Einri,
        lfdnr: data.Lfdbw,
        admittedFrom,
        admittedTo,
        wardNo,
        physician,
        speciality,
        Deptou: data.Deptou,
        activeValue: this.navTabBoxActiveValue
      });
    } else {
      this.openAdmitProcessUrl({
        patnr: data.Mrn,
        falnr: data.CaseNumber,
        einri: data.Institute,
        lfdnr: data.Lfdnr,
        admittedFrom,
        admittedTo,
        wardNo,
        physician,
        speciality,
        Deptou: data.Deptou,
        activeValue: this.navTabBoxActiveValue
      });
    }
  }

  private openAdmitProcessUrl(params: any) {
    const queryParams = new URLSearchParams();
    queryParams.set('patnr', this.normalizeId(params.patnr, 10));
    queryParams.set('falnr', this.normalizeId(params.falnr, 10));
    queryParams.set('einri', this.normalizeId(params.einri));
    queryParams.set('lfdnr', this.normalizeId(params.lfdnr));
    queryParams.set('admittedFrom', params.admittedFrom ?? '');
    queryParams.set('admittedTo', params.admittedTo ?? '');
    queryParams.set('wardNo', params.wardNo ?? '');
    queryParams.set('physician', params.physician ?? '');
    queryParams.set('speciality', params.speciality ?? '');
    queryParams.set('Deptou', params.Deptou ?? '');
    queryParams.set('activeValue', params.activeValue ?? '');
    window.open('admit-process?' + queryParams.toString(), '_self');
  }

  private normalizeId(value: any, length?: number): string {
    const normalized = (value ?? '').toString().trim().replace(/\D/g, '');
    return normalized && length ? normalized.padStart(length, '0') : normalized;
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
    this.admittedFrom = formFilter?.value?.DateRange?.length === 0 ? '' : formFilter?.value?.DateRange[0].getFullYear() +'-'+ String(formFilter?.value?.DateRange[0].getMonth() +1).padStart(2, '0') +'-'+ String(formFilter?.value?.DateRange[0].getDate()).padStart(2, '0') +'T00:00:00';
    this.admittedTo = formFilter?.value?.DateRange?.length === 0 ? '' : formFilter?.value?.DateRange[1].getFullYear() +'-'+ String(formFilter?.value?.DateRange[1].getMonth() +1).padStart(2, '0') +'-'+ String(formFilter?.value?.DateRange[1].getDate()).padStart(2, '0') +'T00:00:00';
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
    } else if (tabName == 'DietMealOrdering') {
      this.calltab('DietMealOrdering');
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
        customClass: { popup: 'myalertpopup' }
      } as any);
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

  onDateFilter(event) {
    this.filterDateValue = event
  }
}
