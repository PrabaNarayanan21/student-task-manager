import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth';
import { finalize } from 'rxjs/operators';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  email: string = '';
  password: string = '';
  isLoading=false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  onLogin(): void {
  const request = {
    email: this.email,
    password: this.password
  };

  this.isLoading = true;
  this.authService.login(request).pipe(
    finalize(() => {
      this.isLoading = false;
    })
  ).subscribe({
    next: () => {                           
      this.toastr.success('Login Successful,Welcome back!');
      this.router.navigate(['/dashboard']);
    },
    error: (err: Error) => {
      this.toastr.error(err.message);
    }
  });
}
}