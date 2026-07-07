import { HttpClient } from '@angular/common/http';
import { Provider } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AVIS_SERVICE, AvisService } from '../../modules/suivi/services/avis.service';
import { AvisMockService } from '../../modules/suivi/services/avis-mock.service';
import { LOG_LECTURE_SERVICE, LogLectureService } from '../../modules/suivi/services/log-lecture.service';
import { LogLectureMockService } from '../../modules/suivi/services/log-lecture-mock.service';
import { PROGRESSION_SERVICE, ProgressionService } from '../../modules/suivi/services/progression.service';
import { ProgressionMockService } from '../../modules/suivi/services/progression-mock.service';

// Bascule mock/réel unique pour tout le module suivi, pilotée par environment.useMocks.
// Enregistré au niveau racine (AppModule) plutôt que dans un module lazy-loadé "suivi" :
// le widget dashboard (HomeComponent, chargé en dehors de ce module) a aussi besoin de
// ProgressionService pour le résumé de progression — ces providers doivent être visibles
// partout dans l'app, pas seulement sous /app/formations.
export const SUIVI_PROVIDERS: Provider[] = [
  {
    provide: PROGRESSION_SERVICE,
    useFactory: (http: HttpClient) =>
      environment.useMocks ? new ProgressionMockService() : new ProgressionService(http),
    deps: [HttpClient],
  },
  {
    provide: LOG_LECTURE_SERVICE,
    useFactory: (http: HttpClient) =>
      environment.useMocks ? new LogLectureMockService() : new LogLectureService(http),
    deps: [HttpClient],
  },
  {
    provide: AVIS_SERVICE,
    useFactory: (http: HttpClient) =>
      environment.useMocks ? new AvisMockService() : new AvisService(http),
    deps: [HttpClient],
  },
];
