package com.afiaconnect.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "appointments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID appointmentId;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "scheduled_with")
    private User scheduledWith;

    private String appointmentType;
    private LocalDate scheduledDate;

    @Builder.Default
    private String status = "Scheduled";

    @Builder.Default
    private Boolean reminderSent = false;

    private String notes;
}