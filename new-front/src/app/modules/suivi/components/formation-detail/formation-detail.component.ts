import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormationCatalogService } from '../../services/formation-catalog.service';

// Shell : lit le formationId depuis la route, affiche le titre + la nav par onglets,
// le contenu de chaque onglet est un router-outlet (routes enfants dans suivi-routing.module.ts).
@Component({
  selector: 'app-formation-detail',
  standalone: false,
  templateUrl: './formation-detail.component.html',
  styleUrl: './formation-detail.component.css',
})
export class FormationDetailComponent implements OnInit {
  formationId!: number;
  formationNom = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly formationCatalogService: FormationCatalogService,
  ) {}

  ngOnInit(): void {
    this.formationId = Number(this.route.snapshot.paramMap.get('formationId'));
    this.formationNom = this.formationCatalogService.getNomOrFallback(this.formationId);
  }
}
