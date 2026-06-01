import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../../core/services/auth';

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

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onLogin(): void {
  const request = {
    email: this.email,
    password: this.password
  };

  this.authService.login(request).subscribe({
    next: () => {                           // ✅ no need to touch response here
      alert('Login Successful');
      this.router.navigate(['/dashboard']);
    },
    error: (error) => {
      console.error(error);
      alert('Invalid email or password');
    }
  });
}
}