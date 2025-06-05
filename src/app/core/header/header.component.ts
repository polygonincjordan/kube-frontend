import { ActivatedRoute, Router } from '@angular/router';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  TemplateRef,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as _ from 'lodash';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { CookieService } from 'ngx-cookie-service';
import Swal from 'sweetalert2';
import * as converter from 'xml-js';
import { EEmrService } from './../../services/e-emr.service';
import { StorageService } from '@services/storage.service';
import { UserType } from '@services/interfaces/common.enum';
import { CatalogItem } from '@services/e-kardex/interfaces/vitals';
import { environment } from 'src/environments/environment';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  @Output() StatusOfTab: EventEmitter<any> = new EventEmitter<any>();
  @Input() navTabBoxActiveValue;
  vitalsService: any;
  hospitalistdate: boolean = true;
  outpatientlistdata: boolean = false;
  isSeniorNurse: boolean=  false;
  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.sideWidget = false;
    this.showprofilemenu = false;
  }
  sideWidget = false;
  modalRef: BsModalRef;
  modalRefForPatientSearch: BsModalRef;
  showprofilemenu = false;
  showpassword = false;
  profileResponse: any;
  widgetsSet: any;
  patientSearchData: any[];
  form: FormGroup;
  searchString!: string;
  isPhysician: boolean = false;
  checked: boolean;
  @Output() redirectCheckInData = new EventEmitter<any>();

  myFlagForSlideToggle: boolean = true;
  passform: FormGroup;
  consultation: boolean = false;
  urlPath: any;
  sexList: any = [
    {
      label: 'Male',
      value: '1',
    },
    {
      label: 'Female',
      value: '2',
    },
    {
      label: 'Unknown',
      value: '3',
    },
  ]
  constructor(
    private modalService: BsModalService,
    private _dataServices: EEmrService,
    private cookies: CookieService,
    private formBuilder: FormBuilder,
    private storageService: StorageService,
    private route: Router,
    private _router: Router,
    private _route: ActivatedRoute,
    private eprescriptionService: EPrescriptionService
  ) {
    if (this.storageService.getKubeRule() == UserType.Physician) {
      this.isPhysician = true;
    }
    this.urlPath = window.location.pathname.substring(1);
    console.log(this.urlPath, "path");
    
  }

  public openModal(template: TemplateRef<any>) {
    const config: ModalOptions = { class: 'modal-dialog modal-lg' };
    this.modalRef = this.modalService.show(template, config);
    this.showprofilemenu = false;
  }
  public openModalForPatientSearch(template: TemplateRef<any>) {
    const config: ModalOptions = { class: 'modal-dialog-centered modal-xl' };
    this.modalRefForPatientSearch = this.modalService.show(template, config);
    this.searchString = '';
  }

  backPatient() {
    this.modalRefForPatientSearch?.hide();
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      dob: [''],
      mrn: [''],
      firstName: [''],
      lastName: [''],
      telephone: [''],
      idNumber: [''],
      sex: [''],
    });
    this.profileResponse = this.storageService.getUserProfile();
    if (this.route.url != '/emergencydashboard') {
      this.myWidgetConfigSet();
    }
    this.initPasswordForm();
  }
  initPasswordForm() {
    this.passform = this.formBuilder.group({
      currentPass: [''],
      newPass: [''],
      confirmNewPass: [''],
    });
  }
  // convenience getter for easy access to form fields
  get f() {
    return this.form.controls;
  }
  openSideWidget($event) {
    $event.stopPropagation();
    if (this.sideWidget) {
      this.sideWidget = false;
    } else {
      this.sideWidget = true;
      this.showprofilemenu = false;
    }
  }

  toggleSlide(isChecked: any, itemCatalog: CatalogItem) {
    this.myFlagForSlideToggle = true;

    this.vitalsService.updateCatalog(itemCatalog);
  }

  openProfileMenu($event) {
    this.showprofilemenu = !this.showprofilemenu;
    $event.stopPropagation();
    if (this.showprofilemenu) {
      // this.showprofilemenu = true;
      this.sideWidget = false;
    } else {
      // this.showprofilemenu = true;
    }
  }

  askQuestion(date) {
    if (date === date) {
      this.showprofilemenu = false;
    }
  }

  hospitalistdata() {
    if (this.route.url === '/e-hospitalist') {
      this.hospitalistdate = false;
    } else {
      this.hospitalistdate = true;
    }
  }

  removeSomeContentIntoProfile() {
    this.isSeniorNurse = false;
    const getKubeRule = this.storageService.getKubeRule();
    console.log(getKubeRule, "getKubeRule")
    if (getKubeRule === UserType.DayCaseNurse) {
      this.outpatientlistdata = false;
    } else if (getKubeRule === UserType.DIYNurse) {
      this.outpatientlistdata = false;
    } else if (getKubeRule === UserType.opnurse) {
      this.outpatientlistdata = false;
    } else if (getKubeRule === UserType.ERNurse) {
      this.outpatientlistdata = false;
    } else if (getKubeRule === UserType.NursingInpatient) {
      this.outpatientlistdata = false;
    } else if (getKubeRule == UserType.SeniorNurse) {
      this.isSeniorNurse = true;
    } else {
      this.outpatientlistdata = true;
    }
  }

  myWidgetConfigSet() {
    this.hospitalistdata();
    this.removeSomeContentIntoProfile();
    this._dataServices.getMyWidgetConfigSet().subscribe(
      (_success: any) => {
        if (_success) {
          this.widgetsSet = JSON.parse(_success._body).d.results;
          // let endoscopy = {
          //   "StyleClass": "card-header card-header-warning card-header-icon",
          //   "Widgetid": "ENDOSCOPY01",
          //   "Descr": "Endoscopy",
          //   "Icon": "local_hotel",
          //   "Rank": "001",
          //   "Color": "",
          //   "IsTile": true,
          //   "Type": "L01",
          //   "Gpart": "9000000051",
          //   "Assigned": true
          // };
          // let myFavoritePatient = {
          //   "StyleClass": "card-header card-header-warning card-header-icon",
          //   "Widgetid": "MYFAVORITEPATIENT01",
          //   "Descr": "My Favorite Patients List",
          //   "Icon": "local_hotel",
          //   "Rank": "001",
          //   "Color": "",
          //   "IsTile": true,
          //   "Type": "L01",
          //   "Gpart": "9000000051",
          //   "Assigned": true
          // };
          // this.widgetsSet.push(endoscopy);
          // this.widgetsSet.push(myFavoritePatient);
          
          this.StatusOfTab.emit(this.widgetsSet);
        }
      },
      (_error: any) => {}
    );
  }
  postWidgetConfigSet(id) {
    let Obj = {
      Assigned: true,
      Widgetid: id,
    };
    this._dataServices.postWidgetConfigSet(Obj).subscribe(
      (_success: any) => {
        this.myWidgetConfigSet();
      },
      (_error: any) => {}
    );
  }
  deleteWidgetConfigSet(id) {
    this._dataServices.deleteMyWidgetConfigSet(id).then(
      (_success: any) => {
        this.myWidgetConfigSet();
      },
      (_error: any) => {}
    );
  }

  DashboardConfigSet(target: any, data: any) {
    const checked = target.currentTarget.checked;
    if (checked === true) {
      this.postWidgetConfigSet(data);
    } else {
      this.deleteWidgetConfigSet(data);
    }
  }

  //patient search
  patientSearch(template) {
    let jsonObj;
    if (this.f.dob.value) {
      let day = this.f.dob.value.getDate();
      let month = this.f.dob.value.getMonth() + 1;
      let year = this.f.dob.value.getFullYear();
      let newDate = year + '-' + month + '-' + day + 'T00:00:00';
      jsonObj = {
        Widgetid: 'NPATSRCH01',
        FilterXml:
          "<?xml version='1.0'?><asx:abap><asx:values><OUTPUT><RSPARAMS><SELNAME>DATE_FIX</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>X</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>DATE_FX1</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>X</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_OSTAT</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_SELAKT</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_BESANZ</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>X</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_BPFEHL</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_BRFEHL</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_DATUMB</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>20221027</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_DATUMV</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>20220601</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_EWFEHL</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_LSTANZ</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_MAFEHL</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_PANUEC</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_TEFEHL</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_TMNANZ</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>X</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_VRMANZ</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_ZEITB</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>235959</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_ZEITV</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>000000</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_ZYKLLE</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_AOEFA</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_AOEPF</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>AM</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>CO</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>DO</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>EA</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>FR</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>FU</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>PD</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>PT</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>TL</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>WI</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>SE</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BHPER</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>9000000000</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BSSTA</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>30</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BSSTA</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>00</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BSSTA</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>58</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_DOCST</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_DOCTY</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_DOKAR</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_DSPTY</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_EINRI</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>1000</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_ETRGP</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_FALL</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_LEIST</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_LEIST</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>CAROPAMC</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_LSTGR</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_LSTST</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_LSTTX</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_PAT</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_RAUM</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_TRPAR</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_TRTGP</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>TIME_FIX</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>X</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>TIME_FX1</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>X</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_SEL_AP</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>X</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_FALAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>0</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_FALAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>1</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_FALAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>2</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_FALAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>3</LOW><HIGH/></RSPARAMS></OUTPUT></asx:values></asx:abap>",
        Patnr: this.f.mrn.value,
        Vname: this.f.firstName.value,
        Nname: this.f.lastName.value,
        Gbdav: newDate,
        Telnr: this.f.telephone.value,
        New: 'X',
        Falnr: this.f.idNumber.value || ""
      };
    } else {
      jsonObj = {
        Widgetid: 'NPATSRCH01',
        FilterXml:
          "<?xml version='1.0'?><asx:abap><asx:values><OUTPUT><RSPARAMS><SELNAME>DATE_FIX</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>X</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>DATE_FX1</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>X</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_OSTAT</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_SELAKT</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_BESANZ</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>X</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_BPFEHL</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_BRFEHL</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_DATUMB</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>20221027</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_DATUMV</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>20220601</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_EWFEHL</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_LSTANZ</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_MAFEHL</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_PANUEC</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_TEFEHL</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_TMNANZ</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>X</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_VRMANZ</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_ZEITB</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>235959</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_ZEITV</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>000000</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_ZYKLLE</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_AOEFA</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_AOEPF</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>AM</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>CO</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>DO</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>EA</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>FR</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>FU</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>PD</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>PT</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>TL</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>WI</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>SE</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BHPER</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>9000000000</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BSSTA</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>30</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BSSTA</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>00</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BSSTA</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>58</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_DOCST</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_DOCTY</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_DOKAR</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_DSPTY</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_EINRI</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>1000</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_ETRGP</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_FALL</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_LEIST</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_LEIST</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>CAROPAMC</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_LSTGR</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_LSTST</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_LSTTX</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_PAT</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_RAUM</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_TRPAR</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_TRTGP</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>TIME_FIX</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>X</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>TIME_FX1</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>X</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_SEL_AP</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>X</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_FALAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>0</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_FALAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>1</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_FALAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>2</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_FALAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>3</LOW><HIGH/></RSPARAMS></OUTPUT></asx:values></asx:abap>",
        Patnr: this.f.mrn.value,
        Vname: this.f.firstName.value,
        Nname: this.f.lastName.value,
        //Gbdav:this.f.dob.value,
        Telnr: this.f.telephone.value,
        New: 'X',
        Falnr: this.f.idNumber.value || ""
      };
    }
    this._dataServices.widgetDataFilter(jsonObj).subscribe(
      (_success: any) => {
        // this.form.reset();
        //console.log(_success.json());

        //_success = _success.json();

        let v = converter.xml2js(_success.d.DataXml, { compact: true });
        //console.log(this.dataOnTable);
        let _dataArray = [];
        let _output = v['asx:abap']['asx:values'].OUTPUT;
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
        });
        this.patientSearchData = _dataArray;
        // this.modalRef.hide();
        this.openModalForPatientSearch(template);
        // this.dataCount.emit(this.dataOnTable.length);
      },
      (_error: any) => {
        this.form.reset();
        // this.modalRef.hide();
        Swal.fire({
          title: 'No patient found with the specified attributes',
          icon: 'error',
          confirmButtonText: 'OK',
          //preConfirm: () => {},
        });
      }
    );
  }
  openPatientSearch(data, type?, itemMainList?) {
    let jsonObj = {
      ActionXml:
        '<?xml version="1.0" encoding="utf-16"?><asx:abap version="1.0" xmlns:asx="http://www.sap.com/abapxml"><asx:values><OUTPUT><ACTIONID>ROWCLICK</ACTIONID><SOURCEDATA>&lt;?xml version=&quot;1.0&quot; encoding=&quot;utf-16&quot;?&gt;&lt;asx:abap version=&quot;1.0&quot; xmlns:asx=&quot;http://www.sap.com/abapxml&quot;&gt;&lt;asx:values&gt;&lt;OUTPUT&gt;&lt;RN1WPV007_FIELDCAT&gt;&lt;PATNR&gt;0000000002&lt;/PATNR&gt;&lt;PZIFF&gt;8&lt;/PZIFF&gt;&lt;EINRI&gt;1000&lt;/EINRI&gt;&lt;EINKB/&gt;&lt;STORN/&gt;&lt;NNAME&gt;Cenizal&lt;/NNAME&gt;&lt;NNAMS&gt;CENIZAL&lt;/NNAMS&gt;&lt;VNAME&gt;Neslie&lt;/VNAME&gt;&lt;VNAMS&gt;NESLIE&lt;/VNAMS&gt;&lt;VORSW/&gt;&lt;NAMZU/&gt;&lt;TITEL/&gt;&lt;NAME2/&gt;&lt;PNAME&gt;Cenizal,Neslie&lt;/PNAME&gt;&lt;GBNAM&gt;Cenizal&lt;/GBNAM&gt;&lt;GBNAS&gt;CENIZAL&lt;/GBNAS&gt;&lt;GBDAT&gt;1995-10-22&lt;/GBDAT&gt;&lt;GSCHL&gt;2&lt;/GSCHL&gt;&lt;GSCHLE&gt;F&lt;/GSCHLE&gt;&lt;GSCHLTXT&gt;Female&lt;/GSCHLTXT&gt;&lt;NO_TC_ICON/&gt;&lt;EXTNR/&gt;&lt;RVNUM/&gt;&lt;PASSTY&gt;DL&lt;/PASSTY&gt;&lt;PASSTYTXT&gt;DriversLicense&lt;/PASSTYTXT&gt;&lt;PASSNR&gt;DRIVE123&lt;/PASSNR&gt;&lt;RESID/&gt;&lt;TODKZ/&gt;&lt;TODUR/&gt;&lt;TUTXT/&gt;&lt;AUFKZ/&gt;&lt;KRZAN/&gt;&lt;NOTAN/&gt;&lt;LAND&gt;JO&lt;/LAND&gt;&lt;LANDX&gt;Jordan&lt;/LANDX&gt;&lt;PSTLZ/&gt;&lt;ORT&gt;AbdaliBoulevardAmman&lt;/ORT&gt;&lt;ORT2/&gt;&lt;STRAS&gt;123&lt;/STRAS&gt;&lt;TELNR&gt;796992432&lt;/TELNR&gt;&lt;ADRES&gt;AbdaliBoulevardAmman123&lt;/ADRES&gt;&lt;RFPAT/&gt;&lt;TERMINID/&gt;&lt;ADRNR/&gt;&lt;ADROB/&gt;&lt;ADRN2/&gt;&lt;ADRO2/&gt;&lt;VIPKZ/&gt;&lt;INACT/&gt;&lt;PAPID/&gt;&lt;VKGID&gt;00000000&lt;/VKGID&gt;&lt;INSID/&gt;&lt;PATEXTID/&gt;&lt;STP/&gt;&lt;TAXNUM/&gt;&lt;_-ISHFR_-BIRTHRK&gt;0&lt;/_-ISHFR_-BIRTHRK&gt;&lt;EXTERNAL_SYSTEM/&gt;&lt;PSPNAME/&gt;&lt;PSPGBNAME/&gt;&lt;PSPADDRESS/&gt;&lt;EXTAUFG/&gt;&lt;VNAME_LONG/&gt;&lt;NNAME_LONG/&gt;&lt;GBNAM_LONG/&gt;&lt;TITLE_ACA2/&gt;&lt;TITLE_ACA2TXT/&gt;&lt;NAME_CO/&gt;&lt;PSTLP/&gt;&lt;PFACH/&gt;&lt;LANPF/&gt;&lt;ORTPF/&gt;&lt;ADRESPF/&gt;&lt;/RN1WPV007_FIELDCAT&gt;&lt;/OUTPUT&gt;&lt;/asx:values&gt;&lt;/asx:abap&gt;</SOURCEDATA><FIELDNAME></FIELDNAME></OUTPUT></asx:values></asx:abap>',
      Actionid: 'ROWCLICK',
      Widgetid: 'NPATSRCH01',
      Patnr: itemMainList.PATNR,
      Einri: itemMainList.EINRI,
      New: 'X',
    };
    this._dataServices.widgetResponseSet(jsonObj).subscribe(
      (_success: any) => {
        if (_success) {
          const url = new URL(_success?.d?.Url);
          console.log('url',url);
          

          const params = new URLSearchParams(url.search);
          const patnr = params.get('patnr');
          const falnr = params.get('falnr');
          const einri = params.get('einri');
          const lfdnr = params.get('lfdnr');
          let formattedCaseNumber = data?.Case.padStart(10, '0');
          const json = {
            Patnr: patnr,
            Einri: einri,
            Falnr: type == 'caseList' ?  formattedCaseNumber : data?.falnr,
            Lfdnr: lfdnr,
          };
          this.storageService.setCheckinData(json);
          localStorage.setItem('checkindata', JSON.stringify(json));
          this.redirectToTreatment(json);
        }
      },
      (_error: any) => {}
    );
  }
  redirectToTreatment(data) {
    const userType = this.storageService.getKubeRule();
    let redirectPoint: any;
    localStorage.setItem('admit_process', JSON.stringify(false));
    if(this.urlPath.includes('emr')) {
      // redirectPoint = `/e-kardex?`;
      redirectPoint = `/${this.urlPath.replace("emr", "e-kardex?")}`;
    } else if(this.urlPath.includes('e-hospitalist')) {
      // if(this.navTabBoxActiveValue == '02' || this.navTabBoxActiveValue == '03') {
        redirectPoint = `/${this.urlPath.replace("e-hospitalist", "admit-process?")}`;
        localStorage.setItem('admit_process', JSON.stringify(true));
      // }
      //  else {
      //   // redirectPoint = `/discharge-process?`;
      //   redirectPoint = `/${this.urlPath.replace("e-hospitalist", "discharge-process?")}`;
      //   localStorage.setItem('admit_process', JSON.stringify(true));
      // }
    } else {
      redirectPoint = `/${this.urlPath}?`;
    }

    // if (userType === UserType.opnurse) {
    //   redirectPoint = 'out-patient-nursing?';
    // } else if (
    //   [
    //     UserType.ERHospitalist,
    //     UserType.SeniorPhysician,
    //     UserType.Physician,
    //     UserType.FloorHospitalist,
    //     UserType.SeniorHospitalist,
    //     UserType.Community,
    //     UserType.PartTime,
    //   ].includes(userType)
    // ) {
    //   redirectPoint = 'e-kardex?';
    // } else if (userType === UserType.ERNurse) {
    //   redirectPoint = 'nursing-emergncy-dashboard?';
    // } else if (userType === UserType.DayCaseNurse) {
    //   redirectPoint = 'day-case-dashboard?';
    // } else if (userType === UserType.DIYNurse) {
    //   redirectPoint = 'dialysis-nursing-dashboard?';
    // } else if (userType === UserType.NursingInpatient) {
    //   redirectPoint = 'nursing-inpatient-dashboard?';
    // }  else if (userType === UserType.SeniorNurse) {
    //   redirectPoint = this.route.url+`?`;
    // }

    // const queryParams = `patnr=${data.Patnr}&falnr=${data.Falnr}&einri=${data.Einri}&lfdnr=${data.Lfdnr}&nav=Treatmentarea`;
    // const url = redirectPoint + queryParams;

    // window.open(url, '_blank');

    this._router.navigate([], {
      relativeTo: this._route,
      // queryParams: {
      //   patnr: checkindata.Patnr,
      //   falnr: checkindata.Falnr,
      //   einri: checkindata.Einri,
      //   lfdnr: checkindata.Lfdnr,
      //   redirectFor: checkindata.redirectFor
      // },
      queryParamsHandling: 'merge',
      // preserve the existing query params in the route
      skipLocationChange: false,
      // do not trigger navigation
    });
    window.open(
      redirectPoint +
        'patnr=' +
        data.Patnr +
        '&falnr=' +
        data.Falnr +
        '&einri=' +
        data.Einri +
        '&lfdnr=' +
        data.Lfdnr + 
        '&redirectFor=' +
        data.redirectFor +
        '&action=' +
        data.action +
        '&doctype=' +
        data.doctype +
        '&nav=Treatmentarea',
      '_blank'
    );
  }
  closeModal(){
    this.modalRef.hide();
  }

  closePatientListModal() {
    this.modalRefForPatientSearch?.hide();
    this.form.reset();
  }

  getPatientCase(caseNumber : any, index: number) {
    this.eprescriptionService
    .getData(
      `inPatientData/getPatientCaseSet?einri=1000&patnr=${caseNumber}`
    )
    .subscribe((resp: any) => {
      if (
        resp.body &&
        resp.body.d &&
        resp.body.d.results &&
        resp.body.d.results.length
      ) {
        this.patientSearchData[index].CaseList = resp.body.d.results;
        console.log(this.patientSearchData, "this.patientSearchData")
        // this.inHospitalistList = resp.body.d.results;
      }
    });
  }
  
  showOrder(data: any) {
    data.active = !data.active;
  }
  getDate(value) {
    if (value) {
        var str = value;
        var num = parseInt(str.replace(/[^0-9]/g, ''));
        var date = new Date(num);
        return date;
    }
  }

  //logout
  logOut() {
    localStorage.clear();
    sessionStorage.clear();
    this.cookies.delete('MYSAPSSO2', '/', 'ach.jo'),
      this.cookies.deleteAll(),
      window.location.reload();
  }
  savePassword() {
    if (
      this.passform.controls.newPass.value ==
      this.passform.controls.confirmNewPass.value
    ) {
      const json = {
        Userid: this.storageService.getUserProfile().UserName,
        Password: btoa(this.passform.controls.currentPass.value),
        NewPassword: btoa(this.passform.controls.newPass.value),
      };
      this._dataServices.changePassword(json).subscribe(
        (_success: any) => {
          Swal.fire({
            title: 'Password is changed successfully',
            icon: 'success',
            confirmButtonText: 'OK',
            //preConfirm: () => {},
          });
          this.initPasswordForm();
          this.modalRef.hide();
        },
        (_error: any) => {}
      );
    } else {
      Swal.fire({
        title: 'New password and confirm password should be match',
        icon: 'error',
        confirmButtonText: 'OK',
        //preConfirm: () => {},
      });
    }
  }

  openPatientSearchMainList(data) {
    let jsonObj = {
      ActionXml:
        '<?xml version="1.0" encoding="utf-16"?><asx:abap version="1.0" xmlns:asx="http://www.sap.com/abapxml"><asx:values><OUTPUT><ACTIONID>ROWCLICK</ACTIONID><SOURCEDATA>&lt;?xml version=&quot;1.0&quot; encoding=&quot;utf-16&quot;?&gt;&lt;asx:abap version=&quot;1.0&quot; xmlns:asx=&quot;http://www.sap.com/abapxml&quot;&gt;&lt;asx:values&gt;&lt;OUTPUT&gt;&lt;RN1WPV007_FIELDCAT&gt;&lt;PATNR&gt;0000000002&lt;/PATNR&gt;&lt;PZIFF&gt;8&lt;/PZIFF&gt;&lt;EINRI&gt;1000&lt;/EINRI&gt;&lt;EINKB/&gt;&lt;STORN/&gt;&lt;NNAME&gt;Cenizal&lt;/NNAME&gt;&lt;NNAMS&gt;CENIZAL&lt;/NNAMS&gt;&lt;VNAME&gt;Neslie&lt;/VNAME&gt;&lt;VNAMS&gt;NESLIE&lt;/VNAMS&gt;&lt;VORSW/&gt;&lt;NAMZU/&gt;&lt;TITEL/&gt;&lt;NAME2/&gt;&lt;PNAME&gt;Cenizal,Neslie&lt;/PNAME&gt;&lt;GBNAM&gt;Cenizal&lt;/GBNAM&gt;&lt;GBNAS&gt;CENIZAL&lt;/GBNAS&gt;&lt;GBDAT&gt;1995-10-22&lt;/GBDAT&gt;&lt;GSCHL&gt;2&lt;/GSCHL&gt;&lt;GSCHLE&gt;F&lt;/GSCHLE&gt;&lt;GSCHLTXT&gt;Female&lt;/GSCHLTXT&gt;&lt;NO_TC_ICON/&gt;&lt;EXTNR/&gt;&lt;RVNUM/&gt;&lt;PASSTY&gt;DL&lt;/PASSTY&gt;&lt;PASSTYTXT&gt;DriversLicense&lt;/PASSTYTXT&gt;&lt;PASSNR&gt;DRIVE123&lt;/PASSNR&gt;&lt;RESID/&gt;&lt;TODKZ/&gt;&lt;TODUR/&gt;&lt;TUTXT/&gt;&lt;AUFKZ/&gt;&lt;KRZAN/&gt;&lt;NOTAN/&gt;&lt;LAND&gt;JO&lt;/LAND&gt;&lt;LANDX&gt;Jordan&lt;/LANDX&gt;&lt;PSTLZ/&gt;&lt;ORT&gt;AbdaliBoulevardAmman&lt;/ORT&gt;&lt;ORT2/&gt;&lt;STRAS&gt;123&lt;/STRAS&gt;&lt;TELNR&gt;796992432&lt;/TELNR&gt;&lt;ADRES&gt;AbdaliBoulevardAmman123&lt;/ADRES&gt;&lt;RFPAT/&gt;&lt;TERMINID/&gt;&lt;ADRNR/&gt;&lt;ADROB/&gt;&lt;ADRN2/&gt;&lt;ADRO2/&gt;&lt;VIPKZ/&gt;&lt;INACT/&gt;&lt;PAPID/&gt;&lt;VKGID&gt;00000000&lt;/VKGID&gt;&lt;INSID/&gt;&lt;PATEXTID/&gt;&lt;STP/&gt;&lt;TAXNUM/&gt;&lt;_-ISHFR_-BIRTHRK&gt;0&lt;/_-ISHFR_-BIRTHRK&gt;&lt;EXTERNAL_SYSTEM/&gt;&lt;PSPNAME/&gt;&lt;PSPGBNAME/&gt;&lt;PSPADDRESS/&gt;&lt;EXTAUFG/&gt;&lt;VNAME_LONG/&gt;&lt;NNAME_LONG/&gt;&lt;GBNAM_LONG/&gt;&lt;TITLE_ACA2/&gt;&lt;TITLE_ACA2TXT/&gt;&lt;NAME_CO/&gt;&lt;PSTLP/&gt;&lt;PFACH/&gt;&lt;LANPF/&gt;&lt;ORTPF/&gt;&lt;ADRESPF/&gt;&lt;/RN1WPV007_FIELDCAT&gt;&lt;/OUTPUT&gt;&lt;/asx:values&gt;&lt;/asx:abap&gt;</SOURCEDATA><FIELDNAME></FIELDNAME></OUTPUT></asx:values></asx:abap>',
      Actionid: 'ROWCLICK',
      Widgetid: 'NPATSRCH01',
      Patnr: data.PATNR,
      Einri: data.EINRI,
      New: 'X',
    };
    this._dataServices.widgetResponseSet(jsonObj).subscribe(
      (_success: any) => {
        if (_success) {
          const url = new URL(_success?.d?.Url);
          console.log('url',url);
          

          const params = new URLSearchParams(url.search);
          const patnr = params.get('patnr');
          const falnr = params.get('falnr');
          const einri = params.get('einri');
          const lfdnr = params.get('lfdnr');
          let formattedCaseNumber = this.form?.value.idNumber?.padStart(10, '0');
          const json = {
            Patnr: patnr,
            Einri: einri,
            Falnr: this.form?.value?.idNumber ? formattedCaseNumber : falnr,
            Lfdnr: lfdnr,
          };
          this.storageService.setCheckinData(json);
          localStorage.setItem('checkindata', JSON.stringify(json));
          this.redirectToTreatment(json);
          this.modalRef?.hide();
          this.modalRefForPatientSearch?.hide();
          this.form.reset();

        }
      },
      (_error: any) => {}
    );
  }
}
