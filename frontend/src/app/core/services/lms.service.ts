import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Course, Enrollment, Lesson } from '../models';

export interface CourseProgress {
  courseId: string;
  courseTitle: string;
  enrollmentStatus: string;
  progressPercentage: number;
  totalLessons: number;
  completedLessons: number;
  lastAccessedLessonId: string | null;
  lessons: Array<{
    lessonId: string;
    lessonTitle?: string;
    lessonOrder?: number;
    isCompleted: boolean;
  }>;
}

export interface ProgressSummary {
  enrolledCourses: number;
  completedCourses: number;
  totalLessonsCompleted: number;
  overallProgress: number;
  courses: CourseProgress[];
}

export interface AccessLessonData {
  lesson: Lesson;
  progress: { isCompleted: boolean };
  previousLessonId: string | null;
  nextLessonId: string | null;
}

export interface CourseEnrollment {
  studentId: string;
  studentName: string;
  studentEmail: string;
  profileImage: string;
  enrolledAt: string;
  status: Enrollment['status'];
  progressPercentage: number;
}

export interface RecommendationItem {
  type: string;
  title: string;
  reason: string;
  courseId?: string;
  lessonId?: string;
  actionUrl?: string;
}

export interface RecommendationsData {
  summary: string;
  items: RecommendationItem[];
  usedAiModel: boolean;
}

export interface TutorResponse {
  conversationId: string;
  answer: string;
  sources: string[];
  usedAiModel: boolean;
  messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }>;
}

@Injectable({ providedIn: 'root' })
export class LmsService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  enroll(courseId: string): Promise<Enrollment> {
    return firstValueFrom(
      this.http.post<ApiResponse<Enrollment>>(`${this.api}/courses/${courseId}/enroll`, {})
    ).then((r) => r.data);
  }

  myEnrollments(): Promise<Enrollment[]> {
    return firstValueFrom(
      this.http.get<ApiResponse<Enrollment[]>>(`${this.api}/enrollments/my-courses`)
    ).then((r) => r.data ?? []);
  }

  courseEnrollments(courseId: string): Promise<CourseEnrollment[]> {
    return firstValueFrom(
      this.http.get<ApiResponse<CourseEnrollment[]>>(
        `${this.api}/courses/${courseId}/enrollments`
      )
    ).then((r) => r.data ?? []);
  }

  progressSummary(): Promise<ProgressSummary> {
    return firstValueFrom(
      this.http.get<ApiResponse<ProgressSummary>>(`${this.api}/progress/summary`)
    ).then((r) => r.data);
  }

  courseProgress(courseId: string): Promise<CourseProgress> {
    return firstValueFrom(
      this.http.get<ApiResponse<CourseProgress>>(`${this.api}/progress/course/${courseId}`)
    ).then((r) => r.data);
  }

  accessLesson(lessonId: string): Promise<AccessLessonData> {
    return firstValueFrom(
      this.http.post<ApiResponse<AccessLessonData>>(
        `${this.api}/progress/lesson/${lessonId}/access`,
        {}
      )
    ).then((r) => r.data);
  }

  completeLesson(lessonId: string): Promise<CourseProgress> {
    return firstValueFrom(
      this.http.post<ApiResponse<CourseProgress>>(
        `${this.api}/progress/lesson/${lessonId}/complete`,
        {}
      )
    ).then((r) => r.data);
  }

  askTutor(payload: {
    courseId: string;
    lessonId?: string | null;
    question: string;
    conversationId?: string | null;
  }): Promise<TutorResponse> {
    const body: Record<string, string> = {
      courseId: payload.courseId,
      question: payload.question.trim(),
    };
    if (payload.lessonId) body['lessonId'] = payload.lessonId;
    if (payload.conversationId) body['conversationId'] = payload.conversationId;

    return firstValueFrom(
      this.http.post<ApiResponse<TutorResponse>>(`${this.api}/ai/tutor`, body)
    ).then((r) => r.data);
  }

  recommendations(): Promise<RecommendationsData> {
    return firstValueFrom(
      this.http.get<ApiResponse<RecommendationsData>>(`${this.api}/ai/recommendations`)
    ).then((r) => r.data);
  }
}
