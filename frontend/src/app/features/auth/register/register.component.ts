import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { UserRole } from '../../../core/models';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="brand">LearnAI</div>
        <h1>Create your account</h1>
        <p class="subtitle">Join as a student or instructor</p>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="row">
            <label>
              First name
              <input formControlName="firstName" />
            </label>
            <label>
              Last name
              <input formControlName="lastName" />
            </label>
          </div>
          <label>
            Email
            <input type="email" formControlName="email" />
          </label>
          <label>
            Password
            <input type="password" formControlName="password" />
          </label>
          <label>
            Role
            <select formControlName="role">
              <option value="STUDENT">Student</option>
              <option value="INSTRUCTOR">Instructor</option>
            </select>
          </label>
          @if (error()) {
            <p class="error">{{ error() }}</p>
          }
          <button class="btn-primary" type="submit" [disabled]="form.invalid || loading()">
            {{ loading() ? 'Creating…' : 'Create account' }}
          </button>
        </form>

        <p class="footer-link">
          Already registered?
          <a routerLink="/login">Sign in</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
      background:
        radial-gradient(circle at 10% 20%, #dbeafe 0%, transparent 40%),
        radial-gradient(circle at 90% 10%, #ccfbf1 0%, transparent 35%),
        #f8fafc;
    }
    .auth-card {
      width: min(480px, 100%);
      background: white;
      border: 1px solid var(--color-neutral-200);
      border-radius: var(--radius-xl);
      padding: 36px 32px;
      box-shadow: var(--shadow-lg);
    }
    .brand { font-weight: 800; font-size: 1.5rem; color: var(--color-primary-700); margin-bottom: 16px; }
    h1 { margin: 0 0 6px; font-size: 1.5rem; }
    .subtitle { margin: 0 0 24px; color: var(--color-neutral-500); }
    form { display: grid; gap: 14px; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    label { display: grid; gap: 6px; font-size: 0.875rem; font-weight: 600; color: var(--color-neutral-700); }
    input, select {
      padding: 10px 12px;
      border: 1px solid var(--color-neutral-300);
      border-radius: var(--radius-md);
      font: inherit;
    }
    .btn-primary {
      margin-top: 8px;
      padding: 12px;
      border: none;
      border-radius: var(--radius-md);
      background: var(--color-primary-600);
      color: white;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .error { color: var(--color-error-600); margin: 0; font-size: 0.875rem; }
    .footer-link { margin-top: 20px; text-align: center; color: var(--color-neutral-600); }
    a { color: var(--color-primary-700); font-weight: 600; }
    @media (max-width: 560px) { .row { grid-template-columns: 1fr; } }
  `],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['STUDENT' as UserRole, [Validators.required]],
  });

  async submit(): Promise<void> {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    const result = await this.auth.register(this.form.getRawValue());
    this.loading.set(false);
    if (result.error) {
      this.error.set(result.error);
      this.toast.error(result.error);
      return;
    }
    this.toast.success('Account created');
  }
}
