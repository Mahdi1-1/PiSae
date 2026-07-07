import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './pages/auth/auth-layout.component';
import { authGuard } from './core/services/auth.guard';
import { loginGuard } from './core/services/login.guard';
import { LandingLayoutComponent } from './pages/landing/landing-layout.component';
import { LayoutComponent } from './layout/layout.component';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/auth/login.component';
import { SignupComponent } from './pages/auth/signup.component';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { UsersListComponent } from './pages/users-list/users-list.component';
import { Oauth2CallbackComponent } from './auth/oauth2-callback/oauth2-callback';

export const routes: Routes = [
  {
    path: '',
    component: LandingLayoutComponent,
    children: [
      // Landing page: public, no authentication required
      { path: '', component: LandingComponent, pathMatch: 'full' },
      // Redirect deleted public routes
      { path: 'events', redirectTo: 'app/dashboard' },
      { path: 'projects', redirectTo: 'app/dashboard' },
      { path: 'community', loadChildren: () => import('./modules/community/community.module').then(m => m.CommunityModule), canActivate: [loginGuard] },
      { path: 'procedures', redirectTo: 'app/dashboard' },
      { path: 'investment', redirectTo: 'app/dashboard' },
      // Profile accessible to any authenticated user (including USER role)
      { path: 'profile', component: ProfileComponent, canActivate: [loginGuard] },
      { path: 'partenariat', redirectTo: 'app/dashboard' },
    ],
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: SignupComponent },
      { path: 'signup', component: SignupComponent }, // Keep both for compatibility
      { path: 'reset-password', loadComponent: () => import('./auth/reset-password/reset-password').then(m => m.ResetPasswordComponent) },
      { path: 'oauth2-callback', component: Oauth2CallbackComponent },
    ],
  },
  {
    path: 'app',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: HomeComponent },
      { path: 'projects', redirectTo: 'dashboard' },
      { path: 'community', loadChildren: () => import('./modules/community/community.module').then(m => m.CommunityModule) },
      { path: 'formations', loadChildren: () => import('./modules/suivi/suivi.module').then(m => m.SuiviModule) },
      { path: 'legal', redirectTo: 'dashboard' },
      { path: 'investments', redirectTo: 'dashboard' },
      { path: 'mentoring', redirectTo: 'dashboard' },
      { path: 'roadmaps', redirectTo: 'dashboard' },
      { path: 'partnerships', redirectTo: 'dashboard' },
      { path: 'events', redirectTo: 'dashboard' },
      { path: 'profile', component: ProfileComponent },
      { path: 'registrations', redirectTo: 'dashboard' },
      { path: 'users', component: UsersListComponent, canActivate: [authGuard], data: { role: 'ADMIN' } },
      { path: 'partenariat', redirectTo: 'dashboard' },
    ],
  },
  { path: 'verify/:token', redirectTo: 'app/dashboard' },
  { path: '**', redirectTo: '' },
];
