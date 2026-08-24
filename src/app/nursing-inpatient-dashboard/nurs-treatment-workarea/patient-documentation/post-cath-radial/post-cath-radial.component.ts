import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-post-cath-radial',
  templateUrl: './post-cath-radial.component.html',
  styleUrls: ['./post-cath-radial.component.scss']
})
export class PostCathRadialComponent implements OnInit {

  public CurrentDateAndTime: Date = new Date();
  physicians = [
    { id: '01', name: 'Dr.Kais Balbissi' },
    { id: '02', name: 'Dr.Ramzi Tabbalat' },
    { id: '03', name: 'Dr.Kamel Toukan' },
    { id: '04', name: 'Dr.Amir Malkawi' },
    { id: '05', name: "Dr.Ziad Qura'n" },
    { id: '06', name: 'Dr.Nazih Kadri' },
  ];
  currentTime: string;
  constructor() { 
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    this.currentTime = `${hours}:${minutes}:${seconds}`;
  }

  ngOnInit(): void {
  }
}
