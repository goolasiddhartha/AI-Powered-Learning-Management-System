import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { QuizService } from '../../../core/services/quiz.service';
import { ToastService } from '../../../core/services/toast.service';
import { QuizAttempt, StudentQuiz } from '../../../core/models';

@Component({
  selector: 'app-quiz',
  imports: [RouterLink],
  template: `
    <section class="page">
      @if (loading()) {
        <p class="muted" role="status">Loading quiz…</p>
      } @else if (loadError()) {
        <div class="card notice" role="alert">
          <h1>Quiz unavailable</h1>
          <p>{{ loadError() }}</p>
          <a class="button secondary" routerLink="/student/courses">Browse courses</a>
        </div>
      } @else if (quiz(); as currentQuiz) {
        <a class="back" [routerLink]="['/student/courses', currentQuiz.courseId]">← Back to course</a>
        <header>
          <div>
            <p class="eyebrow">Course quiz</p>
            <h1>{{ currentQuiz.title }}</h1>
            @if (currentQuiz.description) {
              <p class="description">{{ currentQuiz.description }}</p>
            }
          </div>
          <div class="quiz-meta">
            <span>{{ currentQuiz.questions.length }} questions</span>
            <span>{{ currentQuiz.timeLimit ? currentQuiz.timeLimit + ' minutes' : 'No time limit' }}</span>
            <span>Pass: {{ currentQuiz.passingScore }}%</span>
            <span>{{ currentQuiz.attemptsRemaining }} of {{ currentQuiz.maxAttempts }} attempts remaining</span>
          </div>
        </header>

        @if (active()) {
          <form (ngSubmit)="submit()" class="quiz-form">
            @for (question of currentQuiz.questions; track question.id; let i = $index) {
              <fieldset class="question card">
                <legend>
                  <span class="number">{{ i + 1 }}</span>
                  <span>{{ question.question }}</span>
                </legend>
                <div class="choices">
                  @for (option of question.options; track option) {
                    <label class="choice" [class.chosen]="answers()[question.id] === option">
                      <input
                        type="radio"
                        [name]="question.id"
                        [value]="option"
                        [checked]="answers()[question.id] === option"
                        (change)="selectAnswer(question.id, option)"
                      />
                      <span>{{ option }}</span>
                    </label>
                  }
                </div>
                <p class="marks">{{ question.marks }} {{ question.marks === 1 ? 'mark' : 'marks' }}</p>
              </fieldset>
            }
            <div class="submit-row">
              <p class="muted">Unanswered questions receive no marks.</p>
              <button type="submit" class="button primary" [disabled]="submitting()">
                {{ submitting() ? 'Submitting…' : 'Submit answers' }}
              </button>
            </div>
          </form>
        } @else if (latestAttempt(); as attempt) {
          <section class="card result" aria-live="polite">
            <div class="result-heading">
              <div>
                <p class="eyebrow">Attempt {{ attempt.attemptNumber }} result</p>
                <h2 [class.passed]="attempt.passed" [class.failed]="!attempt.passed">
                  {{ attempt.passed ? 'Passed' : 'Not passed' }} · {{ attempt.score }}%
                </h2>
                <p class="muted">
                  {{ attempt.earnedMarks }} of {{ attempt.totalMarks }} marks
                  · Passing score {{ attempt.passingScore }}%
                </p>
              </div>
              @if (currentQuiz.attemptsRemaining > 0) {
                <button type="button" class="button primary" (click)="startRetake()">Retake quiz</button>
              }
            </div>
            <h3>Answer review</h3>
            <ol class="review">
              @for (answer of attempt.results; track answer.questionId) {
                <li [class.correct]="answer.selectedAnswer === answer.correctAnswer">
                  <strong>{{ answer.question }}</strong>
                  <span>Your answer: {{ answer.selectedAnswer || 'Not answered' }}</span>
                  <span>Correct answer: {{ answer.correctAnswer }}</span>
                  @if (answer.explanation) {
                    <span class="explanation">{{ answer.explanation }}</span>
                  }
                </li>
              }
            </ol>
            @if (!currentQuiz.attemptsRemaining) {
              <p class="muted limit">You have used all attempts for this quiz.</p>
            }
          </section>
        } @else {
          <div class="card notice">
            <h2>No attempts remaining</h2>
            <p>You have used all attempts allowed for this quiz.</p>
          </div>
        }
      }
    </section>
  `,
  styles: [`
    .page { max-width: 920px; margin: 0 auto; }
    .back { display: inline-block; color: var(--color-primary-700); font-size: 0.875rem; font-weight: 600; margin-bottom: 12px; }
    header { display: grid; grid-template-columns: 1fr auto; gap: 20px; align-items: start; margin-bottom: 18px; }
    h1 { margin: 2px 0 8px; font-size: 1.8rem; }
    h2 { margin: 0 0 6px; font-size: 1.25rem; }
    h3 { margin: 22px 0 12px; font-size: 1rem; }
    .eyebrow { color: var(--color-primary-700); font-size: 0.75rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; margin: 0; }
    .description, .muted { color: var(--color-neutral-600); }
    .description { margin: 0; line-height: 1.5; }
    .quiz-meta { display: grid; gap: 6px; justify-items: end; color: var(--color-neutral-600); font-size: 0.82rem; text-align: right; }
    .card { background: white; border: 1px solid var(--color-neutral-200); border-radius: var(--radius-lg); padding: 20px; }
    .quiz-form { display: grid; gap: 14px; }
    fieldset.question { min-width: 0; margin: 0; }
    legend { display: flex; align-items: flex-start; gap: 10px; padding: 0; font-weight: 700; line-height: 1.45; }
    .number { flex: 0 0 28px; height: 28px; display: grid; place-items: center; border-radius: 50%; background: var(--color-primary-50); color: var(--color-primary-700); }
    .choices { display: grid; gap: 8px; margin: 16px 0 8px 38px; }
    .choice { display: flex; align-items: center; gap: 10px; min-height: 42px; padding: 8px 12px; border: 1px solid var(--color-neutral-200); border-radius: var(--radius-md); cursor: pointer; }
    .choice.chosen { border-color: var(--color-primary-500); background: var(--color-primary-50); }
    .choice input { accent-color: var(--color-primary-600); }
    .marks { color: var(--color-neutral-500); font-size: 0.8rem; margin: 0 0 0 38px; }
    .submit-row, .result-heading { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
    .submit-row .muted { margin: 0; font-size: 0.875rem; }
    .button { display: inline-flex; align-items: center; justify-content: center; border: 0; border-radius: var(--radius-md); padding: 11px 16px; font: inherit; font-weight: 700; text-decoration: none; cursor: pointer; }
    .button.primary { color: white; background: var(--color-primary-600); }
    .button.primary:disabled { opacity: 0.6; cursor: wait; }
    .button.secondary { color: var(--color-neutral-700); background: var(--color-neutral-100); }
    .notice p { color: var(--color-neutral-600); }
    .result h2.passed { color: var(--color-success-700); }
    .result h2.failed { color: var(--color-error-600); }
    .review { display: grid; gap: 10px; padding-left: 24px; }
    .review li { display: grid; gap: 5px; padding: 12px; border: 1px solid var(--color-neutral-200); border-radius: var(--radius-md); color: var(--color-neutral-700); font-size: 0.9rem; }
    .review li.correct { border-color: var(--color-success-500); }
    .review strong { color: var(--color-neutral-900); }
    .explanation { color: var(--color-neutral-500); font-style: italic; }
    .limit { margin-bottom: 0; }
    @media (max-width: 650px) {
      header { grid-template-columns: 1fr; }
      .quiz-meta { justify-items: start; text-align: left; }
      .card { padding: 16px; }
      .submit-row, .result-heading { align-items: stretch; flex-direction: column; }
      .choices, .marks { margin-left: 0; }
    }
  `],
})
export class QuizComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private quizService = inject(QuizService);
  private toast = inject(ToastService);

  quiz = signal<StudentQuiz | null>(null);
  latestAttempt = signal<QuizAttempt | null>(null);
  answers = signal<Record<string, string>>({});
  loading = signal(true);
  active = signal(false);
  submitting = signal(false);
  loadError = signal('');
  private quizId = '';

  async ngOnInit(): Promise<void> {
    this.quizId = this.route.snapshot.paramMap.get('id') || '';
    await this.load();
  }

  selectAnswer(questionId: string, answer: string): void {
    this.answers.update((answers) => ({ ...answers, [questionId]: answer }));
  }

  startRetake(): void {
    this.latestAttempt.set(null);
    this.answers.set({});
    this.active.set(true);
  }

  async submit(): Promise<void> {
    if (this.submitting() || !this.quiz()) return;
    this.submitting.set(true);
    try {
      const result = await this.quizService.submit(this.quizId, this.answers());
      this.latestAttempt.set(result);
      this.active.set(false);
      this.quiz.update((quiz) => quiz ? {
        ...quiz,
        attemptsUsed: quiz.attemptsUsed + 1,
        attemptsRemaining: Math.max(0, quiz.attemptsRemaining - 1),
      } : quiz);
      this.toast.success('Quiz submitted');
      try {
        this.quiz.set(await this.quizService.getForStudent(this.quizId));
      } catch {
        this.toast.info('Your result is saved, but remaining attempts could not be refreshed.');
      }
    } catch (err: unknown) {
      this.toast.error(this.errorMessage(err, 'Could not submit quiz'));
    } finally {
      this.submitting.set(false);
    }
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.loadError.set('');
    try {
      const [quiz, attempts] = await Promise.all([
        this.quizService.getForStudent(this.quizId),
        this.quizService.attempts(this.quizId),
      ]);
      this.quiz.set(quiz);
      const latest = attempts.at(-1) ?? null;
      this.latestAttempt.set(latest);
      this.active.set(!latest && quiz.attemptsRemaining > 0);
    } catch (err: unknown) {
      this.loadError.set(this.errorMessage(err, 'This quiz could not be loaded.'));
    } finally {
      this.loading.set(false);
    }
  }

  private errorMessage(err: unknown, fallback: string): string {
    return (err as { error?: { message?: string } })?.error?.message ?? fallback;
  }
}
