package com.afiaconnect.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "medical_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID recordId;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "recorded_by")
    private User recordedBy;

    @Builder.Default
    private LocalDateTime recordedAt = LocalDateTime.now();

    private String visitType;
    private String symptoms;

    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> vitals;

    private String diagnosisNotes;
    private String icd10Code;

    @ManyToOne
    @JoinColumn(name = "facility_id")
    private HealthFacility facility;
