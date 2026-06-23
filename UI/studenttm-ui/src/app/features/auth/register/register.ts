import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {ReactiveFormsModule,FormBuilder,FormGroup,Validators} from '@angular/forms';

import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../../core/services/auth';
import { ToastrService } from 'ngx-toastr';

import { finalize } from 'rxjs/operators';
                                                       
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register implements OnInit {

  registerForm!: FormGroup;

  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {

    this.registerForm = this.fb.group({

      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3)
        ]
      ],

      email: [
        '',
        [
          Validators.required,
          Validators.pattern(
            '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
          )
        ]
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6)
        ]
      ]
    });
  }

  onRegister(): void {

    if (this.registerForm.invalid) {

      this.registerForm.markAllAsTouched();

      return;
    }

    const request = this.registerForm.value;

    this.isLoading = true;

    this.authService
      .register(request)
      .pipe(
        finalize(() => {

          this.isLoading = false;
        })
      )
      .subscribe({

        next: () => {

          this.toastr.success(
            'Registration successful! Please login.'
          );

          this.router.navigate(['/login']);
        },

        error: (err: Error) => {

          this.toastr.error(
            err.message
          );
        }
      });
  }
}