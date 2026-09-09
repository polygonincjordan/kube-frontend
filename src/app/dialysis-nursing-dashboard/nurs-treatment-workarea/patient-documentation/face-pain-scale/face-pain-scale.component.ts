import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataShareService } from '@services/data-share.service';
import { FacePaingScaleType } from '@services/e-kardex/interfaces/documents.interface';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { ActionType, WordType } from '@services/interfaces/common.enum';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-face-pain-scale',
  templateUrl: './face-pain-scale.component.html',
  styleUrls: ['./face-pain-scale.component.scss']
})
export class FacePainScaleComponent implements OnInit, OnDestroy {


  public FacePainResponse: FacePaingScaleType[] = [
    { id: 1, keyId: 'Nohurt', text: 'No hurt', value: '0', image: 'assets/img/1-happy-face.png', isDisable: false },
    { id: 2, keyId: 'Hurtslittlebit', text: 'Hurts little bit', value: '2', image: 'assets/img/2-face-pain.png', isDisable: false },
    { id: 2, keyId: 'Hurtslittlemore', text: 'Hurts little more', value: '4', image: 'assets/img/3-face-pain.png', isDisable: false },
    { id: 2, keyId: 'Hurtsevenmore', text: 'Hurts even more', value: '6', image: 'assets/img/4-face-pain.png', isDisable: false },
    { id: 2, keyId: 'Hurtswholealot', text: 'Hurts whole alot', value: '8', image: 'assets/img/5-face-pain.png', isDisable: false },
    { id: 2, keyId: 'Hurtsworst', text: 'Hurts worst', value: '10', image: 'assets/img/6-face-pain.png', isDisable: false },
  ];
  public dockeyValue: any = null;
  public totalScore: any = '0';
  public facePainDescription: string = 'No hurt';
  public facePainScaleData: any;
  public comment: string;

  private subscription: Subscription;
  private actionTypeSubscription$: Subscription;

  constructor(
    private emergencyService: EmergencyService,
    private storageService: StorageService,
    private sharedService: SharedService,
    private dataShareService: DataShareService,
    private datePipe: DatePipe
  ) {
    this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe((data) => {
      if (data != null) {
        if (data.type == ActionType.Update$ && data.isAllow == true && data.value) {
          if (data.value.type == WordType.EditGGCS && data.value.docKey != '') {
            this.dockeyValue = data.value.docKey ? data.value.docKey : null;
            if (this.dockeyValue) {
              this.getFacePainDetail(data.value.docKey);
            }
          }
        }
        if(data.type == ActionType.Copy$ && data.isAllow == true && data.value){
          if (data.value.type == WordType.CopyFPS && data.value.docKey != '') {
            this.dockeyValue = data.value.docKey ? data.value.docKey : null;
            if (this.dockeyValue) {
              this.getFacePainDetail(data.value.docKey);
            }
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if(this.actionTypeSubscription$){
      this.actionTypeSubscription$.unsubscribe();
      this.dataShareService.sendActionType(null);
    }
  }

  ngOnInit(): void {

  }

  private initialize() {
    this.dockeyValue = '';
    this.totalScore = '0';
    this.facePainDescription = 'No hurt';
    this.comment = '';
  }

  public selectRadio(id: string, value: string, description: string) {
    if (this.dockeyValue) return;
    const radioBtn = document.getElementById(id) as HTMLInputElement;
    if (radioBtn) {
      radioBtn.checked = true;
    }
    this.setFacePainValue(value, description);
  }

  public getFacePainDetail(dockey: string) {
    // Subscribe using an object to define handlers
    this.subscription = this.emergencyService.getFacepainScaleData(dockey).subscribe({
      next: (data: any) => {
        // Handle successful data retrieval
        this.facePainScaleData = data?.d;
        this.totalScore = this.facePainScaleData.FacesPain;
        this.comment = this.facePainScaleData.NrsComments;
        this.facePainDescription = this.getString();
      },
      error: (err: any) => {
        // Handle errors if the request fails
        console.error('Error fetching Glasgow Scale Data:', err);
        this.sharedService.waringSwallModel(`GET Error at face pain scale : ${err}`);
      },
      complete: () => {
        // Handle completion (optional), invoked when the observable completes
        console.info('Face Pain Scale Data retrieval complete');
      }
    });
  }

  public getString() {
    if (this.totalScore == 0) {
      return 'No hurt';
    } else if (this.totalScore == 2) {
      return 'Hurts little bit';
    } else if (this.totalScore == 4) {
      return 'Hurts little more';
    } else if (this.totalScore == 6) {
      return 'Hurts even more';
    } else if (this.totalScore == 8) {
      return 'Hurts whole alot';
    } else if (this.totalScore == 10) {
      return 'Hurts worst';
    }
  }

  public setFacePainValue(value: any, description: string) {
    if (this.dockeyValue) return;
    this.totalScore = value;
    this.facePainDescription = description;
  }


  createFacePain(): Promise<any> {
    return new Promise((resolve, reject) => {
      let payload = {
        d: {
          Dockey: '',
          Einri: this.storageService.einri,
          Patnr: this.storageService.patnr,
          Falnr: this.storageService.falnr,
          Orgdo: localStorage.getItem('initOrg'),
          FacesPain: this.totalScore,
          NrsComments: this.comment,
          AttendPhy: this.storageService.getGpart(),
          DocStatus: '1',
        },
      };
      // Subscribe using an object to define handlers
      this.subscription = this.emergencyService.createFacePainData(payload).subscribe({
        next: (data: any) => {
          // Handle successful data retrieval
          let currentTime = this.datePipe.transform(new Date(), 'HH:mm:ss');
          let formValue = {
            totalScore: this.totalScore,
            description: this.facePainDescription,
            dockey: data?.d.Dockey,
            time: currentTime,
            date: new Date()
          }
          // this.facePainValue.next(formValue); // emit value if needed...
        },
        error: (err: any) => {
          // Handle errors if the request fails
          this.sharedService.waringSwallModel(`Error ${err}`);
          this.sharedService.waringSwallModel(`POST Error at facepain : ${err}`);
        },
        complete: () => {
          // Handle completion (optional), invoked when the observable completes
          this.sharedService.successSwallModel('Face pain scale created successfully');
        }
      });
    });
  }


  copyFacePain(): Promise<any> {
    return new Promise((resolve, reject) => {
      let payload = {
        d: {
          Dockey: '',
          Einri: this.storageService.einri,
          Patnr: this.storageService.patnr,
          Falnr: this.storageService.falnr,
          Orgdo: localStorage.getItem('initOrg'),
          FacesPain: this.totalScore,
          NrsComments: this.comment,
          AttendPhy: this.storageService.getGpart(),
          DocStatus: '3',
        },
      };
      // Subscribe using an object to define handlers
      this.subscription = this.emergencyService.copyFaceScaleSet(payload).subscribe({
        next: (data: any) => {
          // Handle successful data retrieval
          let currentTime = this.datePipe.transform(new Date(), 'HH:mm:ss');
          let formValue = {
            totalScore: this.totalScore,
            description: this.facePainDescription,
            dockey: data?.d.Dockey,
            time: currentTime,
            date: new Date()
          }
          // this.facePainValue.next(formValue); // emit value if needed...
        },
        error: (err: any) => {
          // Handle errors if the request fails
          this.sharedService.waringSwallModel(`PUT Error at Face pain scale : ${err}`);
        },
        complete: () => {
          // Handle completion (optional), invoked when the observable completes
          this.sharedService.successSwallModel('Face pain scale Copied successfully');
        }
      });
    });
  }

}
