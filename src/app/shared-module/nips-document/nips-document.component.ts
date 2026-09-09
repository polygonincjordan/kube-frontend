import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DataShareService } from '@services/data-share.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { ActionType, WordType } from '@services/interfaces/common.enum';
import { PatientDocumentationService } from '@services/patient-documentation.service';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-nips-document',
  templateUrl: './nips-document.component.html',
  styleUrls: ['./nips-document.component.scss']
})
export class NIPSDocumentComponent implements OnInit {

  snipForm: FormGroup<any>;
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
  dockeyValue: string;

  morseFallScaleData;
  private actionTypeSubscription$: Subscription;
  private subscription: Subscription;
  constructor(private fb: FormBuilder, private patientDocService: PatientDocumentationService, private emergencyService: EmergencyService, private dataShareService: DataShareService,
    private storageService: StorageService, private sharedService: SharedService) {
    // this.getDocData();
    this.initForm();
    this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe((data) => {
      if (data != null) {
        if (data.type == ActionType.Update$ && data.isAllow == true && data.value) {
          if (data.value.type == WordType.EditBS && data.value.docKey != '') {
            this.dockeyValue = data.value.docKey ? data.value.docKey : null;
            if (this.dockeyValue) {
              this.getNIPSDocument(data.value.docKey);
            }
          }
        }
        if (data.type == ActionType.Copy$ && data.isAllow == true && data.value) {
          if (data.value.type == WordType.CopyBS && data.value.docKey != '') {
            this.dockeyValue = data.value.docKey ? data.value.docKey : null;
            if (this.dockeyValue) {
              this.getNIPSDocument(data.value.docKey);
            }
          }
        }
      }
    });
  }


  ngOnInit(): void {

  }

  initForm() {
    this.snipForm = this.fb.group({
      Dockey: [''],
      Dtid: ['SCA_SNIP'],
      Einri: [this.storageService.einri],
      Patnr: [this.storageService.patnr],
      Falnr: [this.storageService.falnr],
      Lfdnr: [this.storageService.lfdnr],
      Orgdo: [localStorage.getItem('initOrg')],
      AttendPhy: [this.storageService.getGpart()],
      DocStatus: ['1'],
      Facial: ['A'],
      Cry: ['A'],
      Breathing: ['A'],
      Arms: ['A'],
      Leg: ['A'],
      State: ['A'],
      TotalScore: [''],
      ScoreDesc: [''],
      Comments: ['']
    });


    this.realized = this.storageService.getUserProfile().Gpart;
    this.realizedDescription = this.storageService.getUserProfile().GpartName;

    this.snipForm.controls['AttendPhy'].patchValue(this.realized);

    this.setupScoreCalculation();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.actionTypeSubscription$) {
      this.actionTypeSubscription$.unsubscribe();
      this.dataShareService.sendActionType(null);
    }
  }

  setupScoreCalculation() {
    const fields = ['Facial', 'Cry', 'Breathing', 'Arms', 'Leg', 'State'];

    this.snipForm.valueChanges.subscribe(values => {
      let total = 0;

      fields.forEach(field => {
        const value = parseInt(values[field], 10);
        total += isNaN(value) ? 0 : value;
      });

      this.snipForm.patchValue({
        TotalScore: total.toString(),
        ScoreDesc: this.getScoreDescription(total)
      }, { emitEvent: false }); // prevent recursive trigger
    });
  }

  getScoreDescription(score: number): string {
    if (score >= 0 && score <= 2) {
      return 'Mild to no pain';
    } else if (score >= 3 && score <= 4) {
      return 'Mild to moderate pain';
    } else {
      return 'Severe pain';
    }
  }

  getFormData() {
    return this.snipForm.value;
  }

  public getNIPSDocument(dockey: string) {
    this.subscription = this.emergencyService.fetchNewbornScaleDoc(dockey).subscribe({
      next: (data: any) => {
        this.snipForm.patchValue(data?.d?.results[0])
      },
      error: (err: any) => {
        console.error('Error fetching NIPS (Newborn to 1 Year):', err);
        this.sharedService.waringSwallModel(`GET Error at NIPS (Newborn to 1 Year) : ${err}`);
      },
      complete: () => {
        console.log('NIPS (Newborn to 1 Year) Data retrieval complete');
      }
    });
  }


  createNIPSDocument(docStatus?: any, action?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let formData = this.snipForm.value;
      formData.DocStatus = docStatus;
       formData.Orgdo = this.storageService.patientData.deptOrgUnit;
      formData.AttendPhy = this.storageService.getUserProfile().Gpart;
      let payload = {
        d: formData
      };
      this.subscription = this.emergencyService.saveNewBornDoc(payload).subscribe({
        next: (data: any) => {

        },
        error: (err: any) => {
          this.sharedService.waringSwallModel(`POST Error at NIPS (Newborn to 1 Year) : ${err}`);
        },
        complete: () => {
          resolve(true);
          this.sharedService.successSwallModel('NIPS (Newborn to 1 Year) created successfully');
        }
      });
    });
  }

}
