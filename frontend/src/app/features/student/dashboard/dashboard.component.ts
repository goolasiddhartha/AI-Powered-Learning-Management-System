import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LmsService, ProgressSummary, RecommendationsData } from '../../../core/services/lms.service';

@Component({
  selector: 'app-student-dashboard',
  imports: [RouterLink],
  template: `
    <section class="page">
      <h1>Welcome, {{ auth.fullName() }}</h1>
      <p class="muted">Continue learning and get AI-guided next steps.</p>

      <div class="stats">
        <div class="stat"><span class="value">{{ summary()?.enrolledCourses || 0 }}</span><span class="label">Enrolled</span></div>
        <div class="stat"><span class="value">{{ summary()?.overallProgress || 0 }}%</span><span class="label">Overall progress</span></div>
        <div class="stat"><span class="value">{{ summary()?.totalLessonsCompleted || 0 }}</span><span class="label">Lessons done</span></div>
      </div>

      <div class="actions">
        <a routerLink="/student/courses" class="btn primary">Browse Courses</a>
        <a routerLink="/student/progress" class="btn ghost">My Progress</a>
        <a routerLink="/student/ai-tutor" class="btn ghost">AI Tutor</a>
      </div>

      @if (recs()?.summary) {
        <div class="card">
          <h2>AI Recommendation</h2>
          <p>{{ recs()?.summary }}</p>
          <a routerLink="/student/recommendations" class="link">View all →</a>
        </div>
      }

      <h2>Continue learning</h2>
      @if (!(summary()?.courses?.length)) {
        <p class="muted">Enroll in a published course to see progress here.</p>
      } @else {
        <div class="list">
          @for (course of summary()!.courses; track course.courseId) {
            <a class="row" [routerLink]="['/student/courses', course.courseId, 'learn']">
              <div>
                <strong>{{ course.courseTitle }}</strong>
                <div class="meta">{{ course.progressPercentage }}% complete</div>
              </div>
              <span>Continue →</span>
            </a>
          }
        </div>
      }
    </section>
  `,
  styles: [`
    h1 { margin: 0 0 4px; font-size: 1.75rem; }
    h2 { margin: 24px 0 12px; font-size: 1.15rem; }
    .muted { color: var(--color-neutral-500); margin: 0 0 16px; }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
    .stat { background: white; border: 1px solid var(--color-neutral-200); border-radius: 12px; padding: 16px; }
    .value { display: block; font-size: 1.6rem; font-weight: 800; color: var(--color-primary-700); }
    .label { color: var(--color-neutral-500); font-size: 0.8rem; }
    .actions { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 8px; }
    .btn { padding: 10px 14px; border-radius: 8px; font-weight: 700; text-decoration: none; }
    .btn.primary { background: var(--color-primary-600); color: white; }
    .btn.ghost { background: var(--color-neutral-100); color: var(--color-neutral-700); }
    .card { background: white; border: 1px solid var(--color-neutral-200); border-radius: 12px; padding: 16px; margin-top: 12px; }
    .link { color: var(--color-primary-700); font-weight: 700; }
    .list { display: grid; gap: 8px; }
    .row {
      display: flex; justify-content: space-between; align-items: center;
      background: white; border: 1px solid var(--color-neutral-200); border-radius: 10px;
      padding: 14px 16px; color: inherit; text-decoration: none;
    }
    .meta { color: var(--color-neutral-500); font-size: 0.8125rem; margin-top: 2px; }
    @media (max-width: 800px) { .stats { grid-template-columns: 1fr; } }
  `],
})
export class StudentDashboardComponent implements OnInit {
  auth = inject(AuthService);
  private lms = inject(LmsService);

  summary = signal<ProgressSummary | null>(null);
  recs = signal<RecommendationsData | null>(null);

  async ngOnInit(): Promise<void> {
    try {
      this.summary.set(await this.lms.progressSummary());
    } catch {
      this.summary.set(null);
    }
    try {
      this.recs.set(await this.lms.recommendations());
    } catch {
      this.recs.set(null);
    }
  }
}
