import { firstValueFrom } from 'rxjs';
import { ProgressionMockService } from './progression-mock.service';

describe('ProgressionMockService', () => {
  let service: ProgressionMockService;
  const apprenantId = 555; // id dédié pour ne pas interférer avec les données par défaut d'autres tests

  beforeEach(() => {
    service = new ProgressionMockService();
  });

  it('createOrUpdate() crée une nouvelle ligne quand aucune n\'existe pour ce triplet (cas nominal)', async () => {
    const created = await firstValueFrom(service.createOrUpdate({ apprenantId, formationId: 999, pourcentage: 40 }));
    expect(created.formationId).toBe(999);
    expect(created.pourcentage).toBe(40);
    expect(created.statut).toBe('EN_COURS');
  });

  it('createOrUpdate() met à jour la ligne existante au lieu d\'en créer une seconde (upsert)', async () => {
    await firstValueFrom(service.createOrUpdate({ apprenantId, formationId: 999, pourcentage: 40 }));
    const updated = await firstValueFrom(service.createOrUpdate({ apprenantId, formationId: 999, pourcentage: 100 }));

    const toutes = await firstValueFrom(service.getByApprenant(apprenantId));
    const pourCetteFormation = toutes.filter(p => p.formationId === 999);

    expect(pourCetteFormation.length).toBe(1); // une seule ligne, pas un doublon
    expect(updated.pourcentage).toBe(100);
    expect(updated.statut).toBe('TERMINE');
  });

  it('computeStatut : 0% => NON_COMMENCE, 100% => TERMINE, valeur intermédiaire => EN_COURS', async () => {
    const nonCommence = await firstValueFrom(service.createOrUpdate({ apprenantId, formationId: 1, pourcentage: 0 }));
    const enCours = await firstValueFrom(service.createOrUpdate({ apprenantId, formationId: 2, pourcentage: 55 }));
    const termine = await firstValueFrom(service.createOrUpdate({ apprenantId, formationId: 3, pourcentage: 100 }));

    expect(nonCommence.statut).toBe('NON_COMMENCE');
    expect(enCours.statut).toBe('EN_COURS');
    expect(termine.statut).toBe('TERMINE');
  });

  it('getById() retourne la progression demandée (cas nominal)', async () => {
    const created = await firstValueFrom(service.createOrUpdate({ apprenantId, formationId: 1, pourcentage: 30 }));
    const found = await firstValueFrom(service.getById(created.id));
    expect(found).toEqual(created);
  });

  it('getById() échoue pour un id inconnu (cas non trouvé)', async () => {
    await expect(firstValueFrom(service.getById(-1))).rejects.toThrow();
  });

  it('update() modifie pourcentage/statut/chapitreId d\'une ligne existante', async () => {
    const created = await firstValueFrom(service.createOrUpdate({ apprenantId, formationId: 1, pourcentage: 10 }));
    const updated = await firstValueFrom(service.update(created.id, { apprenantId, formationId: 1, chapitreId: 42, pourcentage: 100 }));
    expect(updated.pourcentage).toBe(100);
    expect(updated.statut).toBe('TERMINE');
    expect(updated.chapitreId).toBe(42);
  });

  it('update() échoue pour un id inconnu (cas invalide)', async () => {
    await expect(firstValueFrom(service.update(-1, { apprenantId, formationId: 1, pourcentage: 50 }))).rejects.toThrow();
  });

  it('delete() supprime la ligne : un getById() suivant échoue', async () => {
    const created = await firstValueFrom(service.createOrUpdate({ apprenantId, formationId: 1, pourcentage: 10 }));
    await firstValueFrom(service.delete(created.id));
    await expect(firstValueFrom(service.getById(created.id))).rejects.toThrow();
  });

  it('getByApprenant() inclut les lignes niveau formation ET niveau chapitre (données par défaut)', async () => {
    const toutes = await firstValueFrom(service.getByApprenant(1));
    const niveauFormation = toutes.filter(p => p.chapitreId === null);
    const niveauChapitre = toutes.filter(p => p.chapitreId !== null);
    expect(niveauFormation.length).toBe(8); // 8 formations par défaut
    expect(niveauChapitre.length).toBe(40); // 8 formations x 5 chapitres
  });

  it('getResume() ne compte que les lignes NIVEAU FORMATION pour nombreFormationsTerminees (régression)', async () => {
    // createOrUpdate() initialise paresseusement les 8 formations par défaut de cet apprenant
    // (dont 2 déjà TERMINE) — on mesure donc une DELTA plutôt qu'un total absolu, pour ne pas
    // dépendre du contenu exact des données par défaut.
    const avant = await firstValueFrom(service.getResume(apprenantId));

    // Formation 999 : niveau formation à 65% (EN_COURS) mais avec des chapitres individuellement
    // à 100% — ne doit PAS faire augmenter le compteur.
    await firstValueFrom(service.createOrUpdate({ apprenantId, formationId: 999, pourcentage: 65 }));
    await firstValueFrom(service.createOrUpdate({ apprenantId, formationId: 999, chapitreId: 1, pourcentage: 100 }));
    await firstValueFrom(service.createOrUpdate({ apprenantId, formationId: 999, chapitreId: 2, pourcentage: 100 }));

    const apresChapitresTermines = await firstValueFrom(service.getResume(apprenantId));
    expect(apresChapitresTermines.nombreFormationsTerminees).toBe(avant.nombreFormationsTerminees);

    // Formation 998 : réellement terminée au niveau formation — celle-ci DOIT faire augmenter le compteur.
    await firstValueFrom(service.createOrUpdate({ apprenantId, formationId: 998, pourcentage: 100 }));

    const apresFormationTerminee = await firstValueFrom(service.getResume(apprenantId));
    expect(apresFormationTerminee.nombreFormationsTerminees).toBe(avant.nombreFormationsTerminees + 1);
  });

  it('getInactifs() renvoie toujours une liste vide en mode mock', async () => {
    const inactifs = await firstValueFrom(service.getInactifs(7));
    expect(inactifs).toEqual([]);
  });
});
