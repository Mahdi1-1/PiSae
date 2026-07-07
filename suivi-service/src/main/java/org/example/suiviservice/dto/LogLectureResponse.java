package org.example.suiviservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.suiviservice.Enum.RessourceType;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LogLectureResponse {
    private Long id;
    private Long apprenantId;
    private Long formationId;
    private Long ressourceId;
    private RessourceType ressourceType;
    private Long tempsPasseSecondes;
    private LocalDateTime dateConsultation;
}
