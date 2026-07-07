import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { LogLectureService } from './log-lecture.service';
import { LogLectureRequest } from '../models/log-lecture.model';

describe('LogLectureService', () => {
  let service: LogLectureService;
  let httpMock: HttpTestingController;
  const api = 'http://localhost:8091/api/logs';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = new LogLectureService(TestBed.inject(HttpClient));
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('create() POSTs to /logs with the request body', () => {
    const request: LogLectureRequest = {
      apprenantId: 1, formationId: 10, ressourceId: 5, ressourceType: 'VIDEO', tempsPasseSecondes: 300,
    };
    service.create(request).subscribe();
    const req = httpMock.expectOne(api);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush({});
  });

  it('getById() GETs /logs/{id}', () => {
    service.getById(7).subscribe();
    const req = httpMock.expectOne(`${api}/7`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('update() PUTs to /logs/{id} with the request body', () => {
    const request: LogLectureRequest = {
      apprenantId: 1, formationId: 10, ressourceId: 5, ressourceType: 'PDF', tempsPasseSecondes: 120,
    };
    service.update(7, request).subscribe();
    const req = httpMock.expectOne(`${api}/7`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush({});
  });

  it('delete() DELETEs /logs/{id}', () => {
    service.delete(7).subscribe();
    const req = httpMock.expectOne(`${api}/7`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('search() sends formationId/page/size but omits dateDebut/dateFin when not provided', () => {
    service.search(10, null, null, 0, 20).subscribe();
    const req = httpMock.expectOne(r => r.url === api);
    expect(req.request.params.get('formationId')).toBe('10');
    expect(req.request.params.has('dateDebut')).toBe(false);
    expect(req.request.params.has('dateFin')).toBe(false);
    req.flush({});
  });

  it('search() includes dateDebut/dateFin when provided', () => {
    service.search(10, '2026-01-01T00:00:00', '2026-01-31T00:00:00', 0, 20).subscribe();
    const req = httpMock.expectOne(r =>
      r.url === api &&
      r.params.get('dateDebut') === '2026-01-01T00:00:00' &&
      r.params.get('dateFin') === '2026-01-31T00:00:00');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('getByApprenantAndFormation() GETs the nested path with page/size params', () => {
    service.getByApprenantAndFormation(1, 10, 2, 15).subscribe();
    const req = httpMock.expectOne(r =>
      r.url === `${api}/apprenant/1/formation/10` &&
      r.params.get('page') === '2' &&
      r.params.get('size') === '15');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('getByApprenant() GETs /logs/apprenant/{id}', () => {
    service.getByApprenant(1).subscribe();
    const req = httpMock.expectOne(`${api}/apprenant/1`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
