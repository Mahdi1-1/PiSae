import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-oauth2-callback',
  standalone: true,
  imports: [CommonModule],
  template: '<p style="text-align:center;margin-top:3rem">Logging in...</p>'
})
export class Oauth2CallbackComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const needsPassword = params['needsPassword'] === 'true';

      console.log('🔐 OAuth2 Callback - token:', token);
      console.log('🔑 needsPassword:', needsPassword);

      if (token) {
        this.authService.saveToken(token);

        if (needsPassword) {
          // Google user with no password → go set password page
          console.log('→ Redirecting to set password page');
          this.router.navigate(['/auth/reset-password'], { queryParams: { isNewGoogle: true } });
        } else {
          // normal → go to dashboard
          console.log('→ Redirecting to dashboard');
          this.router.navigate(['/app/dashboard']);
        }
      } else {
        console.log('❌ No token found, redirecting to login');
        this.router.navigate(['/auth/login']);
      }
    });
  }
}