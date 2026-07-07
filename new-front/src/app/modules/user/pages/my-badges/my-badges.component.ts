import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeService } from '../../../../services/badge.service';
import { Badge } from '../../../../models/badge';

@Component({
  selector: 'app-my-badges',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-badges.component.html',
  styleUrls: ['./my-badges.component.css']
})
export class MyBadgesComponent implements OnInit {

  badges: Badge[] = [];
  loading = false;
  error = '';

  constructor(private badgeService: BadgeService) {}

  ngOnInit(): void {
    this.loading = true;
    this.badgeService.getMyBadges().subscribe({
      next: (data) => { this.badges = data; this.loading = false; },
      error: () => { this.error = 'Impossible de charger vos badges.'; this.loading = false; }
    });
  }

  getBadgeIcon(type: string): string {
    const icons: Record<string, string> = {
      PARTICIPATION:              '🎯',
      SERIE_COMPLETION:           '🏆',
      LEAN_STARTUP_PRACTITIONER:  '🚀',
      INNOVATION_CHAMPION:        '💡',
      NETWORKING_PRO:             '🤝'
    };
    return icons[type] ?? '🎖️';
  }

  getBadgeColor(type: string): string {
    const colors: Record<string, string> = {
      PARTICIPATION:             '#1e3a6e',
      SERIE_COMPLETION:          '#c9a02a',
      LEAN_STARTUP_PRACTITIONER: '#16a34a',
      INNOVATION_CHAMPION:       '#7c3aed',
      NETWORKING_PRO:            '#0891b2'
    };
    return colors[type] ?? '#64748b';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-TN', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  }
}