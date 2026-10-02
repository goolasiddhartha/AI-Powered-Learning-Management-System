import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Certificate } from '../../../core/models';
import { CertificateService } from '../../../core/services/certificate.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-certificate-detail',
  imports: [RouterLink, DatePipe],
  template: `
    <section class="page">@if (certificate(); as item) { <article class="certificate">
      <p class="eyebrow">Certificate of Completion</p><h1>{{ item.courseTitle }}</h1><p class="lead">Awarded to <strong>{{ item.studentName }}</strong></p>
      <p>Completed {{ item.completionDate | date:'longDate' }} under {{ item.instructorName }}.</p><p class="id">{{ item.certificateId }}</p>
      <div class="actions"><button class="btn" (click)="download()">Download PDF</button><a class="btn ghost" routerLink="/student/certificates">Back</a></div>
    </article> } @else if (loading()) { <p>Loading certificate…</p> }</section>
  `,
  styles: [`.certificate { max-width: 760px; margin: 20px auto; padding: 56px 40px; text-align: center; background: white; border: 8px solid var(--color-primary-100); border-radius: 12px; } h1 { color: var(--color-primary-700); } .eyebrow { text-transform: uppercase; letter-spacing: .12em; color: var(--color-primary-600); font-weight: 700; } .lead { font-size: 1.2rem; } .id { font-family: monospace; } .actions { display: flex; justify-content: center; gap: 8px; margin-top: 24px; } .btn { border: 0; cursor: pointer; padding: 10px 14px; border-radius: 8px; background: var(--color-primary-600); color: white; font-weight: 700; text-decoration: none; } .ghost { background: var(--color-neutral-100); color: var(--color-neutral-700); }`],
})
export class CertificateDetailComponent implements OnInit {
  private route = inject(ActivatedRoute); private certificates = inject(CertificateService); private toast = inject(ToastService);
  certificate = signal<Certificate | null>(null); loading = signal(true);
  async ngOnInit(): Promise<void> { try { this.certificate.set(await this.certificates.get(this.route.snapshot.paramMap.get('id')!)); } catch { this.toast.error('Certificate not found'); } finally { this.loading.set(false); } }
  async download(): Promise<void> { const item = this.certificate(); if (!item) return; try { await this.certificates.download(item); } catch { this.toast.error('Could not download certificate'); } }
}
