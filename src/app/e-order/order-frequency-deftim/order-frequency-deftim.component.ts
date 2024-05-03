import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AddministrationService } from '@services/e-Prescription/Administration.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import swal from 'sweetalert2';
import { formatDate } from 'ngx-bootstrap/chronos';
import { Subscription } from 'rxjs';

@Component({
  selector: 'order-frequency-deftim',
  templateUrl: './order-frequency-deftim.component.html',
  styleUrls: ['./order-frequency-deftim.component.scss']
})
export class OrderFrequencyDeftimComponent implements OnInit {

  public frequencyForm: FormGroup = new FormGroup({
    deftimcycleData: new FormArray([])
  });
  public defaultData: any;
  public valueChangeSubscription: Subscription;
  public isFormReady: boolean = false;
  public isFormSubmitted: boolean = false;
  public disabledosage: boolean = false;
  public medicationDrugList: any;
  public defaultMedicationDrugListData: any;
  public dosageUnitList: any[];
  @Input() set defaultfrequencydeftim(data: any) {
    if (data && data.deftimcycleData && data.deftimcycleData.length && !this.isFormReady) {
      this.defaultData = data;
      this.dosageUnitList = data.AgentidResult;
      data.Quanunit !== null && data.Quanunit !== "" ? this.disabledosage = true : this.disabledosage = false;
      this.generateDefaultForm(data);
      this.isFormReady = true;
    }
  }
  @Output() frequencyDeftim: EventEmitter<any> = new EventEmitter<any>();
  constructor(public ePrescriptionService: EPrescriptionService, public route: ActivatedRoute, public addministrationService: AddministrationService) { }



  ngOnInit(): void {
    this.valueChangeSubscription = this.drugArray.valueChanges.subscribe((data) => {
      this.isFormSubmitted = true;
      this.frequencyDeftim.emit(this.drugArray.value);
    });
  }

  generateDeftimCycle() {
    return new FormGroup({
      deftimDose: new FormControl('1'),
      deftimDosageUnit: new FormControl(this.defaultData.Quanunit),
      deftimTime: new FormControl(null)
    })
  }


  generateDefaultForm(data) {
    if (data && data.deftimcycleData && data.deftimcycleData.length) {
      for (let i = 0; i < data.deftimcycleData.length; i++) {
        this.drugArray.push(this.generateDeftimCycle());
        this.drugArray.controls[i].patchValue({
          deftimDose: data.deftimcycleData[i].deftimDose,
          deftimDosageUnit: data.deftimcycleData[i].deftimDosageUnit,
          deftimTime: data.deftimcycleData[i].deftimTime
        });
      }
    }
  }

  get drugArray() {
    return this.frequencyForm.get('deftimcycleData') as FormArray;
  }



  showErrorPopup(title: any, text: any, messageType) {
    return swal.fire({
      title: title ? title : '',
      text: text ? text : '',
      showCancelButton: messageType === 'Conform' ? true : false,
      confirmButtonColor: '#0890c5',
      cancelButtonColor: '#84898c',
      confirmButtonText: messageType === 'Error' ? 'Close' : 'Yes',
      cancelButtonText: 'No',
      customClass: 'myalertpopup',
      icon: 'error'
    });
  }

  deletecycleData(index: any) {
    const TouchedForms = this.drugArray.controls;
    const unTouchedForms = this.drugArray.controls;
    if (TouchedForms && TouchedForms.length > 1) {
      this.showErrorPopup(null, 'Do You Want to Delete this Data?', 'Conform').then(
        (result) => {
          if (result.value) {
            (this.drugArray as FormArray).removeAt(index);
          }
        });
    } else if (unTouchedForms && unTouchedForms.length < 3) {
      this.showErrorPopup(null, 'Can not Delete', 'Error');
    } else {
      (this.drugArray as FormArray).removeAt(index);
    }
  }


  addcycleData() {
    const notTouchedForms = this.drugArray.controls.filter(d => !d.touched);
    if (notTouchedForms && notTouchedForms.length > 3) {
      swal.fire({
        text: 'Enter data before adding new row',
        confirmButtonColor: '#0890c5',
        cancelButtonColor: '#84898c',
        confirmButtonText: 'OK',
        customClass: 'myalertpopup',
        icon: 'error'
      });
    } else {
      this.drugArray.push(this.generateDeftimCycle());
      this.drugArray.controls[this.drugArray.value.length - 1].patchValue({
        deftimDosageUnit: this.drugArray.value[this.drugArray.value.length - 2].deftimDosageUnit,
        deftimTime: new Date(`${formatDate(new Date(), "YYYY-MM-DD")}T08:00`)
      })
      this.disabledosage = true;
    }
  }


  ngOnDestroy(): void {
    if (this.valueChangeSubscription) {
      this.valueChangeSubscription.unsubscribe();
    }
  }
}
