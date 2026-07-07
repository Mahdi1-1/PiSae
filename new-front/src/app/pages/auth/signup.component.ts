import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideEye, lucideEyeOff } from '@ng-icons/lucide';
import {
  animate,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { AuthService } from '../../core/services/auth.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const fg = control as FormGroup;
  return fg.get('password')?.value === fg.get('confirmPassword')?.value
    ? null
    : { passwordMismatch: true };
}

@Component({
  selector: 'app-signup',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideEye, lucideEyeOff })],
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
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly showPassword = signal(false);
  protected readonly showConfirm = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal('');

  protected readonly form: FormGroup = this.fb.group(
    {
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator },
  );

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    try {
      const { fullName, email, password } = this.form.getRawValue();
      const trimmed = (fullName as string).trim();
      const spaceIdx = trimmed.indexOf(' ');
      const name = spaceIdx >= 0 ? trimmed.slice(0, spaceIdx) : trimmed;
      const prenom = spaceIdx >= 0 ? trimmed.slice(spaceIdx + 1) : '';

      await this.authService.register({ name, prenom, email, password });
      await this.router.navigateByUrl(this.authService.getPostAuthRedirectPath());
    } catch (error: unknown) {
      const err = error as { error?: { message?: string; error?: string } };
      this.errorMessage.set(
        err?.error?.message ?? err?.error?.error ?? 'Registration failed. Please try again.',
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
