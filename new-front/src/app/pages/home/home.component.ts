import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideUsers, lucideArrowRight, lucideMessageSquare, lucideStar, lucidePlus,
  lucideHandshake, lucideSparkles, lucideZap, lucideMail, lucideActivity,
  lucideClock3, lucideTrendingUp, lucideMessageCircle, lucideBriefcase
} from '@ng-icons/lucide';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { ForumService } from '../../modules/community/forum/services/forum.service';
import { ConnectionService } from '../../modules/community/network/services/connection.service';
import { MarketplaceService } from '../../modules/community/marketplace/services/marketplace.service';
import { ReputationService } from '../../modules/community/reputation/services/reputation.service';
import { User } from '../../core/models/user.model';

interface StatCard {
  label: string;
  value: number;
  icon: string;
  color: string;
  bg: string;
  route: string;
}

interface DashPost {
  id: string;
  title: string;
  author: string;
  initials: string;
  date: string;
  replies: number;
  likes: number;
  sector?: string;
}

interface LeaderboardUser {
  name: string;
  initials: string;
  points: number;
  role: string;
  badgeClass: string;
}

@Component({
  selector: 'app-home',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({
    lucideUsers, lucideArrowRight, lucideMessageSquare, lucideStar, lucidePlus,
    lucideHandshake, lucideSparkles, lucideZap, lucideMail, lucideActivity,
    lucideClock3, lucideTrendingUp, lucideMessageCircle, lucideBriefcase
  })],
  styles: [`
    :host { display: block; }
    .dash {
      display: flex;
      flex-direction: column;
      gap: 22px;
    }

    /* ── Welcome banner ── */
    .dash-banner {
      position: relative;
      border-radius: 20px;
      overflow: hidden;
      padding: clamp(20px, 3vw, 32px) clamp(20px, 3.5vw, 36px);
      background:
        linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.9)),
        linear-gradient(135deg, #EFF6FF 0%, #E0E7FF 60%, #DBEAFE 100%);
      border: 1px solid #DBEAFE;
    }
    .dash-banner__bg {
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: 0.65;
      background-image:
        radial-gradient(circle at 1.5px 1.5px, rgba(28,79,195,0.18) 1.5px, transparent 0),
        radial-gradient(ellipse at 100% 100%, rgba(28,79,195,0.12), transparent 50%);
      background-size: 22px 22px, auto;
    }
    .dash-banner__inner {
      position: relative;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 20px;
      flex-wrap: wrap;
    }
    .dash-banner__kicker {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #1C4FC3;
    }
    .dash-banner__title {
      font-size: clamp(1.4rem, 2.6vw, 1.85rem);
      font-weight: 800;
      color: #101c5e;
      letter-spacing: -0.025em;
      line-height: 1.1;
      margin: 8px 0 0;
    }
    .dash-banner__sub {
      font-size: 13px;
      color: var(--text-body);
      margin: 8px 0 0;
      max-width: 480px;
    }
    .dash-banner__actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .dash-cta {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 18px;
      font-size: 13px;
      font-weight: 700;
      border-radius: 99px;
      border: none;
      cursor: pointer;
      text-decoration: none;
      font-family: var(--font-sans);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .dash-cta--primary {
      background: linear-gradient(135deg, #1C4FC3, #1D1384);
      color: #fff;
      box-shadow: 0 8px 22px rgba(28,79,195,0.28);
    }
    .dash-cta--primary:hover { transform: translateY(-2px); }
    .dash-cta--ghost {
      background: #fff;
      color: #1C4FC3;
      border: 1px solid #D1E2FF;
    }
    .dash-cta--ghost:hover {
      background: #F3F4F6;
      transform: translateY(-2px);
    }

    /* ── KPI cards grid ── */
    .dash-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
    }
    .kpi-card {
      background: #fff;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
      text-decoration: none;
      color: inherit;
    }
    .kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
      border-color: #CBD5E1;
    }
    .kpi-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .kpi-content {
      display: flex;
      flex-direction: column;
    }
    .kpi-value {
      font-size: 24px;
      font-weight: 800;
      color: #0F172A;
      line-height: 1;
      margin-bottom: 4px;
    }
    .kpi-label {
      font-size: 13px;
      font-weight: 500;
      color: #64748B;
    }

    /* ── Two column layout ── */
    .dash-layout {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 22px;
    }
    @media (max-width: 1024px) {
      .dash-layout { grid-template-columns: 1fr; }
    }

    /* ── Panels ── */
    .panel {
      background: #fff;
      border: 1px solid #E2E8F0;
      border-radius: 20px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .panel__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #F1F5F9;
      padding-bottom: 14px;
    }
    .panel__title {
      font-size: 16px;
      font-weight: 800;
      color: #0F172A;
      margin: 0;
    }
    .panel__link {
      font-size: 12px;
      font-weight: 700;
      color: #1C4FC3;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .panel__link:hover { text-decoration: underline; }

    /* ── Forum list ── */
    .post-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .post-card {
      display: flex;
      gap: 14px;
      padding: 16px;
      border-radius: 12px;
      background: #F8FAFC;
      border: 1px solid #F1F5F9;
      transition: border-color 0.2s, background 0.2s;
    }
    .post-card:hover {
      background: #F1F5F9;
      border-color: #E2E8F0;
    }
    .post-avatar {
      width: 40px;
      height: 40px;
      border-radius: 99px;
      background: linear-gradient(135deg, #1C4FC3, #2563EB);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      flex-shrink: 0;
    }
    .post-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .post-meta {
      font-size: 11px;
      color: #64748B;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .post-sector {
      padding: 2px 6px;
      border-radius: 4px;
      background: #E2E8F0;
      color: #475569;
      font-weight: 700;
    }
    .post-title {
      font-size: 14px;
      font-weight: 700;
      color: #1E293B;
      margin: 0;
    }
    .post-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 4px;
      font-size: 12px;
      color: #64748B;
    }
    .post-action-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    /* ── Quick actions ── */
    .quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    .action-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 18px;
      border-radius: 12px;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      color: #334155;
      text-decoration: none;
      transition: background 0.2s, transform 0.2s;
    }
    .action-button:hover {
      background: #EFF6FF;
      border-color: #BFDBFE;
      color: #1C4FC3;
      transform: translateY(-2px);
    }
    .action-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: #EEF2F6;
      display: flex;
      align-items: center;
      justify-content: center;
      color: inherit;
    }
    .action-button:hover .action-icon {
      background: #DBEAFE;
    }
    .action-label {
      font-size: 12px;
      font-weight: 700;
      text-align: center;
    }

    /* ── Leaderboard ── */
    .leader-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .leader-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      border-radius: 10px;
      background: #fff;
      border: 1px solid #F1F5F9;
      transition: background 0.2s;
    }
    .leader-row:hover { background: #F8FAFC; }
    .leader-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .leader-rank {
      font-size: 13px;
      font-weight: 800;
      color: #64748B;
      width: 20px;
      text-align: center;
    }
    .leader-avatar {
      width: 32px;
      height: 32px;
      border-radius: 99px;
      background: #E2E8F0;
      color: #475569;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 11px;
    }
    .leader-details {
      display: flex;
      flex-direction: column;
    }
    .leader-name {
      font-size: 13px;
      font-weight: 700;
      color: #1E293B;
    }
    .leader-role {
      font-size: 10px;
      font-weight: 600;
      padding: 1px 5px;
      border-radius: 4px;
      width: max-content;
      margin-top: 2px;
    }
    .leader-score {
      font-size: 13px;
      font-weight: 800;
      color: #101c5e;
      display: flex;
      align-items: center;
      gap: 3px;
    }

    .role-admin { background: #FEE2E2; color: #EF4444; }
    .role-mentor { background: #FEF3C7; color: #D97706; }
    .role-investor { background: #ECFDF5; color: #10B981; }
    .role-expert { background: #E0F2FE; color: #0284C7; }
    .role-user { background: #F1F5F9; color: #475569; }
  `],
  template: `
    <div class="dash">

      <!-- ══ Welcome banner ══ -->
      <header class="dash-banner">
        <div class="dash-banner__bg"></div>
        <div class="dash-banner__inner">
          <div>
            <p class="dash-banner__kicker">Welcome back</p>
            <h2 class="dash-banner__title">Hello, {{ welcomeName() }}!</h2>
            <p class="dash-banner__sub">
              Your professional space for connecting, discussing, and collaborating within the FoundersLab community.
            </p>
          </div>
          <div class="dash-banner__actions">
            <a routerLink="/app/community/forum" class="dash-cta dash-cta--primary">
              <ng-icon name="lucideMessageSquare" size="14" /> Join Discussion
            </a>
            <a routerLink="/app/profile" class="dash-cta dash-cta--ghost">
              My Profile
            </a>
          </div>
        </div>
      </header>

      <!-- ══ KPI cards ══ -->
      <section class="dash-grid">
        @for (card of statCards(); track card.label) {
          <a [routerLink]="card.route" class="kpi-card">
            <div class="kpi-icon" [style.background-color]="card.bg" [style.color]="card.color">
              <ng-icon [name]="card.icon" size="20" />
            </div>
            <div class="kpi-content">
              <span class="kpi-value">{{ card.value }}</span>
              <span class="kpi-label">{{ card.label }}</span>
            </div>
          </a>
        }
      </section>

      <div class="dash-layout">
        <!-- ══ Left: Recent Discussions ══ -->
        <main class="panel">
          <div class="panel__head">
            <div>
              <h3 class="panel__title">Recent Discussions</h3>
              <p style="color:#64748B; font-size:12px; margin:2px 0 0;">Stay up to date with what others are saying</p>
            </div>
            <a routerLink="/app/community/forum" class="panel__link">
              View all <ng-icon name="lucideArrowRight" size="11" />
            </a>
          </div>

          @if (loadingPosts) {
            <p style="color:var(--text-muted); font-size:13px; text-align:center; padding: 24px 0;">Loading discussions…</p>
          } @else if (recentPosts.length === 0) {
            <p style="color:var(--text-muted); font-size:13px; text-align:center; padding: 24px 0;">No active discussions found. Be the first to start one!</p>
          } @else {
            <div class="post-list">
              @for (post of recentPosts; track post.id) {
                <article class="post-card">
                  <div class="post-avatar">
                    {{ post.initials }}
                  </div>
                  <div class="post-main">
                    <div class="post-meta">
                      <span class="post-author">{{ post.author }}</span>
                      <span>·</span>
                      <span class="post-date">{{ post.date }}</span>
                      @if (post.sector) {
                        <span class="post-sector">{{ post.sector }}</span>
                      }
                    </div>
                    <h4 class="post-title">{{ post.title }}</h4>
                    <div class="post-actions">
                      <span class="post-action-btn">
                        <ng-icon name="lucideMessageCircle" size="12" /> {{ post.replies }} comments
                      </span>
                      <span class="post-action-btn">
                        <ng-icon name="lucideStar" size="12" /> {{ post.likes }} likes
                      </span>
                    </div>
                  </div>
                </article>
              }
            </div>
          }
        </main>

        <!-- ══ Right Column ══ -->
        <aside style="display:flex; flex-direction:column; gap:22px;">

          <!-- ══ Résumé de progression ══ -->
          <app-resume-progression-widget></app-resume-progression-widget>

          <!-- ══ Quick shortcuts ══ -->
          <section class="panel">
            <div class="panel__head">
              <h3 class="panel__title">Quick Navigation</h3>
            </div>
            <div class="quick-actions-grid">
              <a routerLink="/app/community/network" class="action-button">
                <div class="action-icon">
                  <ng-icon name="lucideUsers" size="16" />
                </div>
                <span class="action-label">Find Peers</span>
              </a>
              <a routerLink="/app/community/chat" class="action-button">
                <div class="action-icon">
                  <ng-icon name="lucideMail" size="16" />
                </div>
                <span class="action-label">Messages</span>
              </a>
              <a routerLink="/app/community/marketplace" class="action-button">
                <div class="action-icon">
                  <ng-icon name="lucideBriefcase" size="16" />
                </div>
                <span class="action-label">Marketplace</span>
              </a>
              <a routerLink="/app/profile" class="action-button">
                <div class="action-icon">
                  <ng-icon name="lucideActivity" size="16" />
                </div>
                <span class="action-label">Edit Profile</span>
              </a>
            </div>
          </section>

          <!-- ══ Reputation Leaderboard ══ -->
          <section class="panel">
            <div class="panel__head">
              <h3 class="panel__title">Top Contributors</h3>
              <a routerLink="/app/community/reputation" class="panel__link">
                View Rank
              </a>
            </div>

            @if (loadingLeaderboard) {
              <p style="color:var(--text-muted); font-size:13px; text-align:center; padding:12px 0;">Loading leaderboard…</p>
            } @else {
              <div class="leader-list">
                @for (user of leaderboard; track user.name; let idx = $index) {
                  <div class="leader-row">
                    <div class="leader-info">
                      <span class="leader-rank">#{{ idx + 1 }}</span>
                      <div class="leader-avatar">{{ user.initials }}</div>
                      <div class="leader-details">
                        <span class="leader-name">{{ user.name }}</span>
                        <span class="leader-role" [className]="'leader-role ' + user.badgeClass">{{ user.role }}</span>
                      </div>
                    </div>
                    <div class="leader-score">
                      <ng-icon name="lucideStar" size="12" style="color:#D97706;" /> {{ user.points }}
                    </div>
                  </div>
                }
              </div>
            }
          </section>

        </aside>
      </div>

    </div>
  `,
})
export class HomeComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly forumService = inject(ForumService);
  private readonly connectionService = inject(ConnectionService);
  private readonly marketplaceService = inject(MarketplaceService);
  private readonly reputationService = inject(ReputationService);

  protected currentUser: User | null = null;
  protected recentPosts: DashPost[] = [];
  protected leaderboard: LeaderboardUser[] = [];

  protected loadingPosts = true;
  protected loadingLeaderboard = true;

  // Signal stats
  protected statCards = signal<StatCard[]>([
    { label: 'Active Members', value: 0, icon: 'lucideUsers', color: '#1C4FC3', bg: '#EFF6FF', route: '/app/community/network' },
    { label: 'Forum Discussions', value: 0, icon: 'lucideMessageSquare', color: '#059669', bg: '#ECFDF5', route: '/app/community/forum' },
    { label: 'Job Opportunities', value: 0, icon: 'lucideBriefcase', color: '#7C3AED', bg: '#F5F3FF', route: '/app/community/marketplace' },
    { label: 'My Reputation Points', value: 0, icon: 'lucideStar', color: '#D97706', bg: '#FEF3C7', route: '/app/community/reputation' }
  ]);

  protected welcomeName(): string {
    if (this.currentUser) {
      const first = this.currentUser.prenom ?? '';
      const last = this.currentUser.name ?? '';
      const full = `${first} ${last}`.trim();
      if (full) return full;
    }
    const email = this.authService.getEmail();
    if (email) return email.split('@')[0].replace(/[._-]+/g, ' ');
    return 'User';
  }

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.userService.getUserById(Number(userId)).then((user) => {
        this.currentUser = user;
        this.loadUserReputation(String(userId));
        this.cdr.markForCheck();
      }).catch(() => { /* fall back */ });
    }

    this.loadGlobalStats();
    this.loadRecentDiscussions();
    this.loadLeaderboard();
  }

  private loadUserReputation(userId: string): void {
    this.reputationService.getReputation(userId).pipe(
      catchError(() => of(null))
    ).subscribe((rep) => {
      const points = rep ? rep.points : 120; // Default points fallback
      this.updateStatCard('My Reputation Points', points);
    });
  }

  private loadGlobalStats(): void {
    // 1. Fetch total users
    this.userService.getAllUsers().then((users) => {
      this.updateStatCard('Active Members', users ? users.length : 1420);
    }).catch(() => {
      this.updateStatCard('Active Members', 1420); // Fallback
    });

    // 2. Fetch forum discussions
    this.forumService.getAllPosts().pipe(
      catchError(() => of([]))
    ).subscribe((posts) => {
      this.updateStatCard('Forum Discussions', posts ? posts.length : 86);
    });

    // 3. Fetch opportunities count
    this.marketplaceService.getAllOpportunities(0, 50).pipe(
      catchError(() => of(null))
    ).subscribe((page) => {
      const count = page ? page.totalElements : 45;
      this.updateStatCard('Job Opportunities', count);
    });
  }

  private updateStatCard(label: string, value: number): void {
    const updated = this.statCards().map(card => {
      if (card.label === label) {
        return { ...card, value };
      }
      return card;
    });
    this.statCards.set(updated);
    this.cdr.markForCheck();
  }

  private loadRecentDiscussions(): void {
    this.forumService.getAllPosts().pipe(
      catchError(() => of([]))
    ).subscribe({
      next: (posts) => {
        if (posts && posts.length > 0) {
          this.recentPosts = posts.slice(0, 4).map(p => ({
            id: p.id,
            title: p.title,
            author: p.authorName || 'Anonymous',
            initials: this.getInitials(p.authorName || '?'),
            date: this.formatDate(p.createdAt),
            replies: p.comments ? p.comments.length : 0,
            likes: p.likedBy ? p.likedBy.length : 0,
            sector: p.sector
          }));
        } else {
          this.recentPosts = this.getFallbackPosts();
        }
        this.loadingPosts = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.recentPosts = this.getFallbackPosts();
        this.loadingPosts = false;
        this.cdr.markForCheck();
      }
    });
  }

  private loadLeaderboard(): void {
    this.reputationService.getLeaderboard().pipe(
      catchError(() => of([]))
    ).subscribe({
      next: (leaders) => {
        if (leaders && leaders.length > 0) {
          this.leaderboard = leaders.slice(0, 5).map(l => ({
            name: 'User ' + l.memberId,
            initials: 'U' + (l.memberId ? String(l.memberId).slice(-1) : '?'),
            points: l.points,
            role: l.level || 'Member',
            badgeClass: this.getBadgeClass(l.level)
          }));
        } else {
          this.leaderboard = this.getFallbackLeaderboard();
        }
        this.loadingLeaderboard = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.leaderboard = this.getFallbackLeaderboard();
        this.loadingLeaderboard = false;
        this.cdr.markForCheck();
      }
    });
  }

  private getInitials(name: string): string {
    return name.split(/\s+/).map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?';
  }

  private formatDate(dateStr?: string | Date): string {
    if (!dateStr) return 'Recent';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  private getBadgeClass(level?: string): string {
    const l = (level || '').toUpperCase();
    if (l.includes('ADMIN')) return 'role-admin';
    if (l.includes('MENTOR')) return 'role-mentor';
    if (l.includes('INVESTOR')) return 'role-investor';
    if (l.includes('EXPERT')) return 'role-expert';
    return 'role-user';
  }

  private getFallbackPosts(): DashPost[] {
    return [
      { id: '1', title: 'Welcome to the new FoundersLab Community forum!', author: 'Admin Team', initials: 'AD', date: 'Jul 1', replies: 8, likes: 24, sector: 'General' },
      { id: '2', title: 'Looking for a frontend co-founder in Tunis (Angular/React)', author: 'Anis Ben Amor', initials: 'AA', date: 'Jul 4', replies: 3, likes: 5, sector: 'Tech' },
      { id: '3', title: 'Pitch deck review session next Tuesday. Join the feedback thread.', author: 'Sarah Labidi', initials: 'SL', date: 'Jul 5', replies: 12, likes: 18, sector: 'Feedback' }
    ];
  }

  private getFallbackLeaderboard(): LeaderboardUser[] {
    return [
      { name: 'Emna Slim', initials: 'ES', points: 420, role: 'Mentor', badgeClass: 'role-mentor' },
      { name: 'Kais Gharbi', initials: 'KG', points: 380, role: 'Expert', badgeClass: 'role-expert' },
      { name: 'Selim Riahi', initials: 'SR', points: 290, role: 'Investor', badgeClass: 'role-investor' },
      { name: 'Meriam Toumi', initials: 'MT', points: 210, role: 'Member', badgeClass: 'role-user' },
      { name: 'Youssef Trabelsi', initials: 'YT', points: 180, role: 'Member', badgeClass: 'role-user' }
    ];
  }
}
