import { Component, EventEmitter, HostListener, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { EEmrService } from '@services/e-emr.service';
import * as converter from 'xml-js';
import * as _ from 'lodash';
import { ChartService } from '@services/chart.service';
//import { pieChartData } from '../charts';
import { StorageService } from '@services/storage.service';
import { Colors } from '../../services/colors.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-patient-lab',
  templateUrl: './patient-lab.component.html',
  styleUrls: ['./patient-lab.component.scss'],
})
export class PatientLabComponent implements OnInit {
  @Output() public dataCount = new EventEmitter<any>();
  @ViewChild('labpdfmodal') labpdfmodal: TemplateRef<HTMLDivElement>;
  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.showfilter = false;
  }
  showfilter = false;
  dateFrom: Date;
  dateTo: Date;
  dataOnTable = [];
  chartDataConfig: ChartService;
  //pieChartData = pieChartData;
  dropdownSettingsForStatus = {};
  resultStatus: { item_id: number; item_text: string }[];
  selectedItemsForStatus='';
  dropdownListForStatus=[];
  patientMrn:any;
  searchString!: string;
  modalRef: BsModalRef;
  checkedFlag=false;
  notDoneArr=[];
  completedArr=[];
  completedAbnormalArr=[];
  modalForselectedItemsForStatus=[];
  PartiallyAbnormalArr=[];
   pieChartData = {};
  showPie=true;
  pdfUrl: any;
  record: any;
  text='';
  constructor(
    private _dataServices: EEmrService,
    private chartService: ChartService,
    private storageService:StorageService,
    private modalService: BsModalService,
    private sanitizer: DomSanitizer
  ) {
    this.chartDataConfig = this.chartService;
  }

  ngOnInit() {
    // var d = new Date();
    // d.setDate(d.getDate() - 1);
    // this.dateFrom = d;
    this.dateFrom = new Date(new Date().setDate(new Date().getDate()-7));
    this.dateTo = new Date();
    this.filterFieldsStatus();
    this.dropdownSettingsForStatus = {
      singleSelection: false,
      enableCheckAll: false,
      idField: 'Valuekey',
      textField: 'Valuedescr',
      itemsShowLimit: 2,
      allowSearchFilter: false,
      defaultOpen: false,
    };

  }
  public openModalForLabPdf(
    template: TemplateRef<any>,
    data: any
  ) {
    const config: ModalOptions = { class: 'modal-dialog-centered modal-lg' };
      this.modalRef = this.modalService.show(template,config);

  }
  showFilterFn($event) {
    $event.stopPropagation();
    if (this.showfilter) {
      this.showfilter = false;
    } else {
      this.showfilter = true;
    }
  }
  onItemSelectForStatus(item: any) {
    this.selectedItemsForStatus = this.selectedItemsForStatus.concat(
      ';',
      item.Valuekey
    );
    console.log(this.selectedItemsForStatus);
  }
  onDeselectForStatus(item:any ){
    this.selectedItemsForStatus=this.selectedItemsForStatus.replace(item.Valuekey,'')
    }
  filterFieldsStatus() {
    this._dataServices.getfilterFieldsStatusForLab().subscribe(
      (_success: any) => {
        _success = JSON.parse(_success._body);
        if (_success) {
          this.dropdownListForStatus = _success.d.FLDPROPTOVHELP.results;
          this.initialfilterData();
          //this.profileResponse =JSON.parse(_success._body).d.results[0];
        }
      },
      (_error: any) => {}
    );
  }
  initialfilterData(){
    this.resetPiechartData();
    this.dateFrom = new Date(new Date().setDate(new Date().getDate()-7));
    this.dateTo = new Date();
    this.modalForselectedItemsForStatus=[];
    this.patientMrn='';
    let jsonObj = {
      Widgetid: 'MYLAB01',
      Datefrom: this.dateFrom.getFullYear() +'-'+ String(this.dateFrom.getMonth() +1).padStart(2, '0') +'-'+ String(this.dateFrom.getDate()).padStart(2, '0') +'T00:00:00',
      Dateto: this.dateTo.getFullYear() +'-'+String(this.dateTo.getMonth() +1).padStart(2, '0') +'-'+ String(this.dateTo.getDate()).padStart(2, '0')+'T00:00:00',
      Patnr:'',
      Status:'',
      New:"X",
      FilterXml:
        "<?xml version='1.0'?><asx:abap><asx:values><OUTPUT><RSPARAMS><SELNAME>DATE_FIX</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_ANFOE</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_ANPOE</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_DEP</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_ERBOE</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_ETR</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_FALNR</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_LSTAT</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_OSTAT</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>ZISH_LAB</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_OSTAT</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>ZISH_LABE0001</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_OSTAT</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>ZISH_LABE0002</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_OSTAT</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>ZISH_LABE0003</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_OSTAT</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>ZISH_LABE0006</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_OSTAT</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>ZISH_LABE0004</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_OSTAT</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>ZISH_LABE0005</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_OSTAT</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>ZISH_LABE0007</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_OSTAT</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>ZISH_LABE0008</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_PATNR</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_TIME</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_TRT</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>HICSDAMC</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_TRT</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>LABSDAMC</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_TRT</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>MICSDAMC</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_ANFNR</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_ANFTYP</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_ANFWPL</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_ANODOK</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_ANPWPL</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_DEPWPL</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_EINRI</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>1000</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_EINWI2</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_EINWIL</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_ERBWPL</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_ERSDAT</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>X</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_ETRBY</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_ETRWPL</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_GPART</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_GPART2</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>9000000000</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_IGCASE</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_IGNORE</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_LEIDAT</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_MAXROW</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW> 0</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_NUECH2</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_NUECHT</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_OPANFO</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_OPORD</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_ORDNR</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_ORDTYP</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>0050568120581EE8B8D00E37E43DECC5</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_ORODOK</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_PLADAT</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_PREREG</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_SELAKT</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_SERTX2</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_SERTXT</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_STOANF</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_STOORD</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_TRTBY</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>1</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_TRTWPL</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_WUNDAT</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_ZYKLUS</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>TIME_FIX</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_DATUMV</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>20220830</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_DATUMB</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>20221117</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_RSTTXT</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS></OUTPUT></asx:values></asx:abap>",
    };
    this._dataServices.widgetDataFilter(jsonObj).subscribe(
      (_success: any) => {
        //console.log(_success.json());
        //_success = _success.json();
        this.showfilter = false;
        let v = converter.xml2js(_success.d.DataXml, { compact: true });
        //console.log(this.dataOnTable);
        let _dataArray = [];
        let _output = v['asx:abap']['asx:values'].OUTPUT;
        console.log('_output', typeof _output);
        let _parsedDataKeys = Object.keys(v['asx:abap']['asx:values'].OUTPUT);
        _.forEach(_parsedDataKeys, function (dataObj) {
          let _dataValues = [];

          let outputDataValues = _output[dataObj];
          if (outputDataValues.length > 0) {
            _dataValues = outputDataValues;
          } else if (typeof outputDataValues == 'object') {
            _dataValues.push(outputDataValues);
          }

          console.log('data', _dataValues);

          _.forEach(_dataValues, function (dataKeyValue) {
            let _obj = {};
            _.forEach(Object.keys(dataKeyValue), function (key) {
              _obj[key] = _.toString(dataKeyValue[key]._text);
            });
            console.log('obj', _obj);

            _dataArray.push(_obj);
          });

          console.log('asd', _dataArray);
        });
        this.dataOnTable = _dataArray;
        if (this.dataOnTable.length > 0) {
          this.dataOnTable.forEach(element => {
            if (element.ZZRESULT_STATUS_TEXT == 'Not done') {
             this.notDoneArr.push(element);
            }if(element.ZZRESULT_STATUS_TEXT == 'Completed'){
               this.completedArr.push(element);
            }if(element.ZZRESULT_STATUS_TEXT == 'Completed with abnormal'){
               this.completedAbnormalArr.push(element);
            }if(element.ZZRESULT_STATUS_TEXT == 'Partially done with abnormal'){
               this.PartiallyAbnormalArr.push(element);
            }
          });
          if (this.notDoneArr.length > 0 || this.completedArr.length > 0 || this.completedAbnormalArr.length > 0 || this.PartiallyAbnormalArr.length > 0) {
            this.pieChartData = {
              labels: ['Completed', 'Completed with abnormal', 'Partially done with abnormal', 'Not done'],
              datasets: [
                {
                  label: '',
                  borderColor: ['green','red','orange','blue'],
                  backgroundColor: [
                    'green','red','orange','blue'
                  ],
                  borderWidth: 2,
                  data: [this.completedArr.length, this.completedAbnormalArr.length, this.PartiallyAbnormalArr.length ,this.notDoneArr.length]
                }
              ]
            };
          }
        }
        this.dataCount.emit(this.dataOnTable.length);
      },
      (_error: any) => {}
    );
  }

  filterData(dataType?: any) {
    this.resetPiechartData();
    if(dataType == 'clear') {
      this.patientMrn = '';
      this.selectedItemsForStatus = '';
      this.modalForselectedItemsForStatus = [];
    }
    let jsonObj = {
      Widgetid: 'MYLAB01',
      Datefrom: this.dateFrom.getFullYear() +'-'+ String(this.dateFrom.getMonth() +1).padStart(2, '0') +'-'+ String(this.dateFrom.getDate()).padStart(2, '0') +'T00:00:00',
      Dateto: this.dateTo.getFullYear() +'-'+String(this.dateTo.getMonth() +1).padStart(2, '0') +'-'+ String(this.dateTo.getDate()).padStart(2, '0')+'T00:00:00',
      Patnr: this.patientMrn,
      Status:this.selectedItemsForStatus,
      New:"X",
      FilterXml:
        "<?xml version='1.0'?><asx:abap><asx:values><OUTPUT><RSPARAMS><SELNAME>DATE_FIX</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_ANFOE</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_ANPOE</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_DEP</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_ERBOE</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_ETR</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_FALNR</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_LSTAT</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_OSTAT</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>ZISH_LAB</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_OSTAT</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>ZISH_LABE0001</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_OSTAT</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>ZISH_LABE0002</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_OSTAT</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>ZISH_LABE0003</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_OSTAT</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>ZISH_LABE0006</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_OSTAT</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>ZISH_LABE0004</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_OSTAT</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>ZISH_LABE0005</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_OSTAT</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>ZISH_LABE0007</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_OSTAT</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>ZISH_LABE0008</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_PATNR</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_TIME</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_TRT</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>HICSDAMC</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_TRT</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>LABSDAMC</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_TRT</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>MICSDAMC</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_ANFNR</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_ANFTYP</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_ANFWPL</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_ANODOK</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_ANPWPL</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_DEPWPL</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_EINRI</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>1000</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_EINWI2</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_EINWIL</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_ERBWPL</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_ERSDAT</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>X</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_ETRBY</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_ETRWPL</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_GPART</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_GPART2</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>9000000000</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_IGCASE</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_IGNORE</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_LEIDAT</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_MAXROW</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW> 0</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_NUECH2</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_NUECHT</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_OPANFO</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_OPORD</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_ORDNR</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_ORDTYP</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>0050568120581EE8B8D00E37E43DECC5</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_ORODOK</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_PLADAT</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_PREREG</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_SELAKT</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_SERTX2</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_SERTXT</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_STOANF</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_STOORD</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_TRTBY</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>1</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_TRTWPL</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_WUNDAT</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_ZYKLUS</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>TIME_FIX</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_DATUMV</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>20220830</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_DATUMB</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>20221117</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_RSTTXT</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS></OUTPUT></asx:values></asx:abap>",
    };
    this._dataServices.widgetDataFilter(jsonObj).subscribe(
      (_success: any) => {
        //console.log(_success.json());

        //_success = _success.json();
        this.showfilter = false;
        let v = converter.xml2js(_success.d.DataXml, { compact: true });
        //console.log(this.dataOnTable);
        let _dataArray = [];
        let _output = v['asx:abap']['asx:values'].OUTPUT;
        console.log('_output', typeof _output);
        let _parsedDataKeys = Object.keys(v['asx:abap']['asx:values'].OUTPUT);
        _.forEach(_parsedDataKeys, function (dataObj) {
          let _dataValues = [];

          let outputDataValues = _output[dataObj];
          if (outputDataValues.length > 0) {
            _dataValues = outputDataValues;
          } else if (typeof outputDataValues == 'object') {
            _dataValues.push(outputDataValues);
          }
         _.forEach(_dataValues, function (dataKeyValue) {
            let _obj = {};
            _.forEach(Object.keys(dataKeyValue), function (key) {
              _obj[key] = _.toString(dataKeyValue[key]._text);
            });
            _dataArray.push(_obj);
          });


          console.log('asd', _dataArray);
        });
       this.dataOnTable = _dataArray;
       console.log('datatable',this.dataOnTable.length);
       if (this.dataOnTable.length > 0) {
        this.dataOnTable.forEach(element => {
          if (element.ZZRESULT_STATUS_TEXT == 'Not done') {
           this.notDoneArr.push(element);
          }if(element.ZZRESULT_STATUS_TEXT == 'Completed'){
             this.completedArr.push(element);
          }if(element.ZZRESULT_STATUS_TEXT == 'Completed with abnormal'){
             this.completedAbnormalArr.push(element);
          }if(element.ZZRESULT_STATUS_TEXT == 'Partially done with abnormal'){
             this.PartiallyAbnormalArr.push(element);
          }
        });
        if (this.notDoneArr.length > 0 || this.completedArr.length > 0 || this.completedAbnormalArr.length > 0 || this.PartiallyAbnormalArr.length > 0) {
          console.log('length----',this.completedArr.length, this.completedAbnormalArr.length, this.PartiallyAbnormalArr.length ,this.notDoneArr.length);
          this.pieChartData = {
            labels: ['Completed', 'Completed with abnormal', 'Partially done with abnormal', 'Not done'],
            datasets: [
              {
                label: '',
                borderColor: ['green','red','orange','blue'],
                backgroundColor: ['green','red','orange','blue'],
                borderWidth: 2,
                data: [this.completedArr.length, this.completedAbnormalArr.length, this.PartiallyAbnormalArr.length ,this.notDoneArr.length]
              }
            ]
          };
        }
      }
        this.dataCount.emit(this.dataOnTable.length);
      },
      (_error: any) => {}
    );
  }

  getPdf(data){
      this.record = data;
      let jsonObj = {
        ActionXml:"<?xml version=\"1.0\" encoding=\"utf-16\"?><asx:abap version=\"1.0\" xmlns:asx=\"http://www.sap.com/abapxml\"><asx:values><OUTPUT><ACTIONID>ROWCLICK</ACTIONID><SOURCEDATA>&lt;?xml version=&apos;1.0&apos;?&gt;&lt;asx:abap&gt;&lt;asx:values&gt;&lt;OUTPUT&gt;&lt;RN1WPV007_FIELDCAT&gt;&lt;EINRI&gt;1000&lt;/EINRI&gt;&lt;PATNR&gt;0000167289&lt;/PATNR&gt;&lt;PNAMEC&gt;Abdin, Nisreen Abdelwadod A&lt;/PNAMEC&gt;&lt;GSCHLE&gt;F&lt;/GSCHLE&gt;&lt;AGEPAT&gt;45&lt;/AGEPAT&gt;&lt;GPART&gt;9000000671&lt;/GPART&gt;&lt;FALNR&gt;0000628467&lt;/FALNR&gt;&lt;FALAR&gt;2&lt;/FALAR&gt;&lt;FALAR_TXT&gt;Outpatient&lt;/FALAR_TXT&gt;&lt;EBGDT&gt;2023-01-14&lt;/EBGDT&gt;&lt;EBZT&gt;13:36:53&lt;/EBZT&gt;&lt;CORDERID&gt;19AB7674818D1EDDA4FEEB80D2B93E10&lt;/CORDERID&gt;&lt;VKGID&gt;00481288&lt;/VKGID&gt;&lt;LNRLS/&gt;&lt;LFDBEW&gt;00000&lt;/LFDBEW&gt;&lt;LEISTUNG&gt;HCLB00045, HCLB00041&lt;/LEISTUNG&gt;&lt;LEITXT&gt;Partial Thromboplastin Time (PTT), Prothrombin Time (PT-INR)&lt;/LEITXT&gt;&lt;DIAGNOSIS/&gt;&lt;STATUS/&gt;&lt;STATUS_TXT/&gt;&lt;ZZRESULT_STATUS/&gt;&lt;ZZRESULT_STATUS_TEXT&gt;Completed with abnormal&lt;/ZZRESULT_STATUS_TEXT&gt;&lt;ZZN2DOC_KEY&gt;LAB000000000000001000230960401000&lt;/ZZN2DOC_KEY&gt;&lt;ZZLAB_RAD_CHECKED&gt;check_box_outline_blank@Click to set status &quot;Checked&quot;&lt;/ZZLAB_RAD_CHECKED&gt;&lt;ZZLAB_RAD_REPORT&gt;picture_as_pdf@Lab Report PDF&lt;/ZZLAB_RAD_REPORT&gt;&lt;ZZABNMRLPANICEXIST&gt;X&lt;/ZZABNMRLPANICEXIST&gt;&lt;ZZABNMRLPANICEXIST_LOGO&gt;circle icon_red@Abnrmal result exists.&lt;/ZZABNMRLPANICEXIST_LOGO&gt;&lt;/RN1WPV007_FIELDCAT&gt;&lt;/OUTPUT&gt;&lt;/asx:values&gt;&lt;/asx:abap&gt;</SOURCEDATA><FIELDNAME>ZZLAB_RAD_REPORT</FIELDNAME></OUTPUT></asx:values></asx:abap>",
        Actionid: "ROWCLICK",
        Widgetid:"MYLAB01",
        New:"X",
        Fieldname:"ZZLAB_RAD_REPORT",
        Dockey:data.ZZN2DOC_KEY
      }
      this._dataServices.widgetResponseSet(jsonObj).subscribe(
        (_success: any) => {
          if (_success) {
          this.pdfUrl=this.sanitizer.bypassSecurityTrustResourceUrl(_success.d.Url);
          const config: ModalOptions = { class: 'modal-dialog-centered modal-lg' };
      this.modalRef = this.modalService.show(this.labpdfmodal,config);
       }
        },
        (_error: any) => {}
      );
    }
    showPieChart(){
      this.showPie = !this.showPie;
    }

    confirmationMarkAsChecked(data,pdf?){
      this.checkedFlag = null;
      if (data.ZZRESULT_STATUS_TEXT == "Not done" || data.ZZRESULT_STATUS_TEXT == "Completed") {
        if (pdf) {
          this.text = 'You have viewed the document. Do you wish the status to be checked ?';
        }else{
          this.text = 'Do you want to set the status as Checked?';
        }

        Swal.fire({
          title: 'Confirm',
          text: this.text,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes',
          cancelButtonText: 'No'
        }).then((result) => {
          if (result.value) {
           this.markAsChecked(data)
          }
          this.checkedFlag = false;
        })
      } else {
        if (pdf) {
          this.text = '<p style="font-size:1.125em">You have viewed the document. Do you wish the status to be checked? Caution: Order has <span style="color:red">Panic/Abnormal</span> result!</p>';

        }else{
          this.text = '<p style="font-size:1.125em">Some of the services has <span style="color:red;">Panic/Abnormal</span> result. Do you still want to continue?</p>';
        }

        Swal.fire({
          title: 'Confirm',
          html:this.text,
          //text: this.text,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes',
          cancelButtonText: 'No'
        }).then((result) => {
          if (result.value) {
            this.markAsChecked(data)
           }
          this.checkedFlag = false;
        })
      }

    }

    markAsChecked(data){
      let jsonObj = {
        ActionXml:"<?xml version=\"1.0\" encoding=\"utf-16\"?><asx:abap version=\"1.0\" xmlns:asx=\"http://www.sap.com/abapxml\"><asx:values><OUTPUT><ACTIONID>ROWCLICK</ACTIONID><SOURCEDATA>&lt;?xml version=&apos;1.0&apos;?&gt;&lt;asx:abap&gt;&lt;asx:values&gt;&lt;OUTPUT&gt;&lt;RN1WPV007_FIELDCAT&gt;&lt;EINRI&gt;1000&lt;/EINRI&gt;&lt;PATNR&gt;0000167289&lt;/PATNR&gt;&lt;PNAMEC&gt;Abdin, Nisreen Abdelwadod A&lt;/PNAMEC&gt;&lt;GSCHLE&gt;F&lt;/GSCHLE&gt;&lt;AGEPAT&gt;45&lt;/AGEPAT&gt;&lt;GPART&gt;9000000671&lt;/GPART&gt;&lt;FALNR&gt;0000628467&lt;/FALNR&gt;&lt;FALAR&gt;2&lt;/FALAR&gt;&lt;FALAR_TXT&gt;Outpatient&lt;/FALAR_TXT&gt;&lt;EBGDT&gt;2023-01-14&lt;/EBGDT&gt;&lt;EBZT&gt;13:36:53&lt;/EBZT&gt;&lt;CORDERID&gt;19AB7674818D1EDDA4FEEB80D2B93E10&lt;/CORDERID&gt;&lt;VKGID&gt;00481288&lt;/VKGID&gt;&lt;LNRLS/&gt;&lt;LFDBEW&gt;00000&lt;/LFDBEW&gt;&lt;LEISTUNG&gt;HCLB00045, HCLB00041&lt;/LEISTUNG&gt;&lt;LEITXT&gt;Partial Thromboplastin Time (PTT), Prothrombin Time (PT-INR)&lt;/LEITXT&gt;&lt;DIAGNOSIS/&gt;&lt;STATUS/&gt;&lt;STATUS_TXT/&gt;&lt;ZZRESULT_STATUS/&gt;&lt;ZZRESULT_STATUS_TEXT&gt;Completed with abnormal&lt;/ZZRESULT_STATUS_TEXT&gt;&lt;ZZN2DOC_KEY&gt;LAB000000000000001000230960401000&lt;/ZZN2DOC_KEY&gt;&lt;ZZLAB_RAD_CHECKED&gt;check_box_outline_blank@Click to set status &quot;Checked&quot;&lt;/ZZLAB_RAD_CHECKED&gt;&lt;ZZLAB_RAD_REPORT&gt;picture_as_pdf@Lab Report PDF&lt;/ZZLAB_RAD_REPORT&gt;&lt;ZZABNMRLPANICEXIST&gt;X&lt;/ZZABNMRLPANICEXIST&gt;&lt;ZZABNMRLPANICEXIST_LOGO&gt;circle icon_red@Abnrmal result exists.&lt;/ZZABNMRLPANICEXIST_LOGO&gt;&lt;/RN1WPV007_FIELDCAT&gt;&lt;/OUTPUT&gt;&lt;/asx:values&gt;&lt;/asx:abap&gt;</SOURCEDATA><FIELDNAME>ZZLAB_RAD_REPORT</FIELDNAME></OUTPUT></asx:values></asx:abap>",
        Actionid: "ZCNFRMCHK",
        Widgetid:"MYLAB01",
        New:"X",
        Dockey:data.ZZN2DOC_KEY
      }
      this._dataServices.widgetResponseSet(jsonObj).subscribe(
        (_success: any) => {
          if (_success) {
         this.filterData();
       }
        },
        (_error: any) => {}
      );
    }

    closePdfModal(){
      this.modalRef.hide();
      this.confirmationMarkAsChecked(this.record,'pdf');
    }

    resetPiechartData(){
      this.notDoneArr=[];
      this.completedArr=[];
      this.completedAbnormalArr=[];
      this.PartiallyAbnormalArr=[];
      this.pieChartData={};
      this.dataOnTable=[];
    }
}
