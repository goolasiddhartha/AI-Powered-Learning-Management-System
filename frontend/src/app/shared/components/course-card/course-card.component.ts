import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Course, Enrollment } from '../../../core/models';
import { TruncatePipe } from '../../pipes/truncate.pipe';

@Component({
  selector: 'app-course-card',
  imports: [RouterLink, TruncatePipe],
  template: `
    <a [routerLink]="link" class="course-card">
      <div class="course-thumb" [style.background]="gradient">
        <span class="course-difficulty badge badge-{{ difficultyClass }}">{{ course.difficulty }}</span>
      </div>
      <div class="course-info">
        <h3 class="course-title">{{ course.title }}</h3>
        <p class="course-desc">{{ (course.shortDescription || course.description) | truncate:120 }}</p>
        <div class="course-meta">
          <span class="meta-item">{{ course.instructorName || 'Instructor' }}</span>
          @if (course.enrollmentCount > 0) {
            <span class="meta-item">{{ course.enrollmentCount }} enrolled</span>
          }
        </div>
        @if (enrollment) {
          <p class="enrollment">
            {{ enrollment.status === 'COMPLETED' ? 'Completed' : enrollment.status === 'DROPPED' ? 'Dropped' : 'Enrolled' }}
            · {{ enrollment.progressPercentage }}% complete
          </p>
        }
        @if (showProgress && progress >= 0) {
          <div class="course-progress">
            <div class="progress-bar">
              <div class="progress-bar-fill" [class.success]="progress >= 100" [style.width.%]="progress"></div>
            </div>
            <span class="progress-text">{{ progress }}% complete</span>
          </div>
        }
      </div>
    </a>
  `,
  styles: [`
    .course-card {
      display: block;
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--color-neutral-200);
      overflow: hidden;
      transition: box-shadow 0.2s, transform 0.2s;
      height: 100%;
      color: inherit;
      text-decoration: none;
    }
    .course-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-2px); }
    .course-thumb {
      height: 140px;
      display: flex;
      align-items: flex-start;
      justify-content: flex-end;
      padding: 12px;
    }
    .course-info { padding: 16px; }
    .course-title { margin: 0 0 8px; font-size: 1rem; }
    .course-desc { margin: 0 0 12px; color: var(--color-neutral-500); font-size: 0.875rem; }
    .course-meta { display: flex; gap: 12px; font-size: 0.75rem; color: var(--color-neutral-500); }
    .enrollment { margin: 10px 0 0; color: var(--color-success-700); font-size: 0.8rem; font-weight: 700; }
    .course-progress { margin-top: 12px; }
    .progress-bar { height: 6px; background: var(--color-neutral-100); border-radius: 999px; overflow: hidden; }
    .progress-bar-fill { height: 100%; background: var(--color-primary-600); }
    .progress-bar-fill.success { background: var(--color-success-600); }
    .progress-text { font-size: 0.75rem; color: var(--color-neutral-500); }
  `],
})
export class CourseCardComponent {
  @Input({ required: true }) course!: Course;
  @Input() link = '/';
  @Input() showProgress = false;
  @Input() progress = 0;
  @Input() enrollment?: Enrollment;

  get difficultyClass(): string {
    return this.course.difficulty.toLowerCase();
  }

  get gradient(): string {
    const map: Record<string, string> = {
      BEGINNER: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
      INTERMEDIATE: 'linear-gradient(135deg, #ccfbf1, #99f6e4)',
      ADVANCED: 'linear-gradient(135deg, #fef3c7, #fde68a)',
    };
    return map[this.course.difficulty] ?? map['BEGINNER'];
  }
}
