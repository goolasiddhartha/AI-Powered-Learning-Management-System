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
    <section class="page">
      <header class="page-header">
        <span class="eyebrow">YOUR LEARNING MILESTONES</span>
        <h1>My certificates</h1>
        <p class="muted">Every certificate is awarded automatically when you complete a course.</p>
      </header>
      @if (loading()) {
        <p class="muted">Loading certificates…</p>
      } @else if (!items().length) {
        <div class="empty">
          <span class="empty-seal" aria-hidden="true">✦</span>
          <h2>Your first certificate is waiting.</h2>
          <p>Finish all published lessons and any required quizzes in an enrolled course. LearnAI will create your certificate using your registered name.</p>
          <a routerLink="/student/courses" class="btn">Explore my courses <span aria-hidden="true">↗</span></a>
        </div>
      } @else {
        <div class="list">
          @for (certificate of items(); track certificate.id) {
            <article class="certificate-card">
              <div class="certificate-mark" aria-hidden="true"><span>✦</span></div>
              <div class="certificate-copy">
                <span class="earned-label">CERTIFICATE OF COMPLETION</span>
                <h2>{{ certificate.courseTitle }}</h2>
                <p class="recipient">Awarded to <strong>{{ certificate.studentName }}</strong></p>
                <p class="muted">Completed {{ certificate.completionDate | date:'longDate' }} <span class="separator">·</span> {{ certificate.instructorName }}</p>
                <span class="id">{{ certificate.certificateId }}</span>
              </div>
              <div class="actions">
                <a class="btn ghost" [routerLink]="['/student/certificates', certificate.id]">View certificate</a>
                <button class="btn" type="button" (click)="download(certificate)">Download PDF <span aria-hidden="true">↓</span></button>
              </div>
            </article>
          }
        </div>
      }
    </section>
  `,
  styles: [`
    .page-header { margin-bottom: 22px; }
    .eyebrow, .earned-label { color: #718361; font-size: .58rem; font-weight: 800; letter-spacing: .13em; }
    h1 { margin: 6px 0; color: #29352c; font-size: 1.9rem; letter-spacing: -.06em; }
    .muted { color: #7e8079; font-size: .78rem; }
    .list { display: grid; gap: 12px; }
    .certificate-card { min-width: 0; padding: 18px; display: grid; grid-template-columns: 48px minmax(0, 1fr) auto; align-items: center; gap: 16px; border: 1px solid #e9e8df; border-radius: 14px; background: #fffefa; box-shadow: 0 7px 20px #27352b06; animation: rise-in .45s both; }
    .certificate-mark { width: 46px; height: 46px; display: grid; place-items: center; border: 1px solid #d4b66f; border-radius: 50%; color: #9b792d; background: radial-gradient(circle, #fff9e8 0 48%, #ead9a8 50% 57%, #fff 60%); font-size: 1.15rem; }
    .certificate-copy { min-width: 0; }.earned-label { font-size: .5rem; }.certificate-copy h2 { margin-top: 5px; color: #29352c; font-size: 1rem; letter-spacing: -.035em; }
    .recipient { margin-top: 5px; color: #6f7268; font-size: .67rem; }.recipient strong { color: #3b4638; }
    .certificate-copy .muted { margin-top: 5px; font-size: .59rem; }.separator { padding: 0 4px; color: #b7b6ac; }
    .id { margin-top: 8px; display: inline-block; color: #718361; font: .55rem monospace; }
    .actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 7px; }
    .btn { min-height: 35px; padding: 0 11px; display: inline-flex; align-items: center; justify-content: center; gap: 7px; border: 0; border-radius: 999px; color: white; background: #315d4f; cursor: pointer; font: inherit; font-size: .58rem; font-weight: 700; text-decoration: none; transition: transform .2s ease, background .2s ease; }
    .btn:hover { transform: translateY(-1px); background: #25483d; }.btn.ghost { color: #315d4f; border: 1px solid #dce5d7; background: #f8f9f4; }.btn.ghost:hover { background: #eff3e9; }
    .empty { max-width: 620px; margin: 34px auto; padding: 36px 26px; border: 1px solid #e9e8df; border-radius: 16px; text-align: center; background: #fffefa; }
    .empty-seal { width: 48px; height: 48px; margin: 0 auto 12px; display: grid; place-items: center; border: 1px solid #e0d0a6; border-radius: 50%; color: #9b792d; background: #fbf6e8; font-size: 1.2rem; }
    .empty h2 { color: #29352c; font-size: 1.1rem; letter-spacing: -.04em; }.empty p { max-width: 430px; margin: 8px auto 16px; color: #7e8079; font-size: .68rem; line-height: 1.7; }
    @keyframes rise-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @media (max-width: 720px) { .certificate-card { grid-template-columns: 42px minmax(0, 1fr); gap: 12px; }.certificate-mark { width: 40px; height: 40px; }.actions { grid-column: 2; justify-content: flex-start; } }
    @media (max-width: 440px) { .certificate-card { padding: 13px; }.actions { flex-direction: column; align-items: stretch; }.actions .btn { width: 100%; } }
    @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; } }
  `],
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
