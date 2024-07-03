import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConsumableService } from '@services/consumables/consumable.service';
import { ConsumablesHistory, ConsumablesHistoryResult, MaterialDetails, MaterialDetailsResult } from '@services/consumables/interfaces/consumables.interface';
import { DataShareService } from '@services/data-share.service';

@Component({
  selector: 'app-history-list',
  templateUrl: './history-list.component.html',
  styleUrls: ['./history-list.component.scss']
})
export class HistoryListComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

}
