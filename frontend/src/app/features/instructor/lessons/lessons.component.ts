import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, LowerCasePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { CourseEnrollment, LmsService } from '../../../core/services/lms.service';
import { ToastService } from '../../../core/services/toast.service';
import { Course, Lesson } from '../../../core/models';

@Component({
  selector: 'app-lessons',
  imports: [DatePipe, LowerCasePipe, ReactiveFormsModule, RouterLink],
  template: `
    <main class="lessons-page">
      <a routerLink="/instructor/courses" class="back-link"><span aria-hidden="true">←</span> My courses</a>

      @if (loading() && !course()) {
        <div class="loading-card" role="status">
          <span class="loading-mark" aria-hidden="true">✳</span>
          <p>Getting your course ready…</p>
        </div>
      } @else if (loadError()) {
        <div class="error-state" role="alert">
          <span class="error-mark" aria-hidden="true">!</span>
          <h1>We couldn't load this course.</h1>
          <p>{{ loadError() }}</p>
          <button class="button button-green" type="button" (click)="reload()">Try again</button>
        </div>
      } @else {
        <header class="course-header">
          <div class="heading-copy">
            <span class="eyebrow"><span class="eyebrow-dot"></span> COURSE CREATION STUDIO</span>
            <h1>{{ course()?.title || 'Course curriculum' }}</h1>
            <p>Shape the learning journey. Add lessons, keep them in order, and publish when you're ready.</p>
            <div class="course-tags">
              @if (course()?.category) { <span>{{ course()?.category }}</span> }
              @if (course()?.difficulty) { <span>{{ course()?.difficulty | lowercase }}</span> }
              <span>{{ course()?.status || 'DRAFT' }}</span>
            </div>
          </div>
          <div class="header-actions">
            <a [routerLink]="['/instructor/courses', courseId, 'edit']" class="button button-outline">Edit course</a>
            @if (course()?.status !== 'PUBLISHED') {
              <button class="button button-lime" type="button" (click)="publish()" [disabled]="publishing()">
                {{ publishing() ? 'Publishing…' : 'Publish course' }} <span aria-hidden="true">↗</span>
              </button>
            } @else {
              <span class="published-badge"><span></span> Published</span>
            }
          </div>
          <div class="header-decoration" aria-hidden="true">✳</div>
        </header>

        <section class="overview" aria-label="Course curriculum overview">
          <article class="overview-card">
            <span class="overview-icon icon-green" aria-hidden="true">▤</span>
            <div><strong>{{ lessons().length }}</strong><span>{{ lessons().length === 1 ? 'lesson' : 'lessons' }} in curriculum</span></div>
          </article>
          <article class="overview-card">
            <span class="overview-icon icon-lime" aria-hidden="true">◷</span>
            <div><strong>{{ totalMinutes() }}<small> min</small></strong><span>Estimated learning time</span></div>
          </article>
          <article class="overview-card">
            <span class="overview-icon icon-peach" aria-hidden="true">✓</span>
            <div><strong>{{ publishedLessons() }}<small> / {{ lessons().length }}</small></strong><span>Lessons published</span></div>
          </article>
        </section>

        <section class="students-panel" aria-labelledby="students-title">
          <div class="students-heading">
            <div class="students-title">
              <span class="students-icon" aria-hidden="true">♙</span>
              <div>
                <span class="section-kicker">YOUR COURSE COMMUNITY</span>
                <h2 id="students-title">Enrolled students <span>{{ course()?.enrollmentCount || 0 }}</span></h2>
              </div>
            </div>
            <button class="button students-toggle" type="button" (click)="toggleStudents()" [disabled]="studentsLoading()">
              {{ studentsVisible() ? 'Hide students' : 'View enrolled students' }}
              <span aria-hidden="true">{{ studentsVisible() ? '↑' : '↓' }}</span>
            </button>
          </div>
          @if (studentsVisible()) {
            @if (studentsLoading()) {
              <p class="students-message" role="status">Loading enrolled students…</p>
            } @else if (studentsError()) {
              <div class="students-error" role="alert">
                <span>{{ studentsError() }}</span>
                <button type="button" (click)="loadStudents()">Try again</button>
              </div>
            } @else if (!students().length) {
              <p class="students-message">No students have enrolled in this course yet. Once they enroll, they’ll appear here.</p>
            } @else {
              <div class="students-list">
                @for (student of students(); track student.studentId) {
                  <article class="student-row">
                    <div class="student-avatar">
                      @if (student.profileImage) {
                        <img [src]="student.profileImage" [alt]="student.studentName" />
                      } @else {
                        {{ student.studentName.charAt(0).toUpperCase() }}
                      }
                    </div>
                    <div class="student-identity">
                      <strong>{{ student.studentName }}</strong>
                      <span>{{ student.studentEmail }}</span>
                    </div>
                    <div class="student-progress">
                      <div><span>Progress</span><strong>{{ student.progressPercentage }}%</strong></div>
                      <div class="progress-track"><i [style.width.%]="student.progressPercentage"></i></div>
                    </div>
                    <div class="student-enrolled">
                      <span>{{ student.status | lowercase }}</span>
                      <small>Joined {{ student.enrolledAt | date:'mediumDate' }}</small>
                    </div>
                  </article>
                }
              </div>
            }
          }
        </section>

        <div class="workspace">
          <section class="curriculum-panel" aria-labelledby="curriculum-title">
            <div class="panel-heading">
              <div>
                <span class="section-kicker">THE LEARNING PATH</span>
                <h2 id="curriculum-title">Course curriculum</h2>
              </div>
              <span class="lesson-count">{{ lessons().length }} {{ lessons().length === 1 ? 'lesson' : 'lessons' }}</span>
            </div>

            @if (!lessons().length) {
              <div class="empty-state">
                <span class="empty-icon" aria-hidden="true">✧</span>
                <h3>Your first lesson starts here.</h3>
                <p>Add a lesson to begin building a clear, step-by-step learning experience.</p>
                <button class="text-button" type="button" (click)="focusTitle()">Add the first lesson <span aria-hidden="true">↓</span></button>
              </div>
            } @else {
              <ol class="lesson-list">
                @for (lesson of lessons(); track lesson.id; let index = $index) {
                  <li class="lesson-item">
                    <div class="lesson-index" aria-hidden="true">
                      <span>{{ (index + 1).toString().padStart(2, '0') }}</span>
                      @if (!$last) { <i></i> }
                    </div>
                    <article class="lesson-card">
                      <div class="lesson-topline">
                        <span class="lesson-label">LESSON {{ index + 1 }}</span>
                        <span class="lesson-status" [class.status-published]="lesson.isPublished">
                          <i></i>{{ lesson.isPublished ? 'Published' : 'Draft' }}
                        </span>
                      </div>
                      <h3>{{ lesson.title }}</h3>
                      @if (lesson.description) {
                        <p class="lesson-description">{{ lesson.description }}</p>
                      }
                      <div class="lesson-meta">
                        <span><i aria-hidden="true">◷</i>{{ lesson.estimatedMinutes }} min</span>
                        @if (lesson.videoUrl) { <span><i aria-hidden="true">▶</i>Video included</span> }
                        @if (lesson.content) { <span><i aria-hidden="true">≡</i>Lesson content added</span> }
                      </div>
                      <button class="delete-button" type="button" (click)="remove(lesson)" [disabled]="deletingId() === lesson.id" [attr.aria-label]="'Delete ' + lesson.title">
                        {{ deletingId() === lesson.id ? 'Deleting…' : 'Delete lesson' }}
                      </button>
                    </article>
                  </li>
                }
              </ol>
            }
          </section>

          <aside class="editor-column">
            <form class="lesson-form" [formGroup]="form" (ngSubmit)="addLesson()">
              <div class="form-heading">
                <span class="form-icon" aria-hidden="true">＋</span>
                <div>
                  <span class="section-kicker">BUILD YOUR CURRICULUM</span>
                  <h2>Add a lesson</h2>
                </div>
              </div>
              <p class="form-intro">Keep each lesson focused on one helpful step.</p>

              <label for="lesson-title">Lesson title <span class="required">*</span></label>
              <input #lessonTitle id="lesson-title" formControlName="title" placeholder="e.g. Getting started with the basics" required />

              <div class="field-row">
                <div class="field-group">
                  <label for="lesson-order">Lesson order</label>
                  <input id="lesson-order" type="number" formControlName="order" min="1" required />
                </div>
                <div class="field-group">
                  <label for="lesson-minutes">Minutes</label>
                  <div class="minutes-input">
                    <input id="lesson-minutes" type="number" formControlName="estimatedMinutes" min="1" required />
                    <span>min</span>
                  </div>
                </div>
              </div>

              <label for="lesson-description">Short description</label>
              <textarea id="lesson-description" formControlName="description" rows="2" placeholder="What will learners take away?"></textarea>

              <label for="lesson-content">Lesson content</label>
              <textarea id="lesson-content" class="content-input" formControlName="content" rows="5" placeholder="Add explanations, examples, or notes for your learners…"></textarea>

              <label for="lesson-video">Video URL <span class="optional">(optional)</span></label>
              <div class="video-input">
                <span aria-hidden="true">▶</span>
                <input id="lesson-video" type="url" formControlName="videoUrl" placeholder="https://" />
              </div>

              <label class="publish-option">
                <input type="checkbox" formControlName="isPublished" />
                <span class="custom-checkbox" aria-hidden="true">✓</span>
                <span><strong>Publish this lesson</strong><small>Make this lesson visible to enrolled learners.</small></span>
              </label>

              <button class="button button-green submit-button" type="submit" [disabled]="form.invalid || saving()">
                <span>{{ saving() ? 'Adding lesson…' : 'Add lesson to curriculum' }}</span>
                @if (saving()) {
                  <span class="button-spinner" aria-hidden="true"></span>
                } @else {
                  <span aria-hidden="true">↗</span>
                }
              </button>
            </form>

            <div class="publishing-tip">
              <span aria-hidden="true">✦</span>
              <p>You can publish the whole course once its lessons are ready.</p>
            </div>
          </aside>
        </div>
      }
    </main>
  `,
  styles: [`
    :host { display: block; }
    .lessons-page { --ink: #252722; --muted: #7e8079; max-width: 1260px; margin: 0 auto; padding: 2px 0 54px; color: var(--ink); animation: page-in .5s ease both; }
    .back-link { width: fit-content; margin: 0 0 17px; display: inline-flex; align-items: center; gap: 8px; color: #52734e; font-size: .73rem; font-weight: 700; transition: gap .2s ease; }
    .back-link:hover { gap: 12px; }
    .back-link span { font-size: 1rem; }
    .course-header { min-height: 195px; padding: 26px 30px; position: relative; isolation: isolate; overflow: hidden; display: flex; align-items: center; justify-content: space-between; gap: 25px; border-radius: 18px; color: white; background: #20392f; }
    .course-header::before { content: ''; position: absolute; inset: 0; z-index: -1; opacity: .15; background-image: radial-gradient(#fff .65px, transparent .65px); background-size: 21px 21px; mask-image: linear-gradient(90deg, transparent, black 55%, transparent); }
    .course-header::after { content: ''; width: 360px; height: 360px; position: absolute; z-index: -1; top: -260px; right: 12%; border-radius: 50%; background: radial-gradient(circle, #71906b63, transparent 68%); animation: glow-drift 12s ease-in-out infinite alternate; }
    .heading-copy { max-width: 760px; position: relative; z-index: 1; animation: rise-in .6s .06s both; }
    .eyebrow, .section-kicker { display: inline-flex; align-items: center; gap: 8px; color: #738567; font-size: .52rem; font-weight: 800; letter-spacing: .13em; }
    .eyebrow { color: #d1decc; }
    .eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: #d7ed9d; box-shadow: 0 0 0 4px #d7ed9d22; animation: pulse 2.4s ease-in-out infinite; }
    h1 { margin: 10px 0 7px; font-size: clamp(1.75rem, 3.2vw, 2.65rem); line-height: 1.1; letter-spacing: -.065em; font-weight: 600; }
    .heading-copy > p { max-width: 680px; color: #d1dbd2; font-size: .75rem; line-height: 1.7; }
    .course-tags { margin-top: 13px; display: flex; flex-wrap: wrap; gap: 7px; }
    .course-tags span { padding: 5px 9px; border: 1px solid #ffffff2b; border-radius: 99px; color: #e4e9dc; background: #ffffff0d; font-size: .5rem; font-weight: 700; text-transform: capitalize; }
    .course-tags span:last-child { color: #e5efc9; }
    .header-actions { position: relative; z-index: 1; flex: 0 0 auto; display: flex; align-items: center; gap: 9px; animation: rise-in .6s .14s both; }
    .button { min-height: 39px; padding: 0 14px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: 0; border-radius: 999px; cursor: pointer; font: inherit; font-size: .64rem; font-weight: 700; text-decoration: none; white-space: nowrap; transition: transform .2s ease, box-shadow .2s ease, background .2s ease; }
    .button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 18px #1124192e; }
    .button:focus-visible { outline: 3px solid #91a981; outline-offset: 3px; }
    .button:disabled { opacity: .6; cursor: not-allowed; }
    .button-outline { color: white; border: 1px solid #ffffff45; background: #ffffff0c; }
    .button-outline:hover { background: #ffffff18; }
    .button-lime { color: #293325; background: #d8ee9b; }
    .published-badge { min-height: 36px; padding: 0 12px; display: inline-flex; align-items: center; gap: 7px; border: 1px solid #cce5a14a; border-radius: 999px; color: #e5efc9; background: #ffffff0c; font-size: .6rem; font-weight: 700; }
    .published-badge span { width: 6px; height: 6px; border-radius: 50%; background: #cce99a; }
    .header-decoration { position: absolute; right: 34%; bottom: -58px; z-index: -1; color: #d5e89b14; font-size: 10rem; animation: slow-spin 80s linear infinite; }
    .overview { margin-top: 13px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 11px; }
    .overview-card { min-height: 72px; padding: 12px 15px; display: flex; align-items: center; gap: 11px; border: 1px solid #ecebe5; border-radius: 12px; background: #fffefa; animation: card-in .55s both; }
    .overview-card:nth-child(2) { animation-delay: .07s; }.overview-card:nth-child(3) { animation-delay: .14s; }
    .overview-icon { width: 34px; height: 34px; flex: 0 0 auto; display: grid; place-items: center; border-radius: 10px; font-size: .9rem; }
    .icon-green { color: #52734e; background: #e6eee2; }.icon-lime { color: #6c7e45; background: #eef1d9; }.icon-peach { color: #a36748; background: #f4e8dc; }
    .overview-card > div { display: grid; gap: 3px; }.overview-card strong { color: #29352c; font-size: 1.1rem; line-height: 1; letter-spacing: -.04em; }.overview-card strong small { font-size: .7rem; }
    .overview-card > div > span { color: var(--muted); font-size: .58rem; }
    .students-panel { margin-top: 13px; padding: 15px 17px; border: 1px solid #ecebe5; border-radius: 13px; background: #fffefa; animation: card-in .55s .12s both; }
    .students-heading { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
    .students-title { display: flex; align-items: center; gap: 10px; }.students-icon { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 10px; color: #52734e; background: #e6eee2; font-size: .9rem; }
    .students-title h2 { margin-top: 3px; font-size: .9rem; letter-spacing: -.035em; }.students-title h2 > span { margin-left: 5px; padding: 3px 7px; border-radius: 99px; color: #5d7652; background: #edf1e6; font-size: .55rem; vertical-align: 2px; }
    .students-toggle { min-height: 34px; color: #315d4f; border: 1px solid #dce5d7; background: #f8f9f4; }.students-toggle:hover:not(:disabled) { background: #eff3e9; }
    .students-message { padding: 18px 12px 5px; color: #7e8079; font-size: .63rem; line-height: 1.6; }
    .students-error { margin-top: 13px; padding: 11px; display: flex; justify-content: space-between; gap: 12px; border-radius: 8px; color: #8b4a3c; background: #fbf1ed; font-size: .6rem; }
    .students-error button { color: #8b4a3c; font: inherit; font-weight: 700; text-decoration: underline; background: none; border: 0; cursor: pointer; }
    .students-list { margin-top: 14px; border-top: 1px solid #efeee8; }
    .student-row { min-width: 0; padding: 12px 2px; display: grid; grid-template-columns: 35px minmax(125px, 1.2fr) minmax(110px, .8fr) minmax(105px, .75fr); align-items: center; gap: 12px; border-bottom: 1px solid #f0efe9; animation: rise-in .35s both; }
    .student-row:last-child { border-bottom: 0; padding-bottom: 2px; }
    .student-avatar { width: 34px; height: 34px; overflow: hidden; display: grid; place-items: center; border-radius: 11px; color: #52734e; background: #e8edde; font-size: .7rem; font-weight: 800; }
    .student-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .student-identity, .student-enrolled { min-width: 0; display: grid; gap: 4px; }.student-identity strong { overflow: hidden; color: #343831; font-size: .62rem; text-overflow: ellipsis; white-space: nowrap; }.student-identity span, .student-enrolled small { overflow: hidden; color: #85877f; font-size: .52rem; text-overflow: ellipsis; white-space: nowrap; }
    .student-progress { display: grid; gap: 6px; }.student-progress > div:first-child { display: flex; justify-content: space-between; gap: 6px; color: #85877f; font-size: .51rem; }.student-progress strong { color: #526c49; font-size: .53rem; }
    .progress-track { height: 5px; overflow: hidden; border-radius: 99px; background: #eceee6; }.progress-track i { height: 100%; display: block; border-radius: inherit; background: #87a66d; transition: width .4s ease; }
    .student-enrolled span { color: #607554; font-size: .54rem; font-weight: 700; text-transform: capitalize; }
    .workspace { margin-top: 15px; display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(330px, .75fr); align-items: start; gap: 14px; }
    .curriculum-panel, .lesson-form { border: 1px solid #ecebe5; border-radius: 14px; background: #fffefa; box-shadow: 0 5px 18px #27352b06; }
    .curriculum-panel { min-width: 0; min-height: 300px; padding: 20px; animation: card-in .55s .08s both; }
    .panel-heading { margin-bottom: 17px; display: flex; align-items: end; justify-content: space-between; gap: 14px; }
    .panel-heading h2, .form-heading h2 { margin-top: 4px; color: var(--ink); font-size: 1.05rem; letter-spacing: -.045em; }
    .lesson-count { padding: 5px 9px; border-radius: 99px; color: #5d7652; background: #edf1e6; font-size: .55rem; font-weight: 700; white-space: nowrap; }
    .empty-state { min-height: 225px; padding: 22px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px dashed #dfe2d7; border-radius: 11px; text-align: center; background: #f8f7f2; }
    .empty-icon { width: 38px; height: 38px; display: grid; place-items: center; border-radius: 12px; color: #68845d; background: #e8edde; font-size: 1.05rem; animation: bob 4s ease-in-out infinite; }
    .empty-state h3 { margin-top: 11px; font-size: .8rem; letter-spacing: -.02em; }.empty-state p { max-width: 330px; margin-top: 5px; color: #7e8079; font-size: .62rem; line-height: 1.65; }
    .text-button { margin-top: 13px; display: inline-flex; align-items: center; gap: 7px; color: #52734e; font-size: .61rem; font-weight: 700; }.text-button span { transition: transform .2s ease; }.text-button:hover span { transform: translateY(3px); }
    .lesson-list { margin: 0; padding: 0; display: grid; list-style: none; }
    .lesson-item { min-width: 0; display: grid; grid-template-columns: 27px minmax(0, 1fr); gap: 11px; animation: rise-in .45s both; }
    .lesson-index { display: flex; flex-direction: column; align-items: center; }
    .lesson-index > span { width: 26px; height: 26px; flex: 0 0 auto; display: grid; place-items: center; border: 1px solid #dfe6d8; border-radius: 9px; color: #5c7852; background: #edf1e6; font-size: .52rem; font-weight: 800; }
    .lesson-index > i { width: 1px; min-height: 16px; flex: 1; margin: 4px 0; background: #e4e7df; }
    .lesson-card { min-width: 0; margin-bottom: 10px; padding: 13px 14px; position: relative; border: 1px solid #eeede7; border-radius: 11px; background: #fff; transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease; }
    .lesson-card:hover { transform: translateY(-2px); border-color: #dce5d3; box-shadow: 0 9px 20px #28372b0b; }
    .lesson-topline { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
    .lesson-label { color: #8b8f83; font-size: .47rem; font-weight: 800; letter-spacing: .1em; }
    .lesson-status { display: inline-flex; align-items: center; gap: 5px; color: #8b7653; font-size: .51rem; font-weight: 700; }
    .lesson-status i { width: 6px; height: 6px; border-radius: 50%; background: #d3aa69; }
    .lesson-status.status-published { color: #52734e; }.lesson-status.status-published i { background: #82a76a; }
    .lesson-card h3 { margin-top: 7px; padding-right: 4px; font-size: .78rem; line-height: 1.45; letter-spacing: -.025em; overflow-wrap: anywhere; }
    .lesson-description { margin-top: 5px; color: #777870; font-size: .6rem; line-height: 1.65; }
    .lesson-meta { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 7px 13px; }
    .lesson-meta span { display: inline-flex; align-items: center; gap: 5px; color: #7e8079; font-size: .52rem; }.lesson-meta i { color: #718361; font-size: .64rem; font-style: normal; }
    .delete-button { margin-top: 10px; padding: 5px 0; color: #a75d4c; font-size: .55rem; font-weight: 700; background: none; border: 0; cursor: pointer; transition: color .2s ease; }
    .delete-button:hover:not(:disabled) { color: #8e3f33; }.delete-button:disabled { opacity: .55; cursor: wait; }
    .editor-column { min-width: 0; display: grid; gap: 10px; }
    .lesson-form { padding: 18px; display: grid; align-content: start; gap: 8px; animation: card-in .55s .14s both; }
    .form-heading { display: flex; align-items: center; gap: 10px; }
    .form-icon { width: 34px; height: 34px; flex: 0 0 auto; display: grid; place-items: center; border-radius: 10px; color: #54734e; background: #e8edde; font-size: 1rem; }
    .form-heading h2 { margin-top: 3px; }.form-intro { margin: -3px 0 5px 44px; color: #85877f; font-size: .58rem; }
    .lesson-form > label:not(.publish-option), .field-group > label { margin-top: 3px; color: #41443e; font-size: .62rem; font-weight: 700; }
    .required { color: #9f5f49; }.optional { color: #92948d; font-size: .55rem; font-weight: 500; }
    input:not([type="checkbox"]), textarea { width: 100%; min-width: 0; padding: 9px 11px; border: 1px solid #e4e4dc; border-radius: 8px; outline: 0; color: #292b26; background: #fff; font: inherit; font-size: .65rem; line-height: 1.55; transition: border-color .2s ease, box-shadow .2s ease; }
    input:not([type="checkbox"]) { height: 38px; }
    textarea { min-height: 59px; resize: vertical; }.content-input { min-height: 105px; }
    input::placeholder, textarea::placeholder { color: #a4a59e; }
    input:not([type="checkbox"]):focus, textarea:focus { border-color: #78936c; box-shadow: 0 0 0 3px #78936c1c; }
    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .field-group { min-width: 0; display: grid; gap: 6px; }
    .minutes-input { position: relative; }.minutes-input input { padding-right: 34px; }.minutes-input > span { position: absolute; top: 50%; right: 10px; color: #888a82; font-size: .56rem; transform: translateY(-50%); pointer-events: none; }
    .video-input { position: relative; }.video-input > span { position: absolute; z-index: 1; top: 50%; left: 12px; color: #86967a; font-size: .56rem; transform: translateY(-50%); }.video-input input { padding-left: 30px; }
    .publish-option { min-width: 0; margin-top: 5px; padding: 10px; position: relative; display: flex; align-items: center; gap: 10px; border: 1px solid #eeede7; border-radius: 9px; cursor: pointer; transition: border-color .2s ease, background .2s ease; }
    .publish-option:has(input:checked) { border-color: #dce6d3; background: #f7f8f2; }
    .publish-option > input { width: 1px; height: 1px; position: absolute; opacity: 0; }
    .custom-checkbox { width: 17px; height: 17px; flex: 0 0 auto; display: grid; place-items: center; border: 1px solid #cdd2c5; border-radius: 5px; color: transparent; background: white; font-size: .58rem; transition: all .18s ease; }
    .publish-option input:checked + .custom-checkbox { border-color: #52734e; color: white; background: #52734e; }
    .publish-option input:focus-visible + .custom-checkbox { outline: 3px solid #91a981; outline-offset: 2px; }
    .publish-option > span:last-child { display: grid; gap: 3px; }.publish-option strong { color: #43463f; font-size: .58rem; }.publish-option small { color: #85877f; font-size: .51rem; line-height: 1.4; }
    .button-green { color: white; background: #315d4f; }.submit-button { width: 100%; min-height: 41px; margin-top: 3px; justify-content: space-between; padding: 0 14px; }
    .button-spinner { width: 14px; height: 14px; border: 2px solid #ffffff70; border-top-color: white; border-radius: 50%; animation: spin .7s linear infinite; }
    .publishing-tip { padding: 11px 13px; display: flex; align-items: flex-start; gap: 9px; border: 1px solid #e9eadc; border-radius: 10px; background: linear-gradient(105deg, #f2f3e8, #fbfaf5); animation: card-in .55s .2s both; }
    .publishing-tip > span { color: #718361; font-size: .75rem; }.publishing-tip p { color: #6f7268; font-size: .57rem; line-height: 1.6; }
    .loading-card, .error-state { min-height: 300px; padding: 30px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px solid #ecebe5; border-radius: 14px; text-align: center; background: #fffefa; }
    .loading-mark, .error-mark { width: 40px; height: 40px; display: grid; place-items: center; border-radius: 12px; color: #52734e; background: #e6eee2; font-size: 1.1rem; animation: bob 2s ease-in-out infinite; }
    .loading-card p, .error-state p { margin-top: 10px; color: #7e8079; font-size: .7rem; }.error-mark { color: #a75d4c; background: #f4e8dc; animation: none; }.error-state h1 { margin-top: 13px; font-size: 1.2rem; }.error-state .button { margin-top: 15px; }
    @keyframes page-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes rise-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes card-in { from { opacity: 0; transform: translateY(9px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes glow-drift { from { transform: translate3d(-10px, 0, 0) scale(.94); opacity: .7; } to { transform: translate3d(22px, 18px, 0) scale(1.08); opacity: 1; } }
    @keyframes pulse { 50% { box-shadow: 0 0 0 7px #d7ed9d0b; } }
    @keyframes slow-spin { to { rotate: 360deg; } } @keyframes spin { to { rotate: 360deg; } }
    @keyframes bob { 50% { translate: 0 -5px; } }
    @media (max-width: 900px) {
      .course-header { align-items: flex-start; flex-direction: column; gap: 17px; }.header-actions { flex-wrap: wrap; }
      .workspace { grid-template-columns: minmax(0, 1fr) minmax(300px, .85fr); }.curriculum-panel { padding: 16px; }.lesson-form { padding: 15px; }
    }
    @media (max-width: 700px) {
      .lessons-page { padding-top: 0; }.course-header { padding: 23px; }.header-actions { width: 100%; }
      .overview { gap: 8px; }.overview-card { min-height: 68px; padding: 10px; gap: 8px; }.overview-icon { width: 30px; height: 30px; }
      .overview-card > div > span { font-size: .52rem; }.workspace { grid-template-columns: 1fr; }
      .editor-column { grid-row: 1; }.curriculum-panel { grid-row: 2; }.lesson-form { padding: 17px; }
      .curriculum-panel { min-height: 230px; }.empty-state { min-height: 190px; }
      .student-row { grid-template-columns: 35px minmax(0, 1fr) minmax(92px, .65fr); gap: 9px; }.student-progress { grid-column: 2 / 4; grid-row: 2; }.student-enrolled { grid-column: 2 / 4; grid-row: 3; }
    }
    @media (max-width: 440px) {
      .back-link { margin-bottom: 12px; }.course-header { min-height: 0; padding: 19px; border-radius: 14px; }
      h1 { font-size: 1.65rem; }.heading-copy > p { font-size: .68rem; }
      .header-actions { gap: 7px; }.button { min-height: 37px; padding: 0 11px; font-size: .59rem; }
      .overview { grid-template-columns: 1fr; }.overview-card { min-height: 60px; }.overview-card > div { grid-template-columns: auto 1fr; align-items: baseline; gap: 8px; }
      .overview-card > div > span { font-size: .56rem; }.workspace { margin-top: 10px; }.curriculum-panel { padding: 13px; }
      .lesson-card { padding: 11px; }.field-row { gap: 8px; }
      .students-panel { padding: 12px; }.students-heading { align-items: flex-start; flex-direction: column; }.students-toggle { margin-left: 44px; }.student-row { grid-template-columns: 32px minmax(0, 1fr); }.student-avatar { width: 32px; height: 32px; }.student-progress, .student-enrolled { grid-column: 2; }.student-progress { grid-row: 2; }.student-enrolled { grid-row: 3; }
    }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
    }
  `],
})
export class LessonsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private courses = inject(CourseService);
  private lms = inject(LmsService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  courseId = '';
  course = signal<Course | null>(null);
  lessons = signal<Lesson[]>([]);
  loading = signal(true);
  loadError = signal<string | null>(null);
  saving = signal(false);
  publishing = signal(false);
  deletingId = signal<string | null>(null);
  students = signal<CourseEnrollment[]>([]);
  studentsVisible = signal(false);
  studentsLoading = signal(false);
  studentsError = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    order: [1, [Validators.required, Validators.min(1)]],
    content: [''],
    videoUrl: [''],
    estimatedMinutes: [15, [Validators.required, Validators.min(1)]],
    isPublished: [true],
  });

  totalMinutes(): number {
    return this.lessons().reduce((total, lesson) => total + (lesson.estimatedMinutes || 0), 0);
  }

  publishedLessons(): number {
    return this.lessons().filter((lesson) => lesson.isPublished).length;
  }

  async ngOnInit(): Promise<void> {
    this.courseId = this.route.snapshot.paramMap.get('id') || '';
    await this.reload();
  }

  async reload(): Promise<void> {
    this.loading.set(true);
    this.loadError.set(null);
    try {
      const [course, lessons] = await Promise.all([
        this.courses.get(this.courseId),
        this.courses.listLessons(this.courseId),
      ]);
      this.course.set(course);
      this.lessons.set(lessons);
      this.form.patchValue({ order: lessons.length + 1 });
    } catch {
      this.loadError.set('Please check your connection and try loading the course again.');
      this.toast.error('Failed to load course lessons');
    } finally {
      this.loading.set(false);
    }
  }

  focusTitle(): void {
    document.getElementById('lesson-title')?.focus();
  }

  async toggleStudents(): Promise<void> {
    if (this.studentsVisible()) {
      this.studentsVisible.set(false);
      return;
    }
    this.studentsVisible.set(true);
    if (!this.students().length) await this.loadStudents();
  }

  async loadStudents(): Promise<void> {
    this.studentsLoading.set(true);
    this.studentsError.set(null);
    try {
      this.students.set(await this.lms.courseEnrollments(this.courseId));
    } catch {
      this.studentsError.set('Could not load the enrolled students. Please try again.');
      this.toast.error('Failed to load enrolled students');
    } finally {
      this.studentsLoading.set(false);
    }
  }

  async addLesson(): Promise<void> {
    if (this.form.invalid) return;
    this.saving.set(true);
    try {
      const raw = this.form.getRawValue();
      await this.courses.createLesson(this.courseId, {
        ...raw,
        title: raw.title.trim(),
        resources: [],
      });
      this.toast.success('Lesson added');
      this.form.reset({
        title: '',
        description: '',
        order: this.lessons().length + 2,
        content: '',
        videoUrl: '',
        estimatedMinutes: 15,
        isPublished: true,
      });
      await this.reload();
    } catch (err: unknown) {
      const message = (err as { error?: { message?: string } })?.error?.message ?? 'Could not add lesson';
      this.toast.error(message);
    } finally {
      this.saving.set(false);
    }
  }

  async remove(lesson: Lesson): Promise<void> {
    if (!confirm(`Delete lesson "${lesson.title}"?`)) return;
    this.deletingId.set(lesson.id);
    try {
      await this.courses.deleteLesson(lesson.id);
      this.toast.success('Lesson deleted');
      await this.reload();
    } catch {
      this.toast.error('Delete failed');
    } finally {
      this.deletingId.set(null);
    }
  }

  async publish(): Promise<void> {
    this.publishing.set(true);
    try {
      await this.courses.publish(this.courseId);
      this.toast.success('Course published');
      await this.reload();
    } catch (err: unknown) {
      const message = (err as { error?: { message?: string } })?.error?.message ?? 'Publish failed';
      this.toast.error(message);
    } finally {
      this.publishing.set(false);
    }
  }
}
