import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { PatientDocumentationService } from '@services/patient-documentation.service';
import { SharedService } from '@services/shared.service';
import { Subscription, last } from 'rxjs';
import swal from 'sweetalert2';
@Component({
  selector: 'haemodialysis-monitoring',
  templateUrl: './haemodialysis-monitoring.component.html',
  styleUrls: ['./haemodialysis-monitoring.component.scss']
})
export class HaemodialysisMonitoringComponent implements OnInit {
  private subscription: Subscription;
  haemomonitoring: FormGroup<any>;
  hemolineinfection: any;
  checkedIndexes: Array<number> = [];

  constructor(private sharedService: SharedService, private emergencyService: EmergencyService, protected patientDocService: PatientDocumentationService, private fb:FormBuilder) {
    this.haemomonitoring = this.patientDocService.dialysisAssecementForm
  }

  ngOnInit(): void {
    const totalDefaultForm = this.ToMonitor.controls;
    if(totalDefaultForm.length === 0){
      this.generateDefaultForm();
    }
  }

  generateDefaultForm(){
    for(let i=0;i < 6;i++){
      this.ToMonitor.push(this.createForm(i));
    }
  }

  get ToMonitor() {
    return this.patientDocService.dialysisAssecementForm.get('TOMONITOR') as FormArray;
  }

  createForm(index?){
    return new FormGroup({
      Dockey : new FormControl(""),
      Timee : new FormControl(""),
      Bfr : new FormControl(""),
      Ap : new FormControl(""),
      Vp : new FormControl(""),
      Ufr : new FormControl(""),
      Tfr : new FormControl(""),
      Tmp : new FormControl(""),
      Dfr : new FormControl(""),
      Systolic : new FormControl(""),
      Diastolic : new FormControl(""),
      PulseRate : new FormControl(""),
      Replacement : new FormControl(""),
      FluidType : new FormControl(""),
      Medications : new FormControl(""),
      Comments :new FormControl(""),
    })
  }

  addRow(){
    const unTouchedForms = this.ToMonitor.controls.filter(d =>  !d.touched)
    
    if(unTouchedForms && unTouchedForms.length <= 6 && unTouchedForms.length !== 0){
      swal.fire({
        text: 'Enter data before adding new row',
        confirmButtonColor: '#0890c5',
        cancelButtonColor: '#84898c',
        confirmButtonText: 'OK',
        customClass: 'myalertpopup',
        icon: 'error'
      });
    }else{
      return this.ToMonitor.push(this.createForm())
    }
  }

  tableCheckChange(event:Event, i: number){
    const {checked} = event.target as HTMLInputElement

    if(checked){
      this.checkedIndexes.push(i)
    }else{
      if(this.checkedIndexes.includes(i)){
        const index = this.checkedIndexes.indexOf(i);
        this.checkedIndexes.splice(index, 1)
      }
    }
  }

  deleteRow(i:number){
    console.log("Original >>> ",this.checkedIndexes);

    if(this.checkedIndexes.includes(i)){
      this.ToMonitor.removeAt(i)
      const index = this.checkedIndexes.indexOf(i);

      const lastPartFromIndex = this.checkedIndexes.filter((index)=>{
        return index !== i
      })
      console.log("Last part from clicked index >>> ",lastPartFromIndex);

      const newArr = [];

      lastPartFromIndex.forEach((index) => {
        if(index > 1){
          newArr.push(index-1)
        }else{
          newArr.push(index)
        }
      });
      
      console.log("New Array >>> ", newArr);
      
      
      this.checkedIndexes.splice(index, 1)

      this.checkedIndexes = newArr;
      
      console.log("Updated arr >>> ",this.checkedIndexes);
      
    }
  }

  createAssessment() {
    console.log(this.haemomonitoring.value);
  }

}
