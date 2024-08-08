import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-record-view',
  templateUrl: './record-view.component.html',
  styleUrls: ['./record-view.component.scss'],
})
export class RecordViewComponent implements OnInit {
  @Input() recordViewData: any = null;
  @Output() backevent = new EventEmitter();

  tableData = [
    {
      category: 'Oral',
      date: '01-08-2024',
      time: '17:38',
      enteredBy: 'Saja Oweis',
      subRows: [
        {
          type: 'Food',
          value: '100 mL',
        },
        {
          type: 'Medications',
          value: '250 mL',
        },
      ],
    },
    {
      category: 'Enteral (G)',
      date: '02-08-2024',
      time: '09:15',
      enteredBy: 'Saja Oweis',
      subRows: [
        {
          type: 'Feeding Formula',
          value: '500 mL',
        },
      ],
    },
    {
      category: 'Parenteral',
      date: '03-08-2024',
      time: '14:22',
      enteredBy: 'Fare',
      subRows: [
        {
          type: 'Total Parenteral Nutrition (TPN)',
          value: '250 mL',
        },
      ],
    },
    {
      category: 'IV Fluids',
      date: '04-08-2024',
      time: '11:45',
      enteredBy: 'Fare',
      subRows: [
        {
          type: 'D5W',
          value: '300 mL',
        },
      ],
    },
    {
      category: 'Blood Products',
      date: '05-08-2024',
      time: '16:30',
      enteredBy: 'Saja Oweis',
      subRows: [
        {
          type: 'Platelets',
          value: '200 mL',
        },
      ],
    },
    {
      category: 'Other',
      date: '06-08-2024',
      time: '08:50',
      enteredBy: 'Saja Oweis',
      subRows: [
        {
          type: 'Biscuits',
          value: '500 mL',
        },
      ],
    },
  ];

  Types = [
    'Fluids',
    'Food',
    'Medications',
    'Supplements',
    'Water',
    'Smashed Food',
    'Feeding Formula',
    'Total Parenteral Nutrition(TPN)',
    'NS 0.9%',
    'Saline 0.45%',
    'D5W',
    'GS 0.9%',
    'GS 0.45%',
    'Saline 3%',
    'LR',
    'Line Flush',
    'Bolus',
    'Hemodialysis',
    'Peritoneal Dialysis',
    'Medications',
    'Electrolytes',
    'Albumin',
    'Whole Blood',
    'PRBCs',
    'FFP',
    'Platelets',
    'Cryoprecipitate',
    'other',
  ];

  dates = [];
  totals = [];
  enteredBy = [];
  searchText = '';
  selectedCategory: string = null;
  selectedType: string = null;
  selectedEnteredBy: string = null;
  selectedDateRange: [Date, Date] = [null, null];
  startTime: string = null;
  endTime: string = null;
  selectedTimeOption: string = null;
  filteredTableData: any[] = [];
  grandTotal = '';
  individualTotals: { [key: string]: string } = {};
  individualEnteredBy: { [key: string]: string } = {};
  constructor() {}

  ngOnInit(): void {
    if (!this.recordViewData.title) {
      this.tableData = [];
    }
    this.tableData =
      this.tableData.length === 0 ? this.tableData : this.recordViewData.data;
    if (this.tableData.length > 0) {
      this.tableData.forEach((item) => {
        item.subRows.forEach((subitem) => {
          if (subitem.type && !this.Types.includes(subitem.type)) {
            this.Types.push(subitem.type);
          }
        });
      });
    }
    this.onDateRangeChange([new Date(), new Date()]);
    this.filteredTableData = [...this.tableData];
    this.dates = this.extractDates(this.filteredTableData);
    this.calculateTotalsAndEnteredBy();
  }

  isCollapsed: { [key: string]: boolean } = {
    or1: true,
  };

  toggleCollapse(row) {
    row.isCollapsed = !row.isCollapsed;
  }

  back() {
    this.backevent.emit();
  }

  onDateRangeChange(selectedRange: any) {
    try {
      console.log('selectedRange', selectedRange);

      if (selectedRange && selectedRange.length === 2) {
        selectedRange[0].setHours(0, 0, 0, 0);
        selectedRange[1].setHours(0, 0, 0, 0);
        this.selectedDateRange = selectedRange;
      }
    } catch (error) {}
  }

  applyFilter() {
    try {
      const [startDate, endDate] = this.selectedDateRange.map((date) =>
        new Date(date).getTime()
      );

      this.filteredTableData = this.tableData.filter((row) => {
        const [day, month, year] = row.date.split('.').map(Number);
        const date = new Date(year, month - 1, day);
        const timestamp = date.getTime();

        // Date range filter
        const matchesDate =
          (!this.selectedDateRange[0] && !this.selectedDateRange[1]) ||
          (timestamp >= startDate && timestamp <= endDate);

        // Category filter
        const matchesCategory =
          !this.selectedCategory || row.category === this.selectedCategory;

        // Type filter
        const matchesType =
          !this.selectedType ||
          row.subRows.some((subRow) => subRow.type === this.selectedType);

        // Entered By filter
        const matchesEnteredBy =
          !this.selectedEnteredBy || row.enteredBy === this.selectedEnteredBy;
        console.log(matchesType, matchesEnteredBy, this.selectedType);

        // Search text filter
        const matchesSearchText =
          !this.searchText ||
          row.subRows.some((subRow) =>
            subRow.type.toLowerCase().includes(this.searchText.toLowerCase())
          ) ||
          row.category.toLowerCase().includes(this.searchText.toLowerCase());

        const timeMatch =
          (!this.startTime && !this.endTime) ||
          (this.timeToMinutes(row.time) >= this.timeToMinutes(this.startTime) &&
            this.timeToMinutes(row.time) <= this.timeToMinutes(this.endTime));

        // Time range filter
        const matchesTimeRange =
          !this.selectedTimeOption ||
          this.isTimeInOption(row.time, this.selectedTimeOption);

        return (
          matchesCategory &&
          timeMatch &&
          matchesDate &&
          matchesTimeRange &&
          matchesType &&
          matchesEnteredBy &&
          matchesSearchText
        );
      });
      setTimeout(() => {
        this.dates = this.extractDates(this.filteredTableData);
        this.calculateTotalsAndEnteredBy();
      }, 10);
    } catch (error) {
      console.error('Error applying filter:', error);
    }
  }

  isTimeInOption(time: string, option: string): any {
    const [hours, minutes] = time.split(':').map(Number);
    const timeMinutes = hours * 60 + minutes;

    // debugger;
    switch (option) {
      case '7AM - 7PM':
        return (
          timeMinutes >= this.timeToMinutes('07:00') &&
          timeMinutes < this.timeToMinutes('19:00')
        );
      case '7PM - 7AM':
        return (
          timeMinutes >= this.timeToMinutes('19:00') ||
          timeMinutes < this.timeToMinutes('07:00')
        );
      case '7AM - 3PM':
        return (
          timeMinutes >= this.timeToMinutes('07:00') &&
          timeMinutes < this.timeToMinutes('15:00')
        );
      case '3PM - 11PM':
        return (
          timeMinutes >= this.timeToMinutes('15:00') &&
          timeMinutes < this.timeToMinutes('23:00')
        );
      case '11PM - 7AM':
        return (
          timeMinutes >= this.timeToMinutes('23:00') ||
          timeMinutes < this.timeToMinutes('07:00')
        );
      default:
        return true;
    }
  }

  timeToMinutes(time: string): number {
    try {
      const [hours, minutes] = time?.split(':').map(Number);
      return hours * 60 + minutes;
    } catch (error) {}
  }

  extractDates(data: any[]): string[] {
    const dateSet = new Set<string>();
    data.forEach((item) => {
      dateSet.add(item.date + '  ' + this.convertTo12HourFormat(item.time));
    });
    return Array.from(dateSet);
  }

  convertTo12HourFormat(time: string): string {
    try {
      const [hours, minutes] = time?.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const adjustedHours = hours % 12 || 12; // Convert 0 hours to 12 for AM and handle 12 PM correctly
      const formattedMinutes = minutes.toString().padStart(2, '0');
      return `${adjustedHours}:${formattedMinutes} ${period}`;
    } catch (error) {}
  }

  getEntryForDate(entries, subRow, date) {
    try {
      let value = '--';
      const entryTime =
        entries.date + '  ' + this.convertTo12HourFormat(entries.time);
      if (entryTime === date) {
        value = subRow.value;
      } else {
        value = '--';
      }
      return value;
    } catch (error) {}
  }

  calculateTotalsAndEnteredBy() {
    const totalVolumes = {};
    this.filteredTableData.forEach((category) => {
      category.subRows.forEach((subRow) => {
        // subRow.forEach((entry) => {
        const entryTime =
          category.date + '  ' + this.convertTo12HourFormat(category.time);
        if (!totalVolumes[entryTime]) {
          totalVolumes[entryTime] = 0;
        }
        if (subRow.value !== '--') {
          totalVolumes[entryTime] += parseInt(subRow.value);
        }
        // });
      });
    });

    let grandTotal = 0;
    this.dates.forEach((date) => {
      this.individualTotals[date] = totalVolumes[date]
        ? `${totalVolumes[date]} mL`
        : '--';
      if (totalVolumes[date]) {
        grandTotal += totalVolumes[date];
      }
    });

    this.grandTotal = `${grandTotal} mL`;

    this.filteredTableData.forEach((category) => {
      const entryTime =
        category.date + '  ' + this.convertTo12HourFormat(category.time);
      this.individualEnteredBy[entryTime] = category.enteredBy;
    });
  }
}
