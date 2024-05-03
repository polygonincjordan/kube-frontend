import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PointOfSaleComponent } from './point-of-sale.component';
import { RouterModule, Routes } from '@angular/router';
import { PointofsaleService } from '@services/pointofsale.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from '../core/core.module';

export const pointOfSale: Routes = [
  // { path: '**', redirectTo: 'emr', pathMatch: 'full' },
  { path: '**', component: PointOfSaleComponent },
];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CoreModule,
    RouterModule.forChild(pointOfSale),
  ],
  declarations: [PointOfSaleComponent],
  providers:[PointofsaleService]
})
export class PointOfSaleModule { }
