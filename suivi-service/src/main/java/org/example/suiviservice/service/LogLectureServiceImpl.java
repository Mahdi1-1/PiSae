package org.example.suiviservice.service;

import lombok.RequiredArgsConstructor;
import org.example.suiviservice.dto.LogLectureRequest;
import org.example.suiviservice.dto.LogLectureResponse;
import org.example.suiviservice.exception.InvalidRequestException;
import org.example.suiviservice.exception.ResourceNotFoundException;
import org.example.suiviservice.mapper.LogLectureMapper;
import org.example.suiviservice.model.LogLecture;
import org.example.suiviservice.repository.LogLectureRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LogLectureServiceImpl implements LogLectureService {

    private static final LocalDateTime EPOCH = LocalDateTime.of(1970, 1, 1, 0, 0);

    private final LogLectureRepository logLectureRepository;

    @Override
    @Transactional
    public LogLectureResponse create(LogLectureRequest request) {
        LogLecture logLecture = LogLectureMapper.toEntity(request);
        LogLecture saved = logLectureRepository.save(logLecture);
        return LogLectureMapper.toResponse(saved);
    }

    @Override
    public LogLectureResponse getById(Long id) {
        LogLecture logLecture = logLectureRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.forEntity("LogLecture", id));
        return LogLectureMapper.toResponse(logLecture);
    }

    @Override
    @Transactional
    public LogLectureResponse update(Long id, LogLectureRequest request) {
        LogLecture logLecture = logLectureRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.forEntity("LogLecture", id));

        if (!logLecture.getApprenantId().equals(request.getApprenantId())
                || !logLecture.getFormationId().equals(request.getFormationId())
                || !logLecture.getRessourceId().equals(request.getRessourceId())) {
            throw new InvalidRequestException(
                    "apprenantId, formationId et ressourceId ne peuvent pas être modifiés sur un log existant");
        }

        logLecture.setRessourceType(request.getRessourceType());
        logLecture.setTempsPasseSecondes(request.getTempsPasseSecondes());

        LogLecture saved = logLectureRepository.save(logLecture);
        return LogLectureMapper.toResponse(saved);
    }

    @Override
    public Page<LogLectureResponse> search(Long formationId, LocalDateTime dateDebut, LocalDateTime dateFin, Pageable pageable) {
        // Filtrage optionnel : bornes par défaut si le client n'en précise qu'une (ou aucune),
        // pour que "?dateDebut=..." seul fonctionne sans devoir aussi fournir dateFin.
        LocalDateTime debut = dateDebut != null ? dateDebut : EPOCH;
        LocalDateTime fin = dateFin != null ? dateFin : LocalDateTime.now();
        return logLectureRepository.findByFormationIdAndDateConsultationBetween(formationId, debut, fin, pageable)
                .map(LogLectureMapper::toResponse);
    }

    @Override
    public Page<LogLectureResponse> getByApprenantAndFormation(Long apprenantId, Long formationId, Pageable pageable) {
        return logLectureRepository.findByApprenantIdAndFormationId(apprenantId, formationId, pageable)
                .map(LogLectureMapper::toResponse);
    }

    @Override
    public List<LogLectureResponse> getByApprenant(Long apprenantId) {
        return logLectureRepository.findByApprenantId(apprenantId).stream()
                .map(LogLectureMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!logLectureRepository.existsById(id)) {
            throw ResourceNotFoundException.forEntity("LogLecture", id);
        }
        logLectureRepository.deleteById(id);
    }
}
