package com.afiaconnect.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "vital_signs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VitalSigns {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID vitalId;

    @ManyToOne
    @JoinColumn(name = "record_id")
    private MedicalRecord record;

    private BigDecimal temperature;
    private Integer heartRate;
    private Integer respiratoryRate;
    private Integer bloodPressureSystolic;
    private Integer bloodPressureDiastolic;
    private BigDecimal oxygenSaturation;
    private BigDecimal weight;
    private BigDecimal height;

    @Builder.Default
    private LocalDateTime recordedAt = LocalDateTime.now();
}