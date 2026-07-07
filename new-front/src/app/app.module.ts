import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { NgIconComponent } from '@ng-icons/core';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmProgressImports } from '@spartan-ng/helm/progress';
import { App } from './app';
import { AppRoutingModule } from './app-routing.module';
import { SUIVI_PROVIDERS } from './core/providers/suivi.providers';
import { LayoutComponent } from './layout/layout.component';
import { AuthLayoutComponent } from './pages/auth/auth-layout.component';
import { LoginComponent } from './pages/auth/login.component';
import { SignupComponent } from './pages/auth/signup.component';
import { HomeComponent } from './pages/home/home.component';
import { LandingLayoutComponent } from './pages/landing/landing-layout.component';
import { LandingComponent } from './pages/landing/landing.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { MapComponent } from './shared/components/map/map.component'; // Add this import
import { ToastComponent } from './shared/components/toast/toast.component';
import { ShaderBackgroundComponent } from './shared/components/shader-background/shader-background.component';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    App,
    LayoutComponent,
    AuthLayoutComponent,
    LoginComponent,
    SignupComponent,
    HomeComponent,
    LandingLayoutComponent,
    LandingComponent,
    ProfileComponent,
    MapComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    RouterModule,
    NgIconComponent,
    ToastComponent,
    ShaderBackgroundComponent,
    ...HlmBadgeImports,
    ...HlmProgressImports,
  ],
  providers: [provideHttpClient(withInterceptors([jwtInterceptor])), ...SUIVI_PROVIDERS],
  bootstrap: [App],
})
export class AppModule {}