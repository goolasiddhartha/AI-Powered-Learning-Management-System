import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Course, Lesson } from '../models';

export interface CoursePayload {
  title: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  category: string;
  difficulty: string;
  duration: string;
  language: string;
  prerequisites: string[];
  learningObjectives: string[];
}

export interface LessonPayload {
  title: string;
  description: string;
  order: number;
  content: string;
  videoUrl: string;
  resources: string[];
  estimatedMinutes: number;
  isPublished: boolean;
}

export interface CourseListOptions {
  mine?: boolean;
  status?: string;
  search?: string;
  category?: string;
  difficulty?: string;
  sort?: 'newest' | 'oldest' | 'title_asc' | 'title_desc' | 'popular';
}

export interface CoursePage {
  items: Course[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class CourseService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/courses`;

  list(options?: CourseListOptions): Promise<Course[]> {
    let params = new HttpParams();
    if (options?.mine) params = params.set('mine', 'true');
    if (options?.status) params = params.set('status', options.status);
    if (options?.search?.trim()) params = params.set('search', options.search.trim());
    if (options?.category) params = params.set('category', options.category);
    if (options?.difficulty) params = params.set('difficulty', options.difficulty);
    if (options?.sort) params = params.set('sort', options.sort);
    return firstValueFrom(
      this.http.get<ApiResponse<Course[]>>(this.base, { params })
    ).then((res) => res.data ?? []);
  }

  listPage(
    options: CourseListOptions & { page: number; pageSize: number }
  ): Promise<CoursePage> {
    let params = new HttpParams()
      .set('page', options.page)
      .set('page_size', options.pageSize);
    if (options.mine) params = params.set('mine', 'true');
    if (options.status) params = params.set('status', options.status);
    if (options.search?.trim()) params = params.set('search', options.search.trim());
    if (options.category) params = params.set('category', options.category);
    if (options.difficulty) params = params.set('difficulty', options.difficulty);
    if (options.sort) params = params.set('sort', options.sort);
    return firstValueFrom(
      this.http.get<ApiResponse<CoursePage>>(this.base, { params })
    ).then((res) => res.data);
  }

  categories(): Promise<string[]> {
    return firstValueFrom(
      this.http.get<ApiResponse<string[]>>(`${this.base}/categories`)
    ).then((res) => res.data ?? []);
  }

  get(id: string): Promise<Course> {
    return firstValueFrom(this.http.get<ApiResponse<Course>>(`${this.base}/${id}`)).then(
      (res) => res.data
    );
  }

  create(payload: CoursePayload): Promise<Course> {
    return firstValueFrom(
      this.http.post<ApiResponse<Course>>(this.base, payload)
    ).then((res) => res.data);
  }

  update(id: string, payload: Partial<CoursePayload>): Promise<Course> {
    return firstValueFrom(
      this.http.put<ApiResponse<Course>>(`${this.base}/${id}`, payload)
    ).then((res) => res.data);
  }

  publish(id: string): Promise<Course> {
    return firstValueFrom(
      this.http.post<ApiResponse<Course>>(`${this.base}/${id}/publish`, {})
    ).then((res) => res.data);
  }

  delete(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<ApiResponse<null>>(`${this.base}/${id}`)).then(
      () => undefined
    );
  }

  listLessons(courseId: string): Promise<Lesson[]> {
    return firstValueFrom(
      this.http.get<ApiResponse<Lesson[]>>(`${this.base}/${courseId}/lessons`)
    ).then((res) => res.data ?? []);
  }

  createLesson(courseId: string, payload: LessonPayload): Promise<Lesson> {
    return firstValueFrom(
      this.http.post<ApiResponse<Lesson>>(`${this.base}/${courseId}/lessons`, payload)
    ).then((res) => res.data);
  }

  updateLesson(lessonId: string, payload: Partial<LessonPayload>): Promise<Lesson> {
    return firstValueFrom(
      this.http.put<ApiResponse<Lesson>>(`${environment.apiUrl}/lessons/${lessonId}`, payload)
    ).then((res) => res.data);
  }

  deleteLesson(lessonId: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<ApiResponse<null>>(`${environment.apiUrl}/lessons/${lessonId}`)
    ).then(() => undefined);
  }
}
