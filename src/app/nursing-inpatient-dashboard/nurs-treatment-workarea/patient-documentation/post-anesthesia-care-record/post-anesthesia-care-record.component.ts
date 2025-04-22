import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdmissionService } from '@services/admission/admission.service';
import { DataShareService } from '@services/data-share.service';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';

@Component({
  selector: 'app-post-anesthesia-care-record',
  templateUrl: './post-anesthesia-care-record.component.html',
  styleUrls: ['./post-anesthesia-care-record.component.scss'],
})
export class PostAnesthesiaCareRecordComponent implements OnInit {
  public CurrentDateAndTime: Date = new Date();
  postAssForm: FormGroup;
  tabItems = [
    { label: 'Vital Signs', value: '1' },
    { label: 'Aldrete Score', value: '2' },
    { label: 'Intake/Output', value: '3' },
    { label: 'Post Anaesthesia Complications', value: '4' },
    { label: 'Current Medication', value: '5' },
  ];
  public scalesList: any[] = [
    {
      ScaleType: 'Modified Aldrete Score (MAS)',
      LastScore: '',
      ScoreDesc: '',
      Datetimee: '',
      value: '1',
      Dockey: '',
    },
    {
      ScaleType: '',
      LastScore: '',
      ScoreDesc: '',
      Datetimee: '',
      value: '2',
      Dockey: '',
    },
    {
      ScaleType: '',
      LastScore: '',
      ScoreDesc: '',
      Datetimee: '',
      value: '3',
      Dockey: '',
    },
  ];
  vitalSigns = [
    { value: 0, label: 'Heart Rate/mt' },
    { value: 1, label: 'Respirations/mt' },
    { value: 2, label: 'O2 Saturation' },
    { value: 3, label: 'Blood Pressure' },
    { value: 4, label: 'Mode of Ventilation' },
    { value: 5, label: 'Compressions' },
    { value: 6, label: 'Atropine' },
    { value: 7, label: 'Adrenaline' },
    { value: 8, label: 'Sodium Bicarbonate' },
    { value: 9, label: 'Calcium Gluconate' },
    { value: 10, label: 'Xylocaine Bolus' },
    { value: 11, label: 'Infusion' },
    { value: 12, label: 'Amiodarone' },
    { value: 13, label: 'D/C Shock Jolues' },
    { value: 14, label: 'Others' },
    { value: 15, label: 'Pain Score' },
    { value: 16, label: 'Temperature' },
    { value: 17, label: 'Nausea and Vomiting' },
    { value: 18, label: 'Level of Consciousness' },
  ];
  activeTab: string = '1'; // Default tab
  otherChecked = false;
  otherChecked1 = false;
  currentTime: any;
  constructor(
    private formBuilder: FormBuilder,
    private _route: ActivatedRoute,
    public storageService: StorageService,
    public admissionService: AdmissionService,
    private sharedService: SharedService,
    private dataShareService: DataShareService
  ) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    this.currentTime = `${hours}:${minutes}:${seconds}`;
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.postAssForm = this.formBuilder.group({
      inputArr: this.formBuilder.array([]),
      outputArr: this.formBuilder.array([]),
    });
    for (let i = 0; i < 5; i++) {
      this.addDrain();
      this.addOut();
    }
  }

  get inputArr(): FormArray {
    return this.postAssForm.get('inputArr') as FormArray;
  }
  get outputArr(): FormArray {
    return this.postAssForm.get('outputArr') as FormArray;
  }

  addDrain() {
    const drainGroup = this.formBuilder.group({
      time: [''],
      date: [''],
      type: [''],
      amount: [''],
    });
    this.inputArr.push(drainGroup);
  }

  removeDrain(index: number) {
    this.inputArr.removeAt(index);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  addOut() {
    const drainGroup = this.formBuilder.group({
      time: [''],
      date: [''],
      type: [''],
      amount: [''],
    });
    this.outputArr.push(drainGroup);
  }

  removeOut(index: number) {
    this.outputArr.removeAt(index);
  }
}
