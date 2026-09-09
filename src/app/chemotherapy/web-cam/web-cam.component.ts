import { Component, EventEmitter, OnDestroy, Output, TemplateRef, ViewChild } from '@angular/core';
import { DataService } from '@services/data.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { WebcamImage, WebcamInitError } from 'ngx-webcam';
import { Observable, Subject, Subscription } from 'rxjs';
import { NotificationService } from '../notification.service';
import { eMessageIcon, eMessageType } from '../data.service.model';


@Component({
  selector: 'clinic-web-cam',
  templateUrl: './web-cam.component.html',
  styleUrls: ['./web-cam.component.scss'],
  providers: [BsModalService]
})
export class ClinicWebCamComponent implements OnDestroy {
  private modalRef: BsModalRef;
  public errorMessage: string;
  private trigger: Subject<any> = new Subject();
  private croppedImage: any = '';
  public webcamImage: WebcamImage = null;
  public isShowing: boolean = false;
  private confirmationSubscription: Subscription;

  @ViewChild('webCamTempRef', { static: true }) webCamTempRef: TemplateRef<any>;
  @Output() onclose: EventEmitter<any> = new EventEmitter<any>();

  constructor(private modalService: BsModalService, public dataService: DataService,public notificationService: NotificationService,) { }

  showPopup(): void {
    this.clearAll();
    this.isShowing = true;
    this.modalRef = this.modalService.show(this.webCamTempRef, { backdrop: true, ignoreBackdropClick: true, class: "web-cam-popup" });
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }

  onClose(): void {
    this.onclose.emit(false);
    this.clearAll();
  }

  clearAll(): void {
    this.webcamImage = null;
    this.croppedImage = null;
    this.isShowing = false;
    this.errorMessage = null;
    if (this.modalRef) { this.modalRef.hide(); };
  }

  getSnapshot(): void {
    this.trigger.next(void 0);
  }

  captureImg(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
  }

  get invokeObservable(): Observable<any> {
    return this.trigger.asObservable();
  }

  triggerSnapshot(): void {
    this.trigger.next(void 0);
  }

  cropImage() {
    if (this.croppedImage) {
      const imageType = this.croppedImage.split(";")[0].split(":")[1];
      const imageFormat = this.croppedImage.split(";")[0].split(":")[1].split("/")[1];
      const fileData = new File([this.dataURItoBlob(this.croppedImage, imageType)], `webcamImage.${imageFormat}`, { type: imageType });
      this.onclose.emit({ data: fileData });
      this.clearAll();
    }
  }

  dataURItoBlob(dataURI: string, imageType: string): Blob {
    const data = dataURI.split('base64,');
    if (data.length) { dataURI = data[data.length - 1]; }
    const byteString = atob(dataURI);
    const int8Array = new Uint8Array(new ArrayBuffer(byteString.length));
    for (let i = 0; i < byteString.length; i++) { int8Array[i] = byteString.charCodeAt(i); }
    return new Blob([int8Array], { type: imageType });
  }

  handleInitError(error: WebcamInitError): void {
    this.errorMessage = error.message;
    this.dataService.notify.next({ key: eMessageType.Error, value: error.message, icon: eMessageIcon.Error });
    if (this.confirmationSubscription) { this.confirmationSubscription.unsubscribe(); };
    this.confirmationSubscription = this.notificationService.confirmationProcess.subscribe((resp) => {
      if (resp) {
        this.clearAll();
      }
    })
  }

  ngOnDestroy(): void {
    if (this.confirmationSubscription) { this.confirmationSubscription.unsubscribe(); };
  }
}
