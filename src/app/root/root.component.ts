import { AfterViewInit, Component, Renderer2 } from '@angular/core';
// import { NotificationService } from '@services/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss'],
})
export class RootComponent implements AfterViewInit {
  constructor(private renderer: Renderer2) {
    // this.notificationService.listenToNotify();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.renderer.addClass(document.body, 'show'), 1000);
    setTimeout(
      () => this.renderer.addClass(document.body, 'default-transition'),
      1500
    );
  }
}
