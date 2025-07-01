import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DataShareService } from '@services/data-share.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { ActionType } from '@services/interfaces/common.enum';
import { PatientDocumentationService } from '@services/patient-documentation.service';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-morse-fall-scale',
  templateUrl: './morse-fall-scale.component.html',
  styleUrls: ['./morse-fall-scale.component.scss'],
})
export class MorseFallScaleComponent implements OnInit {
  @ViewChild('morseFallScaleModal', { static: true }) morseFallScaleModal: TemplateRef<any>;
  @Output() scaleStoreValue = new EventEmitter<any>();

  MorsefallForm: FormGroup<any>;
  CurrentDateAndTime: Date = new Date();
  realized: string;
  realizedDescription: string;
  ch_mfs_history_falls: number | null;
  ch_mfs_secondary_diagnosis: number | null;
  ch_mfs_ambulatory_aid: number | null;
  ch_mfs_IV_acess: number | null;
  ch_mfs_gait: number | null;
  ch_mfs_mental_status: number | null;
  totalScore: number;
  description: string;

  modalRef: BsModalRef;

  morseFallScaleData;
  private actionTypeSubscription$: Subscription;
  dockeyValue: string;

  constructor(
    private fb: FormBuilder,
    private patientDocService: PatientDocumentationService,
    private emergencyService: EmergencyService,
    private dataShareService: DataShareService,
    private storageService: StorageService,
    private modalService: BsModalService,
    private sharedService: SharedService,
    private datePipe: DatePipe,
  ) {
    // this.getDocData();
    this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe(
      (data) => {
        if (data != null) {
          if (
            data.type == ActionType.Copy$ &&
            data.isAllow == true &&
            data.value
          ) {
            // this.getDocData();
          }
        }
      }
    );
  }

  getDocData() {
    this.emergencyService
      .getMFSDoc(this.patientDocService.latestMorseFallScaleData?.Dockey)
      .subscribe(
        (data: any) => {
          if (data.d) {
            this.MorsefallForm.patchValue(data.d);
            this.calculateTotal();
          }
        },
        (error) => {
          console.error(error);
        }
      );
  }

  ngOnInit(): void {
    this.MorsefallForm = this.fb.group({
      HistoryFalls: new FormControl('A'),
      SecondaryDiagnosis: new FormControl('A'),
      AmbulatoryAid: new FormControl('A'),
      IvAccess: new FormControl('A'),
      Gait: new FormControl('A'),
      MentalStatus: new FormControl('A'),
      Comments: new FormControl(''),
      AttendPhy: new FormControl(''),
    });

    this.realized = this.storageService.getUserProfile()?.Gpart;
    this.realizedDescription = this.storageService.getUserProfile()?.GpartName;

    this.MorsefallForm.controls['AttendPhy'].patchValue(this.realized);

    this.calculateTotal();
  }

  openMorseFallScaleModal(glowgosValue: any) {
    this.dockeyValue = '';
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-xl morse-fall-scale',
      ignoreBackdropClick: true,
    };
    this.modalRef = this.modalService.show(this.morseFallScaleModal, config);

    if (glowgosValue) {
    }
  }

  getFormData() {
    return this.MorsefallForm.value;
  }

  calculateTotal() {
    const formValues = this.MorsefallForm.value;

    const scores = {
      HistoryFalls: { A: null, '1': 25, '0': 0 },
      SecondaryDiagnosis: { A: null, '1': 15, '0': 0 },
      AmbulatoryAid: { A: null, F: 30, C: 15, N: 0 },
      IvAccess: { A: null, '1': 20, '0': 0 },
      Gait: { A: null, I: 20, W: 10, N: 0 },
      MentalStatus: { A: null, F: 15, O: 0 },
    };

    Object.keys(scores).forEach((key) => {
      const value = formValues[key];
      this['ch_mfs_' + key.toLowerCase()] = scores[key][value];
    });

    this.totalScore = Object.keys(scores).reduce(
      (acc, key) => acc + (scores[key][formValues[key]] || 0),
      0
    );

    if (this.totalScore <= 24) {
      this.description = 'Low risk. Basic nursing care.';
    } else if (this.totalScore < 45) {
      this.description = 'Moderate risk. Standard fall prevention indicators.';
    } else if (!this.totalScore || this.totalScore == undefined) {
      this.totalScore = 0;
      this.description = 'Low risk. Basic nursing care.';
    } else {
      this.description = 'High risk. High risk fall prevention indicators.';
    }
  }

  closeMorseFallScale() {
    this.modalRef.hide();
  }

  createMorseFallScale() {
    const formData = {
      ...this.MorsefallForm.value,
      Dockey: '',
      Einri: this.storageService.einri,
      Patnr: this.storageService.patnr,
      Falnr: this.storageService.falnr,
      Orgdo: 'F21IUAMC',
      DocStatus: '1',
      Dtid: 'SCA_MORSE',
    };

    this.emergencyService.postMFSSet(formData).subscribe(
      (resp: any) => {
        let currentTime = this.datePipe.transform(new Date(), 'HH:mm:ss');
        let formValue = {
          totalScore: this.totalScore,
          description: this.description,
          dockey: resp?.d.Dockey,
          time: currentTime,
          date: this.dateConvertToString(new Date())
        }
        this.scaleStoreValue.next(formValue);
        Swal.fire({
          text: 'Document is created successfully',
          icon: 'success',
          confirmButtonText: 'Ok',
          customClass: 'myalertpopup',
        });
      },
      (error) => {
        this.sharedService.errorSwallModel(error?.error?.error.message.value);
      }
    );
  }

  dateConvertToString(date: Date) {
    let day = String(date.getDate()).padStart(2, '0');
    let month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    let year = date.getFullYear();

    let hours = String(date.getHours()).padStart(2, '0');
    let minutes = String(date.getMinutes()).padStart(2, '0');
    let seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}.${month}.${year}/${hours}:${minutes}:${seconds}`;
  }
}
