import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RecommendationService } from './recommendation.service';
import { MatchLevelRequest, MatchLevelResponse } from '../models/recommendation.model';

describe('RecommendationService', () => {
  let service: RecommendationService;
  let httpMock: HttpTestingController;
  const api = 'http://localhost:8091/api/recommendation';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = new RecommendationService(TestBed.inject(HttpClient));
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('matchLevel() POSTs to /recommendation/match-level with the request body', () => {
    const request: MatchLevelRequest = {
      skills: 'python, data structures',
      description: 'Intro course for absolute beginners',
      learnerLevel: 'Beginner',
    };
    const reponse: MatchLevelResponse = {
      predictedDifficulty: 'Beginner',
      difficultyUsed: 'Beginner',
      source: 'ML_PREDICTION',
      confidence: 0.62,
      matchScore: 1.0,
    };

    service.matchLevel(request).subscribe(res => expect(res).toEqual(reponse));

    const req = httpMock.expectOne(`${api}/match-level`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(reponse);
  });
});
