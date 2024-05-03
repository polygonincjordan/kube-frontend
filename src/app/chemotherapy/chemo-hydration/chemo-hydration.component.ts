import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ChemotherapyService } from '@services/chemotherapy.service';
import { Subscription } from 'rxjs';
import swal from 'sweetalert2';

@Component({
  selector: 'chemo-hydration',
  templateUrl: './chemo-hydration.component.html',
  styleUrls: ['./chemo-hydration.component.scss']
})
export class ChemoHydrationComponent implements OnInit {
  constructor(public chemotherapyService: ChemotherapyService) { }
  Protocalsubscription: Subscription;
  chemoformGroup: FormGroup;
  selectAll: boolean = false;
  public modetailsFormSubscription: Subscription;
  @Output() chemohydrationform = new EventEmitter();
  isSelect:boolean = false;
  cycleIdvalue:any = [];
  ngOnInit(): void {
    this.chemoformGroup = new FormGroup({ chemoformArray: new FormArray([]) });
    for (let i = 0; i < 4; i++) { this.Arraychecmo.push(this.formchemoData()); }
    if (this.Protocalsubscription) { this.Protocalsubscription.unsubscribe(); }
    this.Protocalsubscription = this.chemotherapyService.ProtocalType.subscribe((resp) => {
      this.isSelect = false;
      this.chemohydration(resp);
    });
    this.chemotherapyService.mySubject.subscribe((res) =>{
      this.isSelect = true;
      this.chemohydration(res);
    });
    this.modetailsFormSubscription = this.chemoformGroup.valueChanges.subscribe(() => {
      this.chemohydrationform.emit(this.Arraychecmo);
    })
  }

  get Arraychecmo() { return this.chemoformGroup.get('chemoformArray') as FormArray }

  chemohydration(resp) {
    if(this.isSelect){
      const notTouchedForms =  this.Arraychecmo.controls;
      if (this.Protocalsubscription) { this.Protocalsubscription.unsubscribe(); }
      this.Arraychecmo.reset();
      this.cycleIdvalue.filter(d => d.CycleId === resp).forEach((element, index) => {
        if (notTouchedForms && notTouchedForms.length && notTouchedForms.length > index) {
          notTouchedForms[index].patchValue({
            OrderText: element.OrderText,
            OccupGroup: element.OccupGroup,
            isSelected: element.Active,
          });
        };
      });
    }else{
      this.isSelect = true;
      this.cycleIdvalue =  resp.data['TOPOSTHDY'].results;
      const notTouchedForms = this.Arraychecmo.controls;
      if (this.Protocalsubscription) { this.Protocalsubscription.unsubscribe(); }
      this.Arraychecmo.reset();
      resp.data['TOPOSTHDY'].results.filter(d => d.CycleId === resp.CycleId).forEach((element, index) => {
        if (notTouchedForms && notTouchedForms.length && notTouchedForms.length > index) {
          notTouchedForms[index].patchValue({
            OrderText: element.OrderText,
            OccupGroup: element.OccupGroup,
            isSelected: element.Active,
          });
        };
      });
    }
  }

  formchemoData() {
    return new FormGroup({
      OrderText: new FormControl('', Validators.required),
      OccupGroup: new FormControl(''),
      isSelected: new FormControl(false),
      Type: new FormControl('2')
    })
  }

  addedRowChemo() {
    const notTouchedForms = this.Arraychecmo.controls.filter(d => !d.touched);
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
      this.Arraychecmo.push(this.formchemoData());
    }
  }

  deleterow(index) {
    const TouchedForms = this.Arraychecmo.controls.filter(d => d.touched);
    const unTouchedForms = this.Arraychecmo.controls.filter(d => !d.touched);
    if (TouchedForms && TouchedForms.length) {
      this.showErrorPopup(null, 'Do You Want to Delete this Data?', 'Conform').then(
        (result) => {
          if (result.value) {
            this.Arraychecmo.removeAt(index);
          }
        });
    } else if (unTouchedForms && unTouchedForms.length < 3) {
      this.showErrorPopup(null, 'Can not Delete', 'Error');
    } else {
      this.Arraychecmo.removeAt(index);
    }
  }

  onCheckAll(event) {
    this.selectAll = event.target.checked;
    this.Arraychecmo.controls.forEach(element => { element.get('isSelected').setValue(this.selectAll) });
  }

  onisSelected() { this.selectAll = this.Arraychecmo.controls.every(e => e.get('isSelected').value); }

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

  ngOnDestroy(): void {
    if (this.Protocalsubscription) { this.Protocalsubscription.unsubscribe(); }
  }
}
