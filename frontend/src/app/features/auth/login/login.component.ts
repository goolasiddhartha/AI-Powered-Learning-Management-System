import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="login-page">
      <section class="welcome-panel" aria-labelledby="welcome-title">
        <div class="panel-grain" aria-hidden="true"></div>
        <div class="panel-glow glow-a" aria-hidden="true"></div>
        <div class="panel-glow glow-b" aria-hidden="true"></div>

        <a class="brand" routerLink="/" aria-label="LearnAI home">
          <span class="brand-mark" aria-hidden="true">L</span>
          <span>learn<span class="brand-accent">ai</span></span>
        </a>

        <div class="welcome-content">
          <span class="eyebrow"><span class="live-dot"></span> Your learning space</span>
          <h1 id="welcome-title">Good to have<br />you <span>back.</span></h1>
          <p class="welcome-copy">
            Pick up where your curiosity left off. Your next lesson, new ideas, and
            helpful AI tutor are right where you need them.
          </p>

          <div class="returning-card">
            <div class="return-icon" aria-hidden="true">✧</div>
            <div class="return-copy">
              <strong>A little progress goes a long way.</strong>
              <span>Make today a day you learn something new.</span>
            </div>
            <span class="return-arrow" aria-hidden="true">↗</span>
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

      <section class="form-panel" aria-labelledby="login-title">
        <a class="mobile-brand" routerLink="/" aria-label="LearnAI home">
          <span class="brand-mark" aria-hidden="true">L</span>
          <span>learn<span class="brand-accent">ai</span></span>
        </a>
        <div class="form-wrap">
          <div class="form-heading">
            <span class="form-eyebrow">WELCOME BACK</span>
            <h2 id="login-title">Sign in to continue</h2>
            <p>Your next step is waiting for you.</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()" class="login-form">
            <label for="login-email">Email address</label>
            <div class="input-wrap">
              <span class="input-icon" aria-hidden="true">✉</span>
              <input
                id="login-email"
                type="email"
                formControlName="email"
                autocomplete="email"
                placeholder="you@example.com"
                required
              />
            </div>

            <div class="password-label">
              <label for="login-password">Password</label>
            </div>
            <div class="input-wrap">
              <span class="input-icon lock-icon" aria-hidden="true">⌑</span>
              <input
                id="login-password"
                type="password"
                formControlName="password"
                autocomplete="current-password"
                placeholder="Enter your password"
                required
              />
            </div>

            @if (error()) {
              <p class="error" role="alert">{{ error() }}</p>
            }

            <button class="submit-button" type="submit" [disabled]="form.invalid || loading()">
              <span>{{ loading() ? 'Signing you in…' : 'Sign in to your account' }}</span>
              @if (loading()) {
                <span class="button-spinner" aria-hidden="true"></span>
              } @else {
                <span class="button-arrow" aria-hidden="true">↗</span>
              }
            </button>
          </form>

          <div class="form-divider"><span></span><i>YOUR JOURNEY, YOUR PACE</i><span></span></div>
          <p class="signup-prompt">
            New to LearnAI?
            <a routerLink="/register">Create your free account <span aria-hidden="true">↗</span></a>
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
    .login-page { min-height: 100vh; display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(430px, .95fr); background: #fbfaf8; color: #20211f; }
    .welcome-panel { min-height: 100vh; padding: 38px clamp(32px, 6vw, 88px) 30px; position: relative; isolation: isolate; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; color: white; background: #20392f; }
    .welcome-panel::before { content: ''; position: absolute; inset: 0; z-index: -1; opacity: .18; background-image: radial-gradient(#fff .65px, transparent .65px); background-size: 22px 22px; mask-image: linear-gradient(135deg, transparent, black 50%, transparent); }
    .panel-grain { position: absolute; inset: 0; z-index: -1; opacity: .15; background: linear-gradient(125deg, transparent 15%, #a8b68a0d 50%, transparent 78%); background-size: 200% 200%; animation: grain-shift 12s ease-in-out infinite alternate; }
    .panel-glow { position: absolute; z-index: -1; border-radius: 50%; pointer-events: none; }
    .glow-a { width: 560px; height: 560px; top: -200px; right: -220px; background: radial-gradient(circle, #71906b55, transparent 68%); animation: glow-drift 11s ease-in-out infinite alternate; }
    .glow-b { width: 440px; height: 440px; left: -240px; bottom: -220px; background: radial-gradient(circle, #a3a85c36, transparent 68%); animation: glow-drift 14s ease-in-out infinite alternate-reverse; }
    .brand, .mobile-brand { width: fit-content; position: relative; z-index: 2; display: inline-flex; align-items: center; gap: 10px; color: white; font-size: 1.25rem; line-height: 1; letter-spacing: -.06em; font-weight: 800; animation: fade-in .7s both; }
    .brand-mark { width: 32px; height: 32px; display: grid; place-items: center; border-radius: 11px 11px 11px 4px; color: white; background: #527663; font-size: 1.05rem; letter-spacing: -.04em; }
    .brand-accent { color: #d7ed9d; }
    .welcome-content { width: min(540px, 100%); position: relative; z-index: 1; margin: auto 0; padding: 72px 0 84px; animation: reveal-up .8s .08s both; }
    .eyebrow { display: inline-flex; align-items: center; gap: 10px; color: #d3dfcc; font-size: .68rem; font-weight: 700; letter-spacing: .13em; text-transform: uppercase; }
    .live-dot { width: 7px; height: 7px; border-radius: 50%; background: #c9ec88; box-shadow: 0 0 0 5px #c9ec8821; animation: pulse 2.4s ease-in-out infinite; }
    h1 { margin: 25px 0 20px; font-size: clamp(3.5rem, 6.6vw, 6rem); line-height: .96; letter-spacing: -.08em; font-weight: 600; }
    h1 span { color: #d7ed9d; }
    .welcome-copy { max-width: 440px; color: #d2dbd3; font-size: .94rem; line-height: 1.85; }
    .returning-card { width: min(400px, 100%); min-height: 75px; margin-top: 38px; padding: 14px 16px; display: flex; align-items: center; gap: 12px; border: 1px solid #ffffff25; border-radius: 14px; background: #ffffff0c; box-shadow: 0 14px 35px #101a1512; backdrop-filter: blur(12px); animation: card-in .75s .45s both, card-float 7s 1.2s ease-in-out infinite; }
    .return-icon { width: 37px; height: 37px; flex: 0 0 auto; display: grid; place-items: center; border-radius: 11px; color: #e7f2c8; background: #ffffff18; font-size: 1.1rem; }
    .return-copy { display: grid; gap: 5px; }
    .return-copy strong { color: #f5f5ef; font-size: .71rem; }
    .return-copy span { color: #c5d0c5; font-size: .62rem; }
    .return-arrow { margin-left: auto; color: #d6e99f; font-size: 1rem; }
    .panel-footer { position: relative; z-index: 1; display: flex; align-items: center; gap: 10px; color: #c2cfc3; font-size: .66rem; }
    .footer-sparkle { color: #d6e99f; font-size: .9rem; animation: slow-spin 18s linear infinite; }
    .footer-line { width: 46px; height: 1px; margin-left: auto; background: #ffffff50; }
    .orbit { width: min(45vw, 570px); aspect-ratio: 1; position: absolute; z-index: -1; right: -24%; top: 50%; border: 1px solid #dcead412; border-radius: 50%; transform: translateY(-50%); pointer-events: none; }
    .orbit-one { animation: orbit-turn 80s linear infinite; }
    .orbit-one::before, .orbit-two::before { content: ''; width: 7px; height: 7px; position: absolute; top: 17%; left: 20%; border-radius: 50%; background: #c9e78c; box-shadow: 0 0 18px #c9e78c; }
    .orbit-two { width: min(35vw, 440px); right: -17%; border-style: dashed; animation: orbit-turn 90s linear infinite reverse; }
    .orbit-two::before { top: 75%; left: 88%; width: 5px; height: 5px; background: #e5c48e; box-shadow: 0 0 14px #e5c48e; }
    .orbit-star { position: absolute; top: 24%; right: 16%; color: #d5e89b; font-size: 1.2rem; animation: slow-spin 18s linear infinite; }
    .form-panel { min-height: 100vh; padding: 32px clamp(30px, 5.3vw, 76px) 25px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; background: #fbfaf8; }
    .mobile-brand { display: none; color: #20211f; }
    .mobile-brand .brand-mark { background: #315d4f; }
    .mobile-brand .brand-accent { color: #739659; }
    .form-wrap { width: min(390px, 100%); margin: auto 0; animation: reveal-up .8s .12s both; }
    .form-heading { margin-bottom: 32px; }
    .form-eyebrow { color: #68845d; font-size: .65rem; font-weight: 800; letter-spacing: .14em; }
    h2 { margin-top: 11px; color: #252722; font-size: clamp(1.8rem, 3vw, 2.25rem); letter-spacing: -.065em; line-height: 1.1; font-weight: 600; }
    .form-heading p { margin-top: 10px; color: #7e8079; font-size: .83rem; }
    .login-form { display: grid; gap: 9px; }
    .login-form label { margin-top: 8px; color: #41443e; font-size: .73rem; font-weight: 700; }
    .password-label { display: flex; justify-content: space-between; align-items: center; margin-top: 5px; }
    .password-label label { margin-top: 8px; }
    .input-wrap { position: relative; }
    .input-icon { position: absolute; z-index: 1; left: 15px; top: 50%; color: #8b9485; font-size: .9rem; transform: translateY(-50%); pointer-events: none; }
    .lock-icon { font-size: 1.1rem; }
    .input-wrap input { width: 100%; height: 50px; padding: 0 15px 0 43px; border: 1px solid #e4e4dc; border-radius: 9px; outline: 0; color: #292b26; background: #fffefa; font-size: .78rem; transition: border-color .22s ease, box-shadow .22s ease, background .22s ease; }
    .input-wrap input::placeholder { color: #a4a59e; }
    .input-wrap input:hover { border-color: #c6cfbd; }
    .input-wrap input:focus { border-color: #78936c; background: #fff; box-shadow: 0 0 0 4px #78936c1c; }
    .input-wrap:focus-within .input-icon { color: #56754f; }
    .error { margin: 4px 0 2px; padding: 11px 13px; border: 1px solid #e8c7bc; border-radius: 9px; color: #a64e3e; background: #fbefeb; font-size: .74rem; line-height: 1.5; animation: shake-in .28s ease-out; }
    .submit-button { width: 100%; min-height: 51px; margin-top: 14px; padding: 0 18px; display: flex; align-items: center; justify-content: center; gap: 10px; border-radius: 999px; color: #f8faf4; background: #315d4f; font-size: .77rem; font-weight: 700; transition: transform .2s ease, background .2s ease, box-shadow .2s ease; }
    .submit-button:hover:not(:disabled) { transform: translateY(-2px); background: #274c40; box-shadow: 0 9px 22px #315d4f2b; }
    .submit-button:focus-visible { outline: 3px solid #91a981; outline-offset: 3px; }
    .submit-button:disabled { opacity: .65; cursor: not-allowed; }
    .button-arrow { color: #d9eba8; font-size: 1rem; transition: transform .2s ease; }
    .submit-button:hover:not(:disabled) .button-arrow { transform: translate(2px, -2px); }
    .button-spinner { width: 15px; height: 15px; border: 2px solid #ffffff60; border-top-color: #e2efbe; border-radius: 50%; animation: spin .7s linear infinite; }
    .form-divider { margin: 29px 0 23px; display: flex; align-items: center; gap: 12px; }
    .form-divider span { height: 1px; flex: 1; background: #e9e8e1; }
    .form-divider i { color: #9a9b94; font-size: .51rem; font-style: normal; font-weight: 700; letter-spacing: .11em; white-space: nowrap; }
    .signup-prompt { text-align: center; color: #777870; font-size: .73rem; }
    .signup-prompt a { display: inline-flex; align-items: center; gap: 5px; margin-left: 4px; color: #52734e; font-weight: 700; }
    .signup-prompt a span { transition: transform .2s ease; }
    .signup-prompt a:hover span { transform: translate(2px, -2px); }
    .form-bottom { width: min(390px, 100%); display: flex; align-items: center; justify-content: space-between; color: #969790; font-size: .61rem; }
    .back-home { display: inline-flex; align-items: center; gap: 7px; color: #6f7569; transition: color .2s ease; }
    .back-home:hover { color: #315d4f; }
    .back-home span { font-size: .95rem; transition: transform .2s ease; }
    .back-home:hover span { transform: translateX(-3px); }
    @keyframes reveal-up { from { opacity: 0; transform: translateY(19px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes card-in { from { opacity: 0; transform: translateY(12px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
    @keyframes card-float { 0%, 100% { translate: 0 0; } 50% { translate: 0 -5px; } }
    @keyframes glow-drift { from { transform: translate3d(-10px, 0, 0) scale(.94); opacity: .7; } to { transform: translate3d(22px, 18px, 0) scale(1.08); opacity: 1; } }
    @keyframes grain-shift { from { background-position: 0 0; } to { background-position: 100% 100%; } }
    @keyframes orbit-turn { to { rotate: 360deg; } }
    @keyframes slow-spin { to { rotate: 360deg; } }
    @keyframes pulse { 50% { box-shadow: 0 0 0 8px #c9ec880b; } }
    @keyframes spin { to { rotate: 360deg; } }
    @keyframes shake-in { 25% { translate: -3px 0; } 50% { translate: 3px 0; } 75% { translate: -2px 0; } }
    @media (max-width: 850px) {
      .login-page { grid-template-columns: minmax(0, .92fr) minmax(390px, 1.08fr); }
      .welcome-panel { padding-right: 35px; padding-left: 35px; }
      h1 { font-size: clamp(3.4rem, 7vw, 4.7rem); }
      .orbit { right: -40%; }.orbit-two { right: -30%; }
      .form-panel { padding-right: 35px; padding-left: 35px; }
    }
    @media (max-width: 680px) {
      .login-page { grid-template-columns: 1fr; }
      .welcome-panel { min-height: 270px; padding: 22px 25px 27px; }
      .welcome-content { width: min(540px, 100%); padding: 38px 0 9px; }
      .welcome-content .eyebrow { font-size: .59rem; }
      h1 { margin: 15px 0 10px; font-size: clamp(2.65rem, 10vw, 4rem); }
      .welcome-copy { max-width: 480px; font-size: .8rem; line-height: 1.7; }
      .returning-card, .panel-footer, .orbit, .orbit-star { display: none; }
      .form-panel { min-height: calc(100vh - 270px); padding: 39px 25px 19px; justify-content: flex-start; }
      .form-wrap { width: min(410px, 100%); margin: 0 auto auto; }
      .form-bottom { width: min(410px, 100%); margin: 44px auto 0; }
    }
    @media (max-width: 420px) {
      .welcome-panel { min-height: 250px; padding: 19px 21px 24px; }
      .welcome-panel > .brand { font-size: 1.12rem; }
      .welcome-panel .brand-mark { width: 29px; height: 29px; }
      .welcome-content { padding-top: 34px; }
      h1 { font-size: 2.85rem; }
      .form-panel { min-height: calc(100vh - 250px); padding: 34px 21px 17px; }
      .form-heading { margin-bottom: 26px; }
      .form-divider { margin: 25px 0 20px; }
    }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
    }
  `],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  async submit(): Promise<void> {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    const { email, password } = this.form.getRawValue();
    const result = await this.auth.login(email, password);
    this.loading.set(false);
    if (result.error) {
      this.error.set(result.error);
      return;
    }
    this.toast.success('Welcome back');
  }
}
