import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { CourseProgress, LmsService } from '../../../core/services/lms.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { QuizService } from '../../../core/services/quiz.service';
import { Course, Enrollment, Lesson, StudentQuiz } from '../../../core/models';

@Component({
  selector: 'app-course-detail',
  imports: [RouterLink],
  template: `
    @if (loading()) {
      <p class="muted">Loading course…</p>
    } @else if (course(); as c) {
      <section class="page">
        <a routerLink="/student/courses" class="back">← Browse Courses</a>
        <div class="hero">
          <div>
            <span class="badge">{{ c.difficulty }}</span>
            <h1>{{ c.title }}</h1>
            <p class="muted">{{ c.shortDescription || c.description }}</p>
            <div class="meta">
              <span>By {{ c.instructorName }}</span>
              <span>{{ c.duration || 'Self-paced' }}</span>
              <span>{{ lessons().length }} lessons</span>
            </div>
            <div class="actions">
              @if (enrolled()) {
                <a class="btn primary" [routerLink]="['/student/courses', c.id, 'learn']">Continue Learning</a>
                <span class="enrolled">
                  {{ enrollment()?.status === 'COMPLETED' ? 'Course completed' : enrollment()?.status === 'DROPPED' ? 'Enrollment dropped' : 'Enrolled' }}
                  · {{ progress() }}%
                </span>
              } @else {
                @if (auth.user()?.role === 'STUDENT') {
                  <button class="btn primary" (click)="enroll()" [disabled]="enrolling()">
                    {{ enrolling() ? 'Enrolling…' : 'Enroll now' }}
                  </button>
                } @else if (!auth.user()) {
                  <a class="btn primary" routerLink="/login">Sign in to enroll</a>
                } @else {
                  <span class="muted">Enrollment is available to student accounts.</span>
                }
              }
            </div>
            @if (enrolled() && courseProgress(); as progressData) {
              <div class="progress">
                <div class="progress-label">
                  <span>{{ progressData.completedLessons }} of {{ progressData.totalLessons }} lessons completed</span>
                  <strong>{{ progressData.progressPercentage }}%</strong>
                </div>
                <div class="progress-track" role="progressbar" [attr.aria-valuenow]="progressData.progressPercentage" aria-valuemin="0" aria-valuemax="100">
                  <div class="progress-fill" [style.width.%]="progressData.progressPercentage"></div>
                </div>
              </div>
            }
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <h2>About this course</h2>
            <p>{{ c.description || 'No description provided.' }}</p>
            @if (c.learningObjectives.length) {
              <h3>Learning objectives</h3>
              <ul>
                @for (item of c.learningObjectives; track item) {
                  <li>{{ item }}</li>
                }
              </ul>
            }
          </div>
          <div class="card">
            <h2>Curriculum</h2>
            @if (!lessons().length) {
              <p class="muted">No published lessons yet.</p>
            } @else {
              <ol class="lessons">
                @for (lesson of lessons(); track lesson.id) {
                  <li>
                    <div>
                      <strong>{{ lesson.order }}. {{ lesson.title }}</strong>
                      @if (lessonComplete(lesson.id)) {
                        <span class="lesson-state">Completed</span>
                      }
                    </div>
                    <span>{{ lesson.estimatedMinutes }} min</span>
                  </li>
                }
              </ol>
            }
            @if (enrolled() && availableQuizzes().length) {
              <h3 class="quiz-heading">Quizzes</h3>
              <ul class="quizzes">
                @for (quiz of availableQuizzes(); track quiz.id) {
                  <li>
                    <div>
                      <strong>{{ quiz.title }}</strong>
                      <span>{{ quiz.questions.length }} questions · {{ quiz.attemptsRemaining }} attempts remaining</span>
                    </div>
                    @if (quiz.attemptsRemaining) {
                      <a class="quiz-link" [routerLink]="['/student/quizzes', quiz.id]">Take quiz</a>
                    } @else {
                      <span class="quiz-used">Attempts used</span>
                    }
                  </li>
                }
              </ul>
            }
          </div>
        </div>
      </section>
    } @else {
      <section class="page empty" role="alert">
        <h1>Course unavailable</h1>
        <p>{{ loadError() || 'This course could not be found.' }}</p>
        <a routerLink="/student/courses" class="back">Browse Courses</a>
      </section>
    }
  `,
  styles: [`
    .back { color: var(--color-primary-700); font-weight: 600; font-size: 0.875rem; }
    .hero { margin: 12px 0 24px; }
    h1 { margin: 8px 0; font-size: 2rem; }
    h2 { margin: 0 0 12px; font-size: 1.15rem; }
    h3 { margin: 18px 0 8px; font-size: 1rem; }
    .muted { color: var(--color-neutral-500); }
    .badge {
      display: inline-block; background: var(--color-primary-50); color: var(--color-primary-700);
      padding: 4px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 700;
    }
    .meta { display: flex; flex-wrap: wrap; gap: 14px; color: var(--color-neutral-600); font-size: 0.875rem; margin-bottom: 14px; }
    .actions { display: flex; gap: 12px; align-items: center; }
    .btn.primary {
      background: var(--color-primary-600); color: white; border: none; border-radius: 8px;
      padding: 10px 16px; font-weight: 700; cursor: pointer; text-decoration: none;
    }
    .btn.primary:disabled { opacity: 0.6; }
    .enrolled { color: var(--color-success-700); font-weight: 700; font-size: 0.875rem; }
    .progress { max-width: 480px; margin-top: 18px; }
    .progress-label { display: flex; justify-content: space-between; gap: 12px; color: var(--color-neutral-600); font-size: 0.85rem; margin-bottom: 6px; }
    .progress-track { height: 8px; background: var(--color-neutral-100); border-radius: 999px; overflow: hidden; }
    .progress-fill { height: 100%; background: var(--color-primary-600); }
    .grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 16px; }
    .card { background: white; border: 1px solid var(--color-neutral-200); border-radius: 12px; padding: 20px; }
    .lessons { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
    .lessons li {
      display: flex; justify-content: space-between; gap: 12px;
      padding: 10px 12px; border: 1px solid var(--color-neutral-200); border-radius: 8px;
    }
    .lesson-state { display: block; margin-top: 4px; color: var(--color-success-700); font-size: 0.75rem; font-weight: 700; }
    .quiz-heading { margin: 20px 0 8px; font-size: 1rem; }
    .quizzes { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
    .quizzes li { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid var(--color-neutral-200); border-radius: 8px; }
    .quizzes li div { display: grid; gap: 4px; }
    .quizzes li span { color: var(--color-neutral-500); font-size: 0.8rem; }
    .quiz-link { color: var(--color-primary-700); font-weight: 700; white-space: nowrap; }
    .quizzes li .quiz-used { color: var(--color-neutral-500); font-weight: 600; white-space: nowrap; }
    .empty { max-width: 640px; margin: 24px auto; background: white; border: 1px solid var(--color-neutral-200); border-radius: 12px; padding: 28px; }
    @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
  `],
})
export class CourseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private courses = inject(CourseService);
  private lms = inject(LmsService);
  private quizService = inject(QuizService);
  private toast = inject(ToastService);
  auth = inject(AuthService);

  course = signal<Course | null>(null);
  lessons = signal<Lesson[]>([]);
  loading = signal(true);
  loadError = signal('');
  enrolled = signal(false);
  progress = signal(0);
  enrolling = signal(false);
  enrollment = signal<Enrollment | null>(null);
  courseProgress = signal<CourseProgress | null>(null);
  availableQuizzes = signal<StudentQuiz[]>([]);
  private courseId = '';

  async ngOnInit(): Promise<void> {
    this.courseId = this.route.snapshot.paramMap.get('id') || '';
    try {
      this.course.set(await this.courses.get(this.courseId));
      this.lessons.set(await this.courses.listLessons(this.courseId));
      if (this.auth.user()?.role === 'STUDENT') {
        try {
          const enrollments = await this.lms.myEnrollments();
          const mine = enrollments.find((e) => e.courseId === this.courseId);
          this.enrollment.set(mine ?? null);
          this.enrolled.set(!!mine);
          this.progress.set(mine?.progressPercentage ?? 0);
          if (mine && mine.status !== 'DROPPED') {
            try {
              const progress = await this.lms.courseProgress(this.courseId);
              this.courseProgress.set(progress);
              this.progress.set(progress.progressPercentage);
            } catch {
              this.toast.error('Course details loaded, but lesson progress could not be retrieved');
            }
            try {
              this.availableQuizzes.set(await this.quizService.listAvailable(this.courseId));
            } catch {
              this.toast.error('Course details loaded, but quizzes could not be retrieved');
            }
          }
        } catch {
          this.toast.error('Course details loaded, but enrollment status could not be retrieved');
        }
      }
    } catch (err: unknown) {
      this.loadError.set(
        (err as { error?: { message?: string } })?.error?.message ?? 'Please try again or return to the course catalog.'
      );
    } finally {
      this.loading.set(false);
    }
  }

  lessonComplete(lessonId: string): boolean {
    return !!this.courseProgress()?.lessons.find(
      (lesson) => lesson.lessonId === lessonId && lesson.isCompleted
    );
  }

  async enroll(): Promise<void> {
    this.enrolling.set(true);
    try {
      const enrollment = await this.lms.enroll(this.courseId);
      this.enrollment.set(enrollment);
      this.enrolled.set(true);
      this.progress.set(enrollment.progressPercentage);
      this.toast.success('Enrolled successfully');
      await this.router.navigate(['/student/courses', this.courseId, 'learn']);
    } catch (err: unknown) {
      const message = (err as { error?: { message?: string } })?.error?.message ?? 'Enrollment failed';
      this.toast.error(message);
    } finally {
      this.enrolling.set(false);
    }
  }
}
