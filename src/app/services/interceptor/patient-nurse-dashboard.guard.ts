import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { UserType } from '@services/interfaces/common.enum';
import { StorageService } from '@services/storage.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PatientNurseDashboardGuard implements CanActivate {
  constructor(private router: Router, private storageService: StorageService) { }

  canActivate(): boolean {
    const getKubeRule = this.storageService.getKubeRule();
    if (!this.storageService.isLoggedIn() || !(getKubeRule == UserType.FloorNurse)) {
      localStorage.clear();
      this.router.navigateByUrl('');
    }
    return this.storageService.isLoggedIn();
  }


}
