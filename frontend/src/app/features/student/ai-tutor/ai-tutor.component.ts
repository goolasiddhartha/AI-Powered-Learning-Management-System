import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LmsService, TutorResponse } from '../../../core/services/lms.service';
import { ToastService } from '../../../core/services/toast.service';
import { Enrollment } from '../../../core/models';

@Component({
  selector: 'app-ai-tutor',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="page">
      <h1>AI Tutor</h1>
      <p class="muted">Ask questions about courses you are enrolled in. Answers use your course material.</p>

      @if (!enrollments().length && !loading()) {
        <div class="empty">
          <p>Enroll in a course first to unlock the AI Tutor.</p>
          <a routerLink="/student/courses" class="btn">Browse Courses</a>
        </div>
      } @else {
        <div class="layout">
          <aside class="card">
            <label>
              Course
              <select [(ngModel)]="courseId" (ngModelChange)="onCourseChange()">
                @for (item of enrollments(); track item.id) {
                  <option [value]="item.courseId">{{ item.course?.title || item.courseId }}</option>
                }
              </select>
            </label>
            <p class="hint">Only enrolled course content is searchable.</p>
          </aside>

          <div class="chat card">
            <div class="messages">
              @if (!messages().length) {
                <p class="muted">Try: “Explain this course in simple terms” or “What should I study next?”</p>
              }
              @for (msg of messages(); track $index) {
                <div class="bubble" [class.user]="msg.role === 'user'" [class.assistant]="msg.role === 'assistant'">
                  {{ msg.content }}
                </div>
              }
            </div>
            <form class="composer" (ngSubmit)="ask()">
              <input [(ngModel)]="question" name="question" placeholder="Ask your course AI anything..." />
              <button class="btn" type="submit" [disabled]="!question.trim() || asking()">Send</button>
            </form>
            @if (sources().length) {
              <p class="sources">Sources: {{ sources().join(', ') }}</p>
            }
          </div>
        </div>
      }
    </section>
  `,
  styles: [`
    h1 { margin: 0 0 4px; font-size: 1.75rem; }
    .muted { color: var(--color-neutral-500); }
    .layout { display: grid; grid-template-columns: 260px 1fr; gap: 16px; margin-top: 16px; }
    .card { background: white; border: 1px solid var(--color-neutral-200); border-radius: 12px; padding: 16px; }
    label { display: grid; gap: 6px; font-weight: 600; font-size: 0.875rem; }
    select, input { padding: 10px 12px; border: 1px solid var(--color-neutral-300); border-radius: 8px; font: inherit; }
    .hint { font-size: 0.8rem; color: var(--color-neutral-500); margin: 10px 0 0; }
    .chat { display: grid; grid-template-rows: 1fr auto auto; min-height: 480px; }
    .messages { display: grid; gap: 10px; align-content: start; overflow: auto; max-height: 420px; padding-bottom: 12px; }
    .bubble { padding: 12px 14px; border-radius: 12px; max-width: 85%; white-space: pre-wrap; line-height: 1.45; }
    .bubble.user { justify-self: end; background: var(--color-primary-600); color: white; }
    .bubble.assistant { justify-self: start; background: var(--color-neutral-100); color: var(--color-neutral-800); }
    .composer { display: flex; gap: 8px; }
    .composer input { flex: 1; }
    .btn { background: var(--color-primary-600); color: white; border: none; border-radius: 8px; padding: 10px 14px; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-block; }
    .btn:disabled { opacity: 0.6; }
    .sources { margin: 8px 0 0; font-size: 0.8rem; color: var(--color-neutral-500); }
    .empty { margin-top: 20px; background: white; border: 1px dashed var(--color-neutral-300); border-radius: 12px; padding: 28px; text-align: center; }
    @media (max-width: 900px) { .layout { grid-template-columns: 1fr; } }
  `],
})
export class AiTutorComponent implements OnInit {
  private lms = inject(LmsService);
  private toast = inject(ToastService);

  enrollments = signal<Enrollment[]>([]);
  loading = signal(true);
  asking = signal(false);
  messages = signal<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  sources = signal<string[]>([]);
  courseId = '';
  conversationId: string | null = null;
  question = '';

  async ngOnInit(): Promise<void> {
    try {
      const items = await this.lms.myEnrollments();
      this.enrollments.set(items);
      if (items.length) this.courseId = items[0].courseId;
    } catch {
      this.toast.error('Could not load enrollments');
    } finally {
      this.loading.set(false);
    }
  }

  onCourseChange(): void {
    this.conversationId = null;
    this.messages.set([]);
    this.sources.set([]);
  }

  async ask(): Promise<void> {
    if (!this.courseId || !this.question.trim()) {
      this.toast.error('Select a course and type a question');
      return;
    }
    const q = this.question.trim();
    this.question = '';
    this.asking.set(true);
    this.messages.update((m) => [...m, { role: 'user', content: q }]);
    try {
      const res: TutorResponse = await this.lms.askTutor({
        courseId: this.courseId,
        question: q,
        conversationId: this.conversationId,
      });
      this.conversationId = res.conversationId;
      this.messages.update((m) => [...m, { role: 'assistant', content: res.answer }]);
      this.sources.set(res.sources || []);
    } catch (err: unknown) {
      const message = (err as { error?: { message?: string } })?.error?.message ?? 'Tutor request failed';
      this.toast.error(message);
      this.messages.update((m) => m.slice(0, -1));
    } finally {
      this.asking.set(false);
    }
  }
}
