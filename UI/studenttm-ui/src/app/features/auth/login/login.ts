import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import {
  Router,
  RouterModule
} from '@angular/router';

import { ToastrService } from 'ngx-toastr';

import { AuthService } from '../../../core/services/auth';

import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {

  loginForm!: FormGroup; 

  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {

    this.loginForm = this.fb.group({

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

  onLogin(): void {

    if (this.loginForm.invalid) {  //checks is any control fails validation

      this.loginForm.markAllAsTouched(); //mark all controls as touched to trigger validation messages

      return;
    }

    const request = this.loginForm.value;  //get form values as an object

    this.isLoading = true;

    this.authService
      .login(request)
      .pipe(
        finalize(() => {

          this.isLoading = false;
        })
      )
      .subscribe({

        next: () => {

          this.toastr.success(
            'Login Successful, Welcome back!'
          );

          this.router.navigate(
            ['/dashboard']
          );
        },

        error: (err: Error) => {

          this.toastr.error(
            err.message
          );
        }
      });
  }
}