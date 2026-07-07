import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LandingLayoutComponent } from './landing-layout.component';
import { NgIconComponent } from '@ng-icons/core';
import { CommunityNotificationService } from '../../modules/community/shared/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { of } from 'rxjs';

describe('LandingLayoutComponent', () => {
  let component: LandingLayoutComponent;
  let fixture: ComponentFixture<LandingLayoutComponent>;

  beforeEach(async () => {
    // ThemeService (providedIn: 'root', instancié dès qu'un composant l'injecte
    // transitivement) appelle window.matchMedia dans son constructeur — jsdom (l'environnement
    // de test) ne l'implémente pas nativement, contrairement à un vrai navigateur.
    if (!window.matchMedia) {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: false,
          media: query,
          onchange: null,
          addEventListener: () => {},
          removeEventListener: () => {},
          addListener: () => {},
          removeListener: () => {},
          dispatchEvent: () => false,
        }),
      });
    }

    const mockNotificationService = {
      notifications$: of([]),
      unreadCount$: of(0),
      init: () => {},
      markAsRead: () => of(undefined),
      markAllAsRead: () => of(undefined)
    };

    const mockAuthService = {
      isLoggedIn: () => false,
      hasRole: () => false,
      getEmail: () => 'test@example.com',
      getRole: () => 'USER',
      getUserId: () => 123,
    };

    await TestBed.configureTestingModule({
      declarations: [LandingLayoutComponent],
      imports: [RouterTestingModule, BrowserAnimationsModule, NgIconComponent],
      providers: [
        { provide: CommunityNotificationService, useValue: mockNotificationService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LandingLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with pills in hidden state', () => {
    expect((component as any).pillState()).toBe('hidden');
  });

  it('should show badge after settling', async () => {
    await new Promise(resolve => setTimeout(resolve, 1100));
    expect((component as any).showBadge()).toBe(true);
  });
});
