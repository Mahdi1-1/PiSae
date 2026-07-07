import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  lucideInfo, lucideCheckCircle, lucideAlertTriangle, lucideAlertCircle, lucideX 
} from '@ng-icons/lucide';
import { ToastService, Toast } from '../../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  providers: [
    provideIcons({ 
      lucideInfo, lucideCheckCircle, lucideAlertTriangle, lucideAlertCircle, lucideX 
    })
  ],
  template: `
    <div class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      <div *ngFor="let toast of toastService.toasts()"
           class="toast-item pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border min-w-[320px] max-w-[420px] shadow-2xl animate-fade-in-right"
           [ngClass]="getToastClass(toast.type)"
           role="alert">
        
        <!-- Icon -->
        <div class="flex-shrink-0 mt-0.5">
          <ng-icon [name]="getIcon(toast.type)" [size]="'20'"></ng-icon>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold mb-0.5">{{ getTitle(toast.type) }}</p>
          <p class="text-xs leading-relaxed opacity-90">{{ toast.message }}</p>
        </div>

        <!-- Close Button -->
        <button (click)="toastService.remove(toast.id)" 
                class="flex-shrink-0 -mt-1 -mr-1 p-1 rounded-lg hover:bg-black/5 transition-colors">
          <ng-icon name="lucideX" [size]="'14'"></ng-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-item {
      backdrop-filter: blur(12px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .animate-fade-in-right {
      animation: fadeInRight 0.4s ease-out forwards;
    }

    @keyframes fadeInRight {
      from { opacity: 0; transform: translateX(20px) scale(0.95); }
      to { opacity: 1; transform: translateX(0) scale(1); }
    }

    .toast-info {
      background: rgba(255, 255, 255, 0.8);
      border-color: rgba(59, 130, 246, 0.2);
      color: #1e40af;
    }
    .toast-success {
      background: rgba(236, 253, 245, 0.8);
      border-color: rgba(16, 185, 129, 0.2);
      color: #065f46;
    }
    .toast-warning {
      background: rgba(255, 251, 235, 0.8);
      border-color: rgba(245, 158, 11, 0.2);
      color: #92400e;
    }
    .toast-error {
      background: rgba(254, 242, 242, 0.8);
      border-color: rgba(239, 68, 68, 0.2);
      color: #991b1b;
    }

    :host-context(.dark) .toast-info { background: rgba(30, 58, 138, 0.8); color: #bfdbfe; }
    :host-context(.dark) .toast-success { background: rgba(6, 78, 59, 0.8); color: #a7f3d0; }
    :host-context(.dark) .toast-warning { background: rgba(120, 53, 15, 0.8); color: #fde68a; }
    :host-context(.dark) .toast-error { background: rgba(127, 29, 29, 0.8); color: #fecaca; }
  `]
})
export class ToastComponent {
  protected readonly toastService = inject(ToastService);

  getToastClass(type: Toast['type']): string {
    return `toast-${type}`;
  }

  getIcon(type: Toast['type']): string {
    switch (type) {
      case 'success': return 'lucideCheckCircle';
      case 'warning': return 'lucideAlertTriangle';
      case 'error': return 'lucideAlertCircle';
      default: return 'lucideInfo';
    }
  }

  getTitle(type: Toast['type']): string {
    switch (type) {
      case 'success': return 'Succès';
      case 'warning': return 'Attention';
      case 'error': return 'Erreur';
      default: return 'Notification';
    }
  }
}
