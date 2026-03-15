package com.afiaconnect.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "prescriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID prescriptionId;

    @ManyToOne
    @JoinColumn(name = "record_id")
    private MedicalRecord record;

    @ManyToOne
    @JoinColumn(name = "medication_id")
    private Medication medication;

    @ManyToOne
    @JoinColumn(name = "prescribed_by")
    private User prescribedBy;

    private String dosageInstruction;
    private Integer quantity;

    @Builder.Default
    private Integer refills = 0;

    @Builder.Default
    private LocalDateTime prescribedAt = LocalDateTime.now();
}