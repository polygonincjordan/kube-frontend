import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-modified-aldrete-document',
  templateUrl: './modified-aldrete-document.component.html',
  styleUrls: ['./modified-aldrete-document.component.scss']
})
export class ModifiedAldreteDocumentComponent implements OnInit {

  MorsefallForm: FormGroup<any>;

  constructor() { }

  ngOnInit(): void {
  }

}
