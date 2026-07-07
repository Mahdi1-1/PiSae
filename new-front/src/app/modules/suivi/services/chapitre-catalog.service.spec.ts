import { TestBed } from '@angular/core/testing';
import { ChapitreCatalogService } from './chapitre-catalog.service';

describe('ChapitreCatalogService', () => {
  let service: ChapitreCatalogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChapitreCatalogService);
  });

  it('getByFormation() returns 5 chapters with the id = formationId*100 + ordre formula', () => {
    const chapitres = service.getByFormation(11);
    expect(chapitres.length).toBe(5);
    expect(chapitres[0]).toEqual({ id: 1101, formationId: 11, nom: 'Introduction', ordre: 1 });
    expect(chapitres[4]).toEqual({ id: 1105, formationId: 11, nom: 'Évaluation finale', ordre: 5 });
  });

  it('getNomOrFallback() returns the real name for a valid chapitreId', () => {
    expect(service.getNomOrFallback(11, 1103)).toBe('Mise en pratique');
  });

  it('getNomOrFallback() falls back to "Chapitre #{id}" for an unknown chapitreId (cas invalide)', () => {
    expect(service.getNomOrFallback(11, 9999)).toBe('Chapitre #9999');
  });
});
