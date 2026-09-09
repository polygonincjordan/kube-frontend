import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import Painterro from 'painterro';

@Component({
  selector: 'app-image-edittor',
  templateUrl: './image-edittor.component.html',
  styleUrls: ['./image-edittor.component.scss'],
})
export class ImageEdittorComponent implements OnInit {
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
