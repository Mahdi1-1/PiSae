import { firstValueFrom } from 'rxjs';
import { AvisMockService } from './avis-mock.service';

describe('AvisMockService', () => {
  let service: AvisMockService;

  beforeEach(() => {
    service = new AvisMockService();
  });

  it('create() ajoute un nouvel avis PUBLIE (cas nominal)', async () => {
    const created = await firstValueFrom(service.create({
      apprenantId: 1, formationId: 10, note: 5, commentaire: 'Top',
    }));
    expect(created.statut).toBe('PUBLIE');
    expect(created.note).toBe(5);
  });

  it('create() rejette avec un 409 si l\'apprenant a déjà un avis sur cette formation', async () => {
    // apprenantId 901 a déjà un avis sur la formation 10 dans les données par défaut
    await expect(firstValueFrom(service.create({
      apprenantId: 901, formationId: 10, note: 3, commentaire: 'Nouveau',
    }))).rejects.toMatchObject({
      status: 409,
      error: { message: expect.stringContaining('existe déjà') },
    });
  });

  it('getById() retourne l\'avis demandé', async () => {
    const found = await firstValueFrom(service.getById(1));
    expect(found.apprenantId).toBe(901);
  });

  it('getById() échoue avec un 404 pour un id inconnu (cas non trouvé)', async () => {
    await expect(firstValueFrom(service.getById(-1))).rejects.toMatchObject({ status: 404 });
  });

  it('updateContenu() modifie note/commentaire sans toucher au statut', async () => {
    const updated = await firstValueFrom(service.updateContenu(1, {
      apprenantId: 901, formationId: 10, note: 2, commentaire: 'Avis modifié',
    }));
    expect(updated.note).toBe(2);
    expect(updated.commentaire).toBe('Avis modifié');
    expect(updated.statut).toBe('PUBLIE');
  });

  it('moderer() change uniquement le statut', async () => {
    const moderated = await firstValueFrom(service.moderer(1, 'MASQUE'));
    expect(moderated.statut).toBe('MASQUE');
    expect(moderated.note).toBe(5); // contenu inchangé
  });

  it('delete() supprime l\'avis : un getById() suivant échoue (cas invalide)', async () => {
    await firstValueFrom(service.delete(1));
    await expect(firstValueFrom(service.getById(1))).rejects.toMatchObject({ status: 404 });
  });

  it('getByFormation() trie par date décroissante et filtre par formation', async () => {
    const page = await firstValueFrom(service.getByFormation(10, 0, 20));
    expect(page.content.every(a => a.formationId === 10)).toBe(true);
    const dates = page.content.map(a => a.dateCreation);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it('getStats() calcule la moyenne et la répartition sur les avis PUBLIE uniquement', async () => {
    // Masque un avis PUBLIE de la formation 10 avant de recalculer les stats
    await firstValueFrom(service.moderer(1, 'MASQUE'));
    const stats = await firstValueFrom(service.getStats(10));

    // Formation 10 avait 3 avis PUBLIE (5,4,5) ; après masquage du premier, il n'en reste que 2 (4,5)
    expect(stats.nombreAvis).toBe(2);
    expect(stats.noteMoyenne).toBe(4.5);
    expect(stats.repartitionNotes[5]).toBe(1);
    expect(stats.repartitionNotes[4]).toBe(1);
    expect(stats.repartitionNotes[1]).toBe(0); // toutes les clés 1..5 présentes même à 0
  });
});
