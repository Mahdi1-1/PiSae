import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideBell, lucideCalendar, lucideChevronDown, lucideGraduationCap,
  lucideHandshake, lucideLayoutDashboard, lucideMap, lucideRocket,
  lucideScale, lucideSearch, lucideSettings, lucideTrendingUp,
  lucideUsers, lucideLogOut, lucideUser, lucideX, lucideMail,
  lucideBriefcase, lucideShield, lucideGlobe, lucideCheck,
  lucideAlertCircle, lucideEdit, lucideMoon, lucideSun, lucideStar,
  lucideMonitor, lucideMenu, lucideCamera, lucideKey, lucideTrash2,
  lucideChevronRight, lucideLanguages, lucideCreditCard, lucideMessageSquare,
  lucideClipboardList, lucideBuilding, lucideFileText, lucideVideo,
} from '@ng-icons/lucide';
import { filter } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { ThemeService } from '../services/theme.service';
import { AuthService } from '../core/services/auth.service';
import { UserService } from '../core/services/user.service';
import { User } from '../core/models/user.model';
import { CommunityNotificationService } from '../modules/community/shared/services/notification.service';
import { CommunityNotification, NotificationType } from '../modules/community/shared/models/notification.model';

interface NavItem { icon: string; label: string; route: string; roles?: string[]; }
interface Notification { id: number; title: string; body: string; time: string; read: boolean; type: 'alert' | 'info' | 'success'; }

@Component({
  selector: 'app-layout',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      lucideBell, lucideCalendar, lucideChevronDown, lucideGraduationCap,
      lucideHandshake, lucideLayoutDashboard, lucideMap, lucideRocket,
      lucideScale, lucideSearch, lucideSettings, lucideTrendingUp,
      lucideUsers, lucideLogOut, lucideUser, lucideX, lucideMail,
      lucideBriefcase, lucideShield, lucideGlobe, lucideCheck,
      lucideAlertCircle, lucideEdit, lucideMoon, lucideSun, lucideStar,
      lucideMonitor, lucideMenu, lucideCamera, lucideKey, lucideTrash2,
      lucideChevronRight, lucideLanguages, lucideCreditCard, lucideMessageSquare,
      lucideClipboardList, lucideBuilding, lucideFileText, lucideVideo,
    }),
  ],
  template: `
    <div class="flex min-h-screen overflow-hidden" style="background:var(--background);">
      @if (mobileNavOpen()) {
        <button
          type="button"
          class="mobile-nav-backdrop"
          (click)="closeMobileNav()"
          aria-label="Close navigation menu"
        ></button>
      }

      <!-- â•â• SIDEBAR (width driven by sidebarExpanded signal) â•â• -->
      <aside
        class="sidebar-nav fixed inset-y-0 left-0 z-50 flex flex-col"
        [class.mobile-open]="mobileNavOpen()"
        [style.width]="sidebarExpanded() ? '220px' : '60px'"
        [style.box-shadow]="sidebarExpanded() ? '4px 0 28px rgba(0,0,0,0.32)' : 'none'"
        style="background:#1F2937; border-right:1px solid rgba(255,255,255,0.07);"
        aria-label="Main navigation"
        (mouseenter)="sidebarExpanded.set(true)"
        (mouseleave)="sidebarExpanded.set(false)"
      >
        <!-- Logo row -->
        <div class="flex items-center flex-shrink-0"
          style="height:56px; padding:0 12px; border-bottom:1px solid rgba(255,255,255,0.07); min-width:0;">
          <div class="nav-icon-wrapper flex items-center justify-center" style="width:36px; height:36px; flex-shrink:0;">
            <img src="white.png" alt="FoundersLab" style="width:24px; height:24px; object-fit:contain;" />
          </div>
          <span class="sidebar-label ml-2.5 font-bold text-white"
            [style.opacity]="sidebarExpanded() ? 1 : 0"
            [style.transition-delay]="sidebarExpanded() ? '0.1s' : '0s'"
            style="font-size:14px; letter-spacing:-0.02em;">
            FoundersLab
          </span>
          <button
            type="button"
            (click)="closeMobileNav()"
            class="ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-white lg:hidden"
            style="background:rgba(255,255,255,0.08); border:none; cursor:pointer;"
            aria-label="Close navigation"
          >
            <ng-icon name="lucideX" [size]="'16'" />
          </button>
        </div>

        <!-- Nav items -->
        <nav class="flex flex-col gap-0.5 py-3 flex-1" style="padding-inline:10px; overflow:hidden;">
          @for (item of filteredNavItems(); track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="active-nav"
              (click)="closeMobileNav()"
              class="nav-item relative flex items-center rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              style="height:40px; padding:0 2px; color:var(--text-secondary); text-decoration:none;"
              [attr.aria-label]="item.label"
            >
              <div class="nav-icon-wrapper flex items-center justify-center" style="width:36px; height:36px; flex-shrink:0;">
                <ng-icon [name]="item.icon" [size]="'17'" />
              </div>
              <span class="sidebar-label ml-2.5 text-sm font-medium"
                [style.opacity]="sidebarExpanded() ? 1 : 0"
                [style.transition-delay]="sidebarExpanded() ? '0.1s' : '0s'"
                style="color:#D1D5DB;">
                {{ item.label }}
              </span>
            </a>
          }
        </nav>

        <!-- Bottom: Settings + Profile -->
        <div class="flex flex-col gap-1" style="border-top:1px solid rgba(255,255,255,0.07); padding:12px 10px 14px;">
          <!-- Settings -->
          <button
            (click)="showSettings.set(true); closeMobileNav()"
            class="nav-item relative flex items-center rounded-lg transition-colors duration-150 w-full"
            style="height:40px; padding:0 2px; color:var(--text-secondary); background:transparent; border:none; cursor:pointer;"
            aria-label="Open settings"
          >
            <div class="nav-icon-wrapper flex items-center justify-center" style="width:36px; height:36px; flex-shrink:0;">
              <ng-icon name="lucideSettings" [size]="'17'" />
            </div>
            <span class="sidebar-label ml-2.5 text-sm font-medium"
              [style.opacity]="sidebarExpanded() ? 1 : 0"
              [style.transition-delay]="sidebarExpanded() ? '0.1s' : '0s'"
              style="color:#D1D5DB;">
              Settings
            </span>
          </button>

          <!-- Profile -->
          <button
            (click)="showProfile.set(true); closeMobileNav()"
            class="relative flex items-center rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 w-full"
            style="height:44px; padding:0 2px; background:transparent; border:none; cursor:pointer; margin-top:4px;"
            aria-label="Open profile"
          >
            <div class="flex items-center justify-center rounded-full"
              style="width:36px; height:36px; flex-shrink:0; background:linear-gradient(135deg,#1C4FC3,#1D1384); color:#fff; font-size:12px; font-weight:700;">
              {{ userInitials() }}
            </div>
            <div class="sidebar-label ml-2.5 text-left"
              [style.opacity]="sidebarExpanded() ? 1 : 0"
              [style.transition-delay]="sidebarExpanded() ? '0.1s' : '0s'">
              <p style="font-size:12px; font-weight:600; color:#fff; line-height:1.3;">{{ userDisplayName() }}</p>
              <p style="font-size:11px; color:var(--sidebar-muted);">{{ userRoleLabel() }}</p>
            </div>
          </button>
        </div>
      </aside>

      <!-- â•â• MAIN AREA (offset by sidebar width) â•â• -->
      <div class="main-shell flex flex-col flex-1 overflow-hidden" style="margin-left:60px;">

        <!-- TOPBAR -->
        <header
          class="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-6 sm:py-0 flex-shrink-0"
          style="min-height:56px; background:var(--surface); border-bottom:1px solid var(--border); position:relative; z-index:20;"
          role="banner"
        >
          <button
            type="button"
            (click)="openMobileNav()"
            class="flex h-10 w-10 items-center justify-center rounded-lg lg:hidden"
            style="background:var(--surface-subtle); border:1px solid var(--border); color:var(--text-primary); cursor:pointer;"
            aria-label="Open navigation"
          >
            <ng-icon name="lucideMenu" [size]="'18'" />
          </button>

          <div class="min-w-0 flex-1">
            <h1 class="text-sm font-semibold" style="color:var(--text-primary); letter-spacing:-0.01em;">
              {{ currentPageTitle() }}
            </h1>
          </div>

          <!-- Search -->
          <div class="relative hidden lg:block">
            <ng-icon name="lucideSearch" [size]="'14'"
              style="position:absolute; left:10px; top:50%; transform:translateY(-50%); color:var(--text-muted);" />
            <input type="search" placeholder="Search..." aria-label="Search"
              class="focus:outline-none"
              style="padding:6px 12px 6px 32px; background:var(--surface-input); border:1.5px solid var(--border); border-radius:8px; width:200px; font-family:var(--font-sans); font-size:13px; color:var(--text-body);" />
          </div>

          <div class="ml-auto flex items-center gap-2 sm:gap-3">
            <!-- Notifications bell -->
            <div class="relative">
              <button
                (click)="showNotifications.set(!showNotifications())"
                class="relative flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                style="width:36px; height:36px; color:var(--text-secondary); background:transparent; border:none; cursor:pointer;"
                aria-label="Notifications"
                [attr.aria-expanded]="showNotifications()"
              >
                <ng-icon name="lucideBell" [size]="'18'" />
                @if (unreadCount() > 0) {
                  <span aria-hidden="true" class="absolute rounded-full flex items-center justify-center"
                    style="top:5px; right:5px; width:16px; height:16px; background:var(--badge-notification-bg); color:var(--badge-notification-text); font-size:9px; font-weight:700;">
                    {{ unreadCount() }}
                  </span>
                }
              </button>
            </div>

            <!-- User info (topbar) -->
            <button
              (click)="showProfile.set(true)"
              class="flex items-center gap-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
              style="padding:4px 8px; background:transparent; border:none;"
              aria-label="Open profile"
            >
              <div class="flex items-center justify-center rounded-full flex-shrink-0"
                style="width:32px; height:32px; background:linear-gradient(135deg,#1C4FC3,#1D1384); color:#fff; font-size:11px; font-weight:700;">
                {{ userInitials() }}
              </div>
              <div class="hidden md:block text-left">
                <p class="text-xs font-semibold leading-none" style="color:var(--text-primary);">{{ userDisplayName() }}</p>
                <p class="text-xs leading-none mt-0.5" style="color:var(--text-muted);">{{ userRoleLabel() }}</p>
              </div>
              <ng-icon name="lucideChevronDown" [size]="'13'" style="color:var(--text-muted);" />
            </button>
          </div>
        </header>

        <!-- PAGE CONTENT -->
        <main class="app-main-content flex-1 overflow-auto p-4 sm:p-5 lg:p-6" id="main-content">
          <router-outlet />
        </main>
      </div>

      <!-- Real-time Notifications Toast -->
      <app-toast />


      <!-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• -->
      <!-- NOTIFICATIONS DROPDOWN               -->
      <!-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• -->
      @if (showNotifications()) {
        <div class="fixed inset-0 z-40" (click)="showNotifications.set(false)" aria-hidden="true"></div>
        <div
          class="fixed z-50 rounded-2xl overflow-hidden"
          style="top:64px; right:12px; width:min(340px, calc(100vw - 24px)); background:var(--surface); box-shadow:0 8px 40px rgba(11,15,42,0.18); border:1px solid var(--border);"
          role="dialog" aria-label="Notifications"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4" style="border-bottom:1px solid var(--border-subtle);">
            <div>
              <h3 class="text-sm font-bold" style="color:var(--text-primary);">Notifications</h3>
              <p class="text-xs" style="color:var(--text-muted);">{{ unreadCount() }} unread</p>
            </div>
            <div class="flex items-center gap-2">
              <button (click)="markAllRead()" class="text-xs font-semibold" style="color:#1C4FC3; background:transparent; border:none; cursor:pointer;">
                Mark all read
              </button>
              <button (click)="showNotifications.set(false)"
                class="flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                style="width:28px; height:28px; background:transparent; border:none; cursor:pointer; color:var(--text-muted);"
                aria-label="Close notifications">
                <ng-icon name="lucideX" [size]="'14'" />
              </button>
            </div>
          </div>

          <!-- Notification list -->
          <div style="max-height:360px; overflow-y:auto;">
            @if (notifications().length === 0) {
              <div class="px-5 py-8 text-center">
                <ng-icon name="lucideBell" class="text-3xl text-gray-200 mb-2"></ng-icon>
                <p class="text-xs text-gray-400">Aucune notification</p>
              </div>
            }
            @for (n of notifications(); track n.id) {
              <div class="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                style="border-bottom:1px solid var(--border-subtle);"
                [style.background]="n.read ? 'var(--surface)' : 'var(--surface-accent)'"
                (click)="markRead(n)"
              >
                <div class="flex items-center justify-center rounded-full flex-shrink-0 mt-0.5"
                  style="width:32px; height:32px;"
                  [style.background]="getNotifColor(n.type)">
                  <ng-icon [name]="getNotifIcon(n.type)" [size]="'14'" [style.color]="getNotifTextColor(n.type)" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold" style="color:var(--text-primary);">{{ getNotifTitle(n.type) }}</p>
                  <p class="text-xs mt-0.5 leading-snug" style="color:var(--text-secondary);">{{ n.message }}</p>
                  <p class="text-xs mt-1" style="color:var(--text-muted);">{{ n.createdAt | date:'HH:mm, dd MMM' }}</p>
                </div>
                @if (!n.read) {
                  <div class="flex-shrink-0 rounded-full mt-1.5" style="width:7px; height:7px; background:#1C4FC3;"></div>
                }
              </div>
            }
          </div>

          <!-- Footer -->
          <div class="px-5 py-3 text-center" style="border-top:1px solid var(--border-subtle);">
            <button class="text-xs font-semibold" style="color:#1C4FC3; background:transparent; border:none; cursor:pointer;">
              View all notifications
            </button>
          </div>
        </div>
      }


      <!-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• -->
      <!-- PROFILE MODAL                        -->
      <!-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• -->
      @if (showProfile()) {
        <div class="fixed inset-0 z-[200] flex items-center justify-center" role="dialog" aria-modal="true" aria-label="User profile">
          <div class="modal-backdrop" (click)="showProfile.set(false)"></div>
          <div class="relative z-10 rounded-2xl overflow-hidden" style="background:var(--surface); width:min(380px, calc(100vw - 24px)); box-shadow:0 24px 64px rgba(0,0,0,0.28);">

            <!-- Profile header gradient -->
            <div class="relative" style="background:linear-gradient(135deg,#1F2937 0%,#1D1384 60%,#1D1384 100%); padding:32px 24px 24px; text-align:center;">
              <button
                (click)="showProfile.set(false)"
                class="absolute flex items-center justify-center rounded-lg transition-colors hover:bg-white dark:bg-gray-900/10"
                style="top:16px; right:16px; width:32px; height:32px; background:transparent; border:none; cursor:pointer; color:#93C5FD;"
                aria-label="Close profile"
              >
                <ng-icon name="lucideX" [size]="'16'" />
              </button>
              <div class="flex items-center justify-center rounded-full mx-auto mb-3"
                style="width:72px; height:72px; background:linear-gradient(135deg,#1C4FC3,#1D1384); color:#fff; font-size:22px; font-weight:800; border:3px solid rgba(255,255,255,0.15);">
                {{ userInitials() }}
              </div>
              <h2 style="color:#fff; font-size:18px; font-weight:700; letter-spacing:-0.02em; margin:0 0 4px;">{{ userDisplayName() }}</h2>
              <p style="color:rgb(229 231 235); font-size:13px; margin:0;">{{ userRoleLabel() }} Â· FoundersLab</p>
              <span class="inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full text-xs font-semibold"
                style="background:rgba(108,62,255,0.25); color:#93C5FD;">
                <ng-icon name="lucideStar" [size]="'11'" />
                {{ userRoleLabel() }}
              </span>
            </div>

            <!-- Profile body -->
            <div style="padding:20px 24px;">
              <div class="space-y-3">
                <div class="flex items-center gap-3 rounded-lg p-3" style="background:var(--surface-subtle);">
                  <ng-icon name="lucideMail" [size]="'15'" style="color:#1C4FC3; flex-shrink:0;" />
                  <div>
                    <p class="text-xs" style="color:var(--text-muted);">Email</p>
                    <p class="text-sm font-medium" style="color:var(--text-primary);">{{ authService.getEmail() || 'No email' }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3 rounded-lg p-3" style="background:var(--surface-subtle);">
                  <ng-icon name="lucideBriefcase" [size]="'15'" style="color:#1C4FC3; flex-shrink:0;" />
                  <div>
                    <p class="text-xs" style="color:var(--text-muted);">Role</p>
                    <p class="text-sm font-medium" style="color:var(--text-primary);">{{ userRoleLabel() }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3 rounded-lg p-3" style="background:var(--surface-subtle);">
                  <ng-icon name="lucideGlobe" [size]="'15'" style="color:#1C4FC3; flex-shrink:0;" />
                  <div>
                    <p class="text-xs" style="color:var(--text-muted);">Member since</p>
                    <p class="text-sm font-medium" style="color:var(--text-primary);">FoundersLab Member</p>
                  </div>
                </div>
              </div>

              <div class="flex flex-col gap-3 mt-5 sm:flex-row">
                <button
                  (click)="showProfile.set(false); settingsTab.set('profile'); showSettings.set(true)"
                  class="flex items-center justify-center gap-1.5 rounded-xl flex-1 text-sm font-semibold cursor-pointer transition-opacity hover:opacity-90"
                  style="background:linear-gradient(135deg,#1C4FC3,#1D1384); color:#fff; border:none; padding:10px;">
                  <ng-icon name="lucideEdit" [size]="'14'" />
                  Edit Profile
                </button>
                <button
                  (click)="showProfile.set(false); openProfilePage()"
                  class="flex items-center justify-center gap-1.5 rounded-xl flex-1 text-sm font-semibold cursor-pointer transition-colors"
                  style="background:var(--surface-subtle); color:var(--text-primary); border:1px solid var(--border); padding:10px;">
                  <ng-icon name="lucideUser" [size]="'14'" />
                  Full Profile
                </button>
                <button
                  (click)="logout()"
                  class="flex items-center justify-center gap-1.5 rounded-xl text-sm font-semibold cursor-pointer transition-colors hover:bg-red-50 dark:hover:bg-gray-800"
                  style="background:#FEF2F2; color:var(--badge-red-text); border:none; padding:10px 16px;">
                  <ng-icon name="lucideLogOut" [size]="'14'" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      }


      <!-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• -->
      <!-- SETTINGS MODAL (sidebar layout)     -->
      <!-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• -->
      @if (showSettings()) {
        <div class="fixed inset-0 z-[200] flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Settings">
          <div class="modal-backdrop" (click)="showSettings.set(false)"></div>
          <div class="relative z-10 rounded-2xl overflow-hidden flex" style="background:var(--surface); width:min(740px, calc(100vw - 24px)); height:min(580px, calc(100vh - 48px)); box-shadow:0 24px 64px rgba(0,0,0,0.28);">

            <!-- Settings sidebar -->
            <div class="flex-shrink-0 flex flex-col" style="width:200px; background:var(--surface-subtle); border-right:1px solid var(--border-subtle);">
              <div style="padding:20px 16px 12px;">
                <h2 class="text-sm font-bold" style="color:var(--text-primary);">Settings</h2>
                <p class="text-xs mt-0.5" style="color:var(--text-muted);">Manage your account</p>
              </div>
              <nav class="flex-1 flex flex-col gap-0.5" style="padding:0 8px;">
                @for (tab of settingsTabs; track tab.id) {
                  <button
                    (click)="settingsTab.set(tab.id)"
                    class="flex items-center gap-2.5 w-full rounded-lg text-left cursor-pointer transition-colors"
                    style="padding:8px 10px; border:none; font-family:var(--font-sans);"
                    [style.background]="settingsTab() === tab.id ? 'var(--chip-active-bg)' : 'transparent'"
                    [style.color]="settingsTab() === tab.id ? '#1C4FC3' : 'var(--text-secondary)'"
                  >
                    <ng-icon [name]="tab.icon" [size]="'15'" />
                    <span class="text-xs font-medium">{{ tab.label }}</span>
                  </button>
                }
              </nav>
              <div style="padding:12px 16px; border-top:1px solid var(--border-subtle);">
                <button (click)="logout()"
                  class="flex items-center gap-2 w-full rounded-lg text-left cursor-pointer transition-colors hover:bg-red-50 dark:hover:bg-gray-800"
                  style="padding:8px 10px; border:none; background:transparent; color:var(--badge-red-text); font-family:var(--font-sans);">
                  <ng-icon name="lucideLogOut" [size]="'14'" />
                  <span class="text-xs font-medium">Sign out</span>
                </button>
              </div>
            </div>

            <!-- Settings content -->
            <div class="flex-1 flex flex-col overflow-hidden">
              <!-- Content header -->
              <div class="flex items-center justify-between flex-shrink-0" style="padding:20px 24px 16px;">
                <h3 class="text-base font-bold" style="color:var(--text-primary);">
                  {{ activeSettingsLabel() }}
                </h3>
                <button (click)="showSettings.set(false)"
                  class="flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                  style="width:32px; height:32px; background:transparent; border:none; cursor:pointer; color:var(--text-muted);"
                  aria-label="Close settings">
                  <ng-icon name="lucideX" [size]="'16'" />
                </button>
              </div>

              <!-- Scrollable content area -->
              <div class="flex-1 overflow-y-auto" style="padding:0 24px 24px;">

                <!-- â”€â”€â”€ PROFILE TAB â”€â”€â”€ -->
                @if (settingsTab() === 'profile') {
                  <div class="space-y-6">
                    <!-- Avatar upload -->
                    <div class="flex items-center gap-5">
                      <div class="relative">
                        <div class="flex items-center justify-center rounded-full"
                          style="width:80px; height:80px; background:linear-gradient(135deg,#1C4FC3,#1D1384); color:#fff; font-size:24px; font-weight:800;">
                          {{ profileInitials() }}
                        </div>
                        <button class="absolute flex items-center justify-center rounded-full"
                          style="bottom:-2px; right:-2px; width:28px; height:28px; background:var(--surface); border:2px solid var(--border); cursor:pointer; color:var(--text-secondary);"
                          aria-label="Upload photo">
                          <ng-icon name="lucideCamera" [size]="'13'" />
                        </button>
                      </div>
                      <div>
                        <p class="text-sm font-semibold" style="color:var(--text-primary);">Profile Photo</p>
                        <p class="text-xs mt-0.5" style="color:var(--text-muted);">JPG, PNG or SVG. Max 2MB.</p>
                        <div class="flex items-center gap-2 mt-2">
                          <button class="text-xs font-semibold rounded-lg cursor-pointer"
                            style="background:var(--surface-subtle); border:1px solid var(--border); color:var(--text-body); padding:5px 12px; font-family:var(--font-sans);">
                            Upload
                          </button>
                          <button class="text-xs font-semibold rounded-lg cursor-pointer"
                            style="background:transparent; border:none; color:var(--badge-red-text); padding:5px 8px; font-family:var(--font-sans);">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Profile form -->
                    <div class="space-y-4">
                      <div class="grid grid-cols-2 gap-4">
                        <div>
                          <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">First Name</label>
                          <input type="text" [value]="profileFirstName()" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" />
                        </div>
                        <div>
                          <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Last Name</label>
                          <input type="text" [value]="profileLastName()" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" />
                        </div>
                      </div>
                      <div>
                        <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Email</label>
                        <input type="email" [value]="profileEmail()" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" />
                      </div>
                      <div>
                        <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Role</label>
                        <input type="text" [value]="profileRoleLabel()" readonly class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" />
                      </div>
                      <div>
                        <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Bio</label>
                        <textarea rows="3" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans); resize:vertical;" placeholder="Tell us about yourself..."></textarea>
                      </div>
                      <div>
                        <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Phone</label>
                        <input type="tel" value="" placeholder="Add a phone number" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" />
                      </div>
                      <div>
                        <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Location</label>
                        <input type="text" value="" placeholder="Add a location" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" />
                      </div>
                    </div>

                    <div class="flex items-center justify-end gap-3" style="padding-top:8px; border-top:1px solid var(--border-subtle);">
                      <button class="text-sm font-semibold rounded-xl cursor-pointer" style="background:transparent; border:1.5px solid var(--border); color:var(--text-body); padding:8px 20px; font-family:var(--font-sans);">Cancel</button>
                      <button class="text-sm font-semibold rounded-xl cursor-pointer" style="background:linear-gradient(135deg,#1C4FC3,#1D1384); color:#fff; border:none; padding:8px 20px; font-family:var(--font-sans);">Save Profile</button>
                    </div>
                  </div>
                }

                <!-- â”€â”€â”€ APPEARANCE TAB â”€â”€â”€ -->
                @if (settingsTab() === 'appearance') {
                  <div class="space-y-6">
                    <!-- Theme picker -->
                    <div>
                      <p class="text-xs font-semibold mb-3" style="color:var(--text-secondary);">Theme</p>
                      <div class="grid grid-cols-3 gap-3">
                        @for (theme of themes; track theme.label) {
                          <button
                            (click)="themeService.theme.set(theme.id)"
                            class="rounded-xl border-2 p-4 cursor-pointer text-center transition-all"
                            style="background:var(--surface-subtle); font-family:var(--font-sans);"
                            [style.border-color]="themeService.theme() === theme.id ? '#1C4FC3' : 'var(--border)'"
                          >
                            <ng-icon [name]="theme.icon" [size]="'20'" style="display:block; margin:0 auto 6px;"
                              [style.color]="themeService.theme() === theme.id ? '#1C4FC3' : 'var(--text-muted)'" />
                            <p class="text-xs font-medium" [style.color]="themeService.theme() === theme.id ? '#1C4FC3' : 'var(--text-body)'">
                              {{ theme.label }}
                            </p>
                          </button>
                        }
                      </div>
                    </div>

                    <!-- Language -->
                    <div>
                      <p class="text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Language</p>
                      <select class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);">
                        <option selected>English</option>
                        <option>French</option>
                        <option>Arabic</option>
                      </select>
                    </div>

                    <!-- Compact mode -->
                    <div class="flex items-center justify-between rounded-xl p-3.5" style="background:var(--surface-subtle);">
                      <div>
                        <p class="text-sm font-medium" style="color:var(--text-primary);">Compact mode</p>
                        <p class="text-xs" style="color:var(--text-muted);">Reduce spacing and font sizes</p>
                      </div>
                      <button (click)="compactMode = !compactMode"
                        class="toggle-switch" role="switch"
                        [attr.aria-checked]="compactMode" aria-label="Compact mode">
                        <span class="toggle-knob"></span>
                      </button>
                    </div>
                  </div>
                }

                <!-- â”€â”€â”€ NOTIFICATIONS TAB â”€â”€â”€ -->
                @if (settingsTab() === 'notifications') {
                  <div class="space-y-2">
                    @for (pref of notifPrefs; track pref.label) {
                      <div class="flex items-center justify-between rounded-xl p-3.5" style="background:var(--surface-subtle);">
                        <div>
                          <p class="text-sm font-medium" style="color:var(--text-primary);">{{ pref.label }}</p>
                          <p class="text-xs" style="color:var(--text-muted);">{{ pref.desc }}</p>
                        </div>
                        <button (click)="pref.enabled = !pref.enabled"
                          class="toggle-switch" role="switch"
                          [attr.aria-checked]="pref.enabled" [attr.aria-label]="pref.label">
                          <span class="toggle-knob"></span>
                        </button>
                      </div>
                    }

                    <!-- Email digest -->
                    <div style="margin-top:16px;">
                      <p class="text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Email Digest</p>
                      <select class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);">
                        <option>Daily</option>
                        <option selected>Weekly</option>
                        <option>Never</option>
                      </select>
                    </div>
                  </div>
                }

                <!-- â”€â”€â”€ SECURITY TAB â”€â”€â”€ -->
                @if (settingsTab() === 'security') {
                  <div class="space-y-4">
                    <!-- Change password -->
                    <div class="rounded-xl p-4" style="background:var(--surface-subtle);">
                      <div class="flex items-center gap-2 mb-3">
                        <ng-icon name="lucideKey" [size]="'15'" style="color:#1C4FC3;" />
                        <h4 class="text-sm font-semibold" style="color:var(--text-primary);">Change Password</h4>
                      </div>
                      <div class="space-y-3">
                        <div>
                          <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Current Password</label>
                          <input type="password" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" placeholder="Enter current password" />
                        </div>
                        <div>
                          <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">New Password</label>
                          <input type="password" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" placeholder="Enter new password" />
                        </div>
                        <div>
                          <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Confirm Password</label>
                          <input type="password" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" placeholder="Confirm new password" />
                        </div>
                        <button class="text-xs font-semibold rounded-lg cursor-pointer" style="background:linear-gradient(135deg,#1C4FC3,#1D1384); color:#fff; border:none; padding:7px 16px; font-family:var(--font-sans);">Update Password</button>
                      </div>
                    </div>

                    <!-- Two-factor auth -->
                    <div class="flex items-center justify-between rounded-xl p-4" style="background:var(--surface-subtle);">
                      <div class="flex items-center gap-3">
                        <ng-icon name="lucideShield" [size]="'15'" style="color:#1C4FC3;" />
                        <div>
                          <p class="text-sm font-medium" style="color:var(--text-primary);">Two-Factor Authentication</p>
                          <p class="text-xs" style="color:var(--text-muted);">Add an extra layer of security</p>
                        </div>
                      </div>
                      <span class="text-xs font-semibold px-2 py-0.5 rounded" style="background:var(--badge-amber-bg); color:var(--badge-amber-text);">Recommended</span>
                    </div>

                    <!-- Sessions -->
                    <div class="rounded-xl p-4" style="background:var(--surface-subtle);">
                      <h4 class="text-sm font-semibold mb-3" style="color:var(--text-primary);">Active Sessions</h4>
                      <div class="space-y-2">
                        <div class="flex items-center justify-between">
                          <div>
                            <p class="text-xs font-medium" style="color:var(--text-primary);">MacBook Pro Â· Algiers</p>
                            <p class="text-xs" style="color:var(--text-muted);">Current session Â· Last active now</p>
                          </div>
                          <span class="text-xs font-medium px-1.5 py-0.5 rounded" style="background:var(--badge-green-bg); color:var(--badge-green-text);">Active</span>
                        </div>
                        <div class="flex items-center justify-between">
                          <div>
                            <p class="text-xs font-medium" style="color:var(--text-primary);">iPhone 15 Â· Algiers</p>
                            <p class="text-xs" style="color:var(--text-muted);">Last active 2 hours ago</p>
                          </div>
                          <button class="text-xs font-medium cursor-pointer" style="background:transparent; border:none; color:var(--badge-red-text); font-family:var(--font-sans);">Revoke</button>
                        </div>
                      </div>
                    </div>
                  </div>
                }

                <!-- â”€â”€â”€ BILLING TAB â”€â”€â”€ -->
                @if (settingsTab() === 'billing') {
                  <div class="space-y-4">
                    <!-- Current plan -->
                    <div class="rounded-xl p-5" style="background:linear-gradient(135deg,#1C4FC3,#1D1384);">
                      <div class="flex items-center justify-between mb-2">
                        <div>
                          <p class="text-sm font-bold" style="color:#fff;">Premium Plan</p>
                          <p class="text-xs" style="color:rgba(255,255,255,0.7);">$29/month Â· Renews Apr 15, 2026</p>
                        </div>
                        <span class="text-xs font-semibold px-2 py-0.5 rounded-full" style="background:rgba(255,255,255,0.2); color:#fff;">Active</span>
                      </div>
                      <p class="text-xs mb-3" style="color:rgba(255,255,255,0.65);">Unlimited projects, priority support, AI recommendations, and advanced analytics.</p>
                      <div class="flex items-center gap-2">
                        <button class="text-xs font-semibold rounded-lg cursor-pointer" style="background:#fff; color:#1C4FC3; border:none; padding:6px 14px; font-family:var(--font-sans);">Upgrade</button>
                        <button class="text-xs font-semibold rounded-lg cursor-pointer" style="background:rgba(255,255,255,0.15); color:#fff; border:none; padding:6px 14px; font-family:var(--font-sans);">Manage</button>
                      </div>
                    </div>

                    <!-- Payment method -->
                    <div class="rounded-xl p-4" style="background:var(--surface-subtle);">
                      <h4 class="text-sm font-semibold mb-3" style="color:var(--text-primary);">Payment Method</h4>
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                          <div class="flex items-center justify-center rounded-lg" style="width:40px; height:28px; background:var(--surface); border:1px solid var(--border);">
                            <ng-icon name="lucideCreditCard" [size]="'16'" style="color:var(--text-secondary);" />
                          </div>
                          <div>
                            <p class="text-xs font-medium" style="color:var(--text-primary);">Visa ending in 4242</p>
                            <p class="text-xs" style="color:var(--text-muted);">Expires 12/2027</p>
                          </div>
                        </div>
                        <button class="text-xs font-semibold cursor-pointer" style="background:transparent; border:none; color:#1C4FC3; font-family:var(--font-sans);">Change</button>
                      </div>
                    </div>

                    <!-- Invoice history -->
                    <div class="rounded-xl p-4" style="background:var(--surface-subtle);">
                      <h4 class="text-sm font-semibold mb-3" style="color:var(--text-primary);">Recent Invoices</h4>
                      <div class="space-y-2">
                        @for (inv of invoiceHistory; track inv.date) {
                          <div class="flex items-center justify-between">
                            <div>
                              <p class="text-xs font-medium" style="color:var(--text-primary);">{{ inv.date }}</p>
                              <p class="text-xs" style="color:var(--text-muted);">{{ inv.plan }}</p>
                            </div>
                            <div class="flex items-center gap-3">
                              <span class="text-xs font-semibold" style="color:var(--text-primary);">{{ inv.amount }}</span>
                              <button class="text-xs font-medium cursor-pointer" style="background:transparent; border:none; color:#1C4FC3; font-family:var(--font-sans);">PDF</button>
                            </div>
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                }

                <!-- â”€â”€â”€ DANGER ZONE TAB â”€â”€â”€ -->
                @if (settingsTab() === 'danger') {
                  <div class="space-y-4">
                    <div class="rounded-xl p-4" style="background:var(--surface-subtle); border:1px solid var(--border);">
                      <h4 class="text-sm font-semibold mb-1" style="color:var(--text-primary);">Export Data</h4>
                      <p class="text-xs mb-3" style="color:var(--text-muted);">Download a copy of all your data including projects, contacts, and documents.</p>
                      <button class="text-xs font-semibold rounded-lg cursor-pointer" style="background:var(--surface); border:1px solid var(--border); color:var(--text-body); padding:6px 14px; font-family:var(--font-sans);">Request Export</button>
                    </div>
                    <div class="rounded-xl p-4" style="border:1px solid var(--badge-red-text);">
                      <div class="flex items-center gap-2 mb-1">
                        <ng-icon name="lucideTrash2" [size]="'14'" style="color:var(--badge-red-text);" />
                        <h4 class="text-sm font-semibold" style="color:var(--badge-red-text);">Delete Account</h4>
                      </div>
                      <p class="text-xs mb-3" style="color:var(--text-muted);">Permanently delete your account and all associated data. This action cannot be undone.</p>
                      <button class="text-xs font-semibold rounded-lg cursor-pointer" style="background:#FEF2F2; border:1px solid var(--badge-red-text); color:var(--badge-red-text); padding:6px 14px; font-family:var(--font-sans);">Delete My Account</button>
                    </div>
                  </div>
                }

              </div>
            </div>
          </div>
        </div>
      }

    </div>
  `,
})
export class LayoutComponent {
  private readonly router = inject(Router);
  protected readonly authService = inject(AuthService);
  protected readonly themeService = inject(ThemeService);
  private readonly notificationService = inject(CommunityNotificationService);
  private readonly userService = inject(UserService);

  protected readonly currentUser = signal<User | null>(null);

  protected readonly profileFirstName = computed(() => this.currentUser()?.prenom ?? '');
  protected readonly profileLastName = computed(() => this.currentUser()?.name ?? '');
  protected readonly profileEmail = computed(() => this.currentUser()?.email ?? this.authService.getEmail() ?? '');
  protected readonly profileRoleLabel = computed(() => {
    const role = this.currentUser()?.role ?? this.authService.getRole();
    if (!role) return 'Member';
    if (role === 'PARTENAIRE') return 'Partner';
    return role.charAt(0) + role.slice(1).toLowerCase();
  });
  protected readonly profileInitials = computed(() => {
    const f = this.profileFirstName();
    const l = this.profileLastName();
    const i = ((f[0] ?? '') + (l[0] ?? '')).toUpperCase();
    if (i) return i;
    const e = this.profileEmail();
    return e ? e.charAt(0).toUpperCase() : 'FL';
  });

  protected readonly sidebarExpanded = signal(false);
  protected readonly showProfile = signal(false);
  protected readonly showSettings = signal(false);
  protected readonly showNotifications = signal(false);
  protected readonly mobileNavOpen = signal(false);
  protected readonly settingsTab = signal<string>('profile');
  protected compactMode = false;

  protected readonly settingsTabs = [
    { id: 'profile', label: 'Profile', icon: 'lucideUser' },
    { id: 'appearance', label: 'Appearance', icon: 'lucideSun' },
    { id: 'notifications', label: 'Notifications', icon: 'lucideBell' },
    { id: 'security', label: 'Security', icon: 'lucideKey' },
    { id: 'billing', label: 'Billing', icon: 'lucideCreditCard' },
    { id: 'danger', label: 'Danger Zone', icon: 'lucideTrash2' },
  ];

  protected readonly invoiceHistory = [
    { date: 'Mar 1, 2026', amount: 'â‚¬29.00', status: 'Paid', plan: 'Premium Plan' },
    { date: 'Feb 1, 2026', amount: 'â‚¬29.00', status: 'Paid', plan: 'Premium Plan' },
    { date: 'Jan 1, 2026', amount: 'â‚¬29.00', status: 'Paid', plan: 'Premium Plan' },
  ];

  protected readonly activeSettingsLabel = computed(() =>
    this.settingsTabs.find(t => t.id === this.settingsTab())?.label ?? ''
  );

  protected readonly themes = [
    { id: 'light' as const, label: 'Light', icon: 'lucideSun' },
    { id: 'dark' as const, label: 'Dark', icon: 'lucideMoon' },
    { id: 'system' as const, label: 'System', icon: 'lucideMonitor' },
  ];

  protected readonly notifPrefs = [
    { label: 'New matches', desc: 'When an investor matches your startup', enabled: true },
    { label: 'Session reminders', desc: '1 hour before a mentoring session', enabled: true },
    { label: 'Event updates', desc: 'Changes to events you have registered for', enabled: false },
    { label: 'Community replies', desc: 'When someone replies to your discussion', enabled: true },
  ];

  protected readonly notifications = toSignal(this.notificationService.notifications$, { initialValue: [] as CommunityNotification[] });
  protected readonly unreadCount = toSignal(this.notificationService.unreadCount$, { initialValue: 0 });

  ngOnInit() {
    const userId = this.authService.getUserId()?.toString();
    if (userId) {
      this.notificationService.init(userId);
    }
    const idNum = this.authService.getUserId();
    if (idNum) {
      this.userService.getUserById(idNum)
        .then((u) => this.currentUser.set(u))
        .catch(() => { /* keep email-derived fallbacks */ });
    }
  }

  protected markRead(n: CommunityNotification): void {
    const userId = this.authService.getUserId()?.toString() || '';

    if (n.id && !n.read) {
      this.notificationService.markAsRead(n.id, userId).subscribe();
    }

    // Navigation logic from pisae
    switch (n.type) {
      case NotificationType.CONNECTION_REQUEST:
        this.router.navigate(['/app/community/network/pending']);
        break;
      case NotificationType.NEW_COMMENT:
      case NotificationType.NEW_POST:
        if (n.metadata?.['postId']) {
          this.router.navigate(['/app/community/forum', n.metadata['postId']]);
        }
        break;
      case NotificationType.APPLICATION_RECEIVED:
        if (n.metadata?.['opportunityId']) {
          this.router.navigate(['/app/community/marketplace/publisher-dashboard']);
        }
        break;
      case NotificationType.REPUTATION_GAINED:
        this.router.navigate(['/app/community/reputation']);
        break;
    }

    this.showNotifications.set(false);
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
      case NotificationType.CONNECTION_REQUEST: return 'var(--badge-purple-bg)';
      case NotificationType.CONNECTION_ACCEPTED: return 'var(--badge-green-bg)';
      case NotificationType.NEW_POST: return 'var(--badge-blue-bg)';
      case NotificationType.NEW_COMMENT: return 'var(--badge-indigo-bg)';
      case NotificationType.APPLICATION_RECEIVED: return 'var(--badge-amber-bg)';
      case NotificationType.REPUTATION_GAINED: return 'var(--badge-yellow-bg)';
      default: return 'var(--surface-accent)';
    }
  }

  protected getNotifTextColor(type: NotificationType): string {
    switch (type) {
      case NotificationType.CONNECTION_REQUEST: return 'var(--badge-purple-text)';
      case NotificationType.CONNECTION_ACCEPTED: return 'var(--badge-green-text)';
      case NotificationType.NEW_POST: return 'var(--badge-blue-text)';
      case NotificationType.NEW_COMMENT: return 'var(--badge-indigo-text)';
      case NotificationType.APPLICATION_RECEIVED: return 'var(--badge-amber-text)';
      case NotificationType.REPUTATION_GAINED: return 'var(--badge-yellow-text)';
      default: return 'var(--text-muted)';
    }
  }

  protected getNotifTitle(type: NotificationType): string {
    switch (type) {
      case NotificationType.CONNECTION_REQUEST: return 'Demande de connexion';
      case NotificationType.CONNECTION_ACCEPTED: return 'Connexion acceptÃ©e';
      case NotificationType.NEW_POST: return 'Nouveau post';
      case NotificationType.NEW_COMMENT: return 'Nouveau commentaire';
      case NotificationType.APPLICATION_RECEIVED: return 'Nouvelle candidature';
      case NotificationType.REPUTATION_GAINED: return 'Points gagnÃ©s';
      default: return 'Notification';
    }
  }

  protected openMobileNav(): void {
    this.mobileNavOpen.set(true);
  }

  protected closeMobileNav(): void {
    this.mobileNavOpen.set(false);
  }

  protected readonly navItems: NavItem[] = [
    { icon: 'lucideLayoutDashboard', label: 'Dashboard', route: '/app/dashboard' },
    { icon: 'lucideUsers', label: 'Users', route: '/app/users', roles: ['ADMIN'] },
  ];

  // Filter nav items based on user role
  protected readonly filteredNavItems = computed(() => {
    const userRole = this.authService.getRole();
    return this.navItems.filter(item => {
      if (!item.roles) return true; // No role restriction
      return item.roles.includes(userRole);
    });
  });

  private readonly url = toSignal(
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)),
    { initialValue: null },
  );

  protected readonly currentPageTitle = computed(() => {
    this.url();
    const cleanUrl = this.router.url.split('?')[0];
    return this.filteredNavItems().find((item) => cleanUrl.startsWith(item.route))?.label ?? 'FoundersLab';
  });

  protected readonly userDisplayName = computed(() => {
    const email = this.authService.getEmail();
    if (!email) {
      return 'FoundersLab Member';
    }

    return email.split('@')[0].replace(/[._-]+/g, ' ');
  });

  protected readonly userRoleLabel = computed(() => {
    const role = this.authService.getRole();
    if (!role) {
      return 'Member';
    }

    if (role === 'PARTENAIRE') {
      return 'Partner';
    }

    return role.charAt(0) + role.slice(1).toLowerCase();
  });

  protected readonly userInitials = computed(() => {
    const label = this.userDisplayName()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('');

    return label || 'FL';
  });

  protected openProfilePage(): void {
    this.closeMobileNav();
    this.router.navigate(['/app/profile']);
  }

  protected logout(): void {
    this.showProfile.set(false);
    this.showSettings.set(false);
    this.authService.logout();
  }
}
