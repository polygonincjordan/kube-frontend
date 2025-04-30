import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-not-added',
  templateUrl: './not-added.component.html',
  styleUrls: ['./not-added.component.scss'],
})
export class NotAddedComponent implements OnInit {
  @Input() name: string = '';

  constructor() {}

  ngOnInit(): void {}
}
