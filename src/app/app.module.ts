import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { WebeOrderService } from '@services/e-Order/web-e-orders.service';
import { AuthInterceptor } from '@services/interceptor/auth.interceptor.guard';
import { LoadingInterceptor } from '@services/interceptor/loading.interceptor.guard';
import { WebService } from '@services/web.service';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AppComponent } from './app.component';
import { MissedMedicationDosesService } from '@services/e-hospitalist/missed-medication-doses.service';
import { DatePipe } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';

export const appRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./root/root.module').then((m) => m.RootModule),
      },
      {
        path: '**',
        loadChildren: () =>
          import('./root/root.module').then((m) => m.RootModule),
      },
    ],
  },
];

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NgxSpinnerModule,
    FormsModule,
    NgSelectModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes),
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  providers: [
    WebService,
    WebeOrderService,
    DatePipe,

    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    MissedMedicationDosesService
  ],
})
export class AppModule { }
