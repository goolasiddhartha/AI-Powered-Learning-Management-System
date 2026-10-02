import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { ToastService } from '../../../core/services/toast.service';
import { CourseDifficulty } from '../../../core/models';

@Component({
  selector: 'app-course-form',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="page">
      <div class="header">
        <div>
          <a routerLink="/instructor/courses" class="back">← My Courses</a>
          <h1>{{ isEdit() ? 'Edit Course' : 'Create Course' }}</h1>
          <p class="muted">Fill in the course details. You can add lessons after saving.</p>
        </div>
      </div>

      <form class="card" [formGroup]="form" (ngSubmit)="submit()">
        <label>
          Title
          <input formControlName="title" placeholder="e.g. Python Programming Fundamentals" />
        </label>

        <label>
          Short description
          <input formControlName="shortDescription" placeholder="One-line summary for course cards" />
        </label>

        <label>
          Full description
          <textarea formControlName="description" rows="5" placeholder="What will students learn?"></textarea>
        </label>

        <div class="grid">
          <label>
            Category
            <input formControlName="category" placeholder="Programming" />
          </label>
          <label>
            Difficulty
            <select formControlName="difficulty">
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </label>
          <label>
            Duration
            <input formControlName="duration" placeholder="6 weeks" />
          </label>
          <label>
            Language
            <input formControlName="language" />
          </label>
        </div>

        <label>
          Thumbnail URL (optional)
          <input formControlName="thumbnail" placeholder="https://..." />
        </label>

        <label>
          Learning objectives (one per line)
          <textarea formControlName="learningObjectivesText" rows="4" placeholder="Understand variables&#10;Write functions"></textarea>
        </label>

        <label>
          Prerequisites (one per line)
          <textarea formControlName="prerequisitesText" rows="3" placeholder="Basic computer skills"></textarea>
        </label>

        @if (error()) {
          <p class="error">{{ error() }}</p>
        }

        <div class="actions">
          <button type="submit" class="btn primary" [disabled]="form.invalid || saving()">
            {{ saving() ? 'Saving…' : isEdit() ? 'Save changes' : 'Create course' }}
          </button>
          <a routerLink="/instructor/courses" class="btn ghost">Cancel</a>
        </div>
      </form>
    </section>
  `,
  styles: [`
    .page { max-width: 820px; }
    .back { color: var(--color-primary-700); font-weight: 600; font-size: 0.875rem; }
    h1 { margin: 8px 0 4px; font-size: 1.75rem; }
    .muted { color: var(--color-neutral-500); margin: 0 0 20px; }
    .card {
      background: white;
      border: 1px solid var(--color-neutral-200);
      border-radius: var(--radius-lg);
      padding: 24px;
      display: grid;
      gap: 14px;
    }
    label { display: grid; gap: 6px; font-size: 0.875rem; font-weight: 600; color: var(--color-neutral-700); }
    input, textarea, select {
      padding: 10px 12px;
      border: 1px solid var(--color-neutral-300);
      border-radius: var(--radius-md);
      font: inherit;
      font-weight: 400;
    }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .actions { display: flex; gap: 10px; margin-top: 8px; }
    .btn {
      display: inline-flex; align-items: center; justify-content: center;
      padding: 10px 16px; border-radius: var(--radius-md); font-weight: 600; border: none; cursor: pointer;
    }
    .btn.primary { background: var(--color-primary-600); color: white; }
    .btn.primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn.ghost { background: var(--color-neutral-100); color: var(--color-neutral-700); }
    .error { color: var(--color-error-600); margin: 0; }
    @media (max-width: 700px) { .grid { grid-template-columns: 1fr; } }
  `],
})
export class CourseFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private courses = inject(CourseService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEdit = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  private courseId: string | null = null;

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    shortDescription: [''],
    description: [''],
    category: [''],
    difficulty: ['BEGINNER' as CourseDifficulty, Validators.required],
    duration: [''],
    language: ['English'],
    thumbnail: [''],
    learningObjectivesText: [''],
    prerequisitesText: [''],
  });

  async ngOnInit(): Promise<void> {
    this.courseId = this.route.snapshot.paramMap.get('id');
    this.isEdit.set(!!this.courseId && this.router.url.includes('/edit'));
    if (this.isEdit() && this.courseId) {
      try {
        const course = await this.courses.get(this.courseId);
        this.form.patchValue({
          title: course.title,
          shortDescription: course.shortDescription,
          description: course.description,
          category: course.category,
          difficulty: course.difficulty,
          duration: course.duration,
          language: course.language,
          thumbnail: course.thumbnail,
          learningObjectivesText: (course.learningObjectives || []).join('\n'),
          prerequisitesText: (course.prerequisites || []).join('\n'),
        });
      } catch {
        this.error.set('Could not load course');
      }
    }
  }

  async submit(): Promise<void> {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set(null);
    const raw = this.form.getRawValue();
    const payload = {
      title: raw.title.trim(),
      shortDescription: raw.shortDescription.trim(),
      description: raw.description.trim(),
      category: raw.category.trim(),
      difficulty: raw.difficulty,
      duration: raw.duration.trim(),
      language: raw.language.trim() || 'English',
      thumbnail: raw.thumbnail.trim(),
      learningObjectives: this.splitLines(raw.learningObjectivesText),
      prerequisites: this.splitLines(raw.prerequisitesText),
    };

    try {
      if (this.isEdit() && this.courseId) {
        await this.courses.update(this.courseId, payload);
        this.toast.success('Course updated');
        await this.router.navigateByUrl(`/instructor/courses/${this.courseId}/lessons`);
      } else {
        const created = await this.courses.create(payload);
        this.toast.success('Course created as draft');
        await this.router.navigateByUrl(`/instructor/courses/${created.id}/lessons`);
      }
    } catch (err: unknown) {
      const message = (err as { error?: { message?: string } })?.error?.message ?? 'Save failed';
      this.error.set(message);
      this.toast.error(message);
    } finally {
      this.saving.set(false);
    }
  }

  private splitLines(value: string): string[] {
    return value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  }
}
