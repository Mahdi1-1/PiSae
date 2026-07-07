package org.example.suiviservice.service;

import lombok.RequiredArgsConstructor;
import org.example.suiviservice.Enum.StatutProgression;
import org.example.suiviservice.dto.ApprenantResumeResponse;
import org.example.suiviservice.model.LogLecture;
import org.example.suiviservice.model.Progression;
import org.example.suiviservice.repository.LogLectureRepository;
import org.example.suiviservice.repository.ProgressionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ApprenantResumeServiceImpl implements ApprenantResumeService {

    private final ProgressionRepository progressionRepository;
    private final LogLectureRepository logLectureRepository;

    @Override
    public ApprenantResumeResponse getResume(Long apprenantId) {
        List<Progression> progressions = progressionRepository.findByApprenantId(apprenantId);

        // Moyenne sur toutes les lignes de progression (niveau formation ET niveau chapitre) :
        // un apprenant sans aucune ligne a une moyenne de 0, pas une erreur.
        double moyenne = progressions.stream()
                .mapToInt(Progression::getPourcentage)
                .average()
                .orElse(0.0);

        // "Formation terminée" = au moins une ligne de progression TERMINE pour cette formation
        // (niveau formation si suivi comme tel, ou niveau chapitre selon comment l'appelant l'utilise).
        long formationsTerminees = progressions.stream()
                .filter(p -> p.getStatut() == StatutProgression.TERMINE)
                .map(Progression::getFormationId)
                .distinct()
                .count();

        long tempsTotal = logLectureRepository.findByApprenantId(apprenantId).stream()
                .mapToLong(LogLecture::getTempsPasseSecondes)
                .sum();

        return new ApprenantResumeResponse(apprenantId, moyenne, formationsTerminees, tempsTotal);
    }
}
