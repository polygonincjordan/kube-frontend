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
  haemodialysisMonitoring: FormGroup<any>;
  haemodialysisArr : FormGroup;
  hemolineinfection: any;
  checkedIndexes: Array<number> = [];
  isGenerateDefaultForm: boolean = true;

  constructor(private sharedService: SharedService, private emergencyService: EmergencyService, protected patientDocService: PatientDocumentationService, private fb:FormBuilder) {
    this.haemodialysisMonitoring = this.patientDocService.dialysisAssecementForm.controls['haemodialysisMonitoring'];
    this.haemodialysisArr = this.patientDocService.dialysisAssecementForm;
    this.initializeFormData()
    if(this.subscription){
      this.subscription.unsubscribe();
    }

    this.subscription = this.patientDocService.formDataBehaviorSubject.subscribe((resp)=>{
      this.isGenerateDefaultForm = false;
      this.haemodialysisMonitoring.patchValue(resp)

      const TOMONITOR = resp?.TOMONITOR.results;

      console.log(TOMONITOR);
      
      TOMONITOR.forEach((item)=>{
        const timee = item.Timee;
        const hours = timee.substring(2,4)
        const minutes = timee.substring(5,7)
        const seconds = timee.substring(8,10)

        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);
        date.setSeconds(seconds);
        
        if(this.ToMonitor.controls.length !== TOMONITOR.length){
          this.ToMonitor.push(this.createForm({...item, Timee: date}))
        }
      })
      
    })
  }

  ngOnInit(): void {
    if(this.isGenerateDefaultForm){  
      const totalDefaultForm = this.ToMonitor.controls;
      if(totalDefaultForm.length === 0){
        this.generateDefaultForm();
      }
    }
  }

  initializeFormData(){
    this.haemodialysisMonitoring.patchValue({
      ChronicDone: false,
      AcuteDone: false,
      InternationalDone: false,
    })
  }


  generateDefaultForm(){
    for(let i=0;i < 6;i++){
      this.ToMonitor.push(this.createForm(i));
    }
  }

  get ToMonitor() {
    return this.patientDocService.dialysisAssecementForm.get('TOMONITOR') as FormArray;
  }

  createForm(item?){
    return new FormGroup({
      Dockey : new FormControl(item ? item.Dockey : ''),
      Timee : new FormControl(item ? item.Timee : new Date()),
      Bfr : new FormControl(item ? item.Bfr : ''),
      Ap : new FormControl(item ? item.Ap : ''),
      Vp : new FormControl(item ? item.Vp : ''),
      Ufr : new FormControl(item ? item.Ufr : ''),
      Tfr : new FormControl(item ? item.Tfr : ''),
      Tmp : new FormControl(item ? item.Tmp : ''),
      Dfr : new FormControl(item ? item.Dfr : ''),
      Systolic : new FormControl(item ? item.Systolic : ''),
      Diastolic : new FormControl(item ? item.Diastolic : ''),
      PulseRate : new FormControl(item ? item.PulseRate : ''),
      Replacement : new FormControl(item ? item.Replacement : ''),
      FluidType : new FormControl(item ? item.FluidType : ''),
      Medications : new FormControl(item ? item.Medications : ''),
      Comments :new FormControl(item ? item.Comments : ''),
    })
  }

  addRow(){
    const unTouchedForms = this.ToMonitor.controls.filter(d =>  !d.touched)
    
    // if(unTouchedForms && unTouchedForms.length <= 6 && unTouchedForms.length !== 0){
    //   swal.fire({
    //     text: 'Enter data before adding new row',
    //     confirmButtonColor: '#0890c5',
    //     cancelButtonColor: '#84898c',
    //     confirmButtonText: 'OK',
    //     customClass: 'myalertpopup',
    //     icon: 'error'
    //   });
    // }else{
      return this.ToMonitor.push(this.createForm())
    // }
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
    if(this.checkedIndexes.includes(i)){
      this.ToMonitor.removeAt(i)
      const index = this.checkedIndexes.indexOf(i);

      const lastPartFromIndex = this.checkedIndexes.filter((index)=>{
        return index !== i
      });

      const newArr = [];

      lastPartFromIndex.forEach((index) => {
        if(index > 1){
          
            newArr.push(index-1)
        }else{
            newArr.push(index);
        }
      });
      
      this.checkedIndexes.splice(index, 1)

      this.checkedIndexes = newArr;
      
      
    }
  }

  createAssessment() {
    console.log(this.haemodialysisMonitoring.value);
  }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
