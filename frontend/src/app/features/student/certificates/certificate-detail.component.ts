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
    <section class="page">
      @if (certificate(); as item) {
        <article class="certificate">
          <div class="certificate-inner">
            <p class="eyebrow">CERTIFICATE</p>
            <p class="subtitle">O F &nbsp; C O M P L E T I O N</p>
            <p class="intro">This certificate is awarded to</p>
            <h1>{{ item.studentName }}</h1>
            <div class="name-rule"></div>
            <p class="course-label">for successfully completing</p>
            <h2>{{ item.courseTitle }}</h2>
            <p class="completion-date">at LearnAI on {{ item.completionDate | date:'longDate' }}</p>
            <div class="award-seal" aria-label="LearnAI completion seal"><span>LEARN</span><strong>AI</strong></div>
            <div class="signatures">
              <div><strong>{{ item.issuer }}</strong><span>ISSUED BY</span></div>
              <div><strong>{{ item.instructorName }}</strong><span>COURSE INSTRUCTOR</span></div>
            </div>
            <p class="id">Certificate ID: {{ item.certificateId }}</p>
          </div>
        </article>
        <div class="actions">
          <button class="btn" type="button" (click)="download()">Download PDF <span aria-hidden="true">↓</span></button>
          <a class="btn ghost" routerLink="/student/certificates">Back to certificates</a>
        </div>
      } @else if (loading()) {
        <p class="muted">Loading certificate…</p>
      }
    </section>
  `,
  styles: [`
    .certificate { max-width: 980px; min-height: 600px; margin: 20px auto 0; padding: 12px; border: 2px solid #c59a42; background: #fff; box-shadow: 0 12px 35px #27352b12; }
    .certificate-inner { min-height: 572px; padding: 45px 40px 18px; position: relative; display: flex; flex-direction: column; align-items: center; border: 1px solid #c59a42; outline: 3px solid #e2e0da; outline-offset: -9px; text-align: center; }
    .eyebrow { color: #393633; font: 3rem Georgia, 'Times New Roman', serif; letter-spacing: .19em; }
    .subtitle { margin-top: -2px; color: #494642; font-size: .62rem; font-weight: 800; letter-spacing: .25em; }
    .intro { margin-top: 30px; color: #62615d; font-size: .78rem; }
    h1 { max-width: 100%; margin-top: 26px; color: #393633; font: clamp(1.7rem, 4vw, 2.6rem) Georgia, 'Times New Roman', serif; overflow-wrap: anywhere; }
    .name-rule { width: min(400px, 70%); height: 1px; margin-top: 8px; background: linear-gradient(90deg, transparent, #c59a42, transparent); }
    .course-label { margin-top: 16px; color: #62615d; font-size: .72rem; }
    h2 { max-width: 100%; margin-top: 7px; color: #393633; font: 1.35rem Georgia, 'Times New Roman', serif; overflow-wrap: anywhere; }
    .completion-date { margin-top: 6px; color: #62615d; font-size: .68rem; }
    .award-seal { width: 57px; height: 57px; margin-top: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 2px solid #c59a42; border-radius: 50%; color: #805e1f; background: radial-gradient(circle, #fff8dd 0 52%, #edd89c 54% 65%, #fff 67%); font-size: .45rem; letter-spacing: .08em; }
    .award-seal strong { font-size: .63rem; }
    .signatures { width: 100%; max-width: 620px; margin-top: auto; display: flex; justify-content: space-between; gap: 25px; }
    .signatures > div { width: 39%; padding-top: 8px; display: grid; gap: 4px; border-top: 1px solid #c59a42; color: #494642; }
    .signatures strong { overflow-wrap: anywhere; font-size: .58rem; }.signatures span { color: #77746c; font-size: .48rem; letter-spacing: .16em; }
    .id { margin-top: 13px; color: #77746c; font: .48rem monospace; }
    .actions { display: flex; justify-content: center; flex-wrap: wrap; gap: 8px; margin: 17px 0 30px; }
    .btn { min-height: 38px; padding: 0 14px; display: inline-flex; align-items: center; gap: 8px; border: 0; border-radius: 999px; background: #315d4f; color: white; font: inherit; font-size: .65rem; font-weight: 700; cursor: pointer; text-decoration: none; }.btn.ghost { background: #f0f1eb; color: #43553d; }
    .muted { color: #7e8079; }
    @media (max-width: 600px) { .certificate { min-height: 520px; padding: 8px; }.certificate-inner { min-height: 500px; padding: 42px 20px 16px; }.eyebrow { font-size: 1.8rem; }.intro { margin-top: 24px; }.signatures { gap: 12px; }.signatures strong { font-size: .5rem; } }
    @media print { .actions { display: none; }.certificate { max-width: none; margin: 0; box-shadow: none; break-inside: avoid; } }
  `],
})
export class CertificateDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private certificates = inject(CertificateService);
  private toast = inject(ToastService);

  certificate = signal<Certificate | null>(null);
  loading = signal(true);

  async ngOnInit(): Promise<void> {
    try {
      this.certificate.set(await this.certificates.get(this.route.snapshot.paramMap.get('id')!));
    } catch {
      this.toast.error('Certificate not found');
    } finally {
      this.loading.set(false);
    }
  }

  async download(): Promise<void> {
    const item = this.certificate();
    if (!item) return;
    try {
      await this.certificates.download(item);
    } catch {
      this.toast.error('Could not download certificate');
    }
  }
}
