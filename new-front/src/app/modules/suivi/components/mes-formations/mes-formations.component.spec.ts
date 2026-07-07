import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NgIconComponent } from '@ng-icons/core';
import { HlmProgressImports } from '@spartan-ng/helm/progress';
import { of, throwError } from 'rxjs';
import { MesFormationsComponent } from './mes-formations.component';
import { FormationProgressionCardComponent } from '../formation-progression-card/formation-progression-card.component';
import { PROGRESSION_SERVICE } from '../../services/progression.service';
import { FormationCatalogService } from '../../services/formation-catalog.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Progression } from '../../models/progression.model';

function buildProgression(formationId: number, statut: Progression['statut'], pourcentage: number, chapitreId: number | null = null): Progression {
  return {
    id: formationId, apprenantId: 1, formationId, chapitreId, pourcentage,
    dateDebut: '2026-01-01T00:00:00', dateDerniereMaj: '2026-01-01T00:00:00', statut,
  };
}

describe('MesFormationsComponent', () => {
  let component: MesFormationsComponent;
  let fixture: ComponentFixture<MesFormationsComponent>;
  let progressionServiceSpy: { getByApprenant: ReturnType<typeof vi.fn> };
  let authServiceStub: Partial<AuthService>;

  async function configurer(userId: number | null) {
    progressionServiceSpy = { getByApprenant: vi.fn() };
    authServiceStub = { getUserId: () => userId ?? 0 };

    await TestBed.configureTestingModule({
      declarations: [MesFormationsComponent, FormationProgressionCardComponent],
      imports: [RouterTestingModule, NgIconComponent, ...HlmProgressImports],
      providers: [
        { provide: PROGRESSION_SERVICE, useValue: progressionServiceSpy },
        { provide: AuthService, useValue: authServiceStub },
        FormationCatalogService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MesFormationsComponent);
    component = fixture.componentInstance;
  }

  it('affiche un message d\'erreur si aucun utilisateur n\'est identifié (cas invalide)', async () => {
    await configurer(null);
    fixture.detectChanges();

    expect(component.error).toBe('Utilisateur non identifié.');
    expect(component.loading).toBe(false);
  });

  it('charge et affiche les formations niveau-formation uniquement (cas nominal)', async () => {
    await configurer(1);
    progressionServiceSpy.getByApprenant.mockReturnValue(of([
      buildProgression(10, 'TERMINE', 100),
      buildProgression(10, 'TERMINE', 100, 101), // ligne niveau chapitre : ne doit pas apparaître
      buildProgression(11, 'EN_COURS', 65),
    ]));

    fixture.detectChanges();

    expect(component.loading).toBe(false);
    expect(component.error).toBeNull();
    expect(component.cards.length).toBe(2); // seulement les 2 lignes niveau formation
    expect(component.cards.every(c => c.progression.chapitreId === null)).toBe(true);
  });

  it('affiche un message d\'erreur générique si l\'appel échoue', async () => {
    await configurer(1);
    progressionServiceSpy.getByApprenant.mockReturnValue(throwError(() => new Error('network down')));

    fixture.detectChanges();

    expect(component.loading).toBe(false);
    expect(component.error).toContain('Impossible de charger');
  });

  it('cardsFiltrees() filtre correctement par statut', async () => {
    await configurer(1);
    progressionServiceSpy.getByApprenant.mockReturnValue(of([
      buildProgression(10, 'TERMINE', 100),
      buildProgression(11, 'EN_COURS', 65),
      buildProgression(12, 'NON_COMMENCE', 0),
    ]));

    fixture.detectChanges();

    expect(component.cardsFiltrees.length).toBe(3); // 'TOUS' par défaut

    component.selectionnerFiltre('EN_COURS');
    expect(component.cardsFiltrees.length).toBe(1);
    expect(component.cardsFiltrees[0].progression.formationId).toBe(11);

    component.selectionnerFiltre('TERMINE');
    expect(component.cardsFiltrees.length).toBe(1);
    expect(component.cardsFiltrees[0].progression.formationId).toBe(10);
  });
});
