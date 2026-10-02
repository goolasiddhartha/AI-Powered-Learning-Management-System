import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard-shell',
  imports: [RouterOutlet, NavbarComponent, SidebarComponent],
  template: `
    <app-navbar />
    <div class="shell">
      <app-sidebar />
      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .shell {
      display: flex;
      min-height: calc(100vh - var(--navbar-height));
    }
    .main-content {
      flex: 1;
      padding: 32px;
      min-width: 0;
    }
    @media (max-width: 768px) {
      .main-content { padding: 16px; }
    }
  `],
})
export class DashboardShellComponent {}
