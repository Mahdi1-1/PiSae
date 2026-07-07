import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AvisService } from './avis.service';
import { AvisRequest } from '../models/avis.model';

describe('AvisService', () => {
  let service: AvisService;
  let httpMock: HttpTestingController;
  const api = 'http://localhost:8091/api/avis';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = new AvisService(TestBed.inject(HttpClient));
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('create() POSTs to /avis with the request body', () => {
    const request: AvisRequest = { apprenantId: 1, formationId: 10, note: 5, commentaire: 'Top' };
    service.create(request).subscribe();
    const req = httpMock.expectOne(api);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush({});
  });

  it('getById() GETs /avis/{id}', () => {
    service.getById(3).subscribe();
    const req = httpMock.expectOne(`${api}/3`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('updateContenu() PUTs to /avis/{id} with the request body', () => {
    const request: AvisRequest = { apprenantId: 1, formationId: 10, note: 4, commentaire: 'Modifié' };
    service.updateContenu(3, request).subscribe();
    const req = httpMock.expectOne(`${api}/3`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush({});
  });

  it('moderer() PATCHes /avis/{id}/statut with the new statut', () => {
    service.moderer(3, 'SIGNALE').subscribe();
    const req = httpMock.expectOne(`${api}/3/statut`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ statut: 'SIGNALE' });
    req.flush({});
  });

  it('delete() DELETEs /avis/{id}', () => {
    service.delete(3).subscribe();
    const req = httpMock.expectOne(`${api}/3`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('getByFormation() GETs /avis with formationId/page/size query params', () => {
    service.getByFormation(10, 0, 20).subscribe();
    const req = httpMock.expectOne(r =>
      r.url === api && r.params.get('formationId') === '10' && r.params.get('page') === '0');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('getStats() GETs /avis/formation/{id}/stats', () => {
    service.getStats(10).subscribe();
    const req = httpMock.expectOne(`${api}/formation/10/stats`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });
});
