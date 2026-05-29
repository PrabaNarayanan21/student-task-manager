import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  username: string = '';
  email: string = '';
  password: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onRegister(): void {

    const request = {
      username: this.username,
      email: this.email,
      password: this.password
    };

    this.authService.register(request)
      .subscribe({

        next: (response) => {

          alert('Registration Successful');

          this.router.navigate(['/login']);
        },

        error: (error) => {

          console.error(error);

          alert('Registration Failed');
        }
      });
  }
}