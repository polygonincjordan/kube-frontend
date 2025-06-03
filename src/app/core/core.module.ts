import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ArchwizardModule } from 'angular-archwizard';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { EEmrService } from './../services/e-emr.service';
import { HeaderComponent } from './header/header.component';
import { FormArrayAllFilterPipe, FormArrayFilterPipe, SearchPipe } from './pipes/search.pipe';
import { SidebarComponent } from './sidebar/sidebar.component';
import { StepperComponent } from './stepper/stepper.component';
import { TopnavComponent } from './topnav/topnav.component';


import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { ConfigPopup } from './config-popup/config-popup.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NgSelectModule } from '@ng-select/ng-select';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { NumberOnlyDirective } from './pipes/number-only.directive';
import { DigitDecimaNumberUserSetDirective } from './pipes/digit-decima-number.directive';
import { CustomDecimalPipe2 } from './pipes/custom.decimal.pipe';
import { EventfilterPipe2 } from './pipes/eventfilter.pipe';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { AdminAttechmentModule } from '../shared-module/admin-attechment/admin-attechment.module';
@NgModule({
  declarations: [
    TopnavComponent,
    SidebarComponent,
    StepperComponent,
    HeaderComponent,
    SearchPipe,
    ConfigPopup,
    FormArrayFilterPipe,
    FormArrayAllFilterPipe,
    NumberOnlyDirective,
    DigitDecimaNumberUserSetDirective,
    CustomDecimalPipe2,
    EventfilterPipe2
  ],
  imports: [
    CommonModule,
    PerfectScrollbarModule,
    TranslateModule,
    RouterModule,
    CollapseModule,
    TooltipModule,
    FormsModule,
    ArchwizardModule,
    Ng2SearchPipeModule,
    NgSelectModule,
    ReactiveFormsModule,
    BsDatepickerModule.forRoot(),
    BsDropdownModule.forRoot(),
    NgbCollapseModule,
    AdminAttechmentModule
  ],
  providers: [EEmrService,EmergencyService],
  exports: [
    TopnavComponent,
    SidebarComponent,
    StepperComponent,
    HeaderComponent,
    SearchPipe,
    ConfigPopup,
    FormArrayFilterPipe,
    FormArrayAllFilterPipe,
    NumberOnlyDirective,
    DigitDecimaNumberUserSetDirective,
    CustomDecimalPipe2,
    EventfilterPipe2
  ]
})
export class CoreModule { }
