import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-labor-room-flow-sheet',
  templateUrl: './labor-room-flow-sheet.component.html',
  styleUrls: ['./labor-room-flow-sheet.component.scss']
})
export class LaborRoomFlowSheetComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  statusDescriptionOptions = [
    { value: 0, label: '0 Normal' },
    { value: 1, label: '1 Birth Defects' },
    { value: 2, label: '2 Premature' },
    { value: 3, label: '3 Post Mature' }
  ];
  code = [
    { code: 'A001', admission: false, discharge: false, working: false, preop: false, surgery: false, cause: false, department: false, hospital: false },
    { code: 'B002', admission: true, discharge: false, working: true, preop: false, surgery: true, cause: false, department: true, hospital: false },
    { code: 'C003', admission: false, discharge: true, working: false, preop: true, surgery: false, cause: true, department: false, hospital: true },
    { code: 'D004', admission: true, discharge: true, working: true, preop: false, surgery: true, cause: false, department: false, hospital: false },
    { code: 'E005', admission: false, discharge: false, working: false, preop: false, surgery: false, cause: false, department: true, hospital: true },
    { code: 'F006', admission: true, discharge: false, working: false, preop: true, surgery: false, cause: true, department: true, hospital: false },
    { code: 'G007', admission: false, discharge: false, working: true, preop: false, surgery: true, cause: false, department: false, hospital: true },
    { code: 'H008', admission: true, discharge: true, working: true, preop: true, surgery: true, cause: true, department: true, hospital: true }
  ];
  scalesList: any

}
