import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
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
import { ChartdataService } from './chartdata.service';
import { AnyAaaaRecord } from 'dns';
import { element } from 'protractor';
import { Colors } from '@services/colors.service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-er-vitals-comman',
  templateUrl: './er-vitals.component.html',
  styleUrls: ['./er-vitals.component.scss']
})
export class ErVitalsComponentComman implements OnInit {
  @Input() class = '';
  @Input() control = true;
  @Input() hideAction = true;
  chartDataConfig: ChartdataService;
  chart: string[] = [];
  DiastolicChart:string[] = []
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
  selectedVital: any = {};
  vitalData: any;
  minValue: any;
  maxValue: any;
  actualMinValue: any;
  actualMaxValue: any
  chartDatalabel:any;
  maxdata;
  mindata;
  lessThanNormalRange: boolean;
  backgroundColorArray: any;
  DiastolicNormalRange: any;
  vitalNormalRange:any
  isCheckData: boolean = true;
  paramsObj: any;
  nextInput: HTMLElement;
  nextInputId: string;
  selectedRowsIndex: number;
  selectedColIndex: any;
  private readonly newsScoreExtid = 'NEWS_SCORE';
  constructor(private chartService: ChartdataService, public ePrescriptionService: EPrescriptionService, private datePipe: DatePipe, private modalService: BsModalService, private modalNgbService: NgbModal, public vitalsService: VitalsService, private emergencyService: EmergencyService, private formBuilder: FormBuilder, 
    private storageService: StorageService, private route: ActivatedRoute,) {
    this.chartDataConfig = this.chartService;
    this.maintainvitalform = this.formBuilder.group({
      maintainVitalFormitems: new FormArray([]),
    });
    console.log(storageService?.patientData)
    this.maintainVitalBarForm = this.formBuilder.group({
      Orgdo: [storageService?.patientData?.deptOrgUnit],
      Vma: [this.storageService.getGpart()],
      Descr: [''],
      Odate: [''],
      Otime: [''],
    });

    this.route.queryParams.subscribe(params => { 
      this.paramsObj = params
    })
  }


  ngOnInit() {
    this.vitalsService.getListOfVitals();
    this.observeChangesInVitalList();
    this.observeChangesInvitalListLoading()
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
        "ObsidVers": "0000",
        "Addinfo": ""
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
        "ObsidVers": "0000",
        "Addinfo": ""
      },
      {
        "Einri": "",
        "Valid": "E10989D8963E1EEE81C5B8A334F19E72",
        "ValidVers": "0000",
        "Bcpid": "C0050568120581EE8B8E4B9B228DEECC5",
        "Extid": "HEIGHT",
        "Name": "Height",
        "Value": "",
        "ValueString": "",
        "UnitTxt": "cm",
        "NormalRange": "00.000 - 00.000",
        "Origin": "",
        "Descr": "",
        "Obsid": "E10989D8963E1EEE81C5B8A334F03E72",
        "ObsidVers": "0000",
        "Addinfo": ""
      },
      {
        "Einri": "",
        "Valid": "E10989D8963E1EEE81C5B8A334F19E72",
        "ValidVers": "0000",
        "Bcpid": "C0050568120581EE8B8E4B5DCAA436CC5",
        "Extid": "WEIGHT",
        "Name": "Weight",
        "Value": "",
        "ValueString": "",
        "UnitTxt": "kg",
        "NormalRange": "00.000 - 00.000",
        "Origin": "",
        "Descr": "",
        "Obsid": "E10989D8963E1EEE81C5B8A334F03E72",
        "ObsidVers": "0000",
        "Addinfo": ""
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
        "ObsidVers": "0000",
        "Addinfo": ""
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
        "ObsidVers": "0000",
        "Addinfo": ""
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
        "ObsidVers": "0000",
        "Addinfo": ""
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
        "ObsidVers": "0000",
        "Addinfo": ""
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
        "ObsidVers": "0000",
        "Addinfo": ""
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
        "ObsidVers": "0000",
        "Addinfo": ""
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
        "ObsidVers": "0000",
        "Addinfo": ""
      }
    ];
    this.openModalForErVital()
    this.deleteReasonsList();
  }

  handleKeydown(event: KeyboardEvent, rowIndex: number, colIndex: any): void {
    const rowCount = this.maintainvitalform.get('maintainVitalFormitems')['controls'].length;
    const colCount = 9; // Adjust based on the number of columns
    let nextRow = rowIndex;
    let nextCol = colIndex;
  
    switch (event.key) {
      case 'ArrowLeft':
        nextCol = colIndex > 0 ? colIndex - 1 : colCount - 1;
        break;
      case 'ArrowRight':
        nextCol = colIndex < colCount - 1 ? colIndex + 1 : 0;
        break;
      case 'ArrowUp':
        nextRow = rowIndex > 0 ? rowIndex - 1 : rowCount - 1;
        break;
      case 'ArrowDown':
        nextRow = rowIndex < rowCount - 1 ? rowIndex + 1 : 0;
        break;
      default:
        return; // If other keys are pressed, do nothing
    }
  
    this.nextInputId = `cell-${nextRow}-${nextCol}`;
    this.selectedRowsIndex = nextRow;
    this.selectedColIndex = nextCol;
    if(this.nextInputId == `cell-${nextRow}-5`){
      this.nextInput = document.getElementById(`cell-${nextRow}-7`) as HTMLElement;
      this.selectedColIndex = 7;
    }else if (this.nextInputId ==`cell-${nextRow}-6` && event.key == 'ArrowLeft'){
      this.nextInput = document.getElementById(`cell-${nextRow}-4`) as HTMLElement;
      this.selectedColIndex = 4;
    }
    else {
      this.nextInput = document.getElementById(this.nextInputId) as HTMLElement;
    }
    if (this.nextInput) {
      this.nextInput.focus();
      event.preventDefault();
    }
  }
  openModalForErVital() {
    // this.erListSelectedData = checkinitem;
    // const config: ModalOptions = { class: 'modal-dialog-centered er-vital-modal' };
    // this.modalRef = this.modalService.show(this.erVitalsModal, config);
    // this.modalRef.onHide.subscribe((reason: string | any) => {
    //   if (reason === 'backdrop-click') {

    //   }
    // });
    this.getVitalList();
    this.getAllVitalList();
    this.isFormSubmitted = false;
  }
  getVitalList() {
    const json = {
      patnr: this.paramsObj.patnr,
      falnr: this.paramsObj.falnr,
      einri: this.paramsObj.einri,
      lfdnr: this.paramsObj.lfdnr
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
      },
      (_error: any) => { }
    );
  }
  getAllVitalList() {
    const json = {
      einri: this.paramsObj.einri,
    }
    this.emergencyService.getAllVitalList(json).subscribe(
      (_success: any) => {
        this.vitalAllListResp = _success.d.results;
        this.ensureNewsScoreDefaultVital();

      },
      (_error: any) => { }
    );
  }
  selectDateColumn(item) {
    if ((this.selectedColData != undefined) && (this.selectedColData.Obsid == item.Obsid)) {
      if (this.isSelected) {
        this.isSelected = false;
      } else {
        this.isSelected = true;
      }
    } else {
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
        customClass: { popup: 'myalertpopup' }
      } as any)
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
            customClass: { popup: 'myalertpopup' }
          } as any)
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
    let normmalData
    let diastolicData
    this.chart = [];
    this.actualMinValue = '' ;
    this.actualMaxValue='';
    this.vitalNormalRange = '';
    this.DiastolicNormalRange = '';
    this.ePrescriptionService.loadData(`e-prescription/VitalChart?Einri=${this.ePrescriptionService.parameters.einri}&Patnr=${this.ePrescriptionService.parameters.patnr}&Odatege=${data.Odatege}&Odatele=${data.Odatele}&Extid=${data.Extid}`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        let isActiveData = this.listVitals.find(element => element.isActive).ItemName;
        this.UnitText = this.listVitals.find(element => element.isActive).UnitText;
        if (this.isCheckData && this.listVitals.length > 0) {
          const activeElement = this.listVitals.find(element => element.isActive);
          if (activeElement) {
            this.ActiveData = activeElement.PairVital ? activeElement.PairKeyName : activeElement.ItemName;
          } else {
            this.ActiveData = null;
          }
          this.isCheckData = false;
        }
        this.vitalData = resp.body.d.results.find(d => d.Name === isActiveData);
        const normalRangeValues = this.vitalData?.NormalRange.split('-').map(value => parseFloat(value.trim()));
        this.vitalNormalRange = `${normalRangeValues[0]}-${normalRangeValues[1]}`;
        normmalData = resp.body.d.results.find(d => d.Name === isActiveData).ToVitalChartItems.results.map(d => d.Value);
        const normalRange = this.vitalData.NormalLow
        let normalRangeMinValue = parseFloat(normalRange);
        const temperaturesLessThanNormalRange = this.vitalData.ToVitalChartItems.results.filter(item => {
          return parseFloat(item.Value) < normalRangeMinValue;
        });
        const pointBackgroundColor = normmalData.map(value => {
          return parseFloat(value) < normalRangeMinValue ? 'red' : Colors.getColors().foregroundColor;
        });
        this.backgroundColorArray = pointBackgroundColor;
        this.chartDatalabel = resp.body.d.results.find(d => d.Name === isActiveData).ToVitalChartItems.results.map(d => d.Odate);
        const chartData = resp.body.d.results.find(d => d.Name === isActiveData).ToVitalChartItems.results
        this.maxdata = new Date(data.Odatele);;
        this.mindata = new Date(data.Odatege);
        if(isActiveData === "Systolic Blood Pressure"){
          if (isActiveData) {
            let DiastolicVitalData = resp.body.d.results.find(d => d.Name === "Diastolic Blood Pressure");
            const normalRangeValues = DiastolicVitalData?.NormalRange.split('-').map(value => parseFloat(value.trim()));
            this.DiastolicNormalRange = `${normalRangeValues[0]}-${normalRangeValues[1]}`;
            const normalRange = DiastolicVitalData.NormalLow;
            let normalRangeMinValue = parseFloat(normalRange);
            diastolicData = DiastolicVitalData.ToVitalChartItems.results.map(d => d.Value);
            const temperaturesLessThanNormalRange = DiastolicVitalData.ToVitalChartItems.results.filter(item => {
              return parseFloat(item.Value) < normalRangeMinValue;
            });
            const pointBackgroundColor = diastolicData.map(value => {
              return parseFloat(value) < normalRangeMinValue ? 'red' : Colors.getColors().foregroundColor;
            });
            this.backgroundColorArray = pointBackgroundColor
            this.vitalData.MinVal = DiastolicVitalData.MinVal
          }
        }
        this.chart = [normmalData ,diastolicData]

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

        //if minVal = this.vitalData.minVal - (2*gaps)
        //if maxVal = this.vitalData.maxVal + (2*gaps)
        //if minval < 0 then minVal=0;
        this.actualMinValue = this.vitalData.MinVal;
        this.actualMaxValue = this.vitalData.MaxVal
        let chartDataConfigOption = {
          beginAtZero: false,
          min: this.minValue,
          max: this.maxValue,
          padding: 10,
          stepSize: 0,
          display: true
        }
        let gaps = this.getGapsOfChart(this.ActiveData);
        this.minValue = null
        this.maxValue = null
        const minVal = parseFloat(this.vitalData.MinVal);
        const maxVal = parseFloat(this.vitalData.MaxVal);
        this.minValue = minVal - (2 * gaps);
        this.maxValue = maxVal + (2 * gaps);
        if (this.minValue <= 0) {
          this.minValue = 0;
        }
        else {
          this.minValue = this.minValue - (this.minValue % gaps);
        }
        if (this.maxValue > 0) {
          this.maxValue = this.maxValue - (this.maxValue % gaps);
        }
        chartDataConfigOption.min = this.minValue
        chartDataConfigOption.max = this.maxValue;
        chartDataConfigOption.stepSize = gaps
        this.chartDataConfig.areaChartOptions.scales.yAxes[0].ticks = chartDataConfigOption;
      } else {
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

  getGapsOfChart(isActiveData) {
    if (isActiveData === "Blood Pressure Non Invasive") {
      return 20;
    } else if (isActiveData === "Pain score") {
      return 1;
    } else if (isActiveData === "Temperature-Oral") {
      return 5;
    } else if (isActiveData === "Oxygen Saturation") {
      return 10;
    } else if (isActiveData === "Respiratory Rate") {
      return 10;
    } else if (isActiveData === "Systolic Blood Pressure") {
      return 20;
    } else if (isActiveData === "Height") {
      return 20;
    } else if (isActiveData === "Heart Rate") {
      return 20;
    } else if (isActiveData === "Weight") {
      return 20;
    } else if (isActiveData === "Blood Glucose, Capillary") {
      return 20;
    } else {
      return 10;
    }
  }
  parseDateFormate(date: any) {
    return new Date(parseInt(date.replace(/[^0-9]/g, "")));
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
        return parseFloat(item.Value).toFixed(2);
      }
      else {
        return parseInt(item.Value);
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

  setReadingValues(input) {
    // Parse the string to a floating-point number
    let numberValue = parseFloat(input);
    // Convert it back to a string and then to a number with fixed decimal places
    let fixedValue = parseFloat(numberValue.toFixed(10)); // Use a large number of decimal places to ensure all trailing zeros are included
    // Convert it back to a number
    let finalValue = parseFloat(fixedValue.toString());
    return finalValue;

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
         customClass: { popup: 'myalertpopup' }
       } as any)
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
     this.isFormSubmitted = true;
    if (this.cancelReasonValue !== '') {
    let createTime = this.maintainVitalBarForm.controls.Otime.value.split(':');
    createTime = 'PT' + createTime[0] + 'H' + createTime[1] + 'M' + '00S'
    let createDate = this.maintainVitalBarForm.controls.Odate.value.getFullYear() + '-' + String(this.maintainVitalBarForm.controls.Odate.value.getMonth() + 1).padStart(2, '0') + '-' + String(this.maintainVitalBarForm.controls.Odate.value.getDate()).padStart(2, '0') + 'T00:00:00';
    const json = {
      "Obsid": this.selectedColData.Obsid,
      "ObsidVers": this.selectedColData.ObsidVers,
      "Stoid": this.cancelReasonValue,
      "Odate": createDate,
      "Otime": createTime,
      "TOITEM": this.maintainVitalFormitems.value
    }
    this.emergencyService.updateVitalSigns(json).subscribe(
      (_success: any) => {
        this.getVitalList();
        this.resetAllMaintainValues();
        this.showMaintain = false
          //this.modalRef.hide();
          this.modalRefForDelete.hide();
          this.cancelReasonValue = '';
          this.isSelected = false;
        Swal.fire({
          text: "Vital signs updated successfully",
          icon: 'success',
          confirmButtonText: 'Ok',
          customClass: { popup: 'myalertpopup' }
        } as any)
      },
      (_error: any) => { }
    );
  }
  }
  createVitalSigns() {
    let EnteredvitalArr = [];
    let createTime = this.maintainVitalBarForm.controls.Otime.value.split(':');
    createTime = 'PT' + createTime[0] + 'H' + createTime[1] + 'M' + '00S'
    let createDate = this.maintainVitalBarForm.controls.Odate.value.getFullYear() + '-' + String(this.maintainVitalBarForm.controls.Odate.value.getMonth() + 1).padStart(2, '0') + '-' + String(this.maintainVitalBarForm.controls.Odate.value.getDate()).padStart(2, '0') + 'T00:00:00';
    EnteredvitalArr = this.maintainVitalFormitems.value;
    EnteredvitalArr = EnteredvitalArr.filter(element => element.Value !== '')
    const json = {
      "Einri": this.paramsObj.einri,
      "Patnr": this.paramsObj.patnr,
      "Falnr": this.paramsObj.falnr,
      "Lfdnr": this.paramsObj.lfdnr,
      "Orgfa": "",
      "Orgpf": "",
      "Orgdo": this.maintainVitalBarForm.controls.Orgdo.value,
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
        this.showMaintain = false
        this.edit = false;
        Swal.fire({
          text: "Vital signs created successfully",
          icon: 'success',
          confirmButtonText: 'Ok',
          customClass: { popup: 'myalertpopup' }
        } as any)
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
    this.maintainVitalFormitems.clear();
    this.edit = false;
  }

  //create

  private getNewsScoreDefaultVital() {
    const newsScoreVital = this.vitalAllListResp?.find(item => item.Extid === this.newsScoreExtid);

    return {
      "Einri": newsScoreVital?.Einri || "",
      "Valid": newsScoreVital?.Valid || "",
      "ValidVers": newsScoreVital?.ValidVers || "",
      "Bcpid": newsScoreVital?.Bcpid || "",
      "Extid": this.newsScoreExtid,
      "Name": newsScoreVital?.Name || "NEWS_Score",
      "Value": "",
      "ValueString": "",
      "UnitTxt": newsScoreVital?.UnitTxt || "UnLess",
      "NormalRange": newsScoreVital?.NormalRange || "",
      "Origin": "",
      "Descr": "",
      "Obsid": newsScoreVital?.Obsid || "",
      "ObsidVers": newsScoreVital?.ObsidVers || ""
    };
  }

  private ensureNewsScoreDefaultVital() {
    if (!this.vitalDefaultListResp) {
      this.vitalDefaultListResp = [];
    }

    const newsScoreDefaultVital = this.getNewsScoreDefaultVital();
    const newsScoreDefaultIndex = this.vitalDefaultListResp.findIndex(item => item.Extid === this.newsScoreExtid);

    if (newsScoreDefaultIndex === -1) {
      this.vitalDefaultListResp.push(newsScoreDefaultVital);
    } else {
      this.vitalDefaultListResp[newsScoreDefaultIndex] = {
        ...this.vitalDefaultListResp[newsScoreDefaultIndex],
        ...newsScoreDefaultVital
      };
    }

    const maintainVitalItems = this.maintainvitalform.get('maintainVitalFormitems') as FormArray;
    if (!maintainVitalItems || !maintainVitalItems.length) {
      return;
    }

    const newsScoreControl = maintainVitalItems.controls.find(control => control.value.Extid === this.newsScoreExtid);
    if (newsScoreControl) {
      newsScoreControl.patchValue({
        Bcpid: newsScoreDefaultVital.Bcpid,
        Valid: newsScoreDefaultVital.Valid,
        ValidVers: newsScoreDefaultVital.ValidVers,
        UnitTxt: newsScoreDefaultVital.UnitTxt,
        Name: newsScoreDefaultVital.Name
      });
    } else {
      this.addItemForVital(newsScoreDefaultVital);
    }
  }

  CreateVitalList() {
    this.showMaintain = true;
    let createTime = 'PT' + new Date().getHours() + 'H' + new Date().getMinutes() + 'M' + '00S';
    console.log(createTime, "createTime");
    
    // if (this.vitalListResp.length != 0) {
    //   this.maintainVitalBarForm.controls.Orgdo.setValue(this.vitalListResp[0].Orgdo);
    // } else {
    //   this.maintainVitalBarForm.controls.Orgdo.setValue('');
    // }
    this.maintainVitalBarForm.controls.Orgdo.setValue(this.storageService?.patientData?.deptOrgUnit);
    this.maintainVitalBarForm.controls.Vma.setValue(this.storageService.getGpart());
    this.maintainVitalBarForm.controls.Odate.setValue(new Date());
    this.maintainVitalBarForm.controls.Otime.setValue(this.getTime(createTime));
    // this.maintainVitalBarForm.controls.Vma.setValue(this.storageService.getGpart());
    // this.maintainVitalBarForm.controls.Odate.setValue(new Date());
    // this.maintainVitalBarForm.controls.Otime.setValue(this.getTime(createTime));
    this.ensureNewsScoreDefaultVital();
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
  actionVitalSigns(template?) {
    if (this.edit) {
      this.confirmationForChange(template);
      // this.updateVitalSigns();
    } else {
      this.createVitalSigns();
    }
  }
  confirmationForChange(template: TemplateRef<any>) {
    const config: ModalOptions = {
      class: 'modal-dialog-centered',
    };
    this.modalRefForDelete = this.modalService.show(template, config);
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

  selectedData(value: any, event?: any) {
    this.person.forEach((element) => { element.isSelected = false });
    this.person.find(element => element.value === value).isSelected = true;
    const currentDate = new Date();
    let isActiveData = this.listVitals.find(element => element.isActive).ItemName;
    if (value === 'Day') {
      const Fromday = `${formatDate(new Date(new Date().setDate(currentDate.getDate() - 1)), "YYYY-MM-DD")}T${formatDate(new Date(new Date().setDate(currentDate.getDate() - 1)), "HH:mm:ss")}`;
      const Today = `${formatDate(new Date(), "YYYY-MM-DD")}T${formatDate(new Date(), "HH:mm:ss")}`;
      this.orderTemplateAction({ Odatege: `${Fromday}`, Odatele: `${Today}`, Extid: isActiveData });
    }
    else if (value === 'Week') {
      const Fromday = `${formatDate(new Date(new Date().setDate(currentDate.getDate() - 7)), "YYYY-MM-DD")}T${formatDate(new Date(new Date().setDate(currentDate.getDate() - 7)), "HH:mm:ss")}`;
      const Today = `${formatDate(new Date(), "YYYY-MM-DD")}T${formatDate(new Date(), "HH:mm:ss")}`;
      this.orderTemplateAction({ Odatege: `${Fromday}`, Odatele: `${Today}`, Extid: isActiveData });

    }
    else if (value === 'Month') {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - 30);
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
    } else if (value === 'Date' && event && event.length === 2) {
      const [fromDate, toDate] = event.map(date => formatDate(date, "YYYY-MM-DDTHH:mm:ss", "en-US"));
      this.orderTemplateAction({ Odatege: fromDate, Odatele: toDate, Extid: isActiveData });
    }
  }
  getLabelText(ItemName: string, UnitText: string): string {
    if (ItemName === 'Pain score' || ItemName === 'BIS Values') {
      return '';
    } else {
      return UnitText;
    }
  }
  navigationItem(data: VitalItem) {
    this.selectedVital = data;
    this.listVitals.forEach((element) => { element.isActive = false });
    this.listVitals.find(element => element.CatItemKey === data.CatItemKey).isActive = true;
    this.ActiveData = data.PairVital ? this.listVitals.find(element => element.isActive).PairKeyName : this.listVitals.find(element => element.isActive).ItemName;
    this.UnitText = this.listVitals.find(element => element.isActive).UnitText;
    this.person.forEach((element) => { element.isSelected = false });
    this.person[0].isSelected = true;
    let isActiveData = this.person.find(element => element.isSelected).value;
    this.selectedData(isActiveData)
  }


  getRelativeTime(dateStr: string): string {
    if (!dateStr) {
      return '';
    }
    const date = new Date(dateStr);
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - date.getTime();
    const secondsDiff = Math.floor(timeDiff / 1000);
    const minutesDiff = Math.floor(secondsDiff / 60);
    const hoursDiff = Math.floor(minutesDiff / 60);
    const daysDiff = Math.floor(hoursDiff / 24);
    const monthsDiff = Math.floor(daysDiff / 30);
    const yearsDiff = Math.floor(monthsDiff / 12);

    if (yearsDiff > 0) {
      return `${yearsDiff} year${yearsDiff > 1 ? 's' : ''} ago`;
    } else if (monthsDiff > 0) {
      return `${monthsDiff} month${monthsDiff > 1 ? 's' : ''} ago`;
    } else if (daysDiff > 0) {
      return `${daysDiff} day${daysDiff > 1 ? 's' : ''} ago`;
    } else if (hoursDiff > 0) {
      return `${hoursDiff} hour${hoursDiff > 1 ? 's' : ''} ago`;
    } else {
      return 'Within Last Hour';
    }
  }
}
