import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  imports: [RouterLink],
  template: `
    <main>
      <header class="site-header">
        <a class="brand" routerLink="/" aria-label="LearnAI home">
          <span class="brand-mark" aria-hidden="true">L</span>
          <span>learn<span class="brand-accent">ai</span></span>
        </a>
        <nav class="desktop-nav" aria-label="Main navigation">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#for-everyone">For everyone</a>
        </nav>
        <div class="header-actions">
          <a class="sign-in" routerLink="/login">Log in</a>
          <a class="button button-small" routerLink="/register">
            Get started <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>

      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-glow hero-glow-one" aria-hidden="true"></div>
        <div class="hero-glow hero-glow-two" aria-hidden="true"></div>
        <div class="hero-grid">
          <div class="hero-copy">
            <div class="eyebrow"><span class="live-dot"></span> A smarter way to learn</div>
            <h1 id="hero-title">Make your next<br />big idea <span class="gradient-text">happen.</span></h1>
            <p class="hero-description">
              The learning space that meets you where you are. Explore expert-led courses,
              learn at your pace, and get a little help from AI when you need it.
            </p>
            <div class="hero-actions">
              <a class="button button-primary" routerLink="/register">
                Start learning <span class="arrow" aria-hidden="true">↗</span>
              </a>
              <a class="button button-outline" routerLink="/login">
                <span class="play-icon" aria-hidden="true">▶</span> I'm already a member
              </a>
            </div>
            <div class="social-proof">
              <div class="avatar-stack" aria-hidden="true">
                <span class="avatar avatar-one">J</span>
                <span class="avatar avatar-two">M</span>
                <span class="avatar avatar-three">A</span>
                <span class="avatar avatar-four">S</span>
              </div>
              <div class="proof-copy">
                <div class="stars" aria-label="5 out of 5 stars">★★★★★</div>
                <span>A better way to grow your skills</span>
              </div>
            </div>
          </div>

          <div class="hero-art" aria-label="A preview of a personalized learning dashboard">
            <div class="orbit orbit-outer" aria-hidden="true"></div>
            <div class="orbit orbit-inner" aria-hidden="true"></div>
            <div class="dashboard-card">
              <div class="dashboard-top">
                <div>
                  <span class="overline">YOUR LEARNING SPACE</span>
                  <h2>Good morning, Alex <span aria-hidden="true">✦</span></h2>
                  <p>Ready to make progress today?</p>
                </div>
                <span class="notification" aria-hidden="true">✦</span>
              </div>
              <div class="progress-card">
                <div class="progress-heading">
                  <div class="course-icon">✳</div>
                  <div class="course-copy">
                    <span>CONTINUE LEARNING</span>
                    <strong>Design that works</strong>
                  </div>
                  <span class="more-icon" aria-hidden="true">···</span>
                </div>
                <div class="progress-track"><span></span></div>
                <div class="progress-meta"><span>Chapter 4 of 8</span><strong>62%</strong></div>
              </div>
              <div class="dashboard-bottom">
                <div class="streak-card">
                  <span class="streak-icon" aria-hidden="true">↗</span>
                  <div><strong>7 days</strong><span>Learning streak</span></div>
                </div>
                <div class="tutor-card">
                  <span class="tutor-icon" aria-hidden="true">✧</span>
                  <div><strong>Your AI tutor</strong><span>Here when you need it</span></div>
                  <span class="tutor-arrow" aria-hidden="true">↗</span>
                </div>
              </div>
            </div>
            <div class="floating-note note-top">
              <span class="note-icon note-sparkle" aria-hidden="true">✦</span>
              <span><strong>Made for you</strong><small>Your learning, your pace</small></span>
            </div>
            <div class="floating-note note-bottom">
              <span class="note-icon note-check" aria-hidden="true">✓</span>
              <span><strong>One step closer</strong><small>Keep that momentum going</small></span>
            </div>
            <div class="art-decoration decoration-star" aria-hidden="true">✳</div>
            <div class="art-decoration decoration-dot" aria-hidden="true"></div>
          </div>
        </div>
        <a class="scroll-cue" href="#features"><span></span> Scroll to explore</a>
      </section>

      <section class="trust-strip" aria-label="Learning platform benefits">
        <p>A learning experience built around <strong>you</strong></p>
        <div class="trust-items">
          <span><i aria-hidden="true">✦</i> Learn at your pace</span>
          <span><i aria-hidden="true">✦</i> Get personal guidance</span>
          <span><i aria-hidden="true">✦</i> See your progress</span>
        </div>
      </section>

      <section class="features section-wrap" id="features">
        <div class="section-heading">
          <span class="eyebrow section-eyebrow">A little more possible</span>
          <h2>Everything you need to<br /><span class="gradient-text">keep growing.</span></h2>
          <p>Less searching for the right tools. More time spent learning what matters to you.</p>
        </div>
        <div class="feature-grid">
          <article class="feature-card feature-large">
            <div class="feature-copy">
              <span class="feature-icon icon-violet" aria-hidden="true">✧</span>
              <h3>Your own AI study buddy</h3>
              <p>Ask questions, get concepts explained, and find your way through tricky topics with help that's always there.</p>
              <a routerLink="/register" class="text-link">Meet your AI tutor <span aria-hidden="true">↗</span></a>
            </div>
            <div class="chat-preview" aria-hidden="true">
              <div class="chat-message">Can you explain this in a simpler way?</div>
              <div class="chat-response"><span class="chat-sparkle">✦</span><span>Of course! Think of it like building with blocks — each idea gives you a foundation for the next.</span></div>
              <div class="typing"><i></i><i></i><i></i></div>
            </div>
          </article>
          <article class="feature-card feature-courses">
            <span class="feature-icon icon-peach" aria-hidden="true">▤</span>
            <div class="mini-course-art" aria-hidden="true"><span>DESIGN<br />BETTER.</span><i>✳</i></div>
            <h3>Courses worth your time</h3>
            <p>Discover structured courses and bite-sized lessons you can fit into real life.</p>
          </article>
          <article class="feature-card feature-progress">
            <span class="feature-icon icon-mint" aria-hidden="true">↗</span>
            <div class="chart-preview" aria-hidden="true">
              <div class="chart-label"><span>This week</span><strong>+24%</strong></div>
              <div class="chart-bars"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
              <div class="chart-days"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div>
            </div>
            <h3>Progress you can feel</h3>
            <p>See how far you've come, celebrate small wins, and know what to focus on next.</p>
          </article>
        </div>
      </section>

      <section class="steps-section" id="how-it-works">
        <div class="section-wrap steps-layout">
          <div class="steps-intro">
            <span class="eyebrow section-eyebrow">Simple by design</span>
            <h2>Small steps.<br /><span class="gradient-text">Real momentum.</span></h2>
            <p>Big goals feel a lot closer when you know what to do next. Start with a course, then keep going one lesson at a time.</p>
            <a class="button button-dark" routerLink="/register">Find your starting point <span aria-hidden="true">↗</span></a>
          </div>
          <div class="steps-list">
            <article class="step">
              <span class="step-number">01</span>
              <div><h3>Choose what sparks your curiosity</h3><p>Explore courses and find a subject that feels right for you.</p></div>
              <span class="step-icon" aria-hidden="true">⌕</span>
            </article>
            <article class="step">
              <span class="step-number">02</span>
              <div><h3>Learn in a way that fits your day</h3><p>Pick up where you left off, whenever you have a moment.</p></div>
              <span class="step-icon" aria-hidden="true">◷</span>
            </article>
            <article class="step">
              <span class="step-number">03</span>
              <div><h3>Get unstuck and keep moving</h3><p>Lean on your AI tutor for a fresh explanation or a helpful nudge.</p></div>
              <span class="step-icon" aria-hidden="true">✧</span>
            </article>
            <article class="step">
              <span class="step-number">04</span>
              <div><h3>Look back and see how far you've come</h3><p>Track your progress and celebrate the skills you've built.</p></div>
              <span class="step-icon" aria-hidden="true">↗</span>
            </article>
          </div>
        </div>
      </section>

      <section class="audience-section section-wrap" id="for-everyone">
        <div class="audience-copy">
          <span class="eyebrow section-eyebrow">Room to grow, for everyone</span>
          <h2>Learn something.<br /><span class="gradient-text">Teach something.</span></h2>
          <p>Whether you're here to build new skills or share what you know, find the tools and space to make it happen.</p>
        </div>
        <div class="audience-cards">
          <article class="audience-card student-card">
            <span class="audience-number">01 / LEARN</span>
            <div class="audience-illustration student-illustration" aria-hidden="true"><span>✳</span><i>↗</i><b>✦</b></div>
            <h3>For curious minds</h3>
            <p>Find your next course, learn with a little help, and keep your goals in sight.</p>
            <a routerLink="/register" class="text-link">Start learning <span aria-hidden="true">↗</span></a>
          </article>
          <article class="audience-card instructor-card">
            <span class="audience-number">02 / TEACH</span>
            <div class="audience-illustration instructor-illustration" aria-hidden="true"><span>✧</span><i>▤</i><b>↗</b></div>
            <h3>For generous minds</h3>
            <p>Shape your knowledge into courses and help someone take their next step.</p>
            <a routerLink="/register" class="text-link">Teach a course <span aria-hidden="true">↗</span></a>
          </article>
        </div>
      </section>

      <section class="final-cta">
        <div class="cta-decoration cta-decoration-one" aria-hidden="true">✳</div>
        <div class="cta-decoration cta-decoration-two" aria-hidden="true">✦</div>
        <span class="eyebrow">Your next chapter starts here</span>
        <h2>Curiosity looks<br />good on you.</h2>
        <p>Make a little time for the things you want to learn.</p>
        <a routerLink="/register" class="button button-light">Create your free account <span aria-hidden="true">↗</span></a>
        <span class="cta-login">Already learning with us? <a routerLink="/login">Log in</a></span>
      </section>

      <footer class="site-footer">
        <a class="brand footer-brand" routerLink="/" aria-label="LearnAI home">
          <span class="brand-mark" aria-hidden="true">L</span>
          <span>learn<span class="brand-accent">ai</span></span>
        </a>
        <span class="footer-note">A little progress, every day.</span>
        <div class="footer-links"><a routerLink="/login">Log in</a><a routerLink="/register">Get started</a></div>
        <span class="copyright">© 2026 LearnAI</span>
      </footer>
    </main>
  `,
  styles: [`
    :host { display: block; overflow: hidden; background: #fbfaf8; color: #20211f; }
    main { --ink: #20211f; --muted: #72736e; --green: #315d4f; --lime: #d8ee9b; --cream: #fbfaf8; }
    .site-header { height: 82px; max-width: 1320px; padding: 0 52px; margin: auto; display: flex; align-items: center; justify-content: space-between; position: relative; z-index: 5; }
    .brand { display: inline-flex; align-items: center; gap: 10px; font-size: 1.25rem; line-height: 1; letter-spacing: -.06em; font-weight: 800; color: var(--ink); }
    .brand-mark { width: 32px; height: 32px; display: grid; place-items: center; border-radius: 11px 11px 11px 4px; background: var(--green); color: white; font-size: 1.05rem; letter-spacing: -.04em; }
    .brand-accent { color: #739659; }
    .desktop-nav, .header-actions { display: flex; align-items: center; }
    .desktop-nav { gap: 36px; margin-left: 48px; }
    .desktop-nav a, .sign-in { color: #5c5d58; font-size: .83rem; font-weight: 600; transition: color .2s ease; }
    .desktop-nav a:hover, .sign-in:hover { color: var(--green); }
    .header-actions { gap: 25px; }
    .button { display: inline-flex; align-items: center; justify-content: center; gap: 13px; border-radius: 999px; padding: 15px 22px; min-height: 50px; font-size: .84rem; font-weight: 700; transition: transform .2s ease, box-shadow .2s ease, background .2s ease; }
    .button:hover { transform: translateY(-2px); box-shadow: 0 9px 22px #1d33251c; }
    .button-small { min-height: 40px; padding: 10px 17px; color: white; background: var(--green); font-size: .78rem; }
    .button-primary { color: #1f2619; background: var(--lime); }
    .button-outline { color: white; border: 1px solid #ffffff50; background: #ffffff08; }
    .button-outline:hover { background: #ffffff16; }
    .button-dark { color: white; background: var(--green); margin-top: 28px; }
    .button-light { color: #28372b; background: #edf3d2; }
    .hero { min-height: 675px; padding: 55px 52px 50px; position: relative; isolation: isolate; overflow: hidden; color: white; background: #20392f; }
    .hero::before { content: ''; position: absolute; inset: 0; z-index: -2; opacity: .2; background-image: radial-gradient(#ffffff 0.65px, transparent 0.65px); background-size: 22px 22px; mask-image: linear-gradient(90deg, transparent, black 50%, transparent); }
    .hero::after { content: ''; position: absolute; width: 720px; height: 720px; right: 4%; top: -300px; border: 1px solid #ffffff12; border-radius: 50%; z-index: -1; }
    .hero-glow { position: absolute; z-index: -1; border-radius: 50%; filter: blur(1px); pointer-events: none; }
    .hero-glow-one { width: 570px; height: 570px; top: -255px; left: 26%; background: radial-gradient(circle, #47735c56, transparent 68%); animation: glow-drift 10s ease-in-out infinite alternate; }
    .hero-glow-two { width: 560px; height: 560px; right: -180px; bottom: -300px; background: radial-gradient(circle, #78885742, transparent 70%); animation: glow-drift 12s ease-in-out infinite alternate-reverse; }
    .hero-grid { max-width: 1220px; min-height: 535px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 38px; }
    .hero-copy { position: relative; z-index: 1; padding: 25px 0 38px; animation: reveal-up .8s both; }
    .eyebrow { display: inline-flex; align-items: center; gap: 9px; font-size: .71rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
    .hero .eyebrow { color: #d3dfcc; }
    .live-dot { width: 7px; height: 7px; background: #c9ec88; border-radius: 50%; box-shadow: 0 0 0 5px #c9ec8821; animation: pulse 2.4s ease-in-out infinite; }
    h1 { max-width: 630px; margin: 22px 0 18px; font-size: clamp(3.2rem, 6vw, 5.25rem); line-height: .99; letter-spacing: -.075em; font-weight: 600; }
    .gradient-text { color: #72906b; }
    .hero .gradient-text { color: #d7ed9d; }
    .hero-description { max-width: 470px; margin: 0; color: #d2dbd3; font-size: .99rem; line-height: 1.85; }
    .hero-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 30px; }
    .arrow { font-size: 1.05rem; }
    .play-icon { width: 22px; height: 22px; display: grid; place-items: center; border: 1px solid #ffffff60; border-radius: 50%; font-size: .52rem; }
    .social-proof { margin-top: 37px; display: flex; align-items: center; gap: 14px; }
    .avatar-stack { display: flex; padding-left: 3px; }
    .avatar { width: 30px; height: 30px; display: grid; place-items: center; margin-left: -4px; border: 2px solid #20392f; border-radius: 50%; color: #293329; font-size: .62rem; font-weight: 800; }
    .avatar-one { background: #edc9a9; }.avatar-two { background: #c5d3b2; }.avatar-three { background: #dcc6e3; }.avatar-four { background: #e6dc9f; }
    .proof-copy { display: grid; gap: 1px; }
    .stars { color: #e7d891; font-size: .76rem; letter-spacing: .12em; }
    .proof-copy > span { color: #ced7cf; font-size: .68rem; }
    .hero-art { min-height: 470px; display: grid; place-items: center; position: relative; animation: reveal-up .9s .15s both; }
    .orbit { position: absolute; border: 1px solid #dcead41a; border-radius: 50%; pointer-events: none; }
    .orbit-outer { width: 480px; height: 480px; animation: orbit-turn 70s linear infinite; }
    .orbit-outer::before, .orbit-inner::before { content: ''; position: absolute; width: 8px; height: 8px; border-radius: 50%; background: #c9e78c; box-shadow: 0 0 20px #c9e78c; left: 18%; top: 16%; }
    .orbit-inner { width: 395px; height: 395px; border-style: dashed; animation: orbit-turn 90s linear infinite reverse; }
    .orbit-inner::before { width: 5px; height: 5px; left: 87%; top: 70%; background: #e5c48e; box-shadow: 0 0 14px #e5c48e; }
    .dashboard-card { width: min(100%, 410px); padding: 25px; position: relative; z-index: 1; border: 1px solid #ffffff30; border-radius: 20px; background: linear-gradient(145deg, #fdfcf9, #f3f1e8); color: #252a25; box-shadow: 0 28px 70px #101a1540; transform: rotate(-2deg); animation: card-float 7s ease-in-out infinite; }
    .dashboard-top { display: flex; justify-content: space-between; align-items: flex-start; }
    .overline, .course-copy > span { color: #8c9188; font-size: .53rem; font-weight: 700; letter-spacing: .1em; }
    .dashboard-top h2 { margin: 8px 0 3px; font-size: 1.23rem; letter-spacing: -.055em; }
    .dashboard-top h2 span { color: #9aab61; font-size: .83rem; }
    .dashboard-top p { color: #8b8c84; font-size: .69rem; }
    .notification { width: 30px; height: 30px; display: grid; place-items: center; border-radius: 10px; color: #647d4f; background: #e9efdc; font-size: .9rem; }
    .progress-card { margin-top: 23px; padding: 16px; border: 1px solid #e8e8df; border-radius: 13px; background: white; }
    .progress-heading { display: flex; align-items: center; gap: 11px; }
    .course-icon { width: 35px; height: 35px; display: grid; place-items: center; border-radius: 10px; background: #e9ecd7; color: #657746; font-size: 1.15rem; }
    .course-copy { display: grid; gap: 3px; flex: 1; }
    .course-copy > span { font-size: .46rem; }
    .course-copy strong { font-size: .75rem; }
    .more-icon { color: #9b9d94; letter-spacing: 2px; }
    .progress-track { height: 6px; margin-top: 17px; overflow: hidden; border-radius: 99px; background: #edf0e9; }
    .progress-track span { display: block; height: 100%; width: 62%; border-radius: inherit; background: linear-gradient(90deg, #77966a, #bed386); transform-origin: left; animation: progress-in 1.5s .6s both; }
    .progress-meta { margin-top: 8px; display: flex; justify-content: space-between; color: #92948d; font-size: .6rem; }
    .progress-meta strong { color: #668153; }
    .dashboard-bottom { margin-top: 12px; display: grid; grid-template-columns: .85fr 1.35fr; gap: 10px; }
    .streak-card, .tutor-card { min-height: 70px; display: flex; align-items: center; gap: 9px; padding: 12px; border-radius: 12px; }
    .streak-card { background: #f1eee4; }
    .streak-icon, .tutor-icon { width: 28px; height: 28px; display: grid; flex: 0 0 auto; place-items: center; border-radius: 9px; color: #758d59; background: #e3e9d3; }
    .streak-icon { font-size: 1.05rem; }
    .streak-card > div, .tutor-card > div { display: grid; gap: 3px; }
    .streak-card strong, .tutor-card strong { font-size: .62rem; }
    .streak-card span:last-child, .tutor-card div span { color: #85877f; font-size: .5rem; }
    .tutor-card { background: #e8eee4; }
    .tutor-icon { color: #605181; background: #e2dced; }
    .tutor-arrow { margin-left: auto; color: #69805e; font-size: .8rem; }
    .floating-note { position: absolute; z-index: 2; display: flex; align-items: center; gap: 10px; padding: 12px 15px; border: 1px solid #ffffffad; border-radius: 12px; background: #fffc; color: #343932; box-shadow: 0 12px 32px #1124192e; backdrop-filter: blur(12px); animation: note-float 5s ease-in-out infinite; }
    .floating-note > span:last-child { display: grid; gap: 3px; }
    .floating-note strong { font-size: .66rem; }
    .floating-note small { color: #85877f; font-size: .55rem; }
    .note-top { top: 52px; right: -13px; }
    .note-bottom { bottom: 53px; left: -16px; animation-delay: -2.5s; }
    .note-icon { width: 29px; height: 29px; display: grid; place-items: center; border-radius: 9px; font-size: .83rem; }
    .note-sparkle { color: #705898; background: #eee8f5; }
    .note-check { color: #4e7b59; background: #e4efe2; }
    .art-decoration { position: absolute; color: #d4e99b; }
    .decoration-star { left: 0; top: 80px; font-size: 1.35rem; animation: slow-spin 15s linear infinite; }
    .decoration-dot { right: 20px; bottom: 75px; width: 8px; height: 8px; border-radius: 50%; background: #e5c48e; box-shadow: 0 0 16px #e5c48e; }
    .scroll-cue { position: absolute; bottom: 19px; left: 50%; display: flex; align-items: center; gap: 9px; transform: translateX(-50%); color: #c1cdc2; font-size: .62rem; letter-spacing: .03em; }
    .scroll-cue span { width: 15px; height: 23px; position: relative; border: 1px solid #cad7c277; border-radius: 99px; }
    .scroll-cue span::after { content: ''; position: absolute; top: 4px; left: 5px; width: 3px; height: 5px; border-radius: 99px; background: #d8ed9d; animation: scroll-dot 1.6s ease infinite; }
    .trust-strip { padding: 27px 30px; display: flex; align-items: center; justify-content: center; gap: 42px; border-bottom: 1px solid #eeede8; color: #777870; }
    .trust-strip > p { font-size: .78rem; }
    .trust-strip > p strong { color: var(--ink); }
    .trust-items { display: flex; align-items: center; gap: 29px; }
    .trust-items span { display: inline-flex; align-items: center; gap: 7px; font-size: .69rem; }
    .trust-items i { color: #829c68; font-style: normal; }
    .section-wrap { max-width: 1130px; margin: 0 auto; padding-left: 35px; padding-right: 35px; }
    .features { padding-top: 115px; padding-bottom: 120px; }
    .section-heading { max-width: 650px; margin: 0 auto 48px; text-align: center; }
    .section-eyebrow { color: #68845d; }
    .section-heading h2, .steps-intro h2, .audience-copy h2 { margin-top: 15px; font-size: clamp(2.5rem, 4vw, 3.7rem); font-weight: 600; line-height: 1.03; letter-spacing: -.075em; }
    .section-heading > p, .steps-intro > p, .audience-copy > p { max-width: 520px; margin: 17px auto 0; color: var(--muted); font-size: .89rem; line-height: 1.8; }
    .feature-grid { display: grid; grid-template-columns: 1.15fr .85fr; gap: 17px; }
    .feature-card { min-height: 285px; padding: 26px; position: relative; overflow: hidden; border: 1px solid #eeede8; border-radius: 17px; background: #f4f2ed; transition: transform .28s ease, box-shadow .28s ease; }
    .feature-card:hover, .audience-card:hover { transform: translateY(-5px); box-shadow: 0 16px 34px #28372b12; }
    .feature-large { grid-row: span 2; min-height: 405px; padding: 31px; background: #eff0e9; }
    .feature-icon { width: 38px; height: 38px; display: grid; place-items: center; border-radius: 12px; font-size: 1.12rem; }
    .icon-violet { color: #70618a; background: #e5dfed; }.icon-peach { color: #a36748; background: #f1e0d4; }.icon-mint { color: #527d67; background: #deeadf; }
    .feature-card h3 { margin-top: 17px; font-size: 1.15rem; letter-spacing: -.04em; }
    .feature-card p { max-width: 370px; margin-top: 8px; color: #777870; font-size: .76rem; line-height: 1.75; }
    .feature-large .feature-copy { max-width: 360px; position: relative; z-index: 1; }
    .text-link { display: inline-flex; align-items: center; gap: 8px; margin-top: 17px; color: #52734e; font-size: .73rem; font-weight: 700; }
    .text-link span { transition: transform .2s ease; }
    .text-link:hover span { transform: translate(2px, -2px); }
    .chat-preview { width: 62%; max-width: 365px; position: absolute; right: 27px; bottom: 27px; display: grid; gap: 9px; transform: rotate(-2deg); }
    .chat-message, .chat-response { padding: 12px 14px; border-radius: 12px; font-size: .62rem; line-height: 1.6; box-shadow: 0 7px 18px #2533210a; }
    .chat-message { width: 81%; justify-self: end; color: #5d5e59; background: #fff; }
    .chat-response { display: flex; gap: 8px; color: #4f5949; background: #e4eadc; }
    .chat-sparkle { color: #79945c; }
    .typing { width: fit-content; display: flex; gap: 4px; padding: 8px 12px; border-radius: 10px; background: white; }
    .typing i { width: 4px; height: 4px; border-radius: 50%; background: #94a68a; animation: typing 1s ease infinite; }
    .typing i:nth-child(2) { animation-delay: .15s; }.typing i:nth-child(3) { animation-delay: .3s; }
    .mini-course-art { height: 96px; margin-top: 13px; padding: 12px; display: flex; align-items: flex-end; justify-content: space-between; border-radius: 10px; color: #f8f3e9; background: linear-gradient(135deg, #bb7655, #e0a981 55%, #edc5a7); }
    .mini-course-art span { font-size: .89rem; line-height: .95; font-weight: 800; letter-spacing: -.06em; }
    .mini-course-art i { align-self: flex-start; font-size: 1.4rem; font-style: normal; animation: slow-spin 18s linear infinite; }
    .feature-courses h3 { margin-top: 15px; }
    .feature-courses p, .feature-progress p { max-width: 350px; }
    .chart-preview { position: absolute; top: 24px; right: 24px; width: 138px; }
    .chart-label { display: flex; justify-content: space-between; color: #85877f; font-size: .53rem; }
    .chart-label strong { color: #577859; }
    .chart-bars { height: 50px; margin-top: 8px; display: flex; align-items: end; gap: 5px; }
    .chart-bars i { flex: 1; height: 40%; border-radius: 4px 4px 1px 1px; background: #c8d9c1; animation: bar-rise .8s backwards; }
    .chart-bars i:nth-child(2) { height: 65%; animation-delay: .08s; }.chart-bars i:nth-child(3) { height: 48%; animation-delay: .16s; }.chart-bars i:nth-child(4) { height: 78%; animation-delay: .24s; }.chart-bars i:nth-child(5) { height: 59%; animation-delay: .32s; }.chart-bars i:nth-child(6) { height: 88%; animation-delay: .4s; }.chart-bars i:nth-child(7) { height: 100%; background: #76976d; animation-delay: .48s; }
    .chart-days { margin-top: 5px; display: flex; justify-content: space-between; color: #a3a49e; font-size: .42rem; }
    .feature-progress h3 { margin-top: 65px; }
    .steps-section { padding: 102px 0; background: #f2f1ec; }
    .steps-layout { display: grid; grid-template-columns: .8fr 1.2fr; gap: 100px; align-items: center; }
    .steps-intro h2 { font-size: clamp(2.6rem, 4vw, 3.8rem); }
    .steps-intro > p { margin-left: 0; }
    .steps-list { border-top: 1px solid #ddded5; }
    .step { min-height: 96px; display: grid; grid-template-columns: 40px 1fr 35px; gap: 17px; align-items: center; border-bottom: 1px solid #ddded5; transition: padding .25s ease; }
    .step:hover { padding: 0 8px; }
    .step-number { align-self: start; padding-top: 27px; color: #859179; font-size: .62rem; font-weight: 700; }
    .step h3 { font-size: .9rem; letter-spacing: -.02em; }
    .step p { margin-top: 5px; color: #7d7e77; font-size: .7rem; line-height: 1.65; }
    .step-icon { width: 31px; height: 31px; display: grid; place-items: center; border-radius: 10px; color: #6e865c; background: #e4e9dc; font-size: 1rem; }
    .audience-section { padding-top: 116px; padding-bottom: 120px; display: grid; grid-template-columns: .75fr 1.25fr; gap: 70px; align-items: center; }
    .audience-copy h2 { font-size: clamp(2.45rem, 3.7vw, 3.5rem); }
    .audience-copy > p { margin-left: 0; }
    .audience-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .audience-card { min-height: 330px; padding: 19px; border: 1px solid #ecebe5; border-radius: 15px; background: #f5f3ed; transition: transform .28s ease, box-shadow .28s ease; }
    .instructor-card { background: #edf0e8; }
    .audience-number { color: #87907e; font-size: .54rem; font-weight: 700; letter-spacing: .09em; }
    .audience-illustration { height: 112px; margin: 13px 0; position: relative; display: grid; place-items: center; overflow: hidden; border-radius: 10px; }
    .student-illustration { color: #fff4da; background: #bd8f6e; }
    .instructor-illustration { color: #edf2d6; background: #71866b; }
    .audience-illustration span { font-size: 4.5rem; line-height: 1; opacity: .75; animation: slow-spin 25s linear infinite; }
    .audience-illustration i { position: absolute; top: 22px; left: 26%; font-size: 1.5rem; font-style: normal; transform: rotate(-15deg); }
    .audience-illustration b { position: absolute; right: 26%; bottom: 17px; font-size: 1rem; }
    .instructor-illustration i { font-size: 1.7rem; transform: rotate(8deg); }
    .audience-card h3 { font-size: .96rem; letter-spacing: -.035em; }
    .audience-card p { min-height: 48px; margin-top: 7px; color: #777870; font-size: .67rem; line-height: 1.7; }
    .audience-card .text-link { margin-top: 9px; font-size: .68rem; }
    .final-cta { min-height: 380px; padding: 75px 24px; position: relative; isolation: isolate; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: white; background: #294637; }
    .final-cta::before { content: ''; position: absolute; inset: 0; z-index: -1; opacity: .15; background-image: radial-gradient(#fff 0.7px, transparent 0.7px); background-size: 20px 20px; mask-image: radial-gradient(ellipse, black, transparent 70%); }
    .final-cta .eyebrow { color: #ccdbbd; }
    .final-cta h2 { margin-top: 15px; font-size: clamp(3.1rem, 6vw, 5rem); font-weight: 600; line-height: .95; letter-spacing: -.075em; }
    .final-cta > p { margin-top: 14px; color: #d4ded4; font-size: .83rem; }
    .final-cta .button { margin-top: 25px; }
    .cta-login { margin-top: 14px; color: #cfdbd0; font-size: .68rem; }
    .cta-login a { color: #e6efcd; font-weight: 700; text-decoration: underline; text-underline-offset: 3px; }
    .cta-decoration { position: absolute; color: #d5e89b; opacity: .75; }
    .cta-decoration-one { top: 52px; left: 17%; font-size: 2.3rem; animation: slow-spin 20s linear infinite; }
    .cta-decoration-two { right: 18%; bottom: 54px; font-size: 1.6rem; animation: slow-spin 16s linear infinite reverse; }
    .site-footer { min-height: 85px; max-width: 1320px; margin: auto; padding: 20px 52px; display: flex; align-items: center; gap: 24px; }
    .footer-brand { font-size: 1rem; }
    .footer-brand .brand-mark { width: 27px; height: 27px; border-radius: 9px 9px 9px 3px; font-size: .9rem; }
    .footer-note, .copyright, .footer-links a { color: #85867f; font-size: .66rem; }
    .footer-links { display: flex; gap: 18px; margin-left: auto; }
    .footer-links a:hover { color: var(--green); }
    .copyright { padding-left: 19px; border-left: 1px solid #e7e6df; }
    @keyframes reveal-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes glow-drift { from { transform: translate3d(-10px, 0, 0) scale(.94); opacity: .7; } to { transform: translate3d(22px, 18px, 0) scale(1.08); opacity: 1; } }
    @keyframes card-float { 0%, 100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-9px) rotate(-1deg); } }
    @keyframes note-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
    @keyframes orbit-turn { to { transform: rotate(360deg); } }
    @keyframes slow-spin { to { transform: rotate(360deg); } }
    @keyframes pulse { 50% { box-shadow: 0 0 0 8px #c9ec880b; } }
    @keyframes progress-in { from { transform: scaleX(0); } to { transform: scaleX(1); } }
    @keyframes scroll-dot { 0% { opacity: 0; transform: translateY(0); } 40% { opacity: 1; } 100% { opacity: 0; transform: translateY(8px); } }
    @keyframes typing { 0%, 60%, 100% { transform: translateY(0); opacity: .55; } 30% { transform: translateY(-3px); opacity: 1; } }
    @keyframes bar-rise { from { height: 0; } }
    @media (min-width: 1500px) { .hero { min-height: 720px; } .hero-grid { min-height: 580px; } }
    @media (max-width: 1000px) {
      .site-header { padding: 0 30px; }.desktop-nav { gap: 20px; margin-left: 15px; }
      .hero { padding-right: 35px; padding-left: 35px; }.hero-grid { gap: 15px; }
      .hero-art { transform: scale(.9); }.note-top { right: -2px; }.note-bottom { left: -3px; }
      .steps-layout { gap: 50px; }.audience-section { gap: 35px; }
      .trust-strip { gap: 22px; }.trust-items { gap: 16px; }
    }
    @media (max-width: 760px) {
      .site-header { height: 70px; padding: 0 22px; }.desktop-nav { display: none; }.header-actions { gap: 15px; }
      .hero { padding: 50px 25px 55px; }.hero-grid { grid-template-columns: 1fr; gap: 0; }
      .hero-copy { padding: 15px 0 0; }.hero h1 { font-size: clamp(3.2rem, 12vw, 5rem); }
      .hero-description { max-width: 530px; }.hero-art { min-height: 405px; margin: -4px 0 0; transform: scale(.92); }
      .dashboard-card { width: min(400px, 87vw); }.orbit-outer { width: 420px; height: 420px; }.orbit-inner { width: 345px; height: 345px; }
      .note-top { right: max(0px, calc((100vw - 440px) / 2)); top: 26px; }.note-bottom { left: max(0px, calc((100vw - 440px) / 2)); bottom: 23px; }
      .trust-strip { flex-direction: column; gap: 13px; padding: 24px 15px; }.trust-items { flex-wrap: wrap; justify-content: center; gap: 10px 22px; }
      .section-wrap { padding-right: 25px; padding-left: 25px; }.features { padding-top: 82px; padding-bottom: 86px; }
      .feature-grid { grid-template-columns: 1fr 1fr; }.feature-large { grid-column: 1 / -1; grid-row: auto; min-height: 365px; }
      .chat-preview { width: 60%; }.feature-card { padding: 21px; }.feature-courses, .feature-progress { min-height: 305px; }
      .chart-preview { top: auto; bottom: 126px; left: 21px; width: 120px; }.feature-progress h3 { margin-top: 87px; }
      .steps-section { padding: 78px 0; }.steps-layout { grid-template-columns: 1fr; gap: 40px; }
      .steps-intro > p { max-width: 500px; }.audience-section { padding-top: 83px; padding-bottom: 87px; grid-template-columns: 1fr; gap: 30px; }
      .audience-copy > p { max-width: 550px; }.audience-card { min-height: 310px; }.site-footer { padding: 20px 25px; }
    }
    @media (max-width: 480px) {
      .brand { font-size: 1.12rem; gap: 8px; }.brand-mark { width: 29px; height: 29px; }.header-actions { gap: 12px; }
      .sign-in { font-size: .76rem; }.button-small { min-height: 37px; padding: 9px 12px; font-size: .71rem; }
      .hero { padding: 38px 21px 50px; }.hero h1 { margin-top: 19px; font-size: clamp(3rem, 14vw, 4.2rem); }
      .hero-description { font-size: .9rem; }.hero-actions { align-items: stretch; flex-direction: column; max-width: 300px; margin-top: 24px; }
      .hero-actions .button { width: 100%; }.social-proof { margin-top: 28px; }
      .hero-art { min-height: 355px; margin: 0 -18px; transform: scale(.86); }.dashboard-card { padding: 20px; }
      .note-top { right: 0; top: 11px; }.note-bottom { left: 0; bottom: 9px; }.floating-note { padding: 9px 11px; }
      .floating-note strong { font-size: .59rem; }.floating-note small { font-size: .49rem; }.note-icon { width: 25px; height: 25px; }
      .trust-items span { font-size: .62rem; }.section-wrap { padding-right: 20px; padding-left: 20px; }
      .section-heading { margin-bottom: 32px; }.section-heading h2, .steps-intro h2, .audience-copy h2 { font-size: 2.65rem; }
      .feature-grid { grid-template-columns: 1fr; }.feature-large { grid-column: auto; min-height: 390px; }.feature-courses, .feature-progress { min-height: 285px; }
      .chat-preview { width: 75%; right: 18px; bottom: 20px; }.feature-progress h3 { margin-top: 70px; }
      .chart-preview { bottom: 115px; }.steps-layout { gap: 32px; }.step { grid-template-columns: 30px 1fr 30px; gap: 10px; min-height: 100px; }
      .step h3 { font-size: .81rem; }.step p { font-size: .66rem; }
      .audience-cards { grid-template-columns: 1fr; }.audience-card { min-height: 0; }.audience-illustration { height: 120px; }
      .final-cta { min-height: 360px; }.final-cta h2 { font-size: 3.5rem; }.cta-decoration-one { left: 8%; }.cta-decoration-two { right: 9%; }
      .site-footer { flex-wrap: wrap; gap: 12px 16px; }.footer-note { margin-left: auto; }.footer-links { margin-left: 0; }.copyright { margin-left: auto; padding-left: 0; border-left: 0; }
    }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
    }
  `],
})
export class LandingComponent { }
