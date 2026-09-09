import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataShareService } from '@services/data-share.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { ActionType } from '@services/interfaces/common.enum';
import { PatientDocumentationService } from '@services/patient-documentation.service';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ramsay-sedation-scale',
  templateUrl: './ramsay-sedation-scale.component.html',
  styleUrls: ['./ramsay-sedation-scale.component.scss']
})
export class RamsaySedationScaleComponent implements OnInit {
  @ViewChild('scaleRamsaySedationModal', { static: true }) scaleRamsaySedationModal: TemplateRef<any>;
  @Output() scaleStoreValue = new EventEmitter<any>();

  ramsaySedationForm: FormGroup<any>;
  CurrentDateAndTime: Date = new Date();
  realized: string;
  realizedDescription: string;
  ch_mfs_history_falls: number | null;
  ch_mfs_secondary_diagnosis: number | null;
  ch_mfs_ambulatory_aid: number | null;
  ch_mfs_IV_acess: number | null;
  ch_mfs_gait: number | null;
  ch_mfs_mental_status: number | null;
  totalScore: number = 0;
  description: string = 'Not answered';

  ramsayList = [
    {
      label: 'Not answered',
      value: 0
    },
    {
      label: 'Patient is anxious and agitated and/or restless',
      value: 1
    },
    {
      label: 'Patient is cooperative, oriented and quiet',
      value: 2
    },
    {
      label: 'Patient responds to commands only',
      value: 3
    },
    {
      label: 'Patient exhibits brisk response to light glabellar tap',
      value: 4
    },
    {
      label: 'Patient exhibits a sluggish response to light glabellar tap',
      value: 5
    },
    {
      label: 'Patient exhibits no response',
      value: 6
    },
  ]

  morseFallScaleData;
  docKey: any;
  public paramsObject: any;
  private subscription: Subscription;
  private actionTypeSubscription$: Subscription;

  constructor(private fb: FormBuilder, private emergencyService: EmergencyService, private dataShareService: DataShareService, private datePipe: DatePipe,
    private storageService: StorageService, private _route: ActivatedRoute, private sharedService: SharedService, private modalService: BsModalService) {
    this._route.queryParams.subscribe((params) => {
      this.paramsObject = params;
      this.storageService.setEinri(this.paramsObject.einri);
      this.storageService.setFalnr(this.paramsObject.falnr);
      this.storageService.setLfdnr(this.paramsObject.lfdnr);
      this.storageService.setPatnr(this.paramsObject.patnr);
    });
    this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe(
      (data) => {
        if (data != null) {
          if (data.type == ActionType.Add$ && data.value == '') {
            this.docKey = data.value.Dockey;
          }
          if (data.type == ActionType.Update$ && data.value) {
            this.docKey = data.value.docKey;
            this.getDocData();
          }
          if (data.type == ActionType.Copy$ && data.value) {
            this.docKey = data.value.docKey;
            this.getDocData();
          }
        }
      }
    );
  }

  getDocData() {
    this.emergencyService.fetchRamsayDocument(this.dockeyValue).subscribe((data: any) => {
      if (data.d) {
        this.ramsaySedationForm.patchValue(data?.d?.results[0]);
      }
    }, (error) => {
      console.error(error)
    })
  }

  public dockeyValue: any = null;
  modalRef: BsModalRef;

  openModalForRamsaySedation(dockKey) {
    this.dockeyValue = null;
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-xl glasgow-scale-size',
      ignoreBackdropClick: true
    };
    this.modalRef = this.modalService.show(this.scaleRamsaySedationModal, config);
    this.dockeyValue = dockKey ? dockKey : null;
    if (this.dockeyValue) {
      this.getDocData();
    }
  }


  ngOnInit(): void {
    this.initForm();
    this.realized = this.storageService.getUserProfile().Gpart;
    this.realizedDescription = this.storageService.getUserProfile().GpartName;
    this.ramsaySedationForm.controls['AttendPhy'].patchValue(this.realized)
  }

  initForm() {
    this.ramsaySedationForm = this.fb.group({
      Dockey: "",
      Dtid: "SCA_RMS",
      Einri: this.paramsObject.einri,
      Patnr: this.paramsObject.patnr,
      Falnr: this.paramsObject.falnr,
      Lfdnr: this.paramsObject.lfdnr,
      Orgdo: [this.storageService.patientData.deptOrgUnit],
      AttendPhy: [this.storageService.getUserProfile().Gpart],
      DocStatus: "",
      Responsiveness: "",
      TotalScore: "",
      ScoreDesc: "",
      Comments: ""
    })

  }

  getFormData() {
    return this.ramsaySedationForm.value;
  }

  calculateTotal(value: any) {
    let labelName: string
    if (value == 4) {
      labelName = 'Patient exhibits brisk response to light';
    } else if (value == 5) {
      labelName = 'Patient exhibits a sluggish response to light';
    } else {
      labelName = this.ramsayList[value].label;
    }
    this.ramsaySedationForm.patchValue({
      TotalScore: this.ramsayList[value].value,
      ScoreDesc: labelName,
    });
  }


  createRamsaySedation(docStatus): Promise<any> {
    return new Promise((resolve, reject) => {
      let formData = this.ramsaySedationForm.value;
      formData.DocStatus = docStatus;
      formData.TotalScore = formData.TotalScore.toString();
      let payload = {
        d: this.ramsaySedationForm.value
      };
      this.subscription = this.emergencyService.saveRamsayScaleDoc(payload).subscribe({
        next: (data: any) => {
          let currentTime = this.datePipe.transform(new Date(), 'HH:mm:ss');
          let formValue = {
            totalScore: this.ramsaySedationForm.value.TotalScore,
            description: this.ramsaySedationForm.value.ScoreDesc,
            dockey: data?.d.Dockey,
            time: currentTime,
             date: this.dateConvertToString(new Date())
          }
          this.scaleStoreValue.next(formValue);
          this.modalRef.hide();
          this.initForm();
        },
        error: (err: any) => {
          console.log(err, "err");

          this.sharedService.waringSwallModel(`POST Error at Richmond Scale : ${err?.error?.error?.message?.value}`);
        },
        complete: () => {
          resolve(true);
          this.sharedService.successSwallModel('Ramsay Sedation Scale created successfully');
        }
      });
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.actionTypeSubscription$) {
      this.actionTypeSubscription$.unsubscribe();
      this.dataShareService.sendActionType(null);
    }
  }


  closeGlosgowModel() {
    this.modalRef.hide();
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
