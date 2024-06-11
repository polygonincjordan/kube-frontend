import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataShareService } from '@services/data-share.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { getAlertConfig } from '@services/index';
import { ActionType } from '@services/interfaces/common.enum';
import { TabsetComponent, TabDirective } from 'ngx-bootstrap/tabs';
import { TooltipConfig } from 'ngx-bootstrap/tooltip';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-consumables',
  templateUrl: './consumables.component.html',
  styleUrls: ['./consumables.component.scss'],
  providers: [{ provide: TooltipConfig, useFactory: getAlertConfig }],
})
export class ConsumablesComponent implements OnInit, OnDestroy, AfterViewInit {

  public formDetailGroup: FormGroup;
  public disableSwitching: boolean;
  // @ViewChild('tabset') tabset: TabsetComponent;
  // @ViewChild('first') first: TabDirective;
  // @ViewChild('second') second: TabDirective;k

  actionTypeSubscription$: Subscription;
  isConsumableAction: string = '1';

  activeTab: string = '2'; // Initialize with the id of the second tab

  tabs = [
    { id: 1, title: 'History', content: '' },
    { id: 2, title: 'New Issue', content: '', active: true },
  ];


  constructor(
    public ePrescriptionService: EPrescriptionService,
    public emergencyService: EmergencyService,
    private formBuilder: FormBuilder,
    private dataShareService: DataShareService,
  ) {
    this.actionTypeSubscription$ = this.dataShareService.data$.subscribe((data) => {
      if (data != null) {
        this.isConsumableAction = data;
      }
    });

  }


  ngOnDestroy(): void {
    // this.dataShareService.sendActionType(null);
    if (JSON.parse(localStorage.getItem('forConsumable'))) {
      localStorage.removeItem('forConsumable');
    }
  }

  ngOnInit(): void {
    this.consumablesFrom();
    this.dataShareService.sendData('2');
  }

  ngAfterViewInit() {
    // Set the second tab as the active tab after the view has been initialized
  }

  public consumablesFrom() {
    this.formDetailGroup = this.formBuilder.group({
      SearchData: ['', [Validators.required]],
      DateRange: [[], [Validators.required]],
      SelectDropdown: [null, [Validators.required]],
    });
  }

  public saveConsumable(): void {
    this.dataShareService.sendActionType(ActionType.Save$, true);
  }

  public changeTab($event) {
    let id = String($event.id);
    this.activeTab = $event.id;
    this.dataShareService.sendData(id);
  }

  public resetForm() {
    this.dataShareService.sendActionType(ActionType.Reset$, true);
  }

}
