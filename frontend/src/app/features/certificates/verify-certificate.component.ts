import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CertificateVerification } from '../../core/models';
import { CertificateService } from '../../core/services/certificate.service';

@Component({
  selector: 'app-verify-certificate',
  imports: [FormsModule, DatePipe],
  template: `
    <section class="page verify"><h1>Verify a certificate</h1><p class="muted">Enter the certificate identifier to confirm its authenticity.</p>
      <form (ngSubmit)="verify()"><input name="certificateId" [(ngModel)]="certificateId" placeholder="CERT-YYYYMMDD-XXXXXXXX" required><button class="btn">Verify</button></form>
      @if (error()) { <p class="error">{{ error() }}</p> } @if (result(); as item) { <article class="card"><h2>Certificate verified</h2><p><strong>{{ item.studentName }}</strong> completed <strong>{{ item.courseTitle }}</strong>.</p><p>Instructor: {{ item.instructorName }} · {{ item.completionDate | date:'longDate' }}</p><p class="muted">{{ item.certificateId }} · {{ item.issuer }}</p></article> }
    </section>
  `,
  styles: [`.verify { max-width: 700px; margin: 40px auto; } form { display: flex; gap: 8px; } input { flex: 1; padding: 11px; border: 1px solid var(--color-neutral-300); border-radius: 8px; } .btn { border: 0; border-radius: 8px; padding: 11px 16px; background: var(--color-primary-600); color: white; font-weight: 700; } .card { margin-top: 24px; padding: 20px; background: white; border: 1px solid var(--color-neutral-200); border-radius: 12px; } .muted { color: var(--color-neutral-500); } .error { color: #b42318; }`],
})
export class VerifyCertificateComponent {
  private route = inject(ActivatedRoute); private certificates = inject(CertificateService);
  certificateId = this.route.snapshot.paramMap.get('id') ?? ''; result = signal<CertificateVerification | null>(null); error = signal('');
  async verify(): Promise<void> { this.error.set(''); this.result.set(null); try { this.result.set(await this.certificates.verify(this.certificateId.trim())); } catch { this.error.set('Certificate could not be verified.'); } }
}
