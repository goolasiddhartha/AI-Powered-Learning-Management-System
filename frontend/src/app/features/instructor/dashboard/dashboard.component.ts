import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CourseService } from '../../../core/services/course.service';
import { Course } from '../../../core/models';

@Component({
  selector: 'app-instructor-dashboard',
  imports: [RouterLink],
  template: `
    <section class="dashboard">
      <header class="welcome-banner">
        <div class="banner-glow" aria-hidden="true"></div>
        <div class="banner-copy">
          <span class="eyebrow"><span class="live-dot"></span> YOUR TEACHING SPACE</span>
          <h1>Welcome back, <span>{{ firstName() }}.</span></h1>
          <p>Your knowledge can take someone somewhere new. Let's make it happen.</p>
          <div class="banner-actions">
            <a routerLink="/instructor/courses/create" class="button button-lime"><span aria-hidden="true">＋</span> Create a course</a>
            <a routerLink="/instructor/courses" class="button button-glass">Manage your courses <span aria-hidden="true">↗</span></a>
          </div>
        </div>
        <div class="banner-art" aria-hidden="true">
          <span class="art-orbit orbit-one"></span>
          <span class="art-orbit orbit-two"></span>
          <span class="art-sparkle sparkle-one">✳</span>
          <span class="art-sparkle sparkle-two">✦</span>
          <div class="art-board"><span>SHARE<br />WHAT YOU<br />KNOW</span><i>✧</i><b></b></div>
          <div class="art-note"><span>✦</span> Ideas grow here</div>
        </div>
      </header>

      <div class="stats-grid" aria-label="Your teaching statistics">
        <article class="stat-card">
          <span class="stat-icon icon-green" aria-hidden="true">▤</span>
          <div class="stat-content"><strong>{{ total() }}</strong><span>Courses created</span></div>
          <span class="stat-decoration" aria-hidden="true">01</span>
        </article>
        <article class="stat-card">
          <span class="stat-icon icon-lime" aria-hidden="true">↗</span>
          <div class="stat-content"><strong>{{ published() }}</strong><span>Published courses</span></div>
          <span class="stat-decoration" aria-hidden="true">02</span>
        </article>
        <article class="stat-card">
          <span class="stat-icon icon-peach" aria-hidden="true">✧</span>
          <div class="stat-content"><strong>{{ drafts() }}</strong><span>Courses in draft</span></div>
          <span class="stat-decoration" aria-hidden="true">03</span>
        </article>
        <article class="stat-card">
          <span class="stat-icon icon-violet" aria-hidden="true">▣</span>
          <div class="stat-content"><strong>{{ lessons() }}</strong><span>Lessons created</span></div>
          <span class="stat-decoration" aria-hidden="true">04</span>
        </article>
      </div>

      <section class="courses-section">
        <div class="section-heading">
          <div>
            <span class="section-kicker">YOUR CREATION STUDIO</span>
            <h2>Recent courses</h2>
          </div>
          <a routerLink="/instructor/courses" class="text-link">View all courses <span aria-hidden="true">↗</span></a>
        </div>

        @if (!recent().length) {
          <div class="empty-state">
            <div class="empty-icon" aria-hidden="true">✧</div>
            <h3>Everyone has something worth sharing.</h3>
            <p>Create your first course and help someone learn something new.</p>
            <a routerLink="/instructor/courses/create" class="button button-green">Create your first course <span aria-hidden="true">↗</span></a>
          </div>
        } @else {
          <div class="course-grid">
            @for (course of recent(); track course.id) {
              <a class="course-card" [routerLink]="['/instructor/courses', course.id, 'lessons']">
                <div class="course-art">
                  <span class="course-art-mark" aria-hidden="true">✳</span>
                  <span class="course-art-caption">MADE TO MAKE A DIFFERENCE</span>
                  <span class="status-pill" [class.status-published]="course.status === 'PUBLISHED'">{{ course.status }}</span>
                </div>
                <div class="course-details">
                  <span class="course-label">{{ course.category || 'YOUR COURSE' }}</span>
                  <h3>{{ course.title }}</h3>
                  <p class="course-description">{{ course.shortDescription || course.description }}</p>
                  <div class="course-meta">
                    <span><i aria-hidden="true">▣</i> {{ course.lessonCount || 0 }} lessons</span>
                    <span><i aria-hidden="true">♙</i> {{ course.enrollmentCount || 0 }} learners</span>
                  </div>
                  <div class="course-open">Manage course <span aria-hidden="true">→</span></div>
                </div>
              </a>
            }
          </div>
        }
      </section>

      <section class="teaching-note">
        <span class="note-icon" aria-hidden="true">✦</span>
        <div><span class="section-kicker">A HELPFUL LITTLE NUDGE</span><p>Every great course starts with one idea you're excited to share.</p></div>
        <a routerLink="/instructor/ai-tools" class="text-link">Explore AI tools <span aria-hidden="true">↗</span></a>
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
    .art-board { width: 144px; height: 140px; padding: 18px; position: relative; z-index: 1; display: flex; align-items: flex-end; border: 1px solid #ffffff36; border-radius: 13px; color: #f6f1df; background: linear-gradient(145deg, #657e67, #a1aa77); box-shadow: 12px 15px 30px #0d211b40; transform: rotate(-5deg); animation: board-float 6s ease-in-out infinite; }
    .art-board::before { content: ''; position: absolute; inset: 9px; border: 1px solid #ffffff3b; border-radius: 8px; }
    .art-board span { position: relative; z-index: 1; font-size: .76rem; font-weight: 800; line-height: 1.08; letter-spacing: -.03em; }
    .art-board i { position: absolute; top: 17px; right: 18px; color: #eff4c8; font-size: 1rem; font-style: normal; }
    .art-board b { width: 45px; height: 4px; position: absolute; left: 50%; bottom: -10px; border-radius: 0 0 5px 5px; background: #b3bd91; transform: translateX(-50%); }
    .art-note { position: absolute; z-index: 2; right: 0; bottom: 21px; padding: 10px 12px; display: flex; align-items: center; gap: 7px; border: 1px solid #ffffff33; border-radius: 10px; color: #f5f6ed; background: #ffffff16; font-size: .61rem; box-shadow: 0 8px 20px #14261a2e; backdrop-filter: blur(8px); animation: note-float 5s ease-in-out infinite; }
    .art-note span { color: #d8ee9b; }
    .stats-grid { margin-top: 17px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
    .stat-card { min-height: 102px; padding: 17px 15px; position: relative; overflow: hidden; display: flex; align-items: center; gap: 11px; border: 1px solid #ecebe5; border-radius: 14px; background: #fffefa; transition: transform .22s ease, box-shadow .22s ease; animation: card-in .55s both; }
    .stat-card:nth-child(2) { animation-delay: .06s; }.stat-card:nth-child(3) { animation-delay: .12s; }.stat-card:nth-child(4) { animation-delay: .18s; }
    .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 26px #28372b0d; }
    .stat-icon { width: 36px; height: 36px; flex: 0 0 auto; display: grid; place-items: center; border-radius: 11px; font-size: .94rem; }
    .icon-green { color: #52734e; background: #e6eee2; }.icon-lime { color: #6c7e45; background: #eef1d9; }.icon-peach { color: #a36748; background: #f4e8dc; }.icon-violet { color: #70618a; background: #e9e4f0; }
    .stat-content { min-width: 0; display: grid; gap: 3px; }
    .stat-content strong { color: #29352c; font-size: 1.55rem; line-height: 1; letter-spacing: -.06em; }
    .stat-content > span { color: var(--muted); font-size: .61rem; }
    .stat-decoration { position: absolute; right: 10px; bottom: -11px; color: #315d4f09; font-size: 3.1rem; font-weight: 800; letter-spacing: -.1em; }
    .courses-section { margin-top: 29px; }
    .section-heading { margin-bottom: 13px; display: flex; justify-content: space-between; align-items: end; gap: 16px; }
    .section-kicker { color: #718361; font-size: .53rem; }
    .section-heading h2 { margin-top: 4px; color: var(--ink); font-size: 1.35rem; letter-spacing: -.055em; }
    .text-link { display: inline-flex; align-items: center; gap: 7px; color: #52734e; font-size: .67rem; font-weight: 700; white-space: nowrap; }
    .text-link span { transition: transform .2s ease; }
    .text-link:hover span { transform: translate(2px, -2px); }
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
    .course-card:nth-child(3n + 2) .course-art { background: linear-gradient(130deg, #9c745d, #d4a383); }.course-card:nth-child(3n) .course-art { background: linear-gradient(130deg, #6e718d, #9b9aba); }
    .course-art-mark { font-size: 3.7rem; opacity: .72; animation: spin 36s linear infinite; }
    .course-art-caption { position: absolute; left: 15px; bottom: 12px; font-size: .48rem; font-weight: 700; letter-spacing: .12em; }
    .status-pill { position: absolute; top: 11px; right: 11px; z-index: 1; padding: 5px 7px; border: 1px solid #ffffff5c; border-radius: 99px; color: #fff; background: #343a3152; font-size: .44rem; font-weight: 800; letter-spacing: .07em; }
    .status-published { color: #293325; border-color: #d8ee9b; background: #d8ee9b; }
    .course-details { padding: 15px; }
    .course-label { display: block; overflow: hidden; color: #718361; font-size: .49rem; font-weight: 800; letter-spacing: .1em; text-overflow: ellipsis; text-transform: uppercase; white-space: nowrap; }
    .course-details h3 { min-height: 38px; margin-top: 5px; font-size: .88rem; line-height: 1.35; letter-spacing: -.03em; }
    .course-description { min-height: 34px; margin-top: 5px; overflow: hidden; display: -webkit-box; color: #85877f; font-size: .62rem; line-height: 1.6; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
    .course-meta { margin-top: 12px; padding-top: 10px; display: flex; flex-wrap: wrap; gap: 12px; border-top: 1px solid #eeede7; }
    .course-meta span { color: #777870; font-size: .56rem; }.course-meta i { margin-right: 4px; color: #78906b; font-style: normal; }
    .course-open { margin-top: 12px; display: flex; justify-content: space-between; color: #52734e; font-size: .61rem; font-weight: 700; }
    .course-open span { transition: transform .2s ease; }.course-card:hover .course-open span { transform: translateX(3px); }
    .teaching-note { margin-top: 18px; padding: 16px 19px; display: flex; align-items: center; gap: 13px; border: 1px solid #e9eadc; border-radius: 13px; background: linear-gradient(105deg, #f2f3e8, #fbfaf5); animation: card-in .55s .12s both; }
    .note-icon { width: 36px; height: 36px; flex: 0 0 auto; display: grid; place-items: center; border-radius: 11px; color: #657c4d; background: #e4ebd7; font-size: .95rem; }
    .teaching-note > div { min-width: 0; flex: 1; }.teaching-note p { margin-top: 4px; color: #666960; font-size: .68rem; }
    @keyframes dashboard-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes copy-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes art-in { from { opacity: 0; transform: translateX(14px) scale(.96); } to { opacity: 1; transform: translateX(0) scale(1); } }
    @keyframes glow-drift { from { transform: translate3d(-10px, 0, 0) scale(.94); opacity: .7; } to { transform: translate3d(22px, 18px, 0) scale(1.08); opacity: 1; } }
    @keyframes pulse { 50% { box-shadow: 0 0 0 8px #c9ec880b; } }
    @keyframes orbit { to { rotate: 360deg; } } @keyframes spin { to { rotate: 360deg; } }
    @keyframes bob { 50% { translate: 0 -5px; } }
    @keyframes board-float { 0%, 100% { transform: translateY(0) rotate(-5deg); } 50% { transform: translateY(-7px) rotate(-3deg); } }
    @keyframes note-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
    @keyframes card-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @media (max-width: 1000px) {
      .welcome-banner { padding: 30px; }.banner-art { width: 225px; transform: scale(.9); }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 650px) {
      .dashboard { padding-top: 0; }.welcome-banner { min-height: 255px; padding: 25px 22px; }
      .banner-art { width: 140px; height: 170px; margin-right: -14px; transform: scale(.77); transform-origin: center right; }
      h1 { font-size: clamp(1.8rem, 6vw, 2.55rem); }.banner-copy > p { max-width: 340px; font-size: .74rem; }
      .banner-actions { gap: 7px; }.button { padding: 0 12px; font-size: .62rem; }
      .stat-card { min-height: 88px; padding: 13px 12px; }.stat-icon { width: 33px; height: 33px; }
      .section-heading h2 { font-size: 1.2rem; }.section-heading > .text-link { font-size: .59rem; }
      .teaching-note { align-items: flex-start; flex-wrap: wrap; }.teaching-note > div { width: calc(100% - 52px); flex: none; }
      .teaching-note > .text-link { margin-left: 49px; }
    }
    @media (max-width: 440px) {
      .welcome-banner { min-height: 260px; }.banner-art { width: 94px; margin-right: -23px; transform: scale(.65); }
      .banner-actions { align-items: flex-start; flex-direction: column; }
      .stats-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
      .stat-card { min-height: 78px; padding: 10px 8px; gap: 7px; }.stat-icon { width: 29px; height: 29px; font-size: .8rem; }
      .stat-content strong { font-size: 1.25rem; }.stat-content > span { font-size: .54rem; }.stat-decoration { font-size: 2.5rem; }
      .section-heading { align-items: flex-start; }.section-heading > .text-link { margin-top: 17px; }
      .course-grid { grid-template-columns: 1fr; }
    }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
    }
  `],
})
export class InstructorDashboardComponent implements OnInit {
  auth = inject(AuthService);
  private coursesApi = inject(CourseService);

  recent = signal<Course[]>([]);
  total = signal(0);
  published = signal(0);
  drafts = signal(0);
  lessons = signal(0);

  firstName(): string {
    return this.auth.user()?.firstName || 'teacher';
  }

  async ngOnInit(): Promise<void> {
    const courses = await this.coursesApi.list({ mine: true });
    this.recent.set(courses.slice(0, 5));
    this.total.set(courses.length);
    this.published.set(courses.filter((c) => c.status === 'PUBLISHED').length);
    this.drafts.set(courses.filter((c) => c.status === 'DRAFT').length);
    this.lessons.set(courses.reduce((sum, c) => sum + (c.lessonCount || 0), 0));
  }
}
