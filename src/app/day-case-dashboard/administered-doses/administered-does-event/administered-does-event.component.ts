import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { HospitalistService } from '@services/e-hospitalist/hospitalist.service';
import { UserConfigurationService } from '@services/e-kardex/user-configuration.service';
import { StorageService } from '@services/storage.service';
import Swal from 'sweetalert2';
import { formatDate } from 'ngx-bootstrap/chronos';
import { EMarWitnessComponent } from './e-mar-witness/e-mar-witness.component';
import { Subscription } from 'rxjs';
import { AuthService } from '@services/auth.service';
@Component({
  selector: 'app-administered-does-event',
  templateUrl: './administered-does-event.component.html',
  styleUrls: ['./administered-does-event.component.scss']
})
export class AdministeredDoesEventComponent {
  @Input() MedicationAdministrationList;
  @Input() checkValue;
  @ViewChild('Witnessid') Witnessid: EMarWitnessComponent;
  @Input() missedMedPatientList;
  @Output() eventEmitter = new EventEmitter();
  public DrugReason: any[] = [];
  private LoginSubscription: Subscription;
  formattedDate: string;
  public AdminiOrderingList: any[] = [];
  checkboxclicktable = false;
  public ReasonSet: any[] = [];
  public isFormSubmitted: boolean = false;
  public RequestStatus: any;
  administratiForm: FormGroup;
  public additional: FormGroup;
  public isDisabledFsource: boolean;
  public DoseReason: any[] = [];
  listitem: any;
  Patnrnumber:any;
  formlist:any;
  public FillSource: any[] = [];
  public TimeReason: any[] = [];
  public adminiterList: any;
  userProfile: any[]
  eventSet:any;
  administered: boolean = true;
  notadministered: boolean = false;
  additionalsupply: boolean = false;
  drugreturn: boolean = false;
  constructor(private authService: AuthService,private hospitalistService: HospitalistService, private fb: FormBuilder, public ePrescriptionService: EPrescriptionService, public userConfigurationService: UserConfigurationService,public storageService: StorageService) {
  }

  
  AdministerEventForm(eventset, data) {
    this.changeEvents('Administered');
    let mainGroup= new FormGroup({
      Administrator: new FormGroup({
        Descr: new FormControl(eventset?.Descr),
        Descrlt: new FormControl(data.Descrlt),
        Quan: new FormControl(data.Quan),
        N1znr: new FormControl(),
        Secwitness: new FormControl(eventset?.Secwitness),
        time: new FormControl(eventset?.Prn || eventset?.Prncond !== "" ? new Date() : this.sanitizeSAPDateFormat(eventset?.Pbdad, eventset?.Pbtad), Validators.required),
        CombineofDose: new FormControl(`${data.Quan} ${data.Quantunittxt} ${data.Routedescr} ${data.Formatdescr} ${data.N1ztxt} ${data.N1id}`),
        Admindose: new FormControl(`${data?.Quan} ${data?.Quantunittxt}`),
        Prncond: new FormControl(eventset?.Prncond),
        Einri: new FormControl(data.Einri),
        Falnr: new FormControl(eventset?.Falnr),
        Meevtid: new FormControl(eventset?.Meevtid),
        Rdrugdq: new FormControl(eventset?.Quan),
        Rbdad: new FormControl(new Date()),
        Rbtad: new FormControl(''),
        Rdosdif: new FormControl(''),
        Rtimdif: new FormControl(eventset?.Rtimdif),
        Fsource: new FormControl(eventset?.Fsource),
        Adnotestx: new FormControl(data.Comments),
        Prn: new FormControl(false),
        Meresp1: new FormControl(eventset?.AdmEmp),
        Meresp2: new FormControl(eventset?.WitnessEmp),
        Quanunit: new FormControl(eventset?.Unit),
      }),
      NotAdminister: new FormGroup({
        Fsource: new FormControl(eventset?.Fsource),
        Descr: new FormControl(eventset?.Descr),
        Descrlt: new FormControl(data.Descrlt),
        Quan: new FormControl(data.Quan),
        N1znr: new FormControl(),
        Secwitness: new FormControl(eventset?.Secwitness),
        time: new FormControl(eventset?.Prn || eventset?.Prncond !== "" ? new Date() : this.sanitizeSAPDateFormat(eventset?.Pbdad, eventset?.Pbtad), Validators.required),
        CombineofDose: new FormControl(`${data.Quan} ${data.Quantunittxt} ${data.Routedescr} ${data.Formatdescr} ${data.N1ztxt} ${data.N1id}`),
        Admindose: new FormControl(`${data?.Quan} ${data?.Quantunittxt}`),
        Rdrugdq: new FormControl(eventset?.Quan),
        Einri: new FormControl(data.Einri),
        Falnr: new FormControl(eventset?.Falnr),
        Meevtid: new FormControl(eventset?.Meevtid),
        Rbdad: new FormControl(new Date(), Validators.required),
        Rbtad: new FormControl(eventset?.Pbtad),
        Notgiven: new FormControl(true),
        Rdosdif: new FormControl(''),
        Rtimdif: new FormControl(eventset?.Rtimdif),
        Adnotestx: new FormControl(eventset?.Prncond),
        Meresp1: new FormControl(eventset?.AdmEmp),
        Quanunit: new FormControl(eventset?.Unit),
        Meresp2: new FormControl(eventset?.WitnessEmp),
      }),
      DrugAdminister: new FormGroup({
        Descr: new FormControl(eventset?.Descr),
        Descrlt: new FormControl(data.Descrlt),
        Quan: new FormControl(data.Quan),
        Quanunit: new FormControl(data.Unit),
        N1znr: new FormControl(),
        Secwitness: new FormControl(eventset?.Secwitness),
        time: new FormControl(eventset?.Prn || eventset?.Prncond !== "" ? new Date() : this.sanitizeSAPDateFormat(eventset?.Pbdad, eventset?.Pbtad), Validators.required),
        CombineofDose: new FormControl(`${data.Quan} ${data.Quantunittxt} ${data.Routedescr} ${data.Formatdescr} ${data.N1ztxt} ${data.N1id}`),
        Admindose: new FormControl(`${data?.Quan} ${data?.Quantunittxt}`),
        Fsource: new FormControl(eventset?.Fsource),
        Einri: new FormControl(data.Einri),
        Falnr: new FormControl(eventset?.Falnr),
        Patnr: new FormControl(data.Patnr),
        Meevtid: new FormControl(eventset?.Meevtid),
        Pamount: new FormControl('', Validators.required),
        Pamountu: new FormControl(''),
        Rcodeid: new FormControl(''),
        Status: new FormControl('', Validators.required),
        Drugid: new FormControl(data.Drugid),
        Material: new FormControl(''),
        Batch: new FormControl(''),
        Empid: new FormControl(this.storageService.getUserProfile().UserName),
      }),
      AdditionalSupply: new FormGroup({
        Fsource: new FormControl(eventset?.Fsource),
        Descr: new FormControl(eventset?.Descr),
        Descrlt: new FormControl(data.Descrlt),
        Quan: new FormControl(data.Quan),
        Quanunit: new FormControl(data.Unit),
        N1znr: new FormControl(),
        Secwitness: new FormControl(eventset?.Secwitness),
        time: new FormControl(eventset?.Prn || eventset?.Prncond !== "" ? new Date() : this.sanitizeSAPDateFormat(eventset?.Pbdad, eventset?.Pbtad), Validators.required),
        CombineofDose: new FormControl(`${data.Quan} ${data.Quantunittxt} ${data.Routedescr} ${data.Formatdescr} ${data.N1ztxt} ${data.N1id}`),
        Admindose: new FormControl(`${data?.Quan} ${data?.Quantunittxt}`),
        Einri: new FormControl(data.Einri),
        Falnr: new FormControl(eventset?.Falnr),
        Meevtid: new FormControl(eventset?.Meevtid),
        Patnr: new FormControl(this.ePrescriptionService.parameters.patnr),
        Pamount: new FormControl('', Validators.required),
        Pamountu: new FormControl(''),
        Pdate: new FormControl(new Date()),
        Ptime: new FormControl(`${this.parseTime(new Date())}`),
        Rcodeid: new FormControl('', Validators.required),
        Nursingou: new FormControl('', Validators.required),
        Empid: new FormControl(this.storageService.getUserProfile().UserName)
      }),

    })
    
    this.RequestStataction();
    this.RequestReasonaction();
    return mainGroup;
  }
  ngOnInit(): void {
    this.Patnrnumber = this.missedMedPatientList.Patnr;
    this.AdministerTimeReason();
    this.AdministerDoseReason();
    this.AdministerDrugReason();
    this.employeeordering();
    this.checkboxclicktable = false;
  }
  employeeordering() {
    this.ePrescriptionService.loadData(`e-prescription/OrderingList?`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d.results) {
        this.AdminiOrderingList = resp.body.d.results;
      }
    })
  }

  ngOnChanges(changes: SimpleChanges){
    this.checkboxclicktable  = this.checkValue;
  }
  AdministerDoseReason() {
    const AdministerDose = this.ePrescriptionService.loadData(`e-prescription/DoseReason`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        this.DoseReason = resp.body.d.results;
      }
    }, () => {
      AdministerDose.unsubscribe();
    });
  }
  sanitizeSAPDateFormat(date: string, time: any) {
    if (typeof (date) === 'string') {
      if (date !== null && time !== null) {
        const generatedDate = new DatePipe('en-US').transform(
          date.replace('/Date(', '').replace(')/', ''), 'yyyy-MM-dd'
        );
        return new Date(`${generatedDate}T${this.parse(time)}`);
      } else {
        return null
      }
    } else {
      return date
    }
  }
  FillSourcedata(data: any) {
    const previousFsourceValue = this.administratiForm.get('Administrator.Fsource').value;
    if (data.Fsource === 'CENTRAL_IN') {
      this.isDisabledFsource = false;
    } else {
      this.isDisabledFsource = true;
    }
    const PayloadData = {
      Meevtid: data.Meevtid,
      Fsource: data.Fsource,
    }
    this.ePrescriptionService.updateData(`e-prescription/updateFillSource?Meevtid=${data.Meevtid}`, PayloadData).subscribe((resp: any) => {
      if(resp || resp == null){
        this.administratiForm.get('Administrator.Fsource').setValue(data.Fsource);
      }
    } ,(error: any) => {
      if (error) {
        Swal.fire({
          text:'You cannot able to change file source.',
          icon: 'error',
          confirmButtonText: 'Ok',
          customClass: 'myalertpopup'
        } as any);
      }
      this.administratiForm.get('Administrator.Fsource').setValue(previousFsourceValue);
    });
  }
  AdministerTimeReason() {
    const AdministerTime = this.ePrescriptionService.loadData(`e-prescription/TimeReason`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        this.TimeReason = resp.body.d.results;
      }
    }, () => {
      AdministerTime.unsubscribe();
    });;
  }
  FSourcevalueaction(item) {
    const ReasonSet = this.ePrescriptionService.loadData(`e-prescription/FSourcelist?Meevtid=${item}`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        this.FillSource = resp.body.d.results;
      }
    }, () => {
      ReasonSet.unsubscribe();
    });
  }
  RequestReasonaction() {
    const ReasonSet = this.ePrescriptionService.loadData(`e-prescription/RequestReason`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        this.ReasonSet = resp.body.d.results;
      }
    }, () => {
      ReasonSet.unsubscribe();
    });
  }
  parse(data: string) {
    if (data && data.length) {
      const strArr: string[] = data.split('');
      if (
        data &&
        data.length === 11 &&
        strArr[4] === 'H' &&
        strArr[7] === 'M' &&
        strArr[10] === 'S' &&
        !isNaN(+(strArr[2] + strArr[3])) &&
        !isNaN(+(strArr[5] + strArr[6])) &&
        !isNaN(+(strArr[8] + strArr[9]))
      ) {
        const hours = +(strArr[2] + strArr[3]) <= 9 ? `0${+(strArr[2] + strArr[3])}` : +(strArr[2] + strArr[3]);
        const Minute = +(strArr[5] + strArr[6]) <= 9 ? `0${+(strArr[5] + strArr[6])}` : +(strArr[5] + strArr[6]);
        const Second = +(strArr[8] + strArr[9]) <= 9 ? `0${+(strArr[8] + strArr[9])}` : +(strArr[8] + strArr[9]);
        return `${hours}:${Minute}:${Second}`
      }
    }
    return null;
  }
  checkboxChangedMedication(event: any, item: any) {
    this.MedicationAdministrationList.find(x => x.Meordid == item.Meordid).isChecked = event.target.checked;
    this.adminiterList = [];
    this.eventSet=[];
    for (let i = 0; i < this.MedicationAdministrationList.length; i++) {
      if(this.MedicationAdministrationList[i].isChecked) {
        this.MedicationAdministrationList[i].index = i;
      // this.adminiterList[i]=this.MedicationAdministrationList[i];
      this.adminiterList.push(this.MedicationAdministrationList[i]);
      }
    }
      if(this.adminiterList.length > 0)
      {
        var values = this.adminiterList[0];
        // var values= Object.values(this.adminiterList);
        if(values.EventSet && values.EventSet.length > 0 ){
          this.eventSet=values.EventSet;
          this.FSourcevalueaction(this.eventSet[0].Meevtid);
        }
        this.checkboxclicktable = true;
        const selectedItem = values;
        this.listitem  = values;
        this.administratiForm = this.AdministerEventForm(this.eventSet[0], selectedItem);
    //      this.administratiForm.patchValue({
    //       Descrlt: selectedItem.Descrlt,
    //       CombineofDose: `${selectedItem.Quan} ${selectedItem.Quantunittxt} ${selectedItem.Routedescr} ${selectedItem.Formatdescr} ${selectedItem.N1ztxt}`,
    //       Admindose: `${selectedItem.Quan} ${selectedItem.Quantunittxt}`,
    //       time: (selectedItem.Prn || selectedItem.Prncond !== "" ? new Date() : this.sanitizeSAPDateFormat(selectedItem.Pbdad, selectedItem.Pbtad)),
    //       Rdrugdq: this.eventSet[0]?.Quan,
    //       Quanunit: this.eventSet[0]?.Unit,
    //       Rdosdif: '',
    //       Rbdad: new Date(),
    //       Rtimdif: this.eventSet[0]?.Rtimdif,
    //       Prncond: selectedItem.Prncond,
    //       Meresp1: this.storageService.getUserProfile().UserName,
    //       Meresp2: selectedItem.Merespdata,
    //       Empid: this.storageService.getUserProfile().UserName,
    //       Pamountu: selectedItem.Pamountu,
    //       Adnotestx: selectedItem.Adnotestx,
    //       Rcodeid: selectedItem.Rcodeid,
    //       Material: selectedItem.Material,
    //       Ptime: selectedItem.Ptime,
    //       Pdate: selectedItem.Pdate,
    //       Pamount: selectedItem.Pamount,
    //       Fsource: this.eventSet[0]?.Fsource,
    //       Batch: selectedItem.Batch,
    //       Nursingou: selectedItem.Nursingou
    // });
      }
      else{
        this.checkboxclicktable = false;
      }
  }
  
  removeData(value:any) {
    this.eventEmitter.emit(false);
  }
  changeEvents(item) {
    if (item == 'Administered') {
      this.administered = true;
      this.notadministered = false;
      this.additionalsupply = false;
      this.drugreturn = false;
    } else if (item == 'Notadministered') {
      this.administered = false;
      this.notadministered = true;
      this.additionalsupply = false;
      this.drugreturn = false;
    } else if (item == 'Aditionalsupply') {
      this.administered = false;
      this.notadministered = false;
      this.additionalsupply = true;
      this.drugreturn = false;
    } else if (item == 'Drugreturn') {
      this.administered = false;
      this.notadministered = false;
      this.drugreturn = true;
      this.additionalsupply = false;
    }
  }
  RequestStataction() {
    const ReasonSet = this.ePrescriptionService.loadData(`e-prescription/RequestStat`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        this.RequestStatus = resp.body.d.results;
        this.administratiForm.value.DrugAdminister.Status=resp.body.d.results.find(d => d.Dtext === "Requested").Dvalue;
      }
    }, () => {
      ReasonSet.unsubscribe();
    });
  }
  
  Administerdata() {
    let params = {};
    if (this.administered) {
      if ((this.administratiForm.value.Administrator.Prncond === '' && this.administratiForm.value.Administrator.Prn) || (!this.administratiForm.value.Administrator.Prn && this.administratiForm.value.Administrator.Prncond !== '')) {
      this.showErrorPopup(null, 'Confirmation that administration conditions were checked, is required!', 'Error')
    }
    else{
      if (this.eventSet[0].Secwitness === 'X') {
        this.showErrorPopup(null, 'Witness is required to administer the drug', 'Warn').then(
          (result) => {
            if (result.value) {
              this.Witnessid.showPopup(this.notadministered)
              this.Witnessid.onUpdateData.subscribe((resp) => {
                if (this.LoginSubscription) { this.LoginSubscription.unsubscribe(); }
                this.LoginSubscription = this.authService
                  .login(resp.username, resp.password)
                  .subscribe({
                    next: (data) => {
                      const parseData = JSON.parse(data._body);
                      // this.administratiForm.get('Administrator').patchValue({
                      //   Meresp2: parseData.d.results[0].GpartName
                      // })
                      if (parseData) {
                        const PayloadData = {
                          ...this.administratiForm.get('Administrator').value,
                          Meresp2: parseData.d.results[0].Gpart !== null ? parseData.d.results[0].Gpart : "",
                        }
                        const { Quanunit, Prncond, ...payload } = PayloadData;
                        this.AdministerEventaction("The event has been Administered!", PayloadData)
                      }
                    },
                    error: (err) => {
                      this.showErrorPopup(null, err.message.error, 'Warn');
                    },
                  });
              })
            }
          });
      }
      else if (this.eventSet[0].Secwitness === '') {
        const PayloadData = {
          ...this.administratiForm.get('Administrator').value,
          Meresp2: "",
        }
        const { Quanunit, Prncond, ...payload } = PayloadData;
        this.AdministerEventaction("The event has been Administered!", payload)
      }
    }
    }
    else if (this.notadministered) { 
      if (this.eventSet[0].Secwitness === 'X') {
        this.showErrorPopup(null, 'Witness is required to administer the drug', 'Warn').then(
          (result) => {
            if (result.value) {
              this.Witnessid.showPopup(this.notadministered)
              this.Witnessid.onUpdateData.subscribe((resp) => {
                if (this.LoginSubscription) { this.LoginSubscription.unsubscribe(); }
                this.LoginSubscription = this.authService
                  .login(resp.username, resp.password)
                  .subscribe({
                    next: (data) => {
                      const parseData = JSON.parse(data._body);
                      // this.administratiForm.get('NotAdminister').patchValue({
                      //   Meresp2: parseData.d.results[0].GpartName
                      // })
                      if (parseData) {
                        const PayloadData = {
                          ...this.administratiForm.get('NotAdminister').value,
                          Meresp2: parseData.d.results[0].Gpart !== null ? parseData.d.results[0].Gpart : "",
                        }
                        const { Quanunit, Prncond, ...payload } = PayloadData;
                        this.AdministerEventaction("The event has been Administered!", PayloadData)
                      }
                    },
                    error: (err) => {
                      this.showErrorPopup(null, err.message.error, 'Warn');
                    },
                  });
              })
            }
          });
      }
      else if (this.eventSet[0].Secwitness === '') {
        const PayloadData = {
          ...this.administratiForm.get('NotAdminister').value,
          Meresp2: "",
        }
        const { Quanunit, Prncond, ...payload } = PayloadData;
        this.AdministerEventaction("The event has been Administered!", payload)
      }
    
    }
    else if (this.additionalsupply) {
      params = {
        Einri: this.listitem.Einri,
        Falnr: this.listitem.Falnr,
        Meevtid: this.eventSet[0].Meevtid,
        Patnr:  this.Patnrnumber,
        Pamount: `${this.administratiForm.value.AdditionalSupply.Pamount}`,
        Pamountu: this.administratiForm.value.AdditionalSupply.Pamountu,
        Pdate:`${formatDate(this.administratiForm.value.AdditionalSupply.Pdate, 'YYYY-MM-DD')}T${formatDate(this.administratiForm.value.AdditionalSupply.Pdate, "HH:mm:ss")}`,
        Ptime:this.administratiForm.value.AdditionalSupply.Ptime,
        Rcodeid: this.administratiForm.value.AdditionalSupply.Rcodeid == null? '' : this.administratiForm.value.AdditionalSupply.Rcodeid,
        Nursingou: this.administratiForm.value.AdditionalSupply.Nursingou == null? '' : this.administratiForm.value.AdditionalSupply.Nursingou,

        Empid:this.administratiForm.value.AdditionalSupply.Empid
      };
      this.AdditionalSupplyaction("Your Additional Supply Request has been Submitted!", params)
     }
    else if (this.drugreturn) {
      params = {
        Einri: this.listitem.Einri,
        Falnr: this.listitem.Falnr,
        Patnr:this.Patnrnumber,
        Pamount:`${this.administratiForm.value.DrugAdminister.Pamount}`,
        Pamountu:this.administratiForm.value.DrugAdminister.Pamountu,
        Rcodeid: this.administratiForm.value.DrugAdminister.Rcodeid == null? '' : this.administratiForm.value.DrugAdminister.Rcodeid,
        Status: this.administratiForm.value.DrugAdminister.Status == null? '' : this.administratiForm.value.DrugAdminister.Status,
        Fsource: this.eventSet[0].Fsource,
        Drugid:this.administratiForm.value.DrugAdminister.Drugid,
        Material:this.administratiForm.value.DrugAdminister.Material,
        Batch:this.administratiForm.value.DrugAdminister.Batch,
        Empid:this.administratiForm.value.DrugAdminister.Empid,
        Meevtid: this.administratiForm.value.DrugAdminister.Meevtid,
      };
      
      this.DrugReturnEventaction("Your Return Request has been Submitted!", params)
    }
  }

  AdditionalSupplyaction(title, data) {
    if (this.administratiForm.value.AdditionalSupply.Pamount === '' || this.administratiForm.value.AdditionalSupply.Pamount === null) {
      this.showErrorPopup("", 'Please specify the Quantity! ', "Error")
    } else {
      const Additional = this.ePrescriptionService.postData('e-prescription/AdditionalSupply', data).subscribe(
        (res: any) => {
          if (res) {
            Swal.fire({
              text: title,
              icon: 'success',
              confirmButtonText: 'Ok',
              customClass: 'myalertpopup'
            } as any);
          }
          this.removeOrderHistoryItem()
        },
        (error: any) => {
          if (error) {
            Swal.fire({
              text: error.error.error.message.value,
              icon: 'error',
              confirmButtonText: 'Ok',
              customClass: 'myalertpopup'
            } as any);
            this.removeOrderHistoryItem()
          }
          
        }
      );
    }
  }

  AdministerEventaction(title,params){
    if(this.administered){
      const rbtadValue = this.parseTime(new Date(this.administratiForm.get('Administrator').value.Rbdad))
      params = {
        Einri: this.listitem.Einri,
        Falnr: this.listitem.Falnr,
        Meevtid: this.eventSet[0].Meevtid,
        Rdrugdq: this.administratiForm.value.Administrator.Rdrugdq,
        Rbdad: `${formatDate(this.administratiForm.get('Administrator').value.Rbdad, 'YYYY-MM-DD')}T${formatDate(this.administratiForm.get('Administrator').value.Rbdad, "HH:mm:ss")}`,
        Rbtad: rbtadValue,
        Rdosdif: this.administratiForm.value.Administrator.Rdosdif == null? '' : this.administratiForm.value.Administrator.Rdosdif,
        Rtimdif: this.administratiForm.value.Administrator.Rtimdif == null? '' : this.administratiForm.value.Administrator.Rtimdif,
        Fsource: params.Fsource,
        Adnotestx: this.administratiForm.value.Administrator.Adnotestx == null? '' : this.administratiForm.value.Administrator.Adnotestx,
        Prn: this.administratiForm.value.Administrator.Prn,
        Meresp2: params.Meresp2,
        // Meresp2: this.administratiForm.value.Administrator.Meresp2,
        Meresp1: this.administratiForm.value.Administrator.Meresp1,
        // Prncond: this.administratiForm.value.Administrator.Prncond
      };
    }else if(this.notadministered){
      params = {
        Einri: this.listitem.Einri,
        Falnr: this.listitem.Falnr,
        Meevtid: this.eventSet[0].Meevtid,
        Rbdad: `${formatDate(this.administratiForm.get('NotAdminister').value.Rbdad, 'YYYY-MM-DD')}T${formatDate(this.administratiForm.get('NotAdminister').value.Rbdad, "HH:mm:ss")}`,
        Rbtad: this.eventSet[0].Rbtad,
        Notgiven : true,
        Rdosdif: this.administratiForm.value.NotAdminister.Rdosdif == null? '' : this.administratiForm.value.NotAdminister.Rdosdif,
        Rtimdif: this.eventSet[0].Rtimdif,
        Adnotestx: this.administratiForm.value.NotAdminister.Adnotestx,
        Meresp1: this.administratiForm.value.NotAdminister.Meresp1,
      };
    }
   
     this.hospitalistService.getAdministerEvent(params).subscribe(
      
      (res: any) => {
        if (res) {
          Swal.fire({
            text: this.toastrmessage(),
            icon: 'success',
            confirmButtonText: 'Ok',
            customClass: 'myalertpopup'
          } as any);
        }
        this.removeOrderHistoryItem()
      },
      (error: any) => {
        if (error) {
          Swal.fire({
            text: error.error.error.message.value,
            icon: 'error',
            confirmButtonText: 'Ok',
            customClass: 'myalertpopup'
          } as any);
          this.removeOrderHistoryItem()
        }
        
      }
    );
  }

  DrugReturnEventaction(title, data) {
    if (this.administratiForm.value.DrugAdminister.Status === '' || this.administratiForm.value.DrugAdminister.Status === null) {
      this.showErrorPopup("", 'The event has not yet been Received!', "Error")
    } else if (this.administratiForm.value.DrugAdminister.Pamount === '' || this.administratiForm.value.DrugAdminister.Pamount === null) {
      this.showErrorPopup("", 'Please specify the Quantity! ', "Error")
    }
    else{
      const AdministerEvent = this.ePrescriptionService.postData('e-prescription/DrugReturnEvent', data).subscribe(
        (res: any) => {
          if (res) {
            Swal.fire({
              text: title,
              icon: 'success',
              confirmButtonText: 'Ok',
              customClass: 'myalertpopup'
            } as any);
          }
          this.removeOrderHistoryItem()
        },
        (error: any) => {
          if (error) {
            Swal.fire({
              text: error.error.error.message.value,
              icon: 'error',
              confirmButtonText: 'Ok',
              customClass: 'myalertpopup'
            } as any);
            this.removeOrderHistoryItem()
          }
          
        }
      );
    }

  }
  toastrmessage(){
    if(this.administered){
      return 'SSuccessfully event is administer'
    } else if(this.notadministered){
      return 'Successfully event is not administered'
    }
  }
  removeOrderHistoryItem(){
    this.MedicationAdministrationList[this.adminiterList[0].index].isChecked = false;
    this.adminiterList.shift();
    if(this.adminiterList.length > 0)
    {
      var values = this.adminiterList[0];
      // var values= Object.values(this.adminiterList);
      if(values.EventSet && values.EventSet.length > 0 ){
        this.eventSet=values.EventSet;
        this.FSourcevalueaction(this.eventSet[0].Meevtid);
      }
      this.checkboxclicktable = true;
      this.administratiForm = this.AdministerEventForm(this.eventSet[0], values);
    }
    else{
      this.checkboxclicktable = false;
    }
  }
  AdministerDrugReason() {
    const AdministerDrug = this.ePrescriptionService.loadData(`e-prescription/DrugReturnReason`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        this.DrugReason = resp.body.d.results;
      }
    }, () => {
      AdministerDrug.unsubscribe();
    });;
  }
  durationConvert(data: any) {
    if (data === 0) {
      return ""
    }
    return data
  }
  getDate(value) {    
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }
  parseTime(date) {
    const newDate = `${new DatePipe('en-US').transform(date, "HH:mm:ss")}`
    if (newDate) {
      const strArr: string[] = newDate.split(':');
      if (
        newDate &&
        newDate.length === 8
      ) {
        return `PT${strArr[0]}H${strArr[1]}M${strArr[2]}S`;
      }
    }
    return null;
  }

  parseDuration(duration) {
    const matches = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = matches[1] ? parseInt(matches[1]) : 0;
    const minutes = matches[2] ? parseInt(matches[2]) : 0;
    const seconds = matches[3] ? parseInt(matches[3]) : 0;
    return `${hours}:${minutes}:${seconds}`;
}
  showErrorPopup(title: any, text: any, messageType) {
    return Swal.fire({
      title: title ? title : '',
      text: text ? text : '',
      showCancelButton: messageType === 'Conform' ? true : false,
      confirmButtonColor: '#0890c5',
      cancelButtonColor: '#84898c',
      confirmButtonText: messageType === 'Error' ? 'Close' : messageType === 'Warn' ? 'Ok' : 'Yes',
      cancelButtonText: 'No',
      customClass: 'myalertpopup',
      icon: messageType === 'Error' ? 'error' : messageType === 'Warn' ? 'warning' : 'success'
    } as any);
  }
}
