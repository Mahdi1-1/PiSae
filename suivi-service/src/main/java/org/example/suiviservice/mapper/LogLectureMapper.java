package org.example.suiviservice.mapper;

import org.example.suiviservice.dto.LogLectureRequest;
import org.example.suiviservice.dto.LogLectureResponse;
import org.example.suiviservice.model.LogLecture;

public final class LogLectureMapper {

    private LogLectureMapper() {
    }

    public static LogLecture toEntity(LogLectureRequest request) {
        LogLecture logLecture = new LogLecture();
        logLecture.setApprenantId(request.getApprenantId());
        logLecture.setFormationId(request.getFormationId());
        logLecture.setRessourceId(request.getRessourceId());
        logLecture.setRessourceType(request.getRessourceType());
        logLecture.setTempsPasseSecondes(request.getTempsPasseSecondes());
        return logLecture;
    }

    public static LogLectureResponse toResponse(LogLecture logLecture) {
        return new LogLectureResponse(
                logLecture.getId(),
                logLecture.getApprenantId(),
                logLecture.getFormationId(),
                logLecture.getRessourceId(),
                logLecture.getRessourceType(),
                logLecture.getTempsPasseSecondes(),
                logLecture.getDateConsultation()
        );
    }
}
