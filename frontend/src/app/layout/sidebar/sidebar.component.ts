import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles: string[];
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" [class.open]="open()">
      @for (group of navGroups(); track group.label) {
        <div class="nav-group">
          <span class="nav-group-label">{{ group.label }}</span>
          @for (item of group.items; track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="active"
              class="nav-item"
            >
              <span class="nav-icon" [innerHTML]="getIcon(item.icon)"></span>
              <span class="nav-label">{{ item.label }}</span>
            </a>
          }
        </div>
      }
    </aside>
    @if (open()) {
      <div class="sidebar-overlay" (click)="open.set(false)"></div>
    }
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-width);
      background: #fffefa;
      border-right: 1px solid #eae9e2;
      padding: 16px 0;
      overflow-y: auto;
      height: calc(100vh - var(--navbar-height));
      position: sticky;
      top: var(--navbar-height);
      flex-shrink: 0;
      transition: transform 0.3s ease;
      box-shadow: 4px 0 20px #27352b05;
    }
    .nav-group { margin-bottom: 24px; }
    .nav-group-label {
      display: block;
      padding: 0 24px;
      margin-bottom: 8px;
      font-size: 0.6875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #92958a;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 24px;
      font-size: 0.875rem;
      color: #686c63;
      transition: all 0.2s ease;
      border-left: 3px solid transparent;
      border-radius: 0 999px 999px 0;
      margin-right: 12px;
    }
    .nav-item:hover {
      background: #f2f3ec;
      color: #315d4f;
    }
    .nav-item.active {
      background: #e9eee3;
      color: #315d4f;
      border-left-color: #76936b;
      font-weight: 600;
    }
    .nav-icon { display: flex; width: 20px; height: 20px; align-items: center; }
    .sidebar-overlay { display: none; }
    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        z-index: 99;
        transform: translateX(-100%);
      }
      .sidebar.open { transform: translateX(0); }
      .sidebar-overlay {
        display: block;
        position: fixed;
        inset: var(--navbar-height) 0 0 0;
        background: rgba(0,0,0,0.3);
        z-index: 98;
      }
    }
  `],
})
export class SidebarComponent {
  auth = inject(AuthService);
  open = signal(false);

  navGroups = signal<{ label: string; items: NavItem[] }[]>([]);

  constructor() {
    window.addEventListener('toggle-sidebar', () => this.open.update(v => !v));
    this.buildNav();
  }

  private buildNav(): void {
    const role = this.auth.role();
    const groups: { label: string; items: NavItem[] }[] = [];

    if (role === 'STUDENT') {
      groups.push({
        label: 'Learning',
        items: [
          { label: 'Dashboard', icon: 'home', route: '/student/dashboard', roles: ['STUDENT'] },
          { label: 'Profile', icon: 'user', route: '/student/profile', roles: ['STUDENT'] },
          { label: 'Browse Courses', icon: 'book', route: '/student/courses', roles: ['STUDENT'] },
          { label: 'My Progress', icon: 'chart', route: '/student/progress', roles: ['STUDENT'] },
          { label: 'Certificates', icon: 'certificate', route: '/student/certificates', roles: ['STUDENT'] },
          { label: 'AI Recommendations', icon: 'star', route: '/student/recommendations', roles: ['STUDENT'] },
        ],
      });
      groups.push({
        label: 'AI Tools',
        items: [
          { label: 'AI Tutor', icon: 'chat', route: '/student/ai-tutor', roles: ['STUDENT'] },
        ],
      });
    } else if (role === 'INSTRUCTOR') {
      groups.push({
        label: 'Teaching',
        items: [
          { label: 'Dashboard', icon: 'home', route: '/instructor/dashboard', roles: ['INSTRUCTOR'] },
          { label: 'My Courses', icon: 'book', route: '/instructor/courses', roles: ['INSTRUCTOR'] },
          { label: 'Create Course', icon: 'plus', route: '/instructor/courses/create', roles: ['INSTRUCTOR'] },
        ],
      });
      groups.push({
        label: 'AI Tools',
        items: [
          { label: 'AI Tools', icon: 'sparkles', route: '/instructor/ai-tools', roles: ['INSTRUCTOR'] },
        ],
      });
    } else if (role === 'ADMIN') {
      groups.push({
        label: 'Administration',
        items: [
          { label: 'Dashboard', icon: 'home', route: '/admin/dashboard', roles: ['ADMIN'] },
          { label: 'Users', icon: 'users', route: '/admin/users', roles: ['ADMIN'] },
          { label: 'Courses', icon: 'book', route: '/admin/courses', roles: ['ADMIN'] },
          { label: 'Categories', icon: 'tag', route: '/admin/categories', roles: ['ADMIN'] },
        ],
      });
    }

    this.navGroups.set(groups);
  }

  getIcon(name: string): string {
    const icons: Record<string, string> = {
      home: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
      book: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
      chart: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
      star: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
      chat: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
      plus: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
      sparkles: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z"/></svg>',
      users: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      tag: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
      user: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>',
      certificate: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l2.5 4.5L19 8l-4.5 1.5L12 14l-2.5-4.5L5 8l4.5-1.5L12 2z"/><path d="M7 18h10v2H7z"/><path d="M8 14h8v4H8z"/></svg>',
    };
    return icons[name] || icons['book'];
  }
}
