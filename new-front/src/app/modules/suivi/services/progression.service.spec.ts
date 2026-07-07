import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProgressionService } from './progression.service';
import { Progression, ProgressionRequest } from '../models/progression.model';
import { Page } from '../models/page.model';

// ProgressionService n'est pas @Injectable (instancié manuellement via useFactory dans
// suivi.providers.ts) — on la construit donc directement avec un HttpClient de test,
// exactement comme en production.
describe('ProgressionService', () => {
  let service: ProgressionService;
  let httpMock: HttpTestingController;
  const api = 'http://localhost:8091/api/progression';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = new ProgressionService(TestBed.inject(HttpClient));
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('createOrUpdate() POSTs to /progression with the request body', () => {
    const request: ProgressionRequest = { apprenantId: 1, formationId: 10, pourcentage: 50 };
    const reponse: Progression = {
      id: 1, apprenantId: 1, formationId: 10, chapitreId: null, pourcentage: 50,
      dateDebut: '2026-01-01T00:00:00', dateDerniereMaj: '2026-01-01T00:00:00', statut: 'EN_COURS',
    };

    service.createOrUpdate(request).subscribe(res => expect(res).toEqual(reponse));

    const req = httpMock.expectOne(api);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(reponse);
  });

  it('getById() GETs /progression/{id}', () => {
    service.getById(42).subscribe();
    const req = httpMock.expectOne(`${api}/42`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('update() PUTs to /progression/{id} with the request body', () => {
    const request: ProgressionRequest = { apprenantId: 1, formationId: 10, pourcentage: 80 };
    service.update(42, request).subscribe();
    const req = httpMock.expectOne(`${api}/42`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush({});
  });

  it('delete() DELETEs /progression/{id}', () => {
    service.delete(42).subscribe();
    const req = httpMock.expectOne(`${api}/42`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('getByFormation() GETs /progression with formationId/page/size query params', () => {
    service.getByFormation(10, 1, 20).subscribe();
    const req = httpMock.expectOne(r =>
      r.url === api &&
      r.params.get('formationId') === '10' &&
      r.params.get('page') === '1' &&
      r.params.get('size') === '20');
    expect(req.request.method).toBe('GET');
    req.flush({} as Page<Progression>);
  });

  it('getByApprenant() GETs /progression/apprenant/{id}', () => {
    service.getByApprenant(1).subscribe();
    const req = httpMock.expectOne(`${api}/apprenant/1`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getResume() GETs /progression/apprenant/{id}/resume', () => {
    service.getResume(1).subscribe();
    const req = httpMock.expectOne(`${api}/apprenant/1/resume`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('getInactifs() GETs /progression/inactifs with the jours query param', () => {
    service.getInactifs(7).subscribe();
    const req = httpMock.expectOne(r => r.url === `${api}/inactifs` && r.params.get('jours') === '7');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
