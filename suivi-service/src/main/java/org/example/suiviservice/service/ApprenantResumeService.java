package org.example.suiviservice.service;

import org.example.suiviservice.dto.ApprenantResumeResponse;

public interface ApprenantResumeService {

    // Résumé global de progression d'un apprenant, toutes formations confondues.
    ApprenantResumeResponse getResume(Long apprenantId);
}
