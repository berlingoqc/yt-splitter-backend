import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ContextService } from '../service/context.service';

@Component({
  selector: 'app-context-form',
  templateUrl: './context-form.component.html',
  styleUrls: ['./context-form.component.scss']
})
export class ContextFormComponent implements OnInit {

  formGroup: FormGroup;

  constructor(
    private contextService: ContextService,
    private httpClient: HttpClient,
  ) { }

  ngOnInit(): void {
    const context = this.contextService.context ?? {backendURL: 'http://localhost:3000', password: '12345678' }
    this.formGroup = new FormGroup({
      backendURL: new FormControl(context.backendURL, [Validators.required]),
      password: new FormControl(context.password, [Validators.required]),
    })
  }


  onSubmit() {
    const context = this.formGroup.value;
    this.contextService.context = context;
    this.httpClient.get(context.backendURL).subscribe(() => {
      console.log('SUCCES');
    }, () => {
      this.formGroup.controls.password.setErrors({bad: true})
      this.contextService.context = null;
    })
  }

}
