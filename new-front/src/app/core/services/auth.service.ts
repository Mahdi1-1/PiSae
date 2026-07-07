import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, UserRole } from '../models/user.model';
import { USER_API_BASE } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${USER_API_BASE}/auth`;
  private readonly isBrowser: boolean;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async register(request: RegisterRequest): Promise<AuthResponse> {
    const response = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.apiUrl}/register`, request),
    );
    this.saveToken(response.token);
    return response;
  }

  async login(request: LoginRequest): Promise<AuthResponse> {
    const response = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.apiUrl}/login`, request),
    );
    this.saveToken(response.token);
    return response;
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('role');
      localStorage.removeItem('email');
    }

    this.router.navigate(['/auth/login']);
  }

  saveToken(token: string): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem('token', token);
    const payload = this.decodeToken(token);

    if (payload) {
      localStorage.setItem('userId', String(payload['userId'] ?? payload['id'] ?? 0));
      localStorage.setItem(
        'role',
        this.normalizeRole(payload['role'] || payload['authorities']?.[0] || ''),
      );
      localStorage.setItem('email', payload['sub'] || payload['email'] || '');
    }
  }

  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem('token') : null;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    const payload = this.decodeToken(token);
    if (!payload?.['exp']) {
      return false;
    }

    return Date.now() < payload['exp'] * 1000;
  }

  getRole(): UserRole | '' {
    return this.isBrowser ? ((localStorage.getItem('role') as UserRole | null) ?? '') : '';
  }

  getUserId(): number {
    return this.isBrowser ? Number(localStorage.getItem('userId') || 0) : 0;
  }

  getEmail(): string {
    return this.isBrowser ? localStorage.getItem('email') || '' : '';
  }

  hasRole(...roles: UserRole[]): boolean {
    const current = this.getRole();
    return !!current && roles.includes(current);
  }

  getPostAuthRedirectPath(): string {
    if (this.hasRole('ADMIN', 'MENTOR', 'PARTNER', 'PARTENAIRE')) {
      return '/app/dashboard';
    }

    return '/';
  }

  private normalizeRole(rawRole: string): UserRole | '' {
    const stripped = rawRole.startsWith('ROLE_') ? rawRole.slice(5) : rawRole;
    return (stripped as UserRole) || '';
  }

  private decodeToken(token: string): Record<string, any> | null {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  // ═══════════════════════════════════════════
  // Role helpers (needed by community module)
  // ═══════════════════════════════════════════

  isAdmin(): boolean { return this.getRole() === 'ADMIN'; }
  isUser(): boolean { return this.getRole() === 'USER'; }
  isMentor(): boolean { return this.getRole() === 'MENTOR'; }
  isInvestor(): boolean { return this.getRole() === 'INVESTOR'; }
  isInvestisseur(): boolean { return this.isInvestor(); }
  isPartner(): boolean { return this.getRole() === 'PARTNER' || this.getRole() === 'PARTENAIRE'; }
  isPartenaire(): boolean { return this.isPartner(); }
  isEntrepreneur(): boolean { return this.getRole() === 'ENTREPRENEUR'; }
  isExpert(): boolean { return this.getRole() === 'EXPERT'; }
  isEtudiant(): boolean { return this.getRole() === 'USER'; }
  hasLegalAccess(): boolean { return this.isEntrepreneur() || this.isExpert() || this.isAdmin(); }

  // Compat: PIcloud's saveUserData
  public saveUserData(response: AuthResponse): void {
    if (!this.isBrowser) return;
    this.saveToken(response.token);
  }
}
