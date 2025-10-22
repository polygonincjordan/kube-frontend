import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-documenting-delivery',
  templateUrl: './documenting-delivery.component.html',
  styleUrls: ['./documenting-delivery.component.scss'],
})
export class DocumentingDeliveryComponent implements OnInit {
  activeTab: string = 'deliverydata'; // Default tab
  @Input() data: any;
  @ViewChild('allergyModal', { static: true }) allergyModal: TemplateRef<any>;
  modalRefForAllergy: BsModalRef;
  @Output() reloadCheckin = new EventEmitter();

  public delvTypes = [
    { value: 'K', label: 'C/S' },
    { value: 'V', label: 'Forceps VD' },
    { value: 'N', label: 'Normal VD' },
    { value: 'S', label: 'Not Stated' },
    { value: 'Z', label: 'Vacuum VE' },
  ];

  public sexes = [
    { value: '1', label: 'Male' },
    { value: '2', label: 'Female' },
    { value: '3', label: 'Unknown' },
  ];
  public apgar = [
    { value: '0', label: '0 = Very Bad' },
    { value: '10', label: '10 = Very Good' },
  ];

  public delOutcomes = [
    { value: 'L', label: 'Live' },
    { value: 'M', label: 'Miscarriage' },
    { value: 'O', label: 'Other' },
    { value: 'S', label: 'Stillbirth' },
  ];

  public birthplaces = [
    { value: '1', label: 'Ambulance' },
    { value: '13', label: 'Cath Lab' },
    { value: '8', label: 'Day Case Unit' },
    { value: '16', label: 'Dialysis Unit' },
    { value: '19', label: 'Dining Area' },
    { value: '9', label: 'Endoscopy Unit' },
    { value: '4', label: 'ER' },
    { value: '18', label: 'General waiting area' },
    { value: '21', label: 'Hospital Parking' },
    { value: '6', label: 'ICU/CCU/HDU' },
    { value: '11', label: 'Infusion Bays Unit' },
    { value: '7', label: 'Inpatient Ward' },
    { value: '15', label: 'Laboratory' },
    { value: '23', label: 'LDR' },
    { value: '10', label: 'Lithotripsy Unit' },
    { value: '26', label: 'NICU' },
    { value: '20', label: 'Nursery' },
    { value: '12', label: 'OP Clinics' },
    { value: '5', label: 'OR' },
    { value: '24', label: 'Other transport' },
    { value: '27', label: 'Others' },
    { value: '25', label: 'PACU' },
    { value: '17', label: 'Pharmacy Area' },
    { value: '14', label: 'Radiology' },
    { value: '3', label: 'Upon Arrival to Hospital' },
    { value: '2', label: 'While transfer to other center' },
  ];

  headerData: any;
  deliveryForm: FormGroup;
  TOPATDEL: FormArray;
  isFormSubmitted: boolean = false;
  constructor(
    private emergencyService: EmergencyService,
    private storageService: StorageService,
    public formBuilder: FormBuilder,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {}

  initForm() {
    let currentTime = new Date().getHours() + ':' + new Date().getMinutes();

    this.deliveryForm = this.formBuilder.group({
      Faln1: this.data?.CaseNumber,
      Patnr: this.data?.Mrn,
      Endat: new Date(),
      Entim: currentTime,
      Fgtyp: '',
      Kzkom: false,
      Komtx: '',
      TOPATDEL: new FormArray([]),
    });
    for (let index = 0; index < 3; index++) {
      this.addItem();
    }
  }

  addItem(): void {
    this.TOPATDEL = this.deliveryForm.get('TOPATDEL') as FormArray;
    this.TOPATDEL.push(this.createNewOrder());
  }

  createNewOrder(): FormGroup {
    let currentTime = new Date().getHours() + ':' + new Date().getMinutes();

    return this.formBuilder.group({
      Faln1: this.data?.CaseNumber,
      Lfdnr: '',
      Faln2: '',
      Gbdat: new Date(),
      Gbtim: currentTime,
      Gschl: '',
      Gbgew: [''],
      Gwein: 'G',
      Gbgro: [''],
      Grein: 'CM',
      Kztxt: '',
      Kztot: false,
      Modus: '',
      Bwert: '',
      Vname: '',
      Bwert5: '',
      Bwert10: '',
      Bthlo: '',
      ZzfatherFnName: '',
      ZzfatherLnName: '',
      Location: '',
      AttPhys: this.storageService.getGpart(),
      Neww: '',
      Del: '',
    });
  }

  get TOPATDELMain(): FormArray {
    return this.deliveryForm.get('TOPATDEL') as FormArray;
  }

  get TOPATDEL0(): FormGroup {
    return this.TOPATDELMain?.at(0) as FormGroup;
  }

  get TOPATDEL1(): FormGroup {
    return this.TOPATDELMain?.at(1) as FormGroup;
  }

  get TOPATDEL2(): FormGroup {
    return this.TOPATDELMain?.at(2) as FormGroup;
  }
  public openModalForDelivery(text, data: any) {
    this.apgar = [];
    this.apgar = [
      { value: '0', label: '0 = Very Bad' },
      { value: '10', label: '10 = Very Good' },
    ];
    this.headerData = data;
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-xl allergy-modal-size',
    };
    this.modalRefForAllergy = this.modalService.show(this.allergyModal, config);
    this.initForm();
    this.getPatientDeliveryDetails();
  }

  getPatientDeliveryDetails() {
    this.emergencyService
      .fetchPatientDeliveryDetail(
        this.headerData?.CaseNumber
          ? this.headerData?.CaseNumber
          : this.data?.CaseNumber
      )
      .subscribe((res) => {
        this.bindDeliveryData(res);
      });
  }

  getGenderFromPatname(patname: string): string {
    const match = patname?.match(/\((M|F),/);
    if (!match) return '';
    return match[1] === 'F' ? 'Female' : 'Male';
  }

  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }

  clearFormArray = (formArray: FormArray) => {
    if (formArray) {
      while (formArray.length !== 0) {
        formArray.removeAt(0);
      }
    }
  };

  bindDeliveryData(data: any) {
    let currentTime = new Date().getHours() + ':' + new Date().getMinutes();

    const result = data?.d?.results?.[0];
    if (!result) return;

    const deliveryItems = result?.TOPATDEL?.results || [];

    deliveryItems.forEach((item) => {
      this.ensureApgarValue(item?.Bwert);
      this.ensureApgarValue(item?.Bwert5);
      this.ensureApgarValue(item?.Bwert10);
    });

    this.deliveryForm = this.formBuilder.group({
      Faln1: result?.Faln1,
      Patnr: result?.Patnr,
      Endat: result?.Endat
        ? new Date(+result?.Endat?.match(/\d+/)[0])
        : new Date(),
      Entim: result?.Entim ? this.formatODataTime(result?.Entim) : currentTime,
      Fgtyp: result?.Fgtyp,
      Kzkom: result?.Kzkom,
      Komtx: result?.Komtx,
      TOPATDEL: this.formBuilder.array([]),
    });

    const formArray = this.deliveryForm.get('TOPATDEL') as FormArray;

    deliveryItems.forEach((item) => {
      formArray.push(
        this.formBuilder.group({
          Faln1: item?.Faln1,
          Lfdnr: item?.Lfdnr,
          Faln2: item?.Faln2,
          Gbdat: item?.Gbdat
            ? new Date(+item?.Gbdat?.match(/\d+/)[0])
            : new Date(),
          Gbtim: item?.Gbtim ? this.formatODataTime(item?.Gbtim) : currentTime,
          Gschl: item?.Gschl,
          Gbgew: item?.Gbgew,
          Gwein: item?.Gwein,
          Gbgro: item?.Gbgro,
          Grein: item?.Grein,
          Kztxt: item?.Kztxt,
          Kztot: item?.Kztot,
          Modus: item?.Modus,
          Bwert: item?.Bwert,
          Vname: item?.Vname,
          Bwert5: item?.Bwert5,
          Bwert10: item?.Bwert10,
          Bthlo: item?.Bthlo,
          ZzfatherFnName: item?.ZzfatherFnName,
          ZzfatherLnName: item?.ZzfatherLnName,
          Location: item?.Location,
          AttPhys: item?.AttPhys,
          Neww: item?.Neww,
          Del: item?.Del,
        })
      );
    });

    while (formArray.length < 3) {
      formArray.push(this.createNewOrder());
    }
  }

  private ensureApgarValue(val: any) {
    if (val && !this.apgar.find((x) => x.value == val)) {
      this.apgar = [...this.apgar, { label: val, value: val }];
    }
  }

  formatODataTime(odataTime: string): string {
    if (!odataTime) return '';
    const match = odataTime?.match(/PT(\d+)H(\d+)M(\d+)S/);
    if (!match) return '';
    const hours = match[1].padStart(2, '0');
    const minutes = match[2].padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  close() {
    this.modalRefForAllergy.hide();
  }

  saveDelivery() {
    let paylaod = this.deliveryForm.value;
    paylaod.Endat = this.sanitizeSAPDateFormat(paylaod.Endat);
    paylaod.Entim = this.convertToTime(paylaod.Entim);
    paylaod.TOPATDEL = paylaod.TOPATDEL.map((item, index) => ({
      ...item,
      Neww: item.Lfdnr ? '' : 'X',
      Gbgew: item.Gbgew ? item.Gbgew : '0',
      Gbgro: item.Gbgro ? item.Gbgro : '0',
      Gbdat: this.sanitizeSAPDateFormat(item?.Gbdat),
      Gbtim: this.convertToTime(item?.Gbtim),
    }));
    paylaod.TOPATDEL = paylaod.TOPATDEL.filter(
      (item) => item.Vname && item.Vname.trim() !== ''
    );

    this.emergencyService.savePatientDelivery(paylaod).subscribe((res) => {
      Swal.fire({
        text: 'Documenting Delivery created successfully',
        icon: 'success',
        confirmButtonText: 'Ok',
        customClass: { popup: 'myalertpopup' },
      });
      this.modalRefForAllergy?.hide();
      this.reloadCheckin.next(true);
    });
  }

  sanitizeSAPDateFormat(date: any) {
    if (typeof date === 'string') {
      return date;
    } else {
      return `\/Date(${date.getTime()})\/`;
    }
  }

  convertToTime(time: any) {
    let createTime = time.split(':');
    return (createTime =
      'PT' + createTime[0] + 'H' + createTime[1] + 'M' + '00S');
  }

  addCustomValue = (term: string) => {
    console.log(term, 'term');

    const newItem = { label: term, value: term };
    this.apgar.push(newItem);
    return newItem;
  };
}
