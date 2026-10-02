import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LmsService, RecommendationsData } from '../../../core/services/lms.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-recommendations',
  imports: [RouterLink],
  template: `
    <section class="page">
      <h1>AI Recommendations</h1>
      <p class="muted">Personalized next steps based on your enrollments and progress.</p>

      @if (loading()) {
        <p class="muted">Loading recommendations…</p>
      } @else if (data(); as d) {
        <div class="summary card">
          <h2>Study plan</h2>
          <p>{{ d.summary }}</p>
          @if (!d.usedAiModel) {
            <p class="hint">Rule-based recommendations are active. Add GEMINI_API_KEY for richer AI plans.</p>
          }
        </div>

        @if (!d.items.length) {
          <div class="empty">
            <p>No recommendations yet. Enroll in a course to get started.</p>
            <a routerLink="/student/courses" class="btn">Browse Courses</a>
          </div>
        } @else {
          <div class="grid">
            @for (item of d.items; track item.title + item.type) {
              <article class="card item">
                <span class="type">{{ item.type }}</span>
                <h3>{{ item.title }}</h3>
                <p>{{ item.reason }}</p>
                @if (item.courseId && item.type === 'NEXT_LESSON') {
                  <a
                    class="link"
                    [routerLink]="['/student/courses', item.courseId, 'learn']"
                    [queryParams]="item.lessonId ? { lessonId: item.lessonId } : {}"
                  >Open →</a>
                } @else if (item.courseId) {
                  <a class="link" [routerLink]="['/student/courses', item.courseId]">Open →</a>
                } @else if (item.actionUrl) {
                  <a class="link" [routerLink]="item.actionUrl">Open →</a>
                }
              </article>
            }
          </div>
        }
      }
    </section>
  `,
  styles: [`
    h1 { margin: 0 0 4px; font-size: 1.75rem; }
    h2 { margin: 0 0 8px; font-size: 1.1rem; }
    h3 { margin: 8px 0; font-size: 1rem; }
    .muted { color: var(--color-neutral-500); margin: 0 0 16px; }
    .card { background: white; border: 1px solid var(--color-neutral-200); border-radius: 12px; padding: 18px; }
    .summary { margin-bottom: 16px; }
    .hint { color: var(--color-neutral-500); font-size: 0.8rem; margin: 10px 0 0; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
    .type {
      display: inline-block; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.04em;
      color: var(--color-primary-700); background: var(--color-primary-50); padding: 3px 8px; border-radius: 999px;
    }
    .link { color: var(--color-primary-700); font-weight: 700; }
    .empty { text-align: center; padding: 28px; border: 1px dashed var(--color-neutral-300); border-radius: 12px; background: white; }
    .btn { display: inline-block; margin-top: 12px; background: var(--color-primary-600); color: white; padding: 10px 14px; border-radius: 8px; font-weight: 700; }
  `],
})
export class RecommendationsComponent implements OnInit {
  private lms = inject(LmsService);
  private toast = inject(ToastService);

  data = signal<RecommendationsData | null>(null);
  loading = signal(true);

  async ngOnInit(): Promise<void> {
    try {
      this.data.set(await this.lms.recommendations());
    } catch {
      this.toast.error('Could not load recommendations');
    } finally {
      this.loading.set(false);
    }
  }
}
