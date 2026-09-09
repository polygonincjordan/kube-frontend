import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientService } from '@services/e-kardex/patient.service';
import { PreChemohydrationComponent } from './pre-chemohydration/pre-chemohydration.component';
import { EPrescriptionModule } from '../e-prescription/e-prescription.module';
import { PremedicationsComponent } from './premedications/premedications.component';
import { ChemotherapeuticBiologicComponent } from './chemotherapeutic-biologic/chemotherapeutic-biologic.component';

// export const Chemotherapy: Routes = [
//   { path: '**', component: ChemotherapyComponent },
// ];

@NgModule({
  declarations: [
    // ChemotherapyComponent,
  ],
  imports: [
    CommonModule,
    // RouterModule.forChild(Chemotherapy),
  ],
  providers:[PatientService]
})
export class ChemotherapyModule { }
