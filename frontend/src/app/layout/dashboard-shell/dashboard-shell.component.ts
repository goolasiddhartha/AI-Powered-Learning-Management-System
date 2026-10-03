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
      background: #fbfaf8;
    }
    .main-content {
      flex: 1;
      padding: 26px clamp(18px, 3vw, 42px);
      min-width: 0;
      background:
        radial-gradient(ellipse at 92% 0%, #e8eddf55, transparent 32rem),
        #fbfaf8;
    }
    @media (max-width: 768px) {
      .main-content { padding: 18px 16px; }
    }
  `],
})
export class DashboardShellComponent {}
