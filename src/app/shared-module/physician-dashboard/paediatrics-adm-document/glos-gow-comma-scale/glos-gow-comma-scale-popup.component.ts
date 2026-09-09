import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { DataShareService } from '@services/data-share.service';
import { GlasgowComaScaleType } from '@services/e-kardex/interfaces/documents.interface';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { ActionType, WordType } from '@services/interfaces/common.enum';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-glos-gow-comma-scale-popup',
  templateUrl: './glos-gow-comma-scale-popup.component.html',
  styleUrls: ['./glos-gow-comma-scale-popup.component.scss']
})
export class GlosGowCommaScalePopupComponent implements OnInit {

  @ViewChild('scalesGlosgowModal', { static: true }) scalesGlosgowModal: TemplateRef<any>;
  @Output() scaleStoreValue = new EventEmitter<any>();
  modalRef: BsModalRef;
  @Input() isReadOnly: boolean = false;

  public eyeOpeningScore: any = 'C';
  public moterScore: any = '1';
  public verbalScore: any = 'T';

  public totalProjectScore: number = 0;
  public totalScoreDescription: string = "";
  public comments: any;
  public dockeyValue: any = null;

  public EyesOpeningResponse: GlasgowComaScaleType[] = [
    { id: 1, keyId: 'eyeClosed', text: 'Eyes Closed', value: 'C', isDisable: false },
    { id: 2, keyId: 'none', text: 'None', value: '1', isDisable: false },
    { id: 3, keyId: 'toPain', text: 'To Pain', value: '2', isDisable: false },
    { id: 4, keyId: 'verbalStimuli', text: 'To verbal stimuli', value: '3', isDisable: false },
    { id: 5, keyId: 'spontaneous', text: 'Spontaneous', value: '4', isDisable: false }
  ];

  public MotorResponse: GlasgowComaScaleType[] = [
    { id: 1, keyId: 'none', text: 'None', value: '1', isDisable: false },
    { id: 2, keyId: 'ExtensorToPain', text: 'Extensor to pain', value: '2', isDisable: false },
    { id: 3, keyId: 'FlexorToPain', text: 'Flexor to pain', value: '3', isDisable: false },
    { id: 4, keyId: 'WithdrawsToPain', text: 'Withdraws to pain', value: '4', isDisable: false },
    { id: 5, keyId: 'LocalizePain', text: 'Localize pain', value: '5', isDisable: false },
    { id: 6, keyId: 'FollowCommands', text: 'Follow commands', value: '6', isDisable: false }
  ];

  public VerbalResponse: GlasgowComaScaleType[] = [
    { id: 1, keyId: 'VT', text: 'VT', value: 'T', isDisable: false },
    { id: 2, keyId: 'none', text: 'None', value: '1', isDisable: false },
    { id: 3, keyId: 'IncomprehensibleSound', text: 'Incomprehensible sound', value: '2', isDisable: false },
    { id: 4, keyId: 'InappropriateWords', text: 'Inappropriate words', value: '3', isDisable: false },
    { id: 5, keyId: 'Confused', text: 'Confused', value: '4', isDisable: false },
    { id: 6, keyId: 'Oriented', text: 'Oriented', value: '5', isDisable: false }
  ];
  private subscription: Subscription;
  private actionTypeSubscription$: Subscription;

  constructor(
    private emergencyService: EmergencyService,
    private modalService: BsModalService,
    private dataShareService: DataShareService,
    private storageService: StorageService,
    private sharedService: SharedService,
    private datePipe: DatePipe,
  ) {
    this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe((data) => {
      if (data != null) {
        if (data.type == ActionType.Update$ && data.isAllow == true && data.value) {
          if (data.value.type == WordType.EditGGCS && data.value.docKey != '') {
            this.totalScoreCalc();
            this.dockeyValue = data.value.docKey ? data.value.docKey : null;
            if (this.dockeyValue) {
              this.getGlosgowDetail(data.value.docKey);
            }
          }
        }
        if (data.type == ActionType.Copy$ && data.isAllow == true && data.value) {
          if (data.value.type == WordType.CopyGGCS && data.value.docKey != '') {
            this.totalScoreCalc();
            this.dockeyValue = data.value.docKey ? data.value.docKey : null;
            if (this.dockeyValue) {
              this.getGlosgowDetail(data.value.docKey);
            }
          }
        }
      }
    });

  }

  public ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.actionTypeSubscription$) {
      this.actionTypeSubscription$.unsubscribe();
      this.dataShareService.sendActionType(null);
    }
  }

  public ngOnInit(): void {
    this.initialize();
  }


  openModalForGlosgow(dockKey) {
    this.dockeyValue = null;
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-xl glasgow-scale-size',
      ignoreBackdropClick: true
    };
    this.modalRef = this.modalService.show(this.scalesGlosgowModal, config);
    this.eyeOpeningScore = 'C';
    this.moterScore = '1';
    this.verbalScore = 'T';
    this.comments = '';
    this.dockeyValue = dockKey ? dockKey : null;
    this.totalScoreCalc();
    if (this.dockeyValue) {
      this.getGlosgowDetail(dockKey);
    }
  }

  private initialize() {
    this.eyeOpeningScore = 'C';
    this.moterScore = '1';
    this.verbalScore = 'T';
    this.comments = '';
    this.totalScoreCalc();
  }

  public getGlosgowDetail(dockey: string) {
    // Subscribe using an object to define handlers
    this.subscription = this.emergencyService.getGlosgowScaleData(dockey).subscribe({
      next: (data: any) => {
        // Handle successful data retrieval
        this.eyeOpeningScore = data?.d.EyeOpeningResponse;
        this.moterScore = data?.d.MotorResponse;
        this.verbalScore = data?.d.VerbalResponse;
        this.comments = data?.d.NrsComments;
        this.totalScoreCalc();
      },
      error: (err: any) => {
        // Handle errors if the request fails
        console.error('Error fetching Glasgow Scale Data:', err);
        this.sharedService.waringSwallModel(`GET Error at glosgow : ${err}`);
      },
      complete: () => {
        // Handle completion (optional), invoked when the observable completes
        console.log('Glasgow Scale Data retrieval complete');
      }
    });
  }

  public selectEyeOpeningRadio(event: any, number: any) {
    this.eyeOpeningScore = number;
    this.totalScoreCalc();
  }

  public selectMoterRadio(event: any, number: any) {
    this.moterScore = number;
    this.totalScoreCalc();
  }

  public selectVerbalRadio(event: any, number: any) {
    this.verbalScore = number;
    this.totalScoreCalc();
  }

  public totalScoreCalc() {
    this.totalProjectScore = parseInt(this.moterScore);
    if (this.eyeOpeningScore != 'C') {
      this.totalProjectScore =
        this.totalProjectScore + parseInt(this.eyeOpeningScore);
    }
    if (this.verbalScore != 'T') {
      this.totalProjectScore =
        this.totalProjectScore + parseInt(this.verbalScore);
    }
    this.scoreLabel();
  }

  public scoreLabel() {
    if (this.verbalScore == 'T') {
      this.totalScoreDescription = `${this.conditionalScoreLabel()} E:${this.eyeOpeningScore}/M:${this.moterScore}/V:VT`;
    } else {
      this.totalScoreDescription = `${this.conditionalScoreLabel()} E:${this.eyeOpeningScore}/M:${this.moterScore}/V:${this.verbalScore}`;
    }
  }

  public conditionalScoreLabel() {
    if (this.totalProjectScore < 4) {
      return 'Deep coma or brain death';
    } else if (this.totalProjectScore < 8) {
      return 'Coma';
    } else if (this.totalProjectScore == 8) {
      return 'Servere head injury';
    } else if (this.totalProjectScore <= 12) {
      return 'Moderate head injury';
    } else if (this.totalProjectScore < 15) {
      return 'Minor head injury';
    } else if (this.totalProjectScore == 15) {
      return 'Normal';
    }
  }


  createGlosgowData(): Promise<any> {
    return new Promise((resolve, reject) => {
      let payload = {
        d: {
          Dockey: this.dockeyValue != null ? this.dockeyValue : '',
          Einri: this.storageService.einri,
          Patnr: this.storageService.patnr,
          Falnr: this.storageService.falnr,
          Lfdnr: this.storageService.lfdnr,
          Orgdo: localStorage.getItem('initOrg'),
          EyeOpeningResponse: this.eyeOpeningScore,
          MotorResponse: this.moterScore,
          VerbalResponse: this.verbalScore,
          NrsComments: this.comments,
          AttendPhy: this.storageService.getGpart(),
          DocStatus: '1',
        },
      };
      this.subscription = this.emergencyService.createGlosgowData(payload).subscribe({
        next: (data: any) => {

          let currentTime = this.datePipe.transform(new Date(), 'HH:mm:ss');
          let formValue = {
            totalScore: this.totalProjectScore,
            description: this.totalScoreDescription,
            dockey: data?.d.Dockey,
            time: currentTime,
            date: this.dateConvertToString(new Date())
          }
          this.scaleStoreValue.next(formValue);

        },
        error: (err: any) => {

          this.sharedService.waringSwallModel(`POST Error at glos gow coma scale : ${err}`);
        },
        complete: () => {
          this.modalRef?.hide();

          resolve(true);
          this.sharedService.successSwallModel('Glas gow coma scale created successfully');
        }
      });
    });
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

  copyGlosgowData(): Promise<any> {
    return new Promise((resolve, reject) => {
      let payload = {
        d: {
          Dockey: this.dockeyValue != null ? this.dockeyValue : '',
          Einri: this.storageService.einri,
          Patnr: this.storageService.patnr,
          Falnr: this.storageService.falnr,
          Lfdnr: this.storageService.lfdnr,
          Orgdo: 'EMEMDAMC',
          EyeOpeningResponse: this.eyeOpeningScore,
          MotorResponse: this.moterScore,
          VerbalResponse: this.verbalScore,
          NrsComments: this.comments,
          AttendPhy: this.storageService.getGpart(),
          DocStatus: '3',
        },
      };
      this.subscription = this.emergencyService.copyGlosgowData(payload).subscribe({
        next: (data: any) => {

          let currentTime = this.datePipe.transform(new Date(), 'HH:mm:ss');
          let formValue = {
            totalScore: this.totalProjectScore,
            description: this.totalScoreDescription,
            dockey: data?.d.Dockey,
            time: currentTime,
            date: new Date()
          }

        },
        error: (err: any) => {

          this.sharedService.waringSwallModel(`Error ${err}`);
          this.sharedService.waringSwallModel(`PUT Error at glos gow coma scale: ${err}`);
        },
        complete: () => {

          resolve(true);
          this.sharedService.successSwallModel('Glas gow coma scale copyied successfully');
        }
      });
    });
  }

  closeGlosgowModel() {
    this.modalRef.hide();
  }
}
