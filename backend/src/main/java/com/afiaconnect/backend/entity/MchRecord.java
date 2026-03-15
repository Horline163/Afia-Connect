package com.afiaconnect.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "mch_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MchRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID mchId;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    private String recordType;
    private Integer gestationalAgeWeeks;
    private Integer visitNumber;
    private BigDecimal fundalHeight;
    private Integer fetalHeartRate;
    private BigDecimal muac;

    @Builder.Default
    private Boolean highRiskFlag = false;

    private String riskFactors;

    @Builder.Default
    private LocalDateTime recordedAt = LocalDateTime.now();
}