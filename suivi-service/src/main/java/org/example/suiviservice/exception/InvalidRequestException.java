package org.example.suiviservice.exception;

// Erreur métier qui n'est pas capturable par les annotations Bean Validation
// (ex: tenter de changer l'apprenant/la formation d'une ressource déjà créée).
public class InvalidRequestException extends RuntimeException {

    public InvalidRequestException(String message) {
        super(message);
    }
}
