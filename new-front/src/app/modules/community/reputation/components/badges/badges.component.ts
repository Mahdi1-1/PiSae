import { Component, Input } from '@angular/core';

import { SharedModule } from '../../../shared/shared.module';
import { provideIcons } from '@ng-icons/core';
import { 
  lucideAward, lucideTrophy, lucideBrain, lucideGraduationCap,
  lucideStar, lucideHeart, lucideNetwork, lucideMegaphone
} from '@ng-icons/lucide';

@Component({
  standalone: false,
  selector: 'app-badges',
  providers: [
    provideIcons({
      lucideAward, lucideTrophy, lucideBrain, lucideGraduationCap,
      lucideStar, lucideHeart, lucideNetwork, lucideMegaphone
    })
  ],
  template: `
    <div class="badges-container" *ngIf="badges.length > 0">
      <div class="badges-header">
        <div class="header-icon-wrapper">
          <ng-icon name="lucideAward"></ng-icon>
        </div>
        <div>
          <h3 class="badges-title">Mes Badges</h3>
          <p class="badges-subtitle">{{ badges.length }} badge{{ badges.length > 1 ? 's' : '' }} obtenu{{ badges.length > 1 ? 's' : '' }}</p>
        </div>
      </div>

      <div class="badges-grid">
        <div *ngFor="let badge of badges; let i = index"
          class="badge-card hover-lift animate-scale-in"
          [style.animation-delay.ms]="i * 80">
          <div class="badge-glow" [class]="getBadgeRarity(badge)"></div>
          <div class="badge-icon-circle" [class]="getBadgeRarity(badge)">
            <ng-icon [name]="getBadgeIcon(badge)"></ng-icon>
          </div>
          <div class="badge-name">{{ badge }}</div>
          <div class="badge-rarity" [class]="getBadgeRarity(badge)">
            {{ getBadgeRarityLabel(badge) }}
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="badges.length === 0" class="empty-badges glass-panel">
      <div class="empty-icon-wrapper">
        <ng-icon name="lucideTrophy"></ng-icon>
      </div>
      <h3>Pas encore de badges</h3>
      <p>Continuez à contribuer pour débloquer des récompenses !</p>
    </div>
  `,
  styles: [`
    .badges-container {
      background: white; border-radius: 20px; padding: 28px;
      border: 1px solid rgba(0,0,0,0.05); box-shadow: var(--shadow-sm);
      margin-top: 24px;
    }

    .badges-header {
      display: flex; align-items: center; gap: 14px; margin-bottom: 24px;
    }
    .header-icon-wrapper {
      width: 44px; height: 44px; border-radius: 12px;
      background: linear-gradient(135deg, #FEFCE8, #FEF08A);
      display: flex; justify-content: center; align-items: center;
    }
    .header-icon-wrapper ng-icon { font-size: 24px; width: 24px; height: 24px; color: #CA8A04; }
    .badges-title { margin: 0; font-size: 18px; font-weight: 700; color: var(--co-secondary); }
    .badges-subtitle { margin: 2px 0 0; font-size: 13px; color: var(--co-text-muted); }

    .badges-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 16px;
    }

    .badge-card {
      position: relative; display: flex; flex-direction: column;
      align-items: center; padding: 20px 12px; border-radius: 16px;
      background: #F8FAFC; border: 1px solid rgba(0,0,0,0.05);
      text-align: center; overflow: hidden;
      transition: border-color var(--transition-medium);
    }
    .badge-card:hover { border-color: var(--co-primary-light); }

    .badge-glow {
      position: absolute; top: -20px; left: 50%; transform: translateX(-50%);
      width: 60px; height: 60px; border-radius: 50%;
      filter: blur(20px); opacity: 0.3;
    }
    .badge-glow.common { background: #94A3B8; }
    .badge-glow.rare { background: #3B82F6; }
    .badge-glow.epic { background: #8B5CF6; }
    .badge-glow.legendary { background: #F59E0B; }

    .badge-icon-circle {
      width: 52px; height: 52px; border-radius: 50%;
      display: flex; justify-content: center; align-items: center;
      margin-bottom: 12px; position: relative; z-index: 1;
    }
    .badge-icon-circle ng-icon { font-size: 26px; width: 26px; height: 26px; }
    .badge-icon-circle.common { background: #F1F5F9; color: #64748B; border: 2px solid #E2E8F0; }
    .badge-icon-circle.rare { background: #EFF6FF; color: #2563EB; border: 2px solid #BFDBFE; }
    .badge-icon-circle.epic { background: #FAF5FF; color: #7C3AED; border: 2px solid #DDD6FE; }
    .badge-icon-circle.legendary { background: #FFFBEB; color: #D97706; border: 2px solid #FDE68A; }

    .badge-name {
      font-size: 13px; font-weight: 700; color: var(--co-secondary);
      margin-bottom: 6px; line-height: 1.3;
    }

    .badge-rarity {
      font-size: 10px; font-weight: 700; padding: 2px 10px;
      border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .badge-rarity.common { background: #F1F5F9; color: #64748B; }
    .badge-rarity.rare { background: #EFF6FF; color: #2563EB; }
    .badge-rarity.epic { background: #FAF5FF; color: #7C3AED; }
    .badge-rarity.legendary { background: #FFFBEB; color: #D97706; }

    .empty-badges {
      text-align: center; padding: 40px; border-radius: 20px;
      background: white; margin-top: 24px;
    }
    .empty-icon-wrapper {
      width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 16px;
      background: linear-gradient(135deg, #FEFCE8, #FEF08A);
      display: flex; justify-content: center; align-items: center;
    }
    .empty-icon-wrapper ng-icon { font-size: 32px; width: 32px; height: 32px; color: #CA8A04; }
    .empty-badges h3 { font-size: 18px; font-weight: 700; color: var(--co-secondary); margin: 0 0 6px; }
    .empty-badges p { color: var(--co-text-muted); font-size: 14px; margin: 0; }
  `]
})
export class BadgesComponent {
  @Input() badges: string[] = [];

  getBadgeIcon(badge: string): string {
    const lower = badge.toLowerCase();
    if (lower.includes('expert')) return 'lucideBrain';
    if (lower.includes('mentor')) return 'lucideGraduationCap';
    if (lower.includes('leader')) return 'lucideTrophy';
    if (lower.includes('premier')) return 'lucideStar';
    if (lower.includes('contributeur')) return 'lucideHeart';
    if (lower.includes('réseau') || lower.includes('network')) return 'lucideNetwork';
    if (lower.includes('ambassad')) return 'lucideMegaphone';
    return 'lucideAward';
  }

  getBadgeRarity(badge: string): string {
    const lower = badge.toLowerCase();
    if (lower.includes('ambassad') || lower.includes('leader')) return 'legendary';
    if (lower.includes('expert') || lower.includes('mentor')) return 'epic';
    if (lower.includes('contributeur') || lower.includes('réseau')) return 'rare';
    return 'common';
  }

  getBadgeRarityLabel(badge: string): string {
    const rarity = this.getBadgeRarity(badge);
    const labels: Record<string, string> = {
      'common': 'Commun',
      'rare': 'Rare',
      'epic': 'Épique',
      'legendary': 'Légendaire'
    };
    return labels[rarity] || 'Commun';
  }
}