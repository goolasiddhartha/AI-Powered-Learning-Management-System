import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Certificate } from '../../../core/models';
import { CertificateService } from '../../../core/services/certificate.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-certificates',
  imports: [RouterLink, DatePipe],
  template: `
    <section class="page"><h1>My Certificates</h1><p class="muted">Verified certificates earned from completed courses.</p>
      @if (loading()) { <p class="muted">Loading certificates…</p> }
      @else if (!items().length) { <div class="empty"><h2>No certificates yet</h2><p>Complete an enrolled course to earn your first certificate.</p></div> }
      @else { <div class="list">@for (certificate of items(); track certificate.id) {
        <article class="card"><h2>{{ certificate.courseTitle }}</h2><p class="muted">Completed {{ certificate.completionDate | date:'longDate' }}</p><span class="id">{{ certificate.certificateId }}</span>
          <div class="actions"><a class="btn ghost" [routerLink]="['/student/certificates', certificate.id]">View details</a><button class="btn" (click)="download(certificate)">Download PDF</button></div>
        </article>
      }</div> }
    </section>
  `,
  styles: [`.muted { color: var(--color-neutral-500); } .list { display: grid; gap: 14px; } .card, .empty { background: white; border: 1px solid var(--color-neutral-200); border-radius: 12px; padding: 18px; } .id { font: 0.8rem monospace; color: var(--color-primary-700); } .actions { display: flex; gap: 8px; margin-top: 14px; } .btn { border: 0; cursor: pointer; padding: 9px 12px; border-radius: 8px; background: var(--color-primary-600); color: white; font-weight: 700; text-decoration: none; } .btn.ghost { background: var(--color-neutral-100); color: var(--color-neutral-700); }`],
})
export class CertificatesComponent implements OnInit {
  private certificates = inject(CertificateService);
  private toast = inject(ToastService);
  items = signal<Certificate[]>([]);
  loading = signal(true);
  async ngOnInit(): Promise<void> {
    try { this.items.set(await this.certificates.list()); } catch { this.toast.error('Could not load certificates'); } finally { this.loading.set(false); }
  }
  async download(certificate: Certificate): Promise<void> {
    try { await this.certificates.download(certificate); } catch { this.toast.error('Could not download certificate'); }
  }
}
