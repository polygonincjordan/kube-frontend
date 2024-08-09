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
  @Output() scaleStoreValue = new EventEmitter<any>();

  modalRef: BsModalRef;
  eyeOpeningScore: any = 'C';
  moterScore: any = '1';
  verbalScore: any = 'T';
  totalProjectScore: number = 0;
  totalScoreDescription: string;
  comments: any;
  dockeyValue: any;

  eyeOpeningResponse = '';
  motorResponse = '';
  verbalResponse = '';

  result: { totalScore: number, description: string, detailedDescription: string };

  eyeOpeningOptions = [
    { value: 'C', label: 'Eyes closed' },
    { value: 'N', label: 'None' },
    { value: 'P', label: 'To pain' },
    { value: 'V', label: 'To verbal stimuli' },
    { value: 'S', label: 'Spontaneous' }
  ];

  motorOptions = [
    { value: 'N', label: 'None' },
    { value: 'E', label: 'Extensor to pain' },
    { value: 'F', label: 'Flexor to pain' },
    { value: 'W', label: 'Withdraws to pain' },
    { value: 'L', label: 'Localize pain' },
    { value: 'C', label: 'Follow commands' }
  ];

  verbalOptions = [
    { value: 'T', label: 'VT' },
    { value: 'N', label: 'None' },
    { value: 'S', label: 'Incomprehensible sound' },
    { value: 'W', label: 'Inappropriate words' },
    { value: 'C', label: 'Confused' },
    { value: 'O', label: 'Oriented' }
  ];
  verbalScoreLabel: string;
  moterScoreLabel: string;
  eyeOpeningLabel: string;

  
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

  calculate() {
    this.result = this.calculateGCS(this.eyeOpeningResponse, this.motorResponse, this.verbalResponse);
  }

  getEyeOpeningScore(response: string): number {
    const eyeOpeningScores = {
      'N': 1,
      'P': 2,
      'V': 3,
      'S': 4,
      'C': 0 
    };
    return eyeOpeningScores[response] || 0;
  }
  
  getMotorScore(response: string): number {
    const motorScores = {
      'N': 1,
      'E': 2,
      'F': 3,
      'W': 4,
      'L': 5,
      'C': 6
    };
    return motorScores[response] || 0;
  }
  
  getVerbalScore(response: string): number {
    const verbalScores = {
      'N': 1,
      'S': 2,
      'W': 3,
      'C': 4,
      'O': 5,
      'T': 0 // 'T' is a special case and doesn't contribute directly to the score
    };
    return verbalScores[response] || 0;
  }

  calculateGCS(eyeOpeningResponse: string, motorResponse: string, verbalResponse: string): { totalScore: number, description: string, detailedDescription: string } {
    const eyeScore = this.getEyeOpeningScore(eyeOpeningResponse);
    const motorScore = this.getMotorScore(motorResponse);
    const verbalScore = this.getVerbalScore(verbalResponse);

    this.eyeOpeningLabel = eyeOpeningResponse
    this.moterScoreLabel = motorResponse
    this.verbalScoreLabel = verbalResponse

    this.eyeOpeningScore = eyeScore
    this.moterScore = motorScore
    this.verbalScore = verbalScore
  
    let totalScore = eyeScore + motorScore;
    if (verbalResponse !== 'T') {
      totalScore += verbalScore;
    }
  
    let description = '';
    if (totalScore < 4) {
      description = 'Deep coma or brain death';
    } else if (totalScore < 8) {
      description = 'Coma';
    } else if (totalScore === 8) {
      description = 'Severe head injury';
    } else if (totalScore <= 12) {
      description = 'Moderate head injury';
    } else if (totalScore < 15) {
      description = 'Minor head injury';
    } else if (totalScore === 15) {
      description = 'Normal';
    }
  
    let detailedDescription = '';
    if (verbalResponse === 'T') {
      detailedDescription = `E:${eyeScore}/M:${motorScore}/V:VT`;
    } else {
      detailedDescription = `E:${eyeScore}/M:${motorScore}/V:${verbalScore}`;
    }
    this.totalProjectScore = totalScore;
    this.totalScoreDescription = `${description} ${detailedDescription}`;
  
    return { totalScore, description, detailedDescription: `${description} ${detailedDescription}` };
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
        Orgdo: localStorage.getItem('initOrg'),
        EyeOpeningResponse: this.eyeOpeningLabel,
        MotorResponse: this.moterScoreLabel,
        VerbalResponse: this.verbalScoreLabel,
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
          date: this.dateConvertToString(new Date())
        }
        this.scaleStoreValue.next(formValue);
        this.closeGlosgowModel();
      },
      (_error: any) => { }
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
