import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AnyCnameRecord } from 'dns';
import Painterro from 'painterro';

@Component({
  selector: 'app-pain-location',
  templateUrl: './pain-location.component.html',
  styleUrls: ['./pain-location.component.scss'],
})
export class PainLocationComponent implements OnInit {
  @Input() hiddenTools: any;
  @Input() toolbarPosition: any;
  @Input() defaultImage: any;

  @Output() editImage: any = new EventEmitter();
  painterroInstance: any;

  constructor() {}

  ngOnInit(): void {}

  initializePainterro(): void {
    this.painterroInstance = Painterro({
      hiddenTools: this.hiddenTools,
      toolbarPosition: this.toolbarPosition,
      defaultImage: 'fill',

      saveHandler: (image: any, done: any) => {
        const imageUrl = image.asDataURL();
        if (!imageUrl.startsWith('data:image/')) {
          console.error('Failed to generate image URL:', imageUrl);
        } else {
          this.editImage.next(imageUrl);
        }
        this.painterroInstance.hide();
      },
    });

    this.painterroInstance.show(this.defaultImage);
  }
}
