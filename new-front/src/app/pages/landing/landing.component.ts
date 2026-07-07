import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideRocket,
  lucideTrendingUp,
  lucideUsers,
  lucideGraduationCap,
  lucideMap,
  lucideZap,
  lucideHandshake,
  lucideCalendar,
  lucideShield,
  lucideArrowRight,
  lucideCheck,
  lucideStar,
  lucideGlobe,
  lucideSparkles,
  lucideMapPin,
  lucideClock3,
  lucideChevronRight,
  lucideMail,
  lucidePhone,
  lucideLock,
  lucidePlay,
  lucideX,
} from '@ng-icons/lucide';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  query,
  stagger,
} from '@angular/animations';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      lucideRocket, lucideTrendingUp, lucideUsers, lucideGraduationCap,
      lucideMap, lucideZap,
      lucideHandshake, lucideCalendar, lucideShield,
      lucideArrowRight, lucideCheck, lucideStar, lucideGlobe,
      lucideSparkles, lucideMapPin, lucideClock3, lucideChevronRight,
      lucideMail, lucidePhone, lucideLock, lucidePlay, lucideX,
    }),
  ],
  templateUrl: './landing.component.html',
  styleUrl:    './landing.component.css',
  animations: [
    trigger('heroEntry', [
      transition(':enter', [
        query('.hero-animate', [
          style({ opacity: 0, transform: 'translateY(36px)' }),
          stagger('120ms', [
            animate('700ms cubic-bezier(0.25,0.46,0.45,0.94)',
              style({ opacity: 1, transform: 'translateY(0)' })),
          ]),
        ], { optional: true }),
      ]),
    ]),
    trigger('featureCards', [
      state('hidden',  style({})),
      state('visible', style({})),
      transition('hidden => visible', [
        query('.rc', [
          style({ opacity: 0, transform: 'translateY(28px)' }),
          stagger('70ms', [
            animate('480ms cubic-bezier(0.25,0.46,0.45,0.94)',
              style({ opacity: 1, transform: 'translateY(0)' })),
          ]),
        ], { optional: true }),
      ]),
    ]),
    trigger('testimonialCards', [
      state('hidden',  style({})),
      state('visible', style({})),
      transition('hidden => visible', [
        query('.tc', [
          style({ opacity: 0, transform: 'translateY(28px)' }),
          stagger('70ms', [
            animate('480ms cubic-bezier(0.25,0.46,0.45,0.94)',
              style({ opacity: 1, transform: 'translateY(0)' })),
          ]),
        ], { optional: true }),
      ]),
    ]),
    trigger('revealLeft', [
      state('hidden',  style({ opacity: 0, transform: 'translateX(-48px)' })),
      state('visible', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('hidden => visible',
        animate('700ms cubic-bezier(0.25,0.46,0.45,0.94)')),
    ]),
    trigger('revealRight', [
      state('hidden',  style({ opacity: 0, transform: 'translateX(48px)' })),
      state('visible', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('hidden => visible',
        animate('700ms cubic-bezier(0.25,0.46,0.45,0.94)')),
    ]),
    trigger('reveal', [
      state('hidden',  style({ opacity: 0, transform: 'translateY(32px)' })),
      state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('hidden => visible',
        animate('650ms cubic-bezier(0.25,0.46,0.45,0.94)')),
    ]),
  ],
})
export class LandingComponent implements OnInit {
  private readonly cdr          = inject(ChangeDetectorRef);
  private readonly authService  = inject(AuthService);

  protected readonly isLoggedIn     = computed(() => this.authService.isLoggedIn());
  protected readonly showVideoModal = signal(false);

  protected readonly featuresState     = signal<'hidden' | 'visible'>('hidden');
  protected readonly testimonialsState = signal<'hidden' | 'visible'>('hidden');
  protected readonly statsState        = signal<'hidden' | 'visible'>('hidden');
  protected readonly aboutLeftState    = signal<'hidden' | 'visible'>('hidden');
  protected readonly aboutRightState   = signal<'hidden' | 'visible'>('hidden');
  protected readonly ctaState          = signal<'hidden' | 'visible'>('hidden');
  protected readonly contactState      = signal<'hidden' | 'visible'>('hidden');

  protected readonly particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.round(Math.random() * 4 + 2),
    x: Math.round(Math.random() * 100),
    startY: Math.round(Math.random() * 30),
    dur: Math.round(Math.random() * 20 + 14),
    delay: -Math.round(Math.random() * 28),
  }));

  protected readonly stats = [
    { value: 500,  suffix: '+', label: 'Discussions Started' },
    { value: 1200, suffix: '+', label: 'Members Connected' },
    { value: 200,  suffix: '+', label: 'Opportunities Shared' },
    { value: 30,   suffix: '+', label: 'Ecosystem Partners' },
  ];

  protected readonly features = [
    {
      icon:  'lucideUsers',
      title: 'Community Forum',
      desc:  'Connect with other users, ask questions, and share knowledge across diverse topics.',
    },
    {
      icon:  'lucideHandshake',
      title: 'Professional Networking',
      desc:  'Discover peer members, send connection requests, and build your professional network.',
    },
    {
      icon:  'lucideZap',
      title: 'Reputation System',
      desc:  'Earn reputation points and display your contribution badges as you engage with the community.',
    },
  ];

  protected readonly trustedBrands = [
    'ESPRIT', 'Flat6Labs', 'AfricArena', 'Wamda',
  ];

  protected readonly galleryRow1 = [
    'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=260&fit=crop&q=80',
    'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=260&fit=crop&q=80',
    'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400&h=260&fit=crop&q=80',
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&h=260&fit=crop&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=260&fit=crop&q=80',
  ];

  protected readonly galleryRow2 = [
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=260&fit=crop&q=80',
    'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=400&h=260&fit=crop&q=80',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=260&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=260&fit=crop&q=80',
    'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?w=400&h=260&fit=crop&q=80',
  ];

  protected readonly testimonials = [
    {
      text: 'FoundersLab community helped me connect with potential team members and grow my professional circle in Tunisia. The platform is simple and intuitive.',
      name: 'Amel Trabelsi', role: 'Software Engineer',
      img:  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=520&fit=crop&q=80',
    },
    {
      text: 'The reputation points motivate me to write quality posts on the forum and answer other developers\' questions. Truly an engaging platform.',
      name: 'Karim Mansour', role: 'Fullstack Developer',
      img:  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=520&fit=crop&q=80',
    },
    {
      text: 'Messaging is instant, allowing me to coordinate easily with other community members. Highly recommend joining if you are starting your journey.',
      name: 'Lina Benali', role: 'Community Manager',
      img:  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=520&fit=crop&q=80',
    },
  ];

  protected readonly howSteps = [
    { num: '01', title: 'Create Your Profile',    desc: 'Join FoundersLab and set up your profile showcasing your skills and interests.' },
    { num: '02', title: 'Join Discussions',       desc: 'Participate in the community forum, share knowledge, and earn reputation.' },
    { num: '03', title: 'Grow Your Network',      desc: 'Send connection requests and discover members with similar interests.' },
    { num: '04', title: 'Find Opportunities',     desc: 'Check out community job/project openings or post your own offers.' },
  ];

  protected readonly contactInfo = [
    { icon: 'lucideGlobe',    label: 'Location',     value: 'Tunis, Tunisia — serving founders worldwide' },
    { icon: 'lucideMail',     label: 'Email',        value: 'hello@founderslab.io' },
    { icon: 'lucideCalendar', label: 'Office hours', value: 'Mon–Fri, 9:00 AM – 6:00 PM CET' },
    { icon: 'lucideHandshake', label: 'Partnerships', value: 'partners@founderslab.io' },
  ];

  constructor() {
    afterNextRender(() => {
      this.initIntersectionObservers();
      this.initCountUp();
    });
  }

  ngOnInit(): void {}

  private initIntersectionObservers(): void {
    const sections: Array<{ selector: string; setter: () => void }> = [
      { selector: '.features-section',      setter: () => this.featuresState.set('visible') },
      { selector: '.testimonials-section',  setter: () => this.testimonialsState.set('visible') },
      { selector: '.stats-section',         setter: () => this.statsState.set('visible') },
      { selector: '.how-section',           setter: () => this.aboutLeftState.set('visible') },
      { selector: '.cta-banner',            setter: () => this.ctaState.set('visible') },
      { selector: '.contact-section',       setter: () => this.contactState.set('visible') },
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const match = sections.find((s) => entry.target.matches(s.selector));
          if (match) {
            match.setter();
            observer.unobserve(entry.target);
            this.cdr.markForCheck();
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    );

    sections.forEach(({ selector }) => {
      document.querySelectorAll(selector).forEach((el) => observer.observe(el));
    });
  }

  private initCountUp(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el     = entry.target as HTMLElement;
          const target = parseInt(el.dataset['count'] ?? '0', 10);
          let cur      = 0;
          const inc    = Math.ceil(target / 60);
          const tick   = () => {
            cur = Math.min(cur + inc, target);
            el.textContent = cur.toLocaleString();
            if (cur < target) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          observer.unobserve(el);
        });
      },
      { threshold: 0.6 },
    );
    document.querySelectorAll<HTMLElement>('[data-count]').forEach((c) => observer.observe(c));
  }
}