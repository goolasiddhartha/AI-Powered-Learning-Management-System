import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  imports: [RouterLink],
  template: `
    <section class="hero">
      <header class="top">
        <div class="brand">LearnAI</div>
        <div class="actions">
          <a routerLink="/login" class="link">Sign in</a>
          <a routerLink="/register" class="cta">Get started</a>
        </div>
      </header>
      <div class="content">
        <h1>AI-Powered Learning Management System</h1>
        <p>
          Courses, lessons, quizzes, progress tracking, and a RAG-based AI tutor —
          built with Angular, FastAPI, MongoDB, and Gemini.
        </p>
        <div class="cta-row">
          <a routerLink="/register" class="cta">Create account</a>
          <a routerLink="/login" class="ghost">I already have an account</a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero {
      min-height: 100vh;
      padding: 24px clamp(20px, 5vw, 64px) 64px;
      background:
        linear-gradient(160deg, rgba(15, 23, 42, 0.55), rgba(15, 23, 42, 0.75)),
        url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80')
          center/cover no-repeat;
      color: white;
    }
    .top { display: flex; justify-content: space-between; align-items: center; }
    .brand { font-size: 1.75rem; font-weight: 800; letter-spacing: -0.02em; }
    .actions { display: flex; gap: 12px; align-items: center; }
    .link { color: white; font-weight: 600; }
    .content {
      max-width: 720px;
      margin-top: clamp(64px, 18vh, 160px);
    }
    h1 {
      margin: 0 0 16px;
      font-size: clamp(2.2rem, 5vw, 3.6rem);
      line-height: 1.1;
      letter-spacing: -0.03em;
    }
    p { margin: 0 0 28px; font-size: 1.1rem; color: rgba(255,255,255,0.88); max-width: 560px; }
    .cta-row { display: flex; flex-wrap: wrap; gap: 12px; }
    .cta, .ghost {
      display: inline-flex;
      align-items: center;
      padding: 12px 18px;
      border-radius: 10px;
      font-weight: 700;
    }
    .cta { background: #14b8a6; color: #0f172a; }
    .ghost { border: 1px solid rgba(255,255,255,0.45); color: white; }
  `],
})
export class LandingComponent { }
