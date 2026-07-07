package org.example.suiviservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.suiviservice.Enum.StatutAvis;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvisResponse {
    private Long id;
    private Long apprenantId;
    private Long formationId;
    private Integer note;
    private String commentaire;
    private LocalDateTime dateCreation;
    private StatutAvis statut;
}
