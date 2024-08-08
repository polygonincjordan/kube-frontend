import { DatePipe } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from '@services/data.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { HelperService } from '@services/helper.service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import swal from 'sweetalert2';
import { FeeServiceFilterObject } from './interface/fee-list.interface';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class FeeListService {
  Authorization: string;
  token: string;
  public constants = {
    einri: '',
    falnr: '',
    lfdnr: '',
    patnr: '',
    intDept: '',
    intOrg: '',
  };

  // Search set filters
  labOrdersSearchList: any = [];
  radOrdersSearchList: any = [];
  procedureSearchList: any = [];
  medicationSearchList: any = [];

  // UserData
  public userData: any = {};

  // ----------------- Search List -----------------
  public tempObject: any = {};
  public organizations: any;
  public modalRefSelectOrg: any;
  public ePrescriptionObject: any;
  public ePrescriptionEntry: any = {
    form: '',
    prnText: '',
    prnIndicatorText: '',
    frequencyId: '',
    isPrn: false,
  };
  public frequencyObject: any;
  public durationObject: any;
  events: any;
  _loader: any;

  //----------------- Order History -----------------
  public historyOrders: any;
  public eOrdersMaster: any;
  public eOrders: any;
  public feeServiceData: any;
  public feeServiceOrderData: any;
  public feeServiceSearchData: any;
  public feeOrderHistory: any;
  public deleteOrders: any;
  public editeOrders: any;
  public localizationList: any = [];
  public searchString = '';
  public searchMedString = '';
  public historysearchString = '';
  public searchFeestring = '';
  public navigationTab: any;
  public historyChecked: any = [];
  public tempalteData: any;
  public templateMedData: any = [];
  public templateData: any;
  public configurationoption: any;
  public configurationoptionBackup: any;
  public switchMode = {
    name: 'history',
  };
  public templatedescription = '';
  public errorMsg = '';
  modalRef?: BsModalRef | null;
  loadquestionsviewcontainerref: any;

  isFilterDataPopup = new Subject<any>()
  public getOrderSetData: any;
  public getFavSetData: any;
  getOrderSetDataBySubtitles: any;
  private paramsValue: any;
  private jsonObj: FeeServiceFilterObject;

  constructor(
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private dataService: DataService,
    private domSanitizer: DomSanitizer,
    public modalService: BsModalService,
    public emergencyService: EmergencyService,
    public opentempmodalservices: NgbModal,
    private http: HttpClient,
    @Inject(DatePipe) private datePipe: DatePipe,
    @Inject(HelperService) private uiHelper: HelperService,
  ) {

    this.route.queryParams.subscribe((params) => {
      this.paramsValue = params;
      this.jsonObj = {
        Einri: this.paramsValue.einri,
        Falnr: this.paramsValue.falnr,
        Search: ``,
        Patnr: this.paramsValue.patnr,
        Lfdnr: this.paramsValue.lfdnr,
        Nav: this.paramsValue.Nav,
      }
    });
  }

  clearData() {
    this.historyOrders = [];
    this.feeOrderHistory = [];
    this.eOrders = null;
    this.eOrdersMaster = null;
    this.feeServiceData = null;
    this.medicationSearchList = null
    this.feeServiceOrderData = null
  }


  loadParameters() {
    localStorage.setItem(
      'patnr',
      this.route.snapshot.queryParamMap.get('patnr')
    );
    localStorage.setItem(
      'falnr',
      this.route.snapshot.queryParamMap.get('falnr')
    );
    localStorage.setItem(
      'einri',
      this.route.snapshot.queryParamMap.get('einri')
    );
    localStorage.setItem(
      'lfdnr',
      this.route.snapshot.queryParamMap.get('lfdnr')
    );
    localStorage.setItem('intDept', 'LABMDAMC');
    localStorage.setItem('initOrg', 'HICSDAMC');
    this.constants = {
      einri: '',
      falnr: '',
      lfdnr: '',
      patnr: '',
      intDept: '',
      intOrg: '',
    };
    if (!this.constants.falnr) {
      this.constants.falnr = localStorage.getItem('falnr');
    }
    if (!this.constants.patnr) {
      this.constants.patnr = localStorage.getItem('patnr');
    }
    if (!this.constants.einri) {
      this.constants.einri = localStorage.getItem('einri');
    }
    if (!this.constants.lfdnr) {
      this.constants.lfdnr = localStorage.getItem('lfdnr');
    }
  }

  onNavigationClick(element: any) {
    if (element && element.length > 0) {
      switch (element) {
        case 'Fees':
          this.navigationTab = 'Fees';
          this.clearData();
          this.loadHistory();
          this.loadFeesOrder();
          break;
      }
    }
  }

  getOrderSetBySubtitles(data) {
    const json = {
      Id: data.Id,
      Stid: data.Stid
    }
    this.emergencyService.getOrderSetBySubtitles(json).subscribe(
      (_success: any) => {
        if (_success) {
          // _success = JSON.parse(_success._body);

          this.getOrderSetDataBySubtitles = _success.d.results;
          return this.getOrderSetDataBySubtitles.forEach(element => {
            element["isSelect"] = false;
          });
          //  if (this.getOrderSetData.length >0) {
          //   this.selectedData = this.getOrderSetData[0];
          //   this.selectSet(this.selectedData);
          //  }
        }
      },
      (_error: any) => { }
    );
  }
  getOrderSet() {
    const json = {
      falnr: this.constants.falnr,
      einri: this.constants.einri
    }
    this.emergencyService.getOrderSet(json).subscribe(
      (_success: any) => {
        if (_success) {
          // _success = JSON.parse(_success._body);

          this.getOrderSetData = _success.d.results;
          this.getOrderSetData.forEach(element => {
            element["isSelect"] = false;
          });
          //  if (this.getOrderSetData.length >0) {
          //   this.selectedData = this.getOrderSetData[0];
          //   this.selectSet(this.selectedData);
          //  }
        }
      },
      (_error: any) => { }
    );
  }

  getFavSet() {
    this.emergencyService.getFavSet().subscribe(
      (_success: any) => {
        if (_success) {
          // _success = JSON.parse(_success._body);

          this.getFavSetData = _success.d.results;
          this.getFavSetData.forEach(element => {
            element["isSelect"] = false;
          });
          //  if (this.getFavSetData.length >0) {
          //   this.selectedData = this.getOrderSetData[0];
          //   this.selectSet(this.selectedData);
          //  }
        }
      },
      (_error: any) => { }
    );
  }

  loadeOrderData() {
    this.loadParameters();
    this.loadHistory();
    if (
      this.constants.patnr !== undefined &&
      this.constants.falnr !== undefined &&
      this.constants.einri !== undefined
    ) {
      // this.loadPatientData(this.route.snapshot.queryParamMap.get('patnr'),this.route.snapshot.queryParamMap.get('falnr'),this.route.snapshot.queryParamMap.get('einri'));
      this.clearData();
      this.loadParameters();
      this.loadConfiguration();
    }
  }

  loadClinicalOrder() {
    this.loadFavouriteData();
    this.loadLocalization();
    this.loadHistory();
    if (this.eOrders === null) {
      this.switchMode.name = 'history';
    }
  }

  loadMedicalOrder() {
    this.loadMedicalData();
    this.loadFrequency();
    this.loadDuration();
    this.loadHistory();
    if (this.eOrders === null) {
      this.switchMode.name = 'history';
    }
  }

  loadFeesOrder() {
    this.loadFeeService();
    // this.loadFeeOrderSet();
  }

  loadConfiguration() {
    this.spinner.show();
    this.dataService.getOrderConfigset("OrderConfigSet('ABAP05')").subscribe(
      (resp: any) => {
        if (resp._body) {
          const data = JSON.parse(resp._body);
          if (data && data.d) {
            this.configurationoption = data.d;
            this.configurationoptionBackup = JSON.parse(JSON.stringify(data.d));
            this.configurationoptionBackup.Clinicord ? this.navigationTab = 'Clinical' : this.configurationoptionBackup.Medicat ? this.navigationTab = 'Medications' : this.configurationoptionBackup.Doctfees ? this.navigationTab = 'Fees' : ''
            if (this.configurationoptionBackup.Clinicord) {
              this.loadClinicalOrder();
            }
            if (this.configurationoptionBackup.Medicat) {
              this.loadMedicalOrder();
            }
            if (this.configurationoptionBackup.Doctfees) {
              this.loadFeesOrder();
            }
          }
          this.spinner.hide();
        }
      },
      (error: any) => {
        this.spinner.hide();
      }
    );
  }

  saveConfiguration() {
    this.spinner.show();
    this.dataService
      .postData('OrderConfigSet', this.configurationoption, false)
      .subscribe(
        (_success: any) => {
          this.spinner.hide();
          this.opentempmodalservices.dismissAll();
          this.loadeOrderData();
        },
        (_error: any) => {
          this.spinner.hide();
          this.opentempmodalservices.dismissAll();
          this.loadeOrderData();
        }
      );
  }

  // loadPatientData(_patnr: any, _falnr: any, _einri: any) {
  //   let falnr = _falnr ? _falnr : this.storageService.getLocal('falnr');
  //   let caseArray = [falnr];
  //   this.spinner.show();
  //   let expandEntities = [
  //     'CASTOPATSET/NAVTOALLERGY',
  //     'CASTOPATSET/PATTORISKFACTORSET',
  //     'CASTODIASET',
  //     'CASTOPHYSSET',
  //     'CASTOPATSET/PATTOIMAGE',
  //     'CASTOMOVEMENTSET',
  //   ];
  //   this.dataService
  //     .loadData(
  //       'CASESET',
  //       caseArray,
  //       'falnr',
  //       false,
  //       expandEntities,
  //       true,
  //       true,
  //       true,
  //       false,
  //       true
  //     )
  //     .subscribe(
  //       (resp: any) => {
  //         let success = resp;
  //         if (resp._body) {
  //           success = JSON.parse(resp._body);
  //         }
  //         let data = success.d.results[0].CASTOPATSET;
  //         let dob = data.gbdat.replace(/[^0-9]/g, '');
  //         this.userData.patientName = data.patnamefull;
  //         this.userData.age = data.age;
  //         this.userData.sex = data.sex;
  //         this.userData.email = data.email;
  //         this.userData.dob = dob
  //           ? this.datePipe.transform(dob, 'dd.MM.YYYY')
  //           : '';
  //         this.userData.patnr = data.patnr;
  //         this.userData.case = success.d.results[0].falnr;
  //         this.userData.deparment = success.d.results[0].deptorgna;
  //         this.userData.attendingPhysician =
  //           success.d.results[0].CASTOPHYSSET.results.length > 0
  //             ? success.d.results[0].CASTOPHYSSET.results[0].physname
  //             : '';
  //         let allergies: any = [];
  //         data.NAVTOALLERGY.results.forEach((obj: any) => {
  //           allergies.push('\n' + obj.descr);
  //         });

  //         this.userData.image =
  //           data.PATTOIMAGE.image_binary !== null &&
  //             data.PATTOIMAGE.image_binary !== ''
  //             ? this.domSanitizer.bypassSecurityTrustResourceUrl(
  //               'data:image/jpg;base64,' + data.PATTOIMAGE.image_binary
  //             )
  //             : this.uiHelper.getBase64String(this.userData.sex);
  //         this.userData.imageExist =
  //           data.PATTOIMAGE.image_binary !== null &&
  //           data.PATTOIMAGE.image_binary !== '';
  //         this.userData.allergies =
  //           allergies.length > 0 ? allergies.toString() : 'N/A';
  //         this.userData.payerType = success.d.results[0].FinCat;
  //         const movmntSeqData =
  //           success.d.results[0].CASTOMOVEMENTSET?.results.filter(
  //             (obj: any) =>
  //               obj['movmntSeq'] === this.storageService.lfdnr
  //           );
  //         const intDeptData =
  //           movmntSeqData && movmntSeqData.length
  //             ? movmntSeqData[0]['departmentOrg']
  //             : null;
  //         this.storageService.setLocal('intDept', intDeptData);

  //         const intOrgData =
  //           movmntSeqData && movmntSeqData.length
  //             ? movmntSeqData[0]['nursingOrg']
  //             : null;
  //         this.storageService.setLocal('initOrg', intOrgData);
  //         this.loadFavouriteData();
  //         this.spinner.hide();
  //       },
  //       (_error: any) => {
  //         this.spinner.hide();
  //       }
  //     );
  // }

  loadLocalization() {
    let _filter = {
      Einri: this.constants.einri
        ? this.constants.einri
        : this.storageService.getLocal('einri'),
    };
    let expandEntities: any = [];
    this.dataService
      .loadData(
        'LocalizationSet',
        null,
        _filter,
        false,
        expandEntities,
        true,
        true,
        false,
        false,
        true
      )
      .subscribe(
        (resp: any) => {
          let success = resp;
          if (resp._body) {
            success = JSON.parse(resp._body);
          }
          success.d.results.forEach((obj) => {
            obj.code = obj.Dialo;
            obj.description = obj.Dialotext;
          });
          this.localizationList = success.d.results;
        },
        (_error: any) => { }
      );
  }

  loadFavouriteData() {
    this.spinner.show();
    const intDeptVal = this.storageService.getLocal('intDept')
      ? this.storageService.getLocal('intDept')
      : localStorage.getItem('intDept');
    const initOrgVal = this.storageService.getLocal('initOrg')
      ? this.storageService.getLocal('initOrg')
      : localStorage.getItem('initOrg');
    let _filter = {
      einri: this.constants.einri
        ? this.constants.einri
        : this.storageService.getLocal('einri'),
      falnr: this.constants.falnr
        ? this.constants.falnr
        : this.storageService.getLocal('falnr'),
      intDept: this.constants.intDept ? this.constants.intDept : intDeptVal,
      initOrg: this.constants.intOrg ? this.constants.intOrg : initOrgVal,
    };
    let expandEntities = ['TOLABSET', 'TORADSET', 'TOPROCSET', 'TOMEDICDRGSET'];
    this.dataService
      .loadData(
        'SearchSet',
        null,
        _filter,
        false,
        expandEntities,
        true,
        true,
        false,
        false,
        true
      )
      .subscribe(
        (resp: any) => {
          let success = resp;
          if (resp._body) {
            success = JSON.parse(resp._body);
          }
          if (success.d.results.length > 0) {
            if (
              success.d.results[0].TOLABSET?.results &&
              success.d.results[0].TOLABSET?.results.length
            ) {
              success.d.results[0].TOLABSET.results.forEach((obj: any) => {
                obj.id = obj.service;
                obj.text = obj.serviceDescr;
                obj.isFavourite = obj.Fav;
                obj.icon = obj.isFavourite ? 'star' : 'star_border';
                obj.isSelected = false;
                obj.type = 'LAB';
              });

              this.labOrdersSearchList =
                success.d.results[0].TOLABSET.results
            }

            if (
              success.d.results[0].TORADSET?.results &&
              success.d.results[0].TORADSET?.results.length
            ) {
              success.d.results[0].TORADSET.results.forEach((obj: any) => {
                obj.id = obj.service;
                obj.text = obj.serviceDescr;
                obj.isFavourite = obj.Fav;
                obj.icon = obj.isFavourite ? 'star' : 'star_border';
                obj.isSelected = false;
                obj.type = 'RAD';
              });

              this.radOrdersSearchList =
                success.d.results[0].TORADSET.results
            }

            if (
              success.d.results[0].TOPROCSET?.results &&
              success.d.results[0].TOPROCSET?.results.length
            ) {
              success.d.results[0].TOPROCSET.results.forEach((obj: any) => {
                obj.id = obj.service;
                obj.text = obj.serviceDescr;
                obj.isFavourite = obj.Fav;
                obj.icon = obj.isFavourite ? 'star' : 'star_border';
                obj.isSelected = false;
                obj.type = 'PROC';
              });

              this.procedureSearchList =
                success.d.results[0].TOPROCSET.results
            }

            this.spinner.hide();
          }
        },
        (_error: any) => {
          this.spinner.hide();
        }
      );
  }

  loadMedicalData() {
    this.spinner.show();
    let _filter = {
      Einri: this.constants.einri
        ? this.constants.einri
        : this.storageService.getLocal('einri'),
      Falnr: this.constants.falnr
        ? this.constants.falnr
        : this.storageService.getLocal('falnr'),
      Searchtype: 'B',
    };
    let expandEntities = ['TODURG', 'TOTEMPLATE'];
    this.dataService
      .loadData(
        'SearchMSet',
        null,
        _filter,
        false,
        expandEntities,
        true,
        true,
        false,
        false,
        false
      )
      .subscribe(
        (resp: any) => {
          this.spinner.hide();
          let success = resp;
          if (resp._body) {
            success = JSON.parse(resp._body);
          }
          if (success.d.results && success.d.results.length > 0) {
            if (
              success.d.results[0].TODURG.results &&
              success.d.results[0].TODURG.results.length
            ) {
              success.d.results[0].TODURG.results.forEach((obj: any) => {
                obj.id = obj.Agentid;
                obj.text = obj.Drugname;
                obj.icon = obj.Favourite ? 'star' : 'star_border';
                obj.isSelected = false;
                obj.type = 'MED';
                obj.formulaDesc = obj.Phform;
                obj.routeDesc = obj.Routedescr;
                obj.drugId = obj.Drugid;
                obj.drugName = obj.ResultDrugName;
                obj.drugStock = obj.Stocktext;
                obj.drugUnit = obj.Unit;
                obj.drugAvailability = obj.Showstock;
                obj.drugAgent = obj.Agent;
                obj.drugAgentId = obj.Agentid;
                obj.drugCategory = obj.srchtyp == 'B' ? 'Brand' : 'Generic';
                obj.drugIcon =
                  obj.srchtyp == 'B'
                    ? 'assets/images/icons/icon_brand.svg'
                    : 'assets/images/icons/icon_generic.svg';
                obj.dosageCountDesc = obj.dosageCountDesc ? obj.dosageCountDesc : '';
              });
            }
            if (
              success.d.results[0].TOTEMPLATE?.results &&
              success.d.results[0].TOTEMPLATE?.results.length
            ) {
              success.d.results[0].TOTEMPLATE.results.forEach((obj: any) => {
                obj.id = obj.Prscrid;
                obj.isFavourite = obj.Favourite;
                obj.isSelected = false;
                obj.type = 'TEMPLATE';
                obj.text = obj.Descr;
                obj.templateProcesslevel = obj.Tmpaccesslevel;
                obj.drugStock = obj.Stock;
              });
            }
            this.medicationSearchList = [
              {
                ...success.d.results[0],
                TODURG: {
                  results: success.d.results[0].TODURG.results
                },
                TOTEMPLATE: {
                  results: success.d.results[0].TOTEMPLATE.results
                },
              },
            ];
          }
        },
        (_error: any) => {
          // that._loader.hideLoader();
        }
      );
  }

  loadFrequency() {
    this.spinner.show();
    let filter = {
      Inst: this.constants.einri
        ? this.constants.einri
        : this.storageService.getLocal('einri'),
    };
    this.dataService
      .loadData(
        'FrequencySet',
        null,
        filter,
        false,
        null,
        false,
        true,
        false,
        true,
        true
      )
      .subscribe(
        (resp: any) => {
          this.spinner.hide();
          let success = resp;
          if (resp._body) {
            success = JSON.parse(resp._body);
          }
          if (success.d.results && success.d.results.length) {
            success.d.results.forEach((obj: any) => {
              obj.id = obj.CycleKey;
              obj.frequencyDesc = obj.Text;
            });
            this.frequencyObject = success.d.results;
          }
        },
        (_error: any) => {
          // this._loader.hideLoader();
        }
      );
  }

  loadDuration() {
    this.dataService
      .loadData(
        'DurationUnitSet',
        null,
        null,
        false,
        null,
        false,
        true,
        false,
        true,
        true
      )
      .subscribe(
        (resp: any) => {
          let success = resp;
          if (resp._body) {
            success = JSON.parse(resp._body);
          }
          if (success.d.results && success.d.results.length) {
            success.d.results.forEach((obj: any) => {
              obj.durationid = obj.Unit;
              obj.durationDesc = obj.Text;
            });

            this.durationObject = success.d.results;
          }
        },
        (_error: any) => { }
      );
  }

  selectedValue(object, objarray: any, valueType: any, data: any) {
    let getformulaId;
    let getfrequencyId;
    let getrouteId;
    // let getfrequencyId = '';
    switch (valueType) {
      case 'DRUGFORMAT':
        if (object) {
          this.ePrescriptionEntry['form'] = objarray.find(
            (item: any) => item['Unit'] === object
          ).form;
          getformulaId = objarray.find(
            (item: any) => item['Unit'] === object
          ).formId;
          getrouteId = objarray.find(
            (item: any) => item['Unit'] === object
          ).RouteID;
        }
        break;
      case 'FREQUENCY':
        if (object) {
          getfrequencyId = objarray.find((item: any) => item['frequencyDesc'] === object).id;
        }
        break;
    }
    if (this.eOrders && this.eOrders.length > 0) {
      this.eOrders.forEach((element: any) => {
        element.groupItem.forEach((item: any) => {
          if (item.Drugid === data.Drugid) {
            if (getformulaId !== undefined) {
              item.formulaId = getformulaId,
                item.PHFORMID = getformulaId
            }
            if (getfrequencyId !== undefined) {
              item.frequencyId = getfrequencyId;
              item.N1ZNR = getfrequencyId;
            }
            if (getrouteId !== undefined) {
              item.RouteID = getrouteId;
              item.APROUTEID = getrouteId;
            }
          }
        })
      })
    }
  }

  searchlistData(event: any) {
    if (event.length >= 3) {
      this.loadData(event);
    } else if (event.length === 0) {
      this.loadFavouriteData();
    }
  }

  searchMedData(event: any) {
    if (event.length >= 3) {
      this.loadMedData(event);
    } else if (event.length === 0) {
      this.loadMedicalData();
    }
  }

  searchFeeData(event: any) {
    if (event.length >= 3) {
      this.loadFeeData(event);
    } else if (event.length === 0) {
      this.loadFeeService();
    }
  }

  loadData(searchString: any) {
    const intDeptVal = this.storageService.getLocal('intDept')
      ? this.storageService.getLocal('intDept')
      : localStorage.getItem('intDept');
    const initOrgVal = this.storageService.getLocal('initOrg')
      ? this.storageService.getLocal('initOrg')
      : localStorage.getItem('initOrg');
    let _filter = {
      einri: this.constants.einri
        ? this.constants.einri
        : this.storageService.getLocal('einri'),
      falnr: this.constants.falnr
        ? this.constants.falnr
        : this.storageService.getLocal('falnr'),
      searchString:
        searchString && searchString !== '' ? searchString : this.searchString,
      intDept: this.constants.intDept ? this.constants.intDept : intDeptVal,
      initOrg: this.constants.intOrg ? this.constants.intOrg : initOrgVal,
    };
    let expandEntities = ['TOLABSET', 'TORADSET', 'TOPROCSET', 'TOMEDICDRGSET'];
    this.dataService
      .loadData(
        'SearchSet',
        null,
        _filter,
        false,
        expandEntities,
        true,
        true,
        false,
        false,
        true
      )
      .subscribe(
        (resp: any) => {
          let success = resp;
          if (resp._body) {
            success = JSON.parse(resp._body);
          }
          if (success.d.results.length > 0) {
            if (success.d.results[0].TOLABSET.results) {
              success.d.results[0].TOLABSET.results.forEach((obj) => {
                obj.id = obj.service;
                obj.text = obj.serviceDescr;
                obj.isFavourite = obj.Fav;
                obj.icon = obj.isFavourite ? 'star' : 'star_border';
                obj.isSelected = false;
                obj.type = 'LAB';
              });
              this.labOrdersSearchList =
                success.d.results[0].TOLABSET.results
            }
            if (success.d.results[0].TORADSET.results) {
              success.d.results[0].TORADSET.results.forEach((obj) => {
                obj.id = obj.service;
                obj.text = obj.serviceDescr;
                obj.isFavourite = obj.Fav;
                obj.icon = obj.isFavourite ? 'star' : 'star_border';
                obj.isSelected = false;
                obj.type = 'RAD';
              });
              this.radOrdersSearchList =
                success.d.results[0].TORADSET.results
            }
            if (success.d.results[0].TOPROCSET.results) {
              success.d.results[0].TOPROCSET.results.forEach((obj) => {
                obj.id = obj.service;
                obj.text = obj.serviceDescr;
                obj.isFavourite = obj.Fav;
                obj.icon = obj.isFavourite ? 'star' : 'star_border';
                obj.isSelected = false;
                obj.type = 'PROC';
              });
              this.procedureSearchList =
                success.d.results[0].TOPROCSET.results
            }
            // if(success.d.results[0].TOMEDICDRGSET.results.length > 0){
            //   success.d.results[0].TOMEDICDRGSET.results.forEach((obj)=> {
            //     obj.id = obj.agentID;
            //     obj.text = obj.ResultDrug;
            //     obj.isFavourite = obj.favourite;
            //     obj.icon = obj.isFavourite ? 'star' : 'star_border';
            //     obj.isSelected = false;
            //     obj.type = "MED";
            //     obj.drugId = obj.DrugID;
            //     obj.drugName = obj.ResultDrug;
            //     obj.drugStock = obj.Stock;
            //     obj.drugUnit = obj.Unit;
            //     obj.drugAvailability = obj.StockText;
            //     obj.drugAvailabilityCentral = obj.StockTextCentral;
            //     obj.isStockCentralExist = obj.StockTextCentral.toString().trim() == "" ? false : true;
            //     obj.drugAgent = obj.agent;
            //     obj.drugAgentId = obj.agentID;
            //     obj.drugCategory = obj.srchtyp == 'B' ? 'Brand' : 'Generic';
            //     obj.drugIcon = obj.srchtyp == 'B' ? 'assets/images/icons/icon_brand.svg' : 'assets/images/icons/icon_generic.svg';
            //   });
            //   this.medicationSearchList = success.d.results[0].TOMEDICDRGSET.results;
            // }
          }
        },
        (_error: any) => { }
      );
  }

  loadMedData(searchString: any) {
    this.spinner.show();
    let _filter = {
      Einri: this.constants.einri
        ? this.constants.einri
        : this.storageService.getLocal('einri'),
      Falnr: this.constants.falnr
        ? this.constants.falnr
        : this.storageService.getLocal('falnr'),
      SearchString:
        searchString && searchString !== '' ? searchString : this.searchString,
      Searchtype: 'B',
    };
    let expandEntities = ['TODURG', 'TOTEMPLATE'];
    this.dataService
      .loadData(
        'SearchMSet',
        null,
        _filter,
        false,
        expandEntities,
        true,
        true,
        false,
        false,
        false
      )
      .subscribe(
        (resp: any) => {
          this.spinner.hide();
          let success = resp;
          if (resp._body) {
            success = JSON.parse(resp._body);
          }
          if (success.d.results && success.d.results.length) {
            if (success.d.results[0].TODURG?.results) {
              success.d.results[0].TODURG.results.forEach((obj: any) => {
                obj.id = obj.AgentID;
                obj.text = obj.Drugname;
                obj.icon = obj.Favourite ? 'star' : 'star_border';
                obj.isSelected = false;
                obj.type = 'MED';
                obj.formulaDesc = obj.Phform;
                obj.routeDesc = obj.Routedescr;
                obj.drugId = obj.Drugid;
                obj.drugName = obj.ResultDrugName;
                obj.drugStock = obj.Stocktext;
                obj.drugUnit = obj.Unit;
                obj.drugAvailability = obj.Showstock;
                obj.drugAgent = obj.Agent;
                obj.drugAgentId = obj.Agentid;
                obj.drugCategory = obj.srchtyp == 'B' ? 'Brand' : 'Generic';
                obj.drugIcon = obj.srchtyp == 'B' ? 'assets/images/icons/icon_brand.svg' : 'assets/images/icons/icon_generic.svg';
                obj.dosageCountDesc = obj.Unittext;
                obj.Meins = obj.Meins;

              });
            }
            if (success.d.results[0].TOTEMPLATE?.results) {
              success.d.results[0].TOTEMPLATE.results.forEach((obj: any) => {
                obj.id = obj.Prscrid;
                obj.isFavourite = obj.Favourite;
                obj.isSelected = false;
                obj.type = 'TEMPLATES';
                obj.text = obj.Descr;
                obj.templateProcesslevel = obj.Tmpaccesslevel;
                obj.drugStock = obj.Stock;
              });
            }
            this.medicationSearchList = [
              {
                ...success.d.results[0],
                TODURG: {
                  results: success.d.results[0].TODURG.results
                },
                TOTEMPLATE: {
                  results: success.d.results[0].TOTEMPLATE.results
                },
              },
            ];
          }
        },
        (_error: any) => {
          // that._loader.hideLoader();
        }
      );
  }

  loadFeeData(searchstring: any) {
    this.spinner.show();
    let filter = {
      Einri: this.jsonObj.Einri,
      Falnr: this.jsonObj.Falnr,
      Nursing: true,
      Searchstring: searchstring && searchstring !== '' ? searchstring : this.searchString,
    };
    let expandEntities = [];
    this.dataService
      .loadData(
        'FeeServiceSearchSet',
        null,
        filter,
        false,
        expandEntities,
        false,
        true,
        false,
        false,
        false
      )
      .subscribe(
        (resp: any) => {
          let success = resp;
          if (resp._body) {
            success = JSON.parse(resp._body);
          }
          if (success.d.results) {
            success.d.results.forEach((obj: any, index: any) => {
              obj.id = index;
              obj.icon = obj.Favourite ? 'star' : 'star_border';
              (obj.text = obj.Ktxt1),
                (obj.price = obj.Price),
                (obj.feeUnit = obj.Unit),
                (obj.einri = obj.Einri),
                (obj.falnr = obj.Falnr),
                (obj.talst = obj.Talst),
                (obj.tarif = obj.Tarif);
              obj.pricewithUnit = obj.Price.concat(' ' + obj.Unit);
            });
            this.feeServiceSearchData = success.d.results;
            this.spinner.hide();
          }
        },
        (_error: any) => {
          this.spinner.hide();
        }
      );
  }

  createFavourite(object: any) {
    this.spinner.show();
    if (object.isFavourite) {
      let postObject: any = {};
      postObject['Einri'] = object.einri;
      postObject['Tarif'] = object.catalogkey;
      postObject['Talst'] = object.service;

      this.dataService
        .postData('ClinFavouriteSet', postObject, false)
        .subscribe(
          (_success: any) => {
            this.spinner.hide();
          },
          (_error: any) => {
            this.spinner.hide();
          }
        );
    } else {
      let url =
        "ClinFavouriteSet(Einri='" +
        object.einri +
        "',Tarif='" +
        object.catalogkey +
        "',Talst='" +
        object.service +
        "')";
      this.dataService.deleteData(url, false);
      this.spinner.hide();
    }
  }

  createFavouriteEPresc(object: any) {
    if (object.Favourite) {
      let postObject: any = {};
      postObject['agentid'] = object.Agentid;
      postObject['drugid'] = object.Drugid;

      this.dataService.postData('UserFavSet', postObject, false).subscribe(
        (_success: any) => { },
        (_error: any) => { }
      );
    } else {
      let _url =
        "UserFavSet(userid='',agentid='" +
        object.drugAgentId +
        "',drugid='" +
        object.drugId +
        "')";
      this.dataService.deleteData(_url, false);
    }
    // this.loadFavouriteData()
  }

  onAddOrderCheckbox(event: any, element: any) {
    element['isSelected'] = event.target.checked;
    if (event.target.checked) {
      let object: any = {
        date: this.datePipe.transform(new Date(), 'yyyy-MM-dd'),
        time: this.datePipe.transform(new Date(), 'HH:mm'),
        note: '',
        borderColor: '',
        isSelected: Boolean,
        locationtype: this.localizationList,
        frequency: this.frequencyObject,
        dataType: 'searchListData',
        editItem: false,
      };
      for (var childProps in element) {
        object[childProps] = element[childProps];
      }
      object['isSelected'] = event.target.checked;
      if (element.type !== 'MED') {
        this.loadServiceDetails(object);
      } else {
        this.loadMedicalDetails(object);
        this.onInsertOrder(object);
      }
    } else {
      let object: any = {
        date: this.datePipe.transform(new Date(), 'yyyy-MM-dd'),
        time: this.datePipe.transform(new Date(), 'HH:mm'),
        note: '',
        borderColor: '',
        isSelected: Boolean,
      };
      for (var childProps in element) {
        object[childProps] = element[childProps];
      }
      object['isSelected'] = event.target.checked;
      switch (element.type) {
        case 'LAB':
          object['borderColor'] = 'rgb(130,78,163)';
          break;
        case 'RAD':
          object['borderColor'] = 'rgb(100,94,182)';
          break;
        case 'PROC':
          object['borderColor'] = 'rgb(32,98,172)';
          break;
        case 'MED':
          object['borderColor'] = 'rgb(164, 93, 187)';
          break;
      }
      this.onInsertOrder(object);
    }
  }

  onInsertOrder(insertdata: any) {
    if (insertdata.type !== 'fees' && !insertdata.Orgid && insertdata.dataType !== 'CopyFeeHistoryData' && insertdata.dataType !== 'EditFeeHistoryData') {
      if (!this.eOrdersMaster) {
        this.eOrdersMaster = [];
      }
      if (insertdata.type === 'MED' && insertdata.type !== 'Fees') {
        this.ePrescriptionEntry['dosageCountDesc'] = insertdata.dosageCountDesc;
        this.ePrescriptionEntry['durationDesc'] = insertdata.durationDesc == undefined ? '' : insertdata.durationDesc;
        if (insertdata.dataType === 'EditHistoryData' || insertdata.dataType === 'CopyHistoryData') {
          insertdata['dosageCount'] = insertdata.dosageCount;
          insertdata['durationCount'] = insertdata.durationCount;
        } else {
          insertdata['dosageCount'] = 0;
          insertdata['durationCount'] = 0;
        }
      }
      if (
        insertdata.isSelected ||
        insertdata.dataType == 'OneItemhistoryDelete'
      ) {
        if (
          this.eOrdersMaster &&
          !this.eOrdersMaster.find(
            (d) =>
              d.id === insertdata.id &&
              d.Drugid === insertdata.Drugid &&
              d.text === insertdata.text
          )
        ) {
          this.eOrdersMaster.push(insertdata);
        } else if (
          insertdata.dataType === 'EditHistoryData' ||
          insertdata.dataType === 'CopyHistoryData'
        ) {
          this.eOrdersMaster.push(insertdata);
        }
      } else {
        if (insertdata.type !== 'MED') {
          if (this.eOrdersMaster.length) {
            const removeAt = this.eOrdersMaster.findIndex(
              (d: any) =>
                d['clinOrdTypId'] === insertdata.clinOrdTypId &&
                d['service'] === insertdata.service
            );
            if (removeAt >= 0) {
              this.eOrdersMaster.splice(removeAt, 1);
            }
          }
        } else {
          if (this.eOrdersMaster.length) {
            const removeAt = this.eOrdersMaster.findIndex(
              (d: any) =>
                d['Drugid'] === insertdata.Drugid &&
                d['Agentid'] === insertdata.Agentid &&
                d['Drugname'] === insertdata.Drugname
            );
            if (removeAt >= 0) {
              this.eOrdersMaster.splice(removeAt, 1);
            }
          }
        }
      }
    } else {
      if (!this.feeServiceOrderData) {
        this.feeServiceOrderData = [];
      }
      if (insertdata.isSelected) {
        if (this.feeServiceOrderData && !this.feeServiceOrderData.find((d) => d.text === insertdata.text)) {
          insertdata.newprice === 0 || insertdata.newprice === '0' ? insertdata['generate'] = true : insertdata['generate'] = false;
          if (!insertdata.isEdit) {
            this.feeServiceOrderData.push(insertdata)
          }
        }
        if (insertdata.isEdit) {
          this.feeServiceOrderData.push(insertdata)
        }
      } else {
        if (this.feeServiceOrderData.length) {
          const removeAt = this.feeServiceOrderData.findIndex(
            (d: any) => d['Ktxt1'] === insertdata.Ktxt1
          );
          if (removeAt >= 0) {
            this.feeServiceOrderData.splice(removeAt, 1);
          }
        }
      }
    }
    this.generateOrder();
  }

  generateOrder() {
    // if (this.eOrdersMaster && this.eOrdersMaster.length > 0) {
    //   if (this.eOrdersMaster[0].dataType === 'searchListData' || this.eOrdersMaster[0].dataType === 'CopyHistoryData') {
    //     this.switchMode.name = 'eorders';
    //   } else if (this.eOrdersMaster[0].dataType === 'EditHistoryData') {
    //     this.switchMode.name = 'history-data';
    //   } else {
    //     this.switchMode.name = 'history';
    //   }
    // }
    // if (this.eOrdersMaster && this.eOrdersMaster.length === 0) {
    //   this.eOrdersMaster = null;
    //   this.eOrders = null;
    //   this.switchMode.name = 'history';
    // }
    // if (this.eOrdersMaster && this.eOrdersMaster.length > 0) {
    //   let eorderFilter = this.eOrdersMaster.reduce((r, { type }) => {
    //     if (!r.some((o) => o.type == type)) {
    //       r.push({
    //         type,
    //         groupItem: this.eOrdersMaster.filter((v) => v.type == type),
    //       });
    //     }
    //     return r;
    //   }, []);
    //   if (this.eOrdersMaster[0].dataType === 'searchListData' || this.eOrdersMaster[0].dataType === 'CopyHistoryData' || this.eOrdersMaster[0].dataType === 'EditHistoryData') {
    //     this.eOrders = eorderFilter;
    //   } else {
    //     this.deleteOrders = eorderFilter;
    //   }
    // }

    if (this.feeServiceOrderData && this.feeServiceOrderData.length > 0) {
      this.switchMode.name = 'history-data';
      let feeorderFilter = this.feeServiceOrderData.reduce((r, { type }) => {
        if (!r.some((o) => o.type == type)) {
          r.push({
            type,
            groupItem: this.feeServiceOrderData.filter((v) => v.type == type),
          });
        }
        return r;
      }, []);
      if (this.feeServiceOrderData[0].dataType === 'FeesDataType') {
        this.feeServiceData = this.feeServiceOrderData;
      } else {
        this.deleteOrders = feeorderFilter;
      }
    } else {
      this.feeServiceOrderData = [];
      this.feeServiceData = '';
      this.switchMode.name = 'history';
    }
  }

  loadServiceDetails(object: any) {
    this.spinner.show();
    let _filter = {
      Einri: this.constants.einri
        ? this.constants.einri
        : this.storageService.getLocal('einri'),
      Tarif: object.catalogkey,
      Talst: object.service,
      Cordtypid: object.clinOrdTypId,
    };
    let expandEntities = ['TOFILLERSET'];
    this.dataService
      .loadData(
        'ClinServiceSet',
        null,
        _filter,
        false,
        expandEntities,
        true,
        true,
        false,
        false,
        true
      )
      .subscribe(
        (resp: any) => {
          this.spinner.hide();
          let success = resp;
          if (resp._body) {
            success = JSON.parse(resp._body);
          }
          object['isFastingRequired'] = success.d.results[0].Patnue;
          object['TOFILLERSET'] = success.d.results[0].TOFILLERSET.results;
          if (success.d.results[0].TOFILLERSET.results.length === 1) {
            object['defaultOrgCode'] =
              success.d.results[0].TOFILLERSET.results[0].OrgfaDefault;
            object['defaultOrgDescription'] =
              success.d.results[0].TOFILLERSET.results[0].OrgfaDescr;
            object['treatingUnitCode'] =
              success.d.results[0].TOFILLERSET.results[0].Trtoe;
            object['treatingUnitDescription'] =
              success.d.results[0].TOFILLERSET.results[0].TrtoeDescr;
            this.onInsertOrder(object);
          } else {
            this.tempObject = {};
            this.tempObject = object;
            this.organizations = success.d.results[0].TOFILLERSET.results;
            // const factory = this.cfr.resolveComponentFactory(OrganizationUnitComponent);
            // const cref = this.loadquestionsviewcontainerref.createComponent(factory);
            // cref.instance.showPopup(object);
            this.isFilterDataPopup.next(object);

          }

          this.spinner.hide();
        },
        (_error: any) => {
          // this._loader.hideLoader();
        }
      );
  }

  loadMedicalDetails(object: any) {
    this.spinner.show();
    let filter = {
      einri: this.constants.einri
        ? this.constants.einri
        : this.storageService.getLocal('einri'),
      case: this.constants.falnr
        ? this.constants.falnr
        : this.storageService.getLocal('falnr'),
      movement: this.constants.lfdnr
        ? this.constants.lfdnr
        : this.storageService.getLocal('lfdnr'),
      AgentID: object.drugAgentId,
      DrugID: object.drugId,
      purpose: object.purpose,
    };
    let expandEntities = [
      'NAVDRUGFORMATS',
      'NAVDRUGFORMATROUTES',
      'NAVDRUGFORMATROUTEUNITS',
      'NAVDRUGUNITS',
    ];
    this.dataService
      .loadData(
        'DrugPropSet',
        null,
        filter,
        false,
        expandEntities,
        true,
        true,
        false,
        false,
        true
      )
      .subscribe(
        (resp: any) => {
          this.spinner.hide();
          let success = resp;
          if (resp._body) {
            success = JSON.parse(resp._body);
          }
          // this._loader.hideLoader();
          // this.showLoader = false;
          if (
            success.d.results[0].NAVDRUGFORMATS?.results &&
            success.d.results[0].NAVDRUGFORMATS?.results.length
          ) {
            success.d.results[0].NAVDRUGFORMATS.results.forEach((obj: any) => {
              obj.agentId = obj.AgentID;
              obj.formulaDesc = obj.Descr;
              obj.drugId = obj.DrugID;
              obj.form = obj.Form;
              obj.id = obj.FormID;
            });
          }

          if (
            success.d.results[0].NAVDRUGFORMATROUTES?.results &&
            success.d.results[0].NAVDRUGFORMATROUTES?.results.length
          ) {
            success.d.results[0].NAVDRUGFORMATROUTES.results.forEach(
              (obj: any) => {
                obj.agentId = obj.AgentID;
                obj.drugId = obj.DrugID;
                obj.formId = obj.FormID;
                obj.form = obj.Form;
                obj.formDescription = obj.Descr;
                obj.route = obj.Route;
                obj.routeDesc = obj.RouteDescr;
                obj.id = obj.RouteID;
              }
            );
          }

          if (
            success.d.results[0].NAVDRUGFORMATROUTEUNITS?.results &&
            success.d.results[0].NAVDRUGFORMATROUTEUNITS?.results.length
          ) {
            success.d.results[0].NAVDRUGFORMATROUTEUNITS.results.forEach(
              (obj: any) => {
                obj.agentId = obj.AgentID;
                obj.drugId = obj.DrugId;
                obj.formId = obj.FormID;
                obj.form = obj.Form;
                obj.formDescription = obj.Descr;
                obj.route = obj.Route;
                obj.routeDescription = obj.RouteDescr;
                obj.routeId = obj.RouteID;
                obj.dosageCountDesc = obj.Text;
                obj.id = obj.Unit;
              }
            );
          }
          this.eOrders[0].groupItem.forEach(eme => {
            if (!eme.dosageUnit) {
              eme.dosageUnit = eme.Meins && eme.dosageCountDesc ? [{ unit: eme.Meins, text: eme.dosageCountDesc }] : eme.dosageUnit = [];
              success.d.results[0].NAVDRUGFORMATROUTEUNITS.results.forEach((ele) => {
                eme.dosageUnit.push({ unit: ele.Unit, text: ele.Text, formId: ele.FormID, Routeid: ele.RouteID })
              });
            }
          })
          this.ePrescriptionObject = success.d.results[0];
          this.ePrescriptionEntry['isFavourite'] = object.isFavourite === 'X';
          this.ePrescriptionEntry['agentId'] = object.drugAgentId;
          this.ePrescriptionEntry['drugName'] = object.ResultDrug;
          this.ePrescriptionEntry['drugId'] = object.drugId;
          this.ePrescriptionObject['drugName'] = object.ResultDrug;
          // this.ePrescriptionObject['frequency'] = this.frequencyObject;
          this.ePrescriptionObject['duration'] = this.durationObject;
        },
        (_error: any) => {
          this.spinner.hide();
        }
      );

    // this.createFavourite(object);
  }

  validateEPresc(element: any) {
    let message = [];
    if (element.Templatemode) {
      element.groupItem.forEach((item: any) => {
        if (item.dosageCount === 0) {
          message.push('Please enter Dosage');
        }
        if (item.Meins == null || item.Meins === "") {
          message.push('Please Select Dosage Unit');
        }
        if (item.frequencyId === '' || item.frequencyId === undefined || item.durationDesc === null) {
          message.push('Please Select frequency');
        }
        if (item.durationCount === 0) {
          message.push('Please Enter Duration');
        }
        if (item.durationDesc === "" || item.durationDesc === undefined || item.durationDesc === null) {
          message.push('Please Select Duration Unit');
        }
      });
    } else {
      element.forEach((item: any) => {
        if (item.QUAN == '0') {
          message.push('Please enter Dosage');
        }
        if (item.QUANUNIT === '') {
          message.push('Please Select Dosage Unit');
        }
        if (item.N1ZNR === "" || item.N1ZNR === undefined) {
          message.push('Please Select frequency');
        }
        if (item.PDUR == '0') {
          message.push('Please Enter Duration');
        }
        if (item.PDURU == '') {
          message.push('Please Select Duration Unit');
        }
      });
    }
    let _messageString = {
      code: message.length !== 0,
      message: message.toString(),
    };
    return _messageString;
  }

  onCreateOrder() {
    this.spinner.show();
    let postObject: any = {};
    postObject['einri'] = this.constants.einri;
    postObject['falnr'] = this.constants.falnr;
    postObject['lfdnr'] = this.constants.lfdnr;

    if (
      this.eOrdersMaster[0].Eorderid &&
      this.eOrdersMaster[0].Eorderid !== ''
    ) {
      postObject['Eorderid'] = this.eOrdersMaster[0].Eorderid;
    }
    let labOrders: any = [];
    let radOrders: any = [];
    let procOrders: any = [];
    let medOrders: any = [];
    this.eOrders.forEach((element) => {
      switch (element.type) {
        case 'LAB':
          element.groupItem.forEach((obj) => {
            labOrders.push({
              Cordtypid: obj.clinOrdTypId,
              Tarif: obj.catalogkey,
              Talst: obj.service,
              Wbgtmp:
                this.datePipe.transform(obj.date, 'YYYY-MM-dd') +
                'T' + obj.time + ":00",
              Lslok: obj.localization,
              Ergtx: obj.note,
              Trtoe: obj.treatingUnitCode,
              Orgfa: obj.defaultOrgCode,
              Trtgp: '',
              Eorderid: obj.Eorderid,
              Eorderitemid: obj.Eorderitemid,
              Patnue: obj.isFastingRequired,
            });
          });
          break;
        case 'RAD':
          element.groupItem.forEach((obj) => {
            radOrders.push({
              Cordtypid: obj.clinOrdTypId,
              Tarif: obj.catalogkey,
              Talst: obj.service,
              Wbgtmp:
                this.datePipe.transform(obj.date, 'YYYY-MM-dd') +
                'T' + obj.time + ":00",
              Lslok: obj.localization,
              Ergtx: obj.note,
              Trtoe: obj.treatingUnitCode,
              Orgfa: obj.defaultOrgCode,
              Trtgp: '',
              Eorderid: obj.Eorderid,
              Eorderitemid: obj.Eorderitemid,
              Patnue: obj.isFastingRequired,
            });
          });
          break;
        case 'PROC':
          element.groupItem.forEach((obj) => {
            procOrders.push({
              Cordtypid: obj.clinOrdTypId,
              Tarif: obj.catalogkey,
              Talst: obj.service,
              Wbgtmp:
                this.datePipe.transform(obj.date, 'YYYY-MM-dd') +
                'T' + obj.time + ":00",
              Lslok: obj.localization,
              Ergtx: obj.note,
              Trtoe: obj.treatingUnitCode,
              Orgfa: obj.defaultOrgCode,
              Trtgp: '',
              Eorderid: obj.Eorderid,
              Eorderitemid: obj.Eorderitemid,
              Patnue: obj.isFastingRequired,
            });
          });
          break;
        case 'MED':
          element.groupItem.forEach((item) => {
            if (!item.Eorderid || item.Eorderid === '') {
              medOrders.push({
                BLOCKCHANGES: "",
                RESULT_DRUG_NAME: item.text,
                DRUGID: item.Drugid || item.DRUGID,
                FORMATDESCR: item.formulaDesc,
                PHFORMID: item.formulaId || item.dosageUnit[0].formId,
                APROUTEID: item.RouteID || item.dosageUnit[0].Routeid,
                QUAN:
                  item.dosageCount.toString() == ''
                    ? '0'
                    : item.dosageCount.toString(),
                QUANUNIT: item.Meins ? item.Meins : '',
                N1ZNR: item.frequencyId || item.N1ZNR,
                PDUR:
                  item.durationCount.toString().trim() == ''
                    ? '0'
                    : item.durationCount.toString(),
                PDURU: item.PDURU && item.durationDesc === item.DURUNITTXT ? item.durationid : item.durationDesc,
                //"PDURU":  item.durationKey,
                AGENTID: item.Agentid || item.AGENTID,
                PRSCRID: item.PRSCRID !== undefined ? item.PRSCRID : "",
                STORN: '',
                STOID: '',
                UPDMODE: '',
                LFDNR: this.constants.lfdnr,
                DESCR: item.comment !== undefined ? item.comment : '',
                PRN: item.isPrn == undefined ? '' : item.isPrn ? 'X' : '',
                PRNCOND: item.prnText === undefined ? '' : item.prnText,
                DRUG: item.DRUG !== undefined ? item.DRUG : "",
                Eorderitemid: item.Eorderitemid !== undefined ? item.Eorderitemid : "",
                Eorderid: item.Eorderid !== undefined ? item.Eorderid : "",
                ROUTEDESCR: item.routeDesc !== undefined ? item.routeDesc : "",
              });
            } else {
              medOrders.push({
                BLOCKCHANGES: "",
                RESULT_DRUG_NAME: item.text,
                DRUGID: item.DRUGID,
                FORMATDESCR: item.formulaDesc,
                PHFORMID: item.PHFORMID,
                QUAN:
                  item.dosageCount.toString() == ''
                    ? '0'
                    : item.dosageCount.toString(),
                QUANUNIT: item.dosageCountDesc ? item.dosageCountDesc : '',
                APROUTEID: item.APROUTEID,
                N1ZNR: item.N1ZNR,
                PDUR:
                  item.durationCount.toString().trim() == ''
                    ? '0'
                    : item.durationCount.toString(),
                PDURU: item.DURUNITTXT && item.durationDesc === item.DURUNITTXT ? item.durationid : item.durationDesc,
                //"PDURU":  item.durationKey,
                AGENTID: item.AGENTID,
                PRSCRID: item.PRSCRID !== undefined ? item.PRSCRID : "",
                STORN: '',
                STOID: '',
                UPDMODE: 'U',
                LFDNR: this.constants.lfdnr,
                DESCR: item.comment,
                PRN: item.isPrn == undefined ? '' : item.isPrn ? 'X' : '',
                PRNCOND: item.prnText === undefined ? '' : item.prnText,
                DRUG: item.DRUG !== undefined ? item.DRUG : "",
                Eorderitemid: item.Eorderitemid !== undefined ? item.Eorderitemid : "",
                Eorderid: item.Eorderid !== undefined ? item.Eorderid : ""
              });
            }
          });
          break;
        case 'TEMPLATE':
          element.groupItem.forEach((item) => {
            medOrders.push({
              BLOCKCHANGES: "",
              RESULT_DRUG_NAME: item.text,
              DRUGID: item.DRUGID,
              FORMATDESCR: item.formulaDesc,
              QUAN:
                item.dosageCount.toString() == ''
                  ? '0'
                  : item.dosageCount.toString(),
              QUANUNIT: item.QUANUNIT ? item.QUANUNIT : '',
              PHFORMID: item.PHFORMID || item.dosageUnit[0].formId,
              APROUTEID: item.APROUTEID || item.dosageUnit[0].Routeid,
              N1ZNR: item.N1ZNR,
              PDUR:
                item.durationCount.toString().trim() == ''
                  ? '0'
                  : item.durationCount.toString(),
              PDURU: item.PDURU == undefined ? '' : item.PDURU,
              //"PDURU":  item.durationKey,
              AGENTID: item.AGENTID,
              PRSCRID: "",
              STORN: '',
              STOID: '',
              UPDMODE: '',
              LFDNR: this.constants.lfdnr,
              DESCR: item.comment,
              PRN: item.isPrn == undefined ? '' : item.isPrn ? 'X' : '',
              PRNCOND: item.prnText === undefined ? '' : item.prnText,
            });
          });
          break;
      }
    });
    postObject['TOLABSET'] = labOrders;
    postObject['TORADSET'] = radOrders;
    postObject['TOPROCSET'] = procOrders;
    postObject['TOMEDICSET'] = medOrders;
    let validateObj = this.validateEPresc(medOrders);
    let labdetectDate = !this.eOrdersMaster[0].Eorderid
      ? postObject.TOLABSET.find(
        (item: any) =>
          item.Wbgtmp.split('T')[0] <
          this.datePipe.transform(new Date(), 'yyyy-MM-dd')
      )
      : undefined;
    let raddetectDate = !this.eOrdersMaster[0].Eorderid
      ? postObject.TORADSET.find(
        (item: any) =>
          item.Wbgtmp.split('T')[0] <
          this.datePipe.transform(new Date(), 'yyyy-MM-dd')
      )
      : undefined;
    let procdetectDate = !this.eOrdersMaster[0].Eorderid
      ? postObject.TOPROCSET.find(
        (item: any) =>
          item.Wbgtmp.split('T')[0] <
          this.datePipe.transform(new Date(), 'yyyy-MM-dd')
      )
      : undefined;
    if (
      labdetectDate !== undefined ||
      raddetectDate !== undefined ||
      procdetectDate !== undefined
    ) {
      this.spinner.hide();
      swal
        .fire({
          title: 'Can’t place orders on previous dates',
          // text: 'can’t place orders on previous dates',
          confirmButtonColor: '#0890c5',
          confirmButtonText: 'OK',
          backdrop: true,
          icon: 'error',
          customClass: 'myalertpopup',
          //type: "info",
        })
        .then((result) => { });
    } else {
      this.spinner.show();
      if (postObject.TOMEDICSET.length > 0 && validateObj.code) {
        this.spinner.hide();
        swal.fire({
          title: 'Please correct the data',
          text: validateObj.message,
          confirmButtonColor: '#096798',
          confirmButtonText: 'OK',
          backdrop: false,
          icon: 'info',
          //type: "info",
        })
          .then((result) => { });
      } else {
        this.dataService.postData('OrderSet', postObject, false).subscribe(
          (success: any) => {
            if (!postObject['Eorderid'] || postObject['Eorderid'] === '') {
              swal
                .fire({
                  title: 'eOrder Created',
                  text: 'Your eOrder has been created',
                  confirmButtonColor: '#0890c5',
                  confirmButtonText: 'OK',
                  backdrop: true,
                  icon: 'success',
                  customClass: 'myalertpopup',
                  //type: "info",
                })
                .then((result) => {
                  if (result.value) {
                    this.resetView();
                  }
                });
            } else {
              swal
                .fire({
                  title: 'eOrder Updated',
                  text: 'Your eOrder has been updated',
                  confirmButtonColor: '#0890c5',
                  confirmButtonText: 'OK',
                  backdrop: true,
                  icon: 'success',
                  customClass: 'myalertpopup',
                  //type: "info",
                })
                .then((result) => {
                  if (result.value) {
                    this.resetView();
                  }
                });
            }
            this.spinner.hide();
          },
          (error: any) => {
            let iconshowclass =
              this.eOrdersMaster[0].Eorderid &&
                this.eOrdersMaster[0].Eorderid !== ''
                ? 'swal2-icon-hide'
                : 'swal2-icon-show';
            swal
              .fire({
                title: this.eOrdersMaster[0].Eorderid && this.eOrdersMaster[0].Eorderid !== '' ? 'Nothing has been changed' : error.statusText,
                text:
                  this.eOrdersMaster[0].Eorderid &&
                    this.eOrdersMaster[0].Eorderid !== ''
                    ? ''
                    : JSON.parse(error._body).error?.message?.value,
                confirmButtonColor: '#096798',
                confirmButtonText: 'close',
                customClass: 'myalertpopup',
                backdrop: true,
                icon: 'error',
                showClass: {
                  icon: iconshowclass,
                },
                //type: "info",
              })
              .then((result) => { });
            this.spinner.hide();
          }
        );
      }
    }
  }

  openTemplatePopup(content: any, element: any) {
    element[0]['Templatemode'] = true;
    let validateObj = this.validateEPresc(element[0]);
    if (validateObj.code && element[0].groupItem.length > 0) {
      swal.fire({
        title: 'Please correct the data',
        text: validateObj.message,
        confirmButtonColor: '#096798',
        confirmButtonText: 'OK',
        backdrop: false,
        icon: 'info',
      })
        .then((result) => { });
    } else {
      let ngbModalOptions: NgbModalOptions = {
        backdrop: 'static',
        keyboard: false,
        windowClass: 'mytemlatemodel savetemplatemodel',
      };
      this.opentempmodalservices.open(content, ngbModalOptions);
    }
  }

  onCloseTemplate() {
    this.templatedescription = null
    this.opentempmodalservices.dismissAll();
  }

  onCreateTemplate() {
    this.spinner.show();
    let postObject: any = {};
    postObject['TEMPLATE'] = 'X';
    postObject['PRSCRID'] = "";
    postObject['FALNR'] = this.constants.falnr;
    postObject['PATNR'] = this.constants.patnr;
    postObject['EINRI'] = this.constants.einri;
    postObject['DESCR'] = this.templatedescription;

    if (
      this.eOrdersMaster[0].Eorderid &&
      this.eOrdersMaster[0].Eorderid !== ''
    ) {
      postObject['Eorderid'] = this.eOrdersMaster[0].Eorderid;
    }
    let tempOrders: any = [];
    this.eOrders.forEach((element) => {
      if (element.type == "MED") {
        element.groupItem.forEach((item) => {
          tempOrders.push({
            RESULT_DRUG_NAME: item.text,
            DRUG: '',
            DRUGID: item.Drugid,
            FORMATDESCR: item.formulaDesc,
            QUAN: item.dosageCount.toString() == '' ? '0' : item.dosageCount.toString(),
            QUANUNIT: item.Meins ? item.Meins : '',
            N1ZNR: item.frequencyId,
            PDUR: item.durationCount.toString().trim() == '' ? '0' : item.durationCount.toString(),
            PDURU: item.durationDesc == undefined ? '' : item.durationDesc,
            AGENTID: item.Agentid,
            PRSCRID: '',
            STORN: '',
            STOID: '',
            UPDMODE: '',
            LFDNR: this.constants.lfdnr,
            DESCR: item.comment,
            PRN: item.isPrn == undefined ? '' : item.isPrn ? 'X' : '',
            PRNCOND: item.prnText,
            ROUTEDESCR: item.routeDesc,
            PHFORMID: item.formulaId || item.dosageUnit[0].formId,
            APROUTEID: item.RouteID || item.dosageUnit[0].Routeid,
          });
        });
      } else {
        element.groupItem.forEach((item) => {
          tempOrders.push({
            RESULT_DRUG_NAME: item.text,
            DRUG: '',
            DRUGID: item.DRUGID,
            FORMATDESCR: item.formulaDesc,
            QUAN: item.dosageCount.toString() == '' ? '0' : item.dosageCount.toString(),
            QUANUNIT: item.QUANUNIT ? item.QUANUNIT : '',
            N1ZNR: item.N1ZNR,
            PDUR: item.durationCount.toString().trim() == '' ? '0' : item.durationCount.toString(),
            PDURU: item.PDURU == undefined ? '' : item.PDURU,
            AGENTID: item.Agentid,
            PRSCRID: '',
            STORN: '',
            STOID: '',
            UPDMODE: '',
            LFDNR: this.constants.lfdnr,
            DESCR: item.additionalInformation,
            PRN: item.isPrn == undefined ? '' : item.isPrn ? 'X' : '',
            PRNCOND: item.prnText,
            ROUTEDESCR: item.routeDesc,
            PHFORMID: item.PHFORMID || item.dosageUnit[0].formId,
            APROUTEID: item.APROUTEID || item.dosageUnit[0].Routeid,
          });
        });
      }
    });
    postObject['PrescriptionItemSet'] = tempOrders;
    let validateObj = this.validateEPresc(tempOrders);
    if (postObject.PrescriptionItemSet.length > 0 && validateObj.code) {
      this.spinner.hide();
      swal
        .fire({
          title: 'Please correct the data',
          text: validateObj.message,
          confirmButtonColor: '#096798',
          confirmButtonText: 'OK',
          backdrop: false,
          icon: 'info',
        })
        .then((result) => { });
    } else {
      if (this.templatedescription === "") {
        this.errorMsg = "Description Can Note Be Blank"
        this.spinner.hide();
      } else {
        this.opentempmodalservices.dismissAll();
        this.templatedescription === "";
        this.dataService.postData('PrescriptionSet', postObject, false).subscribe(
          (success: any) => {
            if (!postObject['Eorderid'] || postObject['Eorderid'] === '') {
              swal
                .fire({
                  title: 'Template Created',
                  text: 'Template has been created',
                  confirmButtonColor: '#0890c5',
                  confirmButtonText: 'OK',
                  backdrop: true,
                  icon: 'success',
                  customClass: 'myalertpopup',
                  //type: "info",
                })
                .then((result) => {
                  if (result.value) {
                    this.resetView();
                  }
                });
            }
            this.spinner.hide();
          },
          (error: any) => {
            let iconshowclass = this.eOrdersMaster[0].Eorderid && this.eOrdersMaster[0].Eorderid !== '' ? 'swal2-icon-hide' : 'swal2-icon-show';
            swal.fire({
              title: this.eOrdersMaster[0].Eorderid && this.eOrdersMaster[0].Eorderid !== '' ? 'Nothing has been changed' : error.statusText,
              text: this.eOrdersMaster[0].Eorderid && this.eOrdersMaster[0].Eorderid !== '' ? '' : JSON.parse(error._body).error?.message?.value,
              confirmButtonColor: '#096798',
              confirmButtonText: 'close',
              customClass: 'myalertpopup',
              backdrop: true,
              icon: 'error',
              showClass: {
                icon: iconshowclass,
              },
            }).then((result) => { });
            this.spinner.hide();
          }
        );
      }
    }
  }

  onDeleteOrder(deletedata: any) {
    if (deletedata.type === 'fees') {
      if (this.feeServiceOrderData && this.feeServiceOrderData.length && deletedata.Lnrls !== '') {
        const removeAt = this.feeServiceOrderData.findIndex(
          (d: any) => d['Ktxt1'] === deletedata.Ktxt1
        );
        if (removeAt >= 0) {
          this.feeServiceOrderData.splice(removeAt, 1);
          deletedata.isSelected = false;
          this.onInsertOrder(deletedata);
          this.updateSearchListOnDelete(deletedata, deletedata.type);
        }
      }
    }
    // if (deletedata.type !== 'MED' && deletedata.type !== 'TEMPLATE') {
    //   if (this.eOrdersMaster.length) {
    //     const removeAt = this.eOrdersMaster.findIndex(
    //       (d: any) =>
    //         d['clinOrdTypId'] === deletedata.clinOrdTypId &&
    //         d['service'] === deletedata.service
    //     );
    //     if (removeAt >= 0) {
    //       this.eOrdersMaster.splice(removeAt, 1);
    //       deletedata.isSelected = false;
    //       this.onInsertOrder(deletedata);
    //       this.updateSearchListOnDelete(deletedata, deletedata.type);
    //     }
    //   }
    // } else if (deletedata.type === 'TEMPLATE') {
    //   if (this.eOrdersMaster.length) {
    //     const removeAt = this.eOrdersMaster.findIndex(
    //       (d: any) =>
    //         d['DRUGID'] === deletedata.DRUGID &&
    //         d['AGENTID'] === deletedata.AGENTID &&
    //         d['drugName'] === deletedata.drugName
    //     );
    //     if (removeAt >= 0) {
    //       this.eOrdersMaster.splice(removeAt, 1);
    //       deletedata.isSelected = false;
    //       this.onTemplateOrder(deletedata);
    //     }
    //   }
    // } else {
    //   if (this.eOrdersMaster.length) {
    //     const removeAt = this.eOrdersMaster.findIndex(
    //       (d: any) =>
    //         d['Drugid'] === deletedata.Drugid &&
    //         d['Agentid'] === deletedata.Agentid &&
    //         d['Drugname'] === deletedata.Drugname
    //     );
    //     if (removeAt >= 0) {
    //       this.eOrdersMaster.splice(removeAt, 1);
    //       deletedata.isSelected = false;
    //       this.onInsertOrder(deletedata);
    //       this.updateSearchListOnDelete(deletedata, deletedata.type);
    //     }
    //   }
    // }
    this.generateOrder();
  }

  updateSearchListOnDelete(data: any, type: string) {
    switch (type) {
      case 'LAB':
        let labData = this.labOrdersSearchList.find(
          (d: any) =>
            d['clinOrdTypId'] === data.clinOrdTypId &&
            d['service'] === data.service &&
            d['isSelected']
        );
        if (labData) {
          labData.isSelected = false;
        }
        break;
      case 'RAD':
        let radData = this.radOrdersSearchList.find(
          (d: any) =>
            d['clinOrdTypId'] === data.clinOrdTypId &&
            d['service'] === data.service &&
            d['isSelected']
        );
        if (radData) {
          radData.isSelected = false;
        }
        break;
      case 'PROC':
        let procData = this.procedureSearchList.find(
          (d: any) =>
            d['clinOrdTypId'] === data.clinOrdTypId &&
            d['service'] === data.service &&
            d['isSelected']
        );
        if (procData) {
          procData.isSelected = false;
        }
        break;
      case 'MED':
        let medData = this.medicationSearchList[0].TODURG.results.find(
          (d: any) =>
            d['Drugid'] === data.Drugid &&
            d['Agentid'] === data.Agentid &&
            d['Drugname'] === data.Drugname
        );
        if (medData) {
          medData.isSelected = false;
        }
        break;
      case 'fees':
        let feeData = this.feeServiceSearchData.find(
          (d: any) => d['Ktxt1'] === data.Ktxt1
        );
        if (feeData) {
          feeData.isSelected = false;
        }
        break;
      default:
        break;
    }
  }

  onCancelOrder() {
    if (this.eOrdersMaster && this.eOrdersMaster.length > 0) {
      this.eOrdersMaster.forEach((obj: any) => {
        obj.isSelected = false;
      });
    }
    this.resetView();
  }

  onEditItem(element: any) {
    if (element && element.length > 0) {
      element.forEach((obj) => {
        obj['data'] = obj.TOLABSET.results.concat(
          obj.TORADSET.results,
          obj.TOPROCSET.results,
          obj.TOMEDICSET.results
        );
        let userSelect = obj.data.filter((item) => item['isSelected'] === true);
        if (userSelect.length > 0) {
          swal.fire({
            title: 'Edit Items',
            text: 'Do you want to edit all ' + userSelect.length + ' items',
            showCancelButton: true,
            confirmButtonColor: '#0890c5',
            cancelButtonColor: '#84898c',
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            customClass: 'myalertpopup',
            //type: "info",
          })
            .then((result) => {
              if (result.value) {
                this.loadFrequency();
                userSelect.forEach((obj) => {
                  let updateDate = "";
                  if (obj.date) {
                    updateDate = obj.date.split('-');
                  }
                  if (obj.Vma || !obj.Reconcile) {
                    swal
                      .fire({
                        title: "Bad Request",
                        text: obj.Vma ? `Medication was written by another physician, Editing or Cancellation is not possible` : `Drug Item is reconciled, Changes are not possible`,
                        confirmButtonColor: '#096798',
                        confirmButtonText: 'close',
                        customClass: 'myalertpopup',
                        backdrop: true,
                        icon: 'error',
                      })
                      .then((result) => {
                        this.spinner.hide();
                        this.clearData();
                        this.resetView();
                        this.loadHistory();
                      });
                  } else if (obj.Billed || obj.Reconcile) {
                    swal
                      .fire({
                        title: "Bad Request",
                        text: obj.Billed ? `Service ${obj.Talst} has been billed On ${updateDate[2]}.${updateDate[1]}.${updateDate[0]}. Editing is not possible` : `Medication Order has been already created, Editing or Cancellation is not possible`,
                        confirmButtonColor: '#096798',
                        confirmButtonText: 'close',
                        customClass: 'myalertpopup',
                        backdrop: true,
                        icon: 'error',
                      })
                      .then((result) => {
                        this.spinner.hide();
                        this.clearData();
                        this.resetView();
                        this.loadHistory();
                      });
                  } else {
                    this.loadMedicalDetails(obj);
                    obj['dataType'] = 'EditHistoryData';
                    obj['locationtype'] = this.localizationList;
                    obj['frequency'] = this.frequencyObject;
                    obj['editItem'] = true;
                    obj['localization'] = obj.Lslok;
                    this.onInsertOrder(obj);
                  }
                });
              }
            });
        }
      });
    }
  }

  onCopyItem(element: any) {
    if (element && element.length > 0) {
      element.forEach((obj) => {
        obj['data'] = obj.TOLABSET.results.concat(
          obj.TORADSET.results,
          obj.TOPROCSET.results,
          obj.TOMEDICSET.results
        );
        let userSelect = obj.data.filter((item) => item['isSelected'] === true);
        if (userSelect.length > 0) {
          swal
            .fire({
              title: 'Copy Items',
              text: 'Do you want to Copy all ' + userSelect.length + ' items',
              showCancelButton: true,
              confirmButtonColor: '#0890c5',
              cancelButtonColor: '#84898c',
              confirmButtonText: 'Yes',
              cancelButtonText: 'No',
              customClass: 'myalertpopup',
              //type: "info",
            })
            .then((result) => {
              if (result.value) {
                userSelect.forEach((obj) => {
                  this.loadMedicalDetails(obj);
                  obj['dataType'] = 'CopyHistoryData';
                  (obj['locationtype'] = this.localizationList),
                    (obj['localization'] = obj.Lslok),
                    (obj['date'] = this.datePipe.transform(
                      new Date(),
                      'yyyy-MM-dd'
                    ));
                  obj['time'] = this.datePipe.transform(new Date(), 'HH:mm');
                  obj['Eorderid'] = '';
                  obj['Eorderitemid'] = '';
                  obj['editItem'] = true;
                  this.onInsertOrder(obj);
                });
              }
            });
        }
      });
    }
  }

  onDeleteItem(element: any) {
    if (element && element.length > 0) {
      element.forEach((obj) => {
        obj['data'] = obj.TOLABSET.results.concat(
          obj.TORADSET.results,
          obj.TOPROCSET.results,
          obj.TOMEDICSET.results
        );
        let userSelect = obj.data.filter((item) => item['isSelected'] === true);
        if (userSelect && userSelect.length > 0) {
          // if(userSelect.find(d=> d.Eorderid === )){

          // }
          swal.fire({
            title: userSelect.length > 1 ? 'Do you want to delete the e-Order?' : `Do you want to delete Service ${userSelect[0].text} ?`,
            text: '',
            showCancelButton: true,
            confirmButtonColor: '#0890c5',
            cancelButtonColor: '#84898c',
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            customClass: 'myalertpopup',
            //type: "info",
          })
            .then((result) => {
              if (result.value) {
                let data = '';
                userSelect.forEach((obj) => {
                  obj['dataType'] = 'DeleteHistoryData';
                  this.onInsertOrder(obj);
                  data = obj
                });
                this.onDeleteSelect(obj);
              }
            });
        }
      });
    }
  }

  onDeleteHistory(element: any) {
    if (element) {
      element['dataType'] = 'OneItemhistoryDelete';
      element['isSelected'] = true;
      this.onInsertOrder(element);
      this.onDeleteSelect(element);
    }
  }

  onDeleteSelect(element: any) {
    let postObject: any = {};
    postObject['einri'] = this.constants.einri;
    postObject['falnr'] = this.constants.falnr;
    postObject['lfdnr'] = this.constants.lfdnr;

    // if(this.eOrdersMaster[0]){
    //   postObject['Storn'] = 'X';
    // }
    if (
      this.eOrdersMaster[0].Eorderid &&
      this.eOrdersMaster[0].Eorderid !== ''
    ) {
      postObject['Eorderid'] = this.eOrdersMaster[0].Eorderid;
    }
    let labOrders: any = [];
    let radOrders: any = [];
    let procOrders: any = [];
    let medOrders: any = [];
    this.deleteOrders.forEach((element) => {
      switch (element.type) {
        case 'LAB':
          element.groupItem.forEach((obj) => {
            labOrders.push({
              Cordtypid: obj.clinOrdTypId,
              Tarif: obj.catalogkey,
              Talst: obj.service,
              //'Wbgtmp': moment(obj.date, 'YYYY-MM-DD').format('YYYY-MM-DD') + 'T' + moment(obj.time, 'HH:mm').format('HH:mm:ss'),
              Lslok: obj.localization,
              Ergtx: obj.note,
              Trtoe: obj.treatingUnitCode,
              Orgfa: obj.defaultOrgCode,
              Trtgp: '',
              Eorderid: obj.Eorderid,
              Eorderitemid: obj.Eorderitemid,
              Storn: obj.isSelected ? 'X' : 'X',
            });
          });
          break;
        case 'RAD':
          element.groupItem.forEach((obj) => {
            radOrders.push({
              Cordtypid: obj.clinOrdTypId,
              Tarif: obj.catalogkey,
              Talst: obj.service,
              //'Wbgtmp': moment(obj.date, 'YYYY-MM-DD').format('YYYY-MM-DD') + 'T' + moment(obj.time, 'HH:mm').format('HH:mm:ss'),
              Lslok: obj.localization,
              Ergtx: obj.note,
              Trtoe: obj.treatingUnitCode,
              Orgfa: obj.defaultOrgCode,
              Trtgp: '',
              Eorderid: obj.Eorderid,
              Eorderitemid: obj.Eorderitemid,
              Storn: obj.isSelected ? 'X' : '',
            });
          });
          break;
        case 'PRO':
          element.groupItem.forEach((obj) => {
            procOrders.push({
              Cordtypid: obj.clinOrdTypId,
              Tarif: obj.catalogkey,
              Talst: obj.service,
              //'Wbgtmp': moment(obj.date, 'YYYY-MM-DD').format('YYYY-MM-DD') + 'T' + moment(obj.time, 'HH:mm').format('HH:mm:ss'),
              Lslok: obj.localization,
              Ergtx: obj.note,
              Trtoe: obj.treatingUnitCode,
              Orgfa: obj.defaultOrgCode,
              Trtgp: '',
              Eorderid: obj.Eorderid,
              Eorderitemid: obj.Eorderitemid,
              Storn: obj.isSelected ? 'X' : '',
            });
          });
          break;
        case 'MED':
          element.groupItem.forEach((obj) => {
            medOrders.push({
              RESULT_DRUG_NAME: obj.drugName,
              DRUGID: obj.drugId,
              FORMATDESCR: obj.formulaDesc,
              PHFORMID: obj.formulaId,
              QUAN: obj.dosageCount.toString(),
              QUANUNIT: obj.unitId,
              APROUTEID: obj.routeId,
              N1ZNR: obj.frequencyId,
              PDUR:
                obj.durationCount.toString().trim() == ''
                  ? '0'
                  : obj.durationCount.toString(),
              PDURU:
                obj.dosageCountDesc == undefined ? '' : obj.dosageCountDesc,
              //"PDURU":  _item.durationKey,
              AGENTID: obj.agentId,
              PRSCRID: obj.PRSCRID,
              STORN: obj.isSelected ? 'X' : '',
              STOID: '',
              UPDMODE: obj.isSelected ? 'X' : '',
              LFDNR: obj.lfdnr,
              DESCR: obj.additionalInformation,
              PRN: obj.isPrn == undefined ? '' : obj.isPrn ? 'X' : '',
              PRNCOND: obj.prnText,
              DRUG: obj.drugNo,
              Eorderid: obj.Eorderid,
              Eorderitemid: obj.Eorderitemid,
            });
          });
          break;
      }
    });
    postObject['TOLABSET'] = labOrders;
    postObject['TORADSET'] = radOrders;
    postObject['TOPROCSET'] = procOrders;
    postObject['TOMEDICSET'] = medOrders;

    this.dataService.postData('OrderSet', postObject, false).subscribe(
      (success: any) => {
        const onlyoneObject =
          postObject.TOLABSET.length +
          postObject.TORADSET.length +
          postObject.TOPROCSET.length +
          postObject.TOMEDICSET.length;
        swal
          .fire({
            title: onlyoneObject > 1 ? 'eOrder Deleted' : 'Service has been deleted.',
            text: onlyoneObject > 1 ? 'e-Order has been deleted' : '',
            confirmButtonColor: '#0890c5',
            confirmButtonText: 'OK',
            backdrop: true,
            icon: 'success',
            customClass: 'myalertpopup',
          })
          .then((result) => {
            this.spinner.hide();
            this.clearData();
            this.resetView();
            this.loadHistory();
          });
      },
      (error: any) => {
        swal
          .fire({
            title: error.statusText,
            text: JSON.parse(error._body).error?.message.value,
            confirmButtonColor: '#096798',
            confirmButtonText: 'close',
            customClass: 'myalertpopup',
            backdrop: true,
            icon: 'error',
          })
          .then((result) => {
            this.spinner.hide();
            this.clearData();
            this.resetView();
            this.loadHistory();
          });
      }
    );
  }

  onPrintItem(element: any) {
    if (element && element.length > 0) {
      element.forEach((obj) => {
        obj['data'] = obj.TOLABSET.results.concat(
          obj.TORADSET.results,
          obj.TOPROCSET.results,
          obj.TOMEDICSET.results
        );
        let userSelect = obj.data.filter((item) => item['isSelected'] === true);
        if (userSelect.length > 0) {
          swal
            .fire({
              title: 'Print Items',
              text: 'Do you want to Print all ' + userSelect.length + ' items',
              showCancelButton: true,
              confirmButtonColor: '#0890c5',
              cancelButtonColor: '#84898c',
              confirmButtonText: 'Yes',
              cancelButtonText: 'No',
              customClass: 'myalertpopup',
              //type: "info",
            })
            .then((result) => {
              if (result.value) {
                let url = `${environment.eOrderpdfPrint}OrderPrintSet(Eorderid='${userSelect[0].Eorderid}')/$value?sap-client=${environment.client}`;
                window.open(url, '_blank');
              }
            });
        }
      });
    }
  }

  resetView() {
    let that = this;
    this.switchMode.name = 'history';
    if (this.navigationTab == 'Fees') {
      this.loadFeesOrder();
      this.loadHistory();
    }
    this.clearData();
  }

  callServiceHistory() {
    this.spinner.show();
    let url = environment.url;
    let filter = {
      Einri: this.jsonObj.Einri,
      Falnr: this.jsonObj.Falnr?.replace(/^0+/, ''),
    };
    return this.http.post(url + 'getServiceHistorySet', filter, {
      withCredentials: true,
    });
  }


  loadHistory() {
    this.callServiceHistory().subscribe((resp: any) => {
      let success = resp;
      if (resp._body) {
        success = JSON.parse(resp._body);
      }
      if (success.d.results.length > 0) {
        success.d.results.forEach((obj: any) => {
          obj.date = this.getDate(obj.Ibgdt) ? this.datePipe.transform(this.getDate(obj.Ibgdt).toString().replace(/\//g, ''), 'yyyy-MM-dd') : this.datePipe.transform(new Date(), 'yyyy-MM-dd');
          obj.time = this.getDate(obj.Ibgdt) ? this.datePipe.transform(this.getDate(obj.Ibgdt).toString().replace(/\//g, ''), 'HH:mm') : this.datePipe.transform(new Date(), 'HH:mm');
        });
        this.historyOrders = success.d.results;
        this.spinner.hide();
      }
    }, (_error: any) => {
      this.spinner.hide();
      // this._loader.hideLoader();
    });
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
      var str = str.split(':');
      var finalstr = str[0] + ':' + str[1];
      return finalstr;
    }
  }
  SelectDateEOrder(event: any, element: any) {
    const selectedDatedata = this.historyOrders.filter(d => d.Eorderid === element[0].Eorderid);
    if (selectedDatedata && selectedDatedata.length) {
      selectedDatedata.forEach(item => {
        if (element[0].type === 'LAB') {
          item.TOLABSET.results.forEach(d => d.isSelected = event.target.checked);
        } else if (element[0].type === 'RAD') {
          item.TORADSET.results.forEach(d => d.isSelected = event.target.checked);
        } else if (element[0].type === 'PRO') {
          item.TOPROCSET.results.forEach(d => d.isSelected = event.target.checked);
        } else if (element[0].type === 'MED') {
          item.TOMEDICSET.results.forEach(d => d.isSelected = event.target.checked);
        }
      });
    }
  }

  loadFeeService() {
    this.spinner.show();
    let filter = {
      Einri: this.jsonObj.Einri,
      Falnr: this.jsonObj.Falnr
      // Searchstring: "room",
    };

    let expandEntities = ['TOORDLISTSET'];
    this.dataService
      .loadData(
        'FeeServiceSearchSet',
        null,
        filter,
        false,
        expandEntities,
        false,
        true,
        false,
        false,
        false
      )
      .subscribe(
        (resp: any) => {
          let success = resp;
          if (resp._body) {
            success = JSON.parse(resp._body);
          }
          if (success.d.results && success.d.results.length) {
            success.d.results.forEach((obj: any) => {
              obj.icon = obj.Favourite ? 'star' : 'star_border';
              (obj.text = obj.Ktxt1),
                (obj.price = obj.Price),
                (obj.feeUnit = obj.Unit),
                (obj.einri = obj.Einri),
                (obj.falnr = obj.Falnr),
                (obj.talst = obj.Talst),
                (obj.tarif = obj.Tarif);
              obj.pricewithUnit = obj.Price.concat(' ' + obj.Unit);
            });
            this.feeServiceSearchData = success.d.results;
          }
          this.spinner.hide();
        },
        (_error: any) => {
          this.spinner.hide();
        }
      );
  }

  createFeeFavourite(object: any) {
    this.spinner.show();
    if (object.Favourite) {
      let postObject: any = {};
      postObject['Einri'] = this.jsonObj.Einri
      postObject['Tarif'] = object.Tarif;
      postObject['Talst'] = object.Talst;

      this.dataService
        .postData('FeesFavouriteSet', postObject, false)
        .subscribe(
          (_success: any) => {
            this.spinner.hide();
          },
          (_error: any) => {
            this.spinner.hide();
          }
        );
    } else {
      this.dataService.deleteData(`FeesFavouriteSet(Einri='${object.einri}',Tarif='${object.Tarif}',Talst='${object.Talst}')`, false);
      this.spinner.hide();
      this.loadFeeService();
    }
  }

  onAddFeeCheckbox(event: any, element: any) {
    element['isSelected'] = event.target.checked;
    if (event.target.checked) {
      if (this.feeServiceData !== null && this.feeServiceData != '') {
        const editableData = this.feeServiceData.filter(d => d.isEdit)
        if (editableData && editableData.length) {
          this.feeServiceData = null;
          this.feeServiceOrderData = null;
          this.loadFeeOrderSet();
        }
      }
      let object: any = {
        date: this.datePipe.transform(new Date(), 'yyyy-MM-dd'),
        time: this.datePipe.transform(new Date(), 'HH:mm'),
        isSelected: Boolean,
        dataType: 'FeesDataType',
        type: 'fees',
      };
      for (var childProps in element) {
        object[childProps] = element[childProps];
      }
      object['newprice'] = element.Price !== 'Manual Fees' ? element.Price : '0';
      object['isSelected'] = event.target.checked;
      // object['Price'] = object.Price !== "Manual Fees" ? object.Price : '0';
      this.onInsertOrder(object);
    } else {
      let object: any = {
        date: this.datePipe.transform(new Date(), 'yyyy-MM-dd'),
        isSelected: Boolean,
        time: this.datePipe.transform(new Date(), 'HH:mm'),
        dataType: 'FeesDataType',
        type: 'fees',
      };
      for (var childProps in element) {
        object[childProps] = element[childProps];
      }
      object['isSelected'] = event.target.checked;
      this.onInsertOrder(object);
    }
  }

  onCreateFeeOrder() {
    let postObject: any = {};
    postObject['Einri'] = this.jsonObj.Einri
    postObject['Falnr'] = this.jsonObj.Falnr

    let feeOrder: any = [];

    if (this.feeServiceData && this.feeServiceData.length > 0) {
      this.feeServiceData.forEach((element: any) => {
        postObject['Talst'] = element.Talst
        feeOrder.push({
          Einri: element.einri,
          Falnr: element.Falnr,
          Lfdnr: this.jsonObj.Lfdnr,
          Talst: element.Talst,
          Tarif: element.Tarif,
          Ktxt1: element.text,
          Fprice: `${element.newprice}`,
          Funit: element.Unit,
          Ibgdt:
            this.datePipe.transform(element.date, 'YYYY-MM-dd') +
            'T' +
            this.uiHelper.convertTimeToUTC(element.time),
          Remrk: element.note,
          Lnrls: element.Lnrls ? element.Lnrls : '',
        });
      });
    }
    postObject['TOORDLISTSET'] = feeOrder;
    this.dataService.postData('FeesOrderSet', postObject, false).subscribe(
      (resp: any) => {
        if (!postObject.TOORDLISTSET[0]['Lnrls'] || postObject.TOORDLISTSET[0]['Lnrls'] === '') {
          swal
            .fire({
              title: 'Fees Order Created',
              text: 'Your Fees Order has been created',
              confirmButtonColor: '#0890c5',
              confirmButtonText: 'OK',
              backdrop: true,
              icon: 'success',
              customClass: 'myalertpopup',
              //type: "info",
            })
            .then((result) => {
              if (result.value) {
                this.switchMode.name = 'history';
                this.spinner.hide();
                this.clearData();
                this.loadFeesOrder();
                this.loadHistory();
                if (this.feeServiceOrderData && this.feeServiceOrderData.length) {
                  this.feeServiceOrderData[0].dataType == '';
                }
              }
            });
        } else {
          swal
            .fire({
              title: 'Fees Order Updated',
              text: 'Your Fees Order has been updated',
              confirmButtonColor: '#0890c5',
              confirmButtonText: 'OK',
              backdrop: true,
              icon: 'success',
              customClass: 'myalertpopup',
              //type: "info",
            })
            .then((result) => {
              if (result.value) {
                this.switchMode.name = 'history';
                this.spinner.hide();
                this.clearData();
                this.loadFeesOrder();
                if (this.feeServiceOrderData && this.feeServiceOrderData.length) {
                  this.feeServiceOrderData[0].dataType == '';
                }
              }
            });
        }
        // this.spinner.hide();
      },
      (error: any) => {
        swal
          .fire({
            title: error.statusText,
            text: JSON.parse(error._body).error?.message.value,
            confirmButtonColor: '#096798',
            confirmButtonText: 'close',
            customClass: 'myalertpopup',
            backdrop: true,
            icon: 'error',
          })
          .then((result) => {
            this.switchMode.name = 'history';
            this.clearData();
            this.loadFeesOrder();
                if (this.feeServiceOrderData && this.feeServiceOrderData.length) {
                  this.feeServiceOrderData[0].dataType == '';
                }
            // this.spinner.hide();
            // this.loadFeesOrder();
          });
      }
    );
  }

  loadFeeOrderSet() {
    let filter = {
      Einri: this.jsonObj.Einri,
      Falnr: this.jsonObj.Falnr,
    };

    let expandEntities = ['TOORDLISTSET'];
    this.dataService
      .loadData(
        'FeesOrderSet',
        null,
        filter,
        false,
        expandEntities,
        true,
        true,
        false,
        false,
        false
      )
      .subscribe(
        (resp: any) => {
          let success = resp;
          if (resp._body) {
            success = JSON.parse(resp._body);
          }
          if (success.d.results.length > 0) {
            success.d.results.forEach((obj: any) => {
              const HistoryDate = obj.Ibgdt
                ? +obj.Ibgdt.replace(/[^0-9]/g, '')
                : null;
              obj.date = HistoryDate
                ? this.datePipe.transform(
                  HistoryDate.toString().replace(/\//g, ''),
                  'dd.MM.yyyy'
                )
                : '';
              if (obj.TOORDLISTSET.results && obj.TOORDLISTSET.results.length) {
                obj.TOORDLISTSET.results.forEach((obj: any) => {
                  const IbgdtDate = obj.Ibgdt
                    ? +obj.Ibgdt.replace(/[^0-9]/g, '')
                    : null;
                  (obj.favourite = obj.Favourite),
                    (obj.text = obj.Ktxt1),
                    (obj.newprice = obj.Fprice === '' ? 0 : obj.Fprice),
                    (obj.Unit = obj.Funit),
                    (obj.einri = obj.Einri),
                    (obj.falnr = obj.Falnr),
                    (obj.talst = obj.Talst),
                    (obj.tarif = obj.Tarif),
                    (obj.note = obj.Remrk);
                  obj.date = IbgdtDate
                    ? this.datePipe.transform(
                      IbgdtDate.toString().replace(/\//g, ''),
                      'yyyy-MM-dd'
                    )
                    : this.datePipe.transform(new Date(), 'yyyy-MM-dd');
                  obj.time = IbgdtDate
                    ? this.datePipe.transform(
                      IbgdtDate.toString().replace(/\//g, ''),
                      'HH:mm:ss'
                    )
                    : this.datePipe.transform(new Date(), 'HH:mm:ss');
                  obj.pricewithUnit = obj.Fprice.concat(' ' + obj.Funit);
                  obj.username = obj.UsrNm;
                });
              }
            });
            this.feeOrderHistory = success.d.results;
          }
        },
        (_error: any) => {
          // this._loader.hideLoader();
        }
      );
    // this.createFavourite(object);
  }

  onDeleteFeeItem(element: any) {
    this.feeServiceOrderData = [];
    if (element && element.length > 0) {
      element.forEach((obj) => {
        obj['data'] = obj.TOORDLISTSET.results;
        let userSelect = obj.data.filter((item) => item['isSelected'] === true);
        if (userSelect.length > 0) {
          if (userSelect.length > 0) {
            swal.fire({
              title: userSelect.length > 1 ? 'Do you want to delete the e-Order?' : `Do you want to delete Service ${userSelect[0].text} ?`,
              text: '',
              showCancelButton: true,
              confirmButtonColor: '#0890c5',
              cancelButtonColor: '#84898c',
              confirmButtonText: 'Yes',
              cancelButtonText: 'No',
              customClass: 'myalertpopup',
              //type: "info",
            }).then((result) => {
              if (result.value) {
                userSelect.forEach((obj) => {
                  obj['dataType'] = 'DeleteHistoryData';
                  this.onInsertOrder(obj);
                });
                this.onDeleteFeeSelect(obj);
              }
            });
          }
        }
      });
    }
  }

  onDeleteFeeSelect(element: any) {
    let postObject: any = {};
    postObject['Einri'] = this.constants.einri
      ? this.constants.einri
      : this.storageService.getLocal('einri');
    postObject['Falnr'] = this.constants.falnr
      ? this.constants.falnr
      : this.storageService.getLocal('falnr');

    let feeOrder: any = [];
    if (
      this.deleteOrders[0].groupItem &&
      this.deleteOrders[0].groupItem.length > 0
    ) {
      this.deleteOrders[0].groupItem.forEach((element: any) => {
        feeOrder.push({
          Einri: element.einri,
          Falnr: element.Falnr,
          Lfdnr: this.constants.lfdnr
            ? this.constants.lfdnr
            : this.storageService.getLocal('lfdnr'),
          Talst: element.Talst,
          Tarif: element.Tarif,
          Ktxt1: element.text,
          Fprice: element.newprice,
          Funit: element.feeUnit,
          Ibgdt:
            this.datePipe.transform(element.date, 'YYYY-MM-dd') +
            'T' +
            this.uiHelper.convertTimeToUTC(element.time),
          Remrk: element.note,
          Storn: element.isSelected ? 'X' : 'X',
          Lnrls: element.Lnrls,
        });
      });
    }
    postObject['TOORDLISTSET'] = feeOrder;
    this.dataService.postData('FeesOrderSet', postObject, false).subscribe(
      (success: any) => {
        let isBilledData = postObject.TOORDLISTSET.filter(d => d.Billed);
        swal
          .fire({
            title: postObject.TOORDLISTSET.length > 1 ? 'Fee Order Deleted' : '',
            html: postObject.TOORDLISTSET.length < 1 && isBilledData && isBilledData.length ? `Fee Service <b>${postObject.TOORDLISTSET[0].Ktxt1}</b> has been billed on <b>${postObject.TOORDLISTSET[0].Ibgdt.split('T')[0]}</b> Cancellation is not Possible`
              : 'Your Fee Order has been Deleted',
            confirmButtonColor: '#0890c5',
            confirmButtonText: 'OK',
            backdrop: true,
            icon: 'success',
            customClass: 'myalertpopup',
          })
          .then((result) => {
            this.spinner.hide();
            this.loadFeesOrder();
            this.clearData();
          });
      },
      (error: any) => {
        swal
          .fire({
            title: error.statusText,
            text: JSON.parse(error._body).error?.message.value,
            confirmButtonColor: '#096798',
            confirmButtonText: 'close',
            customClass: 'myalertpopup',
            backdrop: true,
            icon: 'error',
          })
          .then((result) => {
            this.spinner.hide();
            this.loadFeesOrder();
            this.clearData();
          });
      }
    );
  }

  onCopyFeeItem(element: any) {
    this.feeServiceOrderData = [];
    if (element && element.length > 0) {
      element.forEach((obj) => {
        obj['data'] = obj.TOORDLISTSET.results;
        let userSelect = obj.data.filter((item) => item['isSelected'] === true);
        if (userSelect.length > 0) {
          userSelect.forEach((obj) => {
            obj['dataType'] = 'CopyFeeHistoryData';
            obj['Orgid'] = '';
            obj['OrgidTxt'] = '';
            obj['Lnrls'] = ''
            obj['date'] = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
            obj['time'] = this.datePipe.transform(new Date(), 'HH:mm');
            obj['isEdit'] = true;
            this.onInsertOrder(obj);
          });
        }
      });
    }
  }

  onEditFeeItem(element: any) {
    this.feeServiceOrderData = [];
    this.loadFeeService();
    this.feeServiceData = '';
    if (element && element.length > 0) {
      element.forEach((obj) => {
        obj['data'] = obj.TOORDLISTSET.results;
        let userSelect = obj.data.filter((item) => item['isSelected'] === true);
        if (userSelect.length > 0) {
          userSelect.forEach((obj) => {
            obj['dataType'] = 'EditFeeHistoryData';
            obj['isEdit'] = true;
            this.onInsertOrder(obj);
          });
        }
      });
    }
  }

  onFeeOrderCheck(event: any, element: any) {
    let object: any = {
      isSelected: Boolean,
    };
    for (var childProps in element) {
      object[childProps] = element[childProps];
    }
    object['isSelected'] = event.target.checked;
    this.onCheckedOrder(element);
  }

  onCheckedOrder(insertorder: any) {
    if (insertorder.isSelected) {
      this.historyChecked.push(insertorder);
    } else {
      if (this.eOrdersMaster && this.eOrdersMaster.length) {
        const removeAt = this.historyChecked.findIndex(
          (d: any) =>
            d['DrugID'] === insertorder.DrugID &&
            d['agentID'] === insertorder.agentID &&
            d['DrugName'] === insertorder.DrugName
        );
        if (removeAt >= 0) {
          this.eOrdersMaster.splice(removeAt, 1);
        }
      }
    }
  }

  onAddTemplateCheckbox(event: any, element: any) {
    if (event.target.checked) {
      let object: any = {
        isSelected: Boolean,
      };
      for (var childProps in element) {
        object[childProps] = element[childProps];
      }
      object['isSelected'] = event.target.checked;
      this.loadTemplateData(object);
    } else {
      let object: any = {
        isSelected: Boolean,
      };
      for (var childProps in element) {
        object[childProps] = element[childProps];
      }
      object['isSelected'] = event.target.checked;
    }
  }

  onAddMedCheckbox(event: any, element: any) {
    if (element.isSelected) {
      let object: any = {
        date: this.datePipe.transform(new Date(), 'yyyy-MM-dd'),
        time: this.datePipe.transform(new Date(), 'HH:mm'),
        isSelected: Boolean,
        dataType: 'searchListData',
        type: 'TEMPLATE',
      };
      for (var childProps in element) {
        object[childProps] = element[childProps];
      }
      object['isSelected'] = event.target.checked;
      this.onTemplateOrder(object);
    } else {
      let object: any = {
        date: this.datePipe.transform(new Date(), 'yyyy-MM-dd'),
        isSelected: Boolean,
        time: this.datePipe.transform(new Date(), 'HH:mm'),
        dataType: 'searchListData',
        type: 'TEMPLATE',
      };
      for (var childProps in element) {
        object[childProps] = element[childProps];
      }
      object['isSelected'] = event.target.checked;
      this.onTemplateOrder(object);
    }
  }

  onSelectallMed(event: any) {
    for (let i = 0; i < this.tempalteData.length; i++) {
      const item = this.tempalteData[i];
      item.isSelected = event.target.checked;
      // if (item.isSelected) {
      //   let object: any = {
      //     date: this.datePipe.transform(new Date(), 'yyyy-MM-dd'),
      //     isSelected: Boolean,
      //     time: this.datePipe.transform(new Date(), 'HH:mm'),
      //     dataType: 'searchListData',
      //     type: 'TEMPLATE',
      //   };
      //   for (var childProps in item) {
      //     object[childProps] = item[childProps];
      //   }
      //   this.onTemplateOrder(object);
      // }
    }
  }

  onTemplateOrder(insertdata: any) {
    if (!this.eOrdersMaster) {
      this.eOrdersMaster = [];
    }
    if (insertdata.isSelected) {
      if (this.eOrdersMaster && !this.eOrdersMaster.find((d) => d.id === insertdata.id && d.DRUGID === insertdata.DRUGID)) {
        this.eOrdersMaster.push(insertdata);
      }
    } else {
      if (this.eOrdersMaster.length) {
        const removeAt = this.eOrdersMaster.findIndex((d: any) => d.id === insertdata.id && d.DRUGID === insertdata.DRUGID);
        if (removeAt >= 0) {
          this.eOrdersMaster.splice(removeAt, 1);
        }
      }
    }
    if (this.eOrdersMaster && this.eOrdersMaster.length === 0) {
      this.eOrdersMaster = null;
      this.eOrders = null;
    }
  }

  addTempalteOrder(event: any) {
    for (
      let i = 0;
      i < this.medicationSearchList[0].TOTEMPLATE.results.length;
      i++
    ) {
      const item = this.medicationSearchList[0].TOTEMPLATE.results[i];
      item.isSelected = event.target.checked;
    }
    this.opentempmodalservices.dismissAll();
    if (this.tempalteData && this.tempalteData.length > 0) {
      for (let i = 0; i < this.tempalteData.length; i++) {
        const item = this.tempalteData[i];
        item.isSelected = true;
        if (item.isSelected) {
          let object: any = {
            date: this.datePipe.transform(new Date(), 'yyyy-MM-dd'),
            isSelected: Boolean,
            time: this.datePipe.transform(new Date(), 'HH:mm'),
            dataType: 'searchListData',
            type: 'TEMPLATE',
          };
          for (var childProps in item) {
            object[childProps] = item[childProps];
          }
          this.onTemplateOrder(object);
        }
      }
    }
    if (this.eOrdersMaster && this.eOrdersMaster.length > 0) {
      if (this.eOrdersMaster.find(item => item.isSelected === true)) {
        let eorderFilter = this.eOrdersMaster.reduce((r, { type }) => {
          if (!r.some((o) => o.type == type)) {
            r.push({
              type,
              groupItem: this.eOrdersMaster.filter((v) => v.type == type),
            });
          }
          return r;
        }, []);
        this.eOrders = eorderFilter;
        if (this.eOrders && this.eOrders.length) {
          this.switchMode.name = 'eorders';
        } else {
          this.switchMode.name = 'history';
        }
      }
    }
  }

  loadTemplateData(element: any) {
    this.spinner.show();
    let _filter = {
      EINRI: this.constants.einri
        ? this.constants.einri
        : this.storageService.getLocal('einri'),
      PRSCRID: element.Prscrid,
    };
    let expandEntities = ['PrescriptionItemSet'];
    this.dataService
      .loadData(
        'PrescriptionSet',
        null,
        _filter,
        false,
        expandEntities,
        true,
        true,
        false,
        false,
        true
      )
      .subscribe(
        (resp: any) => {
          this.spinner.hide();
          let success = resp;
          if (resp._body) {
            success = JSON.parse(resp._body);
          }
          if (success.d.results[0].PrescriptionItemSet.results) {
            success.d.results[0].PrescriptionItemSet.results.forEach(
              (obj: any) => {
                obj.id = obj.AGENTID;
                obj.text = obj.RESULT_DRUG_NAME;
                obj.type = 'TEMPLATE';
                obj.formulaDesc = obj.FORMATDESCR;
                obj.routeDesc = obj.ROUTEDESCR;
                obj.drugId = obj.DRUGID;
                obj.drugName = obj.RESULT_DRUG_NAME;
                obj.drugUnit = obj.DURUNITTXT;
                obj.drugAgentId = obj.AGENTID;
                obj.dosageCount = obj.QUAN.replace(/\.0+$/, '');
                obj.dosageCountDesc = obj.QUANTUNITTXT;
                obj.frequencyDesc = obj.N1ZTXT;
                obj.durationCount = obj.PDUR.replace(/\.0+$/, '');
                obj.durationDesc = obj.DURUNITTXT;
                obj.isSelected = true;
                obj.comment = obj.DESCR;
              }
            );
            this.tempalteData = success.d.results[0].PrescriptionItemSet.results;
            // if (this.tempalteData && this.tempalteData.length > 0) {
            //   for (let i = 0; i < this.tempalteData.length; i++) {
            //     const item = this.tempalteData[i];
            //     item.isSelected = true;
            //     if (item.isSelected) {
            //       let object: any = {
            //         date: this.datePipe.transform(new Date(), 'yyyy-MM-dd'),
            //         isSelected: Boolean,
            //         time: this.datePipe.transform(new Date(), 'HH:mm'),
            //         dataType: 'searchListData',
            //         type: 'TEMPLATE',
            //       };
            //       for (var childProps in item) {
            //         object[childProps] = item[childProps];
            //       }
            //       this.onTemplateOrder(object);
            //     }
            //   }
            // }
          }
        },
        (_error: any) => {
          this.spinner.hide();
        }
      );
  }

  onDeleteTemplateList(deletedata: any) {
    if (deletedata.Tmpaccesslevel !== 'G') {
      swal.fire({
        title: 'Delete Item',
        text: 'Do You Want to delete Template Order',
        showCancelButton: true,
        confirmButtonColor: '#0890c5',
        cancelButtonColor: '#84898c',
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        customClass: 'myalertpopup',
        //type: "info",
      }).then((result) => {
        if (result.value) {
          this.spinner.show();
          this.dataService.deleteTemplateData(`UserTemplateSet('${deletedata.Prscrid}')`, false).subscribe(
            (resp: any) => {
              this.spinner.hide();
              swal.fire({
                title: 'Template Deleted',
                text: 'Template has been Deleted',
                confirmButtonColor: '#0890c5',
                confirmButtonText: 'OK',
                customClass: 'myalertpopup',
                icon: "success",
                //type: "info",
              }).then((result) => {
                if (result.value) {
                  this.loadMedicalOrder();
                }
              })
            },
            (error: any) => {
              swal.fire({
                title: error.statusText,
                text: JSON.parse(error._body).error?.message?.value,
                confirmButtonColor: '#096798',
                confirmButtonText: 'close',
                customClass: 'myalertpopup',
                backdrop: true,
                icon: 'error',
                //type: "info",
              })
                .then((result) => { });
              this.spinner.hide();
            }
          );
          this.loadMedicalData();
          this.spinner.hide();
        } else {
          this.spinner.hide();
        }
      });
    } else {
      swal.fire({
        title: 'You can’t delete a Global-Level Template!',
        // showCancelButton: true,
        confirmButtonColor: '#0890c5',
        confirmButtonText: 'OK',
        customClass: 'myalertpopup',
        //type: "info",
      }).then((result) => { });
    }
  }

  onTemplateLevelUpdate(updateData: any) {
    if (updateData) {
      const templatelevelupdate = {
        einri: updateData.Einri,
        prscrid: updateData.Prscrid,
        text: updateData.Descr,
        accesslevel: updateData.templateProcesslevel,
        admin: "X"
      }
      this.dataService.updateData(`UserTemplateSet(prscrid='${updateData.Prscrid}')`, templatelevelupdate).subscribe(
        (_success: any) => {
          this.spinner.hide();
        },
        (error: any) => {
          swal
            .fire({
              title: error.statusText,
              text: JSON.parse(error._body).error?.message.value,
              confirmButtonColor: '#096798',
              confirmButtonText: 'close',
              customClass: 'myalertpopup',
              backdrop: true,
              icon: 'error',
            })
            .then((result) => {
              this.spinner.hide();
              this.clearData();
              this.resetView();
            });
        }
      );
    }
  }

  OpenTemplateModel(content, element) {
    let ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
      windowClass: 'mytemlatemodel',
    };
    this.loadTemplateData(element);
    this.opentempmodalservices.open(content, ngbModalOptions);
  }

  CloseTemplateModel(event: any) {
    for (let i = 0; i < this.medicationSearchList[0].TOTEMPLATE.results.length; i++) {
      const item = this.medicationSearchList[0].TOTEMPLATE.results[i];
      item.isSelected = event.target.checked;
    }
    if (!this.eOrdersMaster) {
      this.eOrdersMaster = null;
      this.eOrders = null;
      this.switchMode.name = 'history';
    }
    this.templateData = false;
    this.opentempmodalservices.dismissAll();
    this.tempalteData = null;
  }
}
