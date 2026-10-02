import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Quiz, QuizAttempt, QuizQuestion, StudentQuiz } from '../models';

export type QuizQuestionPayload = Omit<QuizQuestion, 'id'> & { id?: string };

export type QuizPayload = Pick<
  Quiz,
  'title' | 'description' | 'lessonId' | 'timeLimit' | 'passingScore' | 'maxAttempts'
> & { questions: QuizQuestionPayload[] };

@Injectable({ providedIn: 'root' })
export class QuizService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  listForCourse(courseId: string): Promise<Quiz[]> {
    return firstValueFrom(
      this.http.get<ApiResponse<Quiz[]>>(`${this.api}/courses/${courseId}/quizzes`)
    ).then((response) => response.data ?? []);
  }

  listAvailable(courseId: string): Promise<StudentQuiz[]> {
    return firstValueFrom(
      this.http.get<ApiResponse<StudentQuiz[]>>(
        `${this.api}/courses/${courseId}/quizzes/available`
      )
    ).then((response) => response.data ?? []);
  }

  create(courseId: string, payload: QuizPayload): Promise<Quiz> {
    return firstValueFrom(
      this.http.post<ApiResponse<Quiz>>(`${this.api}/courses/${courseId}/quizzes`, payload)
    ).then((response) => response.data);
  }

  update(quizId: string, payload: Partial<QuizPayload>): Promise<Quiz> {
    return firstValueFrom(
      this.http.put<ApiResponse<Quiz>>(`${this.api}/quizzes/${quizId}`, payload)
    ).then((response) => response.data);
  }

  delete(quizId: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<ApiResponse<null>>(`${this.api}/quizzes/${quizId}`)
    ).then(() => undefined);
  }

  getForStudent(quizId: string): Promise<StudentQuiz> {
    return firstValueFrom(
      this.http.get<ApiResponse<StudentQuiz>>(`${this.api}/quizzes/${quizId}`)
    ).then((response) => response.data);
  }

  submit(quizId: string, answers: Record<string, string>): Promise<QuizAttempt> {
    return firstValueFrom(
      this.http.post<ApiResponse<QuizAttempt>>(`${this.api}/quizzes/${quizId}/attempts`, {
        answers,
      })
    ).then((response) => response.data);
  }

  attempts(quizId: string): Promise<QuizAttempt[]> {
    return firstValueFrom(
      this.http.get<ApiResponse<QuizAttempt[]>>(`${this.api}/quizzes/${quizId}/attempts`)
    ).then((response) => response.data ?? []);
  }
}
