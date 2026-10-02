import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { ToastService } from '../../../core/services/toast.service';
import { Course, Lesson } from '../../../core/models';

@Component({
  selector: 'app-lessons',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="page">
      <a routerLink="/instructor/courses" class="back">← My Courses</a>
      <div class="header">
        <div>
          <h1>{{ course()?.title || 'Lessons' }}</h1>
          <p class="muted">Add and order lessons, then publish the course.</p>
        </div>
        <div class="actions">
          <a [routerLink]="['/instructor/courses', courseId, 'edit']" class="btn ghost">Edit course</a>
          @if (course()?.status !== 'PUBLISHED') {
            <button class="btn primary" (click)="publish()">Publish course</button>
          } @else {
            <span class="badge">PUBLISHED</span>
          }
        </div>
      </div>

      <div class="layout">
        <div class="card">
          <h2>Curriculum</h2>
          @if (!lessons().length) {
            <p class="muted">No lessons yet. Add the first one on the right.</p>
          } @else {
            <ol class="list">
              @for (lesson of lessons(); track lesson.id) {
                <li>
                  <div>
                    <strong>{{ lesson.order }}. {{ lesson.title }}</strong>
                    <div class="meta">
                      {{ lesson.estimatedMinutes }} min
                      · {{ lesson.isPublished ? 'Published' : 'Draft' }}
                    </div>
                  </div>
                  <button class="danger" (click)="remove(lesson)">Delete</button>
                </li>
              }
            </ol>
          }
        </div>

        <form class="card" [formGroup]="form" (ngSubmit)="addLesson()">
          <h2>Add lesson</h2>
          <label>
            Title
            <input formControlName="title" />
          </label>
          <label>
            Order
            <input type="number" formControlName="order" min="1" />
          </label>
          <label>
            Estimated minutes
            <input type="number" formControlName="estimatedMinutes" min="1" />
          </label>
          <label>
            Description
            <textarea formControlName="description" rows="2"></textarea>
          </label>
          <label>
            Content
            <textarea formControlName="content" rows="6" placeholder="Lesson text, examples, notes..."></textarea>
          </label>
          <label>
            Video URL (optional)
            <input formControlName="videoUrl" />
          </label>
          <label class="check">
            <input type="checkbox" formControlName="isPublished" />
            Publish this lesson
          </label>
          <button class="btn primary" type="submit" [disabled]="form.invalid || saving()">
            {{ saving() ? 'Adding…' : 'Add lesson' }}
          </button>
        </form>
      </div>
    </section>
  `,
  styles: [`
    .page { max-width: 1100px; }
    .back { color: var(--color-primary-700); font-weight: 600; font-size: 0.875rem; }
    .header { display: flex; justify-content: space-between; gap: 16px; margin: 8px 0 20px; }
    h1 { margin: 0 0 4px; font-size: 1.75rem; }
    h2 { margin: 0 0 12px; font-size: 1.1rem; }
    .muted { color: var(--color-neutral-500); margin: 0; }
    .actions { display: flex; gap: 8px; align-items: center; }
    .layout { display: grid; grid-template-columns: 1.2fr 1fr; gap: 16px; }
    .card {
      background: white; border: 1px solid var(--color-neutral-200);
      border-radius: var(--radius-lg); padding: 20px; display: grid; gap: 12px; align-content: start;
    }
    .list { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
    .list li {
      display: flex; justify-content: space-between; gap: 12px; align-items: center;
      padding: 12px; border: 1px solid var(--color-neutral-200); border-radius: var(--radius-md);
    }
    .meta { color: var(--color-neutral-500); font-size: 0.8125rem; margin-top: 2px; }
    label { display: grid; gap: 6px; font-size: 0.875rem; font-weight: 600; }
    label.check { display: flex; align-items: center; gap: 8px; font-weight: 500; }
    input, textarea {
      padding: 10px 12px; border: 1px solid var(--color-neutral-300);
      border-radius: var(--radius-md); font: inherit; font-weight: 400;
    }
    .btn {
      display: inline-flex; align-items: center; justify-content: center;
      padding: 10px 14px; border-radius: var(--radius-md); font-weight: 600; border: none; cursor: pointer;
    }
    .btn.primary { background: var(--color-primary-600); color: white; }
    .btn.ghost { background: var(--color-neutral-100); color: var(--color-neutral-700); text-decoration: none; }
    .badge { background: var(--color-success-100); color: var(--color-success-700); padding: 4px 10px; border-radius: 999px; font-weight: 700; font-size: 0.75rem; }
    .danger { background: none; border: none; color: var(--color-error-600); font-weight: 600; cursor: pointer; }
    @media (max-width: 900px) { .layout, .header { grid-template-columns: 1fr; display: grid; } }
  `],
})
export class LessonsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private courses = inject(CourseService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  courseId = '';
  course = signal<Course | null>(null);
  lessons = signal<Lesson[]>([]);
  saving = signal(false);

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    order: [1, [Validators.required, Validators.min(1)]],
    content: [''],
    videoUrl: [''],
    estimatedMinutes: [15, [Validators.required, Validators.min(1)]],
    isPublished: [true],
  });

  async ngOnInit(): Promise<void> {
    this.courseId = this.route.snapshot.paramMap.get('id') || '';
    await this.reload();
  }

  async reload(): Promise<void> {
    try {
      this.course.set(await this.courses.get(this.courseId));
      const lessons = await this.courses.listLessons(this.courseId);
      this.lessons.set(lessons);
      this.form.patchValue({ order: lessons.length + 1 });
    } catch {
      this.toast.error('Failed to load lessons');
    }
  }

  async addLesson(): Promise<void> {
    if (this.form.invalid) return;
    this.saving.set(true);
    try {
      const raw = this.form.getRawValue();
      await this.courses.createLesson(this.courseId, {
        ...raw,
        resources: [],
      });
      this.toast.success('Lesson added');
      this.form.reset({
        title: '',
        description: '',
        order: this.lessons().length + 2,
        content: '',
        videoUrl: '',
        estimatedMinutes: 15,
        isPublished: true,
      });
      await this.reload();
    } catch (err: unknown) {
      const message = (err as { error?: { message?: string } })?.error?.message ?? 'Could not add lesson';
      this.toast.error(message);
    } finally {
      this.saving.set(false);
    }
  }

  async remove(lesson: Lesson): Promise<void> {
    if (!confirm(`Delete lesson "${lesson.title}"?`)) return;
    try {
      await this.courses.deleteLesson(lesson.id);
      this.toast.success('Lesson deleted');
      await this.reload();
    } catch {
      this.toast.error('Delete failed');
    }
  }

  async publish(): Promise<void> {
    try {
      await this.courses.publish(this.courseId);
      this.toast.success('Course published');
      await this.reload();
    } catch (err: unknown) {
      const message = (err as { error?: { message?: string } })?.error?.message ?? 'Publish failed';
      this.toast.error(message);
    }
  }
}
