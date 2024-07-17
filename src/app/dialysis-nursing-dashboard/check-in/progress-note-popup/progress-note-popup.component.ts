import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ProgressNotesListModel } from '@services/admission/interfaces/template-model';
import { EEmrService } from '@services/e-emr.service';
import { HospitalistService } from '@services/e-hospitalist/hospitalist.service';
import { PatientHistoryService } from '@services/e-kardex/patient-history.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { catchError, of } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-progress-note-popup',
  templateUrl: './progress-note-popup.component.html',
  styleUrls: ['./progress-note-popup.component.scss']
})
export class ProgressNotePopupComponent implements OnInit {

 
  @ViewChild('progressNotesKardexModal', { static: true }) progressNotesKardexModal: TemplateRef<any>;
  modalRef: BsModalRef;
  navTabBoxActiveValue: string = '02';
  graphChartCountType: string = '1';
  reloadPhyOrderList: boolean = false;
  inHospitalistList: any[] = [];
  erListSelectedData: any;
  institutionid: any;
  caseid: any;
  physicianOrderList: any[];
  searchString: string;
  admittedFrom: string;
  admittedTo: string;
  paramsFilter: any = {};
  paramsObj: any = {};
  ProgressNotesList: any[];
  ProgressNotesListFilterValue: ProgressNotesListModel[];
  physicianOrderListFilterValue: any[];
  occupationalGroupData: any;
  lfdnr: any;
  constructor(private modalServiceForAllergy: BsModalService,
    private formBuilder: FormBuilder,public storageService: StorageService,public emergencyService:EmergencyService,private patientHistoryService:PatientHistoryService,private sanitizer: DomSanitizer,private hospitalistService: HospitalistService,private _dataServices: EEmrService,private route: ActivatedRoute) {
       //phy order
    this.route.queryParams.subscribe((params) => {
      this.paramsObj.patientId = params.patnr;
      this.paramsObj.caseid = params.falnr;
      this.institutionid = params.einri;
      this.lfdnr = params.lfdnr;
      this.navTabBoxActiveValue = params.activeValue;
      this.caseid = params.falnr;
      if (params.admittedFrom || params.admittedTo || params.wardNo) {
        this.paramsFilter = {
          admittedFrom: params.admittedFrom,
          admittedTo: params.admittedTo,
          wardNo: params.wardNo,
        };
        this.inPatientListByFilter(
          params.admittedFrom,
          params.admittedTo,
          params.wardNo
        );
      } else {
        //this.getBetDetails();
      }
    });
     }

  ngOnInit() {}
  openProgressNotesModal(item){
    this.erListSelectedData=item;
    this.emergencyService.tabPanelNavigation('ProgressNotes');
    const config: ModalOptions = { class: 'modal-dialog-centered allergy-modal-size' };
    this.modalRef = this.modalServiceForAllergy.show(this.progressNotesKardexModal, config);
    this.occupationalGroupList();
    this.getProgressNotesData();
  }
 //phy order
 phyOrderTableList() {
  const res = this.emergencyService.getPhyOrderSetDataSet(
    this.institutionid,
    this.caseid
  );

  this.emergencyService.phyOrderlistData$
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

onSearchChange(event: any): void {
  this.searchString = event;
}

reloadPhyOrderAPI() {}

reloadPhyOrderListEvent(event) {
  if (event) {
    this.phyOrderTableList();
  }
}

phyOrderFilterList(formFilter: any) {
  this.admittedFrom = '';
  this.admittedTo = '';
  let profGroup =
    formFilter.value.SelectDropdown === null
      ? ''
      : formFilter.value.SelectDropdown;
      this.admittedFrom = formFilter?.value?.DateRange?.length === 0 ? '' : formFilter?.value?.DateRange[0].getFullYear() +'-'+ String(formFilter?.value?.DateRange[0].getMonth() +1).padStart(2, '0') +'-'+ String(formFilter?.value?.DateRange[0].getDate()).padStart(2, '0') +'T00:00:00';
      this.admittedTo = formFilter?.value?.DateRange?.length === 0 ? '' : formFilter?.value?.DateRange[1].getFullYear() +'-'+ String(formFilter?.value?.DateRange[1].getMonth() +1).padStart(2, '0') +'-'+ String(formFilter?.value?.DateRange[1].getDate()).padStart(2, '0') +'T00:00:00';
  if (this.admittedFrom == this.admittedTo) {
    this.admittedFrom = '';
    this.admittedTo = '';
  }
  this.emergencyService.getPhyOrderSetDataSetWithFilter(
    this.institutionid,
    this.caseid,
    this.admittedFrom,
    this.admittedTo,
    profGroup
  );
  this.emergencyService.phyOrderlistDataWithFilter$
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
  const res = this.emergencyService.getProgressNotesSetData(
    this.erListSelectedData.Patnr,
    this.erListSelectedData.Falnr
  );

  this.emergencyService.progressNotesSetData$
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
    this.emergencyService.getProgressNotesDataSetWithFilter(
      this.paramsObj.patientId,
      this.caseid,
      this.admittedFrom,
      this.admittedTo,
      profGroup
    );
    this.emergencyService.progressNoteSetDataWithFilter$
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
occupationalGroupList() {
  this._dataServices.occupationalGroupList().subscribe(
    (_success: any) => {
     this.occupationalGroupData = _success.d.results;
      // this.phyOrderform1.controls.occupationalGroup.setValue(this.occupationalGroupData[2].Group);

    },
    (_error: any) => {}
  );
}

}
