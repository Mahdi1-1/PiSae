package org.example.suiviservice.service;

import lombok.RequiredArgsConstructor;
import org.example.suiviservice.Enum.StatutAvis;
import org.example.suiviservice.dto.AvisRequest;
import org.example.suiviservice.dto.AvisResponse;
import org.example.suiviservice.dto.AvisStatsResponse;
import org.example.suiviservice.exception.AvisDejaExistantException;
import org.example.suiviservice.exception.InvalidRequestException;
import org.example.suiviservice.exception.ResourceNotFoundException;
import org.example.suiviservice.mapper.AvisMapper;
import org.example.suiviservice.model.Avis;
import org.example.suiviservice.repository.AvisRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AvisServiceImpl implements AvisService {

    private final AvisRepository avisRepository;

    @Override
    @Transactional
    public AvisResponse create(AvisRequest request) {
        // Règle métier : un seul avis par (apprenant, formation). La contrainte unique en base
        // est le filet de sécurité ; cette vérification donne un message d'erreur clair côté API
        // plutôt que de laisser remonter une DataIntegrityViolationException brute.
        avisRepository.findByApprenantIdAndFormationId(request.getApprenantId(), request.getFormationId())
                .ifPresent(existing -> {
                    throw new AvisDejaExistantException(request.getApprenantId(), request.getFormationId());
                });

        Avis avis = new Avis();
        avis.setApprenantId(request.getApprenantId());
        avis.setFormationId(request.getFormationId());
        avis.setNote(request.getNote());
        avis.setCommentaire(request.getCommentaire());
        avis.setStatut(StatutAvis.PUBLIE);

        Avis saved = avisRepository.save(avis);
        return AvisMapper.toResponse(saved);
    }

    @Override
    public AvisResponse getById(Long id) {
        Avis avis = findOrThrow(id);
        return AvisMapper.toResponse(avis);
    }

    @Override
    @Transactional
    public AvisResponse updateContenu(Long id, AvisRequest request) {
        Avis avis = findOrThrow(id);

        // apprenantId/formationId ne changent jamais après création : un avis "appartient" à un
        // couple apprenant/formation fixe, seul son contenu (note/commentaire) est modifiable.
        if (!avis.getApprenantId().equals(request.getApprenantId())
                || !avis.getFormationId().equals(request.getFormationId())) {
            throw new InvalidRequestException(
                    "apprenantId et formationId ne peuvent pas être modifiés sur un avis existant");
        }

        avis.setNote(request.getNote());
        avis.setCommentaire(request.getCommentaire());
        Avis saved = avisRepository.save(avis);
        return AvisMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public AvisResponse moderer(Long id, StatutAvis nouveauStatut) {
        Avis avis = findOrThrow(id);
        avis.setStatut(nouveauStatut);
        Avis saved = avisRepository.save(avis);
        return AvisMapper.toResponse(saved);
    }

    @Override
    public Page<AvisResponse> getByFormation(Long formationId, Pageable pageable) {
        return avisRepository.findByFormationIdOrderByDateCreationDesc(formationId, pageable)
                .map(AvisMapper::toResponse);
    }

    @Override
    public AvisStatsResponse getStats(Long formationId) {
        List<Avis> avisPublies = avisRepository.findByFormationIdAndStatut(formationId, StatutAvis.PUBLIE);

        double moyenne = avisPublies.stream()
                .mapToInt(Avis::getNote)
                .average()
                .orElse(0.0);

        // Toutes les clés 1..5 sont présentes même à 0, pour que le client n'ait pas à deviner
        // les notes qui n'ont reçu aucun avis (utile pour afficher un histogramme complet).
        Map<Integer, Long> repartition = new LinkedHashMap<>();
        for (int note = 1; note <= 5; note++) {
            repartition.put(note, 0L);
        }
        Map<Integer, Long> comptageReel = avisPublies.stream()
                .collect(Collectors.groupingBy(Avis::getNote, Collectors.counting()));
        repartition.putAll(comptageReel);

        return new AvisStatsResponse(formationId, moyenne, avisPublies.size(), repartition);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!avisRepository.existsById(id)) {
            throw ResourceNotFoundException.forEntity("Avis", id);
        }
        avisRepository.deleteById(id);
    }

    private Avis findOrThrow(Long id) {
        return avisRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.forEntity("Avis", id));
    }
}
