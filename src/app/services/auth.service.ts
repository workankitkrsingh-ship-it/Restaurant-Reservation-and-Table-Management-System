import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, User } from '../models/restaurant.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:5000/api/auth';

  // Reactive state signals
  currentUser = signal<User | null>(this.getStoredUser());
  token = signal<string | null>(localStorage.getItem('restaurant_token'));

  isAuthenticated = computed(() => !!this.currentUser() && !!this.token());
  isAdmin = computed(() => this.currentUser()?.role === 'admin');

  constructor(private http: HttpClient) {}

  private getStoredUser(): User | null {
    const raw = localStorage.getItem('restaurant_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  getAuthHeaders(): HttpHeaders {
    const jwt = this.token();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    });
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((res) => {
        if (res.success && res.token) {
          this.saveSession(res.user, res.token);
        }
      })
    );
  }

  register(payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    adminSecretKey?: string;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, payload).pipe(
      tap((res) => {
        if (res.success && res.token) {
          this.saveSession(res.user, res.token);
        }
      })
    );
  }

  private saveSession(user: User, token: string): void {
    localStorage.setItem('restaurant_token', token);
    localStorage.setItem('restaurant_user', JSON.stringify(user));
    this.token.set(token);
    this.currentUser.set(user);
  }

  logout(): void {
    localStorage.removeItem('restaurant_token');
    localStorage.removeItem('restaurant_user');
    this.token.set(null);
    this.currentUser.set(null);
  }
}
