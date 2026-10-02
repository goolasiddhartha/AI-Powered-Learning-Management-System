import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast toast-{{ toast.type }}" (click)="toastService.dismiss(toast.id)">
          <span class="toast-message">{{ toast.message }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      right: 20px;
      bottom: 20px;
      z-index: 1000;
      display: grid;
      gap: 8px;
    }
    .toast {
      min-width: 240px;
      max-width: 360px;
      padding: 12px 14px;
      border-radius: 8px;
      color: white;
      box-shadow: var(--shadow-md);
      cursor: pointer;
    }
    .toast-success { background: var(--color-success-600); }
    .toast-error { background: var(--color-error-600); }
    .toast-info { background: var(--color-neutral-800); }
  `],
})
export class ToastComponent {
  toastService = inject(ToastService);
}
