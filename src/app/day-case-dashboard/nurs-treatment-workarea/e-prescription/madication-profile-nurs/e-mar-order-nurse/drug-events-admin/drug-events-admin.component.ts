import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AddministrationService } from '@services/e-Prescription/Administration.service';
import { EPrescriptionService, PrescriptionList } from '@services/e-Prescription/e-prescription.service';
import { UserConfig } from '@services/e-kardex/interfaces/user-config';
import { UserConfigurationService } from '@services/e-kardex/user-configuration.service';
import { StorageService } from '@services/storage.service';
import { formatDate } from 'ngx-bootstrap/chronos';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import swal from 'sweetalert2';
import { AuthService } from '@services/auth.service';
import { EmarWitnessComponent } from './emar-witness/emar-witness.component';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';

@Component({
  selector: 'app-drug-events-admin',
  templateUrl: './drug-events-admin.component.html',
  styleUrls: ['./drug-events-admin.component.css']
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
  public eventDetails: boolean=false;
  public eventDetailList: any;
  public isEventFinalized: boolean = false;
  private mainEvent: any;
  @Output() onClose: EventEmitter<any> = new EventEmitter<any>
  @Input() set medicationData(data: PrescriptionList) {
    console.log(data);

  }
  constructor(private authService: AuthService, private modalService: BsModalService, private route: ActivatedRoute, private router: Router, public storageService: StorageService, private userConfigurationService: UserConfigurationService, public ePrescriptionService: EPrescriptionService, public addministrationService: AddministrationService,public emergencyService:EmergencyService) { }

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
    console.log(item);
    this.isEventFinalized = item.Events.Mesid === '600';
    this.administratiForm = this.AdministerEventForm(item, data);
    this.getMainEvent(data.Meordid);
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
    this.RequestStataction();
    this.getEventChangeLogList(item);
    this.AdministerTimeReason()
    this.AdministerDoseReason();
  }
  changeEvents(item) {
    if (item == 'Administered') {
      this.administered = true;
      this.qadministered = false;
      this.notadministered = false;
      this.addsupply = false;
      this.drugreturn = false;
      this.eventDetails = false;
    } else if (item == 'QAdministered') {
      this.administered = false;
      this.qadministered = true;
      this.notadministered = false;
      this.addsupply = false;
      this.drugreturn = false;
      this.eventDetails = false;
    } else if (item == 'NotAdministered') {
      this.administered = false;
      this.qadministered = false;
      this.notadministered = true;
      this.addsupply = false;
      this.drugreturn = false;
      this.eventDetails = false;
    } else if (item == 'AddSupply') {
      this.administered = false;
      this.qadministered = false;
      this.notadministered = false;
      this.addsupply = true;
      this.drugreturn = false;
      this.eventDetails = false;
    } else if (item == 'DrugReturn') {
      this.administered = false;
      this.qadministered = false;
      this.notadministered = false;
      this.addsupply = false;
      this.drugreturn = true;
      this.eventDetails = false;
    }
    else if (item == 'EventDetails') {
      this.administered = false;
      this.qadministered = false;
      this.notadministered = false;
      this.addsupply = false;
      this.drugreturn = false;
      this.eventDetails = true;
    }
  }
  AdministerEventForm(item, data) {
    this.FSourcevalueaction(item.Events)
    const form = new FormGroup({
      Fsource: new FormControl(item.Events.Fsource),
      Descr: new FormControl(item.Events.Descr),
      Descrlt: new FormControl(item?.Events?.EventDesc),
      Quan: new FormControl(data.Quan),
      Quanunit: new FormControl(data.Unit),
      N1znr: new FormControl(),
      Secwitness: new FormControl(item.Events.Secwitness),
      time: new FormControl(item.Events.Prn ? new Date() : this.sanitizeSAPDateFormat(item.Events.Pbdad, item.Events.Pbtad), Validators.required),
      CombineofDose: new FormControl(`${data.Quan} ${data.Unit} ${data.Routedescr} ${data.Formatdescr} ${data.N1ztxt}`),
      Admindose: new FormControl(`${item.Events.Quan} ${item.Events.Unit}`),
      Administrator: new FormGroup({
        Prncond: new FormControl(item.Events.Prncond),
        Einri: new FormControl(data.Einri),
        Falnr: new FormControl(item.Events.Falnr),
        Meevtid: new FormControl(item.Events.Meevtid),
        Rdrugdq: new FormControl(item.Events.Quan),
        AmountPrescribed: new FormControl(item.Events.AmountPrescribed),
        PlanDQ: new FormControl(`${item.Events.PlanDQ} ${item.Events.PlanUN}`),
        PlanUN: new FormControl(item.Events.PlanUN),
        Rbdad: new FormControl( this.isSignedMed(item.Events.Mesid) || item.Events.Notgiven ? this.sanitizeSAPDateFormat(item.Events.Rbdad, item.Events.Rbtad) ?? new Date() : new Date()),
        Rbtad: new FormControl(''),
        Rdosdif: new FormControl(item.Events.RCODEID),
        Rtimdif: new FormControl(item.Events.Rtimdif),
        Fsource: new FormControl(item.Events.Fsource),
        Adnotestx: new FormControl(data.Comments),
        Prn: new FormControl(item.Events.Prn),
        Vfcoind:new FormControl(item.Events.Vfcoind),
        Meresp1: new FormControl(item.Events.Mesid === "600" ? item.Events.Erusr : this.getUserConfigData.UserId),
        Meresp2: new FormControl(item.Events.WitnessEmp),
        Quanunit: new FormControl(item.Events.Unit),
        DosageStr: new FormControl(item?.Events?.DosageStr),
        Quan2: new FormControl( this.isSignedMed(item.Events.Mesid) ? item.Events.Quan2 : item.Events.PlanDQ ),
        SCRAP: new FormControl( Number(item?.Events?.SCRAP) === 0 ? '' : `${item?.Events?.SCRAP} ${item.Events.PlanUN}`),
      }),
      NotAdminister: new FormGroup({
        Rdrugdq: new FormControl(''),
        AmountPrescribed: new FormControl(item.Events.AmountPrescribed),
        PlanDQ: new FormControl(`${item.Events.PlanDQ} ${item.Events.PlanUN}`),
        PlanUN: new FormControl(item.Events.PlanUN),
        Einri: new FormControl(data.Einri),
        Falnr: new FormControl(item.Events.Falnr),
        Meevtid: new FormControl(item.Events.Meevtid),
        Rbdad: new FormControl(new Date(), Validators.required),
        Rbtad: new FormControl(''),
        Notgiven: new FormControl(true),
        Rdosdif: new FormControl(item.Events.RCODEID, Validators.required),
        Rtimdif: new FormControl(item.Events.Rtimdif),
        Adnotestx: new FormControl(
         `${item.Events.Prncond ? `PRN Cond:\n ${item.Events.Prncond}` : ''}` +
         `${item.Events.Prncond && data.Comments ? '\n' : ''}` +
         `${data.Comments ? `Comments:\n ${data.Comments}` : ''}`
          ),
        Meresp1: new FormControl(item.Events.Mesid === "600" ? "" :  this.getUserConfigData.UserId),
        Quanunit: new FormControl(data.Unit),
        Meresp2: new FormControl(item.Events.WitnessEmp),
        DosageStr: new FormControl(item?.Events?.DosageStr),
        Quan2: new FormControl(''),
        SCRAP: new FormControl( Number(item?.Events?.SCRAP) === 0 ? '' : `${item?.Events?.SCRAP} ${item.Events.PlanUN}`),
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

    });

    const administratorQuan2 = form.get('Administrator.Quan2');
    const administratorRdosdif = form.get('Administrator.Rdosdif');
    const administratorVfcoind = form.get('Administrator.Vfcoind');
    if (item.Events.Prncond == "") {
      administratorVfcoind?.disable();
    }
    const originalAdministratorQuan2 = administratorQuan2?.value;

    if (administratorQuan2) {
      administratorQuan2.valueChanges.subscribe(newValue => {
        if (newValue !== originalAdministratorQuan2) {
          administratorRdosdif?.setValidators([Validators.required]);
          administratorRdosdif?.updateValueAndValidity();
        } else {
          administratorRdosdif?.setValidators([]);
          administratorRdosdif?.updateValueAndValidity();
        }
      });
    }

    return form;
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

  isSignedMed(value: string): boolean {
    const states = ['400', '500', '600'];
    return states.includes(value);
  }
  
  isPrnConditionEmpty(): boolean {
    return this.administratiForm.get('Administrator').get('Prncond').value == ''
  }

  isPrnChecked(): boolean {
    return this.administratiForm.get('Administrator').get('Vfcoind').value;
  }

  Administerdata() {
    if (this.isEventFinalized) return;
    const RdosdifControl = this.administratiForm.get('Administrator.Rdosdif');
    const RdosdifNotControl = this.administratiForm.get('NotAdminister.Rdosdif');
    this.isFormSubmitted = true;
    if (this.administered) {
      if (RdosdifControl?.invalid) {
          RdosdifControl.markAsTouched();
          return;         
      }
      if (this.mainEvent) this.administratiForm.get('Administrator.Meevtid').setValue(this.mainEvent);
      if (!this.isPrnChecked() && !this.isPrnConditionEmpty()) {
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
                            Rbdad: `${formatDate(this.administratiForm.get('Administrator').value.Rbdad, 'YYYY-MM-DD')}T${formatDate(this.administratiForm.get('Administrator').value.Rbdad, "HH:mm:ss")}`,
                             Fsource: this.administratiForm.get('Administrator.Fsource')?.value ?? ""
                          }
                          const { Quanunit,DosageStr, Prncond, SCRAP,PlanDQ,PlanUN, ...payload } = PayloadData;
                          
                          delete payload.DosageStr
                          delete payload.AmountPrescribed
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
        else {
          const PayloadData = {
            ...this.administratiForm.get('Administrator').value,
            Meresp1: this.getUserConfigData.VMA,
            Meresp2: "",
            Rbtad: `${this.parseTime(this.administratiForm.get('Administrator').value.Rbdad)}`,
            Rbdad: `${formatDate(this.administratiForm.get('Administrator').value.Rbdad, 'YYYY-MM-DD')}T${formatDate(this.administratiForm.get('Administrator').value.Rbdad, "HH:mm:ss")}`,
             Fsource: this.administratiForm.get('Administrator.Fsource')?.value ?? ""
          }
          const { Quanunit, Prncond,SCRAP,PlanDQ,PlanUN, ...payload } = PayloadData;
          delete payload.DosageStr
          delete payload.AmountPrescribed
          this.AdministerEventaction("The event has been Administered!", payload)
        }
      }
    }
    else if (this.notadministered) {
      if (this.notadministered) {
        if (RdosdifNotControl?.invalid) {
         RdosdifNotControl.markAsTouched();
         return;         
        } 
        if (this.mainEvent) this.administratiForm.get('NotAdminister.Meevtid').setValue(this.mainEvent);
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
                            Rbtad: `${this.parseTime(this.administratiForm.get('NotAdminister').value.Rbdad)}`,
                            Rbdad: `${formatDate(this.administratiForm.get('NotAdminister').value.Rbdad, 'YYYY-MM-DD')}T${formatDate(this.administratiForm.get('NotAdminister').value.Rbdad, "HH:mm:ss")}`
                          }

                          const { Quanunit,DosageStr,SCRAP,PlanDQ,PlanUN, ...payload } = PayloadData;
                          delete payload.DosageStr
                          delete payload.AmountPrescribed
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
        else {
          const PayloadData = {
            ...this.administratiForm.get('NotAdminister').value,
            Meresp1: this.getUserConfigData.VMA,
            Meresp2: "",
            Rdrugdq: this.administratiForm.get('NotAdminister').value.Rdrugdq.length ? this.administratiForm.get('NotAdminister').value.Rdrugdq : `0.000`,
            Rbtad: `${this.parseTime(this.administratiForm.get('NotAdminister').value.Rbdad)}`,
            Rbdad: `${formatDate(this.administratiForm.get('NotAdminister').value.Rbdad, 'YYYY-MM-DD')}T${formatDate(this.administratiForm.get('NotAdminister').value.Rbdad, "HH:mm:ss")}`
          }
          const { Quanunit,SCRAP,PlanDQ,PlanUN, ...payload } = PayloadData;

          delete payload.DosageStr
          delete payload.AmountPrescribed
          this.AdministerEventaction("The event has been NotAdminustered!", payload)
        }
      }
    }
    else if (this.drugreturn) {
      const PayloadData = {
        ...this.administratiForm.get('DrugAdminister').value,
        Empid: this.getUserConfigData.VMA,
        Pamount:`${this.administratiForm.get('DrugAdminister').value.Pamount}`,
         Fsource: this.administratiForm.get('Administrator.Fsource')?.value ?? ""
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
      d: {
        Meevtid: data.Meevtid,
        Fsource: data.Fsource ?? ""
      }
    }
    this.ePrescriptionService.postData(`e-prescription/updateFillSourcepost`, PayloadData).subscribe((resp: any) => {
      const mainevt = resp?.body?.d?.Meevtid;
      if (mainevt) {
        this.mainEvent = mainevt
      }
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
          this.onClose.emit({
            filterData: this.ePrescriptionService.checkedFilterData,
            medicationData: this.ePrescriptionService.prescriptionList
          });
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

  private getMainEvent(selectedId?: any): void {
    if (!selectedId) return;

    const { emarevents: events, emardata: data } = this.ePrescriptionService;
    if (!events || !data) return;

    const prnIds = new Set(data.filter(d => d.Prn).map(d => d.Meordid));
    const today = this.getFormattedDate(new Date());

    const todayEvents = events.find(e =>
      prnIds.has(e.Meordid) &&
      e.Mastev === "0000000000" &&
      e.Meordid === selectedId &&
      this.getFormattedDateFromPbdad(e.Pbdad) === today
    );
    if (todayEvents?.Meevtid) {
      this.mainEvent = todayEvents.Meevtid
    }
  }

  private getFormattedDateFromPbdad(date: string): string | null {
    if (date) {
      const timestamp = date.replace('/Date(', '').replace(')/', '');
      return new DatePipe('en-US').transform(+timestamp, 'dd.MM.yyyy');
    }
    return null;
  }

  private getFormattedDate(date: Date): string | null {
    return new DatePipe('en-US').transform(date, 'dd.MM.yyyy');
  }

  private getEventChangeLogList(item: any):void {
    const Meevtid = item.Events.Meevtid;
    this.ePrescriptionService.getData(`e-prescription/EventChangeLogListSet?Meevtid=${Meevtid}`).subscribe((resp: any) => {
      this.eventDetailList = resp.body.d.results;
    });
  }

  public getDate(value:any) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }
}
