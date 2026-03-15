package com.afiaconnect.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "referrals")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Referral {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID referralId;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "initiated_by")
    private User initiatedBy;

    @ManyToOne
    @JoinColumn(name = "from_facility_id")
    private HealthFacility fromFacility;

    @ManyToOne
    @JoinColumn(name = "to_facility_id")
    private HealthFacility toFacility;

    private String priority;
    private String reason;

    @Builder.Default
    private String status = "Pending";

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime completedAt;
    private String feedbackNotes;
}