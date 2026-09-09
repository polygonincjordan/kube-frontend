import { Component } from '@angular/core';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';

@Component({
  selector: 'app-e-mar',
  templateUrl: './e-mar.component.html',
  styleUrls: ['./e-mar.component.scss']
})
export class EmarComponent {
  constructor(public ePrescriptionService: EPrescriptionService) { }
}
