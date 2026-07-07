package org.example.suiviservice.service;

import lombok.RequiredArgsConstructor;
import org.example.suiviservice.Enum.StatutProgression;
import org.example.suiviservice.dto.ProgressionRequest;
import org.example.suiviservice.dto.ProgressionResponse;
import org.example.suiviservice.exception.InvalidRequestException;
import org.example.suiviservice.exception.ResourceNotFoundException;
import org.example.suiviservice.mapper.ProgressionMapper;
import org.example.suiviservice.model.Progression;
import org.example.suiviservice.repository.ProgressionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProgressionServiceImpl implements ProgressionService {

    private final ProgressionRepository progressionRepository;

    @Override
    @Transactional
    public ProgressionResponse createOrUpdate(ProgressionRequest request) {
        // Upsert : un apprenant qui progresse dans une formation/chapitre envoie régulièrement
        // son nouveau pourcentage — on ne veut pas une nouvelle ligne à chaque appel, mais bien
        // une seule ligne par (apprenant, formation, chapitre) qui se met à jour dans le temps.
        Progression progression = progressionRepository
                .findByApprenantIdAndFormationIdAndChapitreId(
                        request.getApprenantId(), request.getFormationId(), request.getChapitreId())
                .orElseGet(Progression::new);

        progression.setApprenantId(request.getApprenantId());
        progression.setFormationId(request.getFormationId());
        progression.setChapitreId(request.getChapitreId());
        progression.setPourcentage(request.getPourcentage());
        progression.setStatut(computeStatut(request.getPourcentage()));

        Progression saved = progressionRepository.save(progression);
        return ProgressionMapper.toResponse(saved);
    }

    @Override
    public ProgressionResponse getById(Long id) {
        Progression progression = progressionRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.forEntity("Progression", id));
        return ProgressionMapper.toResponse(progression);
    }

    @Override
    @Transactional
    public ProgressionResponse update(Long id, ProgressionRequest request) {
        Progression progression = progressionRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.forEntity("Progression", id));

        // apprenantId/formationId identifient la ressource : on refuse de les changer via un
        // simple PUT (ce serait "réassigner" la progression à quelqu'un/quelque chose d'autre).
        if (!progression.getApprenantId().equals(request.getApprenantId())
                || !progression.getFormationId().equals(request.getFormationId())) {
            throw new InvalidRequestException(
                    "apprenantId et formationId ne peuvent pas être modifiés sur une progression existante");
        }

        progression.setChapitreId(request.getChapitreId());
        progression.setPourcentage(request.getPourcentage());
        progression.setStatut(computeStatut(request.getPourcentage()));

        Progression saved = progressionRepository.save(progression);
        return ProgressionMapper.toResponse(saved);
    }

    @Override
    public Page<ProgressionResponse> getByFormation(Long formationId, Pageable pageable) {
        return progressionRepository.findByFormationId(formationId, pageable)
                .map(ProgressionMapper::toResponse);
    }

    @Override
    public List<ProgressionResponse> getByApprenant(Long apprenantId) {
        return progressionRepository.findByApprenantId(apprenantId).stream()
                .map(ProgressionMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!progressionRepository.existsById(id)) {
            throw ResourceNotFoundException.forEntity("Progression", id);
        }
        progressionRepository.deleteById(id);
    }

    // Le statut est toujours dérivé du pourcentage, jamais fourni par le client :
    // ça évite les incohérences (ex: pourcentage=100 mais statut=EN_COURS envoyé par erreur).
    private StatutProgression computeStatut(int pourcentage) {
        if (pourcentage <= 0) {
            return StatutProgression.NON_COMMENCE;
        }
        if (pourcentage >= 100) {
            return StatutProgression.TERMINE;
        }
        return StatutProgression.EN_COURS;
    }
}
