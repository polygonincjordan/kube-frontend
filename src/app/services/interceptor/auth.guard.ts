import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserType } from '@services/interfaces/common.enum';
import { StorageService } from '@services/storage.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private storageService: StorageService) { }

  canActivate(): boolean {
    if (!this.storageService.isLoggedIn() || !(this.storageService.getKubeRule() == UserType.SeniorHospitalist) && !(this.storageService.getKubeRule() == UserType.Physician) && !(this.storageService.getKubeRule() == UserType.FloorHospitalist) && !(this.storageService.getKubeRule() == UserType.SeniorPhysician) && !(this.storageService.getKubeRule() == UserType.Radiologist) && !(this.storageService.getKubeRule() == UserType.LabReception)) {
      localStorage.clear();
      this.router.navigateByUrl('');
    }
    return this.storageService.isLoggedIn();
  }
}
