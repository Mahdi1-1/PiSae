import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  form: FormGroup;
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
    this.form = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.errorMessage = 'Lien invalide ou expiré.';
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const p = form.get('newPassword')?.value;
    const c = form.get('confirmPassword')?.value;
    return p === c ? null : { passwordMismatch: true };
  }

  get newPassword() { return this.form.get('newPassword'); }
  get confirmPassword() { return this.form.get('confirmPassword'); }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || !this.token) return;

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    try {
      await firstValueFrom(
        this.http.post('http://localhost:8090/api/auth/reset-password',
          { token: this.token, newPassword: this.form.value.newPassword },
          { responseType: 'text' }
        )
      );
      this.successMessage = 'Mot de passe réinitialisé avec succès !';
      setTimeout(() => this.router.navigate(['/auth/login']), 2500);
    } catch (error: any) {
      this.errorMessage = error.error || 'Lien invalide ou expiré.';
    } finally {
      this.isLoading = false;
    }
  }
}