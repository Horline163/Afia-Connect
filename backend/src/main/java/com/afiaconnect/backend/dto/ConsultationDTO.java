package com.afiaconnect.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ConsultationDTO {
    private UUID patientId;
    private UUID doctorId;
    private String consultationType;
    private LocalDateTime scheduledTime;
    private String status;
    private String consultationNotes;
}