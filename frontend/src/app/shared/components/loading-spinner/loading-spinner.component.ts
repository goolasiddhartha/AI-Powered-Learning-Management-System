import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="loading-container" [class.inline]="inline">
      <div class="spinner" [class.spinner-sm]="size === 'sm'" [class.spinner-lg]="size === 'lg'"></div>
      @if (message) {
        <p class="loading-text">{{ message }}</p>
      }
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 48px;
    }
    .loading-container.inline { padding: 24px; }
    .loading-text { color: var(--color-neutral-500); font-size: 0.875rem; }
  `],
})
export class LoadingSpinnerComponent {
  @Input() message = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() inline = false;
}
