import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EEmrService } from '@services/e-emr.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { StorageService } from '@services/storage.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-ldr-view',
  templateUrl: './ldr-view.component.html',
  styleUrls: ['./ldr-view.component.scss'],
})
export class LdrViewComponent implements OnInit {
  @Output() dataToParent = new EventEmitter<any>();
   @Output() sendErPatientCount = new EventEmitter<any>();
    @Output() onClickBox = new EventEmitter();
  inHospitalist: any[] = [];
  sortColumn: string = 'Descr';
  sortOrder: string = 'asc';
  constructor(
    private _dataServices: EEmrService,
    private storageService: StorageService,
    private emergencyService: EmergencyService,
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private modalServiceComp: NgbModal,
    public ePrescriptionService:EPrescriptionService
  ) {}

  ngOnInit(): void {
    this.LDRListSet();
  }

  LDRListSet(date?, physician?) {
    let fromdatevalue = '';
    let todatevalue = '';
    let physicianvalue = '';
    if (date) {
    fromdatevalue = date?.length ? `${new DatePipe('en-US').transform(date[0], 'yyyy-MM-dd')}T00:00:00` : '';
    }
    if (date) {
      todatevalue =date?.length ? `${new DatePipe('en-US').transform(date[1], 'yyyy-MM-dd')}T00:00:00` : '';;
    }
    if (physician) {
      physicianvalue = JSON.stringify(physician);
    }
    this.ePrescriptionService
      .loadData(
        `eHospitalist/LDRListSet?Behperson=${physicianvalue}&FromDate=${fromdatevalue}&ToDate=${todatevalue}`,
        false,
        false,
        false,
        false
      )
      .subscribe((resp: any) => {
        if (
          resp.body &&
          resp.body.d &&
          resp.body.d.results &&
          resp.body.d.results.length
        ) {
          this.inHospitalist = resp.body.d.results[0]?.ToLDRBu?.results;
            this.sendErPatientCount.emit(this.inHospitalist.length);
        }
      });
  }

  onSortClick(event, col: string) {
    this.SortLDRData(col);
  }

  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }

  SortLDRData(col: string): void {
    console.log('col--------', col);
    if (this.sortColumn == col) {
      if (this.sortOrder == 'asc') this.sortOrder = 'desc';
      else this.sortOrder = 'asc';
    } else {
      this.sortColumn = col;
      this.sortOrder = 'asc';
    }
    this.inHospitalist = this.inHospitalist.sort((a, b) => {
      if (a[col] < b[col]) return this.sortOrder == 'asc' ? -1 : 1;
      if (a[col] > b[col]) return this.sortOrder == 'asc' ? 1 : -1;
      return 0;
    });
  }

  actionPhysicianSet(data) {
    const json = {
      Einri: data.Einri,
      Falnr: data.Falnr,
      Lfdnr: data.Lfdbw,
      Pernr: this.storageService.getGpart(),
    };
    this.emergencyService.actionPhysicianSet(json).subscribe(
      (_success: any) => {
        this.onClickBox.emit();
        // this.ERlistData = _success.d.results;
        //this.redirectToTreatment(data);
      },
      (_error: any) => {}
    );
  }
  openModuleLDRPrescription(data) {
    window.open(
      'e-prescription?patnr=' +
        data.Patnr +
        '&falnr=' +
        data.Falnr +
        '&einri=' +
        data.Einri +
        '&lfdnr=' +
        data.Lfdbw,
      '_blank'
    );
  }

  openModuleLDRLabChart(data) {
    window.open(
      environment.labChartUrl +
        'patnr=' +
        data.Patnr +
        '&falnr=' +
        data.Falnr +
        '&einri=' +
        data.Einri +
        '&lfdnr=' +
        data.Lfdbw +
        '&appl=LABCHART',
      '_blank'
    );
  }
  openModuleLDREOrder(data) {
    window.open(
      'e-order?patnr=' +
        data.Patnr +
        '&falnr=' +
        data.Falnr +
        '&einri=' +
        data.Einri +
        '&lfdnr=' +
        data.Lfdbw,
      '_blank'
    );
  }
  // phy order
  openModalForPhysicianOrder(item) {
    // this.physicianOrderKardex.openModalForPhyOrder(item);
  }
  // progress notes
  openModalForProgressNotes(item) {
    // this.progressNotesKardex.openProgressNotesModal(item);
  }
  //
  openModuleAdmissionProcessFromLDR(data) {
    const newJson = {
      Mrn: data.Patnr,
      Institute: data.Einri,
      CaseNumber: data.Falnr,
      Lfdnr: data.Lfdbw,
      Deptou: 'OBYMDAMC',
    };
    // this.openModuleAdmissionProcessEvent.emit(newJson);
    localStorage.removeItem('tabName');
  }

    openModuleRad(data) {
    window.open(
      environment.radiologyUrl + 'patient_id=' + data.Patnr,
      '_blank'
    );
  }
}
