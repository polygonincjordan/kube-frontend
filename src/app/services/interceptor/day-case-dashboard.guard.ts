import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserType } from '@services/interfaces/common.enum';
import { StorageService } from '@services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class DayCaseDashboardGuard implements CanActivate {
  constructor(private router: Router, private storageService: StorageService) { }

  canActivate(): boolean {
    const getKubeRule = this.storageService.getKubeRule();
    if (!this.storageService.isLoggedIn() || !(getKubeRule == UserType.DayCaseNurse)) {
      localStorage.clear();
      this.router.navigateByUrl('');
    }
    return this.storageService.isLoggedIn();
  }

  
}
