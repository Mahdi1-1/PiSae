import { TestBed } from '@angular/core/testing';
import { FormationCatalogService } from './formation-catalog.service';

describe('FormationCatalogService', () => {
  let service: FormationCatalogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormationCatalogService);
  });

  it('getAll() returns at least 8 formations (cas nominal)', () => {
    expect(service.getAll().length).toBeGreaterThanOrEqual(8);
  });

  it('getById() returns the matching formation', () => {
    const formation = service.getById(10);
    expect(formation?.nom).toBe('Introduction à Spring Boot');
  });

  it('getById() returns undefined for an unknown id (cas non trouvé)', () => {
    expect(service.getById(9999)).toBeUndefined();
  });

  it('getNomOrFallback() returns the real name when the formation exists', () => {
    expect(service.getNomOrFallback(11)).toBe('Angular avancé');
  });

  it('getNomOrFallback() falls back to "Formation #{id}" for an unknown id (cas invalide)', () => {
    expect(service.getNomOrFallback(9999)).toBe('Formation #9999');
  });
});
