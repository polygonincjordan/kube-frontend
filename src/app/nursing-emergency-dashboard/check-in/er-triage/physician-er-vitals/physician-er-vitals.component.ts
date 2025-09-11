import { filter } from 'rxjs';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import {
  ModalDismissReasons, NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import { CatalogItem, RangeTime, VitalItem, detailsVital } from '@services/e-kardex/interfaces/vitals';
import { VitalsService } from '@services/e-kardex/vitals.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { StorageService } from '@services/storage.service';
import { formatDate } from 'ngx-bootstrap/chronos';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
// import { ChartService } from '@services/chart.service';
import { DatePipe } from '@angular/common';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
// import { ChartdataService } from './chartdata.service';


@Component({
  selector: 'app-physician-er-vitals',
  templateUrl: './physician-er-vitals.component.html',
  styleUrls: ['./physician-er-vitals.component.scss']
})
export class PhysicianErVitalsComponent implements OnInit {
  @Input() class = '';
  @Input() control = true;
  @Output() importEvent = new EventEmitter();
  // chartDataConfig: ChartdataService;
  chart: string[] = [];

  // areaChartData = areaChartData;

  @ViewChild('erVitalsModal', { static: true }) erVitalsModal: TemplateRef<any>;
  modalRef: BsModalRef;
  modalRefForDelete: BsModalRef;
  modalRefForAllVitals: BsModalRef;
  listVitals: VitalItem[] = [] as VitalItem[];
  erListSelectedData: any;
  vitalListResp: any;
  vitalListItems: any;
  toUniqueItemsArr = [];
  isSelected = false;
  selectedColData: any;
  showMaintain = false;

  maintainvitalform: FormGroup;
  maintainVitalFormitems: FormArray;
  measuredValueQual = [];
  Reason = [];
  maintainVitalBarForm: FormGroup;
  deleteReasonsListData: any;
  cancelReasonValue: any = '';
  isFormSubmitted = false;
  vitalDefaultListResp: any;
  vitalAllListResp: any;
  selectedIndex: any;
  public VitalChart: any;
  closeResult = '';
  edit = false;
  public selectedRowDelete;
  selectedRowIndex: any;
  stickyHead = true;
  vitalListLoading: CatalogItem[] = [] as detailsVital[];
  ActiveData: any;
  UnitText: string;
  isSelecteddata: any;
  Chart: any;

  maxdata;
  mindata;
  vitalsArr: any=[];
  constructor(public ePrescriptionService: EPrescriptionService, private datePipe: DatePipe, private modalService: BsModalService, private modalNgbService: NgbModal, public vitalsService: VitalsService, private emergencyService: EmergencyService, private formBuilder: FormBuilder, private storageService: StorageService) {
    // this.chartDataConfig = this.chartService;
    this.maintainvitalform = this.formBuilder.group({
      maintainVitalFormitems: new FormArray([]),
    });
    this.maintainVitalBarForm = this.formBuilder.group({
      Orgdo: [this.storageService?.patientData?.deptOrgUnit],
      Vma: [''],
      Descr: [''],
      Odate: [''],
      Otime: [''],
    });
  }


  ngOnInit() {
    // this.vitalsService.getListOfVitals();
    // this.observeChangesInVitalList();
    // this.observeChangesInvitalListLoading();
    this.measuredValueQual = [
      {
        Text: 'No Specification'
      },
      {
        Text: 'Questionable'
      },
      {
        Text: 'Not Measurable'
      },
      {
        Text: 'No Measured'
      }
    ]

    this.Reason = [
      {
        ReasonText: 'Patient Absent'
      },
      {
        ReasonText: 'Patient Refused'
      },
    ]

    this.vitalDefaultListResp = [
      {

        "Einri": "",
        "Valid": "E10989D8963E1EEE81C5B8A334F05E72",
        "ValidVers": "0000",
        "Bcpid": "C000C29D2E09C1ED9999E4DE4F9F884F0",
        "Extid": "SYSTOLIC BLOOD PRESSURE",
        "Name": "Systolic Blood Pressure",
        "Value": "",
        "ValueString": "",
        "UnitTxt": "mmHg",
        "NormalRange": "80.000 - 110.000",
        "Origin": "",
        "Descr": "",
        "Obsid": "E10989D8963E1EEE81C5B8A334F03E72",
        "ObsidVers": "0000"
      },
      {

        "Einri": "",
        "Valid": "E10989D8963E1EEE81C5B8A334F07E72",
        "ValidVers": "0000",
        "Bcpid": "C000C29D2E09C1ED9999E552CFF3AE50F",
        "Extid": "DIASTOLIC BLOOD PRESSURE",
        "Name": "Diastolic Blood Pressure",
        "Value": "",
        "ValueString": "",
        "UnitTxt": "mmHg",
        "NormalRange": "50.000 - 70.000",
        "Origin": "",
        "Descr": "",
        "Obsid": "E10989D8963E1EEE81C5B8A334F03E72",
        "ObsidVers": "0000"
      },
      {

        "Einri": "",
        "Valid": "E10989D8963E1EEE81C5B8A334F09E72",
        "ValidVers": "0000",
        "Bcpid": "C000C29D2E09C1ED9A4BEDCC0AC61B5A2",
        "Extid": "PAIN SCORE",
        "Name": "Pain score",
        "Value": "",
        "ValueString": "",
        "UnitTxt": "UnLess",
        "NormalRange": "0.000 - 3.000",
        "Origin": "",
        "Descr": "",
        "Obsid": "E10989D8963E1EEE81C5B8A334F03E72",
        "ObsidVers": "0000"
      },
      {

        "Einri": "",
        "Valid": "E10989D8963E1EEE81C5B8A334F0BE72",
        "ValidVers": "0000",
        "Bcpid": "C000C29D2E09C1ED9A5D22D8A6C6B2972",
        "Extid": "RESPIRATORY RATE",
        "Name": "Respiratory Rate",
        "Value": "",
        "ValueString": "",
        "UnitTxt": "bpm",
        "NormalRange": "12.000 - 30.000",
        "Origin": "",
        "Descr": "",
        "Obsid": "E10989D8963E1EEE81C5B8A334F03E72",
        "ObsidVers": "0000"
      },
      {

        "Einri": "",
        "Valid": "E10989D8963E1EEE81C5B8A334F0DE72",
        "ValidVers": "0000",
        "Bcpid": "C000C29D2E09C1EE98E8803F5593B50A7",
        "Extid": "OXYGEN SATURATION",
        "Name": "Oxygen Saturation",
        "Value": "",
        "ValueString": "",
        "UnitTxt": "%",
        "NormalRange": "90.000 - 99.000",
        "Origin": "",
        "Descr": "",
        "Obsid": "E10989D8963E1EEE81C5B8A334F03E72",
        "ObsidVers": "0000"
      },
      {

        "Einri": "",
        "Valid": "E10989D8963E1EEE81C5B8A334F0FE72",
        "ValidVers": "0000",
        "Bcpid": "C000C29D2E09C1EE98E8803F5593E50A7",
        "Extid": "HEART RATE",
        "Name": "Heart Rate",
        "Value": "",
        "ValueString": "",
        "UnitTxt": "bpm",
        "NormalRange": "80.000 - 120.000",
        "Origin": "",
        "Descr": "",
        "Obsid": "E10989D8963E1EEE81C5B8A334F03E72",
        "ObsidVers": "0000"
      },
      {

        "Einri": "",
        "Valid": "E10989D8963E1EEE81C5B8A334F15E72",
        "ValidVers": "0000",
        "Bcpid": "C0050568120581EE98CD1ABD87BC9ECD8",
        "Extid": "TEMP_AXIL",
        "Name": "Temperature-Axila",
        "Value": "",
        "ValueString": "",
        "UnitTxt": "°C",
        "NormalRange": "36.100 - 36.700",
        "Origin": "",
        "Descr": "",
        "Obsid": "E10989D8963E1EEE81C5B8A334F03E72",
        "ObsidVers": "0000"
      },
      {
        "Einri": "",
        "Valid": "E10989D8963E1EEE81C5B8A334F17E72",
        "ValidVers": "0000",
        "Bcpid": "C0050568120581EE98CD1ABD87BCA2CD8",
        "Extid": "TEMP_ORAL",
        "Name": "Temperature-Oral",
        "Value": "",
        "ValueString": "",
        "UnitTxt": "°C",
        "NormalRange": "36.600 - 37.200",
        "Origin": "",
        "Descr": "",
        "Obsid": "E10989D8963E1EEE81C5B8A334F03E72",
        "ObsidVers": "0000"
      },
      {
        "Einri": "",
        "Valid": "E10989D8963E1EEE81C5B8A334F19E72",
        "ValidVers": "0000",
        "Bcpid": "C0050568120581EE98CD1ABD87BCAACD8",
        "Extid": "TEMP_TYMP",
        "Name": "Temperature Tympanic",
        "Value": "",
        "ValueString": "",
        "UnitTxt": "°C",
        "NormalRange": "35.500 - 37.500",
        "Origin": "",
        "Descr": "",
        "Obsid": "E10989D8963E1EEE81C5B8A334F03E72",
        "ObsidVers": "0000"
      }
    ];
    //this.deleteReasonsList();

  }
  openModalForErVital(checkinitem) {
    this.erListSelectedData = checkinitem;
    const config: ModalOptions = { class: 'modal-dialog-centered er-vital-modal',ignoreBackdropClick: true };
    this.modalRef = this.modalService.show(this.erVitalsModal, config);
    this.modalRef.onHide.subscribe((reason: string | any) => {
      if (reason === 'backdrop-click') {

      }
    });
    this.vitalsArr = [];
     this.getVitalList();
     this.getAllVitalList();
    this.isFormSubmitted = false;
    this.vitalDefaultListResp = [
      {

        "Einri": "",
        "Valid": "E10989D8963E1EEE81C5B8A334F05E72",
        "ValidVers": "0000",
        "Bcpid": "C000C29D2E09C1ED9999E4DE4F9F884F0",
        "Extid": "SYSTOLIC BLOOD PRESSURE",
        "Name": "Systolic Blood Pressure",
        "Value": "",
        "ValueString": "",
        "UnitTxt": "mmHg",
        "NormalRange": "80.000 - 110.000",
        "Origin": "",
        "Descr": "",
        "Obsid": "E10989D8963E1EEE81C5B8A334F03E72",
        "ObsidVers": "0000"
      },
      {

        "Einri": "",
        "Valid": "E10989D8963E1EEE81C5B8A334F07E72",
        "ValidVers": "0000",
        "Bcpid": "C000C29D2E09C1ED9999E552CFF3AE50F",
        "Extid": "DIASTOLIC BLOOD PRESSURE",
        "Name": "Diastolic Blood Pressure",
        "Value": "",
        "ValueString": "",
        "UnitTxt": "mmHg",
        "NormalRange": "50.000 - 70.000",
        "Origin": "",
        "Descr": "",
        "Obsid": "E10989D8963E1EEE81C5B8A334F03E72",
        "ObsidVers": "0000"
      },
      {

        "Einri": "",
        "Valid": "E10989D8963E1EEE81C5B8A334F09E72",
        "ValidVers": "0000",
        "Bcpid": "C000C29D2E09C1ED9A4BEDCC0AC61B5A2",
        "Extid": "PAIN SCORE",
        "Name": "Pain score",
        "Value": "",
        "ValueString": "",
        "UnitTxt": "UnLess",
        "NormalRange": "0.000 - 3.000",
        "Origin": "",
        "Descr": "",
        "Obsid": "E10989D8963E1EEE81C5B8A334F03E72",
        "ObsidVers": "0000"
      },
      {

        "Einri": "",
        "Valid": "E10989D8963E1EEE81C5B8A334F0BE72",
        "ValidVers": "0000",
        "Bcpid": "C000C29D2E09C1ED9A5D22D8A6C6B2972",
        "Extid": "RESPIRATORY RATE",
        "Name": "Respiratory Rate",
        "Value": "",
        "ValueString": "",
        "UnitTxt": "bpm",
        "NormalRange": "12.000 - 30.000",
        "Origin": "",
        "Descr": "",
        "Obsid": "E10989D8963E1EEE81C5B8A334F03E72",
        "ObsidVers": "0000"
      },
      {

        "Einri": "",
        "Valid": "E10989D8963E1EEE81C5B8A334F0DE72",
        "ValidVers": "0000",
        "Bcpid": "C000C29D2E09C1EE98E8803F5593B50A7",
        "Extid": "OXYGEN SATURATION",
        "Name": "Oxygen Saturation",
        "Value": "",
        "ValueString": "",
        "UnitTxt": "%",
        "NormalRange": "90.000 - 99.000",
        "Origin": "",
        "Descr": "",
        "Obsid": "E10989D8963E1EEE81C5B8A334F03E72",
        "ObsidVers": "0000"
      },
      {

        "Einri": "",
        "Valid": "E10989D8963E1EEE81C5B8A334F0FE72",
        "ValidVers": "0000",
        "Bcpid": "C000C29D2E09C1EE98E8803F5593E50A7",
        "Extid": "HEART RATE",
        "Name": "Heart Rate",
        "Value": "",
        "ValueString": "",
        "UnitTxt": "bpm",
        "NormalRange": "80.000 - 120.000",
        "Origin": "",
        "Descr": "",
        "Obsid": "E10989D8963E1EEE81C5B8A334F03E72",
        "ObsidVers": "0000"
      },
      {

        "Einri": "",
        "Valid": "E10989D8963E1EEE81C5B8A334F15E72",
        "ValidVers": "0000",
        "Bcpid": "C0050568120581EE98CD1ABD87BC9ECD8",
        "Extid": "TEMP_AXIL",
        "Name": "Temperature-Axila",
        "Value": "",
        "ValueString": "",
        "UnitTxt": "°C",
        "NormalRange": "36.100 - 36.700",
        "Origin": "",
        "Descr": "",
        "Obsid": "E10989D8963E1EEE81C5B8A334F03E72",
        "ObsidVers": "0000"
      },
      {
        "Einri": "",
        "Valid": "E10989D8963E1EEE81C5B8A334F17E72",
        "ValidVers": "0000",
        "Bcpid": "C0050568120581EE98CD1ABD87BCA2CD8",
        "Extid": "TEMP_ORAL",
        "Name": "Temperature-Oral",
        "Value": "",
        "ValueString": "",
        "UnitTxt": "°C",
        "NormalRange": "36.600 - 37.200",
        "Origin": "",
        "Descr": "",
        "Obsid": "E10989D8963E1EEE81C5B8A334F03E72",
        "ObsidVers": "0000"
      },
      {
        "Einri": "",
        "Valid": "E10989D8963E1EEE81C5B8A334F19E72",
        "ValidVers": "0000",
        "Bcpid": "C0050568120581EE98CD1ABD87BCAACD8",
        "Extid": "TEMP_TYMP",
        "Name": "Temperature Tympanic",
        "Value": "",
        "ValueString": "",
        "UnitTxt": "°C",
        "NormalRange": "35.500 - 37.500",
        "Origin": "",
        "Descr": "",
        "Obsid": "E10989D8963E1EEE81C5B8A334F03E72",
        "ObsidVers": "0000"
      }
    ];
    this.CreateVitalList();
  }
  getVitalList() {
    const json = {
      patnr: this.erListSelectedData.Patnr,
      falnr: this.erListSelectedData.Falnr,
      einri: this.erListSelectedData.Einri,
      lfdnr: this.erListSelectedData.Lfdbw
    }
    this.emergencyService.getVitalList(json).subscribe(
      (_success: any) => {
        this.vitalListResp = _success.d.results;
        // this.vitalListItems = this.vitalListResp.TOITEM.results;
        let toItemsArr = this.vitalListResp.flatMap(a => a.TOITEM.results).sort(s => s.Bcpid);
        let groupingViaCommonProperty = Object.values(
          toItemsArr.reduce((acc, current) => {
            acc[current.Bcpid] = acc[current.Bcpid] ?? [];
            acc[current.Bcpid].push(current);
            return acc;
          }, {})
        );
        this.toUniqueItemsArr = groupingViaCommonProperty;
        this.showMaintain = false;
        this.selectedColData = {};
        this.toUniqueItemsArr.forEach((element,index) => {
        //  this.collectVitalsData({target:{checked:true}},element,index);
        });
      },
      (_error: any) => { }
    );
  }
  getAllVitalList() {
    const json = {
      einri: this.erListSelectedData.Einri,
    }
    this.emergencyService.getAllVitalList(json).subscribe(
      (_success: any) => {
        this.vitalAllListResp = _success.d.results;

      },
      (_error: any) => { }
    );
  }
  selectDateColumn(item) {
    if ((this.selectedColData != undefined) && (this.selectedColData.Obsid == item.Obsid)) {
      if (this.isSelected) {
        this.isSelected = false;
      }else{
         this.isSelected = true;
      }
    }else{
      this.isSelected = true;
    }

    this.selectedColData = item;
  }
  confirmationForDelete(template: TemplateRef<any>) {
    const config: ModalOptions = {
      class: 'modal-dialog-centered cancel-vital',
    };
    if (this.isSelected) {
      this.modalRefForDelete = this.modalService.show(template, config);
    } else {
      Swal.fire({
        text: "Please select Vital Signs to delete.",
        icon: 'error',
        confirmButtonText: 'Ok',
        customClass: 'myalertpopup'
      })
    }
  }
  deleteVitalList() {
    this.isFormSubmitted = true;
    if (this.cancelReasonValue !== '') {
      const json = {
        "Obsid": this.selectedColData.Obsid,
        "ObsidVers": this.selectedColData.ObsidVers,
        "Storn": true,
        "Stoid": this.cancelReasonValue,
        "TOITEM": [{}]
      }

      this.emergencyService.deleteVitalList(json).subscribe(
        (_success: any) => {
          this.getVitalList();
          this.modalRef.hide();
          this.modalRefForDelete.hide();
          this.isFormSubmitted = false;
          this.cancelReasonValue = '';
          Swal.fire({
            text: "Vital signs deleted successfully",
            icon: 'success',
            confirmButtonText: 'Ok',
            customClass: 'myalertpopup'
          })
        },
        (_error: any) => { }
      );
    }

  }
  observeChangesInVitalList() {
    this.vitalsService.vitalList$
      .subscribe((data: VitalItem[]) => {
        data.forEach((resp) => {
          resp.isActive = false;
          // resp[0].isActive = true
        })
        this.listVitals = data;
      });
  }


  observeChangesInvitalListLoading() {
    this.vitalsService.detailsVital$
      .subscribe((data: CatalogItem[]) => {
        this.vitalListLoading = data;
      });
  }

  orderTemplateAction(data: any) {
    this.maxdata = "";
    this.mindata = "";
    this.ePrescriptionService.loadData(`e-prescription/VitalChart?Einri=${this.ePrescriptionService.parameters.einri}&Patnr=${this.ePrescriptionService.parameters.patnr}&Odatege=${data.Odatege}&Odatele=${data.Odatele}&Extid=${data.Extid}`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        let isActiveData = this.listVitals.find(element => element.isActive).ItemName;
        this.chart = resp.body.d.results.find(d => d.Name === isActiveData).ToVitalChartItems.results.map(d => d.Value);
        const chartData = resp.body.d.results.find(d => d.Name === isActiveData).ToVitalChartItems.results
        // this.chart.sort((a, b) => {
        //   if (a < b) { return 1; }
        //   if (a < b) { return -1; }
        //   return 0;
        // });
        // this.chart.sort((a, b) => {
        //   const nameA = a.Odate;
        // const nameB = b.Odate ;
        //   if (nameA < nameB) { return 1; }
        //   if (nameA < nameB) { return -1; }
        //   return 0;
        // });
        this.maxdata = chartData[0]
        this.mindata = chartData[chartData.length - 1]
      }else{
        this.chart = [];
      }
    });
  }

  person = [
    { value: 'Day', isSelected: true },
    { value: 'Week', isSelected: false },
    { value: 'Month', isSelected: false },
    { value: 'Year', isSelected: false },
    { value: 'Hour', isSelected: false },
    { value: 'Date', isSelected: false }
  ];


  parseDateFormate(date: any) {
    if(date) {
      return new Date(parseInt(date.replace(/[^0-9]/g, "")));
    }
  }

  range: RangeTime;
  fromto(range: RangeTime, data) {
    this.vitalsService.setVitalDetails(data, range)
  }


  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  opendata(content) {
    this.loadDefaultConfiguration();
    this.modalNgbService.open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }
  onChange(event) {
    this.isFormSubmitted = false;
  }
  getDateRecord(obsdId: any, element: any) {
    let item = element.find(f => f.Obsid == obsdId);
    if (item) {
      if (item.Name.includes('Temperature')) {
        return parseFloat(item.ValueFormatted);
      }
      else {
        return parseFloat(item.ValueFormatted);
      }
    };
  }
  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }
  getTime(value) {
    if (value) {
      var str = value;
      var str = str.replace(/[PT]/g, '');
      var str = str.replace(/[H]/g, ':');
      var str = str.replace(/[M]/g, ':');
      var str = str.replace(/[S]/g, '');
      var str = str.slice(0, 5)
      return str;
    }
  }

  EditVitalList() {
    if (this.isSelected) {
      if (this.selectedColData) {
        this.showMaintain = true;
        this.edit = true
        this.selectedColData.TOITEM.results.forEach(element => {
          // if(element.Name.includes('Temperature')){
          //   element['Value'] = parseFloat(element.Value).toFixed(2);
          // }
          // else{
          //   element['Value'] = parseInt(element.Value);
          // }
          this.addItemForVital(element);
        });
        this.maintainVitalBarForm.controls.Orgdo.setValue(this.selectedColData.Orgdo);
        this.maintainVitalBarForm.controls.Vma.setValue(this.storageService.getGpart());
        this.maintainVitalBarForm.controls.Odate.setValue(this.getDate(this.selectedColData.Odate));
        this.maintainVitalBarForm.controls.Otime.setValue(this.getTime(this.selectedColData.Otime));
        this.maintainVitalBarForm.controls.Descr.setValue(this.selectedColData.Descr);

      }
    } else {
      Swal.fire({
        text: "Please select Vital Signs to change.",
        icon: 'error',
        confirmButtonText: 'Ok',
        customClass: 'myalertpopup'
      })
    }

  }
  // maintain vitals
  closeMaintain() {
    this.showMaintain = false;
    this.edit = false;
    this.resetAllMaintainValues();
  }
  addItemForVital(element?): void {
    this.maintainVitalFormitems = this.maintainvitalform.get('maintainVitalFormitems') as FormArray;
    this.maintainVitalFormitems.push(this.showVitalDetailsOnList(element));
  }
  addNewItemForVital(): void {
    const control = <FormArray>this.maintainvitalform.controls['maintainVitalFormitems'];
    this.maintainVitalFormitems = this.maintainvitalform.get('maintainVitalFormitems') as FormArray;
    //this.maintainVitalFormitems.push(this.showVitalDetailsOnList());
    //this.disableInputs()
    control.insert(0, this.showVitalDetailsOnList());
  }
  showVitalDetailsOnList(element?): FormGroup {
    if (element) {
      return this.formBuilder.group({
        Bcpid: [element.Bcpid],
        Valid: [element.Valid],
        ValidVers: [element.ValidVers],
        Value: [element.Value],
        ValueString: [element.ValueString],
        UnitTxt: [element.UnitTxt],
        Origin: [''],
        Name: [element.Name],
        Extid: [element.Extid]
      }
      );
    } else {
      return this.formBuilder.group({
        Bcpid: [''],
        Valid: [''],
        ValidVers: [''],
        Value: [''],
        ValueString: [''],
        UnitTxt: [''],
        Origin: [''],
        Name: [''],
        Extid: ['']
      }
      );

    }
  }
  get actionOnform(): FormArray {
    return this.maintainvitalform.get('maintainVitalFormitems') as FormArray;
  }
  updateVitalSigns() {
    let createTime = this.maintainVitalBarForm.controls.Otime.value.split(':');
    createTime = 'PT' + createTime[0] + 'H' + createTime[1] + 'M' + '00S'
    let createDate = this.maintainVitalBarForm.controls.Odate.value.getFullYear() + '-' + String(this.maintainVitalBarForm.controls.Odate.value.getMonth() + 1).padStart(2, '0') + '-' + String(this.maintainVitalBarForm.controls.Odate.value.getDate()).padStart(2, '0') + 'T00:00:00';
    const json = {
      "Obsid": this.selectedColData.Obsid,
      "ObsidVers": this.selectedColData.ObsidVers,
      "Stoid": this.selectedColData.Stoid,
      "Odate": createDate,
      "Otime": createTime,
      "TOITEM": this.maintainVitalFormitems.value
    }
    this.emergencyService.updateVitalSigns(json).subscribe(
      (_success: any) => {
        this.getVitalList();
        this.resetAllMaintainValues();
        //this.modalRef.hide();
        Swal.fire({
          text: "Vital signs updated successfully",
          icon: 'success',
          confirmButtonText: 'Ok',
          customClass: 'myalertpopup'
        })
      },
      (_error: any) => { }
    );
  }
  createVitalSigns() {
    let EnteredvitalArr = [];
    let createTime = this.maintainVitalBarForm.controls.Otime.value.split(':');
    createTime = 'PT' + createTime[0] + 'H' + createTime[1] + 'M' + '00S'
    let createDate = this.maintainVitalBarForm.controls.Odate.value.getFullYear() + '-' + String(this.maintainVitalBarForm.controls.Odate.value.getMonth() + 1).padStart(2, '0') + '-' + String(this.maintainVitalBarForm.controls.Odate.value.getDate()).padStart(2, '0') + 'T00:00:00';
    EnteredvitalArr = this.maintainVitalFormitems.value;
    EnteredvitalArr = EnteredvitalArr.filter(element => element.Value !== '')
    const json = {
      "Einri": this.erListSelectedData.Einri,
      "Patnr": this.erListSelectedData.Patnr,
      "Falnr": this.erListSelectedData.Falnr,
      "Lfdnr": this.erListSelectedData.Lfdbw,
      "Orgfa": "",
      "Orgpf": "",
      "Orgdo": this.storageService?.patientData?.deptOrgUnit ? this.storageService?.patientData?.deptOrgUnit :this.maintainVitalBarForm.controls.Orgdo.value,
      "Mitarb": this.storageService.getGpart(),
      "Origin": "",
      "Odate": createDate,
      "Otime": createTime,
      "Descr": "TEsting Test",
      "Storn": false,
      "Stoid": this.selectedColData.Stoid,
      "TOITEM": EnteredvitalArr
    }

    this.emergencyService.createVitalSigns(json).subscribe(
      (_success: any) => {
        this.getVitalList();
        this.resetAllMaintainValues();
        //this.modalRef.hide();
        this.edit = false;
        Swal.fire({
          text: "Vital signs created successfully",
          icon: 'success',
          confirmButtonText: 'Ok',
          customClass: 'myalertpopup'
        })
      },
      (_error: any) => { }
    );
  }
  deleteReasonsList() {
    this.emergencyService.deleteReasonsList().subscribe(
      (_success: any) => {
        this.deleteReasonsListData = _success.d.results;
      },
      (_error: any) => { }
    );
  }
  resetAllMaintainValues() {
    this.maintainvitalform.reset();
    this.maintainVitalBarForm.reset();
    this.maintainVitalBarForm.patchValue({
      Orgdo:this.storageService.patientData.deptOrgUnit
    })
    this.maintainVitalFormitems.clear();
    this.edit = false;
  }

  //create

  CreateVitalList() {
    this.showMaintain = true;
    let createTime = 'PT' + new Date().getHours() + 'H' + new Date().getMinutes() + 'M' + '00S';
    // if (this.vitalListResp.length != 0) {
    //   this.maintainVitalBarForm.controls.Orgdo.setValue(this.vitalListResp[0].Orgdo);
    // } else {
    //   this.maintainVitalBarForm.controls.Orgdo.setValue('');
    // }
    this.maintainVitalBarForm.controls.Vma.setValue(this.storageService.getGpart());
    this.maintainVitalBarForm.controls.Odate.setValue(new Date());
    this.maintainVitalBarForm.controls.Otime.setValue(this.getTime(createTime));
    // this.maintainVitalBarForm.controls.Vma.setValue(this.storageService.getGpart());
    // this.maintainVitalBarForm.controls.Odate.setValue(new Date());
    // this.maintainVitalBarForm.controls.Otime.setValue(this.getTime(createTime));
    this.vitalDefaultListResp.forEach(element => {
      this.addItemForVital(element);
    });
  }
  openAllVitalModal(template: TemplateRef<any>, index) {
    this.selectedIndex = index;
    const config: ModalOptions = {
      class: 'modal-dialog-centered all-vital',
    };
    this.modalRefForAllVitals = this.modalService.show(template, config);
  }
  selectVitalFromAllList(item) {
    this.modalRefForAllVitals.hide();
    this.maintainvitalform.controls['maintainVitalFormitems']['controls'][this.selectedIndex]['controls'].Extid.setValue(item.Extid);
    this.maintainvitalform.controls['maintainVitalFormitems']['controls'][this.selectedIndex]['controls'].Name.setValue(item.Name);
    this.maintainvitalform.controls['maintainVitalFormitems']['controls'][this.selectedIndex]['controls'].UnitTxt.setValue(item.UnitTxt);
    this.maintainvitalform.controls['maintainVitalFormitems']['controls'][this.selectedIndex]['controls'].Bcpid.setValue(item.Bcpid);
  }
  actionVitalSigns() {
    if (this.edit) {
      this.updateVitalSigns();
    } else {
      this.createVitalSigns();
    }
  }
  rowDelete(item, index) {
    this.selectedRowDelete = item.value;
    this.selectedRowIndex = index;
  }
  rowDeleteFn() {
    this.maintainVitalFormitems.removeAt(this.selectedRowIndex);
  }
  scrollRight() {
    this.stickyHead = false;
    const el = document.getElementById('columnDates');
    el.scrollLeft += 155;
  }
  scrollLeft() {
    this.stickyHead = false;
    const el = document.getElementById('columnDates');
    el.scrollLeft -= 155;
  }
  scrollHandler(event) {
    this.stickyHead = true;
  }

  loadDefaultConfiguration() {
    if (this.listVitals && this.listVitals.length) {
      this.listVitals.forEach((element) => { element.isActive = false });
      this.listVitals[0].isActive = true;
      this.person.forEach((element) => { element.isSelected = false });
      this.person[0].isSelected = true;
      this.selectedData(this.person[0].value);
    }
  }

  selectedData(value: any) {
    this.person.forEach((element) => { element.isSelected = false });
    this.person.find(element => element.value === value).isSelected = true;
    const currentDate = new Date();
    let isActiveData = this.listVitals.find(element => element.isActive).ItemName;
    if (value === 'Day') {
      const Fromday = `${formatDate(new Date(new Date().setDate(currentDate.getDate() - 1)), "YYYY-MM-DD")}T${formatDate(new Date(new Date().setDate(currentDate.getDate() - 1)), "HH:mm:ss")}`;
      const Today = `${formatDate(new Date(), "YYYY-MM-DD")}T${formatDate(new Date(), "HH:mm:ss")}`;
      this.orderTemplateAction({ Odatege: `${Today}`, Odatele: `${Fromday}`, Extid: isActiveData });
    }
    else if (value === 'Week') {
      const Fromday = `${formatDate(new Date(new Date().setDate(currentDate.getDate() - 7)), "YYYY-MM-DD")}T${formatDate(new Date(new Date().setDate(currentDate.getDate() - 7)), "HH:mm:ss")}`;
      const Today = `${formatDate(new Date(), "YYYY-MM-DD")}T${formatDate(new Date(), "HH:mm:ss")}`;
      this.orderTemplateAction({ Odatege: `${Fromday}`, Odatele: `${Today}`, Extid: isActiveData });

    }
    else if (value === 'Month') {
      const Fromday = `${formatDate(new Date(new Date().setMonth(currentDate.getMonth())), "YYYY-MM-DD")}T${formatDate(new Date(new Date().setMonth(currentDate.getMonth())), "HH:mm:ss")}`;
      const Today = `${formatDate(new Date(), "YYYY-MM-DD")}T${formatDate(new Date(), "HH:mm:ss")}`;
      this.orderTemplateAction({ Odatege: `${Fromday}`, Odatele: `${Today}`, Extid: isActiveData });
    }
    else if (value === 'Year') {
      const Fromday = `${formatDate(new Date(new Date().setFullYear(currentDate.getFullYear() - 1)), "YYYY-MM-DD")}T${formatDate(new Date(new Date().setFullYear(currentDate.getFullYear() - 1)), "HH:mm:ss")}`;
      const Today = `${formatDate(new Date(), "YYYY-MM-DD")}T${formatDate(new Date(), "HH:mm:ss")}`;
      this.orderTemplateAction({ Odatege: `${Fromday}`, Odatele: `${Today}`, Extid: isActiveData });
    }
    else if (value === 'Hour') {
      const Fromday = `${formatDate(new Date(new Date().setHours(currentDate.getHours() - 1)), "YYYY-MM-DD")}T${formatDate(new Date(new Date().setHours(currentDate.getHours() - 1)), "HH:mm:ss")}`;
      const Today = `${formatDate(new Date(), "YYYY-MM-DD")}T${formatDate(new Date(), "HH:mm:ss")}`;
      this.orderTemplateAction({ Odatege: `${Fromday}`, Odatele: `${Today}`, Extid: isActiveData });
    }
  }

  navigationItem(data: VitalItem) {
    this.listVitals.forEach((element) => { element.isActive = false });
    this.listVitals.find(element => element.CatItemKey === data.CatItemKey).isActive = true;
    this.ActiveData = this.listVitals.find(element => element.isActive).ItemName;
    this.UnitText = this.listVitals.find(element => element.isActive).UnitText;
    this.person.forEach((element) => { element.isSelected = false });
    this.person[0].isSelected = true;
    let isActiveData = this.person.find(element => element.isSelected).value;
    this.selectedData(isActiveData)
  }
  collectVitalsData(event,item,index){
    if (event.target.checked) {
      let value = this.getDateRecord(this.selectedColData.Obsid,item[0])
      this.vitalsArr.push(value);
    }else{
      this.vitalsArr.splice(index,1);
    }
    console.log(this.vitalsArr);

  }
  Import(){
    let value = []
   this.selectedColData.TOITEM.results.forEach(element => {
       element['Date'] = this.selectedColData.Odate;
       element['Time'] = this.selectedColData.Otime;
       value.push(element);
    });
    this.importEvent.emit(value);
    this.modalRef.hide();
    this.vitalsArr = [];
  }
}

