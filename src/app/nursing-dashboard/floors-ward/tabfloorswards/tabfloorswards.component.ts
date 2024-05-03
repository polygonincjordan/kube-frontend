import { Component, OnInit } from '@angular/core';
import { FloorsWardsService } from '@services/floors-wards/floors-wards.service';

@Component({
  selector: 'tabfloorswards',
  templateUrl: './tabfloorswards.component.html',
  styleUrls: ['./tabfloorswards.component.scss']
})
export class TabfloorswardsComponent implements OnInit {

  constructor(public floorsWardsService:FloorsWardsService) { }

  ngOnInit(): void {
  }

}
