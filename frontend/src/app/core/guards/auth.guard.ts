import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.loading()) return true;

  if (!auth.isAuthenticated()) {
    router.navigate(['/login'], { queryParams: { redirect: state.url } });
    return false;
  }
  return true;
};

export const roleGuard = (allowedRoles: string[]): CanActivateFn => (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.loading()) return true;

  if (!auth.isAuthenticated()) {
    router.navigate(['/login'], { queryParams: { redirect: state.url } });
    return false;
  }

  const userRole = auth.role();
  if (!userRole || !allowedRoles.includes(userRole)) {
    const homeRoute = getHomeRoute(userRole);
    router.navigate([homeRoute]);
    return false;
  }
  return true;
};

export function getHomeRoute(role: string | null | undefined): string {
  switch (role) {
    case 'ADMIN': return '/admin/dashboard';
    case 'INSTRUCTOR': return '/instructor/dashboard';
    case 'STUDENT': return '/student/dashboard';
    default: return '/login';
  }
}
