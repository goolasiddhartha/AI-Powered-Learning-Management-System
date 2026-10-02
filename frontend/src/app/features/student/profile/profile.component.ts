import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Certificate, Enrollment } from '../../../core/models';
import { AuthService } from '../../../core/services/auth.service';
import { CertificateService } from '../../../core/services/certificate.service';
import { LmsService } from '../../../core/services/lms.service';
import { QuizService } from '../../../core/services/quiz.service';
import { ToastService } from '../../../core/services/toast.service';

interface ProfileQuizItem {
  courseId: string;
  courseTitle: string;
  quizId: string;
  quizTitle: string;
  attemptsRemaining: number;
}

@Component({
  selector: 'app-profile',
  imports: [RouterLink, DatePipe],
  template: `
    <section class="page profile-page">
      @if (loading()) {
        <div class="loading-state">Loading your learning profile…</div>
      } @else {
        <header class="topbar">
          <div class="avatar">{{ initials() }}</div>
          <div class="profile-copy">
            <p class="eyebrow">Student profile</p>
            <h1>{{ fullName() }}</h1>
            <p class="muted">{{ auth.user()?.email }}</p>
          </div>
          <a class="btn primary" routerLink="/student/courses">Browse courses</a>
        </header>

        <div class="stats-grid">
          <article class="stat-card">
            <span>Enrolled courses</span>
            <strong>{{ summary().enrolledCourses }}</strong>
          </article>
          <article class="stat-card">
            <span>Completed</span>
            <strong>{{ summary().completedCourses }}</strong>
          </article>
          <article class="stat-card">
            <span>Certificates</span>
            <strong>{{ summary().certificates }}</strong>
          </article>
          <article class="stat-card">
            <span>Learning progress</span>
            <strong>{{ summary().overallProgress }}%</strong>
          </article>
        </div>

        <div class="content-grid">
          <section class="panel">
            <div class="panel-header">
              <h2>My courses</h2>
              <a routerLink="/student/courses">View all</a>
            </div>

            @if (!enrollments().length) {
              <div class="empty-state">
                <h3>No courses yet</h3>
                <p>Browse the catalog and enroll in your first course.</p>
              </div>
            } @else {
              <div class="stack">
                @for (entry of enrollments().slice(0, 4); track entry.id) {
                  <article class="item-card">
                    <div>
                      <h3>{{ entry.course?.title || 'Course' }}</h3>
                      <p>{{ entry.status === 'COMPLETED' ? 'Completed' : entry.status === 'ACTIVE' ? 'In progress' : entry.status }}</p>
                    </div>
                    <div class="item-meta">
                      <span>{{ entry.progressPercentage }}% complete</span>
                      <a class="btn small" [routerLink]="['/student/courses', entry.courseId, 'learn']">Continue</a>
                    </div>
                  </article>
                }
              </div>
            }
          </section>

          <section class="panel">
            <div class="panel-header">
              <h2>Quiz access</h2>
              <a routerLink="/student/courses">Open catalog</a>
            </div>

            @if (!quizzes().length) {
              <div class="empty-state">
                <h3>No quiz ready</h3>
                <p>Complete lessons to unlock your next quiz.</p>
              </div>
            } @else {
              <div class="stack">
                @for (item of quizzes().slice(0, 4); track item.quizId) {
                  <article class="item-card">
                    <div>
                      <h3>{{ item.quizTitle }}</h3>
                      <p>{{ item.courseTitle }}</p>
                    </div>
                    <div class="item-meta">
                      <span>{{ item.attemptsRemaining }} left</span>
                      <a class="btn small" [routerLink]="['/student/quizzes', item.quizId]">Take quiz</a>
                    </div>
                  </article>
                }
              </div>
            }
          </section>
        </div>

        <section class="panel certificate-panel">
          <div class="panel-header">
            <h2>Certificates</h2>
            <a routerLink="/student/certificates">View all</a>
          </div>

          @if (!certificates().length) {
            <div class="empty-state">
              <h3>No certificate yet</h3>
              <p>Finish a course to unlock your official certificate.</p>
            </div>
          } @else {
            <div class="certificate-grid">
              @for (certificate of certificates().slice(0, 4); track certificate.id) {
                <article class="certificate-card">
                  <div>
                    <p class="badge">Certified</p>
                    <h3>{{ certificate.courseTitle }}</h3>
                    <p>{{ certificate.completionDate | date:'mediumDate' }}</p>
                  </div>
                  <div class="item-meta">
                    <span>{{ certificate.certificateId }}</span>
                    <a class="btn small ghost" [routerLink]="['/student/certificates', certificate.id]">View</a>
                  </div>
                </article>
              }
            </div>
          }
        </section>
      }
    </section>
  `,
  styles: [`
    .profile-page { max-width: 1100px; }
    .topbar {
      display: flex; align-items: center; gap: 18px; padding: 24px 28px; background: linear-gradient(135deg, #eef6ff 0%, #fff 100%);
      border: 1px solid var(--color-neutral-200); border-radius: 18px; margin-bottom: 24px;
    }
    .avatar {
      width: 64px; height: 64px; border-radius: 50%; display: grid; place-items: center; background: var(--color-primary-600);
      color: white; font-weight: 800; font-size: 1.3rem;
    }
    .profile-copy { flex: 1; }
    .eyebrow { margin: 0; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-primary-600); font-size: 0.74rem; font-weight: 700; }
    h1 { margin: 6px 0 4px; font-size: clamp(1.8rem, 2vw, 2.4rem); }
    .muted { color: var(--color-neutral-500); margin: 0; }
    .btn {
      display: inline-flex; align-items: center; justify-content: center; border: 0; border-radius: 10px; padding: 10px 16px;
      background: var(--color-primary-600); color: white; text-decoration: none; font-weight: 700; cursor: pointer;
    }
    .btn.small { padding: 8px 12px; font-size: 0.8rem; }
    .btn.ghost { background: var(--color-neutral-100); color: var(--color-neutral-700); }
    .stats-grid {
      display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-bottom: 24px;
    }
    .stat-card, .panel, .certificate-card, .item-card {
      background: white; border: 1px solid var(--color-neutral-200); border-radius: 16px; box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04);
    }
    .stat-card { padding: 18px 20px; }
    .stat-card span { display: block; color: var(--color-neutral-500); font-size: 0.8rem; margin-bottom: 8px; }
    .stat-card strong { font-size: 1.9rem; color: var(--color-neutral-900); }
    .content-grid {
      display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; margin-bottom: 20px;
    }
    .panel { padding: 20px; }
    .panel-header {
      display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px;
    }
    .panel-header h2 { margin: 0; font-size: 1.12rem; }
    .panel-header a { color: var(--color-primary-700); text-decoration: none; font-weight: 600; }
    .stack { display: grid; gap: 12px; }
    .item-card { padding: 14px 16px; display: flex; justify-content: space-between; gap: 10px; }
    .item-card h3, .certificate-card h3 { margin: 0 0 4px; font-size: 1rem; }
    .item-card p, .certificate-card p { margin: 0; color: var(--color-neutral-500); font-size: 0.8rem; }
    .item-meta { display: flex; flex-direction: column; align-items: flex-end; justify-content: center; gap: 8px; }
    .empty-state {
      border: 1px dashed var(--color-neutral-300); border-radius: 12px; padding: 22px; background: var(--color-neutral-50); text-align: center;
    }
    .empty-state h3 { margin: 0 0 8px; }
    .empty-state p { margin: 0; color: var(--color-neutral-500); }
    .certificate-grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
    .certificate-card { padding: 16px; display: flex; flex-direction: column; justify-content: space-between; gap: 16px; }
    .badge {
      display: inline-flex; border-radius: 999px; padding: 5px 10px; background: #ecfdf5; color: #166534; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
    }
    .loading-state { padding: 32px; background: white; border: 1px solid var(--color-neutral-200); border-radius: 12px; }
    @media (max-width: 820px) { .stats-grid, .content-grid { grid-template-columns: 1fr 1fr; } } 
    @media (max-width: 620px) { .topbar, .item-card { flex-direction: column; align-items: flex-start; } .stats-grid, .content-grid { grid-template-columns: 1fr; } .item-meta { align-items: flex-start; } }
  `],
})
export class ProfileComponent implements OnInit {
  auth = inject(AuthService);
  private lms = inject(LmsService);
  private quizService = inject(QuizService);
  private certificateService = inject(CertificateService);
  private toast = inject(ToastService);

  loading = signal(true);
  enrollments = signal<Enrollment[]>([]);
  certificates = signal<Certificate[]>([]);
  quizzes = signal<ProfileQuizItem[]>([]);

  fullName = computed(() => {
    const user = this.auth.user();
    if (!user) return 'Student';
    return `${user.firstName} ${user.lastName}`.trim() || 'Student';
  });

  initials = computed(() => {
    const user = this.auth.user();
    if (!user) return 'S';
    return `${(user.firstName ?? '').charAt(0) || 'S'}${(user.lastName ?? '').charAt(0) || 'S'}`.toUpperCase();
  });

  summary = computed(() => {
    const items = this.enrollments();
    const completed = items.filter((entry) => entry.status === 'COMPLETED').length;
    const overallProgress = items.length
      ? Math.round(items.reduce((total, entry) => total + entry.progressPercentage, 0) / items.length)
      : 0;

    return {
      enrolledCourses: items.length,
      completedCourses: completed,
      certificates: this.certificates().length,
      overallProgress,
    };
  });

  async ngOnInit(): Promise<void> {
    try {
      const [enrollments, certificates] = await Promise.all([
        this.lms.myEnrollments(),
        this.certificateService.list(),
      ]);

      this.enrollments.set(enrollments);
      this.certificates.set(certificates);

      const quizzes: ProfileQuizItem[] = [];

      await Promise.all(
        enrollments.map(async (entry) => {
          try {
            const courseQuizzes = await this.quizService.listAvailable(entry.courseId);
            for (const quiz of courseQuizzes) {
              if (quiz.attemptsRemaining > 0) {
                quizzes.push({
                  courseId: entry.courseId,
                  courseTitle: entry.course?.title || 'Course',
                  quizId: quiz.id,
                  quizTitle: quiz.title,
                  attemptsRemaining: quiz.attemptsRemaining,
                });
              }
            }
          } catch {
            // Ignore per-course quiz errors so the rest of the profile still renders.
          }
        })
      );

      this.quizzes.set(quizzes.slice(0, 6));
    } catch {
      this.toast.error('Could not load your profile information.');
    } finally {
      this.loading.set(false);
    }
  }
}