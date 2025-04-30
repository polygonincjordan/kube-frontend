import { Component, Input, OnInit } from '@angular/core';
import { VitalsService } from '../../services/e-kardex/vitals.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { VitalItem } from '../../services/e-kardex/interfaces/vitals';
import { catchError, of } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-vitals-card-list',
  templateUrl: './vitals-card-list.component.html',
  styleUrls: ['./vitals-card-list.component.scss'],
})
export class VitalsCardListComponent implements OnInit {
  @Input() listVitals: VitalItem[] = [] as VitalItem[];
  constructor(private vitalsService: VitalsService) {}

  ngOnInit(): void {}
}
