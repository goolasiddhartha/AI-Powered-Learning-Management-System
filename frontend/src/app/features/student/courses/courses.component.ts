import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../../core/services/course.service';
import { LmsService } from '../../../core/services/lms.service';
import { AuthService } from '../../../core/services/auth.service';
import { Course, Enrollment } from '../../../core/models';
import { CourseCardComponent } from '../../../shared/components/course-card/course-card.component';

@Component({
  selector: 'app-student-courses',
  imports: [FormsModule, CourseCardComponent],
  template: `
    <section class="page">
      <h1>Browse Courses</h1>
      <p class="muted">Published courses available for enrollment.</p>

      <form class="filters" (ngSubmit)="applyFilters()">
        <label class="search">
          <span>Search courses</span>
          <input
            type="search"
            name="search"
            [ngModel]="searchText()"
            (ngModelChange)="searchText.set($event)"
            placeholder="Title, description, or instructor"
          />
        </label>
        <label>
          <span>Category</span>
          <select name="category" [ngModel]="categoryFilter()" (ngModelChange)="categoryFilter.set($event)">
            <option value="">All categories</option>
            @for (category of categories(); track category) {
              <option [value]="category">{{ category }}</option>
            }
          </select>
        </label>
        <label>
          <span>Difficulty</span>
          <select name="difficulty" [ngModel]="difficultyFilter()" (ngModelChange)="difficultyFilter.set($event)">
            <option value="">All levels</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </label>
        <label>
          <span>Sort by</span>
          <select name="sort" [ngModel]="sortOrder()" (ngModelChange)="sortOrder.set($event)">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="title_asc">Title: A to Z</option>
            <option value="title_desc">Title: Z to A</option>
            <option value="popular">Most enrolled</option>
          </select>
        </label>
        <div class="filter-actions">
          <button class="btn primary" type="submit" [disabled]="loading()">Apply filters</button>
          <button class="btn secondary" type="button" (click)="clearFilters()" [disabled]="loading()">Clear</button>
        </div>
      </form>

      @if (notice()) {
        <p class="notice" role="status">{{ notice() }}</p>
      }
      @if (loading()) {
        <p class="state" role="status">Loading courses…</p>
      } @else if (error()) {
        <div class="empty" role="alert">
          <h2>Courses could not be loaded</h2>
          <p>{{ error() }}</p>
          <button class="btn primary" type="button" (click)="loadPage()">Try again</button>
        </div>
      } @else if (!courses().length && hasFilters()) {
        <div class="empty">
          <h2>No courses match these filters</h2>
          <p>Try changing your search or filters.</p>
          <button class="btn secondary" type="button" (click)="clearFilters()">Clear filters</button>
        </div>
      } @else if (!courses().length) {
        <div class="empty">
          <h2>No published courses yet</h2>
          <p>Check back later for new published courses.</p>
        </div>
      } @else {
        <div class="grid">
          @for (course of courses(); track course.id) {
            <app-course-card
              [course]="course"
              [link]="'/student/courses/' + course.id"
              [enrollment]="enrollmentFor(course.id)"
            />
          }
        </div>
        <div class="pagination" aria-label="Course pages">
          <button class="btn secondary" type="button" (click)="changePage(page() - 1)" [disabled]="loading() || page() <= 1">
            Previous
          </button>
          <span>Page {{ page() }} of {{ totalPages() }} · {{ total() }} courses</span>
          <button class="btn secondary" type="button" (click)="changePage(page() + 1)" [disabled]="loading() || page() >= totalPages()">
            Next
          </button>
        </div>
      }
    </section>
  `,
  styles: [`
    h1 { margin: 0 0 4px; font-size: 1.75rem; }
    .muted { color: var(--color-neutral-500); margin: 0 0 20px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    .filters { display: grid; grid-template-columns: minmax(220px, 2fr) repeat(3, minmax(145px, 1fr)) auto; gap: 12px; align-items: end; margin-bottom: 22px; }
    label { display: grid; gap: 5px; color: var(--color-neutral-700); font-size: 0.8rem; font-weight: 700; }
    input, select { width: 100%; min-height: 40px; border: 1px solid var(--color-neutral-300); border-radius: 8px; padding: 8px 10px; background: white; color: inherit; font: inherit; }
    .filter-actions { display: flex; gap: 8px; }
    .btn { min-height: 40px; border: 0; border-radius: 8px; padding: 8px 12px; font: inherit; font-weight: 700; cursor: pointer; white-space: nowrap; }
    .btn.primary { background: var(--color-primary-600); color: white; }
    .btn.secondary { background: var(--color-neutral-100); color: var(--color-neutral-700); }
    .btn:disabled { opacity: 0.55; cursor: not-allowed; }
    .state { color: var(--color-neutral-500); padding: 20px 0; }
    .notice { padding: 10px 12px; border-radius: 8px; background: var(--color-neutral-100); color: var(--color-neutral-700); }
    .empty {
      border: 1px dashed var(--color-neutral-300); border-radius: var(--radius-lg);
      padding: 40px; text-align: center; background: white;
    }
    .pagination { display: flex; justify-content: center; align-items: center; gap: 14px; margin-top: 24px; color: var(--color-neutral-600); font-size: 0.9rem; }
    @media (max-width: 900px) { .filters { grid-template-columns: repeat(2, minmax(0, 1fr)); } .search { grid-column: 1 / -1; } }
    @media (max-width: 560px) { .filters { grid-template-columns: 1fr; } .search { grid-column: auto; } .filter-actions { flex-wrap: wrap; } .pagination { flex-wrap: wrap; } }
  `],
})
export class StudentCoursesComponent implements OnInit {
  private courseService = inject(CourseService);
  private lms = inject(LmsService);
  auth = inject(AuthService);

  courses = signal<Course[]>([]);
  categories = signal<string[]>([]);
  enrollments = signal<Enrollment[]>([]);
  loading = signal(true);
  error = signal('');
  notice = signal('');
  searchText = signal('');
  categoryFilter = signal('');
  difficultyFilter = signal('');
  sortOrder = signal<'newest' | 'oldest' | 'title_asc' | 'title_desc' | 'popular'>('newest');
  page = signal(1);
  total = signal(0);
  totalPages = signal(0);
  private readonly pageSize = 12;

  async ngOnInit(): Promise<void> {
    const categoriesResult = await Promise.allSettled([this.courseService.categories()]);
    if (categoriesResult[0].status === 'fulfilled') {
      this.categories.set(categoriesResult[0].value);
    } else {
      this.notice.set('Category filters are temporarily unavailable.');
    }
    if (this.auth.user()?.role === 'STUDENT') {
      const enrollmentsResult = await Promise.allSettled([this.lms.myEnrollments()]);
      if (enrollmentsResult[0].status === 'fulfilled') {
        this.enrollments.set(enrollmentsResult[0].value);
      } else {
        this.notice.set('Enrollment status is temporarily unavailable; course listings are still available.');
      }
    }
    await this.loadPage();
  }

  async loadPage(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const result = await this.courseService.listPage({
        status: 'PUBLISHED',
        search: this.searchText(),
        category: this.categoryFilter(),
        difficulty: this.difficultyFilter(),
        sort: this.sortOrder(),
        page: this.page(),
        pageSize: this.pageSize,
      });
      this.courses.set(result.items);
      this.total.set(result.total);
      this.totalPages.set(result.totalPages);
    } catch (err: unknown) {
      this.error.set(
        (err as { error?: { message?: string } })?.error?.message ?? 'Please check your connection and try again.'
      );
    } finally {
      this.loading.set(false);
    }
  }

  applyFilters(): void {
    this.page.set(1);
    void this.loadPage();
  }

  clearFilters(): void {
    this.searchText.set('');
    this.categoryFilter.set('');
    this.difficultyFilter.set('');
    this.sortOrder.set('newest');
    this.applyFilters();
  }

  changePage(page: number): void {
    this.page.set(page);
    void this.loadPage();
  }

  hasFilters(): boolean {
    return !!(this.searchText().trim() || this.categoryFilter() || this.difficultyFilter());
  }

  enrollmentFor(courseId: string): Enrollment | undefined {
    return this.enrollments().find((enrollment) => enrollment.courseId === courseId);
  }
}
