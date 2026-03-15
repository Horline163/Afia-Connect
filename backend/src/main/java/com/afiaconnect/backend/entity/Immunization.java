package com.afiaconnect.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "immunizations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Immunization {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID immunizationId;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    private String vaccineName;
    private Integer doseNumber;

    @Builder.Default
    private LocalDateTime administeredAt = LocalDateTime.now();

    private LocalDate nextDueDate;

    @ManyToOne
    @JoinColumn(name = "administered_by")
    private User administeredBy;

    @ManyToOne
    @JoinColumn(name = "facility_id")
    private HealthFacility facility;
}