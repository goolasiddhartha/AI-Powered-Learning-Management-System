import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CourseService } from '../../../core/services/course.service';
import { Course } from '../../../core/models';

@Component({
  selector: 'app-instructor-dashboard',
  imports: [RouterLink],
  template: `
    <section class="page">
      <h1>Welcome, {{ auth.fullName() }}</h1>
      <p class="muted">Manage your courses and grow your teaching presence.</p>

      <div class="stats">
        <div class="stat"><span class="value">{{ total() }}</span><span class="label">Total courses</span></div>
        <div class="stat"><span class="value">{{ published() }}</span><span class="label">Published</span></div>
        <div class="stat"><span class="value">{{ drafts() }}</span><span class="label">Drafts</span></div>
        <div class="stat"><span class="value">{{ lessons() }}</span><span class="label">Lessons</span></div>
      </div>

      <div class="actions">
        <a routerLink="/instructor/courses/create" class="btn primary">Create Course</a>
        <a routerLink="/instructor/courses" class="btn ghost">My Courses</a>
      </div>

      <h2>Recent courses</h2>
      @if (!recent().length) {
        <p class="muted">No courses yet. Create your first one.</p>
      } @else {
        <div class="list">
          @for (course of recent(); track course.id) {
            <a class="row" [routerLink]="['/instructor/courses', course.id, 'lessons']">
              <div>
                <strong>{{ course.title }}</strong>
                <div class="meta">{{ course.status }} · {{ course.lessonCount || 0 }} lessons</div>
              </div>
              <span>Open →</span>
            </a>
          }
        </div>
      }
    </section>
  `,
  styles: [`
    h1 { margin: 0 0 4px; font-size: 1.75rem; }
    h2 { margin: 28px 0 12px; font-size: 1.15rem; }
    .muted { color: var(--color-neutral-500); margin: 0 0 20px; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
    .stat {
      background: white; border: 1px solid var(--color-neutral-200); border-radius: var(--radius-lg);
      padding: 16px;
    }
    .value { display: block; font-size: 1.75rem; font-weight: 800; color: var(--color-primary-700); }
    .label { color: var(--color-neutral-500); font-size: 0.8125rem; }
    .actions { display: flex; gap: 10px; margin-bottom: 8px; }
    .btn { padding: 10px 14px; border-radius: var(--radius-md); font-weight: 600; text-decoration: none; }
    .btn.primary { background: var(--color-primary-600); color: white; }
    .btn.ghost { background: var(--color-neutral-100); color: var(--color-neutral-700); }
    .list { display: grid; gap: 8px; }
    .row {
      display: flex; justify-content: space-between; align-items: center;
      background: white; border: 1px solid var(--color-neutral-200); border-radius: var(--radius-md);
      padding: 14px 16px; color: inherit; text-decoration: none;
    }
    .meta { color: var(--color-neutral-500); font-size: 0.8125rem; margin-top: 2px; }
    @media (max-width: 800px) { .stats { grid-template-columns: 1fr 1fr; } }
  `],
})
export class InstructorDashboardComponent implements OnInit {
  auth = inject(AuthService);
  private coursesApi = inject(CourseService);

  recent = signal<Course[]>([]);
  total = signal(0);
  published = signal(0);
  drafts = signal(0);
  lessons = signal(0);

  async ngOnInit(): Promise<void> {
    const courses = await this.coursesApi.list({ mine: true });
    this.recent.set(courses.slice(0, 5));
    this.total.set(courses.length);
    this.published.set(courses.filter((c) => c.status === 'PUBLISHED').length);
    this.drafts.set(courses.filter((c) => c.status === 'DRAFT').length);
    this.lessons.set(courses.reduce((sum, c) => sum + (c.lessonCount || 0), 0));
  }
}
