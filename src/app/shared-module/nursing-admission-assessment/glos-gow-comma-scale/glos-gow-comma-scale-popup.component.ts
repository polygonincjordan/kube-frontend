import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-glos-gow-comma-scale-popup',
  templateUrl: './glos-gow-comma-scale-popup.component.html',
  styleUrls: ['./glos-gow-comma-scale-popup.component.scss']
})
export class GlosGowCommaScalePopupComponent implements OnInit {

  @ViewChild('scalesGlosgowModal', { static: true }) scalesGlosgowModal: TemplateRef<any>;
  @Output() glasgowValue = new EventEmitter<any>();

  modalRef: BsModalRef;
  eyeOpeningScore: any = 'C';
  moterScore: any = '1';
  verbalScore: any = 'T';
  totalProjectScore: number = 0;
  totalScoreDescription: string;
  comments: any;
  dockeyValue: any;

  constructor(
    private modalService: BsModalService,
    private storageService: StorageService,
    private emergencyService: EmergencyService,
    private sharedService: SharedService,
    private datePipe: DatePipe,

  ) { }

  ngOnInit(): void { }

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

  getGlosgowDetail(dockey: string) {
    this.emergencyService.getGlosgowScaleData(dockey).subscribe(
      (_success: any) => {
        this.eyeOpeningScore = _success?.d.EyeOpeningResponse;
        this.moterScore = _success?.d.MotorResponse;
        this.verbalScore = _success?.d.VerbalResponse;
        this.comments = _success?.d.NrsComments;
        this.totalScoreCalc();
      },
      (_error: any) => {
        this.sharedService.errorSwallModel(_error?.error?.error?.message?.value);
        this.closeGlosgowModel();
      }
    );
  }

  selectEyeOpeningRadio(event: any, number: any) {
    this.eyeOpeningScore = number;
    this.totalScoreCalc();
  }

  selectMoterRadio(event: any, number: any) {
    this.moterScore = number;
    this.totalScoreCalc();
  }

  selectVerbalRadio(event: any, number: any) {
    this.verbalScore = number;
    this.totalScoreCalc();
  }

  totalScoreCalc() {
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

  scoreLabel() {
    if (this.verbalScore == 'T') {
      this.totalScoreDescription = `${this.conditionalScoreLabel()} E:${this.eyeOpeningScore
        }/M:${this.moterScore}/V:VT`;
    } else {
      this.totalScoreDescription = `${this.conditionalScoreLabel()} E:${this.eyeOpeningScore
        }/M:${this.moterScore}/V:${this.verbalScore}`;
    }
  }

  conditionalScoreLabel() {
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

  closeGlosgowModel() {
    this.modalRef.hide();
  }

  createGlosgowData() {
    let payload = {
      d: {
        Dockey: '',
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
        DocStatus: '1',
      },
    };

    this.emergencyService.createGlosgowData(payload).subscribe(
      (_success: any) => {
        this.sharedService.successSwallModel('Glasgow scale created successfully');
        let currentTime = this.datePipe.transform(new Date(), 'HH:mm:ss');
        let formValue = {
          totalScore: this.totalProjectScore,
          description: this.totalScoreDescription,
          dockey: _success?.d.Dockey,
          time: currentTime,
          date: new Date()
        }
        this.glasgowValue.next(formValue);
        this.closeGlosgowModel();
      },
      (_error: any) => { }
    );
  }

}
