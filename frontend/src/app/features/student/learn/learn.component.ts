import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { LmsService } from '../../../core/services/lms.service';
import { ToastService } from '../../../core/services/toast.service';
import { Lesson } from '../../../core/models';

@Component({
  selector: 'app-learn',
  imports: [RouterLink],
  template: `
    <section class="page">
      <a [routerLink]="['/student/courses', courseId]" class="back">← Course</a>
      <div class="layout">
        <aside class="card">
          <h2>Lessons</h2>
          @if (progressPercentage() !== null) {
            <p class="course-progress">{{ completedCount() }} of {{ lessons().length }} complete · {{ progressPercentage() }}%</p>
            <div class="progress-track" role="progressbar" [attr.aria-valuenow]="progressPercentage()" aria-valuemin="0" aria-valuemax="100">
              <div class="progress-fill" [style.width.%]="progressPercentage()"></div>
            </div>
          }
          <ol>
            @for (lesson of lessons(); track lesson.id) {
              <li>
                <button
                  type="button"
                  [class.active]="lesson.id === current()?.id"
                  (click)="openLesson(lesson.id)"
                >
                  {{ lesson.order }}. {{ lesson.title }}
                  <span class="lesson-status">{{ isCompleted(lesson.id) ? 'Completed' : '' }}</span>
                </button>
              </li>
            }
          </ol>
        </aside>

        <article class="card content">
          @if (loading()) {
            <p class="muted">Loading lesson…</p>
          } @else if (current(); as lesson) {
            <h1>{{ lesson.title }}</h1>
            <p class="muted">{{ lesson.estimatedMinutes }} min · {{ lesson.description }}</p>
            @if (lesson.videoUrl) {
              <p><a [href]="lesson.videoUrl" target="_blank" rel="noopener">Open video</a></p>
            }
            <div class="body">{{ lesson.content }}</div>
            @if (isCompleted(lesson.id)) {
              <p class="completed-message" role="status">Lesson completed.</p>
            }
            <div class="nav">
              <button class="btn ghost" type="button" [disabled]="!previousId()" (click)="openLesson(previousId()!)">
                Previous
              </button>
              <button class="btn primary" type="button" (click)="complete()" [disabled]="completing() || isCompleted(lesson.id)">
                {{ completing() ? 'Saving…' : isCompleted(lesson.id) ? 'Completed' : 'Mark complete' }}
              </button>
              <button class="btn ghost" type="button" [disabled]="!nextId()" (click)="openLesson(nextId()!)">
                Next
              </button>
            </div>
          } @else {
            <p class="muted">No lessons available. Enroll and ensure the course has published lessons.</p>
          }
        </article>
      </div>
    </section>
  `,
  styles: [`
    .back { color: var(--color-primary-700); font-weight: 600; font-size: 0.875rem; }
    .layout { display: grid; grid-template-columns: 280px 1fr; gap: 16px; margin-top: 12px; }
    .card { background: white; border: 1px solid var(--color-neutral-200); border-radius: 12px; padding: 16px; }
    h1 { margin: 0 0 8px; font-size: 1.6rem; }
    h2 { margin: 0 0 12px; font-size: 1rem; }
    .muted { color: var(--color-neutral-500); }
    .course-progress { margin: 0 0 6px; color: var(--color-neutral-600); font-size: 0.8rem; }
    .progress-track { height: 6px; margin-bottom: 12px; background: var(--color-neutral-100); border-radius: 999px; overflow: hidden; }
    .progress-fill { height: 100%; background: var(--color-primary-600); }
    ol { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
    button.active { background: var(--color-primary-50); color: var(--color-primary-800); font-weight: 700; }
    aside button {
      width: 100%; text-align: left; border: none; background: transparent; padding: 10px;
      border-radius: 8px; cursor: pointer; font: inherit;
    }
    .lesson-status { display: block; min-height: 1em; color: var(--color-success-700); font-size: 0.7rem; font-weight: 700; }
    .completed-message { color: var(--color-success-700); font-weight: 700; }
    .body { white-space: pre-wrap; line-height: 1.6; margin: 16px 0 24px; }
    .nav { display: flex; gap: 8px; flex-wrap: wrap; }
    .btn { border: none; border-radius: 8px; padding: 10px 14px; font-weight: 700; cursor: pointer; }
    .btn.primary { background: var(--color-primary-600); color: white; }
    .btn.ghost { background: var(--color-neutral-100); color: var(--color-neutral-700); }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    @media (max-width: 900px) { .layout { grid-template-columns: 1fr; } }
  `],
})
export class LearnComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private courses = inject(CourseService);
  private lms = inject(LmsService);
  private toast = inject(ToastService);

  courseId = '';
  lessons = signal<Lesson[]>([]);
  current = signal<Lesson | null>(null);
  previousId = signal<string | null>(null);
  nextId = signal<string | null>(null);
  loading = signal(true);
  completing = signal(false);
  private completedLessons = signal<Record<string, boolean>>({});
  progressPercentage = signal<number | null>(null);
  private progressLoadAttempted = false;

  completedCount(): number {
    return Object.values(this.completedLessons()).filter(Boolean).length;
  }

  isCompleted(lessonId: string): boolean {
    return this.completedLessons()[lessonId] ?? false;
  }

  async ngOnInit(): Promise<void> {
    this.courseId = this.route.snapshot.paramMap.get('id') || '';
    try {
      const lessons = await this.courses.listLessons(this.courseId);
      this.lessons.set(lessons);
      const preferred =
        this.route.snapshot.queryParamMap.get('lessonId') || lessons[0]?.id || null;
      if (preferred) {
        await this.openLesson(preferred);
      } else {
        this.loading.set(false);
      }
    } catch (err: unknown) {
      const message = (err as { error?: { message?: string } })?.error?.message ?? 'Unable to load lessons';
      this.toast.error(message);
      this.loading.set(false);
    }
  }

  async openLesson(lessonId: string): Promise<void> {
    this.loading.set(true);
    try {
      const data = await this.lms.accessLesson(lessonId);
      this.current.set(data.lesson);
      this.completedLessons.update((completed) => ({
        ...completed,
        [lessonId]: data.progress.isCompleted,
      }));
      this.previousId.set(data.previousLessonId);
      this.nextId.set(data.nextLessonId);
      if (!this.progressLoadAttempted) {
        this.progressLoadAttempted = true;
        try {
          const progress = await this.lms.courseProgress(this.courseId);
          this.progressPercentage.set(progress.progressPercentage);
          this.completedLessons.set(
            Object.fromEntries(progress.lessons.map((item) => [item.lessonId, item.isCompleted]))
          );
        } catch {
          this.toast.error('Lesson loaded, but course progress could not be retrieved');
        }
      }
      await this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { lessonId },
        replaceUrl: true,
      });
    } catch (err: unknown) {
      const message = (err as { error?: { message?: string } })?.error?.message ?? 'Enroll in this course first';
      this.toast.error(message);
    } finally {
      this.loading.set(false);
    }
  }

  async complete(): Promise<void> {
    const lesson = this.current();
    if (!lesson) return;
    this.completing.set(true);
    try {
      const progress = await this.lms.completeLesson(lesson.id);
      this.completedLessons.set(
        Object.fromEntries(progress.lessons.map((item) => [item.lessonId, item.isCompleted]))
      );
      this.progressPercentage.set(progress.progressPercentage);
      this.progressLoadAttempted = true;
      this.toast.success('Lesson marked complete');
      if (this.nextId()) {
        await this.openLesson(this.nextId()!);
      }
    } catch {
      this.toast.error('Could not update progress');
    } finally {
      this.completing.set(false);
    }
  }
}
