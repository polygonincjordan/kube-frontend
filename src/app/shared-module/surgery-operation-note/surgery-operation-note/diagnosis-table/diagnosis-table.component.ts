import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'diagnosis-table',
  templateUrl: './diagnosis-table.component.html',
  styleUrls: ['./diagnosis-table.component.scss']
})

export class DiagnosisTableComponent implements OnInit {


  tableHeaderData: any;
  tableConfigureData: any

  constructor() { }

  ngOnInit(): void {
  }

  @Input() set tableHeader(headerData: any) {
    this.tableHeaderData = headerData;
  }

  @Input() set tableConfigData(configData: any) {
    this.tableConfigureData = configData
  }

}
