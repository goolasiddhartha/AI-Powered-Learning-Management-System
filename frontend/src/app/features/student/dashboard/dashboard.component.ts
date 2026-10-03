import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LmsService, ProgressSummary, RecommendationsData } from '../../../core/services/lms.service';

@Component({
  selector: 'app-student-dashboard',
  imports: [RouterLink],
  template: `
    <section class="dashboard">
      <header class="welcome-banner">
        <div class="banner-glow" aria-hidden="true"></div>
        <div class="banner-copy">
          <span class="eyebrow"><span class="live-dot"></span> YOUR LEARNING SPACE</span>
          <h1>Welcome back, <span>{{ firstName() }}.</span></h1>
          <p>Every lesson is a step forward. Ready to keep that momentum going?</p>
          <div class="banner-actions">
            <a routerLink="/student/courses" class="button button-lime">Explore courses <span aria-hidden="true">↗</span></a>
            <a routerLink="/student/ai-tutor" class="button button-glass"><span aria-hidden="true">✧</span> Ask your AI tutor</a>
          </div>
        </div>
        <div class="banner-art" aria-hidden="true">
          <span class="art-orbit orbit-one"></span>
          <span class="art-orbit orbit-two"></span>
          <span class="art-sparkle sparkle-one">✳</span>
          <span class="art-sparkle sparkle-two">✦</span>
          <div class="art-book"><span>LEARN<br />A LITTLE<br />EVERY DAY</span><i>✧</i></div>
          <div class="art-note"><span>✦</span> Your next chapter</div>
        </div>
      </header>

      <div class="stats-grid" aria-label="Your learning statistics">
        <article class="stat-card">
          <span class="stat-icon icon-green" aria-hidden="true">▤</span>
          <div class="stat-content"><strong>{{ summary()?.enrolledCourses || 0 }}</strong><span>Courses you're taking</span></div>
          <span class="stat-decoration" aria-hidden="true">01</span>
        </article>
        <article class="stat-card">
          <span class="stat-icon icon-lime" aria-hidden="true">↗</span>
          <div class="stat-content"><strong>{{ summary()?.overallProgress || 0 }}<small>%</small></strong><span>Overall progress</span></div>
          <span class="stat-decoration" aria-hidden="true">02</span>
        </article>
        <article class="stat-card">
          <span class="stat-icon icon-peach" aria-hidden="true">✧</span>
          <div class="stat-content"><strong>{{ summary()?.totalLessonsCompleted || 0 }}</strong><span>Lessons completed</span></div>
          <span class="stat-decoration" aria-hidden="true">03</span>
        </article>
      </div>

      @if (recs()?.summary) {
        <section class="recommendation-card">
          <div class="recommendation-icon" aria-hidden="true">✦</div>
          <div class="recommendation-copy">
            <span class="section-kicker">A THOUGHTFUL NEXT STEP</span>
            <h2>Picked for your learning journey</h2>
            <p>{{ recs()?.summary }}</p>
          </div>
          <a routerLink="/student/recommendations" class="text-link">See recommendation <span aria-hidden="true">↗</span></a>
        </section>
      }

      <section class="courses-section">
        <div class="section-heading">
          <div>
            <span class="section-kicker">PICK UP WHERE YOU LEFT OFF</span>
            <h2>Continue learning</h2>
          </div>
          <a routerLink="/student/courses" class="text-link">Browse all courses <span aria-hidden="true">↗</span></a>
        </div>

        @if (!(summary()?.courses?.length)) {
          <div class="empty-state">
            <div class="empty-icon" aria-hidden="true">✧</div>
            <h3>Your next great idea starts with a course.</h3>
            <p>Explore the course library and find something that sparks your curiosity.</p>
            <a routerLink="/student/courses" class="button button-green">Explore courses <span aria-hidden="true">↗</span></a>
          </div>
        } @else {
          <div class="course-grid">
            @for (course of summary()!.courses; track course.courseId) {
              <a class="course-card" [routerLink]="['/student/courses', course.courseId, 'learn']">
                <div class="course-art">
                  <span class="course-art-mark" aria-hidden="true">✳</span>
                  <span class="course-art-caption">YOUR LEARNING JOURNEY</span>
                  <span class="course-art-arrow" aria-hidden="true">↗</span>
                </div>
                <div class="course-details">
                  <span class="course-label">IN PROGRESS</span>
                  <h3>{{ course.courseTitle }}</h3>
                  <div class="progress-meta"><span>{{ course.completedLessons }} of {{ course.totalLessons }} lessons</span><strong>{{ course.progressPercentage }}%</strong></div>
                  <div class="progress-track" role="progressbar" [attr.aria-valuenow]="course.progressPercentage" aria-valuemin="0" aria-valuemax="100" [attr.aria-label]="course.courseTitle + ' progress'">
                    <span [style.width.%]="course.progressPercentage"></span>
                  </div>
                  <div class="course-continue">Continue course <span aria-hidden="true">→</span></div>
                </div>
              </a>
            }
          </div>
        }
      </section>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .dashboard { --green: #315d4f; --ink: #252722; --muted: #7e8079; max-width: 1230px; margin: 0 auto; padding: 4px 0 50px; color: var(--ink); animation: dashboard-in .55s ease both; }
    .welcome-banner { min-height: 265px; padding: 34px 42px; position: relative; isolation: isolate; overflow: hidden; display: flex; align-items: center; justify-content: space-between; border-radius: 19px; color: white; background: #20392f; }
    .welcome-banner::before { content: ''; position: absolute; inset: 0; z-index: -1; opacity: .16; background-image: radial-gradient(#fff .65px, transparent .65px); background-size: 21px 21px; mask-image: linear-gradient(90deg, transparent, black 50%, transparent); }
    .banner-glow { width: 430px; height: 430px; position: absolute; z-index: -1; top: -230px; left: 25%; border-radius: 50%; background: radial-gradient(circle, #71906b64, transparent 68%); animation: glow-drift 12s ease-in-out infinite alternate; }
    .banner-copy { position: relative; z-index: 1; max-width: 620px; animation: copy-in .65s .08s both; }
    .eyebrow, .section-kicker { display: inline-flex; align-items: center; gap: 9px; font-size: .61rem; font-weight: 800; letter-spacing: .13em; }
    .eyebrow { color: #d1decc; }
    .live-dot { width: 7px; height: 7px; border-radius: 50%; background: #d7ed9d; box-shadow: 0 0 0 5px #d7ed9d22; animation: pulse 2.4s ease-in-out infinite; }
    h1 { margin: 15px 0 9px; font-size: clamp(2rem, 4vw, 3.15rem); line-height: 1.05; letter-spacing: -.07em; font-weight: 600; }
    h1 span { color: #d7ed9d; }
    .banner-copy > p { color: #d1dbd2; font-size: .83rem; line-height: 1.7; }
    .banner-actions { margin-top: 21px; display: flex; flex-wrap: wrap; gap: 10px; }
    .button { min-height: 41px; padding: 0 16px; display: inline-flex; align-items: center; justify-content: center; gap: 9px; border-radius: 999px; font-size: .68rem; font-weight: 700; transition: transform .2s ease, box-shadow .2s ease, background .2s ease; }
    .button:hover { transform: translateY(-2px); box-shadow: 0 8px 18px #1124192e; }
    .button-lime { color: #293325; background: #d8ee9b; }
    .button-glass { color: white; border: 1px solid #ffffff44; background: #ffffff0c; }
    .button-glass:hover { background: #ffffff18; }
    .banner-art { width: 280px; height: 220px; flex: 0 0 auto; position: relative; display: grid; place-items: center; animation: art-in .8s .15s both; }
    .art-orbit { position: absolute; border: 1px solid #e7f2dc20; border-radius: 50%; }
    .orbit-one { width: 205px; height: 205px; animation: orbit 60s linear infinite; }
    .orbit-two { width: 156px; height: 156px; border-style: dashed; animation: orbit 70s linear infinite reverse; }
    .art-sparkle { position: absolute; color: #d8ee9b; }
    .sparkle-one { top: 18px; right: 44px; font-size: 1.2rem; animation: spin 18s linear infinite; }
    .sparkle-two { left: 22px; bottom: 38px; font-size: .9rem; animation: bob 4s ease-in-out infinite; }
    .art-book { width: 120px; height: 148px; padding: 18px 14px; position: relative; z-index: 1; display: flex; align-items: flex-end; border: 1px solid #ffffff36; border-radius: 7px 15px 15px 7px; color: #f6f1df; background: linear-gradient(145deg, #71896a, #9baa72); box-shadow: 12px 15px 30px #0d211b40; transform: rotate(7deg); animation: book-float 6s ease-in-out infinite; }
    .art-book::before { content: ''; position: absolute; top: 0; bottom: 0; left: 9px; width: 1px; background: #ffffff40; }
    .art-book span { font-size: .72rem; font-weight: 800; line-height: 1.08; letter-spacing: -.03em; }
    .art-book i { position: absolute; top: 12px; right: 13px; color: #eff4c8; font-size: 1rem; font-style: normal; }
    .art-note { position: absolute; z-index: 2; right: 0; bottom: 21px; padding: 10px 12px; display: flex; align-items: center; gap: 7px; border: 1px solid #ffffff33; border-radius: 10px; color: #f5f6ed; background: #ffffff16; font-size: .61rem; box-shadow: 0 8px 20px #14261a2e; backdrop-filter: blur(8px); animation: note-float 5s ease-in-out infinite; }
    .art-note span { color: #d8ee9b; }
    .stats-grid { margin-top: 17px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
    .stat-card { min-height: 102px; padding: 17px 19px; position: relative; overflow: hidden; display: flex; align-items: center; gap: 13px; border: 1px solid #ecebe5; border-radius: 14px; background: #fffefa; transition: transform .22s ease, box-shadow .22s ease; animation: card-in .55s both; }
    .stat-card:nth-child(2) { animation-delay: .08s; }.stat-card:nth-child(3) { animation-delay: .16s; }
    .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 26px #28372b0d; }
    .stat-icon { width: 39px; height: 39px; flex: 0 0 auto; display: grid; place-items: center; border-radius: 12px; font-size: 1rem; }
    .icon-green { color: #52734e; background: #e6eee2; }.icon-lime { color: #6c7e45; background: #eef1d9; }.icon-peach { color: #a36748; background: #f4e8dc; }
    .stat-content { display: grid; gap: 3px; }
    .stat-content strong { color: #29352c; font-size: 1.62rem; line-height: 1; letter-spacing: -.06em; }
    .stat-content strong small { font-size: .95rem; }
    .stat-content > span { color: var(--muted); font-size: .65rem; }
    .stat-decoration { position: absolute; right: 14px; bottom: -10px; color: #315d4f09; font-size: 3.3rem; font-weight: 800; letter-spacing: -.1em; }
    .recommendation-card { margin-top: 16px; padding: 19px 22px; display: flex; align-items: center; gap: 15px; border: 1px solid #e9eadc; border-radius: 14px; background: linear-gradient(105deg, #f2f3e8, #fbfaf5); animation: card-in .55s .1s both; }
    .recommendation-icon { width: 40px; height: 40px; flex: 0 0 auto; display: grid; place-items: center; border-radius: 12px; color: #657c4d; background: #e4ebd7; font-size: 1.05rem; }
    .recommendation-copy { min-width: 0; flex: 1; }
    .section-kicker { color: #718361; font-size: .53rem; }
    .recommendation-copy h2 { margin-top: 4px; font-size: .94rem; letter-spacing: -.035em; }
    .recommendation-copy p { margin-top: 4px; color: #777870; font-size: .68rem; line-height: 1.6; }
    .text-link { display: inline-flex; align-items: center; gap: 7px; color: #52734e; font-size: .67rem; font-weight: 700; white-space: nowrap; }
    .text-link span { transition: transform .2s ease; }
    .text-link:hover span { transform: translate(2px, -2px); }
    .courses-section { margin-top: 29px; }
    .section-heading { margin-bottom: 13px; display: flex; justify-content: space-between; align-items: end; gap: 16px; }
    .section-heading h2 { margin-top: 4px; color: var(--ink); font-size: 1.35rem; letter-spacing: -.055em; }
    .empty-state { min-height: 216px; padding: 28px 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px dashed #d9ddd1; border-radius: 15px; text-align: center; background: #f7f6f1; }
    .empty-icon { width: 39px; height: 39px; display: grid; place-items: center; border-radius: 12px; color: #68845d; background: #e8edde; font-size: 1.15rem; animation: bob 4s ease-in-out infinite; }
    .empty-state h3 { margin-top: 12px; font-size: .93rem; letter-spacing: -.03em; }
    .empty-state p { margin-top: 6px; color: #7e8079; font-size: .68rem; }
    .button-green { min-height: 37px; margin-top: 15px; color: white; background: #315d4f; }
    .course-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 14px; }
    .course-card { overflow: hidden; border: 1px solid #ecebe5; border-radius: 14px; color: inherit; background: #fffefa; transition: transform .24s ease, box-shadow .24s ease; animation: card-in .55s both; }
    .course-card:hover { transform: translateY(-4px); box-shadow: 0 14px 28px #28372b12; }
    .course-art { height: 102px; padding: 14px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; color: #f4f1e7; background: linear-gradient(130deg, #567760, #9daa79); }
    .course-art::before, .course-art::after { content: ''; position: absolute; width: 125px; height: 125px; border: 1px solid #ffffff32; border-radius: 50%; }
    .course-art::before { left: -27px; top: -75px; }.course-art::after { right: -20px; bottom: -85px; }
    .course-card:nth-child(3n + 2) .course-art { background: linear-gradient(130deg, #9c745d, #d4a383); }
    .course-card:nth-child(3n) .course-art { background: linear-gradient(130deg, #6e718d, #9b9aba); }
    .course-art-mark { font-size: 3.7rem; opacity: .72; animation: spin 36s linear infinite; }
    .course-art-caption { position: absolute; left: 15px; bottom: 12px; font-size: .48rem; font-weight: 700; letter-spacing: .12em; }
    .course-art-arrow { position: absolute; top: 11px; right: 12px; width: 25px; height: 25px; display: grid; place-items: center; border: 1px solid #ffffff60; border-radius: 50%; font-size: .72rem; }
    .course-details { padding: 15px; }
    .course-label { color: #718361; font-size: .49rem; font-weight: 800; letter-spacing: .1em; }
    .course-details h3 { min-height: 39px; margin-top: 5px; font-size: .88rem; line-height: 1.35; letter-spacing: -.03em; }
    .progress-meta { margin-top: 14px; display: flex; justify-content: space-between; color: #85877f; font-size: .57rem; }
    .progress-meta strong { color: #58774f; }
    .progress-track { height: 5px; margin-top: 7px; overflow: hidden; border-radius: 99px; background: #e9ece4; }
    .progress-track span { height: 100%; display: block; border-radius: inherit; background: linear-gradient(90deg, #79946a, #c7db90); transform-origin: left; animation: progress-in .9s ease both; }
    .course-continue { margin-top: 13px; display: flex; justify-content: space-between; color: #52734e; font-size: .61rem; font-weight: 700; }
    .course-continue span { transition: transform .2s ease; }
    .course-card:hover .course-continue span { transform: translateX(3px); }
    @keyframes dashboard-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes copy-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes art-in { from { opacity: 0; transform: translateX(14px) scale(.96); } to { opacity: 1; transform: translateX(0) scale(1); } }
    @keyframes glow-drift { from { transform: translate3d(-10px, 0, 0) scale(.94); opacity: .7; } to { transform: translate3d(22px, 18px, 0) scale(1.08); opacity: 1; } }
    @keyframes pulse { 50% { box-shadow: 0 0 0 8px #c9ec880b; } }
    @keyframes orbit { to { rotate: 360deg; } }
    @keyframes spin { to { rotate: 360deg; } }
    @keyframes bob { 50% { translate: 0 -5px; } }
    @keyframes book-float { 0%, 100% { transform: translateY(0) rotate(7deg); } 50% { transform: translateY(-7px) rotate(5deg); } }
    @keyframes note-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
    @keyframes card-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes progress-in { from { transform: scaleX(0); } to { transform: scaleX(1); } }
    @media (max-width: 900px) {
      .welcome-banner { padding: 30px; }.banner-art { width: 225px; transform: scale(.9); }
    }
    @media (max-width: 650px) {
      .dashboard { padding-top: 0; }
      .welcome-banner { min-height: 255px; padding: 25px 22px; }
      .banner-art { width: 140px; height: 170px; margin-right: -14px; transform: scale(.77); transform-origin: center right; }
      h1 { font-size: clamp(1.8rem, 6vw, 2.55rem); }
      .banner-copy > p { max-width: 340px; font-size: .74rem; }
      .banner-actions { gap: 7px; }.button { padding: 0 12px; font-size: .62rem; }
      .stats-grid { gap: 9px; }.stat-card { min-height: 91px; padding: 13px 11px; gap: 9px; }
      .stat-icon { width: 33px; height: 33px; border-radius: 10px; }.stat-content strong { font-size: 1.35rem; }.stat-content > span { font-size: .59rem; }
      .recommendation-card { align-items: flex-start; flex-wrap: wrap; padding: 15px; }
      .recommendation-copy { width: calc(100% - 58px); flex: none; }.recommendation-card > .text-link { margin-left: 55px; }
      .section-heading h2 { font-size: 1.2rem; }.section-heading > .text-link { font-size: .59rem; }
    }
    @media (max-width: 440px) {
      .welcome-banner { min-height: 260px; }.banner-art { width: 94px; margin-right: -23px; transform: scale(.65); }
      .banner-actions { align-items: flex-start; flex-direction: column; }
      .stats-grid { grid-template-columns: 1fr; }
      .stat-card { min-height: 73px; }.stat-content strong { font-size: 1.28rem; }
      .section-heading { align-items: flex-start; }.section-heading > .text-link { margin-top: 17px; }
      .empty-state { padding: 24px 14px; }
    }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
    }
  `],
})
export class StudentDashboardComponent implements OnInit {
  auth = inject(AuthService);
  private lms = inject(LmsService);

  summary = signal<ProgressSummary | null>(null);
  recs = signal<RecommendationsData | null>(null);

  firstName(): string {
    return this.auth.user()?.firstName || 'learner';
  }

  async ngOnInit(): Promise<void> {
    try {
      this.summary.set(await this.lms.progressSummary());
    } catch {
      this.summary.set(null);
    }
    try {
      this.recs.set(await this.lms.recommendations());
    } catch {
      this.recs.set(null);
    }
  }
}
