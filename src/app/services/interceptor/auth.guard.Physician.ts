import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserType } from '@services/interfaces/common.enum';
import { StorageService } from '@services/storage.service';

@Injectable({ providedIn: 'root' })
export class AuthGuardPhysician implements CanActivate {
  constructor(private router: Router, private storageService: StorageService) {}

  canActivate(): boolean {
    if (!this.storageService.isLoggedIn() || !(this.storageService.getKubeRule() == UserType.Physician)) {
      localStorage.clear();
      this.router.navigateByUrl('');
    }
    return this.storageService.isLoggedIn();
  }
}
