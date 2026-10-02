import { Component } from '@angular/core';

@Component({
  selector: 'app-categories',
  template: `
    <section class="page">
      <h1>Categories</h1>
      <p class="muted">This screen is scaffolded. Backend APIs for this feature will be wired in a later phase.</p>
    </section>
  `,
  styles: [`
    .page { max-width: 960px; }
    h1 { margin: 0 0 8px; font-size: 1.75rem; color: var(--color-neutral-900); }
    .muted { color: var(--color-neutral-500); }
  `],
})
export class CategoriesComponent {}