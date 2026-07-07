import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HlmProgressImports } from '@spartan-ng/helm/progress';
import { FormationProgressionCardComponent } from './formation-progression-card.component';
import { Progression } from '../../models/progression.model';

function buildProgression(statut: Progression['statut'], pourcentage: number): Progression {
  return {
    id: 1, apprenantId: 1, formationId: 10, chapitreId: null, pourcentage,
    dateDebut: '2026-01-01T00:00:00', dateDerniereMaj: '2026-01-01T00:00:00', statut,
  };
}

describe('FormationProgressionCardComponent', () => {
  let component: FormationProgressionCardComponent;
  let fixture: ComponentFixture<FormationProgressionCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormationProgressionCardComponent],
      imports: [RouterTestingModule, ...HlmProgressImports],
    }).compileComponents();

    fixture = TestBed.createComponent(FormationProgressionCardComponent);
    component = fixture.componentInstance;
  });

  it('affiche le libellé et la classe de badge corrects pour NON_COMMENCE (cas nominal)', () => {
    component.progression = buildProgression('NON_COMMENCE', 0);
    component.formationNom = 'Ma formation';
    fixture.detectChanges();

    expect(component.statutLabel).toBe('Non commencé');
    expect(component.statutBadgeClass).toBe('statut-badge--neutral');
  });

  it('affiche le libellé et la classe de badge corrects pour EN_COURS', () => {
    component.progression = buildProgression('EN_COURS', 45);
    component.formationNom = 'Ma formation';
    fixture.detectChanges();

    expect(component.statutLabel).toBe('En cours');
    expect(component.statutBadgeClass).toBe('statut-badge--blue');
  });

  it('affiche le libellé et la classe de badge corrects pour TERMINE', () => {
    component.progression = buildProgression('TERMINE', 100);
    component.formationNom = 'Ma formation';
    fixture.detectChanges();

    expect(component.statutLabel).toBe('Terminé');
    expect(component.statutBadgeClass).toBe('statut-badge--green');
  });

  it('rend le nom de la formation et le pourcentage dans le DOM', () => {
    component.progression = buildProgression('EN_COURS', 65);
    component.formationNom = 'Angular avancé';
    fixture.detectChanges();

    const texte = fixture.nativeElement.textContent;
    expect(texte).toContain('Angular avancé');
    expect(texte).toContain('65%');
  });
});
