import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MarketplaceService } from '../../services/marketplace.service';
import { AuthService } from '../../../../../core/services/auth.service';


function futureDateValidator(control: any) {
  if (!control.value) return null;
  const chosen = new Date(control.value);
  const now = new Date();
  return chosen > now ? null : { pastDate: true };
}

@Component({
  standalone: false,
  selector: 'app-opportunity-create',
  template: `
    <div class="create-container animate-fade-in-up">

      <button type="button" routerLink="/community/marketplace" class="back-btn p-2 rounded-full hover:bg-black/5 transition-colors mb-6 bg-white shadow-sm inline-flex items-center justify-center">
        <ng-icon name="lucideArrowLeft" size="20"></ng-icon>
      </button>

      <div class="create-card glass-panel">
        <div class="card-header">
          <div class="header-icon-wrapper">
            <ng-icon name="lucideBriefcase" class="header-icon"></ng-icon>
          </div>
          <div>
            <h2 class="form-title">{{ isEditMode ? "Modifier l'Offre" : "Publier une Offre" }}</h2>
            <p class="form-subtitle">{{ isEditMode ? "Mettez à jour les détails de votre opportunité" : "Trouvez les meilleurs talents pour votre projet" }}</p>
          </div>
        </div>

        <div class="card-content">
          <form [formGroup]="form" (ngSubmit)="submit()" class="opp-form">

            <div class="flex flex-col gap-1 w-full mb-4">
              <label class="text-sm font-medium text-gray-700">Titre de l'offre</label>
              <input formControlName="title" placeholder="Ex: Développeur Full Stack FinTech" class="flex h-10 w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              <span class="text-red-500 text-xs mt-1" *ngIf="form.get('title')?.hasError('required') && form.get('title')?.touched">Titre requis</span>
            </div>

            <div class="form-row flex gap-4 mb-4">
              <div class="flex flex-col gap-1 flex-1">
                <label class="text-sm font-medium text-gray-700">Type d'offre</label>
                <select formControlName="type" class="flex h-10 w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="" disabled selected>Choisissez un type</option>
                  <option value="EMPLOI">Emploi</option>
                  <option value="STAGE">Stage</option>
                  <option value="PARTENARIAT">Partenariat</option>
                  <option value="FREELANCE">Freelance</option>
                </select>
                <span class="text-red-500 text-xs mt-1" *ngIf="form.get('type')?.hasError('required') && form.get('type')?.touched">Type requis</span>
              </div>

              <div class="flex flex-col gap-1 flex-1">
                <label class="text-sm font-medium text-gray-700">Postes disponibles</label>
                <div class="relative">
                  <input type="number" formControlName="positionsAvailable" min="1" placeholder="Ex: 2" class="flex h-10 w-full rounded-md border border-input bg-gray-50 px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                  <ng-icon name="lucideBriefcase" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></ng-icon>
                </div>
                <span class="text-red-500 text-xs mt-1" *ngIf="form.get('positionsAvailable')?.hasError('required') && form.get('positionsAvailable')?.touched">Nombre de postes requis</span>
              </div>
            </div>

            <div class="form-row flex gap-4 mb-4">
              <div class="flex flex-col gap-1 flex-1">
                <label class="text-sm font-medium text-gray-700">Secteur d'activité</label>
                <select formControlName="sector" class="flex h-10 w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="" disabled selected>Choisissez un secteur</option>
                  <option *ngFor="let s of sectors" [value]="s">{{ s }}</option>
                </select>
                <span class="text-red-500 text-xs mt-1" *ngIf="form.get('sector')?.hasError('required') && form.get('sector')?.touched">Secteur requis</span>
              </div>

              <div class="flex flex-col gap-1 flex-1">
                <label class="text-sm font-medium text-gray-700">Localisation</label>
                <div class="relative">
                  <input formControlName="location" placeholder="Ex: Tunis, Remote" class="flex h-10 w-full rounded-md border border-input bg-gray-50 px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                  <ng-icon name="lucideMapPin" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></ng-icon>
                </div>
                <span class="text-red-500 text-xs mt-1" *ngIf="form.get('location')?.hasError('required') && form.get('location')?.touched">Localisation requise</span>
              </div>
            </div>

            <!-- Deadline fields -->
            <div class="form-row flex gap-4 mb-4">
              <div class="flex flex-col gap-1 flex-1">
                <label class="text-sm font-medium text-gray-700">📅 Date limite</label>
                <input type="date" formControlName="deadlineDate" [min]="minDateString" class="flex h-10 w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                <span class="text-red-500 text-xs mt-1" *ngIf="form.get('deadlineDate')?.hasError('required') && form.get('deadlineDate')?.touched">Date requise</span>
              </div>

              <div class="flex flex-col gap-1 flex-1">
                <label class="text-sm font-medium text-gray-700">🕒 Heure limite</label>
                <input type="time" formControlName="deadlineTime" class="flex h-10 w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                <span class="text-red-500 text-xs mt-1" *ngIf="form.get('deadlineTime')?.hasError('required') && form.get('deadlineTime')?.touched">Heure requise</span>
              </div>
            </div>

            <div class="flex flex-col gap-1 w-full mb-4">
              <label class="text-sm font-medium text-gray-700">Description détaillée</label>
              <textarea formControlName="description" rows="6" class="flex min-h-[80px] w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Décrivez le poste, les missions, les avantages..."></textarea>
              <span class="text-red-500 text-xs mt-1" *ngIf="form.get('description')?.hasError('required') && form.get('description')?.touched">Description requise</span>
            </div>

            <!-- Skills Chips -->
            <div class="skills-section mb-4">
              <label class="text-sm font-medium text-gray-700 mb-2 block">Compétences requises</label>
              <div class="flex flex-col gap-2 p-3 border border-input rounded-md bg-gray-50">
                <div class="flex flex-wrap gap-2" *ngIf="skills.length > 0">
                  <span *ngFor="let skill of skills" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {{ skill }}
                    <button type="button" (click)="removeSkill(skill)" class="ml-1.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:bg-blue-500 focus:text-white focus:outline-none">
                      <ng-icon name="lucideX" size="12"></ng-icon>
                    </button>
                  </span>
                </div>
                <input type="text" (keydown.enter)="addSkillEvent($event)" placeholder="Tapez et appuyez sur Entrée..." class="flex h-8 w-full bg-transparent text-sm placeholder:text-muted-foreground focus-visible:outline-none" />
              </div>
            </div>

            <!-- Pipeline info box -->
            <div class="pipeline-info">
              <ng-icon name="lucideSparkles" class="info-icon"></ng-icon>
              <div>
                <strong>Pipeline IA automatique</strong>
                <p>À la date limite : l'IA classe les profils → envoie un quiz aux top candidats → félicite les 3 meilleurs après réponse.</p>
              </div>
            </div>

            <div class="actions">
              <button type="button" class="cancel-btn inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2" (click)="goBack()">Annuler</button>
              <button class="submit-btn inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 h-10 px-6 py-2 gap-2 disabled:opacity-50" type="submit"
                [disabled]="form.invalid || loading">
                <ng-icon *ngIf="!loading" [name]="isEditMode ? 'lucideSave' : 'lucideSend'"></ng-icon>
                <ng-icon *ngIf="loading" name="lucideLoader2" class="animate-spin"></ng-icon>
                <span>{{ loading ? (isEditMode ? "Enregistrement..." : "Publication en cours...") : (isEditMode ? "Enregistrer" : "Publier l'offre") }}</span>
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .create-container { max-width: 750px; margin: 40px auto; padding: 0 16px; min-height: 80vh; }
    .create-container { max-width: 750px; margin: 40px auto; padding: 0 16px; min-height: 80vh; }

    .create-card {
      background: white; border-radius: 20px; padding: 36px;
      box-shadow: var(--shadow-md); border: 1px solid rgba(0,0,0,0.05);
    }

    .card-header {
      display: flex; align-items: flex-start; gap: 16px;
      margin-bottom: 32px; padding-bottom: 24px;
      border-bottom: 1px solid var(--co-background);
    }
    .header-icon-wrapper {
      width: 56px; height: 56px; border-radius: 16px;
      background: linear-gradient(135deg, var(--co-primary), var(--co-primary-dark));
      display: flex; justify-content: center; align-items: center;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }
    .header-icon { font-size: 28px; width: 28px; height: 28px; color: white; }
    .form-title { margin: 0 0 4px 0; font-size: 24px; font-weight: 800; color: var(--co-text-main); }
    .form-subtitle { margin: 0; color: var(--co-text-muted); font-size: 14px; }



    /* Pipeline info */
    .pipeline-info {
      display: flex; align-items: flex-start; gap: 12px;
      background: linear-gradient(135deg, #eff6ff, #e0f2fe);
      border: 1px solid #bfdbfe; border-radius: 14px;
      padding: 14px 18px; margin: 8px 0 16px;
    }
    .pipeline-info .info-icon { color: var(--co-primary); font-size: 22px; margin-top: 2px; flex-shrink: 0; }
    .pipeline-info strong { font-size: 13px; font-weight: 700; color: var(--co-primary-dark); display: block; margin-bottom: 4px; }
    .pipeline-info p { margin: 0; font-size: 12.5px; color: #475569; line-height: 1.5; }

    .actions {
      display: flex; justify-content: flex-end; align-items: center; gap: 16px;
      margin-top: 16px; padding-top: 24px; border-top: 1px solid var(--co-background);
    }

    @media (max-width: 640px) {
      .form-row { flex-direction: column; gap: 8px; }
      .create-card { padding: 24px; }
    }
  `]
})
export class OpportunityCreateComponent implements OnInit {

  form: FormGroup;
  loading = false;
  skills: string[] = [];
  sectors = ['FinTech', 'AgriTech', 'EdTech', 'GreenTech', 'HealthTech', 'E-Commerce'];
  canCreateOpportunity = false;
  minDateString: string;
  isEditMode = false;
  opportunityId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private marketplaceService: MarketplaceService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Min date = today for the datepicker
    const d = new Date();
    this.minDateString = d.toISOString().split('T')[0];

    this.form = this.fb.group({
      title: ['', Validators.required],
      type: ['', Validators.required],
      sector: ['', Validators.required],
      location: ['', Validators.required],
      description: ['', Validators.required],
      skillsRequired: [[]],
      positionsAvailable: [1, [Validators.required, Validators.min(1)]],
      deadlineDate: ['', Validators.required],
      deadlineTime: ['23:59', Validators.required]
    });
  }

  ngOnInit() {
    this.checkUserRole();
    if (!this.canCreateOpportunity) {
      alert('Vous n\'êtes pas autorisé à cette action');
      this.router.navigate(['/community/marketplace']);
      return;
    }

    this.route.paramMap.subscribe(params => {
      this.opportunityId = params.get('opportunityId');
      if (this.opportunityId) {
        this.isEditMode = true;
        this.loadOpportunityData(this.opportunityId);
      }
    });
  }

  loadOpportunityData(id: string) {
    this.loading = true;
    this.marketplaceService.getOpportunity(id).subscribe({
      next: opp => {
        this.form.patchValue({
          title: opp.title,
          type: opp.type,
          sector: opp.sector,
          location: opp.location,
          description: opp.description,
          positionsAvailable: opp.positionsAvailable,
          skillsRequired: opp.skillsRequired
        });

        this.skills = opp.skillsRequired || [];

        if (opp.expiresAt) {
          const date = new Date(opp.expiresAt);
          this.form.patchValue({
            deadlineDate: date.toISOString().split('T')[0],
            deadlineTime: date.toTimeString().substring(0, 5)
          });
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Erreur lors du chargement de l\'offre');
      }
    });
  }

  checkUserRole() {
    this.canCreateOpportunity = this.authService.isAdmin() ||
                              this.authService.isEntrepreneur() ||
                              this.authService.isPartenaire() ||
                              this.authService.isInvestisseur();
  }

  addSkillEvent(event: any): void {
    event.preventDefault();
    const value = (event.target.value || '').trim();
    if (value) {
      this.skills.push(value);
      this.form.patchValue({ skillsRequired: this.skills });
    }
    event.target.value = '';
  }

  removeSkill(skill: string): void {
    this.skills = this.skills.filter(s => s !== skill);
    this.form.patchValue({ skillsRequired: this.skills });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;

    const dateValue = this.form.value.deadlineDate;
    const timeValue = this.form.value.deadlineTime;
    let expiresAt = undefined;

    if (dateValue && timeValue) {
      const [hours, minutes] = timeValue.split(':').map(Number);
      const combined = new Date(dateValue);
      combined.setHours(hours, minutes, 0, 0);
      expiresAt = combined.toISOString();
    }

    const dto = {
      title: this.form.value.title,
      type: this.form.value.type,
      sector: this.form.value.sector,
      location: this.form.value.location,
      description: this.form.value.description,
      skillsRequired: this.form.value.skillsRequired,
      positionsAvailable: this.form.value.positionsAvailable,
      expiresAt,
      publisherId: this.authService.getUserId()?.toString() || ''
    };

    const action = this.isEditMode && this.opportunityId
      ? this.marketplaceService.updateOpportunity(this.opportunityId, dto)
      : this.marketplaceService.createOpportunity(dto);

    action.subscribe({
      next: () => {
        this.loading = false;
        const msg = this.isEditMode ? 'Offre mise à jour avec succès !' : 'Offre publiée avec succès ! 🎉';
        alert(msg);
        this.router.navigate(['/community/marketplace/manage']);
      },
      error: () => {
        this.loading = false;
        alert('Erreur lors de l\'enregistrement');
      }
    });
  }

  goBack() {
    if (this.isEditMode) {
      this.router.navigate(['/community/marketplace/manage']);
    } else {
      this.router.navigate(['/community/marketplace']);
    }
  }
}
