import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  errorMessage = signal('');

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.errorMessage.set('Please enter both email and password.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Invalid email or password.');
      },
    });
  }

  fillDemoCredentials(role: 'admin' | 'user'): void {
    if (role === 'admin') {
      this.email = 'admin@restaurant.com';
      this.password = 'password123';
    } else {
      this.email = 'user@restaurant.com';
      this.password = 'password123';
    }
  }
}
