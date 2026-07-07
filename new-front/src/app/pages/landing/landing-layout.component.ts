import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideMenu, lucideX, lucideCalendar, lucideRocket,
  lucideLayoutDashboard, lucideLogOut,
  lucideSun, lucideMoon, lucideUser, lucideSettings, lucideChevronDown,
  lucideUsers, lucideBell, lucideCheck, lucideMessageSquare, lucideMail,
  lucideBriefcase, lucideStar, lucideMap, lucideZap, lucideGraduationCap,
} from '@ng-icons/lucide';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  keyframes,
} from '@angular/animations';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { CommunityNotificationService } from '../../modules/community/shared/services/notification.service';
import { NotificationType, CommunityNotification } from '../../modules/community/shared/models/notification.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-landing-layout',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({
    lucideMenu, lucideX, lucideCalendar, lucideRocket, lucideLayoutDashboard, lucideLogOut,
    lucideSun, lucideMoon, lucideUser, lucideSettings, lucideChevronDown, lucideUsers,
    lucideBell, lucideCheck, lucideMessageSquare, lucideMail, lucideBriefcase, lucideStar,
    lucideMap, lucideZap, lucideGraduationCap,
  })],
  templateUrl: './landing-layout.component.html',
  styleUrl:    './landing-layout.component.css',
  host: {
    '(window:scroll)': 'onWindowScroll()',
  },
  animations: [
    trigger('pillLeft', [
      state('hidden',  style({ opacity: 0, transform: 'translateX(-340px)' })),
      state('visible', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('hidden => visible',
        animate('600ms var(--ease-spring, cubic-bezier(0.25,0.46,0.45,0.94))')
      ),
    ]),
    trigger('pillCenter', [
      state('hidden',  style({ opacity: 0, transform: 'scale(0.6)' })),
      state('visible', style({ opacity: 1, transform: 'scale(1)' })),
      transition('hidden => visible',
        animate('600ms 40ms var(--ease-spring, cubic-bezier(0.25,0.46,0.45,0.94))')
      ),
    ]),
    trigger('pillRight', [
      state('hidden',  style({ opacity: 0, transform: 'translateX(340px)' })),
      state('visible', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('hidden => visible',
        animate('600ms var(--ease-spring, cubic-bezier(0.25,0.46,0.45,0.94))')
      ),
    ]),
    trigger('navSettle', [
      transition('* => settled', [
        animate('700ms 620ms cubic-bezier(0.25,0.46,0.45,0.94)',
          keyframes([
            style({ transform: 'translateY(0)',    offset: 0 }),
            style({ transform: 'translateY(-5px)', offset: 0.45 }),
            style({ transform: 'translateY(0)',    offset: 1 }),
          ])
        ),
      ]),
    ]),
    trigger('badge', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(14px)' }),
        animate('350ms cubic-bezier(0.25,0.46,0.45,0.94)',
          style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('250ms cubic-bezier(0.25,0.46,0.45,0.94)',
          style({ opacity: 0, transform: 'translateY(-10px)' })),
      ]),
    ]),
    trigger('mobileOverlay', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-8px)' }),
        animate('280ms cubic-bezier(0.25,0.46,0.45,0.94)',
          style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.25,0.46,0.45,0.94)',
          style({ opacity: 0, transform: 'translateY(-8px)' })),
      ]),
    ]),
  ],
})
export class LandingLayoutComponent implements OnInit, OnDestroy {
  private readonly authService  = inject(AuthService);
  private readonly themeService = inject(ThemeService);
  private readonly notificationService = inject(CommunityNotificationService);
  private readonly router = inject(Router);

  protected readonly mobileMenu   = signal(false);
  protected readonly scrolled     = signal(false);
  protected readonly pillState    = signal<'hidden' | 'visible'>('hidden');
  protected readonly settleState  = signal<'idle' | 'settled'>('idle');
  protected readonly showBadge    = signal(false);
  protected readonly activeLink   = signal('home');
  protected readonly userDropdownOpen = signal(false);
  protected readonly showNotifications = signal(false);

  protected readonly isLoggedIn         = computed(() => this.authService.isLoggedIn());
  protected readonly canAccessDashboard = computed(() =>
    this.authService.hasRole('ADMIN', 'MENTOR', 'PARTNER', 'PARTENAIRE')
  );
  protected readonly userInitial = computed(() => {
    const e = this.authService.getEmail();
    return e ? e[0].toUpperCase() : '?';
  });
  protected readonly isDark = computed(() => this.themeService.theme() === 'dark');
  protected readonly userName = computed(() => {
    const e = this.authService.getEmail();
    return e || 'User';
  });

  protected readonly notifications = toSignal(this.notificationService.notifications$, { initialValue: [] as CommunityNotification[] });
  protected readonly unreadCount = toSignal(this.notificationService.unreadCount$, { initialValue: 0 });

  private badgeTimer?: ReturnType<typeof setTimeout>;

  protected readonly navLinks = [
    { id: 'home',       label: 'Home',         route: '/',                 type: 'route' },
    { id: 'community',  label: 'Community',    route: '/community',        type: 'route' },
    { id: 'services',   label: 'Services',     anchor: 'services',         type: 'anchor' },
    { id: 'about',      label: 'About',        anchor: 'about',            type: 'anchor' },
    { id: 'contact',    label: 'Contact',      anchor: 'contact',          type: 'anchor' },
  ];

  protected readonly filteredNavLinks = computed(() => {
    const userRole = this.authService.getRole();
    const isLoggedIn = this.authService.isLoggedIn();

    return this.navLinks.filter((link) => {
      const roles = (link as { roles?: string[] }).roles;
      if (!roles) return true;
      if (!isLoggedIn) return false;
      return roles.includes(userRole);
    });
  });

  ngOnInit(): void {
    setTimeout(() => this.pillState.set('visible'), 60);
    setTimeout(() => this.settleState.set('settled'), 720);
    setTimeout(() => this.showBadge.set(true), 950);
    this.badgeTimer = setTimeout(() => this.showBadge.set(false), 5000);

    const userId = this.authService.getUserId()?.toString();
    if (userId) {
      this.notificationService.init(userId);
    }

    // Sync active nav link with the current URL.
    this.syncActiveFromUrl(this.router.url);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.syncActiveFromUrl(e.urlAfterRedirects));
  }

  private syncActiveFromUrl(url: string): void {
    const path = url.split('?')[0].split('#')[0];

    // Longest-match-first so /partenariat beats /
    const match = this.navLinks
      .filter((l): l is typeof l & { route: string } => l.type === 'route')
      .map((l) => ({ id: l.id, route: l.route }))
      .sort((a, b) => b.route.length - a.route.length)
      .find((l) => l.route === '/' ? path === '/' : path.startsWith(l.route));

    if (match) {
      this.activeLink.set(match.id);
    } else if (path === '/' || path === '') {
      this.activeLink.set('home');
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.badgeTimer);
  }

  protected onWindowScroll(): void {
    this.scrolled.set(window.scrollY > 72);
  }

  protected setActive(id: string): void { this.activeLink.set(id); }

  protected scrollTo(anchor: string): void {
    this.setActive(anchor);
    this.mobileMenu.set(false);

    const scrollNow = () => {
      // Retry briefly while the landing component finishes mounting after navigation.
      let attempts = 0;
      const tryScroll = () => {
        const el = document.getElementById(anchor);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (attempts++ < 20) {
          setTimeout(tryScroll, 50);
        }
      };
      tryScroll();
    };

    // If we're not on the landing route, navigate there first.
    const onLanding = this.router.url.split('?')[0].split('#')[0] === '/';
    if (onLanding) {
      scrollNow();
    } else {
      this.router.navigateByUrl('/').then(() => scrollNow());
    }
  }

  protected dismissBadge(): void { this.showBadge.set(false); }

  protected logout(): void {
    this.authService.logout();
    this.mobileMenu.set(false);
  }

  protected toggleTheme(): void {
    this.themeService.theme.set(this.themeService.theme() === 'dark' ? 'light' : 'dark');
  }

  protected toggleUserDropdown(): void { this.userDropdownOpen.set(!this.userDropdownOpen()); }
  protected closeUserDropdown(): void { this.userDropdownOpen.set(false); }

  protected markRead(n: CommunityNotification): void {
    const userId = this.authService.getUserId()?.toString() || '';
    if (n.id && !n.read) {
      this.notificationService.markAsRead(n.id, userId).subscribe();
    }
    this.showNotifications.set(false);
    this.userDropdownOpen.set(false);

    // Navigation logic
    switch (n.type) {
      case NotificationType.CONNECTION_REQUEST:
        this.router.navigate(['/community/network/pending']);
        break;
      case NotificationType.NEW_COMMENT:
      case NotificationType.NEW_POST:
        if (n.metadata?.['postId']) {
          this.router.navigate(['/community/forum', n.metadata['postId']]);
        }
        break;
      case NotificationType.APPLICATION_RECEIVED:
        if (n.metadata?.['opportunityId']) {
          this.router.navigate(['/community/marketplace/publisher-dashboard']);
        }
        break;
      case NotificationType.REPUTATION_GAINED:
        this.router.navigate(['/community/reputation']);
        break;
    }
  }

  protected markAllRead(): void {
    const userId = this.authService.getUserId()?.toString();
    if (userId) {
      this.notificationService.markAllAsRead(userId).subscribe();
    }
  }

  protected getNotifIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.CONNECTION_REQUEST: return 'lucideUser';
      case NotificationType.CONNECTION_ACCEPTED: return 'lucideCheck';
      case NotificationType.NEW_POST: return 'lucideMessageSquare';
      case NotificationType.NEW_COMMENT: return 'lucideMail';
      case NotificationType.APPLICATION_RECEIVED: return 'lucideBriefcase';
      case NotificationType.REPUTATION_GAINED: return 'lucideStar';
      default: return 'lucideBell';
    }
  }

  protected getNotifColor(type: NotificationType): string {
    switch (type) {
      case NotificationType.CONNECTION_REQUEST: return '#F3E8FF';
      case NotificationType.CONNECTION_ACCEPTED: return '#DCFCE7';
      case NotificationType.NEW_POST: return '#DBEAFE';
      case NotificationType.NEW_COMMENT: return '#E0E7FF';
      case NotificationType.APPLICATION_RECEIVED: return '#FEF3C7';
      case NotificationType.REPUTATION_GAINED: return '#FEF9C3';
      default: return '#F1F5F9';
    }
  }

  protected getNotifTextColor(type: NotificationType): string {
    switch (type) {
      case NotificationType.CONNECTION_REQUEST: return '#7E22CE';
      case NotificationType.CONNECTION_ACCEPTED: return '#15803D';
      case NotificationType.NEW_POST: return '#1D4ED8';
      case NotificationType.NEW_COMMENT: return '#4338CA';
      case NotificationType.APPLICATION_RECEIVED: return '#B45309';
      case NotificationType.REPUTATION_GAINED: return '#A16207';
      default: return '#64748B';
    }
  }

  protected getNotifTitle(type: NotificationType): string {
    switch (type) {
      case NotificationType.CONNECTION_REQUEST: return 'Demande';
      case NotificationType.CONNECTION_ACCEPTED: return 'Acceptée';
      case NotificationType.NEW_POST: return 'Nouveau post';
      case NotificationType.NEW_COMMENT: return 'Commentaire';
      case NotificationType.APPLICATION_RECEIVED: return 'Candidature';
      case NotificationType.REPUTATION_GAINED: return 'Points';
      default: return 'Notification';
    }
  }
}
