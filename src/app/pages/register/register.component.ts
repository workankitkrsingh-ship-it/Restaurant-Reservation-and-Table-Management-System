import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  name = '';
  email = '';
  phone = '';
  password = '';
  adminSecretKey = '';

  loading = signal(false);
  errorMessage = signal('');

  onSubmit(): void {
    if (!this.name || !this.email || !this.password) {
      this.errorMessage.set('Please complete all required fields.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService
      .register({
        name: this.name,
        email: this.email,
        phone: this.phone,
        password: this.password,
        adminSecretKey: this.adminSecretKey,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(err.error?.message || 'Registration failed.');
        },
      });
  }
}
