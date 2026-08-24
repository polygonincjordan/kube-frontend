import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-numeric-rating-scale-popup',
  templateUrl: './numeric-rating-scale-popup.component.html',
  styleUrls: ['./numeric-rating-scale-popup.component.scss']
})
export class NumericRatingScalePopupComponent implements OnInit {

  @ViewChild('scalesNumericRating', { static: true })
  scalesNumericRating: TemplateRef<any>;
  @Output() numericValue = new EventEmitter<any>();

  public modalRef: BsModalRef;

  public painScoreList = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
  ];

  public numericRatingForm: FormGroup;
  userProfile: any;
  dockeyValue: any;

  constructor(
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private storageService: StorageService,
    private datePipe: DatePipe,
    private emergencyService: EmergencyService,
    private sharedService: SharedService
  ) { }

  ngOnInit(): void { }

  openModalForNumericRating(dockKey?) {
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-xl glasgow-scale-size',
      ignoreBackdropClick: true
    };
    this.modalRef = this.modalService.show(this.scalesNumericRating, config);
    this.userProfile = this.storageService.getUserProfile();
    this.dockeyValue = dockKey;
    if (dockKey) this.getNumericRatingDetail(dockKey);
    this.initForm();
  }

  getNumericRatingDetail(dockey: string) {
    // let dockey = 'SCA000000000000001000002936900000';
    this.emergencyService.getNumericRatingDetail(dockey).subscribe(
      (_success: any) => {
        this.numericRatingForm.patchValue({
          AttendPhy: _success?.d.AttendPhy,
          Dockey: _success?.d.Dockey,
          Einri: _success?.d.Einri,
          Falnr: _success?.d.Falnr,
          Lfdnr: _success?.d.Lfdnr,
          NrsComments: _success?.d.NrsComments,
          NrsPainScore: _success?.d.NrsPainScore,
          Orgdo: _success?.d.Orgdo,
          Patnr: _success?.d.Patnr,
        });
        this.selectPainValue(_success?.d.NrsPainScore);
      },
      (_error: any) => {
        this.sharedService.errorSwallModel(_error?.error?.error?.message?.value);
        this.closeModel();
      }
    );
  }

  initForm() {
    let currentTime = this.datePipe.transform(new Date(), 'hh:mm:ss');
    this.numericRatingForm = this.formBuilder.group({
      Dockey: '',
      Einri: this.storageService.einri,
      Patnr: this.storageService.patnr,
      Falnr: this.storageService.falnr,
      Lfdnr: this.storageService.lfdnr,
      Orgdo: 'EMEMDAMC',
      name: '',
      date: new Date(),
      time: currentTime,
      realized: this.userProfile.Gpart,
      realizedDescription: this.userProfile.GpartName,
      totalScore: '',
      description: '',
      NrsPainScore: '',
      NrsComments: '',
      AttendPhy: this.storageService.getGpart(),
      DocStatus: '1',
    });
  }

  selectPainValue(event: any) {
    if (event == '0') {
      this.patchTotalScore('', 'No pain');
    } else if (event == '1') {
      this.patchTotalScore('01', 'Slight pain');
    } else if (event == '2') {
      this.patchTotalScore('02', 'Slight pain');
    } else if (event == '3') {
      this.patchTotalScore('03', 'Slight pain');
    } else if (event == '4') {
      this.patchTotalScore('04', 'Mild pain');
    } else if (event == '5') {
      this.patchTotalScore('05', 'Moderate pain');
    } else if (event == '6') {
      this.patchTotalScore('06', 'Moderate pain');
    } else if (event == '7') {
      this.patchTotalScore('07', 'Severe pain');
    } else if (event == '8') {
      this.patchTotalScore('08', 'Severe pain');
    } else if (event == '9') {
      this.patchTotalScore('09', 'Severe pain');
    } else if (event == '10') {
      this.patchTotalScore('10', 'Worst pain possible');
    }
  }

  patchTotalScore(value: any, description: string) {
    this.numericRatingForm.patchValue({
      totalScore: value,
      description: description,
    });
  }

  saveNumericData() {
    let payload = {
      d: {
        Dockey: this.numericRatingForm.value.Dockey,
        Einri: this.numericRatingForm.value.Einri,
        Patnr: this.numericRatingForm.value.Patnr,
        Falnr: this.numericRatingForm.value.Falnr,
        Lfdnr: this.numericRatingForm.value.Lfdnr,
        Orgdo: this.numericRatingForm.value.Orgdo,
        NrsPainScore: this.numericRatingForm.value.NrsPainScore,
        NrsComments: this.numericRatingForm.value.NrsComments,
        AttendPhy: this.numericRatingForm.value.AttendPhy,
        DocStatus: this.numericRatingForm.value.DocStatus,
      },
    };

    this.emergencyService
      .saveNumericRatingDetail(payload)
      .subscribe((res: any) => {
        let formValue = this.numericRatingForm.value;
        formValue['dockey'] = res?.d.Dockey;
        this.numericValue.next(formValue);
        this.sharedService.successSwallModel('Numeric rating scale(more than 8 years) created successfully');
        this.closeModel();
      });
  }

  closeModel() {
    this.modalRef.hide();
  }
}
