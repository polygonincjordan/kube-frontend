import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-error-placeholder',
  templateUrl: './error-placeholder.component.html',
  styleUrls: ['./error-placeholder.component.scss'],
})
export class ErrorPlaceholderComponent implements OnInit {
  @Input() classText = 'text-gray-900';

  constructor() {}

  ngOnInit(): void {}
}
