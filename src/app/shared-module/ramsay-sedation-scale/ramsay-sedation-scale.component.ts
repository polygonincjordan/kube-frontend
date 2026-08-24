import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataShareService } from '@services/data-share.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { ActionType } from '@services/interfaces/common.enum';
import { PatientDocumentationService } from '@services/patient-documentation.service';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ramsay-sedation-scale',
  templateUrl: './ramsay-sedation-scale.component.html',
  styleUrls: ['./ramsay-sedation-scale.component.scss']
})
export class RamsaySedationScaleComponent implements OnInit {

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

  constructor(private fb: FormBuilder, private patientDocService: PatientDocumentationService, private emergencyService: EmergencyService, private dataShareService: DataShareService,
    private storageService: StorageService, private _route: ActivatedRoute, private sharedService: SharedService) {
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
    this.emergencyService.fetchRamsayDocument(this.docKey).subscribe((data: any) => {
      if (data.d) {
        this.ramsaySedationForm.patchValue(data?.d?.results[0]);
      }
    }, (error) => {
      console.error(error)
    })
  }

  ngOnInit(): void {
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

    this.realized = this.storageService.getUserProfile().Gpart;
    this.realizedDescription = this.storageService.getUserProfile().GpartName;
    this.ramsaySedationForm.controls['AttendPhy'].patchValue(this.realized)
  }

  getFormData() {
    return this.ramsaySedationForm.value;
  }

  calculateTotal(value: any) {
    let labelName: string
    if(value == 4) {
      labelName = 'Patient exhibits brisk response to light';
    } else if(value == 5) {
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
      formData.Orgdo = this.storageService.patientData.deptOrgUnit;
      formData.AttendPhy = this.storageService.getUserProfile().Gpart;
      let payload = {
        d: this.ramsaySedationForm.value
      };
      this.subscription = this.emergencyService.saveRamsayScaleDoc(payload).subscribe({
        next: (data: any) => {

        },
        error: (err: any) => {
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

}
