import { Injectable } from '@angular/core';
import { EPrescriptionService } from './e-Prescription/e-prescription.service';
import { UserConfigurationService } from './e-kardex/user-configuration.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { OrdersDashboardService } from './orders-dashboard/orders-dashboard.service';

@Injectable({
  providedIn: 'root'
})
export class OutpatientNursingService {
  public UserConfiguration: any;
  public assignUsersList: any[] = [];
  public isUserConfiguration: Subject<any> = new Subject<any>();
  constructor(public eprescriptionService: EPrescriptionService, private route: ActivatedRoute, private orderDashboardService: OrdersDashboardService) { }
  public parameters: any = {
    einri: this.route.snapshot.queryParamMap.get('einri'),
    falnr: this.route.snapshot.queryParamMap.get('falnr'),
    lfdnr: this.route.snapshot.queryParamMap.get('lfdnr'),
    patnr: this.route.snapshot.queryParamMap.get('patnr')
  }

  clinicConfigGet(getUserName) {
    //convert promise call for once data get stored in local storage and base on success router will redirect to approriate page. // checkout login component
    return new Promise((resolve, reject) => {
      this.eprescriptionService.loadData(`e-prescription/clinicConfigSet?Username=${getUserName}`, false, false, false, false).subscribe((resp: any) => {
        if (resp.body && resp.body.d && resp.body.d) {
          this.UserConfiguration = resp.body.d;
          localStorage.setItem('UserConfiguration', JSON.stringify(this.UserConfiguration));
          this.isUserConfiguration.next(true);
          resolve(true);
        }
      });
    })
  }

  getAssignSurgeonList() {
    this.orderDashboardService.getAssignUsersData().subscribe((data: any) => {
      this.assignUsersList = data?.d?.results;
    });
  }
}
