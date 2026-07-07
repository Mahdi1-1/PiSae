import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideMail, lucideBriefcase, lucideGlobe, lucideStar,
  lucideUser, lucideKey, lucideShield, lucideCalendar,
  lucideUsers, lucideX, lucideLogOut, lucideEdit,
} from '@ng-icons/lucide';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { Role, User } from '../../core/models/user.model';

type ProfileTab = 'account' | 'security' | 'team';

@Component({
  selector: 'app-profile-page',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      lucideMail, lucideBriefcase, lucideGlobe, lucideStar,
      lucideUser, lucideKey, lucideShield, lucideCalendar,
      lucideUsers, lucideX, lucideLogOut, lucideEdit,
    }),
  ],
  template: `
    <div class="fixed inset-0 z-[200] flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Profile">
      <div class="modal-backdrop" (click)="closeProfile()"></div>
      <div class="relative z-10 rounded-2xl overflow-hidden flex"
        style="background:var(--surface); width:min(800px,calc(100vw - 24px)); height:min(620px,calc(100vh - 48px)); box-shadow:0 24px 64px rgba(0,0,0,0.28);"
        (click)="$event.stopPropagation()">

        <!-- ═══ SIDEBAR ═══ -->
        <div class="flex flex-col" style="width:220px; flex-shrink:0; background:var(--surface-subtle); border-right:1px solid var(--border-subtle);">
          <div style="background:linear-gradient(135deg,#1F2937 0%,#1D1384 100%); padding:24px 16px 20px; text-align:center;">
            <div class="flex items-center justify-center rounded-full mx-auto mb-2"
              style="width:56px; height:56px; background:linear-gradient(135deg,#1C4FC3,#1D1384); color:#fff; font-size:18px; font-weight:800; border:2px solid rgba(255,255,255,0.15);">
              {{ initials }}
            </div>
            <p class="text-xs font-bold" style="color:#fff; margin:0;">{{ fullName || 'FoundersLab User' }}</p>
            <p class="text-[11px] mt-0.5" style="color:rgba(255,255,255,0.7); margin:0;">{{ authService.getEmail() || user?.email || '' }}</p>
            <span class="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
              style="background:rgba(108,62,255,0.25); color:#93C5FD;">
              <ng-icon name="lucideStar" [size]="'10'" />
              {{ displayRole(user?.role || authService.getRole()) }}
            </span>
          </div>

          <nav class="flex-1 flex flex-col gap-0.5" style="padding:12px 8px;" aria-label="Profile sections">
            @for (tab of visibleTabs; track tab.id) {
              <button type="button" (click)="activeTab = tab.id"
                class="flex items-center gap-2.5 w-full rounded-lg text-left cursor-pointer transition-colors"
                style="padding:8px 10px; border:none; font-family:var(--font-sans);"
                [style.background]="activeTab === tab.id ? 'var(--chip-active-bg)' : 'transparent'"
                [style.color]="activeTab === tab.id ? '#1C4FC3' : 'var(--text-secondary)'"
                [attr.aria-current]="activeTab === tab.id ? 'page' : null">
                <ng-icon [name]="tab.icon" [size]="'15'" />
                <span class="text-xs font-medium">{{ tab.label }}</span>
              </button>
            }
          </nav>

          <div style="padding:12px 16px; border-top:1px solid var(--border-subtle);">
            <button (click)="closeProfile()"
              class="flex items-center gap-2 w-full rounded-lg text-left cursor-pointer transition-colors"
              style="padding:8px 10px; border:none; background:transparent; color:var(--text-muted); font-family:var(--font-sans);">
              <ng-icon name="lucideX" [size]="'14'" />
              <span class="text-xs font-medium">Close</span>
            </button>
          </div>
        </div>

        <!-- ═══ CONTENT ═══ -->
        <div class="flex-1 flex flex-col overflow-hidden">
          <div class="flex items-center justify-between" style="padding:20px 24px 16px; flex-shrink:0;">
            <h3 class="text-base font-bold" style="color:var(--text-primary);">{{ activeTabLabel }}</h3>
            <button (click)="closeProfile()"
              class="flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              style="width:32px; height:32px; background:transparent; border:none; cursor:pointer; color:var(--text-muted);"
              aria-label="Close profile">
              <ng-icon name="lucideX" [size]="'16'" />
            </button>
          </div>

          @if (successMessage) {
            <div class="mx-6 mb-3 rounded-xl border px-4 py-2.5 text-xs" style="background:var(--badge-green-bg); border-color:transparent; color:var(--badge-green-text);" role="alert">
              {{ successMessage }}
            </div>
          }
          @if (errorMessage) {
            <div class="mx-6 mb-3 rounded-xl border px-4 py-2.5 text-xs" style="background:var(--badge-red-bg); border-color:transparent; color:var(--badge-red-text);" role="alert">
              {{ errorMessage }}
            </div>
          }

          <div class="flex-1 overflow-y-auto" style="padding:0 24px 24px;">

            @if (activeTab === 'account') {
              <div class="space-y-6">
                <div class="flex items-center gap-5">
                  <div class="flex items-center justify-center rounded-full"
                    style="width:72px; height:72px; background:linear-gradient(135deg,#1C4FC3,#1D1384); color:#fff; font-size:22px; font-weight:800;">
                    {{ initials }}
                  </div>
                  <div>
                    <p class="text-sm font-semibold" style="color:var(--text-primary);">{{ fullName || 'FoundersLab User' }}</p>
                    <p class="text-xs mt-0.5" style="color:var(--text-muted);">{{ displayRole(user?.role || authService.getRole()) }}</p>
                    <button type="button" (click)="toggleProfileEdit()"
                      class="mt-2 text-xs font-semibold rounded-lg cursor-pointer"
                      style="background:var(--surface-subtle); border:1px solid var(--border); color:var(--text-body); padding:5px 12px; font-family:var(--font-sans);">
                      {{ isEditingProfile ? 'Cancel editing' : 'Edit profile' }}
                    </button>
                  </div>
                </div>

                <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">First Name</label>
                      <input formControlName="name" type="text" [readOnly]="!isEditingProfile" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Last Name</label>
                      <input formControlName="prenom" type="text" [readOnly]="!isEditingProfile" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" />
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Email</label>
                    <input formControlName="email" type="email" [readOnly]="!isEditingProfile" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" />
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Status</label>
                      <input formControlName="statut" type="text" [readOnly]="!isEditingProfile" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Role</label>
                      <input [value]="displayRole(user?.role || authService.getRole())" type="text" readOnly class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" />
                    </div>
                  </div>
                  @if (isEditingProfile) {
                    <div class="flex items-center justify-end gap-3" style="padding-top:8px; border-top:1px solid var(--border-subtle);">
                      <button type="button" (click)="toggleProfileEdit()" class="text-sm font-semibold rounded-xl cursor-pointer" style="background:transparent; border:1.5px solid var(--border); color:var(--text-body); padding:8px 20px; font-family:var(--font-sans);">Cancel</button>
                      <button type="submit" [disabled]="profileForm.invalid || savingProfile" class="text-sm font-semibold rounded-xl cursor-pointer" style="background:linear-gradient(135deg,#1C4FC3,#1D1384); color:#fff; border:none; padding:8px 20px; font-family:var(--font-sans);">
                        {{ savingProfile ? 'Saving...' : 'Save Profile' }}
                      </button>
                    </div>
                  }
                </form>
              </div>
            }

            @if (activeTab === 'security') {
              <div class="space-y-4">
                <div class="rounded-xl p-4" style="background:var(--surface-subtle);">
                  <div class="flex items-center gap-2 mb-3">
                    <ng-icon name="lucideKey" [size]="'15'" style="color:#1C4FC3;" />
                    <h4 class="text-sm font-semibold" style="color:var(--text-primary);">Change Password</h4>
                  </div>
                  <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" class="space-y-3">
                    <div>
                      <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Current Password</label>
                      <input formControlName="oldPassword" type="password" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" placeholder="Enter current password" />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">New Password</label>
                      <input formControlName="newPassword" type="password" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" placeholder="Enter new password" />
                    </div>
                    <button type="submit" [disabled]="passwordForm.invalid || changingPassword" class="text-xs font-semibold rounded-lg cursor-pointer" style="background:linear-gradient(135deg,#1C4FC3,#1D1384); color:#fff; border:none; padding:7px 16px; font-family:var(--font-sans);">
                      {{ changingPassword ? 'Updating...' : 'Update Password' }}
                    </button>
                  </form>
                </div>

                <div class="rounded-xl p-4" style="background:var(--surface-subtle);">
                  <div class="flex items-center gap-2 mb-1">
                    <ng-icon name="lucideShield" [size]="'15'" style="color:#1C4FC3;" />
                    <h4 class="text-sm font-semibold" style="color:var(--text-primary);">Set Password Directly</h4>
                  </div>
                  <p class="text-xs mb-3" style="color:var(--text-muted);">Set a new password without entering the current one.</p>
                  <form [formGroup]="setPasswordForm" (ngSubmit)="setPassword()" class="space-y-3">
                    <div>
                      <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">New Password</label>
                      <input formControlName="password" type="password" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" placeholder="Enter new password" />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Confirm Password</label>
                      <input formControlName="confirmPassword" type="password" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" placeholder="Confirm new password" />
                    </div>
                    @if (setPasswordForm.hasError('passwordMismatch') && setPasswordForm.touched) {
                      <p class="text-xs" style="color:var(--badge-red-text);">Passwords do not match.</p>
                    }
                    <button type="submit" [disabled]="setPasswordForm.invalid || settingPassword" class="text-xs font-semibold rounded-lg cursor-pointer" style="background:linear-gradient(135deg,#1C4FC3,#1D1384); color:#fff; border:none; padding:7px 16px; font-family:var(--font-sans);">
                      {{ settingPassword ? 'Saving...' : 'Set Password' }}
                    </button>
                  </form>
                </div>
              </div>
            }

            @if (activeTab === 'team') {
              <section class="rounded-2xl border p-5" style="background:var(--surface); border-color:var(--border);">
                <div class="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 class="text-base font-semibold" style="color:var(--text-primary);">User Management</h3>
                    <p class="text-xs mt-1" style="color:var(--text-secondary);">Create, update, and manage workspace users here.</p>
                  </div>
                  <button type="button" class="btn-primary-inline" (click)="openUserForm()">
                    Create user
                  </button>
                </div>

                <div class="team-filter-row">
                  <label class="profile-field">
                    <span>Search</span>
                    <input type="text" [value]="teamSearch" (input)="teamSearch = inputValue($event); applyTeamFilter()" placeholder="Name or email" />
                  </label>
                  <label class="profile-field">
                    <span>Role</span>
                    <select [value]="selectedRoleFilter" (change)="selectedRoleFilter = inputValue($event); applyTeamFilter()">
                      <option value="">All roles</option>
                      @for (role of roleOptions; track role) {
                        <option [value]="role">{{ role }}</option>
                      }
                    </select>
                  </label>
                </div>

                @if (showUserForm) {
                  <form [formGroup]="managedUserForm" (ngSubmit)="saveManagedUser()" class="team-form-card">
                    <div class="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p class="text-sm font-semibold" style="color:var(--text-primary);">
                          {{ editingManagedUser ? 'Edit user' : 'Create user' }}
                        </p>
                        <p class="text-xs mt-1" style="color:var(--text-secondary);">Fill in the details to update or create user account.</p>
                      </div>
                      <button type="button" class="btn-secondary-inline" (click)="closeUserForm()">Close</button>
                    </div>

                    <div class="profile-grid mt-4">
                      <label class="profile-field">
                        <span>First name</span>
                        <input formControlName="name" type="text" />
                      </label>
                      <label class="profile-field">
                        <span>Last name</span>
                        <input formControlName="prenom" type="text" />
                      </label>
                      <label class="profile-field profile-field--full">
                        <span>Email</span>
                        <input formControlName="email" type="email" />
                      </label>
                      <label class="profile-field">
                        <span>Role</span>
                        <select formControlName="role">
                          <option value="">Choose a role</option>
                          @for (role of roleOptions; track role) {
                            <option [value]="role">{{ role }}</option>
                          }
                        </select>
                      </label>
                      <label class="profile-field">
                        <span>Status</span>
                        <input formControlName="statut" type="text" />
                      </label>
                      @if (!editingManagedUser) {
                        <label class="profile-field profile-field--full">
                          <span>Password</span>
                          <input formControlName="password" type="password" />
                        </label>
                      }
                    </div>

                    <div class="profile-actions">
                      <button type="submit" class="btn-primary-inline" [disabled]="managedUserForm.invalid || savingManagedUser">
                        {{ savingManagedUser ? 'Saving...' : (editingManagedUser ? 'Update user' : 'Create user') }}
                      </button>
                    </div>
                  </form>
                }

                @if (loadingTeamUsers) {
                  <p class="mt-5 text-sm" style="color:var(--text-secondary);">Loading users...</p>
                } @else {
                  <div class="table-scroll mt-5">
                    <table class="team-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (managedUser of filteredTeamUsers; track managedUser.id) {
                          <tr>
                            <td>{{ managedUser.name }} {{ managedUser.prenom }}</td>
                            <td>{{ managedUser.email }}</td>
                            <td>{{ managedUser.role }}</td>
                            <td>{{ managedUser.statut }}</td>
                            <td>
                              <div class="ticket-actions-row">
                                <button type="button" class="btn-secondary-inline" (click)="openUserForm(managedUser)">Edit</button>
                                <button type="button" class="btn-danger-inline" (click)="deleteManagedUser(managedUser)">Delete</button>
                              </div>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                }
              </section>
            }

          </div><!-- /pf-tab-body -->
        </div><!-- /pf-content -->
      </div><!-- /pf-body -->
    </div><!-- /pf-shell -->
  `,
})
export class ProfileComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);

  protected activeTab: ProfileTab = 'account';
  protected readonly allTabs: Array<{ id: ProfileTab; label: string; hint: string; icon: string }> = [
    { id: 'account', label: 'Account', hint: 'Profile data', icon: 'lucideUser' },
    { id: 'security', label: 'Security', hint: 'Password flows', icon: 'lucideKey' },
    { id: 'team', label: 'Team', hint: 'Admin only', icon: 'lucideUsers' },
  ];
  protected user: User | null = null;
  protected teamUsers: User[] = [];
  protected filteredTeamUsers: User[] = [];

  protected loadingTeamUsers = false;
  protected savingProfile = false;
  protected changingPassword = false;
  protected settingPassword = false;
  protected savingManagedUser = false;
  protected isEditingProfile = false;
  protected showUserForm = false;
  protected editingManagedUser: User | null = null;

  protected teamSearch = '';
  protected selectedRoleFilter = '';
  protected readonly roleOptions = Object.values(Role);

  protected successMessage = '';
  protected errorMessage = '';

  protected readonly profileForm: FormGroup;
  protected readonly passwordForm: FormGroup;
  protected readonly setPasswordForm: FormGroup;
  protected readonly managedUserForm: FormGroup;

  constructor() {
    this.profileForm = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      statut: [''],
    });

    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.setPasswordForm = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator },
    );

    this.managedUserForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required],
      statut: ['active'],
    });
  }

  ngOnInit(): void {
    this.profileForm.disable();
    this.loadProfile();

    if (this.isAdmin) {
      this.loadTeamUsers();
    }

    const tab = this.route.snapshot.queryParamMap.get('tab') as ProfileTab | null;
    if (tab && this.allTabs.some((t) => t.id === tab)) {
      this.activeTab = tab;
    }
  }

  ngOnDestroy(): void {}

  protected get visibleTabs(): Array<{ id: ProfileTab; label: string; hint: string; icon: string }> {
    return this.allTabs.filter((tab) => tab.id !== 'team' || this.isAdmin);
  }

  protected get activeTabLabel(): string {
    return this.allTabs.find((tab) => tab.id === this.activeTab)?.label ?? 'Profile';
  }

  protected closeProfile(): void {
    const roleValue = this.authService.getRole() as string;
    const isDashboardUser = this.authService.hasRole(
      Role.ADMIN, Role.MENTOR, Role.INVESTOR, Role.PARTNER
    ) || roleValue === 'PARTENAIRE';
    this.router.navigate([isDashboardUser ? '/app/dashboard' : '/']);
  }

  protected get isAdmin(): boolean {
    return this.authService.hasRole(Role.ADMIN);
  }

  protected get isDashboardUser(): boolean {
    const roleValue = this.authService.getRole() as string;
    return this.authService.hasRole(Role.ADMIN, Role.MENTOR, Role.INVESTOR, Role.PARTNER)
      || roleValue === 'PARTENAIRE';
  }

  protected get isInvestor(): boolean {
    return this.authService.hasRole(Role.INVESTOR);
  }

  protected get fullName(): string {
    return [this.user?.name, this.user?.prenom].filter(Boolean).join(' ').trim();
  }

  protected get initials(): string {
    const first = this.user?.name?.[0] || this.authService.getEmail()?.[0] || 'F';
    const last = this.user?.prenom?.[0] || this.authService.getRole()?.[0] || 'L';
    return `${first}${last}`.toUpperCase();
  }

  protected goToCriteriaForm(): void {
    this.router.navigate(['/investment/criteria']);
  }

  protected toggleProfileEdit(): void {
    this.clearMessages();
    this.isEditingProfile = !this.isEditingProfile;

    if (this.isEditingProfile) {
      this.profileForm.enable();
      this.profileForm.get('id')?.disable();
    } else {
      this.profileForm.patchValue(this.user || {});
      this.profileForm.disable();
    }
  }

  protected async saveProfile(): Promise<void> {
    if (!this.user || this.profileForm.invalid) {
      return;
    }

    this.savingProfile = true;
    this.clearMessages();

    try {
      const payload: User = {
        ...this.user,
        ...this.profileForm.getRawValue(),
      };
      this.user = await this.userService.updateUser(payload, this.authService.getUserId());
      this.profileForm.patchValue(this.user);
      this.profileForm.disable();
      this.isEditingProfile = false;
      this.successMessage = 'Profile updated successfully.';
    } catch (error: any) {
      this.errorMessage = error?.error?.error || error?.error?.message || 'Failed to update profile.';
    } finally {
      this.savingProfile = false;
      this.cdr.markForCheck();
    }
  }

  protected async changePassword(): Promise<void> {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.changingPassword = true;
    this.clearMessages();

    try {
      await this.userService.changePassword(
        this.authService.getUserId(),
        this.passwordForm.value.oldPassword,
        this.passwordForm.value.newPassword,
      );
      this.passwordForm.reset();
      this.successMessage = 'Password updated successfully.';
    } catch (error: any) {
      this.errorMessage = error?.error?.error || error?.error?.message || 'Failed to change password.';
    } finally {
      this.changingPassword = false;
      this.cdr.markForCheck();
    }
  }

  protected async setPassword(): Promise<void> {
    if (this.setPasswordForm.invalid) {
      this.setPasswordForm.markAllAsTouched();
      return;
    }

    this.settingPassword = true;
    this.clearMessages();

    try {
      await this.userService.setPassword(this.authService.getUserId(), this.setPasswordForm.value.password);
      this.setPasswordForm.reset();
      this.successMessage = 'Password set successfully.';
    } catch (error: any) {
      this.errorMessage = error?.error?.error || error?.error?.message || 'Failed to set password.';
    } finally {
      this.settingPassword = false;
      this.cdr.markForCheck();
    }
  }

  protected openUserForm(user?: User): void {
    this.clearMessages();
    this.showUserForm = true;
    this.editingManagedUser = user || null;

    if (user) {
      this.managedUserForm.patchValue({
        name: user.name,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        statut: user.statut,
        password: '',
      });
      this.managedUserForm.get('password')?.clearValidators();
      this.managedUserForm.get('password')?.updateValueAndValidity();
    } else {
      this.managedUserForm.reset({
        name: '',
        prenom: '',
        email: '',
        password: '',
        role: '',
        statut: 'active',
      });
      this.managedUserForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.managedUserForm.get('password')?.updateValueAndValidity();
    }
  }

  protected closeUserForm(): void {
    this.showUserForm = false;
    this.editingManagedUser = null;
    this.managedUserForm.reset();
  }

  protected async saveManagedUser(): Promise<void> {
    if (this.managedUserForm.invalid) {
      this.managedUserForm.markAllAsTouched();
      return;
    }

    this.savingManagedUser = true;
    this.clearMessages();

    try {
      if (this.editingManagedUser) {
        const payload: User = {
          ...this.editingManagedUser,
          ...this.managedUserForm.getRawValue(),
          dateInscription: this.editingManagedUser.dateInscription,
        };
        await this.userService.updateUser(payload, this.authService.getUserId());
      } else {
        await this.userService.createUser({
          name: this.managedUserForm.value.name,
          prenom: this.managedUserForm.value.prenom,
          email: this.managedUserForm.value.email,
          password: this.managedUserForm.value.password,
          role: this.managedUserForm.value.role,
        });
      }

      await this.loadTeamUsers();
      this.successMessage = this.editingManagedUser ? 'User updated successfully.' : 'User created successfully.';
      this.closeUserForm();
    } catch (error: any) {
      this.errorMessage = error?.error?.error || error?.error?.message || 'Failed to save user.';
    } finally {
      this.savingManagedUser = false;
      this.cdr.markForCheck();
    }
  }

  protected async deleteManagedUser(user: User): Promise<void> {
    if (!window.confirm(`Delete ${user.name} ${user.prenom}?`)) {
      return;
    }

    this.clearMessages();

    try {
      await this.userService.deleteUser(user.id);
      this.teamUsers = this.teamUsers.filter((item) => item.id !== user.id);
      this.applyTeamFilter();
      this.successMessage = 'User deleted successfully.';
    } catch {
      this.errorMessage = 'Failed to delete user.';
    }
  }

  protected applyTeamFilter(): void {
    const query = this.teamSearch.trim().toLowerCase();
    this.filteredTeamUsers = this.teamUsers.filter((user) => {
      const matchesText = [user.name, user.prenom, user.email]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
      const matchesRole = !this.selectedRoleFilter || user.role === this.selectedRoleFilter;
      return matchesText && matchesRole;
    });
  }

  protected displayRole(role: string): string {
    if (!role) {
      return 'Member';
    }

    return role === 'PARTENAIRE' ? 'Partner' : role.charAt(0) + role.slice(1).toLowerCase();
  }

  protected formatDate(value: string | null): string {
    if (!value) {
      return '—';
    }

    return new Date(value).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  protected inputValue(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }

  private async loadProfile(): Promise<void> {
    try {
      this.user = await this.userService.getUserById(this.authService.getUserId());
      this.profileForm.patchValue(this.user);
    } catch {
      this.errorMessage = 'Failed to load profile.';
    } finally {
      this.cdr.markForCheck();
    }
  }

  private async loadTeamUsers(): Promise<void> {
    this.loadingTeamUsers = true;

    try {
      this.teamUsers = await this.userService.getAllUsers();
      this.applyTeamFilter();
    } catch {
      this.errorMessage = 'Failed to load users.';
    } finally {
      this.loadingTeamUsers = false;
      this.cdr.markForCheck();
    }
  }

  private passwordMatchValidator(form: FormGroup): Record<string, boolean> | null {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
