import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-ai-tools',
  imports: [RouterLink],
  template: `
    <main class="ai-tools">
      <header class="hero">
        <div class="hero-glow" aria-hidden="true"></div>
        <div class="hero-copy">
          <span class="eyebrow"><span class="sparkle" aria-hidden="true">✦</span> YOUR CREATIVE SIDEKICK</span>
          <h1>Good teaching starts<br />with <span>a bright idea.</span></h1>
          <p>
            We're shaping thoughtful AI tools to help you plan lessons, spark quiz
            questions, and spend more time helping learners thrive.
          </p>
          <a routerLink="/instructor/courses/create" class="button button-lime">
            Start with a course <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div class="hero-art" aria-hidden="true">
          <span class="orbit orbit-one"></span>
          <span class="orbit orbit-two"></span>
          <span class="star star-one">✳</span>
          <span class="star star-two">✦</span>
          <div class="idea-card">
            <span class="idea-kicker">A LITTLE INSPIRATION</span>
            <div class="idea-glyph">✧</div>
            <strong>Big ideas grow<br />one lesson at a time.</strong>
            <span class="idea-lines"><i></i><i></i><i></i></span>
          </div>
          <span class="floating-chip">MADE FOR EDUCATORS</span>
        </div>
      </header>

      <section class="tools-section" aria-labelledby="tools-title">
        <div class="section-heading">
          <div>
            <span class="section-kicker">ON THE WAY</span>
            <h2 id="tools-title">A little help for your next big lesson</h2>
          </div>
          <span class="availability"><i></i> New tools in progress</span>
        </div>

        <div class="tool-grid">
          <article class="tool-card">
            <div class="tool-top">
              <span class="tool-icon icon-outline" aria-hidden="true">▤</span>
              <span class="coming-soon">COMING SOON</span>
            </div>
            <h3>Course outline ideas</h3>
            <p>Turn a topic and a few learning goals into a clear course structure to build on.</p>
            <div class="tool-preview outline-preview" aria-hidden="true">
              <span class="preview-heading">A thoughtful learning path</span>
              <i><b>01</b><em></em></i><i><b>02</b><em></em></i><i><b>03</b><em></em></i>
            </div>
          </article>

          <article class="tool-card">
            <div class="tool-top">
              <span class="tool-icon icon-quiz" aria-hidden="true">✓</span>
              <span class="coming-soon">COMING SOON</span>
            </div>
            <h3>Quiz question starters</h3>
            <p>Get a first draft of questions that help learners check their understanding.</p>
            <div class="tool-preview quiz-preview" aria-hidden="true">
              <span class="preview-heading">Quick knowledge check</span>
              <i><b></b><em></em></i><i><b></b><em></em></i><i><b></b><em></em></i>
            </div>
          </article>

          <article class="tool-card">
            <div class="tool-top">
              <span class="tool-icon icon-spark" aria-hidden="true">✧</span>
              <span class="coming-soon">COMING SOON</span>
            </div>
            <h3>Lesson writing companion</h3>
            <p>Shape your notes into engaging explanations and learner-friendly lesson drafts.</p>
            <div class="tool-preview writing-preview" aria-hidden="true">
              <span class="preview-heading">A clearer way to explain</span>
              <i></i><i></i><i></i><i></i>
            </div>
          </article>
        </div>
      </section>

      <section class="studio-card">
        <span class="studio-icon" aria-hidden="true">✳</span>
        <div class="studio-copy">
          <span class="section-kicker">READY TO MAKE SOMETHING?</span>
          <h2>Your course studio is open.</h2>
          <p>Create a course, add lessons, and build a learning experience your students can enjoy today.</p>
        </div>
        <div class="studio-actions">
          <a routerLink="/instructor/courses/create" class="button button-green">Create a course <span aria-hidden="true">↗</span></a>
          <a routerLink="/instructor/courses" class="text-link">Manage courses <span aria-hidden="true">→</span></a>
        </div>
      </section>
    </main>
  `,
  styles: [`
    :host { display: block; }
    .ai-tools { --ink: #252722; --muted: #7e8079; max-width: 1230px; margin: 0 auto; padding: 4px 0 50px; color: var(--ink); animation: page-in .55s ease both; }
    .hero { min-height: 300px; padding: 36px 42px; position: relative; isolation: isolate; overflow: hidden; display: flex; align-items: center; justify-content: space-between; border-radius: 19px; color: white; background: #20392f; }
    .hero::before { content: ''; position: absolute; inset: 0; z-index: -1; opacity: .16; background-image: radial-gradient(#fff .65px, transparent .65px); background-size: 21px 21px; mask-image: linear-gradient(90deg, transparent, black 50%, transparent); }
    .hero-glow { width: 440px; height: 440px; position: absolute; z-index: -1; top: -230px; left: 24%; border-radius: 50%; background: radial-gradient(circle, #71906b64, transparent 68%); animation: glow-drift 12s ease-in-out infinite alternate; }
    .hero-copy { max-width: 620px; position: relative; z-index: 1; animation: rise-in .65s .08s both; }
    .eyebrow, .section-kicker { display: inline-flex; align-items: center; gap: 8px; font-size: .59rem; font-weight: 800; letter-spacing: .13em; }
    .eyebrow { color: #d1decc; }
    .sparkle { color: #d8ee9b; animation: twinkle 2.5s ease-in-out infinite; }
    h1 { margin: 17px 0 12px; font-size: clamp(2.25rem, 4.2vw, 3.5rem); line-height: 1.02; letter-spacing: -.075em; font-weight: 600; }
    h1 span { color: #d7ed9d; }
    .hero-copy p { max-width: 480px; color: #d1dbd2; font-size: .8rem; line-height: 1.8; }
    .button { min-height: 41px; padding: 0 16px; display: inline-flex; align-items: center; justify-content: center; gap: 9px; border-radius: 999px; font-size: .68rem; font-weight: 700; transition: transform .2s ease, box-shadow .2s ease, background .2s ease; }
    .button:hover { transform: translateY(-2px); box-shadow: 0 8px 18px #1124192e; }
    .button-lime { margin-top: 20px; color: #293325; background: #d8ee9b; }
    .hero-art { width: 300px; height: 250px; flex: 0 0 auto; position: relative; display: grid; place-items: center; animation: art-in .8s .15s both; }
    .orbit { position: absolute; border: 1px solid #e7f2dc20; border-radius: 50%; }
    .orbit-one { width: 225px; height: 225px; animation: orbit 60s linear infinite; }
    .orbit-two { width: 170px; height: 170px; border-style: dashed; animation: orbit 70s linear infinite reverse; }
    .star { position: absolute; color: #d8ee9b; }
    .star-one { top: 15px; right: 43px; font-size: 1.25rem; animation: orbit 20s linear infinite; }
    .star-two { bottom: 28px; left: 23px; font-size: .9rem; animation: bob 4s ease-in-out infinite; }
    .idea-card { width: 177px; min-height: 178px; padding: 18px; position: relative; z-index: 1; border: 1px solid #ffffff40; border-radius: 15px; color: #344033; background: linear-gradient(145deg, #f4f3e8, #e5ebd4); box-shadow: 0 18px 40px #10231a42; transform: rotate(4deg); animation: card-float 6s ease-in-out infinite; }
    .idea-kicker { color: #758168; font-size: .48rem; font-weight: 800; letter-spacing: .11em; }
    .idea-glyph { width: 37px; height: 37px; margin: 14px 0 9px; display: grid; place-items: center; border-radius: 11px; color: #f5f4e9; background: #6f8969; font-size: 1.15rem; }
    .idea-card strong { font-size: .88rem; line-height: 1.3; letter-spacing: -.035em; }
    .idea-lines { margin-top: 12px; display: grid; gap: 4px; }
    .idea-lines i { height: 3px; border-radius: 99px; background: #c6cfb8; }.idea-lines i:nth-child(2) { width: 80%; }.idea-lines i:nth-child(3) { width: 55%; }
    .floating-chip { position: absolute; z-index: 2; right: -1px; bottom: 27px; padding: 9px 12px; border: 1px solid #ffffff33; border-radius: 999px; color: #f5f6ed; background: #ffffff16; font-size: .49rem; font-weight: 700; letter-spacing: .08em; box-shadow: 0 8px 20px #14261a2e; backdrop-filter: blur(8px); animation: note-float 5s ease-in-out infinite; }
    .tools-section { margin-top: 30px; }
    .section-heading { margin-bottom: 15px; display: flex; align-items: end; justify-content: space-between; gap: 16px; }
    .section-kicker { color: #718361; font-size: .52rem; }
    .section-heading h2 { margin-top: 5px; font-size: 1.3rem; letter-spacing: -.05em; }
    .availability { display: inline-flex; align-items: center; gap: 7px; color: #7e8079; font-size: .62rem; }
    .availability i { width: 7px; height: 7px; border-radius: 50%; background: #a3b87a; box-shadow: 0 0 0 4px #e9efdf; }
    .tool-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 13px; }
    .tool-card { min-width: 0; min-height: 235px; padding: 17px; position: relative; overflow: hidden; border: 1px solid #ecebe5; border-radius: 14px; background: #fffefa; transition: transform .24s ease, box-shadow .24s ease; animation: card-in .55s both; }
    .tool-card:nth-child(2) { animation-delay: .08s; }.tool-card:nth-child(3) { animation-delay: .16s; }
    .tool-card:hover { transform: translateY(-4px); box-shadow: 0 14px 28px #28372b12; }
    .tool-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .tool-icon { width: 35px; height: 35px; display: grid; place-items: center; border-radius: 11px; font-size: .96rem; }
    .icon-outline { color: #52734e; background: #e6eee2; }.icon-quiz { color: #a36748; background: #f4e8dc; }.icon-spark { color: #70618a; background: #e9e4f0; }
    .coming-soon { padding: 5px 7px; border: 1px solid #e7e9dc; border-radius: 99px; color: #7a856b; background: #f5f6ef; font-size: .44rem; font-weight: 800; letter-spacing: .07em; white-space: nowrap; }
    .tool-card h3 { margin-top: 14px; font-size: .88rem; letter-spacing: -.03em; }
    .tool-card > p { min-height: 43px; margin-top: 6px; color: #7e8079; font-size: .64rem; line-height: 1.65; }
    .tool-preview { height: 73px; margin-top: 12px; padding: 10px 11px; overflow: hidden; border: 1px solid #eeede7; border-radius: 9px; background: #f7f6f1; }
    .preview-heading { display: block; margin-bottom: 7px; color: #75786d; font-size: .5rem; font-weight: 700; }
    .outline-preview > i { display: flex; align-items: center; gap: 7px; margin-top: 4px; }
    .outline-preview > i b { width: 12px; height: 12px; display: grid; place-items: center; border-radius: 4px; color: #617756; background: #e2e9d7; font-size: .4rem; }
    .outline-preview > i em { width: 67%; height: 3px; border-radius: 99px; background: #d4d8cc; }
    .quiz-preview > i { display: flex; align-items: center; gap: 7px; margin-top: 5px; }
    .quiz-preview > i b { width: 9px; height: 9px; border: 1px solid #9ba58f; border-radius: 50%; }
    .quiz-preview > i:first-of-type b { border-color: #758b65; background: #c9d8b3; box-shadow: inset 0 0 0 2px #f7f6f1; }
    .quiz-preview > i em { width: 60%; height: 3px; border-radius: 99px; background: #d4d8cc; }
    .writing-preview > i { height: 3px; display: block; margin-top: 6px; border-radius: 99px; background: #d4d8cc; }
    .writing-preview > i:nth-of-type(1) { width: 92%; }.writing-preview > i:nth-of-type(2) { width: 80%; }.writing-preview > i:nth-of-type(3) { width: 88%; }.writing-preview > i:nth-of-type(4) { width: 54%; }
    .studio-card { margin-top: 18px; padding: 18px 20px; display: flex; align-items: center; gap: 14px; border: 1px solid #e9eadc; border-radius: 14px; background: linear-gradient(105deg, #f2f3e8, #fbfaf5); animation: card-in .55s .12s both; }
    .studio-icon { width: 39px; height: 39px; flex: 0 0 auto; display: grid; place-items: center; border-radius: 12px; color: #657c4d; background: #e4ebd7; font-size: 1.05rem; animation: twinkle 3s ease-in-out infinite; }
    .studio-copy { min-width: 0; flex: 1; }.studio-copy h2 { margin-top: 3px; font-size: .91rem; letter-spacing: -.035em; }.studio-copy p { margin-top: 4px; color: #777870; font-size: .63rem; line-height: 1.6; }
    .studio-actions { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; }
    .button-green { min-height: 36px; color: white; background: #315d4f; font-size: .62rem; }
    .text-link { display: inline-flex; align-items: center; gap: 7px; color: #52734e; font-size: .61rem; font-weight: 700; }.text-link span { transition: transform .2s ease; }.text-link:hover span { transform: translateX(3px); }
    @keyframes page-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes rise-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes art-in { from { opacity: 0; transform: translateX(14px) scale(.96); } to { opacity: 1; transform: translateX(0) scale(1); } }
    @keyframes glow-drift { from { transform: translate3d(-10px, 0, 0) scale(.94); opacity: .7; } to { transform: translate3d(22px, 18px, 0) scale(1.08); opacity: 1; } }
    @keyframes orbit { to { rotate: 360deg; } }
    @keyframes bob { 50% { translate: 0 -5px; } }
    @keyframes twinkle { 50% { opacity: .65; transform: scale(.92); } }
    @keyframes card-float { 0%, 100% { transform: translateY(0) rotate(4deg); } 50% { transform: translateY(-7px) rotate(2deg); } }
    @keyframes note-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
    @keyframes card-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @media (max-width: 850px) {
      .hero { padding: 30px; }.hero-art { width: 225px; transform: scale(.9); }.tool-card { padding: 14px; }
    }
    @media (max-width: 650px) {
      .ai-tools { padding-top: 0; }.hero { min-height: 260px; padding: 25px 22px; }.hero-art { width: 140px; height: 175px; margin-right: -14px; transform: scale(.77); transform-origin: center right; }
      h1 { font-size: clamp(2rem, 6vw, 2.7rem); }.hero-copy p { max-width: 360px; font-size: .72rem; }.tool-grid { grid-template-columns: 1fr 1fr; }
      .tool-card { min-height: 220px; }.section-heading h2 { font-size: 1.13rem; }.availability { font-size: .55rem; }
      .studio-card { align-items: flex-start; flex-wrap: wrap; }.studio-copy { width: calc(100% - 58px); flex: none; }.studio-actions { margin-left: 53px; flex-direction: row; align-items: center; gap: 14px; }
    }
    @media (max-width: 440px) {
      .hero { min-height: 270px; }.hero-art { width: 85px; margin-right: -23px; transform: scale(.63); }.hero-copy p { max-width: 290px; }
      .hero-copy .button { min-height: 37px; margin-top: 14px; }.section-heading { align-items: flex-start; flex-direction: column; gap: 8px; }.tool-grid { grid-template-columns: 1fr; }
      .tool-card { min-height: 205px; }.tool-preview { height: 65px; }.studio-actions { margin-left: 0; flex-direction: column; align-items: flex-start; }
    }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
    }
  `],
})
export class AiToolsComponent {}
