import { Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-community',
  template: `
    <div class="community-shell">

      <!-- ══ Banner ══ -->
      <section class="cm-banner">
        <div class="cm-banner__bg"></div>
        <div class="cm-banner__inner">
          <div>
            <span class="cm-banner__kicker">FoundersLab community</span>
            <h1 class="cm-banner__title">Connect, share &amp; grow<br/>with founders around you</h1>
            <p class="cm-banner__sub">Forum discussions, marketplace opportunities, your network, and direct messages — all in one place.</p>
          </div>
          <div class="cm-banner__illustration" aria-hidden="true">
            <div class="cm-bubble cm-bubble--1">💬</div>
            <div class="cm-bubble cm-bubble--2">🤝</div>
            <div class="cm-bubble cm-bubble--3">🏆</div>
          </div>
        </div>
      </section>

      <!-- ══ Sub-nav tiles ══ -->
      <nav class="cm-subnav" aria-label="Community sections">
        <a routerLink="forum" routerLinkActive="cm-subnav-item--active" class="cm-subnav-item">
          <span class="cm-subnav-item__icon" style="background:rgba(28,79,195,0.1); color:#1C4FC3;">💬</span>
          <span class="cm-subnav-item__label">Forum</span>
        </a>
        <a routerLink="marketplace" routerLinkActive="cm-subnav-item--active" class="cm-subnav-item">
          <span class="cm-subnav-item__icon" style="background:rgba(217,119,6,0.1); color:#D97706;">🏪</span>
          <span class="cm-subnav-item__label">Marketplace</span>
        </a>
        <a routerLink="network" routerLinkActive="cm-subnav-item--active" class="cm-subnav-item">
          <span class="cm-subnav-item__icon" style="background:rgba(5,150,105,0.1); color:#059669;">🤝</span>
          <span class="cm-subnav-item__label">Network</span>
        </a>
        <a routerLink="messaging" routerLinkActive="cm-subnav-item--active" class="cm-subnav-item">
          <span class="cm-subnav-item__icon" style="background:rgba(8,145,178,0.1); color:#0891B2;">✉️</span>
          <span class="cm-subnav-item__label">Messages</span>
        </a>
        <a routerLink="reputation" routerLinkActive="cm-subnav-item--active" class="cm-subnav-item">
          <span class="cm-subnav-item__icon" style="background:rgba(79,89,173,0.12); color:#4f59ad;">🏆</span>
          <span class="cm-subnav-item__label">Reputation</span>
        </a>
      </nav>

      <!-- Main Content Outlet -->
      <main class="community-content">
        <router-outlet></router-outlet>
      </main>

    </div>
  `,
  styles: [`
    .community-shell {
      min-height: 100vh;
      background: #FAFBFD;
      padding-bottom: 80px;
    }

    /* ── Banner ── */
    .cm-banner {
      position: relative;
      max-width: 1200px;
      margin: 32px auto 0;
      padding: clamp(28px, 4vw, 44px) clamp(24px, 4vw, 48px);
      overflow: hidden;
      border-radius: 20px;
      border: 1px solid #DBEAFE;
      background:
        linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.9)),
        linear-gradient(135deg, #EFF6FF 0%, #E0E7FF 60%, #DBEAFE 100%);
    }
    .cm-banner__bg {
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: 0.7;
      background-image:
        radial-gradient(circle at 1.5px 1.5px, rgba(28,79,195,0.18) 1.5px, transparent 0),
        radial-gradient(ellipse at 110% 100%, rgba(28,79,195,0.12), transparent 50%),
        radial-gradient(ellipse at -10% 0%, rgba(79,89,173,0.10), transparent 50%);
      background-size: 22px 22px, auto, auto;
    }
    .cm-banner__inner {
      position: relative;
      display: grid;
      gap: 24px;
      grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
      align-items: center;
    }
    @media (max-width: 760px) {
      .cm-banner__inner { grid-template-columns: 1fr; }
      .cm-banner__illustration { display: none !important; }
    }
    .cm-banner__kicker {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #1C4FC3;
    }
    .cm-banner__title {
      font-size: clamp(1.6rem, 3.4vw, 2.4rem);
      font-weight: 800;
      color: #101c5e;
      letter-spacing: -0.03em;
      line-height: 1.1;
      margin: 10px 0 0;
    }
    .cm-banner__sub {
      font-size: 14px;
      color: var(--text-body);
      margin: 10px 0 0;
      line-height: 1.55;
      max-width: 460px;
    }

    /* Decorative bubble illustration */
    .cm-banner__illustration {
      position: relative;
      height: 140px;
    }
    .cm-bubble {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 24px;
      background: #fff;
      box-shadow: 0 12px 28px rgba(16,28,94,0.12);
      border: 1px solid #DBEAFE;
      font-size: 32px;
      animation: cm-float 6s ease-in-out infinite;
    }
    .cm-bubble--1 {
      width: 70px; height: 70px;
      top: 0; right: 30%;
      animation-delay: -1s;
    }
    .cm-bubble--2 {
      width: 86px; height: 86px;
      top: 28px; right: 5%;
      animation-delay: -3s;
    }
    .cm-bubble--3 {
      width: 60px; height: 60px;
      bottom: 0; right: 50%;
      animation-delay: -5s;
    }
    @keyframes cm-float {
      0%, 100% { transform: translateY(0); }
      50%      { transform: translateY(-8px); }
    }

    /* ── Sub-nav tiles ── */
    .cm-subnav {
      max-width: 1200px;
      margin: 20px auto 0;
      padding: 0 24px;
      display: grid;
      gap: 12px;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    }
    .cm-subnav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      background: #fff;
      border: 1px solid #E5E7EB;
      border-radius: 14px;
      text-decoration: none;
      cursor: pointer;
      transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s;
    }
    .cm-subnav-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(15,23,42,0.06);
      border-color: rgba(28,79,195,0.25);
    }
    .cm-subnav-item--active {
      border-color: #1C4FC3;
      box-shadow: 0 8px 24px rgba(28,79,195,0.18);
      background: linear-gradient(135deg, rgba(28,79,195,0.04), #fff);
    }
    .cm-subnav-item__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      border-radius: 12px;
      font-size: 18px;
      flex-shrink: 0;
    }
    .cm-subnav-item__label {
      font-size: 13px;
      font-weight: 700;
      color: #1E293B;
      letter-spacing: -0.01em;
    }
    .cm-subnav-item--active .cm-subnav-item__label {
      color: #1C4FC3;
    }

    /* Content area */
    .community-content {
      max-width: 1200px;
      margin: 32px auto 0;
      padding: 0 24px;
    }
  `]
})
export class CommunityComponent {}
