import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreCardiacCathComponent } from './pre-cardiac-cath.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { ErVitalsComponent } from './er-vitals/er-vitals.component';
import { SearchTextPipe } from '../search-text.pipe';
import { PhysicianAllergyComponent } from './physician-allergy/physician-allergy.component';



@NgModule({
  declarations: [
    PreCardiacCathComponent,
    ErVitalsComponent,
    PhysicianAllergyComponent,
    SearchTextPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    ReactiveFormsModule,
    BsDatepickerModule.forRoot(),
    NgxMaterialTimepickerModule,
    
  ],
  exports: [PreCardiacCathComponent]
})
export class PreCardiacCathModule { }
