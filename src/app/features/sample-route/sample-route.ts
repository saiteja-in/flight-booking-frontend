import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sample-route',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './sample-route.html',
  styleUrl: './sample-route.css',
})
export class SampleRoute {
  private router=inject(Router);
  private fb=inject(FormBuilder)
  nameForm:FormGroup

  constructor() {
    this.nameForm = this.fb.group({
      name: ['', [Validators.required]],
      age: ['', [Validators.required, Validators.min(1)]]
    });
  }

  onSubmit() {
    if (this.nameForm.valid) {
      console.log('Form Data:', this.nameForm.value);
    } else {
      console.log('Form is invalid');
    }
  }
}
