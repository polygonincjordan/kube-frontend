import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-scales-face-pain',
  templateUrl: './scales-face-pain.component.html',
  styleUrls: ['./scales-face-pain.component.scss'],
})
export class ScalesFacePainComponent implements OnInit {
  @ViewChild('scalesFacePainModal', { static: true }) scalesFacePainModal: TemplateRef<any>;
  @Output() facePainValue = new EventEmitter<any>();

  modalRef: BsModalRef;
  totalScore: any = '0';
  facePainDescription: string = 'No hurt';
  facePainScaleData: any;
  comment: string;
  dockeyValue: any;

  constructor(
    private modalService: BsModalService,
    private storageService: StorageService,
    private emergencyService: EmergencyService,
    private sharedService: SharedService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {}

  openModalForFacePain(glowgosValue: any) {
    this.dockeyValue = '';
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-xl glasgow-scale-size',
      ignoreBackdropClick: true
    };
    this.modalRef = this.modalService.show(this.scalesFacePainModal, config);
    this.totalScore = '0';
    this.facePainDescription = 'No hurt';
    this.dockeyValue = glowgosValue ? glowgosValue : null;
    this.comment = '';
    if (glowgosValue) {
      this.getFacePainDetail(glowgosValue);
    }
  }

  getFacePainDetail(dockey: string) {
    // let dockey = 'SCA000000000000001000002936500000';
    this.emergencyService.getFacepainScaleData(dockey).subscribe(
      (_success: any) => {
        this.facePainScaleData = _success?.d;
        this.totalScore = this.facePainScaleData.FacesPain;
        this.comment = this.facePainScaleData.NrsComments;
        this.facePainDescription = this.getString();
      },
      (_error: any) => {
        this.sharedService.errorSwallModel(_error?.error?.error?.message?.value);
        this.closeFacePainModel();
      }
    );
  }

  getString() {
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

  setFacePainValue(value: any, description: string) {
    if(this.dockeyValue) return;
    this.totalScore = value.toString();
    this.facePainDescription = description;
  }

  closeFacePainModel() {
    this.modalRef?.hide();
  }

  selectRadio(id: string, value: number, description: string) {
    if(this.dockeyValue) return;
    const radioBtn = document.getElementById(id) as HTMLInputElement;
    if (radioBtn) {
      radioBtn.checked = true;
    }
    this.setFacePainValue(value, description);
  }

  createFacePain() {
    let payload = {
      d: {
        Dockey: '',
        Einri: this.storageService.einri,
        Patnr: this.storageService.patnr,
        Falnr: this.storageService.falnr,
        Orgdo: 'EMEMDAMC',
        FacesPain: this.totalScore,
        NrsComments: this.comment,
        AttendPhy: this.storageService.getGpart(),
        DocStatus: '1',
      },
    };

    this.emergencyService.createFacePainData(payload).subscribe(
      (_success: any) => {
        let currentTime = this.datePipe.transform(new Date(), 'HH:mm:ss');
        let formValue = {
          totalScore: this.totalScore,
          description: this.facePainDescription,
          dockey: _success?.d.Dockey,
          time: currentTime,
          date: new Date()
        }
        this.facePainValue.next(formValue);
        this.sharedService.successSwallModel('Face pain scale created successfully');
        this.closeFacePainModel();
      },
      (_error: any) => {}
    );
  }
}
