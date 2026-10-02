import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LmsService, ProgressSummary } from '../../../core/services/lms.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-progress',
  imports: [RouterLink],
  template: `
    <section class="page">
      <h1>My Progress</h1>
      <p class="muted">Track completion across your enrolled courses.</p>

      @if (loading()) {
        <p class="muted">Loading progress…</p>
      } @else if (summary(); as s) {
        <div class="stats">
          <div class="stat"><span class="value">{{ s.enrolledCourses }}</span><span class="label">Enrolled</span></div>
          <div class="stat"><span class="value">{{ s.completedCourses }}</span><span class="label">Completed</span></div>
          <div class="stat"><span class="value">{{ s.totalLessonsCompleted }}</span><span class="label">Lessons done</span></div>
          <div class="stat"><span class="value">{{ s.overallProgress }}%</span><span class="label">Overall</span></div>
        </div>

        @if (!s.courses.length) {
          <div class="empty">
            <h2>No enrollments yet</h2>
            <p>Browse a published course and enroll to start tracking progress.</p>
            <a routerLink="/student/courses" class="btn">Browse Courses</a>
          </div>
        } @else {
          <div class="list">
            @for (course of s.courses; track course.courseId) {
              <article class="card">
                <div class="top">
                  <div>
                    <h2>{{ course.courseTitle }}</h2>
                    <p class="meta">
                      {{ course.completedLessons }}/{{ course.totalLessons }} lessons · {{ course.enrollmentStatus }}
                    </p>
                  </div>
                  <strong>{{ course.progressPercentage }}%</strong>
                </div>
                <div class="bar"><div class="fill" [style.width.%]="course.progressPercentage"></div></div>
                <ul>
                  @for (lesson of course.lessons; track lesson.lessonId) {
                    <li [class.done]="lesson.isCompleted">
                      <span>{{ lesson.lessonOrder }}. {{ lesson.lessonTitle }}</span>
                      <span>{{ lesson.isCompleted ? 'Completed' : 'Not started' }}</span>
                    </li>
                  }
                </ul>
                <a class="link" [routerLink]="['/student/courses', course.courseId, 'learn']">Continue learning →</a>
              </article>
            }
          </div>
        }
      }
    </section>
  `,
  styles: [`
    h1 { margin: 0 0 4px; font-size: 1.75rem; }
    h2 { margin: 0; font-size: 1.1rem; }
    .muted { color: var(--color-neutral-500); margin: 0 0 20px; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
    .stat { background: white; border: 1px solid var(--color-neutral-200); border-radius: 12px; padding: 16px; }
    .value { display: block; font-size: 1.6rem; font-weight: 800; color: var(--color-primary-700); }
    .label { color: var(--color-neutral-500); font-size: 0.8rem; }
    .list { display: grid; gap: 14px; }
    .card { background: white; border: 1px solid var(--color-neutral-200); border-radius: 12px; padding: 18px; }
    .top { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
    .meta { margin: 4px 0 0; color: var(--color-neutral-500); font-size: 0.85rem; }
    .bar { height: 8px; background: var(--color-neutral-100); border-radius: 999px; overflow: hidden; margin-bottom: 12px; }
    .fill { height: 100%; background: var(--color-primary-600); }
    ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
    li { display: flex; justify-content: space-between; gap: 8px; padding: 8px 10px; border-radius: 8px; background: var(--color-neutral-50); font-size: 0.875rem; }
    li.done { color: var(--color-success-700); }
    .link { display: inline-block; margin-top: 12px; color: var(--color-primary-700); font-weight: 700; }
    .empty { background: white; border: 1px dashed var(--color-neutral-300); border-radius: 12px; padding: 32px; text-align: center; }
    .btn { display: inline-block; margin-top: 12px; background: var(--color-primary-600); color: white; padding: 10px 14px; border-radius: 8px; font-weight: 700; }
    @media (max-width: 800px) { .stats { grid-template-columns: 1fr 1fr; } }
  `],
})
export class ProgressComponent implements OnInit {
  private lms = inject(LmsService);
  private toast = inject(ToastService);
  auth = inject(AuthService);

  summary = signal<ProgressSummary | null>(null);
  loading = signal(true);

  async ngOnInit(): Promise<void> {
    try {
      this.summary.set(await this.lms.progressSummary());
    } catch {
      this.toast.error('Could not load progress');
    } finally {
      this.loading.set(false);
    }
  }
}
