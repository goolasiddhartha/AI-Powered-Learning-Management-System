import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { ToastService } from '../../../core/services/toast.service';
import { Course } from '../../../core/models';
import { CourseCardComponent } from '../../../shared/components/course-card/course-card.component';

@Component({
  selector: 'app-instructor-courses',
  imports: [RouterLink, CourseCardComponent],
  template: `
    <section class="page">
      <div class="header">
        <div>
          <h1>My Courses</h1>
          <p class="muted">Create, edit, and publish your courses.</p>
        </div>
        <a routerLink="/instructor/courses/create" class="btn primary">+ Create Course</a>
      </div>

      @if (loading()) {
        <p class="muted">Loading courses…</p>
      } @else if (!courses().length) {
        <div class="empty">
          <h2>No courses yet</h2>
          <p>Create your first course to start adding lessons.</p>
          <a routerLink="/instructor/courses/create" class="btn primary">Create Course</a>
        </div>
      } @else {
        <div class="grid">
          @for (course of courses(); track course.id) {
            <div class="item">
              <app-course-card [course]="course" [link]="'/instructor/courses/' + course.id + '/lessons'" />
              <div class="row">
                <span class="badge">{{ course.status }}</span>
                <span class="meta">{{ course.lessonCount || 0 }} lessons</span>
                <a [routerLink]="['/instructor/courses', course.id, 'edit']">Edit</a>
                <a [routerLink]="['/instructor/courses', course.id, 'lessons']">Lessons</a>
                @if (course.status !== 'PUBLISHED') {
                  <button (click)="publish(course)">Publish</button>
                }
                <button class="danger" (click)="remove(course)">Delete</button>
              </div>
            </div>
          }
        </div>
      }
    </section>
  `,
  styles: [`
    .header { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; margin-bottom: 24px; }
    h1 { margin: 0 0 4px; font-size: 1.75rem; }
    .muted { color: var(--color-neutral-500); margin: 0; }
    .btn.primary {
      background: var(--color-primary-600); color: white; padding: 10px 14px;
      border-radius: var(--radius-md); font-weight: 600; text-decoration: none;
    }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    .row {
      display: flex; flex-wrap: wrap; gap: 10px; align-items: center;
      padding: 10px 4px 0; font-size: 0.8125rem;
    }
    .badge {
      background: var(--color-neutral-100); color: var(--color-neutral-700);
      padding: 2px 8px; border-radius: 999px; font-weight: 600;
    }
    .meta { color: var(--color-neutral-500); }
    a, button { color: var(--color-primary-700); font-weight: 600; background: none; border: none; cursor: pointer; padding: 0; }
    button.danger { color: var(--color-error-600); }
    .empty {
      border: 1px dashed var(--color-neutral-300); border-radius: var(--radius-lg);
      padding: 40px; text-align: center; background: white;
    }
  `],
})
export class InstructorCoursesComponent implements OnInit {
  private courseService = inject(CourseService);
  private toast = inject(ToastService);

  courses = signal<Course[]>([]);
  loading = signal(true);

  async ngOnInit(): Promise<void> {
    await this.reload();
  }

  async reload(): Promise<void> {
    this.loading.set(true);
    try {
      this.courses.set(await this.courseService.list({ mine: true }));
    } catch {
      this.toast.error('Failed to load courses');
    } finally {
      this.loading.set(false);
    }
  }

  async publish(course: Course): Promise<void> {
    try {
      await this.courseService.publish(course.id);
      this.toast.success('Course published');
      await this.reload();
    } catch (err: unknown) {
      const message = (err as { error?: { message?: string } })?.error?.message ?? 'Publish failed';
      this.toast.error(message);
    }
  }

  async remove(course: Course): Promise<void> {
    if (!confirm(`Delete "${course.title}"?`)) return;
    try {
      await this.courseService.delete(course.id);
      this.toast.success('Course deleted');
      await this.reload();
    } catch {
      this.toast.error('Delete failed');
    }
  }
}
