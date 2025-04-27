import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-ic-bundle-adult-ventilator',
  templateUrl: './ic-bundle-adult-ventilator.component.html',
  styleUrls: ['./ic-bundle-adult-ventilator.component.scss']
})
export class IcBundleAdultVentilatorComponent implements OnInit {
  public CurrentDateAndTime: Date = new Date();
  selectedRadio: any = {
    elevated: '0',
    interruption: '0',
    peptic: '0',
    thrombosis: '0',
    chlorhexidine: '0',
  }
  constructor() { }

  ngOnInit(): void {
  }

}
