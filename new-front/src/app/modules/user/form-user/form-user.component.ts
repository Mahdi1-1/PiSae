import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { AdminCreateUserRequest, Role, User } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-form-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './form-user.component.html',
  styleUrls: ['./form-user.component.css']
})
export class FormUserComponent implements OnInit {

  form!: FormGroup;
  isEditMode   = false;
  editUserId: number | null = null;
  isLoading    = false;   // loading existing user in edit mode
  isSubmitting = false;
  errorMessage  = '';
  successMessage = '';
  roles = Object.values(Role);

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildForm();

    // if route has an :id param → edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode  = true;
      this.editUserId  = Number(id);
      this.loadUser(this.editUserId);
    }
  }

  // ── form ────────────────────────────────────────────────────────
  buildForm(): void {
    this.form = this.fb.group({
      name:     ['', [Validators.required, Validators.minLength(2)]],
      prenom:   ['', [Validators.required, Validators.minLength(2)]],
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role:     ['', Validators.required],
      statut:   ['active']
    });
  }

  // shortcut: f['name'].invalid etc.
  get f() { return this.form.controls; }

  // ── load user for edit ──────────────────────────────────────────
  async loadUser(id: number): Promise<void> {
    this.isLoading = true;
    try {
      const user: User = await this.userService.getUserById(id);
      // patch all fields except password (admin sets a new one if needed)
      this.form.patchValue({
        name:   user.name,
        prenom: user.prenom,
        email:  user.email,
        role:   user.role,
        statut: user.statut
      });
      // password not required in edit mode
      this.form.get('password')!.clearValidators();
      this.form.get('password')!.updateValueAndValidity();
    } catch {
      this.errorMessage = 'Impossible de charger les données de l\'utilisateur.';
    } finally {
      this.isLoading = false;
    }
  }

  // ── submit ──────────────────────────────────────────────────────
  async onSubmit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.isSubmitting = true;
    this.errorMessage  = '';

    try {
      if (this.isEditMode && this.editUserId !== null) {
        // ── UPDATE ──
        const payload: User = {
          id:     this.editUserId,
          name:   this.form.value.name,
          prenom: this.form.value.prenom,
          email:  this.form.value.email,
          role:   this.form.value.role,
          statut: this.form.value.statut,
          dateInscription: ''
        };
        await this.userService.updateUser(payload, this.authService.getUserId());
        this.successMessage = 'Utilisateur mis à jour avec succès !';
      } else {
        // ── CREATE ──
        const payload: AdminCreateUserRequest = {
          name:     this.form.value.name,
          prenom:   this.form.value.prenom,
          email:    this.form.value.email,
          password: this.form.value.password,
          role:     this.form.value.role
        };
        await this.userService.createUser(payload);
        this.successMessage = 'Utilisateur créé avec succès !';
      }

      // go back to list after short delay so user sees the message
      setTimeout(() => this.router.navigate(['/user/list']), 1500);

    } catch (err: any) {
      this.errorMessage =
        err?.error?.error || err?.error?.message || 'Une erreur est survenue.';
    } finally {
      this.isSubmitting = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/user/list']);
  }
}