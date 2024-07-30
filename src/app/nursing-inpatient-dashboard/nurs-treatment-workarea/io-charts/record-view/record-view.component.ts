import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-record-view',
  templateUrl: './record-view.component.html',
  styleUrls: ['./record-view.component.scss'],
})
export class RecordViewComponent implements OnInit {
  @Input() recordViewText: string;
  constructor() {}

  ngOnInit(): void {
    console.log('recordViewText', this.recordViewText);
  }

  isCollapsed: { [key: string]: boolean } = {
    or1: true,
    // Add more keys as needed for each collapsible section
  };

  // toggleCollapse(key: string) {
  //   this.isCollapsed[key] = !this.isCollapsed[key];
  // }
  tableData: any[] = [
    {
      category: 'Oral',
      type: 'Food',
      values: [
        '500 mL',
        '--',
        '500 mL',
        '--',
        '--',
        '500 mL',
        '--',
        '--',
        '--',
        '--',
        '--',
        '--',
      ],
      isCollapsed: false,
      subRows: [
        {
          // category: '',
          type: 'Medications',
          values: [
            '150 mL',
            '--',
            '--',
            '150 mL',
            '--',
            '150 mL',
            '--',
            '--',
            '--',
            '--',
            '--',
            '--',
          ],
        },
        {
          // category: '',
          type: 'Fluids',
          values: [
            '150 mL',
            '--',
            '--',
            '150 mL',
            '--',
            '150 mL',
            '--',
            '--',
            '--',
            '--',
            '--',
            '--',
          ],
        },
        {
          // category: '',
          type: 'Food',
          values: [
            '150 mL',
            '--',
            '--',
            '150 mL',
            '--',
            '150 mL',
            '--',
            '--',
            '--',
            '--',
            '--',
            '--',
          ],
        },
      ],
    },
    {
      category: 'Enteral (G)',
      type: 'Feeding Formula',
      values: [
        '500 mL',
        '--',
        '500 mL',
        '--',
        '--',
        '500 mL',
        '--',
        '--',
        '--',
        '--',
        '--',
        '--',
      ],
    },
    {
      category: 'Parenteral',
      type: 'Total Parenteral Nutrition (TPN)',
      values: [
        '500 mL',
        '--',
        '500 mL',
        '--',
        '--',
        '500 mL',
        '--',
        '--',
        '--',
        '--',
        '--',
        '--',
      ],
    },
    {
      category: 'IV Fluids',
      type: 'D5W',
      values: [
        '500 mL',
        '--',
        '500 mL',
        '--',
        '--',
        '500 mL',
        '--',
        '--',
        '--',
        '--',
        '--',
        '--',
      ],
      isCollapsed: false,
      subRows: [
        {
          category: '',
          type: 'GS0.9%',
          values: [
            '500 mL',
            '--',
            '500 mL',
            '--',
            '--',
            '500 mL',
            '--',
            '--',
            '--',
            '--',
            '--',
            '--',
          ],
        },
        {
          category: '',
          type: 'Saline 0.45%',
          values: [
            '500 mL',
            '--',
            '500 mL',
            '--',
            '--',
            '500 mL',
            '--',
            '--',
            '--',
            '--',
            '--',
            '--',
          ],
        },
      ],
    },
    {
      category: 'Blood Products',
      type: 'Platelets',
      values: [
        '500 mL',
        '--',
        '500 mL',
        '--',
        '--',
        '500 mL',
        '--',
        '--',
        '--',
        '--',
        '--',
        '--',
      ],
      isCollapsed: false,
      subRows: [
        {
          category: '',
          type: 'FFP',
          values: [
            '500 mL',
            '--',
            '500 mL',
            '--',
            '--',
            '500 mL',
            '--',
            '--',
            '--',
            '--',
            '--',
            '--',
          ],
        },
      ],
    },
    {
      category: 'Other',
      type: 'Biscuits',
      values: [
        '500 mL',
        '--',
        '500 mL',
        '--',
        '--',
        '500 mL',
        '--',
        '--',
        '--',
        '--',
        '--',
        '--',
      ],
      isCollapsed: false,
      subRows: [
        {
          category: '',
          type: 'Chips',
          values: [
            '500 mL',
            '--',
            '500 mL',
            '--',
            '--',
            '500 mL',
            '--',
            '--',
            '--',
            '--',
            '--',
            '--',
          ],
        },
        {
          category: '',
          type: 'Soup',
          values: [
            '500 mL',
            '--',
            '500 mL',
            '--',
            '--',
            '500 mL',
            '--',
            '--',
            '--',
            '--',
            '--',
            '--',
          ],
        },
      ],
    },
  ];

  dates = [
    '11-7-2024 10:15 AM',
    '11-7-2024 10:22 AM',
    '11-7-2024 11:22 AM',
    '11-7-2024 01:30 AM',
    '11-7-2024 06:17 AM',
    '11-7-2024 06:17 AM',
    '11-7-2024 06:17 AM',
    '11-7-2024 06:17 AM',
    '11-7-2024 06:17 AM',
    '11-7-2024 06:17 AM',
    '11-7-2024 06:17 AM',
    '11-7-2024 06:17 AM',
  ];

  totals = [
    '1230 mL',
    '2500 mL',
    '1800 mL',
    '2300 mL',
    '1250 mL',
    '1150 mL',
    '1800 mL',
    '2300 mL',
    '1800 mL',
    '2300 mL',
    '1800 mL',
    '2300 mL',
  ];

  enteredBy = [
    'Saja Oweis',
    'Saja Oweis',
    'Saja Oweis',
    'Saja Oweis',
    'Saja Oweis',
    'Saja Oweis',
    'Saja Oweis',
    'Saja Oweis',
    'Saja Oweis',
    'Saja Oweis',
    'Saja Oweis',
    'Saja Oweis',
  ];

  grandTotal = '7340 mL';
  toggleCollapse(row) {
    row.isCollapsed = !row.isCollapsed;
  }
}
