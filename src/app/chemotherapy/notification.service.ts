import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { DataService } from '@services/data.service';
import { eMessageType } from './data.service.model';

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {
  private notificationSubscription: Subscription;
  public confirmationProcess: Subject<boolean> = new Subject<boolean>();

  constructor(private dataService: DataService) { }

  listenToNotify(): void {
    if (!this.notificationSubscription) {
      this.notificationSubscription = this.dataService.notify.subscribe(data => this.notify(data.key, data.value, data.icon));
    }
  }

  notify(status: string, message: string, eMessageIcon: string): void {
    this.showPopupNotification(status, message, eMessageIcon);
  }

  showPopupNotification(status: string, message: string, eMessageIcon: string) {
    Swal.fire({
      title: status.toUpperCase(),
      text: message,
      icon: eMessageIcon as SweetAlertIcon,
      showCancelButton: true,
      showConfirmButton: status !== eMessageType.Warning ? false : true,
      confirmButtonText: status !== eMessageType.Warning ? "" : "Yes",
      cancelButtonText: status !== eMessageType.Warning ? "Close" : "No",
      confirmButtonColor: '#006f9d',
      cancelButtonColor: status !== eMessageType.Warning ? '#006f9d' : '#e71d36',
      customClass: {
        container: 'notification-popup'
      }
    }).then((result) => { result.value ? this.confirmationProcess.next(true) : this.confirmationProcess.next(false); });
  }

  ngOnDestroy(): void {
    if (this.notificationSubscription) { this.notificationSubscription.unsubscribe(); }
  }
}

