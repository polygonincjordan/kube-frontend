import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DataShareService } from '@services/data-share.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { ActionType } from '@services/interfaces/common.enum';
import { PatientDocumentationService } from '@services/patient-documentation.service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { MorseFallScaleComponent } from './morse-fall-scale/morse-fall-scale.component';
import { BradenScaleComponent } from './braden-scale/braden-scale.component';
import { GlosGowCommaScalePopupComponent } from './glos-gow-comma-scale/glos-gow-comma-scale-popup.component';
import { NumericRatingScalePopupComponent } from './numeric-rating-scale/numeric-rating-scale-popup.component';
import { SharedService } from '@services/shared.service';

@Component({
  selector: 'app-confusion-assessment-method',
  templateUrl: './confusion-assessment-method.component.html',
  styleUrls: ['./confusion-assessment-method.component.scss']
})
export class ConfusionAssessmentMethodComponent implements OnInit {

  @ViewChild('morseFallScale') morseFallScale: MorseFallScaleComponent;
  @ViewChild('bradenScaleTemp') bradenScaleTemp: BradenScaleComponent;
  @ViewChild('scalesGlosgow') scalesGlosgow: GlosGowCommaScalePopupComponent;
  @ViewChild('scalesNumericRating') scalesNumericRating: NumericRatingScalePopupComponent;
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

  noScaleAppicable: any;

  yesNoList = [
    {
      label: 'Yes',
      value: '0'
    },
    {
      label: 'No',
      value: '1'
    },
  ]
  public scalesList: any[] = [
    {
      ScaleType: 'Richmond Scale',
      LastScore: '',
      ScoreDesc: '',
      Datetimee: '',
      value: '1',
      Dockey: '',
    },
    {
      ScaleType: 'Ramsay Sedation Scale',
      LastScore: '',
      ScoreDesc: '',
      Datetimee: '',
      value: '2',
      Dockey: '',
    }
  ];

  morseFallScaleData;
  private actionTypeSubscription$: Subscription;
  modalRefScales: BsModalRef;
  toScaleArr: any[];
  selectedScales: any[] = [];


  constructor(private fb: FormBuilder, private patientDocService: PatientDocumentationService, private emergencyService: EmergencyService, private dataShareService: DataShareService, private storageService: StorageService,
    private modalService: BsModalService, private ePrescriptionService: EPrescriptionService, private sharedService: SharedService
  ) {
    // this.getDocData();
    this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe((data) => {
      if (data != null) {
        if (data.type == ActionType.Copy$ && data.isAllow == true && data.value) {
          this.getDocData();
        }
      }
    });
  }

  getDocData() {
    this.emergencyService.getMFSDoc(this.patientDocService.latestMorseFallScaleData?.Dockey).subscribe((data: any) => {
      if (data.d) {
        this.MorsefallForm.patchValue(data.d);
        this.calculateTotal();
      }
    }, (error) => {
      console.error(error)
    })
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
    })

    this.realized = this.storageService.getUserProfile().Gpart;
    this.realizedDescription = this.storageService.getUserProfile().GpartName;

    this.MorsefallForm.controls['AttendPhy'].patchValue(this.realized);

    this.calculateTotal();

  }

  getFormData() {
    return this.MorsefallForm.value;
  }

  calculateTotal() {
    const formValues = this.MorsefallForm.value;

    const scores = {
      HistoryFalls: { 'A': null, '1': 25, '0': 0 },
      SecondaryDiagnosis: { 'A': null, '1': 15, '0': 0 },
      AmbulatoryAid: { 'A': null, 'F': 30, 'C': 15, 'N': 0 },
      IvAccess: { 'A': null, '1': 20, '0': 0 },
      Gait: { 'A': null, 'I': 20, 'W': 10, 'N': 0 },
      MentalStatus: { 'A': null, 'F': 15, 'O': 0 }
    };

    Object.keys(scores).forEach(key => {
      const value = formValues[key];
      this['ch_mfs_' + key.toLowerCase()] = scores[key][value];
    });


    this.totalScore = Object.keys(scores).reduce((acc, key) => acc + (scores[key][formValues[key]] || 0), 0);

    if (this.totalScore <= 24) {
      this.description = 'Low risk. Basic nursing care.';
    } else if (this.totalScore < 45) {
      this.description = 'Moderate risk. Standard fall prevention indicators.';
    }
    else if (!this.totalScore || this.totalScore == undefined) {
      this.totalScore = 0
      this.description = 'Low risk. Basic nursing care.';
    } else {
      this.description = 'High risk. High risk fall prevention indicators.';
    }
  }

  isDockeyAvailable(): boolean {
    return this.scalesList.some(scale => scale.Dockey && scale.Dockey.trim() !== '');
  }

  openModalForScales(template: TemplateRef<any>) {
    const config: ModalOptions = {
      class:
        'modal-dialog modal-dialog-centered medication-order-case modal-xl',
    };
    this.modalRefScales = this.modalService.show(template, config);
    this.loadScalesData();
    // this.medicationImportDrugArray=[];
  }

  loadScalesData() {
    // this.selectedScales = [];
    this.toScaleArr = [];
    let patnr = this.ePrescriptionService.parameters.patnr;
    patnr = patnr.padStart(10, '0');
    const scalesOrders: Subscription = this.ePrescriptionService.loadData(`e-prescription/ScalesList?Patnr=${patnr}`, false, false, false, false).subscribe((resp: any) => {
      console.log(resp)
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        //this.configurationData = resp.body.d.results;
        // this.toScaleArr = resp.body.d.results;
        if (resp.body?.d?.results.length) {
          let requiredScales = ["Glasgow Coma Scale", "Morse Fall Scale (MFS)", "Braden scale for predicting pressure ulcers"];
          this.toScaleArr = resp.body.d.results.filter(scale => requiredScales.includes(scale.Scaletype)).map(scale => ({ ...scale, isSelected: false }));
        }
        // this.medicationImportDrugArray=[];
        //http://http://192.168.193.9:6051:8000/sap/opu/odata/sap/ZN_TRANSFER_ASSES_SRV/PatScalesSet?$filter=Patnr
      }
      //   this.filterEvents();
    }, () => { scalesOrders.unsubscribe(); });
  }

  collectAllScalesData(event: any) {
    if (event.target.checked) {
      this.selectedScales = (Object.assign([], this.toScaleArr));
    } else {
      this.selectedScales = [];
    }
  }

  isCheckedScale(item: any): boolean {
    return this.selectedScales.some(x => x.Scaletype == item.Scaletype);
  }

  collectScalesIData(event, item, i) {
    if (event.target.checked) {
      this.toScaleArr[i].isSelected = true;
      this.selectedScales.push(item);
    } else {
      this.toScaleArr[i].isSelected = false;
      const indexOf = this.selectedScales.findIndex(x => x.Scaletype == item.Scaletype);
      if (indexOf !== -1)
        this.selectedScales.splice(indexOf, 1);
    }
  }


  public scaleStoreInTable(event: any, scaleType: string) {
    if (scaleType == 'morseFall') {
      this.scalesList[1].LastScore = event?.totalScore;
      this.scalesList[1].ScoreDesc = event?.description;
      this.scalesList[1].Dockey = event?.dockey;
      this.scalesList[1].Datetimee = event?.date;
    } else if (scaleType == 'braden') {
      this.scalesList[2].LastScore = event?.totalScore;
      this.scalesList[2].ScoreDesc = event?.description;
      this.scalesList[2].Dockey = event?.dockey;
      this.scalesList[2].Datetimee = event?.date;
    } else if (scaleType == 'glosgow') {
      this.scalesList[0].LastScore = event?.totalScore;
      this.scalesList[0].ScoreDesc = event?.description;
      this.scalesList[0].Dockey = event?.dockey;
      this.scalesList[0].Datetimee = event?.date;
    }
  }

  removeScale(index: number) {
    this.scalesList[index].LastScore = "";
    this.scalesList[index].ScoreDesc = "";
    this.scalesList[index].Dockey = "";
    this.scalesList[index].Datetimee = "";
  }

  public openScaleModel(item: any) {
    if (this.noScaleAppicable) return;
    if (item.Dockey) {
      this.scalesEditConfirmationMsg(item);
    } else {
      this.openSelectedModalScale(item);
    }
  }

  private scalesEditConfirmationMsg(item: { value: string }) {
    Swal.fire({
      text: 'Are you sure you want to edit scale',
      icon: 'warning',
      confirmButtonText: 'Yes',
      showCancelButton: true,
      cancelButtonText: 'No',
      customClass: 'myalertpopup',
    }).then((res) => {
      if (res.isConfirmed) {
        this.openSelectedModalScale(item);
      }
    });
  }

  openSelectedModalScale(item) {
    if (item.value == '1') {
      this.scalesGlosgow.openModalForGlosgow('');
    } else if (item.value == '2') {
      this.morseFallScale.openMorseFallScaleModal('');
    } else if (item.value == '3') {
      this.bradenScaleTemp.openBradenScaleModal('');
    }
  }

  public viewGlosgowModel(item) {
    if (this.noScaleAppicable) return;
    if (item.value == '1') {
      if (item.Dockey) {
        this.scalesGlosgow.openModalForGlosgow(item.Dockey);
      } else {
        this.sharedService.waringSwallModel('No data found');
      }
    }
  }



  scalesImport() {

    this.selectedScales.forEach((element) => {
      this.scalesList.forEach((res: any) => {
        if (element.Scaletype == res.ScaleType && element.Score) {
          res.Datetimee = element.DateTime,
            res.Dockey = element.Dockey,
            res.ScoreDesc = element.ScoreDesc,
            res.LastScore = element.Score,
            res.ScaleType = element.Scaletype
        }
      })
    })
    // this.selectedScales.forEach(element => {
    //   console.log(element)
    //   this.scalesArray = this.scalesArray.concat({
    //     "Dockey": "",
    //     "ScaleType": element.Scaletype ,
    //     "ScoreDesc": element.ScoreDesc ,
    //     "Datetimee": element.DateTime,
    //     "LastScore": element.Score,
    //   });
    // });
    this.modalRefScales.hide();
  }


}
