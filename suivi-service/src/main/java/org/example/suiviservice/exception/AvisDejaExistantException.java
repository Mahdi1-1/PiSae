package org.example.suiviservice.exception;

// Levée quand un apprenant tente de créer un second avis sur la même formation
// (règle métier : un seul avis par couple apprenant/formation, voir Avis.java).
public class AvisDejaExistantException extends RuntimeException {

    public AvisDejaExistantException(Long apprenantId, Long formationId) {
        super("Un avis existe déjà pour l'apprenant " + apprenantId + " sur la formation " + formationId
                + " — utilisez la mise à jour (PUT) au lieu d'en créer un nouveau");
    }
}
