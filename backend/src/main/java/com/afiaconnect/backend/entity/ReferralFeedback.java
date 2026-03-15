package com.afiaconnect.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "referral_feedback")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReferralFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID feedbackId;

    @OneToOne
    @JoinColumn(name = "referral_id")
    private Referral referral;

    private String hospitalDiagnosis;
    private String treatmentSummary;
    private String dischargeInstructions;

    @Builder.Default
    private Boolean followUpRequired = false;

    @ManyToOne
    @JoinColumn(name = "provided_by")
    private User providedBy;

    @Builder.Default
    private LocalDateTime providedAt = LocalDateTime.now();
}