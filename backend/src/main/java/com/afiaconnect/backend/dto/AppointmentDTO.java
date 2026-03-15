package com.afiaconnect.backend.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class AppointmentDTO {
    private UUID patientId;
    private UUID scheduledWith;
    private String appointmentType;
    private LocalDate scheduledDate;
    private String status;
    private String notes;
}