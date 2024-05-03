import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { iconRangeIndicator } from '../../services/e-kardex/interfaces/vitals';
import { LeyendIndicatorService } from '../../services/e-kardex/leyend-indicator.service';

@Component({
  selector: 'app-vertical-arrow-indicator',
  templateUrl: './vertical-arrow-indicator.component.html',
  styleUrls: ['./vertical-arrow-indicator.component.scss'],
})
export class VerticalArrowIndicatorComponent implements OnChanges {
  @Input() props = {} as iconRangeIndicator;

  public icon = '';
  public color = '';

  constructor(private leyendIndicatorService: LeyendIndicatorService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['props']) {
      this.processLeyend();
    }
  }

  processLeyend() {
    const { icon, color, process } = this.props;
    if (icon && color) {
      this.icon = icon;
      this.color = color;
    }
    if (process) {
      const { icon, color } = this.leyendIndicatorService.getByKey(process);
      this.icon = icon;
      this.color = color;
    }
  }
}
