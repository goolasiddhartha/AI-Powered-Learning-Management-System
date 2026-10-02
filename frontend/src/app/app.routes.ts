import { Routes } from '@angular/router';
import { DashboardShellComponent } from './layout/dashboard-shell/dashboard-shell.component';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'verify-certificate/:id',
    loadComponent: () => import('./features/certificates/verify-certificate.component').then(m => m.VerifyCertificateComponent),
  },
  {
    path: 'student',
    component: DashboardShellComponent,
    canActivate: [authGuard, roleGuard(['STUDENT'])],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/student/dashboard/dashboard.component').then(m => m.StudentDashboardComponent) },
      { path: 'courses', loadComponent: () => import('./features/student/courses/courses.component').then(m => m.StudentCoursesComponent) },
      { path: 'courses/:id', loadComponent: () => import('./features/student/course-detail/course-detail.component').then(m => m.CourseDetailComponent) },
      { path: 'courses/:id/learn', loadComponent: () => import('./features/student/learn/learn.component').then(m => m.LearnComponent) },
      { path: 'quizzes/:id', loadComponent: () => import('./features/student/quiz/quiz.component').then(m => m.QuizComponent) },
      { path: 'progress', loadComponent: () => import('./features/student/progress/progress.component').then(m => m.ProgressComponent) },
      { path: 'certificates', loadComponent: () => import('./features/student/certificates/certificates.component').then(m => m.CertificatesComponent) },
      { path: 'certificates/:id', loadComponent: () => import('./features/student/certificates/certificate-detail.component').then(m => m.CertificateDetailComponent) },
      { path: 'ai-tutor', loadComponent: () => import('./features/student/ai-tutor/ai-tutor.component').then(m => m.AiTutorComponent) },
      { path: 'recommendations', loadComponent: () => import('./features/student/recommendations/recommendations.component').then(m => m.RecommendationsComponent) },
      { path: 'profile', loadComponent: () => import('./features/student/profile/profile.component').then(m => m.ProfileComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  {
    path: 'instructor',
    component: DashboardShellComponent,
    canActivate: [authGuard, roleGuard(['INSTRUCTOR', 'ADMIN'])],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/instructor/dashboard/dashboard.component').then(m => m.InstructorDashboardComponent) },
      { path: 'courses', loadComponent: () => import('./features/instructor/courses/courses.component').then(m => m.InstructorCoursesComponent) },
      { path: 'courses/create', loadComponent: () => import('./features/instructor/course-form/course-form.component').then(m => m.CourseFormComponent) },
      { path: 'courses/:id/edit', loadComponent: () => import('./features/instructor/course-form/course-form.component').then(m => m.CourseFormComponent) },
      { path: 'courses/:id/lessons', loadComponent: () => import('./features/instructor/lessons/lessons.component').then(m => m.LessonsComponent) },
      { path: 'courses/:id/quizzes', loadComponent: () => import('./features/instructor/quizzes/quizzes.component').then(m => m.QuizzesComponent) },
      { path: 'courses/:id/students', loadComponent: () => import('./features/instructor/students/students.component').then(m => m.StudentsComponent) },
      { path: 'ai-tools', loadComponent: () => import('./features/instructor/ai-tools/ai-tools.component').then(m => m.AiToolsComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  {
    path: 'admin',
    component: DashboardShellComponent,
    canActivate: [authGuard, roleGuard(['ADMIN'])],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'users', loadComponent: () => import('./features/admin/users/users.component').then(m => m.UsersComponent) },
      { path: 'courses', loadComponent: () => import('./features/admin/courses/courses.component').then(m => m.AdminCoursesComponent) },
      { path: 'categories', loadComponent: () => import('./features/admin/categories/categories.component').then(m => m.CategoriesComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];
