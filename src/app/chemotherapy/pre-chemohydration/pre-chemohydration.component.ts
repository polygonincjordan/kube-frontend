import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ChemotherapyService } from '@services/chemotherapy.service';
import { Subscription } from 'rxjs';
import swal from 'sweetalert2';

@Component({
  selector: 'pre-chemohydration',
  templateUrl: './pre-chemohydration.component.html',
  styleUrls: ['./pre-chemohydration.component.scss']
})
export class PreChemohydrationComponent implements OnInit {
  constructor(public chemotherapyService: ChemotherapyService) { }
  chemoformGroup: FormGroup;
  public modetailsFormSubscription: Subscription;
  selectAll: boolean = false;
  Protocalsubscription: Subscription;
  @Output() chemotherapyData = new EventEmitter();
  isSelect:boolean = false;
  cycleIdvalue:any = [];
  ngOnInit(): void {
    this.chemoformGroup = new FormGroup({ chemoformArray: new FormArray([]) });
    for (let i = 0; i < 4; i++) { this.Arraychecmo.push(this.formchemoData()) }
    this.chemotherapyService.ProtocalType.subscribe((resp) => {
      // this.chemotherapyService.protocalDetails(resp);
      this.isSelect = false;
      this.chemohydration(resp);
    });
    this.chemotherapyService.mySubject.subscribe((res) =>{
      this.chemohydration(res);
    });
    this.modetailsFormSubscription = this.chemoformGroup.valueChanges.subscribe(() => {
      // this.chemotherapyData.emit( {shouldReload:true, data:this.Arraychecmo} );
      this.chemotherapyData.emit(this.Arraychecmo);
    })
  }

  get Arraychecmo() { return this.chemoformGroup.get('chemoformArray') as FormArray }

  chemohydration(resp) {
    if(this.isSelect){
      const notTouchedForms = this.Arraychecmo.controls;
      if (this.Protocalsubscription) { this.Protocalsubscription.unsubscribe(); }
      this.Arraychecmo.reset();
      const filterdata = this.cycleIdvalue;
      filterdata.filter(d => d.CycleId === resp).forEach((element, index) => {
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
      this.cycleIdvalue =  resp.data['TOPREHDY'].results;
      const notTouchedForms = this.Arraychecmo.controls;
      if (this.Protocalsubscription) { this.Protocalsubscription.unsubscribe(); }
      this.Arraychecmo.reset();
      resp.data['TOPREHDY'].results.filter(d => d.CycleId === resp.CycleId).forEach((element, index) => {
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
      Type:new FormControl('1')
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
        customClass: { popup: 'myalertpopup' },
        icon: 'error'
      } as any);
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
      customClass: { popup: 'myalertpopup' },
      icon: 'error'
    } as any);
  }
  ngOnDestroy(): void {
    if (this.Protocalsubscription) { this.Protocalsubscription.unsubscribe(); }
  }
}
