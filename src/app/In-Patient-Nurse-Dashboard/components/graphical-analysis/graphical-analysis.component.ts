import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HospitalistDataCount } from '@services/e-hospitalist/interfaces/hospitalist';

@Component({
  selector: 'app-graphical-analysis',
  templateUrl: './graphical-analysis.component.html',
  styleUrls: ['./graphical-analysis.component.scss']
})
export class GraphicalAnalysisComponent implements OnInit {
  @Input() countData: HospitalistDataCount;
  @Input() selectedChartCountType: string;
  @Output() public dataCount = new EventEmitter<any>();

  graphAnalysis = [
    "Admissions",
    "Newadmissions",
    "Planneddischarges",
    "Discharges",
    "ldrBirthUnit"
  ]
  // @Input() showComponent:boolean = false;
  constructor() { }

  ngOnInit(): void {
  }

  getCount(label: string, type: string) {
        if (type === this.graphAnalysis[0]) {
      let item = this.countData.CountChartAdm.results.find((obj) => {
        return obj.Name === label;
      });
      return item.Count
    }
    else if (type === this.graphAnalysis[1]) {
      let item = this.countData.CountChartNewAdm.results.find((obj) => {
        return obj.Name === label;
      });
      return item.Count
    }
    else if (type === this.graphAnalysis[2]) {
      let item = this.countData.CountChartPlanDischarge.results.find((obj) => {
        return obj.Name === label;
      });
      return item.Count
    }
    else if (type === this.graphAnalysis[3]) {
      let item = this.countData.CountChartDischarge.results.find((obj) => {
        return obj.Name === label;
      });
      return item.Count
    }
    else if (type === this.graphAnalysis[4]) {
      let item = this.countData.CountChartPldrBirthUnit.results.find((obj) => {
        return obj.Name === label;
      });
      return item.Count
    }

  }

  getWidthStyle(label: string, type: string) {
        if (type === this.graphAnalysis[0]) {
      let total = this.countData.Admissions;
      let count = this.getCount(label, type);
      return (count / total) * 100;
    }
    else if (type === this.graphAnalysis[1]) {
      let total = this.countData.Newadmissions;
      let count = this.getCount(label, type);
      return (count / total) * 100;
    }
    else if (type === this.graphAnalysis[2]) {
      let total = this.countData.Planneddischarges;
      let count = this.getCount(label, type);
      return (count / total) * 100;
    }
    else if (type === this.graphAnalysis[3]) {
      let total = this.countData.Discharges;
      let count = this.getCount(label, type);
      return (count / total) * 100;
    }
    else if (type === this.graphAnalysis[4]) {
      let total = this.countData.ldrBirthUnit;
      let count = this.getCount(label, type);
      return (count / total) * 100;
    }
  }

  getCountsByType(type: string) {
    this.dataCount.emit(type);
  }

}
