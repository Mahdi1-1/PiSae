import { firstValueFrom } from 'rxjs';
import { LogLectureMockService } from './log-lecture-mock.service';

describe('LogLectureMockService', () => {
  let service: LogLectureMockService;
  const apprenantId = 555;

  beforeEach(() => {
    service = new LogLectureMockService();
  });

  it('create() ajoute un nouveau log avec dateConsultation fixée à maintenant (cas nominal)', async () => {
    const created = await firstValueFrom(service.create({
      apprenantId, formationId: 10, ressourceId: 5, ressourceType: 'VIDEO', tempsPasseSecondes: 300,
    }));
    expect(created.ressourceType).toBe('VIDEO');
    expect(created.tempsPasseSecondes).toBe(300);
    expect(created.dateConsultation).toBeTruthy();
  });

  it('getById() retourne le log demandé', async () => {
    const created = await firstValueFrom(service.create({
      apprenantId, formationId: 10, ressourceId: 5, ressourceType: 'PDF', tempsPasseSecondes: 60,
    }));
    const found = await firstValueFrom(service.getById(created.id));
    expect(found).toEqual(created);
  });

  it('getById() échoue pour un id inconnu (cas non trouvé)', async () => {
    await expect(firstValueFrom(service.getById(-1))).rejects.toThrow();
  });

  it('update() modifie ressourceType/tempsPasseSecondes sans toucher au reste', async () => {
    const created = await firstValueFrom(service.create({
      apprenantId, formationId: 10, ressourceId: 5, ressourceType: 'PDF', tempsPasseSecondes: 60,
    }));
    const updated = await firstValueFrom(service.update(created.id, {
      apprenantId, formationId: 10, ressourceId: 5, ressourceType: 'QUIZ', tempsPasseSecondes: 120,
    }));
    expect(updated.ressourceType).toBe('QUIZ');
    expect(updated.tempsPasseSecondes).toBe(120);
    expect(updated.formationId).toBe(10);
  });

  it('update() échoue pour un id inconnu (cas invalide)', async () => {
    await expect(firstValueFrom(service.update(-1, {
      apprenantId, formationId: 10, ressourceId: 5, ressourceType: 'QUIZ', tempsPasseSecondes: 120,
    }))).rejects.toThrow();
  });

  it('delete() supprime le log : un getById() suivant échoue', async () => {
    const created = await firstValueFrom(service.create({
      apprenantId, formationId: 10, ressourceId: 5, ressourceType: 'PDF', tempsPasseSecondes: 60,
    }));
    await firstValueFrom(service.delete(created.id));
    await expect(firstValueFrom(service.getById(created.id))).rejects.toThrow();
  });

  it('search() filtre par formationId', async () => {
    // search() ne parcourt que les apprenants déjà "initialisés" (getOrInit) — il faut donc
    // avoir chargé au moins un apprenant pour que ses logs par défaut existent en mémoire.
    await firstValueFrom(service.getByApprenant(1));
    const page = await firstValueFrom(service.search(10, null, null, 0, 50));
    expect(page.content.every(l => l.formationId === 10)).toBe(true);
    expect(page.content.length).toBeGreaterThan(0);
  });

  it('search() applique les bornes dateDebut/dateFin quand fournies', async () => {
    await firstValueFrom(service.getByApprenant(1));
    const dansLeFutur = new Date(Date.now() + 86_400_000).toISOString();
    const page = await firstValueFrom(service.search(10, dansLeFutur, null, 0, 50));
    expect(page.content.length).toBe(0); // aucun log de test n'est daté dans le futur
  });

  it('getByApprenantAndFormation() ne retourne que les logs de cette formation', async () => {
    const page = await firstValueFrom(service.getByApprenantAndFormation(apprenantId, 11, 0, 50));
    expect(page.content.every(l => l.formationId === 11)).toBe(true);
  });

  it('getByApprenant() retourne des logs générés par défaut (données réalistes)', async () => {
    const logs = await firstValueFrom(service.getByApprenant(1));
    expect(logs.length).toBeGreaterThan(0);
  });
});
