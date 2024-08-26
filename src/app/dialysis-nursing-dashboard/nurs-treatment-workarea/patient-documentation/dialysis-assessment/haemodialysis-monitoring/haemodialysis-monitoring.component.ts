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
  haemodialysisMonitoring: any;
  haemodialysisArr : FormGroup;
  hemolineinfection: any;
  checkedIndexes: Array<number> = [];
  isGenerateDefaultForm: boolean = true;

  constructor(private sharedService: SharedService, private emergencyService: EmergencyService, protected patientDocService: PatientDocumentationService, private fb:FormBuilder) {
    if( this.patientDocService.dialysisAssecementForm.controls['haemodialysisMonitoring']){
      this.haemodialysisMonitoring = this.patientDocService.dialysisAssecementForm.controls['haemodialysisMonitoring'];

    }
    
    this.haemodialysisArr = this.patientDocService.dialysisAssecementForm;
    if(this.subscription){
      this.subscription.unsubscribe();
    }
    
    this.initializeFormData()
    if (this.patientDocService.isPatchValueForHaemodialysisMonitoring) {

      this.subscription =
        this.patientDocService.formDataBehaviorSubject.subscribe((resp) => {
          if (Object.keys(resp).length > 0) {
            this.isGenerateDefaultForm = false;
            
            this.haemodialysisMonitoring.patchValue(resp);

            const TOMONITOR = resp?.TOMONITOR.results;

            TOMONITOR.forEach((item) => {
              const timee = item.Timee;
              const hours = timee.substring(2, 4);
              const minutes = timee.substring(5, 7);
              const seconds = timee.substring(8, 10);

              const date = new Date();
              date.setHours(hours);
              date.setMinutes(minutes);
              date.setSeconds(seconds);

              if (this.patientDocService.ToMonitor.controls.length !== TOMONITOR.length) {
                this.patientDocService.ToMonitor.push(this.patientDocService.createForm({ ...item, Timee: date }));
              }
            });

          }
        });
        this.patientDocService.isPatchValueForHaemodialysisMonitoring =false;
    }
  }

  ngOnInit(): void {
    if(this.isGenerateDefaultForm){  
      const totalDefaultForm = this.patientDocService.ToMonitor.controls;
      if(totalDefaultForm.length === 0){
        this.generateDefaultForm();
      }
    }
  }

  initializeFormData(){
    this.haemodialysisMonitoring.patchValue({
      ChronicDone: '0',
      AcuteDone: '0',
      InternationalDone: '0',
    })
  }


  generateDefaultForm(){
    for(let i=0;i < 6;i++){
      this.patientDocService.ToMonitor.push(this.patientDocService.createForm());
    }
  }

  addRow(){
    const inValidForm = this.patientDocService.ToMonitor.controls.filter(d =>  !d.valid)
   
    
    if(inValidForm && inValidForm.length !== 0){
      swal.fire({
        text: 'Enter data before adding new row',
        confirmButtonColor: '#0890c5',
        cancelButtonColor: '#84898c',
        confirmButtonText: 'OK',
        customClass: 'myalertpopup',
        icon: 'error'
      });
    }else{
      return this.patientDocService.ToMonitor.push(this.patientDocService.createForm())
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
    if(this.checkedIndexes.includes(i)){
      this.patientDocService.ToMonitor.removeAt(i)
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
  
  ngOnDestroy(): void {
    if(this.subscription){
      this.subscription.unsubscribe();
    }
  }

}
