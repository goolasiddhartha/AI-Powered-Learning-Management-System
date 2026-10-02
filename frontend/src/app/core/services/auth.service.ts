import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, AuthTokenData, User, UserRole } from '../models';
import { getHomeRoute } from '../guards/auth.guard';

const TOKEN_KEY = 'lms_access_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _user = signal<User | null>(null);
  private _loading = signal(true);

  user = this._user.asReadonly();
  loading = this._loading.asReadonly();

  isAuthenticated = computed(() => this._user() !== null);
  role = computed<UserRole | null>(() => this._user()?.role ?? null);
  fullName = computed(() => {
    const u = this._user();
    return u ? `${u.firstName} ${u.lastName}`.trim() : '';
  });
  initials = computed(() => {
    const u = this._user();
    if (!u) return '';
    return ((u.firstName[0] ?? '') + (u.lastName[0] ?? '')).toUpperCase();
  });

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  async init(): Promise<void> {
    this._loading.set(true);
    const token = this.getToken();
    if (!token) {
      this._user.set(null);
      this._loading.set(false);
      return;
    }
    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<User>>(`${environment.apiUrl}/auth/me`)
      );
      this._user.set(res.data);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      this._user.set(null);
    } finally {
      this._loading.set(false);
    }
  }

  async register(payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
  }): Promise<{ error: string | null }> {
    try {
      const res = await firstValueFrom(
        this.http.post<ApiResponse<AuthTokenData>>(
          `${environment.apiUrl}/auth/register`,
          payload
        )
      );
      this.persistSession(res.data);
      await this.router.navigateByUrl(getHomeRoute(res.data.user.role));
      return { error: null };
    } catch (err: unknown) {
      return { error: this.readError(err, 'Registration failed') };
    }
  }

  async login(email: string, password: string): Promise<{ error: string | null }> {
    try {
      const res = await firstValueFrom(
        this.http.post<ApiResponse<AuthTokenData>>(`${environment.apiUrl}/auth/login`, {
          email,
          password,
        })
      );
      this.persistSession(res.data);
      await this.router.navigateByUrl(getHomeRoute(res.data.user.role));
      return { error: null };
    } catch (err: unknown) {
      return { error: this.readError(err, 'Login failed') };
    }
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this._user.set(null);
    this.router.navigateByUrl('/login');
  }

  private persistSession(data: AuthTokenData): void {
    localStorage.setItem(TOKEN_KEY, data.accessToken);
    this._user.set(data.user);
  }

  private readError(err: unknown, fallback: string): string {
    const httpErr = err as { error?: { message?: string } };
    return httpErr?.error?.message ?? fallback;
  }
}
