import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReputationService } from './reputation.service';
import { environment } from '../../../../../environments/environment';
import { MemberReputation } from '../../shared/models/reputation.model';

describe('ReputationService', () => {
  let service: ReputationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ReputationService]
    });
    service = TestBed.inject(ReputationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch reputation for a user via GET', () => {
    const dummyReputation: MemberReputation = {
      id: 'rep1',
      memberId: 'user123',
      points: 120,
      level: 'CONTRIBUTEUR' as any,
      globalScore: 35,
      expertiseScore: 10,
      reactivityScore: 15,
      valueScore: 10,
      badges: ['Rising Star'],
      recommendationsReceived: 2,
      resourcesPublished: 1,
      postsCount: 3,
      commentsCount: 5,
      lastUpdated: new Date().toISOString()
    };

    service.getReputation('user123').subscribe(rep => {
      expect(rep.points).toBe(120);
      expect(rep.level).toBe('CONTRIBUTEUR' as any);
      expect(rep.badges).toContain('Rising Star');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/reputation/user123`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyReputation);
  });

  it('should add points for an action via PUT', () => {
    const updatedReputation: MemberReputation = {
      id: 'rep1',
      memberId: 'user123',
      points: 125,
      level: 'CONTRIBUTEUR' as any,
      globalScore: 37,
      expertiseScore: 10,
      reactivityScore: 15,
      valueScore: 10,
      badges: ['Rising Star'],
      recommendationsReceived: 2,
      resourcesPublished: 1,
      postsCount: 4,
      commentsCount: 5,
      lastUpdated: new Date().toISOString()
    };

    service.addPoints('user123', 'POST_CREATED' as any).subscribe(rep => {
      expect(rep.points).toBe(125);
    });

    const req = httpMock.expectOne(request => 
      request.url === `${environment.apiUrl}/reputation/user123/points` &&
      request.params.get('action') === 'POST_CREATED'
    );
    expect(req.request.method).toBe('PUT');
    req.flush(updatedReputation);
  });
});
