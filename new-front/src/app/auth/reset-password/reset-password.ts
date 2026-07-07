import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
})
export class ResetPasswordComponent implements OnInit {
  // Which mode we're in
  mode: 'forgot' | 'reset' = 'forgot';

  // Forgot-password form (enter email)
  forgotForm: FormGroup;

  // Reset-password form (enter new password)
  resetForm: FormGroup;

  isLoading = false;
  successMessage = '';
  errorMessage = '';
  token = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    this.mode = this.token ? 'reset' : 'forgot';
  }

  passwordMatchValidator(form: FormGroup) {
    const p = form.get('newPassword')?.value;
    const c = form.get('confirmPassword')?.value;
    return p === c ? null : { passwordMismatch: true };
  }

  get email() { return this.forgotForm.get('email'); }
  get newPassword() { return this.resetForm.get('newPassword'); }
  get confirmPassword() { return this.resetForm.get('confirmPassword'); }

  // Step 1 — user enters their email to receive a reset link
  async onForgotSubmit(): Promise<void> {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    try {
      await firstValueFrom(
        this.http.post(
          'http://localhost:8091/api/auth/forgot-password',
          { email: this.forgotForm.value.email },
          { responseType: 'text' }
        )
      );
      this.successMessage = 'A reset link has been sent to your email. Check your inbox.';
    } catch (error: any) {
      this.errorMessage = error.error || 'No account found with that email address.';
    } finally {
      this.isLoading = false;
    }
  }

  // Step 2 — user clicks the link in the email and enters a new password
  async onResetSubmit(): Promise<void> {
    if (this.resetForm.invalid || !this.token) return;

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    try {
      await firstValueFrom(
        this.http.post(
          'http://localhost:8091/api/auth/reset-password',
          { token: this.token, newPassword: this.resetForm.value.newPassword },
          { responseType: 'text' }
        )
      );
      this.successMessage = 'Password reset successfully!';
      setTimeout(() => this.router.navigate(['/auth/login']), 2500);
    } catch (error: any) {
      this.errorMessage = error.error || 'Invalid or expired link. Please request a new one.';
    } finally {
      this.isLoading = false;
    }
  }
}
