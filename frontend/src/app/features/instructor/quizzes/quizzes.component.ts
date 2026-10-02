import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { QuizPayload, QuizService } from '../../../core/services/quiz.service';
import { ToastService } from '../../../core/services/toast.service';
import { Course, Lesson, Quiz, QuizQuestion, QuestionType } from '../../../core/models';

type QuestionForm = FormGroup<{
  id: FormControl<string>;
  question: FormControl<string>;
  type: FormControl<QuestionType>;
  optionsText: FormControl<string>;
  correctAnswer: FormControl<string>;
  explanation: FormControl<string>;
  marks: FormControl<number>;
}>;

@Component({
  selector: 'app-quizzes',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="page">
      <a routerLink="/instructor/courses" class="back">← My Courses</a>
      <header>
        <div>
          <h1>{{ course()?.title || 'Quizzes' }}</h1>
          <p class="muted">Create quizzes, set passing requirements, and manage questions.</p>
        </div>
      </header>

      <div class="layout">
        <section class="card">
          <h2>Course quizzes</h2>
          @if (!quizzes().length) {
            <p class="muted">No quizzes yet. Create the first one using the form.</p>
          } @else {
            <ul class="quiz-list">
              @for (quiz of quizzes(); track quiz.id) {
                <li [class.selected]="editingId() === quiz.id">
                  <div class="quiz-info">
                    <strong>{{ quiz.title }}</strong>
                    <span>{{ quiz.questions?.length || 0 }} questions · Pass {{ quiz.passingScore }}% · {{ quiz.maxAttempts }} attempts</span>
                    @if (quiz.lessonId) {
                      <span>Lesson: {{ lessonTitle(quiz.lessonId) }}</span>
                    } @else {
                      <span>Course quiz</span>
                    }
                  </div>
                  <div class="row-actions">
                    <button type="button" class="link-button" (click)="edit(quiz)">Edit</button>
                    <button type="button" class="danger" (click)="remove(quiz)">Delete</button>
                  </div>
                </li>
              }
            </ul>
          }
        </section>

        <form class="card editor" [formGroup]="form" (ngSubmit)="save()">
          <div class="editor-heading">
            <h2>{{ editingId() ? 'Edit quiz' : 'Create quiz' }}</h2>
            @if (editingId()) {
              <button type="button" class="link-button" (click)="newQuiz()">Create another</button>
            }
          </div>
          <label>
            Title
            <input formControlName="title" maxlength="200" />
          </label>
          <label>
            Description
            <textarea formControlName="description" rows="2" maxlength="2000"></textarea>
          </label>
          <label>
            Lesson (optional)
            <select formControlName="lessonId">
              <option value="">Entire course</option>
              @for (lesson of lessons(); track lesson.id) {
                <option [value]="lesson.id">{{ lesson.order }}. {{ lesson.title }}</option>
              }
            </select>
          </label>
          <div class="settings">
            <label>
              Time limit (minutes; 0 means none)
              <input type="number" formControlName="timeLimit" min="0" max="600" />
            </label>
            <label>
              Passing percentage
              <input type="number" formControlName="passingScore" min="0" max="100" />
            </label>
            <label>
              Maximum attempts
              <input type="number" formControlName="maxAttempts" min="1" max="100" />
            </label>
          </div>

          <div class="question-heading">
            <h3>Questions</h3>
            <button type="button" class="btn secondary" (click)="addQuestion()">Add question</button>
          </div>
          <div formArrayName="questions" class="questions">
            @for (question of questions.controls; track question; let i = $index) {
              <fieldset [formGroupName]="i">
                <legend>Question {{ i + 1 }}</legend>
                <label>
                  Prompt
                  <textarea formControlName="question" rows="2" maxlength="2000"></textarea>
                </label>
                <div class="settings question-settings">
                  <label>
                    Type
                    <select formControlName="type">
                      <option value="MCQ">Multiple choice</option>
                      <option value="TRUE_FALSE">True / False</option>
                    </select>
                  </label>
                  <label>
                    Marks
                    <input type="number" formControlName="marks" min="0.01" max="100" step="0.25" />
                  </label>
                </div>
                <label>
                  Answer options (one per line)
                  <textarea formControlName="optionsText" rows="4" placeholder="First option&#10;Second option"></textarea>
                </label>
                <label>
                  Correct answer (must exactly match one option)
                  <input formControlName="correctAnswer" maxlength="500" />
                </label>
                <label>
                  Explanation (shown after submission)
                  <textarea formControlName="explanation" rows="2" maxlength="2000"></textarea>
                </label>
                <button type="button" class="danger remove-question" (click)="removeQuestion(i)">Remove question</button>
              </fieldset>
            }
          </div>
          <div class="form-actions">
            <button type="submit" class="btn primary" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Saving…' : editingId() ? 'Save changes' : 'Create quiz' }}
            </button>
          </div>
        </form>
      </div>
    </section>
  `,
  styles: [`
    .page { max-width: 1160px; }
    .back { color: var(--color-primary-700); font-weight: 600; font-size: 0.875rem; }
    header { margin: 8px 0 20px; }
    h1 { margin: 0 0 4px; font-size: 1.75rem; }
    h2 { margin: 0; font-size: 1.1rem; }
    h3 { margin: 0; font-size: 1rem; }
    .muted { color: var(--color-neutral-500); margin: 0; }
    .layout { display: grid; grid-template-columns: minmax(260px, 0.8fr) minmax(0, 1.4fr); align-items: start; gap: 16px; }
    .card { background: white; border: 1px solid var(--color-neutral-200); border-radius: var(--radius-lg); padding: 20px; }
    .quiz-list { list-style: none; padding: 0; margin: 16px 0 0; display: grid; gap: 10px; }
    .quiz-list li { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 12px; border: 1px solid var(--color-neutral-200); border-radius: var(--radius-md); }
    .quiz-list li.selected { border-color: var(--color-primary-500); }
    .quiz-info { min-width: 0; display: grid; gap: 4px; }
    .quiz-info span { color: var(--color-neutral-500); font-size: 0.8rem; }
    .row-actions { display: flex; gap: 8px; flex-shrink: 0; }
    .editor { display: grid; gap: 14px; }
    .editor-heading, .question-heading, .form-actions { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
    label { display: grid; gap: 6px; font-size: 0.875rem; font-weight: 600; }
    input, textarea, select { width: 100%; padding: 10px 12px; border: 1px solid var(--color-neutral-300); border-radius: var(--radius-md); font: inherit; font-weight: 400; }
    textarea { resize: vertical; }
    .settings { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
    .questions { display: grid; gap: 12px; }
    fieldset { min-width: 0; display: grid; gap: 12px; margin: 0; padding: 14px; border: 1px solid var(--color-neutral-200); border-radius: var(--radius-md); }
    legend { padding: 0 6px; font-weight: 700; font-size: 0.9rem; }
    .question-settings { grid-template-columns: 1fr 1fr; }
    .btn { display: inline-flex; align-items: center; justify-content: center; padding: 10px 14px; border: 0; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; }
    .btn.primary { background: var(--color-primary-600); color: white; }
    .btn.secondary { background: var(--color-neutral-100); color: var(--color-neutral-700); }
    .btn:disabled { opacity: 0.55; cursor: not-allowed; }
    .link-button, .danger { background: none; border: none; cursor: pointer; font: inherit; font-weight: 600; white-space: nowrap; }
    .link-button { color: var(--color-primary-700); }
    .danger { color: var(--color-error-600); }
    .remove-question { justify-self: end; }
    @media (max-width: 850px) { .layout { grid-template-columns: 1fr; } }
    @media (max-width: 560px) { .settings { grid-template-columns: 1fr; } .quiz-list li { align-items: flex-start; } }
  `],
})
export class QuizzesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private courses = inject(CourseService);
  private quizService = inject(QuizService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  courseId = '';
  course = signal<Course | null>(null);
  lessons = signal<Lesson[]>([]);
  quizzes = signal<Quiz[]>([]);
  editingId = signal<string | null>(null);
  saving = signal(false);

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    lessonId: [''],
    timeLimit: [0, [Validators.required, Validators.min(0), Validators.max(600)]],
    passingScore: [70, [Validators.required, Validators.min(0), Validators.max(100)]],
    maxAttempts: [1, [Validators.required, Validators.min(1), Validators.max(100)]],
    questions: this.fb.array<QuestionForm>([], Validators.minLength(1)),
  });

  get questions(): FormArray<QuestionForm> {
    return this.form.controls.questions;
  }

  async ngOnInit(): Promise<void> {
    this.courseId = this.route.snapshot.paramMap.get('id') || '';
    try {
      const [course, lessons, quizzes] = await Promise.all([
        this.courses.get(this.courseId),
        this.courses.listLessons(this.courseId),
        this.quizService.listForCourse(this.courseId),
      ]);
      this.course.set(course);
      this.lessons.set(lessons);
      this.quizzes.set(quizzes);
    } catch (err: unknown) {
      this.toast.error(this.errorMessage(err, 'Failed to load quizzes'));
    }
  }

  lessonTitle(lessonId: string): string {
    return this.lessons().find((lesson) => lesson.id === lessonId)?.title ?? 'Unavailable lesson';
  }

  addQuestion(question?: QuizQuestion): void {
    this.questions.push(this.fb.nonNullable.group({
      id: [question?.id ?? ''],
      question: [question?.question ?? '', Validators.required],
      type: [question?.type ?? ('MCQ' as QuestionType), Validators.required],
      optionsText: [(question?.options ?? ['', '', '', '']).join('\n'), Validators.required],
      correctAnswer: [question?.correctAnswer ?? '', Validators.required],
      explanation: [question?.explanation ?? ''],
      marks: [question?.marks ?? 1, [Validators.required, Validators.min(0.01), Validators.max(100)]],
    }));
  }

  removeQuestion(index: number): void {
    this.questions.removeAt(index);
  }

  edit(quiz: Quiz): void {
    this.editingId.set(quiz.id);
    this.form.patchValue({
      title: quiz.title,
      description: quiz.description,
      lessonId: quiz.lessonId ?? '',
      timeLimit: quiz.timeLimit,
      passingScore: quiz.passingScore,
      maxAttempts: quiz.maxAttempts,
    });
    this.clearQuestions();
    for (const question of quiz.questions ?? []) this.addQuestion(question);
  }

  newQuiz(): void {
    this.editingId.set(null);
    this.form.reset({
      title: '',
      description: '',
      lessonId: '',
      timeLimit: 0,
      passingScore: 70,
      maxAttempts: 1,
    });
    this.clearQuestions();
  }

  async save(): Promise<void> {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    try {
      const value = this.form.getRawValue();
      const payload: QuizPayload = {
        title: value.title.trim(),
        description: value.description.trim(),
        lessonId: value.lessonId || null,
        timeLimit: value.timeLimit,
        passingScore: value.passingScore,
        maxAttempts: value.maxAttempts,
        questions: value.questions.map((question) => ({
          id: question.id || undefined,
          question: question.question.trim(),
          type: question.type,
          options: question.optionsText.split(/\r?\n/).map((option) => option.trim()).filter(Boolean),
          correctAnswer: question.correctAnswer.trim(),
          explanation: question.explanation.trim(),
          marks: question.marks,
        })),
      };
      const editingId = this.editingId();
      let saved: Quiz;
      if (editingId) {
        saved = await this.quizService.update(editingId, payload);
        this.quizzes.update((items) => items.map((item) => item.id === saved.id ? saved : item));
        this.toast.success('Quiz updated');
      } else {
        saved = await this.quizService.create(this.courseId, payload);
        this.quizzes.update((items) => [saved, ...items]);
        this.toast.success('Quiz created');
      }
      this.newQuiz();
    } catch (err: unknown) {
      this.toast.error(this.errorMessage(err, 'Could not save quiz; check question options and correct answers'));
    } finally {
      this.saving.set(false);
    }
  }

  async remove(quiz: Quiz): Promise<void> {
    if (!confirm(`Delete quiz "${quiz.title}" and its attempt history?`)) return;
    try {
      await this.quizService.delete(quiz.id);
      this.quizzes.update((items) => items.filter((item) => item.id !== quiz.id));
      if (this.editingId() === quiz.id) this.newQuiz();
      this.toast.success('Quiz deleted');
    } catch (err: unknown) {
      this.toast.error(this.errorMessage(err, 'Could not delete quiz'));
    }
  }

  private clearQuestions(): void {
    while (this.questions.length) this.questions.removeAt(0);
  }

  private errorMessage(err: unknown, fallback: string): string {
    return (err as { error?: { message?: string } })?.error?.message ?? fallback;
  }
}
