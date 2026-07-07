import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgIconComponent } from '@ng-icons/core';
import { StarRatingComponent } from './star-rating.component';

describe('StarRatingComponent', () => {
  let component: StarRatingComponent;
  let fixture: ComponentFixture<StarRatingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StarRatingComponent],
      imports: [NgIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StarRatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('estRemplie() reflète value quand aucune étoile n\'est survolée (cas nominal)', () => {
    component.value = 3;
    expect(component.estRemplie(1)).toBe(true);
    expect(component.estRemplie(3)).toBe(true);
    expect(component.estRemplie(4)).toBe(false);
  });

  it('selectionner() met à jour value et émet valueChange quand interactif', () => {
    const emitted: number[] = [];
    component.valueChange.subscribe(v => emitted.push(v));

    component.selectionner(4);

    expect(component.value).toBe(4);
    expect(emitted).toEqual([4]);
  });

  it('selectionner() ne fait rien en mode readonly (cas invalide pour l\'interaction)', () => {
    component.readonly = true;
    const emitted: number[] = [];
    component.valueChange.subscribe(v => emitted.push(v));

    component.selectionner(5);

    expect(component.value).toBe(0); // valeur initiale inchangée
    expect(emitted).toEqual([]);
  });

  it('survol() prévisualise la note sans modifier value tant que non sélectionnée', () => {
    component.value = 2;
    component.survol(4);
    expect(component.estRemplie(3)).toBe(true); // sous la note survolée
    expect(component.value).toBe(2); // value elle-même inchangée par le survol
  });

  it('survol() est ignoré en mode readonly', () => {
    component.readonly = true;
    component.value = 2;
    component.survol(5);
    expect(component.estRemplie(3)).toBe(false); // toujours basé sur value=2, pas le survol ignoré
  });

  it('un clic sur la 4e étoile déclenche bien selectionner(4) au niveau DOM', () => {
    const boutons: HTMLButtonElement[] = fixture.nativeElement.querySelectorAll('.star-rating__etoile');
    expect(boutons.length).toBe(5);

    boutons[3].click();
    fixture.detectChanges();

    expect(component.value).toBe(4);
  });
});
