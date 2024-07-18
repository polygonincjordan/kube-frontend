import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-orientation-section',
  templateUrl: './orientation-section.component.html',
  styleUrls: ['./orientation-section.component.scss'],
})
export class OrientationSectionComponent implements OnInit {
  @Input() nursingAdmissionForm: FormGroup;
  constructor() {}

  ngOnInit(): void {}
}
