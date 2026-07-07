import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideEye, lucideEyeOff, lucideMail } from '@ng-icons/lucide';
import {
  animate,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideMail, lucideEye, lucideEyeOff })],
  animations: [
    trigger('formEnter', [
      transition('void => *', [
        style({ opacity: 0, transform: 'translateX(16px)' }),
        animate(
          '350ms cubic-bezier(0.16, 1, 0.3, 1)',
          style({ opacity: 1, transform: 'translateX(0)' }),
        ),
      ]),
    ]),
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly showPassword = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal('');

  protected readonly form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    try {
      await this.authService.login(this.form.getRawValue());
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      await this.router.navigateByUrl(returnUrl ?? this.authService.getPostAuthRedirectPath());
    } catch (error: unknown) {
      const err = error as { error?: { message?: string; error?: string } };
      this.errorMessage.set(
        err?.error?.message ?? err?.error?.error ?? 'Sign-in failed. Please try again.',
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }

  protected loginWithGoogle(): void {
    // Go directly to user-pi (port 8081) — OAuth2 requires browser redirects
    // with session cookies that the stateless API gateway cannot handle.
    const googleAuthUrl = 'http://localhost:8081/oauth2/authorization/google';
    window.location.href = googleAuthUrl;
  }
}
