import { Component, signal, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { getHomeRoute } from '../../core/guards/auth.guard';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  template: `
    <nav class="navbar">
      <div class="navbar-left">
        <button class="menu-toggle" (click)="toggleSidebar()" aria-label="Toggle menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <a routerLink="/" class="logo">
          <span class="logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </span>
          <span class="logo-text">LearnAI</span>
        </a>
      </div>

      <div class="navbar-right">
        <div class="user-menu" (click)="toggleUserMenu()" >
          <div class="user-avatar">{{ auth.initials() || '?' }}</div>
          <div class="user-info hide-mobile">
            <span class="user-name">{{ auth.fullName() || 'User' }}</span>
            <span class="user-role">{{ auth.role() }}</span>
          </div>
          @if (showUserMenu()) {
            <div class="dropdown-menu" (click)="$event.stopPropagation()">
              <a routerLink="/student/profile" class="dropdown-item" (click)="showUserMenu.set(false)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Profile
              </a>
              <button class="dropdown-item logout" (click)="handleLogout()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign Out
              </button>
            </div>
          }
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      height: var(--navbar-height);
      background: #fffefa;
      border-bottom: 1px solid #eae9e2;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 4px 18px #27352b08;
    }
    .navbar-left { display: flex; align-items: center; gap: 16px; }
    .menu-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
      border-radius: var(--radius-md);
      color: #52734e;
      transition: background 0.2s;
    }
    .menu-toggle:hover { background: #edf1e7; }
    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
      font-size: 1.25rem;
      color: #315d4f;
    }
    .logo-icon { width: 31px; height: 31px; display: grid; place-items: center; border-radius: 10px 10px 10px 4px; color: #e7f2c8; background: #315d4f; }
    .navbar-right { display: flex; align-items: center; gap: 16px; }
    .user-menu {
      position: relative;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 12px;
      border-radius: 999px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .user-menu:hover { background: #f0f1eb; }
    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #315d4f;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
    }
    .user-info { display: flex; flex-direction: column; }
    .user-name { font-size: 0.875rem; font-weight: 600; color: #29352c; }
    .user-role { font-size: 0.75rem; color: #81847b; }
    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 8px;
      background: #fffefa;
      border: 1px solid #eae9e2;
      border-radius: 13px;
      box-shadow: 0 16px 35px #26352a18;
      min-width: 180px;
      overflow: hidden;
      z-index: 200;
    }
    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      width: 100%;
      text-align: left;
      font-size: 0.875rem;
      color: #4c5149;
      transition: background 0.15s;
    }
    .dropdown-item:hover { background: #f5f5ef; }
    .dropdown-item.logout { color: var(--color-error-600); }
  `],
})
export class NavbarComponent {
  auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  showUserMenu = signal(false);
  sidebarOpen = signal(false);

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
    window.dispatchEvent(new CustomEvent('toggle-sidebar'));
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(v => !v);
  }

  handleLogout(): void {
    this.showUserMenu.set(false);
    this.auth.logout();
    this.toast.info('You have been signed out');
  }
}
