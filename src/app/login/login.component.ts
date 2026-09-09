import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserType } from '@services/interfaces/common.enum';
import { StorageService } from '@services/storage.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';
import { OutpatientNursingService } from '@services/outpatient-nursing.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { UserConfigurationService } from '@services/e-kardex/user-configuration.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [OutpatientNursingService, EPrescriptionService],
})
export class LoginComponent implements AfterViewInit {
  form: any = {
    username: null,
    password: null,
  };
  isLoginFailed = false;
  errorMessage = '';
  private LoginSubscription: Subscription;

  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private router: Router,
    private outpatientNursingService: OutpatientNursingService,
    private eprescriptionService: EPrescriptionService,
    private userConfigService: UserConfigurationService
  ) {}

  ngAfterViewInit(): void {
    if (this.storageService.isLoggedIn()) {
      this.reloadPage();
    }
  }

  onSubmit(): void {
    const { username, password } = this.form;
    this.LoginSubscription = this.authService
      .login(username, password)
      .subscribe({
        next: (data) => {
          if (data != null && data._body != null) {
            let successData = JSON.parse(data._body);
            if (
              successData.d != null &&
              successData.d.results != null &&
              successData.d.results.length > 0
            ) {
              let profileResponse = successData.d.results[0];
              this.storageService.setUserProfile(
                JSON.parse(data._body).d.results[0]
              );
              this.storageService.setLogin(true);
              this.storageService.setGpart(profileResponse.Gpart);
              this.storageService.setKubeRule(profileResponse.KubeRule.trim());
              localStorage.setItem('UserName', JSON.stringify(username));
              this.isLoginFailed = false;
              this.LoginSubscription.unsubscribe();
              this.reloadPage();
            } else {
              Swal.fire({
                title: 'Login Failed',
                text: 'Please contact support team.',
                icon: 'error',
                confirmButtonText: 'OK',
                //preConfirm: () => {},
              });
            }
          }
        },
        error: (err) => {
          Swal.fire({
            title: err.statusText,
            icon: 'error',
            confirmButtonText: 'OK',
            //preConfirm: () => {},
          });
          this.errorMessage = err.error.message;
          this.isLoginFailed = true;
          this.LoginSubscription.unsubscribe();
        },
      });
  }

  reloadPage(): void {
    const getKubeRule = this.storageService.getKubeRule();
    if (
      getKubeRule == UserType.Physician ||
      getKubeRule == UserType.SeniorPhysician ||
      getKubeRule == UserType.Community ||
      getKubeRule == UserType.PartTime
    ) {
      this.router.navigate(['/emr'], {});
    } else if (getKubeRule == UserType.SeniorPhysician) {
      this.router.navigate(['/point-of-sale'], {});
    } else if (
      getKubeRule == UserType.FloorHospitalist ||
      getKubeRule == UserType.SeniorHospitalist ||
      getKubeRule == UserType.SeniorPhysician ||
      getKubeRule == UserType.PartTime
    ) {
      this.router.navigate(['/e-hospitalist'], {});
    } else if (
      getKubeRule == UserType.ERHospitalist ||
      getKubeRule == UserType.SeniorHospitalist ||
      getKubeRule == UserType.SeniorPhysician ||
      getKubeRule == UserType.PartTime
    ) {
      this.router.navigate(['/emergencydashboard'], {});
    } else if (
      getKubeRule == UserType.SeniorPhysician ||
      getKubeRule == UserType.SeniorHospitalist ||
      getKubeRule == UserType.Physician ||
      getKubeRule == UserType.ERHospitalist ||
      getKubeRule == UserType.PartTime ||
      getKubeRule == UserType.FloorHospitalist
    ) {
      this.router.navigate(['/orders-dashboard'], {});
    } else if (getKubeRule == UserType.ERNurse) {
      this.router.navigate(['/nursing-emergncy-dashboard'], {});
    } else if (getKubeRule == UserType.DayCaseNurse) {
      this.router.navigate(['/day-case-dashboard'], {});
    } else if (getKubeRule == UserType.NursingInpatient) {
      this.router.navigate(['/nursing-inpatient-dashboard'], {});
    } else if (getKubeRule == UserType.FloorNurse) {
      this.router.navigate(['/in-patient-nurse-dashboard'], {});
    } else if (getKubeRule == UserType.DIYNurse) {
      this.router.navigate(['/dialysis-nursing-dashboard'], {});
    } else if (getKubeRule == UserType.opnurse) {
      const getUserName = JSON.parse(localStorage.getItem('UserName'));
      this.outpatientNursingService
        .clinicConfigGet(getUserName)
        .then((result) => {
          if (result) {
            this.router.navigateByUrl('/out-patient-nursing', {});
          }
        });
    }  else if (getKubeRule == UserType.SeniorNurse) {
      this.router.navigate(['/nursing-inpatient-dashboard'], {});
    }  else if (getKubeRule == UserType.LabReception) {
      this.router.navigate(['/labreception-dashboard'], {});
    }  else if (getKubeRule == UserType.Radiologist) {
      this.router.navigate(['/radiologist'], {});
    }
  }
}
