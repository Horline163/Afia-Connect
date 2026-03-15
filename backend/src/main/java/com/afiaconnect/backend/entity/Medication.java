package com.afiaconnect.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "medications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medication {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID medicationId;

    @Column(nullable = false)
    private String name;

    private String genericName;
    private String dosageForm;
    private String strength;

    @Builder.Default
    private Boolean isEssential = false;
}