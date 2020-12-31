import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-select-url',
  templateUrl: './select-url.component.html',
  styleUrls: ['./select-url.component.scss']
})
export class SelectUrlComponent implements OnInit {

  @Input() myForm: FormGroup;

  constructor() { }

  ngOnInit(): void {
  }

}
