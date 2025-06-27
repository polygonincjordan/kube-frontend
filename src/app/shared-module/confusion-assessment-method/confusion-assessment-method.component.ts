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
import { ActivatedRoute } from '@angular/router';

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
  confusionForm: FormGroup<any>;
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

  private subscription: Subscription;
  private actionTypeSubscription$: Subscription;
  modalRefScales: BsModalRef;
  toScaleArr: any[];
  selectedScales: any[] = [];
  paramsObject: any;
  encounterId: any;
  docKey: any;

  constructor(private fb: FormBuilder, private emergencyService: EmergencyService, private dataShareService: DataShareService, private storageService: StorageService,
    private modalService: BsModalService, private ePrescriptionService: EPrescriptionService, private sharedService: SharedService, private _route: ActivatedRoute
  ) {

    this._route.queryParams.subscribe((params) => {
      this.paramsObject = params;
      if (this.paramsObject.lfdnr) {
        this.encounterId = this.paramsObject.einri + this.paramsObject.falnr + this.paramsObject.lfdnr;
      }
      this.storageService.setEinri(this.paramsObject.einri);
      this.storageService.setFalnr(this.paramsObject.falnr);
      this.storageService.setLfdnr(this.paramsObject.lfdnr);
      this.storageService.setPatnr(this.paramsObject.patnr);
    });

    this.initForm();
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
    this.emergencyService.fetchConfusionDocument(this.docKey).subscribe((data: any) => {
      if (data.d) {
        this.confusionForm.patchValue(data?.d?.results[0]);
      }
    }, (error) => {
      console.error(error)
    })
  }

  ngOnInit(): void {
  }

  initForm() {
    this.confusionForm = this.fb.group({
      Dockey: [''],
      Dtid: ['ZSCA_CAM'],
      Einri: this.paramsObject.einri,
      Patnr: this.paramsObject.patnr,
      Falnr: this.paramsObject.falnr,
      Lfdnr: this.paramsObject.lfdnr,
      Orgdo: [this.storageService.patientData.deptOrgUnit],
      AttendPhy: [this.storageService.getUserProfile().Gpart],
      DocStatus: [''],
      F1IsThePatient: [false],
      F1HasThePatient: [false],
      F1Present: [false],
      F2IfNumber: [false],
      F2Present: [false],
      F3Present: [false],
      F41WillStone: [''],
      F42AreThere: [''],
      F43Does1Pound: [''],
      F44CanYou: [''],
      F4IfCombined: [false],
      F4Present: [false],
      DeliriumPresent: [false],
      DeliriumAbsent: [false],
      Comments: [''],
    });
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

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.actionTypeSubscription$) {
      this.actionTypeSubscription$.unsubscribe();
      this.dataShareService.sendActionType(null);
    }
  }

  createNursingAssessmentDoc(docStatus: any, actiontype?: string) {
    return new Promise((resolve, reject) => {
      // this.isFormValidError = true;
      // paylaod.TOSCALE = this.scalesList.filter((res: any) => {
      //   delete res.value;
      //   res.LastScore = res?.LastScore.toString();
      //   if (res.LastScore) {
      //     return res;
      //   }
      // });
      let paylaod = this.confusionForm.value;
      paylaod.DocStatus = docStatus;
      paylaod['TOSCALE'] = [];
      console.log(paylaod);
      // return
      // paylaod.Orgdo = this.storageService?.patientData?.deptOrgUnit;
      this.subscription = this.emergencyService
        .saveConfusionDocument(paylaod)
        .subscribe({
          next: (data: any) => { },
          error: (err: any) => {
            this.sharedService.waringSwallModel(`Error ${err}`);
            this.sharedService.waringSwallModel(
              `PUT Error at Confusion Assessment Method for ICU PMD Doc : ${err}`
            );
          },
          complete: () => {
            resolve(true);
            if (actiontype === 'edit') {
              this.sharedService.successSwallModel(
                'Confusion Assessment Method for ICU PMD Doc updated successfully'
              );
            } else {
              this.sharedService.successSwallModel(
                'Confusion Assessment Method for ICU PMD Doc created successfully'
              );
            }
          },
        });
    });
  }


}
