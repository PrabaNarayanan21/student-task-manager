import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  username: string = '';
  email: string = '';
  password: string = '';
  isLoading=false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  onRegister(): void {
    const request = {
      username: this.username,
      email: this.email,
      password: this.password
    };

    this.isLoading = true;
    this.authService.register(request).pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: () => {
        this.toastr.success('Registration successful! Please login.');
        this.router.navigate(['/login']);
      },
      error: (err: Error) => {
        this.toastr.error(err.message);
      }
    });
  }
}