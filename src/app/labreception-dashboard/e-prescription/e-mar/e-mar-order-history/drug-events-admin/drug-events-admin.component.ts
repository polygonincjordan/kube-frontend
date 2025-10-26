import { DatePipe } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AddministrationService } from '@services/e-Prescription/Administration.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { UserConfig } from '@services/e-kardex/interfaces/user-config';
import { UserConfigurationService } from '@services/e-kardex/user-configuration.service';
import { StorageService } from '@services/storage.service';
import { formatDate } from 'ngx-bootstrap/chronos';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import swal from 'sweetalert2';
import { AuthService } from '@services/auth.service';
import { EmarWitnessComponent } from './emar-witness/emar-witness.component';

@Component({
  selector: 'app-drug-events-admin',
  templateUrl: './drug-events-admin.component.html',
  styleUrls: ['./drug-events-admin.component.scss']
})
export class DrugEventsAdminComponent implements OnInit {
  public administratiForm: FormGroup;
  modalRef: BsModalRef;
  public DoseReason: any[] = [];
  public TimeReason: any[] = [];
  public DrugReason: any[] = [];
  public Materialdata: any[] = [];
  public ReasonSet: any[] = [];
  public FillSource: any[] = [];
  @ViewChild('drugEventMain', { static: true }) drugEventMain: TemplateRef<any>;
  @ViewChild('Witnessid') Witnessid: EmarWitnessComponent;
  administered: boolean = true;
  qadministered: boolean = false;
  notadministered: boolean = false;
  addsupply: boolean = false;
  drugreturn: boolean = false;
  public isFormSubmitted: boolean = false;
  public getUserConfigData: UserConfig;
  public AdminiOrderingList: any[] = [];
  public medicationAdministrative: any = {};
  private LoginSubscription: Subscription;
  public eEmar: boolean;
  public isDisabledFsource: boolean;
  public Merespdata: any;
  public isEndedDisabled: boolean;
  emarActive: boolean = false;
  public RequestStatus: any;
  constructor(private authService: AuthService, private modalService: BsModalService, private route: ActivatedRoute, private router: Router, public storageService: StorageService, private userConfigurationService: UserConfigurationService, public ePrescriptionService: EPrescriptionService, public addministrationService: AddministrationService) { }

  ngOnInit() {

    console.log(this.storageService.patientData);
    this.userConfigurationService.getUserConfigData().subscribe((resp) => {
      this.getUserConfigData = resp;
    })
    this.employeeordering();
    this.loadMedicationAdministrative();
  }

  employeeordering() {
    this.ePrescriptionService.loadData(`e-prescription/OrderingList?`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d.results) {
        this.AdminiOrderingList = resp.body.d.results;
      }
    })
  }

  loadMedicationAdministrative() {
    this.ePrescriptionService.loadData(`e-prescription/medicationAdministrationUnitSet?Einri=${this.ePrescriptionService.parameters.einri}&Falnr=${this.ePrescriptionService.parameters.falnr}&Lfdnr=${this.ePrescriptionService.parameters.lfdnr}`, false, false, false, false).subscribe({
      next: (resp: any) => {
        if (resp.body && resp.body.d) {
          this.medicationAdministrative = {
            EmpResp: resp.body.d.EmpResp,
            OrderDepartment: resp.body.d.OrddeptOrgfaNm,
            OrderingTo: resp.body.d.OrdtoOrgpf,
            OrderingDept: resp.body.d.OrddeptOrgfa
          };
        }
      },
    });
  }

  // Drugdata(PayloadData) {
  //   if(this.administratiForm.get('AdditionalSupply').value.Pamount === '' || this.administratiForm.get('AdditionalSupply').value.Pamount === null){
  //     this.showErrorPopup("", 'Please specify the Quantity! ', "Error")
  //   }
  //   else{
  //     this.AdditionalSupplyaction("Your Additional Supply Request has been Submitted!", PayloadData)
  //   }
  // }


  openModalForDrugsEvents(item, data) {
    this.administratiForm = this.AdministerEventForm(item, data);
    this.administratiForm.get('AdditionalSupply').patchValue({ Nursingou: this.medicationAdministrative.OrderingTo });
    const config: ModalOptions = { class: 'modal-dialog-centered drug-event' };
    this.modalRef = this.modalService.show(this.drugEventMain, config);
    this.modalRef.onHide.subscribe((reason: string | any) => {
      if (reason === 'backdrop-click') {
      }
    });
    if (this.administratiForm.get('Fsource').value === 'CENTRAL_IN') {
      this.isDisabledFsource = false;
    } else {
      this.isDisabledFsource = true;
    }

    if (item.Events.Descr === 'Ended') {
      this.isEndedDisabled = true;
    } else {
      this.isEndedDisabled = false;
    }
    // this.RequestReasonaction()
    this.AdministerMaterialBatch(item)
    this.AdministerDrugReason()
    this.RequestStataction()
    // this.AdministerTimeReason()
    // this.AdministerDoseReason();
  }
  changeEvents(item) {
    if (item == 'Administered') {
      this.administered = true;
      this.qadministered = false;
      this.notadministered = false;
      this.addsupply = false;
      this.drugreturn = false;
    } else if (item == 'QAdministered') {
      this.administered = false;
      this.qadministered = true;
      this.notadministered = false;
      this.addsupply = false;
      this.drugreturn = false;
    } else if (item == 'NotAdministered') {
      this.administered = false;
      this.qadministered = false;
      this.notadministered = true;
      this.addsupply = false;
      this.drugreturn = false;
    } else if (item == 'AddSupply') {
      this.administered = false;
      this.qadministered = false;
      this.notadministered = false;
      this.addsupply = true;
      this.drugreturn = false;
    } else if (item == 'DrugReturn') {
      this.administered = false;
      this.qadministered = false;
      this.notadministered = false;
      this.addsupply = false;
      this.drugreturn = true;
    }
  }
  AdministerEventForm(item, data) {
    this.FSourcevalueaction(item.Events)
    return new FormGroup({
      Fsource: new FormControl(item.Events.Fsource),
      Descr: new FormControl(item.Events.Descr),
      Descrlt: new FormControl(data.Descrlt),
      Quan: new FormControl(data.Quan),
      Quanunit: new FormControl(data.Unit),
      N1znr: new FormControl(),
      Secwitness: new FormControl(item.Events.Secwitness),
      time: new FormControl(item.Events.Prn || item.Events.Prncond !== "" ? new Date() : this.sanitizeSAPDateFormat(item.Events.Pbdad, item.Events.Pbtad), Validators.required),
      CombineofDose: new FormControl(`${data.Quan} ${data.Unit} ${data.Routedescr} ${data.Formatdescr} ${data.N1ztxt}`),
      Admindose: new FormControl(`${item.Events.Quan} ${item.Events.Unit}`),
      Administrator: new FormGroup({
        Prncond: new FormControl(item.Events.Prncond),
        Einri: new FormControl(data.Einri),
        Falnr: new FormControl(item.Events.Falnr),
        Meevtid: new FormControl(item.Events.Meevtid),
        Rdrugdq: new FormControl(item.Events.Quan),
        Rbdad: new FormControl(new Date()),
        Rbtad: new FormControl(''),
        Rdosdif: new FormControl(''),
        Rtimdif: new FormControl(item.Events.Rtimdif),
        Fsource: new FormControl(item.Events.Fsource),
        Adnotestx: new FormControl(data.Comments),
        Prn: new FormControl(false),
        Meresp1: new FormControl(item.Events.Mesid === "600" ? item.Events.Erusr : this.getUserConfigData.UserId),
        Meresp2: new FormControl(item.Events.WitnessEmp),
        Quanunit: new FormControl(item.Events.Unit),
      }),
      NotAdminister: new FormGroup({
        Rdrugdq: new FormControl(''),
        Einri: new FormControl(data.Einri),
        Falnr: new FormControl(item.Events.Falnr),
        Meevtid: new FormControl(item.Events.Meevtid),
        Rbdad: new FormControl(new Date(), Validators.required),
        Rbtad: new FormControl(item.Events.Pbtad),
        Notgiven: new FormControl(true),
        Rdosdif: new FormControl(''),
        Rtimdif: new FormControl(item.Events.Rtimdif),
        Adnotestx: new FormControl(item.Events.Prncond),
        Meresp1: new FormControl(item.Events.Mesid === "600" ? "" :  this.getUserConfigData.UserId),
        Quanunit: new FormControl(data.Unit),
        Meresp2: new FormControl(item.Events.WitnessEmp),
      }),
      DrugAdminister: new FormGroup({
        Fsource: new FormControl(item.Events.Fsource),
        Einri: new FormControl(data.Einri),
        Falnr: new FormControl(item.Events.Falnr),
        Patnr: new FormControl(data.Patnr),
        Meevtid: new FormControl(item.Events.Meevtid),
        Pamount: new FormControl('', Validators.required),
        Pamountu: new FormControl(''),
        Rcodeid: new FormControl(''),
        Status: new FormControl('', Validators.required),
        Drugid: new FormControl(data.Drugid),
        Material: new FormControl(''),
        Batch: new FormControl(''),
        Empid: new FormControl(this.getUserConfigData.UserId),
      }),
      AdditionalSupply: new FormGroup({
        Einri: new FormControl(data.Einri),
        Falnr: new FormControl(item.Events.Falnr),
        Meevtid: new FormControl(item.Events.Meevtid),
        Patnr: new FormControl(this.ePrescriptionService.parameters.patnr),
        Pamount: new FormControl('', Validators.required),
        Pamountu: new FormControl(''),
        Pdate: new FormControl(new Date()),
        Ptime: new FormControl(`${this.parseTime(new Date())}`),
        Rcodeid: new FormControl('', Validators.required),
        Nursingou: new FormControl('', Validators.required),
        Empid: new FormControl(this.getUserConfigData.UserId)
      }),

    })
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
  Administerdata() {
    this.isFormSubmitted = true;
    if (this.administered) {
      if ((this.administratiForm.get('Administrator').get('Prncond').value === '' && this.administratiForm.get('Administrator').get('Prn').value) || (!this.administratiForm.get('Administrator').get('Prn').value && this.administratiForm.get('Administrator').get('Prncond').value !== '')) {
        this.showErrorPopup(null, 'Confirmation that administration conditions were checked, is required!', 'Error')
      } else {
        if (this.administratiForm.get('Secwitness').value === 'X') {
          this.showErrorPopup(null, 'Witness is required to administer the drug', 'Warn').then(
            (result) => {
              if (result.value) {
                this.Witnessid.showPopup(this.notadministered)
                this.Witnessid.onUpdateData.subscribe((resp) => {
                  if (this.LoginSubscription) { this.LoginSubscription.unsubscribe(); }
                  this.LoginSubscription = this.authService
                    .emrLogin(resp.username, resp.password)
                    .subscribe({
                      next: (data) => {
                        const parseData = JSON.parse(data._body);
                        this.administratiForm.get('Administrator').patchValue({
                          Meresp2: parseData.d.NameFirst
                        })
                        if (parseData) {
                          const PayloadData = {
                            ...this.administratiForm.get('Administrator').value,
                            Meresp2: parseData.d.Vma !== null ? parseData.d.Vma : "",
                            Meresp1: this.getUserConfigData.VMA,
                            Rbtad: `${this.parseTime(this.administratiForm.get('Administrator').value.Rbdad)}`,
                            Rbdad: `${formatDate(this.administratiForm.get('Administrator').value.Rbdad, 'YYYY-MM-DD')}T${formatDate(this.administratiForm.get('Administrator').value.Rbdad, "HH:mm:ss")}`
                          }
                          const { Quanunit, Prncond, ...payload } = PayloadData;
                          this.AdministerEventaction("The event has been Administered!", payload)
                        }

                      },
                      error: (err) => {
                        const errorBody = JSON.parse(err._body);
                        let errorMessage = errorBody?.error?.message.value;
                        this.showErrorPopup(null, errorMessage, 'Warn');
                      },
                    });
                })
              }
            });
        }
        else if (this.administratiForm.get('Secwitness').value === '') {
          const PayloadData = {
            ...this.administratiForm.get('Administrator').value,
            Meresp1: this.getUserConfigData.VMA,
            Meresp2: "",
            Rbtad: `${this.parseTime(this.administratiForm.get('Administrator').value.Rbdad)}`,
            Rbdad: `${formatDate(this.administratiForm.get('Administrator').value.Rbdad, 'YYYY-MM-DD')}T${formatDate(this.administratiForm.get('Administrator').value.Rbdad, "HH:mm:ss")}`
          }
          const { Quanunit, Prncond, ...payload } = PayloadData;
          this.AdministerEventaction("The event has been Administered!", payload)
        }
      }
    }
    else if (this.notadministered) {
      if (this.notadministered) {
        if (this.administratiForm.get('Secwitness').value === 'X') {
          this.showErrorPopup(null, 'Witness is required to administer the drug', 'Warn').then(
            (result) => {
              if (result.value) {
                this.Witnessid.showPopup(this.notadministered)
                this.Witnessid.onUpdateData.subscribe((resp) => {
                  if (this.LoginSubscription) { this.LoginSubscription.unsubscribe(); }
                  this.LoginSubscription = this.authService
                    .emrLogin(resp.username, resp.password)
                    .subscribe({
                      next: (data) => {

                        const parseData = JSON.parse(data._body);
                        this.administratiForm.get('NotAdminister').patchValue({
                          Meresp2: parseData.d.NameFirst
                        })
                        if (parseData) {
                          const PayloadData = {
                            ...this.administratiForm.get('NotAdminister').value,
                            Meresp2: parseData.d.Vma !== null ? parseData.d.Vma : "",
                            Meresp1: this.getUserConfigData.VMA,
                            Rdrugdq: this.administratiForm.get('NotAdminister').value.Rdrugdq.length ? this.administratiForm.get('NotAdminister').value.Rdrugdq : `0.000`,
                            Rbdad: `${formatDate(this.administratiForm.get('NotAdminister').value.Rbdad, 'YYYY-MM-DD')}T${formatDate(this.administratiForm.get('NotAdminister').value.Rbdad, "HH:mm:ss")}`
                          }
                          const { Quanunit, ...payload } = PayloadData;
                          this.AdministerEventaction("The event has been NotAdminustered!", payload)
                        }
                      },
                      error: (err) => {
                        const errorBody = JSON.parse(err._body);
                        let errorMessage = errorBody?.error?.message.value;
                        this.showErrorPopup(null, errorMessage, 'Warn');
                      },
                    });
                })
              }
            });
        }
        else if (this.administratiForm.get('Secwitness').value === '') {
          const PayloadData = {
            ...this.administratiForm.get('NotAdminister').value,
            Meresp1: this.getUserConfigData.VMA,
            Meresp2: "",
            Rdrugdq: this.administratiForm.get('NotAdminister').value.Rdrugdq.length ? this.administratiForm.get('NotAdminister').value.Rdrugdq : `0.000`,
            Rbdad: `${formatDate(this.administratiForm.get('NotAdminister').value.Rbdad, 'YYYY-MM-DD')}T${formatDate(this.administratiForm.get('NotAdminister').value.Rbdad, "HH:mm:ss")}`
          }
          const { Quanunit, ...payload } = PayloadData;
          this.AdministerEventaction("The event has been NotAdminustered!", payload)
        }
      }
    }
    else if (this.drugreturn) {
      const PayloadData = {
        ...this.administratiForm.get('DrugAdminister').value,
        Empid: this.getUserConfigData.VMA,
        Pamount:`${this.administratiForm.get('DrugAdminister').value.Pamount}`
        // Pamount: (this.administratiForm.get('DrugAdminister').value.Pamount === '' || this.administratiForm.get('DrugAdminister').value.Pamount === null) ? '0.000' : `${this.administratiForm.get('DrugAdminister').value.Pamount}`,
      }
      this.DrugReturnEventaction("Your Return Request has been Submitted!", PayloadData)
    }
    else if (this.addsupply) {
      const PayloadData = {
        ...this.administratiForm.get('AdditionalSupply').value,
        Empid: this.getUserConfigData.VMA,
        Pamount:`${this.administratiForm.get('AdditionalSupply').value.Pamount}`,
        // Pamount: (this.administratiForm.get('AdditionalSupply').value.Pamount === '' || this.administratiForm.get('AdditionalSupply').value.Pamount === null) ? '0.000' : `${this.administratiForm.get('AdditionalSupply').value.Pamount}`,
        Pdate: `${formatDate(this.administratiForm.get('AdditionalSupply').value.Pdate, 'YYYY-MM-DD')}T${formatDate(this.administratiForm.get('AdditionalSupply').value.Pdate, "HH:mm:ss")}`
      }
      this.AdditionalSupplyaction("Your Additional Supply Request has been Submitted!", PayloadData)
      // this.Drugdata(PayloadData)
    }
  }


  AdditionalSupplyaction(title, data) {
    if (this.administratiForm.get('AdditionalSupply').value.Pamount === '' || this.administratiForm.get('AdditionalSupply').value.Pamount === null) {
      this.showErrorPopup("", 'Please specify the Quantity! ', "Error")
    } else {
      const Additional = this.ePrescriptionService.postData('e-prescription/AdditionalSupply', data).subscribe({
        next: (resp: any) => {
          swal.fire({
            title: title,
            confirmButtonColor: '#0890c5',
            cancelButtonColor: '#84898c',
            confirmButtonText: 'OK',
            customClass: { popup: 'myalertpopup' },
            icon: 'success'
          } as any).then(() => {
            this.modalRef.hide()
            this.route.queryParams.subscribe((params: ParamMap) => {
              this.router.navigate(['e-prescription'], { queryParams: { ...params, isEmr: 'true' } });
              window.location.reload();
            });
          })
        },
        error: (error: any) => {
          this.showErrorPopup("", error.error.error.message.value, "Error")
        }
      })
    }
  }

  FillSourcedata(data: any) {
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

    });
  }

  AdministerEventaction(title, data) {
    const AdministerFillSource = this.ePrescriptionService.postData('e-prescription/getAdministerEvent', data).subscribe({
      next: (resp: any) => {
        swal.fire({
          title: title,
          confirmButtonColor: '#0890c5',
          cancelButtonColor: '#84898c',
          confirmButtonText: 'OK',
          customClass: { popup: 'myalertpopup' },
          icon: 'success'
        } as any).then(() => {
          this.modalRef.hide()
        })
      },
      error: (error: any) => {
        this.showErrorPopup("", error.error.error.message.value, "Error")
      }
    })
  }


  parsePTTime(data: string) {
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

  DrugReturnEventaction(title, data) {
    if (this.administratiForm.get('DrugAdminister').value.Status === '' || this.administratiForm.get('DrugAdminister').value.Status === null) {
      this.showErrorPopup("", 'The event has not yet been Received!', "Error")
    } else if (this.administratiForm.get('DrugAdminister').value.Pamount === '' || this.administratiForm.get('DrugAdminister').value.Pamount === null) {
      this.showErrorPopup("", 'Please specify the Quantity! ', "Error")
    }
    else{
      const AdministerEvent = this.ePrescriptionService.postData('e-prescription/DrugReturnEvent', data).subscribe({
        next: (resp: any) => {
          swal.fire({
            title: title,
            confirmButtonColor: '#0890c5',
            cancelButtonColor: '#84898c',
            confirmButtonText: 'OK',
            customClass: { popup: 'myalertpopup' },
            icon: 'success'
          } as any).then(() => {
            this.modalRef.hide()
            this.route.queryParams.subscribe((params: ParamMap) => {
              this.router.navigate(['e-prescription'], { queryParams: { ...params, isEmr: 'true' } });
              window.location.reload();
            });
          })
        },
        error: (error: any) => {
          this.showErrorPopup("", error.error.error.message.value, "Error")
        }
      })
    }

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

  RequestStataction() {
    const ReasonSet = this.ePrescriptionService.loadData(`e-prescription/RequestStat`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        this.RequestStatus = resp.body.d.results
        this.administratiForm.get('DrugAdminister').patchValue({
          Status: resp.body.d.results.find(d => d.Dtext === "Requested").Dvalue,
        });
      }
    }, () => {
      ReasonSet.unsubscribe();
    });
  }

  FSourcevalueaction(item) {
    const ReasonSet = this.ePrescriptionService.loadData(`e-prescription/FSourcelist?Meevtid=${item.Meevtid}`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        this.FillSource = resp.body.d.results;
        // this.administratiForm.get('Administrator').patchValue({
        //   Meevtid: resp.body.d.results.Meevtid,
        // });
      }
    }, () => {
      ReasonSet.unsubscribe();
    });
  }

  AdministerMaterialBatch(item, index?) {
    const AdministerDose = this.ePrescriptionService.loadData(`e-prescription/MaterialBatch?Einri=${this.ePrescriptionService.parameters.einri}&Falnr=${this.ePrescriptionService.parameters.falnr}&Nursingou=${this.medicationAdministrative.OrderingTo}&Drugid=${item.Events.Drugid}`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        this.Materialdata = resp.body.d.results;
        this.administratiForm.get('DrugAdminister').patchValue({
          // Fsource:resp.body.d.results[0].Fsource,
          Drugid: resp.body.d.results[0].Drugid,
          Batch: resp.body.d.results[0].Batch,
          Material: resp.body.d.results[0].Material,
          Pamountu: resp.body.d.results[0].Unit

        });
        this.administratiForm.get('AdditionalSupply').patchValue({
          Nursingou: this.medicationAdministrative.OrderingTo,
          Pamountu: resp.body.d.results[0].Unit
        });
        this.administratiForm.get('Administrator').patchValue({
          // Fsource: resp.body.d.results[0].Fsource,
        });
      }
    }, () => {
      AdministerDose.unsubscribe();
    });
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

  AdministerDoseReason() {
    const AdministerDose = this.ePrescriptionService.loadData(`e-prescription/DoseReason`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        this.DoseReason = resp.body.d.results;
        // this.administratiForm.get('Administrator').patchValue({
        //   Rdosdif: resp.body.d.results.find(d => d.Rcodeid === "00001").Descr
        // })
      }
    }, () => {
      AdministerDose.unsubscribe();
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
  parseDate(date: any) {
    if (date !== null) {
      return `${new DatePipe('en-US').transform(date, "yyyy-MM-dd")}T${formatDate(date, "HH:mm:ss")}`;
    }
    return null;
  }
  showErrorPopup(title: any, text: any, messageType) {
    return swal.fire({
      title: title ? title : '',
      text: text ? text : '',
      showCancelButton: messageType === 'Conform' ? true : false,
      confirmButtonColor: '#0890c5',
      cancelButtonColor: '#84898c',
      confirmButtonText: messageType === 'Error' ? 'Close' : messageType === 'Warn' ? 'Ok' : 'Yes',
      cancelButtonText: 'No',
      customClass: { popup: 'myalertpopup' },
      icon: messageType === 'Error' ? 'error' : messageType === 'Warn' ? 'warning' : 'success'
    } as any);
  }
  }
