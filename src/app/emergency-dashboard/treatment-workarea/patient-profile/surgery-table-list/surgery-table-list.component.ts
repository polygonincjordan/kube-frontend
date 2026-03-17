import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, OnChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { EEmrService } from '@services/e-emr.service';
import { HospitalistService } from '@services/e-hospitalist/hospitalist.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { eOrderService } from '@services/eorder.service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-surgery-table-list',
  templateUrl: './surgery-table-list.component.html',
  styleUrls: ['./surgery-table-list.component.scss']
})
export class SurgeryTableListComponent implements OnInit,OnChanges {
  @Output() reloadTableData = new EventEmitter();
  @Output() deleteItem = new EventEmitter<any>();

  @Input() surgeryList: any;
  @Input() searchString: any;
  modalRef: BsModalRef;
  columnList: any[] = [
    'Service Description',
    'Order Date',
    'Order Time',
    'Surgeon Name',
    'Surgery Date/Time',
    'Treatment OU',
    'Department OU',
    'Created By',
    'Anesthesia Required',
    'Additional Info',
    'Delete'
  ];
  isCollpseOpen: boolean;
  record: any;
  imageUrl: any;
  pdfUrl: any;
  checkedFlag: any;
  text: string;
  cancelReasons: any[] = [];
  constructor(
    public emergencyService: EmergencyService,
    private _dataServices: EEmrService,
    private modalService: BsModalService,
    private hospitalistService: HospitalistService,
    private sanitizer: DomSanitizer,
    public eorderService: eOrderService,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    this.getCancelReasons();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.surgeryList.currentValue?.length) {
      this.isCollpseOpen = true;
    } else {
      this.isCollpseOpen = false;
    }
  }

  getTime(value) {
    if (value) {
      var str = value;
      var str = str.replace(/[PT]/g, '');
      var str = str.replace(/[H]/g, ':');
      var str = str.replace(/[M]/g, ':');
      var str = str.replace(/[S]/g, '');
      return str;
    }
  }

  getCancelReasons() {
    this.hospitalistService.cancelReasonList().subscribe(
      (response: any) => {
        if (response && response.d && response.d.results) {
          this.cancelReasons = response.d.results;
        }
      },
      (error) => {
        console.error('Error fetching cancel reasons:', error);
      }
    );
  }

  deleteOrderItem(item: any) {
    if (!item) {
      return;
    }

    const reasonsOptions = this.cancelReasons.reduce((obj, reason) => {
      obj[reason.Stoid] = reason.N1stotx;
      return obj;
    }, {} as any);

    let selectedReasonId: any = null;

    Swal.fire({
      title: 'Delete Order Service',
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <p style="font-weight: 500; margin-bottom: 15px;">Are you sure you want to delete</p>
          <select id="reason-select" class="swal2-input w-100" style="border: 2px solid #dc3545;" required>
            <option value="" selected disabled>Please Select Reason</option>
            ${Object.entries(reasonsOptions)
              .map(([key, value]) => `<option value="${key}">${value}</option>`)
              .join('')}
          </select>
          <div id="reason-error" style="color: #dc3545; font-size: 14px; margin-top: 8px; display: none;">
            Please Select Reason
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      customClass: { popup: 'myalertpopup' },
      didOpen: () => {
        const selectElement = document.getElementById(
          'reason-select'
        ) as HTMLSelectElement;
        selectElement?.addEventListener('change', (e: any) => {
          selectedReasonId = e.target.value;
          const errorDiv = document.getElementById('reason-error');
          if (errorDiv) {
            errorDiv.style.display = 'none';
          }
        });
      },
      preConfirm: () => {
        const selectElement = document.getElementById(
          'reason-select'
        ) as HTMLSelectElement;
        const errorDiv = document.getElementById('reason-error');

        if (!selectElement?.value) {
          if (errorDiv) {
            errorDiv.style.display = 'block';
          }
          return false;
        }
        return true;
      },
    }).then((result) => {
      if (result.isConfirmed && selectedReasonId) {
        const selectedReason = this.cancelReasons.find(
          (r) => r.Stoid === selectedReasonId
        );
        if (selectedReason) {
          this.performDelete(item, selectedReason);
        }
      }
    });
  }

  private performDelete(item: any, reason: any) {
    const { einri, falnr, lfdnr } = this.getEncounterIds();

    const postObject: any = {
      einri,
      falnr,
      lfdnr,
      Eorderid: item.Eorderid || item.EorderId || '',
      IsGroup: item.Leistung && item.Leistung.includes(',') ? 'X' : '',
      TOLABSET: [],
      TORADSET: [],
      TOSUGSET: [
        {
          Cordtypid:
            item.Cordtypid && item.Cordtypid.replace
              ? item.Cordtypid.replace(/-/g, '')
              : '',
          Eorderid: item.Eorderid || '',
          Eorderitemid: item.Eorderitemid || '',
          Talst: item.Leistung || '',
          Trtoe: item.Trtoe || '',
          Storn: 'X',
          Reason: reason.Stoid || reason,
        },
      ],
      TOMEDICSET: [],
      TOCONSET: [],
    };

    this.eorderService.deleteOrderItemFromProfile(
      postObject,
      () => {
        this.reloadTableData.emit('surgTable');
      },
      () => {}
    );
  }

  private getEncounterIds(): { einri: string; falnr: string; lfdnr: string } {
    let einri = this.storageService.getLocal('einri') || this.storageService.einri || '1000';
    let falnr = this.storageService.getLocal('falnr') || this.storageService.falnr || '0000';
    let lfdnr = this.storageService.getLocal('lfdnr') || this.storageService.lfdnr || '0000';

    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        einri = url.searchParams.get('einri') || einri;
        falnr = url.searchParams.get('falnr') || falnr;
        lfdnr = url.searchParams.get('lfdnr') || lfdnr;
      } catch {
        // ignore URL parsing errors and fall back to storage values
      }
    }

    return { einri, falnr, lfdnr };
  }
}
