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
    <main class="register-page">
      <section class="welcome-panel" aria-labelledby="welcome-title">
        <div class="panel-grain" aria-hidden="true"></div>
        <div class="panel-glow glow-a" aria-hidden="true"></div>
        <div class="panel-glow glow-b" aria-hidden="true"></div>

        <a class="brand" routerLink="/" aria-label="LearnAI home">
          <span class="brand-mark" aria-hidden="true">L</span>
          <span>learn<span class="brand-accent">ai</span></span>
        </a>

        <div class="welcome-content">
          <span class="eyebrow"><span class="live-dot"></span> A little more possible</span>
          <h1 id="welcome-title">Your next<br />chapter <span>starts here.</span></h1>
          <p class="welcome-copy">
            Make room for something new. Learn at your own pace, get a hand from your
            AI tutor, and celebrate every step forward.
          </p>

          <div class="benefit-list">
            <div class="benefit">
              <span class="benefit-icon" aria-hidden="true">✧</span>
              <span><strong>Learning that fits your life</strong><small>Pick up a lesson whenever you have a moment.</small></span>
            </div>
            <div class="benefit">
              <span class="benefit-icon benefit-icon-alt" aria-hidden="true">↗</span>
              <span><strong>Progress you can feel</strong><small>See how far you've come and what to try next.</small></span>
            </div>
          </div>
        </div>

        <div class="panel-footer">
          <span class="footer-sparkle" aria-hidden="true">✳</span>
          <span>Learn at your pace. Keep growing.</span>
          <span class="footer-line"></span>
        </div>
        <span class="orbit orbit-one" aria-hidden="true"></span>
        <span class="orbit orbit-two" aria-hidden="true"></span>
        <span class="orbit-star" aria-hidden="true">✦</span>
      </section>

      <section class="form-panel" aria-labelledby="register-title">
        <a class="mobile-brand" routerLink="/" aria-label="LearnAI home">
          <span class="brand-mark" aria-hidden="true">L</span>
          <span>learn<span class="brand-accent">ai</span></span>
        </a>
        <div class="form-wrap">
          <div class="form-heading">
            <span class="form-eyebrow">A GOOD PLACE TO BEGIN</span>
            <h2 id="register-title">Create your account</h2>
            <p>Bring your curiosity. We'll help with the rest.</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()" class="register-form">
            <div class="name-row">
              <div class="field">
                <label for="register-first-name">First name</label>
                <div class="input-wrap">
                  <span class="input-icon" aria-hidden="true">✧</span>
                  <input id="register-first-name" formControlName="firstName" autocomplete="given-name" placeholder="First name" required />
                </div>
              </div>
              <div class="field">
                <label for="register-last-name">Last name</label>
                <div class="input-wrap">
                  <span class="input-icon" aria-hidden="true">✧</span>
                  <input id="register-last-name" formControlName="lastName" autocomplete="family-name" placeholder="Last name" required />
                </div>
              </div>
            </div>

            <div class="field">
              <label for="register-email">Email address</label>
              <div class="input-wrap">
                <span class="input-icon" aria-hidden="true">✉</span>
                <input id="register-email" type="email" formControlName="email" autocomplete="email" placeholder="you@example.com" required />
              </div>
            </div>

            <div class="field">
              <label for="register-password">Password</label>
              <div class="input-wrap">
                <span class="input-icon lock-icon" aria-hidden="true">⌑</span>
                <input id="register-password" type="password" formControlName="password" autocomplete="new-password" placeholder="At least 8 characters" minlength="8" required />
              </div>
              <span class="field-hint">Use at least 8 characters.</span>
            </div>

            <div class="field">
              <label for="register-role">I want to</label>
              <div class="select-wrap">
                <span class="input-icon" aria-hidden="true">✦</span>
                <select id="register-role" formControlName="role">
                  <option value="STUDENT">Learn something new</option>
                  <option value="INSTRUCTOR">Teach and share what I know</option>
                </select>
                <span class="select-arrow" aria-hidden="true">⌄</span>
              </div>
            </div>

            @if (error()) {
              <p class="error" role="alert">{{ error() }}</p>
            }

            <button class="submit-button" type="submit" [disabled]="form.invalid || loading()">
              <span>{{ loading() ? 'Creating your account…' : 'Create your free account' }}</span>
              @if (loading()) {
                <span class="button-spinner" aria-hidden="true"></span>
              } @else {
                <span class="button-arrow" aria-hidden="true">↗</span>
              }
            </button>
          </form>

          <div class="form-divider"><span></span><i>YOUR JOURNEY, YOUR PACE</i><span></span></div>
          <p class="signin-prompt">
            Already learning with us?
            <a routerLink="/login">Sign in <span aria-hidden="true">↗</span></a>
          </p>
        </div>

        <div class="form-bottom">
          <a routerLink="/" class="back-home"><span aria-hidden="true">←</span> Back to home</a>
          <span>© 2026 LearnAI</span>
        </div>
      </section>
    </main>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; }
    .register-page { min-height: 100vh; display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(480px, .95fr); background: #fbfaf8; color: #20211f; }
    .welcome-panel { min-height: 100vh; padding: 38px clamp(32px, 6vw, 88px) 30px; position: sticky; top: 0; height: 100vh; isolation: isolate; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; color: white; background: #20392f; }
    .welcome-panel::before { content: ''; position: absolute; inset: 0; z-index: -1; opacity: .18; background-image: radial-gradient(#fff .65px, transparent .65px); background-size: 22px 22px; mask-image: linear-gradient(135deg, transparent, black 50%, transparent); }
    .panel-grain { position: absolute; inset: 0; z-index: -1; opacity: .15; background: linear-gradient(125deg, transparent 15%, #a8b68a0d 50%, transparent 78%); background-size: 200% 200%; animation: grain-shift 12s ease-in-out infinite alternate; }
    .panel-glow { position: absolute; z-index: -1; border-radius: 50%; pointer-events: none; }
    .glow-a { width: 560px; height: 560px; top: -200px; right: -220px; background: radial-gradient(circle, #71906b55, transparent 68%); animation: glow-drift 11s ease-in-out infinite alternate; }
    .glow-b { width: 440px; height: 440px; left: -240px; bottom: -220px; background: radial-gradient(circle, #a3a85c36, transparent 68%); animation: glow-drift 14s ease-in-out infinite alternate-reverse; }
    .brand, .mobile-brand { width: fit-content; position: relative; z-index: 2; display: inline-flex; align-items: center; gap: 10px; color: white; font-size: 1.25rem; line-height: 1; letter-spacing: -.06em; font-weight: 800; animation: fade-in .7s both; }
    .brand-mark { width: 32px; height: 32px; display: grid; place-items: center; border-radius: 11px 11px 11px 4px; color: white; background: #527663; font-size: 1.05rem; letter-spacing: -.04em; }
    .brand-accent { color: #d7ed9d; }
    .welcome-content { width: min(540px, 100%); position: relative; z-index: 1; margin: auto 0; padding: 45px 0 55px; animation: reveal-up .8s .08s both; }
    .eyebrow { display: inline-flex; align-items: center; gap: 10px; color: #d3dfcc; font-size: .68rem; font-weight: 700; letter-spacing: .13em; text-transform: uppercase; }
    .live-dot { width: 7px; height: 7px; border-radius: 50%; background: #c9ec88; box-shadow: 0 0 0 5px #c9ec8821; animation: pulse 2.4s ease-in-out infinite; }
    h1 { margin: 23px 0 18px; font-size: clamp(3.35rem, 5.7vw, 5.5rem); line-height: .98; letter-spacing: -.08em; font-weight: 600; }
    h1 span { color: #d7ed9d; }
    .welcome-copy { max-width: 440px; color: #d2dbd3; font-size: .9rem; line-height: 1.8; }
    .benefit-list { width: min(410px, 100%); margin-top: 31px; display: grid; gap: 11px; }
    .benefit { min-height: 62px; padding: 11px 14px; display: flex; align-items: center; gap: 12px; border: 1px solid #ffffff20; border-radius: 12px; background: #ffffff0b; backdrop-filter: blur(10px); animation: card-in .7s both; }
    .benefit:nth-child(2) { animation-delay: .2s; }
    .benefit-icon { width: 34px; height: 34px; flex: 0 0 auto; display: grid; place-items: center; border-radius: 10px; color: #e7f2c8; background: #ffffff18; font-size: 1rem; }
    .benefit-icon-alt { color: #d6e99f; }
    .benefit > span:last-child { display: grid; gap: 4px; }
    .benefit strong { color: #f5f5ef; font-size: .68rem; }
    .benefit small { color: #c5d0c5; font-size: .59rem; }
    .panel-footer { position: relative; z-index: 1; display: flex; align-items: center; gap: 10px; color: #c2cfc3; font-size: .66rem; }
    .footer-sparkle { color: #d6e99f; font-size: .9rem; animation: slow-spin 18s linear infinite; }
    .footer-line { width: 46px; height: 1px; margin-left: auto; background: #ffffff50; }
    .orbit { width: min(45vw, 570px); aspect-ratio: 1; position: absolute; z-index: -1; right: -24%; top: 50%; border: 1px solid #dcead412; border-radius: 50%; transform: translateY(-50%); pointer-events: none; }
    .orbit-one { animation: orbit-turn 80s linear infinite; }
    .orbit-one::before, .orbit-two::before { content: ''; width: 7px; height: 7px; position: absolute; top: 17%; left: 20%; border-radius: 50%; background: #c9e78c; box-shadow: 0 0 18px #c9e78c; }
    .orbit-two { width: min(35vw, 440px); right: -17%; border-style: dashed; animation: orbit-turn 90s linear infinite reverse; }
    .orbit-two::before { top: 75%; left: 88%; width: 5px; height: 5px; background: #e5c48e; box-shadow: 0 0 14px #e5c48e; }
    .orbit-star { position: absolute; top: 24%; right: 16%; color: #d5e89b; font-size: 1.2rem; animation: slow-spin 18s linear infinite; }
    .form-panel { min-height: 100vh; padding: 28px clamp(30px, 5vw, 70px) 23px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; background: #fbfaf8; }
    .mobile-brand { display: none; color: #20211f; }
    .mobile-brand .brand-mark { background: #315d4f; }
    .mobile-brand .brand-accent { color: #739659; }
    .form-wrap { width: min(440px, 100%); margin: auto 0; animation: reveal-up .8s .12s both; }
    .form-heading { margin-bottom: 22px; }
    .form-eyebrow { color: #68845d; font-size: .62rem; font-weight: 800; letter-spacing: .14em; }
    h2 { margin-top: 9px; color: #252722; font-size: clamp(1.75rem, 2.7vw, 2.15rem); letter-spacing: -.065em; line-height: 1.1; font-weight: 600; }
    .form-heading p { margin-top: 8px; color: #7e8079; font-size: .79rem; }
    .register-form { display: grid; gap: 12px; }
    .name-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .field { min-width: 0; display: grid; gap: 6px; }
    .field label { color: #41443e; font-size: .69rem; font-weight: 700; }
    .input-wrap, .select-wrap { position: relative; }
    .input-icon { position: absolute; z-index: 1; left: 13px; top: 50%; color: #8b9485; font-size: .82rem; transform: translateY(-50%); pointer-events: none; }
    .lock-icon { font-size: 1.05rem; }
    .input-wrap input, .select-wrap select { width: 100%; height: 45px; padding: 0 12px 0 39px; border: 1px solid #e4e4dc; border-radius: 9px; outline: 0; color: #292b26; background: #fffefa; font-size: .74rem; transition: border-color .22s ease, box-shadow .22s ease, background .22s ease; }
    .input-wrap input::placeholder { color: #a4a59e; }
    .input-wrap input:hover, .select-wrap select:hover { border-color: #c6cfbd; }
    .input-wrap input:focus, .select-wrap select:focus { border-color: #78936c; background: #fff; box-shadow: 0 0 0 4px #78936c1c; }
    .input-wrap:focus-within .input-icon, .select-wrap:focus-within .input-icon { color: #56754f; }
    .select-wrap select { padding-right: 36px; appearance: none; cursor: pointer; }
    .select-arrow { position: absolute; top: 50%; right: 14px; color: #7c8875; font-size: 1.05rem; transform: translateY(-58%); pointer-events: none; }
    .field-hint { margin-top: -2px; color: #969790; font-size: .59rem; }
    .error { margin: 0; padding: 10px 12px; border: 1px solid #e8c7bc; border-radius: 9px; color: #a64e3e; background: #fbefeb; font-size: .72rem; line-height: 1.5; animation: shake-in .28s ease-out; }
    .submit-button { width: 100%; min-height: 48px; margin-top: 3px; padding: 0 18px; display: flex; align-items: center; justify-content: center; gap: 10px; border-radius: 999px; color: #f8faf4; background: #315d4f; font-size: .75rem; font-weight: 700; transition: transform .2s ease, background .2s ease, box-shadow .2s ease; }
    .submit-button:hover:not(:disabled) { transform: translateY(-2px); background: #274c40; box-shadow: 0 9px 22px #315d4f2b; }
    .submit-button:focus-visible { outline: 3px solid #91a981; outline-offset: 3px; }
    .submit-button:disabled { opacity: .65; cursor: not-allowed; }
    .button-arrow { color: #d9eba8; font-size: 1rem; transition: transform .2s ease; }
    .submit-button:hover:not(:disabled) .button-arrow { transform: translate(2px, -2px); }
    .button-spinner { width: 15px; height: 15px; border: 2px solid #ffffff60; border-top-color: #e2efbe; border-radius: 50%; animation: spin .7s linear infinite; }
    .form-divider { margin: 21px 0 16px; display: flex; align-items: center; gap: 12px; }
    .form-divider span { height: 1px; flex: 1; background: #e9e8e1; }
    .form-divider i { color: #9a9b94; font-size: .49rem; font-style: normal; font-weight: 700; letter-spacing: .11em; white-space: nowrap; }
    .signin-prompt { text-align: center; color: #777870; font-size: .7rem; }
    .signin-prompt a { display: inline-flex; align-items: center; gap: 5px; margin-left: 4px; color: #52734e; font-weight: 700; }
    .signin-prompt a span { transition: transform .2s ease; }
    .signin-prompt a:hover span { transform: translate(2px, -2px); }
    .form-bottom { width: min(440px, 100%); display: flex; align-items: center; justify-content: space-between; color: #969790; font-size: .61rem; }
    .back-home { display: inline-flex; align-items: center; gap: 7px; color: #6f7569; transition: color .2s ease; }
    .back-home:hover { color: #315d4f; }
    .back-home span { font-size: .95rem; transition: transform .2s ease; }
    .back-home:hover span { transform: translateX(-3px); }
    @keyframes reveal-up { from { opacity: 0; transform: translateY(19px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes card-in { from { opacity: 0; transform: translateY(12px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
    @keyframes glow-drift { from { transform: translate3d(-10px, 0, 0) scale(.94); opacity: .7; } to { transform: translate3d(22px, 18px, 0) scale(1.08); opacity: 1; } }
    @keyframes grain-shift { from { background-position: 0 0; } to { background-position: 100% 100%; } }
    @keyframes orbit-turn { to { rotate: 360deg; } }
    @keyframes slow-spin { to { rotate: 360deg; } }
    @keyframes pulse { 50% { box-shadow: 0 0 0 8px #c9ec880b; } }
    @keyframes spin { to { rotate: 360deg; } }
    @keyframes shake-in { 25% { translate: -3px 0; } 50% { translate: 3px 0; } 75% { translate: -2px 0; } }
    @media (max-width: 900px) {
      .register-page { grid-template-columns: minmax(0, .9fr) minmax(450px, 1.1fr); }
      .welcome-panel { padding-right: 32px; padding-left: 32px; }
      h1 { font-size: clamp(3.1rem, 6vw, 4.5rem); }
      .orbit { right: -40%; }.orbit-two { right: -30%; }
      .form-panel { padding-right: 30px; padding-left: 30px; }
      .name-row { gap: 9px; }
    }
    @media (max-width: 720px) {
      .register-page { grid-template-columns: 1fr; }
      .welcome-panel { min-height: auto; height: auto; padding: 22px 25px 27px; position: relative; }
      .welcome-content { width: min(540px, 100%); padding: 35px 0 10px; }
      .welcome-content .eyebrow { font-size: .59rem; }
      h1 { margin: 15px 0 10px; font-size: clamp(2.65rem, 10vw, 4rem); }
      .welcome-copy { max-width: 500px; font-size: .8rem; line-height: 1.7; }
      .benefit-list, .panel-footer, .orbit, .orbit-star { display: none; }
      .form-panel { min-height: auto; padding: 36px 25px 19px; }
      .form-wrap { width: min(440px, 100%); margin: 0 auto; }
      .form-bottom { width: min(440px, 100%); margin: 39px auto 0; }
    }
    @media (max-width: 480px) {
      .welcome-panel { padding: 19px 21px 23px; }
      .welcome-panel > .brand { font-size: 1.12rem; }
      .welcome-panel .brand-mark { width: 29px; height: 29px; }
      .welcome-content { padding-top: 31px; }
      h1 { font-size: 2.8rem; }
      .form-panel { padding: 31px 21px 17px; }
      .form-heading { margin-bottom: 23px; }
      .name-row { grid-template-columns: 1fr 1fr; gap: 9px; }
      .field label { font-size: .66rem; }
      .input-wrap input, .select-wrap select { font-size: .7rem; }
      .form-divider { margin: 19px 0 15px; }
    }
    @media (max-width: 360px) {
      .name-row { grid-template-columns: 1fr; }
    }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
    }
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
      return;
    }
    this.toast.success('Account created');
  }
}
