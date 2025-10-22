import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { GlosGowCommaScalePopupComponent } from './glos-gow-comma-scale/glos-gow-comma-scale-popup.component';
import { MorseFallScaleComponent } from './morse-fall-scale/morse-fall-scale.component';
import { BradenScaleComponent } from './braden-scale/braden-scale.component';
import Swal from 'sweetalert2';
import { SharedService } from '@services/shared.service';

@Component({
  selector: 'app-icu-hours-flowsheet',
  templateUrl: './icu-hours-flowsheet.component.html',
  styleUrls: ['./icu-hours-flowsheet.component.scss']
})
export class IcuHoursFlowsheetComponent implements OnInit {
  public CurrentDateAndTime: Date = new Date();
  @ViewChild('scalesGlosgow') scalesGlosgow: GlosGowCommaScalePopupComponent;
  @ViewChild('morseFallScale') morseFallScale: MorseFallScaleComponent;
  @ViewChild('bradenScaleTemp') bradenScaleTemp: BradenScaleComponent;

  activeTab: string = '1'; // Default tab
  tabItems = [
    { label: 'Medical Devices', value: '1' },
    { label: 'Scales', value: '2' },
    { label: 'Significant Lab Results', value: '3' },
    { label: 'Restraints Monitoring', value: '4' },
    { label: 'Pressure Score Risk Assessment', value: '5' },
    { label: 'Wound Care', value: '6' },
    { label: 'Ventilator Settings', value: '7' },
    { label: 'Edema', value: '8' },
    { label: 'Intake/Output', value: '9' },
    { label: 'Physical Examination', value: '10' },
  ];

  public scalesList: any[] = [
    {
      ScaleType: 'Glasgow Coma Scale',
      LastScore: '',
      ScoreDesc: '',
      Datetimee: '',
      value: '1',
      Dockey: '',
    },
    {
      ScaleType: 'Fall Risk Assessment',
      LastScore: '',
      ScoreDesc: '',
      Datetimee: '',
      value: '2',
      Dockey: '',
    },
    {
      ScaleType: '',
      LastScore: '',
      ScoreDesc: '',
      Datetimee: '',
      value: '3',
      Dockey: '',
    },
  ];
  noScaleAppicable: any;
  modalRefScales: BsModalRef;
  selectedScales: any[] = [];
  scalesArray: any[] = [];
  toScaleArr: any[];
  yesNoList: any = [
    {
      label: 'Yes',
      value: '0',
    },
    {
      label: 'No',
      value: '1',
    },
  ];
  CIRCULATIONList: any = [
    {
      label: 'Good',
      value: '0',
    },
    {
      label: 'Bad',
      value: '1',
    },
  ];
  careGivenList: any = [
    {
      label: 'Skin Care',
      value: '0',
    },
    {
      label: 'Range of Motion',
      value: '1',
    },
    {
      label: 'Reposition',
      value: '2',
    },
  ];
  behaviourList: any = [
    {
      label: 'Calm',
      value: '0',
    },
    {
      label: 'Confused',
      value: '1',
    },
    {
      label: 'Agitated',
      value: '2',
    },
    {
      label: 'Asleep',
      value: '3',
    },
  ];
  sensoryReceptionList: any = [
    {
      label: '(1) Totally limited',
      value: '1',
    },
    {
      label: '(2) Very limited',
      value: '2',
    },
    {
      label: '(3) Slightly limited',
      value: '3',
    },
    {
      label: '(4) No impairment',
      value: '4',
    },
  ];

  moistureList: any = [
    {
      label: 'Totally moisted',
      value: '1',
    },
    {
      label: 'Very moist',
      value: '2',
    },
    {
      label: 'Occasionally moist',
      value: '3',
    },
    {
      label: 'Rare moist',
      value: '4',
    },
  ];
  activityList: any = [
    {
      label: '(1) Bedfast',
      value: '1',
    },
    {
      label: '(2) Chair fast ',
      value: '2',
    },
    {
      label: '(3) Walks Occasionally',
      value: '3',
    },
    {
      label: '(4) Walks frequently',
      value: '4',
    },
  ];
  mobilityList: any = [
    {
      label: '(1) Totally Immpobile',
      value: '1',
    },
    {
      label: '(2) Very Limited ',
      value: '2',
    },
    {
      label: '(3) Slightly limited',
      value: '3',
    },
    {
      label: '(4) No limitations',
      value: '4',
    },
  ];
  nutritionList: any = [
    {
      label: '(1) Very Poor',
      value: '1',
    },
    {
      label: '(2) Probably',
      value: '2',
    },
    {
      label: '(3) Adequate',
      value: '3',
    },
    {
      label: '(4) Excellent',
      value: '4',
    },
  ];
  frictionList: any = [
    {
      label: '(1) Problem',
      value: '1',
    },
    {
      label: '(2) Potential Problem',
      value: '2',
    },
    {
      label: '(3) No Apparent Problem',
      value: '3',
    }
  ];
  gradeList: any = [
    {
      label: 'Stage 1',
      value: '0',
    },
    {
      label: 'Stage 2',
      value: '1',
    },
    {
      label: 'Stage 3',
      value: '2',
    },
    {
      label: 'Stage 4',
      value: '3',
    },
    {
      label: 'Unstageable',
      value: '4',
    },
  ];

  stageWoundList: any = [
    {
      label: 'Stage 1 - Reddened area (intact skin)',
      value: '1',
    },
    {
      label: 'Stage 2 - Blister, skin Break',
      value: '2',
    },
    {
      label: 'Stage 3 - Skin break exposing subcutaneous tissue',
      value: '3',
    },
    {
      label: 'Stage 4 - Skin break exposing muscle and/or bone',
      value: '4',
    }
  ];

  edamaList: any = [
    {
      label: '1 - Mild',
      value: '1',
    },
    {
      label: '2 - Moderate',
      value: '2',
    },
    {
      label: '3 - Severe',
      value: '3',
    },
    {
      label: '4 - Pitting',
      value: '4',
    }
  ];
  modeList: any = [
    {
      label: 'Normal',
      value: '0',
    },
    {
      label: 'Abnormal',
      value: '1',
    }
  ];
  isNoLabApplicable: boolean = false;
  restraintsList = [1,2,3,4,5];
  pressuerList = [1,2,3];
  pressuerCoreList = [1,2,3];
  woundCareList = [1,2,3,4,5];
  physicialExaminationList = [1,2, 3, 4, 5];
  ventilatorList = [1,2, 3, 4, 5];
  constructor(private modalService: BsModalService, private ePrescriptionService: EPrescriptionService, private sharedService: SharedService) { }

  ngOnInit(): void {
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
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

  activeTabFirst: string = 'chifComplaint'; // Default tab
  setActiveTabFirst(tab: string): void {
    this.activeTabFirst = tab;
  }
  code = [
    { code: 'A001', admission: false, discharge: false, working: false, preop: false, surgery: false, cause: false, department: false, hospital: false },
    { code: 'B002', admission: true, discharge: false, working: true, preop: false, surgery: true, cause: false, department: true, hospital: false },
    { code: 'C003', admission: false, discharge: true, working: false, preop: true, surgery: false, cause: true, department: false, hospital: true },
    { code: 'C004', admission: false, discharge: true, working: false, preop: true, surgery: false, cause: true, department: false, hospital: true },
    { code: 'C005', admission: false, discharge: true, working: false, preop: true, surgery: false, cause: true, department: false, hospital: true },
  ];

  addRow() {
    this.code.push(
      { code: 'A001', admission: false, discharge: false, working: false, preop: false, surgery: false, cause: false, department: false, hospital: false }
    )
  }

  removeCode(index){
    this.code.splice(index,1)
  }

  addrestraintsList() {
    this.restraintsList.push(this.restraintsList.length + 1);
  }

  removeSafetyMainRow(index: number) {
    this.restraintsList.splice(index, 1);
  }
  addPressuer() {
    this.pressuerList.push(this.pressuerList.length + 1);
  }
  removePressuer(index: number) {
    this.pressuerList.splice(index, 1);
  }
  addPressuerCare() {
    this.pressuerCoreList.push(this.pressuerCoreList.length + 1);
  }
  removePressuerCare(index: number) {
    this.pressuerCoreList.splice(index, 1);
  }
  addWoundCare() {
    this.woundCareList.push(this.woundCareList.length + 1);
  }
  removeWoundCare(index: number) {
    this.woundCareList.splice(index, 1);
  }
  addPhysicialExamination() {
    this.physicialExaminationList.push(this.physicialExaminationList.length + 1);
  }
  removePhysicialExamination(index: number) {
    this.physicialExaminationList.splice(index, 1);
  }
  addVentilatorList() {
    this.ventilatorList.push(this.ventilatorList.length + 1);
  }
  removeVentilatorList(index: number) {
    this.ventilatorList.splice(index, 1);
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

  collectAllScalesData(event: any) {
    if (event.target.checked) {
      this.selectedScales = (Object.assign([], this.toScaleArr));
    } else {
      this.selectedScales = [];
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
      customClass: { popup: 'myalertpopup' },
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

}
