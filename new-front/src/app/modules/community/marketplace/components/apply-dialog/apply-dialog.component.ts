import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MarketplaceService } from '../../services/marketplace.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { ApplyDTO } from '../../../shared/models/opportunity.model';

@Component({
  standalone: false,
  selector: 'app-apply-dialog',
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div class="apply-dialog bg-white rounded-2xl shadow-xl w-full max-w-[520px] overflow-hidden flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="dialog-header flex items-start gap-4 p-6 border-b border-gray-100 relative">
          <div class="header-icon-wrapper w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md flex-shrink-0">
            <ng-icon name="lucideSend" class="text-white text-xl"></ng-icon>
          </div>
          <div class="flex-1 pr-8">
            <h2 class="dialog-title m-0 text-xl font-extrabold text-gray-800">Postuler</h2>
            <p class="dialog-subtitle m-0 mt-1 text-sm font-medium text-gray-500 truncate" [title]="opportunityTitle">{{ opportunityTitle }}</p>
          </div>
          <button type="button" class="close-btn absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors" (click)="cancel()">
            <ng-icon name="lucideX" size="20"></ng-icon>
          </button>
        </div>

      <!-- Form -->
      <form [formGroup]="form" (ngSubmit)="submit()" class="apply-form">
        
          <!-- File Upload -->
          <div class="file-input-section mb-4">
            <div class="file-upload-container flex flex-col gap-2 p-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
              <input type="file" 
                #fileInput
                accept=".pdf"
                (change)="onFileSelected($event)"
                class="hidden" />
              <button type="button" class="upload-btn inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors" (click)="fileInput.click()">
                <ng-icon name="lucideUploadCloud" size="18"></ng-icon>
                {{ selectedFileName || 'Choisir un fichier PDF' }}
              </button>
              <span class="text-xs text-gray-500 text-center">Format PDF uniquement, max 10MB</span>
              <span class="text-xs text-red-500 text-center mt-1" *ngIf="!selectedFile && form.touched">CV requis</span>
            </div>
          </div>

          <div class="flex flex-col gap-1 w-full mb-2">
            <label class="text-sm font-medium text-gray-700">Lettre de motivation</label>
            <textarea formControlName="coverLetter" rows="6" class="flex min-h-[120px] w-full rounded-xl border border-input bg-gray-50 px-3 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Présentez-vous et expliquez pourquoi vous êtes le candidat idéal..."></textarea>
            <span class="text-xs text-red-500 mt-1" *ngIf="form.get('coverLetter')?.hasError('required') && form.get('coverLetter')?.touched">Lettre de motivation requise</span>
            <span class="text-xs text-gray-500 text-right">{{ form.get('coverLetter')?.value?.length || 0 }} / 2000</span>
          </div>

          <!-- Actions -->
          <div class="dialog-actions flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <button type="button" class="cancel-btn px-6 py-2 rounded-full font-semibold text-gray-500 hover:bg-gray-100 transition-colors" (click)="cancel()">Annuler</button>
            <button type="submit" class="submit-btn inline-flex items-center gap-2 px-6 py-2 rounded-full font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors h-11 disabled:opacity-60 disabled:cursor-not-allowed"
              [disabled]="form.invalid || loading">
              <ng-icon *ngIf="!loading" name="lucideSend" size="18"></ng-icon>
              <ng-icon *ngIf="loading" name="lucideLoader2" class="animate-spin" size="18"></ng-icon>
              {{ loading ? 'Envoi...' : 'Envoyer ma candidature' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .apply-form { padding: 24px; overflow-y: auto; }
  `]
})
export class ApplyDialogComponent {

  @Input() opportunityId!: string;
  @Input() opportunityTitle!: string;
  @Output() closed = new EventEmitter<boolean>();

  form: FormGroup;
  loading = false;
  selectedFileName = '';
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private marketplaceService: MarketplaceService,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      cvFile: [null, Validators.required],
      coverLetter: ['', [Validators.required, Validators.maxLength(2000)]]
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type === 'application/pdf' && file.size <= 10 * 1024 * 1024) { // 10MB limit
        this.selectedFile = file;
        this.selectedFileName = file.name;
        this.form.patchValue({ cvFile: file });
      } else {
        alert('Veuillez sélectionner un fichier PDF de moins de 10MB');
      }
    }
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;

    const dto: ApplyDTO = {
      candidateId: this.authService.getUserId()?.toString() || '',
      coverLetter: this.form.value.coverLetter
    };

    if (this.selectedFile) {
      this.marketplaceService.applyWithFile(this.opportunityId, dto, this.selectedFile).subscribe({
        next: () => {
          this.loading = false;
          alert('Candidature envoyée avec succès ! 🎉');
          this.closed.emit(true);
        },
        error: () => {
          this.loading = false;
          alert('Erreur lors de l\'envoi de la candidature');
        }
      });
    }
  }

  cancel() {
    this.closed.emit(false);
  }
}
