package com.afiaconnect.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "consultations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Consultation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID consultationId;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "initiated_by")
    private User initiatedBy;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private User doctor;

    @Builder.Default
    private String status = "Requested";

    private LocalDateTime scheduledTime;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String consultationType;
    private String consultationNotes;
    private String sessionRecordingUrl;
}