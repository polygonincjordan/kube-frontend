import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-post-cath-femoral',
  templateUrl: './post-cath-femoral.component.html',
  styleUrls: ['./post-cath-femoral.component.scss']
})
export class PostCathFemoralComponent implements OnInit {
  public CurrentDateAndTime: Date = new Date();
  physicians = [
    { id: '01', name: '01 Dr. Kais Balbissi' },
    { id: '02', name: '02 Dr. Ramzi Tabbalat' },
    { id: '03', name: '03 Dr. Kamel Toukan' },
    { id: '04', name: '04 Dr. Amir Malkawi' },
    { id: '05', name: "05 Dr. Ziad Qura'n" },
    { id: '06', name: '06 Dr. Nazih Kadri' },
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
