import { DatePipe } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ScalesGlosgowComaComponent } from './scales-glosgow-coma/scales-glosgow-coma.component';
import { ScalesFacePainComponent } from './scales-face-pain/scales-face-pain.component';
import { ScalesNumericRatingComponent } from './scales-numeric-rating/scales-numeric-rating.component';
import Swal from 'sweetalert2';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { SharedService } from '@services/shared.service';

@Component({
  selector: 'app-initial-nursing-assessment-newborn',
  templateUrl: './initial-nursing-assessment-newborn.component.html',
  styleUrls: ['./initial-nursing-assessment-newborn.component.scss']
})
export class InitialNursingAssessmentNewbornComponent implements OnInit {
  @ViewChild('scalesGlosgow') scalesGlosgow: ScalesGlosgowComaComponent;
  @ViewChild('scalesFacePain') scalesFacePain: ScalesFacePainComponent;
  @ViewChild('scalesNumericRating') scalesNumericRating: ScalesNumericRatingComponent;
  isMotherInfo: boolean = true;
  isInfantInfo: boolean = false;
  noScaleAppicable: boolean = false;
  scalesList = [];
  modalRefScales: BsModalRef;
  toScaleArr: any[];
  selectedScales: any[] = [];

  ageForMotherTab: any = [];
  bloodGroup: any = [
    {
      label: 'A-',
      value: '0'
    },
    {
      label: 'A+',
      value: '1'
    },
    {
      label: 'B-',
      value: '2'
    },
    {
      label: 'B+',
      value: '3'
    },
    {
      label: 'O-',
      value: '4'
    },
    {
      label: 'O+',
      value: '5'
    },
    {
      label: 'AB-',
      value: '6'
    },
    {
      label: 'AB+',
      value: '7'
    },
  ];
  selectedTabName: string = 'Head, Eyes & Ears';
  physicialTabList = ['Head, Eyes & Ears', 'Skin', 'Neuromuscular', 'Respiratory', 'Cardiovascular', 'Gastrointestinal', 'Genitourinary', 'Psychological']
  intialJson: any = {
    appointmentValue: 'NA',
    summaryValue: 'NA',
    hospitalValue: 'NA',
    devicesValue: 'NA',
    laboratoryValue: 'NA',
    suturesValue: 'NA',
    XRayValue: 'NA',
    dressingsValue: 'NA',
    educationValue: 'NA',
    SuppliesValue: 'NA',
    MedicationValue: 'NA',
  };
  constructor(private modalService: BsModalService, private ePrescriptionService: EPrescriptionService, private sharedService: SharedService) { }

  ngOnInit(): void {
    this.scalesList = [
      { ScaleType: 'Glasgow Coma Scale', LastScore: '', description: '', Datetimee: '', value: '1', Dockey: '', },
      { ScaleType: 'Face pain scale', LastScore: '', description: '', Datetimee: '', value: '2', Dockey: '', },
      { ScaleType: 'Numeric rating scale(more than 8 years)', LastScore: '', description: '', Datetimee: '', value: '3', Dockey: '', },
    ];

    for (let index = 0; index < 32; index++) {
      let json = { value: index.toString(), label: (index + 18).toString() }
      this.ageForMotherTab.push(json);

    }
  }

  assessmentTabSelect(tabName: string) {
    if (tabName == 'isMotherInfo') {
      this.isMotherInfo = true;
      this.isInfantInfo = false;
    } else {
      this.isInfantInfo = true;
      this.isMotherInfo = false
    }
  }

  selectPhysicalTab(tabName: string) {
    this.selectedTabName = tabName;
  }

  // Set Glasgow Scale Value In Table List
  glasgowValue(event) {
    this.scalesList[0].LastScore = event?.totalScore.toString();
    this.scalesList[0].description = event?.description;
    this.scalesList[0].Dockey = event?.dockey;
    this.scalesList[0].Datetimee = `${new DatePipe('en-US').transform(
      event?.date,
      'dd.MM.yyyy'
    )}/${event?.time}`;
  }

  // Set Numberic Scale Value In Table List
  numericValue(event) {
    this.scalesList[2].LastScore = event?.totalScore;
    this.scalesList[2].description = event?.description;
    this.scalesList[2].Dockey = event?.dockey;
    this.scalesList[2].Datetimee = `${new DatePipe('en-US').transform(
      event?.date,
      'dd.MM.yyyy'
    )}/${event?.time}`;
  }

  // Set Face Pain Scale Value In tTable List
  facePainValue(event) {
    this.scalesList[1].LastScore = event?.totalScore;
    this.scalesList[1].description = event?.description;
    this.scalesList[1].Dockey = event?.dockey;
    this.scalesList[1].Datetimee = `${new DatePipe('en-US').transform(
      event?.date,
      'dd.MM.yyyy'
    )}/${event?.time}`;
  }


  // Open Glosgow Scale Model
  openGlosgowComaModel(item: any) {
    if (this.noScaleAppicable) return;
    this.scalesEditConfirmationMsg(item);
  }

  scalesEditConfirmationMsg(item: { value: string; }) {
    Swal.fire({
      text: 'Are you sure you want to edit scale',
      icon: 'warning',
      confirmButtonText: 'Yes',
      showCancelButton: true,
      cancelButtonText: 'No',
      customClass: 'myalertpopup',
    }).then((res) => {
      if (res.isConfirmed) {
        if (item.value == '1') {
          this.scalesGlosgow.openModalForGlosgow('');
        } else if (item.value == '2') {
          this.scalesFacePain.openModalForFacePain('');
        } else if (item.value == '3') {
          this.scalesNumericRating.openModalForNumericRating('');
        }
      }
    });
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
    const scalesOrders: Subscription = this.ePrescriptionService.loadData(`e-prescription/ScalesList?Patnr=${this.ePrescriptionService.parameters.patnr}`, false, false, false, false).subscribe((resp: any) => {
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

  viewGlosgowModel(item) {
    if (this.noScaleAppicable) return;
    if (item.value == '1') {
      if (item.Dockey) {
        this.scalesGlosgow.openModalForGlosgow(item.Dockey);
      } else {
        this.sharedService.waringSwallModel('No data found');
      }
    } else if (item.value == '2') {
      if (item.Dockey) {
        this.scalesFacePain.openModalForFacePain(item.Dockey);
      } else {
        this.sharedService.waringSwallModel('No data found');
      }
    } else if (item.value == '3') {
      if (item.Dockey) {
        this.scalesNumericRating.openModalForNumericRating(item.Dockey);
      } else {
        this.sharedService.waringSwallModel('No data found');
      }
    }
  }

  collectAllScalesData(event: any) {
    if (event.target.checked) {
      this.selectedScales = (Object.assign([], this.toScaleArr));
    } else {
      this.selectedScales = [];
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

  isDockeyAvailable(): boolean {
    return this.scalesList.some(scale => scale.Dockey && scale.Dockey.trim() !== '');
  }

}
