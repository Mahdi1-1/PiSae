import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../core/services/user.service';
import { AdminCreateUserRequest, Role, User, UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.css'
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  filtered: User[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  searchTerm = '';
  selectedRole = '';
  readonly roles: UserRole[] = Object.values(Role) as UserRole[];

  // Edit modal
  editing: User | null = null;
  editForm: { name: string; prenom: string; email: string; role: UserRole } = {
    name: '', prenom: '', email: '', role: 'USER'
  };
  isSaving = false;

  // Delete confirm modal
  deleting: User | null = null;
  isDeleting = false;

  // Create user modal
  creating = false;
  createForm: { prenom: string; name: string; email: string; password: string; role: UserRole } = {
    prenom: '', name: '', email: '', password: '', role: 'USER'
  };
  isCreating = false;

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    Promise.resolve().then(() => this.load());
  }

  async load(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();
    try {
      this.users = await this.userService.getAllUsers();
      this.applyFilter();
    } catch (err) {
      this.errorMessage = `Unable to load users: ${this.getErrorMessage(err)}`;
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  applyFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.filtered = this.users.filter(u => {
      if (this.selectedRole && u.role !== this.selectedRole) return false;
      if (!term) return true;
      return (
        (u.name ?? '').toLowerCase().includes(term) ||
        (u.prenom ?? '').toLowerCase().includes(term) ||
        (u.email ?? '').toLowerCase().includes(term)
      );
    });
  }

  // ── Edit ────────────────────────────────────────────────────────────────
  openEdit(user: User): void {
    this.editing = user;
    this.editForm = {
      name: user.name ?? '',
      prenom: user.prenom ?? '',
      email: user.email ?? '',
      role: user.role
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelEdit(): void { this.editing = null; }

  async saveEdit(): Promise<void> {
    if (!this.editing) return;
    if (!this.editForm.name.trim() || !this.editForm.prenom.trim() || !this.editForm.email.trim()) {
      this.errorMessage = 'All fields are required.';
      return;
    }
    this.isSaving = true;
    try {
      const payload: User = {
        ...this.editing,
        name: this.editForm.name.trim(),
        prenom: this.editForm.prenom.trim(),
        email: this.editForm.email.trim(),
        role: this.editForm.role
      };
      const updated = await this.userService.updateUser(payload, this.editing.id);
      const idx = this.users.findIndex(u => u.id === this.editing!.id);
      if (idx >= 0) this.users[idx] = updated;
      this.editing = null;
      this.successMessage = 'User updated successfully.';
      this.applyFilter();
      setTimeout(() => { this.successMessage = ''; this.cdr.detectChanges(); }, 2500);
    } catch (err) {
      this.errorMessage = `Unable to update user: ${this.getErrorMessage(err)}`;
    } finally {
      this.isSaving = false;
      this.cdr.detectChanges();
    }
  }

  // ── Create ──────────────────────────────────────────────────────────────
  openCreate(): void {
    this.createForm = { prenom: '', name: '', email: '', password: '', role: 'USER' };
    this.creating = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelCreate(): void { this.creating = false; }

  async submitCreate(): Promise<void> {
    const { prenom, name, email, password, role } = this.createForm;
    if (!prenom.trim() || !name.trim() || !email.trim() || !password.trim()) {
      this.errorMessage = 'All fields are required.';
      return;
    }
    if (password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return;
    }
    this.isCreating = true;
    try {
      const payload: AdminCreateUserRequest = {
        prenom: prenom.trim(),
        name: name.trim(),
        email: email.trim(),
        password,
        role: role as Role
      };
      const created = await this.userService.createUser(payload);
      this.users = [created, ...this.users];
      this.applyFilter();
      this.creating = false;
      this.successMessage = `User ${created.prenom} ${created.name} created.`;
      setTimeout(() => { this.successMessage = ''; this.cdr.detectChanges(); }, 2500);
    } catch (err) {
      this.errorMessage = `Unable to create user: ${this.getErrorMessage(err)}`;
    } finally {
      this.isCreating = false;
      this.cdr.detectChanges();
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────
  askDelete(user: User): void {
    this.deleting = user;
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelDelete(): void { this.deleting = null; }

  async confirmDelete(): Promise<void> {
    if (!this.deleting) return;
    this.isDeleting = true;
    try {
      await this.userService.deleteUser(this.deleting.id);
      this.users = this.users.filter(u => u.id !== this.deleting!.id);
      this.successMessage = 'User deleted.';
      this.deleting = null;
      this.applyFilter();
      setTimeout(() => { this.successMessage = ''; this.cdr.detectChanges(); }, 2500);
    } catch (err) {
      this.errorMessage = `Unable to delete user: ${this.getErrorMessage(err)}`;
    } finally {
      this.isDeleting = false;
      this.cdr.detectChanges();
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────────────
  initials(u: User): string {
    const a = (u.prenom?.[0] ?? '').toUpperCase();
    const b = (u.name?.[0] ?? '').toUpperCase();
    return (a + b) || (u.email?.[0]?.toUpperCase() ?? '?');
  }

  roleBadgeClass(role: UserRole): string {
    switch (role) {
      case 'ADMIN': return 'role-admin';
      case 'PARTNER':
      case 'PARTENAIRE': return 'role-partner';
      case 'MENTOR': return 'role-mentor';
      case 'INVESTOR': return 'role-investor';
      case 'EXPERT': return 'role-expert';
      case 'ENTREPRENEUR': return 'role-entrepreneur';
      default: return 'role-user';
    }
  }

  trackById = (_: number, u: User) => u.id;

  private getErrorMessage(err: unknown): string {
    const e = err as HttpErrorResponse;
    if (e?.error && typeof e.error === 'object' && 'message' in e.error) {
      const msg = String((e.error as { message?: unknown }).message ?? '').trim();
      if (msg) return msg;
    }
    if (typeof e?.error === 'string' && e.error.trim()) return e.error;
    if (e?.status) return `Server error (${e.status})`;
    return e?.message || 'Unknown error';
  }
}
